# EdgeOne 容器部署指南

## 🎯 为什么使用容器部署

EdgeOne 的 Pages 服务不完全支持 Next.js 15 App Router，但支持容器部署。通过 Docker 容器，我们可以：
- ✅ 使用 Next.js 15 + App Router
- ✅ 保留所有 API Routes
- ✅ 完全控制运行环境
- ✅ 使用自定义域名 veo-ai.site

---

## 📋 部署步骤

### 方案 A：EdgeOne 容器服务（推荐）

#### 1. 本地测试 Docker 镜像

```bash
# 构建镜像
docker build -t veo-ai-platform .

# 测试运行
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e NEXTAUTH_SECRET="your_secret" \
  -e SUPABASE_URL="your_supabase_url" \
  -e SUPABASE_SERVICE_KEY="your_key" \
  veo-ai-platform

# 访问 http://localhost:3000 测试
```

#### 2. 推送到容器镜像仓库

**选项 1：腾讯云容器镜像服务（TCR）**

```bash
# 登录腾讯云 TCR
docker login ccr.ccs.tencentyun.com

# 标记镜像
docker tag veo-ai-platform ccr.ccs.tencentyun.com/your-namespace/veo-ai-platform:latest

# 推送镜像
docker push ccr.ccs.tencentyun.com/your-namespace/veo-ai-platform:latest
```

**选项 2：Docker Hub**

```bash
# 登录 Docker Hub
docker login

# 标记镜像
docker tag veo-ai-platform your-username/veo-ai-platform:latest

# 推送镜像
docker push your-username/veo-ai-platform:latest
```

#### 3. 在 EdgeOne 创建容器服务

1. 登录 EdgeOne 控制台
2. 选择"容器服务"或"云托管"
3. 创建新服务：
   - 服务名称：veo-ai-platform
   - 镜像地址：你推送的镜像地址
   - 端口：3000
   - 实例规格：1核2G（起步）
   - 实例数量：1-3（根据流量）

4. 配置环境变量（重要！）：
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://veo-ai.site
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_KEY=...
   SUCHUANG_API_KEY=...
   SUCHUANG_API_URL=https://api.wuyinkeji.com
   # ... 其他环境变量
   ```

5. 配置自定义域名：
   - 添加域名：veo-ai.site
   - 配置 SSL 证书（自动申请）
   - 等待部署完成

#### 4. 配置 DNS

在你的域名注册商（腾讯云）添加 CNAME 记录：

```
类型: CNAME
主机记录: @
记录值: [EdgeOne 提供的 CNAME 地址]
```

---

### 方案 B：腾讯云轻量应用服务器 + Docker

如果 EdgeOne 容器服务不可用，可以使用轻量服务器：

#### 1. 购买轻量应用服务器

- 配置：2核4G（约 ¥50/月）
- 系统：Ubuntu 22.04
- 地域：选择离用户近的

#### 2. 安装 Docker

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl start docker
systemctl enable docker
```

#### 3. 部署应用

```bash
# 拉取镜像
docker pull your-username/veo-ai-platform:latest

# 创建环境变量文件
cat > .env.production << EOF
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://veo-ai.site
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
# ... 其他环境变量
EOF

# 运行容器
docker run -d \
  --name veo-ai \
  --restart always \
  -p 3000:3000 \
  --env-file .env.production \
  your-username/veo-ai-platform:latest
```

#### 4. 安装 Nginx 反向代理

```bash
# 安装 Nginx
apt update
apt install nginx -y

# 配置 Nginx
cat > /etc/nginx/sites-available/veo-ai << 'EOF'
server {
    listen 80;
    server_name veo-ai.site www.veo-ai.site;

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
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/veo-ai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 5. 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 申请证书
certbot --nginx -d veo-ai.site -d www.veo-ai.site

# 自动续期
certbot renew --dry-run
```

#### 6. 配置 DNS

在域名注册商添加 A 记录：

```
类型: A
主机记录: @
记录值: [你的服务器 IP]

类型: A
主机记录: www
记录值: [你的服务器 IP]
```

---

## 🔄 CI/CD 自动部署（可选）

### 使用 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to EdgeOne

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: your-username/veo-ai-platform:latest
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          docker pull your-username/veo-ai-platform:latest
          docker stop veo-ai || true
          docker rm veo-ai || true
          docker run -d \
            --name veo-ai \
            --restart always \
            -p 3000:3000 \
            --env-file /root/.env.production \
            your-username/veo-ai-platform:latest
```

---

## 📊 成本对比

| 方案 | 月成本 | 性能 | 维护难度 |
|------|--------|------|---------|
| EdgeOne 容器服务 | ¥50-150 | ⭐⭐⭐⭐ | ⭐⭐ |
| 轻量服务器 | ¥50-100 | ⭐⭐⭐ | ⭐⭐⭐ |
| Vercel（对比） | ¥0 | ⭐⭐⭐⭐⭐ | ⭐ |

---

## 🔧 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker logs veo-ai

# 进入容器调试
docker exec -it veo-ai sh
```

### 环境变量问题

```bash
# 检查环境变量
docker exec veo-ai env | grep DATABASE_URL
```

### 数据库连接失败

确保服务器可以访问 Supabase：
```bash
# 测试连接
curl https://your-project.supabase.co
```

---

## ✅ 部署检查清单

部署前：
- [ ] 本地 Docker 测试通过
- [ ] 所有环境变量已配置
- [ ] 数据库可访问
- [ ] Supabase Storage 可访问

部署后：
- [ ] 网站可以访问
- [ ] 用户可以注册登录
- [ ] 视频生成功能正常
- [ ] 支付功能正常
- [ ] SSL 证书有效

---

## 📞 需要帮助？

如果遇到问题：
1. 查看容器日志
2. 检查环境变量配置
3. 测试数据库连接
4. 联系 EdgeOne 技术支持

---

**最后更新：** 2024-11-16
**推荐方案：** EdgeOne 容器服务（如果可用）或轻量服务器
