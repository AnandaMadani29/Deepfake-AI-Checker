"""
main_test.py — Evaluasi model pada test set
Hasil disimpan ke outputs/results/<model>_test_results.json
"""

import json
import torch
import numpy as np
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

from src.config import set_seed, SEED, DEVICE, BATCH_SIZE, DATA_DIR, MODEL_SAVE_PATH, MODEL_NAME
from src.dataset import DeepfakeDataset
from src.model import get_model


def evaluate(model, loader, device):
    model.eval()
    all_preds, all_probs, all_labels = [], [], []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            probs  = torch.sigmoid(model(images)).squeeze(1)
            preds  = (probs > 0.5).long()

            all_probs.extend(probs.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.long().cpu().numpy())

    return np.array(all_labels), np.array(all_preds), np.array(all_probs)


def main():
    set_seed(SEED)
    import os; os.makedirs("outputs/results", exist_ok=True)

    print(f"\n{'='*55}")
    print(f"  TEST EVALUASI — {MODEL_NAME.upper()}")
    print(f"{'='*55}")

    test_ds     = DeepfakeDataset(f"{DATA_DIR}/Test", train=False)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE,
                             shuffle=False, num_workers=0)

    model = get_model(MODEL_NAME, freeze_backbone=False).to(DEVICE)
    model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=DEVICE))
    print(f"[TEST] Model loaded: {MODEL_SAVE_PATH}")

    labels, preds, probs = evaluate(model, test_loader, DEVICE)

    # Metrics
    report = classification_report(labels, preds,
                                    target_names=["Real", "Fake"],
                                    output_dict=True)
    auc = roc_auc_score(labels, probs)
    tn, fp, fn, tp = confusion_matrix(labels, preds).ravel()
    accuracy = (tp + tn) / (tp + tn + fp + fn)

    # Print
    print(f"\n{classification_report(labels, preds, target_names=['Real','Fake'])}")
    print(f"ROC-AUC       : {auc:.4f}")
    print(f"\nConfusion Matrix:")
    print(f"  TP: {tp:4d}  FN: {fn:4d}")
    print(f"  FP: {fp:4d}  TN: {tn:4d}")

    # Simpan ke JSON untuk compare_models.py
    test_results = {
        "model":        MODEL_NAME,
        "accuracy":     round(accuracy, 4),
        "roc_auc":      round(auc, 4),
        "precision_real": round(report["Real"]["precision"], 4),
        "recall_real":    round(report["Real"]["recall"], 4),
        "precision_fake": round(report["Fake"]["precision"], 4),
        "recall_fake":    round(report["Fake"]["recall"], 4),
        "f1_macro":       round(report["macro avg"]["f1-score"], 4),
        "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn),
    }

    out_path = f"outputs/results/{MODEL_NAME}_test_results.json"
    with open(out_path, "w") as f:
        json.dump(test_results, f, indent=2)

    print(f"\n💾 Test results disimpan ke: {out_path}")
    print("   Setelah semua model selesai: python compare_models.py")


if __name__ == "__main__":
    main()