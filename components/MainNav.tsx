import { prisma } from '@/lib/prisma'
import CategoryMenu from './CategoryMenu'

export default async function MainNav() {
  // On récupère les catégories depuis la BDD
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <nav className="mx-6 hidden md:block">
      {/* On passe les données au composant Client */}
      <CategoryMenu categories={categories} />
    </nav>
  )
}