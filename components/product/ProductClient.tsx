'use client'

import { Product } from '@prisma/client'
import { useState, useEffect } from 'react'
import { CustomImage } from '@/components/ui/CustomImage'
import { Truck, ShieldCheck, ShoppingBag, Check, AlertCircle, XCircle, ArrowRightLeft, Droplets } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/currency'
import { motion, AnimatePresence } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface ProductClientProps {
  product: Product & {
    images: { url: string; color?: string | null }[]
    category: { name: string }
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

  // Initialisation automatique de la taille si uen seule taille dispo
  useEffect(() => {
    if (product.sizes.length === 1 && !selectedSize) {
      setSelectedSize(product.sizes[0])
    }
  }, [product.sizes])

  // --- LOGIQUE DE STOCK ---
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
      price: Number(product.price),
      images: [mainImage], 
      quantity: 1,
      stock: stock,
      selectedSize: selectedSize,
      selectedColor: selectedColor
    })
    
    // Ouvre immédiatement le panier
    cart.onOpen()
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* LAYOUT 2 COLONNES AVEC STICKY RIGHT */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start relative">
          
          {/* COLONNE GAUCHE (SCROLLABLE) : GALERIE IMAGES */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24">
            {/* Miniatures */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[700px] scrollbar-hide py-2 md:py-0 w-full md:w-20 lg:w-24 shrink-0">
              {product.images.map((img) => (
                <button 
                  key={img.url}
                  onClick={() => setMainImage(img.url)}
                  className={`
                    relative w-16 h-20 md:w-full md:h-24 lg:h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                    ${mainImage === img.url ? 'border-foreground shadow-md ring-2 ring-foreground ring-offset-2' : 'border-transparent opacity-60 hover:opacity-100 bg-secondary'}
                  `}
                >
                  <CustomImage 
                    src={img.url} 
                    alt="Miniature" 
                    fill
                    className={`object-cover ${isOutOfStock ? 'grayscale' : ''}`} 
                  />
                </button>
              ))}
            </div>

            {/* Image Principale animée */}
            <div className="relative bg-secondary/50 rounded-2xl overflow-hidden flex-1 aspect-[4/5] min-h-[400px] md:min-h-[600px] lg:h-[700px] border border-border shadow-sm">
              <AnimatePresence mode="wait">
                  <motion.div
                    key={mainImage}
                    initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ opacity: 0, filter: 'blur(5px)', scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <CustomImage 
                        src={mainImage || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className={`object-cover p-2 md:p-4 ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
              </AnimatePresence>

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-10">
                   <span className="bg-foreground text-background px-6 py-3 text-lg font-bold uppercase tracking-[0.2em] transform -rotate-6 shadow-2xl border-4 border-background">
                     Épuisé
                   </span>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE (STICKY) : INFOS, PRIX, SÉLECTEURS, BOUTON */}
          <div className="mt-10 lg:mt-0 lg:col-span-5 flex flex-col h-full sticky top-24 pt-4 pb-20">
            <div className="flex-1">
              
              {/* Fil d'ariane & Titre */}
              <nav aria-label="Breadcrumb" className="mb-4">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                     Collection • {product.gender} • {product.category?.name}
                 </span>
              </nav>

              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase leading-[1.1]">
                {product.name}
              </h1>
              
              {/* Prix & Badges */}
              <div className="mt-4 flex flex-col items-start gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    {product.originalPrice ? (
                       <div className="flex items-end gap-3">
                           <span className="text-4xl font-black text-destructive">{formatPrice(Number(product.price))}</span>
                           <span className="text-xl font-medium text-muted-foreground line-through mb-1">{formatPrice(Number(product.originalPrice))}</span>
                       </div>
                    ) : (
                       <span className="text-4xl font-black text-foreground">{formatPrice(Number(product.price))}</span>
                    )}
                </div>
                
                {isOutOfStock ? (
                    <span className="text-destructive text-xs font-bold px-3 py-1 bg-destructive/10 rounded-full flex items-center gap-1.5 border border-destructive/20">
                      <XCircle size={14} /> En rupture de stock
                    </span>
                ) : isLowStock ? (
                    <span className="text-amber-600 text-xs font-bold px-3 py-1 bg-amber-50 rounded-full flex items-center gap-1.5 border border-amber-200 animate-pulse">
                      <AlertCircle size={14} /> Attention, presque épuisé ! Exclisivité ({stock} restants)
                    </span>
                ) : (
                    <span className="text-emerald-600 text-xs font-bold px-3 py-1 bg-emerald-50 rounded-full flex items-center gap-1.5 border border-emerald-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Produit en stock
                    </span>
                )}
              </div>

              {/* Sélection des options */}
              <div className="mt-8 space-y-8">
                
                {/* Couleurs */}
                {product.colors.length > 0 && (
                  <div className={isOutOfStock ? 'opacity-40 pointer-events-none grayscale' : ''}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Couleur sélectionnée</h3>
                        {selectedColor && <span className="text-xs text-muted-foreground capitalize font-medium">{selectedColor}</span>}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color) => {
                        const bg = getColorStyle(color);
                        const isLight = ['#FFFFFF', 'white', '#FDE68A', '#FBCFE8'].includes(bg.toUpperCase());

                        return (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            disabled={isOutOfStock}
                            className={`h-12 w-12 rounded-full border-2 transition-all flex items-center justify-center relative ${
                              selectedColor === color 
                              ? 'border-foreground ring-2 ring-foreground ring-offset-2' 
                              : 'border-border hover:border-muted-foreground'
                            }`}
                            style={{ backgroundColor: bg }}
                            title={color}
                            aria-label={`Sélectionner la couleur ${color}`}
                          >
                            {selectedColor === color && (
                              <Check className={`h-6 w-6 absolute ${isLight ? 'text-black' : 'text-white'}`} />
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tailles */}
                {product.sizes.length > 0 && (
                  <div className={isOutOfStock ? 'opacity-40 pointer-events-none grayscale' : ''}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Taille</h3>
                        <button className="text-[10px] uppercase font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">Guide des tailles</button>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={`
                            py-3 text-sm font-bold uppercase rounded-lg border-2 transition-all active:scale-95
                            ${selectedSize === size
                              ? 'bg-foreground text-background border-foreground shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] ring-1 ring-offset-1 ring-foreground dark:shadow-none'
                              : 'bg-background text-foreground border-border hover:border-foreground/50'}
                          `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton d'ajout */}
                <motion.button
                  whileHover={!isOutOfStock ? { scale: 1.01, y: -2 } : {}}
                  whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`
                    flex w-full items-center justify-center rounded-2xl px-8 py-5 text-lg font-black transition-all shadow-xl uppercase tracking-widest overflow-hidden relative group
                    ${isOutOfStock 
                        ? 'bg-secondary text-muted-foreground cursor-not-allowed shadow-none'
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }
                  `}
                >
                  {/* Effet brillant sur le bouton */}
                  {!isOutOfStock && (
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  )}

                  {isOutOfStock ? (
                      <>
                        <XCircle className="mr-3 h-5 w-5" />
                        Épuisé
                      </>
                  ) : (
                      <>
                        <ShoppingBag className="mr-3 h-6 w-6 relative z-10" />
                        <span className="relative z-10">Ajouter au panier</span>
                      </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* INFORMATIONS EN ACCORDÉONS (Radix UI) */}
            <div className="mt-12 w-full">
               <Accordion type="single" collapsible className="w-full" defaultValue="description">
                 <AccordionItem value="description">
                    <AccordionTrigger>Détails du produit</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                        {product.description}
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="delivery">
                    <AccordionTrigger>Livraison & Retours</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <Truck className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                            <p className="text-muted-foreground leading-relaxed">
                                Livraison standard gratuite sous 3-5 jours ouvrables. Livraison express disponible lors du paiement (24-48h).
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <ArrowRightLeft className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                            <p className="text-muted-foreground leading-relaxed">
                                Retours gratuits sous 30 jours, dans l'emballage d'origine. Les étiquettes ne doivent pas avoir été retirées.
                            </p>
                        </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="care">
                    <AccordionTrigger>Composition & Entretien</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <Droplets className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                            <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
                                <li>Lavage en machine à froid (30° maximum)</li>
                                <li>Ne pas blanchir, Laver les couleurs foncées séparément</li>
                                <li>Ne pas sécher en machine. Repassage doux à l'envers.</li>
                            </ul>
                        </div>
                    </AccordionContent>
                 </AccordionItem>
               </Accordion>
            </div>
            
            {/* Badges de réassurance */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
                <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-xl text-center">
                    <ShieldCheck size={28} className="text-foreground mb-2" />
                    <span className="text-[10px] leading-tight font-black uppercase tracking-widest text-foreground">
                        Paiement 100% Sécurisé<br/>
                        <span className="text-muted-foreground font-medium tracking-normal normal-case">Stripe & SSL</span>
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-xl text-center">
                    <Truck size={28} className="text-foreground mb-2" />
                    <span className="text-[10px] leading-tight font-black uppercase tracking-widest text-foreground">
                        Expédition Rapide<br/>
                        <span className="text-muted-foreground font-medium tracking-normal normal-case">Partout dans le monde</span>
                    </span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}