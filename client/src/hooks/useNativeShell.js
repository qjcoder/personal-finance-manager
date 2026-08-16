import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

export function useNativeShell() {
  const [phone, setPhone] = useState(() => {
    if (typeof window === 'undefined') return false
    return Capacitor.isNativePlatform() || window.innerWidth < 768
  })

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setPhone(true)
      return undefined
    }
    function onResize() {
      setPhone(window.innerWidth < 768)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return phone
}
