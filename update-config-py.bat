@echo off
chcp 65001 >nul
echo ================================
echo   自动更新配置文件和Sitemap
echo ================================
echo.
echo 正在扫描 context 目录...
echo.

node generate-config.js

echo.
echo ================================
echo   更新完成
echo ================================
echo.
echo 已自动更新：
echo   ✓ config.js (博客配置)
echo   ✓ sitemap.xml (搜索引擎地图)
echo   ✓ index.html (页面内容和SEO数据)
echo.
echo 现在可以刷新浏览器查看更新！
echo.
pause

