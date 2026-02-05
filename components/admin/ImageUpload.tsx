'use client'

import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { ImagePlus, Trash, ImageIcon } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface ImageValue {
  url: string
  color?: string | null
}

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: ImageValue[]) => void
  onRemove: (url: string) => void
  value: ImageValue[]
  availableColors: string[]
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
  availableColors
}: ImageUploadProps) {
  
  const [isMounted, setIsMounted] = useState(false)
  
  // FIX MULTI-UPLOAD : On utilise une ref pour toujours avoir la liste d'images la plus récente
  // même à l'intérieur des callbacks rapides de Cloudinary
  const valueRef = useRef(value)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // À chaque fois que la prop 'value' change (image ajoutée/supprimée), on met à jour la Ref
  useEffect(() => {
    valueRef.current = value
  }, [value])

  // Handler pour l'upload Cloudinary
  const onUpload = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
       const secureUrl = (result.info as { secure_url: string }).secure_url
       
       const newImage = { url: secureUrl, color: null }
       
       // CORRECTION ICI : On utilise valueRef.current au lieu de value
       // Cela permet d'ajouter la nouvelle image à la liste À JOUR, et non à la version "mise en cache" lors du rendu
       onChange([...valueRef.current, newImage])
    }
  }

  const onUpdateColor = (urlToUpdate: string, newColor: string) => {
    // Ici on peut utiliser 'value' car c'est un événement utilisateur unique (un clic), pas une rafale
    const updatedImages = value.map((img) => {
      if (img.url === urlToUpdate) {
        return { ...img, color: newColor === 'all' ? null : newColor }
      }
      return img
    })
    onChange(updatedImages)
  }

  if (!isMounted) return null

  return (
    <div className="space-y-4">
      {/* GRILLE D'IMAGES EXISTANTES */}
      {value.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {value.map((image) => (
            <div key={image.url} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              
              <div className="absolute z-10 top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onRemove(image.url)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-sm"
                >
                  <Trash size={16} />
                </button>
              </div>

              <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img
                   className="object-contain w-full h-full"
                   alt="Produit"
                   src={image.url}
                 />
              </div>

              <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    Variante associée
                  </span>
                  
                  <div className="relative">
                    <select
                        disabled={disabled}
                        value={image.color || 'all'}
                        onChange={(e) => onUpdateColor(image.url, e.target.value)}
                        className={`
                            w-full text-xs p-2 pr-8 border rounded-lg appearance-none font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-black/5
                            ${!image.color ? 'bg-white text-gray-600 border-gray-200' : 'bg-black text-white border-black'}
                        `}
                    >
                        <option value="all">🌍 Toutes les couleurs</option>
                        {availableColors.length > 0 && <option disabled>──────────</option>}
                        
                        {availableColors.map((color) => (
                        <option key={color} value={color}>
                            🎨 {color}
                        </option>
                        ))}

                        {availableColors.length === 0 && (
                            <option disabled value="">⚠️ Ajoutez des couleurs ci-dessous</option>
                        )}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-4">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Aucune image pour le moment</p>
        </div>
      )}

      {/* ZONE D'UPLOAD */}
      <CldUploadWidget 
        onSuccess={onUpload} 
        uploadPreset="ecommerce_preset" // Vérifie ton preset !
        options={{
          multiple: true,
          maxFiles: 10,
          resourceType: "image"
        }}
      >
        {({ open }) => {
          const onClick = () => {
            if (open) open()
          }

          return (
            <button
              type="button"
              disabled={disabled}
              onClick={onClick}
              className="w-full flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 px-4 py-10 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all group"
            >
              <div className="p-4 bg-gray-100 rounded-full group-hover:bg-white group-hover:shadow-md transition-all">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div className="text-center">
                 <span className="font-semibold text-lg block">Cliquez pour ajouter des images</span>
                 <span className="text-xs text-gray-400">JPG, PNG, WEBP acceptés</span>
              </div>
            </button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}