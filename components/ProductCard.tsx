'use client'

import Link from 'next/link'
import { Product } from '@prisma/client'
import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag } from 'lucide-react'

// On réutilise la logique de type
interface ProductCardProps {
  data: Omit<Product, 'price'> & { price: number }
}

export default function ProductCard({ data }: ProductCardProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const cart = useCart()

  // On parse les options
  const sizes = data.sizes ? data.sizes.split(',').map(s => s.trim()) : []
  const colors = data.colors ? data.colors.split(',').map(c => c.trim()) : []

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Empêche de cliquer sur le lien de la carte
    e.stopPropagation()

    if (sizes.length > 0 && !size) return alert("Choisis une taille !")
    if (colors.length > 0 && !color) return alert("Choisis une couleur !")

    cart.addItem({
      id: data.id,
      name: data.name,
      price: data.price,
      image: data.images[0],
      quantity: 1,
      selectedSize: size,
      selectedColor: color
    })
  }

  return (
    <div className="group relative">
      <Link href={`/products/${data.id}`} className="block">
        <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-gray-100 mb-4">
          <img
            src={data.images[0]}
            alt={data.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          {/* Bouton Rapide flottant */}
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white z-20"
          >
            <ShoppingBag size={20} />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-sm uppercase">{data.name}</h3>
          <p className="font-medium text-gray-900">{data.price.toFixed(2)} €</p>
        </div>
      </Link>

      {/* SÉLECTEURS MINIATURES SUR LA CARTE */}
      <div className="mt-3 space-y-2">
        {/* Tailles */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.preventDefault(); setSize(s) }}
                className={`text-[10px] px-2 py-1 border rounded ${size === s ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:border-black'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        {/* Couleurs (Points) */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={(e) => { e.preventDefault(); setColor(c) }}
                className={`w-4 h-4 rounded-full border ${color === c ? 'ring-2 ring-offset-1 ring-black' : 'border-gray-300'}`}
                style={{ backgroundColor: c.toLowerCase() === 'blanc' ? '#fff' : c }} // Petit hack pour afficher la couleur si le nom est standard HTML
                title={c}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}