# 生产环境部署指南 - 视频URL自动更新系统

## 🎯 目标

确保所有用户生成视频后能自动接收到正确的视频URL，并能在前端正常观看视频。

## ✅ 已完成的修复

### 1. 数据库更新 ✅
- 视频9412的URL已更新为正确的URL
- URL格式: `https://openpt1.oss-cn-shanghai.aliyuncs.com/...`

### 2. 定时更新任务优化 ✅
**文件**: `src/app/api/cron/update-videos/route.ts`

**改进**:
- ✅ 添加了详细的日志记录
- ✅ 记录速创API原始响应
- ✅ 返回更新详情供管理界面使用
- ✅ 正确解析 `data.content` 字段获取视频URL

**关键代码**:
```typescript
// 记录原始响应
logger.info("速创API原始响应", { 
  taskId, 
  status: data.status, 
  hasContent: !!data.content,
  contentPreview: data.content ? data.content.substring(0, 80) : null
})

// 成功时记录URL
if (data.status === 1 && data.content) {
  logger.info("✅ 视频URL获取成功", { 
    taskId, 
    videoUrl: data.content 
  })
}
```

### 3. 视频生成API优化 ✅
**文件**: `src/app/api/generate/video/route.ts`

**改进**:
- ✅ 同样添加了详细日志
- ✅ 轮询时正确获取视频URL
- ✅ 确保URL正确保存到数据库

### 4. 前端video标签优化 ✅
**文件**: 
- `src/app/my-videos/page.tsx`
- `src/app/generate/page.tsx`

**改进**:
- ✅ 添加 `crossOrigin="anonymous"` 支持跨域
- ✅ 添加 `playsInline` 支持移动端
- ✅ 添加错误处理和加载日志
- ✅ 优化视频预览和播放体验

### 5. 管理工具创建 ✅
**文件**: `src/app/admin/update-videos/page.tsx`

**功能**:
- ✅ 手动触发视频状态更新
- ✅ 显示更新统计（已完成/失败/处理中）
- ✅ 显示每个视频的详细信息
- ✅ 实时查看视频URL

**访问地址**: `http://localhost:3000/admin/update-videos`

## 🚀 部署步骤

### 步骤1: 设置环境变量

在 `.env.local` 或生产环境中设置：

```bash
# 速创API配置
SUCHUANG_API_URL=https://api.wuyinkeji.com
SUCHUANG_API_KEY=你的密钥

# Cron任务密钥（用于保护定时任务端点）
CRON_SECRET=your-secure-random-string

# 数据库连接
DATABASE_URL=你的Supabase数据库URL
```

### 步骤2: 设置定时任务

#### 方案A: Vercel Cron Jobs（推荐）

在项目根目录创建 `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-videos",
      "schedule": "*/3 * * * *"
    }
  ]
}
```

这会每3分钟自动检查并更新视频状态。

#### 方案B: 外部Cron服务

使用 [cron-job.org](https://cron-job.org) 或类似服务：

1. 创建新的Cron Job
2. URL: `https://your-domain.com/api/cron/update-videos`
3. 频率: 每3分钟
4. 添加Header: `Authorization: Bearer your-cron-secret`

#### 方案C: 手动触发（开发/测试）

访问管理界面手动触发：
```
https://your-domain.com/admin/update-videos
```

### 步骤3: 验证部署

#### 3.1 测试视频生成流程

1. 登录系统
2. 访问 `/generate` 页面
3. 输入提示词生成视频
4. 等待3-5分钟
5. 检查"我的视频"页面是否显示视频

#### 3.2 检查日志

查看服务器日志，确认：
- ✅ 视频生成请求成功
- ✅ 获取到 taskId
- ✅ 定时任务正常运行
- ✅ 成功获取视频URL
- ✅ 数据库更新成功

关键日志示例：
```
✅ 视频生成成功，URL已获取 { taskId: '9412', videoUrl: 'https://...' }
✅ 视频生成完成并更新URL { videoId: '...', videoUrl: 'https://...' }
```

#### 3.3 使用测试工具

访问测试页面验证：
```
https://your-domain.com/test-video-display.html
```

测试内容：
- [ ] 视频1能正常播放
- [ ] 点击"获取我的视频"能看到视频列表
- [ ] 点击"测试视频URL可访问性"显示成功
- [ ] 浏览器控制台没有错误

### 步骤4: 监控和维护

#### 4.1 设置日志监控

使用 Vercel Logs 或其他日志服务监控：
- 视频生成成功率
- URL获取成功率
- 定时任务执行情况

#### 4.2 定期检查

每天检查：
```sql
-- 检查PROCESSING状态超过1小时的视频
SELECT id, prompt, external_task_id, created_at
FROM video_generations
WHERE status = 'PROCESSING'
AND created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

如果有长时间PROCESSING的视频，使用管理工具手动更新。

#### 4.3 错误告警

设置告警规则：
- 如果视频生成失败率 > 10%，发送通知
- 如果定时任务连续失败3次，发送通知
- 如果有视频超过2小时还在PROCESSING，发送通知

## 📊 系统工作流程

### 完整流程图

```
用户生成视频
    ↓
调用 /api/generate/video
    ↓
创建数据库记录 (status: PROCESSING)
    ↓
调用速创API (获取 taskId)
    ↓
保存 external_task_id 到数据库
    ↓
前端开始轮询状态
    ↓
定时任务每3分钟运行
    ↓
查询所有 PROCESSING 状态的视频
    ↓
调用速创API查询状态
    ↓
如果 status === 1 (成功)
    ↓
获取 data.content (视频URL)
    ↓
更新数据库:
  - status = 'COMPLETED'
  - video_url = data.content
  - completed_at = NOW()
    ↓
前端轮询获取到 COMPLETED 状态
    ↓
显示视频给用户 ✅
```

### 关键时间点

- **T+0秒**: 用户提交生成请求
- **T+2秒**: 获取taskId，开始生成
- **T+30秒**: 第一次定时任务检查（如果设置为30秒）
- **T+3分钟**: 通常视频生成完成
- **T+3分钟**: 定时任务获取URL并更新数据库
- **T+3分钟+5秒**: 前端轮询获取到视频URL
- **T+3分钟+10秒**: 用户看到视频 ✅

## 🔧 故障排查

### 问题1: 视频生成后看不到

**检查步骤**:
1. 查看数据库记录
```sql
SELECT id, prompt, status, external_task_id, video_url
FROM video_generations
WHERE user_id = '用户ID'
ORDER BY created_at DESC
LIMIT 5;
```

2. 如果 `external_task_id` 为空
   - 问题: 速创API调用失败
   - 解决: 检查API密钥和网络连接

3. 如果 `external_task_id` 有值但 `video_url` 为空
   - 问题: 定时任务未运行或失败
   - 解决: 手动访问 `/admin/update-videos` 触发更新

4. 如果 `video_url` 有值但前端看不到
   - 问题: 前端缓存或video标签问题
   - 解决: 硬刷新页面 (Ctrl+Shift+R)

### 问题2: 定时任务不运行

**检查步骤**:
1. 验证Vercel Cron配置
2. 检查环境变量 `CRON_SECRET`
3. 查看Vercel Logs
4. 手动调用API测试:
```bash
curl -X GET "https://your-domain.com/api/cron/update-videos" \
  -H "Authorization: Bearer your-cron-secret"
```

### 问题3: 视频URL返回404

**原因**: URL格式错误或CDN问题

**解决**:
1. 检查速创API返回的原始URL
2. 确认使用 `data.content` 字段
3. 不要修改URL格式
4. 如果CDN有问题，联系速创API支持

## 📝 维护清单

### 每日检查
- [ ] 查看视频生成成功率
- [ ] 检查是否有长时间PROCESSING的视频
- [ ] 查看错误日志

### 每周检查
- [ ] 清理失败的视频记录
- [ ] 检查存储空间使用情况
- [ ] 更新API密钥（如需要）

### 每月检查
- [ ] 审查系统性能
- [ ] 优化数据库查询
- [ ] 更新依赖包

## 🎉 成功标准

系统正常运行的标志：

✅ 用户生成视频后3-5分钟内能看到视频
✅ 视频URL格式正确（`openpt1.oss-cn-shanghai.aliyuncs.com`）
✅ 视频能在浏览器中正常播放
✅ 定时任务每3分钟自动运行
✅ 管理界面能正常显示统计信息
✅ 日志中没有错误信息
✅ 视频生成成功率 > 95%

## 📞 技术支持

如果遇到问题：

1. 查看本文档的故障排查部分
2. 检查浏览器控制台错误
3. 查看服务器日志
4. 使用测试工具验证
5. 访问管理界面手动更新

---

**最后更新**: 2025-11-15
**版本**: 1.0.0
**状态**: ✅ 生产就绪
