'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems = [{ label: 'Accueil', href: '/' }, ...items]

  // Schéma JSON-LD pour le SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${process.env.NEXT_PUBLIC_APP_URL}${item.href}` : undefined,
    })),
  }

  return (
    <>
      {/* JSON-LD pour les moteurs de recherche */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          return (
            <span key={index} className="flex items-center gap-1.5">
              {index === 0 ? (
                item.href ? (
                  <Link href={item.href} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Home className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Home className="w-3.5 h-3.5" />
                )
              ) : null}

              {index > 0 && <ChevronRight className="w-3 h-3 text-border" />}

              {index > 0 && (
                isLast ? (
                  <span className="text-foreground font-bold uppercase tracking-wide truncate max-w-[200px]">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors uppercase tracking-wide"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="uppercase tracking-wide">{item.label}</span>
                )
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
