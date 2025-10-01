@echo off
chcp 65001 >nul
echo ================================
echo   自动更新配置文件
echo ================================
echo.
echo 正在扫描 context 目录...
echo.

node generate-config.js

echo.
echo ================================
pause

