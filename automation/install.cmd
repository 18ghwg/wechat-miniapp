@echo off
chcp 65001 >nul
echo 正在安装 miniprogram-automator...
cd /d "%~dp0.."
npm install miniprogram-automator --save-dev
echo.
echo 安装完成！
pause

