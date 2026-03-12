'use client'

import { motion } from 'framer-motion'

const WORDS = [
  'Nouvelle Collection',
  '✦',
  'Paris · Dakar',
  '✦',
  'Mode Contemporaine',
  '✦',
  'Édition Limitée',
  '✦',
  'Style Sans Compromis',
  '✦',
  'Livraison Mondiale',
  '✦',
]

const REPEAT = [...WORDS, ...WORDS]

export default function MarqueeSection() {
  return (
    <div className="relative bg-[#c9a84c] py-4 overflow-hidden">
      <div className="flex">
        <motion.div
          className="flex items-center gap-0 whitespace-nowrap flex-shrink-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {REPEAT.map((word, i) => (
            <span key={i} className="text-[#09090b] text-xs font-black uppercase tracking-[0.3em] px-8">
              {word}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
