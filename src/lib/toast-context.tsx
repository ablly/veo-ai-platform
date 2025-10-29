"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const newToast: Toast = {
      id,
      duration: 5000, // 默认5秒
      ...toast,
    }

    setToasts((prev) => [...prev, newToast])

    // 自动移除
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [removeToast])

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: "success", title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: "error", title, description, duration: 7000 }) // 错误消息显示更久
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: "warning", title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: "info", title, description })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

// Toast容器组件
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.length > 0 && toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast单项组件
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = {
    success: {
      icon: CheckCircle,
      className: "bg-green-50 border-green-200 text-green-900",
      iconClassName: "text-green-600",
    },
    error: {
      icon: XCircle,
      className: "bg-red-50 border-red-200 text-red-900",
      iconClassName: "text-red-600",
    },
    warning: {
      icon: AlertCircle,
      className: "bg-yellow-50 border-yellow-200 text-yellow-900",
      iconClassName: "text-yellow-600",
    },
    info: {
      icon: Info,
      className: "bg-blue-50 border-blue-200 text-blue-900",
      iconClassName: "text-blue-600",
    },
  }

  const { icon: Icon, className, iconClassName } = config[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`${className} border rounded-lg shadow-lg p-4 pointer-events-auto backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconClassName} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-0.5">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90 leading-relaxed">{toast.description}</p>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 进度条 */}
      {toast.duration && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 rounded-b-lg"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        />
      )}
    </motion.div>
  )
}




