'use client'

import Link from "next/link"
import { Category } from "@prisma/client"
import { useState, useCallback, useRef } from "react"

interface CategoryMenuProps {
  categories: Category[]
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  // Position dynamique du bas de la navbar (tenant compte de la bande d'annonce)
  const [menuTop, setMenuTop] = useState(64)
  const containerRef = useRef<HTMLDivElement>(null)

  const openMenu = useCallback((gender: string) => {
    // Mesurer la position réelle du bas du header au moment où on survole
    const header = document.querySelector('header')
    if (header) {
      const rect = header.getBoundingClientRect()
      setMenuTop(rect.bottom)
    }
    setActiveMenu(gender)
  }, [])

  const closeMenu = useCallback(() => setActiveMenu(null), [])

  return (
    <div ref={containerRef} className="h-full flex items-center justify-start gap-8" onMouseLeave={closeMenu}>
      
      {/* DÉCLENCHEURS HOMME / FEMME */}
      {['Femme', 'Homme'].map((gender) => (
        <div 
          key={gender} 
          className="h-full flex items-center"
          onMouseEnter={() => openMenu(gender)}
        >
          <button 
            className={`
              text-xs xl:text-sm font-bold uppercase tracking-widest py-4 border-b-2 transition-all whitespace-nowrap
              ${activeMenu === gender
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {gender}
          </button>
        </div>
      ))}

      {/* PANNEAU DÉROULANT — position calculée dynamiquement */}
      {activeMenu && (
        <div 
          className="fixed left-0 w-full bg-background border-t border-border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: `${menuTop}px` }}
          onMouseEnter={() => openMenu(activeMenu)}
          onMouseLeave={closeMenu}
        >
          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="grid grid-cols-12 gap-8">
              
              {/* COLONNE 1 : À LA UNE */}
              <div className="col-span-3 border-r border-border pr-6">
                <h3 className="font-black text-lg uppercase mb-4 tracking-tighter text-foreground">{activeMenu}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href={`/products?sort=new&gender=${activeMenu}`} onClick={closeMenu} className="text-sm font-medium text-foreground/70 hover:text-foreground hover:underline block">
                      Nouveautés
                    </Link>
                  </li>
                  <li>
                    <Link href={`/products?isPromo=true&gender=${activeMenu}`} onClick={closeMenu} className="text-sm font-bold text-destructive hover:text-destructive/80 hover:underline block">
                      Promotions
                    </Link>
                  </li>
                  <li>
                    <Link href={`/products?gender=${activeMenu}`} onClick={closeMenu} className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline block mt-4">
                      Tout voir
                    </Link>
                  </li>
                </ul>
              </div>

              {/* COLONNE 2 : RAYONS & CATÉGORIES */}
              <div className="col-span-6 px-6">
                <h3 className="font-bold text-muted-foreground text-xs uppercase mb-4 tracking-widest">
                  Rayons &amp; Catégories
                </h3>
                <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/category/${cat.id}?gender=${activeMenu}`}
                        onClick={closeMenu}
                        className="text-sm text-foreground/70 hover:text-foreground hover:bg-secondary px-2 py-1.5 -ml-2 rounded-lg transition-colors block font-medium"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COLONNE 3 : IMAGE */}
              <div className="col-span-3">
                <div className="relative h-64 w-full bg-secondary rounded-xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeMenu === 'Homme' 
                      ? "https://media.istockphoto.com/id/2184365539/fr/photo/homme-%C3%A9l%C3%A9gant-en-costume-beige-posant-astucieusement-dans-une-lumi%C3%A8re-douce-sur-une-toile-de.webp?a=1&b=1&s=612x612&w=0&k=20&c=LZq-oycyrL5Zb8Fj8stm3M8lAhV1h89V9UF0FjEvBVY=" 
                      : "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80"
                    }
                    alt={`Collection ${activeMenu}`}
                    className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground rounded">
                    Collection {activeMenu}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FOND ASSOMBRI — aussi positionné dynamiquement */}
      {activeMenu && (
        <div 
          className="fixed left-0 w-full bottom-0 bg-black/25 z-40 backdrop-blur-[1px]"
          style={{ top: `${menuTop}px` }}
          onMouseEnter={closeMenu}
        />
      )}
    </div>
  )
}