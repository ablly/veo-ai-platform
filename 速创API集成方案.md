# 速创API集成实施方案

> **VEO3视频生成服务 - 完整集成指南**

---

## 📋 项目信息

- **选择平台**: 速创API (api.wuyinkeji.com)
- **服务类型**: VEO3视频生成
- **定价**: ¥1.1/次（基础版）
- **预期利润率**: 85%-92%
- **实施时间**: 2-3小时

---

## 🎯 集成目标

### 核心功能
1. ✅ 替换现有VEO API为速创API
2. ✅ 适配速创API的请求/响应格式
3. ✅ 实现积分扣减（15积分=1视频）
4. ✅ 记录成本（¥1.1/次）
5. ✅ 完善错误处理和日志
6. ✅ 添加成本统计和管理后台

---

## 📊 速创API接口分析

### 基础信息

```
官网：https://api.wuyinkeji.com
文档：待确认（注册后访问）
客服：https://service.tjit.net/
```

### 预期接口格式（基于通用API平台规范）

#### 1. 生成视频接口

```http
POST https://api.wuyinkeji.com/api/veo3/generate
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "prompt": "视频描述文本",
  "model": "veo3",           // veo3 | veo3-fast | veo3-pro
  "duration": 8,             // 视频时长（秒）
  "aspectRatio": "16:9",     // 宽高比
  "watermark": ""            // 可选水印
}
```

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_abc123..."
  }
}
```

#### 2. 查询结果接口

```http
GET https://api.wuyinkeji.com/api/veo3/query?taskId=task_abc123
Authorization: Bearer YOUR_API_KEY
```

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "completed",      // pending | processing | completed | failed
    "videoUrl": "https://...",  // 视频下载地址
    "errorMessage": ""          // 失败时的错误信息
  }
}
```

---

## 🔧 实施步骤

### 阶段1：环境配置（10分钟）

#### 1.1 创建环境变量文件

创建 `.env.local`:

```env
# 速创API配置
SUCHUANG_API_KEY=your_api_key_here
SUCHUANG_API_URL=https://api.wuyinkeji.com

# 成本配置
VEO_COST_PER_VIDEO=1.1

# 数据库配置（保持不变）
DATABASE_URL=your_supabase_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# 支付宝配置（保持不变）
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
# ... 其他配置
```

#### 1.2 更新配置文件

文件：`src/config/api.ts`（新建）

```typescript
export const API_CONFIG = {
  // 速创API配置
  SUCHUANG: {
    BASE_URL: process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com',
    API_KEY: process.env.SUCHUANG_API_KEY,
    ENDPOINTS: {
      GENERATE: '/api/veo3/generate',
      QUERY: '/api/veo3/query'
    }
  },
  
  // 成本配置
  COSTS: {
    VEO3: parseFloat(process.env.VEO_COST_PER_VIDEO || '1.1'),
    VEO3_FAST: 2.0,
    VEO3_PRO: 5.0
  }
}
```

---

### 阶段2：修改视频生成API（30分钟）

#### 2.1 更新 `src/app/api/generate/video/route.ts`

**主要修改点**:

1. **替换API URL和Key**:
```typescript
// 旧代码
const VEO_API_URL = process.env.VEO_API_URL || "https://api.veo3api.ai/api/v1"
const VEO_API_KEY = process.env.VEO_API_KEY

// 新代码
import { API_CONFIG } from '@/config/api'
const SUCHUANG_API_URL = API_CONFIG.SUCHUANG.BASE_URL
const SUCHUANG_API_KEY = API_CONFIG.SUCHUANG.API_KEY
```

2. **修改 `callVeoAPI` 函数**:
```typescript
async function callSuchuangAPI(options: {
  prompt: string
  images: string[]
  videoId: string
  duration?: number
  aspectRatio?: string
  model?: string
  watermark?: string
}) {
  try {
    if (!SUCHUANG_API_KEY) {
      throw new Error("速创API密钥未配置")
    }

    const { prompt, images, videoId, duration = 8, aspectRatio = "16:9", model = "veo3", watermark = "" } = options

    // 构建请求载荷（速创API格式）
    const payload: any = {
      prompt,
      model,
      duration,
      aspectRatio,
      watermark: watermark || undefined
    }

    // 如果有参考图片，添加到payload
    if (images && images.length > 0) {
      payload.imageUrls = images
    }

    logger.info("调用速创API", { prompt, model, duration, aspectRatio })

    const response = await fetch(`${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUCHUANG_API_KEY}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("速创API返回错误", { status: response.status, error: errorData })
      throw new Error(errorData.msg || `速创API错误: ${response.status}`)
    }

    const result = await response.json()
    
    // 速创API响应格式: { code: 200, data: { taskId: "..." }, msg: "success" }
    if (result.code !== 200 || !result.data || !result.data.taskId) {
      throw new Error(result.msg || "速创API返回数据格式错误")
    }

    logger.info("速创API调用成功", { taskId: result.data.taskId, videoId })
    
    return {
      success: true,
      taskId: result.data.taskId
    }

  } catch (error) {
    logger.error("速创API调用失败", { 
      error: error instanceof Error ? error.message : String(error), 
      prompt: options.prompt 
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "速创API调用失败"
    }
  }
}
```

3. **修改 `checkVeoStatus` 函数**:
```typescript
async function checkSuchuangStatus(taskId: string) {
  try {
    if (!SUCHUANG_API_KEY) {
      throw new Error("速创API密钥未配置")
    }

    const response = await fetch(
      `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.QUERY}?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUCHUANG_API_KEY}`
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      throw new Error(`速创API状态查询错误: ${response.status}`)
    }

    const result = await response.json()
    
    // 速创API响应格式:
    // {
    //   code: 200,
    //   msg: "success",
    //   data: {
    //     status: "completed",      // pending | processing | completed | failed
    //     videoUrl: "https://...",
    //     errorMessage: ""
    //   }
    // }
    
    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || "速创API返回数据格式错误")
    }

    const data = result.data
    
    if (data.status === 'completed' && data.videoUrl) {
      return {
        success: true,
        status: 'completed',
        videoUrl: data.videoUrl,
        error: null
      }
    } else if (data.status === 'failed') {
      return {
        success: true,
        status: 'failed',
        videoUrl: null,
        error: data.errorMessage || '视频生成失败'
      }
    } else {
      // processing 或 pending
      return {
        success: true,
        status: 'processing',
        videoUrl: null,
        error: null
      }
    }

  } catch (error) {
    logger.error("速创API状态查询失败", { 
      error: error instanceof Error ? error.message : String(error), 
      taskId 
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "状态查询失败"
    }
  }
}
```

4. **添加成本记录**:

在视频生成成功后,记录成本:

```typescript
// 调用API成功后
await pool.query(
  `INSERT INTO api_cost_records 
   (user_id, video_id, api_provider, model, cost, created_at)
   VALUES ($1, $2, $3, $4, $5, NOW())`,
  [user.id, videoId, 'suchuang', model, API_CONFIG.COSTS.VEO3]
)
```

---

### 阶段3：数据库更新（20分钟）

#### 3.1 创建成本记录表

```sql
-- 创建API成本记录表
CREATE TABLE IF NOT EXISTS api_cost_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  video_id BIGINT REFERENCES video_generations(id),
  api_provider VARCHAR(50) NOT NULL,  -- 'suchuang', 'viva', etc.
  model VARCHAR(50) NOT NULL,         -- 'veo3', 'veo3-fast', etc.
  cost DECIMAL(10, 2) NOT NULL,       -- 实际成本
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_cost_user ON api_cost_records(user_id);
CREATE INDEX idx_api_cost_created ON api_cost_records(created_at);
CREATE INDEX idx_api_cost_provider ON api_cost_records(api_provider);
```

#### 3.2 更新配置表

```sql
-- 更新系统配置
UPDATE system_config 
SET config_value = '1.1'
WHERE config_key = 'veo_api_cost_per_video';

INSERT INTO system_config (config_key, config_value, description)
VALUES 
  ('api_provider', 'suchuang', '当前使用的API提供商'),
  ('suchuang_api_url', 'https://api.wuyinkeji.com', '速创API地址')
ON CONFLICT (config_key) DO UPDATE 
SET config_value = EXCLUDED.config_value;
```

---

### 阶段4：管理后台成本统计（40分钟）

#### 4.1 创建成本统计API

文件：`src/app/api/admin/statistics/cost/route.ts`（新建）

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TODO: 验证管理员权限
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "未授权")
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today | week | month | all

    let dateFilter = ''
    switch(period) {
      case 'today':
        dateFilter = "DATE(created_at) = CURRENT_DATE"
        break
      case 'week':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'"
        break
      case 'month':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'"
        break
      default:
        dateFilter = "1=1"
    }

    // 查询总成本
    const costResult = await pool.query(`
      SELECT 
        COUNT(*) as total_videos,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost,
        api_provider,
        model
      FROM api_cost_records
      WHERE ${dateFilter}
      GROUP BY api_provider, model
      ORDER BY total_cost DESC
    `)

    // 查询收入
    const revenueResult = await pool.query(`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_orders
      FROM credit_orders
      WHERE status = 'COMPLETED'
        AND ${dateFilter}
    `)

    // 查询积分使用情况
    const creditsResult = await pool.query(`
      SELECT 
        SUM(credits_consumed) as total_credits_used
      FROM video_generations
      WHERE ${dateFilter}
    `)

    const costs = costResult.rows
    const revenue = revenueResult.rows[0]
    const credits = creditsResult.rows[0]

    const totalCost = costs.reduce((sum, row) => sum + parseFloat(row.total_cost || 0), 0)
    const totalRevenue = parseFloat(revenue?.total_revenue || 0)
    const profit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(2) : 0

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalRevenue,
        totalCost,
        profit,
        profitMargin: `${profitMargin}%`,
        totalOrders: parseInt(revenue?.total_orders || 0),
        totalVideos: parseInt(credits?.total_credits_used || 0) / 15
      },
      costBreakdown: costs.map(row => ({
        provider: row.api_provider,
        model: row.model,
        count: parseInt(row.total_videos),
        totalCost: parseFloat(row.total_cost),
        avgCost: parseFloat(row.avg_cost)
      }))
    })

  } catch (error) {
    console.error('成本统计查询失败', error)
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}
```

#### 4.2 创建管理后台页面

文件：`src/app/admin/statistics/page.tsx`（新建）

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function StatisticsPage() {
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/statistics/cost?period=${period}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('获取统计数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">成本与收益统计</h1>
      
      {/* 时间段选择 */}
      <div className="mb-6 flex gap-2">
        {['today', 'week', 'month', 'all'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded ${period === p ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {p === 'today' ? '今日' : p === 'week' ? '本周' : p === 'month' ? '本月' : '全部'}
          </button>
        ))}
      </div>

      {/* 汇总统计 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">总收入</h3>
          <p className="text-2xl font-bold text-green-600">¥{data?.summary?.totalRevenue?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">总成本</h3>
          <p className="text-2xl font-bold text-red-600">¥{data?.summary?.totalCost?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">净利润</h3>
          <p className="text-2xl font-bold text-blue-600">¥{data?.summary?.profit?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">利润率</h3>
          <p className="text-2xl font-bold">{data?.summary?.profitMargin}</p>
        </div>
      </div>

      {/* 详细成本分解 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">成本明细</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">API提供商</th>
              <th className="text-left p-2">模型</th>
              <th className="text-right p-2">调用次数</th>
              <th className="text-right p-2">总成本</th>
              <th className="text-right p-2">平均成本</th>
            </tr>
          </thead>
          <tbody>
            {data?.costBreakdown?.map((item: any, idx: number) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{item.provider}</td>
                <td className="p-2">{item.model}</td>
                <td className="text-right p-2">{item.count}</td>
                <td className="text-right p-2">¥{item.totalCost.toFixed(2)}</td>
                <td className="text-right p-2">¥{item.avgCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

### 阶段5：文档更新（20分钟）

#### 5.1 更新README.md

```markdown
## 🔧 环境变量配置

### 速创API配置

```env
# 速创API（VEO3视频生成）
SUCHUANG_API_KEY=your_suchuang_api_key
SUCHUANG_API_URL=https://api.wuyinkeji.com
VEO_COST_PER_VIDEO=1.1
```

获取API Key:
1. 访问 https://api.wuyinkeji.com
2. 注册账号并充值
3. 在控制台获取API Key
```

#### 5.2 创建速创API使用指南

文件：`veo-ai-platform/速创API使用指南.md`

---

### 阶段6：测试（30分钟）

#### 6.1 单元测试

1. **测试速创API连接**
2. **测试视频生成流程**
3. **测试状态查询**
4. **测试成本记录**

#### 6.2 集成测试

1. **完整流程**: 购买积分 → 生成视频 → 查询状态 → 获取视频
2. **错误处理**: API超时、余额不足、生成失败等场景
3. **性能测试**: 并发请求、大量视频生成

---

## 📝 实施清单

### 准备阶段
- [ ] 注册速创API账号
- [ ] 充值测试金额（建议¥100-200）
- [ ] 获取API Key
- [ ] 测试API接口连通性

### 代码修改
- [ ] 创建 `src/config/api.ts`
- [ ] 修改 `src/app/api/generate/video/route.ts`
- [ ] 创建 `src/app/api/admin/statistics/cost/route.ts`
- [ ] 创建 `src/app/admin/statistics/page.tsx`
- [ ] 更新环境变量配置

### 数据库更新
- [ ] 创建 `api_cost_records` 表
- [ ] 更新 `system_config` 表
- [ ] 创建索引

### 测试验证
- [ ] 单元测试
- [ ] 集成测试
- [ ] 压力测试

### 文档更新
- [ ] 更新 `README.md`
- [ ] 创建 `速创API使用指南.md`
- [ ] 更新 `生产环境部署指南.md`

---

## 🚀 部署步骤

### 1. 本地测试
```bash
# 更新环境变量
cp .env.example .env.local
# 编辑 .env.local 添加 SUCHUANG_API_KEY

# 运行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

### 2. 测试视频生成
1. 登录平台
2. 购买测试积分
3. 生成测试视频
4. 验证成本记录

### 3. 生产部署
```bash
# 构建项目
npm run build

# 部署到服务器
# （具体步骤参考生产环境部署指南）
```

---

## ⚠️ 注意事项

### 1. API Key安全
- ❌ 不要将API Key提交到Git
- ✅ 使用环境变量存储
- ✅ 定期轮换密钥

### 2. 成本控制
- ✅ 设置每日最大调用次数
- ✅ 监控异常调用
- ✅ 定期检查余额

### 3. 错误处理
- ✅ API超时重试机制
- ✅ 失败自动退款
- ✅ 详细错误日志

### 4. 性能优化
- ✅ 使用连接池
- ✅ 异步处理视频生成
- ✅ 缓存查询结果

---

## 📞 技术支持

- **速创API客服**: https://service.tjit.net/
- **技术交流群**: 见速创API官网
- **BUG反馈**: 见速创API官网

---

## 📈 后续优化

### 短期（1-2周）
- [ ] 添加速创API余额监控
- [ ] 优化视频生成队列
- [ ] 完善管理后台

### 中期（1-2月）
- [ ] 支持多API提供商（备用）
- [ ] 视频生成加速
- [ ] 高级功能（veo3-fast, veo3-pro）

### 长期（3-6月）
- [ ] 智能成本优化
- [ ] 自动选择最优API
- [ ] 批量视频生成

---

**准备好了吗？让我们开始实施！** 🚀


