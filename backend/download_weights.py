"""
Download model weights from Google Drive if not present locally
"""
import os
import requests
from pathlib import Path

def download_file_from_google_drive(file_id: str, destination: str):
    """Download file from Google Drive"""
    # Use direct download URL for Google Drive
    URL = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    session = requests.Session()
    
    # First request to get confirmation token for large files
    response = session.get(URL, stream=True)
    
    # Check if we need confirmation (for large files)
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            URL = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={value}"
            response = session.get(URL, stream=True)
            break
    
    save_response_content(response, destination)

def save_response_content(response, destination):
    """Save downloaded content to file"""
    CHUNK_SIZE = 32768
    
    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk:
                f.write(chunk)

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
        download_file_from_google_drive(GOOGLE_DRIVE_FILE_ID, str(weights_path))
        print(f"✅ Model weights downloaded successfully!")
    except Exception as e:
        print(f"❌ Failed to download model weights: {e}")
        raise

if __name__ == "__main__":
    download_model_weights()
