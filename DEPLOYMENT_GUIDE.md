# VEO AI平台部署指南

## 🚀 部署方案选择

### 方案1：Vercel部署（推荐）

Vercel是Next.js的最佳部署平台，支持自动部署和环境变量管理。

#### 步骤1：安装Vercel CLI
```bash
npm install -g vercel
```

#### 步骤2：登录Vercel
```bash
vercel login
```

#### 步骤3：部署项目
```bash
vercel --prod
```

#### 步骤4：配置环境变量
在Vercel Dashboard中配置以下环境变量：

```bash
# 数据库配置
DATABASE_URL=your_supabase_database_url

# NextAuth配置
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_secret_key

# 邮件服务配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your_email@qq.com
SMTP_PASSWORD=your_email_password

# API配置
SUCHUANG_API_KEY=your_suchuang_api_key

# 支付宝配置（如果需要）
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key
ALIPAY_NOTIFY_URL=https://your-app.vercel.app/api/payment/alipay/callback
ALIPAY_RETURN_URL=https://your-app.vercel.app/payment/success
```

---

### 方案2：手动GitHub + Vercel部署

#### 步骤1：创建GitHub仓库
1. 访问 https://github.com/new
2. 仓库名称：`veo-ai-platform`
3. 描述：`VEO AI视频生成平台 - 基于最新VEO 3.1模型`
4. 选择Public
5. 点击"Create repository"

#### 步骤2：推送代码到GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/veo-ai-platform.git
git branch -M main
git push -u origin main
```

#### 步骤3：连接Vercel
1. 访问 https://vercel.com
2. 点击"Import Project"
3. 选择GitHub仓库
4. 配置环境变量
5. 点击Deploy

---

### 方案3：EdgeOne Pages部署

使用腾讯云EdgeOne Pages部署：

#### 步骤1：构建项目
```bash
npm run build
npm run export
```

#### 步骤2：上传到EdgeOne
1. 登录腾讯云EdgeOne控制台
2. 选择Pages服务
3. 上传out目录中的文件
4. 配置域名和SSL

---

## 🔧 部署前准备

### 1. 环境变量检查
确保以下环境变量已正确配置：

```bash
# 必需的环境变量
DATABASE_URL=          # Supabase数据库连接
NEXTAUTH_URL=          # 应用URL
NEXTAUTH_SECRET=       # NextAuth密钥
SMTP_USER=             # 邮箱服务
SMTP_PASSWORD=         # 邮箱密码
SUCHUANG_API_KEY=      # 视频生成API
```

### 2. 数据库迁移
确保Supabase数据库已执行手机号登录迁移：
- users表已添加phone字段
- phone_verification_codes表已创建
- 相关索引和函数已创建

### 3. 域名配置
如果使用自定义域名：
- 配置DNS记录
- 设置SSL证书
- 更新NEXTAUTH_URL环境变量

---

## 📱 功能验证

部署完成后，验证以下功能：

### 登录功能
- ✅ 邮箱密码登录
- ✅ 邮箱验证码登录
- ✅ 手机号验证码登录

### 核心功能
- ✅ 视频生成功能
- ✅ 积分系统
- ✅ 用户注册
- ✅ 支付功能（如果配置）

### 页面访问
- ✅ 首页加载
- ✅ 登录注册页面
- ✅ 用户个人中心
- ✅ 视频生成页面

---

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查DATABASE_URL是否正确
   - 确认Supabase项目状态
   - 验证网络连接

2. **邮件发送失败**
   - 检查SMTP配置
   - 确认邮箱授权码
   - 验证防火墙设置

3. **NextAuth错误**
   - 检查NEXTAUTH_URL是否匹配部署域名
   - 确认NEXTAUTH_SECRET已设置
   - 验证回调URL配置

4. **手机验证码功能**
   - 开发环境：验证码显示在控制台
   - 生产环境：需要集成短信服务

---

## 🚀 性能优化

### 1. 图片优化
- 使用Next.js Image组件
- 配置图片CDN
- 启用WebP格式

### 2. 缓存策略
- 配置静态资源缓存
- 使用Redis缓存（可选）
- 启用浏览器缓存

### 3. 监控配置
- 配置错误监控（Sentry）
- 设置性能监控
- 配置日志收集

---

## 📞 技术支持

如遇到部署问题：
1. 检查环境变量配置
2. 查看部署日志
3. 验证数据库连接
4. 测试API端点

部署成功后，您的VEO AI平台将支持：
- 🔐 多种登录方式（邮箱、手机号）
- 🎬 AI视频生成
- 💰 积分系统
- 💳 支付功能
- 📱 响应式设计
- 🔒 安全认证
