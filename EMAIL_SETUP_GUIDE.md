# 📧 Email Setup Guide - Fact.it

Panduan lengkap untuk setup email service di aplikasi Deepfake AI Checker.

---

## 🚨 **Masalah: Email Masuk Spam**

Jika email reset password masuk ke folder spam, ini karena:
- Gmail menganggap email sebagai "unsolicited mail"
- Domain reputation rendah
- Tidak ada SPF/DKIM/DMARC authentication

**Solusi:** Gunakan Email Service Provider (ESP) profesional.

---

## ✅ **Solusi 1: Resend (RECOMMENDED)**

### **Keunggulan:**
- ✅ Setup paling mudah
- ✅ 3,000 emails/bulan gratis
- ✅ Deliverability rate 99%+
- ✅ Modern API & Dashboard

### **Step-by-Step Setup:**

#### **1. Daftar Resend**
1. Buka: https://resend.com/signup
2. Daftar dengan email Anda
3. Verify email

#### **2. Verify Domain (Optional tapi Recommended)**
```bash
# Di Resend Dashboard → Domains → Add Domain
# Tambahkan domain Anda (contoh: factit.app)
# Tambahkan DNS records yang diberikan Resend ke domain provider Anda
```

**Atau gunakan Resend's shared domain:**
- Tidak perlu verify domain
- Email akan dikirim dari `@resend.dev`
- Cocok untuk testing & development

#### **3. Generate API Key**
```bash
# Di Resend Dashboard → API Keys → Create API Key
# Name: Fact.it Production
# Permission: Sending access
# COPY API Key (hanya muncul 1x!)
```

#### **4. Update Backend `.env`**
```bash
# Edit: backend/.env

# Resend Configuration
RESEND_API_KEY=re_123abc456def789  # ← API Key dari step 3
RESEND_FROM_EMAIL=Fact.it <noreply@factit.app>  # ← Ganti dengan domain Anda

# Atau jika pakai shared domain:
RESEND_FROM_EMAIL=Fact.it <noreply@resend.dev>
```

#### **5. Update `backend/auth.py`**
```python
# Ganti import di bagian atas file:
# from backend.email_service import send_reset_email
from backend.email_service_resend import send_reset_email_resend as send_reset_email
```

#### **6. Install Dependencies**
```bash
cd backend
pip install resend==0.8.0
```

#### **7. Test Email**
```bash
cd backend
python test_email.py
```

#### **8. Deploy ke Production**
```bash
# Railway/Render Dashboard → Environment Variables
RESEND_API_KEY=re_123abc456def789
RESEND_FROM_EMAIL=Fact.it <noreply@factit.app>

# Commit & push
git add .
git commit -m "Add Resend email service"
git push origin main
```

---

## 📊 **Solusi 2: SendGrid**

### **Keunggulan:**
- ✅ 100 emails/hari gratis
- ✅ Trusted by big companies
- ✅ Advanced analytics

### **Setup:**
1. Daftar: https://sendgrid.com/
2. Verify Sender Identity (email atau domain)
3. Generate API Key
4. Update `.env`:
```bash
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=SG.your-api-key-here
```

---

## 📮 **Solusi 3: Mailgun**

### **Keunggulan:**
- ✅ 5,000 emails/bulan gratis (3 bulan pertama)
- ✅ Powerful API
- ✅ Email validation

### **Setup:**
1. Daftar: https://mailgun.com/
2. Verify domain
3. Get SMTP credentials
4. Update `.env`:
```bash
SMTP_SERVER=smtp.mailgun.org
SMTP_PORT=587
SMTP_EMAIL=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

---

## 🔧 **Solusi 4: Gmail SMTP (Temporary)**

**⚠️ Tidak recommended untuk production!**

### **Setup:**
1. Enable 2-Step Verification di Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # 16-digit App Password
```

### **Limitations:**
- ❌ Sering masuk spam
- ❌ Rate limit ketat (500 emails/hari)
- ❌ Bisa di-block kapan saja
- ❌ Tidak cocok untuk production

---

## 📝 **Testing**

### **Test di Local:**
```bash
cd backend
python test_email.py
# Masukkan email Anda
# Cek inbox & spam folder
```

### **Test di Production:**
```bash
# Buka aplikasi production
# Klik "Forgot Password"
# Masukkan email
# Cek inbox (seharusnya TIDAK masuk spam!)
```

---

## 🎯 **Recommendation Summary**

| ESP | Free Tier | Setup | Deliverability | Recommended For |
|-----|-----------|-------|----------------|-----------------|
| **Resend** | 3,000/mo | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ Excellent | **Production** ✅ |
| **SendGrid** | 100/day | ⭐⭐⭐⭐ Medium | ⭐⭐⭐⭐ Very Good | Production |
| **Mailgun** | 5,000/mo* | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Very Good | Production |
| **Gmail** | 500/day | ⭐⭐⭐⭐⭐ Easy | ⭐⭐ Poor | Development only |

*3 bulan pertama

---

## 🆘 **Troubleshooting**

### **Email tidak terkirim:**
```bash
# Cek logs:
railway logs  # atau
render logs

# Cek environment variables:
echo $RESEND_API_KEY
```

### **Email masih masuk spam:**
1. Verify domain di ESP
2. Setup SPF/DKIM/DMARC records
3. Warm up email (kirim bertahap)
4. Improve email content (less spammy)

### **API Key invalid:**
1. Regenerate API Key di dashboard
2. Update environment variables
3. Restart service

---

## 📚 **Resources**

- **Resend Docs**: https://resend.com/docs
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Mailgun Docs**: https://documentation.mailgun.com/
- **Gmail App Password**: https://support.google.com/accounts/answer/185833

---

**Need help?** Contact: factit.support@gmail.com
