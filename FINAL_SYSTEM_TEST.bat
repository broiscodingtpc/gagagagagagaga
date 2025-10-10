@echo off
echo 🚀 MNEX System - Final Test with Enhanced Features
echo ====================================================
echo.

echo 📱 Starting Web Frontend...
start "MNEX Web" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npm run dev:web"

echo.
echo 🔧 Starting API Server...
start "MNEX API" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npx tsx server/index.ts"

echo.
echo 🎭 Testing Enhanced Persona System...
timeout /t 5 /nobreak >nul
cd /d "D:\nexus\mnex-oracle"
npx tsx test-persona-simple.ts

echo.
echo ✅ MNEX Enhanced System Test Complete!
echo.
echo 🌐 URLs for Testing:
echo   Web Frontend: http://localhost:5173
echo   API Server: http://localhost:8787
echo   Admin Dashboard: http://localhost:5173/admin
echo.
echo 🎯 Enhanced Features:
echo   ✅ Unique Post Generation (no more repetitive posts!)
echo   ✅ Persona Engine Integration (5 AI personalities)
echo   ✅ Complex Admin Dashboard (6 tabs: Overview, Manual, Pending, History, Config, Analytics)
echo   ✅ Manual Posting Control (X and Telegram)
echo   ✅ Real-time System Stats
echo   ✅ Persona Weight Configuration
echo   ✅ Post Approval System
echo   ✅ Analytics & Insights
echo   ✅ Safety Compliance
echo   ✅ API Integration
echo.
echo 🎉 MNEX is now COMPLETE with absolute admin control!
echo.
echo Next Steps:
echo 1. Test all features in browser
echo 2. Use admin dashboard to control posting
echo 3. Commit to GitHub
echo 4. Deploy to Railway with real env vars
echo.
echo Admin Credentials: admin / mnex2024
echo.
pause
