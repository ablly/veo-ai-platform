"use client"

import { useState, useEffect } from "react"
import { Search, Eye, RefreshCw, Download, Filter, CheckCircle, XCircle, Clock, Coins, AlertCircle, CheckSquare } from "lucide-react"

interface Order {
  id: string
  order_number: string
  user_email: string
  user_name: string
  package_name: string
  order_credits: number
  payment_amount: number
  payment_method: string
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  created_at: string
  payment_time?: string
  alipay_trade_no?: string
  stripe_payment_intent_id?: string
  user_current_credits?: number
  user_total_credits?: number
  user_used_credits?: number
  user_package_expires_at?: string
  user_current_package?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    completedCount: 0,
    totalPages: 1,
    currentPage: 1
  })
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        status: statusFilter
      })
      
      // 使用原来的API（兼容未部署的情况）
      const response = await fetch(`/api/admin/orders/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        // 兼容两种API格式
        if (data.statistics) {
          setStatistics(data.statistics)
        } else {
          setStatistics({
            totalOrders: data.totalOrders || 0,
            totalRevenue: data.totalRevenue || 0,
            pendingCount: data.pendingCount || 0,
            completedCount: data.completedCount || 0,
            totalPages: data.totalPages || 1,
            currentPage: data.currentPage || 1
          })
        }
      }
    } catch (error) {
      console.error("获取订单列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualComplete = async (orderNumber: string) => {
    if (!confirm(`确定要手动完成订单 ${orderNumber} 吗？\n\n这将：\n1. 更新订单状态为已支付\n2. 给用户充值积分\n3. 发送购买成功邮件`)) {
      return
    }

    const reason = prompt('请输入补单原因（可选）：', '支付回调失败，手动补单')
    
    setProcessingOrder(orderNumber)
    try {
      const response = await fetch('/api/admin/orders/manual-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          reason: reason || '手动补单'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✅ 补单成功！\n\n订单号：${data.order.orderNumber}\n用户：${data.order.userEmail}\n积分：${data.order.credits}\n过期时间：${new Date(data.order.expiresAt).toLocaleDateString('zh-CN')}`)
        fetchOrders() // 刷新列表
      } else {
        alert(`❌ 补单失败：${data.message}`)
      }
    } catch (error) {
      console.error('补单失败:', error)
      alert('❌ 补单失败，请查看控制台日志')
    } finally {
      setProcessingOrder(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        label: "待支付", 
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock
      },
      PAID: { 
        label: "已支付", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle
      },
      COMPLETED: { 
        label: "已完成", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle
      },
      FAILED: { 
        label: "支付失败", 
        className: "bg-red-100 text-red-800",
        icon: XCircle
      },
      CANCELLED: { 
        label: "已取消", 
        className: "bg-gray-100 text-gray-800",
        icon: XCircle
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("导出订单失败:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
          <p className="text-gray-600 mt-1">管理用户订单和支付记录</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
          <button 
            onClick={exportOrders}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总订单数</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总收入</p>
              <p className="text-2xl font-bold text-gray-900">¥{statistics.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">¥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已完成订单</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">待处理订单</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索订单号、用户邮箱、用户名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="PENDING">待支付</option>
              <option value="PAID">已支付</option>
              <option value="COMPLETED">已完成</option>
              <option value="FAILED">支付失败</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">订单信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">套餐</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户积分</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-mono text-sm text-gray-900 font-medium">
                              {order.order_number}
                            </div>
                            {order.alipay_trade_no && (
                              <div className="text-xs text-gray-500 mt-1">
                                支付宝: {order.alipay_trade_no.slice(0, 20)}...
                              </div>
                            )}
                            {order.stripe_payment_intent_id && (
                              <div className="text-xs text-gray-500 mt-1">
                                Stripe: {order.stripe_payment_intent_id.slice(0, 20)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{order.user_name || "未设置"}</div>
                            <div className="text-sm text-gray-500">{order.user_email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{order.package_name}</div>
                            <div className="text-sm text-gray-500">{order.order_credits} 积分</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {order.user_current_credits !== undefined ? (
                            <div>
                              <div className="flex items-center text-sm">
                                <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="font-medium text-gray-900">
                                  {order.user_current_credits}
                                </span>
                                <span className="text-gray-500 ml-1">可用</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                总计: {order.user_total_credits} | 已用: {order.user_used_credits}
                              </div>
                              {order.user_package_expires_at && (
                                <div className="text-xs text-orange-600 mt-1">
                                  到期: {new Date(order.user_package_expires_at).toLocaleDateString('zh-CN')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">无积分记录</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">¥{order.payment_amount}</div>
                          <div className="text-sm text-gray-500">{order.payment_method}</div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <div>{formatDate(order.created_at)}</div>
                          {order.payment_time && (
                            <div className="text-xs text-green-600 mt-1">
                              支付: {formatDate(order.payment_time)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.status === 'PENDING' && (
                              <button 
                                onClick={() => handleManualComplete(order.order_number)}
                                disabled={processingOrder === order.order_number}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                title="手动完成订单"
                              >
                                {processingOrder === order.order_number ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <CheckSquare className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        暂无订单数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {statistics.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  第 {currentPage} 页，共 {statistics.totalPages} 页
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(statistics.totalPages, currentPage + 1))}
                    disabled={currentPage === statistics.totalPages}
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

      {/* 订单详情弹窗 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">订单详情</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 订单信息 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">订单信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">订单号：</span>
                    <span className="font-mono">{selectedOrder.order_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">状态：</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <span className="text-gray-500">套餐：</span>
                    <span className="font-medium">{selectedOrder.package_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">积分：</span>
                    <span className="font-medium">{selectedOrder.order_credits}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">金额：</span>
                    <span className="font-medium">¥{selectedOrder.payment_amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">支付方式：</span>
                    <span>{selectedOrder.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* 用户信息 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">用户信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">用户名：</span>
                    <span>{selectedOrder.user_name || "未设置"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">邮箱：</span>
                    <span>{selectedOrder.user_email}</span>
                  </div>
                  {selectedOrder.user_current_credits !== undefined && (
                    <>
                      <div>
                        <span className="text-gray-500">当前积分：</span>
                        <span className="font-medium text-yellow-600">{selectedOrder.user_current_credits}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">总积分：</span>
                        <span>{selectedOrder.user_total_credits}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">已用积分：</span>
                        <span>{selectedOrder.user_used_credits}</span>
                      </div>
                      {selectedOrder.user_package_expires_at && (
                        <div>
                          <span className="text-gray-500">套餐到期：</span>
                          <span className="text-orange-600">
                            {new Date(selectedOrder.user_package_expires_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 支付详情 */}
              {(selectedOrder.alipay_trade_no || selectedOrder.stripe_payment_intent_id) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">支付详情</h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.alipay_trade_no && (
                      <div>
                        <span className="text-gray-500">支付宝交易号：</span>
                        <span className="font-mono text-xs">{selectedOrder.alipay_trade_no}</span>
                      </div>
                    )}
                    {selectedOrder.stripe_payment_intent_id && (
                      <div>
                        <span className="text-gray-500">Stripe支付ID：</span>
                        <span className="font-mono text-xs">{selectedOrder.stripe_payment_intent_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 时间信息 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">时间信息</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">创建时间：</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  {selectedOrder.payment_time && (
                    <div>
                      <span className="text-gray-500">支付时间：</span>
                      <span className="text-green-600">{formatDate(selectedOrder.payment_time)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              {selectedOrder.status === 'PENDING' && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedOrder(null)
                      handleManualComplete(selectedOrder.order_number)
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    手动完成订单
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    此操作将更新订单状态、充值积分并发送邮件通知
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
