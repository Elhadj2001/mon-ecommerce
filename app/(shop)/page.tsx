import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import ClientHeroSection from '@/components/ClientHeroSection'
import StatsSection from '@/components/home/StatsSection'
import MarqueeSection from '@/components/home/MarqueeSection'
import BrandStory from '@/components/home/BrandStory'
import CategoryShowcase from '@/components/home/CategoryShowcase'
import ProductsCollection from '@/components/home/ProductsCollection'

export const revalidate = 0

export default async function Home() {

  const newArrivals = await prisma.product.findMany({
    take: 8,
    where: { isArchived: false },
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  })

  const potentialPromotions = await prisma.product.findMany({
    take: 20,
    where: { 
      isArchived: false,
      originalPrice: { not: null } 
    },
    include: { images: true }
  })

  const promotions = potentialPromotions.filter(product => {
     return product.originalPrice && product.originalPrice.toNumber() > product.price.toNumber()
  }).slice(0, 8)

  const categories = await prisma.category.findMany({
    include: {
      products: {
        take: 4, 
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
        include: { images: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const activeCategories = categories.filter(cat => cat.products.length > 0)

  // Sérialiser les données Decimal pour les passer aux composants client
  const serializeProduct = (p: any) => ({
    ...p,
    price: p.price.toNumber(),
    originalPrice: p.originalPrice ? p.originalPrice.toNumber() : null,
  })

  const serializedNewArrivals = newArrivals.map(serializeProduct)
  const serializedPromotions = promotions.map(serializeProduct)
  const serializedCategories = activeCategories.map(cat => ({
    ...cat,
    products: cat.products.map(serializeProduct)
  }))

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* ── 1. HERO CINÉMATIQUE ── */}
      <ClientHeroSection />

      {/* ── 2. MARQUEE BRAND ── */}
      <MarqueeSection />

      {/* ── 3. STATS SECTION ── */}
      <StatsSection />

      {/* ── 4. BRAND STORY ── */}
      <BrandStory />

      {/* ── 5. COLLECTION / CAROUSELS ── */}
      <ProductsCollection
        newArrivals={serializedNewArrivals}
        promotions={serializedPromotions}
        categories={serializedCategories}
      />

      {/* ── 6. CATEGORY SHOWCASE ── */}
      <CategoryShowcase categories={serializedCategories} />

    </main>
  )
}