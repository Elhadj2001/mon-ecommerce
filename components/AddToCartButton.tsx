'use client'

import { useCart, CartItem } from '@/hooks/use-cart'

interface AddToCartButtonProps {
  product: CartItem
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const cart = useCart()

  const onAddToCart = () => {
    cart.addItem(product)
    alert('Produit ajouté !') // Simple alerte pour l'instant
  }

  return (
    <button
      onClick={onAddToCart}
      className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Ajouter au panier
    </button>
  )
}