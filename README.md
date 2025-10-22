# 🎬 VEO AI 视频生成平台

> 革命性的AI视频生成技术，将您的创意转化为专业级视频内容

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## ✨ 特性

- 🚀 **闪电般速度** - 30-60秒快速生成高质量视频
- 🎨 **多图融合** - 支持最多6张参考图片
- 💰 **灵活积分制** - 按需使用，新用户免费体验
- 🔐 **多种登录方式** - 邮箱/手机/微信快捷登录
- 📱 **完美适配** - 响应式设计，支持所有设备
- 🎪 **社区分享** - 视频广场展示优秀作品
- 💳 **完整商用授权** - 生成的视频完全归您所有
- ✨ **实时更新** - 头像上传后无需刷新即可更新全站显示
- 🎬 **视频直接预览** - 鼠标悬停自动播放，沉浸式体验
- 🎨 **现代化UI** - 毛玻璃效果 + 渐变按钮 + 流畅动画

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- PostgreSQL 14+
- Supabase账号

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd veo-ai-platform
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制环境变量模板：
```bash
cp env-template.txt .env
```

编辑 `.env` 文件，填入必需配置：
```env
# 数据库（必需）
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase（必需）
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"

# NextAuth（必需）
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# VEO API（必需）
VEO_API_KEY="your-veo-api-key"

# 其他服务（可选）
RESEND_API_KEY="your-resend-key"  # 邮件服务
TWILIO_ACCOUNT_SID="your-twilio-sid"  # 短信服务
WECHAT_APP_ID="your-wechat-appid"  # 微信登录
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 📖 文档

### 核心文档
- [项目完成总结.md](项目完成总结.md) - **项目总览和功能清单**
- [快速部署指南.md](快速部署指南.md) - **三种部署方案详解**
- [测试清单.md](测试清单.md) - **完整功能测试指南**
- [环境变量配置说明.md](环境变量配置说明.md) - **环境配置详解**

### 详细文档（`文档/` 目录）
- [快速开始.md](文档/快速开始.md) - 快速配置指南
- [生产环境部署.md](文档/生产环境部署.md) - 生产环境部署指南
- [功能说明.md](文档/功能说明.md) - 完整功能说明
- [微信登录配置.md](文档/微信登录配置.md) - 微信登录配置指南
- [故障排除.md](文档/故障排除.md) - 常见问题解决方案

## 🎯 核心功能

### 用户系统
- ✅ 邮箱密码登录/注册
- ✅ 邮箱验证码登录
- ✅ 手机验证码登录
- ✅ 微信扫码登录
- ✅ 新用户自动赠送10积分

### 视频生成
- ✅ 文本描述生成视频
- ✅ 支持上传参考图片（最多6张）
- ✅ 实时生成进度跟踪
- ✅ 30-60秒快速生成
- ✅ 自动积分扣除和退款

### 积分系统
- ✅ 灵活的积分套餐
- ✅ 完整的交易记录
- ✅ 积分有效期管理
- ✅ 自动积分退款（生成失败时）

### 视频管理
- ✅ 我的视频列表
- ✅ 视频下载
- ✅ 视频删除
- ✅ 分享到视频广场
- ✅ 视频历史记录

### 个人中心
- ✅ 个人信息管理
- ✅ **头像上传与实时更新** - 上传后立即更新导航栏
- ✅ 积分余额查看
- ✅ 充值积分
- ✅ 快捷入口

### 视频广场
- ✅ 浏览分享的视频
- ✅ **视频直接预览** - 鼠标悬停自动播放
- ✅ 视频搜索和分类筛选
- ✅ 视频下载功能
- ✅ **现代化UI设计** - 毛玻璃效果 + 统一渐变按钮

## 🛠 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **UI库**: React 19
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: React Hooks
- **表单**: React Hook Form

### 后端
- **API**: Next.js API Routes
- **认证**: NextAuth.js
- **数据库**: PostgreSQL (Supabase)
- **存储**: Supabase Storage
- **邮件**: Resend
- **短信**: Twilio

### 开发工具
- **语言**: TypeScript
- **代码规范**: ESLint
- **包管理**: npm

## 📁 项目结构

```
veo-ai-platform/
├── src/
│   ├── app/                 # Next.js页面
│   │   ├── api/            # API路由
│   │   ├── login/          # 登录页面
│   │   ├── register/       # 注册页面
│   │   ├── profile/        # 个人中心
│   │   ├── my-videos/      # 我的视频
│   │   ├── gallery/        # 视频广场
│   │   ├── pricing/        # 定价页面
│   │   ├── docs/           # 帮助文档
│   │   └── page.tsx        # 首页（含生成工具）
│   ├── components/         # React组件
│   ├── lib/               # 工具函数
│   └── config/            # 配置文件
├── 文档/                   # 中文文档
├── public/                # 静态资源
└── package.json
```

## 🚢 部署

### Vercel部署（推荐 - 最简单）

1. 推送代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量
4. 一键部署

### Netlify部署

1. 连接Git仓库
2. 配置环境变量
3. 自动部署

### VPS自托管

1. 安装Node.js和PM2
2. 克隆项目并构建
3. 配置Nginx反向代理
4. 设置SSL证书

**📘 详细部署指南请查看**: 
- [快速部署指南.md](快速部署指南.md) - **推荐阅读**
- [生产环境部署.md](文档/生产环境部署.md)

## 💰 积分定价

| 套餐 | 积分 | 价格 | 可生成视频 |
|-----|------|------|----------|
| 体验 | 10 | 免费 | 2个 |
| 基础 | 50 | ¥49 | 10个 |
| 专业 | 200 | ¥149 | 40个 |
| 企业 | 1000 | ¥599 | 200个 |

每次生成消耗5积分，失败自动退款。

## 🔒 安全性

- ✅ 密码加密存储（bcrypt）
- ✅ JWT session管理
- ✅ HTTPS加密传输
- ✅ 文件类型验证
- ✅ 文件签名检查
- ✅ SQL注入防护
- ✅ CSRF防护

## 🐛 故障排除

### 常见问题

1. **Port 3000 already in use**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

2. **Database connection failed**
   - 检查DATABASE_URL是否正确
   - 确认数据库服务正在运行
   - 测试数据库连接

3. **Supabase bucket not found**
   - 系统会自动创建bucket
   - 确认SUPABASE_SERVICE_KEY正确
   - 检查Supabase项目权限

更多问题请查看 [帮助文档](src/app/docs/page.tsx)

## 📝 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 代码规范

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint --fix
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

[MIT](LICENSE)

## 📞 联系我们

- **网站**: https://your-domain.com
- **邮箱**: support@your-domain.com
- **文档**: [帮助中心](文档/)

## 🎉 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Resend](https://resend.com/)
- [Twilio](https://www.twilio.com/)

---

**使用VEO AI，让创意无限可能！** 🚀✨
