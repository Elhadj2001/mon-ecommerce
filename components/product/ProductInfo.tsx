'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import VariantSelector from '@/components/product/VariantSelector'
import { Product } from '@prisma/client'
import { Minus, Plus, AlertTriangle, Check } from 'lucide-react'

// CORRECTION TYPAGE : On remplace 'any' par 'string[]'
interface ProductInfoProps {
  // On exclut les champs originaux pour les redéfinir proprement
  product: Omit<Product, 'price' | 'sizes' | 'colors' | 'images'> & { 
    price: number;
    images: string[]; // Tableau d'URL d'images
    sizes: string[];  // Tableau de tailles (ex: ["S", "M", "L"])
    colors: string[]; // Tableau de couleurs
  }
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  
  const cart = useCart()

  // Calcul du stock restant réel
  const cartItem = cart.items.find((item) => item.id === product.id)
  const quantityInCart = cartItem ? cartItem.quantity : 0
  const remainingStock = product.stock - quantityInCart

  const handleAddToCart = () => {
    // 1. Validation des variantes
    if (product.sizes && product.sizes.length > 0 && !size) return alert('Veuillez sélectionner une taille.')
    if (product.colors && product.colors.length > 0 && !color) return alert('Veuillez sélectionner une couleur.')

    // 2. Validation du Stock
    if (quantity + quantityInCart > product.stock) {
      alert(`Stock insuffisant ! Vous avez déjà ${quantityInCart} articles dans le panier et nous n'en avons que ${product.stock} au total.`)
      return
    }

    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      // On s'assure qu'il y a bien une image, sinon placeholder
      image: product.images?.[0] || '/placeholder.png', 
      quantity: quantity,
      selectedSize: size,
      selectedColor: color
    })
  }

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (quantity < product.stock && (quantity + quantityInCart) < product.stock) {
      setQuantity(quantity + 1)
    } else {
        // Petit retour visuel (optionnel) ou juste ne rien faire
        console.log("Max stock atteint")
    }
  }

  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-3xl font-black text-gray-900 sm:text-4xl uppercase tracking-tighter">
        {product.name}
      </h1>
      
      {/* PRIX ET ETAT DU STOCK */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
        </span>

        {product.stock <= 0 ? (
           <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider">
             <AlertTriangle size={14} /> Épuisé
           </span>
        ) : product.stock < 5 ? (
           <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
             <AlertTriangle size={14} /> Plus que {product.stock} !
           </span>
        ) : (
           <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
             <Check size={14} /> En stock
           </span>
        )}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="text-base text-gray-500 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* SÉLECTEURS VARIANTES */}
        {product.sizes && product.sizes.length > 0 && (
          <VariantSelector options={product.sizes} type="size" onSelect={setSize} />
        )}
        
        {product.colors && product.colors.length > 0 && (
          <VariantSelector options={product.colors} type="color" onSelect={setColor} />
        )}

        {/* --- ZONE D'ACTION --- */}
        <div className="flex items-center gap-4">
            
            {/* 1. COMPTEUR */}
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
                    disabled={quantity >= remainingStock}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* 2. BOUTON AJOUTER */}
            <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || remainingStock === 0}
                className="flex-1 bg-black text-white h-[58px] rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
                {product.stock === 0 
                  ? 'Rupture de stock' 
                  : remainingStock === 0 
                    ? 'Limite atteinte' 
                    : 'Ajouter au panier'}
            </button>
        </div>
        
        {quantityInCart > 0 && product.stock > 0 && (
            <p className="text-center text-sm text-gray-500">
                Vous avez déjà {quantityInCart} dans le panier.
            </p>
        )}
      </div>
    </div>
  )
}