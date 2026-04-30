import sqlite3
import sys
from auth import verify_password

DB_PATH = "users.db"

def check_user(email):
    """Check user details and test password"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, password_hash, full_name FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if not user:
        print(f"❌ User not found: {email}")
        conn.close()
        return
    
    user_id, email, password_hash, full_name = user
    
    print("=" * 60)
    print("USER DETAILS")
    print("=" * 60)
    print(f"ID: {user_id}")
    print(f"Email: {email}")
    print(f"Full Name: {full_name}")
    print(f"Password Hash: {password_hash[:50]}...")
    print("=" * 60)
    
    # Test password
    test_password = input("\nMasukkan password untuk test (atau Enter untuk skip): ").strip()
    
    if test_password:
        if verify_password(test_password, password_hash):
            print("✅ Password BENAR!")
        else:
            print("❌ Password SALAH!")
    
    # Show reset tokens
    cursor.execute("""
        SELECT token, created_at, expires_at, used 
        FROM reset_tokens 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    """, (user_id,))
    
    tokens = cursor.fetchall()
    
    if tokens:
        print("\n" + "=" * 60)
        print("RESET TOKENS (5 terbaru)")
        print("=" * 60)
        for i, (token, created, expires, used) in enumerate(tokens, 1):
            status = "✅ USED" if used else "⏳ UNUSED"
            print(f"{i}. {status}")
            print(f"   Token: {token[:30]}...")
            print(f"   Created: {created}")
            print(f"   Expires: {expires}")
            print()
    
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        email = input("Masukkan email user: ").strip()
    
    if email:
        check_user(email)
    else:
        print("Email tidak boleh kosong!")
