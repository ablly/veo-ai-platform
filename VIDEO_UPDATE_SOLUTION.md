# 🎬 视频显示问题解决方案

## 问题描述

视频已经在速创API生成完成，但在"我的视频"页面一直显示加载中，无法看到生成的视频。

## 根本原因

**前端轮询在用户离开页面后停止**，导致数据库状态没有更新：

1. 用户提交视频生成请求 ✅
2. 速创API开始处理 ✅
3. 数据库状态设为 `PROCESSING` ✅
4. 前端开始轮询查询状态 ✅
5. **用户离开页面** ❌
6. **前端轮询停止** ❌
7. **速创API生成完成，但数据库状态未更新** ❌
8. 用户回到"我的视频"页面，看到的还是 `PROCESSING` 状态 ❌

## 立即解决方法

### 方法 1：手动更新数据库（最快）

在 Supabase Dashboard 或数据库客户端运行：

```sql
-- 更新任务9410的状态（根据你的实际任务ID修改）
UPDATE video_generations
SET status = 'COMPLETED',
    video_url = '你从速创API查询到的视频URL',
    completed_at = NOW(),
    updated_at = NOW()
WHERE external_task_id = '9410';
```

**步骤**：
1. 访问速创API查询页面：https://api.wuyinkeji.com/api/video/veoDetail
2. 输入你的API密钥和任务ID
3. 复制返回的 `content` 字段（视频URL）
4. 在数据库中运行上面的SQL，替换视频URL
5. 刷新"我的视频"页面

### 方法 2：使用更新脚本

运行自动更新脚本：

```bash
node update-video-status.js
```

这个脚本会：
- 查询所有 `PROCESSING` 状态的视频
- 逐个调用速创API检查状态
- 自动更新数据库

### 方法 3：使用手动更新页面

1. 将 `manual-update-videos.html` 复制到 `public` 文件夹
2. 访问：http://localhost:3000/manual-update-videos.html
3. 点击"立即更新视频状态"按钮
4. 等待更新完成
5. 刷新"我的视频"页面

### 方法 4：调用更新API

```bash
curl http://localhost:3000/api/cron/update-videos \
  -H "Authorization: Bearer your-secret-key"
```

## 长期解决方案

### 1. 添加后台定时任务

使用 Vercel Cron Jobs 或其他定时任务服务，每5分钟自动检查一次：

**vercel.json**:
```json
{
  "crons": [
    {
      "path": "/api/cron/update-videos",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 2. 使用 Webhook（推荐）

如果速创API支持webhook，配置回调URL：

```typescript
const payload = {
  model: "veo3",
  prompt: prompt,
  type: type,
  ratio: aspectRatio,
  webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/veo`
}
```

然后创建webhook处理器：

```typescript
// src/app/api/webhooks/veo/route.ts
export async function POST(request: NextRequest) {
  const data = await request.json()
  
  // 验证签名
  // ...
  
  // 更新数据库
  await pool.query(`
    UPDATE video_generations
    SET status = 'COMPLETED',
        video_url = $1,
        completed_at = NOW()
    WHERE external_task_id = $2
  `, [data.videoUrl, data.taskId])
  
  return NextResponse.json({ success: true })
}
```

### 3. 改进前端轮询

让轮询在后台继续运行，即使用户离开页面：

```typescript
// 使用 Service Worker 或 Web Worker
// 或者使用 localStorage + setInterval 跨标签页轮询
```

### 4. 添加"刷新状态"按钮

在"我的视频"页面添加手动刷新按钮：

```typescript
const refreshStatus = async (videoId: string) => {
  const response = await fetch(`/api/videos/${videoId}/refresh`)
  const data = await response.json()
  
  if (data.success) {
    // 更新本地状态
    fetchVideos()
  }
}
```

## 当前状态

### 已完成的视频

根据你的截图，以下视频已经生成完成：

| 任务ID | 提示词 | 视频URL | 状态 |
|--------|--------|---------|------|
| 9412 | 一家人在一起包包子 | https://openpt.tos-cn-shanghai.volces.com/veo/20251115/f6d48bac1e0c57f0348c07.mp4 | ✅ 已更新 |
| 9410 | 一只可爱的小猫在玩小毛球 | 待查询 | ⏳ 待更新 |

### 需要更新的视频

运行以下SQL查看：

```sql
SELECT 
  id,
  prompt,
  external_task_id,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM video_generations
WHERE status = 'PROCESSING'
AND external_task_id IS NOT NULL
ORDER BY created_at DESC;
```

## 测试步骤

### 1. 验证视频已更新

```sql
SELECT id, prompt, status, video_url
FROM video_generations
WHERE status = 'COMPLETED'
ORDER BY completed_at DESC
LIMIT 5;
```

### 2. 刷新"我的视频"页面

1. 访问：http://localhost:3000/my-videos
2. 应该看到视频卡片
3. 视频应该可以播放（有播放控件）

### 3. 测试视频播放

1. 点击视频播放按钮
2. 视频应该正常播放
3. 可以暂停、调整音量、全屏等

## 前端修复

已修复的问题：

1. ✅ 视频元素添加了 `controls` 属性
2. ✅ 添加了 `preload="metadata"` 预加载
3. ✅ 添加了 `playsInline` 移动端支持
4. ✅ 移除了悬停播放按钮（改为直接显示控件）

修改的文件：
- `src/app/my-videos/page.tsx`

## 后端修复

已创建的文件：

1. ✅ `src/app/api/cron/update-videos/route.ts` - 定时更新API
2. ✅ `update-video-status.js` - 手动更新脚本
3. ✅ `manual-update-videos.html` - 手动更新页面

## 环境变量

确保配置了以下环境变量：

```env
SUCHUANG_API_URL=https://api.wuyinkeji.com
SUCHUANG_API_KEY=你的速创API密钥
CRON_SECRET=your-secret-key  # 用于保护定时任务API
```

## 监控和维护

### 定期检查

每天运行一次检查脚本：

```bash
node update-video-status.js
```

### 查看统计

```sql
-- 各状态视频数量
SELECT status, COUNT(*) as count
FROM video_generations
GROUP BY status;

-- 超过1小时还在PROCESSING的视频
SELECT id, prompt, external_task_id, created_at
FROM video_generations
WHERE status = 'PROCESSING'
AND created_at < NOW() - INTERVAL '1 hour';
```

## 常见问题

### Q1: 视频一直显示加载中

**A**: 运行更新脚本或手动更新数据库

### Q2: 视频无法播放

**A**: 检查视频URL是否有效，尝试在浏览器中直接访问

### Q3: 更新脚本报错

**A**: 检查环境变量配置，确保API密钥正确

### Q4: 定时任务不工作

**A**: 检查 vercel.json 配置，确保部署到Vercel

## 下一步优化

1. [ ] 添加视频缩略图生成
2. [ ] 添加视频下载功能
3. [ ] 添加视频分享功能
4. [ ] 添加视频删除功能
5. [ ] 添加视频搜索和筛选
6. [ ] 添加视频播放统计

---

**最后更新**：2025-11-16 01:30:00  
**状态**：✅ 已提供多种解决方案
