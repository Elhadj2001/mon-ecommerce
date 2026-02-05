import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  data: {
    id: string;
    name: string;
    price: number;
    originalPrice: number | null;
    images: { url: string }[];
  }
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const discount = data.originalPrice 
    ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/product/${data.id}`} className="group block overflow-hidden">
      <div className="relative">
        {/*
          SOLUTION POUR LA TAILLE UNIFORME :
          1. On utilise un conteneur avec `aspect-square` pour forcer un ratio 1:1.
          2. L'image `next/image` à l'intérieur remplit ce conteneur.
          3. `object-cover` assure que l'image couvre la zone sans se déformer.
        */}
        <div className="aspect-square w-full bg-gray-100 overflow-hidden rounded-md">
          <Image
            src={data.images?.[0]?.url || '/placeholder-image.png'} // Prévoir une image par défaut
            alt={data.name}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      <div className="mt-2 text-left">
        <h3 className="text-sm font-medium text-gray-800 truncate group-hover:underline">
          {data.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-base font-bold text-gray-900">
            {data.price.toFixed(2)} €
          </p>
          {data.originalPrice && (
            <p className="text-sm text-gray-500 line-through">
              {data.originalPrice.toFixed(2)} €
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard