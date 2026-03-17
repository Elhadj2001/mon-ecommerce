'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BrandStory() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-32 bg-[#09090b] overflow-hidden">
      {/* Décoration fond */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-32 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Motif tisser africain décoratif */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── GAUCHE : IMAGE ── */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              {/* Cadre doré décalé */}
              <div className="absolute -top-4 -left-4 w-full h-full border border-[#c9a84c]/40 z-0" />
              <div className="absolute -top-2 -left-2 w-full h-full border border-[#c9a84c]/10 z-0" />
              <div className="relative z-10 w-full h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80"
                  alt="Les Signares de Saint-Louis — Maison Niang"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/60 via-transparent to-transparent" />
                {/* Caption en bas */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[#c9a84c] text-[9px] tracking-[0.3em] uppercase font-bold">Takusanu Ndar</p>
                  <p className="text-white/70 text-xs mt-0.5">Les Signares de Saint-Louis</p>
                </div>
              </div>
            </div>

            {/* Badge saison */}
            <motion.div
              className="absolute -bottom-6 -right-6 bg-[#c9a84c] p-5 z-20"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[#09090b] text-2xl font-black tracking-tighter leading-none">S1</p>
              <p className="text-[#09090b] text-[8px] tracking-[0.3em] uppercase font-bold mt-0.5">Saison</p>
            </motion.div>
          </motion.div>

          {/* ── DROITE : TEXTE ── */}
          <div>
            <motion.p
              className="text-[10px] tracking-[0.5em] text-[#c9a84c] uppercase font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Notre histoire
            </motion.p>

            <motion.h2
              className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              L'héritage des<br />
              <span className="text-gradient-gold">Signares.</span>
            </motion.h2>

            <motion.div
              className="space-y-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-white/60 leading-relaxed text-sm md:text-base">
                Il était une fois, sur les rives du fleuve Sénégal, une cité aux maisons coloniales
                et aux femmes d'exception — les <strong className="text-[#c9a84c]">Signares</strong>.
                Ces femmes de Saint-Louis, métissées d'âme et de beauté, incarnaient la grâce
                absolue sous le soleil de Ndar.
              </p>
              <p className="text-white/40 leading-relaxed text-sm">
                <em className="text-white/50">Takusanu Ndar</em> — « la beauté de Saint-Louis » —
                c'est cette essence que <strong className="text-white/70">Maison Niang</strong> distille
                dans chaque création. L'élégance naturelle, le tissu qui ondule comme la mer,
                les couleurs qui parlent de la terre et du ciel de Dakar.
              </p>
              <p className="text-white/35 leading-relaxed text-sm">
                Nous créons pour celles et ceux qui portent leur culture comme une couronne.
                Pour ceux qui savent que la vraie beauté vient de l'âme.
              </p>
            </motion.div>

            {/* Points différenciants */}
            <motion.div
              className="space-y-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { icon: '◆', text: 'Inspirée des Signares, la noblesse de Saint-Louis' },
                { icon: '◆', text: 'Matières précieuses et artisanat sénégalais' },
                { icon: '◆', text: 'Éditions limitées — élégance rare, jamais banale' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[#c9a84c] text-[8px] flex-shrink-0">{item.icon}</span>
                  <span className="text-white/55 text-sm tracking-wide">{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 text-[#c9a84c] text-sm font-bold uppercase tracking-widest border-b border-[#c9a84c]/30 pb-1 hover:border-[#c9a84c] transition-colors duration-300"
              >
                <span>Découvrir la collection</span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
