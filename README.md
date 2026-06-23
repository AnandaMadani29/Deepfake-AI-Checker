# Fact.it - AI-Powered Deepfake Image Detection

![Fact.it Banner](https://img.shields.io/badge/AI-Deepfake%20Detection-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch)

**Fact.it** is an AI-powered web application for detecting deepfake images using Convolutional Neural Network (CNN) deep learning models. Users can upload images and receive detailed authenticity analysis including classification label, confidence score, and a breakdown of 7 visual manipulation indicators.

---

## 🌟 Features

- ✅ **AI-Powered Detection** — ResNet-50 model (96.67% accuracy, 100% recall on fake images)
- ✅ **Batch Processing** — Upload and analyze multiple images simultaneously
- ✅ **Detailed Breakdown** — 7 visual indicators (Skin Texture, Eye Reflection, Edge Sharpness, Color Distribution, Lighting Consistency, Hair Detail, AI Pattern) with severity labels: Normal / Warning / Critical
- ✅ **Confidence Score** — Probability of fake with natural language explanation
- ✅ **PDF Export** — Download detection report as PDF
- ✅ **Detection History** — Saved per-user with search, filter, and delete
- ✅ **Authentication** — Email/password + Google OAuth + password reset via email
- ✅ **Articles** — Educational content about deepfakes and digital literacy
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
Deepfake-AI-Checker/
├── backend/                      # FastAPI backend
│   ├── app.py                   # Main API & endpoints
│   ├── auth.py                  # Authentication & JWT
│   ├── database.py              # PostgreSQL/SQLite handler
│   ├── history.py               # Detection history CRUD
│   ├── face_validator.py        # OpenCV face validation
│   ├── email_service.py         # SMTP email service
│   ├── pdf_generator.py         # PDF export
│   ├── explanation_generator.py # Natural language explanation
│   ├── metadata_analyzer.py     # EXIF metadata analysis
│   ├── ai_generated_detector.py # AI pattern detection
│   ├── real_breakdown_analyzer.py # 7-indicator breakdown
│   ├── adaptive_selector.py     # Adaptive model selection
│   ├── requirements-railway.txt # Production dependencies
│   └── .env.example             # Environment variable template
├── frontend/                     # React.js frontend (Vite)
├── src/                          # ML training source
│   ├── model.py                 # CNN architecture definitions
│   ├── dataset.py               # Dataset & augmentation
│   ├── train.py                 # Training pipeline
│   ├── evaluate.py              # Evaluation utilities
│   └── config.py                # Training configuration
├── outputs/
│   └── models/                  # Trained model weights (.pth)
├── Dockerfile                    # Railway deployment
├── start.py                      # Startup script (Railway)
├── Procfile                      # Process definition
├── main_train_kfold.py           # K-Fold training script
└── requirements.txt              # Root dependencies
```

---

## 🚀 Local Development

### Prerequisites

- **Python** 3.9+
- **Node.js** 16+
- **npm**

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/deepfake-ai-checker.git
cd deepfake-ai-checker

# Install Python dependencies
pip install -r requirements.txt
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in the required values
```

Required variables in `backend/.env`:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=              # Leave empty to use SQLite locally
GOOGLE_CLIENT_ID=          # For Google OAuth
SMTP_EMAIL=                # Gmail address
SMTP_PASSWORD=             # Gmail App Password (16-digit)
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application

**Terminal 1 — Backend:**
```bash
# From project root
PYTHONPATH=$(pwd) uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 🧠 Model Information

| Model | Accuracy | Recall Fake | ROC-AUC | Parameters |
|---|---|---|---|---|
| **ResNet-50** *(deployed)* | **96.67%** | **100%** | 0.9917 | ~24M |
| EfficientNet-B0 | 95.00% | — | 0.9931 | ~4.3M |
| XceptionNet | 91.67% | — | 0.9944 | ~22M |

**Training strategy:**
- Transfer learning from ImageNet pretrained weights
- Two-phase training: backbone frozen (Phase 1) → full fine-tune with LR 1×10⁻⁵ (Phase 2)
- Stratified 5-Fold Cross-Validation on 1,200 images
- Domain-specific augmentation: `ImageCompression`, `GaussNoise`, `CoarseDropout`, etc.

---

## � API Reference

See [API.md](API.md) for full endpoint documentation.

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/predict` | Detect deepfake in uploaded image |
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login |
| `GET` | `/history` | Get detection history |
| `GET` | `/history/{id}/pdf` | Export detection as PDF |

---

## � Deployment

The application is deployed using:

| Component | Platform |
|---|---|
| Frontend (React.js) | Vercel |
| Backend (FastAPI) | Railway (Docker) |
| Database (PostgreSQL) | Railway Managed DB |

Railway reads the `Dockerfile` automatically on push. See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 👥 Authors

- **Ananda Madani** — Backend, Model Integration, Deployment
- **Guntur Listyo Prabowo** — Frontend, UI/UX
- **Yosef Ezekiel Gandhi Sogemaking** — Model Training, Model Evaluation

Universitas Bina Nusantara — Computer Science, 2026

---

## ⚠️ Disclaimer

This tool is designed for educational and research purposes. No deepfake detection system is 100% accurate. Always verify important information through multiple sources.
