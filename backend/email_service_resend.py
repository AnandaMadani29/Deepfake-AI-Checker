"""
Email service using Resend API (recommended for production)
Install: pip install resend
"""
import os
import resend
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
dotenv_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path)

# Initialize Resend
resend.api_key = os.getenv("RESEND_API_KEY")


def send_reset_email_resend(to_email: str, reset_token: str, user_name: str = "User") -> bool:
    """
    Send password reset email using Resend API
    
    Args:
        to_email: Recipient email address
        reset_token: Password reset token
        user_name: User's full name
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    sender_email = os.getenv("RESEND_FROM_EMAIL", "Fact.it <noreply@factit.app>")
    
    if not resend.api_key:
        print("Warning: RESEND_API_KEY not configured. Email not sent.")
        print(f"Reset token for {to_email}: {reset_token}")
        return False
    
    # Create reset link
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # HTML email body
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
                font-weight: bold;
                color: #FF4B25;
            }}
            .content {{
                background-color: white;
                padding: 30px;
                border-radius: 6px;
            }}
            .button {{
                display: inline-block;
                padding: 14px 28px;
                background-color: #FF4B25;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .button:hover {{
                background-color: #E94E1B;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #666;
            }}
            .warning {{
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                padding: 12px;
                border-radius: 4px;
                margin: 20px 0;
                color: #856404;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">FACT.IT</div>
                <p style="color: #666; margin-top: 10px;">Deepfake Detection System</p>
            </div>
            
            <div class="content">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                
                <p>Hi {user_name},</p>
                
                <p>We received a request to reset your password for your Fact.it account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #FF4B25; font-size: 12px;">{reset_link}</p>
                
                <div class="warning">
                    <strong>⚠️ This link will expire in 1 hour.</strong>
                </div>
                
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
    
    # Plain text version
    text_body = f"""
    Reset Your Password
    
    Hi {user_name},
    
    We received a request to reset your password for your Fact.it account.
    
    Click this link to reset your password:
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    ---
    Fact.it - Deepfake Detection System
    """
    
    # Send email using Resend
    try:
        params = {
            "from": sender_email,
            "to": [to_email],
            "subject": "Reset Your Fact.it Password",
            "html": html_body,
            "text": text_body,
        }
        
        email = resend.Emails.send(params)
        print(f"Password reset email sent successfully to {to_email}")
        print(f"Email ID: {email.get('id')}")
        return True
        
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        print(f"Reset token (for development): {reset_token}")
        return False
