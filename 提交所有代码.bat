@echo off
chcp 65001 >nul
echo ========================================
echo 提交所有代码到GitHub（排除MD文件）
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 添加src目录下的所有文件...
git add src/

echo [2/5] 添加public目录下的文件...
git add public/og-image.png
git add public/google2ccf60705a5778f8.html

echo [3/5] 检查当前状态...
git status

echo.
echo [4/5] 提交修改...
git commit -m "fix: 修复验证码登录和注册送积分 + 完整SEO优化" -m "" -m "修复内容：" -m "- 修复邮箱验证码登录失败问题（直接在auth.ts中验证）" -m "- 修复手机验证码积分配置错误" -m "- 新用户注册自动赠送10积分" -m "" -m "SEO优化：" -m "- 添加百度验证码：codeva-xDxG31avBF" -m "- 添加Google验证码：dg6AkvEoozvbl71VAMdEASHbA893w9ia76Xcu9VdoZY" -m "- 创建SEO配置文件（突出双引擎和双支付特色）" -m "- 添加sitemap.xml（动态生成）" -m "- 添加robots.txt（爬虫规则）" -m "- 添加manifest.json（PWA支持）" -m "- 优化页面级SEO（pricing、login、register）" -m "- 添加社交媒体分享优化（Open Graph、Twitter Card）" -m "- 添加结构化数据（Schema.org JSON-LD）"

echo.
echo [5/5] 推送到GitHub...
git push origin main

echo.
echo ========================================
echo 完成！代码已推送到GitHub
echo Vercel会自动部署，请等待3-5分钟
echo ========================================
echo.
pause
