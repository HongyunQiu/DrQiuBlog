@echo off
chcp 65001 >nul
echo ================================
echo   自动更新配置文件 (Python)
echo ================================
echo.
echo 正在扫描 context 目录...
echo.

python generate-config.py

echo.
echo ================================
pause

