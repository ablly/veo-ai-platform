"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Download, Trash2, Filter, Play, Pause, CheckCircle, XCircle, Clock } from "lucide-react"

interface Video {
  id: string
  user_email: string
  user_name: string
  prompt: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  video_url?: string
  thumbnail_url?: string
  credits_consumed: number
  api_provider: string
  model: string
  created_at: string
  completed_at?: string
  error_message?: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)

  useEffect(() => {
    fetchVideos()
  }, [currentPage, searchTerm, statusFilter])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        status: statusFilter
      })
      
      const response = await fetch(`/api/admin/videos/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
        setTotalPages(data.totalPages || 1)
        setTotalVideos(data.totalVideos || 0)
        setTotalCredits(data.totalCredits || 0)
      }
    } catch (error) {
      console.error("获取视频列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        label: "等待中", 
        className: "bg-gray-100 text-gray-800",
        icon: Clock
      },
      PROCESSING: { 
        label: "生成中", 
        className: "bg-blue-100 text-blue-800",
        icon: Play
      },
      COMPLETED: { 
        label: "已完成", 
        className: "bg-green-100 text-green-800",
        icon: CheckCircle
      },
      FAILED: { 
        label: "生成失败", 
        className: "bg-red-100 text-red-800",
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

  const deleteVideo = async (videoId: string) => {
    if (!confirm("确定要删除这个视频吗？此操作不可恢复。")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchVideos() // 重新加载列表
      }
    } catch (error) {
      console.error("删除视频失败:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">视频管理</h2>
          <p className="text-gray-600 mt-1">管理用户生成的AI视频</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总视频数</p>
              <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">消耗积分</p>
              <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">💎</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">成功生成</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">处理中</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.status === 'PROCESSING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-blue-600" />
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
              placeholder="搜索用户邮箱或提示词..."
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
              <option value="PENDING">等待中</option>
              <option value="PROCESSING">生成中</option>
              <option value="COMPLETED">已完成</option>
              <option value="FAILED">生成失败</option>
            </select>
          </div>
        </div>
      </div>

      {/* 视频列表 */}
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">视频信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">提示词</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">API信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt="视频缩略图"
                                className="w-16 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Play className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-mono text-sm text-gray-900">
                                {video.id.slice(0, 8)}...
                              </div>
                              <div className="text-xs text-gray-500">
                                {video.credits_consumed} 积分
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{video.user_name || "未设置"}</div>
                            <div className="text-sm text-gray-500">{video.user_email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 truncate" title={video.prompt}>
                              {video.prompt}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{video.api_provider}</div>
                            <div className="text-xs text-gray-500">{video.model}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(video.status)}
                          {video.error_message && (
                            <div className="text-xs text-red-600 mt-1" title={video.error_message}>
                              错误: {video.error_message.slice(0, 30)}...
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <div>{formatDate(video.created_at)}</div>
                          {video.completed_at && (
                            <div className="text-xs text-green-600">
                              完成: {formatDate(video.completed_at)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            {video.video_url && (
                              <a 
                                href={video.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            <button 
                              onClick={() => deleteVideo(video.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        暂无视频数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  第 {currentPage} 页，共 {totalPages} 页
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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
  )
}


















