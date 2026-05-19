# 🔍 Model Verification Guide

Cara memastikan model yang dipakai di **local** dan **production** adalah sama.

---

## ❓ **Kenapa Hasil Berbeda?**

Jika hasil prediksi (`prob_fake`) berbeda antara local dan production, kemungkinan penyebabnya:

1. **Model weights berbeda** - File `.pth` tidak sama
2. **Model architecture berbeda** - `MODEL_NAME` tidak sama
3. **Preprocessing berbeda** - Image transform tidak konsisten
4. **Random seed berbeda** - Dropout/augmentation aktif
5. **Device berbeda** - CPU vs GPU (seharusnya tidak berpengaruh)

---

## ✅ **Cara Verify Model yang Dipakai**

### **Method 1: Check `/health` Endpoint**

#### **Local:**
```bash
# Start local server
cd backend
python -m uvicorn app:app --reload

# Check health endpoint
curl http://localhost:8000/health
```

**Output:**
```json
{
  "status": "ok",
  "device": "cpu",
  "model_name": "resnet50",
  "model_loaded": true,
  "weights_path": "outputs/models/resnet50.pth",
  "weights_size_mb": 94.43
}
```

#### **Production:**
```bash
# Check production health
curl https://your-backend.railway.app/health
```

**Output:**
```json
{
  "status": "ok",
  "device": "cpu",
  "model_name": "resnet50",
  "model_loaded": true,
  "weights_path": "outputs/models/resnet50.pth",
  "weights_size_mb": 94.43
}
```

#### **Compare:**
| Field | Local | Production | Match? |
|-------|-------|------------|--------|
| `model_name` | `resnet50` | `resnet50` | ✅ |
| `weights_path` | `outputs/models/resnet50.pth` | `outputs/models/resnet50.pth` | ✅ |
| `weights_size_mb` | `94.43` | `94.43` | ✅ |

**⚠️ PENTING:** Jika `weights_size_mb` berbeda, berarti file model **TIDAK SAMA**!

---

### **Method 2: Check Startup Logs**

#### **Local:**
```bash
cd backend
python -m uvicorn app:app --reload
```

**Look for:**
```
✅ Model loaded: resnet50
   Weights path: outputs/models/resnet50.pth
   File size: 94.43 MB
```

#### **Production (Railway):**
```bash
# Railway Dashboard → Deployments → Latest → View Logs
# Or via CLI:
railway logs
```

**Look for:**
```
✅ Model loaded: resnet50
   Weights path: outputs/models/resnet50.pth
   File size: 94.43 MB
```

---

### **Method 3: Check Model File Hash**

Verify file integrity dengan checksum:

#### **Local:**
```bash
# MD5 hash
md5 outputs/models/resnet50.pth

# SHA256 hash (more secure)
shasum -a 256 outputs/models/resnet50.pth
```

**Output:**
```
SHA256: a1b2c3d4e5f6... outputs/models/resnet50.pth
```

#### **Production:**
```bash
# Download model from Hugging Face
curl -L https://huggingface.co/anandamadani29/deepfake-detector-resnet/resolve/main/resnet50.pth -o resnet50_prod.pth

# Check hash
shasum -a 256 resnet50_prod.pth
```

**Compare:** Hash harus **100% sama**!

---

## 🔧 **Troubleshooting: Hasil Berbeda**

### **Problem 1: Model Name Berbeda**

**Symptom:**
```json
// Local
{"model_name": "resnet50"}

// Production
{"model_name": "resnet_revised"}
```

**Solution:**
```bash
# Check src/config.py
MODEL_NAME = "resnet50"  # Pastikan sama!

# Commit & push
git add src/config.py
git commit -m "Fix model name"
git push origin main
```

---

### **Problem 2: Weights File Size Berbeda**

**Symptom:**
```json
// Local
{"weights_size_mb": 94.43}

// Production
{"weights_size_mb": 89.21}  // ❌ BERBEDA!
```

**Solution:**

1. **Delete production weights:**
   ```bash
   # Railway akan re-download dari Hugging Face
   railway run rm -f outputs/models/resnet50.pth
   railway restart
   ```

2. **Verify Hugging Face file:**
   - Buka: https://huggingface.co/anandamadani29/deepfake-detector-resnet/tree/main
   - Cek file size `resnet50.pth`
   - Pastikan sama dengan local

3. **Re-upload to Hugging Face (if needed):**
   ```bash
   # Install Hugging Face CLI
   pip install huggingface_hub

   # Login
   huggingface-cli login

   # Upload
   huggingface-cli upload anandamadani29/deepfake-detector-resnet outputs/models/resnet50.pth resnet50.pth
   ```

---

### **Problem 3: Model Not Loaded**

**Symptom:**
```json
{"model_loaded": false}
```

**Solution:**

1. **Check Railway logs:**
   ```bash
   railway logs
   # Look for: "⚠️ Model weights not found"
   ```

2. **Verify download_weights.py:**
   ```python
   # backend/download_weights.py
   if MODEL_NAME in ["resnet50", ...]:  # Pastikan resnet50 ada!
       weights_filename = f"{MODEL_NAME}.pth"
   ```

3. **Manual trigger download:**
   ```bash
   railway run python backend/download_weights.py
   ```

---

### **Problem 4: Preprocessing Berbeda**

**Symptom:**
- Model sama
- Weights sama
- Tapi hasil tetap beda

**Possible Cause:**
```python
# src/dataset.py - Check transforms
def get_transforms(train=False):
    if train:
        return A.Compose([
            A.Resize(IMAGE_SIZE, IMAGE_SIZE),
            A.HorizontalFlip(p=0.5),  # ❌ Jangan pakai di inference!
            ...
        ])
    else:
        return A.Compose([
            A.Resize(IMAGE_SIZE, IMAGE_SIZE),  # ✅ Only resize
            A.Normalize(...),
            ToTensorV2()
        ])
```

**Solution:**
- Pastikan `train=False` saat inference
- Disable augmentation (flip, rotate, etc.)
- Pastikan normalization sama

---

### **Problem 5: Model in Eval Mode**

**Symptom:**
- Hasil tidak konsisten (berbeda setiap run)

**Cause:**
- Model masih dalam training mode
- Dropout/BatchNorm aktif

**Solution:**
```python
# backend/app.py - Pastikan ada:
model.eval()  # ✅ Set to evaluation mode

# Disable gradient
with torch.no_grad():
    output = model(image)
```

---

## 📊 **Quick Verification Checklist**

- [ ] `/health` endpoint: `model_name` sama
- [ ] `/health` endpoint: `weights_size_mb` sama
- [ ] Startup logs: File size sama
- [ ] `src/config.py`: `MODEL_NAME` sama
- [ ] Hugging Face: File size sama dengan local
- [ ] Model in `eval()` mode
- [ ] No augmentation in inference

---

## 🎯 **Expected Results**

Jika semua sama, hasil prediksi harus **identik** (atau sangat dekat, perbedaan < 0.01%):

```python
# Same image, same model
Local:      prob_fake = 0.8523
Production: prob_fake = 0.8523  # ✅ Sama!

# Small difference OK (floating point precision)
Local:      prob_fake = 0.8523
Production: prob_fake = 0.8524  # ✅ OK (diff < 0.01%)

# Large difference NOT OK
Local:      prob_fake = 0.8523
Production: prob_fake = 0.7234  # ❌ BERBEDA! (diff > 10%)
```

---

## 🔍 **Debug Commands**

```bash
# Local: Check model info
curl http://localhost:8000/health | jq

# Production: Check model info
curl https://your-backend.railway.app/health | jq

# Compare side-by-side
diff <(curl -s http://localhost:8000/health | jq) \
     <(curl -s https://your-backend.railway.app/health | jq)

# Check local model hash
shasum -a 256 outputs/models/resnet50.pth

# Check Hugging Face model hash
curl -sL https://huggingface.co/anandamadani29/deepfake-detector-resnet/resolve/main/resnet50.pth | shasum -a 256
```

---

**Need help?** Contact: factit.support@gmail.com
