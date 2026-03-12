'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Particules générées UNE SEULE FOIS côté client (pas de Math.random au SSR)
function useClientParticles(count: number) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Généré seulement quand mounted (client)
  const particles = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      width:   Math.random() * 4 + 1,
      height:  Math.random() * 4 + 1,
      left:    `${Math.random() * 100}%`,
      top:     `${Math.random() * 100}%`,
      opacity: Math.random() * 0.4 + 0.1,
      duration: Math.random() * 3 + 2,
      delay:    Math.random() * 2,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, count])

  return { mounted, particles }
}

export default function LuxuryPreloader() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const { mounted, particles } = useClientParticles(20)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setVisible(false), 400)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 80)
    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Fond particules — uniquement rendu côté client */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-[#c9a84c]"
                  style={{
                    width:   p.width,
                    height:  p.height,
                    left:    p.left,
                    top:     p.top,
                    opacity: p.opacity,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.1, 0.5, 0.1],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Logo animé SVG */}
          <motion.div
            className="relative mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
              <motion.path
                d="M5 35 L5 5 L20 25 L35 5 L35 35"
                stroke="#c9a84c"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
              <motion.path
                d="M45 35 L45 5 L60 25 L75 5 L75 35"
                stroke="#c9a84c"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              />
              <motion.path
                d="M85 5 L85 35 L115 5 L115 35"
                stroke="#c9a84c"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              />
            </svg>
          </motion.div>

          {/* Nom de marque */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-[10px] tracking-[0.5em] text-[#c9a84c] uppercase">Saint-Louis · Paris</p>
          </motion.div>

          {/* Barre de progression */}
          <motion.div
            className="w-64 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="h-px bg-white/10 w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c]"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase">Chargement</span>
              <span className="text-[9px] tracking-[0.2em] text-[#c9a84c]">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
