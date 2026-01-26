'use client'

import { useCart, CartItem } from '@/hooks/use-cart'

interface QuantityControllerProps {
  item: CartItem // On attend un item complet (qui contient le cartId)
}

export default function QuantityController({ item }: QuantityControllerProps) {
  const cart = useCart()

  // On n'a plus besoin de chercher l'item dans le tableau, car on le reçoit en props.
  // On utilise directement item.quantity pour l'affichage.

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    // CORRECTION : On utilise item.cartId au lieu de product.id
    // Cela permet de ne baisser que la quantité du "Rouge S" et pas du "Vert M"
    cart.updateQuantity(item.cartId, item.quantity - 1)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    // CORRECTION : Idem, on utilise le cartId
    cart.updateQuantity(item.cartId, item.quantity + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 0) {
      cart.updateQuantity(item.cartId, val)
    }
  }

  // Note : On retire le bouton "Ajouter au panier" ici car ce composant 
  // sert maintenant uniquement à GÉRER (+/-) une quantité existante.
  // L'ajout initial se fait via le bouton de la carte produit ou de la page produit.

  return (
    <div className="flex items-center justify-between bg-gray-100 rounded-full p-1 w-full border border-black/5">
      <button 
        onClick={handleRemove}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-200 text-black font-bold transition-colors"
        aria-label="Réduire la quantité"
      >
        -
      </button>
      
      <input 
        type="number"
        value={item.quantity}
        onChange={handleInputChange}
        className="w-12 bg-transparent text-center font-bold text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button 
        onClick={handleAdd}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-200 text-black font-bold transition-colors"
        aria-label="Augmenter la quantité"
      >
        +
      </button>
    </div>
  )
}