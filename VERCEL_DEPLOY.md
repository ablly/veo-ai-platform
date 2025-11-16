# Vercel 部署指南 - VEO AI 平台

## 🎯 为什么选择 Vercel

- ✅ **完全免费** - 免费额度足够使用
- ✅ **零配置** - 自动识别 Next.js 项目
- ✅ **全球 CDN** - 自动全球加速
- ✅ **自动 HTTPS** - 免费 SSL 证书
- ✅ **自动部署** - Git 推送自动部署
- ✅ **支持自定义域名** - veo-ai.site 可以用

---

## 🚀 快速部署（5分钟）

### 方法 1：通过 Vercel 网站（推荐，最简单）

#### 步骤 1：注册 Vercel 账号

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（推荐）
4. 授权 Vercel 访问你的 GitHub

#### 步骤 2：导入项目

1. 登录后点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 找到并选择 `veo-ai-platform` 仓库
4. 点击 "Import"

#### 步骤 3：配置项目

Vercel 会自动检测到 Next.js 项目，默认配置即可：

- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: ./
- **Build Command**: `npm run build`（自动）
- **Output Directory**: `.next`（自动）
- **Install Command**: `npm install`（自动）

点击 "Deploy" 开始部署！

#### 步骤 4：配置环境变量

部署会失败（因为缺少环境变量），这是正常的。

1. 进入项目 Settings → Environment Variables
2. 添加所有环境变量：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# NextAuth 配置
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://veo-ai.site

# Supabase 配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# 速创 API 配置
SUCHUANG_API_KEY=your-api-key
SUCHUANG_API_URL=https://api.wuyinkeji.com
VEO_COST_PER_VIDEO=1.1

# 支付宝配置（可选）
ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=your-public-key

# 短信配置（可选）
TENCENT_SMS_APP_ID=your-app-id
TENCENT_SMS_APP_KEY=your-app-key
TENCENT_SMS_SIGN_NAME=your-sign-name
TENCENT_SMS_TEMPLATE_ID=your-template-id
```

**重要提示：**
- 所有环境变量都要添加到 **Production**、**Preview** 和 **Development** 三个环境
- `NEXTAUTH_URL` 先填临时域名，绑定自定义域名后再改

#### 步骤 5：重新部署

1. 回到 Deployments 页面
2. 点击最新的部署
3. 点击右上角 "..." → "Redeploy"
4. 等待部署完成（约 2-3 分钟）

#### 步骤 6：绑定自定义域名

1. 进入项目 Settings → Domains
2. 点击 "Add Domain"
3. 输入 `veo-ai.site`
4. Vercel 会提示需要配置 DNS

**在腾讯云 DNS 管理中添加记录：**

```
类型: CNAME
主机记录: @
记录值: cname.vercel-dns.com
TTL: 600

类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

或者使用 A 记录（如果 CNAME 不支持根域名）：

```
类型: A
主机记录: @
记录值: 76.76.21.21
TTL: 600

类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

5. 等待 DNS 生效（5-30分钟）
6. Vercel 自动配置 HTTPS ✅

#### 步骤 7：更新 NEXTAUTH_URL

DNS 生效后：

1. 回到 Settings → Environment Variables
2. 找到 `NEXTAUTH_URL`
3. 修改为 `https://veo-ai.site`
4. 保存并重新部署

---

### 方法 2：通过 Vercel CLI（适合开发者）

#### 步骤 1：安装 Vercel CLI

```bash
npm i -g vercel
```

#### 步骤 2：登录

```bash
vercel login
```

会打开浏览器，选择 GitHub 登录

#### 步骤 3：部署

```bash
cd veo-ai-platform
vercel
```

按照提示操作：
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- What's your project's name? **veo-ai-platform**
- In which directory is your code located? **./**
- Want to override the settings? **N**

#### 步骤 4：配置环境变量

```bash
# 添加环境变量
vercel env add DATABASE_URL production
# 粘贴你的数据库 URL

vercel env add NEXTAUTH_SECRET production
# 粘贴你的密钥

# ... 添加所有其他环境变量
```

或者在 Vercel 网站上添加（更方便）

#### 步骤 5：生产部署

```bash
vercel --prod
```

---

## 📋 环境变量完整清单

### 必需的环境变量

```env
# 数据库（必需）
DATABASE_URL=postgresql://...

# NextAuth（必需）
NEXTAUTH_SECRET=生成一个随机字符串
NEXTAUTH_URL=https://veo-ai.site

# Supabase（必需）
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=你的服务密钥

# 速创 API（必需）
SUCHUANG_API_KEY=你的API密钥
SUCHUANG_API_URL=https://api.wuyinkeji.com
VEO_COST_PER_VIDEO=1.1
```

### 可选的环境变量

```env
# 支付宝支付（可选）
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 短信服务（可选）
TENCENT_SMS_APP_ID=
TENCENT_SMS_APP_KEY=
TENCENT_SMS_SIGN_NAME=
TENCENT_SMS_TEMPLATE_ID=

# 邮件服务（可选）
RESEND_API_KEY=

# 微信登录（可选）
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

### 生成 NEXTAUTH_SECRET

```bash
# 方法 1：使用 OpenSSL
openssl rand -base64 32

# 方法 2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法 3：在线生成
# 访问 https://generate-secret.vercel.app/32
```

---

## 🔄 自动部署

配置完成后，每次推送到 GitHub 都会自动部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Vercel 会自动：
1. 检测到推送
2. 开始构建
3. 运行测试
4. 部署到生产环境
5. 发送通知

---

## 📊 Vercel 免费额度

| 资源 | 免费额度 | 说明 |
|------|---------|------|
| 带宽 | 100GB/月 | 足够初期使用 |
| 构建时间 | 6000分钟/月 | 每次构建约2分钟 |
| Serverless 执行 | 100GB-小时 | API Routes 执行时间 |
| 部署数量 | 无限 | 每次推送都部署 |
| 自定义域名 | 无限 | 免费 HTTPS |
| 团队成员 | 1个 | 个人项目够用 |

**超出免费额度怎么办？**
- 升级到 Pro 版：$20/月
- 或者优化资源使用

---

## 🎯 部署后检查清单

- [ ] 网站可以访问（临时域名）
- [ ] 自定义域名已绑定
- [ ] HTTPS 正常工作
- [ ] 用户可以注册登录
- [ ] 视频生成功能正常
- [ ] 数据库连接正常
- [ ] Supabase Storage 正常
- [ ] 支付功能正常（如果配置）
- [ ] 自动部署已配置

---

## 🔧 常见问题

### Q1: 部署失败怎么办？

查看构建日志：
1. 进入 Deployments
2. 点击失败的部署
3. 查看 "Build Logs"
4. 根据错误信息修复

常见错误：
- 环境变量缺失 → 添加环境变量
- 数据库连接失败 → 检查 DATABASE_URL
- 构建超时 → 优化依赖或升级套餐

### Q2: 域名配置后无法访问？

1. 检查 DNS 是否生效：`nslookup veo-ai.site`
2. 等待 DNS 传播（最多 48 小时，通常 5-30 分钟）
3. 清除浏览器缓存
4. 尝试无痕模式访问

### Q3: API Routes 超时？

Vercel Serverless Functions 有 10 秒超时限制（免费版）

解决方案：
- 优化 API 响应速度
- 使用后台任务处理长时间操作
- 升级到 Pro 版（60 秒超时）

### Q4: 如何查看日志？

1. 进入项目 → Deployments
2. 点击部署 → "Functions"
3. 查看实时日志

或者使用 Vercel CLI：
```bash
vercel logs
```

### Q5: 如何回滚到之前的版本？

1. 进入 Deployments
2. 找到之前的成功部署
3. 点击 "..." → "Promote to Production"

---

## 💡 性能优化建议

### 1. 启用 Edge Functions（可选）

某些 API 可以部署到 Edge Runtime，速度更快：

```typescript
// src/app/api/example/route.ts
export const runtime = 'edge'
```

### 2. 配置缓存

在 `next.config.ts` 中：

```typescript
const nextConfig = {
  // ... 其他配置
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

### 3. 优化图片

使用 Next.js Image 组件：

```tsx
import Image from 'next/image'

<Image 
  src="/image.jpg" 
  width={500} 
  height={300} 
  alt="描述"
/>
```

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 文档**: https://nextjs.org/docs
- **Vercel 社区**: https://github.com/vercel/vercel/discussions
- **Vercel 支持**: support@vercel.com

---

## 🎉 部署完成！

部署成功后，你的网站将在：
- 🌐 https://veo-ai-platform.vercel.app（临时域名）
- 🌐 https://veo-ai.site（自定义域名）
- 🌐 https://www.veo-ai.site

**享受零成本、全球加速的 Next.js 部署体验！** 🚀

---

**下一步：**
1. 测试所有功能
2. 配置自定义域名
3. 邀请用户测试
4. 开始推广！
