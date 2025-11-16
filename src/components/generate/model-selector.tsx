"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { API_CONFIG } from "@/config/api"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = [
    API_CONFIG.MODEL_CONFIGS.sora2,  // SORA2放在最前面
    API_CONFIG.MODEL_CONFIGS.veo3
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        选择AI模型
      </label>
      
      <div className="grid gap-3">
        {models.map((model) => {
          const isSelected = selectedModel === model.id
          
          return (
            <motion.button
              key={model.id}
              type="button"
              onClick={() => onModelChange(model.id)}
              className={`
                relative w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-gray-200 bg-white hover:border-yellow-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{model.icon}</span>
                    <h3 className="font-bold text-lg text-gray-900">
                      {model.name}
                    </h3>
                    {model.badge && (
                      <span className={`px-2 py-0.5 text-white text-xs rounded-full ${
                        model.badge === '推荐' 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}>
                        {model.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {model.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      ⏱️ 时长: {model.durations.join(', ')} 秒
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      📐 比例: {model.aspectRatios.join(', ')}
                    </span>
                  </div>
                  
                  {model.id === 'sora2' && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      ✨ 支持续作功能、参考图片、自定义时长和清晰度
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        💡 提示：不同模型的生成时间和效果可能有所不同
      </p>
      
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs text-red-700 font-medium">
          ⚠️ 重要提示：请勿输入违规内容（暴力、色情、政治敏感、侵权等），违规提示词消耗的积分不予退还。
        </p>
      </div>
    </div>
  )
}
