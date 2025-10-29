# 🚀 VEO AI平台 - 快速部署指南

## ⚡ 最快部署方法（3分钟完成）

### 准备工作
- ✅ 已完成：代码已准备好
- ✅ 已完成：数据库已配置（Supabase）
- ⏳ 待完成：GitHub账号（免费）
- ⏳ 待完成：Vercel账号（免费）

---

## 📋 部署步骤

### 步骤1️⃣：创建GitHub仓库（1分钟）

**打开浏览器，访问：**
```
https://github.com/new
```

**填写信息：**
```
Repository name: veo-ai-platform
Description: VEO AI视频生成平台
Visibility: Public ✅（推荐，Vercel免费用户需要）
```

**重要：不要勾选任何选项！**
- ❌ 不勾选 "Add a README file"
- ❌ 不勾选 "Add .gitignore"
- ❌ 不勾选 "Choose a license"

**点击绿色按钮：Create repository**

---

### 步骤2️⃣：推送代码到GitHub（1分钟）

**方法A：使用自动化脚本（推荐）**

在当前目录运行：
```powershell
.\deploy-github.bat
```

脚本会自动：
- ✅ 检查Git状态
- ✅ 提交未保存的更改
- ✅ 添加GitHub远程仓库
- ✅ 推送所有代码

**方法B：手动执行命令**

```powershell
# 替换YOUR_USERNAME为您的GitHub用户名
git remote add origin https://github.com/YOUR_USERNAME/veo-ai-platform.git
git branch -M main
git push -u origin main
```

**认证说明：**
- 用户名：您的GitHub用户名
- 密码：使用Personal Access Token（不是登录密码！）
- Token创建：https://github.com/settings/tokens

---

### 步骤3️⃣：部署到Vercel（1分钟）

**① 访问Vercel**
```
https://vercel.com
```

**② 使用GitHub账号登录**
- 点击 "Continue with GitHub"
- 授权Vercel访问GitHub

**③ 导入项目**
- 点击 "New Project"
- 找到 `veo-ai-platform` 仓库
- 点击 "Import"

**④ 配置项目**
```
Framework Preset: Next.js ✅（自动检测）
Root Directory: ./
Build Command: npm run build
Output Directory: .next
```

**⑤ 点击Deploy**
- 等待2-3分钟
- 部署完成！🎉

---

### 步骤4️⃣：配置环境变量（可选，建议完成）

**进入Vercel项目设置：**
1. 点击项目名称
2. 点击 "Settings"
3. 选择 "Environment Variables"

**必需的环境变量：**

| 变量名 | 值示例 | 获取方式 |
|--------|--------|----------|
| `DATABASE_URL` | `postgresql://...` | Supabase → Settings → Database |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Vercel部署后提供 |
| `NEXTAUTH_SECRET` | `随机32位字符` | [生成器](https://generate-secret.vercel.app/32) |
| `SMTP_USER` | `your@qq.com` | 您的QQ邮箱 |
| `SMTP_PASSWORD` | `授权码` | QQ邮箱→设置→账户→SMTP授权码 |
| `SUCHUANG_API_KEY` | `sk-xxx` | 速创API平台 |

**添加环境变量后：**
- 点击 "Redeploy" 重新部署
- 等待部署完成

---

## ✅ 部署完成验证

### 访问您的网站
```
https://your-app.vercel.app
```

### 测试功能
- ✅ 首页加载正常
- ✅ 登录功能（邮箱/手机号）
- ✅ 注册功能
- ✅ 视频生成功能

---

## 🔗 重要链接

### GitHub相关
- 创建仓库：https://github.com/new
- Personal Access Token：https://github.com/settings/tokens
- 您的仓库：https://github.com/YOUR_USERNAME/veo-ai-platform

### Vercel相关
- Vercel登录：https://vercel.com
- 新建项目：https://vercel.com/new
- 环境变量生成：https://generate-secret.vercel.app/32

### 文档相关
- 详细部署指南：[GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md)
- 环境变量配置：[vercel-env-setup.md](./vercel-env-setup.md)
- 完整部署文档：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🆘 遇到问题？

### 推送代码失败
**问题：** `Authentication failed`
**解决：** 
1. 创建Personal Access Token：https://github.com/settings/tokens
2. 勾选 `repo` 权限
3. 使用Token作为密码

### Vercel部署失败
**问题：** 构建错误
**解决：**
1. 查看部署日志找到具体错误
2. 确保所有依赖在package.json中
3. 检查环境变量是否配置

### 网站功能异常
**问题：** 登录/注册失败
**解决：**
1. 检查环境变量是否配置
2. 确认DATABASE_URL正确
3. 验证SMTP配置

---

## 🎯 推荐配置

### 自定义域名
1. 在Vercel项目中添加域名
2. 配置DNS记录
3. 更新环境变量中的URL

### 性能优化
- 启用Vercel Analytics
- 配置图片优化
- 设置缓存策略

### 安全加固
- 配置CORS策略
- 启用安全头
- 定期更新依赖

---

## 🎉 恭喜！

您的VEO AI平台已成功部署！

**下一步：**
- 📱 在手机上测试
- 🔗 分享给朋友
- 💰 配置支付功能（可选）
- 🎨 自定义样式和内容

**技术支持：**
如有问题，请查看详细文档或GitHub Issues。

祝您使用愉快！🚀✨
