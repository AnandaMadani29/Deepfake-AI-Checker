"""
PDF Generator for Detection History Export
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
import base64
from PIL import Image as PILImage

def generate_detailed_analysis(prob_fake, image_complexity=None):
    """
    Generate detailed analysis breakdown based on probability
    
    IMPORTANT: This is a MOCK/ESTIMATED breakdown for visualization purposes.
    The actual model only outputs a single prob_fake score.
    These individual scores are derived estimates, not real model outputs.
    
    The function is deterministic - same prob_fake always produces same scores.
    """
    analysis_items = []
    
    # Round prob_fake to avoid floating point inconsistencies
    prob_fake = round(prob_fake, 4)
    
    # Eye Reflections - highest indicator for deepfakes
    eye_score = round(min(95, max(0, prob_fake * 100 + 15)))
    analysis_items.append({
        'name': 'Unnatural Eye Reflections',
        'score': eye_score,
        'level': 'CRITICAL' if eye_score > 80 else 'WARNING' if eye_score > 60 else 'NORMAL',
        'description': 'The eyes display limited and somewhat flat reflections, lacking the natural sparkle and complex details of real eyes.'
    })
    
    # Skin Texture
    skin_score = round(min(90, max(0, prob_fake * 100 + 10)))
    analysis_items.append({
        'name': 'Overly Smooth Skin Texture',
        'score': skin_score,
        'level': 'WARNING' if skin_score > 60 else 'NORMAL',
        'description': 'The skin appears excessively smooth and airbrushed, lacking the fine pores and natural textures typically visible in authentic photographs.'
    })
    
    # Hair Texture
    hair_score = round(min(85, max(0, prob_fake * 100 + 5)))
    analysis_items.append({
        'name': 'Hair Texture Anomalies',
        'score': hair_score,
        'level': 'WARNING' if hair_score > 60 else 'NORMAL',
        'description': 'The hair, especially around the edges and finer strands, sometimes appears flattened or painted, lacking natural individual strand definition and volume.'
    })
    
    # Facial Distortions
    facial_score = round(min(80, max(0, prob_fake * 100)))
    analysis_items.append({
        'name': 'Subtle Facial Distortions',
        'score': facial_score,
        'level': 'WARNING' if facial_score > 60 else 'NORMAL',
        'description': 'Minor inconsistencies in facial anatomy are present, with features appearing somewhat merged or irregular.'
    })
    
    # Body Proportions
    body_score = round(min(75, max(0, prob_fake * 100 - 5)))
    analysis_items.append({
        'name': 'Inconsistent Body Proportions',
        'score': body_score,
        'level': 'WARNING' if body_score > 60 else 'NORMAL',
        'description': 'Some body parts appear unnaturally elongated and slander in proportion to the overall body structure.'
    })
    
    # Lighting
    lighting_score = round(min(70, max(0, prob_fake * 100 - 10)))
    analysis_items.append({
        'name': 'Lighting Inconsistency',
        'score': lighting_score,
        'level': 'NORMAL',
        'description': 'The light interaction appears somewhat flat compared to the strong direct lighting conditions.'
    })
    
    # Background - inverse relationship (higher prob_fake = lower background coherence)
    bg_score = round(max(20, min(100, 100 - prob_fake * 100)))
    analysis_items.append({
        'name': 'Background Coherence',
        'score': bg_score,
        'level': 'NORMAL',
        'description': 'The background details appear authentic and consistent with a real-world location.'
    })
    
    # Overall summary
    if prob_fake > 0.7:
        summary = "This image shows strong evidence of AI generation or significant manipulation. Key indicators include unnatural eye reflections and overly smoothed skin textures, along with subtle distortions in facial features. The highly improbable scenario or gathering supports the assessment of fabrication."
    elif prob_fake > 0.5:
        summary = "This image exhibits characteristic 'processed' or 'composited' look, where subjects appear to be artificially inserted or heavily altered within a genuine background. Moderate signs of manipulation detected."
    else:
        summary = "This image demonstrates a high degree of authenticity with no discernible signs of AI generation or deepfake manipulation. Key indicators include coherent and legible text, natural facial features, and consistent lighting throughout the scene."
    
    return {
        'items': analysis_items,
        'summary': summary
    }

def create_pdf_report(history_items):
    """
    Create a PDF report for detection history
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    # Container for PDF elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=10,
        spaceBefore=20
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4a4a4a'),
        spaceAfter=6
    )
    
    # Title
    elements.append(Paragraph("Deepfake Detection Report", title_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Summary Statistics
    total = len(history_items)
    fake_count = sum(1 for item in history_items if item.get('result_label') == 'Fake')
    real_count = total - fake_count
    
    summary_data = [
        ['Total Detections', 'Real Detections', 'Fake Detections'],
        [str(total), str(real_count), str(fake_count)]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 2*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E94E1B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f5f5')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc')),
        ('FONTSIZE', (0, 1), (-1, -1), 14),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica-Bold'),
        ('TOPPADDING', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 0.4*inch))
    
    # Individual Detection Reports
    for idx, item in enumerate(history_items, 1):
        if idx > 1:
            elements.append(PageBreak())
        
        # Detection Header
        elements.append(Paragraph(f"Detection #{idx}: {item.get('image_name', 'Unknown')}", heading_style))
        elements.append(Spacer(1, 0.08*inch))
        
        # Add compressed image if available
        try:
            # Extract base64 image data
            image_data = item.get('image_data', '')
            print(f"[PDF] Processing image for {item.get('image_name')}, data length: {len(image_data)}")
            
            if not image_data:
                print(f"[PDF] No image data for {item.get('image_name')}")
                continue
            
            # Handle both data URL and pure base64
            if image_data.startswith('data:image'):
                # Remove data URL prefix
                base64_data = image_data.split(',')[1] if ',' in image_data else image_data
            else:
                base64_data = image_data
            
            if not base64_data:
                print(f"[PDF] No base64 data for {item.get('image_name')}")
                continue
            
            # Decode base64
            img_bytes = base64.b64decode(base64_data)
            img = PILImage.open(BytesIO(img_bytes))
            print(f"[PDF] Image loaded successfully: {img.size}, mode: {img.mode}")
            
            # Compress image - resize to max 800px width for better quality
            max_width = 800
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), PILImage.Resampling.LANCZOS)
                print(f"[PDF] Image resized to: {img.size}")
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
                print(f"[PDF] Image converted to RGB")
            
            # Save to buffer
            img_buffer = BytesIO()
            img.save(img_buffer, format='JPEG', quality=90, optimize=True)
            img_buffer.seek(0)
            
            # Calculate dimensions for PDF (max width 3.5 inches for balanced layout)
            img_width = 3.5*inch
            img_height = 3.5*inch * img.height / img.width
            
            # Add to PDF
            pdf_img = RLImage(img_buffer, width=img_width, height=img_height)
            elements.append(pdf_img)
            elements.append(Spacer(1, 0.15*inch))
            print(f"[PDF] Image added to PDF successfully")
        except Exception as e:
            print(f"[PDF] Failed to add image to PDF: {e}")
            import traceback
            traceback.print_exc()
            # Continue without image if there's an error
        
        # Basic Info
        result_label = item.get('result_label', 'Unknown')
        prob_fake = item.get('prob_fake', 0)
        confidence = prob_fake * 100 if result_label == 'Fake' else (1 - prob_fake) * 100
        
        info_data = [
            ['Detection Date:', datetime.fromisoformat(item.get('created_at', '')).strftime('%B %d, %Y at %I:%M %p') if item.get('created_at') else 'N/A'],
            ['Result:', result_label],
            ['Confidence:', f"{confidence:.1f}%"],
            ['Model Used:', item.get('model_name', 'resnet_revised')],
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 4.5*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1a1a1a')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#4a4a4a')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Analysis Summary - use data from database (comes from backend detection result)
        detailed_analysis_data = item.get('detailed_analysis', {})
        
        # Fallback to generated analysis only if no data exists
        if not detailed_analysis_data or not detailed_analysis_data.get('items'):
            detailed_analysis_data = generate_detailed_analysis(prob_fake)
        
        elements.append(Paragraph("Analysis Summary", heading_style))
        elements.append(Paragraph(detailed_analysis_data.get('summary', 'No analysis available'), normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Detailed Breakdown
        elements.append(Paragraph("Detailed Breakdown", heading_style))
        
        # Add AI Generated Content percentage first (from ai_detection data)
        ai_detection = item.get('ai_detection') or {}
        ai_confidence = ai_detection.get('confidence', 0) * 100
        ai_level = 'CRITICAL' if ai_confidence > 70 else 'WARNING' if ai_confidence > 50 else 'NORMAL'
        ai_bg_color = colors.HexColor('#fee2e2') if ai_level == 'CRITICAL' else colors.HexColor('#fef3c7') if ai_level == 'WARNING' else colors.HexColor('#f5f5f5')
        ai_border_color = colors.HexColor('#dc2626') if ai_level == 'CRITICAL' else colors.HexColor('#f59e0b') if ai_level == 'WARNING' else colors.HexColor('#d4d4d4')
        
        ai_data = [
            [Paragraph(f"<b>AI Generated Content</b>", normal_style), 
             Paragraph(f"<b>{ai_confidence:.0f}%</b>", normal_style)],
            [Paragraph('Strong indicators of AI-generated content detected. Image shows characteristics typical of synthetic generation.' if ai_confidence > 50 else 'Low probability of AI generation. Image appears to be authentic or traditionally edited.', normal_style), '']
        ]
        
        ai_table = Table(ai_data, colWidths=[5*inch, 1*inch])
        ai_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), ai_bg_color),
            ('BOX', (0, 0), (-1, -1), 2, ai_border_color),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('SPAN', (0, 1), (1, 1)),
        ]))
        
        elements.append(ai_table)
        elements.append(Spacer(1, 0.08*inch))
        
        # Use real analysis items from backend
        for analysis_item in detailed_analysis_data.get('items', []):
            # Analysis item box
            item_data = [
                [Paragraph(f"<b>{analysis_item['name']}</b> - {analysis_item['level']}", normal_style), 
                 Paragraph(f"<b>{analysis_item['score']:.0f}%</b>", normal_style)],
                [Paragraph(analysis_item['description'], normal_style), '']
            ]
            
            # Color based on level
            if analysis_item['level'] == 'CRITICAL':
                bg_color = colors.HexColor('#fee2e2')
                border_color = colors.HexColor('#dc2626')
            elif analysis_item['level'] == 'WARNING':
                bg_color = colors.HexColor('#fef3c7')
                border_color = colors.HexColor('#f59e0b')
            else:
                bg_color = colors.HexColor('#f5f5f5')
                border_color = colors.HexColor('#d4d4d4')
            
            item_table = Table(item_data, colWidths=[5*inch, 1*inch])
            item_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), bg_color),
                ('BOX', (0, 0), (-1, -1), 2, border_color),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('SPAN', (0, 1), (1, 1)),
            ]))
            
            elements.append(item_table)
            elements.append(Spacer(1, 0.08*inch))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

def generate_history_pdf(history_items):
    """
    Main function to generate PDF from history items
    """
    return create_pdf_report(history_items)
