import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full bg-slate-900 text-white md:w-64">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-2 px-4">
          <Link href="/admin" className="block rounded px-4 py-2 hover:bg-slate-800">
            📊 Tableau de bord
          </Link>
          <Link href="/admin/products" className="block rounded px-4 py-2 hover:bg-slate-800">
            📦 Produits
          </Link>
          <Link href="/admin/orders" className="block rounded px-4 py-2 hover:bg-slate-800">
            💰 Commandes
          </Link>
          <Link href="/" className="mt-8 block rounded border border-slate-700 px-4 py-2 text-center text-sm text-slate-400 hover:text-white">
            ← Retour au Site
          </Link>
        </nav>
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  )
}