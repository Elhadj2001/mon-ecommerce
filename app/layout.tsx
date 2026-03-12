import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from "@clerk/localizations"
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { CartSlideover } from '@/components/CartSlideover'
import ClientOnlyComponents from '@/components/ClientOnlyComponents'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'MAISON NIANG — Mode Contemporaine | Saint-Louis · Paris',
  description: 'Découvrez Maison Niang, la marque de mode franco-africaine qui allie l\'élégance et l\'authenticité. Collections exclusives, livraison internationale depuis Saint-Louis.',
  keywords: ['mode', 'fashion', 'vêtements', 'luxe', 'Saint-Louis', 'Sénégal', 'Maison Niang', 'Niang'],
  openGraph: {
    title: 'MAISON NIANG — Mode Contemporaine | Saint-Louis · Paris',
    description: 'Élégance sans compromis. Collections exclusives Franco-Africaines.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAISON NIANG — Mode Contemporaine',
    description: 'Élégance sans compromis. Collections exclusives Franco-Africaines.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" suppressHydrationWarning>
        <body className={`${outfit.className} ${outfit.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Composants dynamiques client-only (Preloader, Cursor, Scroll, Floating Buttons) */}
            <ClientOnlyComponents phone="221781737959" />

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '500',
                  letterSpacing: '0.02em',
                }
              }}
            />
            
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>

            <CartSlideover />


          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}