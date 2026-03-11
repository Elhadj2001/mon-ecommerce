import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductClient from "@/components/product/ProductClient"
import ProductCard from "@/components/ProductCard"
import type { Metadata } from "next"
import { Breadcrumb } from "@/components/ui/Breadcrumb"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mon-ecommerce-rho.vercel.app'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

// --- SEO DYNAMIQUE ---
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true }
  })

  if (!product) return { title: 'Produit introuvable' }

  const imageUrl = product.images[0]?.url || ''
  const title = `${product.name} — Monsoon`
  const description = product.description?.slice(0, 160) || `Découvrez ${product.name} dans notre boutique.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/products/${product.id}`,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  // 1. Récupérer le produit actuel
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true
    }
  })

  if (!product) return notFound()

  // 2. RÉCUPÉRER LES PRODUITS SIMILAIRES (Cross-selling)
  // On cherche : Même catégorie + Même genre + Pas le produit actuel
  const suggestedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      gender: product.gender, // Filtre par genre pour la pertinence (Homme/Femme)
      id: { not: product.id }, // Ne pas afficher le produit qu'on regarde déjà
      isArchived: false
    },
    include: {
      images: true
    },
    take: 4, // On limite à 4 produits pour une ligne propre
    orderBy: {
      createdAt: 'desc'
    }
  })

  // 3. SÉRIALISATION (Conversion Decimal -> Number pour le produit principal)
  // Cela évite l'erreur "Decimal not assignable to number"
  const serializedProduct = {
    ...product,
    price: product.price.toNumber(),
    // On convertit aussi originalPrice s'il existe
    originalPrice: product.originalPrice ? product.originalPrice.toNumber() : null
  }

  return (
    <div className="bg-background">
      <div className="flex flex-col gap-y-16 pb-20">
        
        {/* A. SECTION PRODUIT PRINCIPAL */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb items={[
              { label: product.category.name, href: `/category/${product.category.id}` },
              { label: product.name }
            ]} />
          </div>
          {/* @ts-ignore */}
          <ProductClient product={serializedProduct} />
        </div>

        {/* B. SECTION "VOUS POURRIEZ AUSSI AIMER" */}
        {suggestedProducts.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <hr className="my-10 border-border" />
            
            <div className="flex flex-col gap-y-8">
              <div className="flex flex-col gap-y-1">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-gray-900">
                  Vous pourriez aussi aimer
                </h2>
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-medium">
                   Sélectionnés pour vous en {product.category.name}
                </p>
              </div>

              {/* Grille de suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {suggestedProducts.map((item) => (
                  // @ts-ignore : On convertit à la volée pour la ProductCard
                  <ProductCard 
                    key={item.id} 
                    data={{
                        ...item, 
                        price: item.price.toNumber(),
                        originalPrice: item.originalPrice ? item.originalPrice.toNumber() : null
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}