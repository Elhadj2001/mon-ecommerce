'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number | null
  images: { url: string; color?: string | null }[]
  sizes: string[]
  colors: string[]
  stock: number
  isArchived: boolean
  isFeatured: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
  description: string
  gender: string
}

interface Category {
  id: string
  name: string
  products: Product[]
}

interface Props {
  newArrivals: Product[]
  promotions: Product[]
  categories: Category[]
}

function SectionHeader({ title, subtitle, cta, ctaHref }: {
  title: string
  subtitle?: string
  cta?: string
  ctaHref?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="flex items-end justify-between mb-8 pb-6 border-b border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        {subtitle && (
          <p className="text-[9px] tracking-[0.5em] text-[#c9a84c] uppercase font-bold mb-2">
            {subtitle}
          </p>
        )}
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
          {title}
        </h2>
      </div>
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-[#c9a84c] transition-colors duration-300 hidden sm:inline-block"
        >
          {cta} →
        </Link>
      )}
    </motion.div>
  )
}

function ProductCarousel({ title, subtitle, products, ctaHref }: {
  title: string
  subtitle?: string
  products: Product[]
  ctaHref?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        cta="Voir tout"
        ctaHref={ctaHref || '/products'}
      />
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory items-stretch">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className="w-[42%] sm:w-[30%] md:w-[23%] lg:w-[19%] flex-none snap-start"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard data={product} />
            </motion.div>
          ))}
        </div>
        {/* Fade gradient droit */}
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </section>
  )
}

export default function ProductsCollection({ newArrivals, promotions, categories }: Props) {
  return (
    <section id="collection" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 space-y-28">

      {/* 1. Nouveautés */}
      {newArrivals.length > 0 && (
        <ProductCarousel
          title="Nouveautés"
          subtitle="Derniers arrivages"
          products={newArrivals}
          ctaHref="/products?sort=new"
        />
      )}

      {/* 2. Promotions */}
      {promotions.length > 0 && (
        <ProductCarousel
          title="Offres Spéciales"
          subtitle="Nos meilleures réductions"
          products={promotions}
          ctaHref="/products?isPromo=true"
        />
      )}

      {/* 3. Par catégories */}
      {categories.map(cat => (
        <CategorySection key={cat.id} category={cat} />
      ))}
    </section>
  )
}

function CategorySection({ category }: { category: Category }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref}>
      <SectionHeader
        title={category.name}
        cta="Voir tout"
        ctaHref={`/category/${category.id}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {category.products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductCard data={product} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
