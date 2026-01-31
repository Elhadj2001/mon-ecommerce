'use client'

import { useCart } from '@/hooks/use-cart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'

// 1. AJOUT DU DICTIONNAIRE DE COULEURS
const colorMap: Record<string, string> = {
  'noir': 'black', 'blanc': 'white', 'rouge': 'red', 'bleu': 'blue',
  'vert': 'green', 'jaune': 'yellow', 'rose': 'pink', 'gris': 'gray',
  'violet': 'purple', 'orange': 'orange', 'marron': '#8B4513',
  'beige': '#F5F5DC', 'bordeaux': '#800000', 'marine': '#000080',
  'kaki': '#F0E68C', 'or': '#FFD700', 'argent': '#C0C0C0'
}

export default function CartClient() {
  const cart = useCart()
  const router = useRouter()

  const totalPrice = cart.items.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)

  // 2. FONCTION POUR RÉCUPÉRER LA COULEUR CSS
  const getColorStyle = (c: string) => {
    if (!c) return 'transparent';
    if (c.startsWith('#')) return c;
    return colorMap[c.toLowerCase()] || c;
  }

  const onCheckout = async () => {
    try {
        const response = await axios.post('/api/checkout', {
            items: cart.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor
            }))
        });
        window.location = response.data.url;
    } catch (error: unknown) {
        console.error("Erreur checkout", error)
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data || "Une erreur est survenue.");
        } else {
            toast.error("Erreur inconnue lors du paiement.");
        }
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Votre panier est vide</h2>
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition">
            Continuer mes achats
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-12">Mon Panier</h1>
      <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        
        <div className="lg:col-span-7">
          <ul className="border-t border-gray-200 divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item.cartId} className="flex py-6 sm:py-10">
                
                {/* IMAGE (Déjà correcte ici) */}
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                  <Image
                    fill
                    src={item.images[0] || '/placeholder.png'} 
                    alt={item.name}
                    className="object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm font-semibold text-black">{item.name}</h3>
                      </div>
                      
                      <div className="mt-1 flex flex-wrap text-sm text-gray-500 gap-2">
                        {/* 3. CORRECTION AFFICHAGE COULEUR */}
                        {item.selectedColor && (
                            <span className="border-r border-gray-200 pr-2 flex items-center gap-1">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" 
                                  style={{ backgroundColor: getColorStyle(item.selectedColor) }} 
                                />
                                {item.selectedColor}
                            </span>
                        )}
                        {item.selectedSize && (
                            <span>Taille: {item.selectedSize}</span>
                        )}
                      </div>
                      
                      <p className="mt-1 text-sm font-medium text-gray-900">{item.price.toFixed(2)} €</p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="flex items-center gap-3">
                            <button onClick={() => cart.updateQuantity(item.cartId, item.quantity - 1)} className="p-1 rounded-md border hover:bg-gray-50 cursor-pointer"><Minus size={14} /></button>
                            <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => cart.updateQuantity(item.cartId, item.quantity + 1)} className="p-1 rounded-md border hover:bg-gray-50 cursor-pointer"><Plus size={14} /></button>
                        </div>
                      <div className="absolute right-0 top-0">
                        <button onClick={() => cart.removeItem(item.cartId)} className="text-gray-400 hover:text-red-500 transition cursor-pointer"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 className="text-lg font-medium text-gray-900">Résumé</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-base font-medium text-gray-900">Total commande</div>
              <div className="text-base font-medium text-gray-900">{totalPrice.toFixed(2)} €</div>
            </div>
          </div>
          <div className="mt-6">
            <button onClick={onCheckout} disabled={cart.items.length === 0} className="w-full rounded-full border border-transparent bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition cursor-pointer active:scale-95">
              Passer au paiement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}