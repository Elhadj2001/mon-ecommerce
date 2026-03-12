'use client'

import dynamic from 'next/dynamic'

// Ce wrapper permet d'importer dynamiquement la HeroSection côté client
// sans violer la règle de Next.js qui interdit `ssr: false` dans un Server Component (page.tsx)
const DynamicHero = dynamic(() => import('./home/HeroSection'), { ssr: false })

export default function ClientHeroSection() {
  return <DynamicHero />
}
