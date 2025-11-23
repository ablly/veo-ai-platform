"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, AlertCircle, CreditCard, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface CreditLowModalProps {
  credits: number
  isOpen: boolean
  onClose: () => void
}

export function CreditLowModal({ credits, isOpen, onClose }: CreditLowModalProps) {
  const router = useRouter()
  const [recommendedPackages, setRecommendedPackages] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      // 获取推荐套餐
      fetch('/api/credits/packages')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // 只显示前3个活跃套餐
            const packages = data.packages
              .filter((pkg: any) => pkg.isActive && pkg.price > 0)
              .slice(0, 3)
            setRecommendedPackages(packages)
          }
        })
        .catch(err => console.error('获取套餐失败:', err))
    }
  }, [isOpen])

  const handleRecharge = () => {
    router.push('/pricing')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-white via-orange-50 to-yellow-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-400/30">
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* 头部 */}
              <div className="p-8 text-center">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertCircle className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  积分即将用完
                </h2>
                
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/30 rounded-full mb-4">
                  <Zap className="w-5 h-5 text-red-600" />
                  <span className="text-xl font-bold text-red-700">
                    剩余积分：{credits}
                  </span>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  您的创作积分即将用完，充值后可继续创作精彩视频
                </p>
              </div>

              {/* 首单特惠提示 */}
              <div className="px-8 pb-6">
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-2 border-green-400/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      🎁 首单特惠
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg font-medium">
                    首次充值额外赠送 <span className="text-green-600 font-bold text-xl">50%</span> 积分！
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    例如：购买50积分，实得75积分
                  </p>
                </div>
              </div>

              {/* 推荐套餐 */}
              {recommendedPackages.length > 0 && (
                <div className="px-8 pb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    推荐套餐
                  </h3>
                  <div className="grid gap-4">
                    {recommendedPackages.map((pkg, index) => (
                      <motion.div
                        key={pkg.id}
                        className={`p-4 rounded-xl border-2 ${
                          pkg.isPopular
                            ? 'bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-yellow-400/50'
                            : 'bg-white/50 border-gray-200'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                              {pkg.isPopular && (
                                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                                  最受欢迎
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ¥{pkg.price}
                              </span>
                              {pkg.originalPrice > pkg.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  ¥{pkg.originalPrice}
                                </span>
                              )}
                              <span className="text-sm text-green-600 font-medium">
                                + 赠送{Math.floor(pkg.credits * 0.5)}积分
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600">
                              {pkg.credits}
                            </div>
                            <div className="text-sm text-gray-500">积分</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 底部按钮 */}
              <div className="px-8 pb-8 flex gap-4">
                <Button
                  onClick={handleRecharge}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 text-lg rounded-xl shadow-lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  立即充值
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-8 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-4 rounded-xl"
                >
                  稍后再说
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
