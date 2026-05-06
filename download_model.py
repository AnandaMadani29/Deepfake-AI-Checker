"""
Download model weights from cloud storage (Google Drive, Hugging Face, etc)
Run this script on Railway startup to download model weights
"""

import os
import sys
import urllib.request
from pathlib import Path

# Model download URL (update this with your actual model URL)
# Options:
# 1. Google Drive: https://drive.google.com/uc?id=FILE_ID
# 2. Hugging Face: https://huggingface.co/USER/REPO/resolve/main/model.pth
# 3. Dropbox: https://www.dropbox.com/s/FILE_ID/model.pth?dl=1

MODEL_URL = os.getenv("MODEL_DOWNLOAD_URL", "")
MODEL_NAME = os.getenv("MODEL_NAME", "best_resnet50")
MODEL_PATH = f"outputs/models/{MODEL_NAME}.pth"

def download_model():
    """Download model weights if not exists"""
    
    # Create directory if not exists
    Path("outputs/models").mkdir(parents=True, exist_ok=True)
    
    # Check if model already exists
    if os.path.exists(MODEL_PATH):
        print(f"✅ Model already exists: {MODEL_PATH}")
        return True
    
    # Check if URL is provided
    if not MODEL_URL:
        print("⚠️  MODEL_DOWNLOAD_URL not set. Skipping model download.")
        print("   Set MODEL_DOWNLOAD_URL environment variable in Railway.")
        return False
    
    print(f"📥 Downloading model from: {MODEL_URL}")
    print(f"   Saving to: {MODEL_PATH}")
    
    try:
        # Download with progress
        def reporthook(count, block_size, total_size):
            percent = int(count * block_size * 100 / total_size)
            sys.stdout.write(f"\r   Progress: {percent}%")
            sys.stdout.flush()
        
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, reporthook)
        print(f"\n✅ Model downloaded successfully!")
        
        # Verify file size
        file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)  # MB
        print(f"   File size: {file_size:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        return False

if __name__ == "__main__":
    success = download_model()
    sys.exit(0 if success else 1)
