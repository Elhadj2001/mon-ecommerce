'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, MessageCircle } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollTop}
          className="fixed bottom-6 right-6 z-[500] w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl cursor-pointer"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Retour en haut"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function FloatingWhatsApp({ phone = '221770000000' }: { phone?: string }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.a
      href={`https://wa.me/${phone}?text=Bonjour%20Monsoon%2C%20j%27ai%20une%20question%20!`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-[500] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.12, y: -3 }}
      onHoverStart={() => setShowTooltip(true)}
      onHoverEnd={() => setShowTooltip(false)}
      aria-label="Nous contacter sur WhatsApp"
    >
      <MessageCircle size={24} className="text-white" fill="white" />

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute right-16 bg-white text-[#09090b] text-xs font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
          >
            Nous écrire 👋
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#25D366]"
        animate={{ scale: [1, 1.5, 1.5], opacity: [0.8, 0, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
    </motion.a>
  )
}
