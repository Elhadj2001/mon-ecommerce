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
import { Trash, Plus, RotateCcw, Check, Palette, X, Info } from "lucide-react"

// --- SCHÉMA ZOD ---
const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  price: z.coerce.number().min(0.01, "Prix requis"),
  originalPrice: z.coerce.number().optional(), 
  stock: z.coerce.number().min(0, "Stock minimum 0"),
  categoryId: z.string().min(1, "Catégorie requise"),
  gender: z.string().min(1, "Le genre est requis"), 
  description: z.string().min(1, "Description requise"),
  images: z.object({ 
    url: z.string(), 
    color: z.string().optional().nullable() 
  }).array().min(1, "Au moins une image"),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).min(1, "Au moins une couleur"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  initialData: (Product & { images: ImageType[] }) | null
  categories: Category[]
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "TU"]

const GENDERS = [
  { label: "Homme", value: "Homme" },
  { label: "Femme", value: "Femme" },
  { label: "Unisexe", value: "Unisexe" },
  { label: "Enfant", value: "Enfant" },
]

const RICH_COLORS = [
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
      originalPrice: initialData.originalPrice ? parseFloat(String(initialData.originalPrice)) : undefined,
      sizes: initialData.sizes || [],
      colors: initialData.colors || [],
      // @ts-ignore
      gender: initialData.gender || 'Unisexe', 
    } : {
      name: '', 
      images: [], 
      price: 0, 
      originalPrice: undefined,
      stock: 0, 
      categoryId: '', 
      gender: 'Unisexe',
      description: '', 
      sizes: [], 
      colors: [], 
      isFeatured: false, 
      isArchived: false,
    }
  })

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true)
      
      let finalCategoryId = data.categoryId;
      
      if (isNewCategoryMode) {
          const res = await axios.post(`/api/categories`, { 
            name: data.categoryId 
          }); 
          finalCategoryId = res.data.id;
      }

      const payload = { ...data, categoryId: finalCategoryId };

      if (initialData) {
        const productId = params.productId || initialData.id;
        await axios.patch(`/api/products/${productId}`, payload)
      } else {
        await axios.post(`/api/products`, payload)
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
          <p className="text-sm text-gray-500 mt-1">Remplissez les détails ci-dessous</p>
        </div>
        {initialData && (
          <button
            type="button"
            className="bg-red-50 text-red-600 p-3 rounded-full hover:bg-red-100 transition"
            disabled={loading}
            onClick={async () => {
              setLoading(true); 
              const productId = params.productId || initialData.id;
              await axios.delete(`/api/products/${productId}`); 
              router.refresh(); 
              router.push('/admin/products');
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
            {form.formState.errors.name && <p className="text-red-500 text-sm">⚠️ {form.formState.errors.name.message}</p>}
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

          {/* GESTION DES PRIX */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                   Prix de vente (EUR) 
                   {/* --- CORRECTION ICI : Wrapper l'icône dans un span pour le title --- */}
                   <span title="Saisir en Euros. La conversion FCFA est auto.">
                      <Info size={12} className="text-gray-400 cursor-help" />
                   </span>
                </label>
                <div className="relative">
                    <input 
                        type="number" step="0.01"
                        placeholder="Ex: 20 (soit ~13.000 F)"
                        className="w-full border border-gray-300 p-3 rounded-lg pl-8 focus:ring-2 focus:ring-black outline-none transition"
                        disabled={loading} {...form.register("price")} 
                    />
                    <span className="absolute left-3 top-3 text-gray-400">€</span>
                </div>
                {form.formState.errors.price && <p className="text-red-500 text-sm">⚠️ Requis</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Prix Promo (EUR)</label>
                <div className="relative">
                    <input 
                        type="number" step="0.01"
                        placeholder="Optionnel"
                        className="w-full border border-gray-200 bg-gray-50 p-3 rounded-lg pl-8 focus:ring-2 focus:ring-red-500 outline-none transition"
                        disabled={loading} {...form.register("originalPrice")} 
                    />
                    <span className="absolute left-3 top-3 text-gray-400">€</span>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Stock</label>
                <input 
                    type="number" 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                    disabled={loading} {...form.register("stock")} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Genre (Cible)</label>
                <select 
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none transition cursor-pointer"
                    disabled={loading} 
                    {...form.register("gender")}
                >
                    {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                </select>
                {form.formState.errors.gender && <p className="text-red-500 text-sm">⚠️ Genre requis</p>}
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
          {form.formState.errors.description && <p className="text-red-500 text-sm">⚠️ Requis</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
            <div>
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700 block mb-3">
                    Tailles <span className="text-xs text-gray-400 font-normal lowercase">(optionnel)</span>
                </label>
                <div className="flex flex-wrap gap-3">
                    {SIZES.map((size) => {
                        const isSelected = selectedSizes?.includes(size)
                        return (
                            <div 
                                key={size}
                                onClick={() => toggleSelection("sizes", size)}
                                className={`w-12 h-12 flex items-center justify-center rounded-md cursor-pointer border transition-all font-semibold select-none ${isSelected ? 'bg-black text-white border-black shadow-md scale-110' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
                            >
                                {size}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700 block mb-3 flex items-center gap-2">
                  <Palette size={16} /> Couleurs
                </label>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                      {RICH_COLORS.map((colorItem) => {
                          const isSelected = selectedColors?.includes(colorItem.name)
                          const isWhite = colorItem.hex.toLowerCase() === '#ffffff'
                          return (
                              <div 
                                  key={colorItem.name}
                                  onClick={() => toggleSelection("colors", colorItem.name)}
                                  // --- Title est valide sur une div HTML standard ---
                                  title={colorItem.name}
                                  className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all shadow-sm flex items-center justify-center relative group ${isSelected ? `ring-2 ring-offset-2 scale-110 ${isWhite ? 'ring-gray-300 border-gray-300' : 'ring-black border-transparent'}` : `hover:scale-105 ${isWhite ? 'border-gray-200' : 'border-transparent'}`}`}
                                  style={{ backgroundColor: colorItem.hex }}
                              >
                                  {isSelected && (
                                    <Check size={16} className={isWhite ? "text-black" : "text-white"} />
                                  )}
                              </div>
                          )
                      })}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input 
                        type="color" 
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-none p-0"
                      />
                      <span className="text-sm font-mono text-gray-600">{customColorHex}</span>
                      <button
                        type="button"
                        onClick={addCustomColor}
                        className="ml-auto text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 transition flex items-center gap-1"
                      >
                        <Plus size={14} /> Ajouter ce HEX
                      </button>
                  </div>

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

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
                <input type="checkbox" {...form.register("isFeatured")} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-black checked:bg-black checked:before:bg-black hover:before:opacity-10" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-black">Mettre en avant (Accueil)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group ml-6">
            <div className="relative flex items-center">
                <input type="checkbox" {...form.register("isArchived")} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-red-500 checked:bg-red-500 hover:before:opacity-10" />
                 <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
            </div>
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