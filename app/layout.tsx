import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from "@clerk/localizations"
import { Toaster } from 'react-hot-toast' // <--- IMPORT ICI

const inter = Inter({ subsets: ['latin'] })

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
      <html lang="fr">
        <body className={inter.className}>
          {/* On ajoute le Toaster ici pour que les popups puissent s'afficher par dessus tout */}
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}