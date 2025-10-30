@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo 🔧 GitHub MCP 配置向导
echo ================================================================
echo.

REM 检查是否以管理员权限运行
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  建议以管理员权限运行以确保配置成功
    echo    右键点击此文件，选择"以管理员身份运行"
    echo.
)

echo 📋 配置步骤：
echo    1. 创建GitHub Personal Access Token
echo    2. 配置环境变量
echo    3. 验证配置
echo.

REM 步骤1：指导创建Token
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤1：创建GitHub Personal Access Token
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔗 请在浏览器中打开以下链接：
echo    https://github.com/settings/tokens/new
echo.
echo 📝 填写以下信息：
echo    Note: VEO AI MCP Token
echo    Expiration: 90 days 或 No expiration
echo.
echo ✅ 勾选以下权限（重要！）：
echo    ☑ repo（完整勾选，包括所有子项）
echo    ☑ workflow
echo    ☑ write:packages
echo    ☑ admin:repo_hook
echo    ☑ user
echo.
echo 💾 点击"Generate token"并复制Token
echo    Token格式：ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
echo.

set /p CONFIRM="已创建并复制Token？(y/n): "
if /i not "%CONFIRM%"=="y" (
    echo.
    echo ❌ 请先创建Token后再继续
    echo 📖 详细步骤请查看：GITHUB_MCP_SETUP.md
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤2：配置Token
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 获取Token
set /p GITHUB_TOKEN="请粘贴您的GitHub Token: "

REM 验证Token格式
if not "!GITHUB_TOKEN:~0,4!"=="ghp_" (
    echo.
    echo ⚠️  警告：Token格式可能不正确
    echo    GitHub Personal Access Token通常以 ghp_ 开头
    echo.
    set /p CONTINUE="是否继续？(y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo ❌ 配置已取消
        pause
        exit /b 1
    )
)

REM 配置环境变量
echo.
echo 🔄 正在配置环境变量...

setx GITHUB_TOKEN "!GITHUB_TOKEN!" >nul 2>&1
if !errorlevel! == 0 (
    echo ✅ 环境变量配置成功！
) else (
    echo ❌ 环境变量配置失败
    echo.
    echo 💡 请手动配置：
    echo    1. Win + R 输入：sysdm.cpl
    echo    2. 高级 → 环境变量
    echo    3. 新建用户变量：
    echo       名称：GITHUB_TOKEN
    echo       值：!GITHUB_TOKEN!
    pause
    exit /b 1
)

REM 步骤3：验证配置
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤3：验证配置
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🧪 正在测试GitHub Token...

REM 检查curl是否可用
where curl >nul 2>&1
if !errorlevel! == 0 (
    echo 使用curl测试Token有效性...
    curl -s -H "Authorization: token !GITHUB_TOKEN!" https://api.github.com/user > test_result.tmp 2>&1
    
    findstr /C:"login" test_result.tmp >nul
    if !errorlevel! == 0 (
        echo ✅ Token验证成功！
        for /f "tokens=2 delims=:" %%a in ('findstr /C:"login" test_result.tmp') do (
            set USERNAME=%%a
            set USERNAME=!USERNAME:"=!
            set USERNAME=!USERNAME:,=!
            set USERNAME=!USERNAME: =!
            echo    GitHub用户名：!USERNAME!
        )
    ) else (
        echo ⚠️  Token验证失败，请检查Token是否正确
    )
    del test_result.tmp >nul 2>&1
) else (
    echo ⚠️  curl不可用，跳过自动验证
    echo 💡 您可以手动访问以下URL验证：
    echo    https://api.github.com/user
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ 配置完成！
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📋 下一步操作：
echo    1. 重启Cursor IDE（必须！）
echo    2. 环境变量需要重启才能生效
echo    3. 重启后GitHub MCP将正常工作
echo.
echo 🚀 重启后您可以：
echo    - 使用GitHub MCP创建仓库
echo    - 直接推送代码到GitHub
echo    - 运行部署脚本：.\deploy-github.bat
echo.
echo 📖 详细文档：
echo    - MCP配置：GITHUB_MCP_SETUP.md
echo    - 快速修复：MCP_QUICK_FIX.md
echo    - 部署指南：QUICK_START.md
echo.

set /p RESTART="是否立即重启Cursor？(y/n): "
if /i "%RESTART%"=="y" (
    echo.
    echo 🔄 正在关闭Cursor...
    taskkill /IM Cursor.exe /F >nul 2>&1
    if !errorlevel! == 0 (
        echo ✅ Cursor已关闭，请手动重新打开
    ) else (
        echo ⚠️  请手动关闭并重新打开Cursor
    )
) else (
    echo.
    echo ⚠️  请记得重启Cursor以使配置生效！
)

echo.
pause


