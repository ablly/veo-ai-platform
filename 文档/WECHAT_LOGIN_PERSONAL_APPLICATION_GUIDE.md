# 微信登录（个人开发者）完整申请指南

## 📋 目录

1. [概述](#概述)
2. [准备阶段](#准备阶段)
3. [注册微信开放平台](#注册微信开放平台)
4. [创建网站应用](#创建网站应用)
5. [配置应用参数](#配置应用参数)
6. [集成开发](#集成开发)
7. [常见问题](#常见问题)

---

## 概述

### 微信登录的两种方式

| 类型 | 微信开放平台（网站应用） | 微信公众平台（公众号授权） |
|-----|---------------------|----------------------|
| **适用场景** | 任何浏览器 | 仅微信内置浏览器 |
| **备案要求** | ✅ 必须备案 | ❌ 不强制 |
| **费用** | 300元（一次性审核费） | 300元/年（认证费） |
| **审核时间** | 7个工作日 | 1-2个工作日 |
| **用户体验** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**本指南专注于：微信开放平台 - 网站应用（推荐方式）**

---

## 准备阶段

### ✅ 必备条件清单

#### 1. 个人信息
- ✅ 实名认证的微信账号
- ✅ 身份证正反面照片（高清）
- ✅ 手持身份证照片（清晰可见人脸和证件信息）
- ✅ 个人手机号
- ✅ 个人邮箱（建议：3533912007@qq.com）

#### 2. 网站信息
- ✅ 域名：`veo-ai.site` 或 `www.veo-ai.site`
- ✅ **ICP备案号：蜀ICP备2025135924号** ⭐
- ✅ 网站已部署并可通过 HTTPS 访问
- ✅ 网站底部已显示备案号

#### 3. 费用准备
- ✅ **300元人民币**（应用审核费，一次性支付）
- 💡 审核通过或被拒均不退款

#### 4. 时间准备
- 材料准备：1-2 小时
- 提交审核：30 分钟
- 审核等待：**7 个工作日**
- **总计：约 8-10 天**

---

## 注册微信开放平台

### 步骤 1：访问微信开放平台

**网址：** https://open.weixin.qq.com

### 步骤 2：注册账号

1. 点击右上角「注册」按钮
2. 选择「账号类型」：
   - ✅ 选择「个人」
   - ❌ 不要选择「企业」或「政府」

### 步骤 3：填写注册信息

**个人信息：**

```
邮箱：3533912007@qq.com（或您的个人邮箱）
密码：[设置一个强密码]
验证码：[输入邮箱收到的验证码]
```

**实名认证：**

```
真实姓名：[您的真实姓名]
身份证号：[您的身份证号]
手机号：[您的手机号]
微信号：[您的微信号]
```

**提交材料：**
- 上传身份证正面照片
- 上传身份证反面照片
- 上传手持身份证照片
  - 要求：人脸清晰、身份证信息清晰、手持姿势自然
  - 格式：JPG/PNG，文件大小 < 2MB

### 步骤 4：等待账号审核

**审核时间：** 1-2 个工作日

**审核通过后：**
- 您会收到邮件和微信通知
- 可以登录微信开放平台创建应用

---

## 创建网站应用

### 步骤 1：登录微信开放平台

使用您注册的账号登录：https://open.weixin.qq.com

### 步骤 2：创建应用

1. 进入「管理中心」
2. 点击「网站应用」→「创建网站应用」

### 步骤 3：填写应用基本信息

**第一部分：基本信息**

```yaml
应用名称: VEO AI
应用简称: VEO AI
应用英文名称: VEO AI Video Platform

应用介绍:
  VEO AI 是一个基于人工智能的视频生成平台，为用户提供文本到视频的创作服务。
  用户可以通过描述和参考图片快速生成专业级视频内容，适用于内容创作、
  企业营销、教育培训等多种场景。

应用官网: https://www.veo-ai.site

应用图标: [上传您的应用图标 icon.png]
  - 尺寸：180x180 像素
  - 格式：PNG
  - 背景：建议纯色或透明
```

**第二部分：平台信息**

```yaml
平台类型: 网站

网站地址: https://www.veo-ai.site

备案号: 蜀ICP备2025135924号 ⭐⭐⭐

授权回调域: 
  - www.veo-ai.site
  - veo-ai.site

【⚠️ 注意】
- 回调域只填写域名，不要加 http:// 或 https://
- 不要加路径，只填域名
- 可以填写多个域名（主域名 + www 子域名）
```

**第三部分：开发信息**

```yaml
开发者邮箱: 3533912007@qq.com
开发者手机: [您的手机号]

服务器IP地址（可选）:
  - 如果使用 EdgeOne Pages，此项可留空
  - 如果有固定服务器 IP，填写即可

接口测试账号（可选）:
  - 可以先留空，审核通过后再配置
```

### 步骤 4：上传资质材料

**个人开发者需要提交：**

1. **身份证照片**
   - 身份证正面（国徽面）
   - 身份证反面（人像面）
   - 确保照片清晰、四角完整、无反光

2. **手持身份证照片**
   - 本人手持身份证
   - 人脸和身份证信息都要清晰可见
   - 身份证不要遮挡脸部

3. **备案证明（重要！）**
   - 访问工信部备案查询网站：https://beian.miit.gov.cn
   - 查询您的域名备案信息
   - 截图保存备案信息页面
   - 确保截图包含：
     - ✅ 域名：veo-ai.site
     - ✅ 备案号：蜀ICP备2025135924号
     - ✅ 主办单位名称
     - ✅ 审核通过日期

4. **网站截图**
   - 首页截图（完整页面，包含顶部和底部）
   - 隐私政策页面截图
   - 用户协议页面截图
   - 联系方式页面截图
   - 确保底部有备案号显示

### 步骤 5：支付审核费用

1. 确认所有信息无误
2. 点击「提交审核」
3. 系统会引导您支付 **300 元审核费**
4. 支付方式：微信支付
5. 支付完成后，应用进入审核队列

**⚠️ 重要提示：**
- 审核费用一次性支付，**无论审核通过或拒绝都不退款**
- 如果审核被拒，修改后重新提交**不需要再次付费**
- 审核费用是给腾讯的，与应用是否通过无关

---

## 配置应用参数

### 审核通过后获取的信息

审核通过后，您会获得以下关键信息：

1. **AppID**（应用ID）
   - 格式：`wx1234567890abcdef`
   - 用于标识您的应用

2. **AppSecret**（应用密钥）
   - 格式：32位字符串
   - ⚠️ 非常重要，必须保密！

### 在项目中配置环境变量

在 `veo-ai-platform/.env` 中添加：

```bash
# ===== 微信登录配置 =====

# 微信开放平台 AppID
WECHAT_APP_ID=wx1234567890abcdef

# 微信开放平台 AppSecret（必须保密！）
WECHAT_APP_SECRET=your_app_secret_here

# 微信登录回调地址（NextAuth.js 会自动处理）
NEXTAUTH_URL=https://www.veo-ai.site
```

### 配置授权回调地址

在微信开放平台的应用详情页：

1. 找到「接口信息」→「网页授权」
2. 修改授权回调域：
   ```
   www.veo-ai.site
   veo-ai.site
   ```
3. 保存配置

**⚠️ 注意事项：**
- 回调域必须与备案域名一致
- 不要加协议（http:// 或 https://）
- 不要加端口号
- 不要加路径

---

## 集成开发

### 您的项目已经完成大部分集成！

您的 VEO AI 项目中已经配置了微信登录功能，只需要更新环境变量即可。

### 检查现有配置

#### 1. 检查 NextAuth 配置

文件：`veo-ai-platform/src/lib/auth.ts`

应该包含 WeChatProvider：

```typescript
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      // ... 其他配置
    }),
    
    // 微信登录（如果还没有，需要添加）
    {
      id: "wechat",
      name: "WeChat",
      type: "oauth",
      wellKnown: "https://open.weixin.qq.com/.well-known/openid-configuration",
      authorization: {
        url: "https://open.weixin.qq.com/connect/qrconnect",
        params: {
          scope: "snsapi_login",
          appid: process.env.WECHAT_APP_ID,
        },
      },
      token: "https://api.weixin.qq.com/sns/oauth2/access_token",
      userinfo: {
        url: "https://api.weixin.qq.com/sns/userinfo",
        params: { lang: "zh_CN" },
        async request({ tokens, provider }) {
          const res = await fetch(
            `${provider.userinfo?.url}?access_token=${tokens.access_token}&openid=${tokens.openid}&lang=zh_CN`
          )
          return await res.json()
        },
      },
      clientId: process.env.WECHAT_APP_ID!,
      clientSecret: process.env.WECHAT_APP_SECRET!,
      profile(profile) {
        return {
          id: profile.openid,
          name: profile.nickname,
          email: `${profile.openid}@wechat.placeholder`,
          image: profile.headimgurl,
        }
      },
    },
  ],
  // ... 其他配置
}
```

#### 2. 检查登录页面

文件：`veo-ai-platform/src/app/login/page.tsx`

应该包含微信登录按钮：

```typescript
<Button
  onClick={() => signIn("wechat")}
  className="w-full bg-green-600 hover:bg-green-700"
>
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    {/* 微信图标 */}
  </svg>
  微信登录
</Button>
```

#### 3. 检查注册页面

文件：`veo-ai-platform/src/app/register/page.tsx`

应该包含微信注册按钮：

```typescript
<Button
  onClick={() => signIn("wechat")}
  className="flex-1 bg-green-600 hover:bg-green-700"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* 微信图标 */}
  </svg>
</Button>
```

### 处理微信用户首次登录

由于微信登录不提供 email，您需要处理用户首次登录的情况。

文件：`veo-ai-platform/src/lib/auth.ts` 的 `callbacks` 部分：

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    if (account?.provider === "wechat") {
      // 检查用户是否已存在
      const result = await pool.query(
        "SELECT * FROM users WHERE wechat_openid = $1",
        [user.id]
      )
      
      if (result.rows.length === 0) {
        // 新用户，创建账号
        await pool.query(
          `INSERT INTO users (id, name, wechat_openid, avatar_url, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           RETURNING id`,
          [user.name, user.id, user.image]
        )
        
        // 创建积分账户
        await pool.query(
          `INSERT INTO user_credit_accounts (user_id, balance, total_free_credits)
           VALUES ((SELECT id FROM users WHERE wechat_openid = $1), 10, 10)`,
          [user.id]
        )
      }
    }
    return true
  },
  
  async session({ session, token }) {
    if (token.sub) {
      let userId = token.sub
      
      // 如果是微信登录，通过 openid 查询真实的 user_id
      if (token.provider === "wechat") {
        const result = await pool.query(
          "SELECT id FROM users WHERE wechat_openid = $1",
          [token.sub]
        )
        if (result.rows.length > 0) {
          userId = result.rows[0].id
        }
      }
      
      session.user.id = userId
    }
    return session
  },
  
  async jwt({ token, account, user }) {
    if (account) {
      token.provider = account.provider
    }
    return token
  },
}
```

### 数据库调整

确保 `users` 表包含 `wechat_openid` 字段：

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_openid VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

## 常见问题

### Q1: 个人开发者能申请微信登录吗？

**答：** 可以！但需要满足：
- ✅ 网站已备案
- ✅ 支付 300 元审核费
- ✅ 提供完整的个人身份证明
- ⏰ 审核时间较长（7 个工作日）

### Q2: 审核被拒绝怎么办？

**常见拒绝原因：**

1. **备案信息不符**
   - 解决：确保备案号与域名匹配，在工信部网站可查询
   
2. **网站内容不完整**
   - 解决：补充隐私政策、用户协议、联系方式页面
   
3. **回调域填写错误**
   - 解决：只填域名，不要加 http:// 或路径
   
4. **网站无法访问**
   - 解决：确保网站使用 HTTPS 且可正常访问

5. **身份证照片不清晰**
   - 解决：重新拍摄高清照片，确保信息清晰可见

**处理流程：**
- 根据拒绝原因修改
- 重新提交审核（**不需要再次付费**）
- 通常 2-3 次提交后会通过

### Q3: 300 元审核费可以退吗?

**答：** 不可以！
- ❌ 审核通过不退款
- ❌ 审核拒绝不退款
- ❌ 撤回申请不退款
- ✅ 但如果拒绝后修改重新提交，不需要再次付费

### Q4: 回调域配置错误会怎样？

**表现：**
- 用户点击微信登录后，无法跳转回网站
- 或者显示「redirect_uri 参数错误」

**解决：**
1. 检查回调域配置是否正确
2. 确保只填域名，不要加协议和路径
3. 等待配置生效（通常 5 分钟）

### Q5: 微信登录的用户没有 email 怎么办？

**方案 A：使用占位符 email（推荐）**

```typescript
email: `${profile.openid}@wechat.placeholder`
```

**方案 B：允许用户后续绑定 email**

在用户首次微信登录后，引导用户绑定邮箱：
1. 创建「绑定邮箱」页面
2. 用户输入邮箱并验证
3. 更新数据库中的 email 字段

### Q6: 如何测试微信登录？

**测试环境：**
1. 微信开放平台提供沙箱环境
2. 访问：https://developers.weixin.qq.com/sandbox
3. 使用沙箱 AppID 和 AppSecret 测试

**⚠️ 注意：**
- 沙箱环境不需要审核
- 沙箱环境不需要备案
- 测试完成后必须切换到正式环境

**正式环境测试：**
- 使用真实的 AppID 和 AppSecret
- 在已备案的域名上测试
- 使用真实的微信账号登录

### Q7: 微信登录二维码不显示？

**可能原因：**
1. AppID 或 AppSecret 配置错误
   - 检查 `.env` 文件
2. 回调域配置错误
   - 检查微信开放平台配置
3. 网络问题
   - 检查是否能访问微信 API
4. 浏览器缓存
   - 清除浏览器缓存重试

### Q8: 用户扫码后提示「请在微信客户端打开链接」？

**原因：** 这是正常的！

微信网页登录（网站应用）的流程：
1. 网页显示二维码
2. 用户用微信扫码
3. 微信 APP 内确认授权
4. 自动跳转回网站

如果用户在电脑浏览器扫码，会提示在微信内打开，这是微信的安全机制。

---

## 审核检查清单

在提交审核前，请确认以下所有项目：

### 网站检查
- [ ] 网站可通过 `https://www.veo-ai.site` 访问
- [ ] 使用 HTTPS（微信强制要求）
- [ ] 首页显示完整的产品信息
- [ ] 底部显示备案号（蜀ICP备2025135924号）
- [ ] 备案号链接到工信部网站
- [ ] 隐私政策页面完整：`/privacy`
- [ ] 用户协议页面完整：`/terms`
- [ ] 联系方式页面完整：`/contact`

### 微信开放平台
- [ ] 账号已注册并实名认证
- [ ] 应用名称、介绍填写完整
- [ ] 应用图标已上传（180x180px）
- [ ] 网站地址正确
- [ ] 备案号正确填写（蜀ICP备2025135924号）
- [ ] 回调域配置正确（只填域名）
- [ ] 身份证照片清晰完整
- [ ] 手持身份证照片清晰
- [ ] 备案证明截图完整
- [ ] 网站截图完整（首页、协议、联系方式）
- [ ] 已准备好 300 元审核费

### 代码准备
- [ ] `.env` 文件已配置 `WECHAT_APP_ID`
- [ ] `.env` 文件已配置 `WECHAT_APP_SECRET`
- [ ] NextAuth 配置已添加 WeChat Provider
- [ ] 登录页面有微信登录按钮
- [ ] 注册页面有微信注册按钮
- [ ] 数据库 `users` 表有 `wechat_openid` 字段
- [ ] 首次微信登录会自动创建用户和积分账户

---

## 时间线总结

### 申请前准备（1-2天）
- ✅ 备案已完成（您已完成）
- ✅ 网站已部署（待完成）
- ✅ 完善隐私政策、用户协议等（已完成）

### 微信开放平台（8-10天）
- Day 1-2: 注册账号，实名认证
- Day 3: 创建应用，提交材料
- Day 3: 支付 300 元审核费
- Day 4-10: 等待审核（7 个工作日）
- Day 11: 审核通过，获取 AppID 和 AppSecret

### 集成开发（1天）
- 配置环境变量
- 测试微信登录
- 上线使用

**总计时间：约 2 周**

---

## 技术支持

### 官方文档
- 微信开放平台：https://open.weixin.qq.com
- 网站应用开发文档：https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
- 接口测试工具：https://mp.weixin.qq.com/debug/

### 遇到问题？
1. 查看官方文档常见问题
2. 访问微信开放社区：https://developers.weixin.qq.com/community/
3. 联系微信客服（开放平台后台）

---

## 总结

**个人开发者申请微信登录的关键点：**

1. ✅ **必须有 ICP 备案**（您已完成：蜀ICP备2025135924号）
2. ✅ **必须使用 HTTPS**（部署时确保）
3. ✅ **准备 300 元审核费**（一次性支付，不退款）
4. ✅ **耐心等待 7 个工作日审核**
5. ✅ **身份证照片要清晰**（常见拒绝原因）
6. ✅ **回调域只填域名**（不要加协议和路径）

**相比支付宝的优势：**
- ✅ 用户体验更好（扫码即登录）
- ✅ 无交易限额（不涉及支付）
- ✅ 一次审核，长期使用

**相比支付宝的劣势：**
- ❌ 需要支付 300 元审核费
- ❌ 审核时间较长（7 天 vs 3 天）
- ❌ 用户没有 email（需要使用占位符）

祝您申请顺利！🎉

