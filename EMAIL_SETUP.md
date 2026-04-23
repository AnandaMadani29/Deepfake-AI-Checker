# Email Setup Guide

This guide explains how to configure email functionality for password reset feature.

## Overview

The application uses SMTP to send password reset emails. You can use Gmail, Outlook, or any other SMTP email service.

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Fact.it Backend"
4. Click **Generate**
5. Copy the 16-character password (you'll use this as `SMTP_PASSWORD`)

### Step 3: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:5173
```

**Important:**
- Use the **App Password**, not your regular Gmail password
- Keep the App Password secret (don't commit to Git)

## Other Email Providers

### Outlook/Hotmail

```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_EMAIL=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### Yahoo Mail

```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_EMAIL=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

### Custom SMTP Server

```env
SMTP_SERVER=smtp.your-domain.com
SMTP_PORT=587
SMTP_EMAIL=noreply@your-domain.com
SMTP_PASSWORD=your-password
```

## Testing

### 1. Start Backend Server

```bash
cd backend
python app.py
```

### 2. Test Forgot Password

1. Go to frontend: `http://localhost:5173`
2. Click "Forgot Password"
3. Enter your email
4. Click "Send Reset Link"
5. Check your email inbox (and spam folder)

### 3. Expected Email

You should receive an email with:
- Subject: "Reset Your Fact.it Password"
- A button to reset password
- A reset link (valid for 1 hour)

## Troubleshooting

### Email Not Received

1. **Check spam/junk folder**
2. **Verify SMTP credentials:**
   ```bash
   # Check if env variables are loaded
   python -c "import os; print(os.getenv('SMTP_EMAIL'))"
   ```

3. **Check backend logs:**
   - Look for "Password reset email sent successfully"
   - Or error messages

4. **Test SMTP connection:**
   ```python
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('your-email@gmail.com', 'your-app-password')
   print("SMTP connection successful!")
   server.quit()
   ```

### Common Errors

#### "Authentication failed"
- **Cause:** Wrong email or password
- **Solution:** Double-check `SMTP_EMAIL` and `SMTP_PASSWORD`
- For Gmail: Make sure you're using App Password, not regular password

#### "Connection refused"
- **Cause:** Wrong SMTP server or port
- **Solution:** Verify `SMTP_SERVER` and `SMTP_PORT`

#### "Email sent but not received"
- **Cause:** Email in spam, or wrong recipient
- **Solution:** Check spam folder, verify email address

## Development Mode

If SMTP is not configured, the backend will:
1. Print a warning: "SMTP credentials not configured"
2. Print the reset token to console
3. You can manually use the token for testing

Example console output:
```
Warning: SMTP credentials not configured. Email not sent.
Reset token for user@example.com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Production Deployment

### Railway

1. Go to your Railway project
2. Click on **Variables** tab
3. Add the following variables:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

### Vercel/Netlify (Frontend)

Update `FRONTEND_URL` to your production URL:
```env
FRONTEND_URL=https://your-app.vercel.app
```

## Security Best Practices

1. ✅ **Never commit `.env` file** to Git
2. ✅ **Use App Passwords** instead of regular passwords
3. ✅ **Use environment variables** for sensitive data
4. ✅ **Enable 2FA** on your email account
5. ✅ **Rotate App Passwords** periodically
6. ✅ **Use HTTPS** in production for `FRONTEND_URL`

## Email Templates

The application sends two types of emails:

### 1. Password Reset Email
- **Subject:** "Reset Your Fact.it Password"
- **Content:** Reset link with 1-hour expiration
- **Template:** `backend/email_service.py` → `send_reset_email()`

### 2. Welcome Email (Optional)
- **Subject:** "Welcome to Fact.it!"
- **Content:** Welcome message for new users
- **Template:** `backend/email_service.py` → `send_welcome_email()`

## Customization

To customize email templates, edit `backend/email_service.py`:

```python
# Change email subject
message["Subject"] = "Your Custom Subject"

# Modify HTML template
html_body = f"""
    <!-- Your custom HTML here -->
"""
```

## Support

If you encounter issues:
1. Check backend logs
2. Verify environment variables
3. Test SMTP connection
4. Check email provider documentation

For Gmail-specific issues, see: [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
