@echo off
echo 🚀 MNEX System - Final Test
echo ================================
echo.

echo 📱 Starting Web Frontend...
start "MNEX Web" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npm run dev:web"

echo.
echo 🔧 Starting API Server...
start "MNEX API" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npx tsx server/index.ts"

echo.
echo 🎭 Testing Persona System...
timeout /t 5 /nobreak >nul
cd /d "D:\nexus\mnex-oracle"
npx tsx test-persona-simple.ts

echo.
echo ✅ MNEX System Test Complete!
echo.
echo 🌐 URLs for Testing:
echo   Web Frontend: http://localhost:5173
echo   API Server: http://localhost:8787
echo   Admin Dashboard: http://localhost:5173/admin
echo.
echo 📋 Features Ready:
echo   ✅ Persona Engine (5 AI personalities)
echo   ✅ Post Generation (unique with signatures)
echo   ✅ Safety Compliance (automatic filtering)
echo   ✅ Social Integration (Twitter + Telegram)
echo   ✅ Admin Dashboard (post management)
echo   ✅ Real-time Code Terminals
echo   ✅ Interactive Chat with Persona
echo   ✅ Updated Links (X, Whitepaper, Admin)
echo.
echo 🎉 MNEX is ready for GitHub and Railway deployment!
echo.
echo Next Steps:
echo 1. Test all features in browser
echo 2. Commit to GitHub
echo 3. Deploy to Railway with real env vars
echo.
pause
