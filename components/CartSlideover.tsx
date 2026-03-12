"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react"
import { CustomImage } from "@/components/ui/CustomImage"
import { formatPrice } from "@/lib/currency"
import { useRouter } from "next/navigation"

const colorMap: Record<string, string> = {
  'noir mat': '#171717', 'blanc pur': '#FFFFFF', 'gris chiné': '#9CA3AF',
  'anthracite': '#374151', 'bleu marine': '#1E3A8A', 'bleu roi': '#2563EB',
  'bleu ciel': '#93C5FD', 'rouge vif': '#EF4444', 'bordeaux': '#7F1D1D',
  'vert forêt': '#064E3B', 'vert kaki': '#78716C', 'vert menthe': '#6EE7B7',
  'jaune moutarde': '#D97706', 'beige sable': '#FDE68A', 'marron glacé': '#78350F',
  'rose poudré': '#FBCFE8', 'violet lavande': '#C4B5FD',
  'noir': '#000000', 'black': '#000000', 'blanc': '#FFFFFF', 'white': '#FFFFFF',
  'rouge': '#FF0000', 'red': '#FF0000', 'bleu': '#0000FF', 'blue': '#0000FF',
  'vert': '#008000', 'green': '#008000', 'jaune': '#FFFF00', 'yellow': '#FFFF00',
  'rose': '#FFC0CB', 'pink': '#FFC0CB', 'gris': '#808080', 'grey': '#808080',
  'violet': '#800080', 'purple': '#800080', 'orange': '#FFA500',
  'marron': '#8B4513', 'brown': '#8B4513', 'beige': '#F5F5DC',
  'marine': '#000080', 'navy': '#000080', 'kaki': '#F0E68C',
  'or': '#FFD700', 'gold': '#FFD700', 'argent': '#C0C0C0', 'silver': '#C0C0C0'
}

export function CartSlideover() {
  const [isMounted, setIsMounted] = useState(false)
  const cart = useCart()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Désactiver le scroll du body quand le panier est ouvert
  useEffect(() => {
    if (cart.isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [cart.isOpen])

  if (!isMounted) return null

  const grandTotal = cart.items.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)

  const getColorStyle = (c: string) => {
    if (!c) return 'transparent';
    if (c.startsWith('#')) return c;
    const lowerC = c.toLowerCase();
    if (colorMap[lowerC]) return colorMap[lowerC];
    return c;
  }

  const handleCheckoutClick = () => {
    cart.onClose()
    router.push('/cart')
  }

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <>
          {/* Overlay sombre de fond */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={cart.onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Conteneur global masquant le débordement */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
            {/* Panneau latéral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col pointer-events-auto"
            >
            {/* Header du Slideover */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
                  Panier ({cart.items.length})
                </h2>
              </div>
              <button
                onClick={cart.onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu (Liste des articles) */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Votre panier est vide.</p>
                  <button
                    onClick={cart.onClose}
                    className="text-sm font-semibold text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.items.map((item) => {
                    const bg = getColorStyle(item.selectedColor || '')
                    return (
                      <li key={item.cartId} className="flex gap-4">
                        {/* Image produit */}
                        <div className="relative w-24 h-24 rounded-md overflow-hidden bg-secondary border border-border flex-shrink-0">
                          <CustomImage
                            src={item.images[0] || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Informations produit */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                               <h3 className="text-sm font-bold uppercase text-foreground leading-tight line-clamp-2">
                                 {item.name}
                               </h3>
                               <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                                  {item.selectedSize}
                                  {item.selectedSize && item.selectedColor && <span>|</span>}
                                  {item.selectedColor && (
                                     <span className="flex items-center gap-1 capitalize">
                                        <span 
                                            className="w-3 h-3 rounded-full border border-border inline-block"
                                            style={{ backgroundColor: bg }}
                                        />
                                        {item.selectedColor}
                                     </span>
                                  )}
                               </p>
                            </div>
                            <button
                              onClick={() => cart.removeItem(item.cartId)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-2">
                            <div className="flex items-center border border-border rounded-md shadow-sm">
                              <button
                                onClick={() => cart.updateQuantity(item.cartId, item.quantity - 1)}
                                className="p-1 px-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-semibold w-6 text-center text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => cart.updateQuantity(item.cartId, item.quantity + 1)}
                                className="p-1 px-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <p className="font-bold text-sm text-foreground">
                              {formatPrice(Number(item.price) * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer du Slideover (Total & Bouton) */}
            {cart.items.length > 0 && (
              <div className="border-t border-border p-6 bg-background">
                <div className="flex items-center justify-between font-bold text-foreground uppercase mb-4">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  Frais de port et réductions calculés à l'étape suivante.
                </p>
                <div className="grid gap-3">
                   <button
                     onClick={handleCheckoutClick}
                     className="w-full flex items-center justify-center py-3 px-4 rounded-md bg-foreground text-background font-semibold hover:opacity-90 transition-opacity uppercase text-sm"
                   >
                     Procéder au paiement
                   </button>
                   <button
                     onClick={cart.onClose}
                     className="w-full py-3 px-4 text-center text-sm font-semibold underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
                   >
                     Continuer mes achats
                   </button>
                </div>
              </div>
            )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
