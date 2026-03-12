'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag } from 'lucide-react'

// On déplace l'import dynamique ici, là où il est autorisé
const CartCount = dynamic(() => import('./CartCount'), { 
  ssr: false,
  loading: () => <span className="ml-2 w-5 h-5 bg-gray-200 rounded-full animate-pulse" /> 
})

export default function CartButton() {
  const cart = useCart()

  return (
    <motion.button 
      onClick={() => cart.onOpen()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-x-2 rounded-full bg-foreground px-3 sm:px-5 py-2 text-xs font-bold uppercase tracking-widest text-background hover:opacity-80 transition-opacity whitespace-nowrap"
    >
      <span className="hidden sm:inline">Panier</span>
      <ShoppingBag className="sm:hidden w-4 h-4" />
      <CartCount />
    </motion.button>
  )
}