'use client'

import dynamic from 'next/dynamic'

// Tous les composants browser-only sont chargés ici, dans un Client Component
const LuxuryPreloader = dynamic(() => import('./LuxuryPreloader'), { ssr: false })
const CustomCursor = dynamic(() => import('./CustomCursor'), { ssr: false })
const ScrollProgressBar = dynamic(() => import('./ScrollProgressBar'), { ssr: false })
const FloatingButtons = dynamic(
  () => import('./FloatingButtons').then(m => ({
    default: ({ phone }: { phone: string }) => (
      <>
        <m.FloatingWhatsApp phone={phone} />
        <m.BackToTop />
      </>
    )
  })),
  { ssr: false }
)

export default function ClientOnlyComponents({ phone }: { phone: string }) {
  return (
    <>
      <LuxuryPreloader />
      <CustomCursor />
      <ScrollProgressBar />
      <FloatingButtons phone={phone} />
    </>
  )
}
