@echo off
chcp 65001 >nul
echo ==========================================
echo   安装浏览器工具依赖
echo ==========================================
echo.
cd /d "%~dp0.."
echo 正在安装 @agentdeskai/browser-tools-server...
echo.
call npm install @agentdeskai/browser-tools-server --save-dev
echo.
echo 安装完成！
pause

