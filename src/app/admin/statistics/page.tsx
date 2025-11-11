'use client'

import { useState, useEffect } from 'react'

interface CostStats {
  success: boolean
  period: string
  summary: {
    totalRevenue: string | number
    totalCost: string | number
    profit: string | number
    profitMargin: string
    totalOrders: number
    totalVideos: number
    totalCreditsUsed: number
    activeUsers: number
  }
  costBreakdown: Array<{
    provider: string
    model: string
    count: number
    totalCost: number
    avgCost: number
  }>
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState<CostStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/statistics/cost?period=${period}`)
      if (!res.ok) {
        throw new Error('获取统计数据失败')
      }
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
      console.error('获取统计数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  const periodLabels: Record<string, string> = {
    today: '今日',
    week: '本周',
    month: '本月',
    all: '全部'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">错误: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">成本与收益统计</h1>
        <p className="text-gray-600 mt-2">实时监控API成本、收入和利润情况</p>
      </div>
      
      {/* 时间段选择 */}
      <div className="mb-6 flex gap-2">
        {Object.entries(periodLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              period === key 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 总收入 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-green-700 text-sm font-medium">总收入</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-green-900">
            ¥{typeof data.summary.totalRevenue === 'number' 
              ? data.summary.totalRevenue.toFixed(2) 
              : data.summary.totalRevenue}
          </p>
          <p className="text-green-600 text-sm mt-2">
            {data.summary.totalOrders} 笔订单
          </p>
        </div>

        {/* 总成本 */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-700 text-sm font-medium">总成本</h3>
            <span className="text-2xl">📉</span>
          </div>
          <p className="text-3xl font-bold text-red-900">
            ¥{typeof data.summary.totalCost === 'number' 
              ? data.summary.totalCost.toFixed(2) 
              : data.summary.totalCost}
          </p>
          <p className="text-red-600 text-sm mt-2">
            {data.summary.totalVideos} 个视频
          </p>
        </div>

        {/* 净利润 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-blue-700 text-sm font-medium">净利润</h3>
            <span className="text-2xl">💎</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            ¥{typeof data.summary.profit === 'number' 
              ? data.summary.profit.toFixed(2) 
              : data.summary.profit}
          </p>
          <p className="text-blue-600 text-sm mt-2">
            利润率: {data.summary.profitMargin}
          </p>
        </div>

        {/* 活跃用户 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-700 text-sm font-medium">活跃用户</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">
            {data.summary.activeUsers}
          </p>
          <p className="text-purple-600 text-sm mt-2">
            消耗 {data.summary.totalCreditsUsed} 积分
          </p>
        </div>
      </div>

      {/* 成本明细表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">API成本明细</h2>
          <p className="text-gray-600 text-sm mt-1">按提供商和模型分类的详细成本</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">API提供商</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">模型</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">调用次数</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">总成本</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">平均成本</th>
              </tr>
            </thead>
            <tbody>
              {data.costBreakdown.length > 0 ? (
                data.costBreakdown.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {item.provider}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{item.model}</td>
                    <td className="text-right p-4 font-mono text-gray-900">{item.count}</td>
                    <td className="text-right p-4 font-mono text-red-600 font-medium">
                      ¥{item.totalCost.toFixed(2)}
                    </td>
                    <td className="text-right p-4 font-mono text-gray-600">
                      ¥{item.avgCost.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900">统计说明</h3>
            <ul className="mt-2 text-blue-800 text-sm space-y-1">
              <li>• 成本统计基于速创API实际调用记录（¥1.1/次）</li>
              <li>• 收入统计仅包含已完成的支付订单</li>
              <li>• 失败的视频生成会自动退款，不计入成本</li>
              <li>• 数据每分钟更新一次</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

