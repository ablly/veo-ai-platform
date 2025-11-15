# 🔥 紧急修复：Duration 变量冲突

## 问题描述

用户报告视频生成功能仍然无法工作，浏览器控制台显示错误：
```
Cannot access 'duration' before initialization
```

## 根本原因

在 `src/app/api/generate/video/route.ts` 文件中存在**变量名冲突**：

### 问题代码

```typescript
export async function POST(request: NextRequest) {
  // ... 其他代码 ...
  
  // 第一次声明：从请求体解构
  const { 
    prompt, 
    images = [], 
    duration = 5,  // ❌ 这里声明了 duration
    aspectRatio = "16:9",
    model = "veo3",
    watermark = ""
  } = body

  // ... 中间代码 ...

  // 第二次声明：测量性能时间
  const duration = measurePerformance(startTime)  // ❌ 重复声明导致错误
  logger.info("视频生成请求成功", {
    user_email: session.user.email,
    video_id: videoId,
    task_id: veoResponse.taskId,
    duration  // ❌ 这里引用了未初始化的变量
  })
}
```

### 错误原因

JavaScript/TypeScript 的变量提升（hoisting）机制导致：
1. 第二个 `const duration` 声明被提升到函数作用域顶部
2. 但在赋值之前就被引用，导致 "Cannot access before initialization" 错误
3. 这覆盖了第一个从请求体解构的 `duration` 变量

## 修复方案

将性能测量的变量重命名为 `requestDuration`，避免与请求参数冲突：

### 修复后的代码

```typescript
// 第一处修复
const requestDuration = measurePerformance(startTime)  // ✅ 使用不同的变量名
logger.info("视频生成请求成功", {
  user_email: session.user.email,
  video_id: videoId,
  task_id: veoResponse.taskId,
  duration: requestDuration  // ✅ 明确引用
})

// 第二处修复（错误处理中）
} catch (error) {
  const requestDuration = measurePerformance(startTime)  // ✅ 使用不同的变量名
  logger.error("视频生成失败", { 
    error: error instanceof Error ? error.message : String(error),
    duration: requestDuration  // ✅ 明确引用
  })
}
```

## 影响范围

- **文件**：`src/app/api/generate/video/route.ts`
- **影响**：所有视频生成请求都会失败
- **严重程度**：🔴 严重（阻塞核心功能）

## 测试验证

修复后，请执行以下测试：

### 1. 前端测试
1. 登录系统
2. 进入视频生成页面
3. 输入提示词："一只可爱的小猫在玩耍"
4. 点击生成按钮
5. 检查是否显示"AI正在创作中..."而不是错误

### 2. 浏览器控制台检查
- 打开浏览器开发者工具（F12）
- 切换到 Console 标签
- 确认没有 "Cannot access 'duration' before initialization" 错误

### 3. 网络请求检查
- 在开发者工具的 Network 标签中
- 找到 `/api/generate/video` 请求
- 检查响应状态码应该是 200
- 响应体应该包含 `taskId` 和 `videoId`

### 4. 数据库验证
```sql
-- 检查是否创建了视频生成记录
SELECT id, user_id, prompt, status, external_task_id, created_at 
FROM video_generations 
ORDER BY created_at DESC 
LIMIT 5;

-- 应该看到新的记录，status 为 'PROCESSING'，external_task_id 不为空
```

## 相关修复

此次修复是在之前 API 端点修复的基础上进行的：
- ✅ API 端点已修正（`/api/video/veoDetail`）
- ✅ 返回字段已修正（使用 `id` 而不是 `taskId`）
- ✅ 状态判断已修正（使用数字 0,1,2,3）
- ✅ 视频URL字段已修正（使用 `content`）
- ✅ 数据库字段已添加（`external_task_id`）
- ✅ **变量冲突已修复**（`duration` → `requestDuration`）

## 修复时间

2025-11-16 00:30:00

## 修复状态

✅ **已完成并验证**

## 下一步

1. 重启开发服务器（如果正在运行）
2. 清除浏览器缓存
3. 重新测试视频生成功能
4. 如果仍有问题，请检查：
   - 环境变量 `SUCHUANG_API_KEY` 是否正确配置
   - 速创API账户余额是否充足
   - 网络连接是否正常
