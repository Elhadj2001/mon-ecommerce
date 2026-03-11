'use client'

import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/use-wishlist'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  product: {
    id: string
    name: string
    price: number
    images: { url: string }[]
  }
  className?: string
  size?: 'sm' | 'md'
}

export function WishlistButton({ product, className, size = 'md' }: WishlistButtonProps) {
  const wishlist = useWishlist()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  if (!isMounted) return null

  const isWishlisted = wishlist.isInWishlist(product.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    wishlist.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url || '',
    })
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.85 }}
      aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        `${btnSize} rounded-full flex items-center justify-center transition-all`,
        isWishlisted
          ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800'
          : 'bg-background/80 backdrop-blur-sm border border-border hover:border-rose-300',
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isWishlisted ? 'filled' : 'empty'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn(
              iconSize,
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
            )}
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
