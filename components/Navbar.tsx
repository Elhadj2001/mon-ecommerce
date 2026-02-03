import { prisma } from "@/lib/prisma"
import NavbarClient from "./NavbarClient"

// Ce composant est un SERVER COMPONENT (pas de 'use client')
// Il a le droit d'être async et d'utiliser Prisma.
export default async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  // On passe les données au composant Client via les props
  return <NavbarClient categories={categories} />
}