import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Phone, MapPin, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import Schema, { generateProductSchema, generateBreadcrumbSchema } from '@/components/Schema'
import { formatPrice } from '@/lib/configurator/calculations'
import { getRegionConfig } from '@/lib/configurator/region'
import IrelandHero from './IrelandHero'

// Compute EUR prices at module scope (pure functions, safe for server components)
const ieConfig = getRegionConfig('IE')
const toEur = (gbp: number) => Math.round(gbp * ieConfig.markup * ieConfig.exchangeRate)

const eurPrinciple = formatPrice(18500, 'IE')
const eurProfessional = formatPrice(22000, 'IE')

export const metadata: Metadata = {
  title: 'Horseboxes Ireland - Premium 3.5t British Horseboxes Delivered to Ireland | JTH',
  description: `Premium British-built 3.5 tonne horseboxes delivered direct to Ireland. Principle 35 from ${eurPrinciple}, Professional 35 from ${eurProfessional}. Drive on a standard car licence. Direct delivery with full handover training included.`,
  keywords: 'horsebox Ireland, 3.5t horsebox Ireland, horsebox delivery Ireland, British horsebox Ireland, buy horsebox Ireland, JTH Ireland, horse transport Ireland, Principle 35, Professional 35',
  openGraph: {
    title: 'JTH Horseboxes Ireland - Premium 3.5t Range Delivered Direct',
    description: `Premium British-built 3.5t horseboxes delivered to Ireland. From ${eurPrinciple} exc. VAT. Drive on a standard car licence.`,
    images: ['/models/professional-35/02.webp'],
    type: 'website',
    locale: 'en_IE',
    siteName: 'JTH Horseboxes',
  },
  alternates: {
    canonical: 'https://jthltd.co.uk/ireland',
  },
}

const models = [
  {
    slug: 'principle-35',
    name: 'Principle 35',
    subtitle: 'Best Value Entry Point',
    price: eurPrinciple,
    gbpBase: 18500,
    description: 'The perfect balance of quality and value. Ideal for first-time horsebox buyers looking for British build quality without compromise.',
    image: '/models/principle-35/02.webp',
    features: [
      'Quality GRP construction',
      '2 horse capacity up to 16.2hh',
      'Essential features included',
      'Lightweight aluminium design',
    ],
    badge: 'Best Value',
    badgeColor: 'bg-emerald-600',
  },
  {
    slug: 'professional-35',
    name: 'Professional 35',
    subtitle: 'Most Popular Choice',
    price: eurProfessional,
    gbpBase: 22000,
    description: 'Our most popular model with premium features included as standard. The choice of serious competitors across the UK and Ireland.',
    image: '/models/professional-35/02.webp',
    features: [
      'Premium finish and materials',
      'Advanced safety features',
      'Professional specification throughout',
      'Comfort living area',
    ],
    badge: 'Most Popular',
    badgeColor: 'bg-blue-700',
  },
]

export default function IrelandPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Ireland', url: 'https://jthltd.co.uk/ireland' },
  ]

  const productSchemas = models.map((model) =>
    generateProductSchema({
      name: `JTH ${model.name}`,
      description: `JTH ${model.name} - Premium 3.5 tonne horsebox delivered to Ireland. ${model.description}`,
      image: `https://jthltd.co.uk${model.image}`,
      price: toEur(model.gbpBase),
      sku: model.slug.toUpperCase(),
      category: '3.5 Tonne Horsebox',
      priceCurrency: 'EUR',
    })
  )

  return (
    <>
      <Schema schema={[generateBreadcrumbSchema(breadcrumbs), ...productSchemas]} />
      <main>
        {/* Hero Section */}
        <IrelandHero />

        {/* 3.5t Model Cards */}
        <section id="models" className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                All driven on a standard car licence
              </div>
              <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
                Our 3.5 Tonne <span className="text-blue-700">Range for Ireland</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Two premium models available for delivery to Ireland. Built in Great Britain, delivered direct to your door.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {models.map((model) => (
                <div
                  key={model.slug}
                  className="group bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-64">
                    <Image
                      src={model.image}
                      alt={`JTH ${model.name} horsebox for Ireland`}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center bg-blue-700 px-3 py-1 text-sm font-semibold text-white">
                        3.5T
                      </span>
                    </div>
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`inline-flex items-center ${model.badgeColor} px-3 py-1 text-sm font-semibold text-white`}>
                        {model.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-b from-white to-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{model.name}</h3>
                        <p className="text-sm text-blue-700 font-medium">{model.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900">{model.price}</span>
                        <p className="text-xs text-slate-500">exc. VAT</p>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-4" />

                    <p className="text-slate-600 mb-6 text-sm">{model.description}</p>

                    <div className="space-y-3 mb-6">
                      {model.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm text-slate-600">
                          <Check className="w-4 h-4 text-blue-700 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/ireland/models/${model.slug}`}
                        className="group/btn flex-1 inline-flex items-center justify-center bg-blue-700 px-4 py-3 text-white font-semibold hover:bg-blue-800 transition-all duration-300"
                      >
                        View Details
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                      <Link
                        href="/contact"
                        className="flex-1 inline-flex items-center justify-center border-2 border-blue-700 px-4 py-3 text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Get a Quote
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Representative in Ireland */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                Your Representative in <span className="text-amber-400">Ireland</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-4">
                Paul Morton is your dedicated JTH representative in Ireland, based in Dublin.
                Contact Paul directly for sales enquiries, viewings and delivery arrangements.
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Taylors Lane, Ballyboden, Rathfarnham, Dublin, D16 CV91
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="tel:+353872557015"
                  className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all rounded-lg"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Call +353 87 255 7015
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-slate-900 transition-all rounded-lg"
                >
                  Contact Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-800 py-16 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Ready to Find Your Horsebox?
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-10">
              Contact us to discuss your perfect 3.5 tonne horsebox.
              We deliver direct to Ireland with full handover training included.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-10 py-4 bg-white text-blue-700 font-semibold hover:bg-slate-50 transition-all rounded-lg"
              >
                Get a Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="tel:+353872557015"
                className="inline-flex items-center px-10 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-700 transition-all rounded-lg"
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
