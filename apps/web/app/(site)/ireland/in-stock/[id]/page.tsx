export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, Phone, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStockById } from '@/lib/stock/kv'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getStockById(id)

  if (!listing) {
    return {
      title: 'Horsebox Not Found | JTH Ireland',
    }
  }

  const price = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(listing.price)

  return {
    title: `${listing.model} ${listing.year} - ${price} | Horsebox For Sale Ireland | JTH`,
    description: `${listing.model} ${listing.year} in ${listing.color}. ${listing.mileage.toLocaleString('en-IE')} km. ${listing.description}. Available for delivery to Ireland.`,
    openGraph: {
      title: `${listing.model} ${listing.year} For Sale - ${price} | JTH Ireland`,
      description: listing.description,
      images: listing.images.length > 0 ? [listing.images[listing.primaryImage || 0] || listing.images[0]] : [],
      type: 'website',
      locale: 'en_IE',
      siteName: 'JTH Horseboxes',
    },
  }
}

function formatEur(price: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default async function IrelandStockDetailPage({ params }: Props) {
  const { id } = await params
  const listing = await getStockById(id)

  if (!listing) {
    notFound()
  }

  const hasImages = listing.images && listing.images.length > 0
  const statusColors: Record<string, string> = {
    available: 'bg-emerald-600 text-white',
    reserved: 'bg-amber-500 text-white',
    sold: 'bg-red-600 text-white',
  }

  return (
    <main>
      {/* Back Link */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/ireland/in-stock"
            className="inline-flex items-center text-sm text-slate-600 hover:text-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to In Stock
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image Gallery */}
            <div>
              {hasImages ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Image
                      src={listing.images[listing.primaryImage || 0] || listing.images[0]}
                      alt={`${listing.model} horsebox - ${listing.color}`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-sm font-semibold ${statusColors[listing.status] || statusColors.available}`}
                      >
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  {listing.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {listing.images.slice(1).map((img, i) => (
                        <div key={i} className="relative aspect-square overflow-hidden bg-slate-100">
                          <Image
                            src={img}
                            alt={`${listing.model} - image ${i + 2}`}
                            fill
                            sizes="(min-width: 1024px) 12vw, 25vw"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-slate-200 flex items-center justify-center">
                  <Truck className="w-24 h-24 text-slate-400" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-2">
                  {listing.model}
                </h1>
                <p className="text-lg text-slate-500">
                  {listing.color} &middot; {listing.year} &middot;{' '}
                  {listing.mileage.toLocaleString('en-IE')} km
                </p>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-6" />

              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">
                  {formatEur(listing.price)}
                </span>
                <p className="text-sm text-slate-500 mt-1">complete vehicle · exc. VAT</p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 leading-relaxed">{listing.description}</p>
              </div>

              {/* Specifications */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Specifications</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4">
                    <dt className="text-sm text-slate-500">Model</dt>
                    <dd className="text-slate-900 font-medium">{listing.model}</dd>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <dt className="text-sm text-slate-500">Year</dt>
                    <dd className="text-slate-900 font-medium">{listing.year}</dd>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <dt className="text-sm text-slate-500">Colour</dt>
                    <dd className="text-slate-900 font-medium">{listing.color}</dd>
                  </div>
                  <div className="bg-slate-50 p-4">
                    <dt className="text-sm text-slate-500">Mileage</dt>
                    <dd className="text-slate-900 font-medium">
                      {listing.mileage.toLocaleString('en-IE')} km
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Features */}
              {listing.features && listing.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Features</h2>
                  <div className="space-y-3">
                    {listing.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-700 mr-3 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="flex-1 inline-flex items-center justify-center bg-blue-700 px-6 py-4 text-white font-semibold hover:bg-blue-800 transition-all duration-300"
                >
                  Enquire About This Horsebox
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href="tel:+353872557015"
                  className="flex-1 inline-flex items-center justify-center border-2 border-blue-700 px-6 py-4 text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Call +353 87 255 7015
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-800 py-16 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Interested in This Horsebox?
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-10">
            Contact our Ireland representative Paul Morton to arrange a viewing or discuss delivery
            options. We deliver direct to your door anywhere in Ireland.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-10 py-4 bg-white text-blue-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Get in Touch
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/ireland/in-stock"
              className="inline-flex items-center px-10 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-700 transition-all"
            >
              View All Stock
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
