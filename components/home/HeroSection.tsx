'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 3,
}))

const WORDS = ['Audace', 'Élégance', 'Unicité', 'Prestige']

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  // Rotation des mots
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % WORDS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Effet parallaxe subtil sur la souris
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#09090b]"
    >
      {/* ── FOND GRADIENT ANIMÉ ── */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)',
          }}
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(201,168,76,0.10) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 70% 60%, rgba(201,168,76,0.08) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201,168,76,0.12) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(201,168,76,0.10) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grille décorative */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── PARTICULES FLOTTANTES ── */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#c9a84c]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── IMAGE HÉRO AVEC PARALLAXE ── */}
      <motion.div
        className="absolute right-0 top-0 w-full md:w-1/2 h-full"
        style={{
          x: mousePos.x * -20,
          y: mousePos.y * -10,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80"
          alt="Collection Maison Niang"
          className="w-full h-full object-cover object-center opacity-30 md:opacity-50"
        />
        {/* Overlay dégradé pour fondre l'image dans le fond */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30" />
      </motion.div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-3xl">

          {/* Badge supérieur */}
          <motion.div
            className="inline-flex items-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Sparkles size={12} className="text-[#c9a84c]" />
            <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase font-bold">
              Nouvelle Collection 2025
            </span>
            <Sparkles size={12} className="text-[#c9a84c]" />
          </motion.div>

          {/* Titre principal */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              className="font-display text-white"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: '0.88' }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              MODE
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-4">
            <motion.div
              className="font-display"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: '0.88' }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-gradient-gold">SANS</span>
            </motion.div>
          </div>

          <div className="overflow-hidden mb-10">
            <motion.div
              key={wordIndex}
              className="font-display text-white"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: '0.88' }}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {WORDS[wordIndex]}
            </motion.div>
          </div>

          {/* Ligne décorative dorée */}
          <motion.div
            className="h-px mb-8"
            style={{ background: 'linear-gradient(90deg, #c9a84c, transparent)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '180px', opacity: 1 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Sous-titre */}
          <motion.p
            className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-12 max-w-md"
            style={{ letterSpacing: '0.02em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            L'alliance de l'âme de Dakar et de la rigueur parisienne.
            Des pièces créées pour marquer les esprits.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex items-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Link
              href="#collection"
              className="group relative inline-flex items-center gap-3 bg-[#c9a84c] text-[#09090b] px-8 py-4 font-bold text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(201,168,76,0.5)]"
            >
              <span className="relative z-10">Explorer la boutique</span>
              <ArrowRight
                size={16}
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              />
              {/* Hover animation */}
              <span className="absolute inset-0 bg-[#f0d080] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>

            <Link
              href="/products?sort=new"
              className="inline-flex items-center gap-2 text-white/50 text-sm uppercase tracking-widest font-bold hover:text-[#c9a84c] transition-colors duration-300"
            >
              <span>Nouveautés</span>
              <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
          </motion.div>

        </div>
      </div>

      {/* ── SCROLL INDICATOR ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase">Défiler</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-[#c9a84c] to-transparent"
          animate={{ scaleY: [1, 0.3, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* ── INDICATEUR de mode (bas gauche) ── */}
      <motion.div
        className="absolute bottom-10 left-6 hidden md:flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
        <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase">EST. 2024</span>
      </motion.div>

      {/* ── NUMÉROTATION (bas droit) ── */}
      <motion.div
        className="absolute bottom-10 right-6 hidden md:block text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase">Saint-Louis · Paris</span>
      </motion.div>

    </section>
  )
}
