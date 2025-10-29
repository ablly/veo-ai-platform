# EdgeOne Pages 生产环境部署完整指南

## 📋 目录

1. [概述](#概述)
2. [准备阶段](#准备阶段)
3. [方案选择](#方案选择)
4. [Git 集成部署（推荐）](#git-集成部署推荐)
5. [环境变量配置](#环境变量配置)
6. [域名配置](#域名配置)
7. [HTTPS 配置](#https-配置)
8. [性能优化](#性能优化)
9. [监控与维护](#监控与维护)
10. [常见问题](#常见问题)

---

## 概述

### 什么是 EdgeOne Pages？

EdgeOne Pages 是腾讯云提供的**静态网站和 Jamstack 应用托管服务**，类似于：
- Vercel
- Netlify
- Cloudflare Pages

### 核心优势

**✅ 适合 VEO AI 的原因：**
1. **中国大陆加速**：支持备案域名在中国大陆高速访问
2. **自动构建**：Git 推送自动触发构建和部署
3. **免费额度充足**：每月 100GB 流量（足够初期使用）
4. **HTTPS 自动配置**：自动申请和续期 SSL 证书
5. **环境变量支持**：安全管理敏感配置（API 密钥等）
6. **边缘函数**：支持 Next.js API Routes 和 Server-Side Rendering

---

## 准备阶段

### ✅ 必备条件清单

#### 1. 域名和备案
- ✅ 域名：`veo-ai.site`
- ✅ **ICP备案号：蜀ICP备2025135924号**
- ✅ 域名解析权限（能够添加 CNAME 记录）

#### 2. 代码仓库
- ✅ GitHub 账号
- ✅ VEO AI 项目已推送到 GitHub
- ⚠️ 如果还未推送，参考[推送代码到 GitHub](#推送代码到-github)

#### 3. 腾讯云账号
- ✅ 已注册腾讯云账号
- ✅ 账号已实名认证
- 💡 EdgeOne Pages 免费版即可

#### 4. 环境变量
- ✅ 所有必需的环境变量已准备好（参考 `.env.example`）

---

## 推送代码到 GitHub

### 如果您的项目还未推送到 GitHub

**步骤 1：创建 GitHub 仓库**

1. 访问 https://github.com
2. 点击「New repository」
3. 填写信息：
   ```
   Repository name: veo-ai-platform
   Description: VEO AI Video Generation Platform
   Visibility: Private（推荐，保护代码隐私）
   ```
4. 点击「Create repository」

**步骤 2：推送代码**

在您的项目目录 `veo-ai-platform/` 执行：

```bash
# 初始化 Git（如果还未初始化）
git init

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/veo-ai-platform.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: VEO AI Platform"

# 推送到 GitHub
git push -u origin main
```

**⚠️ 重要：检查 `.gitignore`**

确保 `.env` 文件已被忽略：

```bash
# 检查 .gitignore 文件
cat .gitignore | grep .env
```

应该包含：
```
.env
.env.local
.env*.local
```

**绝对不要把 `.env` 文件推送到 GitHub！**

---

## 方案选择

### 方案对比

| 特性 | Git 集成部署 | 手动上传文件 |
|-----|------------|------------|
| **自动化** | ✅ 自动构建部署 | ❌ 手动打包上传 |
| **CI/CD** | ✅ Git 推送即部署 | ❌ 无 CI/CD |
| **版本控制** | ✅ Git 历史记录 | ❌ 无版本追踪 |
| **回滚** | ✅ 一键回滚 | ❌ 需要重新上传 |
| **团队协作** | ✅ 多人协作友好 | ❌ 难以协作 |
| **文件大小限制** | ✅ 无明显限制 | ❌ 单次上传 < 200MB |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**强烈推荐：Git 集成部署**

---

## Git 集成部署（推荐）

### 步骤 1：访问 EdgeOne Pages

1. 登录腾讯云控制台：https://console.cloud.tencent.com
2. 搜索「EdgeOne」或访问：https://console.cloud.tencent.com/edgeone
3. 点击「Pages 服务」

### 步骤 2：创建项目

1. 点击「新建项目」
2. 选择「从 Git 仓库导入」

### 步骤 3：连接 GitHub

**首次使用需要授权：**

1. 点击「连接 GitHub」
2. 登录 GitHub 账号
3. 授权腾讯云 EdgeOne 访问您的仓库
4. 选择授权范围：
   - ✅ 推荐：仅授权特定仓库（`veo-ai-platform`）
   - ⚠️ 不推荐：授权所有仓库

### 步骤 4：选择仓库

在仓库列表中找到并选择：
```
YOUR_USERNAME/veo-ai-platform
```

### 步骤 5：配置构建设置

**项目名称：**
```
veo-ai-platform
```

**构建配置：**

EdgeOne 会自动检测 Next.js 项目，但请确认以下配置：

```yaml
框架预设: Next.js

根目录: ./
  （如果 package.json 在根目录，保持 ./ 即可）

构建命令: npm run build

输出目录: .next

Node.js 版本: 18.x 或 20.x
  （推荐 20.x，更稳定）
```

**⚠️ 重要：Next.js 构建配置**

确保 `veo-ai-platform/next.config.js` 包含：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // EdgeOne Pages 部署配置
  output: 'standalone',
  
  // 图片优化配置
  images: {
    domains: [
      'hblthmkkdfkzvpywlthq.supabase.co', // Supabase Storage
      'www.veo-ai.site',
      'veo-ai.site',
    ],
    unoptimized: false, // 启用图片优化
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL,
  },
}

module.exports = nextConfig
```

### 步骤 6：配置环境变量

点击「环境变量」标签，添加以下变量：

**⚠️ 非常重要：所有环境变量必须在这里配置！**

```bash
# ===== 基础配置 =====
NODE_ENV=production
NEXTAUTH_URL=https://www.veo-ai.site
NEXTAUTH_SECRET=your_nextauth_secret_here

# ===== 数据库配置 =====
DATABASE_URL=postgresql://postgres.hblthmkkdfkzvpywlthq:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# ===== Supabase 配置 =====
NEXT_PUBLIC_SUPABASE_URL=https://hblthmkkdfkzvpywlthq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ===== 速创 API 配置 =====
SUCHUANG_API_KEY=your_suchuang_api_key_here

# ===== 邮件配置 =====
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=3533912007@qq.com
SMTP_PASSWORD=your_smtp_password_here

# ===== 支付宝支付配置（审核通过后添加）=====
# ALIPAY_APP_ID=your_app_id_here
# ALIPAY_PRIVATE_KEY=your_private_key_here
# ALIPAY_PUBLIC_KEY=your_public_key_here
# ALIPAY_NOTIFY_URL=https://www.veo-ai.site/api/payment/alipay/callback
# ALIPAY_RETURN_URL=https://www.veo-ai.site/payment/success

# ===== 微信登录配置（审核通过后添加）=====
# WECHAT_APP_ID=your_wechat_app_id_here
# WECHAT_APP_SECRET=your_wechat_app_secret_here
```

**💡 如何获取 NEXTAUTH_SECRET？**

在本地运行：
```bash
openssl rand -base64 32
```

复制输出的字符串作为 `NEXTAUTH_SECRET`。

**⚠️ 安全提示：**
- 生产环境的环境变量必须与本地不同
- 特别是 `NEXTAUTH_SECRET`，必须重新生成
- 绝不要在代码中硬编码敏感信息

### 步骤 7：部署配置

**分支配置：**
```
生产分支: main
  （每次推送到 main 分支会自动部署）

预览分支: 启用
  （PR 会自动创建预览环境）
```

**部署区域：**
```
✅ 选择：中国大陆
  （因为您有备案，可以使用中国大陆节点）

❌ 不要选择：仅海外
  （会影响中国大陆访问速度）
```

### 步骤 8：开始部署

1. 确认所有配置无误
2. 点击「创建并部署」
3. 等待构建完成（通常 5-10 分钟）

**构建日志：**
```
Cloning repository...
Installing dependencies...
Running npm install...
Building application...
Running npm run build...
Deployment successful!
```

### 步骤 9：获取部署地址

构建成功后，EdgeOne 会分配一个临时域名：
```
https://veo-ai-platform-xxx.pages.edgeone.com
```

访问此地址测试网站是否正常运行。

---

## 域名配置

### 绑定自定义域名

**步骤 1：在 EdgeOne Pages 添加域名**

1. 进入项目设置
2. 点击「域名管理」
3. 点击「添加域名」
4. 输入您的域名：
   ```
   www.veo-ai.site
   veo-ai.site
   ```

**步骤 2：选择主域名**

```
主域名: www.veo-ai.site
  （推荐使用 www 作为主域名）

重定向规则: 
  ✅ 启用
  veo-ai.site → www.veo-ai.site (301 永久重定向)
```

**为什么选择 www 作为主域名？**
- SEO 友好（避免重复内容）
- 更灵活（可以设置 CDN）
- 业界标准（大多数网站使用 www）

**步骤 3：配置 DNS 解析**

EdgeOne 会显示 CNAME 记录，类似：
```
记录类型: CNAME
主机记录: www
记录值: cname.edgeone.com
```

**在您的域名服务商（如阿里云、腾讯云）配置 DNS：**

1. 登录域名管理控制台
2. 找到 `veo-ai.site` 的 DNS 解析设置
3. 添加以下记录：

**记录 1：www 子域名**
```
记录类型: CNAME
主机记录: www
记录值: [EdgeOne 提供的 CNAME 值]
TTL: 600
```

**记录 2：根域名重定向**
```
方式 A: 使用 CNAME（如果服务商支持）
  记录类型: CNAME
  主机记录: @
  记录值: [EdgeOne 提供的 CNAME 值]
  TTL: 600

方式 B: 使用 URL 转发（如果方式 A 不支持）
  主机记录: @
  转发类型: 301 永久重定向
  转发目标: https://www.veo-ai.site
```

**步骤 4：等待 DNS 生效**

- 通常 5-10 分钟
- 最长可能需要 24-48 小时
- 可以使用 `nslookup` 检查：
  ```bash
  nslookup www.veo-ai.site
  ```

**步骤 5：验证域名**

EdgeOne 会自动验证域名是否正确解析。验证通过后，域名状态会变为「已生效」。

---

## HTTPS 配置

### 自动 SSL 证书（推荐）

EdgeOne Pages 会自动为您的域名申请和配置 SSL 证书。

**步骤 1：等待证书申请**

域名验证通过后，EdgeOne 会自动：
1. 向 Let's Encrypt 申请 SSL 证书
2. 配置 HTTPS
3. 设置自动续期

**时间：** 通常 5-15 分钟

**步骤 2：强制 HTTPS**

在域名设置中启用：
```
✅ 强制 HTTPS
  （自动将 HTTP 请求重定向到 HTTPS）

✅ HSTS
  （增强安全性）
```

**步骤 3：验证 HTTPS**

访问 `https://www.veo-ai.site`，检查：
- ✅ 显示绿色锁图标
- ✅ 证书有效
- ✅ 没有混合内容警告

### 上传自定义证书（可选）

如果您已有 SSL 证书（如购买的通配符证书），可以手动上传：

1. 进入「域名管理」→「SSL 证书」
2. 点击「上传证书」
3. 填写：
   ```
   证书内容: [证书 .crt 文件内容]
   私钥: [私钥 .key 文件内容]
   ```
4. 保存

---

## 环境变量配置

### 生产环境特殊配置

**数据库连接：**

⚠️ 使用 **Session Pooler** 而不是 Direct Connection：

```bash
# ✅ 正确（使用 Pooler，支持 IPv4）
DATABASE_URL=postgresql://postgres.hblthmkkdfkzvpywlthq:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# ❌ 错误（Direct Connection，仅支持 IPv6）
DATABASE_URL=postgresql://postgres.hblthmkkdfkzvpywlthq:[PASSWORD]@db.hblthmkkdfkzvpywlthq.supabase.co:5432/postgres
```

**NEXTAUTH_URL：**

必须使用生产域名：
```bash
NEXTAUTH_URL=https://www.veo-ai.site
```

**邮件发送：**

如果使用 QQ 邮箱，确保：
```bash
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=3533912007@qq.com
SMTP_PASSWORD=[QQ邮箱授权码，不是登录密码！]
```

**如何获取 QQ 邮箱授权码？**
1. 登录 QQ 邮箱
2. 设置 → 账户
3. 开启 SMTP 服务
4. 生成授权码
5. 使用授权码作为 `SMTP_PASSWORD`

---

## 性能优化

### 1. 启用 CDN 加速

EdgeOne 自动提供 CDN 加速，但可以进一步优化：

**缓存规则：**

在 EdgeOne 控制台配置：
```
路径: /images/*
缓存时间: 30 天

路径: /_next/static/*
缓存时间: 365 天

路径: /api/*
缓存时间: 不缓存
```

### 2. 图片优化

确保 `next.config.js` 启用图片优化：
```javascript
images: {
  domains: ['hblthmkkdfkzvpywlthq.supabase.co'],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}
```

### 3. 启用 Gzip/Brotli 压缩

EdgeOne 默认启用，无需配置。

### 4. 数据库连接池

使用 Supabase Session Pooler（已配置）：
- ✅ 连接复用
- ✅ 降低延迟
- ✅ 支持更多并发

---

## 监控与维护

### 1. 部署通知

配置 GitHub Webhook 或邮件通知：
- ✅ 部署成功通知
- ✅ 部署失败通知
- ✅ 构建日志

### 2. 错误监控

**查看运行日志：**

EdgeOne Pages 提供实时日志：
1. 进入项目控制台
2. 点击「部署日志」
3. 查看最近的部署和错误

**集成 Sentry（可选）：**

```bash
npm install @sentry/nextjs
```

配置 `sentry.config.js`（参考官方文档）。

### 3. 流量监控

在 EdgeOne 控制台查看：
- 请求次数
- 流量使用
- 响应时间
- 错误率

### 4. 备份策略

**Git 仓库即备份：**
- 所有代码都在 GitHub
- 可以随时回滚到任意版本

**数据库备份：**
- Supabase 自动备份
- 或手动导出数据

---

## 自动化部署工作流

### Git 推送自动部署

配置完成后，部署变得非常简单：

```bash
# 1. 修改代码
vim src/app/page.tsx

# 2. 提交更改
git add .
git commit -m "Update homepage"

# 3. 推送到 GitHub
git push origin main

# 4. EdgeOne 自动检测推送，开始构建和部署
# 5. 约 5 分钟后，新版本自动上线！
```

### 预览环境（PR Preview）

创建 Pull Request 时，EdgeOne 会自动创建预览环境：

```bash
# 1. 创建功能分支
git checkout -b feature/new-payment

# 2. 开发新功能
# ... 修改代码 ...

# 3. 推送分支
git push origin feature/new-payment

# 4. 在 GitHub 创建 Pull Request

# 5. EdgeOne 自动部署预览环境
# 预览 URL: https://veo-ai-platform-pr-123.pages.edgeone.com
```

**优势：**
- ✅ 在合并前预览效果
- ✅ 团队成员可以测试
- ✅ 不影响生产环境

---

## 常见问题

### Q1: 构建失败怎么办？

**常见错误 1：依赖安装失败**

```
Error: Cannot find module 'xxx'
```

**解决：**
- 检查 `package.json` 是否包含所有依赖
- 在本地运行 `npm install` 确认无误
- 删除 `node_modules` 和 `package-lock.json`，重新安装

**常见错误 2：环境变量缺失**

```
Error: DATABASE_URL is not defined
```

**解决：**
- 检查 EdgeOne Pages 的环境变量配置
- 确保所有必需的变量都已添加
- 注意变量名拼写和大小写

**常见错误 3：Next.js 构建错误**

```
Error: Build optimization failed
```

**解决：**
- 检查代码是否有语法错误
- 运行 `npm run build` 在本地复现问题
- 查看详细的构建日志

### Q2: 网站部署成功但无法访问？

**可能原因 1：DNS 未生效**

**解决：**
```bash
# 检查 DNS 解析
nslookup www.veo-ai.site

# 如果返回正确的 IP 或 CNAME，说明 DNS 已生效
```

**可能原因 2：域名未绑定或未验证**

**解决：**
- 检查 EdgeOne 控制台域名状态
- 确保域名显示「已生效」
- 重新验证域名

**可能原因 3：浏览器缓存**

**解决：**
- 清除浏览器缓存
- 使用无痕模式访问
- 使用 `curl` 测试：
  ```bash
  curl -I https://www.veo-ai.site
  ```

### Q3: HTTPS 证书错误？

**错误：ERR_CERT_COMMON_NAME_INVALID**

**解决：**
- 等待 SSL 证书申请完成（可能需要 15 分钟）
- 检查域名是否正确绑定
- 刷新 SSL 证书

### Q4: 环境变量更新后没有生效？

**原因：** 环境变量更改需要重新部署。

**解决：**
1. 更新环境变量后，点击「重新部署」
2. 或推送一个空提交触发部署：
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

### Q5: 数据库连接失败？

**错误：getaddrinfo ENOTFOUND**

**解决：**
- 确认使用 **Session Pooler** 而不是 Direct Connection
- 检查 `DATABASE_URL` 是否正确
- 确认 Supabase 项目未暂停

### Q6: 部署后 API Routes 返回 404？

**原因：** Next.js 配置问题。

**解决：**

检查 `next.config.js`：
```javascript
module.exports = {
  output: 'standalone', // 必须有这一行
}
```

### Q7: 图片无法加载？

**错误：Invalid src prop**

**解决：**

在 `next.config.js` 添加图片域名：
```javascript
images: {
  domains: [
    'hblthmkkdfkzvpywlthq.supabase.co',
    'www.veo-ai.site',
  ],
}
```

### Q8: 如何回滚到之前的版本？

**方法 1：通过 Git**

```bash
# 查看提交历史
git log --oneline

# 回滚到指定版本
git revert <commit-hash>
git push origin main

# EdgeOne 会自动部署回滚后的版本
```

**方法 2：通过 EdgeOne 控制台**

1. 进入「部署历史」
2. 找到想要恢复的部署
3. 点击「回滚到此版本」

---

## 部署检查清单

在正式部署前，请确认以下所有项目：

### 代码准备
- [ ] 所有代码已提交到 GitHub
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] `next.config.js` 配置正确
- [ ] 本地运行 `npm run build` 无错误

### EdgeOne Pages 配置
- [ ] 项目已创建
- [ ] 仓库已连接
- [ ] 构建命令正确：`npm run build`
- [ ] 输出目录正确：`.next`
- [ ] Node.js 版本正确：18.x 或 20.x
- [ ] 所有环境变量已配置

### 域名配置
- [ ] 域名已添加到 EdgeOne Pages
- [ ] DNS 记录已配置
- [ ] DNS 已生效（nslookup 验证）
- [ ] 主域名设置为 `www.veo-ai.site`
- [ ] 根域名重定向到 `www`

### HTTPS 配置
- [ ] SSL 证书已自动申请
- [ ] 强制 HTTPS 已启用
- [ ] 访问 https://www.veo-ai.site 显示绿色锁

### 功能测试
- [ ] 首页正常显示
- [ ] 用户注册/登录正常
- [ ] 视频生成功能正常
- [ ] 邮件发送正常
- [ ] 数据库读写正常
- [ ] 图片加载正常
- [ ] 备案号正确显示

### 支付和第三方服务
- [ ] 支付宝回调地址配置正确（如果已申请）
- [ ] 微信登录回调域配置正确（如果已申请）
- [ ] 所有 API 密钥有效

---

## 成本估算

### EdgeOne Pages 免费额度

**每月免费额度：**
- ✅ 100GB 流量
- ✅ 100GB 带宽
- ✅ 无限构建次数
- ✅ 无限部署次数

**超出免费额度后的费用：**
- 流量：¥0.20/GB
- 带宽：¥0.50/GB

**预估（VEO AI 初期）：**
- 假设每天 100 个用户访问
- 每次访问传输 5MB 数据
- 每月流量：100 × 5MB × 30 = 15GB
- **费用：¥0（在免费额度内）**

**业务增长后：**
- 当月流量超过 100GB，开始按量计费
- 可以考虑升级到 EdgeOne 标准版（有更多优化选项）

---

## 总结

**使用 EdgeOne Pages 部署 VEO AI 的优势：**

1. ✅ **自动化部署**：Git 推送即部署，省时省力
2. ✅ **中国大陆加速**：备案域名可使用国内节点，访问速度快
3. ✅ **免费额度充足**：初期完全免费
4. ✅ **HTTPS 自动配置**：无需手动管理证书
5. ✅ **环境变量管理**：安全便捷
6. ✅ **易于维护**：回滚、监控、日志一应俱全

**部署时间线：**
- 推送代码到 GitHub：10 分钟
- 创建 EdgeOne 项目：5 分钟
- 配置构建和环境变量：10 分钟
- 首次构建部署：5-10 分钟
- 配置域名和 DNS：15 分钟
- SSL 证书申请：5-15 分钟
- **总计：约 1 小时**

**后续部署：**
- 修改代码 → `git push` → 5 分钟后自动上线
- 无需任何手动操作！

祝您部署顺利！🚀

