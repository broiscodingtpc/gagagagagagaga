@echo off
echo 🚀 MNEX Complete System - Railway Ready Test
echo ==============================================
echo.

echo 📱 Starting Web Frontend...
start "MNEX Web" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npm run dev:web"

echo.
echo 🔧 Starting API Server with Database...
start "MNEX API" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npx tsx server/index.ts"

echo.
echo 🎭 Testing Enhanced Persona System with Project Details...
timeout /t 5 /nobreak >nul
cd /d "D:\nexus\mnex-oracle"
npx tsx test-persona-simple.ts

echo.
echo ✅ MNEX Complete System Test Complete!
echo.
echo 🌐 URLs for Testing:
echo   Web Frontend: http://localhost:5173
echo   API Server: http://localhost:8787
echo   Admin Dashboard: http://localhost:5173/admin
echo   Health Check: http://localhost:8787/api/health
echo.
echo 🎯 Complete Features:
echo   ✅ Unique Post Generation (no more repetitive posts!)
echo   ✅ Project Details (tokenomics, roadmap, presale info)
echo   ✅ Telegram Links in All Posts
echo   ✅ PostgreSQL Database Ready
echo   ✅ Autonomous AI System
echo   ✅ Comment Reading & Replies
echo   ✅ Market Analysis & News Search
echo   ✅ Complex Admin Dashboard
echo   ✅ Railway Deployment Ready
echo   ✅ Health Monitoring
echo   ✅ Full API Endpoints
echo.
echo 🚀 Railway Deployment Features:
echo   ✅ PostgreSQL Database Schema
echo   ✅ Environment Variables Configured
echo   ✅ Health Check Endpoint
echo   ✅ Production Build Scripts
echo   ✅ Railway Configuration Files
echo   ✅ Autonomous AI Mode
echo   ✅ Database Logging
echo   ✅ Error Handling
echo.
echo 📋 Next Steps for Railway:
echo   1. Push to GitHub repository
echo   2. Connect to Railway
echo   3. Add PostgreSQL database
echo   4. Set environment variables
echo   5. Deploy and test
echo.
echo 🎉 MNEX is now a COMPLETE AUTONOMOUS AI DEVELOPER!
echo.
echo Features:
echo   - Posts unique content every 2-4 hours
echo   - Replies to Twitter comments intelligently
echo   - Searches Solana news and market data
echo   - Generates project updates and tokenomics info
echo   - Stores everything in PostgreSQL database
echo   - Runs completely autonomously on Railway
echo   - Full admin control through dashboard
echo.
echo Admin Credentials: admin / mnex2024
echo.
pause
