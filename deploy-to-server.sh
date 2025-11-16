#!/bin/bash

# VEO AI 平台 - 腾讯云轻量服务器部署脚本
# 使用方法: bash deploy-to-server.sh

set -e

echo "🚀 开始部署 VEO AI 平台到腾讯云轻量服务器..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量（请修改为你的服务器信息）
SERVER_IP="your_server_ip"  # 修改为你的服务器IP
SERVER_USER="root"           # 通常是 root
PROJECT_NAME="veo-ai-platform"
DEPLOY_PATH="/var/www/${PROJECT_NAME}"

echo -e "${YELLOW}📋 请确认以下信息：${NC}"
echo "服务器IP: ${SERVER_IP}"
echo "用户名: ${SERVER_USER}"
echo "部署路径: ${DEPLOY_PATH}"
echo ""
read -p "是否继续？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# 1. 检查本地环境
echo -e "${GREEN}✓ 检查本地环境...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git 未安装${NC}"
    exit 1
fi

# 2. 构建项目
echo -e "${GREEN}✓ 构建项目...${NC}"
npm run build

# 3. 创建部署包
echo -e "${GREEN}✓ 创建部署包...${NC}"
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.ts \
    tsconfig.json \
    --exclude=node_modules

# 4. 上传到服务器
echo -e "${GREEN}✓ 上传到服务器...${NC}"
scp deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# 5. 在服务器上部署
echo -e "${GREEN}✓ 在服务器上部署...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

# 创建部署目录
mkdir -p /var/www/veo-ai-platform
cd /var/www/veo-ai-platform

# 解压部署包
tar -xzf /tmp/deploy.tar.gz
rm /tmp/deploy.tar.gz

# 安装依赖
npm ci --production

# 重启服务
pm2 restart veo-ai || pm2 start npm --name "veo-ai" -- start

echo "✓ 部署完成！"
ENDSSH

# 6. 清理本地临时文件
rm deploy.tar.gz

echo -e "${GREEN}✅ 部署成功！${NC}"
echo -e "${YELLOW}📝 下一步：${NC}"
echo "1. 访问 http://${SERVER_IP}:3000 测试"
echo "2. 配置 Nginx 反向代理"
echo "3. 配置 SSL 证书"
echo "4. 绑定域名 veo-ai.site"
