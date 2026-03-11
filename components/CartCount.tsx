'use client'

import { useCart } from '@/hooks/use-cart'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CartCount() {
  const items = useCart((state) => state.items)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calcul de la somme des quantités (Ex: 2 T-shirts + 1 Jean = 3)
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)

  if (!mounted || totalQuantity === 0) return null

  return (
    <AnimatePresence mode="popLayout">
      <motion.span 
        key={totalQuantity}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="ml-2 text-[10px] font-bold bg-background text-foreground rounded-full w-5 h-5 flex items-center justify-center border border-border shrink-0"
      >
        {totalQuantity}
      </motion.span>
    </AnimatePresence>
  )
}