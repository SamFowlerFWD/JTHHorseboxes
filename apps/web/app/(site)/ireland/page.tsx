import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Shield, Star, Truck, Users, Phone, Wrench, MapPin } from 'lucide-react'
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

const deliverySteps = [
  {
    step: '1',
    title: 'Configure & Order',
    description: 'Choose your model, select options, and place your order. We handle everything from our Norfolk workshop.',
  },
  {
    step: '2',
    title: 'Built to Your Spec',
    description: 'Your horsebox is handcrafted in our Beeston workshop, built to your exact specification with British precision.',
  },
  {
    step: '3',
    title: 'Direct Delivery',
    description: 'We deliver directly to your door anywhere in Ireland. Professional transport with full insurance coverage.',
  },
  {
    step: '4',
    title: 'Handover Training',
    description: 'Comprehensive handover and training session included with every delivery. We ensure you are fully confident with your new horsebox.',
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

        {/* Trust Indicators */}
        <section className="bg-slate-50 py-12 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-700 mx-auto mb-3" />
                <div className="text-2xl font-bold text-slate-900">British Built</div>
                <div className="text-sm text-slate-700">Beeston, Norfolk</div>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-slate-900">Direct to Ireland</div>
                <div className="text-sm text-slate-700">Delivery Included</div>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-slate-900">Family Run</div>
                <div className="text-sm text-slate-700">Personal Service</div>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-700 mx-auto mb-3" />
                <div className="text-2xl font-bold text-slate-900">35+ Years</div>
                <div className="text-sm text-slate-700">Combined Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3.5t Model Cards */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                All driven on a standard car licence
              </div>
              <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
                Our 3.5 Tonne <span className="text-blue-700">Range for Ireland</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Two premium models to suit every budget and requirement. All built in Great Britain, delivered direct to your door in Ireland.
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

        {/* Delivery to Ireland Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
                Delivery to <span className="text-emerald-600">Ireland</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                We deliver directly to customers throughout Ireland. Every delivery includes a comprehensive handover and training session.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {deliverySteps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-gradient-to-r from-emerald-50 to-blue-50 p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <Wrench className="w-12 h-12 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Full Handover Training Included</h3>
                  <p className="text-slate-600">
                    Every delivery to Ireland includes a comprehensive walkthrough of your new horsebox. We cover all features,
                    maintenance requirements, and safety systems to ensure you are completely confident. Our team stays with you
                    until you are happy with every detail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dealer Teaser */}
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

        {/* Why Choose JTH */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
                Why Choose <span className="text-blue-700">JTH?</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Built in Great Britain with decades of expertise, every JTH horsebox leads through innovation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-white to-slate-50 p-8 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Lightweight Aluminium Construction</h3>
                <p className="text-slate-600">
                  Advanced lightweight construction means more payload for your horses and equipment. Our 3.5t models
                  maximise usable weight while maintaining structural integrity.
                </p>
              </div>
              <div className="bg-gradient-to-b from-white to-slate-50 p-8 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Fully Customisable</h3>
                <p className="text-slate-600">
                  Every JTH horsebox is fully customisable. Choose colours, layouts, and optional
                  extras to create a horsebox that is uniquely yours. Contact us to discuss your requirements.
                </p>
              </div>
              <div className="bg-gradient-to-b from-white to-slate-50 p-8 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Warranty & Aftercare</h3>
                <p className="text-slate-600">
                  Every JTH horsebox comes with a 2-year structural warranty. Our aftercare team supports customers across
                  the UK and Ireland with advice and parts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-800 py-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Ready to Find Your Horsebox?
            </h2>
            <div className="w-24 h-px bg-amber-400 mx-auto mb-8" />
            <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-10">
              Contact our team to discuss your perfect 3.5 tonne horsebox.
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

            <div className="grid md:grid-cols-3 gap-8 pt-12 mt-12 border-t border-blue-500">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Ireland Representative</h3>
                <p className="text-blue-100 text-sm">Paul Morton<br />Ballyboden, Dublin</p>
              </div>
              <div className="text-center">
                <Phone className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Call Us</h3>
                <p className="text-blue-100 text-sm">+353 87 255 7015<br />Mon-Sat</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Ireland Delivery</h3>
                <p className="text-blue-100 text-sm">Direct to your door<br />Training included</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
