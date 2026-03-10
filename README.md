# Fact.it - AI-Powered Deepfake Image Detection

![Fact.it Banner](https://img.shields.io/badge/AI-Deepfake%20Detection-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)

**Fact.it** is an advanced AI-powered web application designed to detect deepfake images using state-of-the-art deep learning models. With an intuitive interface and powerful backend, users can upload up to 10 images simultaneously and receive detailed authenticity analysis.

---

## 🌟 Features

### Core Functionality
- ✅ **AI-Powered Detection** - Uses EfficientNet-B0 deep learning model for accurate deepfake detection
- ✅ **Batch Processing** - Upload and analyze up to 10 images simultaneously
- ✅ **Real-time Results** - Get instant feedback with confidence scores
- ✅ **Detailed Analytics** - View comprehensive results including:
  - Classification (Real/Fake)
  - Confidence scores for both categories
  - Model information
  - Decision threshold
  - Processing timestamp

### User Experience
- 🎨 **Modern UI** - Dark theme with orange accent (#E94E1B)
- 📱 **Responsive Design** - Works seamlessly across devices
- 🖱️ **Drag & Drop** - Easy file upload with drag-and-drop support
- 📊 **Summary Statistics** - Batch results overview with visual statistics
- 🔄 **Smooth Navigation** - Seamless routing between Home and Detection pages
- ℹ️ **User Education** - Built-in explanations for technical concepts

---

## 🏗️ Architecture

```
Deepfake AI Checker/
├── backend/                 # FastAPI backend
│   ├── app.py              # Main API application
│   ├── requirements.txt    # Backend dependencies
│   └── run.sh             # Backend startup script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app with routing
│   │   ├── Home.jsx       # Homepage component
│   │   ├── Detection.jsx  # Detection page component
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── src/                    # ML model source
│   ├── model.py           # Model architecture
│   ├── dataset.py         # Data preprocessing
│   ├── train.py           # Training pipeline
│   ├── evaluate.py        # Evaluation utilities
│   └── config.py          # Configuration
├── outputs/
│   └── models/            # Trained model weights
│       └── best_efficientnet_b0.pth
└── requirements.txt       # Main dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.8 or higher
- **Node.js** 16 or higher
- **npm** or **yarn**
- **pip3** for Python package management

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/deepfake-ai-checker.git
cd deepfake-ai-checker
```

#### 2. Install Python Dependencies
```bash
# Install main dependencies
pip3 install -r requirements.txt

# Install backend dependencies
cd backend
pip3 install -r requirements.txt
cd ..
```

#### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Running the Application

#### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
chmod +x run.sh
./run.sh
```
Backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

#### Option 2: Using Python Virtual Environment (Recommended)

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📖 Usage Guide

### 1. **Homepage**
- Navigate through sections: About Us, Services, How To Use
- Click "Get Started" to go to Detection page
- Smooth scrolling navigation

### 2. **Detection Page**
- **Upload Images**: 
  - Click the upload area or drag & drop images
  - Supports PNG, JPG formats (up to 10MB each)
  - Maximum 10 images per batch
  
- **Review Selection**:
  - View thumbnails of selected images
  - Remove individual images with × button
  - Clear all images with "Clear All" button

- **Detect**:
  - Click "Detect Now" (single image) or "Detect All (N)" (multiple images)
  - Watch real-time processing progress
  - View processing status for each image

- **View Results**:
  - **Summary Statistics**: Overview of Fake/Real/Failed detections
  - **Individual Results**: Detailed card for each image showing:
    - Image preview with label overlay
    - Classification (Real/Fake)
    - Confidence scores
    - AI Model used
    - Decision threshold (50%)
    - Processing timestamp

### 3. **Understanding Results**

**How Detection Works:**
- The AI analyzes each image and provides a confidence score
- If Fake confidence > 50%, the image is classified as **Fake**
- If Fake confidence ≤ 50%, the image is classified as **Real**

**Example:**
- Confidence (Fake): 65.23% → Classification: **Fake**
- Confidence (Real): 34.77%

---

## 🧠 Model Information

### Default Model: EfficientNet-B0

- **Architecture**: EfficientNet-B0 (pretrained on ImageNet)
- **Task**: Binary Classification (Real vs Fake)
- **Input Size**: 224x224 pixels
- **Preprocessing**: 
  - Resize to 224x224
  - Normalize with ImageNet mean/std
- **Decision Threshold**: 0.5 (50%)

### Model Training

The model is trained using a two-phase approach:
1. **Phase 1**: Freeze backbone, train only classification head
2. **Phase 2**: Unfreeze backbone, fine-tune entire network

Training configuration can be found in `src/config.py`.

---

## 🔧 Configuration

### Backend Configuration (`src/config.py`)

```python
MODEL_NAME = "efficientnet_b0"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMAGE_SIZE = 224
MODEL_SAVE_PATH = f"outputs/models/best_{MODEL_NAME}.pth"
```

### Frontend Configuration

- **API Base URL**: `http://localhost:8000` (defined in `Detection.jsx`)
- **Max Files**: 10 images (defined in `Detection.jsx`)
- **Theme Colors**:
  - Primary: `#E94E1B` (Orange)
  - Background: `#1a1a1a` (Dark)
  - Accent: `#0d0d0d` (Darker)

---

## 📡 API Documentation

### Endpoints

#### `GET /health`
Check API health status

**Response:**
```json
{
  "status": "ok",
  "device": "cpu",
  "model_name": "efficientnet_b0"
}
```

#### `POST /predict`
Detect deepfake in uploaded image

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "label": "Fake",
  "prob_fake": 0.6523,
  "threshold": 0.5,
  "model_name": "efficientnet_b0"
}
```

**Error Response:**
```json
{
  "detail": "Error message"
}
```

---

## 🛠️ Development

### Project Structure

- **Backend**: FastAPI with PyTorch for model inference
- **Frontend**: React with Vite for fast development
- **Styling**: Inline styles with dark theme
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Routing**: Client-side routing with state-based navigation

### Key Technologies

**Backend:**
- FastAPI - Modern web framework
- PyTorch - Deep learning framework
- timm - Pre-trained models
- albumentations - Image augmentation
- Pillow - Image processing

**Frontend:**
- React 18 - UI library
- Vite - Build tool
- JavaScript (ES6+)

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Test health endpoint
curl http://localhost:8000/health

# Test prediction endpoint
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/predict
```

### Frontend Testing
1. Open browser at `http://localhost:5173`
2. Test navigation between Home and Detection pages
3. Test image upload (single and multiple)
4. Test detection with various images
5. Verify results display correctly

---

## 📝 TODO / Future Enhancements

- [ ] Add user authentication
- [ ] Implement result history/database
- [ ] Add export results (CSV/PDF)
- [ ] Support video deepfake detection
- [ ] Add model comparison feature
- [ ] Implement API rate limiting
- [ ] Add unit tests and integration tests
- [ ] Deploy to cloud (AWS/GCP/Azure)
- [ ] Add Docker support
- [ ] Implement CI/CD pipeline

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - *Initial work*

---

## 🙏 Acknowledgments

- EfficientNet model from [timm](https://github.com/rwightman/pytorch-image-models)
- FastAPI framework
- React and Vite teams
- Open-source community

---

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

## ⚠️ Disclaimer

This tool is designed for educational and research purposes. While it uses state-of-the-art AI models, no deepfake detection system is 100% accurate. Always verify important information through multiple sources.

---

**Made with ❤️ and AI**
