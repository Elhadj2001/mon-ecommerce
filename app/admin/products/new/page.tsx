import { createProduct } from '@/actions/products'
import { prisma } from '@/lib/prisma' // On a besoin de prisma pour lire les catégories existantes

export default async function NewProductPage() {
  // 1. On récupère les catégories existantes pour les suggérer
  const existingCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Ajouter un nouveau produit</h1>

      <form action={createProduct} className="space-y-6">
        
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
          <input name="name" required placeholder="Ex: Air Jordan 1" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" required rows={3} placeholder="Description..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        </div>

        {/* Prix et Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
            <input name="price" type="number" step="0.01" required placeholder="0.00" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input name="stock" type="number" required placeholder="10" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
        </div>

        {/* --- C'EST ICI LA MAGIE DU DATALIST --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          
          {/* L'input est lié à la liste via l'attribut 'list' */}
          <input 
            name="category" 
            list="categories-list" // Doit correspondre à l'ID du datalist plus bas
            required 
            placeholder="Sélectionner ou écrire une nouvelle..." 
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" 
          />
          
          {/* La liste des suggestions */}
          <datalist id="categories-list">
            {existingCategories.map((cat) => (
              <option key={cat.id} value={cat.name} />
            ))}
          </datalist>

          <p className="text-xs text-gray-500 mt-1">
            Astuce : Cliquez deux fois ou commencez à taper pour voir la liste. Si vous écrivez un nom inconnu, il sera créé.
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">URL image</label>
          <input name="imageUrl" type="url" required placeholder="https://..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        {/* --- NOUVEAU : GENRE & VARIANTES --- */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500">Caractéristiques</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Genre / Rayon</label>
              <select name="gender" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="Unisexe">Unisexe ⚥</option>
                <option value="Homme">Homme ♂</option>
                <option value="Femme">Femme ♀</option>
                <option value="Enfant">Enfant 👶</option>
              </select>
            </div>

            {/* 2. Tailles */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tailles disponibles</label>
              <input 
                name="sizes" 
                placeholder="Ex: S, M, L, XL" 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
              />
              <p className="text-[10px] text-gray-500 mt-1">Séparez par des virgules</p>
            </div>

            {/* 3. Couleurs */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Couleurs disponibles</label>
              <input 
                name="colors" 
                placeholder="Ex: Noir, Blanc, Rouge" 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
              />
              <p className="text-[10px] text-gray-500 mt-1">Séparez par des virgules</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
            <input 
                type="checkbox" 
                name="isFeatured" 
                id="isFeatured" 
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                Mettre ce produit en avant (Accueil)
            </label>
        </div>

        <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
          Créer le produit
        </button>
      </form>
    </div>
  )
}