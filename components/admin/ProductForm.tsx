'use client'

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter, useParams } from "next/navigation"
import { Product, Image as ImageType, Category } from "@prisma/client"
import ImageUpload from "@/components/admin/ImageUpload"
import { Trash, Plus, RotateCcw, Check, Palette, X, User } from "lucide-react"

// --- SCHÉMA ZOD ---
const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  price: z.coerce.number().min(0.01, "Prix requis"),
  stock: z.coerce.number().min(0, "Stock minimum 0"),
  categoryId: z.string().min(1, "Catégorie requise"),
  description: z.string().min(1, "Description requise"),
  
  // NOUVEAU : Gestion du Genre
  gender: z.enum(["Homme", "Femme", "Unisex", "Enfant"]).default("Unisex"),

  images: z.object({ 
    url: z.string(), 
    color: z.string().optional().nullable() 
  }).array().min(1, "Au moins une image"),
  
  sizes: z.array(z.string()).min(1, "Au moins une taille"),
  colors: z.array(z.string()).min(1, "Au moins une couleur"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  initialData: (Product & { images: ImageType[] }) | null
  categories: Category[]
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "Unique"]

// --- PALETTE COMPLÈTE & SYNCHRONISÉE ---
// Cette liste correspond exactement à ton ProductClient pour éviter les bugs
const RICH_COLORS = [
  // Couleurs Riches
  { name: 'Noir Mat', hex: '#171717' },
  { name: 'Blanc Pur', hex: '#FFFFFF' },
  { name: 'Gris Chiné', hex: '#9CA3AF' },
  { name: 'Anthracite', hex: '#374151' },
  { name: 'Bleu Marine', hex: '#1E3A8A' },
  { name: 'Bleu Roi', hex: '#2563EB' },
  { name: 'Bleu Ciel', hex: '#93C5FD' },
  { name: 'Rouge Vif', hex: '#EF4444' },
  { name: 'Bordeaux', hex: '#7F1D1D' },
  { name: 'Vert Forêt', hex: '#064E3B' },
  { name: 'Vert Kaki', hex: '#78716C' },
  { name: 'Vert Menthe', hex: '#6EE7B7' },
  { name: 'Jaune Moutarde', hex: '#D97706' },
  { name: 'Beige Sable', hex: '#FDE68A' },
  { name: 'Marron Glacé', hex: '#78350F' },
  { name: 'Rose Poudré', hex: '#FBCFE8' },
  { name: 'Violet Lavande', hex: '#C4B5FD' },
  // Basiques
  { name: 'Or', hex: '#FFD700' },
  { name: 'Argent', hex: '#C0C0C0' },
  { name: 'Orange', hex: '#FFA500' },
]

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories }) => {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false)
  const [customColorHex, setCustomColorHex] = useState("#000000")

  const title = initialData ? "Modifier le produit" : "Créer un produit"
  const action = initialData ? "Sauvegarder" : "Créer"

  const form = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      price: parseFloat(String(initialData.price)),
      sizes: initialData.sizes || [],
      colors: initialData.colors || [],
      gender: (initialData.gender as any) || "Unisex", // Sécurité si null
    } : {
      name: '', images: [], price: 0, stock: 0, categoryId: '', description: '', 
      sizes: [], colors: [], isFeatured: false, isArchived: false, gender: "Unisex"
    }
  })

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/products/${params.productId}`, data)
      } else {
        await axios.post(`/api/products`, data)
      }
      router.refresh()
      router.push(`/admin/products`)
      toast.success("Succès !")
    } catch (error) {
      console.error(error)
      toast.error("Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (field: "sizes" | "colors", value: string) => {
    const current = form.getValues(field) || []
    if (current.includes(value)) {
      form.setValue(field, current.filter((item) => item !== value))
    } else {
      form.setValue(field, [...current, value])
    }
    form.trigger(field) 
  }

  const addCustomColor = () => {
     toggleSelection("colors", customColorHex);
     toast.success(`Couleur ${customColorHex} ajoutée !`)
  }

  const selectedSizes = form.watch("sizes")
  const selectedColors = form.watch("colors")

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les informations de votre catalogue</p>
        </div>
        {initialData && (
          <button
            type="button"
            className="bg-red-50 text-red-600 p-3 rounded-full hover:bg-red-100 transition"
            disabled={loading}
            onClick={async () => {
              setLoading(true); await axios.delete(`/api/products/${params.productId}`); router.refresh(); router.push('/admin/products');
            }}
          >
            <Trash size={18} />
          </button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECTION IMAGES */}
        <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
          <label className="text-lg font-semibold block mb-4">Galerie d&apos;images</label>
          <ImageUpload 
            value={form.watch("images").map((image) => ({ url: image.url, color: image.color }))}
            disabled={loading}
            onChange={(newImages) => {
                form.setValue("images", newImages, { shouldValidate: true })
            }}
            onRemove={(url) => form.setValue("images", form.getValues("images").filter((current) => current.url !== url))}
            availableColors={form.watch('colors')}
          />
          {form.formState.errors.images && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {form.formState.errors.images.message}</p>}
        </div>

        {/* SECTION INFO PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Nom du produit</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="Ex: Sneakers Urban Pulse"
              disabled={loading} 
              {...form.register("name")} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-700 flex justify-between">
                Catégorie
                <button 
                    type="button" 
                    onClick={() => {
                        setIsNewCategoryMode(!isNewCategoryMode)
                        form.setValue('categoryId', '')
                    }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 normal-case font-normal"
                >
                    {isNewCategoryMode ? <><RotateCcw size={12}/> Choisir existante</> : <><Plus size={12}/> Créer nouvelle</>}
                </button>
            </label>
            {isNewCategoryMode ? (
                 <input 
                    className="w-full border-2 border-blue-100 bg-blue-50 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-blue-900 placeholder-blue-300"
                    placeholder="Entrez le nom de la nouvelle catégorie..."
                    disabled={loading} 
                    {...form.register("categoryId")} 
               />
            ) : (
                <select 
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none transition cursor-pointer"
                    disabled={loading} 
                    {...form.register("categoryId")}
                >
                    <option value="">-- Sélectionner une catégorie --</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            )}
            {form.formState.errors.categoryId && <p className="text-red-500 text-sm mt-1">⚠️ Catégorie requise</p>}
          </div>

          {/* NOUVEAU CHAMP GENRE */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <User size={16} /> Genre / Cible
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Unisex', 'Homme', 'Femme', 'Enfant'].map((g) => (
                <div 
                  key={g}
                  onClick={() => form.setValue('gender', g as any)}
                  className={`
                    cursor-pointer text-center py-3 rounded-lg border text-sm font-medium transition-all
                    ${form.watch('gender') === g 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                  `}
                >
                  {g}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Prix (€)</label>
                <div className="relative">
                    <input 
                        type="number" step="0.01"
                        className="w-full border border-gray-300 p-3 rounded-lg pl-8 focus:ring-2 focus:ring-black outline-none transition"
                        disabled={loading} {...form.register("price")} 
                    />
                    <span className="absolute left-3 top-3 text-gray-400">€</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Stock</label>
                <input 
                    type="number" 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                    disabled={loading} {...form.register("stock")} 
                />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Description</label>
          <textarea 
            className="w-full border border-gray-300 p-3 rounded-lg min-h-[120px] focus:ring-2 focus:ring-black outline-none transition"
            placeholder="Description détaillée du produit..."
            disabled={loading} 
            {...form.register("description")} 
          />
        </div>

        {/* SECTION VARIANTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
            
            {/* TAILLES */}
            <div>
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700 block mb-3">Tailles</label>
                <div className="flex flex-wrap gap-3">
                    {SIZES.map((size) => {
                        const isSelected = selectedSizes?.includes(size)
                        return (
                            <div 
                                key={size}
                                onClick={() => toggleSelection("sizes", size)}
                                className={`
                                    w-10 h-10 flex items-center justify-center rounded-md cursor-pointer border transition-all font-semibold select-none text-sm
                                    ${isSelected 
                                        ? 'bg-black text-white border-black shadow-md scale-110' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
                                `}
                            >
                                {size}
                            </div>
                        )
                    })}
                </div>
                {form.formState.errors.sizes && <p className="text-red-500 text-sm mt-2">⚠️ Sélectionnez au moins une taille</p>}
            </div>

            {/* COULEURS (AVEC SCROLL) */}
            <div>
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700 block mb-3 flex items-center gap-2">
                  <Palette size={16} /> Couleurs
                </label>
                
                <div className="space-y-4">
                  {/* ZONE SCROLLABLE POUR NE PAS SATURE L'ÉCRAN */}
                  <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto p-2 border border-gray-100 rounded-lg shadow-inner bg-gray-50/50">
                      {RICH_COLORS.map((colorItem) => {
                          const isSelected = selectedColors?.includes(colorItem.name)
                          const isWhite = colorItem.hex.toLowerCase() === '#ffffff'
                          return (
                              <div 
                                  key={colorItem.name}
                                  onClick={() => toggleSelection("colors", colorItem.name)}
                                  title={colorItem.name}
                                  className={`
                                    w-8 h-8 rounded-full cursor-pointer border-2 transition-all shadow-sm flex items-center justify-center relative group flex-shrink-0
                                    ${isSelected 
                                      ? `ring-2 ring-offset-2 scale-110 ${isWhite ? 'ring-gray-300 border-gray-300' : 'ring-black border-transparent'}` 
                                      : `hover:scale-105 ${isWhite ? 'border-gray-200' : 'border-transparent'}`}
                                  `}
                                  style={{ backgroundColor: colorItem.hex }}
                              >
                                  {isSelected && (
                                    <Check size={14} className={isWhite ? "text-black" : "text-white"} />
                                  )}
                              </div>
                          )
                      })}
                  </div>

                  {/* Sélecteur personnalisé */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input 
                        type="color" 
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-none p-0"
                        title="Choisir une couleur personnalisée"
                      />
                      <span className="text-sm font-mono text-gray-600">{customColorHex}</span>
                      <button
                        type="button"
                        onClick={addCustomColor}
                        className="ml-auto text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 transition flex items-center gap-1"
                      >
                        <Plus size={14} /> Ajouter
                      </button>
                  </div>

                  {/* Liste des couleurs personnalisées ajoutées */}
                  {selectedColors?.filter(c => c.startsWith('#')).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedColors.filter(c => c.startsWith('#')).map(hexColor => (
                        <div key={hexColor} className="flex items-center gap-2 bg-gray-100 pl-2 pr-3 py-1 rounded-full border border-gray-200">
                          <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: hexColor}} />
                          <span className="text-xs font-mono">{hexColor}</span>
                          <button type="button" onClick={() => toggleSelection("colors", hexColor)} className="text-gray-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
                {form.formState.errors.colors && <p className="text-red-500 text-sm mt-2">⚠️ Sélectionnez au moins une couleur</p>}
            </div>
        </div>

        {/* SECTION VISIBILITÉ */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" {...form.register("isFeatured")} className="w-5 h-5 accent-black cursor-pointer" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-black">Mettre en avant (Accueil)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group ml-6">
            <input type="checkbox" {...form.register("isArchived")} className="w-5 h-5 accent-red-500 cursor-pointer" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Archiver (Cacher du site)</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-black text-white text-lg font-bold py-4 rounded-xl hover:bg-gray-900 transition shadow-lg transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Enregistrement..." : action.toUpperCase()}
        </button>
      </form>
    </div>
  )
}