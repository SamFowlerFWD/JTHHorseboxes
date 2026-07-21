import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone, Truck, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import { getAllStock } from '@/lib/stock/kv'
import type { StockListing } from '@/lib/stock/types'
import HeroAdvanced from '@/components/HeroAdvanced'
import Schema, { generateBreadcrumbSchema } from '@/components/Schema'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Horseboxes For Sale Ireland - In Stock & Ready to Go | JTH',
  description:
    'Browse horseboxes currently in stock and available for immediate delivery to Ireland. Premium British-built 3.5 tonne horseboxes at competitive prices in EUR. Contact us today.',
  keywords:
    'horseboxes for sale Ireland, horsebox in stock Ireland, buy horsebox Ireland, 3.5t horsebox for sale Ireland, used horsebox Ireland, horsebox delivery Ireland',
  openGraph: {
    title: 'Horseboxes In Stock - Available Now in Ireland | JTH',
    description:
      'Browse our current stock of premium British-built horseboxes available for delivery to Ireland. View prices in EUR.',
    images: ['/ireland/jth-professional-35-horsebox-navy-gold-front-ireland.webp'],
    type: 'website',
    locale: 'en_IE',
    siteName: 'JTH Horseboxes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horseboxes In Stock - Available Now in Ireland',
    description:
      'Browse our current stock of premium British-built horseboxes available for delivery to Ireland. View prices in EUR.',
    images: ['/ireland/jth-professional-35-horsebox-navy-gold-front-ireland.webp'],
  },
  alternates: {
    canonical: 'https://jthltd.ie/ireland/in-stock',
  },
}

function formatEur(price: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function StockCard({ listing }: { listing: StockListing }) {
  const hasImage = listing.images && listing.images.length > 0
  const statusColors: Record<string, string> = {
    available: 'bg-emerald-600 text-white',
    reserved: 'bg-amber-500 text-white',
    sold: 'bg-red-600 text-white',
  }

  return (
    <Link
      href={`/ireland/in-stock/${listing.id}`}
      className="group bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      <div className="relative h-64">
        {hasImage ? (
          <Image
            src={listing.images[listing.primaryImage || 0] || listing.images[0]}
            alt={`${listing.model} horsebox - ${listing.color}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
            <Truck className="w-16 h-16 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`inline-flex items-center px-3 py-1 text-sm font-semibold ${statusColors[listing.status] || statusColors.available}`}
          >
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-white to-slate-50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{listing.model}</h3>
            <p className="text-sm text-slate-500">
              {listing.color} &middot; {listing.year}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900">{formatEur(listing.price)}</span>
            <p className="text-xs text-slate-500">complete vehicle · exc. VAT</p>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-4" />

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{listing.mileage.toLocaleString('en-IE')} km</span>
          <span className="inline-flex items-center text-blue-700 font-medium group-hover:translate-x-1 transition-transform">
            View Details
            <ArrowRight className="ml-1 w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function IrelandInStockPage() {
  const listings = await getAllStock('available')

  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.ie' },
    { name: 'Ireland', url: 'https://jthltd.ie/ireland' },
    { name: 'In Stock', url: 'https://jthltd.ie/ireland/in-stock' },
  ]

  const itemListSchema = listings.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Horseboxes In Stock - Ireland',
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: `${listing.model} - ${listing.year}`,
        description: listing.description,
        offers: {
          '@type': 'Offer',
          price: listing.price,
          priceCurrency: 'EUR',
          availability: listing.status === 'available'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
        },
        url: `https://jthltd.ie/ireland/in-stock/${listing.id}`,
      },
    })),
  } : null

  return (
    <>
    <Schema schema={[generateBreadcrumbSchema(breadcrumbs), ...(itemListSchema ? [itemListSchema] : [])]} />
    <main>
      {/* Hero Section */}
      <HeroAdvanced
        title="Horseboxes In Stock"
        subtitle="Available for Delivery to Ireland"
        description="Browse our current stock of premium British-built horseboxes. Ready for immediate collection or delivery to Ireland."
        primaryCTA={{
          text: 'View Stock',
          href: '#stock',
        }}
        secondaryCTA={{
          text: 'Get a Quote',
          href: '/contact',
        }}
        media={[
          {
            type: 'image',
            src: '/ireland/jth-professional-35-horsebox-navy-gold-front-ireland.webp',
          },
        ]}
        overlay="gradient"
        height="medium"
        parallax
      />

      {/* Stock Grid */}
      <section id="stock" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <Tag className="w-4 h-4" />
              Prices in EUR &middot; Delivery to Ireland included
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
              Current <span className="text-blue-700">Stock</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              All horseboxes listed below are available for immediate purchase and delivery to
              Ireland.
            </p>
          </div>

          {listings.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <StockCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white shadow-lg">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                No Horseboxes Currently In Stock
              </h3>
              <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8">
                No horseboxes currently in stock. Contact us to discuss build-to-order options
                tailored to your exact requirements.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-all duration-300"
              >
                Discuss Build-to-Order
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-800 py-16 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Looking for Something Specific?
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-10">
            Can&apos;t find what you&apos;re looking for? We build custom horseboxes to your exact
            specification. Contact us to discuss your perfect 3.5 tonne horsebox, delivered direct
            to Ireland.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-10 py-4 bg-white text-blue-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Get a Custom Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="tel:+353872557015"
              className="inline-flex items-center px-10 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-700 transition-all"
            >
              <Phone className="mr-2 w-5 h-5" />
              Call +353 87 255 7015
            </a>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
