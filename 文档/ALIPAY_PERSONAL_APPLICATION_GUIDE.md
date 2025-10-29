# 支付宝个人账号支付接口申请完整指南

## 📋 目录

1. [准备阶段](#准备阶段)
2. [注册开放平台账号](#注册开放平台账号)
3. [创建应用](#创建应用)
4. [配置密钥](#配置密钥)
5. [申请产品功能](#申请产品功能)
6. [集成开发](#集成开发)
7. [常见问题](#常见问题)

---

## 准备阶段

### ✅ 必备条件清单

#### 1. 个人信息
- ✅ 实名认证的支付宝账号
- ✅ 身份证正反面照片（清晰）
- ✅ 手持身份证照片
- ✅ 个人手机号（用于接收验证码）

#### 2. 网站信息
- ✅ 域名：`veo-ai.site` 或 `www.veo-ai.site`
- ✅ **ICP备案号：蜀ICP备2025135924号** ⭐
- ✅ 网站已部署并可访问（必须使用 HTTPS）
- ✅ 网站底部已显示备案号并链接到工信部网站

#### 3. 业务材料
- ✅ 业务说明文档（描述 VEO AI 的服务内容）
- ✅ 用户协议、隐私政策页面链接
- ✅ 联系方式页面
- ✅ 网站截图（首页、服务页面、协议页面）

#### 4. 预期准备时间
- 材料准备：1-2 小时
- 应用创建：30 分钟
- 审核等待：1-3 个工作日
- **总计：约 2-4 天**

---

## 注册开放平台账号

### 步骤 1：访问支付宝开放平台

**网址：** https://open.alipay.com

### 步骤 2：注册/登录

1. 点击右上角「登录」按钮
2. 使用您的支付宝账号扫码登录
3. 首次登录会要求完善开发者信息

### 步骤 3：完善开发者信息

**个人开发者信息：**

```
开发者类型：个人开发者
真实姓名：[您的真实姓名]
身份证号：[您的身份证号]
手机号：[您的手机号]
邮箱：[您的邮箱，建议使用 3533912007@qq.com]
```

**提交材料：**
- 上传身份证正面照片
- 上传身份证反面照片
- 上传手持身份证照片（确保人脸、身份证信息清晰可见）

**审核时间：** 1-2 个工作日

---

## 创建应用

### 步骤 1：进入控制台

登录后，点击「控制台」→「网页&移动应用」

### 步骤 2：创建应用

点击「创建应用」按钮

**应用类型选择：**
- ✅ 选择「网页应用」
- ❌ 不要选择「移动应用」（那是给 APP 用的）

### 步骤 3：填写应用基本信息

**必填信息：**

```yaml
应用名称: VEO AI 视频创作平台
应用英文名称: VEO AI Video Platform
应用简介: AI驱动的智能视频生成服务，用户通过购买积分使用视频生成功能

应用图标: [上传您的应用图标 icon.png，尺寸 512x512px]

应用类型: 网页应用
行业分类: 
  - 一级分类：内容资讯
  - 二级分类：视频/直播

应用网址: https://www.veo-ai.site
ICP备案号: 蜀ICP备2025135924号 ⭐⭐⭐

授权回调地址: 
  - https://www.veo-ai.site/api/payment/alipay/callback
  - https://veo-ai.site/api/payment/alipay/callback
```

**业务说明：**

```
VEO AI 是一个基于人工智能的视频生成平台，为用户提供文本到视频的创作服务。

【业务模式】
- 用户通过购买积分充值套餐使用服务
- 每次生成视频消耗 15 积分
- 积分套餐价格：¥49/50积分，¥99/150积分，¥299/500积分

【使用场景】
- 内容创作者制作短视频
- 企业制作营销视频
- 个人用户制作创意视频

【合规说明】
- 网站已完成 ICP 备案（蜀ICP备2025135924号）
- 已制定完善的用户协议和隐私政策
- 具备完整的联系方式和客服支持
```

### 步骤 4：提交应用信息

点击「提交审核」

**初审时间：** 1 个工作日

---

## 配置密钥

### 为什么需要密钥？

支付宝使用 **RSA2 非对称加密** 保证交易安全。您需要：
- **应用私钥**（自己保管，不能泄露）
- **应用公钥**（上传给支付宝）
- **支付宝公钥**（从支付宝获取）

### 步骤 1：生成密钥对

**方式 A：使用支付宝提供的工具（推荐）**

1. 下载密钥生成工具
   - 访问：https://opendocs.alipay.com/common/02khjo
   - 下载「支付宝密钥生成器」（支持 Windows/Mac）

2. 运行工具
   - 密钥格式：选择「PKCS8(JAVA适用)」
   - 密钥长度：选择「2048」
   - 点击「生成密钥」

3. 保存密钥
   - 应用私钥：保存到安全位置（后续配置 `.env` 使用）
   - 应用公钥：复制内容，准备上传

**方式 B：使用 OpenSSL（高级用户）**

```bash
# 生成私钥
openssl genrsa -out app_private_key.pem 2048

# 生成公钥
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem

# 转换为 PKCS8 格式
openssl pkcs8 -topk8 -inform PEM -in app_private_key.pem -outform PEM -nocrypt -out app_private_key_pkcs8.pem
```

### 步骤 2：上传应用公钥到支付宝

1. 进入应用详情页
2. 找到「开发信息」→「接口加签方式」
3. 选择「公钥」模式
4. 点击「设置应用公钥」
5. 粘贴您的应用公钥内容（注意：去掉 `-----BEGIN PUBLIC KEY-----` 和 `-----END PUBLIC KEY-----` 这两行）
6. 点击「保存」

### 步骤 3：获取支付宝公钥

上传应用公钥后，系统会显示「支付宝公钥」

**复制并保存：**
- 支付宝公钥（后续配置 `.env` 使用）

**⚠️ 重要提示：**
- **应用私钥** 绝对不能泄露！
- **应用私钥** 不要上传到 GitHub！
- **应用私钥** 必须保存在 `.env` 文件中！

---

## 申请产品功能

### 支付宝提供的产品类型

个人开发者可申请的支付产品（选择其一即可）：

#### 1. 手机网站支付 ⭐⭐⭐⭐⭐（强烈推荐）

**适用场景：**
- 用户在手机浏览器访问您的网站
- 跳转到支付宝 APP 完成支付
- 支付完成后自动返回网站

**优势：**
- ✅ 个人开发者可申请
- ✅ 无需营业执照
- ✅ 审核相对容易
- ✅ 用户体验好（手机端主流）

**申请步骤：**

1. 进入应用详情页
2. 点击「产品列表」→「添加产品」
3. 搜索「手机网站支付」
4. 点击「立即签约」
5. 填写签约信息：
   ```
   网站名称: VEO AI 视频创作平台
   网站地址: https://www.veo-ai.site
   ICP备案号: 蜀ICP备2025135924号
   
   网站类型: 视频服务平台
   主营业务: AI视频生成服务
   经营模式: 积分充值
   
   客服电话: [您的手机号]
   客服邮箱: 3533912007@qq.com
   ```
6. 上传网站截图：
   - 首页截图
   - 充值页面截图
   - 用户协议截图
   - 隐私政策截图
7. 提交签约

**审核时间：** 1-2 个工作日

#### 2. 电脑网站支付 ⭐⭐⭐⭐

**适用场景：**
- 用户在电脑浏览器访问您的网站
- 扫码完成支付

**申请方式：** 与「手机网站支付」类似

**建议：** 同时申请手机和电脑网站支付，覆盖所有场景

---

## 集成开发

### 环境变量配置

审核通过后，您会获得以下关键信息：

在 `veo-ai-platform/.env` 中添加：

```bash
# ===== 支付宝支付配置 =====

# 应用 ID（在应用详情页获取）
ALIPAY_APP_ID=your_app_id_here

# 支付宝网关（固定值）
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 应用私钥（PKCS8 格式，一行字符串，去掉换行符和 BEGIN/END 标记）
ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...

# 支付宝公钥（从支付宝开放平台获取）
ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMII...

# 支付回调地址（必须是 HTTPS，且与申请时填写的一致）
ALIPAY_NOTIFY_URL=https://www.veo-ai.site/api/payment/alipay/callback
ALIPAY_RETURN_URL=https://www.veo-ai.site/payment/success

# 签名类型（固定值）
ALIPAY_SIGN_TYPE=RSA2

# 字符编码（固定值）
ALIPAY_CHARSET=utf-8
```

### 安装 SDK

```bash
cd veo-ai-platform
npm install alipay-sdk
```

### 创建支付服务

创建 `src/lib/alipay.ts`：

```typescript
import AlipaySdk from 'alipay-sdk'
import AlipayFormData from 'alipay-sdk/lib/form'

// 初始化支付宝 SDK
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: process.env.ALIPAY_GATEWAY!,
  signType: 'RSA2',
  charset: 'utf-8',
})

/**
 * 创建支付订单
 */
export async function createPayment(options: {
  outTradeNo: string      // 商户订单号（唯一）
  totalAmount: string     // 订单金额（元）
  subject: string         // 订单标题
  body?: string           // 订单描述
}) {
  const formData = new AlipayFormData()
  
  formData.setMethod('get')
  
  formData.addField('bizContent', {
    outTradeNo: options.outTradeNo,
    productCode: 'QUICK_WAP_WAY',
    totalAmount: options.totalAmount,
    subject: options.subject,
    body: options.body || options.subject,
    quitUrl: process.env.ALIPAY_RETURN_URL,
  })
  
  formData.addField('returnUrl', process.env.ALIPAY_RETURN_URL)
  formData.addField('notifyUrl', process.env.ALIPAY_NOTIFY_URL)
  
  // 生成支付链接
  const result = await alipaySdk.exec(
    'alipay.trade.wap.pay',
    {},
    { formData }
  )
  
  return result
}

/**
 * 验证支付宝回调签名
 */
export function verifyNotify(params: Record<string, any>): boolean {
  return alipaySdk.checkNotifySign(params)
}

/**
 * 查询订单状态
 */
export async function queryPayment(outTradeNo: string) {
  const result = await alipaySdk.exec('alipay.trade.query', {
    bizContent: {
      outTradeNo,
    },
  })
  
  return result
}
```

### 创建支付 API

创建 `src/app/api/payment/create/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPayment } from "@/lib/alipay"
import { pool } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    
    const { packageId } = await req.json()
    
    // 获取套餐信息
    const packageResult = await pool.query(
      "SELECT * FROM credit_packages WHERE id = $1 AND is_active = true",
      [packageId]
    )
    
    if (packageResult.rows.length === 0) {
      return NextResponse.json({ error: "套餐不存在" }, { status: 404 })
    }
    
    const creditPackage = packageResult.rows[0]
    
    // 生成订单号
    const outTradeNo = `VEO${Date.now()}${nanoid(8)}`
    
    // 创建订单记录
    await pool.query(
      `INSERT INTO payment_orders 
       (order_no, user_id, package_id, amount, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [outTradeNo, session.user.id, packageId, creditPackage.price, 'pending']
    )
    
    // 创建支付链接
    const paymentUrl = await createPayment({
      outTradeNo,
      totalAmount: creditPackage.price.toString(),
      subject: `VEO AI - ${creditPackage.name}`,
      body: `购买${creditPackage.credits}积分`,
    })
    
    return NextResponse.json({
      success: true,
      data: {
        orderNo: outTradeNo,
        paymentUrl,
      },
    })
    
  } catch (error) {
    console.error("创建支付失败:", error)
    return NextResponse.json(
      { error: "创建支付失败" },
      { status: 500 }
    )
  }
}
```

### 创建支付回调 API

创建 `src/app/api/payment/alipay/callback/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server"
import { verifyNotify } from "@/lib/alipay"
import { pool } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // 验证签名
    if (!verifyNotify(body)) {
      console.error("支付宝回调签名验证失败")
      return NextResponse.json({ error: "签名验证失败" }, { status: 400 })
    }
    
    const {
      out_trade_no,  // 商户订单号
      trade_no,      // 支付宝交易号
      trade_status,  // 交易状态
      total_amount,  // 订单金额
    } = body
    
    // 只处理支付成功的回调
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 查询订单
      const orderResult = await pool.query(
        "SELECT * FROM payment_orders WHERE order_no = $1",
        [out_trade_no]
      )
      
      if (orderResult.rows.length === 0) {
        return NextResponse.json({ error: "订单不存在" }, { status: 404 })
      }
      
      const order = orderResult.rows[0]
      
      // 检查订单是否已处理
      if (order.status === 'success') {
        return NextResponse.json({ success: true, message: "订单已处理" })
      }
      
      // 验证金额
      if (parseFloat(total_amount) !== parseFloat(order.amount)) {
        console.error("订单金额不匹配")
        return NextResponse.json({ error: "金额不匹配" }, { status: 400 })
      }
      
      // 开始事务
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        
        // 更新订单状态
        await client.query(
          `UPDATE payment_orders 
           SET status = $1, trade_no = $2, paid_at = NOW() 
           WHERE order_no = $3`,
          ['success', trade_no, out_trade_no]
        )
        
        // 获取套餐信息
        const packageResult = await client.query(
          "SELECT * FROM credit_packages WHERE id = $1",
          [order.package_id]
        )
        const creditPackage = packageResult.rows[0]
        
        // 增加用户积分
        await client.query(
          `UPDATE user_credit_accounts 
           SET balance = balance + $1, 
               total_purchased = total_purchased + $1,
               updated_at = NOW()
           WHERE user_id = $2`,
          [creditPackage.credits, order.user_id]
        )
        
        // 记录积分变动
        await client.query(
          `INSERT INTO credit_transactions 
           (user_id, type, amount, balance_after, description, created_at)
           SELECT $1, 'purchase', $2, balance, $3, NOW()
           FROM user_credit_accounts WHERE user_id = $1`,
          [
            order.user_id,
            creditPackage.credits,
            `购买${creditPackage.name}`,
          ]
        )
        
        await client.query('COMMIT')
        
        return NextResponse.json({ success: true })
        
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("处理支付回调失败:", error)
    return NextResponse.json(
      { error: "处理回调失败" },
      { status: 500 }
    )
  }
}
```

---

## 常见问题

### Q1: 个人开发者审核是否比企业严格？

**答：** 是的，个人开发者审核会更严格。建议：
- 确保网站完整、专业
- 提供详细的业务说明
- 确保备案信息准确无误
- 准备好客服联系方式

### Q2: 审核被拒绝怎么办？

**常见拒绝原因：**
1. 备案号无效或与域名不匹配
   - **解决：** 确保备案已通过且在工信部网站可查询
2. 网站内容不完整
   - **解决：** 补充用户协议、隐私政策、联系方式
3. 业务说明不清晰
   - **解决：** 详细说明业务模式、使用场景
4. 网站无法访问
   - **解决：** 确保网站已部署且使用 HTTPS

**处理流程：**
- 根据拒绝原因修改
- 重新提交审核
- 通常 2-3 次提交后会通过

### Q3: 个人账号有交易限额吗？

**答：** 有限制，具体为：
- 单笔限额：通常 ¥500-¥1000
- 日限额：¥2000-¥5000
- 月限额：¥20000-¥50000

**建议：**
- 初期使用个人账号测试
- 业务增长后升级为企业账号

### Q4: 如何测试支付功能？

**沙箱环境：**
1. 访问：https://open.alipay.com/dev/workspace
2. 使用沙箱应用 ID 和密钥
3. 使用沙箱账号测试支付
4. 测试通过后切换到正式环境

**⚠️ 注意：**
- 沙箱环境不需要真实备案
- 沙箱环境不会产生真实扣款
- 测试完成后必须切换到正式环境

### Q5: 回调地址必须是 HTTPS 吗？

**答：** 是的！支付宝要求：
- ✅ 必须使用 HTTPS
- ✅ 必须是已备案的域名
- ✅ 必须可公网访问
- ❌ 不能使用 localhost 或 IP 地址

### Q6: 如何处理重复回调？

支付宝可能会多次发送回调通知，您的代码必须：
1. 检查订单是否已处理（`status === 'success'`）
2. 如果已处理，直接返回成功
3. 使用数据库事务确保原子性

### Q7: 用户支付后多久到账？

- 支付成功后：**实时到账**到您的支付宝账户
- 回调通知：通常 **1-5 秒**内收到
- 用户积分：回调处理成功后**立即生效**

---

## 审核检查清单

在提交审核前，请确认以下所有项目：

### 网站检查
- [ ] 网站可通过 `https://www.veo-ai.site` 访问
- [ ] 首页显示完整的产品信息
- [ ] 底部显示备案号（蜀ICP备2025135924号）
- [ ] 用户协议页面完整：`/terms`
- [ ] 隐私政策页面完整：`/privacy`
- [ ] 联系方式页面完整：`/contact`
- [ ] 充值页面展示清晰的套餐信息

### 支付宝开放平台
- [ ] 开发者信息已实名认证
- [ ] 应用已创建并填写完整信息
- [ ] ICP 备案号已正确填写
- [ ] 应用公钥已上传
- [ ] 支付宝公钥已保存
- [ ] 回调地址已配置
- [ ] 产品功能已签约

### 代码准备
- [ ] 环境变量已配置（`.env`）
- [ ] 支付服务已实现（`src/lib/alipay.ts`）
- [ ] 支付 API 已实现
- [ ] 回调 API 已实现
- [ ] 数据库表已创建（`payment_orders`）

---

## 技术支持

### 官方文档
- 开放平台首页：https://open.alipay.com
- 开发文档：https://opendocs.alipay.com
- 沙箱环境：https://open.alipay.com/dev/workspace

### 遇到问题？
1. 查看官方文档常见问题
2. 访问开发者社区：https://forum.alipay.com
3. 联系支付宝客服（开放平台后台）

---

## 总结

**个人开发者申请支付宝支付的关键点：**

1. ✅ **必须有 ICP 备案**（您已完成：蜀ICP备2025135924号）
2. ✅ **网站必须完整、专业**（用户协议、隐私政策等）
3. ✅ **业务说明清晰**（AI 视频生成、积分充值模式）
4. ✅ **回调地址使用 HTTPS**
5. ⏰ **耐心等待审核**（个人开发者审核较严格，可能需要 2-3 次提交）

**预计时间线：**
- 材料准备：1-2 小时
- 提交审核：2-4 个工作日
- 集成开发：1-2 天
- **总计：约 1 周**

祝您申请顺利！🎉

