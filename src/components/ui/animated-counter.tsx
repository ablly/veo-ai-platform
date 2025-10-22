"use client"

import { useEffect, useRef } from "react"
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
  
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  })
  
  const display = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString()
  )

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.span className="tabular-nums">{display}</motion.span>
      {suffix && <span>{suffix}</span>}
    </motion.span>
  )
}
