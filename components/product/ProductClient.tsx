'use client'

import { useState } from "react"
import { ShoppingBag, Check, Minus, Plus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Product, Image as ImageType, Category } from "@prisma/client"
import Image from "next/image"

// Dictionnaire couleurs
const colorMap: Record<string, string> = {
  'noir': 'black', 'blanc': 'white', 'rouge': 'red', 'bleu': 'blue',
  'vert': 'green', 'jaune': 'yellow', 'rose': 'pink', 'gris': 'gray',
  'violet': 'purple', 'orange': 'orange', 'marron': '#8B4513',
  'beige': '#F5F5DC', 'bordeaux': '#800000', 'marine': '#000080',
  'kaki': '#F0E68C'
}

interface ProductClientProps {
  product: Omit<Product, 'price'> & {
    price: number;
    images: ImageType[];
    category: Category;
  }
}

export default function ProductClient({ product }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const cart = useCart()

  const sizes = product.sizes || []
  const colors = product.colors || []
  
  const [mainImage, setMainImage] = useState(product.images?.[0]?.url || '/placeholder.png')

  const cartItem = cart.items.find((item) => item.id === product.id)
  const quantityInCart = cartItem ? cartItem.quantity : 0
  const remainingStock = product.stock - quantityInCart

  const getColorStyle = (c: string) => {
     if (c.startsWith('#')) return c;
     return colorMap[c.toLowerCase()] || c;
  }

  const onAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) return alert("Choisis une taille !")
    if (colors.length > 0 && !selectedColor) return alert("Choisis une couleur !")
    if (quantity > remainingStock) return alert("Stock insuffisant.")

    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images.map(img => img.url),
      quantity: quantity,
      selectedSize: selectedSize,
      selectedColor: selectedColor
    })
  }

  const increaseQty = () => { if(quantity < remainingStock) setQuantity(q => q + 1) }
  const decreaseQty = () => { if(quantity > 1) setQuantity(q => q - 1) }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
      
      {/* --- COLONNE GAUCHE : IMAGES --- */}
      <div className="flex flex-col gap-6">
        
        {/* CADRE IMAGE PRINCIPALE (Standard Pro) */}
        {/* On force une hauteur max de 70vh (70% de l'écran) pour éviter que ça soit géant */}
        <div className="relative w-full rounded-xl bg-gray-50 border overflow-hidden aspect-[3/4] lg:aspect-auto lg:h-[70vh]">
           <Image
             src={mainImage}
             alt={product.name}
             fill
             // object-contain : L'image entière est visible sans être coupée
             className="object-contain object-center mix-blend-multiply p-4" 
             priority
           />
        </div>

        {/* Miniatures (Centrées et limitées en largeur) */}
        {product.images.length > 1 && (
          <div className="mx-auto w-full max-w-md">
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image) => (
                <button 
                  key={image.id} 
                  onClick={() => setMainImage(image.url)}
                  className={`aspect-square relative overflow-hidden rounded-lg bg-gray-50 border cursor-pointer hover:opacity-75 transition
                    ${mainImage === image.url ? 'ring-2 ring-black ring-offset-1' : ''}
                  `}
                >
                  <Image 
                      src={image.url} 
                      alt="Vue produit" 
                      fill 
                      className="object-cover object-center" 
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- COLONNE DROITE : INFOS (Sticky) --- */}
      {/* 'sticky top-10' permet au bloc de suivre le scroll si l'image est très haute */}
      <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:sticky lg:top-8 h-fit">
        <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase sm:text-4xl">
                {product.name}
            </h1>
            <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-medium text-gray-900">
                    {product.price.toFixed(2)} €
                </p>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-800">
                    {product.category.name}
                </span>
            </div>
        </div>

        <div className="py-6 border-t border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <p className="mt-4 text-base text-gray-500 leading-relaxed text-justify">
                {product.description}
            </p>
        </div>

        <div className="mt-8 space-y-8">
            {/* SÉLECTEURS */}
            <div className="space-y-6">
                {/* Tailles */}
                {sizes.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900">Taille</h3>
                        {selectedSize && <span className="text-xs font-bold text-gray-500">{selectedSize}</span>}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {sizes.map((size) => (
                        <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-sm font-bold uppercase rounded-md border transition-all
                            ${selectedSize === size 
                                ? 'bg-black text-white border-black ring-1 ring-black' 
                                : 'bg-white text-gray-900 border-gray-200 hover:border-black'}`}
                        >
                        {size}
                        </button>
                    ))}
                    </div>
                </div>
                )}

                {/* Couleurs */}
                {colors.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900">Couleur</h3>
                        {selectedColor && <span className="text-xs font-bold text-gray-500 capitalize">{selectedColor}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3">
                    {colors.map((c) => {
                        const bg = getColorStyle(c)
                        return (
                        <button 
                            key={c} 
                            onClick={() => setSelectedColor(c)}
                            className={`relative w-12 h-12 rounded-full border shadow-sm transition-all flex items-center justify-center
                            ${selectedColor === c ? 'ring-2 ring-offset-2 ring-black scale-105' : 'hover:scale-105 border-gray-200'}
                            `}
                            style={{ backgroundColor: bg }}
                            title={c}
                        >
                            {selectedColor === c && (
                                <Check className={`w-5 h-5 ${bg === 'white' || bg === '#ffffff' ? 'text-black' : 'text-white'}`} />
                            )}
                        </button>
                        )
                    })}
                    </div>
                </div>
                )}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-4">
                {/* Quantité */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Quantité</span>
                    <div className="flex items-center rounded-lg border border-gray-300">
                        <button onClick={decreaseQty} className="px-3 py-2 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50" disabled={quantity <= 1}>
                            <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                        <button onClick={increaseQty} className="px-3 py-2 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-50" disabled={quantity >= remainingStock}>
                            <Plus size={16} />
                        </button>
                    </div>
                    {remainingStock < 5 && remainingStock > 0 && (
                        <span className="text-xs text-orange-600 font-medium">Plus que {remainingStock} en stock !</span>
                    )}
                </div>

                {/* Bouton Panier */}
                <button 
                    onClick={onAddToCart}
                    disabled={remainingStock <= 0}
                    className="w-full flex items-center justify-center gap-3 rounded-full bg-black px-8 py-4 text-base font-bold text-white hover:bg-gray-800 transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                    <ShoppingBag className="w-5 h-5" />
                    {remainingStock <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}