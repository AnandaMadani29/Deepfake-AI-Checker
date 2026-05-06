#!/bin/sh
# Startup script for Railway deployment

echo "🚀 Starting Deepfake AI Checker..."

# Download model if URL is provided
if [ -n "$MODEL_DOWNLOAD_URL" ]; then
    echo "📥 Downloading model..."
    python download_model.py
else
    echo "⚠️  MODEL_DOWNLOAD_URL not set, skipping model download"
fi

# Start the server
echo "🌐 Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}
