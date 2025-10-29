# Vercel环境变量配置指南

## 🔧 必需的环境变量

在Vercel Dashboard中配置以下环境变量：

### 1. 数据库配置
```bash
DATABASE_URL
```
**值示例：** `postgresql://postgres:[password]@db.[project-id].supabase.co:6543/postgres?pgbouncer=true`
**获取方式：** Supabase项目 → Settings → Database → Connection string

### 2. NextAuth配置
```bash
NEXTAUTH_URL
```
**值示例：** `https://your-app.vercel.app`
**说明：** 部署后Vercel会提供域名，填入完整URL

```bash
NEXTAUTH_SECRET
```
**值示例：** `your-super-secret-key-at-least-32-characters-long`
**生成方式：** 
```bash
# 在终端运行
openssl rand -base64 32
```
或访问：https://generate-secret.vercel.app/32

### 3. 邮件服务配置
```bash
SMTP_HOST
```
**值：** `smtp.qq.com`

```bash
SMTP_PORT
```
**值：** `587`

```bash
SMTP_USER
```
**值示例：** `your-email@qq.com`
**说明：** 您的QQ邮箱地址

```bash
SMTP_PASSWORD
```
**值示例：** `your-email-auth-code`
**获取方式：** QQ邮箱 → 设置 → 账户 → 开启SMTP服务 → 获取授权码

### 4. API服务配置
```bash
SUCHUANG_API_KEY
```
**值示例：** `your-suchuang-api-key`
**获取方式：** 速创API平台申请

## 🎯 可选的环境变量

### 支付宝配置（如果需要支付功能）
```bash
ALIPAY_APP_ID
ALIPAY_PRIVATE_KEY
ALIPAY_PUBLIC_KEY
ALIPAY_NOTIFY_URL
ALIPAY_RETURN_URL
ALIPAY_GATEWAY
ALIPAY_SIGN_TYPE
ALIPAY_CHARSET
```

### GitHub登录配置（如果需要GitHub登录）
```bash
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

## 📋 Vercel环境变量配置步骤

### 步骤1：进入项目设置
1. 登录 https://vercel.com
2. 找到您的 `veo-ai-platform` 项目
3. 点击项目名称进入详情页
4. 点击 "Settings" 标签

### 步骤2：添加环境变量
1. 在左侧菜单选择 "Environment Variables"
2. 点击 "Add New" 按钮
3. 填入变量名和值
4. 选择环境：Production, Preview, Development（建议全选）
5. 点击 "Save"

### 步骤3：重新部署
1. 添加完所有环境变量后
2. 进入 "Deployments" 标签
3. 点击最新部署右侧的三个点
4. 选择 "Redeploy"
5. 等待重新部署完成

## 🔍 环境变量验证

部署完成后，访问以下URL验证配置：

```bash
# 检查数据库连接
https://your-app.vercel.app/api/health

# 检查邮件服务
https://your-app.vercel.app/login
# 尝试发送邮箱验证码

# 检查视频生成API
https://your-app.vercel.app/generate
# 尝试生成视频
```

## 🚨 常见配置错误

### 1. DATABASE_URL格式错误
❌ 错误：`postgresql://user:pass@host/db`
✅ 正确：`postgresql://user:pass@host:6543/db?pgbouncer=true`

### 2. NEXTAUTH_URL不匹配
❌ 错误：`http://localhost:3000`
✅ 正确：`https://your-app.vercel.app`

### 3. SMTP_PASSWORD使用登录密码
❌ 错误：使用QQ邮箱登录密码
✅ 正确：使用QQ邮箱SMTP授权码

### 4. 环境变量名称错误
❌ 错误：`database_url`（小写）
✅ 正确：`DATABASE_URL`（大写）

## 💡 配置技巧

### 1. 批量复制配置
创建一个文本文件，格式如下：
```
DATABASE_URL=your_value
NEXTAUTH_URL=your_value
NEXTAUTH_SECRET=your_value
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your_email@qq.com
SMTP_PASSWORD=your_auth_code
SUCHUANG_API_KEY=your_api_key
```

### 2. 使用Vercel CLI
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 批量设置环境变量
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

### 3. 环境变量模板
复制 `env.production.example` 文件内容，替换为实际值后逐个添加到Vercel。

## ✅ 配置完成检查清单

- [ ] DATABASE_URL - 数据库连接
- [ ] NEXTAUTH_URL - 认证服务URL  
- [ ] NEXTAUTH_SECRET - 认证密钥
- [ ] SMTP_HOST - 邮件服务器
- [ ] SMTP_PORT - 邮件端口
- [ ] SMTP_USER - 邮箱地址
- [ ] SMTP_PASSWORD - 邮箱授权码
- [ ] SUCHUANG_API_KEY - API密钥
- [ ] 重新部署项目
- [ ] 测试网站功能

配置完成后，您的VEO AI平台就可以正常运行了！🎉
