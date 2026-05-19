#!/usr/bin/env python3
"""
Test Resend Email Service
Run: python backend/test_resend.py
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

def test_resend_api():
    """Test Resend API with simple email"""
    try:
        import resend
        
        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            print("❌ RESEND_API_KEY not found in .env")
            print("\n📝 Please add to backend/.env:")
            print("RESEND_API_KEY=re_xxxxxxxxx")
            return False
        
        if api_key == "re_xxxxxxxxx":
            print("❌ Please replace 're_xxxxxxxxx' with your real Resend API key!")
            print("\n🔑 Get your API key from: https://resend.com/api-keys")
            return False
        
        # Initialize Resend
        resend.api_key = api_key
        
        # Get test email
        to_email = input("\n📧 Enter your email to test: ").strip()
        if not to_email:
            print("❌ Email cannot be empty!")
            return False
        
        from_email = os.getenv("RESEND_FROM_EMAIL", "Fact.it <onboarding@resend.dev>")
        
        print(f"\n📤 Sending test email to {to_email}...")
        print(f"   From: {from_email}")
        
        # Send test email
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": "🎉 Resend Test - Fact.it",
            "html": """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #FF4B25;">🎉 Success!</h1>
                <p>Congrats on sending your <strong>first email</strong> with Resend!</p>
                <p>Your Fact.it email service is now configured correctly.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is a test email from Fact.it - Deepfake Detection System
                </p>
            </div>
            """
        }
        
        response = resend.Emails.send(params)
        
        print("\n✅ Email sent successfully!")
        print(f"   Email ID: {response.get('id')}")
        print(f"\n📬 Check your inbox: {to_email}")
        print("   (Also check spam folder just in case)")
        
        return True
        
    except ImportError:
        print("❌ Resend library not installed!")
        print("\n📦 Install with: pip3 install resend")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n🔍 Troubleshooting:")
        print("1. Check your API key is correct")
        print("2. Verify API key has 'Sending access' permission")
        print("3. Check Resend dashboard: https://resend.com/emails")
        return False


def test_reset_email():
    """Test password reset email"""
    try:
        from backend.email_service_resend import send_reset_email_resend
        
        to_email = input("\n📧 Enter email to test reset password: ").strip()
        if not to_email:
            print("❌ Email cannot be empty!")
            return False
        
        # Generate fake token for testing
        test_token = "test_token_123abc456def"
        
        print(f"\n📤 Sending password reset email to {to_email}...")
        
        success = send_reset_email_resend(
            to_email=to_email,
            reset_token=test_token,
            user_name="Test User"
        )
        
        if success:
            print("\n✅ Password reset email sent successfully!")
            print(f"📬 Check your inbox: {to_email}")
        else:
            print("\n❌ Failed to send password reset email")
            print("   Check logs above for details")
        
        return success
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\n📦 Make sure resend is installed: pip3 install resend")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Resend Email Service Test")
    print("=" * 60)
    
    print("\n[1] Test simple email (Hello World)")
    print("[2] Test password reset email (with template)")
    
    choice = input("\nSelect test (1 or 2): ").strip()
    
    if choice == "1":
        test_resend_api()
    elif choice == "2":
        test_reset_email()
    else:
        print("❌ Invalid choice!")
        sys.exit(1)
