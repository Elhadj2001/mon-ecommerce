// components/CartItem.tsx
'use client'

import { CartItem as CartItemType, useCart } from '@/hooks/use-cart'
import QuantityController from './ui/QuantityController'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const cart = useCart()

  const onRemove = () => {
    cart.removeItem(item.id)
  }

  return (
    <li className="flex py-6 border-b items-center">
      {/* Image du produit */}
      <div className="relative h-24 w-24 overflow-hidden rounded-md sm:h-32 sm:w-32 bg-gray-50">
        <img
          src={item.image}
          alt={item.name}
          className="object-cover object-center h-full w-full"
        />
      </div>

      {/* Infos + Contrôles */}
      <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="absolute z-10 right-0 top-0">
          <button
            onClick={onRemove}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition"
          >
            Retirer
          </button>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-lg font-bold text-black uppercase tracking-tighter">
              {item.name}
            </p>
            <p className="text-sm text-gray-500">
              Prix unitaire: {item.price.toFixed(2)} €
            </p>
          </div>

          {/* Nouveau contrôleur de quantité intégré au panier */}
          <div className="w-32">
            <QuantityController item={item} />
          </div>
            
          {/* Affichage du montant total pour CET article */}
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Sous-total</p>
            <p className="text-lg font-black text-blue-600">
              {(item.price * item.quantity).toFixed(2)} €
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}