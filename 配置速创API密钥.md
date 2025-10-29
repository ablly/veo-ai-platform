# 配置速创API密钥

## ✅ 您的API密钥

```
1SJzUaIeipJPoCxwCd3Z2wRc3P
```

⚠️ **请妥善保管，不要泄露给他人！**

---

## 📝 配置步骤

### 1. 创建环境变量文件

在项目根目录（`veo-ai-platform/`）创建 `.env.local` 文件：

```bash
# 在 veo-ai-platform 目录下创建文件
touch .env.local
```

或者直接在IDE中创建新文件，命名为 `.env.local`

---

### 2. 添加以下内容到 `.env.local`

```env
# ==========================================
# 速创API配置（已配置）
# ==========================================
SUCHUANG_API_KEY=1SJzUaIeipJPoCxwCd3Z2wRc3P
SUCHUANG_API_URL=https://api.wuyinkeji.com
VEO_COST_PER_VIDEO=1.1

# ==========================================
# 数据库配置（必需 - 请从Supabase获取）
# ==========================================
DATABASE_URL=your_supabase_database_url_here
DIRECT_URL=your_supabase_direct_url_here

# ==========================================
# NextAuth配置（必需）
# ==========================================
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# ==========================================
# 支付宝配置（可选 - 生产环境需要）
# ==========================================
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
ALIPAY_PUBLIC_KEY=your_alipay_public_key
NOTIFY_URL=http://localhost:3000/api/payment/alipay/notify
RETURN_URL=http://localhost:3000/credits

# ==========================================
# 应用配置
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🔧 需要填写的其他配置

### 1. DATABASE_URL（必需）

从Supabase获取：
1. 登录 https://supabase.com
2. 选择您的项目
3. 进入 Settings → Database
4. 复制 Connection string 中的 URI

格式：
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 2. NEXTAUTH_SECRET（必需）

生成随机密钥：

**方法1：使用OpenSSL**
```bash
openssl rand -base64 32
```

**方法2：使用Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**方法3：在线生成**
访问：https://generate-secret.vercel.app/32

---

## 🚀 启动测试

### 1. 确认配置

检查 `.env.local` 文件是否创建成功：
```bash
ls -la .env.local
```

### 2. 重启开发服务器

```bash
# 停止当前服务器（如果正在运行）
# Ctrl + C

# 重新启动
npm run dev
```

### 3. 测试API连接

访问：http://localhost:3000

尝试生成视频，检查是否能正常调用速创API。

---

## 🔍 验证配置

### 方法1：查看日志

启动服务器后，查看控制台日志是否有错误。

### 方法2：测试视频生成

1. 登录系统
2. 访问 `/generate` 页面
3. 输入提示词
4. 点击生成
5. 检查是否成功调用速创API

### 方法3：查看管理后台

访问：http://localhost:3000/admin/statistics

查看是否有API调用成本记录。

---

## ⚠️ 安全提醒

### 重要：不要将密钥提交到Git！

`.env.local` 文件已经在 `.gitignore` 中，不会被提交。

**但请确认：**
```bash
# 检查 .gitignore
cat .gitignore | grep .env
```

应该包含：
```
.env*.local
.env.local
```

### 保护您的密钥

1. ✅ 不要分享给任何人
2. ✅ 不要提交到代码仓库
3. ✅ 不要硬编码在代码中
4. ✅ 定期更换密钥
5. ✅ 监控API使用情况

---

## 🆘 常见问题

### Q1: 提示"速创API密钥未配置"

**解决方案：**
1. 确认 `.env.local` 文件在项目根目录
2. 确认文件中有 `SUCHUANG_API_KEY=...`
3. 重启开发服务器

### Q2: API调用失败

**检查项：**
1. 密钥是否正确
2. 速创API账户是否有余额
3. 网络连接是否正常
4. 查看开发者工具的Network面板

### Q3: 环境变量不生效

**解决方案：**
1. 确保文件名是 `.env.local`（注意开头的点）
2. 重启开发服务器（Ctrl+C 然后 npm run dev）
3. 清除浏览器缓存

---

## 📊 监控API使用

### 查看速创API余额

1. 登录速创API控制台
2. 访问：https://api.wuyinkeji.com
3. 查看"余额"或"账户信息"

### 查看本地使用统计

访问：http://localhost:3000/admin/statistics

可以看到：
- 总调用次数
- 总成本
- 利润分析

---

## 🎉 配置完成！

一切就绪后，您就可以：

1. ✅ 生成视频（使用速创API）
2. ✅ 查看成本统计
3. ✅ 测试支付流程（需配置支付宝）
4. ✅ 正式运营

**祝您使用愉快！** 💰








