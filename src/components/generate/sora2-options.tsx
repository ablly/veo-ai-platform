"use client"

import { motion } from "framer-motion"
import { Clock, Maximize2, Sparkles, Image as ImageIcon } from "lucide-react"

interface Sora2OptionsProps {
  duration: number
  aspectRatio: string
  size: string
  remixTargetId?: string
  onDurationChange: (duration: number) => void
  onAspectRatioChange: (ratio: string) => void
  onSizeChange: (size: string) => void
  onRemixTargetIdChange: (id: string) => void
}

export function Sora2Options({
  duration,
  aspectRatio,
  size,
  remixTargetId,
  onDurationChange,
  onAspectRatioChange,
  onSizeChange,
  onRemixTargetIdChange
}: Sora2OptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">SORA 2.0 高级选项</h3>
      </div>

      {/* 视频时长 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4" />
          视频时长
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[10, 15].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDurationChange(d)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all font-medium
                ${duration === d
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                }
              `}
            >
              {d} 秒
            </button>
          ))}
        </div>
      </div>

      {/* 视频比例 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Maximize2 className="w-4 h-4" />
          视频比例
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: '16:9', label: '横屏 16:9', icon: '🖥️' },
            { value: '9:16', label: '竖屏 9:16', icon: '📱' }
          ].map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => onAspectRatioChange(ratio.value)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all font-medium
                ${aspectRatio === ratio.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                }
              `}
            >
              <span className="mr-2">{ratio.icon}</span>
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* 续作功能说明 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">✨ 续作功能使用方法</h4>
            <ol className="text-xs text-purple-700 space-y-1 list-decimal list-inside">
              <li>在"我的视频"页面找到想要续作的SORA2视频</li>
              <li>点击视频卡片上的"续作此视频"按钮</li>
              <li>系统会自动填充续作PID，您可以修改提示词继续创作</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 续作PID（可选） */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Sparkles className="w-4 h-4" />
          续作PID（可选）
        </label>
        <input
          type="text"
          value={remixTargetId || ''}
          onChange={(e) => onRemixTargetIdChange(e.target.value)}
          placeholder="输入续作视频的PID，例如: s_****"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          readOnly={!!remixTargetId}
        />
        {remixTargetId ? (
          <p className="text-xs text-green-600 flex items-center gap-1">
            ✅ 已自动填充续作PID，将基于原视频继续创作
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            💡 如果要基于之前的视频继续创作，请输入该视频的PID
          </p>
        )}
      </div>

      {/* 提示信息 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
        <p className="text-xs text-purple-700">
          <strong>📌 注意：</strong>
          <br />
          • 参考图片请避免出现真人形象
          <br />
          • 时长越长消耗积分越多
        </p>
      </div>
    </motion.div>
  )
}
