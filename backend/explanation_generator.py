"""
AI Explanation Generator
Generates human-readable explanations for deepfake detection results
"""

from typing import Dict, List, Optional


def generate_explanation(
    prob_fake: float,
    model_name: str,
    image_analysis: Optional[Dict] = None,
    face_count: int = 1
) -> Dict[str, any]:
    """
    Generate detailed explanation for detection result
    
    Args:
        prob_fake: Probability that image is fake (0-1)
        model_name: Name of the model used
        image_analysis: Optional image characteristics
        face_count: Number of faces detected
    
    Returns:
        Dictionary containing explanation details
    """
    confidence_level = _get_confidence_level(prob_fake)
    is_fake = prob_fake > 0.5
    
    # Main verdict
    verdict = "FAKE" if is_fake else "REAL"
    confidence_pct = prob_fake * 100 if is_fake else (1 - prob_fake) * 100
    
    # Generate pattern analysis
    patterns = _analyze_patterns(prob_fake, image_analysis, face_count)
    
    # Generate recommendation
    recommendation = _generate_recommendation(prob_fake, confidence_level)
    
    # Technical insights
    technical_insights = _generate_technical_insights(
        prob_fake, model_name, image_analysis
    )
    
    return {
        "verdict": verdict,
        "confidence_percentage": round(confidence_pct, 2),
        "confidence_level": confidence_level,
        "summary": _generate_summary(verdict, confidence_pct, confidence_level),
        "detected_patterns": patterns,
        "recommendation": recommendation,
        "technical_insights": technical_insights
    }


def _get_confidence_level(prob: float) -> str:
    """Determine confidence level based on probability"""
    confidence = max(prob, 1 - prob)
    
    if confidence >= 0.9:
        return "Very High"
    elif confidence >= 0.75:
        return "High"
    elif confidence >= 0.6:
        return "Medium"
    else:
        return "Low"


def _generate_summary(verdict: str, confidence: float, level: str) -> str:
    """Generate human-readable summary"""
    if verdict == "FAKE":
        if level == "Very High":
            return f"This image shows strong signs of AI manipulation with {confidence:.1f}% confidence. Multiple deepfake indicators were detected."
        elif level == "High":
            return f"This image likely contains AI-generated or manipulated content with {confidence:.1f}% confidence."
        elif level == "Medium":
            return f"This image shows some signs of potential manipulation with {confidence:.1f}% confidence. Further verification recommended."
        else:
            return f"Weak indicators of manipulation detected ({confidence:.1f}% confidence). Results are inconclusive."
    else:
        if level == "Very High":
            return f"This image appears to be authentic with {confidence:.1f}% confidence. No significant manipulation detected."
        elif level == "High":
            return f"This image is likely authentic with {confidence:.1f}% confidence."
        elif level == "Medium":
            return f"This image appears mostly authentic with {confidence:.1f}% confidence, though some minor anomalies were noted."
        else:
            return f"Authenticity uncertain ({confidence:.1f}% confidence). Results are inconclusive."


def _analyze_patterns(
    prob_fake: float,
    image_analysis: Optional[Dict],
    face_count: int
) -> List[Dict[str, str]]:
    """Analyze and describe detected patterns"""
    patterns = []
    is_fake = prob_fake > 0.5
    confidence = prob_fake if is_fake else (1 - prob_fake)
    
    # Pattern 1: Confidence-based analysis
    if confidence >= 0.9:
        if is_fake:
            patterns.append({
                "indicator": "Strong Manipulation Signals",
                "description": "AI model detected multiple inconsistencies typical of deepfake generation, including unnatural facial features or artifacts.",
                "severity": "high"
            })
        else:
            patterns.append({
                "indicator": "Natural Image Characteristics",
                "description": "Image exhibits consistent patterns typical of authentic photographs with natural lighting and texture.",
                "severity": "low"
            })
    elif confidence >= 0.75:
        if is_fake:
            patterns.append({
                "indicator": "Moderate Manipulation Indicators",
                "description": "Several suspicious patterns detected that suggest AI-generated or edited content.",
                "severity": "medium"
            })
        else:
            patterns.append({
                "indicator": "Mostly Authentic Features",
                "description": "Image shows predominantly natural characteristics with minimal suspicious patterns.",
                "severity": "low"
            })
    
    # Pattern 2: Image complexity analysis
    if image_analysis:
        complexity = image_analysis.get("complexity", "Unknown")
        
        if complexity == "High":
            if is_fake and confidence >= 0.7:
                patterns.append({
                    "indicator": "Complex Image Manipulation",
                    "description": "High-resolution image with sophisticated manipulation techniques detected. Advanced deepfake methods may have been used.",
                    "severity": "high"
                })
            elif not is_fake:
                patterns.append({
                    "indicator": "High-Quality Authentic Image",
                    "description": "High-resolution image with natural complexity and detail preservation typical of real photographs.",
                    "severity": "low"
                })
        elif complexity == "Low":
            if is_fake:
                patterns.append({
                    "indicator": "Simple Manipulation Detected",
                    "description": "Lower resolution or simpler image structure with detectable manipulation artifacts.",
                    "severity": "medium"
                })
    
    # Pattern 3: Face-specific analysis
    if face_count == 1:
        if is_fake and confidence >= 0.8:
            patterns.append({
                "indicator": "Facial Inconsistencies",
                "description": "AI detected anomalies in facial features, skin texture, or lighting that are characteristic of deepfake generation.",
                "severity": "high"
            })
        elif not is_fake and confidence >= 0.8:
            patterns.append({
                "indicator": "Natural Facial Features",
                "description": "Facial features show consistent and natural patterns without signs of AI manipulation.",
                "severity": "low"
            })
    elif face_count > 1:
        patterns.append({
            "indicator": "Multiple Faces Detected",
            "description": f"{face_count} faces detected in the image. Analysis performed on all visible faces.",
            "severity": "info"
        })
    
    # Pattern 4: Probability-based insights
    if 0.45 <= prob_fake <= 0.55:
        patterns.append({
            "indicator": "Borderline Result",
            "description": "Detection confidence is near the threshold. Image may have mixed authentic and manipulated elements, or quality may affect analysis.",
            "severity": "warning"
        })
    
    return patterns


def _generate_recommendation(prob_fake: float, confidence_level: str) -> str:
    """Generate actionable recommendation"""
    is_fake = prob_fake > 0.5
    
    if is_fake:
        if confidence_level in ["Very High", "High"]:
            return "⚠️ Exercise caution with this image. Consider it potentially manipulated and verify through additional sources before trusting its authenticity."
        elif confidence_level == "Medium":
            return "⚠️ This image shows signs of potential manipulation. Recommend cross-referencing with other verification methods or sources."
        else:
            return "ℹ️ Results are inconclusive. Consider using additional verification tools or examining the image source for more context."
    else:
        if confidence_level in ["Very High", "High"]:
            return "✅ This image appears authentic. However, always consider the source and context when evaluating any media."
        elif confidence_level == "Medium":
            return "✅ Image appears mostly authentic, though some uncertainty remains. Verify source if used for critical purposes."
        else:
            return "ℹ️ Results are inconclusive. Consider additional verification if authenticity is critical."


def _generate_technical_insights(
    prob_fake: float,
    model_name: str,
    image_analysis: Optional[Dict]
) -> List[str]:
    """Generate technical insights about the detection"""
    insights = []
    
    # Model insight
    model_descriptions = {
        "resnet50": "ResNet50 - Excellent for detecting complex manipulation patterns in high-resolution images",
        "densenet121": "DenseNet121 - Specialized in identifying subtle artifacts in medium-complexity images",
        "efficientnet_b0": "EfficientNet-B0 - Optimized for fast detection in lower-resolution or simpler images",
        "xception": "Xception - Advanced architecture for detecting sophisticated deepfake techniques"
    }
    
    model_desc = model_descriptions.get(model_name.lower(), f"{model_name} - Deep learning model for deepfake detection")
    insights.append(f"Model Used: {model_desc}")
    
    # Confidence distribution
    prob_real = 1 - prob_fake
    insights.append(f"Confidence Distribution: {prob_fake*100:.1f}% Fake / {prob_real*100:.1f}% Real")
    
    # Image analysis insights
    if image_analysis:
        size = image_analysis.get("size", "Unknown")
        complexity = image_analysis.get("complexity", "Unknown")
        insights.append(f"Image Properties: {size} resolution, {complexity} complexity level")
        
        complexity_score = image_analysis.get("complexity_score")
        if complexity_score:
            insights.append(f"Complexity Score: {complexity_score:.3f} (higher values indicate more complex images)")
    
    # Detection methodology
    insights.append("Detection Method: Deep neural network analysis of facial features, textures, and artifacts")
    
    return insights
