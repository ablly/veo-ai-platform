"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Download, Trash2, Filter, Play, CheckCircle, XCircle, Clock, X, Copy, Check, Image as ImageIcon, Pause } from "lucide-react"

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
  external_task_id?: string
  reference_images?: any
  duration?: number
  resolution?: string
  created_at: string
  completed_at?: string
  error_message?: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const getModelBadge = (model: string) => {
    const modelConfig = {
      sora2: {
        label: "SORA 2.0",
        className: "bg-purple-100 text-purple-800 border border-purple-200"
      },
      veo3: {
        label: "VEO 3.1",
        className: "bg-indigo-100 text-indigo-800 border border-indigo-200"
      }
    }
    
    const config = modelConfig[model as keyof typeof modelConfig] || {
      label: model?.toUpperCase() || "未知",
      className: "bg-gray-100 text-gray-800 border border-gray-200"
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
        fetchVideos()
      }
    } catch (error) {
      console.error("删除视频失败:", error)
    }
  }

  // 过滤视频（前端筛选模型）
  const filteredVideos = modelFilter === "all" 
    ? videos 
    : videos.filter(v => v.model === modelFilter)

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">视频管理 v2.0</h2>
          <p className="text-gray-600 mt-1">管理用户生成的AI视频 - 支持查看请求ID和视频详情</p>
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

            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部模型</option>
              <option value="sora2">SORA 2.0</option>
              <option value="veo3">VEO 3.1</option>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">模型</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">请求ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {video.thumbnail_url || video.video_url ? (
                              <img 
                                src={video.thumbnail_url || video.video_url} 
                                alt="视频缩略图"
                                className="w-16 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Play className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-mono text-xs text-gray-500">
                                {video.id.slice(0, 8)}...
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                {video.credits_consumed} 积分
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{video.user_name || "未设置"}</div>
                            <div className="text-xs text-gray-500">{video.user_email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 truncate" title={video.prompt}>
                              {video.prompt}
                            </p>
                            {video.reference_images && Array.isArray(video.reference_images) && video.reference_images.length > 0 && (
                              <div className="flex items-center mt-1 text-xs text-blue-600">
                                <ImageIcon className="w-3 h-3 mr-1" />
                                {video.reference_images.length} 张参考图
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getModelBadge(video.model)}
                        </td>
                        <td className="py-4 px-4">
                          {video.external_task_id ? (
                            <div className="flex items-center space-x-1">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                {video.external_task_id.slice(0, 8)}...
                              </code>
                              <button
                                onClick={() => copyToClipboard(video.external_task_id!, video.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="复制完整ID"
                              >
                                {copiedId === video.id ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-400" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(video.status)}
                          {video.error_message && (
                            <div className="text-xs text-red-600 mt-1" title={video.error_message}>
                              错误: {video.error_message.slice(0, 20)}...
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <div className="text-xs">{formatDate(video.created_at)}</div>
                          {video.completed_at && (
                            <div className="text-xs text-green-600">
                              完成: {formatDate(video.completed_at)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => setSelectedVideo(video)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {video.video_url && (
                              <a 
                                href={video.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                title="下载视频"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            <button 
                              onClick={() => deleteVideo(video.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="删除视频"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
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

      {/* 视频详情弹窗 */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">视频详情</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 视频播放器 */}
              {selectedVideo.video_url && (
                <div className="bg-black rounded-lg overflow-hidden">
                  <video 
                    src={selectedVideo.video_url} 
                    controls 
                    className="w-full"
                    poster={selectedVideo.thumbnail_url}
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              )}

              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">内部视频ID</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-3 py-2 rounded font-mono flex-1">
                      {selectedVideo.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedVideo.id, 'internal-id')}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {copiedId === 'internal-id' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">外部任务ID（请求ID）</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-3 py-2 rounded font-mono flex-1">
                      {selectedVideo.external_task_id || '-'}
                    </code>
                    {selectedVideo.external_task_id && (
                      <button
                        onClick={() => copyToClipboard(selectedVideo.external_task_id!, 'external-id')}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        {copiedId === 'external-id' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">用户</label>
                  <div className="mt-1">
                    <div className="text-sm font-medium text-gray-900">{selectedVideo.user_name || "未设置"}</div>
                    <div className="text-sm text-gray-500">{selectedVideo.user_email}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">模型</label>
                  <div className="mt-1">
                    {getModelBadge(selectedVideo.model)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">状态</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedVideo.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">积分消耗</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedVideo.credits_consumed} 积分
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">创建时间</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedVideo.created_at)}
                  </div>
                </div>

                {selectedVideo.completed_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">完成时间</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedVideo.completed_at)}
                    </div>
                  </div>
                )}
              </div>

              {/* 提示词 */}
              <div>
                <label className="text-sm font-medium text-gray-700">提示词</label>
                <div className="mt-1 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedVideo.prompt}</p>
                </div>
              </div>

              {/* 参考图片 */}
              {selectedVideo.reference_images && Array.isArray(selectedVideo.reference_images) && selectedVideo.reference_images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">参考图片</label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    {selectedVideo.reference_images.map((img: string, idx: number) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`参考图 ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 视频URL */}
              {selectedVideo.video_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">视频URL</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedVideo.video_url}
                      readOnly
                      className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedVideo.video_url!, 'video-url')}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {copiedId === 'video-url' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <a
                      href={selectedVideo.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      打开视频
                    </a>
                  </div>
                </div>
              )}

              {/* 错误信息 */}
              {selectedVideo.error_message && (
                <div>
                  <label className="text-sm font-medium text-red-700">错误信息</label>
                  <div className="mt-1 bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-900">{selectedVideo.error_message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
              {selectedVideo.video_url && (
                <a
                  href={selectedVideo.video_url}
                  download
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>下载视频</span>
                </a>
              )}
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
