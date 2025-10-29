"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "./image-upload"
import { motion } from "framer-motion"
import { Zap, Type, Image as ImageIcon, Coins } from "lucide-react"

interface VideoInputProps {
  prompt: string
  images: File[]
  isGenerating: boolean
  onPromptChange: (prompt: string) => void
  onImagesChange: (images: File[]) => void
  onGenerate: () => void
}

export function VideoInput({
  prompt,
  images,
  isGenerating,
  onPromptChange,
  onImagesChange,
  onGenerate
}: VideoInputProps) {
  const maxLength = 500
  const remainingChars = maxLength - prompt.length
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(true)

  // 计算所需积分（新规则：15积分=1视频）
  const baseCredits = 15
  const imageCredits = images.length * 5
  const totalCredits = baseCredits + imageCredits

  // 获取用户积分余额
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/user/credits/balance")
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits.available)
        } else if (response.status === 401) {
          // 用户未登录，这种情况在父组件已经处理了
          console.log("用户未登录")
        } else {
          console.error("获取积分失败:", response.status)
        }
      } catch (error) {
        console.error("获取积分失败:", error)
      } finally {
        setLoadingCredits(false)
      }
    }

    fetchCredits()
  }, [])

  const canGenerate = userCredits !== null && userCredits >= totalCredits && prompt.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Text Input Section */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200/50 p-6"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Type className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">✍️ 描述你想要的视频</h3>
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="例如：一只坐在彩虹上的可爱小猫，卡通风格，色彩鲜艳，温馨治愈的氛围..."
            className="w-full h-32 p-4 border-2 border-yellow-200 rounded-xl resize-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white/50 text-gray-900 placeholder-gray-500"
            maxLength={maxLength}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            <span className={remainingChars < 50 ? "text-orange-500 font-medium" : ""}>
              {remainingChars}
            </span>
            /{maxLength}
          </div>
        </div>
        
        {prompt.length > 0 && (
          <motion.div
            className="mt-3 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            💡 提示：详细的描述能帮助AI更好地理解你的需求
          </motion.div>
        )}
      </motion.div>

      {/* Image Upload Section */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200/50 p-6"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">🖼️ 参考图像 ({images.length}/6)</h3>
        </div>
        
        <ImageUpload
          images={images}
          onImagesChange={onImagesChange}
          maxImages={6}
          maxSizePerImage={5 * 1024 * 1024} // 5MB
        />
        
        <div className="mt-3 text-sm text-gray-600">
          💡 上传参考图像，帮助 AI 更好地理解你的需求（可选）
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full h-14 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-white font-bold text-lg rounded-xl shadow-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI正在创作中...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>开始生成视频</span>
            </div>
          )}
        </Button>
      </motion.div>

      {/* Credit Info */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="space-y-3">
          {/* 当前积分余额 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Coins className="w-4 h-4" />
              <span>当前积分余额:</span>
            </div>
            <div className="text-sm font-bold">
              {loadingCredits ? (
                <div className="w-4 h-4 border border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              ) : userCredits !== null ? (
                <span className={userCredits >= totalCredits ? "text-green-600" : "text-red-600"}>
                  {userCredits} 积分
                </span>
              ) : (
                <span className="text-gray-500">获取失败</span>
              )}
            </div>
          </div>

          {/* 积分不足提示 */}
          {userCredits !== null && userCredits < totalCredits && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span>
                积分不足，还需要 <span className="font-bold">{totalCredits - userCredits} 积分</span>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
