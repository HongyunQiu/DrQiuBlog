@echo off
chcp 65001 >nul
echo ================================
echo   Dr.Qiu's Blog - 启动服务器
echo ================================
echo.

echo [步骤 1/3] 更新版本号以清除缓存...
node update-version.js
if errorlevel 1 (
    echo [警告] 版本号更新失败，继续启动...
    echo.
)

echo.
echo [步骤 2/3] 准备完成！
echo [步骤 3/3] 正在启动本地服务器...
echo.
echo ================================
echo   服务器已启动
echo   访问地址: http://localhost:8000
echo   缓存更新: 已启用
echo   按 Ctrl+C 可停止服务器
echo ================================
echo.

python -m http.server 8000

pause

