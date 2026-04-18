"""
Download model weights from Hugging Face if not present locally
"""
import os
import requests
from pathlib import Path

def download_model_weights():
    """Download model weights if not present"""
    # Get model name from environment or use default
    from src.config import MODEL_NAME
    
    # Hugging Face base URL
    HUGGINGFACE_BASE_URL = "https://huggingface.co/anandamadani29/deepfake-detector-resnet/resolve/main/"
    
    # Model weights path
    weights_dir = Path("outputs/models")
    weights_dir.mkdir(parents=True, exist_ok=True)
    
    # Construct filename based on model name
    if MODEL_NAME in ["resnet_revised", "resnet_curated_dataset", "2000datasetresnet", "resnet1704"]:
        weights_filename = f"{MODEL_NAME}.pth"
    else:
        # Fallback to resnet_revised for other models
        weights_filename = "resnet_revised.pth"
    
    weights_path = weights_dir / weights_filename
    HUGGINGFACE_URL = f"{HUGGINGFACE_BASE_URL}{weights_filename}"
    
    # Check if weights already exist
    if weights_path.exists():
        print(f"✅ Model weights already exist: {weights_path}")
        return
    
    print(f"📥 Downloading model weights from Hugging Face...")
    print(f"   URL: {HUGGINGFACE_URL}")
    print(f"   Destination: {weights_path}")
    
    try:
        # Download from Hugging Face with streaming
        # allow_redirects=True handles Hugging Face's CDN redirects
        response = requests.get(HUGGINGFACE_URL, stream=True, allow_redirects=True, timeout=300)
        response.raise_for_status()
        
        # Get file size from headers
        total_size = int(response.headers.get('content-length', 0))
        
        # Download with progress
        downloaded = 0
        chunk_size = 8192
        with open(weights_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        print(f"   Progress: {progress:.1f}% ({downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB)", end='\r')
        
        print()  # New line after progress
        
        # Verify file was downloaded
        if weights_path.exists():
            file_size = weights_path.stat().st_size / (1024 * 1024)  # MB
            print(f"✅ Model weights downloaded successfully! ({file_size:.1f} MB)")
        else:
            raise FileNotFoundError("Download completed but file not found")
    except Exception as e:
        print(f"❌ Failed to download model weights: {e}")
        print(f"⚠️  API will run without ML model")
        # Don't raise - let the app continue without model
        return

if __name__ == "__main__":
    download_model_weights()
