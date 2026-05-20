"""
Detection History Management
Handles saving, retrieving, and deleting detection history
Now with full PostgreSQL support via database.py
"""

import os
import json
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel

# Import database helper
from backend.database import get_db_connection


class DetectionHistoryCreate(BaseModel):
    """Schema for creating detection history"""
    image_name: str
    result_label: str
    prob_fake: float
    model_name: str
    model_selection_reason: Optional[str] = None
    image_size: Optional[str] = None
    complexity_level: Optional[str] = None
    image_data: Optional[str] = None
    detailed_analysis: Optional[dict] = None
    explanation: Optional[dict] = None
    ai_detection: Optional[dict] = None


class DetectionHistory(BaseModel):
    """Schema for detection history response"""
    id: int
    user_id: int
    image_name: str
    result_label: str
    prob_fake: float
    model_name: str
    model_selection_reason: Optional[str] = None
    image_size: Optional[str] = None
    complexity_level: Optional[str] = None
    image_data: Optional[str] = None
    detailed_analysis: Optional[dict] = None
    explanation: Optional[dict] = None
    ai_detection: Optional[dict] = None
    created_at: str


def init_history_table():
    """Initialize detection_history table - deprecated, kept for compatibility"""
    print("ℹ️  init_history_table() called - tables already initialized by database.py")
    pass


def save_detection_history(
    user_id: int,
    detection_data: DetectionHistoryCreate
) -> int:
    """
    Save detection result to history
    
    Args:
        user_id: ID of the user
        detection_data: Detection result data
    
    Returns:
        ID of created history record
    """
    print(f"🔍 Saving detection history for user {user_id}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if PostgreSQL or SQLite
        is_postgres = hasattr(conn, 'server_version')
        
        if is_postgres:
            # PostgreSQL query
            cursor.execute("""
                INSERT INTO detection_history (
                    user_id, image_name, result_label, prob_fake, model_name,
                    model_selection_reason, image_size, complexity_level, image_data,
                    detailed_analysis, explanation, ai_detection
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id,
                detection_data.image_name,
                detection_data.result_label,
                detection_data.prob_fake,
                detection_data.model_name,
                detection_data.model_selection_reason,
                detection_data.image_size,
                detection_data.complexity_level,
                detection_data.image_data,
                json.dumps(detection_data.detailed_analysis) if detection_data.detailed_analysis else None,
                json.dumps(detection_data.explanation) if detection_data.explanation else None,
                json.dumps(detection_data.ai_detection) if detection_data.ai_detection else None
            ))
            history_id = cursor.fetchone()[0]
        else:
            # SQLite query
            cursor.execute("""
                INSERT INTO detection_history (
                    user_id, image_name, result_label, prob_fake, model_name,
                    model_selection_reason, image_size, complexity_level, image_data,
                    detailed_analysis, explanation, ai_detection
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                detection_data.image_name,
                detection_data.result_label,
                detection_data.prob_fake,
                detection_data.model_name,
                detection_data.model_selection_reason,
                detection_data.image_size,
                detection_data.complexity_level,
                detection_data.image_data,
                json.dumps(detection_data.detailed_analysis) if detection_data.detailed_analysis else None,
                json.dumps(detection_data.explanation) if detection_data.explanation else None,
                json.dumps(detection_data.ai_detection) if detection_data.ai_detection else None
            ))
            history_id = cursor.lastrowid
        
        conn.commit()
        print(f"✅ Detection history saved with ID: {history_id}")
    
    return history_id


def get_user_history(
    user_id: int,
    limit: int = 50,
    offset: int = 0
) -> List[Dict]:
    """
    Get detection history for a user
    
    Args:
        user_id: ID of the user
        limit: Maximum number of records to return
        offset: Number of records to skip
    
    Returns:
        List of detection history records
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if PostgreSQL or SQLite
        is_postgres = hasattr(conn, 'server_version')
        placeholder = '%s' if is_postgres else '?'
        
        cursor.execute(f"""
            SELECT 
                id, user_id, image_name, result_label, prob_fake, model_name,
                model_selection_reason, image_size, complexity_level, image_data,
                detailed_analysis, explanation, ai_detection, created_at
            FROM detection_history
            WHERE user_id = {placeholder}
            ORDER BY created_at DESC
            LIMIT {placeholder} OFFSET {placeholder}
        """, (user_id, limit, offset))
        
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        results = []
        for row in rows:
            record = dict(zip(columns, row))
            
            # Parse JSON fields
            if record.get('detailed_analysis'):
                try:
                    record['detailed_analysis'] = json.loads(record['detailed_analysis'])
                except:
                    pass
            
            if record.get('explanation'):
                try:
                    record['explanation'] = json.loads(record['explanation'])
                except:
                    pass
            
            if record.get('ai_detection'):
                try:
                    record['ai_detection'] = json.loads(record['ai_detection'])
                except:
                    pass
            
            # Convert datetime to string
            if record.get('created_at'):
                if isinstance(record['created_at'], datetime):
                    record['created_at'] = record['created_at'].isoformat()
                else:
                    record['created_at'] = str(record['created_at'])
            
            results.append(record)
        
        return results


def get_history_count(user_id: int) -> int:
    """
    Get total count of history records for a user
    
    Args:
        user_id: ID of the user
    
    Returns:
        Total count of history records
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if PostgreSQL or SQLite
        is_postgres = hasattr(conn, 'server_version')
        placeholder = '%s' if is_postgres else '?'
        
        cursor.execute(f"""
            SELECT COUNT(*) FROM detection_history
            WHERE user_id = {placeholder}
        """, (user_id,))
        
        count = cursor.fetchone()[0]
        return count


def delete_history_record(history_id: int, user_id: int) -> bool:
    """
    Delete a specific history record
    
    Args:
        history_id: ID of the history record
        user_id: ID of the user (for authorization)
    
    Returns:
        True if deleted, False if not found or unauthorized
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if PostgreSQL or SQLite
        is_postgres = hasattr(conn, 'server_version')
        placeholder = '%s' if is_postgres else '?'
        
        # Delete only if belongs to user
        cursor.execute(f"""
            DELETE FROM detection_history
            WHERE id = {placeholder} AND user_id = {placeholder}
        """, (history_id, user_id))
        
        conn.commit()
        
        # Check if any row was deleted
        deleted = cursor.rowcount > 0
        return deleted


def delete_all_user_history(user_id: int) -> int:
    """
    Delete all history records for a user
    
    Args:
        user_id: ID of the user
    
    Returns:
        Number of records deleted
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if PostgreSQL or SQLite
        is_postgres = hasattr(conn, 'server_version')
        placeholder = '%s' if is_postgres else '?'
        
        cursor.execute(f"""
            DELETE FROM detection_history
            WHERE user_id = {placeholder}
        """, (user_id,))
        
        conn.commit()
        
        deleted_count = cursor.rowcount
        return deleted_count


def get_history_stats(user_id: int) -> Dict:
    """
    Get statistics about user's detection history
    
    Args:
        user_id: ID of the user
    
    Returns:
        Dictionary with statistics
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if PostgreSQL or SQLite
        is_postgres = hasattr(conn, 'server_version')
        placeholder = '%s' if is_postgres else '?'
        
        cursor.execute(f"""
            SELECT 
                COUNT(*) as total_scans,
                SUM(CASE WHEN result_label = 'Fake' THEN 1 ELSE 0 END) as fake_detected,
                SUM(CASE WHEN result_label = 'Real' THEN 1 ELSE 0 END) as real_detected
            FROM detection_history
            WHERE user_id = {placeholder}
        """, (user_id,))
        
        row = cursor.fetchone()
        
        return {
            'total_scans': row[0] or 0,
            'fake_detected': row[1] or 0,
            'real_detected': row[2] or 0
        }
