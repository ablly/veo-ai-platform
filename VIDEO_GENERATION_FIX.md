# 视频生成功能修复文档

## 问题描述

用户输入文字提示词或文字+图片后无法生成视频，显示"服务器内部错误"。

## 根本原因分析

通过对比速创API官方文档和现有代码，发现以下问题：

### 1. API端点错误
- **错误**：代码使用 `/api/video/veoPlus/query` 查询视频状态
- **正确**：应使用 `/api/video/veoDetail` （根据官方文档）

### 2. 返回字段名错误
- **错误**：代码期望返回 `taskId` 字段
- **正确**：速创API返回的是 `id` 字段

### 3. 查询参数错误
- **错误**：使用 `?taskId=xxx` 作为查询参数
- **正确**：应使用 `?key=你的密钥&id=xxx` （根据官方文档）

### 4. 状态值类型错误
- **错误**：代码期望字符串状态 `'completed'`, `'failed'`, `'processing'`
- **正确**：速创API返回数字状态：
  - `0`: 排队中
  - `1`: 成功
  - `2`: 失败
  - `3`: 生成中

### 5. 视频URL字段名错误
- **错误**：代码期望 `videoUrl` 字段
- **正确**：速创API返回的是 `content` 字段

### 6. 数据库字段缺失
- **问题**：数据库表 `video_generations` 缺少 `external_task_id` 字段
- **解决**：已添加该字段用于存储速创API返回的任务ID

## 修复内容

### 1. 更新 API 配置 (`src/config/api.ts`)

```typescript
ENDPOINTS: {
  GENERATE: '/api/video/veoPlus',
  QUERY: '/api/video/veoDetail'  // 修正为官方文档的端点
},
```

### 2. 修复视频生成API (`src/app/api/generate/video/route.ts`)

#### 2.1 修复任务ID获取逻辑

```typescript
// 修改前
const taskId = result.data.taskId || result.data.task_id || result.data.id

// 修改后
const taskId = result.data.id  // 直接使用id字段
if (!taskId) {
  throw new Error("速创API未返回任务ID")
}
```

#### 2.2 修复状态查询函数

```typescript
// 修改查询URL
const response = await fetch(
  `${SUCHUANG_API_URL}/api/video/veoDetail?key=${SUCHUANG_API_KEY}&id=${taskId}`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset:utf-8;',
      'Authorization': SUCHUANG_API_KEY
    }
  }
)

// 修改状态判断逻辑
if (data.status === 1 && data.content) {
  // 成功生成
  return {
    success: true,
    status: 'completed',
    videoUrl: data.content,  // 使用content字段
    error: null
  }
} else if (data.status === 2) {
  // 生成失败
  return {
    success: true,
    status: 'failed',
    videoUrl: null,
    error: data.fail_reason || '视频生成失败'
  }
} else if (data.status === 0 || data.status === 3) {
  // 排队中或生成中
  return {
    success: true,
    status: 'processing',
    videoUrl: null,
    error: null
  }
}
```

### 3. 数据库迁移

已执行迁移添加 `external_task_id` 字段：

```sql
ALTER TABLE video_generations 
ADD COLUMN IF NOT EXISTS external_task_id TEXT;

CREATE INDEX IF NOT EXISTS idx_video_generations_external_task_id 
ON video_generations(external_task_id);

COMMENT ON COLUMN video_generations.external_task_id IS '速创API返回的任务ID';
```

## 正确的视频生成流程

根据速创API官方文档，正确的流程应该是：

### 步骤1：提交视频生成请求

**请求**：
```http
POST https://api.wuyinkeji.com/api/video/veoPlus
Content-Type: application/json;charset:utf-8;
Authorization: 你的API密钥

{
  "model": "veo3",
  "prompt": "用户的提示词",
  "type": "text2video",  // 或 "img2video"
  "img_url": ["图片URL"],  // 仅当type为img2video时需要
  "ratio": "16:9"  // 或 "9:16"
}
```

**响应**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "id": 5823  // 这是任务ID，需要保存用于后续查询
  }
}
```

### 步骤2：查询视频生成结果

**请求**：
```http
GET https://api.wuyinkeji.com/api/video/veoDetail?key=你的密钥&id=5823
Content-Type: application/json;charset:utf-8;
Authorization: 你的API密钥
```

**响应**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "id": 5823,
    "content": "https://openpt.tos-cn-shanghai.volces.com/veo/xxx.mp4",
    "status": 1,  // 0:排队中，1:成功，2:失败，3:生成中
    "fail_reason": "",
    "created_at": "2025-08-23 10:37:17",
    "updated_at": "2025-08-23 10:39:10"
  }
}
```

## 测试建议

1. **测试文字生成视频**：
   - 输入简单的提示词（如"一只猫在玩球"）
   - 检查是否能成功提交并返回任务ID
   - 轮询查询状态直到完成

2. **测试图片生成视频**：
   - 上传一张图片
   - 输入提示词
   - 检查是否正确传递 `img_url` 参数

3. **测试错误处理**：
   - 测试积分不足的情况
   - 测试API密钥错误的情况
   - 测试网络超时的情况

## 环境变量检查

确保以下环境变量已正确配置：

```env
SUCHUANG_API_URL=https://api.wuyinkeji.com
SUCHUANG_API_KEY=你的速创API密钥
VEO_COST_PER_VIDEO=1.1
```

## 后续优化建议

1. **添加轮询机制**：前端可以定时查询视频生成状态，而不是让用户手动刷新
2. **添加Webhook**：如果速创API支持webhook，可以让API主动通知生成完成
3. **添加重试机制**：对于临时性失败，可以自动重试
4. **优化用户体验**：显示生成进度、预计等待时间等

## 修复完成时间

2025-11-16 00:15:00

## 修复人员

Kiro AI Assistant
