@echo off
chcp 65001 >nul
echo ================================
echo   Dr.Qiu's Blog 启动器
echo ================================
echo.
echo [步骤 1/3] 正在自动更新配置和Sitemap...
echo.

REM 运行配置生成脚本（会自动更新sitemap）
python generate-config.py

if errorlevel 1 (
    echo.
    echo [错误] 配置更新失败，请检查 Python 是否正确安装
    echo.
    pause
    exit /b 1
)

echo.
echo [步骤 2/3] 配置和Sitemap更新完成！
echo [步骤 3/3] 正在启动本地服务器...
echo.
echo ================================
echo   服务器已启动
echo   访问地址: http://localhost:8000
echo   按 Ctrl+C 停止服务器
echo ================================
echo.

python -m http.server 8000

pause

