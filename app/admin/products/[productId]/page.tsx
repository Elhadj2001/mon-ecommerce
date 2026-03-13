import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/ProductForm"

interface EditProductPageProps {
  params: Promise<{
    productId: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ])

  if (!product) {
    return notFound()
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm categories={categories} initialData={product} />
      </div>
    </div>
  )
}