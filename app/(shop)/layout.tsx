import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartSlideover } from '@/components/CartSlideover'
import ClientOnlyComponents from '@/components/ClientOnlyComponents'
import { AnnouncementBar } from '@/components/AnnouncementBar'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Composants dynamiques client-only (Preloader, Cursor, Scroll, Floating Buttons) */}
      <ClientOnlyComponents phone="221781737959" />

      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>

      <CartSlideover />
    </>
  )
}
