"""
Deepfake Detection App - Gradio Interface for Hugging Face Spaces
"""
import os
import io
import gradio as gr
import numpy as np
import torch
from PIL import Image

from src.config import DEVICE, MODEL_NAME
from src.dataset import get_transforms
from src.model import get_model

# Load model
print(f"Loading model: {MODEL_NAME}")
model_path = f"outputs/models/{MODEL_NAME}.pth"

if not os.path.exists(model_path):
    # Try fold4 version
    model_path = f"outputs/models/{MODEL_NAME}_fold4.pth"

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model weights not found: {model_path}")

model = get_model(MODEL_NAME, freeze_backbone=False).to(DEVICE)
state = torch.load(model_path, map_location=DEVICE)
model.load_state_dict(state)
model.eval()
print(f"✅ Model loaded: {MODEL_NAME}")

# Transform
transform = get_transforms(train=False)

def predict_deepfake(image):
    """
    Predict if image is deepfake or real
    
    Args:
        image: PIL Image or numpy array
    
    Returns:
        dict: Prediction results
    """
    try:
        # Convert to RGB if needed
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy for transform
        img_rgb = np.array(image)
        
        # Preprocess
        tensor = transform(image=img_rgb)["image"].unsqueeze(0).to(DEVICE)
        
        # Inference
        with torch.no_grad():
            logits = model(tensor)
            prob_fake = torch.sigmoid(logits).squeeze().item()
        
        # Classification
        label = "🔴 FAKE" if prob_fake > 0.5 else "🟢 REAL"
        confidence = prob_fake if prob_fake > 0.5 else (1 - prob_fake)
        
        # Generate explanation
        if prob_fake > 0.5:
            explanation = f"⚠️ Gambar ini terdeteksi sebagai **DEEPFAKE** dengan confidence {confidence*100:.1f}%.\n\n"
            explanation += "**Indikator:**\n"
            if prob_fake > 0.8:
                explanation += "- Confidence sangat tinggi (>80%)\n"
                explanation += "- Kemungkinan besar gambar ini hasil manipulasi AI\n"
            elif prob_fake > 0.6:
                explanation += "- Confidence tinggi (60-80%)\n"
                explanation += "- Terdeteksi pola-pola tidak natural pada wajah\n"
            else:
                explanation += "- Confidence sedang (50-60%)\n"
                explanation += "- Ada beberapa indikator manipulasi\n"
        else:
            explanation = f"✅ Gambar ini terdeteksi sebagai **REAL** dengan confidence {confidence*100:.1f}%.\n\n"
            explanation += "**Indikator:**\n"
            if confidence > 0.8:
                explanation += "- Confidence sangat tinggi (>80%)\n"
                explanation += "- Tidak ditemukan tanda-tanda manipulasi AI\n"
            elif confidence > 0.6:
                explanation += "- Confidence tinggi (60-80%)\n"
                explanation += "- Gambar tampak natural\n"
            else:
                explanation += "- Confidence sedang (50-60%)\n"
                explanation += "- Perlu verifikasi lebih lanjut\n"
        
        # Format results
        result_text = f"""
# {label}

**Confidence Score:** {confidence*100:.2f}%

**Probability Fake:** {prob_fake*100:.2f}%
**Probability Real:** {(1-prob_fake)*100:.2f}%

---

## Penjelasan

{explanation}

---

**Model:** {MODEL_NAME}
**Device:** {DEVICE}
        """
        
        return result_text
        
    except Exception as e:
        return f"❌ Error: {str(e)}"

# Examples
examples = [
    ["assets/examples/fake example.png"],
    ["assets/examples/real example.png"],
]

# Gradio Interface
with gr.Blocks(theme=gr.themes.Soft(), title="Deepfake Detection") as demo:
    gr.Markdown("""
    # 🔍 Deepfake Detection AI
    
    Upload gambar wajah untuk mendeteksi apakah gambar tersebut **asli** atau hasil **manipulasi AI (deepfake)**.
    
    Model menggunakan **ResNet-50** yang telah dilatih dengan dataset khusus untuk mendeteksi deepfake.
    """)
    
    with gr.Row():
        with gr.Column():
            image_input = gr.Image(
                type="pil",
                label="Upload Gambar",
                height=400
            )
            
            detect_btn = gr.Button(
                "🔍 Detect Deepfake",
                variant="primary",
                size="lg"
            )
            
            gr.Markdown("""
            ### 📝 Catatan:
            - Upload gambar dengan wajah yang jelas
            - Format: JPG, PNG, JPEG
            - Ukuran maksimal: 10MB
            """)
        
        with gr.Column():
            result_output = gr.Markdown(
                label="Hasil Deteksi",
                value="Upload gambar dan klik **Detect Deepfake** untuk melihat hasil."
            )
    
    # Examples
    gr.Markdown("### 📸 Contoh Gambar")
    gr.Examples(
        examples=examples,
        inputs=image_input,
        label="Klik untuk mencoba"
    )
    
    # Event handler
    detect_btn.click(
        fn=predict_deepfake,
        inputs=image_input,
        outputs=result_output
    )
    
    gr.Markdown("""
    ---
    
    ### ℹ️ Tentang Aplikasi
    
    Aplikasi ini menggunakan **Deep Learning** dengan arsitektur **ResNet-50** untuk mendeteksi gambar deepfake.
    Model telah dilatih dengan dataset yang terdiri dari gambar asli dan deepfake untuk mengenali pola-pola manipulasi AI.
    
    **Akurasi:** ~85-90% (tergantung kualitas gambar)
    
    **Disclaimer:** Hasil deteksi tidak 100% akurat. Gunakan sebagai referensi tambahan, bukan satu-satunya sumber verifikasi.
    
    ---
    
    **Developed by:** Ananda Madani  
    **Model:** ResNet-50 (5-Fold Cross-Validation)  
    **Framework:** PyTorch + Gradio
    """)

# Launch
if __name__ == "__main__":
    demo.launch()
