"use client"

import { useEffect, useState } from "react"

interface HydrationProviderProps {
  children: React.ReactNode
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <div suppressHydrationWarning={true}>
      {isHydrated ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </div>
  )
}







