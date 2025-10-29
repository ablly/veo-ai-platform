# GitHub + Vercel 部署指南

## 🐙 完整的GitHub部署流程

### 第1步：创建GitHub仓库

1. **访问GitHub创建页面**
   ```
   https://github.com/new
   ```

2. **填写仓库信息**
   ```
   Repository name: veo-ai-platform
   Description: VEO AI视频生成平台 - 基于最新VEO 3.1模型，支持手机号登录、邮箱验证码登录、积分系统等功能
   Visibility: Public (推荐，免费用户可用Vercel)
   ```

3. **重要设置**
   - ❌ 不要勾选 "Add a README file"
   - ❌ 不要勾选 "Add .gitignore"
   - ❌ 不要勾选 "Choose a license"
   - ✅ 直接点击 "Create repository"

### 第2步：推送代码到GitHub

创建仓库后，在项目目录执行以下命令：

```bash
# 添加GitHub远程仓库（替换YOUR_USERNAME为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/veo-ai-platform.git

# 重命名主分支为main
git branch -M main

# 推送代码到GitHub
git push -u origin main
```

**Windows PowerShell命令：**
```powershell
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/veo-ai-platform.git

# 重命名分支
git branch -M main

# 推送代码
git push -u origin main
```

### 第3步：连接Vercel进行自动部署

1. **访问Vercel**
   ```
   https://vercel.com
   ```

2. **登录Vercel**
   - 使用GitHub账号登录（推荐）
   - 或使用邮箱注册

3. **导入项目**
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 找到并选择 `veo-ai-platform` 仓库
   - 点击 "Import"

4. **配置项目**
   ```
   Project Name: veo-ai-platform
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. **点击Deploy**
   - Vercel会自动构建和部署
   - 等待部署完成（通常2-3分钟）

### 第4步：配置环境变量

部署完成后，需要在Vercel Dashboard配置环境变量：

1. **进入项目设置**
   - 在Vercel Dashboard找到您的项目
   - 点击项目名称进入详情页
   - 点击 "Settings" 标签
   - 选择 "Environment Variables"

2. **添加必需的环境变量**

```bash
# 数据库配置
DATABASE_URL = your_supabase_database_url

# NextAuth配置
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = your-super-secret-key-min-32-chars

# 邮件服务配置
SMTP_HOST = smtp.qq.com
SMTP_PORT = 587
SMTP_USER = your-email@qq.com
SMTP_PASSWORD = your-email-auth-code

# API服务配置
SUCHUANG_API_KEY = your-suchuang-api-key
```

3. **可选的环境变量（支付功能）**

```bash
# 支付宝配置
ALIPAY_APP_ID = your-alipay-app-id
ALIPAY_PRIVATE_KEY = your-alipay-private-key
ALIPAY_PUBLIC_KEY = your-alipay-public-key
ALIPAY_NOTIFY_URL = https://your-app.vercel.app/api/payment/alipay/callback
ALIPAY_RETURN_URL = https://your-app.vercel.app/payment/success
ALIPAY_GATEWAY = https://openapi.alipay.com/gateway.do
ALIPAY_SIGN_TYPE = RSA2
ALIPAY_CHARSET = utf-8

# GitHub登录配置
GITHUB_CLIENT_ID = your-github-client-id
GITHUB_CLIENT_SECRET = your-github-client-secret
```

4. **重新部署**
   - 添加环境变量后，点击 "Redeploy"
   - 或者推送新的代码到GitHub会自动触发部署

### 第5步：配置自定义域名（可选）

1. **在Vercel中添加域名**
   - 进入项目设置
   - 选择 "Domains" 标签
   - 添加您的域名（如：veo-ai.site）

2. **配置DNS记录**
   ```
   类型: CNAME
   名称: www
   值: cname.vercel-dns.com

   类型: A
   名称: @
   值: 76.76.19.61
   ```

3. **更新环境变量**
   ```bash
   NEXTAUTH_URL = https://your-domain.com
   ALIPAY_NOTIFY_URL = https://your-domain.com/api/payment/alipay/callback
   ALIPAY_RETURN_URL = https://your-domain.com/payment/success
   ```

## 🔄 自动部署流程

设置完成后，每次推送代码到GitHub都会自动触发Vercel部署：

```bash
# 修改代码后
git add .
git commit -m "feat: 添加新功能"
git push origin main

# Vercel会自动检测到推送并开始部署
```

## 📋 部署后检查清单

### ✅ 功能验证
- [ ] 网站可以正常访问
- [ ] 登录功能正常（邮箱密码、邮箱验证码、手机号验证码）
- [ ] 注册功能正常
- [ ] 视频生成功能正常
- [ ] 积分系统正常
- [ ] 支付功能正常（如果配置）

### ✅ 性能检查
- [ ] 页面加载速度正常
- [ ] 图片资源正常显示
- [ ] API响应正常
- [ ] 数据库连接正常

### ✅ 安全检查
- [ ] HTTPS证书正常
- [ ] 环境变量已配置
- [ ] 敏感信息未暴露
- [ ] CORS配置正确

## 🚨 常见问题解决

### 1. 推送代码失败
```bash
# 如果遇到认证问题，使用Personal Access Token
# 在GitHub Settings > Developer settings > Personal access tokens创建token
# 使用token作为密码进行推送
```

### 2. 部署失败
- 检查package.json中的scripts配置
- 确认所有依赖都在package.json中
- 查看Vercel部署日志找到具体错误

### 3. 环境变量问题
- 确保所有必需的环境变量都已配置
- 检查变量名称是否正确（区分大小写）
- 重新部署以应用新的环境变量

### 4. 数据库连接问题
- 确认DATABASE_URL格式正确
- 检查Supabase项目是否正常运行
- 验证数据库防火墙设置

## 🎯 部署成功标志

当您看到以下内容时，说明部署成功：

1. **Vercel Dashboard显示**
   ```
   ✅ Deployment completed
   🌐 https://your-app.vercel.app
   ```

2. **访问网站正常**
   - 首页可以正常加载
   - 登录页面功能正常
   - 视频生成功能可用

3. **GitHub集成正常**
   - 推送代码自动触发部署
   - 部署状态在GitHub仓库中显示

恭喜！您的VEO AI平台已成功部署到GitHub + Vercel！🎉
