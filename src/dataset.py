import os
import cv2
import torch
from torch.utils.data import Dataset
import albumentations as A
from albumentations.pytorch import ToTensorV2

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

def get_transforms(train=True):
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
    def __init__(self, root_dir, train=True):
        self.image_paths = []
        self.labels      = []
        self.transform   = get_transforms(train)

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
        img   = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img   = self.transform(image=img)["image"]
        # Scalar float — unsqueeze(1) dilakukan di train.py → [B, 1]
        label = torch.tensor(self.labels[idx], dtype=torch.float32)
        return img, label