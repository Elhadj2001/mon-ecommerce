import { prisma } from "@/lib/prisma"
import MobileNav from "./MobileNav"

export default async function MobileNavWrapper() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="md:hidden"> {/* Visible seulement sur mobile */}
      <MobileNav categories={categories} />
    </div>
  )
}