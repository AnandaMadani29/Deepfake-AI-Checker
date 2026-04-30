# Troubleshooting Guide - FACT.IT

## Issue 1: Google Login Not Working ❌

### Problem
Google Login button tidak berfungsi atau menampilkan error.

### Root Cause
Backend memerlukan `GOOGLE_CLIENT_ID` untuk verify Google ID token, tapi variable ini tidak ada di `.env` file.

### Solution

#### Step 1: Tambahkan GOOGLE_CLIENT_ID ke backend/.env

Buka file `backend/.env` dan pastikan ada **DUA** variable:

```env
# Backend - untuk verify token
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# Frontend - untuk render Google button
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

**PENTING**: Kedua variable harus menggunakan **Client ID yang sama**.

#### Step 2: Dapatkan Google OAuth Client ID

Jika belum punya, ikuti langkah berikut:

1. **Buka Google Cloud Console**
   - Go to: https://console.cloud.google.com/

2. **Create/Select Project**
   - Pilih project yang sudah ada atau buat baru
   - Nama project: "Fact.it" atau sesuai keinginan

3. **Enable Google+ API**
   - Navigation Menu → APIs & Services → Library
   - Cari "Google+ API"
   - Klik "Enable"

4. **Create OAuth 2.0 Credentials**
   - Navigation Menu → APIs & Services → Credentials
   - Klik "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "Fact.it Web Client"

5. **Configure Authorized Origins & Redirect URIs**
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:8000
   https://your-frontend-domain.vercel.app
   https://your-backend-domain.railway.app
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:5173
   http://localhost:5173/
   https://your-frontend-domain.vercel.app
   https://your-frontend-domain.vercel.app/
   ```

6. **Copy Client ID**
   - Setelah create, akan muncul popup dengan Client ID
   - Copy Client ID (format: `xxxxx.apps.googleusercontent.com`)
   - Paste ke kedua variable di `.env`

#### Step 3: Update Frontend Environment Variable

Buat file `frontend/.env` jika belum ada:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8000
```

#### Step 4: Restart Backend & Frontend

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # atau venv\Scripts\activate di Windows
uvicorn app:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Step 5: Test Google Login

1. Buka browser: http://localhost:5173
2. Klik "Log in"
3. Klik tombol "Continue with Google"
4. Pilih akun Google
5. Seharusnya berhasil login

### Common Errors & Solutions

**Error: "GOOGLE_CLIENT_ID is not configured"**
- Solution: Tambahkan `GOOGLE_CLIENT_ID` ke `backend/.env`

**Error: "Invalid Google token"**
- Solution: Pastikan Client ID di backend dan frontend sama
- Cek apakah domain sudah ditambahkan di Authorized Origins

**Error: "popup_closed_by_user"**
- Solution: Normal, user menutup popup. Coba lagi.

**Error: "idpiframe_initialization_failed"**
- Solution: Cek apakah domain sudah ditambahkan di Google Console
- Clear browser cookies/cache

---

## Issue 2: Forgot Password Email Not Sending ❌

### Problem
User klik "Forgot Password" tapi email tidak terkirim.

### Root Cause
SMTP configuration belum benar atau Gmail App Password belum dibuat.

### Solution

#### Step 1: Generate Gmail App Password

**PENTING**: Jangan gunakan password Gmail biasa! Harus App Password.

1. **Buka Google Account Settings**
   - Go to: https://myaccount.google.com/

2. **Enable 2-Step Verification** (jika belum)
   - Security → 2-Step Verification
   - Follow the steps to enable

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Atau: Security → 2-Step Verification → App passwords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Name: "Fact.it Backend"
   - Klik "Generate"
   - **COPY** 16-digit password yang muncul (format: xxxx xxxx xxxx xxxx)

#### Step 2: Update backend/.env

```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App Password dari step 1 (bisa dengan atau tanpa spasi)
FRONTEND_URL=http://localhost:5173  # atau domain production
```

**PENTING**: 
- `SMTP_EMAIL` harus email Gmail yang sama dengan yang generate App Password
- `SMTP_PASSWORD` adalah App Password (16 digit), bukan password Gmail biasa
- `FRONTEND_URL` digunakan untuk link reset password di email

#### Step 3: Test Email Service

Buat file test sederhana `backend/test_email.py`:

```python
import os
from dotenv import load_dotenv
from email_service import send_reset_email

load_dotenv()

# Test send email
try:
    send_reset_email(
        to_email="test@example.com",  # Ganti dengan email Anda
        reset_token="test-token-123",
        user_name="Test User"
    )
    print("✅ Email sent successfully!")
except Exception as e:
    print(f"❌ Error: {e}")
```

Run test:
```bash
cd backend
source venv/bin/activate
python test_email.py
```

#### Step 4: Restart Backend

```bash
cd backend
source venv/bin/activate
uvicorn app:app --reload
```

#### Step 5: Test Forgot Password Flow

1. Buka browser: http://localhost:5173
2. Klik "Log in" → "Forgot password?"
3. Masukkan email yang terdaftar
4. Klik "Send Reset Link"
5. Cek inbox email (dan spam folder!)
6. Klik link di email
7. Reset password

### Common Errors & Solutions

**Error: "Authentication failed"**
- Solution: Pastikan menggunakan App Password, bukan password Gmail biasa
- Pastikan 2-Step Verification sudah enabled

**Error: "SMTP connection failed"**
- Solution: Cek firewall/antivirus yang mungkin block port 587
- Coba gunakan port 465 dengan SSL:
  ```env
  SMTP_PORT=465
  ```
  Dan update `email_service.py`:
  ```python
  server = smtplib.SMTP_SSL(smtp_server, smtp_port)
  ```

**Error: "Email not received"**
- Solution: 
  - Cek spam folder
  - Cek apakah email address benar
  - Cek backend logs untuk error
  - Verify SMTP_EMAIL sama dengan email yang generate App Password

**Error: "FRONTEND_URL not set"**
- Solution: Tambahkan `FRONTEND_URL` ke `backend/.env`

---

## Quick Checklist ✅

### Google Login
- [ ] `GOOGLE_CLIENT_ID` ada di `backend/.env`
- [ ] `VITE_GOOGLE_CLIENT_ID` ada di `backend/.env` dan `frontend/.env`
- [ ] Kedua variable menggunakan Client ID yang sama
- [ ] Domain sudah ditambahkan di Google Cloud Console
- [ ] Backend dan frontend sudah di-restart

### Forgot Password Email
- [ ] 2-Step Verification enabled di Google Account
- [ ] App Password sudah di-generate
- [ ] `SMTP_EMAIL` di `.env` sama dengan email yang generate App Password
- [ ] `SMTP_PASSWORD` di `.env` adalah App Password (16 digit)
- [ ] `FRONTEND_URL` di `.env` sudah benar
- [ ] Backend sudah di-restart
- [ ] Email test berhasil terkirim

---

## Still Having Issues?

### Check Backend Logs

```bash
cd backend
source venv/bin/activate
uvicorn app:app --reload --log-level debug
```

Perhatikan error messages yang muncul saat:
- Google login attempt
- Forgot password request

### Check Browser Console

1. Buka browser DevTools (F12)
2. Go to Console tab
3. Perhatikan error messages saat:
   - Klik Google login button
   - Submit forgot password form

### Common Issues

**Backend not running:**
```bash
# Check if backend is running
curl http://localhost:8000/health
```

**Frontend not connecting to backend:**
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check CORS settings in `backend/app.py`

**Database issues:**
```bash
# Check if database exists
ls backend/*.db

# If not, backend will create it on first run
```

---

## Production Deployment

### Railway (Backend)

Add environment variables in Railway dashboard:
- `GOOGLE_CLIENT_ID`
- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_EMAIL`
- `SMTP_PASSWORD`
- `FRONTEND_URL` (your Vercel URL)
- `SECRET_KEY`
- `CORS_ORIGINS`

### Vercel (Frontend)

Add environment variables in Vercel dashboard:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_BASE_URL` (your Railway URL)

### Update Google Cloud Console

Add production domains to:
- Authorized JavaScript origins
- Authorized redirect URIs

---

## Need More Help?

1. Check backend logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Make sure all services are running
5. Test each component individually (Google login, email sending)

Good luck! 🚀
