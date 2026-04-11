"""
Face Validation Module
Validates that uploaded images contain human faces
"""

import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional


class FaceValidator:
    """Validates that images contain human faces using OpenCV Haar Cascade"""
    
    def __init__(self):
        """Initialize face detector with Haar Cascade"""
        # Load pre-trained Haar Cascade for face detection
        # This is included with OpenCV, no additional download needed
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        # Also load profile face detector for side faces
        self.profile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_profileface.xml'
        )
    
    def _remove_overlapping_faces(self, faces_list):
        """Remove overlapping face detections using Non-Maximum Suppression"""
        if len(faces_list) == 0:
            return []
        
        # Convert to list of [x, y, x2, y2] format
        boxes = []
        for (x, y, w, h) in faces_list:
            boxes.append([x, y, x + w, y + h])
        
        boxes = np.array(boxes)
        
        # Calculate areas
        x1 = boxes[:, 0]
        y1 = boxes[:, 1]
        x2 = boxes[:, 2]
        y2 = boxes[:, 3]
        areas = (x2 - x1) * (y2 - y1)
        
        # Sort by bottom-right y coordinate
        order = y2.argsort()
        
        keep = []
        while len(order) > 0:
            i = order[-1]
            keep.append(i)
            
            # Calculate IoU with remaining boxes
            xx1 = np.maximum(x1[i], x1[order[:-1]])
            yy1 = np.maximum(y1[i], y1[order[:-1]])
            xx2 = np.minimum(x2[i], x2[order[:-1]])
            yy2 = np.minimum(y2[i], y2[order[:-1]])
            
            w = np.maximum(0, xx2 - xx1)
            h = np.maximum(0, yy2 - yy1)
            
            intersection = w * h
            iou = intersection / (areas[i] + areas[order[:-1]] - intersection)
            
            # Keep only boxes with IoU < 0.3 (not overlapping)
            order = order[np.where(iou < 0.3)[0]]
        
        return [faces_list[i] for i in keep]
    
    def _check_face_quality(self, img_array: np.ndarray, face_box: Tuple[int, int, int, int]) -> Tuple[bool, str, dict]:
        """
        Check quality of detected face
        
        Args:
            img_array: Image as numpy array
            face_box: (x, y, w, h) of face region
            
        Returns:
            (is_good_quality, message, quality_scores)
        """
        x, y, w, h = face_box
        face_img = img_array[y:y+h, x:x+w]
        
        if face_img.size == 0:
            return False, "Invalid face region", {}
        
        # 1. Check blur (Laplacian variance)
        gray_face = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY) if len(face_img.shape) == 3 else face_img
        laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        is_blurry = laplacian_var < 50  # Lowered from 100 to be more lenient
        
        # 2. Check face size
        is_too_small = w < 80 or h < 80
        is_too_large = w > img_array.shape[1] * 0.9 or h > img_array.shape[0] * 0.9
        
        # 3. Check brightness
        brightness = np.mean(face_img)
        is_too_dark = brightness < 40
        is_too_bright = brightness > 220
        
        # 4. Check contrast
        contrast = np.std(face_img)
        is_low_contrast = contrast < 20
        
        quality_scores = {
            "blur_score": round(laplacian_var, 2),
            "size": f"{w}x{h}",
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2)
        }
        
        # Determine if quality is acceptable
        if is_blurry:
            return False, "Face is too blurry for accurate detection", quality_scores
        if is_too_small:
            return False, "Face is too small (minimum 80x80 pixels)", quality_scores
        if is_too_large:
            return False, "Face takes up entire image, please use a clearer photo", quality_scores
        if is_too_dark:
            return False, "Face is too dark, please use better lighting", quality_scores
        if is_too_bright:
            return False, "Face is overexposed, please use better lighting", quality_scores
        if is_low_contrast:
            return False, "Image has very low contrast", quality_scores
        
        return True, "Face quality is good", quality_scores
    
    def detect_faces(self, img: Image.Image) -> Tuple[bool, int, str]:
        """
        Detect faces in an image
        
        Args:
            img: PIL Image object
        
        Returns:
            Tuple of (has_face, face_count, message)
        """
        # Convert PIL Image to OpenCV format
        img_array = np.array(img)
        
        # Convert RGB to BGR (OpenCV format)
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            img_bgr = img_array
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Detect frontal faces with stricter parameters
        frontal_faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=6,  # Increased from 5 to reduce false positives
            minSize=(40, 40),  # Increased from 30 to filter small detections
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        # Combine all detections
        all_faces = list(frontal_faces) if len(frontal_faces) > 0 else []
        
        # Remove overlapping detections
        unique_faces = self._remove_overlapping_faces(all_faces)
        total_faces = len(unique_faces)
        
        if total_faces == 0:
            return False, 0, "No face detected in the image"
        elif total_faces == 1:
            return True, 1, "1 face detected"
        else:
            return True, total_faces, f"{total_faces} faces detected"
    
    def detect_faces_with_quality(self, img: Image.Image) -> Tuple[bool, int, str, Optional[dict]]:
        """
        Detect faces and validate quality
        
        Args:
            img: PIL Image object
        
        Returns:
            Tuple of (has_face, face_count, message, quality_info)
        """
        # Convert PIL Image to OpenCV format
        img_array = np.array(img)
        
        # Convert RGB to BGR (OpenCV format)
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            img_bgr = img_array
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Detect frontal faces
        frontal_faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=6,
            minSize=(40, 40),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        all_faces = list(frontal_faces) if len(frontal_faces) > 0 else []
        unique_faces = self._remove_overlapping_faces(all_faces)
        total_faces = len(unique_faces)
        
        if total_faces == 0:
            return False, 0, "No face detected in the image", None
        
        # Check quality of the largest face (primary face)
        largest_face = max(unique_faces, key=lambda f: f[2] * f[3])
        is_good, quality_msg, quality_scores = self._check_face_quality(img_array, largest_face)
        
        if not is_good:
            return False, total_faces, f"❌ {quality_msg}", quality_scores
        
        if total_faces == 1:
            return True, 1, "✅ 1 high-quality face detected", quality_scores
        else:
            return True, total_faces, f"✅ {total_faces} faces detected (primary face quality OK)", quality_scores
    
    def validate_image(self, img: Image.Image, allow_multiple_faces: bool = True) -> Tuple[bool, str]:
        """
        Validate that image contains face(s)
        
        Args:
            img: PIL Image object
            allow_multiple_faces: Whether to allow images with multiple faces
        
        Returns:
            Tuple of (is_valid, message)
        """
        has_face, face_count, detection_msg = self.detect_faces(img)
        
        if not has_face:
            return False, "❌ No face detected. Please upload an image containing a person's face."
        
        if not allow_multiple_faces and face_count > 1:
            return False, f"❌ Multiple faces detected ({face_count}). Please upload an image with only one person."
        
        return True, f"✅ {detection_msg}"


# Global instance
_face_validator = None


def get_face_validator() -> FaceValidator:
    """Get or create global face validator instance"""
    global _face_validator
    if _face_validator is None:
        _face_validator = FaceValidator()
    return _face_validator


def validate_face_in_image(img: Image.Image, allow_multiple_faces: bool = True) -> Tuple[bool, str]:
    """
    Convenience function to validate face in image
    
    Args:
        img: PIL Image object
        allow_multiple_faces: Whether to allow multiple faces
    
    Returns:
        Tuple of (is_valid, message)
    """
    validator = get_face_validator()
    return validator.validate_image(img, allow_multiple_faces)
