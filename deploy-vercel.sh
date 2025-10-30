#!/bin/bash

# VEO AI平台 Vercel 快速部署脚本

echo "🚀 开始部署VEO AI平台到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录Vercel
echo "🔐 检查Vercel登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录Vercel:"
    vercel login
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在Vercel Dashboard配置环境变量"
echo "2. 访问部署的网站测试功能"
echo "3. 配置自定义域名（可选）"
echo ""
echo "🔧 需要配置的环境变量："
echo "- DATABASE_URL"
echo "- NEXTAUTH_URL"
echo "- NEXTAUTH_SECRET"
echo "- SMTP_USER"
echo "- SMTP_PASSWORD"
echo "- SUCHUANG_API_KEY"
echo ""
echo "📖 详细配置请参考 DEPLOYMENT_GUIDE.md"


