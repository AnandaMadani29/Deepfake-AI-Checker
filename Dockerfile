# Railway-optimized Dockerfile for FastAPI backend
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies (minimal)
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY backend/requirements-railway.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p outputs/models

# Expose port
EXPOSE 8000

# Health check - use shell form to expand $PORT
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; import os; requests.get(f'http://localhost:{os.getenv(\"PORT\", 8000)}/health')"

# Run the application (download model first, then start server)
# Use shell form to allow environment variable expansion
CMD python download_model.py && uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}
