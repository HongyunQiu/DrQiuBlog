@echo off
chcp 65001 >nul
echo ========================================
echo   Dr.Qiu Blog - 缓存更新工具
echo ========================================
echo.

echo [1/4] 更新版本号...
node update-version.js
if errorlevel 1 (
    echo [错误] 版本号更新失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 重新生成配置...
python generate-config.py
if errorlevel 1 (
    echo [错误] 配置生成失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 更新完成！
echo [4/4] 可选择启动服务器...
echo.
echo ========================================
echo   缓存更新完成！
echo   
echo   选择操作：
echo   1. 启动自动更新服务器 (推荐)
echo   2. 启动简单服务器
echo   3. 仅更新，不启动服务器
echo ========================================
echo.

set /p choice="请选择 (1-3): "

if "%choice%"=="1" (
    echo.
    echo 启动自动更新服务器...
    start "" "start-auto-server.bat"
) else if "%choice%"=="2" (
    echo.
    echo 启动简单服务器...
    start "" "start-server.bat"
) else if "%choice%"=="3" (
    echo.
    echo 更新完成，未启动服务器。
) else (
    echo.
    echo 无效选择，更新完成。
)

echo.
echo 建议清除浏览器缓存后刷新页面
pause
