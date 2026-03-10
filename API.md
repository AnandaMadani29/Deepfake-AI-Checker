# API Documentation - Fact.it Backend

This document provides detailed information about the Fact.it backend API endpoints.

## 🌐 Base URL

```
http://localhost:8000
```

---

## 📡 Endpoints

### 1. Health Check

Check if the API is running and get system information.

**Endpoint:** `GET /health`

**Request:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok",
  "device": "cpu",
  "model_name": "efficientnet_b0"
}
```

**Response Fields:**
- `status` (string): API status ("ok" if running)
- `device` (string): Device being used ("cpu" or "cuda")
- `model_name` (string): Name of the loaded model

**Status Codes:**
- `200 OK`: API is running successfully

---

### 2. Predict Deepfake

Analyze an image to detect if it's a deepfake.

**Endpoint:** `POST /predict`

**Request:**

```bash
curl -X POST \
  -F "file=@/path/to/image.jpg" \
  http://localhost:8000/predict
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Image file (PNG, JPG) up to 10MB |
| `model_name` | String | No | Override default model (optional) |

**Supported Image Formats:**
- PNG
- JPG/JPEG
- Max size: 10MB

**Response (Success):**
```json
{
  "label": "Fake",
  "prob_fake": 0.6523,
  "threshold": 0.5,
  "model_name": "efficientnet_b0"
}
```

**Response Fields:**
- `label` (string): Classification result ("Fake" or "Real")
- `prob_fake` (float): Probability of being fake (0.0 to 1.0)
- `threshold` (float): Decision threshold used (default: 0.5)
- `model_name` (string): Model used for prediction

**Response (Error):**
```json
{
  "detail": "Error message describing what went wrong"
}
```

**Status Codes:**
- `200 OK`: Prediction successful
- `400 Bad Request`: Invalid request (empty file, invalid format)
- `415 Unsupported Media Type`: File is not an image
- `500 Internal Server Error`: Server error during prediction

---

## 🔍 Detailed Examples

### Example 1: Basic Prediction

**Request:**
```bash
curl -X POST \
  -F "file=@test_image.jpg" \
  http://localhost:8000/predict
```

**Response:**
```json
{
  "label": "Real",
  "prob_fake": 0.1234,
  "threshold": 0.5,
  "model_name": "efficientnet_b0"
}
```

**Interpretation:**
- Image is classified as **Real**
- Fake confidence: 12.34%
- Real confidence: 87.66%
- Decision: Since 12.34% < 50%, it's classified as Real

---

### Example 2: Fake Image Detection

**Request:**
```bash
curl -X POST \
  -F "file=@deepfake_image.png" \
  http://localhost:8000/predict
```

**Response:**
```json
{
  "label": "Fake",
  "prob_fake": 0.8765,
  "threshold": 0.5,
  "model_name": "efficientnet_b0"
}
```

**Interpretation:**
- Image is classified as **Fake**
- Fake confidence: 87.65%
- Real confidence: 12.35%
- Decision: Since 87.65% > 50%, it's classified as Fake

---

### Example 3: Error - Invalid File Type

**Request:**
```bash
curl -X POST \
  -F "file=@document.pdf" \
  http://localhost:8000/predict
```

**Response:**
```json
{
  "detail": "Unsupported file type. Please upload an image."
}
```

**Status Code:** `415 Unsupported Media Type`

---

### Example 4: Error - Empty File

**Request:**
```bash
curl -X POST \
  -F "file=@empty.jpg" \
  http://localhost:8000/predict
```

**Response:**
```json
{
  "detail": "Empty file"
}
```

**Status Code:** `400 Bad Request`

---

## 🔐 CORS Configuration

The API is configured to accept requests from all origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Note:** In production, you should restrict `allow_origins` to specific domains.

---

## 📊 Response Schema

### Prediction Response Schema

```typescript
interface PredictionResponse {
  label: "Fake" | "Real";
  prob_fake: number;  // 0.0 to 1.0
  threshold: number;  // default: 0.5
  model_name: string; // e.g., "efficientnet_b0"
}
```

### Error Response Schema

```typescript
interface ErrorResponse {
  detail: string;  // Error message
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Predict
curl -X POST \
  -F "file=@image.jpg" \
  http://localhost:8000/predict
```

### Using Python

```python
import requests

# Health check
response = requests.get('http://localhost:8000/health')
print(response.json())

# Predict
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/predict', files=files)
    print(response.json())
```

### Using JavaScript (Fetch)

```javascript
// Health check
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => console.log(data));

// Predict
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/predict', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🚦 Rate Limiting

Currently, there is **no rate limiting** implemented. 

**Recommended for production:**
- Implement rate limiting (e.g., 100 requests/minute per IP)
- Add authentication/API keys
- Monitor usage and costs

---

## 🔧 Configuration

### Model Selection

You can specify a different model in the request:

```bash
curl -X POST \
  -F "file=@image.jpg" \
  -F "model_name=resnet50" \
  http://localhost:8000/predict
```

**Available Models:**
- `efficientnet_b0` (default)
- `resnet50`
- `densenet121`

**Note:** Model weights must be present in `outputs/models/best_{model_name}.pth`

---

## 📝 Best Practices

### Client-Side

1. **Validate file before upload**
   - Check file type (PNG, JPG)
   - Check file size (< 10MB)
   - Show preview to user

2. **Handle errors gracefully**
   - Display user-friendly error messages
   - Implement retry logic for network errors
   - Show loading states

3. **Optimize uploads**
   - Compress images if too large
   - Use FormData for file uploads
   - Implement progress indicators

### Server-Side

1. **Input validation**
   - Verify file type and size
   - Sanitize file names
   - Check image integrity

2. **Error handling**
   - Return meaningful error messages
   - Log errors for debugging
   - Use appropriate HTTP status codes

3. **Performance**
   - Use GPU if available
   - Implement caching for repeated requests
   - Optimize model loading

---

## 🐛 Common Errors

### 1. Connection Refused

**Error:** `Failed to connect to localhost:8000`

**Cause:** Backend is not running

**Solution:** Start the backend server
```bash
cd backend
uvicorn app:app --reload
```

---

### 2. CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Cause:** Frontend and backend on different origins

**Solution:** Ensure CORS is properly configured in `app.py`

---

### 3. File Too Large

**Error:** `413 Request Entity Too Large`

**Cause:** Image file exceeds size limit

**Solution:** Compress image or reduce quality before upload

---

### 4. Model Not Found

**Error:** `FileNotFoundError: Model weights not found`

**Cause:** Model weights file is missing

**Solution:** Train model or download pre-trained weights

---

## 📚 Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These interfaces allow you to:
- View all endpoints
- Test API calls directly
- See request/response schemas
- Download OpenAPI specification

---

## 🔄 API Versioning

Currently, the API is **version 1.0** with no versioning in the URL.

**Future considerations:**
- Add version prefix: `/api/v1/predict`
- Maintain backward compatibility
- Document breaking changes

---

## 📞 Support

For API issues or questions:
- Check this documentation
- Review backend logs
- Open an issue on GitHub
- Contact the development team

---

**Last Updated:** March 2026
