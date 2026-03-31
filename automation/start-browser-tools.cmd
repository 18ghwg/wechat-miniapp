@echo off
chcp 65001 >nul
echo ==========================================
echo   启动浏览器工具服务器
echo ==========================================
echo.
cd /d "%~dp0.."
echo 正在启动 @agentdeskai/browser-tools-server...
echo.
call npx @agentdeskai/browser-tools-server

