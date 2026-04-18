"""
Script untuk boost confidence bahwa foto adalah Real
Strategi:
1. Ensemble voting dengan bias ke Real
2. Threshold adjustment untuk reduce false positives
3. Confidence boosting berdasarkan multiple factors
"""
import torch
import numpy as np
from pathlib import Path
from PIL import Image
from typing import Dict, List, Optional
import json

from src.config import DEVICE
from src.dataset import get_transforms
from src.model import get_model


class RealBooster:
    """
    Class untuk boost confidence bahwa foto adalah Real
    """
    
    def __init__(self, models: List[str], weights: Optional[List[float]] = None):
        """
        Args:
            models: List of model names to use for ensemble
            weights: Optional weights for each model (default: equal weights)
        """
        self.models = models
        self.weights = weights if weights else [1.0] * len(models)
        self.transform = get_transforms(train=False)
        self.loaded_models = {}
        
    def load_models(self):
        """Load all models"""
        from backend.app import _resolve_weights_path
        
        for model_name in self.models:
            try:
                weights_path = _resolve_weights_path(model_name)
                model = get_model(model_name, freeze_backbone=False).to(DEVICE)
                
                if Path(weights_path).exists():
                    state = torch.load(weights_path, map_location=DEVICE)
                    model.load_state_dict(state)
                    model.eval()
                    self.loaded_models[model_name] = model
                    print(f"✅ Loaded model: {model_name}")
                else:
                    print(f"❌ Model weights not found: {weights_path}")
            except Exception as e:
                print(f"❌ Failed to load {model_name}: {e}")
    
    @torch.no_grad()
    def predict_single(self, model_name: str, img_rgb: np.ndarray) -> float:
        """Predict fake probability with single model"""
        if model_name not in self.loaded_models:
            raise ValueError(f"Model {model_name} not loaded")
        
        model = self.loaded_models[model_name]
        x = self.transform(image=img_rgb)["image"].unsqueeze(0).to(DEVICE)
        logits = model(x)
        prob_fake = torch.sigmoid(logits).squeeze().item()
        
        return prob_fake
    
    def ensemble_vote(
        self, 
        img_rgb: np.ndarray, 
        bias_real: float = 0.1,
        threshold: float = 0.5
    ) -> Dict:
        """
        Ensemble voting with bias to Real
        
        Args:
            img_rgb: RGB image array
            bias_real: Bias towards Real (0.0 = no bias, 0.2 = strong bias)
            threshold: Decision threshold (lower = more lenient to Real)
        
        Returns:
            Dict with prediction details
        """
        if not self.loaded_models:
            self.load_models()
        
        # Get predictions from all models
        predictions = {}
        weighted_sum = 0.0
        total_weight = 0.0
        
        for i, model_name in enumerate(self.models):
            if model_name in self.loaded_models:
                prob_fake = self.predict_single(model_name, img_rgb)
                weight = self.weights[i]
                
                predictions[model_name] = prob_fake
                weighted_sum += prob_fake * weight
                total_weight += weight
        
        # Calculate weighted average
        avg_prob_fake = weighted_sum / total_weight if total_weight > 0 else 0.5
        
        # Apply bias towards Real (reduce fake probability)
        boosted_prob_fake = max(0.0, avg_prob_fake - bias_real)
        
        # Apply threshold
        label = "Fake" if boosted_prob_fake > threshold else "Real"
        
        return {
            "label": label,
            "original_prob_fake": avg_prob_fake,
            "boosted_prob_fake": boosted_prob_fake,
            "bias_real": bias_real,
            "threshold": threshold,
            "individual_predictions": predictions,
            "ensemble_weighted_avg": avg_prob_fake
        }
    
    def adaptive_threshold(
        self,
        img_rgb: np.ndarray,
        img_pil: Optional[Image.Image] = None
    ) -> Dict:
        """
        Adaptive threshold based on image characteristics
        
        Args:
            img_rgb: RGB image array
            img_pil: PIL Image for analysis
        
        Returns:
            Dict with prediction details
        """
        from backend.adaptive_selector import analyze_image_characteristics
        
        # Get base prediction
        base_result = self.ensemble_vote(img_rgb, bias_real=0.0, threshold=0.5)
        
        # Analyze image characteristics
        if img_pil:
            characteristics = analyze_image_characteristics(img_pil)
            complexity = characteristics["complexity_score"]
        else:
            complexity = 0.5
        
        # Adaptive threshold: lower threshold for complex images (more lenient to Real)
        # Higher threshold for simple images (more strict)
        adaptive_threshold = 0.5 - (complexity - 0.5) * 0.1
        
        # Recalculate with adaptive threshold
        label = "Fake" if base_result["boosted_prob_fake"] > adaptive_threshold else "Real"
        
        return {
            "label": label,
            "original_prob_fake": base_result["original_prob_fake"],
            "boosted_prob_fake": base_result["boosted_prob_fake"],
            "adaptive_threshold": adaptive_threshold,
            "complexity_score": complexity,
            "individual_predictions": base_result["individual_predictions"]
        }
    
    def conservative_real(
        self,
        img_rgb: np.ndarray,
        min_fake_prob: float = 0.7
    ) -> Dict:
        """
        Conservative approach: Only predict Fake if very confident
        
        Args:
            img_rgb: RGB image array
            min_fake_prob: Minimum fake probability to classify as Fake
        
        Returns:
            Dict with prediction details
        """
        # Get base prediction
        base_result = self.ensemble_vote(img_rgb, bias_real=0.0, threshold=0.5)
        
        # Conservative: only Fake if very confident
        label = "Fake" if base_result["boosted_prob_fake"] > min_fake_prob else "Real"
        
        return {
            "label": label,
            "original_prob_fake": base_result["original_prob_fake"],
            "boosted_prob_fake": base_result["boosted_prob_fake"],
            "conservative_threshold": min_fake_prob,
            "strategy": "Conservative: Only Fake if > {:.0%} confident".format(min_fake_prob),
            "individual_predictions": base_result["individual_predictions"]
        }


def boost_real_image(
    image_path: str,
    strategy: str = "bias",
    models: Optional[List[str]] = None
):
    """
    Boost confidence that image is Real
    
    Args:
        image_path: Path to image
        strategy: Strategy to use (bias, adaptive, conservative)
        models: List of models to use (default: resnet_curated_dataset, 2000datasetresnet)
    """
    if models is None:
        models = ["resnet_curated_dataset", "2000datasetresnet"]
    
    # Load image
    image_path = Path(image_path)
    if not image_path.exists():
        print(f"❌ Image tidak ditemukan: {image_path}")
        return
    
    img = Image.open(image_path).convert("RGB")
    img_rgb = np.array(img)
    
    print(f"\n{'='*70}")
    print(f"REAL DETECTION BOOST")
    print(f"{'='*70}")
    print(f"Image: {image_path.name}")
    print(f"Strategy: {strategy}")
    print(f"Models: {', '.join(models)}")
    print(f"{'='*70}\n")
    
    # Initialize booster
    booster = RealBooster(models)
    booster.load_models()
    
    # Apply strategy
    if strategy == "bias":
        result = booster.ensemble_vote(img_rgb, bias_real=0.15, threshold=0.5)
        print("📊 Strategy: Bias towards Real (bias=0.15)")
        print(f"  Original Fake Probability: {result['original_prob_fake']:.4f}")
        print(f"  Boosted Fake Probability: {result['boosted_prob_fake']:.4f}")
        print(f"  Final Label: {result['label']}")
        
    elif strategy == "adaptive":
        result = booster.adaptive_threshold(img_rgb, img_pil=img)
        print("📊 Strategy: Adaptive Threshold")
        print(f"  Original Fake Probability: {result['original_prob_fake']:.4f}")
        print(f"  Complexity Score: {result['complexity_score']:.4f}")
        print(f"  Adaptive Threshold: {result['adaptive_threshold']:.4f}")
        print(f"  Final Label: {result['label']}")
        
    elif strategy == "conservative":
        result = booster.conservative_real(img_rgb, min_fake_prob=0.7)
        print("📊 Strategy: Conservative (only Fake if >70% confident)")
        print(f"  Original Fake Probability: {result['original_prob_fake']:.4f}")
        print(f"  Conservative Threshold: {result['conservative_threshold']:.4f}")
        print(f"  Final Label: {result['label']}")
        print(f"  {result['strategy']}")
    
    else:
        print(f"❌ Unknown strategy: {strategy}")
        return
    
    # Print individual predictions
    print(f"\n🤖 Individual Model Predictions:")
    for model_name, prob_fake in result['individual_predictions'].items():
        label = "Fake" if prob_fake > 0.5 else "Real"
        print(f"  {model_name}:")
        print(f"    Label: {label}")
        print(f"    Fake Probability: {prob_fake:.4f}")
    
    print(f"\n{'='*70}\n")
    
    return result


if __name__ == "__main__":
    import sys
    
    # Default parameters
    default_image = "Dataset/Test/Real/Real (1).jpeg"
    default_strategy = "bias"
    default_models = ["resnet_curated_dataset", "2000datasetresnet"]
    
    # Parse arguments
    image_path = sys.argv[1] if len(sys.argv) > 1 else default_image
    strategy = sys.argv[2] if len(sys.argv) > 2 else default_strategy
    
    # Parse models (if provided)
    if len(sys.argv) > 3:
        models = sys.argv[3].split(",")
    else:
        models = default_models
    
    # Boost real detection
    boost_real_image(image_path, strategy, models)
