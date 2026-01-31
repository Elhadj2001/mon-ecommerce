'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product, Image as ImageType } from '@prisma/client'
import { useState, MouseEventHandler } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag, Check } from 'lucide-react'

interface ProductCardProps {
  data: Omit<Product, 'price'> & {
    price: number; // On force le type number ici
    images: { url: string }[];
  }
}
const colorMap: Record<string, string> = {
  'noir': 'black', 'blanc': 'white', 'rouge': 'red', 'bleu': 'blue',
  'vert': 'green', 'jaune': 'yellow', 'rose': 'pink', 'gris': 'gray',
  'violet': 'purple', 'orange': 'orange', 'marron': '#8B4513',
  'beige': '#F5F5DC', 'bordeaux': '#800000', 'marine': '#000080',
  'kaki': '#F0E68C'
}

export default function ProductCard({ data }: ProductCardProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const cart = useCart()

  const sizes = data.sizes || []
  const colors = data.colors || []

  const getColorStyle = (c: string) => {
    if (c.startsWith('#')) return c;
    return colorMap[c.toLowerCase()] || c;
  }

  const handleAddToCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (sizes.length > 0 && !size) return alert("Choisis une taille !")
    if (colors.length > 0 && !color) return alert("Choisis une couleur !")

    cart.addItem({
      id: data.id,
      name: data.name,
      price: Number(data.price),
      images: data.images.map(img => img.url),
      quantity: 1,
      selectedSize: size,
      selectedColor: color
    })
  }

  return (
    <div className="group relative bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all duration-300">
      <Link href={`/products/${data.id}`} className="block">
        <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-gray-100 mb-4">
          <Image
            src={data.images?.[0]?.url || '/placeholder.png'}
            alt={data.name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white z-20 cursor-pointer"
          >
            <ShoppingBag size={20} />
          </button>
        </div>

        <div className="space-y-1 px-1">
          <h3 className="font-bold text-sm uppercase truncate">{data.name}</h3>
          <p className="font-medium text-gray-900">{Number(data.price).toFixed(2)} €</p>
        </div>
      </Link>

      {(sizes.length > 0 || colors.length > 0) && (
        <div className="mt-3 px-1 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
            {colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => {
                   const bg = getColorStyle(c);
                   return (
                    <button
                        key={c}
                        onClick={(e) => { e.preventDefault(); setColor(c) }}
                        className={`w-4 h-4 rounded-full border shadow-sm transition-all cursor-pointer flex items-center justify-center ${color === c ? 'ring-1 ring-offset-1 ring-black scale-110' : 'hover:scale-105 border-gray-300'}`}
                        style={{ backgroundColor: bg }} 
                        title={c}
                    >
                        {color === c && <Check size={8} className={bg === 'white' ? 'text-black' : 'text-white'} />}
                    </button>
                   )
                })}
            </div>
            )}
            
            {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1">
                {sizes.map((s) => (
                <button
                    key={s}
                    onClick={(e) => { e.preventDefault(); setSize(s) }}
                    className={`text-[9px] px-1.5 py-0.5 border rounded transition-colors uppercase font-bold ${size === s ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:border-black'}`}
                >
                    {s}
                </button>
                ))}
            </div>
            )}
        </div>
      )}
    </div>
  )
}