'use client'

import { useState } from 'react'

// 1. CORRECTION TYPE : On définit une forme précise pour l'image
// Elle peut être soit un objet { url: string }, soit une simple chaîne de caractères
type ImageType = {
  id: string;
  url: string;
} | string;

interface ProductGalleryProps {
  images: ImageType[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        {/* 2. CORRECTION APOSTROPHE : On utilise &apos; au lieu de ' */}
        Pas d&apos;image
      </div>
    )
  }

  // Fonction typée sans "any"
  const getImageUrl = (image: ImageType): string => {
    if (typeof image === 'string') {
      return image
    }
    return image.url
  }

  return (
    <div className="flex flex-col-reverse">
      
      {/* LISTE DES VIGNETTES */}
      <div className={`mx-auto mt-6 w-full max-w-2xl block lg:max-w-none ${images.length <= 1 ? 'hidden' : ''}`}>
        <div className="grid grid-cols-4 gap-6">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50 
              ${selectedImageIndex === index ? 'ring-2 ring-black ring-offset-2' : 'ring-1 ring-transparent ring-offset-0'}`}
            >
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </span>
              <span
                className={`pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2 ${selectedImageIndex === index ? 'ring-black' : 'ring-transparent'}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      {/* IMAGE PRINCIPALE */}
      <div className="aspect-square w-full">
        <div className="h-full w-full overflow-hidden rounded-lg border border-gray-100">
           <img
             src={getImageUrl(images[selectedImageIndex])}
             alt="Image produit"
             className="h-full w-full object-cover object-center transition-opacity duration-300"
           />
        </div>
      </div>
    </div>
  )
}