"""
Detection History Management
Handles saving, retrieving, and deleting detection history
"""

import sqlite3
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel


DB_PATH = "users.db"


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
    """Initialize detection_history table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS detection_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            image_name TEXT NOT NULL,
            result_label TEXT NOT NULL,
            prob_fake REAL NOT NULL,
            model_name TEXT NOT NULL,
            model_selection_reason TEXT,
            image_size TEXT,
            complexity_level TEXT,
            image_data TEXT,
            detailed_analysis TEXT,
            explanation TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    
    # Migration: Add new columns if they don't exist
    try:
        cursor.execute("PRAGMA table_info(detection_history)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'detailed_analysis' not in columns:
            cursor.execute("ALTER TABLE detection_history ADD COLUMN detailed_analysis TEXT")
            print("✅ Added column: detailed_analysis")
        
        if 'explanation' not in columns:
            cursor.execute("ALTER TABLE detection_history ADD COLUMN explanation TEXT")
            print("✅ Added column: explanation")
        
        if 'ai_detection' not in columns:
            cursor.execute("ALTER TABLE detection_history ADD COLUMN ai_detection TEXT")
            print("✅ Added column: ai_detection")
    except Exception as e:
        print(f"⚠️  Migration error: {e}")
    
    # Create index for faster queries
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_detection_history_user_id 
        ON detection_history(user_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_detection_history_created_at 
        ON detection_history(created_at DESC)
    """)
    
    conn.commit()
    conn.close()


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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    import json
    
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
    conn.close()
    
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
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            id, user_id, image_name, result_label, prob_fake, model_name,
            model_selection_reason, image_size, complexity_level, image_data,
            detailed_analysis, explanation, ai_detection,
            datetime(created_at, 'localtime') as created_at
        FROM detection_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    """, (user_id, limit, offset))
    
    rows = cursor.fetchall()
    conn.close()
    
    import json
    results = []
    for row in rows:
        row_dict = dict(row)
        # Parse JSON fields
        if row_dict.get('detailed_analysis'):
            try:
                row_dict['detailed_analysis'] = json.loads(row_dict['detailed_analysis'])
            except:
                row_dict['detailed_analysis'] = None
        if row_dict.get('explanation'):
            try:
                row_dict['explanation'] = json.loads(row_dict['explanation'])
            except:
                row_dict['explanation'] = None
        if row_dict.get('ai_detection'):
            try:
                row_dict['ai_detection'] = json.loads(row_dict['ai_detection'])
            except:
                row_dict['ai_detection'] = None
        results.append(row_dict)
    
    return results


def get_history_count(user_id: int) -> int:
    """
    Get total count of detection history for a user
    
    Args:
        user_id: ID of the user
    
    Returns:
        Total count of history records
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) FROM detection_history
        WHERE user_id = ?
    """, (user_id,))
    
    count = cursor.fetchone()[0]
    conn.close()
    
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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Delete only if belongs to user
    cursor.execute("""
        DELETE FROM detection_history
        WHERE id = ? AND user_id = ?
    """, (history_id, user_id))
    
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    
    return deleted


def delete_all_user_history(user_id: int) -> int:
    """
    Delete all history records for a user
    
    Args:
        user_id: ID of the user
    
    Returns:
        Number of records deleted
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        DELETE FROM detection_history
        WHERE user_id = ?
    """, (user_id,))
    
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    return deleted_count


def get_history_stats(user_id: int) -> Dict:
    """
    Get statistics about user's detection history
    
    Args:
        user_id: ID of the user
    
    Returns:
        Dictionary with statistics
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total_detections,
            SUM(CASE WHEN result_label = 'Fake' THEN 1 ELSE 0 END) as fake_count,
            SUM(CASE WHEN result_label = 'Real' THEN 1 ELSE 0 END) as real_count,
            AVG(prob_fake) as avg_fake_probability
        FROM detection_history
        WHERE user_id = ?
    """, (user_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    return {
        "total_detections": row[0] or 0,
        "fake_count": row[1] or 0,
        "real_count": row[2] or 0,
        "avg_fake_probability": round(row[3], 4) if row[3] else 0.0
    }
