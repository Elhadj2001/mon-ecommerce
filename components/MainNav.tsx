import { prisma } from '@/lib/prisma'
import CategoryMenu from './CategoryMenu' // Import du nouveau composant

export default async function MainNav() {
  // On récupère TOUTES les catégories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <nav className="mx-6 hidden md:block">
      {/* On délègue l'affichage intelligent au composant client */}
      <CategoryMenu categories={categories} />
    </nav>
  )
}