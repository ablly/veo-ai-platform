"use client"

import { useState, useEffect } from 'react'

interface MousePosition {
  x: number
  y: number
  normalizedX: number // -1 to 1
  normalizedY: number // -1 to 1
}

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY, currentTarget } = event
      const { innerWidth, innerHeight } = window

      setMousePosition({
        x: clientX,
        y: clientY,
        normalizedX: (clientX / innerWidth) * 2 - 1, // -1 to 1
        normalizedY: (clientY / innerHeight) * 2 - 1, // -1 to 1
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return mousePosition
}













