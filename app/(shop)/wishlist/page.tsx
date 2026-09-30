'use client'

import { useWishlist } from '@/hooks/use-wishlist'
import { WishlistButton } from '@/components/ui/WishlistButton'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/currency'

export default function WishlistPage() {
  const wishlist = useWishlist()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  if (!isMounted) return null

  const items = wishlist.items

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="mb-10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
              Mes Favoris
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} article{items.length > 1 ? 's' : ''} sauvegardé{items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/30 rounded-3xl border border-border">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Votre liste est vide</h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-xs">
              Cliquez sur le cœur d'un produit pour le sauvegarder ici.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background font-bold uppercase tracking-widest px-6 py-3 rounded-xl text-sm hover:bg-foreground/90 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group relative flex flex-col gap-2">
                <Link href={`/products/${item.id}`} className="block relative overflow-hidden rounded-2xl bg-secondary aspect-[3/4]">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <WishlistButton
                      product={{ id: item.id, name: item.name, price: item.price, images: [{ url: item.imageUrl }] }}
                      size="sm"
                    />
                  </div>
                </Link>
                <div className="px-1">
                  <Link href={`/products/${item.id}`} className="font-bold text-sm text-foreground uppercase line-clamp-1 hover:text-muted-foreground transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-sm font-black text-foreground mt-0.5">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
