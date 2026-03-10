# Setup Guide - Fact.it Deepfake AI Checker

This guide provides detailed step-by-step instructions for setting up the Fact.it application on your local machine.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)

---

## 🖥️ System Requirements

### Minimum Requirements

- **Operating System**: macOS, Linux, or Windows 10+
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB free space
- **Internet**: Required for initial setup

### Recommended Requirements

- **Python**: 3.9+
- **Node.js**: 18+
- **RAM**: 8GB or more
- **GPU**: CUDA-compatible GPU (optional, for faster inference)

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/deepfake-ai-checker.git
cd deepfake-ai-checker
```

### Step 2: Set Up Python Environment

#### Option A: Using Virtual Environment (Recommended)

**On macOS/Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install main dependencies
pip install -r requirements.txt
```

**On Windows:**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install main dependencies
pip install -r requirements.txt
```

#### Option B: Global Installation

```bash
pip3 install -r requirements.txt
```

### Step 3: Install Backend Dependencies

```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
# or using yarn
yarn install
cd ..
```

### Step 5: Verify Model Weights

Ensure the trained model weights are present:

```bash
# Check if model file exists
ls -lh outputs/models/best_efficientnet_b0.pth
```

If the model file is missing, you'll need to:
1. Train the model using `main_train.py`, or
2. Download pre-trained weights (if available)

---

## ▶️ Running the Application

### Method 1: Using Separate Terminals (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd backend

# Using the run script (macOS/Linux)
chmod +x run.sh
./run.sh

# Or manually
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Method 2: Using Virtual Environment

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔧 Configuration

### Backend Configuration

Edit `src/config.py` to customize:

```python
# Model selection
MODEL_NAME = "efficientnet_b0"  # Options: efficientnet_b0, resnet50, densenet121

# Device selection
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Image processing
IMAGE_SIZE = 224

# Paths
MODEL_SAVE_PATH = f"outputs/models/best_{MODEL_NAME}.pth"
DATA_DIR = "data"
```

### Frontend Configuration

Edit `frontend/src/Detection.jsx`:

```javascript
// API endpoint
const DEFAULT_API_BASE = 'http://localhost:8000'

// Maximum files allowed
const MAX_FILES = 10
```

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# Backend
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0

# Frontend
VITE_API_URL=http://localhost:8000

# Model
MODEL_NAME=efficientnet_b0
DEVICE=cpu
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** `Address already in use` error

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
uvicorn app:app --reload --port 8001
```

#### 2. Module Not Found Error

**Problem:** `ModuleNotFoundError: No module named 'xxx'`

**Solution:**
```bash
# Ensure you're in the correct directory
cd backend  # or root directory

# Reinstall dependencies
pip3 install -r requirements.txt

# Check Python path
which python3
python3 --version
```

#### 3. Model File Not Found

**Problem:** `FileNotFoundError: Model weights not found`

**Solution:**
```bash
# Check if model file exists
ls outputs/models/

# If missing, you need to train the model first
python main_train.py

# Or download pre-trained weights
# (Add download link if available)
```

#### 4. CORS Error in Frontend

**Problem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Ensure backend is running on http://localhost:8000
- Check CORS middleware in `backend/app.py`
- Verify API_BASE in frontend matches backend URL

#### 5. npm Install Fails

**Problem:** `npm ERR! code EACCES`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Or use sudo (not recommended)
sudo npm install
```

#### 6. GPU/CUDA Issues

**Problem:** `CUDA out of memory` or `CUDA not available`

**Solution:**
```bash
# Check CUDA availability
python3 -c "import torch; print(torch.cuda.is_available())"

# Force CPU usage in config.py
DEVICE = "cpu"

# Or reduce batch size if using GPU
BATCH_SIZE = 8  # or smaller
```

#### 7. Image Upload Fails

**Problem:** Images fail to upload or process

**Solution:**
- Check image format (PNG, JPG supported)
- Verify file size (max 10MB)
- Check backend logs for errors
- Ensure backend is running and accessible

---

## 📊 Verifying Installation

### Test Backend

```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","device":"cpu","model_name":"efficientnet_b0"}
```

### Test Frontend

1. Open browser: http://localhost:5173
2. Navigate to Detection page
3. Upload a test image
4. Verify results display correctly

### Test Full Pipeline

```bash
# Test prediction endpoint
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/predict

# Expected response:
# {"label":"Real","prob_fake":0.12,"threshold":0.5,"model_name":"efficientnet_b0"}
```

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update Python dependencies
pip3 install -r requirements.txt --upgrade
cd backend && pip3 install -r requirements.txt --upgrade && cd ..

# Update Node dependencies
cd frontend && npm install && cd ..

# Restart both servers
```

---

## 🛑 Stopping the Application

```bash
# In each terminal, press:
Ctrl + C

# Deactivate virtual environment (if used)
deactivate
```

---

## 📝 Next Steps

After successful setup:

1. ✅ Read the [README.md](README.md) for usage guide
2. ✅ Check [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
3. ✅ Explore the API documentation at http://localhost:8000/docs
4. ✅ Test with your own images

---

## 💡 Tips

- **Use virtual environment** to avoid dependency conflicts
- **Keep dependencies updated** for security and performance
- **Monitor logs** for debugging issues
- **Use GPU** if available for faster inference
- **Check system resources** if experiencing slowdowns

---

## 📞 Getting Help

If you encounter issues not covered here:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/deepfake-ai-checker/issues)
3. Create a new issue with:
   - Detailed error message
   - Steps to reproduce
   - System information
   - Screenshots (if applicable)

---

**Happy detecting! 🚀**
