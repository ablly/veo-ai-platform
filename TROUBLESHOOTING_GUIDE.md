# 视频生成功能故障排查指南

## 快速检查清单

在报告问题之前，请按顺序检查以下项目：

### ✅ 1. 环境变量配置

检查 `.env` 文件中的配置：

```bash
# 必需的环境变量
SUCHUANG_API_URL=https://api.wuyinkeji.com
SUCHUANG_API_KEY=你的速创API密钥
VEO_COST_PER_VIDEO=1.1
DATABASE_URL=你的数据库连接字符串
```

**验证方法**：
```bash
# 在项目根目录运行
cat .env | grep SUCHUANG
```

### ✅ 2. 数据库连接

检查数据库是否可以正常连接：

```sql
-- 测试查询
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM video_generations;
```

**验证方法**：
- 使用 Supabase Dashboard 或数据库客户端连接
- 确认表结构完整，特别是 `external_task_id` 字段

### ✅ 3. 用户积分

确认用户有足够的积分：

```sql
-- 查询用户积分
SELECT 
  u.email,
  uca.available_credits,
  uca.package_name,
  uca.package_expires_at,
  uca.is_expired
FROM users u
LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id
WHERE u.email = '你的邮箱';
```

**最低要求**：
- 文字生成视频：10 积分
- 图片生成视频：15 积分（10基础 + 5图片）

### ✅ 4. API密钥有效性

测试速创API密钥是否有效：

```bash
# 使用 curl 测试
curl -X POST "https://api.wuyinkeji.com/api/video/veoPlus" \
  -H "Content-Type: application/json;charset:utf-8;" \
  -H "Authorization: 你的API密钥" \
  -d '{
    "model": "veo3",
    "prompt": "测试视频",
    "type": "text2video",
    "ratio": "16:9"
  }'
```

**预期响应**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "id": 12345
  }
}
```

### ✅ 5. 服务器日志

检查服务器控制台输出：

```bash
# 如果使用 npm run dev
# 查看终端输出，寻找以下关键词：
# - "开始视频生成"
# - "速创API调用成功"
# - "速创API调用失败"
# - 任何错误堆栈信息
```

## 常见错误及解决方案

### 错误 1: "Cannot access 'duration' before initialization"

**原因**：变量名冲突（已修复）

**解决方案**：
1. 确保使用最新的代码
2. 重启开发服务器
3. 清除浏览器缓存

### 错误 2: "用户未登录"

**原因**：Session 未正确建立

**解决方案**：
1. 清除浏览器 Cookie
2. 重新登录
3. 检查 `NEXTAUTH_SECRET` 环境变量是否配置

### 错误 3: "积分不足"

**原因**：用户积分余额不足

**解决方案**：
1. 购买积分套餐
2. 或手动添加测试积分：
```sql
UPDATE user_credit_accounts 
SET available_credits = available_credits + 100
WHERE user_id = (SELECT id FROM users WHERE email = '你的邮箱');
```

### 错误 4: "套餐已过期"

**原因**：用户套餐到期

**解决方案**：
1. 购买新套餐
2. 或重置过期状态（仅用于测试）：
```sql
UPDATE user_credit_accounts 
SET is_expired = false,
    package_expires_at = NOW() + INTERVAL '30 days'
WHERE user_id = (SELECT id FROM users WHERE email = '你的邮箱');
```

### 错误 5: "速创API错误: 401"

**原因**：API密钥无效或已过期

**解决方案**：
1. 登录速创API控制台
2. 检查密钥是否有效
3. 如果过期，生成新密钥并更新 `.env` 文件

### 错误 6: "速创API错误: 402/403"

**原因**：API服务商账户余额不足

**解决方案**：
1. 登录速创API控制台
2. 充值账户余额
3. 系统会自动发送管理员通知邮件

### 错误 7: "速创API错误: 429"

**原因**：API调用频率过高

**解决方案**：
1. 等待几分钟后重试
2. 检查是否有异常的重复请求
3. 考虑升级API套餐

### 错误 8: "速创API错误: 500+"

**原因**：API服务暂时不可用

**解决方案**：
1. 等待几分钟后重试
2. 检查速创API服务状态
3. 如果持续出现，联系速创API技术支持

### 错误 9: 视频一直显示"生成中"

**原因**：轮询机制未正确工作或API返回异常

**解决方案**：
1. 检查浏览器控制台是否有错误
2. 手动查询视频状态：
```sql
SELECT id, status, external_task_id, error_message, created_at
FROM video_generations
WHERE user_id = (SELECT id FROM users WHERE email = '你的邮箱')
ORDER BY created_at DESC
LIMIT 5;
```
3. 如果 `external_task_id` 为空，说明API调用失败
4. 如果 `status` 为 'FAILED'，查看 `error_message`

### 错误 10: 前端显示"服务器内部错误"

**原因**：后端API抛出未捕获的异常

**解决方案**：
1. 检查服务器控制台日志
2. 查看完整的错误堆栈
3. 根据错误信息定位问题

## 调试步骤

### 步骤 1：启用详细日志

在 `.env` 文件中添加：
```env
NODE_ENV=development
DEBUG=*
```

### 步骤 2：使用浏览器开发者工具

1. 打开浏览器（F12）
2. 切换到 Network 标签
3. 尝试生成视频
4. 检查 `/api/generate/video` 请求：
   - 请求头（Headers）
   - 请求体（Payload）
   - 响应（Response）
   - 状态码（Status）

### 步骤 3：检查数据库记录

```sql
-- 查看最近的视频生成记录
SELECT 
  vg.id,
  vg.prompt,
  vg.status,
  vg.external_task_id,
  vg.error_message,
  vg.credits_consumed,
  vg.created_at,
  u.email
FROM video_generations vg
JOIN users u ON vg.user_id = u.id
ORDER BY vg.created_at DESC
LIMIT 10;
```

### 步骤 4：手动测试API

使用测试脚本：
```bash
node test-video-generation.js
```

或使用 Postman/Insomnia 测试：
```
POST http://localhost:3000/api/generate/video
Content-Type: application/json
Cookie: next-auth.session-token=你的session token

{
  "prompt": "一只可爱的小猫在玩耍",
  "images": [],
  "duration": 5,
  "aspectRatio": "16:9"
}
```

## 性能优化建议

### 1. 添加请求缓存

对于相同的提示词，可以返回之前生成的视频：

```typescript
// 在生成前检查是否有相同提示词的成功记录
const existingVideo = await pool.query(
  `SELECT video_url FROM video_generations 
   WHERE user_id = $1 AND prompt = $2 AND status = 'COMPLETED'
   ORDER BY created_at DESC LIMIT 1`,
  [userId, prompt]
)
```

### 2. 添加速率限制

防止用户频繁请求：

```typescript
// 检查用户最近的请求
const recentRequests = await pool.query(
  `SELECT COUNT(*) as count FROM video_generations 
   WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
  [userId]
)

if (recentRequests.rows[0].count >= 3) {
  return createErrorResponse(Errors.tooManyRequests())
}
```

### 3. 优化轮询频率

根据视频生成时间调整轮询间隔：

```typescript
// 前3次每3秒轮询一次
// 之后每10秒轮询一次
const pollInterval = pollCount < 3 ? 3000 : 10000
```

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：

1. **错误截图**：包括浏览器控制台和网络请求
2. **服务器日志**：最近的错误日志
3. **用户信息**：邮箱（用于查询数据库记录）
4. **复现步骤**：详细描述如何触发错误
5. **环境信息**：
   - Node.js 版本
   - 浏览器版本
   - 操作系统

## 更新日志

- 2025-11-16: 修复 duration 变量冲突
- 2025-11-16: 修复 API 端点和字段名
- 2025-11-16: 添加 external_task_id 字段
