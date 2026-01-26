'use client' // <--- C'est ici qu'on met le client

import Link from 'next/link'
import dynamic from 'next/dynamic'

// On déplace l'import dynamique ici, là où il est autorisé
const CartCount = dynamic(() => import('./CartCount'), { 
  ssr: false,
  loading: () => <span className="ml-2 w-5 h-5 bg-gray-200 rounded-full animate-pulse" /> 
})

export default function CartButton() {
  return (
    <Link 
      href="/cart" 
      className="flex items-center gap-x-2 rounded-full bg-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-gray-800 transition-all"
    >
      <span>Panier</span>
      <CartCount />
    </Link>
  )
}