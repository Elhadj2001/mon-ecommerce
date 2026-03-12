'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { value: 2500, suffix: '+', label: 'Clients satisfaits', sub: 'à travers le monde' },
  { value: 98, suffix: '%', label: 'Satisfaction client', sub: 'notée 5 étoiles' },
  { value: 150, suffix: '+', label: 'Références exclusives', sub: 'nouvelles chaque saison' },
  { value: 45, suffix: '+', label: 'Pays livrés', sub: 'livraison express' },
]

function CountUp({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!inView || hasStarted.current) return
    hasStarted.current = true
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [inView, target])

  return (
    <span className="tabular-nums">
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="relative py-24 bg-background border-t border-b border-border overflow-hidden"
    >
      {/* Décoration fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#c9a84c]/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* En-tête */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] tracking-[0.5em] text-[#c9a84c] uppercase font-bold mb-3">
            En chiffres
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
            Maison Niang en <span className="text-gradient-gold">chiffres</span>
          </h2>
        </motion.div>

        {/* Grille stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center group relative"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Ligne verticale séparateur (sauf premier) */}
              {i > 0 && (
                <div className="absolute left-0 top-1/4 h-1/2 w-px bg-border hidden md:block" />
              )}

              <div
                className="stat-number text-gradient-gold mb-2 group-hover:scale-105 transition-transform duration-300"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                <CountUp target={stat.value} suffix={stat.suffix} inView={inView} />
              </div>

              <p className="text-sm font-bold uppercase tracking-widest text-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                {stat.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
