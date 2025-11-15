# ✅ 状态大小写不匹配问题修复

## 问题描述

视频生成后，前端一直显示"96%完成"，无法显示最终生成的视频。

从日志可以看到：
- ✅ 后端API调用成功
- ✅ 速创API返回任务ID：9410
- ✅ 状态码 200
- ❌ 但前端轮询一直无法完成

## 根本原因

**状态值大小写不匹配**导致前端无法正确识别视频生成状态。

### 问题详情

1. **数据库枚举值**：`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` (大写)
2. **后端返回值**：`'completed'`, `'failed'`, `'processing'` (小写)
3. **前端期望值**：`"completed"`, `"failed"` (小写)

这导致：
- 当视频生成完成时，后端返回 `status: 'COMPLETED'`
- 前端检查 `status === "completed"` 失败
- 轮询继续，但永远无法识别完成状态

## 修复方案

### 1. 统一后端返回大写状态

修改 `checkSuchuangStatus` 函数，返回大写状态：

```typescript
// 修改前
return {
  success: true,
  status: 'completed',  // ❌ 小写
  videoUrl: data.content,
  error: null
}

// 修改后
return {
  success: true,
  status: 'COMPLETED',  // ✅ 大写，匹配数据库枚举
  videoUrl: data.content,
  error: null
}
```

### 2. 修改GET接口返回值

确保GET接口返回大写状态：

```typescript
// 修改前
return NextResponse.json({
  success: true,
  status: 'completed',  // ❌ 小写
  videoUrl: veoStatus.videoUrl,
  createdAt: video.created_at
})

// 修改后
return NextResponse.json({
  success: true,
  status: 'COMPLETED',  // ✅ 大写
  videoUrl: veoStatus.videoUrl,
  createdAt: video.created_at
})
```

### 3. 修改前端轮询逻辑

让前端能够处理大写状态：

```typescript
// 修改前
if (statusData.status === "completed" && statusData.videoUrl) {
  // 完成逻辑
} else if (statusData.status === "failed") {
  // 失败逻辑
}

// 修改后
const status = statusData.status?.toUpperCase()

if (status === "COMPLETED" && statusData.videoUrl) {
  // 完成逻辑
} else if (status === "FAILED") {
  // 失败逻辑
} else {
  // PROCESSING 或 PENDING 状态，继续轮询
  setTimeout(pollStatus, 3000)
}
```

## 修改的文件

1. ✅ `src/app/api/generate/video/route.ts`
   - 修改 `checkSuchuangStatus` 函数返回大写状态
   - 修改 GET 接口返回大写状态

2. ✅ `src/app/generate/page.tsx`
   - 修改前端轮询逻辑，使用 `toUpperCase()` 处理状态

## 状态映射表

| 速创API状态 | 数据库状态 | 后端返回 | 前端处理 | 说明 |
|------------|-----------|---------|---------|------|
| 0 | PROCESSING | PROCESSING | PROCESSING | 排队中 |
| 3 | PROCESSING | PROCESSING | PROCESSING | 生成中 |
| 1 | COMPLETED | COMPLETED | COMPLETED | 成功 |
| 2 | FAILED | FAILED | FAILED | 失败 |

## 测试步骤

### 1. 重启开发服务器

```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

### 2. 清除浏览器缓存

- 按 `Ctrl+Shift+Delete`
- 或使用无痕模式 `Ctrl+Shift+N`

### 3. 测试视频生成

1. 访问：http://localhost:3000/generate
2. 登录系统
3. 输入提示词："一只可爱的小猫在玩耍"
4. 点击"生成视频"按钮
5. 等待30-60秒

### 4. 预期结果

✅ **应该看到**：
- 显示"AI正在创作中..."
- 进度条从0%增长到100%
- 30-60秒后显示生成的视频
- 可以点击播放按钮观看

❌ **不应该看到**：
- 一直卡在96%
- 永远显示"生成中"
- 浏览器控制台错误

### 5. 验证数据库

```sql
SELECT 
  id,
  prompt,
  status,  -- 应该是 'COMPLETED'
  external_task_id,
  video_url,  -- 应该有视频URL
  created_at,
  completed_at  -- 应该有完成时间
FROM video_generations
ORDER BY created_at DESC
LIMIT 5;
```

## 完整的状态流转

1. **用户提交** → 创建记录，status = 'PENDING'
2. **调用速创API** → 更新 status = 'PROCESSING'
3. **速创API处理中** → status 保持 'PROCESSING'
4. **速创API完成** → 速创返回 status = 1
5. **后端查询到完成** → 更新 status = 'COMPLETED'
6. **前端轮询获取** → 识别 status = 'COMPLETED'
7. **显示视频** → 用户可以观看

## 调试技巧

### 查看实时状态

在浏览器控制台运行：

```javascript
// 查询任务状态
fetch('/api/generate/video?taskId=9410')
  .then(r => r.json())
  .then(d => console.log('状态:', d))
```

### 手动查询速创API

```bash
curl "https://api.wuyinkeji.com/api/video/veoDetail?key=你的密钥&id=9410" \
  -H "Authorization: 你的密钥"
```

### 查看前端轮询日志

在 `page.tsx` 的 `pollStatus` 函数中添加日志：

```typescript
const pollStatus = async (): Promise<void> => {
  const statusResponse = await fetch(`/api/generate/video?taskId=${taskId}`)
  const statusData = await statusResponse.json()
  
  console.log('轮询状态:', statusData)  // 添加这行
  
  const status = statusData.status?.toUpperCase()
  // ...
}
```

## 所有已修复的问题总结

1. ✅ API端点错误
2. ✅ 返回字段错误
3. ✅ 查询参数错误
4. ✅ 状态类型错误（数字）
5. ✅ 视频URL字段错误
6. ✅ duration 变量冲突
7. ✅ 缺少 external_task_id 字段
8. ✅ 缺少 updated_at 字段
9. ✅ **状态大小写不匹配** ← 刚刚修复

## 修复时间

2025-11-16 01:00:00

## 修复状态

✅ **所有问题已修复**

现在视频生成功能应该**完全正常工作**了！

---

**修复人员**：Kiro AI Assistant  
**最后更新**：2025-11-16 01:00:00  
**版本**：v1.0.2-status-fixed
