'use client'

import Link from "next/link"
import { Category } from "@prisma/client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface CategoryMenuProps {
  categories: Category[]
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // 1. LOGIQUE DE TRI : On garde les 4 premières pour le menu principal, le reste dans "Collections"
  const DISPLAY_LIMIT = 4
  const primaryCategories = categories.slice(0, DISPLAY_LIMIT)
  const moreCategories = categories.slice(DISPLAY_LIMIT)

  // Fonction pour fermer le menu
  const closeMenu = () => setActiveCategory(null)

  return (
    <div className="flex h-full items-center gap-8" onMouseLeave={closeMenu}>
      
      {/* --- A. LES CATÉGORIES PRINCIPALES (Avec filtre Genre au survol) --- */}
      {primaryCategories.map((cat) => (
        <div 
          key={cat.id}
          className="relative h-full flex items-center group"
          onMouseEnter={() => setActiveCategory(cat.id)}
        >
          {/* Lien Principal (ex: SNEAKERS) */}
          <Link 
            href={`/category/${cat.id}`}
            className={`
              text-sm font-bold tracking-widest uppercase py-2 border-b-2 transition-all flex items-center gap-1
              ${activeCategory === cat.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}
            `}
          >
            {cat.name}
            <ChevronDown size={14} className={`transition-transform duration-300 ${activeCategory === cat.id ? 'rotate-180' : ''}`} />
          </Link>

          {/* DROPDOWN SIMPLE (Homme / Femme) */}
          <div 
            className={`
              absolute top-full left-0 w-48 bg-white shadow-xl border border-gray-100 rounded-b-lg overflow-hidden transition-all duration-200 z-50
              ${activeCategory === cat.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
            `}
          >
             <div className="flex flex-col py-2">
                <Link 
                    href={`/category/${cat.id}?gender=Homme`} 
                    onClick={closeMenu}
                    className="px-6 py-3 text-sm hover:bg-gray-50 hover:text-black text-gray-600 transition flex justify-between group/link"
                >
                    Homme <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                </Link>
                <Link 
                    href={`/category/${cat.id}?gender=Femme`} 
                    onClick={closeMenu}
                    className="px-6 py-3 text-sm hover:bg-gray-50 hover:text-black text-gray-600 transition flex justify-between group/link"
                >
                    Femme <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                </Link>
                <div className="h-px bg-gray-100 my-1 mx-4" />
                <Link 
                    href={`/category/${cat.id}`} 
                    onClick={closeMenu}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-50"
                >
                    Tout voir
                </Link>
             </div>
          </div>
        </div>
      ))}

      {/* --- B. LE MENU "COLLECTIONS" (Pour le reste) --- */}
      {moreCategories.length > 0 && (
        <div 
          className="relative h-full flex items-center"
          onMouseEnter={() => setActiveCategory('collections')}
        >
          <button 
            className={`
              text-sm font-bold tracking-widest uppercase py-2 border-b-2 transition-all flex items-center gap-1
              ${activeCategory === 'collections' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}
            `}
          >
            Collections
            <ChevronDown size={14} />
          </button>

          {/* DROPDOWN DES AUTRES CATÉGORIES */}
          <div 
            className={`
              absolute top-full right-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-lg overflow-hidden transition-all duration-200 z-50
              ${activeCategory === 'collections' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
            `}
          >
             <ul className="py-2">
                {moreCategories.map((cat) => (
                    <li key={cat.id}>
                        <Link 
                            href={`/category/${cat.id}`}
                            onClick={closeMenu}
                            className="block px-6 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition"
                        >
                            {cat.name}
                        </Link>
                    </li>
                ))}
             </ul>
          </div>
        </div>
      )}

    </div>
  )
}