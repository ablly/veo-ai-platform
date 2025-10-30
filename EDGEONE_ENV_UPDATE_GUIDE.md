# 🔧 EdgeOne 环境变量更新指南

**日期：** 2025-10-29  
**原因：** 本地 .env 文件修改后需要同步到 EdgeOne 部署环境

---

## 🚨 重要提醒

**如果您修改了本地 `.env` 文件中的任何配置，必须同步更新 EdgeOne 环境变量！**

否则：
- ✅ 本地开发环境正常
- ❌ 线上部署环境失败

---

## 📋 需要同步的环境变量

### 1. 支付宝配置（如果修改了）

| 环境变量名 | 说明 | 是否修改 |
|-----------|------|----------|
| `ALIPAY_APP_ID` | 支付宝应用ID | ⚠️ 可能已修改 |
| `ALIPAY_PRIVATE_KEY` | 支付宝应用私钥 | ⚠️ 可能已修改 |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥 | ⚠️ 可能已修改 |
| `ALIPAY_GATEWAY` | 支付宝网关地址 | ⚠️ 可能已修改 |

### 2. 数据库配置（如果修改了）

| 环境变量名 | 说明 | 是否修改 |
|-----------|------|----------|
| `DATABASE_URL` | 数据库连接字符串 | ✅ 已修改端口号 |

### 3. 其他可能修改的配置

| 环境变量名 | 说明 | 是否修改 |
|-----------|------|----------|
| `NEXTAUTH_URL` | 应用基础URL | ❓ 检查是否修改 |
| `NEXTAUTH_SECRET` | NextAuth密钥 | ❓ 检查是否修改 |

---

## 🔧 EdgeOne 环境变量更新步骤

### 步骤1：登录 EdgeOne 控制台

1. 访问：[EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 选择您的站点：`www.veo-ai.site`
3. 进入：**站点加速** → **Pages** → **您的项目**

### 步骤2：更新环境变量

1. 点击项目名称进入详情页
2. 选择 **设置** 标签页
3. 找到 **环境变量** 部分
4. 点击 **编辑** 或 **添加环境变量**

### 步骤3：逐一更新变量

#### 🔑 支付宝配置更新

**ALIPAY_APP_ID**
```
名称: ALIPAY_APP_ID
值: 2021006104679453
```

**ALIPAY_PRIVATE_KEY（分段配置）**
由于 EdgeOne 环境变量长度限制，需要分段：

```
名称: ALIPAY_PRIVATE_KEY_1
值: [私钥第1段]

名称: ALIPAY_PRIVATE_KEY_2  
值: [私钥第2段]

名称: ALIPAY_PRIVATE_KEY_3
值: [私钥第3段]

名称: ALIPAY_PRIVATE_KEY_4
值: [私钥第4段]
```

**ALIPAY_PUBLIC_KEY**
```
名称: ALIPAY_PUBLIC_KEY
值: MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsc7dSwcbEHfnn6oNv75o3pOxuiROQP4WIvMvG4N+Muxv0MPq6kKhIKuOwazZzT94ABdc8uKuAEa0tLUK1sAOrg6llK4yEUOJPRrZfkYMtMJRZNZkchnMdZAGqbPrp3CGGD5YqafB6iUXiaJiJWT6oemcMX5gmSnaWGIvoSbN0/kSEJ+WzZU/GBOgr/daf0uNF3XZg2WRCxX1KTQMPfgNrCVpInWkanSnnvDTMcZjdPneIBIZdqyAD8tDmYBftJO0zGPlgee8vyPSfPhBxfCoXMdv5Kz4v26uRQUnAbOToGnzyKDYzVTGGnf+vIhNIVYQbNyjewzjjDEciA+Y6aqYXQIDAQAB
```

**ALIPAY_GATEWAY**
```
名称: ALIPAY_GATEWAY
值: https://openapi.alipay.com/gateway.do
```

#### 🗄️ 数据库配置更新

**DATABASE_URL**
```
名称: DATABASE_URL
值: postgresql://postgres.hblthmkkdfkzvpywlthq:bxbyffb4y4djTx3@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 步骤4：保存并重新部署

1. 点击 **保存** 保存环境变量
2. 触发重新部署：
   - 方法1：推送新的代码到 GitHub
   - 方法2：在 EdgeOne 控制台手动触发部署

---

## 📊 私钥分段参考

### 如何分段 ALIPAY_PRIVATE_KEY

假设您的私钥是：
```
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcWsZa0lNHwiivg2G7v9nSQ/WkjUL89jErMZnMlIlxVFdwvymcuIq4zdjldbPwoBxqhiDFdnlBv5OPtqjJwQSREyuMrhrGz0pFFKHqgGyPZk0pDpnHSItxv3CFTBEs+uoM5bMGBLO/u4RlzlGVGBOG62FolIrbAEvzARQNHjqZS9TQAj0jAG623ifOgBG5qdHyN2Ffyk0MS/EtmlqLokxuOtunFnmSieNFRizEBLOQKXsoMOLVFLKDcU2iacrhipjVe4IokJ6sFirYBOLVE+0mgW277jajSXTU+ErXEYug+JB5Ljxf+LCa8zfDN7uwWTSA8IqdJppDZeD2ENSg/1GjAgMBAAECggEAFEgGmbViFOi59e2RwUYXNlMq+MpHsCC4xdD65umE/PlWUvpFSjdyDTBlFjmPJkaWVvehbItK/dI0MrYNMwSg9vlcuMYNkN7jZxhPDtZjJ4+26mR9oun6a63DHYGy0wEFKcq6f4NPSAZqWTR0LdTZd0GS5Z1GaoHMe8FNpydxHUrBvj94ZAeDzAekX66DrLiwT7lMRAm6FOnC/vflyPq/U1hWNSe0iE87vqBvT/vErE2XS8CXCGQLWZzlaxQZLPSf2BjdVKcHNzad7zTXSgLgl+vp3KkJSan3yIlFgY4tyfYMHTr5j1mzspAKNTI3vxh2nlCALP8w3aJKfEuVwgJvgQKBgQD0iKKbOralXLbyf0y+tOqz1BnbnMbTdEBh4ZqIa3YHfrNMd3K0r14RXaWoxtc7Y5/D4rTkHJgFHl9g/lJZsTW0osbC6pWdK3tZSeL9ame+Xtwk5Q5MiTeWiUpN/sVHGdh/EBcl+yCJ+H4NxVzKPQyyRnJJumMbl52G07YP7cVM1wKBgQDmr+UfYddf8yHCPWw4vOwPgCtGC2rFBpD++AOxfomgAje0o9hSzqPWv7m6S3oA/5/4vgULPcnuAOaBsUTB80+YSL6zzcDIiYY6j19p4RLykMqOasiTEch4VSQ5f92cdU6qDnnwm7Vj6D2ekK5BhZ/J62v7uroUMhl+Lv+wbkucFQKBgQDMvIWggDUiGJFYUXsZBPKpI8GOnSHfMysgiLpQ0+BbgBpwwGW6oEWbNpQXznuwTsYaRPr9Lm+dgYOL+wNJ81Qq7EqMMcqYcCpzZKh3UpqPym55OYqSTCTNlh8vVEsqL5qTMA6hjzP8MKChuQfqj9jMfqz7y+Fk3blXhHSfu40AuwKBgQDRy9IikkbfWiyvjFDp4NcG2deBIkz91pTzbPde6uea/6lNvVy1Inzahw8QICha1B/Whmnr6UvGCkeYV3Fiujb/FdlpiIv1VS0gANgTYMBsncW5c9/p8NhSp4wERwdyjTT3b6bybYmvzLyNgqMXr8C8UECqdQ1Z5J5Opcuf1w8oaQKBgBE8jcBABNOLO3RspYUFXrDHTe2I04nPQrrzQfLgj75fiwZIJkHlAvU3FSKIPR8c20g+EOhQKcY2Pdnd1W2DdPEFHJn8X0Sk8SaaFZu9ukt4FSGTMyrk5AWtONLvKDySjDxTvnzkKr57yJUwKNpllh6B+40JhVAIcLFWJJlnBnUG
```

**分段方法：**
```
ALIPAY_PRIVATE_KEY_1: MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcWsZa0lNHwiivg2G7v9nSQ/WkjUL89jErMZnMlIlxVFdwvymcuIq4zdjldbPwoBxqhiDFdnlBv5OPtqjJwQSREyuMrhrGz0pFFKHqgGyPZk0pDpnHSItxv3CFTBEs+uoM5bMGBLO/u4RlzlGVGBOG62FolIrbAEvzARQNHjqZS9TQAj0jAG623ifOgBG5qdHyN2Ffyk0MS/EtmlqLokxuOtunFnmSieNFRizEBLOQKXsoMOLVFLKDcU2iacrhipjVe4IokJ6sFirYBOLVE+0mgW277jajSXTU+ErXEYug+JB5Ljxf+LCa8zfDN7uwWTSA8IqdJppDZeD2ENSg/1GjAgMBAAECggEAFEgGmbViFOi59e2RwUYXNlMq+MpHsCC4xdD65umE/PlWUvpFSjdyDTBlFjmPJkaWVvehbItK/dI0MrYNMwSg9vlcuMYNkN7jZxhPDtZjJ4+

ALIPAY_PRIVATE_KEY_2: 26mR9oun6a63DHYGy0wEFKcq6f4NPSAZqWTR0LdTZd0GS5Z1GaoHMe8FNpydxHUrBvj94ZAeDzAekX66DrLiwT7lMRAm6FOnC/vflyPq/U1hWNSe0iE87vqBvT/vErE2XS8CXCGQLWZzlaxQZLPSf2BjdVKcHNzad7zTXSgLgl+vp3KkJSan3yIlFgY4tyfYMHTr5j1mzspAKNTI3vxh2nlCALP8w3aJKfEuVwgJvgQKBgQD0iKKbOralXLbyf0y+tOqz1BnbnMbTdEBh4ZqIa3YHfrNMd3K0r14RXaWoxtc7Y5/D4rTkHJgFHl9g/lJZsTW0osbC6pWdK3tZSeL9ame+Xtwk5Q5MiTeWiUpN/sVHGdh/EBcl+yCJ+H4NxVzKPQyyRnJJumMbl52G07YP7cVM1wKBgQDmr+UfYddf8yHCPWw4vOwPgCtGC2rFBpD++AOxfomgAje0o9hSzqPWv7m6S3oA/5/4vgULPcnuAOaBsUTB80+YSL6zzcDIiYY6j19p4RLykMqOasiTEch4VSQ5f92cdU6qDnnwm7Vj6D2ekK5BhZ/J62v7uroUMhl+Lv+wbkucFQKBgQDMvIWggDUiGJFYUXsZBPKpI8GOnSHfMysgiLpQ0+BbgBpwwGW6oEWbNpQXznuwTsYaRPr9Lm+dgYOL+wNJ81Qq7EqMMcqYcCpzZKh3UpqPym55OYqSTCTNlh8vVEsqL5qTMA6hjzP8MKChuQfqj9jMfqz7y+Fk3blXhHSfu40AuwKBgQDRy9IikkbfWiyvjFDp4NcG2deBIkz91pTzbPde6uea/6lNvVy1Inzahw8QICha1B/Whmnr6UvGCkeYV3Fiujb/FdlpiIv1VS0gANgTYMBsncW5c9/p8NhSp4wERwdyjTT3b6bybYmvzLyNgqMXr8C8UECqdQ1Z5J5Opcuf1w8oaQKBgBE8jcBABNOLO3RspYUFXrDHTe2I04nPQrrzQfLgj75fiwZIJkHlAvU3FSKIPR8c20g+EOhQKcY2Pdnd1W2DdPEFHJn8X0Sk8SaaFZu9ukt4FSGTMyrk5AWtONLvKDySjDxTvnzkKr57yJUwKNpllh6B+40JhVAIcLFWJJlnBnUG

ALIPAY_PRIVATE_KEY_3: [继续分段...]

ALIPAY_PRIVATE_KEY_4: [最后一段...]
```

---

## ⚠️ 重要注意事项

### 1. 环境变量同步检查清单

- [ ] `ALIPAY_APP_ID` - 是否修改了应用ID？
- [ ] `ALIPAY_PRIVATE_KEY` - 是否更新了私钥？
- [ ] `ALIPAY_PUBLIC_KEY` - 是否更新了公钥？
- [ ] `DATABASE_URL` - 端口号已从 6543 改为 5432？

### 2. 部署后验证

更新环境变量并重新部署后，请验证：

1. **访问线上站点**：`https://www.veo-ai.site/pricing`
2. **测试支付功能**：点击"立即购买"
3. **检查是否正常跳转**：应该跳转到支付宝收银台

### 3. 常见问题

**Q: 更新环境变量后还是报错？**
A: 确保触发了重新部署，环境变量更新需要重新部署才能生效。

**Q: 私钥分段后还是报错？**
A: 检查分段是否正确，确保没有遗漏字符或多余空格。

**Q: 如何确认环境变量是否生效？**
A: 查看部署日志，应该能看到正确的配置信息。

---

## 🚀 快速操作步骤

### 立即需要做的事情：

1. **登录 EdgeOne 控制台**
2. **更新以下环境变量**：
   - `DATABASE_URL`（端口号 6543）
   - `ALIPAY_APP_ID`（如果修改了）
   - `ALIPAY_PRIVATE_KEY_1-4`（如果修改了）
   - `ALIPAY_PUBLIC_KEY`（如果修改了）
3. **保存并触发重新部署**
4. **测试线上支付功能**

---

**📝 记住：本地环境变量修改后，必须同步更新 EdgeOne 环境变量！**

---

**文档创建时间：** 2025-10-29  
**适用场景：** 本地 .env 修改后的 EdgeOne 同步更新

