@echo off
echo ========================================
echo  MNEX ORACLE - Starting All Servers
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting API Server (port 8787)...
start "MNEX API Server" powershell -NoExit -Command "cd '%~dp0'; npx tsx server/index.ts"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Web Server (port 5173)...
start "MNEX Web Interface" powershell -NoExit -Command "cd '%~dp0web'; npx vite"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  ✅ MNEX ORACLE SERVERS STARTED!
echo ========================================
echo.
echo  🌐 Web Interface: http://localhost:5173
echo  🔌 API Server:    http://localhost:8787
echo  📱 Telegram:      @MorpheusNexusProject
echo  🤖 Bot:           @MorpheusNexusBOT
echo.
echo  Press any key to open website...
pause >nul
start http://localhost:5173

