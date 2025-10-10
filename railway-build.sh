#!/usr/bin/env bash

echo "🔧 Building MNEX v2.5 Frontend..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found! Make sure you're in the project root."
    exit 1
fi

# Check if web directory exists
if [ ! -d "web" ]; then
    echo "❌ web directory not found!"
    exit 1
fi

echo "📦 Installing web dependencies..."
cd web
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install web dependencies"
    exit 1
fi

echo "🏗️  Building React frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "📁 Copying build to server/public..."
cd ..
mkdir -p server/public
cp -r web/dist/* server/public/

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy build files"
    exit 1
fi

echo "✅ Build complete!"
echo "📋 Files in server/public:"
ls -la server/public/

echo ""
echo "🚀 MNEX v2.5 Frontend ready for deployment!"
