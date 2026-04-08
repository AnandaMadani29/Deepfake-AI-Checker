"""
Adaptive Model Selection
Automatically selects the best model based on image characteristics
"""

import numpy as np
from PIL import Image
from typing import Tuple, Dict


def analyze_image_characteristics(img: Image.Image) -> Dict[str, any]:
    """
    Analyze image to determine its characteristics
    
    Returns:
        dict with image properties: size, complexity, noise_level, etc.
    """
    # Convert to numpy array
    img_array = np.array(img)
    
    # Image dimensions
    height, width = img_array.shape[:2]
    total_pixels = height * width
    
    # Calculate complexity (edge density)
    # Simple edge detection using gradient
    if len(img_array.shape) == 3:
        gray = np.mean(img_array, axis=2)
    else:
        gray = img_array
    
    # Gradient magnitude (simple edge detection)
    gy, gx = np.gradient(gray)
    edge_magnitude = np.sqrt(gx**2 + gy**2)
    edge_density = np.mean(edge_magnitude) / 255.0
    
    # Texture complexity (standard deviation)
    texture_complexity = np.std(gray) / 255.0
    
    # Color variance (if RGB)
    if len(img_array.shape) == 3:
        color_variance = np.mean([np.std(img_array[:,:,i]) for i in range(3)]) / 255.0
    else:
        color_variance = 0.0
    
    # Brightness
    brightness = np.mean(gray) / 255.0
    
    # Determine complexity level
    complexity_score = (edge_density * 0.4 + texture_complexity * 0.4 + color_variance * 0.2)
    
    if complexity_score > 0.6:
        complexity_level = "high"
    elif complexity_score > 0.3:
        complexity_level = "medium"
    else:
        complexity_level = "low"
    
    return {
        "width": width,
        "height": height,
        "total_pixels": total_pixels,
        "edge_density": float(edge_density),
        "texture_complexity": float(texture_complexity),
        "color_variance": float(color_variance),
        "brightness": float(brightness),
        "complexity_score": float(complexity_score),
        "complexity_level": complexity_level
    }


def select_best_model(characteristics: Dict[str, any]) -> Tuple[str, str]:
    """
    Select the best model based on image characteristics
    
    Args:
        characteristics: Image characteristics from analyze_image_characteristics
    
    Returns:
        Tuple of (model_name, reason)
    """
    total_pixels = characteristics["total_pixels"]
    complexity_level = characteristics["complexity_level"]
    complexity_score = characteristics["complexity_score"]
    
    # Decision logic
    
    # 1. Small images (< 300x300) -> Use EfficientNet-B0 (fastest)
    if total_pixels < 90000:  # ~300x300
        return "efficientnet_b0", "Small image - using fast model (EfficientNet-B0)"
    
    # 2. High complexity images -> Use ResNet-Revised (most accurate)
    if complexity_level == "high" or complexity_score > 0.65:
        return "resnet_revised", "High complexity image - using most accurate model (ResNet-Revised)"
    
    # 3. Low complexity images -> Use EfficientNet-B0 (efficient)
    if complexity_level == "low" or complexity_score < 0.25:
        return "efficientnet_b0", "Low complexity image - using efficient model (EfficientNet-B0)"
    
    # 4. Large, medium complexity images -> Use DenseNet-121 (balanced)
    if total_pixels > 500000:  # ~700x700
        return "densenet121", "Large image with medium complexity - using balanced model (DenseNet-121)"
    
    # 5. Default: Medium complexity -> ResNet-Revised (best accuracy)
    return "resnet_revised", "Medium complexity - using custom trained model (ResNet-Revised)"


def get_model_weights_path(model_name: str, use_fold4: bool = True) -> str:
    """
    Get the weights path for a given model
    
    Args:
        model_name: Name of the model
        use_fold4: Whether to use fold4 weights (default: True)
    
    Returns:
        Path to model weights
    """
    if use_fold4:
        return f"outputs/models/{model_name}_fold4.pth"
    else:
        return f"outputs/models/best_{model_name}.pth"
