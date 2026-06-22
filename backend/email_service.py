import os
import json
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

try:
    import requests as _requests
    _HAS_REQUESTS = True
except ImportError:
    _HAS_REQUESTS = False

# Load environment variables from backend/.env file
backend_dir = Path(__file__).parent
dotenv_path = backend_dir / '.env'
load_dotenv(dotenv_path)


def _send_via_resend(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via Resend API"""
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        return False

    payload = {
        "from": "Fact.it <onboarding@resend.dev>",
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        if _HAS_REQUESTS:
            resp = _requests.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=10)
            print(f"Resend API response: {resp.status_code}")
            return resp.status_code in (200, 201)
        else:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request("https://api.resend.com/emails", data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"Resend API response: {resp.status}")
                return resp.status in (200, 201)
    except Exception as e:
        print(f"Resend API error: {e}")
        return False


def send_reset_email(to_email: str, reset_token: str, user_name: str = "User") -> bool:
    """
    Send password reset email with token
    
    Args:
        to_email: Recipient email address
        reset_token: Password reset token
        user_name: User's full name
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Create reset link
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                border: 1px solid #e0e0e0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 32px;
                font-weight: 700;
                color: #FF5733;
                font-family: Georgia, serif;
                letter-spacing: 1px;
            }}
            .content {{
                background-color: white;
                padding: 25px;
                border-radius: 6px;
                margin-bottom: 20px;
            }}
            .button {{
                display: inline-block;
                background-color: #FF5733;
                color: white !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
            }}
            .button:hover {{
                background-color: #d43e0f;
            }}
            .token-box {{
                background-color: #f5f5f5;
                border: 1px dashed #ccc;
                padding: 15px;
                border-radius: 4px;
                font-family: monospace;
                word-break: break-all;
                margin: 15px 0;
                font-size: 12px;
            }}
            .footer {{
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
            }}
            .warning {{
                color: #d32f2f;
                font-weight: 600;
                margin-top: 15px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Fact.it</div>
            </div>
            
            <div class="content">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                
                <p><strong>Hi,</strong> {user_name}</p>
                
                <p>We received a request to reset your password for your Fact.it account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <div class="token-box">{reset_link}</div>
                
                <p class="warning">⚠️ This link will expire in 1 hour.</p>
                
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated email from Fact.it - Deepfake Detection System</p>
                <p>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    result = _send_via_resend(to_email, "Reset Your Fact.it Password", html_body)
    if result:
        print(f"Password reset email sent successfully to {to_email}")
    else:
        print(f"Failed to send email to {to_email}")
        print(f"Reset token (for development): {reset_token}")
    return result


def send_welcome_email(to_email: str, user_name: str) -> bool:
    """
    Send welcome email to new users
    
    Args:
        to_email: Recipient email address
        user_name: User's full name
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                border: 1px solid #e0e0e0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 32px;
                font-weight: 700;
                color: #FF5733;
                font-family: Georgia, serif;
                letter-spacing: 1px;
            }}
            .content {{
                background-color: white;
                padding: 25px;
                border-radius: 6px;
            }}
            .button {{
                display: inline-block;
                background-color: #FF5733;
                color: white !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Fact.it</div>
            </div>
            
            <div class="content">
                <h2 style="color: #333; margin-top: 0;">Welcome to Fact.it!</h2>
                
                <p><strong>Hi,</strong> {user_name}</p>
                
                <p>Thank you for joining Fact.it - your trusted deepfake detection system.</p>
                
                <p>You can now start detecting deepfake images and protecting yourself from misinformation.</p>
                
                <div style="text-align: center;">
                    <a href="{frontend_url}" class="button">Get Started</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return _send_via_resend(to_email, "Welcome to Fact.it!", html_body)
