'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@prisma/client'
import { useState, MouseEventHandler } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag, Check } from 'lucide-react'

interface ProductCardProps {
  data: Omit<Product, 'price'> & {
    price: number; 
    images: { url: string }[];
  }
}

// J'ai ajouté quelques couleurs courantes en plus pour sécuriser
const colorMap: Record<string, string> = {
  'noir': 'black', 'black': 'black',
  'blanc': 'white', 'white': 'white',
  'rouge': 'red', 'red': 'red',
  'bleu': 'blue', 'blue': 'blue',
  'vert': 'green', 'green': 'green',
  'jaune': 'yellow', 'yellow': 'yellow',
  'rose': 'pink', 'pink': 'pink',
  'gris': 'gray', 'grey': 'gray',
  'violet': 'purple', 'purple': 'purple',
  'orange': 'orange',
  'marron': '#8B4513', 'brown': '#8B4513',
  'beige': '#F5F5DC',
  'bordeaux': '#800000',
  'marine': '#000080', 'navy': '#000080',
  'kaki': '#F0E68C',
  'or': 'gold', 'gold': 'gold',
  'argent': 'silver', 'silver': 'silver'
}

export default function ProductCard({ data }: ProductCardProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const cart = useCart()

  const sizes = data.sizes || []
  const colors = data.colors || []

  const getColorStyle = (c: string) => {
    // 1. C'est un code Hexa ? On le retourne direct
    if (c.startsWith('#')) return c;
    // 2. C'est dans notre dictionnaire ? On retourne la traduction
    if (colorMap[c.toLowerCase()]) return colorMap[c.toLowerCase()];
    // 3. Sinon, on tente le nom tel quel (ex: "Cyan" marche en CSS)
    return c;
  }

  const handleAddToCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (sizes.length > 0 && !size) return alert("⚠️ Choisis une taille !")
    if (colors.length > 0 && !color) return alert("⚠️ Choisis une couleur !")

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
    <div className="group relative flex flex-col gap-2">
      {/* 1. IMAGE & LIEN */}
      <Link href={`/products/${data.id}`} className="block relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4]">
        <Image
          src={data.images?.[0]?.url || '/placeholder.png'}
          alt={data.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Bouton Panier (Flottant en bas à droite) */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md text-black hover:bg-black hover:text-white transition-all duration-200 z-20 active:scale-95"
          aria-label="Ajouter au panier"
        >
          <ShoppingBag size={18} />
        </button>
      </Link>

      {/* 2. INFOS DU PRODUIT */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
           <Link href={`/products/${data.id}`} className="font-semibold text-sm uppercase text-gray-900 line-clamp-1 hover:underline">
             {data.name}
           </Link>
           <p className="font-bold text-sm whitespace-nowrap">
             {Number(data.price).toFixed(2)} €
           </p>
        </div>

        {/* 3. SÉLECTEURS (TOUJOURS VISIBLES) */}
        <div className="flex flex-col gap-2 pt-1">
            {/* Couleurs */}
            {colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => {
                   const bg = getColorStyle(c);
                   return (
                    <button
                        key={c}
                        onClick={(e) => { e.preventDefault(); setColor(c) }}
                        className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform cursor-pointer flex items-center justify-center ${color === c ? 'ring-1 ring-offset-1 ring-black scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: bg }} 
                        title={c}
                        aria-label={`Couleur ${c}`}
                    >
                         {/* Si la couleur est blanche, on met le check en noir, sinon en blanc */}
                        {color === c && <Check size={10} className={bg === 'white' || bg === '#ffffff' ? 'text-black' : 'text-white'} />}
                    </button>
                   )
                })}
            </div>
            )}
            
            {/* Tailles */}
            {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                <button
                    key={s}
                    onClick={(e) => { e.preventDefault(); setSize(s) }}
                    className={`text-xs min-w-[24px] h-6 px-1 border rounded flex items-center justify-center transition-colors uppercase font-medium ${size === s ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                >
                    {s}
                </button>
                ))}
            </div>
            )}
        </div>
      </div>
    </div>
  )
}