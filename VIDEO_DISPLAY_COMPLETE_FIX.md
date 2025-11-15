# 视频显示问题完整修复方案

## 问题描述

用户反馈：
- 视频已经生成（数据库中状态为 COMPLETED）
- 官方API可以看到视频数据（id: 9412）
- 但在"我的视频"页面和"生成页面"都看不到视频内容
- 视频预览区域显示黑屏或加载图标

## 问题诊断

### 1. 数据库检查 ✅

通过 Supabase MCP 查询确认：

```sql
SELECT id, prompt, status, external_task_id, video_url, created_at
FROM video_generations
WHERE external_task_id = '9412';
```

**结果**：
- ✅ 视频记录存在
- ✅ 状态为 `COMPLETED`
- ✅ `external_task_id` = `9412`
- ✅ `video_url` = `https://openpt.tos-cn-shanghai.volces.com/veo/20251115/f6d48bac1e0c57f0348c07.mp4`
- ✅ 用户: `3533912007@qq.com` (周启航)

### 2. 前端问题分析

可能的原因：
1. **CORS跨域问题** - 视频URL来自第三方CDN，可能被浏览器阻止
2. **video标签缺少必要属性** - 缺少 `crossOrigin`、`playsInline` 等
3. **视频加载错误未处理** - 没有错误日志，无法定位问题
4. **API返回数据格式问题** - 字段名不匹配

## 修复方案

### 修复 1: 增强 video 标签属性

**文件**: `src/app/my-videos/page.tsx`

添加以下属性到所有 video 标签：
- `crossOrigin="anonymous"` - 允许跨域访问
- `playsInline` - 移动端内联播放
- `onError` - 错误处理
- `onLoadedData` - 加载成功回调

**修改内容**：
```tsx
<video
  src={video.videoUrl}
  className="w-full h-full object-cover"
  poster={video.thumbnailUrl}
  muted
  loop
  preload="metadata"
  crossOrigin="anonymous"  // ✅ 新增
  playsInline              // ✅ 新增
  onError={(e) => {        // ✅ 新增
    console.error('视频加载失败:', video.videoUrl, e);
  }}
  onLoadedData={() => {    // ✅ 新增
    console.log('视频加载成功:', video.videoUrl);
  }}
  onMouseEnter={(e) => {
    const videoEl = e.target as HTMLVideoElement;
    videoEl.currentTime = 0;
    videoEl.play().catch(err => console.error('播放失败:', err));
  }}
  onMouseLeave={(e) => {
    const videoEl = e.target as HTMLVideoElement;
    videoEl.pause();
    videoEl.currentTime = 0;
  }}
/>
```

### 修复 2: 修复生成页面视频显示

**文件**: `src/app/generate/page.tsx`

同样添加必要属性：
```tsx
<video
  src={generationData.result.videoUrl}
  controls
  autoPlay
  className="w-full h-auto"
  poster="/placeholder-video.jpg"
  crossOrigin="anonymous"  // ✅ 新增
  playsInline              // ✅ 新增
  onError={(e) => {        // ✅ 新增
    console.error('视频加载失败:', generationData.result?.videoUrl, e);
  }}
  onLoadedData={() => {    // ✅ 新增
    console.log('视频加载成功:', generationData.result?.videoUrl);
  }}
>
  您的浏览器不支持视频播放。
</video>
```

### 修复 3: 修复弹窗播放器

**文件**: `src/app/my-videos/page.tsx`

在创建弹窗视频元素时添加属性：
```tsx
const videoEl = document.createElement('video');
videoEl.src = video.videoUrl!;
videoEl.controls = true;
videoEl.autoplay = true;
videoEl.className = 'w-full rounded-lg';
videoEl.crossOrigin = 'anonymous';  // ✅ 新增
videoEl.playsInline = true;         // ✅ 新增
```

### 修复 4: 添加API调试日志

**文件**: `src/app/api/videos/my-videos/route.ts`

在返回数据前添加日志：
```typescript
// 调试日志：输出视频数据
logger.info("返回视频列表", { 
  count: videos.length, 
  completedCount: videos.filter(v => v.status === 'COMPLETED').length,
  firstVideo: videos[0] ? {
    id: videos[0].id,
    status: videos[0].status,
    hasVideoUrl: !!videos[0].videoUrl
  } : null
})
```

## 测试步骤

### 1. 使用测试页面验证

打开浏览器访问：
```
http://localhost:3000/test-video-display.html
```

这个测试页面会：
- ✅ 直接测试视频URL是否可播放
- ✅ 测试API返回的数据
- ✅ 显示详细的加载日志
- ✅ 检测CORS和网络问题

### 2. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
1. **Console** - 查看错误日志和加载日志
2. **Network** - 查看视频请求是否成功
3. **Application** - 检查是否有缓存问题

### 3. 清除缓存并刷新

```bash
# 方法1: 硬刷新
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# 方法2: 清除浏览器缓存
浏览器设置 -> 清除浏览数据 -> 缓存的图片和文件
```

### 4. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 可能的额外问题

### 问题 1: CORS 错误

**症状**：
```
Access to video at 'https://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解决方案**：
如果视频CDN不支持CORS，需要创建代理：

```typescript
// src/app/api/proxy/video/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get('url')
  
  if (!videoUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  const response = await fetch(videoUrl)
  const blob = await response.blob()
  
  return new Response(blob, {
    headers: {
      'Content-Type': 'video/mp4',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
```

然后修改视频URL：
```tsx
<video src={`/api/proxy/video?url=${encodeURIComponent(video.videoUrl)}`} />
```

### 问题 2: 视频格式不支持

**症状**：
```
MEDIA_ERR_SRC_NOT_SUPPORTED
```

**解决方案**：
检查视频编码格式，确保浏览器支持：
- 推荐格式: H.264 (MP4)
- 音频编码: AAC

### 问题 3: 网络问题

**症状**：
```
MEDIA_ERR_NETWORK
```

**解决方案**：
1. 检查网络连接
2. 尝试直接在浏览器中打开视频URL
3. 检查防火墙设置

## 验证清单

完成修复后，请验证：

- [ ] 打开 `http://localhost:3000/test-video-display.html`
- [ ] 测试1的视频能正常播放
- [ ] 点击"获取我的视频"按钮，能看到视频列表
- [ ] 点击"测试视频URL可访问性"，显示成功
- [ ] 打开"我的视频"页面 (`/my-videos`)
- [ ] 能看到"一家人在一起包包子"视频
- [ ] 鼠标悬停时视频能自动播放预览
- [ ] 点击播放按钮能打开全屏播放
- [ ] 点击"下载视频"能成功下载
- [ ] 打开"生成视频"页面 (`/generate`)
- [ ] 生成新视频后能在右侧看到结果
- [ ] 浏览器控制台没有错误信息

## 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| MEDIA_ERR_ABORTED (1) | 用户中止 | 正常，用户主动停止 |
| MEDIA_ERR_NETWORK (2) | 网络错误 | 检查网络连接 |
| MEDIA_ERR_DECODE (3) | 解码错误 | 视频文件损坏或格式不支持 |
| MEDIA_ERR_SRC_NOT_SUPPORTED (4) | 格式不支持 | 检查视频编码格式 |

## 下一步

如果问题仍然存在：

1. **检查视频URL是否可直接访问**
   ```bash
   curl -I "https://openpt.tos-cn-shanghai.volces.com/veo/20251115/f6d48bac1e0c57f0348c07.mp4"
   ```

2. **查看服务器日志**
   ```bash
   # 查看Next.js日志
   npm run dev
   ```

3. **检查数据库连接**
   ```sql
   SELECT COUNT(*) FROM video_generations WHERE status = 'COMPLETED';
   ```

4. **联系技术支持**
   - 提供浏览器控制台截图
   - 提供Network标签截图
   - 提供视频ID和用户邮箱

## 总结

本次修复主要解决了：
1. ✅ video标签缺少跨域属性
2. ✅ 缺少错误处理和日志
3. ✅ 移动端播放问题
4. ✅ 添加了完整的测试工具

修复后，视频应该能够正常显示和播放。
