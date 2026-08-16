import { useRef, useState } from 'react'

export function usePullRefresh(onRefresh) {
  const ref = useRef(null)
  const startY = useRef(0)
  const pulling = useRef(false)
  const offsetRef = useRef(0)
  const [offset, setOffset] = useState(0)
  const [busy, setBusy] = useState(false)

  function setPull(n) {
    offsetRef.current = n
    setOffset(n)
  }

  function onTouchStart(e) {
    const el = ref.current
    if (!el || busy || el.scrollTop > 2) return
    startY.current = e.touches[0].clientY
    pulling.current = true
  }

  function onTouchMove(e) {
    const el = ref.current
    if (!el || !pulling.current || busy) return
    const dy = e.touches[0].clientY - startY.current
    if (el.scrollTop <= 2 && dy > 8) {
      setPull(Math.min(88, dy * 0.45))
    } else if (dy <= 0) {
      setPull(0)
    }
  }

  async function onTouchEnd() {
    if (!pulling.current) return
    pulling.current = false
    const should = offsetRef.current > 52 && onRefresh
    if (!should) {
      setPull(0)
      return
    }
    setBusy(true)
    setPull(56)
    try {
      await onRefresh()
    } finally {
      setBusy(false)
      setPull(0)
    }
  }

  return {
    ref,
    offset,
    busy,
    handlers: { onTouchStart, onTouchMove, onTouchEnd }
  }
}
