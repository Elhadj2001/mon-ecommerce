'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react' // Assure-toi d'avoir installé lucide-react

interface Category {
  id: string
  name: string
}

interface CategoryMenuProps {
  categories: Category[]
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique ailleurs sur la page
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // On sépare : Les 3 premières sont visibles, le reste est caché
  const featured = categories.slice(0, 3)
  const others = categories.slice(3) // Toutes les autres

  return (
    <div className="flex items-center space-x-6" ref={menuRef}>
      
      {/* 1. Les 3 catégories VIP (Visibles tout le temps) */}
      {featured.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.id}`}
          className="text-xs font-bold transition-colors hover:text-black text-gray-500 uppercase tracking-[0.2em]"
        >
          {cat.name}
        </Link>
      ))}

      {/* 2. Le Bouton "Collections" (S'il reste des catégories) */}
      {others.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isOpen ? 'text-black' : 'text-gray-500 hover:text-black'}`}
          >
            Collections
            {isOpen ? <X size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* 3. Le Panneau Déroulant (Dropdown) */}
          {isOpen && (
            <div className="absolute top-full right-0 mt-4 w-64 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-widest border-b pb-2">
                Tout voir
              </p>
              
              {/* Une grille pour ranger proprement les catégories */}
              <div className="grid grid-cols-1 gap-2">
                {others.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    onClick={() => setIsOpen(false)} // Ferme le menu au clic
                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black rounded-md transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}