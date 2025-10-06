@echo off
chcp 65001 >nul
echo ================================
echo   Dr.Qiu's Blog - 快速启动
echo ================================
echo.

echo [快速启动] 更新缓存版本号...
node update-version.js
if errorlevel 1 (
    echo [警告] 版本号更新失败，继续启动...
    echo.
)

echo.
echo [快速启动] 启动服务器...
echo.
echo ================================
echo   服务器已启动
echo   访问地址: http://localhost:8000
echo   按 Ctrl+C 停止服务器
echo ================================
echo.

node auto-server.js

pause

