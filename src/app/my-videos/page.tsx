"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/lib/toast-context"
import {
  Video, Search, Filter, Download, Trash2, Share2,
  Clock, CheckCircle, XCircle, Loader2, Play, Calendar,
  ChevronLeft, ChevronRight
} from "lucide-react"

interface VideoGeneration {
  id: string
  prompt: string
  videoUrl?: string
  thumbnailUrl?: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  duration?: number
  resolution?: string
  creditsConsumed: number
  createdAt: string
  completedAt?: string
}

export default function MyVideosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success, error: showError } = useToast()

  const [videos, setVideos] = useState<VideoGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const videosPerPage = 12

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchVideos()
      
      // 如果有PROCESSING状态的视频，每10秒自动刷新一次
      const hasProcessing = videos.some(v => v.status === "PROCESSING")
      if (hasProcessing) {
        console.log('🔄 检测到处理中的视频，启动自动刷新')
        const refreshInterval = setInterval(() => {
          console.log('🔄 自动刷新视频列表...')
          fetchVideos()
        }, 10000) // 每10秒刷新一次
        
        return () => clearInterval(refreshInterval)
      }
    }
  }, [status, router, currentPage, statusFilter, videos.length])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: videosPerPage.toString(),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      })

      const response = await fetch(`/api/videos/my-videos?${params}`)
      const data = await response.json()

      if (data.success) {
        setVideos(data.data.videos)
        setTotalPages(Math.ceil(data.data.total / videosPerPage))
      } else {
        showError("加载失败", data.error)
      }
    } catch (err) {
      showError("加载失败", "无法加载视频列表")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm("确定要删除这个视频吗？")) return

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        success("删除成功", "视频已删除")
        fetchVideos()
      } else {
        showError("删除失败", data.error)
      }
    } catch (err) {
      showError("删除失败", "无法删除视频")
    }
  }

  const handleDownload = async (video: VideoGeneration) => {
    if (!video.videoUrl) {
      showError("下载失败", "视频URL不存在")
      return
    }

    try {
      // 使用fetch下载视频，避免CORS问题
      const response = await fetch(video.videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `veo-video-${video.id}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      success("下载成功", "视频已保存到本地")
    } catch (err) {
      // 如果fetch失败，尝试直接下载
      try {
        const link = document.createElement("a")
        link.href = video.videoUrl
        link.download = `veo-video-${video.id}.mp4`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        success("开始下载", "视频正在下载中")
      } catch (err2) {
        showError("下载失败", "无法下载视频，请尝试右键另存为")
      }
    }
  }



  const filteredVideos = videos.filter((video) =>
    video.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "PROCESSING":
      case "PENDING":
        return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "已完成"
      case "PROCESSING":
        return "生成中"
      case "PENDING":
        return "等待中"
      case "FAILED":
        return "失败"
      default:
        return "未知"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Video className="w-10 h-10" />
            我的视频
          </h1>
          <p className="text-white/70">管理和查看您生成的所有视频</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索视频描述..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["ALL", "COMPLETED", "PROCESSING", "FAILED"].map((status) => (
              <Button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setCurrentPage(1)
                }}
                className={
                  statusFilter === status
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                    : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black opacity-60 hover:opacity-80"
                }
                size="sm"
              >
                {status === "ALL" ? "全部" : getStatusText(status)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Video className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "未找到匹配的视频" : "还没有生成视频"}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? "尝试使用其他关键词搜索" : "开始您的第一个视频创作吧"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => router.push("/generate")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
              >
                开始创作
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all overflow-hidden group">
                      <CardContent className="p-0">
                        {/* Video Preview */}
                        <div className="relative aspect-video bg-black/30 overflow-hidden">
                          {video.status === "COMPLETED" && video.videoUrl ? (
                            <>
                              <video
                                src={video.videoUrl}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                poster={video.thumbnailUrl}
                                muted
                                loop
                                preload="metadata"
                                crossOrigin="anonymous"
                                playsInline
                                onError={(e) => {
                                  console.error('视频加载失败:', video.videoUrl, e);
                                }}
                                onLoadedData={() => {
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
                              <div 
                                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                  // 打开视频播放弹窗
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4';
                                  modal.onclick = () => modal.remove();
                                  
                                  const videoContainer = document.createElement('div');
                                  videoContainer.className = 'max-w-4xl w-full';
                                  videoContainer.onclick = (e) => e.stopPropagation();
                                  
                                  const videoEl = document.createElement('video');
                                  videoEl.src = video.videoUrl!;
                                  videoEl.controls = true;
                                  videoEl.autoplay = true;
                                  videoEl.className = 'w-full rounded-lg';
                                  videoEl.crossOrigin = 'anonymous';
                                  videoEl.playsInline = true;
                                  
                                  videoContainer.appendChild(videoEl);
                                  modal.appendChild(videoContainer);
                                  document.body.appendChild(modal);
                                }}
                              >
                                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                                  <Play className="w-8 h-8 text-black ml-1" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getStatusIcon(video.status)}
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                video.status === "COMPLETED"
                                  ? "bg-green-500/80 text-white"
                                  : video.status === "FAILED"
                                  ? "bg-red-500/80 text-white"
                                  : "bg-yellow-500/80 text-black"
                              }`}
                            >
                              {getStatusText(video.status)}
                            </span>
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-4 space-y-3">
                          <p className="text-white text-sm line-clamp-2">
                            {video.prompt}
                          </p>

                          <div className="flex items-center justify-between text-xs text-white/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(video.createdAt).toLocaleDateString("zh-CN")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{video.creditsConsumed} 积分</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {video.status === "COMPLETED" && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleDownload(video)}
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-medium"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                下载视频
                              </Button>
                              <Button
                                onClick={() => handleDelete(video.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-3"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-white mx-4">
                  第 {currentPage} / {totalPages} 页
                </span>

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

