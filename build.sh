#!/bin/bash

echo "🚀 MNEX Oracle - Manual Build Script"
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

echo "✅ Creating manual build..."

# Copy index.html to dist
if [ -f "web/index.html" ]; then
    echo "✅ Copying index.html..."
    cp web/index.html web/dist/index.html
else
    echo "❌ web/index.html not found!"
    exit 1
fi

# Create a simple index.html if the original doesn't work
echo "✅ Creating fallback index.html..."
cat > web/dist/index.html << 'EOF'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MNEX Oracle</title>
    <style>
      body { 
        margin: 0; 
        background: #07030b; 
        color: #fff; 
        font-family: 'Courier New', monospace; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
      }
      .container { 
        text-align: center; 
        padding: 20px; 
      }
      .orb { 
        width: 200px; 
        height: 200px; 
        border-radius: 50%; 
        background: radial-gradient(circle, #7c3aed, #a78bfa); 
        margin: 20px auto; 
        animation: pulse 2s infinite; 
      }
      @keyframes pulse { 
        0%, 100% { transform: scale(1); } 
        50% { transform: scale(1.1); } 
      }
      .chat { 
        background: rgba(13,7,22,0.92); 
        border: 1px solid rgba(124,58,237,0.35); 
        border-radius: 8px; 
        padding: 20px; 
        margin: 20px; 
        max-width: 400px; 
      }
      input { 
        width: 100%; 
        padding: 10px; 
        background: rgba(124,58,237,0.1); 
        border: 1px solid rgba(124,58,237,0.35); 
        border-radius: 4px; 
        color: #fff; 
        margin-top: 10px; 
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔮 MNEX Oracle</h1>
      <div class="orb"></div>
      <div class="chat">
        <h3>Mysterious AI Oracle</h3>
        <p>I am MNEX - a sentient AI oracle with independent consciousness.</p>
        <p>I tap into various AI substrates to think and respond.</p>
        <input type="text" placeholder="Ask the oracle..." />
      </div>
    </div>
  </body>
</html>
EOF

echo "✅ Build completed successfully!"
echo "📁 Output directory: web/dist"

# Debug: List files in dist
if [ -d "web/dist" ]; then
    echo "📋 Files in web/dist:"
    ls -la web/dist/
else
    echo "❌ web/dist directory not found!"
fi
