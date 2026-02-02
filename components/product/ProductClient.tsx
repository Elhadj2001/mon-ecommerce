'use client'

import { Product, Image as ImageType } from '@prisma/client'
import { useState } from 'react'
import Image from 'next/image'
import { Truck, ShieldCheck, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface ProductClientProps {
  product: Product & {
    images: ImageType[]
  }
}

// --- DICTIONNAIRE DE COULEURS NETTOYÉ ---
// (Doublons supprimés, une seule définition par nom)
const colorMap: Record<string, string> = {
  // 1. Les couleurs spécifiques (Prioritaires)
  'noir mat': '#171717',
  'blanc pur': '#FFFFFF',
  'gris chiné': '#9CA3AF',
  'anthracite': '#374151',
  'bleu marine': '#1E3A8A',
  'bleu roi': '#2563EB',
  'bleu ciel': '#93C5FD',
  'rouge vif': '#EF4444',
  'bordeaux': '#7F1D1D', // Unique définition (Rouge sombre riche)
  'vert forêt': '#064E3B',
  'vert kaki': '#78716C',
  'vert menthe': '#6EE7B7',
  'jaune moutarde': '#D97706',
  'beige sable': '#FDE68A',
  'marron glacé': '#78350F',
  'rose poudré': '#FBCFE8',
  'violet lavande': '#C4B5FD',

  // 2. Les classiques (Fallbacks)
  'noir': '#000000', 'black': '#000000',
  'blanc': '#FFFFFF', 'white': '#FFFFFF',
  'rouge': '#FF0000', 'red': '#FF0000',
  'bleu': '#0000FF', 'blue': '#0000FF',
  'vert': '#008000', 'green': '#008000',
  'jaune': '#FFFF00', 'yellow': '#FFFF00',
  'rose': '#FFC0CB', 'pink': '#FFC0CB',
  'gris': '#808080', 'grey': '#808080',
  'violet': '#800080', 'purple': '#800080',
  'orange': '#FFA500',
  'marron': '#8B4513', 'brown': '#8B4513',
  'beige': '#F5F5DC',
  'marine': '#000080', 'navy': '#000080',
  'kaki': '#F0E68C',
  'or': '#FFD700', 'gold': '#FFD700',
  'argent': '#C0C0C0', 'silver': '#C0C0C0'
}

export default function ProductClient({ product }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const cart = useCart()

  // Fonction robuste pour récupérer la couleur
  const getColorStyle = (c: string) => {
    if (!c) return 'transparent';
    if (c.startsWith('#')) return c;
    const lowerC = c.toLowerCase();
    if (colorMap[lowerC]) return colorMap[lowerC];
    return c;
  }

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) return alert('Veuillez choisir une taille')
    if (product.colors.length > 0 && !selectedColor) return alert('Veuillez choisir une couleur')

    cart.addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      images: product.images.map(img => img.url),
      quantity: 1,
      selectedSize: selectedSize,
      selectedColor: selectedColor
    })
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        
        {/* GALERIE IMAGES */}
        {/* J'ai changé 'aspect-square' pour laisser plus de liberté, et mis object-contain */}
        <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-8 lg:mb-0 min-h-[400px] lg:min-h-full">
             <Image 
                src={product.images?.[0]?.url || '/placeholder.png'}
                alt={product.name}
                fill
                // CHANGEMENT ICI : 'object-contain' affiche l'image ENTIÈRE sans couper
                className="object-contain object-center"
             />
        </div>

        {/* DETAILS PRODUIT */}
        <div className="mt-4 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase">{product.name}</h1>
          
          <div className="mt-3">
            <p className="text-3xl tracking-tight text-gray-900">{Number(product.price).toFixed(2)} €</p>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 space-y-6 text-base text-gray-500">
              {product.description}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            
            {/* SELECTION COULEUR */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Couleur : <span className="text-gray-500 font-normal capitalize">{selectedColor}</span></h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                      const bg = getColorStyle(color);
                      // Détection couleur claire pour le contraste du Check
                      const isLight = bg === '#FFFFFF' || bg === 'white' || bg === '#FDE68A' || bg === '#FBCFE8' || bg === '#93C5FD' || bg === '#6EE7B7';

                      return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-10 w-10 rounded-full border shadow-sm flex items-center justify-center transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105 border-gray-300'}`}
                        style={{ backgroundColor: bg }}
                        title={color}
                      >
                          {selectedColor === color && <Check className={isLight ? 'text-black' : 'text-white'} />}
                      </button>
                      )
                  })}
                </div>
              </div>
            )}

            {/* SELECTION TAILLE */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Taille : <span className="text-gray-500 font-normal">{selectedSize}</span></h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[40px] px-3 py-2 text-sm font-medium uppercase rounded-md border transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-900 border-gray-200 hover:border-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BOUTON AJOUT */}
            <button
              onClick={handleAddToCart}
              className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ajouter au panier
            </button>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Truck size={18} />
                    <span>Livraison rapide</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>Paiement sécurisé</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}