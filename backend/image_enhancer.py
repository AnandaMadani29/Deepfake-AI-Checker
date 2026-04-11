"""
Image Enhancement Module
Improves image quality before deepfake detection
"""

import cv2
import numpy as np
from PIL import Image
from typing import Tuple


class ImageEnhancer:
    """Enhance image quality for better detection accuracy"""
    
    def __init__(self):
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    def enhance(self, img: Image.Image, apply_denoise: bool = True, 
                apply_contrast: bool = True, apply_sharpen: bool = False) -> Image.Image:
        """
        Enhance image quality
        
        Args:
            img: PIL Image
            apply_denoise: Whether to apply denoising
            apply_contrast: Whether to enhance contrast
            apply_sharpen: Whether to sharpen (use carefully, can amplify artifacts)
            
        Returns:
            Enhanced PIL Image
        """
        img_array = np.array(img.convert('RGB'))
        enhanced = img_array.copy()
        
        # 1. Denoise (remove noise while preserving edges)
        if apply_denoise:
            enhanced = self._denoise(enhanced)
        
        # 2. Enhance contrast (make features more visible)
        if apply_contrast:
            enhanced = self._enhance_contrast(enhanced)
        
        # 3. Sharpen (optional, can help with blurry images)
        if apply_sharpen:
            enhanced = self._sharpen(enhanced)
        
        return Image.fromarray(enhanced)
    
    def _denoise(self, img_array: np.ndarray) -> np.ndarray:
        """
        Remove noise while preserving edges
        Uses Non-Local Means Denoising
        """
        # Check if image is too small for denoising
        if img_array.shape[0] < 100 or img_array.shape[1] < 100:
            return img_array
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoisingColored(
            img_array,
            None,
            h=10,           # Filter strength for luminance
            hColor=10,      # Filter strength for color
            templateWindowSize=7,
            searchWindowSize=21
        )
        
        return denoised
    
    def _enhance_contrast(self, img_array: np.ndarray) -> np.ndarray:
        """
        Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
        Works better than regular histogram equalization
        """
        # Convert to LAB color space
        lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        l_enhanced = self.clahe.apply(l)
        
        # Merge channels
        enhanced_lab = cv2.merge([l_enhanced, a, b])
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
        
        return enhanced
    
    def _sharpen(self, img_array: np.ndarray) -> np.ndarray:
        """
        Sharpen image to enhance edges
        Use carefully - can amplify compression artifacts
        """
        # Check blur level first
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Only sharpen if image is blurry
        if blur_score < 100:
            kernel = np.array([
                [-1, -1, -1],
                [-1,  9, -1],
                [-1, -1, -1]
            ])
            sharpened = cv2.filter2D(img_array, -1, kernel)
            
            # Blend with original to avoid over-sharpening
            alpha = 0.5
            result = cv2.addWeighted(img_array, 1 - alpha, sharpened, alpha, 0)
            return result
        
        return img_array
    
    def auto_enhance(self, img: Image.Image) -> Tuple[Image.Image, dict]:
        """
        Automatically determine and apply best enhancements
        
        Args:
            img: PIL Image
            
        Returns:
            (enhanced_image, applied_enhancements)
        """
        img_array = np.array(img.convert('RGB'))
        
        # Analyze image quality
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Check blur
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = blur_score < 100
        
        # Check noise
        noise_score = self._estimate_noise(gray)
        is_noisy = noise_score > 10
        
        # Check contrast
        contrast = np.std(img_array)
        is_low_contrast = contrast < 40
        
        # Determine enhancements
        apply_denoise = is_noisy
        apply_contrast = is_low_contrast
        apply_sharpen = is_blurry and not is_noisy  # Don't sharpen noisy images
        
        # Apply enhancements
        enhanced = self.enhance(
            img,
            apply_denoise=apply_denoise,
            apply_contrast=apply_contrast,
            apply_sharpen=apply_sharpen
        )
        
        enhancements = {
            "denoised": bool(apply_denoise),
            "contrast_enhanced": bool(apply_contrast),
            "sharpened": bool(apply_sharpen),
            "quality_scores": {
                "blur_score": float(round(blur_score, 2)),
                "noise_score": float(round(noise_score, 2)),
                "contrast": float(round(contrast, 2))
            }
        }
        
        return enhanced, enhancements
    
    def _estimate_noise(self, gray_img: np.ndarray) -> float:
        """
        Estimate noise level in image
        Uses median absolute deviation method
        """
        # Apply Laplacian
        laplacian = cv2.Laplacian(gray_img, cv2.CV_64F)
        
        # Calculate MAD (Median Absolute Deviation)
        mad = np.median(np.abs(laplacian - np.median(laplacian)))
        
        # Estimate sigma (noise standard deviation)
        sigma = 1.4826 * mad
        
        return sigma


# Global instance
_enhancer = None

def get_image_enhancer() -> ImageEnhancer:
    """Get global image enhancer instance"""
    global _enhancer
    if _enhancer is None:
        _enhancer = ImageEnhancer()
    return _enhancer
