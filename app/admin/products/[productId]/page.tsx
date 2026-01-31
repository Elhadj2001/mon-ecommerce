import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image" // Optionnel, si tu utilises next/image

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true, // On récupère les images
      category: true
    }
  })

  if (!product) {
    return notFound()
  }

  // CORRECTION : On s'assure que c'est bien des tableaux
  const sizes = product.sizes || []
  const colors = product.colors || []

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          
          {/* GALERIE IMAGES */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 border">
               {/* CORRECTION IMAGE : On cible .url */}
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img
                 src={product.images?.[0]?.url || "/placeholder.png"}
                 alt={product.name}
                 className="h-full w-full object-cover object-center"
               />
            </div>
            {/* Miniatures */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image) => (
                <div key={image.id} className="aspect-square relative overflow-hidden rounded-md bg-gray-100 border cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="Variante" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* DETAILS PRODUIT */}
          <div className="lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{product.name}</h1>
            
            <div className="mt-4">
              <p className="text-3xl tracking-tight text-gray-900">{Number(product.price).toFixed(2)} €</p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-4 space-y-6">
                <p className="text-base text-gray-600">{product.description}</p>
              </div>
            </div>

            <div className="mt-8">
              {/* TAILLES */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tailles</h3>
                <div className="flex flex-wrap gap-2">
                   {/* CORRECTION : On map directement sur le tableau sizes */}
                   {sizes.map((size) => (
                     <div key={size} className="px-4 py-2 border rounded-md text-sm font-semibold hover:border-black cursor-pointer">
                       {size}
                     </div>
                   ))}
                </div>
              </div>

              {/* COULEURS */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Couleurs</h3>
                <div className="flex flex-wrap gap-2">
                   {colors.map((color) => (
                     <div 
                        key={color} 
                        className="px-4 py-2 border rounded-full text-sm hover:ring-2 ring-black cursor-pointer bg-gray-50"
                        title={color}
                      >
                       {color}
                     </div>
                   ))}
                </div>
              </div>

              <button className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                Ajouter au panier
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}