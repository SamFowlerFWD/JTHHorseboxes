import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { loadPricingConfig } from '@/lib/pricing'
import { Check, Phone, Mail, MapPin, Users } from 'lucide-react'
import TrustIndicators from '@/components/TrustIndicators'
import type { Metadata } from 'next'
import Schema, { generateProductSchema, generateBreadcrumbSchema } from '@/components/Schema'
import { weightBadge, modelCardImage } from '@/lib/models'

export const metadata: Metadata = {
  title: 'Horsebox Models - 3.5t, 4.5t, 7.2t & 7.5t Range | JTH Horseboxes Norfolk',
  description: 'Explore our complete range of 3.5 tonne, 4.5 tonne, 7.2 tonne and 7.5 tonne horseboxes. JTH Professional 35, JTH Principle 35, Aeos Edge, Freedom, Discovery models & Helios 75. Starting from £19,500 + VAT. View specifications, compare models and configure your perfect horsebox.',
  keywords: '3.5t horsebox models, 4.5t horsebox range, 7.2t horsebox, 7.5t horsebox, JTH Professional 35, JTH Principle 35, Aeos Edge 45, Aeos Freedom 45, Aeos Discovery 45, Aeos Discovery 72, Helios 75, horsebox comparison, horsebox specifications, British horsebox models',
  openGraph: {
    title: 'JTH Horsebox Models - Complete 3.5t, 4.5t & 7.2t Range',
    description: 'View our complete range of British-built horseboxes. 3.5t, 4.5t & 7.2t models from £19,500 + VAT. Compare specifications and configure online.',
    images: ['/models/professional-35/01.webp'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://jthltd.co.uk/models',
  },
}

export default async function ModelsPage() {
  const cfg = await loadPricingConfig()
  const active = cfg.models.filter(m => m.active)
  
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Models', url: 'https://jthltd.co.uk/models' }
  ]

  // Only generate product schemas for models with pricing
  const modelsWithPricing = active.filter(m => m.basePricePence != null)
  const productSchemas = modelsWithPricing.map(model => generateProductSchema({
    name: model.name,
    description: `JTH ${model.name} - Premium ${model.slug.includes('35') ? '3.5 tonne' : model.slug.includes('45') ? '4.5 tonne' : '7.2 tonne'} horsebox built in Norfolk, UK`,
    image: `https://jthltd.co.uk/models/${model.slug}/01.webp`,
    price: model.basePricePence! / 100,
    sku: model.slug.toUpperCase(),
    category: model.slug.includes('35') ? '3.5 Tonne Horsebox' : model.slug.includes('45') ? '4.5 Tonne Horsebox' : '7.2 Tonne Horsebox'
  }))
  
  return (
    <>
      <Schema schema={[generateBreadcrumbSchema(breadcrumbs), ...productSchemas]} />
      <main>
      {/* Hero Section */}
      <Hero 
        primarySrc="/models/professional-35/01.webp" 
        fallbackSrc="/models/professional-35/01.webp"
        height="md"
        overlay="gradient"
      >
        <div className="w-full self-end pb-16 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-6xl text-white leading-[1.06]">
              3.5t, 4.5t, 7.2t &amp; 7.5t Horsebox Models
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed">
              Compare our complete range of British-built horseboxes. From the JTH Principle 35
              at £19,500 + VAT to the Helios 75.
            </p>
            {/* Coachline: the painted stripe down the flank of a coachbuilt body. */}
            <div className="mt-10 flex flex-col gap-[4px]">
              <span className="block h-[2px] w-32 bg-brass-light" />
              <span className="block h-px w-20 bg-brass-light/60" />
            </div>
          </div>
        </div>
      </Hero>

      {/* Models Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {active.map((model) => (
            <div key={model.id} className="group bg-white overflow-hidden border border-line shadow-sm hover:shadow-md transition-all duration-500">
              <div className="relative h-64 bg-paper">
                {modelCardImage(model.slug) ? (
                  <Image
                    src={modelCardImage(model.slug) as string}
                    alt={model.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center border-b border-line">
                    <span className="text-sm text-slate-500">Photography in preparation</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,31,45,0.35),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center bg-blue-700 px-3 py-1 text-sm font-semibold text-white">
                    {weightBadge(model.slug)}
                  </span>
                </div>
                {model.slug === 'principle-35' && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center bg-ink px-3 py-1 text-sm font-medium text-white">
                      Most popular
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-paper">
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <h2 className="font-display text-2xl text-ink leading-tight">{model.name}</h2>
                  {/* Without a price the slot held "Contact for pricing" at
                      heading size, which collided with the model name. A
                      bespoke build has a price on application; say so quietly. */}
                  {model.basePricePence ? (
                    <span className="shrink-0 text-right text-2xl font-normal tabular-nums text-ink">
                      <span className="mr-1 text-sm text-slate-500">From</span>
                      £{(model.basePricePence/100).toLocaleString()}
                    </span>
                  ) : (
                    <span className="shrink-0 text-right text-sm text-slate-500">Price on application</span>
                  )}
                </div>
                {model.basePricePence ? (
                  <p className="-mt-3 mb-4 text-right text-xs text-slate-500">body build only · exc. VAT</p>
                ) : null}
                
                <div className="w-full h-px bg-line mb-4"></div>
                
                <p className="text-slate-600 mb-6">
                  {model.slug === 'professional-35' && 'The ultimate in luxury and performance for the professional rider.'}
                  {model.slug === 'principle-35' && 'Perfect balance of quality and value for the discerning owner.'}
                  {model.slug === 'progeny-35' && 'Crew cab 3.5t horsebox with up to 7 seats — top of the range specification.'}
                  {model.slug === 'jth-principle-45' && 'Essential 4.5t horsebox with proven JTH quality at an affordable price.'}
                  {model.slug === 'jth-professional-45' && 'Premium 4.5t horsebox with luxury features included as standard.'}
                  {model.slug === 'jth-progeny-45' && 'Crew cab 4.5t horsebox designed for teams and families.'}
                  {model.slug.includes('aeos') && model.slug.includes('45') && 'Part of our renowned Aeos 4.5t range with superior build quality.'}
                  {model.slug === 'aeos-discovery-72' && 'The ultimate 7.2t horsebox with apartment-quality living.'}
                  {model.slug === 'helios-75' && 'Our flagship 7.5t model for professional teams and international competitors.'}
                </p>

                <div className="space-y-3 mb-6">
                  {model.slug === 'professional-35' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Premium finish and materials
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Advanced features included
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Professional specification
                      </div>
                    </>
                  )}
                  {model.slug === 'principle-35' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Quality construction
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Essential features included
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Great value proposition
                      </div>
                    </>
                  )}
                  {model.slug === 'progeny-35' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Crew cab — up to 7 seats
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        3 front + 4 rear crew cab seats
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0" />
                        Premium materials throughout
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link 
                    href={`/models/${model.slug}`} 
                    className="group/btn flex-1 inline-flex items-center justify-center bg-blue-700 px-4 py-3 text-white font-semibold hover:bg-blue-800 transition-all duration-300"
                  >
                    View Details
                  </Link>
                  <Link
                    href="/contact"
                    className="flex-1 inline-flex items-center justify-center ring-1 ring-inset ring-blue-800/35 px-4 py-3 text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="alt" />

      {/* Comprehensive Model Comparison Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-6 leading-[1.1]">
            Complete Guide to Choosing Your 3.5t, 4.5t or 7.2t Horsebox
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            As specialists in horsebox manufacturing, we understand that choosing the right model is crucial.
            Our comprehensive range covers every need from amateur riders to professional competitors.
          </p>
        </div>

        {/* Detailed Model Information */}
        <div className="prose prose-lg max-w-none mb-16">
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Understanding Horsebox Weight Categories</h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 border-2 border-blue-100">
              <h4 className="text-xl font-semibold text-blue-700 mb-4">3.5 Tonne Horseboxes</h4>
              <p className="text-slate-600 mb-4">
                Our most popular category, 3.5t horseboxes can be driven on a standard car licence, whenever you passed
                your test. These models comfortably transport two horses up to 16.2hh while offering essential 
                living amenities.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>JTH Principle 35:</strong> £19,500 - Best value, quality construction</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>JTH Professional 35:</strong> £22,950 - Premium features, professional specification</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 border-2 border-blue-100">
              <h4 className="text-xl font-semibold text-blue-700 mb-4">4.5 Tonne Horseboxes</h4>
              <p className="text-slate-600 mb-4">
                Stepping up to 4.5t provides significantly more payload, allowing for enhanced living quarters, additional 
                equipment storage, and the ability to carry larger horses or three ponies. Requires a C1 licence, which drivers who
                passed their car test before 1997 usually hold already.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Edge 45:</strong> £31,500 - Professional competition specification</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Freedom 45:</strong> £36,500 - Weekender model with family-friendly design</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Discovery 45:</strong> £46,100 - Luxury apartment-style living</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 border-2 border-blue-100">
              <h4 className="text-xl font-semibold text-blue-700 mb-4">7.2 & 7.5 Tonne Horseboxes</h4>
              <p className="text-slate-600 mb-4">
                Our flagship Aeos Discovery 72 and Helios 75 models represent the pinnacle of horsebox luxury. With capacity for 2-4 horses and 
                apartment-quality living quarters, they're the choice of international competitors and professional teams.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Discovery 72:</strong> £74,600 - Ultimate 7.2t luxury</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Helios 75:</strong> £82,500 - Flagship 7.5t model</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span>Apartment-quality living quarters</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-brass mr-2 flex-shrink-0 mt-0.5" />
                  <span>Fully customizable to your specification</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Comparison Table */}
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Quick Model Comparison</h3>
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-4 font-semibold text-slate-900">Model</th>
                  <th className="text-center p-4 font-semibold text-slate-900">Weight</th>
                  <th className="text-center p-4 font-semibold text-slate-900">Horses</th>
                  <th className="text-center p-4 font-semibold text-slate-900">Living</th>
                  <th className="text-center p-4 font-semibold text-slate-900">Price From</th>
                  <th className="text-center p-4 font-semibold text-slate-900">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-4 font-medium text-blue-700">JTH Principle 35</td>
                  <td className="p-4 text-center">3.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Basic</td>
                  <td className="p-4 text-center font-semibold">£19,500</td>
                  <td className="p-4 text-center">First-time buyers, budget conscious</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-700">JTH Professional 35</td>
                  <td className="p-4 text-center">3.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Comfort</td>
                  <td className="p-4 text-center font-semibold">£22,950</td>
                  <td className="p-4 text-center">Regular competitors, professionals</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-700">Aeos Edge 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2-3</td>
                  <td className="p-4 text-center">Extended</td>
                  <td className="p-4 text-center font-semibold">£31,500</td>
                  <td className="p-4 text-center">Serious competitors, multi-day events</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-700">Aeos Freedom 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2-3</td>
                  <td className="p-4 text-center">Weekender</td>
                  <td className="p-4 text-center font-semibold">£36,500</td>
                  <td className="p-4 text-center">Families, weekend trips</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-700">Aeos Discovery 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Luxury</td>
                  <td className="p-4 text-center font-semibold">£46,100</td>
                  <td className="p-4 text-center">Luxury living, extended stays</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-700">Aeos Discovery 72</td>
                  <td className="p-4 text-center">7.2t</td>
                  <td className="p-4 text-center">2-4</td>
                  <td className="p-4 text-center">Ultimate</td>
                  <td className="p-4 text-center font-semibold">£74,600</td>
                  <td className="p-4 text-center">International competitors, teams</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-700">Helios 75</td>
                  <td className="p-4 text-center">7.5t</td>
                  <td className="p-4 text-center">3-4</td>
                  <td className="p-4 text-center">Flagship</td>
                  <td className="p-4 text-center font-semibold">£82,500</td>
                  <td className="p-4 text-center">Professional teams, Olympic level</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Buying Guide */}
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">How to Choose the Right Horsebox Model</h3>
          <div className="bg-blue-50 p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Consider Your Needs:</h4>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>
                    <span><strong>License Type:</strong> Do you have a standard car license (3.5t) or C1/HGV (4.5t/7.2t)?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>
                    <span><strong>Horse Size & Number:</strong> How many horses and what size do you need to transport?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>
                    <span><strong>Usage Frequency:</strong> Weekend leisure or regular competition schedule?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">4.</span>
                    <span><strong>Living Requirements:</strong> Day trips only or overnight accommodation needed?</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Budget Considerations:</h4>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Purchase Price:</strong> From £19,500 to £74,600+ depending on model</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Running Costs:</strong> 3.5t models have lower fuel and insurance costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Finance Options:</strong> We work with excellent finance providers and can provide referrals on request</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Part Exchange:</strong> We accept trade-ins to reduce your cost</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-5xl text-ink leading-[1.1]">
              Why Choose JTH Horseboxes?
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Every JTH horsebox is built with precision, innovation, and the highest quality materials.
            </p>
          </div>

          {/* Three claims of equal weight. A rule over each says that
              without three decorative glyphs saying it instead. */}
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
            <div className="border-t border-ink/15 pt-6">
              <h3 className="text-lg font-medium text-ink">British Innovation</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Leading the industry with creative designs and advanced materials technology.
              </p>
            </div>

            <div className="border-t border-ink/15 pt-6">
              <h3 className="text-lg font-medium text-ink">Premium Quality</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Stunning finish and premium materials fitted as standard on every horsebox.
              </p>
            </div>

            <div className="border-t border-ink/15 pt-6">
              <h3 className="text-lg font-medium text-ink">Made in Britain</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Built in Great Britain with decades of expertise and craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Contact Info */}
      <section className="bg-blue-900 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 leading-[1.1]">
              Ready to Find Your Perfect Horsebox?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Find your ideal 3.5t, 4.5t or 7.2t horsebox. Contact us for a quote or visit our Norfolk workshop to see our horseboxes being built.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="btn-on-dark">
                Get a Quote
              </Link>
              <a href="tel:01603552109" className="btn-on-dark-outline">
                <Phone className="mr-2 w-5 h-5" />
                Call 01603 552109
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 pt-12 border-t border-blue-500">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Norfolk Workshop</h3>
              <p className="text-blue-100 text-sm">Norfolk<br />United Kingdom</p>
            </div>
            <div className="text-center">
              <Phone className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Call Us</h3>
              <p className="text-blue-100 text-sm">01603 552109<br />Mon-Sat</p>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-blue-100 text-sm">sales@jthltd.co.uk<br />Quick response</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Family Run</h3>
              <p className="text-blue-100 text-sm">Personal service<br />Built to your spec</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
