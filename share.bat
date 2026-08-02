@echo off
REM ============================================================
REM  NumeroVastu 360 - Share securely over HTTPS
REM  Double-click this file whenever you want a shareable link.
REM  A public https://...trycloudflare.com URL will appear below.
REM  Keep this window OPEN while sharing. Close it to stop.
REM  All client data stays 100%% in the visitor's browser.
REM ============================================================
cd /d "%~dp0"
echo.
echo  Starting NumeroVastu 360...
start /b "" node tools\static-server.js
timeout /t 2 /nobreak >nul
echo.
echo  Creating your secure HTTPS link (takes a few seconds)...
echo  Look for a line like:  https://something-words.trycloudflare.com
echo.
tools\cloudflared.exe tunnel --url http://localhost:8321 --no-autoupdate
REM When cloudflared exits, stop the local server too
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8321 ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>&1
