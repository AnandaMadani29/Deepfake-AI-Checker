# 🚨 QUICK FIX - Google Login & Forgot Password

## Masalah yang Ditemukan:

### ❌ Issue 1: Google Login Tidak Berfungsi
**Root Cause:** `GOOGLE_CLIENT_ID` tidak ada di `backend/.env`

### ❌ Issue 2: Forgot Password Email Tidak Terkirim  
**Root Cause:** Email sudah dikonfigurasi dengan benar ✅, tapi mungkin ada masalah lain.

---

## 🔧 SOLUSI CEPAT

### Step 1: Tambahkan GOOGLE_CLIENT_ID ke backend/.env

Buka file `backend/.env` dan tambahkan baris ini:

```bash
# Cari nilai VITE_GOOGLE_CLIENT_ID yang sudah ada
# Copy nilai yang sama ke GOOGLE_CLIENT_ID

# Contoh:
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

**PENTING:** Kedua variable harus punya nilai yang **SAMA PERSIS**.

### Step 2: Tambahkan SECRET_KEY ke backend/.env

Generate secret key baru:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy output dan tambahkan ke `backend/.env`:

```bash
SECRET_KEY=output-dari-command-diatas
```

### Step 3: Restart Backend

```bash
cd backend
source venv/bin/activate
uvicorn app:app --reload
```

---

## 📧 Test Forgot Password Email

### Option 1: Test via Script

Buat file `backend/test_email.py`:

```python
import os
from dotenv import load_dotenv
from email_service import send_reset_email

load_dotenv()

print("Testing email configuration...")
print(f"SMTP_EMAIL: {os.getenv('SMTP_EMAIL')}")
print(f"SMTP_SERVER: {os.getenv('SMTP_SERVER')}")
print(f"SMTP_PORT: {os.getenv('SMTP_PORT')}")
print(f"FRONTEND_URL: {os.getenv('FRONTEND_URL')}")
print()

# Test send email - GANTI dengan email Anda!
test_email = "your-email@gmail.com"  # ← GANTI INI!

try:
    result = send_reset_email(
        to_email=test_email,
        reset_token="test-token-123456",
        user_name="Test User"
    )
    if result:
        print("✅ Email sent successfully!")
        print(f"Check inbox: {test_email}")
    else:
        print("❌ Email failed to send")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
```

Run test:

```bash
cd backend
source venv/bin/activate
python test_email.py
```

### Option 2: Test via API

```bash
# Test forgot password endpoint
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-registered-email@gmail.com"}'
```

---

## ✅ Verification Checklist

### Google Login:
- [ ] `GOOGLE_CLIENT_ID` ada di `backend/.env`
- [ ] `VITE_GOOGLE_CLIENT_ID` ada di `backend/.env` dan `frontend/.env`
- [ ] Nilai kedua variable sama persis
- [ ] Backend sudah di-restart
- [ ] Buka http://localhost:5173 → Login → Click "Continue with Google"
- [ ] Berhasil login dengan Google account

### Forgot Password:
- [ ] `SMTP_EMAIL` ada di `backend/.env` ✅
- [ ] `SMTP_PASSWORD` ada di `backend/.env` ✅ 
- [ ] `FRONTEND_URL` ada di `backend/.env` ✅
- [ ] Backend sudah di-restart
- [ ] Test script berhasil kirim email
- [ ] Buka http://localhost:5173 → Login → "Forgot password?"
- [ ] Email diterima (cek spam folder juga!)

---

## 🐛 Common Issues

### Google Login Error: "GOOGLE_CLIENT_ID is not configured"
**Fix:** Tambahkan `GOOGLE_CLIENT_ID` ke `backend/.env`

### Google Login Error: "Invalid Google token"
**Fix:** Pastikan Client ID di backend dan frontend sama persis

### Email Error: "Authentication failed"
**Fix:** 
1. Pastikan menggunakan Gmail App Password (bukan password biasa)
2. Cek 2-Step Verification sudah enabled
3. Generate App Password baru di: https://myaccount.google.com/apppasswords

### Email tidak diterima
**Fix:**
1. Cek spam folder
2. Pastikan email address benar
3. Run test script untuk lihat error detail
4. Cek backend logs

---

## 📝 Current Status

Berdasarkan pengecekan:

✅ **SMTP_EMAIL** - Configured  
✅ **SMTP_PASSWORD** - Configured  
✅ **FRONTEND_URL** - Configured  
✅ **VITE_GOOGLE_CLIENT_ID** - Configured  
✅ **VITE_API_BASE_URL** - Configured  

❌ **GOOGLE_CLIENT_ID** - NOT SET (perlu ditambahkan!)  
❌ **SECRET_KEY** - NOT SET (perlu ditambahkan!)  

---

## 🚀 Next Steps

1. **Tambahkan missing variables** (GOOGLE_CLIENT_ID & SECRET_KEY)
2. **Restart backend**
3. **Test Google Login**
4. **Test Forgot Password**
5. **Jika masih error, lihat TROUBLESHOOTING.md untuk detail**

---

## Need Help?

Jika masih ada masalah setelah mengikuti langkah di atas:

1. Cek backend terminal untuk error messages
2. Cek browser console (F12) untuk frontend errors
3. Run test_email.py untuk detail error
4. Baca TROUBLESHOOTING.md untuk solusi lengkap
