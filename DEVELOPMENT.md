# Development Guide - Deepfake AI Checker

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Running Backend](#running-backend)
- [Running Frontend](#running-frontend)
- [Changing the Model](#changing-the-model)
- [Auto-Reload Features](#auto-reload-features)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### First Time Setup

**1. Clone and navigate to project:**
```bash
cd /Users/adindamadani/Downloads/Deepfake\ AI\ Checker
```

**2. Install Backend Dependencies:**
```bash
pip install -r requirements.txt
```

**3. Install Frontend Dependencies:**
```bash
cd frontend
npm install
cd ..
```

---

## 🔧 Running Backend

### Method 1: Using Python directly (Recommended for Development)

**⚠️ IMPORTANT: Run from project ROOT directory, NOT from backend folder**

```bash
# Navigate to project root FIRST
cd /Users/adindamadani/Downloads/Deepfake\ AI\ Checker

# Then run
PYTHONPATH=$(pwd) python3 backend/app.py
```

**Backend will start on:** `http://0.0.0.0:8000`

### Method 2: Using uvicorn directly

```bash
# Navigate to backend folder
cd /Users/adindamadani/Downloads/Deepfake\ AI\ Checker/backend

# Run with auto-reload
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**⚠️ Common Mistake:**
```bash
# ❌ DON'T DO THIS - double path error!
cd backend
PYTHONPATH=/Users/adindamadani/Downloads/Deepfake\ AI\ Checker python3 backend/app.py
# Error: can't open file '.../backend/backend/app.py'
```

### ✅ Auto-Reload Backend: **YES**

**Backend SUDAH support auto-reload!** 

Jika menggunakan `uvicorn` dengan flag `--reload`:
- ✅ Setiap perubahan di file `.py` akan **otomatis reload server**
- ✅ Tidak perlu restart manual
- ✅ Hot reload untuk development

**Di `backend/app.py` line 665-675:**
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # ✅ AUTO-RELOAD ENABLED
    )
```

**Cara kerja:**
1. Edit file Python (misal: `app.py`, `auth.py`, `history.py`)
2. Save file (Cmd+S / Ctrl+S)
3. Uvicorn akan detect perubahan
4. Server otomatis restart dalam 1-2 detik
5. Refresh browser untuk lihat perubahan

---

## 🎨 Running Frontend

### Start Development Server

```bash
cd frontend
npm run dev
```

**Frontend will start on:** `http://localhost:5173`

### ✅ Auto-Reload Frontend: **YES**

**Frontend SUDAH support Hot Module Replacement (HMR)!**

Menggunakan **Vite** yang memiliki HMR super cepat:
- ✅ Setiap perubahan di file `.jsx`, `.css` akan **instant reload**
- ✅ Tidak perlu refresh browser (HMR)
- ✅ State preservation (React Fast Refresh)
- ✅ Perubahan terlihat dalam **< 1 detik**

**Cara kerja:**
1. Edit file React (misal: `Login.jsx`, `Detection.jsx`)
2. Save file (Cmd+S / Ctrl+S)
3. Vite HMR akan inject perubahan
4. Browser otomatis update **tanpa full reload**
5. React state tetap preserved

**Konfigurasi di `vite.config.js`:**
```javascript
export default defineConfig({
  plugins: [react()], // ✅ React Fast Refresh enabled
  server: {
    port: 5173,
    hmr: true // ✅ HMR enabled by default
  }
})
```

---

## 🤖 Changing the Model

### Current Model Configuration

**File:** `backend/app.py` (lines 1-20)

```python
# Model Configuration
MODEL_NAME = "resnet_revised"  # ← Change this to use different model
MODEL_PATH = f"outputs/models/{MODEL_NAME}.pth"
BATCH_SIZE = 32
LEARNING_RATE = 0.0005
EPOCHS = 40
```

### Available Models

**1. ResNet Revised (Current - Default)**
```python
MODEL_NAME = "resnet_revised"
```
- Architecture: ResNet-based with custom layers
- Parameters: ~24M
- Best for: General deepfake detection
- Accuracy: High

**2. EfficientNet**
```python
MODEL_NAME = "efficientnet"
```
- Architecture: EfficientNet-B0 based
- Parameters: ~5M
- Best for: Faster inference, mobile deployment
- Accuracy: Good

**3. Vision Transformer (ViT)**
```python
MODEL_NAME = "vit"
```
- Architecture: Vision Transformer
- Parameters: ~86M
- Best for: State-of-the-art accuracy
- Accuracy: Highest (but slower)

### Steps to Change Model

**1. Edit `backend/app.py`:**
```python
# Line 5-6
MODEL_NAME = "efficientnet"  # Change from "resnet_revised"
MODEL_PATH = f"outputs/models/{MODEL_NAME}.pth"
```

**2. Ensure model weights exist:**
```bash
# Check if model file exists
ls -lh outputs/models/efficientnet.pth
```

**3. If model weights don't exist, train or download:**
```bash
# Option A: Train new model
python backend/train.py --model efficientnet

# Option B: Download pre-trained weights (if available)
# Place .pth file in outputs/models/
```

**4. Restart backend:**
```bash
# Backend will auto-reload if using --reload flag
# Or manually restart:
PYTHONPATH=/Users/adindamadani/Downloads/Deepfake\ AI\ Checker python3 backend/app.py
```

**5. Verify model loaded:**
Check terminal output:
```
[MODEL] efficientnet (~5M) | Trainable: 5,288,548 / 5,288,548 | Frozen: False
✅ Model loaded: efficientnet
```

### Model Architecture Files

**Location:** `backend/src/models/`

Available architectures:
- `resnet_revised.py` - ResNet-based model
- `efficientnet.py` - EfficientNet-based model
- `vit.py` - Vision Transformer model

**To add custom model:**
1. Create new file in `backend/src/models/your_model.py`
2. Implement model class
3. Update `MODEL_NAME` in `app.py`
4. Train or load weights

---

## 🔄 Auto-Reload Features Summary

### Backend Auto-Reload ✅

| Feature | Status | Details |
|---------|--------|---------|
| **Python files** | ✅ YES | Uvicorn `--reload` flag |
| **Reload speed** | ~1-2 seconds | Automatic detection |
| **Manual restart needed?** | ❌ NO | Auto-reload on save |
| **State preservation** | ❌ NO | Server restarts fully |

**Files that trigger reload:**
- `backend/app.py`
- `backend/auth.py`
- `backend/history.py`
- `backend/pdf_generator.py`
- `backend/src/**/*.py`

**Files that DON'T trigger reload:**
- `.env` files (need manual restart)
- `users.db` (database changes)
- Model weights `.pth` files

### Frontend Auto-Reload ✅

| Feature | Status | Details |
|---------|--------|---------|
| **React components** | ✅ YES | Vite HMR |
| **CSS files** | ✅ YES | Instant injection |
| **Reload speed** | < 1 second | No full page reload |
| **Manual refresh needed?** | ❌ NO | HMR handles it |
| **State preservation** | ✅ YES | React Fast Refresh |

**Files that trigger HMR:**
- `frontend/src/**/*.jsx`
- `frontend/src/**/*.css`
- `frontend/index.html` (full reload)

**Files that need manual refresh:**
- `.env` files (restart dev server)
- `vite.config.js` (restart dev server)
- `package.json` (restart dev server)

---

## ⚙️ Environment Configuration

### Backend Environment Variables

**File:** `backend/.env`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
DEFAULT_API_BASE=http://localhost:8000

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Secret (Required for auth)
SECRET_KEY=your-secret-key-here

# Model Configuration (Optional)
MODEL_NAME=resnet_revised
```

### Frontend Environment Variables

**File:** `frontend/.env`

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=251301674853-h6phlbld0qoh6gchk0smtkt93qa21v0t.apps.googleusercontent.com
```

**⚠️ Important:** 
- Frontend env vars MUST start with `VITE_`
- Changes to `.env` require **restart** (not auto-reload)
- Never commit `.env` files to git

---

## 🐛 Troubleshooting

### Backend Issues

**1. ModuleNotFoundError: No module named 'src'**
```bash
# Solution: Set PYTHONPATH
PYTHONPATH=/Users/adindamadani/Downloads/Deepfake\ AI\ Checker python3 backend/app.py
```

**2. Model weights not found**
```bash
# Check if model file exists
ls outputs/models/resnet_revised.pth

# If missing, download or train model
python backend/train.py
```

**3. Database error: no such column**
```bash
# Migration runs automatically on startup
# If issues persist, delete database and restart:
rm users.db backend/users.db
python3 backend/app.py
```

**4. Port 8000 already in use**
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app:app --port 8001
```

### Frontend Issues

**1. Google Sign-In not working**
```bash
# Check if Client ID is set
cat frontend/.env | grep VITE_GOOGLE_CLIENT_ID

# Restart dev server after adding .env
cd frontend
npm run dev
```

**2. API connection failed**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check VITE_API_BASE_URL in .env
cat frontend/.env
```

**3. Animations not showing**
```bash
# Verify animations.css is imported
cat frontend/src/main.jsx | grep animations.css

# Should see: import './animations.css'
```

**4. Port 5173 already in use**
```bash
# Vite will auto-increment to 5174
# Or manually specify port:
npm run dev -- --port 3000
```

---

## 📝 Development Workflow

### Typical Development Session

**1. Start Backend:**
```bash
# Terminal 1
cd /Users/adindamadani/Downloads/Deepfake\ AI\ Checker
PYTHONPATH=$(pwd) python3 backend/app.py
```

**2. Start Frontend:**
```bash
# Terminal 2
cd frontend
npm run dev
```

**3. Open Browser:**
```
http://localhost:5173
```

**4. Make Changes:**
- Edit `.jsx` files → Auto-reload (HMR)
- Edit `.py` files → Auto-reload (Uvicorn)
- Edit `.css` files → Instant update (HMR)
- Edit `.env` files → **Manual restart required**

**5. Test Changes:**
- Frontend changes: Instant in browser
- Backend changes: Refresh browser after reload
- Database changes: May need to clear data

---

## 🎯 Quick Commands Reference

```bash
# Backend (Run from PROJECT ROOT)
cd /Users/adindamadani/Downloads/Deepfake\ AI\ Checker
PYTHONPATH=$(pwd) python3 backend/app.py          # Start backend

# Backend (Run from BACKEND folder with uvicorn)
cd /Users/adindamadani/Downloads/Deepfake\ AI\ Checker/backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Kill backend process
lsof -ti:8000 | xargs kill -9

# Frontend
cd frontend
npm run dev                                        # Start frontend
npm run build                                      # Build for production

# Database
rm users.db backend/users.db                       # Reset database
sqlite3 users.db ".tables"                         # View tables

# Git
git status                                         # Check changes
git add .                                          # Stage all
git commit -m "message"                            # Commit
git push origin main                               # Push to remote

# Model
ls -lh outputs/models/                             # List models
python backend/train.py --model resnet_revised     # Train model
```

---

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Uvicorn Docs:** https://www.uvicorn.org/

---

**Last Updated:** April 16, 2026
**Maintainer:** Development Team
