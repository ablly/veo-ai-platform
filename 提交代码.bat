@echo off
echo ========================================
echo 提交验证码修复和SEO优化到GitHub
echo ========================================
echo.

cd /d Z:\appdemo\app\my\test1\veo-ai-platform

echo [1/4] 添加所有代码文件...
git add src/
git add public/og-image.png

echo.
echo [2/4] 检查状态...
git status

echo.
echo [3/4] 提交修改...
git commit -m "fix: 修复验证码登录和注册送积分问题 + SEO优化" -m "- 修复邮箱验证码登录失败问题" -m "- 新用户注册自动赠送10积分" -m "- 添加完整的SEO优化（百度、Google验证码）" -m "- 添加sitemap、robots.txt、manifest" -m "- 优化社交媒体分享"

echo.
echo [4/4] 推送到GitHub...
git push origin main

echo.
echo ========================================
echo 完成！
echo ========================================
pause
