import io
import os
from typing import Optional

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from src.config import DEVICE, MODEL_NAME
from src.dataset import get_transforms
from src.model import get_model


def _resolve_weights_path(model_name: str) -> str:
    env_path = os.getenv("DEEFAKE_WEIGHTS_PATH")
    if env_path:
        return env_path
    return f"outputs/models/best_{model_name}.pth"


class Predictor:
    def __init__(self) -> None:
        self._model_name: Optional[str] = None
        self._weights_path: Optional[str] = None
        self._model: Optional[torch.nn.Module] = None
        self._transform = get_transforms(train=False)

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
    def predict(self, img_rgb: np.ndarray) -> dict:
        if self._model is None:
            raise RuntimeError("Model is not loaded")

        x = self._transform(image=img_rgb)["image"].unsqueeze(0).to(DEVICE)
        logits = self._model(x)
        prob_fake = torch.sigmoid(logits).squeeze().item()

        label = "Fake" if prob_fake > 0.5 else "Real"
        return {
            "label": label,
            "prob_fake": float(prob_fake),
            "threshold": 0.5,
            "model_name": self._model_name,
        }


app = FastAPI(title="Deepfake Image Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_predictor = Predictor()


@app.on_event("startup")
def _startup() -> None:
    weights_path = _resolve_weights_path(MODEL_NAME)
    _predictor.load(MODEL_NAME, weights_path)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "device": str(DEVICE), "model_name": MODEL_NAME}


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: Optional[str] = None,
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

    img_rgb = np.array(img)

    effective_model_name = model_name or MODEL_NAME
    weights_path = _resolve_weights_path(effective_model_name)

    try:
        _predictor.load(effective_model_name, weights_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {e}")

    try:
        return _predictor.predict(img_rgb)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
