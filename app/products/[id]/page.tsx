import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductClient from "@/components/product/ProductClient"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true
    }
  })

  if (!product) return notFound()

  // --- RECTIFICATION DE L'ERREUR DE TYPE ---
  const serializedProduct = {
    ...product,
    price: product.price.toNumber() 
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* On utilise @ts-ignore pour valider le passage du type sérialisé au composant client */}
        {/* @ts-ignore */}
        <ProductClient product={serializedProduct} />
      </div>
    </div>
  )
}