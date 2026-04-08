# 🚀 Deployment Guide - Fact.it Deepfake Detector

Panduan lengkap untuk hosting aplikasi Deepfake AI Checker ke production.

---

## 📋 Table of Contents

1. [Opsi Hosting](#opsi-hosting)
2. [Persiapan Deployment](#persiapan-deployment)
3. [Deploy Frontend](#deploy-frontend)
4. [Deploy Backend](#deploy-backend)
5. [Database & Storage](#database--storage)
6. [Environment Variables](#environment-variables)
7. [Testing Production](#testing-production)

---

## 🌐 Opsi Hosting

### **Rekomendasi untuk Project Ini:**

| Component | Recommended Platform | Free Tier | Notes |
|-----------|---------------------|-----------|-------|
| **Frontend** | Vercel / Netlify | ✅ Yes | Best untuk React apps |
| **Backend** | Railway / Render | ✅ Yes (limited) | Support Python + GPU optional |
| **Database** | Railway / Supabase | ✅ Yes | SQLite → PostgreSQL |
| **Storage** | AWS S3 / Cloudinary | ✅ Yes (limited) | Untuk menyimpan images |

### **Option 1: Full Free Stack (Recommended untuk Start)**
- **Frontend:** Vercel (unlimited bandwidth)
- **Backend:** Render Free Tier (750 hours/month)
- **Database:** Built-in SQLite (upgrade ke PostgreSQL later)
- **Storage:** Cloudinary Free (25GB)

### **Option 2: Better Performance**
- **Frontend:** Vercel Pro
- **Backend:** Railway ($5/month)
- **Database:** Railway PostgreSQL
- **Storage:** AWS S3

### **Option 3: All-in-One**
- **Full Stack:** Railway (Frontend + Backend + DB)
- **Storage:** Cloudinary

---

## 🛠 Persiapan Deployment

### 1. Check Requirements

```bash
# Backend requirements
cd backend
pip freeze > requirements.txt

# Frontend dependencies
cd frontend
npm install
```

### 2. Environment Variables Setup

Create `.env` files untuk production:

**Backend `.env`:**
```env
SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=sqlite:///./deepfake_detector.db
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ENVIRONMENT=production
```

**Frontend `.env.production`:**
```env
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

---

## 🎨 Deploy Frontend (Vercel)

### **Step-by-Step:**

#### 1. Prepare Frontend for Production

```bash
cd frontend

# Update API base URL
# Edit src/Detection.jsx, src/Login.jsx, etc.
# Change: const DEFAULT_API_BASE = 'http://localhost:8000'
# To: const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
```

#### 2. Create `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3. Deploy ke Vercel

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod
```

**Option B: Via GitHub (Recommended)**
1. Push code ke GitHub repository
2. Buka https://vercel.com
3. Click "New Project"
4. Import GitHub repository
5. Select `frontend` folder sebagai root directory
6. Add environment variable: `VITE_API_BASE_URL`
7. Click "Deploy"

✅ **Frontend akan live di:** `https://your-app.vercel.app`

---

## 🐍 Deploy Backend (Railway)

### **Step-by-Step:**

#### 1. Prepare Backend Files

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn backend.app:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

Create `Procfile`:
```
web: uvicorn backend.app:app --host 0.0.0.0 --port $PORT
```

Create `runtime.txt`:
```
python-3.9.6
```

#### 2. Update `requirements.txt`

```bash
cd backend
pip freeze > requirements.txt
```

Make sure it includes:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
torch==2.1.0
torchvision==0.16.0
opencv-python-headless==4.8.1.78
Pillow==10.1.0
bcrypt==4.1.1
PyJWT==2.8.0
pydantic[email]==2.5.0
python-jose[cryptography]==3.3.0
```

#### 3. Deploy ke Railway

**Via Railway Dashboard:**
1. Buka https://railway.app
2. Login dengan GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Pilih repository kamu
6. Railway auto-detect Python app
7. Set environment variables:
   - `SECRET_KEY`: your-secret-key
   - `CORS_ORIGINS`: https://your-frontend.vercel.app
   - `PYTHONPATH`: /app
8. Click "Deploy"

**Via Railway CLI:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
cd "Deepfake AI Checker"
railway init

# Deploy
railway up

# Add environment variables
railway variables set SECRET_KEY=your-secret-key
railway variables set CORS_ORIGINS=https://your-frontend.vercel.app
```

✅ **Backend akan live di:** `https://your-app.railway.app`

---

## 🗄 Database & Storage

### **Database Migration (SQLite → PostgreSQL)**

Jika ingin upgrade ke PostgreSQL:

1. **Add PostgreSQL di Railway:**
   - Di Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Copy `DATABASE_URL`

2. **Update Backend Code:**

```python
# backend/database.py (create new file)
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./deepfake_detector.db")

# Fix for Railway PostgreSQL URL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### **Image Storage (Cloudinary)**

1. **Sign up:** https://cloudinary.com
2. **Get credentials:** Dashboard → API Keys
3. **Install SDK:**
```bash
pip install cloudinary
```

4. **Update backend to upload images:**
```python
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
)

# Upload image
result = cloudinary.uploader.upload(image_file)
image_url = result['secure_url']
```

---

## 🔐 Environment Variables

### **Backend (Railway)**

```env
SECRET_KEY=your-super-secret-jwt-key-min-32-characters
CORS_ORIGINS=https://your-frontend.vercel.app,https://www.your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ENVIRONMENT=production
PYTHONPATH=/app
PORT=8000
```

### **Frontend (Vercel)**

```env
VITE_API_BASE_URL=https://your-backend.railway.app
```

---

## 🧪 Testing Production

### **1. Test Backend API**

```bash
# Health check
curl https://your-backend.railway.app/health

# Test auth
curl -X POST https://your-backend.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

### **2. Test Frontend**

1. Buka `https://your-frontend.vercel.app`
2. Test register & login
3. Upload test image
4. Check detection results
5. View history
6. Browse articles

### **3. Monitor Logs**

**Railway:**
```bash
railway logs
```

**Vercel:**
```bash
vercel logs
```

---

## 📊 Performance Optimization

### **Backend:**

1. **Enable Caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def load_model():
    # Cache model loading
    pass
```

2. **Add CDN for Model Files:**
- Upload model ke S3/Cloudinary
- Load from CDN instead of local

3. **Database Indexing:**
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_history_user ON detection_history(user_id);
```

### **Frontend:**

1. **Code Splitting:**
```javascript
// Lazy load pages
const Articles = lazy(() => import('./Articles'))
const Detection = lazy(() => import('./Detection'))
```

2. **Image Optimization:**
- Use WebP format
- Lazy load images
- Add loading skeletons

3. **Enable Compression:**
Vercel automatically enables gzip/brotli

---

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` to strong random string
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set proper CORS origins
- [ ] Add rate limiting
- [ ] Validate file uploads (size, type)
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Enable CSP headers
- [ ] Add API authentication
- [ ] Regular security updates

---

## 💰 Cost Estimation

### **Free Tier (Good for Start):**
- Vercel: Free (unlimited bandwidth)
- Railway: Free 500 hours/month ($5 after)
- Cloudinary: Free 25GB storage
- **Total: $0-5/month**

### **Production Ready:**
- Vercel Pro: $20/month
- Railway: $10-20/month
- PostgreSQL: Included in Railway
- Cloudinary Pro: $89/month (or AWS S3 ~$5)
- **Total: $35-130/month**

---

## 🆘 Troubleshooting

### **Common Issues:**

**1. CORS Error:**
```python
# backend/app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**2. Model Loading Error:**
- Ensure model files are included in deployment
- Check file paths (use absolute paths)
- Consider downloading model on first request

**3. Database Connection:**
- Check `DATABASE_URL` format
- Ensure PostgreSQL is running
- Check connection limits

**4. Build Failures:**
- Check Python version compatibility
- Verify all dependencies in requirements.txt
- Check build logs for errors

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Vite Production:** https://vitejs.dev/guide/build.html

---

## ✅ Quick Start Checklist

1. [ ] Create GitHub repository
2. [ ] Push code to GitHub
3. [ ] Sign up for Vercel account
4. [ ] Sign up for Railway account
5. [ ] Deploy frontend to Vercel
6. [ ] Deploy backend to Railway
7. [ ] Configure environment variables
8. [ ] Test all features in production
9. [ ] Set up custom domain (optional)
10. [ ] Monitor and optimize

---

**Good luck with your deployment! 🚀**

For questions or issues, refer to the platform documentation or create an issue in the repository.
