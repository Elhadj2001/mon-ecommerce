'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  products: {
    images: { url: string }[]
  }[]
}

const IMAGES = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
]

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (categories.length === 0) return null

  return (
    <section ref={ref} className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[9px] tracking-[0.5em] text-[#c9a84c] uppercase font-bold mb-3">
            Explorer
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
            Nos <span className="text-gradient-gold">catégories</span>
          </h2>
        </motion.div>

        {/* Grille magazine asymétrique */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {/* Grande image gauche */}
          {categories[0] && (
            <motion.div
              className="col-span-2 md:col-span-2 row-span-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <CategoryCard
                category={categories[0]}
                image={IMAGES[0]}
                large
              />
            </motion.div>
          )}

          {/* Petites images droite */}
          {categories.slice(1, 3).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 * (i + 1), ease: [0.16, 1, 0.3, 1] }}
            >
              <CategoryCard
                category={cat}
                image={IMAGES[i + 1]}
              />
            </motion.div>
          ))}

          {/* Ligne du bas */}
          {categories.slice(3, 6).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 * (i + 3), ease: [0.16, 1, 0.3, 1] }}
            >
              <CategoryCard
                category={cat}
                image={IMAGES[i + 3] || IMAGES[0]}
              />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  image,
  large = false
}: {
  category: Category
  image: string
  large?: boolean
}) {
  return (
    <Link
      href={`/category/${category.id}`}
      className={`group relative block overflow-hidden bg-secondary ${large ? 'h-[400px] md:h-[520px]' : 'h-[200px] md:h-[250px]'}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.products[0]?.images[0]?.url || image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-[#09090b]/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

      {/* Contenu */}
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <p className="text-[9px] tracking-[0.4em] text-[#c9a84c] uppercase font-bold mb-2">
          {category.products.length} pièces
        </p>
        <h3 className={`font-black tracking-tighter text-white uppercase ${large ? 'text-3xl md:text-4xl' : 'text-xl'} mb-3`}>
          {category.name}
        </h3>
        <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Découvrir</span>
          <ArrowRight size={12} />
        </div>
      </div>

      {/* Badge doré */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-8 h-8 border border-[#c9a84c]/60 flex items-center justify-center">
          <span className="text-[#c9a84c] text-[10px]">→</span>
        </div>
      </div>
    </Link>
  )
}
