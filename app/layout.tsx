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

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Monsoon E-Commerce',
  description: 'Le style sans compromis.',
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
            <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' } }} />
            
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>

            {/* Le Slide-over Global (S'affiche par dessus tout via 'fixed' et z-index) */}
            <CartSlideover />

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}