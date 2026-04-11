"""
Metadata Analysis Module
Analyzes image metadata for manipulation signs
"""

import io
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from typing import Dict, List, Tuple, Optional
import datetime


class MetadataAnalyzer:
    """Analyze image metadata for signs of manipulation"""
    
    def __init__(self):
        # Software that commonly indicates editing/generation
        self.suspicious_software = [
            'photoshop', 'gimp', 'paint.net', 'affinity',
            'midjourney', 'dall-e', 'dalle', 'stable diffusion',
            'ai', 'generated', 'synthetic', 'deepfake',
            'faceswap', 'deepfacelab', 'faceapp'
        ]
        
        # AI generation indicators
        self.ai_indicators = [
            'midjourney', 'dall-e', 'dalle', 'stable diffusion',
            'stablediffusion', 'ai generated', 'artificial intelligence',
            'neural', 'gan', 'diffusion'
        ]
    
    def analyze(self, img_bytes: bytes) -> Tuple[bool, float, Dict]:
        """
        Analyze image metadata
        
        Args:
            img_bytes: Image file bytes
            
        Returns:
            (is_suspicious, suspicion_score, details)
        """
        try:
            img = Image.open(io.BytesIO(img_bytes))
            
            # Extract EXIF data
            exif_data = self._extract_exif(img)
            
            # Analyze for suspicious signs
            suspicious_signs = []
            suspicion_score = 0.0
            
            # 1. Check if EXIF exists
            if not exif_data or len(exif_data) == 0:
                suspicious_signs.append("No EXIF data (possibly stripped)")
                suspicion_score += 0.3
            
            # 2. Check for editing software
            software_info = exif_data.get('Software', '')
            if software_info:
                software_lower = str(software_info).lower()
                
                # Check for AI generation
                for indicator in self.ai_indicators:
                    if indicator in software_lower:
                        suspicious_signs.append(f"AI-generated indicator: {software_info}")
                        suspicion_score += 0.8
                        break
                
                # Check for editing software
                for editor in self.suspicious_software:
                    if editor in software_lower:
                        suspicious_signs.append(f"Edited with: {software_info}")
                        suspicion_score += 0.4
                        break
            
            # 3. Check for missing camera info (real photos usually have this)
            has_camera_info = any(key in exif_data for key in ['Make', 'Model', 'LensModel'])
            if not has_camera_info and exif_data:
                suspicious_signs.append("No camera information")
                suspicion_score += 0.2
            
            # 4. Check for suspicious date/time
            date_suspicious, date_msg = self._check_date_consistency(exif_data)
            if date_suspicious:
                suspicious_signs.append(date_msg)
                suspicion_score += 0.2
            
            # 5. Check image format and compression
            format_suspicious, format_msg = self._check_format(img)
            if format_suspicious:
                suspicious_signs.append(format_msg)
                suspicion_score += 0.1
            
            # Cap suspicion score at 1.0
            suspicion_score = min(1.0, suspicion_score)
            
            details = {
                "has_exif": len(exif_data) > 0,
                "exif_fields": list(exif_data.keys()),
                "suspicious_signs": suspicious_signs,
                "software": software_info if software_info else None,
                "camera": exif_data.get('Make', '') + ' ' + exif_data.get('Model', '') if has_camera_info else None,
                "suspicion_score": round(suspicion_score, 3)
            }
            
            is_suspicious = bool(suspicion_score > 0.5)
            
            return is_suspicious, float(suspicion_score), details
            
        except Exception as e:
            # If we can't read metadata, that's slightly suspicious
            return False, 0.1, {
                "error": str(e),
                "has_exif": False,
                "suspicious_signs": ["Could not read metadata"]
            }
    
    def _extract_exif(self, img: Image.Image) -> Dict:
        """Extract EXIF data from image"""
        exif_data = {}
        
        try:
            exif = img._getexif()
            
            if exif is not None:
                for tag_id, value in exif.items():
                    tag = TAGS.get(tag_id, tag_id)
                    
                    # Convert bytes to string
                    if isinstance(value, bytes):
                        try:
                            value = value.decode('utf-8', errors='ignore')
                        except:
                            value = str(value)
                    
                    exif_data[tag] = value
        except:
            pass
        
        return exif_data
    
    def _check_date_consistency(self, exif_data: Dict) -> Tuple[bool, str]:
        """Check if dates in EXIF are consistent and reasonable"""
        try:
            # Get various date fields
            datetime_original = exif_data.get('DateTimeOriginal')
            datetime_digitized = exif_data.get('DateTimeDigitized')
            datetime_modified = exif_data.get('DateTime')
            
            if not any([datetime_original, datetime_digitized, datetime_modified]):
                return False, ""
            
            # Parse dates
            dates = []
            for date_str in [datetime_original, datetime_digitized, datetime_modified]:
                if date_str:
                    try:
                        # Format: "2024:01:15 10:30:45"
                        date_obj = datetime.datetime.strptime(str(date_str), "%Y:%m:%d %H:%M:%S")
                        dates.append(date_obj)
                    except:
                        pass
            
            if len(dates) == 0:
                return False, ""
            
            # Check if dates are in the future
            now = datetime.datetime.now()
            for date in dates:
                if date > now:
                    return True, f"Future date in EXIF: {date}"
            
            # Check if dates are too old (before digital cameras)
            min_date = datetime.datetime(1990, 1, 1)
            for date in dates:
                if date < min_date:
                    return True, f"Suspiciously old date: {date}"
            
            # Check if modification date is before creation date
            if datetime_original and datetime_modified:
                try:
                    orig = datetime.datetime.strptime(str(datetime_original), "%Y:%m:%d %H:%M:%S")
                    mod = datetime.datetime.strptime(str(datetime_modified), "%Y:%m:%d %H:%M:%S")
                    if mod < orig:
                        return True, "Modification date before creation date"
                except:
                    pass
            
        except Exception:
            pass
        
        return False, ""
    
    def _check_format(self, img: Image.Image) -> Tuple[bool, str]:
        """Check image format for suspicious patterns"""
        format_name = img.format
        
        # PNG is common for AI-generated images (lossless)
        if format_name == 'PNG':
            # Check if it's a screenshot or generated image
            # Real photos are usually JPEG
            return False, ""  # Not necessarily suspicious
        
        # Check for very high quality JPEG (unusual for real photos)
        if format_name == 'JPEG':
            try:
                # Get quality estimate from quantization tables
                if hasattr(img, 'quantization'):
                    # Very high quality can indicate generated/edited
                    pass
            except:
                pass
        
        return False, ""


# Global instance
_analyzer = None

def get_metadata_analyzer() -> MetadataAnalyzer:
    """Get global metadata analyzer instance"""
    global _analyzer
    if _analyzer is None:
        _analyzer = MetadataAnalyzer()
    return _analyzer
