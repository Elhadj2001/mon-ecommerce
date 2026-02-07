'use client'

import { Product } from '@prisma/client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Truck, ShieldCheck, ShoppingBag, Check, AlertCircle, XCircle } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/currency' // <-- Import

interface ProductClientProps {
  product: Product & {
    images: { url: string; color?: string | null }[]
  }
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
  'vert': '#008000', 'green': '#008000', 'jaune': '#FFFF00', 'yellow': '#FFFF00',
  'rose': '#FFC0CB', 'pink': '#FFC0CB', 'gris': '#808080', 'grey': '#808080',
  'violet': '#800080', 'purple': '#800080', 'orange': '#FFA500',
  'marron': '#8B4513', 'brown': '#8B4513', 'beige': '#F5F5DC',
  'marine': '#000080', 'navy': '#000080', 'kaki': '#F0E68C',
  'or': '#FFD700', 'gold': '#FFD700', 'argent': '#C0C0C0', 'silver': '#C0C0C0'
}

export default function ProductClient({ product }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [mainImage, setMainImage] = useState(product.images[0]?.url)
  const cart = useCart()

  // --- 1. LOGIQUE DE STOCK ---
  const stock = Number(product.stock)
  const isOutOfStock = stock === 0
  const isLowStock = stock > 0 && stock <= 5
  // ---------------------------

  useEffect(() => {
    if (selectedColor) {
      const matchingImage = product.images.find(img => img.color === selectedColor)
      if (matchingImage) {
        setMainImage(matchingImage.url)
      }
    }
  }, [selectedColor, product.images])

  const getColorStyle = (c: string) => {
    if (!c) return 'transparent';
    if (c.startsWith('#')) return c;
    const lowerC = c.toLowerCase();
    return colorMap[lowerC] || c;
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return

    if (product.sizes.length > 0 && !selectedSize) return alert('Veuillez choisir une taille')
    if (product.colors.length > 0 && !selectedColor) return alert('Veuillez choisir une couleur')

    cart.addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price), // On garde EUR pour le panier
      images: [mainImage], 
      quantity: 1,
      selectedSize: selectedSize,
      selectedColor: selectedColor
    })
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 items-start">
          
          {/* GALERIE IMAGES */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[550px] scrollbar-hide py-2 md:py-0">
              {product.images.map((img) => (
                <div 
                  key={img.url}
                  onMouseEnter={() => setMainImage(img.url)}
                  onClick={() => setMainImage(img.url)}
                  className={`
                    relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                    ${mainImage === img.url ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}
                  `}
                >
                  <img 
                    src={img.url} 
                    alt="Miniature" 
                    className={`object-cover w-full h-full bg-gray-50 ${isOutOfStock ? 'grayscale' : ''}`} 
                  />
                </div>
              ))}
            </div>

            <div className="relative bg-gray-50 rounded-2xl overflow-hidden flex-1 aspect-square md:aspect-[4/5] max-h-[550px] border border-gray-100 shadow-sm">
              <Image 
                src={mainImage || '/placeholder.png'}
                alt={product.name}
                fill
                className={`object-contain p-4 transition-all duration-500 ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
                   <span className="bg-black text-white px-6 py-3 text-lg font-bold uppercase tracking-[0.2em] transform -rotate-12 shadow-xl border-4 border-white">
                     Épuisé
                   </span>
                </div>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="mt-10 lg:mt-0 lg:col-span-5 flex flex-col h-full">
            <div className="flex-1">
              <nav aria-label="Breadcrumb" className="mb-2">
                 <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Premium Collection</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 uppercase leading-tight">
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-4">
                {/* PRIX FORMATÉ EN FCFA */}
                <p className="text-3xl font-medium text-gray-900">{formatPrice(product.price)}</p>
                
                {isOutOfStock ? (
                    <span className="text-red-600 text-xs font-bold px-3 py-1 bg-red-50 rounded-full flex items-center gap-1.5 border border-red-100">
                      <XCircle size={14} /> Rupture de stock
                    </span>
                ) : isLowStock ? (
                    <span className="text-orange-600 text-xs font-bold px-3 py-1 bg-orange-50 rounded-full flex items-center gap-1.5 border border-orange-100 animate-pulse">
                      <AlertCircle size={14} /> Stock Faible : Plus que {stock} !
                    </span>
                ) : (
                    <span className="text-green-600 text-xs font-bold px-3 py-1 bg-green-50 rounded-full flex items-center gap-1.5 border border-green-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En stock
                    </span>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Description</h3>
                <div className="mt-3 text-sm text-gray-600 leading-relaxed italic">
                  {product.description}
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {product.colors.length > 0 && (
                  <div className={isOutOfStock ? 'opacity-50 pointer-events-none grayscale' : ''}>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Couleurs disponibles</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => {
                        const bg = getColorStyle(color);
                        const isLight = ['#FFFFFF', 'white', '#FDE68A', '#FBCFE8'].includes(bg.toUpperCase());

                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            disabled={isOutOfStock}
                            className={`h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center ${
                              selectedColor === color 
                              ? 'border-black scale-110 shadow-lg' 
                              : 'border-transparent hover:scale-105 shadow-sm'
                            }`}
                            style={{ backgroundColor: bg }}
                            title={color}
                          >
                            {selectedColor === color && (
                              <Check className={`h-5 w-5 ${isLight ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {product.sizes.length > 0 && (
                  <div className={isOutOfStock ? 'opacity-50 pointer-events-none grayscale' : ''}>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Choisir la taille</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={`py-2.5 text-xs font-bold uppercase rounded-lg border-2 transition-all ${
                            selectedSize === size
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`
                    flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-bold transition-all shadow-2xl
                    ${isOutOfStock 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                    }
                  `}
                >
                  {isOutOfStock ? (
                      <>
                        <XCircle className="mr-3 h-5 w-5" />
                        Produit Épuisé
                      </>
                  ) : (
                      <>
                        <ShoppingBag className="mr-3 h-5 w-5" />
                        Ajouter au panier
                      </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                    <div className="p-2 bg-gray-50 rounded-lg text-black"><Truck size={18} /></div>
                    <span className="text-[10px] leading-tight font-bold uppercase tracking-tighter">Livraison Express<br/><span className="text-gray-400 font-medium tracking-normal">Sous 48h</span></span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                    <div className="p-2 bg-gray-50 rounded-lg text-black"><ShieldCheck size={18} /></div>
                    <span className="text-[10px] leading-tight font-bold uppercase tracking-tighter">Paiement Sécurisé<br/><span className="text-gray-400 font-medium tracking-normal">Certifié SSL</span></span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}