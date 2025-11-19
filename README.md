# 🎬 VEO AI Platform

基于Next.js的AI视频生成平台，支持多种支付方式和完整的用户管理系统。

## ✨ 主要功能

- 🎥 AI视频生成（基于VEO-2模型）
- 💳 双支付系统（支付宝 + Stripe）
- 📧 邮箱验证码登录
- 📱 手机验证码登录
- 🎫 积分系统
- 👥 用户管理
- 📊 管理后台
- 🌍 国际化支持（中文/英文）

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd veo-ai-platform
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入真实的配置
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 📚 文档

所有文档位于 `docs/` 文件夹：

- [Vercel部署完整指南](docs/VERCEL_部署完整指南.md) - 详细的部署步骤
- [Stripe集成操作手册](docs/STRIPE_集成操作手册.md) - Stripe支付配置
- [邮箱真实性验证](docs/邮箱真实性验证实施报告.md) - 防止垃圾注册
- [验证码时区问题修复](docs/验证码时区问题修复报告.md) - 验证码问题解决方案

## 🔐 环境变量

详细的环境变量说明请查看 [Vercel部署完整指南](docs/VERCEL_部署完整指南.md#环境变量配置)

必需的环境变量：
- `DATABASE_URL` - Supabase数据库连接
- `NEXTAUTH_SECRET` - NextAuth密钥
- `STRIPE_SECRET_KEY` - Stripe支付密钥
- `ALIPAY_PRIVATE_KEY` - 支付宝私钥
- `SMTP_PASSWORD` - 邮箱授权码
- `TENCENT_SMS_SECRET_KEY` - 腾讯云短信密钥

## 🛠️ 技术栈

- **框架：** Next.js 14
- **数据库：** PostgreSQL (Supabase)
- **认证：** NextAuth.js
- **支付：** Stripe + 支付宝
- **邮件：** Nodemailer
- **短信：** 腾讯云短信
- **样式：** Tailwind CSS
- **UI组件：** shadcn/ui

## 📦 项目结构

```
veo-ai-platform/
├── docs/                    # 文档
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API路由
│   │   ├── admin/         # 管理后台
│   │   └── pricing/       # 定价页面
│   ├── components/        # React组件
│   ├── lib/              # 工具函数
│   └── config/           # 配置文件
├── public/               # 静态资源
└── middleware.ts         # Vercel Edge Middleware
```

## 🚀 部署到Vercel

### 方法一：通过Dashboard
1. 访问 https://vercel.com
2. 导入Git仓库
3. 配置环境变量
4. 点击部署

### 方法二：通过CLI
```bash
npm install -g vercel
vercel login
vercel
```

详细步骤请查看 [Vercel部署完整指南](docs/VERCEL_部署完整指南.md)

## ✅ 部署检查清单

- [ ] 所有环境变量已配置
- [ ] 数据库已初始化
- [ ] Stripe Webhook已配置
- [ ] 支付宝回调URL已配置
- [ ] 邮箱SMTP已配置
- [ ] 短信服务已配置

## 🐛 常见问题

### 验证码无法使用？
查看 [验证码时区问题修复报告](docs/验证码时区问题修复报告.md)

### Stripe支付失败？
查看 [Stripe集成操作手册](docs/STRIPE_集成操作手册.md)

### 临时邮箱被拒绝？
这是正常的，系统会拦截临时邮箱。查看 [邮箱真实性验证实施报告](docs/邮箱真实性验证实施报告.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**开发者：** VEO AI Team  
**最后更新：** 2025-01-20
