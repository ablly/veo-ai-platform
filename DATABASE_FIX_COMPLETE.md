# ✅ 数据库字段修复完成

## 问题描述

错误日志显示：
```
Error: column "updated_at" of relation "video_generations" does not exist
```

## 根本原因

数据库表 `video_generations` 缺少 `updated_at` 字段，但代码中尝试更新该字段。

## 修复内容

### 1. 添加 updated_at 字段

```sql
ALTER TABLE video_generations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 2. 为现有记录设置初始值

```sql
UPDATE video_generations 
SET updated_at = created_at 
WHERE updated_at IS NULL;
```

### 3. 创建自动更新触发器

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_video_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_video_generations_updated_at
    BEFORE UPDATE ON video_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_video_generations_updated_at();
```

## 验证结果

✅ `updated_at` 字段已成功添加  
✅ 字段类型：`timestamp with time zone`  
✅ 默认值：`now()`  
✅ 自动更新触发器已创建

## 完整的表结构

现在 `video_generations` 表包含以下字段：

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | text | gen_random_uuid() | 主键 |
| user_id | text | - | 用户ID |
| prompt | text | - | 提示词 |
| reference_images | jsonb | - | 参考图片 |
| video_url | text | - | 视频URL |
| thumbnail_url | text | - | 缩略图URL |
| duration | integer | - | 视频时长 |
| resolution | text | - | 分辨率 |
| status | video_generation_status | 'PENDING' | 状态 |
| queue_position | integer | - | 队列位置 |
| processing_time | integer | - | 处理时间 |
| error_message | text | - | 错误信息 |
| credits_consumed | integer | 0 | 消耗积分 |
| created_at | timestamptz | now() | 创建时间 |
| completed_at | timestamptz | - | 完成时间 |
| api_provider | varchar | 'suchuang' | API提供商 |
| model | varchar | 'veo-2' | 模型名称 |
| cost | numeric | 0 | 成本 |
| external_task_id | text | - | 外部任务ID |
| **updated_at** | **timestamptz** | **now()** | **更新时间** ✅ |

## 所有已修复的问题总结

### 1. API集成问题 ✅
- [x] 查询端点错误 → 已修正为 `/api/video/veoDetail`
- [x] 返回字段错误 → 已修正为使用 `id`
- [x] 查询参数错误 → 已修正为 `?key=xxx&id=xxx`
- [x] 状态类型错误 → 已修正为数字 (0,1,2,3)
- [x] 视频URL字段错误 → 已修正为使用 `content`

### 2. 代码问题 ✅
- [x] duration 变量冲突 → 已重命名为 `requestDuration`

### 3. 数据库问题 ✅
- [x] 缺少 `external_task_id` 字段 → 已添加
- [x] 缺少 `updated_at` 字段 → 已添加
- [x] 缺少自动更新触发器 → 已创建

## 测试步骤

### 1. 验证数据库字段

```sql
-- 查询表结构
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'video_generations' 
ORDER BY ordinal_position;

-- 应该看到 updated_at 字段
```

### 2. 测试视频生成

1. 访问：http://localhost:3000/generate
2. 登录系统
3. 输入提示词："一只可爱的小猫在玩耍"
4. 点击"生成视频"按钮
5. 观察：
   - ✅ 不应该再出现 "updated_at does not exist" 错误
   - ✅ 应该显示"AI正在创作中..."
   - ✅ 浏览器控制台没有错误

### 3. 检查数据库记录

```sql
-- 查看最新的视频生成记录
SELECT 
  id,
  prompt,
  status,
  external_task_id,
  created_at,
  updated_at,  -- 应该有值
  error_message
FROM video_generations
ORDER BY created_at DESC
LIMIT 5;
```

**预期结果**：
- `external_task_id` 应该有值（速创API返回的任务ID）
- `updated_at` 应该有值（记录更新时间）
- `status` 应该是 'PROCESSING'
- `error_message` 应该为空

### 4. 测试触发器

```sql
-- 手动更新一条记录
UPDATE video_generations 
SET status = 'COMPLETED'
WHERE id = (SELECT id FROM video_generations ORDER BY created_at DESC LIMIT 1);

-- 检查 updated_at 是否自动更新
SELECT id, status, created_at, updated_at 
FROM video_generations 
ORDER BY created_at DESC 
LIMIT 1;

-- updated_at 应该比 created_at 更新
```

## 完整的视频生成流程

现在整个流程应该是：

1. **用户提交请求** → 前端发送 POST /api/generate/video
2. **验证用户和积分** → 检查登录状态和积分余额
3. **扣除积分** → 从用户账户扣除积分
4. **创建数据库记录** → 插入 video_generations 记录
5. **调用速创API** → 提交视频生成请求
6. **获取任务ID** → 从响应中获取 `id` 字段
7. **更新数据库** → 保存 `external_task_id` 和 `updated_at` ✅
8. **记录成本** → 插入 api_cost_records 记录
9. **返回响应** → 返回 taskId 和 videoId 给前端
10. **前端轮询** → 每3秒查询一次状态
11. **查询状态** → GET /api/generate/video?taskId=xxx
12. **调用速创查询API** → GET /api/video/veoDetail?key=xxx&id=xxx
13. **解析状态** → 根据数字状态判断（0,1,2,3）
14. **更新数据库** → 当状态为完成时，保存视频URL
15. **显示结果** → 前端显示生成的视频

## 环境变量检查

确保以下环境变量已正确配置：

```env
# 必需
SUCHUANG_API_URL=https://api.wuyinkeji.com
SUCHUANG_API_KEY=你的速创API密钥
DATABASE_URL=你的数据库连接字符串

# 可选
VEO_COST_PER_VIDEO=1.1
NODE_ENV=development
```

## 常见问题排查

### Q1: 仍然显示 "updated_at does not exist"

**A**: 重启开发服务器
```bash
# 停止服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### Q2: 视频生成后状态一直是 PROCESSING

**A**: 检查速创API是否正常工作
```bash
node test-video-generation.js
```

### Q3: 前端显示"服务器内部错误"

**A**: 查看服务器控制台日志，找到具体错误信息

### Q4: 积分被扣除但视频生成失败

**A**: 检查数据库记录
```sql
SELECT id, status, error_message, external_task_id
FROM video_generations
WHERE user_id = (SELECT id FROM users WHERE email = '你的邮箱')
ORDER BY created_at DESC
LIMIT 5;
```

如果 `external_task_id` 为空，说明速创API调用失败。
如果 `error_message` 有值，查看具体错误原因。

## 性能优化

### 1. 添加索引

```sql
-- 为常用查询字段添加索引
CREATE INDEX IF NOT EXISTS idx_video_generations_user_id 
ON video_generations(user_id);

CREATE INDEX IF NOT EXISTS idx_video_generations_status 
ON video_generations(status);

CREATE INDEX IF NOT EXISTS idx_video_generations_created_at 
ON video_generations(created_at DESC);
```

### 2. 定期清理旧记录

```sql
-- 删除30天前的失败记录
DELETE FROM video_generations
WHERE status = 'FAILED' 
AND created_at < NOW() - INTERVAL '30 days';
```

## 修复时间

2025-11-16 00:45:00

## 修复状态

✅ **所有数据库问题已修复**  
✅ **所有代码问题已修复**  
✅ **所有API集成问题已修复**

## 最终确认

现在视频生成功能应该**完全正常工作**了！

如果还有任何问题，请提供：
1. 完整的错误日志
2. 浏览器控制台截图
3. 数据库查询结果

---

**修复人员**：Kiro AI Assistant  
**最后更新**：2025-11-16 00:45:00  
**版本**：v1.0.1-database-fixed
