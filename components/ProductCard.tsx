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

// TA NOUVELLE PALETTE (Convertie pour le mapping)
const colorMap: Record<string, string> = {
  // --- Tes Rich Colors ---
  'noir mat': '#171717',
  'blanc pur': '#FFFFFF',
  'gris chiné': '#9CA3AF',
  'anthracite': '#374151',
  'bleu marine': '#1E3A8A',
  'bleu roi': '#2563EB',
  'bleu ciel': '#93C5FD',
  'rouge vif': '#EF4444',
  'bordeaux': '#7F1D1D',
  'vert forêt': '#064E3B',
  'vert kaki': '#78716C',
  'vert menthe': '#6EE7B7',
  'jaune moutarde': '#D97706',
  'beige sable': '#FDE68A',
  'marron glacé': '#78350F',
  'rose poudré': '#FBCFE8',
  'violet lavande': '#C4B5FD',

  // --- Fallbacks classiques (Au cas où) ---
  'noir': '#000000', 'black': '#000000',
  'blanc': '#FFFFFF', 'white': '#FFFFFF',
  'rouge': '#FF0000', 'red': '#FF0000',
  'bleu': '#0000FF', 'blue': '#0000FF'
}

export default function ProductCard({ data }: ProductCardProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const cart = useCart()

  const sizes = data.sizes || []
  const colors = data.colors || []

  const getColorStyle = (c: string) => {
    if (c.startsWith('#')) return c;
    // On cherche en minuscule pour éviter les erreurs de majuscules
    const lowerC = c.toLowerCase();
    if (colorMap[lowerC]) return colorMap[lowerC];
    return c;
  }

  const handleAddToCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (sizes.length > 0 && !size) return alert("⚠️ Veuillez sélectionner une taille.")
    if (colors.length > 0 && !color) return alert("⚠️ Veuillez sélectionner une couleur.")

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
        
        {/* Bouton Panier */}
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
           {/* TITRE SANS SOULIGNEMENT */}
           <Link href={`/products/${data.id}`} className="font-semibold text-sm uppercase text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">
             {data.name}
           </Link>
           <p className="font-bold text-sm whitespace-nowrap">
             {Number(data.price).toFixed(2)} €
           </p>
        </div>

        {/* 3. SÉLECTEURS */}
        <div className="flex flex-col gap-2 pt-1">
            
            {/* Couleurs */}
            {colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => {
                   const bg = getColorStyle(c);
                   // Détection simple pour savoir si on met le check en noir ou blanc
                   const isLight = bg === '#FFFFFF' || bg === '#FDE68A' || bg === '#FBCFE8' || bg === '#93C5FD' || bg === '#6EE7B7';
                   
                   return (
                    <button
                        key={c}
                        onClick={(e) => { e.preventDefault(); setColor(c) }}
                        className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform cursor-pointer flex items-center justify-center ${color === c ? 'ring-1 ring-offset-1 ring-black scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: bg }} 
                        title={c}
                        aria-label={`Couleur ${c}`}
                    >
                        {color === c && <Check size={10} className={isLight ? 'text-black' : 'text-white'} />}
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