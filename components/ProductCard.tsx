'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@prisma/client'
import { useState, MouseEventHandler } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag, Check } from 'lucide-react'

interface ProductWithImages extends Omit<Product, 'price' | 'originalPrice'> {
  price: number
  originalPrice?: number | null
  images: { url: string; color?: string | null }[]
}

interface ProductCardProps {
  data: ProductWithImages
}

const colorMap: Record<string, string> = {
  'noir mat': '#171717', 'blanc pur': '#FFFFFF', 'gris chiné': '#9CA3AF',
  'anthracite': '#374151', 'bleu marine': '#1E3A8A', 'bleu roi': '#2563EB',
  'bleu ciel': '#93C5FD', 'rouge vif': '#EF4444', 'bordeaux': '#7F1D1D',
  'vert forêt': '#064E3B', 'vert kaki': '#78716C', 'vert menthe': '#6EE7B7',
  'jaune moutarde': '#D97706', 'beige sable': '#FDE68A', 'marron glacé': '#78350F',
  'rose poudré': '#FBCFE8', 'violet lavande': '#C4B5FD',
  'noir': '#000000', 'black': '#000000', 'blanc': '#FFFFFF', 'white': '#FFFFFF',
  'rouge': '#FF0000', 'red': '#FF0000', 'bleu': '#0000FF', 'blue': '#0000FF',
  'vert': '#008000', 'jaune': '#FFFF00', 'rose': '#FFC0CB', 'gris': '#808080',
  'violet': '#800080', 'orange': '#FFA500', 'marron': '#8B4513', 'beige': '#F5F5DC',
  'marine': '#000080', 'kaki': '#F0E68C', 'or': '#FFD700', 'argent': '#C0C0C0'
}

export default function ProductCard({ data }: ProductCardProps) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [currentImage, setCurrentImage] = useState(data.images?.[0]?.url)
  
  const cart = useCart()
  const sizes = data.sizes || []
  const colors = data.colors || []

  // --- 1. SÉCURISATION DES VARIABLES ---
  const price = Number(data.price)
  const originalPrice = data.originalPrice ? Number(data.originalPrice) : null
  
  // La promo n'est valide QUE si l'ancien prix existe ET est plus grand que le prix actuel
  const hasPromo = originalPrice !== null && originalPrice > price
  
  const discountPercentage = hasPromo && originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  const handleColorHover = (colorName: string) => {
    const matchedImage = data.images.find(img => img.color === colorName)
    if (matchedImage) {
      setCurrentImage(matchedImage.url)
    }
  }

  const getColorStyle = (c: string) => {
    if (c.startsWith('#')) return c;
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
      price: price,
      images: [currentImage || ''], 
      quantity: 1,
      selectedSize: size,
      selectedColor: color
    })
  }

  return (
    <div className="group relative flex flex-col gap-2 h-full">
      <Link href={`/products/${data.id}`} className="block relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4]">
        
        {/* BADGE PROMO */}
        {hasPromo && discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest z-10 rounded-sm shadow-sm">
                -{discountPercentage}%
            </div>
        )}

        <Image
          src={currentImage || '/placeholder.png'}
          alt={data.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-center transition-all duration-500 group-hover:scale-105"
        />
        
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md text-black hover:bg-black hover:text-white transition-all duration-200 z-20 active:scale-95"
        >
          <ShoppingBag size={18} />
        </button>
      </Link>

      <div className="space-y-2 px-1">
        <div className="flex justify-between items-start gap-2">
           <Link href={`/products/${data.id}`} className="font-bold text-xs sm:text-sm uppercase text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">
             {data.name}
           </Link>
           
           <div className="flex flex-col items-end shrink-0">
              {/* AFFICHAGE DES PRIX */}
              {hasPromo && originalPrice ? (
                  <>
                      <span className="text-[10px] text-gray-400 line-through leading-none">
                          {originalPrice.toFixed(2)}€
                      </span>
                      <span className="font-bold text-sm text-red-600">
                          {price.toFixed(2)}€
                      </span>
                  </>
              ) : (
                  <span className="font-bold text-sm">
                      {price.toFixed(2)}€
                  </span>
              )}
           </div>
        </div>

        {/* SECTION TAILLES */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.preventDefault(); setSize(s); }}
                className={`
                  text-[10px] px-2 py-0.5 border rounded transition-all uppercase font-medium
                  ${size === s 
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-black'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* SECTION COULEURS */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {colors.slice(0, 6).map((c) => {
               const bg = getColorStyle(c);
               const isLight = bg === '#FFFFFF' || bg === '#FDE68A';
               return (
                <button
                    key={c}
                    onMouseEnter={() => handleColorHover(c)}
                    onClick={(e) => { e.preventDefault(); setColor(c); handleColorHover(c); }}
                    className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform flex items-center justify-center ${color === c ? 'ring-1 ring-offset-1 ring-black scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: bg }} 
                >
                    {color === c && <Check size={10} className={isLight ? 'text-black' : 'text-white'} />}
                </button>
               )
            })}
            {colors.length > 6 && <span className="text-[10px] text-gray-400 self-center">+{colors.length - 6}</span>}
          </div>
        )}
      </div>
    </div>
  )
}