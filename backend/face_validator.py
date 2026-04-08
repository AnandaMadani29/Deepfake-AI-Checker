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
