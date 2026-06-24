import os
import cv2
import torch
from torch.utils.data import Dataset
import albumentations as A
from albumentations.pytorch import ToTensorV2

# Nilai mean dan std dari ImageNet — digunakan untuk normalisasi agar sesuai dengan pretrained weights
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

# Inisialisasi Haar Cascade face detector (singleton) — tidak perlu reload setiap gambar
_face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def crop_face(image, margin=0.2):
    """Crop area wajah menggunakan Haar Cascade. Fallback ke full image jika tidak terdeteksi."""
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    # Deteksi wajah — scaleFactor=1.1 untuk scan multi-skala, minNeighbors=5 untuk kurangi false positive
    faces = _face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        return None
    # Ambil wajah terbesar (area w×h) sebagai subjek utama
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    # Tambah margin di sekitar wajah agar konteks tidak terpotong
    mx, my = int(w * margin), int(h * margin)
    x1 = max(0, x - mx); y1 = max(0, y - my)
    x2 = min(image.shape[1], x + w + mx); y2 = min(image.shape[0], y + h + my)
    return image[y1:y2, x1:x2]

def get_transforms(train=True):
    if train:
        # Pipeline training: preprocessing + augmentasi untuk memperbanyak variasi data
        return A.Compose([
            A.Resize(224, 224),                                                          # Resize ke input size ResNet
            A.HorizontalFlip(p=0.5),                                                     # Variasi orientasi horizontal
            A.VerticalFlip(p=0.1),                                                       # Variasi orientasi vertikal
            A.Rotate(limit=20, p=0.4),                                                   # Variasi rotasi ±20 derajat
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.4),# Variasi pencahayaan
            A.GaussNoise(p=0.2),                                                         # Simulasi noise kamera
            A.ImageCompression(quality_range=(60, 100), p=0.3),                         # Simulasi kompresi JPEG internet
            A.CoarseDropout(                                                             # Simulasi oklusi/masking area
                num_holes_range=(1, 4),
                hole_height_range=(8, 16),
                hole_width_range=(8, 16),
                p=0.2
            ),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),                          # Normalisasi ImageNet
            ToTensorV2()                                                                  # Konversi ke PyTorch tensor
        ])
    else:
        # Pipeline validasi/inferensi: hanya preprocessing tanpa augmentasi (deterministik)
        return A.Compose([
            A.Resize(224, 224),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])


class DeepfakeDataset(Dataset):
    def __init__(self, root_dir, train=True, use_face_crop=False, face_margin=0.2):
        self.image_paths   = []
        self.labels        = []
        self.transform     = get_transforms(train)
        self.use_face_crop = use_face_crop
        self.face_margin   = face_margin

        for label, category in enumerate(["Real", "fake"]):
            folder = os.path.join(root_dir, category)
            if not os.path.exists(folder):
                print(f"[WARNING] Folder tidak ditemukan: {folder}")
                continue
            for img in sorted(os.listdir(folder)):
                if img.lower().endswith((".jpg", ".jpeg", ".png")):
                    self.image_paths.append(os.path.join(folder, img))
                    self.labels.append(label)

        real = self.labels.count(0)
        fake = self.labels.count(1)
        print(f"[DATASET] '{root_dir}' → {len(self.labels)} gambar | Real: {real} | Fake: {fake}")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img = cv2.imread(self.image_paths[idx])
        if img is None:
            raise ValueError(f"Gagal membaca: {self.image_paths[idx]}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # Face cropping opsional — diaktifkan via USE_FACE_CROP di config.py
        # Jika crop gagal (wajah tidak terdeteksi), gunakan full image sebagai fallback
        if self.use_face_crop:
            face = crop_face(img, margin=self.face_margin)
            if face is not None:
                img = face
        img   = self.transform(image=img)["image"]
        # Scalar float — unsqueeze(1) dilakukan di train.py → [B, 1]
        label = torch.tensor(self.labels[idx], dtype=torch.float32)
        return img, label