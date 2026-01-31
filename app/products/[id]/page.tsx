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

  // --- LA CORRECTION EST ICI ---
  // On crée un nouvel objet "propre" pour le client
  const serializedProduct = {
    ...product,
    price: product.price.toNumber() // On transforme le Decimal en Number
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* On envoie l'objet sérialisé */}
        <ProductClient product={serializedProduct} />
      </div>
    </div>
  )
}