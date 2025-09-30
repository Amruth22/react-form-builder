#!/bin/bash
# EC2 Frontend Setup Script
# Run this on your EC2 instance for React app

echo "============================================================"
echo "🎨 React Form Builder - EC2 Frontend Setup"
echo "============================================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "📁 Current directory: $SCRIPT_DIR"
echo ""

# Step 1: Remove old .env if exists (to use auto-detection)
echo "Step 1: Configuring API URL..."
if [ -f .env ]; then
    echo "⚠️  Removing old .env to use auto-detection"
    rm .env
fi
echo "✅ Will auto-detect API URL from hostname"
echo "   (Frontend at http://3.80.33.84:3000 → API at http://3.80.33.84:5000)"

# Step 2: Check node_modules
echo ""
echo "Step 2: Checking dependencies..."
if [ -d node_modules ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules not found. Installing..."
    npm install
fi

# Step 3: Build for production
echo ""
echo "Step 3: Building React app..."
npm run build
echo "✅ Build complete"

# Summary
echo ""
echo "============================================================"
echo "📋 Setup Summary"
echo "============================================================"
echo "✅ API URL: Auto-detected (uses same hostname as frontend)"
echo "✅ Build: Created in build/ directory"
echo "============================================================"
echo ""

# Instructions
echo "🚀 Next Steps:"
echo ""
echo "1. Start the React app:"
echo "   npm start"
echo "   Or serve production build:"
echo "   npx serve -s build -l 3000"
echo ""
echo "2. Access in browser:"
echo "   http://3.80.33.84:3000"
echo ""
echo "3. The app will automatically connect to:"
echo "   http://3.80.33.84:5000"
echo ""
echo "============================================================"
