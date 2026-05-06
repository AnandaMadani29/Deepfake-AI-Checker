#!/usr/bin/env python3
"""
Startup script for Railway deployment
"""
import os
import sys
import subprocess

def main():
    print("🚀 Starting Deepfake AI Checker...")
    
    # Get port from environment
    port = os.getenv("PORT", "8000")
    print(f"   Port: {port}")
    
    # Download model if URL is provided
    model_url = os.getenv("MODEL_DOWNLOAD_URL")
    if model_url:
        print("📥 Downloading model...")
        try:
            subprocess.run([sys.executable, "download_model.py"], check=True)
            print("✅ Model download complete")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Model download failed: {e}")
            print("   Continuing without model...")
    else:
        print("⚠️  MODEL_DOWNLOAD_URL not set, skipping model download")
    
    # Start the server
    print(f"🌐 Starting FastAPI server on port {port}...")
    
    # Use exec to replace current process
    os.execvp("uvicorn", [
        "uvicorn",
        "backend.app:app",
        "--host", "0.0.0.0",
        "--port", port
    ])

if __name__ == "__main__":
    main()
