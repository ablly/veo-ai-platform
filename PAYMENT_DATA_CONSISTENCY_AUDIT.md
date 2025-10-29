# 🔒 支付数据一致性审计报告

**日期：** 2025-10-29  
**审计人员：** AI Assistant  
**严重程度：** 🚨 高危

---

## 🚨 发现的严重问题

### 1. 【高危】支付回调缺少签名验证

**文件：** `src/app/api/payment/alipay/notify/route.ts`  
**问题：** 第14-18行，支付宝签名验证被注释掉了

```typescript
// TODO: 验证支付宝签名
// const isValid = verifyAlipaySignature(body)
// if (!isValid) {
//   return NextResponse.json({ success: false, message: 'Invalid signature' })
// }
```

**风险：**
- ❌ 任何人都可以伪造支付回调
- ❌ 恶意用户可以免费获得积分
- ❌ 数据库可能被恶意修改

---

### 2. 【高危】订单金额验证缺失

**文件：** `src/app/api/payment/alipay/notify/route.ts`  
**问题：** 没有验证支付宝返回的金额与订单金额是否一致

**风险：**
- ❌ 用户可能支付1元获得1000元的积分
- ❌ 支付金额与订单金额不匹配

---

### 3. 【中危】数据库字段不一致

**问题：** 代码中使用的字段名与数据库实际字段不匹配

**发现的不一致：**
- `package_name` 字段不存在（已修复）
- `paid_at` 字段可能不存在
- `transaction_id` 字段可能不存在

---

### 4. 【中危】重复支付处理不完善

**问题：** 虽然有重复订单检查，但缺少幂等性保证

**风险：**
- ❌ 支付宝可能重复发送回调
- ❌ 用户可能获得重复积分

---

### 5. 【中危】事务回滚不完整

**问题：** 某些操作没有包含在事务中

**风险：**
- ❌ 部分操作成功，部分失败
- ❌ 数据不一致状态

---

## 🔧 立即修复方案

### 第1步：实现支付宝签名验证

**创建签名验证函数：**

```typescript
// src/lib/alipay-signature.ts
import crypto from 'crypto'

export function verifyAlipaySignature(params: any): boolean {
  const { sign, sign_type, ...otherParams } = params
  
  if (!sign || sign_type !== 'RSA2') {
    return false
  }

  // 获取支付宝公钥
  const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY
  if (!ALIPAY_PUBLIC_KEY) {
    console.error('❌ 支付宝公钥未配置')
    return false
  }

  // 构建待签名字符串
  const signString = Object.keys(otherParams)
    .filter(key => otherParams[key] !== '' && otherParams[key] !== null)
    .sort()
    .map(key => `${key}=${otherParams[key]}`)
    .join('&')

  // 验证签名
  try {
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${ALIPAY_PUBLIC_KEY}\n-----END PUBLIC KEY-----`
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(signString)
    return verifier.verify(publicKey, sign, 'base64')
  } catch (error) {
    console.error('❌ 签名验证失败:', error)
    return false
  }
}
```

### 第2步：完善支付回调验证

**修改 `notify/route.ts`：**

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // 1. 验证支付宝签名（必须！）
    const isValid = verifyAlipaySignature(body)
    if (!isValid) {
      console.error('❌ 支付宝签名验证失败')
      return NextResponse.json({ success: false, message: 'Invalid signature' })
    }

    const {
      out_trade_no, // 订单号
      trade_no,     // 支付宝交易号
      trade_status, // 交易状态
      total_amount, // 支付金额
      buyer_id      // 买家支付宝用户ID
    } = body

    // 2. 验证交易状态
    if (trade_status !== 'TRADE_SUCCESS' && trade_status !== 'TRADE_FINISHED') {
      return NextResponse.json({ success: true, message: 'Trade not completed' })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 3. 查询订单信息
      const orderResult = await client.query(
        'SELECT * FROM credit_orders WHERE order_number = $1',
        [out_trade_no]
      )

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        console.error(`❌ 订单不存在: ${out_trade_no}`)
        return NextResponse.json({ success: false, message: 'Order not found' })
      }

      const order = orderResult.rows[0]

      // 4. 验证支付金额（关键！）
      const orderAmount = parseFloat(order.amount)
      const paidAmount = parseFloat(total_amount)
      
      if (Math.abs(orderAmount - paidAmount) > 0.01) {
        await client.query('ROLLBACK')
        console.error(`❌ 支付金额不匹配: 订单${orderAmount}元, 实付${paidAmount}元`)
        return NextResponse.json({ success: false, message: 'Amount mismatch' })
      }

      // 5. 检查订单是否已处理（幂等性）
      if (order.status === 'PAID') {
        await client.query('COMMIT')
        console.log(`✅ 订单已处理: ${out_trade_no}`)
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      // 6. 更新订单状态
      await client.query(
        `UPDATE credit_orders 
         SET status = 'PAID', 
             paid_at = NOW(), 
             alipay_trade_no = $1,
             updated_at = NOW()
         WHERE order_number = $2`,
        [trade_no, out_trade_no]
      )

      // 7. 后续积分充值逻辑...
      // （保持原有逻辑）

      await client.query('COMMIT')
      
      console.log(`✅ 支付处理成功: ${out_trade_no}, 金额: ${total_amount}元`)
      return NextResponse.json({ success: true, message: 'Payment processed' })

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('❌ 处理支付回调失败:', error)
      return NextResponse.json({ success: false, message: 'Processing failed' })
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ 支付宝回调处理失败:', error)
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 })
  }
}
```

### 第3步：数据库字段检查和修复

**需要确认的数据库字段：**

```sql
-- 检查 credit_orders 表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'credit_orders';

-- 如果缺少字段，需要添加：
ALTER TABLE credit_orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE credit_orders ADD COLUMN IF NOT EXISTS alipay_trade_no VARCHAR(64);
ALTER TABLE credit_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
```

### 第4步：订单状态完整性检查

**添加订单状态验证：**

```typescript
// 在创建订单时添加更多验证
const validateOrder = async (userId: string, packageId: string, amount: number) => {
  // 1. 验证用户存在
  const userExists = await client.query('SELECT id FROM users WHERE id = $1', [userId])
  if (userExists.rows.length === 0) {
    throw new Error('用户不存在')
  }

  // 2. 验证套餐存在且价格正确
  const pkg = await client.query(
    'SELECT id, name, price, credits FROM credit_packages WHERE id = $1 AND is_active = true',
    [packageId]
  )
  if (pkg.rows.length === 0) {
    throw new Error('套餐不存在或已下架')
  }

  if (Math.abs(pkg.rows[0].price - amount) > 0.01) {
    throw new Error('套餐价格不匹配')
  }

  return pkg.rows[0]
}
```

---

## 🚨 紧急修复优先级

### 🔴 立即修复（高危）

1. **实现支付宝签名验证** - 防止伪造支付
2. **添加金额验证** - 防止金额篡改
3. **完善事务处理** - 确保数据一致性

### 🟡 尽快修复（中危）

4. **检查数据库字段** - 确保字段存在
5. **完善重复支付处理** - 确保幂等性
6. **添加详细日志** - 便于问题排查

### 🟢 后续优化（低危）

7. **添加支付超时处理**
8. **实现支付状态查询**
9. **添加支付失败重试机制**

---

## 📋 数据一致性检查清单

### 订单创建阶段 ✅

- [ ] 用户身份验证
- [ ] 套餐存在性验证
- [ ] 价格一致性验证
- [ ] 重复订单检查
- [ ] 订单号唯一性保证

### 支付处理阶段 ❌

- [ ] **支付宝签名验证**（缺失！）
- [ ] **支付金额验证**（缺失！）
- [ ] 订单状态检查
- [ ] 幂等性保证
- [ ] 事务完整性

### 积分充值阶段 ⚠️

- [ ] 积分数量验证
- [ ] 余额计算正确性
- [ ] 交易记录完整性
- [ ] 过期时间设置

### 异常处理阶段 ⚠️

- [ ] 支付失败处理
- [ ] 网络异常处理
- [ ] 数据库异常回滚
- [ ] 错误日志记录

---

## 🎯 下一步行动计划

### 第1步：立即创建签名验证函数
### 第2步：修复支付回调验证逻辑
### 第3步：检查并修复数据库字段
### 第4步：全面测试支付流程
### 第5步：部署到生产环境

---

**⚠️ 警告：在修复这些问题之前，不要在生产环境中启用支付功能！**

**📞 如需帮助，请立即联系技术团队！**

---

**文档创建时间：** 2025-10-29  
**最后更新时间：** 2025-10-29  
**状态：** 🚨 需要立即修复
