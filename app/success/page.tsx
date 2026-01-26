'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import { CheckCheck } from 'lucide-react'

export default function SuccessPage() {
  const cart = useCart()

  useEffect(() => {
    // Dès que la page charge, on vide le panier !
    cart.clearCart()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCheck className="h-12 w-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-black uppercase tracking-tight">Merci pour votre commande !</h1>
      <p className="text-gray-500 max-w-md">
        Votre paiement a été validé. Vous recevrez bientôt un email de confirmation.
      </p>

      <Link 
        href="/"
        className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-white font-bold hover:bg-gray-800 transition"
      >
        Continuer mes achats
      </Link>
    </div>
  )
}