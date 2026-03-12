'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Vérifie si l'appareil a une vraie souris (pas un écran tactile)
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!hasMouse) return
    setIsDesktop(true)

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let dotX = 0, dotY = 0
    let ringX = 0, ringY = 0
    let animId: number

    const onMouseMove = (e: MouseEvent) => {
      dotX = e.clientX
      dotY = e.clientY
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isClickable = target.closest('a, button, [role="button"], input, label, select, textarea')
      if (isClickable) {
        dot.classList.add('cursor-hover')
        ring.classList.add('cursor-hover')
      } else {
        dot.classList.remove('cursor-hover')
        ring.classList.remove('cursor-hover')
      }
    }

    const animate = () => {
      dot.style.left = `${dotX}px`
      dot.style.top  = `${dotY}px`

      // Ring suit avec du lag pour effet fluide
      ringX += (dotX - ringX) * 0.12
      ringY += (dotY - ringY) * 0.12
      ring.style.left = `${ringX}px`
      ring.style.top  = `${ringY}px`
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(animId)
    }
  }, [])

  if (!isDesktop) return null

  return (
    <>
      <div ref={dotRef} className="custom-cursor cursor-dot" />
      <div ref={ringRef} className="custom-cursor cursor-ring" />
    </>
  )
}
