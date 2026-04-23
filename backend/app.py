import io
import os
from typing import Optional, List
from datetime import datetime

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from PIL import Image

from src.config import DEVICE, MODEL_NAME
from src.dataset import get_transforms
from src.model import get_model
from backend.auth import (
    UserRegister, UserLogin, ForgotPassword, ResetPassword, TokenResponse,
    create_user, authenticate_user, create_access_token, create_reset_token,
    reset_password_with_token, decode_token, init_db, get_or_create_google_user
)
from backend.explanation_generator import generate_explanation
from backend.adaptive_selector import (
    analyze_image_characteristics,
    select_best_model,
    get_model_weights_path
)
from backend.face_validator import validate_face_in_image
from backend.history import (
    save_detection_history,
    get_user_history,
    get_history_count,
    delete_history_record,
    delete_all_user_history,
    get_history_stats,
    DetectionHistoryCreate
)
from backend.pdf_generator import generate_history_pdf


def _resolve_weights_path(model_name: str) -> str:
    env_path = os.getenv("DEEFAKE_WEIGHTS_PATH")
    if env_path:
        return env_path
    
    # Try fold4 first, then fall back to simple name
    fold4_path = f"outputs/models/{model_name}_fold4.pth"
    simple_path = f"outputs/models/{model_name}.pth"
    
    if os.path.exists(fold4_path):
        return fold4_path
    elif os.path.exists(simple_path):
        return simple_path
    else:
        # Return simple path as default (more likely to exist)
        return simple_path


class Predictor:
    def __init__(self) -> None:
        self._model_name: Optional[str] = None
        self._weights_path: Optional[str] = None
        self._model: Optional[torch.nn.Module] = None
        self._transform = get_transforms(train=False)
        self._adaptive_mode = True  # Enable adaptive model selection

    def load(self, model_name: str, weights_path: str) -> None:
        if self._model is not None and self._model_name == model_name and self._weights_path == weights_path:
            return

        model = get_model(model_name, freeze_backbone=False).to(DEVICE)

        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Weights file not found: {weights_path}")

        state = torch.load(weights_path, map_location=DEVICE)
        model.load_state_dict(state)
        model.eval()

        self._model_name = model_name
        self._weights_path = weights_path
        self._model = model

    @torch.no_grad()
    def predict(self, img_rgb: np.ndarray, img_pil: Optional[Image.Image] = None) -> dict:
        if self._model is None:
            raise RuntimeError("Model is not loaded")

        x = self._transform(image=img_rgb)["image"].unsqueeze(0).to(DEVICE)
        logits = self._model(x)
        prob_fake = torch.sigmoid(logits).squeeze().item()

        label = "Fake" if prob_fake > 0.5 else "Real"
        result = {
            "label": label,
            "prob_fake": float(prob_fake),
            "threshold": 0.5,
            "model_name": self._model_name,
        }
        
        # Add image characteristics if available
        if img_pil is not None and self._adaptive_mode:
            characteristics = analyze_image_characteristics(img_pil)
            result["image_analysis"] = {
                "size": f"{characteristics['width']}x{characteristics['height']}",
                "complexity": characteristics["complexity_level"],
                "complexity_score": round(characteristics["complexity_score"], 3)
            }
        
        return result


app = FastAPI(title="Deepfake Image Detection API")

# CORS configuration - use environment variable in production
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_predictor = Predictor()


@app.on_event("startup")
def _startup() -> None:
    # Initialize database
    init_db()
    print("✅ Database initialized successfully")
    
    # Download model weights if not present (optional)
    try:
        from backend.download_weights import download_model_weights
        download_model_weights()
    except Exception as e:
        print(f"⚠️  Could not download model weights: {e}")
        print(f"⚠️  Continuing without auto-download...")
    
    # Load ML model (optional - skip if weights not found)
    try:
        weights_path = _resolve_weights_path(MODEL_NAME)
        if os.path.exists(weights_path):
            _predictor.load(MODEL_NAME, weights_path)
            print(f"✅ Model loaded: {MODEL_NAME}")
        else:
            print(f"⚠️  Model weights not found: {weights_path}")
            print("⚠️  API will run without ML model (detection endpoints will fail)")
    except Exception as e:
        print(f"⚠️  Failed to load model: {e}")
        print("⚠️  API will run without ML model (detection endpoints will fail)")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "device": str(DEVICE), "model_name": MODEL_NAME}


class GoogleLoginRequest(BaseModel):
    id_token: str


def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Get current user from JWT token (optional)"""
    if not authorization:
        return None
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        payload = decode_token(token)
        return {
            "id": payload.get("user_id"),
            "email": payload.get("email")
        }
    except:
        return None


@app.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister) -> TokenResponse:
    """Register a new user"""
    # Create user
    user = create_user(user_data.email, user_data.password, user_data.full_name)
    
    # Create access token
    token_data = {
        "user_id": user["id"],
        "email": user["email"]
    }
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    )


@app.post("/auth/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest) -> TokenResponse:
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not google_client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID is not configured")

    try:
        idinfo = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            google_client_id
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    full_name = idinfo.get("name") or idinfo.get("given_name") or "Google User"
    user = get_or_create_google_user(email=email, full_name=full_name)

    token_data = {
        "user_id": user["id"],
        "email": user["email"]
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    )


@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin) -> TokenResponse:
    """Login user and return JWT token"""
    user = authenticate_user(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    # Create access token
    token_data = {
        "user_id": user["id"],
        "email": user["email"]
    }
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    )


@app.post("/auth/forgot-password")
async def forgot_password(data: ForgotPassword) -> dict:
    """Request password reset token and send email"""
    create_reset_token(data.email)
    
    # Always return success message (don't reveal if email exists)
    return {
        "message": "If your email is registered, you will receive a password reset link shortly. Please check your inbox and spam folder."
    }


@app.post("/auth/reset-password")
async def reset_password(data: ResetPassword) -> dict:
    """Reset password using reset token"""
    reset_password_with_token(data.token, data.new_password)
    
    return {
        "message": "Password has been reset successfully"
    }


@app.get("/auth/me")
async def get_me(authorization: Optional[str] = Header(None)) -> dict:
    """Get current user info"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    return user


@app.get("/history")
async def get_history(
    authorization: Optional[str] = Header(None),
    limit: int = 50,
    offset: int = 0
) -> dict:
    """Get detection history for authenticated user"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    history = get_user_history(user["id"], limit=limit, offset=offset)
    total_count = get_history_count(user["id"])
    
    return {
        "history": history,
        "total": total_count,
        "limit": limit,
        "offset": offset
    }


@app.get("/history/stats")
async def get_stats(authorization: Optional[str] = Header(None)) -> dict:
    """Get detection history statistics for authenticated user"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    stats = get_history_stats(user["id"])
    return stats


@app.delete("/history/{history_id}")
async def delete_history(
    history_id: int,
    authorization: Optional[str] = Header(None)
) -> dict:
    """Delete a specific history record"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    deleted = delete_history_record(history_id, user["id"])
    
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="History record not found or unauthorized"
        )
    
    return {"message": "History record deleted successfully"}


@app.delete("/history")
async def delete_all_history(authorization: Optional[str] = Header(None)) -> dict:
    """Delete all history records for authenticated user"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    deleted_count = delete_all_user_history(user["id"])
    
    return {
        "message": f"Deleted {deleted_count} history records",
        "deleted_count": deleted_count
    }


@app.post("/compare")
async def compare(
    file: UploadFile = File(...),
    model1: Optional[str] = None,
    model2: Optional[str] = None,
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Compare predictions from 2 models
    
    Parameters:
    - file: Image to analyze
    - model1: First model name (default: resnet_curated_dataset)
    - model2: Second model name (default: 2000datasetresnet)
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Unsupported file type. Please upload an image.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        img = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")
    
    # Set default models
    model1 = model1 or "resnet_curated_dataset"
    model2 = model2 or "2000datasetresnet"
    
    # Face validation
    from backend.face_validator import get_face_validator
    validator = get_face_validator()
    has_face, face_count, detection_msg = validator.detect_faces(img)
    
    if not has_face:
        raise HTTPException(
            status_code=400,
            detail="❌ No face detected. Please upload an image containing a person's face."
        )
    
    img_rgb = np.array(img)
    
    # Get predictions from both models
    results = {}
    for model_name in [model1, model2]:
        try:
            weights_path = _resolve_weights_path(model_name)
            _predictor.load(model_name, weights_path)
            prediction = _predictor.predict(img_rgb, img_pil=img)
            results[model_name] = prediction
        except FileNotFoundError:
            results[model_name] = {
                "error": f"Model weights not found for {model_name}",
                "label": "Error",
                "prob_fake": None
            }
        except Exception as e:
            results[model_name] = {
                "error": f"Failed to load model: {e}",
                "label": "Error",
                "prob_fake": None
            }
    
    # Add comparison summary
    comparison = {
        "image_info": {
            "filename": file.filename or "unknown.jpg",
            "face_count": face_count
        },
        "models": results,
        "comparison": {
            "model1": model1,
            "model2": model2,
            "agreement": results[model1].get("label") == results[model2].get("label") if results[model1].get("label") != "Error" and results[model2].get("label") != "Error" else None,
            "avg_prob_fake": None
        }
    }
    
    # Calculate average probability if both models succeeded
    if (results[model1].get("prob_fake") is not None and 
        results[model2].get("prob_fake") is not None):
        comparison["comparison"]["avg_prob_fake"] = (
            results[model1]["prob_fake"] + results[model2]["prob_fake"]
        ) / 2
    
    return comparison


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: Optional[str] = None,
    adaptive: Optional[bool] = False,
    authorization: Optional[str] = Header(None)
) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Unsupported file type. Please upload an image.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        img = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")
    
    # === IMPROVEMENT 1: Metadata Analysis ===
    from backend.metadata_analyzer import get_metadata_analyzer
    metadata_analyzer = get_metadata_analyzer()
    metadata_suspicious, metadata_score, metadata_details = metadata_analyzer.analyze(content)
    
    # === IMPROVEMENT 2: AI-Generated Image Detection ===
    from backend.ai_generated_detector import get_ai_detector
    ai_detector = get_ai_detector()
    is_ai_generated, ai_score, ai_details = ai_detector.detect(img)
    
    # === IMPROVEMENT 3: Face Validation (without strict quality checks) ===
    from backend.face_validator import get_face_validator
    validator = get_face_validator()
    has_face, face_count, detection_msg = validator.detect_faces(img)
    
    if not has_face:
        raise HTTPException(
            status_code=400,
            detail="❌ No face detected. Please upload an image containing a person's face."
        )
    
    # Set quality_info to None since we're not doing quality checks
    quality_info = None

    # === IMPROVEMENT 4: Image Enhancement === (DISABLED - reduces accuracy for AI-generated images)
    # from backend.image_enhancer import get_image_enhancer
    # enhancer = get_image_enhancer()
    # enhanced_img, enhancement_info = enhancer.auto_enhance(img)
    
    # Use original image for detection (no enhancement)
    enhanced_img = img
    enhancement_info = {
        "applied": False,
        "reason": "Enhancement disabled - can reduce accuracy for AI-generated images"
    }
    img_rgb = np.array(img)
    
    # Adaptive Model Selection
    selection_reason = None
    if adaptive and model_name is None:
        # Analyze image and select best model
        characteristics = analyze_image_characteristics(img)
        effective_model_name, selection_reason = select_best_model(characteristics)
        weights_path = get_model_weights_path(effective_model_name, use_fold4=True)
    else:
        # Use specified model or default
        effective_model_name = model_name or MODEL_NAME
        weights_path = _resolve_weights_path(effective_model_name)
        if model_name:
            selection_reason = f"User specified model: {model_name}"
        else:
            selection_reason = f"Default model: {MODEL_NAME}"

    try:
        _predictor.load(effective_model_name, weights_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {e}")

    # Optional: Track user if authenticated
    current_user = get_current_user(authorization)
    
    try:
        result = _predictor.predict(img_rgb, img_pil=enhanced_img)
        
        # Combine model prediction with AI-generated detection
        # DISABLED: AI-generated detection boost
        # if is_ai_generated:
        #     # If AI detector says it's AI-generated, boost significantly
        #     boost = ai_score * 0.6  # Increased from 0.4 to 0.6 for higher sensitivity
        #     result["prob_fake"] = min(0.99, result["prob_fake"] + boost)
        #     result["label"] = "Fake" if result["prob_fake"] > 0.5 else "Real"
        
        # Add all improvement results
        if selection_reason:
            result["model_selection"] = selection_reason
            result["adaptive_mode"] = adaptive
        
        result["ai_detection"] = {
            "is_ai_generated": bool(is_ai_generated),
            "confidence": float(round(ai_score, 3)),
            "details": ai_details
        }
        
        result["metadata_analysis"] = {
            "is_suspicious": bool(metadata_suspicious),
            "suspicion_score": float(round(metadata_score, 3)),
            "details": metadata_details
        }
        
        result["image_enhancement"] = enhancement_info
        
        result["face_quality"] = quality_info
        
        # Generate AI explanation with enhanced context
        explanation = generate_explanation(
            prob_fake=result["prob_fake"],
            model_name=result["model_name"],
            image_analysis=result.get("image_analysis"),
            face_count=face_count
        )
        
        # Add AI-generated warning if detected
        if is_ai_generated:
            explanation["summary"] += f" ⚠️ AI-generated image indicators detected (confidence: {ai_score*100:.1f}%)."
        
        result["explanation"] = explanation
        
        # Generate detailed analysis breakdown
        from backend.pdf_generator import generate_detailed_analysis
        detailed_analysis = generate_detailed_analysis(
            result["prob_fake"],
            result.get("image_analysis", {}).get("complexity")
        )
        result["detailed_analysis"] = detailed_analysis
        
        # Save to history if user is authenticated
        if current_user:
            try:
                # Convert image to base64 for thumbnail and PDF
                import base64
                buffered = io.BytesIO()
                # Resize image for thumbnail and PDF (max 800px width for better quality)
                thumb_img = img.copy()
                thumb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                thumb_img.save(buffered, format="JPEG", quality=90)
                img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                history_data = DetectionHistoryCreate(
                    image_name=file.filename or "unknown.jpg",
                    result_label=result["label"],
                    prob_fake=result["prob_fake"],
                    model_name=result["model_name"],
                    model_selection_reason=result.get("model_selection"),
                    image_size=result.get("image_analysis", {}).get("size"),
                    complexity_level=result.get("image_analysis", {}).get("complexity"),
                    image_data=f"data:image/jpeg;base64,{img_base64}",
                    detailed_analysis=result.get("detailed_analysis"),
                    explanation=result.get("explanation")
                )
                history_id = save_detection_history(current_user["id"], history_data)
                result["saved_to_history"] = True
                result["history_id"] = history_id
            except Exception as e:
                # Don't fail detection if history save fails
                print(f"Failed to save history: {e}")
                result["saved_to_history"] = False
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")


class ExportPDFRequest(BaseModel):
    history_ids: Optional[List[int]] = None

class DetectionExportRequest(BaseModel):
    detection: dict

@app.post("/detection/export-pdf")
async def export_detection_pdf(
    request: DetectionExportRequest,
    authorization: Optional[str] = Header(None)
) -> StreamingResponse:
    """Export single detection result as PDF"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    try:
        # Create history item format from detection data
        # Handle JavaScript ISO format (with Z suffix)
        created_at_str = request.detection.get('created_at', datetime.now().isoformat())
        if created_at_str.endswith('Z'):
            created_at_str = created_at_str[:-1] + '+00:00'
        
        image_data = request.detection.get('image_data')
        print(f"[DEBUG] Detection PDF export - image_data present: {image_data is not None}")
        if image_data:
            print(f"[DEBUG] Image data length: {len(str(image_data))}")
        
        detection_item = {
            'id': 0,
            'image_name': request.detection.get('image_name', 'detection.jpg'),
            'result_label': request.detection.get('result_label', 'Unknown'),
            'prob_fake': request.detection.get('prob_fake', 0.5),
            'model_name': request.detection.get('model_name', 'resnet_revised'),
            'created_at': created_at_str,
            'image_data': image_data  # Include image for PDF
        }
        
        # Generate PDF for single item
        pdf_buffer = generate_history_pdf([detection_item])
        
        # Return as streaming response
        filename = request.detection.get('image_name', 'detection').replace('.', '_')
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

@app.post("/history/export-pdf")
async def export_history_pdf(
    request: ExportPDFRequest,
    authorization: Optional[str] = Header(None)
) -> StreamingResponse:
    """Export detection history as PDF"""
    user = get_current_user(authorization)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    # Get history items
    all_history = get_user_history(user["id"], limit=1000)
    
    # Filter by selected IDs if provided
    if request.history_ids:
        history_items = [h for h in all_history if h.get('id') in request.history_ids]
    else:
        history_items = all_history
    
    if not history_items:
        raise HTTPException(
            status_code=404,
            detail="No history items found"
        )
    
    try:
        # Generate PDF
        pdf_buffer = generate_history_pdf(history_items)
        
        # Return as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=deepfake_detection_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
