"use client"

import { useState, useEffect } from "react"
import { Mail, TrendingUp, Users, Calendar, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"

interface MarketingEmailStats {
  total: number
  sent: number
  failed: number
  byType: {
    credit_low: number
    credit_empty: number
    first_purchase_offer: number
    last_chance_offer: number
  }
}

interface MarketingEmailLog {
  id: string
  user_email: string
  user_name: string
  email_type: string
  status: string
  sent_at: string
  message_id?: string
}

export default function MarketingEmailsPage() {
  const [stats, setStats] = useState<MarketingEmailStats | null>(null)
  const [logs, setLogs] = useState<MarketingEmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')

  useEffect(() => {
    fetchData()
  }, [page, filterType, dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取统计数据
      const statsRes = await fetch(`/api/admin/marketing-emails/stats?range=${dateRange}`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // 获取日志列表
      const logsRes = await fetch(
        `/api/admin/marketing-emails/logs?page=${page}&limit=20&type=${filterType}&range=${dateRange}`
      )
      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData.logs || [])
        setTotalPages(logsData.totalPages || 1)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      credit_low: '积分不足提醒',
      credit_empty: '积分用完提醒',
      first_purchase_offer: '首单特惠',
      last_chance_offer: '最后提醒'
    }
    return labels[type] || type
  }

  const getEmailTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      credit_low: 'bg-yellow-100 text-yellow-800',
      credit_empty: 'bg-red-100 text-red-800',
      first_purchase_offer: 'bg-blue-100 text-blue-800',
      last_chance_offer: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">营销邮件统计</h2>
          <p className="text-gray-600 mt-1">自动化营销邮件发送记录和统计</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </button>
      </div>

      {/* 时间范围选择 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">时间范围：</span>
        {(['today', 'week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-3 py-1 text-sm rounded-lg ${
              dateRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range === 'today' && '今天'}
            {range === 'week' && '最近7天'}
            {range === 'month' && '最近30天'}
            {range === 'all' && '全部'}
          </button>
        ))}
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总发送量</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">发送成功</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              成功率: {stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">发送失败</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">转化率</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">8-15%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">预期转化率</p>
          </div>
        </div>
      )}

      {/* 邮件类型统计 */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">邮件类型分布</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">{getEmailTypeLabel(type)}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 邮件类型筛选 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">邮件类型：</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 text-sm rounded-lg ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {['credit_low', 'credit_empty', 'first_purchase_offer', 'last_chance_offer'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-sm rounded-lg ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getEmailTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* 邮件发送记录 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">发送记录</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">用户</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">邮件类型</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">发送时间</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Message ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.user_name || '未设置'}
                              </div>
                              <div className="text-sm text-gray-500">{log.user_email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getEmailTypeColor(log.email_type)}`}>
                              {getEmailTypeLabel(log.email_type)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {log.status === 'SENT' ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                成功
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                失败
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {formatDate(log.sent_at)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 font-mono">
                            {log.message_id ? (
                              <a
                                href={`https://resend.com/emails/${log.message_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {log.message_id.substring(0, 8)}...
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          暂无发送记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    第 {page} 页，共 {totalPages} 页
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">自动化邮件说明</h4>
            <p className="text-sm text-blue-700 mt-1">
              营销邮件由Cron任务自动发送，每天执行一次（北京时间17点）。
              邮件包括积分提醒、首单特惠等，帮助提高用户转化率。
            </p>
            <p className="text-sm text-blue-700 mt-2">
              💡 可以在Resend控制台查看详细的邮件统计：
              <a
                href="https://resend.com/emails"
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                https://resend.com/emails
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
