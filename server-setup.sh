#!/bin/bash

# VEO AI 平台 - 服务器初始化脚本
# 在服务器上运行此脚本进行初始化
# 使用方法: bash server-setup.sh

set -e

echo "🔧 开始初始化服务器环境..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 更新系统
echo -e "${GREEN}✓ 更新系统...${NC}"
apt update
apt upgrade -y

# 2. 安装 Node.js 22
echo -e "${GREEN}✓ 安装 Node.js 22...${NC}"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 验证安装
node -v
npm -v

# 3. 安装 PM2
echo -e "${GREEN}✓ 安装 PM2...${NC}"
npm install -g pm2

# 4. 安装 Nginx
echo -e "${GREEN}✓ 安装 Nginx...${NC}"
apt install -y nginx

# 5. 安装 Certbot (SSL证书)
echo -e "${GREEN}✓ 安装 Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# 6. 创建项目目录
echo -e "${GREEN}✓ 创建项目目录...${NC}"
mkdir -p /var/www/veo-ai-platform
chown -R $USER:$USER /var/www/veo-ai-platform

# 7. 配置防火墙
echo -e "${GREEN}✓ 配置防火墙...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# 8. 创建环境变量文件
echo -e "${GREEN}✓ 创建环境变量文件...${NC}"
cat > /var/www/veo-ai-platform/.env.production << 'EOF'
# 数据库配置
DATABASE_URL=postgresql://your_database_url

# NextAuth 配置
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://veo-ai.site

# Supabase 配置
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# 速创 API 配置
SUCHUANG_API_KEY=your_api_key
SUCHUANG_API_URL=https://api.wuyinkeji.com

# 其他配置...
EOF

echo -e "${YELLOW}⚠️  请编辑 /var/www/veo-ai-platform/.env.production 填入真实的环境变量${NC}"

# 9. 配置 Nginx
echo -e "${GREEN}✓ 配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/veo-ai << 'EOF'
server {
    listen 80;
    server_name veo-ai.site www.veo-ai.site;

    # 日志
    access_log /var/log/nginx/veo-ai-access.log;
    error_log /var/log/nginx/veo-ai-error.log;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # 图片缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/veo-ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 10. 设置 PM2 开机自启
echo -e "${GREEN}✓ 设置 PM2 开机自启...${NC}"
pm2 startup systemd -u $USER --hp /root
pm2 save

echo -e "${GREEN}✅ 服务器初始化完成！${NC}"
echo ""
echo -e "${YELLOW}📝 下一步操作：${NC}"
echo "1. 编辑环境变量: nano /var/www/veo-ai-platform/.env.production"
echo "2. 上传项目文件到 /var/www/veo-ai-platform"
echo "3. 在项目目录运行: npm install && npm run build"
echo "4. 启动应用: pm2 start npm --name veo-ai -- start"
echo "5. 配置 SSL: certbot --nginx -d veo-ai.site -d www.veo-ai.site"
echo "6. 配置 DNS: 将域名 A 记录指向服务器 IP"
