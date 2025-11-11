# ⚡ 管理员邮件通知 - 5分钟快速配置

## 🎯 目标

当用户购买套餐并支付成功时，您的QQ邮箱会立即收到通知！

---

## 📝 配置步骤（只需3步）

### 第1步：获取QQ邮箱授权码（2分钟）

1. 打开 QQ 邮箱：https://mail.qq.com
2. 点击 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 点击 **开启IMAP/SMTP服务**
5. 点击 **生成授权码**
6. 按提示发送短信验证
7. **复制16位授权码**（类似：`abcdefghijklmnop`）

⚠️ **重要**：授权码不是邮箱密码！

---

### 第2步：配置环境变量（1分钟）

在项目根目录的 `.env.local` 文件中添加：

```bash
# 管理员邮箱（接收订单通知）
ADMIN_EMAIL=你的QQ邮箱@qq.com

# QQ邮箱SMTP配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASSWORD=你的QQ邮箱授权码

# 例如：
ADMIN_EMAIL=YOUR_EMAIL@qq.com
SMTP_USER=YOUR_EMAIL@qq.com
SMTP_PASSWORD=YOUR_QQ_AUTH_CODE_HERE
```

**注意**：
- `SMTP_USER` 和 `ADMIN_EMAIL` 可以用同一个邮箱
- `SMTP_PASSWORD` 必须是授权码，不是QQ密码

---

### 第3步：测试配置（2分钟）

运行测试脚本：

```bash
node test-admin-email-notification.js
```

**成功输出示例：**
```
🧪 开始测试管理员邮件通知...

📋 环境变量检查:
   ADMIN_EMAIL: ✅ 已配置
   SMTP_USER: ✅ 已配置
   SMTP_PASSWORD: ✅ 已配置

📧 正在发送测试邮件...
📨 收件人: YOUR_EMAIL@qq.com

✅ 测试邮件发送成功！
   Message ID: <xxxxx@qq.com>

🎉 请检查您的管理员邮箱: YOUR_EMAIL@qq.com
💡 如果没收到，请检查垃圾邮件文件夹
```

检查您的QQ邮箱，应该会收到一封测试订单通知！

---

## ✅ 完成！

配置成功后，每次有用户购买套餐，您都会收到这样的邮件：

```
━━━━━━━━━━━━━━━━━━━
💰 新订单支付成功
¥49.00
支付宝到账通知
━━━━━━━━━━━━━━━━━━━

✅ 支付成功

实收金额：¥49.00
充值积分：50

订单号：VEO1730372456123
支付时间：2024-10-31 15:30:45
用户：张三 (user@example.com)

[查看所有订单] [查看统计]
```

---

## 🔧 常见问题

### Q1: 没收到测试邮件？

**检查清单：**
- [ ] 查看QQ邮箱的**垃圾邮件**文件夹
- [ ] 确认授权码是最新生成的
- [ ] 确认QQ邮箱已开启SMTP服务
- [ ] 重启服务器使环境变量生效

### Q2: 出现 "Invalid login" 错误？

**原因：** 授权码错误或过期

**解决：**
1. 回到QQ邮箱设置
2. 重新生成授权码
3. 更新 `SMTP_PASSWORD`
4. 重新测试

### Q3: 想用其他邮箱？

**支持的邮箱：**
- ✅ QQ邮箱（推荐，配置最简单）
- ✅ 163邮箱
- ✅ Gmail
- ✅ 企业邮箱

**配置示例（163邮箱）：**
```bash
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your_email@163.com
SMTP_PASSWORD=your_163_authorization_code
ADMIN_EMAIL=your_email@163.com
```

---

## 🚀 部署到生产环境

### Vercel

1. 项目设置 → Environment Variables
2. 添加所有环境变量（参考第2步）
3. 重新部署

### VPS

1. 编辑服务器上的 `.env` 文件
2. 重启服务：
   ```bash
   pm2 restart veo-ai-platform
   ```

---

## 📊 检查是否生效

创建一个测试订单：

1. 注册测试账号
2. 购买新手套餐（¥6.6）
3. 完成支付
4. **检查管理员邮箱** ✅

如果收到邮件，说明配置成功！🎉

---

## 💡 高级功能

### 多个管理员接收通知

```bash
# 多个邮箱用逗号分隔
ADMIN_EMAIL=admin1@qq.com,admin2@qq.com,admin3@qq.com
```

然后按照 `ADMIN_EMAIL_SETUP.md` 的说明修改代码。

### 临时关闭通知

```bash
# 留空即可
ADMIN_EMAIL=
```

---

## 📞 需要帮助？

查看完整文档：`ADMIN_EMAIL_SETUP.md`

---

**配置时间：** 5分钟  
**难度：** ⭐☆☆☆☆ 非常简单  
**效果：** 💯 实时到账提醒


