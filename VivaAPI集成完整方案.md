# VivaAPI 集成完整方案

> **实现用户付款 → 自动获取VivaAPI密钥 → 使用VEO生成视频的完整流程**

---

## 🎯 业务流程

### **当前问题**
- 所有用户共用一个 `VEO_API_KEY`
- 无法单独管理每个用户的API配额
- VivaAPI的费用无法自动化

### **目标流程**
```
用户购买套餐
    ↓
支付宝支付成功
    ↓
系统调用VivaAPI购买API密钥（根据套餐积分）
    ↓
密钥保存到数据库（user_viva_api_keys表）
    ↓
用户生成视频时使用专属密钥
    ↓
自动统计使用量
```

---

## 📊 VivaAPI 商业模型

### **VivaAPI定价**（参考）
- **VEO 3模型**: 约 ¥0.25/积分
- **最小购买**: 可能有最小购买金额限制

### **您的套餐**
| 套餐 | 售价 | 积分 | VivaAPI成本 | 利润 |
|------|------|------|-------------|------|
| 基础 | ¥49 | 50 | ¥12.5 | ¥36.5 |
| 专业 | ¥99 | 150 | ¥37.5 | ¥61.5 |
| 企业 | ¥299 | 500 | ¥125 | ¥174 |

---

## 🔧 技术实现方案

### **方案A：每次购买都从VivaAPI购买独立密钥**

**优点**：
- 每个用户完全独立的配额
- 便于管理和统计
- 安全性高

**缺点**：
- VivaAPI可能不支持频繁创建子账号
- 成本管理复杂
- 需要VivaAPI支持子账号系统

**实现**：
```javascript
// 用户购买后
1. 调用VivaAPI创建子账号API
2. 传入：用户ID、配额（积分数）
3. 获取：api_key, api_secret
4. 保存到数据库
```

---

### **方案B：共用主密钥，数据库管理配额（推荐）**

**优点**：
- 简单可靠
- 不依赖VivaAPI子账号功能
- 成本控制清晰
- 立即可用

**缺点**：
- 需要自己管理配额
- 共用主密钥（但数据库分离）

**实现**：
```javascript
// 用户购买后
1. 计算需要从VivaAPI购买的积分
2. 手动或自动充值VivaAPI主账号
3. 在数据库中记录用户可用配额
4. 生成视频时检查并扣减配额
```

---

### **方案C：混合模式（推荐，最灵活）**

**流程**：
1. **用户购买时**：
   - 记录积分到 `user_credit_accounts`（用户视角）
   - 同时记录配额到 `user_viva_api_keys`（API视角）
   
2. **生成视频时**：
   - 检查用户积分（15积分=1视频）
   - 扣减积分
   - 使用主VivaAPI密钥调用
   - 记录使用量到 `user_viva_api_keys.used`

3. **定期结算**：
   - 统计总使用量
   - 根据使用量从VivaAPI购买补充额度

---

## 💻 代码实现（方案C - 推荐）

### 1. 数据库表（已有）

```sql
-- 用户积分账户
user_credit_accounts
  - available_credits (用户可用积分)
  
-- 用户VivaAPI配额记录
user_viva_api_keys
  - user_id
  - quota (总配额)
  - used (已使用)
  - api_key (共用主密钥，或用户专属)
```

### 2. 支付成功回调

```typescript
// src/app/api/payment/alipay/notify/route.ts

async function handlePaymentSuccess(order) {
  // 1. 给用户充值积分
  await creditUser(order.user_id, order.credits)
  
  // 2. 记录VivaAPI配额
  await recordVivaApiQuota(order.user_id, order.credits)
  
  // 3. 可选：实时从VivaAPI购买配额
  // await purchaseVivaApiQuota(order.credits)
}

async function recordVivaApiQuota(userId, credits) {
  await pool.query(`
    INSERT INTO user_viva_api_keys (user_id, quota, used, api_key)
    VALUES ($1, $2, 0, $3)
    ON CONFLICT (user_id) 
    DO UPDATE SET quota = user_viva_api_keys.quota + $2
  `, [userId, credits, process.env.VEO_API_KEY])
}
```

### 3. 视频生成API

```typescript
// src/app/api/generate/video/route.ts

async function generateVideo(userId, prompt) {
  // 1. 检查用户积分
  const credits = await getUserCredits(userId)
  if (credits < 15) {
    throw new Error('积分不足')
  }
  
  // 2. 扣减积分
  await deductCredits(userId, 15)
  
  // 3. 调用VivaAPI（使用主密钥）
  const result = await callVivaApi(prompt, process.env.VEO_API_KEY)
  
  // 4. 记录使用量
  await recordApiUsage(userId, 15)
  
  return result
}

async function recordApiUsage(userId, credits) {
  await pool.query(`
    UPDATE user_viva_api_keys 
    SET used = used + $2 
    WHERE user_id = $1
  `, [userId, credits])
}
```

---

## 🔑 VivaAPI 真实集成步骤

### 1. 注册和充值

1. **访问**: https://www.vivaapi.cn/console/token
2. **注册账号**
3. **实名认证**（可能需要）
4. **充值**：建议先充值 ¥100-500 测试
5. **获取Token**: 复制您的API Token

### 2. 配置环境变量

```env
# .env
VEO_API_URL=https://www.vivaapi.cn/api  # VivaAPI真实地址
VEO_API_KEY=your_viva_api_token_here    # 您的VivaAPI Token
```

### 3. 测试API调用

```bash
# 测试VivaAPI连接
curl -X POST https://www.vivaapi.cn/api/veo3/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "测试视频",
    "duration": 5
  }'
```

### 4. 查看VivaAPI文档

访问 VivaAPI 控制台查看：
- API端点
- 请求格式
- 返回格式
- 错误码

---

## 📈 配额管理策略

### **自动监控**

```sql
-- 查询总使用量
SELECT 
  SUM(used) as total_used,
  SUM(quota) as total_quota,
  SUM(quota) - SUM(used) as remaining
FROM user_viva_api_keys;

-- 查询高使用用户
SELECT user_id, used, quota
FROM user_viva_api_keys
WHERE used > quota * 0.8
ORDER BY used DESC;
```

### **自动补充策略**

```javascript
// 定时任务：每天检查总配额
async function checkAndRefillQuota() {
  const stats = await getTotalQuotaStats()
  
  // 如果总使用量超过80%，触发告警
  if (stats.used / stats.quota > 0.8) {
    await sendAlert('VivaAPI配额即将用完！')
  }
  
  // 如果总配额低于某个值，自动充值VivaAPI
  if (stats.remaining < 1000) {
    // 手动充值或调用VivaAPI充值接口
    console.log('需要充值VivaAPI')
  }
}
```

---

## 🎨 用户界面优化

### 1. 用户个人中心显示API信息

```tsx
// 个人中心页面
<Card>
  <h3>我的API配额</h3>
  <p>总配额：{quota} 积分</p>
  <p>已使用：{used} 积分</p>
  <p>剩余：{quota - used} 积分</p>
  <Progress value={(used / quota) * 100} />
</Card>
```

### 2. 可选：提供API密钥给高级用户

如果用户购买企业套餐，可以提供专属API密钥，让他们直接调用：

```tsx
<Card>
  <h3>您的API密钥</h3>
  <code>{apiKey}</code>
  <Button>复制</Button>
  <p>可用于直接调用API生成视频</p>
</Card>
```

---

## ⚠️ 重要注意事项

### 1. VivaAPI限制
- 查看VivaAPI是否支持子账号系统
- 了解API调用频率限制
- 确认最小购买金额

### 2. 成本控制
- 定期监控总使用量
- 设置告警阈值
- 预留安全余量（建议20%）

### 3. 安全性
- API密钥不要暴露给前端
- 使用环境变量存储
- 定期轮换密钥

---

## 🚀 立即实施步骤

1. ✅ **注册VivaAPI** - 获取Token
2. ✅ **配置.env** - 添加 `VEO_API_KEY`
3. ✅ **测试API** - 确保能正常调用
4. ✅ **修改代码** - 使用真实API
5. ✅ **添加监控** - 配额使用统计
6. ✅ **用户界面** - 显示配额信息

---

## 📞 技术支持

**VivaAPI官网**: https://www.vivaapi.cn  
**控制台**: https://www.vivaapi.cn/console/token  
**文档**: 查看控制台中的API文档

---

**准备好开始了吗？** 我现在就可以帮您实现这个完整流程！



