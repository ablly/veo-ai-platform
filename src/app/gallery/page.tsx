"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Download, Clock, Sparkles, Search, Film } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AnimatedBackground } from "@/components/ui/animated-background"

interface VideoWork {
  id: string
  title: string | null
  prompt: string
  video_url: string
  thumbnail_url: string | null
  duration: number
  created_at: string
  author_name: string | null
}

export default function GalleryPage() {
  const [videos, setVideos] = useState<VideoWork[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoWork[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<VideoWork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    filterVideos()
  }, [searchQuery, videos])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/gallery/videos?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setVideos(data.videos || [])
        setFilteredVideos(data.videos || [])
      }
    } catch (error) {
      console.error('获取视频失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVideos = () => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos)
      return
    }

    const filtered = videos.filter(video =>
      (video.prompt?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredVideos(filtered)
  }

  const handleDownload = (videoUrl: string, videoId: string) => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `veo-ai-video-${videoId}.mp4`
    a.click()
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-yellow-400/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              社区创作
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            视频广场
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            探索创作者分享的精彩视频作品
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type="text"
              placeholder="搜索视频..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 rounded-lg text-lg"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Film className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg">
              {searchQuery ? '没有找到相关视频' : '还没有分享的视频'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => window.location.href = '/'}
                className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                开始创作
              </Button>
            )}
          </motion.div>
        )}

        {/* Video Grid */}
        {!loading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="group bg-white/10 backdrop-blur-md border-white/20 overflow-hidden hover:bg-white/15 transition-all hover:scale-105 cursor-pointer">
                  <div className="relative aspect-video bg-black/40 overflow-hidden">
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      muted
                      loop
                      preload="metadata"
                      onMouseEnter={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.currentTime = 0;
                        video.play();
                      }}
                      onMouseLeave={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.pause();
                        video.currentTime = 0;
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                        <Play className="w-8 h-8 text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">Veo 3生成</span>
                      <span className="text-white/50 text-xs">{formatDate(video.created_at)}</span>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(video.video_url, video.id)
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-4xl w-full overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-black">
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-bold text-2xl">Veo 3生成</span>
                  <span className="text-white/50 text-sm">{formatDate(selectedVideo.created_at)}</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownload(selectedVideo.video_url, selectedVideo.id)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载视频
                  </Button>
                  <Button
                    onClick={() => setSelectedVideo(null)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
