# 🚀 First Time Setup Guide

Panduan lengkap untuk setup project Fact.it dari awal untuk pertama kali.

---

## 📋 Prerequisites

Pastikan sudah terinstall:
- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

---

## 🔽 Step 1: Clone Repository

```bash
git clone https://github.com/AnandaMadani29/Deepfake-AI-Checker.git
cd Deepfake-AI-Checker
```

---

## 🐍 Step 2: Setup Backend

### 2.1 Install Python Dependencies

```bash
# Install dependencies
pip install -r requirements.txt
```

### 2.2 Setup Environment Variables

```bash
# Copy template .env
cp backend/.env.example backend/.env
```

### 2.3 Edit `backend/.env`

Buka file `backend/.env` dan isi dengan konfigurasi Anda:

```env
# Security
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Google OAuth (Optional - untuk Google Login)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# CORS - Frontend URL
CORS_ORIGINS=http://localhost:5173

# Email Configuration (untuk Forgot Password)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:5173

# Environment
ENVIRONMENT=development
PORT=8000
```

**⚠️ Penting:**
- Ganti `SECRET_KEY` dengan string random minimal 32 karakter
- Untuk email, ikuti panduan di [EMAIL_SETUP.md](EMAIL_SETUP.md)

### 2.4 Download Model Weights

```bash
# Download pre-trained model weights
cd backend
python download_weights.py
cd ..
```

---

## 🎨 Step 3: Setup Frontend

### 3.1 Install Node Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3.2 Setup Frontend Environment Variables

```bash
# Copy template .env
cp frontend/.env.example frontend/.env
```

### 3.3 Edit `frontend/.env`

Buka file `frontend/.env` dan isi:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8000

# Google OAuth Client ID (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

## 🚀 Step 4: Run Application

### 4.1 Start Backend Server

**⚠️ PENTING: Jalankan dari ROOT directory, BUKAN dari folder backend!**

```bash
# Pastikan Anda di root directory
cd /path/to/Deepfake-AI-Checker

# Start backend
python3 backend/app.py
```

**Expected Output:**
```
[CONFIG] Model  : resnet_curated_dataset
[CONFIG] Device : cpu
✅ Database initialized successfully
✅ Model loaded: resnet_curated_dataset
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Backend berjalan di:** `http://localhost:8000`

### 4.2 Start Frontend Server

**Buka terminal baru**, lalu:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend berjalan di:** `http://localhost:5173`

---

## ✅ Step 5: Verify Setup

### 5.1 Test Backend API

Buka browser: `http://localhost:8000/docs`

Anda akan lihat **Swagger UI** dengan semua API endpoints.

### 5.2 Test Frontend

Buka browser: `http://localhost:5173`

Anda akan lihat **Homepage Fact.it**.

### 5.3 Test Registration

1. Click **Register**
2. Isi form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Register**
4. Jika berhasil, Anda akan redirect ke Home page

### 5.4 Test Detection

1. Login dengan akun yang baru dibuat
2. Click **Try Detection**
3. Upload gambar (JPG/PNG)
4. Click **Analyze Image**
5. Tunggu hasil deteksi

---

## 📧 Step 6: Setup Email (Optional tapi Recommended)

Untuk fitur **Forgot Password**, Anda perlu setup email SMTP.

### Quick Setup dengan Gmail:

1. **Enable 2-Factor Authentication:**
   - Buka: [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable **2-Step Verification**

2. **Generate App Password:**
   - Buka: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select app: **Mail**
   - Select device: **Other** → ketik "Fact.it"
   - Click **Generate**
   - Copy password 16 karakter

3. **Update `backend/.env`:**
   ```env
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   ```
   ⚠️ **Hapus semua spasi** di password!

4. **Restart Backend:**
   ```bash
   # Stop backend (Ctrl+C)
   # Start lagi
   python3 backend/app.py
   ```

5. **Test Forgot Password:**
   - Buka frontend
   - Click **Forgot Password**
   - Masukkan email Anda
   - Cek inbox (atau spam folder!)

**Panduan lengkap:** [EMAIL_SETUP.md](EMAIL_SETUP.md)

---

## 🔧 Troubleshooting

### Backend Error: "ModuleNotFoundError: No module named 'src'"

**Penyebab:** Backend dijalankan dari folder yang salah.

**Solusi:** Jalankan dari ROOT directory:
```bash
cd /path/to/Deepfake-AI-Checker
python3 backend/app.py
```

### Backend Error: "address already in use"

**Penyebab:** Backend sudah running di port 8000.

**Solusi:** Stop backend lama:
```bash
# Mac/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend Error: "Failed to fetch"

**Penyebab:** Backend tidak running atau CORS issue.

**Solusi:**
1. Pastikan backend running di `http://localhost:8000`
2. Cek `backend/.env` → `CORS_ORIGINS=http://localhost:5173`
3. Restart backend

### Email Tidak Terkirim

**Penyebab:** SMTP credentials salah atau ada spasi di password.

**Solusi:**
1. Cek `backend/.env` → pastikan tidak ada spasi di `SMTP_PASSWORD`
2. Pastikan menggunakan **App Password**, bukan password Gmail biasa
3. Restart backend
4. Cek spam folder

### Model Loading Error

**Penyebab:** Model weights belum di-download.

**Solusi:**
```bash
cd backend
python download_weights.py
cd ..
```

---

## 📁 Project Structure

```
Deepfake-AI-Checker/
├── backend/                 # Backend API (FastAPI)
│   ├── app.py              # Main application
│   ├── auth.py             # Authentication logic
│   ├── email_service.py    # Email sending
│   ├── .env                # Backend config (JANGAN COMMIT!)
│   └── ...
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── Home.jsx       # Homepage
│   │   ├── Detection.jsx  # Detection page
│   │   └── ...
│   ├── .env               # Frontend config (JANGAN COMMIT!)
│   └── package.json
├── src/                   # ML Model code
│   ├── model.py          # Model architecture
│   ├── config.py         # Model config
│   └── ...
├── outputs/              # Model weights & results
│   └── models/
│       └── resnet_curated_dataset.pth
├── users.db             # SQLite database (auto-created)
├── requirements.txt     # Python dependencies
└── README.md           # Project documentation
```

---

## 🎯 Next Steps

Setelah setup berhasil:

1. **Explore API:**
   - Buka: `http://localhost:8000/docs`
   - Test semua endpoints

2. **Test All Features:**
   - ✅ Registration & Login
   - ✅ Google OAuth (jika sudah setup)
   - ✅ Image Detection
   - ✅ History
   - ✅ Forgot Password

3. **Read Documentation:**
   - [API.md](API.md) - API documentation
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment guide
   - [EMAIL_SETUP.md](EMAIL_SETUP.md) - Email setup guide

4. **Deploy to Production:**
   - Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Deploy backend to Railway
   - Deploy frontend to Vercel/Netlify

---

## 🆘 Need Help?

- **Issues:** [GitHub Issues](https://github.com/AnandaMadani29/Deepfake-AI-Checker/issues)
- **Documentation:** Check other `.md` files in project root
- **Email Setup:** [EMAIL_SETUP.md](EMAIL_SETUP.md)

---

## ✅ Setup Checklist

- [ ] Clone repository
- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Install Node dependencies (`cd frontend && npm install`)
- [ ] Setup `backend/.env` (SECRET_KEY, CORS_ORIGINS)
- [ ] Setup `frontend/.env` (VITE_API_BASE_URL)
- [ ] Download model weights (`python backend/download_weights.py`)
- [ ] Start backend (`python3 backend/app.py`)
- [ ] Start frontend (`cd frontend && npm run dev`)
- [ ] Test registration & login
- [ ] Test image detection
- [ ] Setup email SMTP (optional)
- [ ] Test forgot password

---

**🎉 Selamat! Setup selesai. Happy coding!**
