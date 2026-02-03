'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@prisma/client'
import { useState, MouseEventHandler } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag, Check } from 'lucide-react'

// On étend le type pour inclure la couleur dans les images et le prix d'origine
interface ProductWithImages extends Omit<Product, 'price' | 'originalPrice'> {
  price: number
  originalPrice?: number | null // <--- NOUVEAU
  images: { url: string; color?: string | null }[]
}

interface ProductCardProps {
  data: ProductWithImages
}

// TA PALETTE DE COULEURS
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
  
  // 1. État pour l'image affichée (par défaut la première)
  const [currentImage, setCurrentImage] = useState(data.images?.[0]?.url)
  
  const cart = useCart()
  const sizes = data.sizes || []
  const colors = data.colors || []

  // 2. Fonction magique : Trouve l'image associée à la couleur survolée
  const handleColorHover = (colorName: string) => {
    const matchedImage = data.images.find(img => img.color === colorName)
    // Si on trouve une image spécifique à cette couleur, on l'affiche
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
      price: Number(data.price),
      // 3. On envoie l'image ACTUELLE (la bonne couleur) au panier
      images: [currentImage], 
      quantity: 1,
      selectedSize: size,
      selectedColor: color
    })
  }

  // Calcul pour savoir s'il y a une promo active
  const hasPromo = data.originalPrice && data.originalPrice > data.price

  return (
    <div className="group relative flex flex-col gap-2">
      
      {/* IMAGE & LIEN */}
      <Link href={`/products/${data.id}`} className="block relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4]">
        
        {/* BADGE PROMO (Nouveau) */}
        {hasPromo && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10 rounded-sm">
                Promo
            </div>
        )}

        <Image
          src={currentImage || '/placeholder.png'}
          alt={data.name}
          fill
          // Transition douce lors du changement d'image
          className="object-cover object-center transition-all duration-500 group-hover:scale-105"
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

      {/* INFOS DU PRODUIT */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
           <Link href={`/products/${data.id}`} className="font-semibold text-sm uppercase text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">
             {data.name}
           </Link>
           
           {/* AFFICHAGE PRIX INTELLIGENT (Nouveau) */}
           <div className="flex flex-col items-end">
              {hasPromo ? (
                  <>
                      <span className="text-xs text-gray-400 line-through">
                          {data.originalPrice?.toFixed(2)} €
                      </span>
                      <span className="font-bold text-sm text-red-600">
                          {Number(data.price).toFixed(2)} €
                      </span>
                  </>
              ) : (
                  <span className="font-bold text-sm">
                      {Number(data.price).toFixed(2)} €
                  </span>
              )}
           </div>
        </div>

        {/* SÉLECTEURS */}
        <div className="flex flex-col gap-2 pt-1">
            
            {/* Couleurs (Avec logique de survol) */}
            {colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => {
                   const bg = getColorStyle(c);
                   const isLight = bg === '#FFFFFF' || bg === '#FDE68A' || bg === '#FBCFE8' || bg === '#93C5FD' || bg === '#6EE7B7';
                   
                   return (
                    <button
                        key={c}
                        // AU SURVOL : On change l'image
                        onMouseEnter={() => handleColorHover(c)}
                        // AU CLIC : On sélectionne la couleur ET on fixe l'image
                        onClick={(e) => { 
                            e.preventDefault(); 
                            setColor(c);
                            handleColorHover(c); 
                        }}
                        className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform cursor-pointer flex items-center justify-center ${color === c ? 'ring-1 ring-offset-1 ring-black scale-110' : 'hover:scale-110'}`}
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
            
            {/* Tailles (Pas de changement, toujours fonctionnel) */}
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