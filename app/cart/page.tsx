'use client'


import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// C'est ici la magie : on importe le composant avec ssr: false
const CartClient = dynamic(() => import('@/components/CartClient'), {
  ssr: false,
  loading: () => (
    // Petit loader pendant que le panier charge depuis le navigateur
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-black" />
    </div>
  )
})

export default function CartPage() {
  return <CartClient />
}