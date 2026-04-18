"""
Script untuk test comparison endpoint antara 2 models
"""
import requests
import json
from pathlib import Path

def test_compare_endpoint(image_path, model1="resnet_curated_dataset", model2="2000datasetresnet"):
    """
    Test /compare endpoint dengan 2 models
    
    Args:
        image_path: Path ke image yang ingin dites
        model1: Model pertama (default: resnet_curated_dataset)
        model2: Model kedua (default: 2000datasetresnet)
    """
    url = "http://localhost:8000/compare"
    
    # Check if image exists
    image_path = Path(image_path)
    if not image_path.exists():
        print(f"❌ Image tidak ditemukan: {image_path}")
        return
    
    # Prepare request
    with open(image_path, "rb") as f:
        files = {"file": (image_path.name, f, "image/jpeg")}
        data = {
            "model1": model1,
            "model2": model2
        }
        
        print(f"\n{'='*70}")
        print(f"COMPARING MODELS")
        print(f"{'='*70}")
        print(f"Image: {image_path.name}")
        print(f"Model 1: {model1}")
        print(f"Model 2: {model2}")
        print(f"{'='*70}\n")
        
        try:
            # Send request
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                
                # Print image info
                print("📊 Image Information:")
                print(f"  Filename: {result['image_info']['filename']}")
                print(f"  Face Count: {result['image_info']['face_count']}")
                print()
                
                # Print model 1 result
                print(f"🤖 Model 1: {result['comparison']['model1']}")
                model1_result = result['models'][result['comparison']['model1']]
                if 'error' in model1_result:
                    print(f"  ❌ Error: {model1_result['error']}")
                else:
                    print(f"  Label: {model1_result['label']}")
                    print(f"  Fake Probability: {model1_result['prob_fake']:.4f}")
                    if 'image_analysis' in model1_result:
                        print(f"  Size: {model1_result['image_analysis']['size']}")
                        print(f"  Complexity: {model1_result['image_analysis']['complexity']}")
                print()
                
                # Print model 2 result
                print(f"🤖 Model 2: {result['comparison']['model2']}")
                model2_result = result['models'][result['comparison']['model2']]
                if 'error' in model2_result:
                    print(f"  ❌ Error: {model2_result['error']}")
                else:
                    print(f"  Label: {model2_result['label']}")
                    print(f"  Fake Probability: {model2_result['prob_fake']:.4f}")
                    if 'image_analysis' in model2_result:
                        print(f"  Size: {model2_result['image_analysis']['size']}")
                        print(f"  Complexity: {model2_result['image_analysis']['complexity']}")
                print()
                
                # Print comparison summary
                print("📈 Comparison Summary:")
                print(f"  Agreement: {result['comparison']['agreement']}")
                if result['comparison']['avg_prob_fake'] is not None:
                    print(f"  Average Fake Probability: {result['comparison']['avg_prob_fake']:.4f}")
                
                if result['comparison']['agreement']:
                    print(f"  ✅ Both models agree: {model1_result['label']}")
                else:
                    print(f"  ⚠️  Models disagree:")
                    print(f"     - {result['comparison']['model1']}: {model1_result['label']}")
                    print(f"     - {result['comparison']['model2']}: {model2_result['label']}")
                
                print(f"{'='*70}\n")
                
            else:
                print(f"❌ Request failed with status {response.status_code}")
                print(f"Error: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to server. Make sure the API is running:")
            print("   python backend/app.py")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    import sys
    
    # Default test image (change to your test image)
    default_image = "Dataset/Test/Real/Real (1).jpeg"
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = default_image
    
    # Optional: specify custom models
    model1 = "resnet_curated_dataset"
    model2 = "2000datasetresnet"
    
    if len(sys.argv) > 2:
        model1 = sys.argv[2]
    if len(sys.argv) > 3:
        model2 = sys.argv[3]
    
    test_compare_endpoint(image_path, model1, model2)
