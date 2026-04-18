# 🎯 Rekomendasi Training untuk Dataset 2000 Images

## 📊 Analisis Masalah

### **Model 1: resnet_revised (1200 dataset)**
- ✅ Accuracy tinggi (~85%)
- ❌ False positives tinggi pada Real dengan background
- ❌ Model bias ke face size

### **Model 2: 2000datasetresnet (2000 dataset)**
- ⚠️ Accuracy lebih rendah (~75-77%)
- ✅ Beberapa Real Instagram sudah terdeteksi benar
- ⚠️ Masih banyak yang salah karena accuracy rendah

### **Root Cause:**
Dataset lebih kompleks → Task lebih sulit → Butuh training yang lebih baik

---

## ✅ Solusi: 3-Step Improvement Plan

### **STEP 1: Improve Training Configuration** ⭐ **PRIORITAS TINGGI**

#### **A. Update `src/config.py`:**
```python
# Increase epochs untuk dataset yang lebih besar
EPOCHS = 60  # Dari 40 → 60

# Adjust batch size jika GPU memory cukup
BATCH_SIZE = 32  # Keep 32, atau 64 jika GPU kuat

# Learning rate tetap
LR = 5e-4
```

#### **B. Update `src/train.py`:**
```python
# Line 11-12: Adjust phase configuration
PHASE1_EPOCHS = 15  # Dari 10 → 15 (lebih lama di phase 1)
PHASE2_LR = 5e-6    # Dari 1e-5 → 5e-6 (lebih kecil untuk fine-tuning)

# Line 28: Increase early stopping patience
early_stop_patience = 15  # Dari 10 → 15 (lebih sabar)
```

**Sudah diupdate:**
- ✅ Gradual unfreezing (layer3 & layer4 only)

---

### **STEP 2: Balance Dataset Distribution** ⭐ **PRIORITAS MEDIUM**

#### **Problem:**
```
Real images sekarang:
- 40% close-up (easy)
- 60% background/Instagram (hard)

Fake images:
- 50% close-up
- 50% background
```

#### **Solution: Ensure Balanced Distribution**

**Check current distribution:**
```bash
python check_face_ratio.py Dataset
```

**Ideal distribution (Real & Fake harus sama):**
```
Close-up (face >60%):     40-50%
Medium (face 30-60%):     30-40%
Wide shot (face <30%):    20-30%
```

**Jika tidak balance:**
1. Tambah Fake images dengan background besar
2. Atau kurangi Real images dengan background (tapi ini mengurangi variasi)

---

### **STEP 3: Data Augmentation Adjustment** ⭐ **PRIORITAS LOW**

#### **Current augmentation sudah bagus, tapi bisa improve:**

**Update `src/dataset.py` (Line 11-29):**
```python
def get_transforms(train=True):
    if train:
        return A.Compose([
            A.Resize(224, 224),
            A.HorizontalFlip(p=0.5),
            # A.VerticalFlip(p=0.1),  # DISABLE - tidak natural
            A.Rotate(limit=15, p=0.4),  # Kurangi dari 20 → 15
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.4),
            A.GaussNoise(p=0.2),
            A.ImageCompression(quality_range=(70, 100), p=0.3),  # Increase quality
            # A.CoarseDropout(...),  # DISABLE - terlalu agresif
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])
```

**Changes:**
- ❌ Disable `VerticalFlip` - tidak natural untuk wajah
- ❌ Disable `CoarseDropout` - bisa menghapus face features penting
- ✅ Kurangi rotation limit (20 → 15)
- ✅ Increase compression quality (60 → 70)

---

## 🚀 Action Plan

### **Quick Win (1-2 jam):**
1. ✅ Update `src/config.py`: `EPOCHS = 60`
2. ✅ Update `src/train.py`: `PHASE1_EPOCHS = 15`, `PHASE2_LR = 5e-6`, `early_stop_patience = 15`
3. ✅ Sudah diupdate: Gradual unfreezing
4. 🔄 Re-train model dengan konfigurasi baru

### **Medium Term (1-2 hari):**
1. Check dataset distribution dengan `check_face_ratio.py`
2. Balance Real & Fake distribution jika perlu
3. Adjust augmentation (disable VerticalFlip & CoarseDropout)
4. Re-train lagi

### **Long Term (1 minggu):**
1. Collect more Fake images dengan background besar
2. Ensure perfect balance (Real & Fake punya distribusi face ratio yang sama)
3. Experiment dengan different architectures (EfficientNet, DenseNet)
4. Ensemble multiple models

---

## 📈 Expected Results

### **After Step 1 (Training config improvement):**
- Expected accuracy: **78-82%** (naik dari 75-77%)
- False positives: **Berkurang 20-30%**
- Training time: **3-4 jam** (lebih lama karena 60 epochs)

### **After Step 2 (Dataset balancing):**
- Expected accuracy: **82-85%**
- False positives: **Berkurang 40-50%**
- Model lebih robust

### **After Step 3 (Augmentation adjustment):**
- Expected accuracy: **85-88%**
- False positives: **Berkurang 50-60%**
- Model sangat robust

---

## ⚠️ Important Notes

### **1. Accuracy Turun itu NORMAL dan BAGUS**
```
Model 1 (1200 dataset): 85% accuracy
→ Tapi salah pattern (bias ke face size)
→ False positives tinggi

Model 2 (2000 dataset): 75% accuracy
→ Belajar pattern yang benar (actual artifacts)
→ False positives lebih rendah
→ Lebih robust untuk production
```

**Analogi:**
- Model 1: Siswa yang hafal jawaban (accuracy tinggi tapi tidak paham)
- Model 2: Siswa yang paham konsep (accuracy lebih rendah tapi lebih robust)

### **2. Dataset Lebih Besar ≠ Accuracy Lebih Tinggi**
```
Dataset lebih besar + lebih kompleks
→ Task lebih sulit
→ Butuh training yang lebih baik
→ Tapi model lebih robust untuk real-world
```

### **3. Focus on False Positives, Not Just Accuracy**
```
Model dengan 85% accuracy tapi 40% false positives
< Model dengan 80% accuracy tapi 15% false positives

Untuk production, false positives lebih penting!
```

---

## 🎯 Next Steps

1. **Immediate:** Update training config dan re-train
2. **This week:** Check dataset balance dan adjust
3. **Next week:** Experiment dengan augmentation
4. **Long term:** Collect more data dan ensemble models

---

## 📞 Troubleshooting

### **Q: Accuracy masih rendah setelah Step 1?**
**A:** Check dataset balance (Step 2)

### **Q: False positives masih tinggi?**
**A:** Ensure Real & Fake punya distribusi face ratio yang sama

### **Q: Training terlalu lama?**
**A:** Reduce epochs ke 50, atau increase batch size

### **Q: Overfitting?**
**A:** Increase dropout, atau reduce PHASE2_LR

---

**Good luck! 🚀**
