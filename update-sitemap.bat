@echo off
chcp 65001 >nul
echo ================================
echo   自动更新 Sitemap.xml
echo ================================
echo.
echo 正在生成sitemap.xml...
echo.

python generate-sitemap-simple.py

echo.
echo ================================
echo   更新完成
echo ================================
pause
