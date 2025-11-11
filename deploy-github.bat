@echo off
setlocal enabledelayedexpansion

echo 🐙 VEO AI平台 GitHub部署脚本
echo ===============================================

REM 获取GitHub用户名
set /p GITHUB_USERNAME="请输入您的GitHub用户名: "

if "%GITHUB_USERNAME%"=="" (
    echo ❌ 错误：GitHub用户名不能为空
    pause
    exit /b 1
)

echo.
echo 📋 部署信息确认：
echo    GitHub用户名: %GITHUB_USERNAME%
echo    仓库名称: veo-ai-platform
echo    仓库地址: https://github.com/%GITHUB_USERNAME%/veo-ai-platform
echo.

set /p CONFIRM="确认信息正确吗？(y/n): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ 部署已取消
    pause
    exit /b 1
)

echo.
echo 🚀 开始部署流程...

REM 检查Git状态
echo 📊 检查Git状态...
git status
if errorlevel 1 (
    echo ❌ 错误：当前目录不是Git仓库
    pause
    exit /b 1
)

REM 检查是否有未提交的更改
for /f %%i in ('git status --porcelain 2^>nul ^| find /c /v ""') do set CHANGES=%%i
if !CHANGES! gtr 0 (
    echo 📝 发现未提交的更改，正在提交...
    git add .
    git commit -m "feat: 准备GitHub部署"
    if errorlevel 1 (
        echo ❌ 错误：提交失败
        pause
        exit /b 1
    )
    echo ✅ 更改已提交
) else (
    echo ✅ 没有未提交的更改
)

REM 添加GitHub远程仓库
echo 🔗 配置GitHub远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/veo-ai-platform.git
if errorlevel 1 (
    echo ❌ 错误：添加远程仓库失败
    echo 💡 请确保您已在GitHub创建了仓库：https://github.com/new
    pause
    exit /b 1
)
echo ✅ 远程仓库配置完成

REM 重命名分支为main
echo 🌿 重命名分支为main...
git branch -M main
if errorlevel 1 (
    echo ❌ 错误：重命名分支失败
    pause
    exit /b 1
)
echo ✅ 分支重命名完成

REM 推送代码到GitHub
echo 📤 推送代码到GitHub...
echo 💡 如果提示输入用户名和密码：
echo    - 用户名：%GITHUB_USERNAME%
echo    - 密码：使用Personal Access Token（不是GitHub密码）
echo    - Token创建地址：https://github.com/settings/tokens
echo.
git push -u origin main
if errorlevel 1 (
    echo ❌ 错误：推送代码失败
    echo 💡 可能的解决方案：
    echo    1. 确保GitHub仓库已创建
    echo    2. 检查网络连接
    echo    3. 使用Personal Access Token作为密码
    echo    4. 确保仓库名称正确
    pause
    exit /b 1
)

echo.
echo ✅ 代码推送成功！
echo.
echo 📋 下一步操作：
echo    1. 访问 https://vercel.com 注册/登录
echo    2. 点击 "New Project"
echo    3. 选择 "Import Git Repository"
echo    4. 找到并导入 veo-ai-platform 仓库
echo    5. 配置环境变量（详见 GITHUB_DEPLOYMENT_GUIDE.md）
echo.
echo 🔗 有用的链接：
echo    GitHub仓库: https://github.com/%GITHUB_USERNAME%/veo-ai-platform
echo    Vercel部署: https://vercel.com/new
echo    部署指南: GITHUB_DEPLOYMENT_GUIDE.md
echo.
echo 🎉 GitHub部署准备完成！

pause












