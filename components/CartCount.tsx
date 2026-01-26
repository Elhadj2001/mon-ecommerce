'use client'

import { useCart } from '@/hooks/use-cart'

export default function CartCount() {
  const items = useCart((state) => state.items)
  
  // Calcul de la somme des quantités (Ex: 2 T-shirts + 1 Jean = 3)
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)

  if (totalQuantity === 0) return null

  return (
    <span className="ml-2 text-[10px] font-bold bg-white text-black rounded-full w-5 h-5 flex items-center justify-center border border-black/10">
      {totalQuantity}
    </span>
  )
}