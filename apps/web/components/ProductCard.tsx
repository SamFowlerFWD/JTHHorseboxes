import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

type ProductCardProps = {
  title: string
  slug: string
  price: string
  description: string
  features: string[]
  image: string
  badge?: string
  highlighted?: boolean
}

export default function ProductCard({
  title,
  slug,
  price,
  description,
  features,
  image,
  badge,
  highlighted = false
}: ProductCardProps) {
  return (
    <Link href={`/models/${slug}`} className="group block h-full">
      <div className={`
        relative h-full bg-white overflow-hidden transition-all duration-500 
        ${highlighted 
          ? 'shadow-2xl ring-2 ring-blue-400 scale-105' 
          : 'border border-line shadow-sm hover:shadow-md'
        }
        
      `}>
        {badge && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-blue-600 text-white text-sm font-semibold">
            {badge}
          </div>
        )}
        
        <div className="relative h-72 overflow-hidden">
          <Image 
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,31,45,0.35),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-sm">Click to explore</p>
          </div>
        </div>
        
        <div className="p-8 bg-paper">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-blue-600 font-medium">Starting from</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-900">{price}</span>
              <p className="text-xs text-slate-500">body build only · exc. VAT</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-line mb-4"></div>
          
          <p className="text-slate-600 mb-6 line-clamp-2">{description}</p>
          
          <ul className="space-y-2 mb-6">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
              View Details
            </span>
            
            {highlighted && (
              <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-100">
                MOST POPULAR
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}