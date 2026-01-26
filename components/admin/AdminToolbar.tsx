'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@prisma/client'

interface AdminToolbarProps {
  categories: Category[]
}

export default function AdminToolbar({ categories }: AdminToolbarProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // Fonction unique pour mettre à jour l'URL
  const handleSearch = (term: string, type: 'query' | 'categoryId') => {
    const params = new URLSearchParams(searchParams)
    
    // Si on change la recherche ou la catégorie, on revient à la page 1
    params.set('page', '1')

    if (term) {
      params.set(type, term)
    } else {
      params.delete(type)
    }

    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border">
      {/* 1. BARRE DE RECHERCHE */}
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">Rechercher</label>
        <input
          id="search"
          type="text"
          placeholder="Rechercher un produit..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          onChange={(e) => handleSearch(e.target.value, 'query')}
          defaultValue={searchParams.get('query')?.toString()}
        />
      </div>

      {/* 2. FILTRE CATÉGORIE */}
      <div className="w-full sm:w-64">
        <select
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer bg-white"
          onChange={(e) => handleSearch(e.target.value, 'categoryId')}
          defaultValue={searchParams.get('categoryId')?.toString()}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}