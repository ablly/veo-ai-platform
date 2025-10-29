# 📘 EdgeOne Pages完整部署配置指南

## 🎯 部署目标

**主域名**: veo-ai.site (裸域名)  
**重定向**: www.veo-ai.site → veo-ai.site  
**平台**: 腾讯云 EdgeOne Pages  
**项目**: VEO AI 视频生成平台  

---

## 📋 部署前准备清单

### ✅ **必需准备项**
```
📦 项目准备:
  ✅ GitHub仓库已创建
  ✅ 代码已推送到GitHub
  ✅ package.json配置正确
  ✅ 本地构建测试通过

🌐 域名准备:
  ✅ 域名 veo-ai.site 已购买
  ✅ 域名备案已完成
  ✅ DNS管理权限已获取

☁️ 腾讯云准备:
  ✅ 腾讯云账号已注册
  ✅ 实名认证已完成
  ✅ EdgeOne服务已开通

🔐 环境变量准备:
  ✅ 数据库连接字符串
  ✅ API密钥和配置
  ✅ 邮件服务配置
  ✅ 认证密钥配置
```

---

## 🚀 详细部署步骤

### 第一步：登录腾讯云并开通EdgeOne Pages

#### 1.1 访问EdgeOne控制台
```
🔗 访问地址: https://console.cloud.tencent.com/edgeone
```

#### 1.2 开通EdgeOne Pages服务
```
1. 进入EdgeOne控制台
2. 点击"Pages"服务
3. 点击"立即使用"或"创建项目"
4. 首次使用会提示开通服务，点击确认
```

---

### 第二步：创建EdgeOne Pages项目

#### 2.1 基本信息配置
```yaml
项目名称: veo-ai-platform
项目描述: AI视频生成平台 - VEO AI
部署来源: GitHub仓库
```

#### 2.2 连接GitHub仓库
```
1. 点击"连接GitHub账号"
2. 授权EdgeOne访问您的GitHub
3. 选择仓库: your-username/veo-ai-platform
4. 选择分支: main (或master)
```

#### 2.3 构建配置
```yaml
# 框架检测
Framework: Next.js

# 构建设置
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: /

# Node.js版本
Node.js Version: 18.x

# 环境变量 (在下一步配置)
```

---

### 第三步：配置环境变量

#### 3.1 进入环境变量设置
```
1. 在项目设置中找到"环境变量"
2. 点击"添加环境变量"
3. 逐个添加以下变量
```

#### 3.2 必需的环境变量
```bash
# ==========================================
# 数据库配置
# ==========================================
DATABASE_URL=postgresql://postgres:bxbbyffb4y4djTx3@db.hblthmkkdfkzvpywlthq.supabase.co:5432/postgres

# ==========================================
# NextAuth认证配置
# ==========================================
NEXTAUTH_URL=https://veo-ai.site
NEXTAUTH_SECRET=your-random-secret-key-min-32-characters

# 生成NEXTAUTH_SECRET的命令 (在本地运行):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ==========================================
# 速创API配置
# ==========================================
SUCHUANG_API_URL=https://api.wuyinkeji.com
SUCHUANG_API_KEY=your-suchuang-api-key
VEO_COST_PER_VIDEO=1.1

# ==========================================
# 邮件服务配置 (QQ邮箱)
# ==========================================
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=3533912007@qq.com
SMTP_PASSWORD=your-qq-email-auth-code

# ==========================================
# 支付宝配置 (申请后添加)
# ==========================================
# ALIPAY_APP_ID=your-alipay-app-id
# ALIPAY_PRIVATE_KEY=your-alipay-private-key
# ALIPAY_PUBLIC_KEY=alipay-public-key

# ==========================================
# 微信登录配置 (申请后添加)
# ==========================================
# WECHAT_CLIENT_ID=your-wechat-app-id
# WECHAT_CLIENT_SECRET=your-wechat-app-secret

# ==========================================
# 其他配置
# ==========================================
NODE_ENV=production
```

#### 3.3 环境变量添加方式
```
EdgeOne Pages界面操作:
1. 变量名: DATABASE_URL
   变量值: postgresql://postgres:...
   类型: 纯文本
   
2. 变量名: NEXTAUTH_SECRET
   变量值: 生成的随机密钥
   类型: 加密 (推荐)
   
3. 变量名: SUCHUANG_API_KEY
   变量值: 您的API密钥
   类型: 加密 (推荐)
   
... 依次添加所有环境变量
```

---

### 第四步：配置自定义域名

#### 4.1 添加裸域名 (veo-ai.site)

##### 步骤1: 在EdgeOne中添加域名
```
1. 进入项目设置 → 自定义域名
2. 点击"添加域名"
3. 输入: veo-ai.site
4. 点击确认
```

##### 步骤2: 获取CNAME记录
```
EdgeOne会提供一个CNAME值，类似:
xxx.xxx.edgeone.app

记录这个值，用于DNS配置
```

##### 步骤3: 配置DNS (在域名服务商处)
```yaml
# 选项A: 如果DNS服务商支持CNAME Flattening (推荐)
记录类型: CNAME
主机记录: @
记录值: xxx.xxx.edgeone.app
TTL: 600

# 选项B: 如果DNS服务商不支持CNAME Flattening
记录类型: A
主机记录: @
记录值: EdgeOne提供的IP地址 (需要在EdgeOne查看)
TTL: 600

# 推荐使用支持CNAME Flattening的DNS服务商:
- 腾讯云DNSPod
- Cloudflare
- AWS Route53
```

#### 4.2 添加www子域名 (www.veo-ai.site)

##### 步骤1: 在EdgeOne中添加域名
```
1. 继续在"自定义域名"中点击"添加域名"
2. 输入: www.veo-ai.site
3. 点击确认
```

##### 步骤2: 配置DNS
```yaml
记录类型: CNAME
主机记录: www
记录值: xxx.xxx.edgeone.app (EdgeOne提供的CNAME)
TTL: 600
```

#### 4.3 配置www到裸域名的重定向

##### 在EdgeOne Pages中配置重定向规则
```
方法1: 使用EdgeOne规则引擎 (推荐)
1. 进入项目设置 → 重定向规则
2. 添加新规则:
   - 源地址: www.veo-ai.site/*
   - 目标地址: https://veo-ai.site/$1
   - 状态码: 301 (永久重定向)
   - 匹配模式: 通配符

方法2: 在Next.js中配置 (备选)
见下面的Next.js配置部分
```

#### 4.4 SSL证书配置
```
✅ EdgeOne自动配置:
  • EdgeOne会自动为两个域名申请Let's Encrypt证书
  • veo-ai.site → 自动SSL
  • www.veo-ai.site → 自动SSL
  • 证书自动续期
  • 强制HTTPS自动启用
```

---

### 第五步：Next.js配置优化

#### 5.1 创建/更新 next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出配置
  output: 'standalone',
  
  // 图片优化
  images: {
    domains: [
      'veo-ai.site',
      'www.veo-ai.site',
      'api.wuyinkeji.com', // 速创API
      'res.wx.qq.com', // 微信资源
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  // 重定向配置 (备选方案)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.veo-ai.site',
          },
        ],
        destination: 'https://veo-ai.site/:path*',
        permanent: true, // 301重定向
      },
    ]
  },
  
  // Headers配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

module.exports = nextConfig
```

#### 5.2 更新 package.json 构建脚本
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "postbuild": "echo 'Build completed successfully!'"
  }
}
```

---

### 第六步：DNS完整配置示例

#### 6.1 腾讯云DNSPod配置 (推荐)
```yaml
# 解析记录列表
记录列表:
  - 记录类型: CNAME
    主机记录: @
    记录值: xxx.xxx.edgeone.app
    TTL: 600
    备注: 主域名指向EdgeOne
    
  - 记录类型: CNAME
    主机记录: www
    记录值: xxx.xxx.edgeone.app
    TTL: 600
    备注: www子域名指向EdgeOne
    
  - 记录类型: TXT
    主机记录: @
    记录值: EdgeOne验证记录 (如需要)
    TTL: 600
    备注: 域名所有权验证
```

#### 6.2 其他DNS服务商配置
```yaml
# 阿里云DNS
记录类型: CNAME
主机记录: @
记录值: xxx.xxx.edgeone.app
TTL: 10分钟

记录类型: CNAME
主机记录: www
记录值: xxx.xxx.edgeone.app
TTL: 10分钟

# Cloudflare (如使用)
注意: Cloudflare会自动代理，橙色云朵图标
CNAME @ xxx.xxx.edgeone.app
CNAME www xxx.xxx.edgeone.app
```

---

### 第七步：部署触发和验证

#### 7.1 触发首次部署
```
方法1: 自动部署 (推荐)
  • EdgeOne检测到GitHub仓库配置后自动触发
  • 每次推送到main分支自动部署

方法2: 手动部署
  • 在EdgeOne控制台点击"立即部署"
  • 选择分支和提交记录
```

#### 7.2 部署过程监控
```
部署阶段:
  1. ⏳ 初始化环境
  2. ⏳ 安装依赖 (npm install)
  3. ⏳ 构建项目 (npm run build)
  4. ⏳ 部署到边缘节点
  5. ✅ 部署完成

预计时间: 5-10分钟
```

#### 7.3 部署验证清单
```bash
# 1. 访问测试
✅ 访问 https://veo-ai.site
✅ 访问 https://www.veo-ai.site (应自动跳转到veo-ai.site)
✅ 访问 http://veo-ai.site (应自动跳转到https)
✅ 访问 http://www.veo-ai.site (应自动跳转到https://veo-ai.site)

# 2. 功能测试
✅ 首页加载正常
✅ 静态资源加载 (CSS/JS/图片)
✅ API路由工作正常
✅ 数据库连接正常
✅ 用户登录功能
✅ 视频生成功能 (需要API充值)
✅ 管理后台访问

# 3. SSL证书验证
✅ 浏览器地址栏显示锁图标
✅ 证书有效期正常
✅ 证书包含两个域名

# 4. 重定向验证
✅ www自动跳转到裸域名
✅ http自动跳转到https
✅ 保持URL路径和参数
```

---

## 🔧 高级配置

### 📊 **性能优化配置**

#### 缓存策略
```yaml
# EdgeOne缓存配置
静态资源:
  - 路径: /_next/static/*
    缓存时间: 365天
    
  - 路径: /images/*
    缓存时间: 30天
    
  - 路径: /favicon.ico
    缓存时间: 7天

动态内容:
  - 路径: /api/*
    缓存时间: 不缓存
    
  - 路径: /admin/*
    缓存时间: 不缓存
```

#### CDN加速配置
```yaml
# 全球加速配置
中国大陆: 启用
中国香港: 启用
亚太地区: 启用
欧美地区: 启用
其他地区: 启用

# 智能压缩
Gzip压缩: 启用
Brotli压缩: 启用
图片优化: 启用
```

---

### 🛡️ **安全配置**

#### WAF防护规则
```yaml
# Web应用防火墙
SQL注入防护: 启用
XSS攻击防护: 启用
命令注入防护: 启用
文件上传防护: 启用

# 访问控制
频率限制: 100请求/分钟
地理位置限制: 关闭 (全球访问)
IP黑名单: 自定义配置
```

#### DDoS防护
```yaml
# DDoS防护配置
防护等级: 高级防护
防护阈值: 自动调整
清洗模式: 智能清洗
攻击告警: 启用
```

---

## 📱 **监控和日志**

### 实时监控
```yaml
# EdgeOne提供的监控
访问统计:
  - PV/UV统计
  - 地域分布
  - 设备类型
  - 浏览器分布

性能监控:
  - 响应时间
  - 带宽使用
  - 缓存命中率
  - 错误率统计
```

### 日志查询
```yaml
# 访问日志
访问日志: 实时查询
错误日志: 实时查询
攻击日志: 实时查询
保留时间: 30天
```

---

## 🔄 **CI/CD自动部署**

### GitHub Actions配置 (可选)
```yaml
# .github/workflows/deploy.yml
name: Deploy to EdgeOne Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        continue-on-error: true
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Deploy notification
        run: echo "Deployment triggered to EdgeOne Pages"
```

---

## ⚠️ **常见问题和解决方案**

### Q1: DNS配置后域名无法访问
```
问题: 配置DNS后访问域名显示无法连接

解决方案:
1. 检查DNS是否生效 (可能需要等待10-30分钟)
2. 使用 nslookup veo-ai.site 检查解析
3. 检查EdgeOne中域名状态是否为"已验证"
4. 清除浏览器DNS缓存

验证命令:
ping veo-ai.site
nslookup veo-ai.site
```

### Q2: SSL证书错误
```
问题: 访问显示证书不安全

解决方案:
1. 等待证书自动申请完成 (通常5-10分钟)
2. 检查域名DNS解析是否正确
3. 在EdgeOne中手动触发证书申请
4. 确保域名已完成备案
```

### Q3: www重定向不工作
```
问题: 访问www.veo-ai.site没有跳转

解决方案:
1. 检查EdgeOne重定向规则配置
2. 检查next.config.js中的redirects配置
3. 清除浏览器缓存重试
4. 使用curl测试: curl -I https://www.veo-ai.site
```

### Q4: 环境变量不生效
```
问题: 应用无法连接数据库或API调用失败

解决方案:
1. 检查环境变量名称是否正确
2. 检查环境变量值是否有特殊字符需要转义
3. 重新部署项目使环境变量生效
4. 查看部署日志确认环境变量加载情况
```

### Q5: 构建失败
```
问题: EdgeOne部署时构建失败

解决方案:
1. 查看详细构建日志
2. 检查package.json中的scripts配置
3. 确保本地能够成功构建
4. 检查Node.js版本是否匹配
5. 检查依赖包是否有冲突

本地测试:
npm run build
```

---

## 📋 **部署后检查清单**

### ✅ **功能验证**
```
前端功能:
  ✅ 首页正常显示
  ✅ 视频生成页面正常
  ✅ 用户登录功能正常
  ✅ 积分系统正常
  ✅ 个人中心正常
  ✅ 定价页面正常

后端API:
  ✅ /api/auth/* 认证接口
  ✅ /api/user/* 用户接口
  ✅ /api/credits/* 积分接口
  ✅ /api/generate/* 生成接口
  ✅ /api/payment/* 支付接口
  ✅ /api/admin/* 管理接口

管理后台:
  ✅ 管理员登录
  ✅ 用户管理
  ✅ 订单管理
  ✅ 视频管理
  ✅ 系统设置

数据库:
  ✅ Supabase连接正常
  ✅ 数据读写正常
  ✅ 事务处理正常
```

### ✅ **性能验证**
```
加载速度:
  ✅ 首页加载 < 2秒
  ✅ API响应 < 500ms
  ✅ 静态资源CDN加速
  ✅ 全球访问速度测试

SEO检查:
  ✅ sitemap.xml可访问
  ✅ robots.txt正确配置
  ✅ meta标签完整
  ✅ 结构化数据正确
```

### ✅ **安全验证**
```
安全检查:
  ✅ HTTPS强制跳转
  ✅ SSL证书有效
  ✅ 安全Headers配置
  ✅ API认证正常
  ✅ 管理员权限控制

隐私保护:
  ✅ 用户数据加密
  ✅ API密钥安全
  ✅ 数据库连接安全
```

---

## 🎉 **部署完成**

### 🎯 **成功标志**
```
✅ 主域名访问: https://veo-ai.site
✅ www自动跳转: www.veo-ai.site → veo-ai.site
✅ SSL证书有效
✅ 全球CDN加速生效
✅ 所有功能正常运行
✅ 性能指标达标
✅ 安全防护启用
```

### 📞 **后续支持**
```
EdgeOne支持:
  • 技术文档: https://cloud.tencent.com/document/product/1552
  • 工单系统: 腾讯云控制台
  • 在线客服: 7x24小时

社区支持:
  • 开发者社区: https://cloud.tencent.com/developer
  • GitHub Issues: 项目反馈
```

---

**🎊 恭喜！VEO AI平台已成功部署到EdgeOne Pages，现在可以为全球用户提供高速、安全的AI视频生成服务了！**






