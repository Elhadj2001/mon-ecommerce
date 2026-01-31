'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// On charge le client dynamiquement pour éviter les erreurs d'hydratation
// liées au LocalStorage (qui n'existe pas côté serveur)
const CartClient = dynamic(() => import('@/components/CartClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  )
})

export default function CartPage() {
  return <CartClient />
}