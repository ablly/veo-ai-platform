# 腾讯云轻量服务器部署指南

## 🎯 部署概览

使用腾讯云轻量服务器 + Docker 部署 VEO AI 平台，绑定域名 veo-ai.site

**服务器配置建议：**
- CPU: 2核
- 内存: 4GB
- 带宽: 5Mbps
- 系统: Ubuntu 22.04
- 月费用: 约 ¥50

---

## 📋 部署步骤

### 步骤 1：连接到服务器

```bash
# 使用 SSH 连接（替换为你的服务器 IP）
ssh root@your_server_ip

# 如果使用密钥
ssh -i /path/to/key.pem root@your_server_ip
```

### 步骤 2：初始化服务器环境

在服务器上运行初始化脚本：

```bash
# 下载初始化脚本
curl -O https://raw.githubusercontent.com/ablly/veo-ai-platform/main/server-setup.sh

# 或者手动创建并复制内容
nano server-setup.sh
# 粘贴 server-setup.sh 的内容

# 添加执行权限
chmod +x server-setup.sh

# 运行初始化脚本
bash server-setup.sh
```

这个脚本会自动安装：
- ✅ Node.js 22
- ✅ PM2（进程管理）
- ✅ Nginx（反向代理）
- ✅ Certbot（SSL证书）
- ✅ 配置防火墙

### 步骤 3：配置环境变量

```bash
# 编辑环境变量文件
nano /var/www/veo-ai-platform/.env.production
```

填入你的真实配置：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# NextAuth 配置
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://veo-ai.site

# Supabase 配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# 速创 API 配置
SUCHUANG_API_KEY=your-api-key
SUCHUANG_API_URL=https://api.wuyinkeji.com
VEO_COST_PER_VIDEO=1.1

# 支付宝配置（如果需要）
ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=your-public-key

# 短信配置（如果需要）
TENCENT_SMS_APP_ID=your-app-id
TENCENT_SMS_APP_KEY=your-app-key
TENCENT_SMS_SIGN_NAME=your-sign-name
TENCENT_SMS_TEMPLATE_ID=your-template-id
```

保存并退出（Ctrl+X, Y, Enter）

### 步骤 4：部署项目

**方案 A：使用 Docker（推荐）**

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# 2. 拉取镜像（如果你已经推送到 Docker Hub）
docker pull your-username/veo-ai-platform:latest

# 3. 运行容器
docker run -d \
  --name veo-ai \
  --restart always \
  -p 3000:3000 \
  --env-file /var/www/veo-ai-platform/.env.production \
  your-username/veo-ai-platform:latest

# 4. 查看日志
docker logs -f veo-ai
```

**方案 B：直接部署（不使用 Docker）**

```bash
# 1. 克隆项目
cd /var/www/veo-ai-platform
git clone https://github.com/ablly/veo-ai-platform.git .

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 使用 PM2 启动
pm2 start npm --name "veo-ai" -- start

# 5. 保存 PM2 配置
pm2 save

# 6. 查看日志
pm2 logs veo-ai
```

### 步骤 5：配置 SSL 证书

```bash
# 使用 Certbot 自动配置 SSL
certbot --nginx -d veo-ai.site -d www.veo-ai.site

# 按照提示操作：
# 1. 输入邮箱
# 2. 同意服务条款
# 3. 选择是否重定向 HTTP 到 HTTPS（推荐选择 2）

# 测试自动续期
certbot renew --dry-run
```

### 步骤 6：配置 DNS

在你的域名注册商（腾讯云）添加 DNS 记录：

```
类型: A
主机记录: @
记录值: [你的服务器IP]
TTL: 600

类型: A
主机记录: www
记录值: [你的服务器IP]
TTL: 600
```

等待 DNS 生效（5-30分钟）

### 步骤 7：验证部署

```bash
# 检查服务状态
pm2 status

# 或者（如果使用 Docker）
docker ps

# 检查 Nginx 状态
systemctl status nginx

# 测试网站
curl http://localhost:3000
curl https://veo-ai.site
```

---

## 🔄 日常维护

### 更新代码

```bash
# 进入项目目录
cd /var/www/veo-ai-platform

# 拉取最新代码
git pull origin main

# 重新构建
npm run build

# 重启服务
pm2 restart veo-ai

# 或者（Docker）
docker pull your-username/veo-ai-platform:latest
docker stop veo-ai
docker rm veo-ai
docker run -d --name veo-ai --restart always -p 3000:3000 --env-file .env.production your-username/veo-ai-platform:latest
```

### 查看日志

```bash
# PM2 日志
pm2 logs veo-ai

# Docker 日志
docker logs -f veo-ai

# Nginx 日志
tail -f /var/log/nginx/veo-ai-access.log
tail -f /var/log/nginx/veo-ai-error.log
```

### 监控资源

```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# PM2 监控
pm2 monit
```

---

## 🔧 故障排查

### 问题 1：无法访问网站

```bash
# 检查服务是否运行
pm2 status
# 或
docker ps

# 检查端口是否监听
netstat -tlnp | grep 3000

# 检查防火墙
ufw status

# 检查 Nginx
nginx -t
systemctl status nginx
```

### 问题 2：SSL 证书问题

```bash
# 重新申请证书
certbot --nginx -d veo-ai.site -d www.veo-ai.site --force-renewal

# 检查证书状态
certbot certificates
```

### 问题 3：数据库连接失败

```bash
# 测试数据库连接
psql "postgresql://your-connection-string"

# 检查环境变量
cat /var/www/veo-ai-platform/.env.production | grep DATABASE_URL
```

### 问题 4：内存不足

```bash
# 查看内存使用
free -h

# 重启服务释放内存
pm2 restart veo-ai

# 或者升级服务器配置
```

---

## 📊 性能优化

### 1. 启用 Nginx 缓存

编辑 `/etc/nginx/sites-available/veo-ai`，添加：

```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

# 在 location / 中添加
proxy_cache my_cache;
proxy_cache_valid 200 60m;
proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
```

### 2. 启用 Gzip 压缩

编辑 `/etc/nginx/nginx.conf`：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 3. 配置 PM2 集群模式

```bash
# 停止当前进程
pm2 stop veo-ai

# 使用集群模式启动（使用所有 CPU 核心）
pm2 start npm --name "veo-ai" -i max -- start

# 保存配置
pm2 save
```

---

## 💰 成本估算

| 项目 | 费用 |
|------|------|
| 轻量服务器（2核4G） | ¥50/月 |
| 域名（已购买） | ¥0 |
| SSL 证书（Let's Encrypt） | ¥0 |
| **总计** | **¥50/月** |

---

## ✅ 部署检查清单

部署前：
- [ ] 服务器已购买并可以 SSH 连接
- [ ] 域名已购买（veo-ai.site）
- [ ] 环境变量已准备好
- [ ] 数据库可以访问
- [ ] Supabase Storage 可以访问

部署后：
- [ ] 网站可以通过 IP 访问
- [ ] 网站可以通过域名访问
- [ ] HTTPS 正常工作
- [ ] 用户可以注册登录
- [ ] 视频生成功能正常
- [ ] 支付功能正常（如果配置）
- [ ] PM2 开机自启已配置

---

## 📞 需要帮助？

如果遇到问题：
1. 查看日志：`pm2 logs veo-ai`
2. 检查 Nginx：`nginx -t`
3. 测试数据库连接
4. 查看本文档的故障排查部分

---

**部署完成后，你的网站将在：**
- 🌐 https://veo-ai.site
- 🌐 https://www.veo-ai.site

**祝部署顺利！** 🎉
