"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useSpring, useTransform, useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  className?: string
  suffix?: string
}

export function AnimatedCounter({ 
  value, 
  className = "", 
  suffix = ""
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mounted, setMounted] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)
  
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isInView) {
      spring.set(value)
    }
  }, [mounted, isInView, value, spring])

  useEffect(() => {
    if (mounted) {
      const unsubscribe = spring.onChange((latest) => {
        setDisplayValue(Math.floor(latest))
      })
      return unsubscribe
    }
  }, [spring, mounted])

  // 避免hydration错误，初始渲染时显示静态值
  if (!mounted) {
    return (
      <span className={`inline-block ${className}`}>
        <span className="tabular-nums">0</span>
        {suffix && <span>{suffix}</span>}
      </span>
    )
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <span className="tabular-nums">{displayValue.toLocaleString()}</span>
      {suffix && <span>{suffix}</span>}
    </motion.span>
  )
}
