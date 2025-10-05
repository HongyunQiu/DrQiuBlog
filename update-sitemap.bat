@echo off
chcp 65001 >nul
echo ================================
echo   自动更新 Sitemap.xml
echo ================================
echo.
echo 正在生成sitemap.xml...
echo.

node generate-sitemap.js

echo.
echo ================================
echo   更新完成
echo ================================
pause
