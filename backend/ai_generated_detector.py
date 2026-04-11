"""
AI-Generated Image Detector
Detects AI-generated images using heuristic analysis of:
- Texture uniformity
- Color distribution patterns
- Edge characteristics
- Anatomical consistency
"""

import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Dict


class AIGeneratedDetector:
    def __init__(self):
        self.texture_threshold = 500
        self.hist_uniformity_threshold = 10
        self.edge_density_low = 0.05
        self.edge_density_high = 0.3
        
    def detect(self, img: Image.Image) -> Tuple[bool, float, Dict]:
        """
        Detect if image is AI-generated
        
        Args:
            img: PIL Image
            
        Returns:
            (is_ai_generated, confidence_score, details)
        """
        img_array = np.array(img.convert('RGB'))
        
        # Run all checks
        texture_score = self._check_texture_uniformity(img_array)
        color_score = self._check_color_distribution(img_array)
        edge_score = self._check_edge_patterns(img_array)
        smoothness_score = self._check_skin_smoothness(img_array)
        
        # Weighted scoring
        ai_score = (
            texture_score * 0.3 +
            color_score * 0.25 +
            edge_score * 0.25 +
            smoothness_score * 0.2
        )
        
        details = {
            "texture_uniformity": float(round(texture_score, 3)),
            "color_distribution": float(round(color_score, 3)),
            "edge_patterns": float(round(edge_score, 3)),
            "skin_smoothness": float(round(smoothness_score, 3)),
            "overall_score": float(round(ai_score, 3))
        }
        
        # Lower threshold to catch more AI-generated images
        is_ai = bool(ai_score > 0.4)  # Changed from 0.6 to 0.4
        
        return is_ai, float(ai_score), details
    
    def _check_texture_uniformity(self, img_array: np.ndarray) -> float:
        """
        AI-generated images often have unnaturally uniform texture
        """
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate local variance
        kernel_size = 15
        mean = cv2.blur(gray.astype(np.float32), (kernel_size, kernel_size))
        sqr_mean = cv2.blur((gray.astype(np.float32))**2, (kernel_size, kernel_size))
        variance = sqr_mean - mean**2
        
        avg_variance = np.mean(variance)
        
        # Low variance = too uniform = likely AI
        if avg_variance < self.texture_threshold:
            return min(1.0, (self.texture_threshold - avg_variance) / self.texture_threshold)
        return 0.0
    
    def _check_color_distribution(self, img_array: np.ndarray) -> float:
        """
        AI images often have specific color distribution patterns
        """
        # Calculate 3D color histogram
        hist = cv2.calcHist(
            [img_array], 
            [0, 1, 2], 
            None, 
            [8, 8, 8], 
            [0, 256, 0, 256, 0, 256]
        )
        
        # Normalize
        hist = hist.flatten()
        hist = hist / (hist.sum() + 1e-7)
        
        # Calculate entropy (AI images tend to have lower entropy)
        entropy = -np.sum(hist * np.log2(hist + 1e-7))
        
        # Also check for unnatural color peaks
        hist_std = np.std(hist)
        
        # Low entropy or low std = suspicious
        entropy_score = max(0, (12 - entropy) / 12)  # Normal images ~10-12
        std_score = 1.0 if hist_std < self.hist_uniformity_threshold else 0.0
        
        return (entropy_score + std_score) / 2
    
    def _check_edge_patterns(self, img_array: np.ndarray) -> float:
        """
        AI images have characteristic edge patterns
        """
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Detect edges
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        
        # AI images often have either too few or too many edges
        if edge_density < self.edge_density_low:
            return min(1.0, (self.edge_density_low - edge_density) / self.edge_density_low)
        elif edge_density > self.edge_density_high:
            return min(1.0, (edge_density - self.edge_density_high) / 0.2)
        
        return 0.0
    
    def _check_skin_smoothness(self, img_array: np.ndarray) -> float:
        """
        AI-generated faces often have unnaturally smooth skin
        """
        # Convert to YCrCb for skin detection
        ycrcb = cv2.cvtColor(img_array, cv2.COLOR_RGB2YCrCb)
        
        # Skin color range in YCrCb
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        
        # Create skin mask
        skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
        
        if np.sum(skin_mask) < 1000:  # Not enough skin pixels
            return 0.0
        
        # Calculate texture variance in skin regions
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        skin_texture = gray[skin_mask > 0]
        
        if len(skin_texture) == 0:
            return 0.0
        
        texture_var = np.var(skin_texture)
        
        # Very low variance = too smooth = likely AI
        if texture_var < 200:
            return min(1.0, (200 - texture_var) / 200)
        
        return 0.0


# Global instance
_detector = None

def get_ai_detector() -> AIGeneratedDetector:
    """Get global AI detector instance"""
    global _detector
    if _detector is None:
        _detector = AIGeneratedDetector()
    return _detector
