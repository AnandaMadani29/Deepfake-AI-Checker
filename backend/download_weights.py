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
    
    # Match the actual filename in Google Drive
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
        # fuzzy=True helps with virus scan warnings on large files
        url = f"https://drive.google.com/uc?id={GOOGLE_DRIVE_FILE_ID}"
        gdown.download(url, str(weights_path), quiet=False, fuzzy=True)
        
        # Verify file was downloaded
        if weights_path.exists():
            file_size = weights_path.stat().st_size / (1024 * 1024)  # MB
            print(f"✅ Model weights downloaded successfully! ({file_size:.1f} MB)")
        else:
            raise FileNotFoundError("Download completed but file not found")
    except Exception as e:
        print(f"❌ Failed to download model weights: {e}")
        print(f"⚠️  You may need to manually upload the model weights")
        # Don't raise - let the app continue without model
        return

if __name__ == "__main__":
    download_model_weights()
