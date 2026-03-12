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
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
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
              <div className="absolute -top-4 -left-4 w-full h-full border border-[#c9a84c]/30 z-0" />
              <div className="relative z-10 w-full h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80"
                  alt="L'histoire de Maison Niang"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/40 to-transparent" />
              </div>
            </div>

            {/* Petit badge flottant */}
            <motion.div
              className="absolute -bottom-6 -right-6 bg-[#c9a84c] p-6 z-20"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[#09090b] text-3xl font-black tracking-tighter leading-none">01</p>
              <p className="text-[#09090b] text-[9px] tracking-[0.3em] uppercase font-bold mt-1">Saison</p>
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
              Deux cultures,<br />
              <span className="text-gradient-gold">une vision.</span>
            </motion.h2>

            <motion.div
              className="space-y-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-white/50 leading-relaxed text-sm md:text-base">
                Maison Niang est née d'un dialogue entre deux mondes — la précision parisienne
              et l'âme de Saint-Louis du Sénégal. Chaque pièce raconte
              une histoire d'appartenance et de singularité.
              </p>
              <p className="text-white/40 leading-relaxed text-sm">
                Nous créons pour celles et ceux qui refusent de choisir entre leurs racines
                et leurs aspirations. Pour ceux qui portent leur culture comme une fierté.
              </p>
            </motion.div>

            {/* Points différenciants */}
            <motion.div
              className="space-y-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { icon: '◆', text: 'Matières premium sourcées éthiquement' },
                { icon: '◆', text: 'Fabrication locale et artisanale' },
                { icon: '◆', text: 'Éditions limitées, jamais de surstockage' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[#c9a84c] text-[8px]">{item.icon}</span>
                  <span className="text-white/60 text-sm tracking-wide">{item.text}</span>
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
                <span>Voir toutes nos créations</span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
