import os
import cv2
import torch
from torch.utils.data import Dataset
import albumentations as A
from albumentations.pytorch import ToTensorV2

# MTCNN untuk face detection
try:
    from mtcnn import MTCNN
    MTCNN_AVAILABLE = True
except ImportError:
    MTCNN_AVAILABLE = False
    print("[WARNING] MTCNN tidak terinstall. Face cropping akan di-skip.")
    print("Install dengan: pip install mtcnn")

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

# Face detector (singleton)
_face_detector = None

def get_face_detector():
    """Initialize MTCNN face detector (singleton pattern)."""
    global _face_detector
    if _face_detector is None and MTCNN_AVAILABLE:
        _face_detector = MTCNN()
    return _face_detector

def crop_face(image, margin=0.2):
    """
    Crop wajah dari gambar menggunakan MTCNN.
    
    Args:
        image: RGB image (numpy array)
        margin: Margin tambahan di sekitar wajah (0.2 = 20%)
    
    Returns:
        Cropped face image atau None jika tidak ada wajah terdeteksi
    """
    if not MTCNN_AVAILABLE:
        return None
    
    detector = get_face_detector()
    if detector is None:
        return None
    
    try:
        faces = detector.detect_faces(image)
        
        if len(faces) == 0:
            return None
        
        # Ambil face terbesar berdasarkan area
        faces_sorted = sorted(faces, key=lambda x: x['box'][2] * x['box'][3], reverse=True)
        face = faces_sorted[0]
        x, y, width, height = face['box']
        
        # Tambah margin
        margin_x = int(width * margin)
        margin_y = int(height * margin)
        
        x1 = max(0, x - margin_x)
        y1 = max(0, y - margin_y)
        x2 = min(image.shape[1], x + width + margin_x)
        y2 = min(image.shape[0], y + height + margin_y)
        
        face_crop = image[y1:y2, x1:x2]
        return face_crop
    except Exception as e:
        print(f"[WARNING] Face crop gagal: {e}")
        return None

def get_transforms(train=True):
    """
    Generate data augmentation pipeline.
    
    Args:
        train: True untuk training (dengan augmentation), False untuk validation/test
    
    Returns:
        Albumentations compose object
    """
    if train:
        return A.Compose([
            A.Resize(224, 224),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.1),
            A.Rotate(limit=20, p=0.4),
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.4),
            A.GaussNoise(p=0.2),
            A.ImageCompression(quality_range=(60, 100), p=0.3),
            A.CoarseDropout(
                num_holes_range=(1, 4),
                hole_height_range=(8, 16),
                hole_width_range=(8, 16),
                p=0.2
            ),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])
    else:
        return A.Compose([
            A.Resize(224, 224),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])


class DeepfakeDataset(Dataset):
    """
    Custom PyTorch Dataset untuk deepfake detection.
    
    Load gambar dari folder Real/ dan fake/ dengan label otomatis.
    Opsional: Face cropping menggunakan MTCNN.
    """
    
    def __init__(self, root_dir, train=True, use_face_crop=False, face_margin=0.2):
        """
        Inisialisasi dataset.
        
        Args:
            root_dir: Path ke folder dataset (Train/Validation/Test)
            train: True untuk training (dengan augmentation), False untuk validation/test
            use_face_crop: True untuk mengaktifkan face cropping
            face_margin: Margin tambahan di sekitar wajah (default 0.2 = 20%)
        """
        self.image_paths = []
        self.labels      = []
        self.transform   = get_transforms(train)
        self.use_face_crop = use_face_crop
        self.face_margin = face_margin
        
        if use_face_crop and MTCNN_AVAILABLE:
            print(f"[DATASET] Face cropping ENABLED (margin={face_margin})")
        elif use_face_crop and not MTCNN_AVAILABLE:
            print("[WARNING] Face cropping diminta tapi MTCNN tidak tersedia. Menggunakan full image.")

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
        """Return total jumlah gambar dalam dataset."""
        return len(self.image_paths)

    def __getitem__(self, idx):
        """
        Load dan transform satu gambar.
        
        Args:
            idx: Index gambar
        
        Returns:
            img: Tensor gambar yang sudah di-transform [3, 224, 224]
            label: Label (0=Real, 1=Fake)
        """
        img = cv2.imread(self.image_paths[idx])
        if img is None:
            raise ValueError(f"Gagal membaca: {self.image_paths[idx]}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Face cropping jika diaktifkan
        if self.use_face_crop:
            face = crop_face(img, margin=self.face_margin)
            if face is not None:
                img = face
            # Jika face crop gagal, gunakan full image sebagai fallback
        
        img = self.transform(image=img)["image"]
        # Scalar float — unsqueeze(1) dilakukan di train.py → [B, 1]
        label = torch.tensor(self.labels[idx], dtype=torch.float32)
        return img, label