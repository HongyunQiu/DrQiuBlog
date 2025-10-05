@echo off
chcp 65001 >nul
echo ================================
echo   启动自动更新服务器
echo ================================
echo.

echo [步骤 1/4] 更新版本号以清除缓存...
node update-version.js
if errorlevel 1 (
    echo [警告] 版本号更新失败，继续启动...
    echo.
)

echo.
echo [步骤 2/4] 生成最新配置...
node generate-config.js
if errorlevel 1 (
    echo [警告] 配置生成失败，继续启动...
    echo.
)

echo.
echo [步骤 3/4] 生成最新Sitemap...
node generate-sitemap.js
if errorlevel 1 (
    echo [警告] Sitemap生成失败，继续启动...
    echo.
)

echo.
echo [步骤 4/4] 启动自动更新服务器...
echo.
echo ================================
echo   服务器已启动
echo   访问地址: http://localhost:8000
echo   自动更新: 已启用
echo   SEO优化: 已启用
echo   缓存管理: 已启用
echo   按 Ctrl+C 停止服务器
echo ================================
echo.

node auto-server.js

pause

