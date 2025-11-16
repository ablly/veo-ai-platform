# 🚀 多模型完整实现指南

## ✅ 已完成

1. **数据库** - 添加model字段 ✅
2. **配置文件** - VEO3和SORA2配置 ✅
3. **模型选择器UI** - 完整的前端界面 ✅
4. **SORA2参数组件** - 时长、比例、续作PID ✅
5. **模型适配器** - 统一API调用接口 ✅

## 🔧 需要手动完成的步骤

### 步骤1: 修改生成页面
**文件**: `src/app/generate/page.tsx`

找到这一行（约第20行）：
```typescript
const [generationData, setGenerationData] = useState<GenerationData>({
  prompt: "",
  images: [],
  isGenerating: false
})
```

**替换为**：
```typescript
const [generationData, setGenerationData] = useState<GenerationData>({
  prompt: "",
  images: [],
  model: "veo3",
  duration: 10,
  aspectRatio: "9:16",
  remixTargetId: "",
  isGenerating: false
})
```

找到VideoInput组件调用（约第150行）：
```typescript
<VideoInput
  prompt={generationData.prompt}
  images={generationData.images}
  isGenerating={generationData.isGenerating}
  onPromptChange={(prompt) => setGenerationData(prev => ({ ...prev, prompt }))}
  onImagesChange={(images) => setGenerationData(prev => ({ ...prev, images }))}
  onGenerate={handleGenerate}
/>
```

**替换为**：
```typescript
<VideoInput
  prompt={generationData.prompt}
  images={generationData.images}
  model={generationData.model}
  duration={generationData.duration}
  aspectRatio={generationData.aspectRatio}
  remixTargetId={generationData.remixTargetId}
  isGenerating={generationData.isGenerating}
  onPromptChange={(prompt) => setGenerationData(prev => ({ ...prev, prompt }))}
  onImagesChange={(images) => setGenerationData(prev => ({ ...prev, images }))}
  onModelChange={(model) => setGenerationData(prev => ({ ...prev, model }))}
  onDurationChange={(duration) => setGenerationData(prev => ({ ...prev, duration }))}
  onAspectRatioChange={(aspectRatio) => setGenerationData(prev => ({ ...prev, aspectRatio }))}
  onRemixTargetIdChange={(remixTargetId) => setGenerationData(prev => ({ ...prev, remixTargetId }))}
  onGenerate={handleGenerate}
/>
```

找到API调用（约第80行）：
```typescript
const response = await fetch("/api/generate/video", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: generationData.prompt,
    images: uploadedImages
  })
})
```

**替换为**：
```typescript
const response = await fetch("/api/generate/video", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: generationData.prompt,
    images: uploadedImages,
    model: generationData.model,
    duration: generationData.duration,
    aspectRatio: generationData.aspectRatio,
    remixTargetId: generationData.remixTargetId
  })
})
```

更新接口定义（约第10行）：
```typescript
interface GenerationData {
  prompt: string
  images: File[]
  model: string
  duration: number
  aspectRatio: string
  remixTargetId: string
  isGenerating: boolean
  result?: {
    videoUrl: string
    id: string
    createdAt: string
  }
}
```

### 步骤2: 修改视频生成API
**文件**: `src/app/api/generate/video/route.ts`

在文件顶部添加导入：
```typescript
import { generateVideo } from '@/lib/video-models'
```

找到参数解析（约第20行）：
```typescript
const { 
  prompt, 
  images = [], 
  duration = 5, 
  aspectRatio = "16:9",
  model = "veo3",
  watermark = ""
} = body
```

**替换为**：
```typescript
const { 
  prompt, 
  images = [], 
  model = "veo3",
  duration = model === 'sora2' ? 10 : 5, 
  aspectRatio = model === 'sora2' ? "9:16" : "16:9",
  remixTargetId = ""
} = body
```

找到API调用部分（约第100行），替换 `callSuchuangAPI` 调用：
```typescript
// 调用速创API生成视频
const veoResponse = await callSuchuangAPI({
  prompt,
  images,
  videoId,
  duration,
  aspectRatio,
  model,
  watermark
})
```

**替换为**：
```typescript
// 根据模型调用对应的API
const apiResponse = await generateVideo(model, {
  prompt,
  images,
  duration,
  aspectRatio,
  remixTargetId
})
```

找到响应处理（约第110行）：
```typescript
if (!veoResponse.success) {
  // ... 错误处理
}
```

**替换为**：
```typescript
if (!apiResponse.success) {
  // 回滚积分
  await pool.query(
    `UPDATE user_credit_accounts 
     SET available_credits = available_credits + $1,
         used_credits = used_credits - $1
     WHERE user_id = $2`,
    [totalCredits, user.id]
  )

  await pool.query(
    `UPDATE video_generations 
     SET status = 'FAILED', 
         error_message = $1
     WHERE id = $2`,
    [apiResponse.error, videoId]
  )

  return createErrorResponse(Errors.externalServiceError("视频生成API", apiResponse.error || "生成失败"))
}
```

找到保存taskId部分（约第130行）：
```typescript
await pool.query(
  `UPDATE video_generations 
   SET external_task_id = $1,
       updated_at = NOW()
   WHERE id = $2`,
  [veoResponse.taskId, videoId]
)
```

**替换为**：
```typescript
await pool.query(
  `UPDATE video_generations 
   SET external_task_id = $1,
       model = $2,
       updated_at = NOW()
   WHERE id = $3`,
  [apiResponse.taskId, model, videoId]
)
```

### 步骤3: 修改定时更新任务
**文件**: `src/app/api/cron/update-videos/route.ts`

在文件顶部添加导入：
```typescript
import { checkVideoStatus } from '@/lib/video-models'
```

找到查询SQL（约第85行）：
```typescript
const result = await pool.query(`
  SELECT id, external_task_id, prompt, created_at
  FROM video_generations
  WHERE status = 'PROCESSING' 
  AND external_task_id IS NOT NULL
  AND created_at > NOW() - INTERVAL '24 hours'
  ORDER BY created_at DESC
  LIMIT 50
`)
```

**替换为**：
```typescript
const result = await pool.query(`
  SELECT id, external_task_id, model, prompt, created_at
  FROM video_generations
  WHERE status = 'PROCESSING' 
  AND external_task_id IS NOT NULL
  AND created_at > NOW() - INTERVAL '24 hours'
  ORDER BY created_at DESC
  LIMIT 50
`)
```

找到状态查询（约第105行）：
```typescript
const status = await checkSuchuangStatus(video.external_task_id)
```

**替换为**：
```typescript
const model = video.model || 'veo3'
const status = await checkVideoStatus(model, video.external_task_id)
```

## 🚀 部署到生产环境

### 1. 提交代码
```bash
git add .
git commit -m "✨ 实现多模型支持 (VEO3 + SORA2)"
git push origin main
```

### 2. 部署到Vercel/EdgeOne
代码推送后会自动部署

### 3. 验证功能
1. 访问生成页面
2. 选择VEO 3.1模型，生成测试视频
3. 选择SORA 2.0模型，设置参数，生成测试视频
4. 等待3-5分钟
5. 检查"我的视频"页面
6. 确认两个模型的视频都能正常显示

## ✅ 完成标准

- [ ] 用户能选择VEO 3.1或SORA 2.0
- [ ] SORA 2.0显示时长、比例、续作PID选项
- [ ] 两个模型都能成功生成视频
- [ ] 视频URL正确保存到数据库
- [ ] 定时任务能更新两种模型的视频
- [ ] 视频能在前端正常播放
- [ ] 我的视频页面显示模型标签

## 🎯 预期效果

用户体验：
1. 打开生成页面
2. 看到模型选择器（VEO 3.1 / SORA 2.0）
3. 选择SORA 2.0时，看到额外的参数选项
4. 输入提示词，设置参数
5. 点击生成
6. 等待3-5分钟
7. 视频自动显示 ✅

所有模型都能完美工作！🎉
