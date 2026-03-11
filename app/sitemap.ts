import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mon-ecommerce-rho.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Pages Produits
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    select: { id: true, updatedAt: true },
  })

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Pages Catégories
  const categories = await prisma.category.findMany({
    select: { id: true, updatedAt: true },
  })

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.id}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
