# EdgeOne支付宝环境变量配置指南 🚀

> 最后一步！配置EdgeOne环境变量，启用支付宝支付功能

---

## 🎉 恭喜！您已完成所有支付宝配置

支付宝"电脑网站支付"产品能力已开通，现在只需配置EdgeOne环境变量即可使用！

---

## 📋 需要配置的6个环境变量

| 序号 | 变量名 | 变量值 | 说明 |
|------|--------|--------|------|
| 1 | `ALIPAY_APP_ID` | `2021006104679453` | 支付宝应用ID |
| 2 | `ALIPAY_PRIVATE_KEY` | 应用私钥（一行） | 您生成的应用私钥 |
| 3 | `ALIPAY_PUBLIC_KEY` | 支付宝公钥（一行） | 支付宝提供的公钥 |
| 4 | `ALIPAY_GATEWAY` | `https://openapi.alipay.com/gateway.do` | 支付宝网关地址 |
| 5 | `ALIPAY_SIGN_TYPE` | `RSA2` | 签名算法类型 |
| 6 | `ALIPAY_CHARSET` | `utf-8` | 字符编码 |

---

## 🔧 配置步骤

### 第1步：登录EdgeOne控制台

**访问地址：**
```
https://console.cloud.tencent.com/edgeone
```

**登录您的腾讯云账号**

---

### 第2步：进入Pages服务

1. 在EdgeOne控制台，找到您的站点
2. 点击左侧菜单 **"Pages服务"**
3. 找到您的项目：**veo-ai-platform**
4. 点击项目名称进入详情页

---

### 第3步：进入环境变量设置

1. 在项目详情页，点击 **"设置"** 标签
2. 在左侧菜单找到 **"环境变量"**
3. 点击进入环境变量配置页面

---

### 第4步：添加环境变量

#### 变量1：ALIPAY_APP_ID

- 点击 **"新增环境变量"** 按钮
- **变量名：** `ALIPAY_APP_ID`
- **变量值：** `2021006104679453`
- 点击 **"确定"**

---

#### 变量2：ALIPAY_PRIVATE_KEY

⚠️ **重要：应用私钥必须是一行，去掉头尾！**

**正确格式（一行，无头尾）：**
```
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcWsZa0lNHwiivg2G7v9nSQ/WkjUL89jErMZnMlIlxVFdwvymcuIq4zdjldbPwoBxqhiDFdnlBv5OPtqjJwQSREyuMrhrGz0pFFKHqgGyPZk0pDpnHSItxv3CFTBEs+uoM5bMGBLO/u4RlzlGVGBOG62FolIrbAEvzARQNHjqZS9TQAj0jAG623ifOgBG5qdHyN2Ffyk0MS/EtmlqLokxuOtunFnmSieNFRizEBLOQKXsoMOLVFLKDcU2iacrhipjVe4IokJ6sFirYBOLVE+0mgW277jajSXTU+ErXEYug+JB5Ljxf+LCa8zfDN7uwWTSA8IqdJppDZeD2ENSg/1GjAgMBAAECggEAFEgGmbViFOi59e2RwUYXNlMq+MpHsCC4xdD65umE/PlWUvpFSjdyDTBlFjmPJkaWVvehbItK/dI0MrYNMwSg9vlcuMYNkN7jZxhPDtZjJ4+y6mR9oun6a63DHYGy0wEFKcq6f4NPSAZqWTR0LdTZd0GS5Z1GaoHMe8FNpydxHUrBvj94ZAeDzAekX66DrLiwT7lMRAm6FOnC/vflyPq/U1hWNSe0iE87vqBvT/vErE2XS8CXCGQLWZzlaxQZLPSf2BjdVKcHNzad7zTXSgLgl+vp3KkJSan3yIlFgY4tyfYMHTr5j1mzspAKNTI3vxh2nlCALP8w3aJKfEuVwgJvgQKBgQD0iKKbOralXLbyf0y+tOqz1BnbnMbTdEBh4ZqIa3YHfrNMd3K0r14RXaWoxtc7Y5/D4rTkHJgFHl9g/lJZsTW0osbC6pWdK3tZSeL9ame+Xtwk5Q5MiTeWiUpN/sVHGdh/EBcl+yCJ+H4NxVzKPQyyRnJJumMbl52G07YP7cVM1wKBgQDmr+UfYddf8yHCPWw4vOwPgCtGC2rFBpD++AOxfomgAje0o9hSzqPWv7m6S3oA/5/4vgULPcnuAOaBsUTB80+YSL6zzcDIiYY6j19p4RLykMqOasiTEch4VSQ5f92cdU6qDnnwm7Vj6D2ekK5BhZ/J62v7uroUMhl+Lv+wbkucFQKBgQDMvIWggDUiGJFYUXsZBPKpI8GOnSHfMysgiLpQ0+BbgBpwwGW6oEWbNpQXznuwTsYaRPr9Lm+dgYOL+wNJ81Qq7EqMMcqYcCpzZKh3UpqPym55OYqSTCTNlh8vVEsqL5qTMA6hjzP8MKChuQfqj9jMfqz7y+Fk3blXhHSfu40AuwKBgQDRy9IikkbfWiyvjFDp4NcG2deBIkz91pTzbPde6uea/6lNvVy1Inzahw8QICha1B/Whmnr6UvGCkeYV3Fiujb/FdlpiIv1VS0gANgTYMBsncW5c9/p8NhSp4wERwdyjTT3b6bybYmvzLyNgqMXr8C8UECqdQ1Z5J5Opcuf1w8oaQKBgBE8jcBABNOLO3RspYUFXrDHTe2I04nPQrrzQfLgj75fiwZIJkHlAvU3FSKIPR8c20g+EOhQKcY2Pdnd1W2DdPEFHJn8X0Sk8SaaFZu9ukt4FSGTMyrk5AWtONLvKDySjDxTvnzkKr57yJUwKNpllh6B+40JhVAIcLFWJJlnBnUG
```

❌ **错误格式（包含头尾和换行）：**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASC...
...
-----END RSA PRIVATE KEY-----
```

**配置步骤：**
- 点击 **"新增环境变量"**
- **变量名：** `ALIPAY_PRIVATE_KEY`
- **变量值：** 粘贴上面的应用私钥（一行，无头尾）
- 点击 **"确定"**

---

#### 变量3：ALIPAY_PUBLIC_KEY

⚠️ **重要：支付宝公钥也必须是一行，去掉头尾！**

**正确格式（一行，无头尾）：**
```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsc7dSwcbEHfnn6oNv75o3pOxuiROQP4WIvMvG4N+Muxv0MPq6kKhIKuOwazZzT94ABdc8uKuAEa0tLUK1sAOrg6llK4yEUOJPRrZfkYMtMJRZNZkchnMdZAGqbPrp3CGGD5YqafB6iUXiaJiJWT6oemcMX5gmSnaWGIvoSbN0/kSEJ+WzZU/GBOgr/daf0uNF3XZg2WRCxX1KTQMPfgNrCVpInWkanSnnvDTMcZjdPneIBIZdqyAD8tDmYBftJO0zGPlgee8vyPSfPhBxfCoXMdv5Kz4v26uRQUnAbOToGnzyKDYzVTGGnf+vIhNIVYQbNyjewzjjDEciA+Y6aqYXQIDAQAB
```

**配置步骤：**
- 点击 **"新增环境变量"**
- **变量名：** `ALIPAY_PUBLIC_KEY`
- **变量值：** 粘贴上面的支付宝公钥（一行，无头尾）
- 点击 **"确定"**

---

#### 变量4：ALIPAY_GATEWAY

- 点击 **"新增环境变量"**
- **变量名：** `ALIPAY_GATEWAY`
- **变量值：** `https://openapi.alipay.com/gateway.do`
- 点击 **"确定"**

---

#### 变量5：ALIPAY_SIGN_TYPE

- 点击 **"新增环境变量"**
- **变量名：** `ALIPAY_SIGN_TYPE`
- **变量值：** `RSA2`
- 点击 **"确定"**

---

#### 变量6：ALIPAY_CHARSET

- 点击 **"新增环境变量"**
- **变量名：** `ALIPAY_CHARSET`
- **变量值：** `utf-8`
- 点击 **"确定"**

---

### 第5步：保存并重新部署

1. 确认所有6个环境变量都已添加
2. 点击 **"保存"** 按钮
3. EdgeOne会自动触发重新部署
4. 等待2-5分钟部署完成

---

## ✅ 配置检查清单

配置完成后，请确认以下事项：

- [ ] 所有6个环境变量都已添加
- [ ] `ALIPAY_APP_ID` 的值是：`2021006104679453`
- [ ] `ALIPAY_PRIVATE_KEY` 是一行，无头尾
- [ ] `ALIPAY_PUBLIC_KEY` 是一行，无头尾
- [ ] `ALIPAY_GATEWAY` 的值是：`https://openapi.alipay.com/gateway.do`
- [ ] `ALIPAY_SIGN_TYPE` 的值是：`RSA2`
- [ ] `ALIPAY_CHARSET` 的值是：`utf-8`
- [ ] 已点击"保存"按钮
- [ ] EdgeOne正在重新部署

---

## 🎯 配置完成后测试支付

### 等待部署完成（2-5分钟）

EdgeOne会自动重新部署您的网站，将环境变量应用到生产环境。

**查看部署状态：**
- 在EdgeOne控制台 → Pages服务 → 项目详情
- 查看"部署历史"标签
- 等待最新的部署状态变为"成功"

---

### 测试支付流程

部署完成后，立即测试支付功能：

#### 步骤1：访问网站

```
https://www.veo-ai.site
```

#### 步骤2：登录账号

- 使用您的账号登录
- 或者注册一个新账号

#### 步骤3：进入套餐页面

```
https://www.veo-ai.site/pricing
```

#### 步骤4：选择套餐

⚠️ **重要：首次测试建议选择最便宜的套餐**

**支付宝限额：**
- 单笔最高：2000元
- 单日最高：20000元

建议选择：
- ✅ 基础套餐（如果价格≤2000元）
- ✅ 测试小额套餐

#### 步骤5：点击购买

- 点击套餐的"立即购买"或"购买"按钮
- 系统会创建订单

#### 步骤6：检查跳转

✅ **成功标志：**
- 页面跳转到支付宝收银台
- 显示订单金额和商品信息
- 可以扫码或登录支付

❌ **失败标志：**
- 页面没有跳转
- 显示错误提示
- 控制台有错误信息

#### 步骤7：完成支付

- 使用支付宝扫码或登录支付
- 输入支付密码
- 完成支付

#### 步骤8：验证结果

✅ **成功标志：**
- 支付成功后跳转回网站
- 积分正确到账
- 订单状态更新为"已支付"

❌ **失败标志：**
- 支付成功但积分未到账
- 订单状态未更新
- 页面卡住或报错

---

## 🔍 调试方法

如果测试支付遇到问题：

### 1. 检查EdgeOne日志

**位置：**
```
EdgeOne控制台 → Pages服务 → 项目详情 → 日志
```

**查看：**
- 支付宝回调请求日志
- 错误日志
- API请求日志

### 2. 检查浏览器控制台

- 按 `F12` 打开开发者工具
- 查看 `Console` 标签的错误信息
- 查看 `Network` 标签的网络请求

### 3. 检查数据库

查询订单表，确认：
- 订单是否创建成功
- 订单状态是否更新
- 支付金额是否正确

### 4. 常见问题

| 问题 | 可能原因 | 解决方法 |
|------|---------|----------|
| 无法跳转支付宝 | 环境变量配置错误 | 检查密钥格式（一行，无头尾） |
| 签名验证失败 | 应用私钥或支付宝公钥错误 | 重新复制粘贴密钥 |
| 收不到回调 | 应用网关地址错误 | 确认回调地址可访问 |
| 积分未到账 | 回调处理失败 | 检查EdgeOne日志 |

---

## 📞 需要帮助？

如果配置或测试过程中遇到问题：

1. **检查配置文件：** `MY_ALIPAY_CONFIG.md`
2. **查看完整教程：** `ALIPAY_ENTERPRISE_SETUP_GUIDE.md`
3. **查看快速清单：** `ALIPAY_QUICK_CHECKLIST.md`
4. **支付宝客服：** 95188（商家服务）
5. **支付宝文档：** https://opendocs.alipay.com/open/270

---

## 🎉 配置完成

完成以上所有步骤后，您的VEO AI平台已成功接入支付宝支付功能！

用户现在可以：
1. 访问 www.veo-ai.site
2. 选择积分套餐
3. 使用支付宝支付
4. 获得积分
5. 生成AI视频

---

**文档版本：** v1.0  
**创建时间：** 2025-10-29  
**适用平台：** VEO AI Platform + EdgeOne Pages

