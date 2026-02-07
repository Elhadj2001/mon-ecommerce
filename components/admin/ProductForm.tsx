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
import { Trash, Plus, RotateCcw, Check, Palette, X, Info, ChevronLeft, Save } from "lucide-react"

// --- CONSTANTE DE CONVERSION ---
const EXCHANGE_RATE = 655.957;

// --- SCHÉMA ZOD ---
const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  // On accepte des grands nombres maintenant (ex: 10000)
  price: z.coerce.number().min(1, "Prix requis (min 1 FCFA)"),
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

  const title = initialData ? "Modifier le produit" : "Ajouter un produit"
  const action = initialData ? "Mettre à jour" : "Enregistrer"

  // --- PREPARATION DES DONNÉES INITIALES (CONVERSION EUR -> FCFA) ---
  const defaultValues = initialData ? {
    ...initialData,
    // On multiplie par le taux pour afficher des FCFA à l'admin
    price: Math.round(parseFloat(String(initialData.price)) * EXCHANGE_RATE),
    originalPrice: initialData.originalPrice 
        ? Math.round(parseFloat(String(initialData.originalPrice)) * EXCHANGE_RATE) 
        : undefined,
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

  const form = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues
  })

  // --- SOUMISSION DU FORMULAIRE (CONVERSION FCFA -> EUR) ---
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

      // 1. CONVERSION INVERSE : L'admin a saisi 10000 FCFA, on divise pour avoir des Euros
      const priceInEur = data.price / EXCHANGE_RATE;
      const originalPriceInEur = data.originalPrice ? (data.originalPrice / EXCHANGE_RATE) : undefined;

      // 2. On prépare le payload avec les prix en Euros pour la DB
      const payload = { 
          ...data, 
          price: priceInEur,
          originalPrice: originalPriceInEur,
          categoryId: finalCategoryId 
      };

      if (initialData) {
        const productId = params.productId || initialData.id;
        await axios.patch(`/api/products/${productId}`, payload)
      } else {
        await axios.post(`/api/products`, payload)
      }
      
      router.refresh()
      router.push(`/admin/products`)
      toast.success("Produit enregistré !")
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
    <div className="max-w-[1600px] mx-auto pb-20">
      
      {/* HEADER AVEC ACTIONS */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
             <button onClick={() => router.back()} className="hover:text-black transition flex items-center gap-1">
                <ChevronLeft size={14} /> Retour
             </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
            {initialData && (
            <button
                type="button"
                className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition flex items-center gap-2 text-sm font-medium"
                disabled={loading}
                onClick={async () => {
                if(!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
                setLoading(true); 
                const productId = params.productId || initialData.id;
                await axios.delete(`/api/products/${productId}`); 
                router.refresh(); 
                router.push('/admin/products');
                }}
            >
                <Trash size={16} /> Supprimer
            </button>
            )}
            <button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading} 
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition shadow-lg flex items-center gap-2 text-sm font-bold disabled:opacity-70"
            >
                {loading ? "Enregistrement..." : <><Save size={16}/> {action}</>}
            </button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* --- LAYOUT ASYMÉTRIQUE (2/3 Gauche, 1/3 Droite) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNE GAUCHE : CONTENU PRINCIPAL */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* CARTE 1 : INFO DE BASE */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Informations produit</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nom du produit</label>
                            <input 
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                                placeholder="Ex: Sneakers Urban Pulse"
                                disabled={loading} 
                                {...form.register("name")} 
                            />
                            {form.formState.errors.name && <p className="text-red-500 text-sm">⚠️ {form.formState.errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Description</label>
                            <textarea 
                                className="w-full border border-gray-300 p-3 rounded-lg min-h-[150px] focus:ring-2 focus:ring-black outline-none transition resize-y"
                                placeholder="Description détaillée du produit..."
                                disabled={loading} 
                                {...form.register("description")} 
                            />
                            {form.formState.errors.description && <p className="text-red-500 text-sm">⚠️ Requis</p>}
                        </div>
                    </div>
                </div>

                {/* CARTE 2 : MÉDIAS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Galerie d&apos;images</h3>
                    <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
                        <ImageUpload 
                            value={form.watch("images").map((image) => ({ url: image.url, color: image.color }))}
                            disabled={loading}
                            onChange={(newImages) => {
                                form.setValue("images", newImages, { shouldValidate: true })
                            }}
                            onRemove={(url) => form.setValue("images", form.getValues("images").filter((current) => current.url !== url))}
                            availableColors={form.watch('colors')}
                        />
                    </div>
                    {form.formState.errors.images && <p className="text-red-500 text-sm mt-2">⚠️ {form.formState.errors.images.message}</p>}
                </div>

                {/* CARTE 3 : VARIANTES */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-6">Variantes (Tailles & Couleurs)</h3>
                    
                    <div className="space-y-8">
                        {/* COULEURS */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-3 flex items-center gap-2">
                                <Palette size={16} /> Couleurs disponibles
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

                                {/* Custom Color Picker */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 w-fit">
                                    <input 
                                        type="color" 
                                        value={customColorHex}
                                        onChange={(e) => setCustomColorHex(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                    />
                                    <span className="text-sm font-mono text-gray-600 uppercase">{customColorHex}</span>
                                    <button
                                        type="button"
                                        onClick={addCustomColor}
                                        className="ml-2 text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Ajouter
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

                        <div className="h-px bg-gray-100 w-full my-6"></div>

                        {/* TAILLES */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-3">
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
                    </div>
                </div>
            </div>

            {/* COLONNE DROITE : BARRE LATÉRALE */}
            <div className="lg:col-span-1 space-y-8">
                
                {/* CARTE 4 : STATUT & VISIBILITÉ */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Visibilité</h3>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                            <span className="text-sm font-medium text-gray-700">En avant (Accueil)</span>
                            <input type="checkbox" {...form.register("isFeatured")} className="w-5 h-5 accent-black cursor-pointer" />
                        </label>

                        <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                            <span className="text-sm font-medium text-gray-700">Archivé (Caché)</span>
                            <input type="checkbox" {...form.register("isArchived")} className="w-5 h-5 accent-red-500 cursor-pointer" />
                        </label>
                    </div>
                </div>

                {/* CARTE 5 : ORGANISATION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Organisation</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Catégorie</label>
                            <div className="flex flex-col gap-2">
                                {isNewCategoryMode ? (
                                    <input 
                                        className="w-full border-2 border-blue-100 bg-blue-50 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Nom de la nouvelle catégorie..."
                                        disabled={loading} 
                                        {...form.register("categoryId")} 
                                    />
                                ) : (
                                    <select 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none text-sm"
                                        disabled={loading} 
                                        {...form.register("categoryId")}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsNewCategoryMode(!isNewCategoryMode)
                                        form.setValue('categoryId', '')
                                    }}
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 self-end"
                                >
                                    {isNewCategoryMode ? <><RotateCcw size={12}/> Annuler</> : <><Plus size={12}/> Nouvelle catégorie</>}
                                </button>
                            </div>
                            {form.formState.errors.categoryId && <p className="text-red-500 text-xs">⚠️ Requis</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Genre / Cible</label>
                            <select 
                                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-black outline-none text-sm"
                                disabled={loading} 
                                {...form.register("gender")}
                            >
                                {GENDERS.map((g) => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* CARTE 6 : PRIX & STOCK (EN FCFA POUR L'ADMIN) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Prix & Inventaire</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                Prix (FCFA)
                                <span title="Saisissez directement en FCFA (ex: 10000). C'est converti automatiquement en Euros pour la base de données.">
                                    <Info size={12} className="text-gray-400 cursor-help" />
                                </span>
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" step="1"
                                    placeholder="Ex: 10000"
                                    className="w-full border border-gray-300 p-2.5 rounded-lg pl-8 focus:ring-2 focus:ring-black outline-none text-sm font-medium"
                                    disabled={loading} {...form.register("price")} 
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-xs font-bold">F</span>
                            </div>
                            {form.formState.errors.price && <p className="text-red-500 text-xs">⚠️ Requis</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Prix Promo (FCFA)</label>
                            <div className="relative">
                                <input 
                                    type="number" step="1"
                                    placeholder="Optionnel"
                                    className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg pl-8 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                    disabled={loading} {...form.register("originalPrice")} 
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-xs font-bold">F</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full my-2"></div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Stock Global</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm"
                                disabled={loading} {...form.register("stock")} 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </form>
    </div>
  )
}