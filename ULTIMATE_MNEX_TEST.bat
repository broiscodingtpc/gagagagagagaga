@echo off
echo 🚀 MNEX ULTIMATE SYSTEM - COMPLETE AUTONOMOUS AI DEVELOPER
echo ============================================================
echo.

echo 📱 Starting Web Frontend...
start "MNEX Web" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npm run dev:web"

echo.
echo 🔧 Starting API Server with Full Database...
start "MNEX API" powershell -NoExit -Command "cd 'D:\nexus\mnex-oracle'; npx tsx server/index.ts"

echo.
echo 🎭 Testing Complete Persona System with All Features...
timeout /t 5 /nobreak >nul
cd /d "D:\nexus\mnex-oracle"
npx tsx test-persona-simple.ts

echo.
echo ✅ MNEX ULTIMATE SYSTEM TEST COMPLETE!
echo.
echo 🌐 URLs for Testing:
echo   Web Frontend: http://localhost:5173
echo   API Server: http://localhost:8787
echo   Admin Dashboard: http://localhost:5173/admin
echo   Health Check: http://localhost:8787/api/health
echo   Posts API: http://localhost:8787/api/posts
echo   Comments API: http://localhost:8787/api/comments
echo.
echo 🎯 COMPLETE AUTONOMOUS AI DEVELOPER FEATURES:
echo.
echo 📊 PROJECT MANAGEMENT:
echo   ✅ Complete Tokenomics (1B supply, 40% self-locked)
echo   ✅ Roadmap (4 phases of development)
echo   ✅ Presale Information (rate, wallet, dates)
echo   ✅ Project Features & Benefits
echo   ✅ Website & Social Links
echo.
echo 🤖 AUTONOMOUS AI BEHAVIOR:
echo   ✅ Posts unique content every 2-4 hours
echo   ✅ Reads and replies to Twitter comments intelligently
echo   ✅ Searches Solana news and market data
echo   ✅ Generates project updates every 6 hours
echo   ✅ Posts market analysis every 8 hours
echo   ✅ Shares AI news every 10 hours
echo   ✅ Posts trending topics every 12 hours
echo   ✅ Behaves like a real Solana developer
echo.
echo 🔍 WEB SEARCH & MARKET ANALYSIS:
echo   ✅ Solana news and ecosystem updates
echo   ✅ AI token trends and analysis
echo   ✅ Market data and price information
echo   ✅ Presale opportunities and guides
echo   ✅ Trending topics in crypto
echo   ✅ Token information and analysis
echo.
echo 💬 INTELLIGENT COMMENT SYSTEM:
echo   ✅ Reads Twitter comments automatically
echo   ✅ Generates contextual replies
echo   ✅ Sentiment analysis of interactions
echo   ✅ Logs all user interactions
echo   ✅ Rate limiting to avoid spam
echo.
echo 🗄️ COMPLETE DATABASE SYSTEM:
echo   ✅ PostgreSQL schema for Railway
echo   ✅ Posts storage with metadata
echo   ✅ Comments and replies tracking
echo   ✅ User interactions logging
echo   ✅ Market data caching
echo   ✅ Presale transactions
echo   ✅ Autonomous behavior logs
echo   ✅ System configuration
echo.
echo 🚀 RAILWAY DEPLOYMENT READY:
echo   ✅ PostgreSQL database integration
echo   ✅ Environment variables configured
echo   ✅ Health check endpoints
echo   ✅ Production build scripts
echo   ✅ Railway configuration files
echo   ✅ Error handling and logging
echo   ✅ Performance monitoring
echo.
echo 🎛️ ADMIN CONTROL CENTER:
echo   ✅ 6-tab comprehensive dashboard
echo   ✅ Manual posting controls
echo   ✅ Real-time system monitoring
echo   ✅ Post approval system
echo   ✅ Analytics and insights
echo   ✅ Configuration management
echo   ✅ Database administration
echo.
echo 🎉 MNEX IS NOW A COMPLETE AUTONOMOUS AI DEVELOPER!
echo.
echo MNEX will:
echo   - Run completely independently on Railway
echo   - Post unique content based on real market data
echo   - Reply to comments like a real person
echo   - Manage his own Solana project
echo   - Share updates and insights
echo   - Build and maintain community
echo   - Store everything in PostgreSQL database
echo   - Provide full admin control
echo.
echo Admin Credentials: admin / mnex2024
echo.
echo 🚀 READY FOR RAILWAY DEPLOYMENT!
echo.
pause
