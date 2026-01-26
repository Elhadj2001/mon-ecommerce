'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import VariantSelector from '@/components/product/VariantSelector'
import { Product } from '@prisma/client'
import { Minus, Plus } from 'lucide-react' // On utilise les icônes pour faire pro

interface ProductInfoProps {
  product: Omit<Product, 'price'> & { price: number }
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  // ICI : On crée une variable pour stocker la quantité choisie AVANT l'ajout
  const [quantity, setQuantity] = useState(1) 
  
  const cart = useCart()

  const handleAddToCart = () => {
    if (product.sizes && !size) return alert('Veuillez sélectionner une taille.')
    if (product.colors && !color) return alert('Veuillez sélectionner une couleur.')

    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity, // On envoie la quantité choisie ici
      selectedSize: size,
      selectedColor: color
    })
  }

  // Fonctions pour gérer le + et le - localement
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-3xl font-black text-gray-900 sm:text-4xl uppercase tracking-tighter">
        {product.name}
      </h1>
      
      {/* Prix et Badge Stock */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
        </span>
        {product.stock > 0 ? (
           <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full uppercase tracking-wider">
             En stock
           </span>
        ) : (
           <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full uppercase tracking-wider">
             Épuisé
           </span>
        )}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="text-base text-gray-500 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* SÉLECTEURS (Taille / Couleur) */}
        {product.sizes && (
          <VariantSelector options={product.sizes} type="size" onSelect={setSize} />
        )}
        
        {product.colors && (
          <VariantSelector options={product.colors} type="color" onSelect={setColor} />
        )}

        {/* --- ZONE D'ACTION (Compteur + Bouton) --- */}
        <div className="flex items-center gap-4">
            
            {/* 1. Le Compteur (Pillule grise) */}
            <div className="flex items-center bg-gray-100 rounded-full px-2 py-2 border border-gray-200">
                <button 
                    onClick={decreaseQuantity}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition text-black disabled:opacity-50"
                    disabled={quantity <= 1}
                >
                    <Minus size={18} />
                </button>
                
                <span className="w-12 text-center font-bold text-lg">
                    {quantity}
                </span>

                <button 
                    onClick={increaseQuantity}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition text-black"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* 2. Le Bouton Ajouter (Prend tout le reste de la place) */}
            <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-black text-white h-[58px] rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
                {product.stock > 0 ? 'Ajouter au panier' : 'Rupture'}
            </button>
        </div>
      </div>
    </div>
  )
}