'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface MonitorData {
  totalVideos: number
  processingVideos: number
  completedVideos: number
  failedVideos: number
  stuckVideos: number
  successRate: string
  averageProcessingTime: string
  recentActivity: Array<{
    id: string
    status: string
    createdAt: string
    completedAt?: string
  }>
}

export default function VideoMonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchMonitorData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/videos/monitor')
      const result = await response.json()
      setData(result)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('获取监控数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitorData()
    // 每30秒自动刷新
    const interval = setInterval(fetchMonitorData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>加载监控数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">视频监控面板</h1>
          <p className="text-muted-foreground mt-1">
            实时监控视频生成状态和系统健康度
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </span>
          <Button onClick={fetchMonitorData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总视频数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalVideos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              所有视频记录
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">处理中</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.processingVideos || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              正在生成的视频
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.completedVideos || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              成功率: {data?.successRate || '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">异常视频</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(data?.failedVideos || 0) + (data?.stuckVideos || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              失败: {data?.failedVideos || 0} | 卡住: {data?.stuckVideos || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 性能指标 */}
      <Card>
        <CardHeader>
          <CardTitle>性能指标</CardTitle>
          <CardDescription>系统处理效率统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">成功率</p>
              <p className="text-3xl font-bold mt-2">{data?.successRate || '0%'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">平均处理时间</p>
              <p className="text-3xl font-bold mt-2">{data?.averageProcessingTime || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">卡住视频</p>
              <p className="text-3xl font-bold mt-2 text-orange-600">
                {data?.stuckVideos || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                超过30分钟未完成
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>最新的视频生成记录</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {activity.status === 'COMPLETED' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {activity.status === 'PROCESSING' && (
                      <Clock className="w-5 h-5 text-blue-500" />
                    )}
                    {activity.status === 'FAILED' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">视频 #{activity.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        创建于: {new Date(activity.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : activity.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {activity.status === 'COMPLETED' && '已完成'}
                      {activity.status === 'PROCESSING' && '处理中'}
                      {activity.status === 'FAILED' && '失败'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">暂无活动记录</p>
          )}
        </CardContent>
      </Card>

      {/* 健康检查按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>系统维护</CardTitle>
          <CardDescription>手动触发系统检查和修复</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/videos/health-check')
                const result = await response.json()
                alert(`健康检查完成！\n检查视频数: ${result.checked || 0}\n修复视频数: ${result.fixed || 0}`)
                fetchMonitorData()
              } catch (error) {
                alert('健康检查失败: ' + error)
              }
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            健康检查
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/cron/fix-stuck-videos', {
                  headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`
                  }
                })
                const result = await response.json()
                alert(`修复完成！\n检查视频数: ${result.checked || 0}\n修复视频数: ${result.fixed || 0}`)
                fetchMonitorData()
              } catch (error) {
                alert('修复失败: ' + error)
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            修复卡住视频
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/cron/update-videos', {
                  headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`
                  }
                })
                const result = await response.json()
                alert(`更新完成！\n更新视频数: ${result.updated || 0}`)
                fetchMonitorData()
              } catch (error) {
                alert('更新失败: ' + error)
              }
            }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            更新视频状态
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
