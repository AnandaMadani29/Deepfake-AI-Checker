"""
Download model weights from Google Drive if not present locally
"""
import os
import gdown
from pathlib import Path

def download_model_weights():
    """Download model weights if not present"""
    # Google Drive file ID for resnet_revised.pth
    GOOGLE_DRIVE_FILE_ID = "1sGOhU8-aRfhpDKfa0mfJhM9mlm7MGrfY"
    
    # Model weights path
    weights_dir = Path("outputs/models")
    weights_dir.mkdir(parents=True, exist_ok=True)
    
    weights_path = weights_dir / "resnet_revised.pth"
    
    # Check if weights already exist
    if weights_path.exists():
        print(f"✅ Model weights already exist: {weights_path}")
        return
    
    print(f"📥 Downloading model weights from Google Drive...")
    print(f"   File ID: {GOOGLE_DRIVE_FILE_ID}")
    print(f"   Destination: {weights_path}")
    
    try:
        # Use gdown to download from Google Drive
        url = f"https://drive.google.com/uc?id={GOOGLE_DRIVE_FILE_ID}"
        gdown.download(url, str(weights_path), quiet=False)
        print(f"✅ Model weights downloaded successfully!")
    except Exception as e:
        print(f"❌ Failed to download model weights: {e}")
        raise

if __name__ == "__main__":
    download_model_weights()
