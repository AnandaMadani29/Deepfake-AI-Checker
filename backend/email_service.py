import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env file
backend_dir = Path(__file__).parent
dotenv_path = backend_dir / '.env'
load_dotenv(dotenv_path)


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
    
    # Email configuration from environment variables
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Check if email credentials are configured
    if not sender_email or not sender_password:
        print("Warning: SMTP credentials not configured. Email not sent.")
        print(f"Reset token for {to_email}: {reset_token}")
        return False
    
    # Create reset link
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Create email message
    message = MIMEMultipart("alternative")
    message["Subject"] = "Reset Your Fact.it Password"
    message["From"] = f"Fact.it <{sender_email}>"
    message["To"] = to_email
    
    # Email body (HTML)
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
    
    # Plain text version (fallback)
    text_body = f"""
    Reset Your Fact.it Password
    
    Hi {user_name},
    
    We received a request to reset your password for your Fact.it account.
    
    Click this link to reset your password:
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    ---
    Fact.it - Deepfake Detection System
    """
    
    # Attach both HTML and plain text versions
    part1 = MIMEText(text_body, "plain")
    part2 = MIMEText(html_body, "html")
    message.attach(part1)
    message.attach(part2)
    
    # Send email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
        
        print(f"Password reset email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        print(f"Reset token (for development): {reset_token}")
        return False


def send_welcome_email(to_email: str, user_name: str) -> bool:
    """
    Send welcome email to new users
    
    Args:
        to_email: Recipient email address
        user_name: User's full name
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    if not sender_email or not sender_password:
        return False
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to Fact.it!"
    message["From"] = f"Fact.it <{sender_email}>"
    message["To"] = to_email
    
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
    
    part = MIMEText(html_body, "html")
    message.attach(part)
    
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Failed to send welcome email: {str(e)}")
        return False
