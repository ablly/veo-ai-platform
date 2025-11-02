# 📧 管理员邮件通知配置指南

## 功能说明

当用户成功购买套餐并支付后，系统会：
1. ✅ 自动给用户发送购买成功邮件
2. ✅ **自动给管理员发送订单通知邮件（新增）**

管理员邮件通知包含：
- 💰 订单金额和实时到账提醒
- 📋 完整订单详情（订单号、支付宝交易号）
- 👤 购买用户信息
- 🔗 快速访问后台管理的链接

---

## 📝 配置步骤

### 1️⃣ 配置管理员邮箱

在项目根目录的 `.env.local` 或 `.env` 文件中添加：

```bash
# 管理员邮箱（接收订单通知）
ADMIN_EMAIL=你的QQ邮箱@qq.com

# 例如：
ADMIN_EMAIL=123456789@qq.com
```

### 2️⃣ 配置SMTP邮件服务（如果还没配置）

确保以下环境变量已正确配置：

```bash
# QQ邮箱SMTP配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASSWORD=你的QQ邮箱授权码

# 例如：
SMTP_USER=123456789@qq.com
SMTP_PASSWORD=abcdefghijklmnop  # 这是授权码，不是密码！
```

### 3️⃣ 获取QQ邮箱授权码

1. 登录 QQ 邮箱 (mail.qq.com)
2. 点击顶部 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务** 
4. 开启 **IMAP/SMTP服务**
5. 点击 **生成授权码**
6. 按提示发送短信验证
7. 获得16位授权码（如：`abcdefghijklmnop`）
8. 将授权码填入 `SMTP_PASSWORD`

⚠️ **注意：授权码不是邮箱密码！**

---

## 🎨 邮件效果预览

当有用户购买套餐后，管理员会收到类似这样的邮件：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 新订单支付成功
¥49.00
支付宝到账通知
━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 支付成功

实收金额：¥49.00
充值积分：50

📋 订单详情
------------------
订单号：VEO1730372456123ABC
支付宝交易号：2024103122001234567890
套餐名称：基础套餐
充值积分：50 积分
支付金额：¥49.00
支付时间：2024-10-31 15:30:45

👤 用户信息
------------------
用户名称：张三
用户邮箱：user@example.com
买家支付宝ID：2088123456789012

💡 温馨提示：
• 用户积分已自动充值到账
• 用户已收到购买成功邮件通知
• 系统已完成所有自动化处理
• 如有异常请及时查看后台日志

[查看所有订单] [查看统计数据]
```

---

## ✅ 测试配置

### 方法1：创建测试订单

1. 在网站注册一个测试账号
2. 购买最便宜的套餐（新手体验 ¥6.6）
3. 完成支付
4. 检查管理员邮箱是否收到通知

### 方法2：模拟支付回调（开发测试）

创建测试脚本 `test-admin-email.js`：

```javascript
const { EmailService } = require('./src/lib/email')

async function testAdminEmail() {
  try {
    const result = await EmailService.sendAdminOrderNotification({
      orderNumber: 'TEST' + Date.now(),
      userName: '测试用户',
      userEmail: 'test@example.com',
      packageName: '基础套餐',
      credits: 50,
      amount: 49.00,
      buyerId: '2088123456789012',
      alipayTradeNo: '2024103122001234567890',
      paidAt: new Date().toLocaleString('zh-CN')
    })
    
    console.log('测试结果:', result)
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testAdminEmail()
```

运行测试：
```bash
node test-admin-email.js
```

---

## 🔧 故障排查

### 问题1：管理员没有收到邮件

**检查清单：**
- [ ] `ADMIN_EMAIL` 环境变量已配置
- [ ] `SMTP_USER` 和 `SMTP_PASSWORD` 配置正确
- [ ] QQ邮箱授权码是最新的（未过期）
- [ ] 检查QQ邮箱的**垃圾邮件**文件夹
- [ ] 查看服务器日志：`logger.error('发送管理员订单通知失败')`

### 问题2：邮件发送失败

**常见原因：**

1. **授权码错误**
   ```
   Error: Invalid login: 535 Login Fail
   ```
   解决：重新生成QQ邮箱授权码

2. **邮箱未开启SMTP服务**
   ```
   Error: Connection timeout
   ```
   解决：QQ邮箱设置中开启SMTP服务

3. **环境变量未生效**
   ```
   Error: Admin email not configured
   ```
   解决：重启服务器使环境变量生效

### 问题3：收到邮件但格式错误

**可能原因：**
- 数据格式问题
- 检查传入的参数是否完整

**调试方法：**
查看日志中的详细错误信息

---

## 🚀 生产环境部署

### Vercel 部署

在 Vercel 项目设置中添加环境变量：

1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：
   ```
   ADMIN_EMAIL = 你的QQ邮箱@qq.com
   SMTP_HOST = smtp.qq.com
   SMTP_PORT = 465
   SMTP_SECURE = true
   SMTP_USER = 你的QQ邮箱@qq.com
   SMTP_PASSWORD = QQ邮箱授权码
   ```
3. 重新部署项目

### EdgeOne 部署

如果使用腾讯云 EdgeOne：

1. 控制台 → 环境变量
2. 添加所有SMTP相关变量
3. **注意**：EdgeOne环境变量有长度限制，如果授权码太长，可能需要分段

### VPS 自托管

1. 编辑 `.env` 文件
2. 重启服务：
   ```bash
   pm2 restart veo-ai-platform
   ```

---

## 📊 邮件发送统计

系统会自动记录所有邮件发送情况：

```javascript
// 成功日志
logger.info('邮件发送成功', {
  context: {
    to: 'admin@example.com',
    subject: '💰 新订单支付成功',
    messageId: '<xxx@qq.com>'
  }
})

// 失败日志
logger.error('发送管理员订单通知失败', { 
  error: Error 
})
```

查看日志文件可以追踪所有邮件发送记录。

---

## 💡 高级配置

### 多个管理员邮箱

如果需要同时通知多个管理员，修改环境变量：

```bash
# 多个邮箱用逗号分隔
ADMIN_EMAIL=admin1@qq.com,admin2@qq.com,admin3@qq.com
```

然后修改代码 `src/lib/email.ts`：

```typescript
// 发送管理员订单通知
sendAdminOrderNotification: async (params) => {
  const adminEmails = process.env.ADMIN_EMAIL?.split(',') || []
  
  if (adminEmails.length === 0) {
    return { success: false, error: 'Admin email not configured' }
  }

  // 给所有管理员发送邮件
  const results = await Promise.all(
    adminEmails.map(email => sendEmail({
      to: email.trim(),
      subject: template.subject,
      html: template.html
    }))
  )

  return results[0] // 返回第一个结果
}
```

### 关闭管理员通知

如果临时不想接收通知，将环境变量留空：

```bash
ADMIN_EMAIL=
```

系统会自动跳过发送（只记录日志）。

---

## 📞 技术支持

如果配置过程中遇到问题：

1. 查看服务器日志
2. 检查邮箱垃圾邮件文件夹
3. 确认QQ邮箱授权码有效性
4. 参考QQ邮箱官方文档：https://service.mail.qq.com/

---

## ✅ 配置完成清单

- [ ] 已配置 `ADMIN_EMAIL` 环境变量
- [ ] 已配置 `SMTP_USER` 和 `SMTP_PASSWORD`
- [ ] 已测试邮件发送功能
- [ ] 管理员邮箱能正常接收测试邮件
- [ ] 已将配置部署到生产环境

配置完成后，每次有用户购买套餐，您的QQ邮箱都会收到即时通知！📧💰

---

**最后更新：** 2024-10-31  
**版本：** 1.0.0


