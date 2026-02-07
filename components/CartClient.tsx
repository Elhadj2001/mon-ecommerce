'use client'

import { useCart } from '@/hooks/use-cart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/currency' // <-- Import

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

export default function CartClient() {
  const cart = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const items = cart.items

  // Calcul du total global en EUR (pour logique interne)
  const grandTotal = items.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)

  const onCheckout = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/checkout`, {
        items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
        }))
      })
      window.location = response.data.url
    } catch (error) {
      console.error(error)
      alert("Une erreur est survenue lors du paiement.")
    } finally {
      setLoading(false)
    }
  }

  const getColorStyle = (c: string) => {
    if (!c) return 'transparent';
    if (c.startsWith('#')) return c;
    const lowerC = c.toLowerCase();
    if (colorMap[lowerC]) return colorMap[lowerC];
    return c;
  }

  const onIncrease = (cartId: string) => {
    const item = items.find(i => i.cartId === cartId);
    if (item) {
        cart.updateQuantity(cartId, item.quantity + 1)
    }
  }

  const onDecrease = (cartId: string) => {
    const item = items.find(i => i.cartId === cartId);
    if (item) {
        cart.updateQuantity(cartId, item.quantity - 1)
    }
  }

  const onRemove = (cartId: string) => {
    cart.removeItem(cartId)
  }

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <div className="bg-gray-100 p-6 rounded-full">
            <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Votre panier est vide</h2>
        <button 
            onClick={() => router.push('/')} 
            className="mt-4 bg-black text-white px-8 py-3 rounded-md font-medium uppercase hover:bg-gray-800 transition-all flex items-center gap-2"
        >
            Découvrir la collection <ArrowRight size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase mb-10">Mon Panier ({items.length})</h1>
      
      <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        
        {/* LISTE DES ARTICLES */}
        <div className="lg:col-span-7">
          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {items.map((item) => {
               const bg = getColorStyle(item.selectedColor || '');
               const lineTotal = Number(item.price) * item.quantity; 

               return (
                <li key={item.cartId} className="flex py-6 sm:py-10">
                    {/* IMAGE */}
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <Image
                            src={item.images[0] || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover object-center"
                        />
                    </div>

                    {/* INFOS */}
                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase">
                                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                                </h3>
                                
                                <div className="mt-2 flex text-sm text-gray-500 gap-4 items-center">
                                    {item.selectedColor && (
                                        <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                                            <div 
                                                className="h-5 w-5 rounded-full border border-gray-300 shadow-sm"
                                                style={{ backgroundColor: bg }}
                                                title={item.selectedColor}
                                            />
                                            <span className="capitalize text-gray-600">{item.selectedColor}</span>
                                        </div>
                                    )}
                                    {item.selectedSize && (
                                        <p className="font-medium text-gray-900 border border-gray-200 px-2 py-0.5 rounded text-xs">
                                            {item.selectedSize}
                                        </p>
                                    )}
                                </div>
                                
                                {/* PRIX UNITAIRE (Formaté FCFA) */}
                                <p className="mt-2 text-xs text-gray-500">
                                    Prix unitaire : {formatPrice(item.price)}
                                </p>
                            </div>

                            {/* QUANTITÉ + TOTAL LIGNE + SUPPRESSION */}
                            <div className="mt-4 sm:mt-0 sm:pr-9 flex flex-col items-end gap-2">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button 
                                        onClick={() => onDecrease(item.cartId)}
                                        className="p-2 hover:bg-gray-100 text-gray-600 transition"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-2 text-sm font-semibold min-w-[30px] text-center">
                                        {item.quantity}
                                    </span>
                                    <button 
                                        onClick={() => onIncrease(item.cartId)}
                                        className="p-2 hover:bg-gray-100 text-gray-600 transition"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* TOTAL LIGNE (Formaté FCFA) */}
                                <p className="text-sm font-bold text-black">
                                    Total: {formatPrice(lineTotal)}
                                </p>
                                
                                <button
                                    onClick={() => onRemove(item.cartId)}
                                    className="absolute right-0 top-0 text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                                    title="Supprimer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                        </div>
                    </div>
                </li>
               )
            })}
          </ul>
        </div>

        {/* RÉSUMÉ COMMANDE (TOTAL FINAL) */}
        <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 sticky top-24">
          <h2 className="text-lg font-medium text-gray-900 uppercase tracking-tight">Résumé de la commande</h2>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-base font-medium text-gray-900">Total Global</div>
              {/* AFFICHAGE TOTAL EN FCFA */}
              <div className="text-xl font-black text-gray-900">{formatPrice(grandTotal)}</div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
               <div className="text-sm text-gray-500">Livraison</div>
               <div className="text-sm font-medium text-green-600">Offerte</div>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirection Stripe...' : 'Payer maintenant'}
          </button>
          
          <p className="mt-4 text-xs text-center text-gray-400">
             Paiement 100% sécurisé via Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}