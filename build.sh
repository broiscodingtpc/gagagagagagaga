#!/bin/bash

echo "🚀 MNEX Oracle - Shell Build Script"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Check if web directory exists
if [ ! -d "web" ]; then
    echo "❌ web directory not found!"
    exit 1
fi

# Create dist directory if it doesn't exist
mkdir -p web/dist

echo "✅ Running vite build..."

# Try different ways to run vite
if [ -f "node_modules/.bin/vite" ]; then
    echo "✅ Using node_modules/.bin/vite"
    ./node_modules/.bin/vite build
elif [ -f "node_modules/vite/bin/vite.js" ]; then
    echo "✅ Using node_modules/vite/bin/vite.js"
    node node_modules/vite/bin/vite.js build
else
    echo "❌ Vite not found, installing..."
    npm install vite @vitejs/plugin-react
    ./node_modules/.bin/vite build
fi

echo "✅ Build completed successfully!"
echo "📁 Output directory: web/dist"
