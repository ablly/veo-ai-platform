"use client"

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface ScrollAnimationOptions {
  threshold?: number
  once?: boolean
  amount?: "some" | "all" | number
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, once = true, amount = "some" } = options
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { 
    once,
    amount,
  })

  return { ref, isInView }
}

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progress = (scrolled / documentHeight) * 100

      setScrollProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return scrollProgress
}














