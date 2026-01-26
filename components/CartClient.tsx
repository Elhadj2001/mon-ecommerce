'use client'

import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import QuantityController from '@/components/ui/QuantityController'
import { Trash2, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function CartClient() {
  const cart = useCart()
  const [loading, setLoading] = useState(false)

  // Calcul du total
  const totalPrice = cart.items.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)

  const onCheckout = async () => {
    try {
      setLoading(true)
      const response = await axios.post('/api/checkout', {
        items: cart.items,
      })
      window.location = response.data.url
    } catch (error) {
      toast.error("Une erreur est survenue lors du paiement.")
    } finally {
      setLoading(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Votre panier est vide</h2>
        <p className="text-gray-500">Ajoutez des articles pour commencer.</p>
        <Link href="/" className="rounded-full bg-black px-6 py-3 font-bold text-white hover:bg-gray-800 transition">
          Retour à la boutique
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white px-4 py-16 sm:px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-12">Mon Panier</h1>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          
          {/* LISTE DES ARTICLES */}
          <div className="lg:col-span-7">
            <ul className="border-t border-gray-200 divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item.cartId} className="flex py-6 sm:py-10">
                  
                  {/* Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 sm:h-32 sm:w-32">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Infos */}
                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link href={`/products/${item.id}`} className="font-bold text-gray-700 hover:text-black uppercase">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        
                        <div className="mt-1 flex text-sm text-gray-500 gap-2">
                          {item.selectedSize && (
                            <span className="border-r border-gray-200 pr-2">Taille: {item.selectedSize}</span>
                          )}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1">
                                Couleur: 
                                <span 
                                    className="w-3 h-3 rounded-full border border-gray-300 inline-block" 
                                    style={{backgroundColor: item.selectedColor}}
                                />
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.price)}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="max-w-[120px]">
                           <QuantityController item={item} />
                        </div>
                        
                        <div className="absolute right-0 top-0">
                          <button
                            onClick={() => cart.removeItem(item.cartId)}
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-500 transition"
                          >
                            <span className="sr-only">Supprimer</span>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RÉSUMÉ COMMANDE */}
          <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Récapitulatif</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-base font-medium text-gray-900">Total</div>
                <div className="text-base font-medium text-gray-900">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalPrice)}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={onCheckout}
                disabled={cart.items.length === 0 || loading}
                className="w-full rounded-full border border-transparent bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest transition flex justify-center items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {loading ? 'Chargement...' : 'Passer au paiement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}