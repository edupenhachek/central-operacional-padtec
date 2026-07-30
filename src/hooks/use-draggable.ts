import { useState, useEffect, useCallback, useRef } from 'react'

export interface DragPosition {
  x: number
  y: number
}

const BTN_SIZE = 56
const MARGIN = 8

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function useDraggable(storageKey?: string) {
  const [position, setPosition] = useState<DragPosition>(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return {
              x: clamp(parsed.x, MARGIN, window.innerWidth - BTN_SIZE - MARGIN),
              y: clamp(parsed.y, MARGIN, window.innerHeight - BTN_SIZE - MARGIN),
            }
          }
        } catch {
          /* intentionally ignored */
        }
      }
    }
    if (typeof window !== 'undefined') {
      return {
        x: window.innerWidth - BTN_SIZE - 24,
        y: window.innerHeight - BTN_SIZE - 24,
      }
    }
    return { x: 0, y: 0 }
  })

  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
  const hasMoved = useRef(false)
  const positionRef = useRef(position)
  positionRef.current = position

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const point = 'touches' in e ? e.touches[0] : (e as React.MouseEvent)
    dragStart.current = {
      x: point.clientX,
      y: point.clientY,
      posX: positionRef.current.x,
      posY: positionRef.current.y,
    }
    hasMoved.current = false
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const updatePos = (clientX: number, clientY: number) => {
      const dx = clientX - dragStart.current.x
      const dy = clientY - dragStart.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true
      setPosition({
        x: clamp(dragStart.current.posX + dx, MARGIN, window.innerWidth - BTN_SIZE - MARGIN),
        y: clamp(dragStart.current.posY + dy, MARGIN, window.innerHeight - BTN_SIZE - MARGIN),
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      updatePos(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
      const t = e.touches[0]
      if (t) updatePos(t.clientX, t.clientY)
    }

    const handleUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging])

  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, JSON.stringify(position))
    }
  }, [position, storageKey])

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: clamp(prev.x, MARGIN, window.innerWidth - BTN_SIZE - MARGIN),
        y: clamp(prev.y, MARGIN, window.innerHeight - BTN_SIZE - MARGIN),
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { position, isDragging, hasMoved, onDragStart }
}
