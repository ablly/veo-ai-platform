@echo off
chcp 65001 >nul
echo ========================================
echo 推送代码到GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo 当前分支状态：
git status
echo.

echo 准备推送到GitHub...
echo.
git push origin main

echo.
echo ========================================
echo 完成！
echo ========================================
echo.
pause
