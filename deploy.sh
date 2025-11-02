#!/bin/bash

# VEO AI 平台 1Panel 部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 开始部署 VEO AI 平台到 1Panel..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="veo-ai.site"
PROJECT_NAME="veo-ai"
NODE_VERSION="18"
PM2_APP_NAME="veo-ai"

# 函数：打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "此脚本需要root权限运行"
        print_message "请使用: sudo ./deploy.sh"
        exit 1
    fi
}

# 检查系统要求
check_system() {
    print_step "检查系统要求..."
    
    # 检查操作系统
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        print_message "操作系统: $NAME $VERSION"
    else
        print_error "无法确定操作系统版本"
        exit 1
    fi
    
    # 检查内存
    MEMORY=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
    if (( $(echo "$MEMORY < 2.0" | bc -l) )); then
        print_warning "内存不足2GB，建议升级服务器配置"
    else
        print_message "内存: ${MEMORY}GB ✓"
    fi
    
    # 检查磁盘空间
    DISK=$(df -h / | awk 'NR==2{print $4}' | sed 's/G//')
    if (( $(echo "$DISK < 10" | bc -l) )); then
        print_warning "磁盘空间不足10GB，建议清理或扩容"
    else
        print_message "磁盘空间: ${DISK}GB ✓"
    fi
}

# 安装必要的软件包
install_dependencies() {
    print_step "安装必要的软件包..."
    
    # 更新软件包列表
    apt update -y
    
    # 安装基础软件包
    apt install -y curl wget git unzip build-essential
    
    # 安装Node.js
    if ! command -v node &> /dev/null; then
        print_message "安装Node.js ${NODE_VERSION}..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt install -y nodejs
    fi
    
    # 检查Node.js版本
    NODE_VER=$(node --version)
    print_message "Node.js版本: $NODE_VER ✓"
    
    # 安装PM2
    if ! command -v pm2 &> /dev/null; then
        print_message "安装PM2..."
        npm install -g pm2
    fi
    
    # 检查PM2版本
    PM2_VER=$(pm2 --version)
    print_message "PM2版本: $PM2_VER ✓"
}

# 检查1Panel是否已安装
check_1panel() {
    print_step "检查1Panel安装状态..."
    
    if systemctl is-active --quiet 1panel; then
        print_message "1Panel已安装并运行 ✓"
        PANEL_PORT=$(cat /usr/local/1panel/conf/app.yaml | grep port | awk '{print $2}')
        print_message "1Panel访问地址: https://$(curl -s ifconfig.me):$PANEL_PORT"
    else
        print_warning "1Panel未安装或未运行"
        read -p "是否要安装1Panel? (y/n): " install_panel
        if [[ $install_panel == "y" || $install_panel == "Y" ]]; then
            install_1panel
        else
            print_error "需要1Panel才能继续部署"
            exit 1
        fi
    fi
}

# 安装1Panel
install_1panel() {
    print_step "安装1Panel..."
    
    # 下载并执行安装脚本
    curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh
    bash quick_start.sh
    
    print_message "1Panel安装完成"
    print_warning "请记录1Panel的访问信息，稍后需要用到"
}

# 创建项目目录
create_project_directory() {
    print_step "创建项目目录..."
    
    # 1Panel网站目录
    SITE_DIR="/opt/1panel/apps/openresty/openresty/www/sites/${DOMAIN}"
    
    if [[ ! -d "$SITE_DIR" ]]; then
        mkdir -p "$SITE_DIR"
        print_message "创建目录: $SITE_DIR"
    else
        print_message "目录已存在: $SITE_DIR"
    fi
    
    # 设置目录权限
    chown -R www-data:www-data "$SITE_DIR"
    chmod -R 755 "$SITE_DIR"
}

# 部署应用代码
deploy_application() {
    print_step "部署应用代码..."
    
    SITE_DIR="/opt/1panel/apps/openresty/openresty/www/sites/${DOMAIN}"
    
    # 进入项目目录
    cd "$SITE_DIR"
    
    # 如果存在旧版本，备份
    if [[ -d "veo-ai-platform" ]]; then
        print_message "备份旧版本..."
        mv veo-ai-platform "veo-ai-platform.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 复制项目文件
    if [[ -d "/root/veo-ai-platform" ]]; then
        print_message "复制项目文件..."
        cp -r /root/veo-ai-platform ./
    else
        print_error "未找到项目源码目录 /root/veo-ai-platform"
        print_message "请确保项目代码已上传到服务器"
        exit 1
    fi
    
    # 进入项目目录
    cd veo-ai-platform
    
    # 安装依赖
    print_message "安装项目依赖..."
    npm install --production
    
    # 创建环境变量文件
    if [[ ! -f ".env" ]]; then
        if [[ -f "env-template.txt" ]]; then
            cp env-template.txt .env
            print_warning "已创建.env文件，请手动编辑配置"
        else
            print_error "未找到环境变量模板文件"
        fi
    fi
    
    # 构建应用
    print_message "构建应用..."
    npm run build
    
    # 设置文件权限
    chown -R www-data:www-data .
    chmod -R 755 .
}

# 配置PM2
configure_pm2() {
    print_step "配置PM2进程管理..."
    
    SITE_DIR="/opt/1panel/apps/openresty/openresty/www/sites/${DOMAIN}/veo-ai-platform"
    cd "$SITE_DIR"
    
    # 创建PM2配置文件
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${SITE_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    # 创建日志目录
    mkdir -p logs
    
    # 停止现有进程
    pm2 delete $PM2_APP_NAME 2>/dev/null || true
    
    # 启动应用
    pm2 start ecosystem.config.js
    
    # 保存PM2配置
    pm2 save
    
    # 设置开机自启
    pm2 startup
    
    print_message "PM2配置完成"
}

# 配置防火墙
configure_firewall() {
    print_step "配置防火墙..."
    
    # 检查ufw是否安装
    if command -v ufw &> /dev/null; then
        # 允许必要的端口
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw allow 3000/tcp  # Node.js应用
        
        # 启用防火墙（如果未启用）
        ufw --force enable
        
        print_message "防火墙配置完成"
    else
        print_warning "未检测到ufw防火墙，请手动配置防火墙规则"
    fi
}

# 生成Nginx配置
generate_nginx_config() {
    print_step "生成Nginx配置建议..."
    
    cat > /tmp/nginx_veo_ai.conf << EOF
# VEO AI 网站配置
# 请将此配置添加到1Panel的网站配置中

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # 重定向到HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL证书配置（由1Panel自动管理）
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # 反向代理到Node.js应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF
    
    print_message "Nginx配置已生成到: /tmp/nginx_veo_ai.conf"
    print_warning "请在1Panel中手动配置网站和SSL证书"
}

# 检查部署状态
check_deployment() {
    print_step "检查部署状态..."
    
    # 检查PM2进程
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        print_message "PM2进程运行正常 ✓"
    else
        print_error "PM2进程未运行"
    fi
    
    # 检查端口监听
    if netstat -tlnp | grep -q ":3000"; then
        print_message "应用端口3000监听正常 ✓"
    else
        print_error "应用端口3000未监听"
    fi
    
    # 检查应用响应
    if curl -s http://localhost:3000 > /dev/null; then
        print_message "应用响应正常 ✓"
    else
        print_warning "应用可能未正常启动，请检查日志"
    fi
}

# 显示部署信息
show_deployment_info() {
    print_step "部署完成信息"
    
    echo "=================================="
    echo "🎉 VEO AI 平台部署完成！"
    echo "=================================="
    echo "域名: $DOMAIN"
    echo "项目目录: /opt/1panel/apps/openresty/openresty/www/sites/${DOMAIN}/veo-ai-platform"
    echo "应用端口: 3000"
    echo "PM2进程名: $PM2_APP_NAME"
    echo ""
    echo "📋 后续步骤："
    echo "1. 在1Panel中创建网站并配置域名"
    echo "2. 配置反向代理到 http://127.0.0.1:3000"
    echo "3. 申请SSL证书并启用HTTPS"
    echo "4. 编辑 .env 文件配置生产环境变量"
    echo "5. 测试所有功能是否正常"
    echo ""
    echo "🔧 常用命令："
    echo "查看应用状态: pm2 status"
    echo "查看应用日志: pm2 logs $PM2_APP_NAME"
    echo "重启应用: pm2 restart $PM2_APP_NAME"
    echo "停止应用: pm2 stop $PM2_APP_NAME"
    echo ""
    echo "📖 详细文档: ./DEPLOYMENT_GUIDE.md"
    echo "=================================="
}

# 主函数
main() {
    print_message "VEO AI 平台 1Panel 部署脚本 v1.0"
    print_message "域名: $DOMAIN"
    echo ""
    
    # 执行部署步骤
    check_root
    check_system
    install_dependencies
    check_1panel
    create_project_directory
    deploy_application
    configure_pm2
    configure_firewall
    generate_nginx_config
    check_deployment
    show_deployment_info
    
    print_message "部署脚本执行完成！"
}

# 错误处理
trap 'print_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"























