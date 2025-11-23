"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface CreditInfo {
  availableCredits: number
  totalCredits: number
  loading: boolean
}

export function useCreditMonitor() {
  const { data: session } = useSession()
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({
    availableCredits: 0,
    totalCredits: 0,
    loading: true
  })
  const [showLowCreditModal, setShowLowCreditModal] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(false)

  // 获取用户积分
  const fetchCredits = async () => {
    if (!session?.user?.id) {
      setCreditInfo({ availableCredits: 0, totalCredits: 0, loading: false })
      return
    }

    try {
      const response = await fetch('/api/user/credits')
      const data = await response.json()

      if (data.success) {
        const credits = data.credits?.availableCredits || 0
        setCreditInfo({
          availableCredits: credits,
          totalCredits: data.credits?.totalCredits || 0,
          loading: false
        })

        // 检查是否需要显示低积分提醒
        // 积分 < 10 且本次会话还未显示过
        if (credits < 10 && credits > 0 && !hasShownModal) {
          setShowLowCreditModal(true)
          setHasShownModal(true)
        }
      }
    } catch (error) {
      console.error('获取积分失败:', error)
      setCreditInfo({ availableCredits: 0, totalCredits: 0, loading: false })
    }
  }

  // 初始加载和定期刷新
  useEffect(() => {
    if (session?.user?.id) {
      fetchCredits()
      
      // 每30秒刷新一次积分
      const interval = setInterval(fetchCredits, 30000)
      
      return () => clearInterval(interval)
    }
  }, [session?.user?.id])

  // 手动刷新积分
  const refreshCredits = () => {
    fetchCredits()
  }

  // 手动触发低积分提醒
  const triggerLowCreditModal = () => {
    if (creditInfo.availableCredits < 10) {
      setShowLowCreditModal(true)
    }
  }

  return {
    credits: creditInfo.availableCredits,
    totalCredits: creditInfo.totalCredits,
    loading: creditInfo.loading,
    showLowCreditModal,
    setShowLowCreditModal,
    refreshCredits,
    triggerLowCreditModal,
    isLowCredit: creditInfo.availableCredits < 10 && creditInfo.availableCredits > 0
  }
}
