#!/usr/bin/env python3
"""
Startup script for Railway deployment
"""
import os
import urllib.request

MODEL_PATH = "outputs/models/resnet50.pth"

def download_model():
    model_url = os.getenv("MODEL_DOWNLOAD_URL")
    if not model_url:
        print("⚠️  MODEL_DOWNLOAD_URL not set, skipping model download")
        return

    if os.path.exists(MODEL_PATH):
        print(f"✅ Model already exists: {MODEL_PATH}")
        return

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    print(f"📥 Downloading model from HuggingFace...")
    try:
        urllib.request.urlretrieve(model_url, MODEL_PATH)
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"✅ Model downloaded: {MODEL_PATH} ({size_mb:.1f} MB)")
    except Exception as e:
        print(f"⚠️  Model download failed: {e}")
        print("   Continuing without model...")

def main():
    print("🚀 Starting Deepfake AI Checker...")

    port = os.getenv("PORT", "8000")
    print(f"   Port: {port}")

    download_model()

    print(f"🌐 Starting FastAPI server on port {port}...")
    os.execvp("uvicorn", [
        "uvicorn",
        "backend.app:app",
        "--host", "0.0.0.0",
        "--port", port
    ])

if __name__ == "__main__":
    main()
