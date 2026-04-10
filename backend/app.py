import io
import os
from typing import Optional

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from src.config import DEVICE, MODEL_NAME
from src.dataset import get_transforms
from src.model import get_model
from backend.auth import (
    UserRegister, UserLogin, ForgotPassword, ResetPassword, TokenResponse,
    create_user, authenticate_user, create_access_token, create_reset_token,
    reset_password_with_token, decode_token, init_db
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
        # Return fold4 path as default (will error if not found)
        return fold4_path


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
    """Request password reset token"""
    token = create_reset_token(data.email)
    
    # In production, send this token via email
    # For now, return it in response (development only)
    return {
        "message": "If email exists, reset link has been sent",
        "reset_token": token  # Remove this in production
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
    
    # Validate that image contains a face and get face count
    from backend.face_validator import get_face_validator
    validator = get_face_validator()
    has_face, face_count, detection_msg = validator.detect_faces(img)
    
    if not has_face:
        raise HTTPException(
            status_code=400,
            detail="❌ No face detected. Please upload an image containing a person's face."
        )

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
        result = _predictor.predict(img_rgb, img_pil=img)
        
        # Add adaptive selection info
        if selection_reason:
            result["model_selection"] = selection_reason
            result["adaptive_mode"] = adaptive
        
        # Generate AI explanation
        explanation = generate_explanation(
            prob_fake=result["prob_fake"],
            model_name=result["model_name"],
            image_analysis=result.get("image_analysis"),
            face_count=face_count
        )
        result["explanation"] = explanation
        
        # Save to history if user is authenticated
        if current_user:
            try:
                # Convert image to base64 for thumbnail
                import base64
                buffered = io.BytesIO()
                # Resize image for thumbnail (max 200px width)
                thumb_img = img.copy()
                thumb_img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                thumb_img.save(buffered, format="JPEG", quality=85)
                img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                history_data = DetectionHistoryCreate(
                    image_name=file.filename or "unknown.jpg",
                    result_label=result["label"],
                    prob_fake=result["prob_fake"],
                    model_name=result["model_name"],
                    model_selection_reason=result.get("model_selection"),
                    image_size=result.get("image_analysis", {}).get("size"),
                    complexity_level=result.get("image_analysis", {}).get("complexity"),
                    image_data=f"data:image/jpeg;base64,{img_base64}"
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
