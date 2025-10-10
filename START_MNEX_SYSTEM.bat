@echo off
echo 🚀 Starting MNEX System...
echo.

echo 📱 Starting Web Frontend...
start "MNEX Web" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npm run dev:web"

echo.
echo 🔧 Starting API Server...
start "MNEX API" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npx tsx server/index.ts"

echo.
echo 🎭 Testing Persona System...
timeout /t 3 /nobreak >nul
cd /d "D:\nexus\mnex-oracle"
npx tsx test-persona-simple.ts

echo.
echo ✅ MNEX System Started!
echo.
echo 🌐 Web Frontend: http://localhost:5173
echo 🔧 API Server: http://localhost:8787
echo 🎭 Persona System: Ready
echo.
echo 📋 Available Endpoints:
echo   POST /api/social/generate - Generate content
echo   POST /api/social/reply - Generate replies
echo   POST /api/social/presale - Generate presale announcements
echo   POST /api/twitter/post - Post to Twitter
echo.
echo 🎉 MNEX is ready for testing!
pause
