#!/bin/bash

# Setup Environment Variables Helper Script
# This script helps you configure .env files for both backend and frontend

echo "=================================="
echo "FACT.IT Environment Setup Helper"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
    echo "Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${GREEN}✅ backend/.env exists${NC}"
fi

# Check if frontend/.env exists
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found!${NC}"
    echo "Creating frontend/.env..."
    cat > frontend/.env << 'EOF'
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✅ frontend/.env exists${NC}"
fi

echo ""
echo "=================================="
echo "Checking Required Variables"
echo "=================================="
echo ""

# Function to check if variable is set and not default
check_var() {
    local file=$1
    local var=$2
    local value=$(grep "^${var}=" "$file" 2>/dev/null | cut -d'=' -f2-)
    
    if [ -z "$value" ]; then
        echo -e "${RED}❌ $var not set in $file${NC}"
        return 1
    elif [[ "$value" == *"your-"* ]] || [[ "$value" == *"change-this"* ]]; then
        echo -e "${YELLOW}⚠️  $var needs to be configured in $file${NC}"
        echo "   Current value: $value"
        return 1
    else
        echo -e "${GREEN}✅ $var is configured${NC}"
        return 0
    fi
}

echo "--- Backend Configuration ---"
check_var "backend/.env" "SECRET_KEY"
check_var "backend/.env" "GOOGLE_CLIENT_ID"
check_var "backend/.env" "SMTP_EMAIL"
check_var "backend/.env" "SMTP_PASSWORD"
check_var "backend/.env" "FRONTEND_URL"

echo ""
echo "--- Frontend Configuration ---"
check_var "frontend/.env" "VITE_GOOGLE_CLIENT_ID"
check_var "frontend/.env" "VITE_API_BASE_URL"

echo ""
echo "=================================="
echo "Quick Setup Instructions"
echo "=================================="
echo ""
echo "1. GOOGLE LOGIN SETUP:"
echo "   - Go to: https://console.cloud.google.com/"
echo "   - Create OAuth 2.0 Client ID"
echo "   - Copy Client ID and paste to:"
echo "     • backend/.env → GOOGLE_CLIENT_ID"
echo "     • frontend/.env → VITE_GOOGLE_CLIENT_ID"
echo ""
echo "2. EMAIL SETUP (Forgot Password):"
echo "   - Go to: https://myaccount.google.com/apppasswords"
echo "   - Generate App Password"
echo "   - Update backend/.env:"
echo "     • SMTP_EMAIL=your-email@gmail.com"
echo "     • SMTP_PASSWORD=your-16-digit-app-password"
echo ""
echo "3. SECRET KEY:"
echo "   - Generate a random secret key:"
echo "     python3 -c 'import secrets; print(secrets.token_urlsafe(32))'"
echo "   - Update backend/.env → SECRET_KEY"
echo ""
echo "4. FRONTEND URL:"
echo "   - For local: http://localhost:5173"
echo "   - For production: https://your-domain.vercel.app"
echo "   - Update backend/.env → FRONTEND_URL"
echo ""
echo "=================================="
echo "Next Steps"
echo "=================================="
echo ""
echo "After configuring all variables:"
echo ""
echo "1. Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app:app --reload"
echo ""
echo "2. Start Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Test the application:"
echo "   - Open http://localhost:5173"
echo "   - Try Google Login"
echo "   - Try Forgot Password"
echo ""
echo "For detailed troubleshooting, see TROUBLESHOOTING.md"
echo ""
