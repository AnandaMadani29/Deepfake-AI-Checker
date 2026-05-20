"""
Database connection helper
Supports both SQLite (local) and PostgreSQL (production)
"""
import os
import sqlite3
from typing import Any, Optional
from contextlib import contextmanager

# Check if PostgreSQL URL is available (production)
DATABASE_URL = os.getenv("DATABASE_URL")
USE_POSTGRES = DATABASE_URL is not None

print(f"🔍 DATABASE_URL exists: {USE_POSTGRES}")
if USE_POSTGRES:
    print(f"🔍 DATABASE_URL (masked): {DATABASE_URL[:20]}...{DATABASE_URL[-20:]}")

if USE_POSTGRES:
    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.pool import NullPool
        
        # Fix Railway PostgreSQL URL (postgres:// -> postgresql://)
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
            print("🔧 Fixed DATABASE_URL format (postgres:// -> postgresql://)")
        
        # Create engine with connection pooling
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,  # Disable pooling for serverless
            echo=False
        )
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ PostgreSQL connection test successful")
        
        print("✅ Using PostgreSQL database")
    except ImportError as e:
        print(f"⚠️  PostgreSQL libraries not installed: {e}")
        print("⚠️  Falling back to SQLite")
        USE_POSTGRES = False
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        print("⚠️  Falling back to SQLite")
        USE_POSTGRES = False

# SQLite path for local development
SQLITE_PATH = os.getenv("DATABASE_PATH", "users.db")


@contextmanager
def get_db_connection():
    """
    Get database connection (PostgreSQL or SQLite)
    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users")
    """
    if USE_POSTGRES:
        # PostgreSQL connection
        conn = engine.raw_connection()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    else:
        # SQLite connection
        conn = sqlite3.connect(SQLITE_PATH)
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()


def execute_query(query: str, params: tuple = (), fetch: str = None) -> Any:
    """
    Execute a database query
    
    Args:
        query: SQL query string
        params: Query parameters (tuple)
        fetch: 'one', 'all', or None
        
    Returns:
        Query result or None
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        
        if fetch == 'one':
            return cursor.fetchone()
        elif fetch == 'all':
            return cursor.fetchall()
        else:
            return cursor.lastrowid if cursor.lastrowid else None


def init_database():
    """Initialize database tables (works for both SQLite and PostgreSQL)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Users table
        if USE_POSTGRES:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        
        # Detection history table
        if USE_POSTGRES:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS detection_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    image_name TEXT NOT NULL,
                    result_label VARCHAR(50) NOT NULL,
                    prob_fake REAL NOT NULL,
                    prob_real REAL,
                    model_name VARCHAR(100) NOT NULL,
                    model_selection_reason TEXT,
                    image_size VARCHAR(50),
                    processing_time REAL,
                    detailed_analysis TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS detection_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    image_name TEXT NOT NULL,
                    result_label TEXT NOT NULL,
                    prob_fake REAL NOT NULL,
                    prob_real REAL,
                    model_name TEXT NOT NULL,
                    model_selection_reason TEXT,
                    image_size TEXT,
                    processing_time REAL,
                    detailed_analysis TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        
        # Password reset tokens table
        if USE_POSTGRES:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        
        conn.commit()
        print(f"✅ Database tables initialized ({'PostgreSQL' if USE_POSTGRES else 'SQLite'})")


# Initialize on import
if __name__ != "__main__":
    init_database()
