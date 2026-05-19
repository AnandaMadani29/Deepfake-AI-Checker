# 🚀 Resend Quick Start Guide

Setup Resend email service dalam 5 menit!

---

## ✅ **Step 1: Get Resend API Key**

1. **Daftar/Login**: https://resend.com/
2. **Dashboard** → **API Keys** → **Create API Key**
3. **Copy** API Key (format: `re_xxxxxxxxx`)

---

## ✅ **Step 2: Update `backend/.env`**

Edit file `backend/.env` dan tambahkan:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxx  # ← GANTI dengan API Key Anda!
RESEND_FROM_EMAIL=Fact.it <onboarding@resend.dev>
```

**⚠️ PENTING:** Ganti `re_xxxxxxxxx` dengan API Key asli Anda!

---

## ✅ **Step 3: Test Email**

```bash
# Test simple email
python3 backend/test_resend.py
# Pilih [1] → Masukkan email Anda

# Test password reset email
python3 backend/test_resend.py
# Pilih [2] → Masukkan email Anda
```

---

## ✅ **Step 4: Verify**

1. **Cek inbox** email Anda
2. **Jika tidak ada**, cek spam folder
3. **Jika masih tidak ada**, cek Resend dashboard: https://resend.com/emails

---

## 🎯 **Production Deployment**

### **Railway:**
```bash
# Dashboard → Variables → Add Variable
RESEND_API_KEY=re_your_real_api_key
RESEND_FROM_EMAIL=Fact.it <onboarding@resend.dev>
```

### **Render:**
```bash
# Dashboard → Environment → Add Environment Variable
RESEND_API_KEY=re_your_real_api_key
RESEND_FROM_EMAIL=Fact.it <onboarding@resend.dev>
```

### **Vercel:**
```bash
# Dashboard → Settings → Environment Variables
RESEND_API_KEY=re_your_real_api_key
RESEND_FROM_EMAIL=Fact.it <onboarding@resend.dev>
```

---

## 🔧 **Troubleshooting**

### **"RESEND_API_KEY not found"**
```bash
# Pastikan .env ada di backend/.env
ls backend/.env

# Pastikan API key sudah di-set
cat backend/.env | grep RESEND_API_KEY
```

### **"Invalid API key"**
1. Regenerate API key di Resend dashboard
2. Pastikan copy full key (termasuk `re_` prefix)
3. Pastikan tidak ada spasi di awal/akhir

### **Email tidak terkirim**
1. Cek Resend dashboard → Emails
2. Cek logs untuk error message
3. Verify API key permission: "Sending access"

---

## 📚 **Resources**

- **Resend Dashboard**: https://resend.com/
- **API Keys**: https://resend.com/api-keys
- **Email Logs**: https://resend.com/emails
- **Documentation**: https://resend.com/docs

---

## ✨ **What's Next?**

Setelah email berhasil terkirim:

1. ✅ Commit changes: `git add . && git commit -m "Setup Resend email service"`
2. ✅ Push ke production: `git push origin main`
3. ✅ Set environment variables di platform deployment
4. ✅ Test forgot password di production

---

**Need help?** Contact: factit.support@gmail.com
