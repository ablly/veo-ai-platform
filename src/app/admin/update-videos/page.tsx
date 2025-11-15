"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, CheckCircle, XCircle, Clock, Video } from "lucide-react"

interface VideoUpdate {
  id: string
  prompt: string
  taskId: string
  status: string
  videoUrl?: string
  error?: string
}

export default function AdminUpdateVideosPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    updated: number
    failed: number
    processing: number
    videos: VideoUpdate[]
  } | null>(null)

  const handleUpdate = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/cron/update-videos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-secret-key'}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setResults({
          updated: data.updated || 0,
          failed: data.failed || 0,
          processing: data.processing || 0,
          videos: data.videos || []
        })
      } else {
        alert(`更新失败: ${data.error}`)
      }
    } catch (error) {
      alert(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Video className="w-6 h-6" />
              视频状态更新工具
            </CardTitle>
            <p className="text-gray-600 mt-2">
              手动触发视频状态更新，从速创API获取最新的视频URL
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 更新按钮 */}
            <div className="flex justify-center">
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-xl"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    正在更新...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    立即更新视频状态
                  </>
                )}
              </Button>
            </div>

            {/* 更新结果 */}
            {results && (
              <div className="space-y-4">
                {/* 统计卡片 */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">已完成</p>
                          <p className="text-3xl font-bold text-green-700">
                            {results.updated}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-600">失败</p>
                          <p className="text-3xl font-bold text-red-700">
                            {results.failed}
                          </p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600">处理中</p>
                          <p className="text-3xl font-bold text-yellow-700">
                            {results.processing}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 视频列表 */}
                {results.videos && results.videos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">更新详情</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.videos.map((video, index) => (
                          <div
                            key={video.id}
                            className="p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {index + 1}. {video.prompt}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  任务ID: {video.taskId}
                                </p>
                                {video.videoUrl && (
                                  <p className="text-sm text-green-600 mt-1 break-all">
                                    ✅ 视频URL: {video.videoUrl}
                                  </p>
                                )}
                                {video.error && (
                                  <p className="text-sm text-red-600 mt-1">
                                    ❌ 错误: {video.error}
                                  </p>
                                )}
                              </div>
                              <div>
                                {video.status === 'COMPLETED' && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    已完成
                                  </span>
                                )}
                                {video.status === 'FAILED' && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                    失败
                                  </span>
                                )}
                                {video.status === 'PROCESSING' && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                                    处理中
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* 使用说明 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-2">使用说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 此工具会检查所有 PROCESSING 状态的视频</li>
                  <li>• 从速创API获取最新状态和视频URL</li>
                  <li>• 自动更新数据库中的视频信息</li>
                  <li>• 建议在视频生成后等待3-5分钟再手动更新</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
