"""
model.py
────────────────────────────────────────────────────────────
Model yang tersedia:
  - efficientnet_b0 → EfficientNet-B0  (~4.3M params) ✅ sudah diuji
  - resnet50        → ResNet-50        (~23M params)
  - densenet121     → DenseNet-121     (~7M params)

Cara pakai:
  from src.model import get_model
  model = get_model("densenet121")
────────────────────────────────────────────────────────────
"""

import torch
import torch.nn as nn
import timm

# Registry semua model yang didukung
MODEL_REGISTRY = {
    "efficientnet_b0": {"timm_name": "efficientnet_b0", "params": "~4.3M"},
    "resnet50":        {"timm_name": "resnet50",         "params": "~23M"},
    "densenet121":     {"timm_name": "densenet121",      "params": "~7M"},
    "resnet_revised":  {"timm_name": "resnet50",         "params": "~23M"},  # Custom trained ResNet50
    "2000datasetresnet": {"timm_name": "resnet50",       "params": "~23M"},  # Custom trained ResNet50 (2000 dataset)
    "resnet1704":      {"timm_name": "resnet50",         "params": "~23M"},  # Custom trained ResNet50 (1704 date) with multi-branch head
    "resnet_curated_dataset": {"timm_name": "resnet50",  "params": "~23M"},  # Custom trained ResNet50 (1200 curated dataset)
}


def get_model(model_name: str, freeze_backbone: bool = True):
    """
    Buat model dengan classifier head untuk binary classification.
    
    Args:
        model_name    : nama model dari MODEL_REGISTRY
        freeze_backbone: True = hanya latih head (Phase 1)
    """
    if model_name not in MODEL_REGISTRY:
        available = list(MODEL_REGISTRY.keys())
        raise ValueError(f"Model '{model_name}' tidak dikenal. Pilihan: {available}")

    timm_name = MODEL_REGISTRY[model_name]["timm_name"]
    model     = timm.create_model(timm_name, pretrained=True)

    # Freeze backbone untuk Phase 1
    for param in model.parameters():
        param.requires_grad = not freeze_backbone

    # Ambil jumlah fitur output backbone
    # timm menyediakan model.classifier atau model.fc tergantung arsitektur
    if hasattr(model, "classifier"):
        in_features = model.classifier.in_features if hasattr(model.classifier, "in_features") \
                      else model.classifier[-1].in_features
    elif hasattr(model, "fc"):
        in_features = model.fc.in_features
    else:
        raise AttributeError(f"Tidak bisa menemukan classifier head untuk model {model_name}")

    # Build head sesuai model
    if model_name == "resnet1704":
        head = _build_multi_branch_head(in_features)
    else:
        head = _build_head(in_features)
    
    # Assign head to model
    if hasattr(model, "classifier"):
        model.classifier = head
    elif hasattr(model, "fc"):
        model.fc = head
    else:
        raise AttributeError(f"Tidak bisa menemukan classifier head untuk model {model_name}")

    # Classifier head selalu trainable
    head = model.classifier if hasattr(model, "classifier") else model.fc
    for param in head.parameters():
        param.requires_grad = True

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total     = sum(p.numel() for p in model.parameters())
    info      = MODEL_REGISTRY[model_name]
    print(f"[MODEL] {model_name} ({info['params']}) | "
          f"Trainable: {trainable:,} / {total:,} | Frozen: {freeze_backbone}")

    return model


def unfreeze_backbone(model, gradual=True):
    """
    Buka layer untuk fine-tuning (Phase 2).
    
    Args:
        gradual: True = unfreeze layer3 & layer4 only (recommended for complex datasets)
                 False = unfreeze all layers
    """
    if gradual and hasattr(model, 'layer3') and hasattr(model, 'layer4'):
        # Unfreeze layer3 and layer4 only (last 2 ResNet blocks)
        for param in model.layer3.parameters():
            param.requires_grad = True
        for param in model.layer4.parameters():
            param.requires_grad = True
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        print(f"[MODEL] Backbone partially unfrozen (layer3 & layer4) — {trainable:,} params trainable")
    else:
        # Unfreeze all layers
        for param in model.parameters():
            param.requires_grad = True
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        print(f"[MODEL] Backbone fully unfrozen — semua {trainable:,} params trainable")


def _build_head(in_features: int) -> nn.Sequential:
    """Classifier head standar untuk semua model."""
    return nn.Sequential(
        nn.Linear(in_features, 256),
        nn.BatchNorm1d(256),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(256, 1)
    )


def _build_multi_branch_head(in_features: int) -> nn.Module:
    """
    Multi-branch head untuk resnet1704 model.
    Architecture:
    - Attention mechanism (conv layers)
    - Global FC
    - Center FC  
    - Border FC
    - Classifier head
    """
    class MultiBranchHead(nn.Module):
        def __init__(self, in_features):
            super().__init__()
            
            # Attention mechanism (for spatial features if needed)
            self.attention = nn.Module()  # Placeholder
            self.attention.conv = nn.Sequential(
                nn.Conv2d(in_features, in_features // 4, kernel_size=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(in_features // 4, 1, kernel_size=1),
                nn.Sigmoid()
            )
            
            # Feature extractors (128 features each to match resnet1704 weights)
            self.global_fc = nn.Linear(in_features, 128)
            self.center_fc = nn.Linear(in_features, 128)
            self.border_fc = nn.Linear(in_features, 128)
            
            # Classifier (matches resnet1704 weights structure exactly)
            self.classifier = nn.Sequential(
                nn.Linear(128 * 3, 256),      # 0: Linear(384, 256)
                nn.BatchNorm1d(256),           # 1: BatchNorm1d(256)
                nn.ReLU(inplace=True),         # 2: ReLU
                nn.Dropout(0.5),               # 3: Dropout
                nn.Linear(256, 64),            # 4: Linear(256, 64)
                nn.ReLU(inplace=True),         # 5: ReLU
                nn.Dropout(0.5),               # 6: Dropout
                nn.Linear(64, 1)               # 7: Linear(64, 1)
            )
        
        def forward(self, x):
            # For ResNet, input is already flattened from global average pooling
            # Extract features from different branches
            global_feat = self.global_fc(x)
            center_feat = self.center_fc(x)
            border_feat = self.border_fc(x)
            
            # Combine all features
            combined = torch.cat([global_feat, center_feat, border_feat], dim=1)
            output = self.classifier(combined)
            
            return output
    
    return MultiBranchHead(in_features)