import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { loadPricingConfig } from '@/lib/pricing'
import { ArrowRight, Check, Star, Award, Shield, Phone, Mail, MapPin, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Schema, { generateProductSchema, generateBreadcrumbSchema } from '@/components/Schema'

export const metadata: Metadata = {
  title: 'Horsebox Models - 3.5t, 4.5t, 7.2t & 7.5t Range | JTH Horseboxes Norfolk',
  description: 'Explore our complete range of 3.5 tonne, 4.5 tonne, 7.2 tonne and 7.5 tonne horseboxes. JTH Professional 35, JTH Principle 35, Aeos QV ST 35, Aeos Edge, Freedom, Discovery models & Helios 75. Starting from £18,500. View specifications, compare models and configure your perfect horsebox.',
  keywords: '3.5t horsebox models, 4.5t horsebox range, 7.2t horsebox, 7.5t horsebox, JTH Professional 35, JTH Principle 35, Aeos QV ST 35, Aeos Edge 45, Aeos Freedom 45, Aeos Discovery 45, Aeos Discovery 72, Helios 75, horsebox comparison, horsebox specifications, British horsebox models',
  openGraph: {
    title: 'JTH Horsebox Models - Complete 3.5t, 4.5t & 7.2t Range',
    description: 'View our complete range of British-built horseboxes. 3.5t, 4.5t & 7.2t models from £18,500. Compare specifications and configure online.',
    images: ['/models/hero.jpg'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://jthltd.co.uk/models',
  },
}

export default async function ModelsPage() {
  const cfg = await loadPricingConfig()
  const active = cfg.models.filter(m => m.active && m.basePricePence != null)
  
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Models', url: 'https://jthltd.co.uk/models' }
  ]

  const productSchemas = active.map(model => generateProductSchema({
    name: model.name,
    description: `JTH ${model.name} - Premium ${model.slug.includes('35') ? '3.5 tonne' : model.slug.includes('45') ? '4.5 tonne' : '7.2 tonne'} horsebox built in Norfolk, UK`,
    image: `https://jthltd.co.uk/models/${model.slug}/01.jpg`,
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
        primarySrc="/models/hero.jpg" 
        fallbackSrc="/models/professional-35/01.jpg"
        height="md"
        overlay="gradient"
      >
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Premium British Horseboxes</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6">3.5t, 4.5t, 7.2t & 7.5t Horsebox Models</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Compare our complete range of British-built horseboxes. From the affordable JTH Principle 35 at £18,500 
            to the luxury Helios 75, find your perfect horsebox for any budget and requirement.
          </p>
        </div>
      </Hero>

      {/* Models Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {active.map((model) => (
            <div key={model.id} className="group bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-64">
                <Image 
                  src={`/models/${model.slug}/01.jpg`} 
                  alt={model.name} 
                  fill 
                  sizes="(min-width: 1024px) 33vw, 100vw" 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    {model.slug.includes('35') ? '3.5T' : '4.5T'}
                  </span>
                </div>
                {model.slug === 'principle-35' && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-blue-600">
                      MOST POPULAR
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-gradient-to-b from-white to-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{model.name}</h2>
                    <p className="text-sm text-blue-600 font-medium">Starting from</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">
                      £{(model.basePricePence!/100).toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-500">exc. VAT</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-4"></div>
                
                <p className="text-slate-600 mb-6">
                  {model.slug === 'professional-35' && 'The ultimate in luxury and performance for the professional rider.'}
                  {model.slug === 'principle-35' && 'Perfect balance of quality and value for the discerning owner.'}
                  {model.slug === 'progeny-35' && 'Top of the range with Pioneer Package included.'}
                  {model.slug.includes('aeos') && model.slug.includes('45') && 'Part of our renowned Aeos 4.5t range with superior build quality.'}
                  {model.slug === 'aeos-discovery-72' && 'The ultimate 7.2t horsebox with apartment-quality living.'}
                  {model.slug === 'helios-75' && 'Our flagship 7.5t model for professional teams and international competitors.'}
                </p>

                <div className="space-y-3 mb-6">
                  {model.slug === 'professional-35' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Premium finish and materials
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Advanced features included
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Professional specification
                      </div>
                    </>
                  )}
                  {model.slug === 'principle-35' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Quality construction
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Essential features included
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Great value proposition
                      </div>
                    </>
                  )}
                  {model.slug === 'progeny-35' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Stallion partition included
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Enhanced safety features
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        Premium materials throughout
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link 
                    href={`/models/${model.slug}`} 
                    className="group/btn flex-1 inline-flex items-center justify-center bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition-all duration-300"
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  <Link 
                    href={`/configurator/${model.slug}`} 
                    className="flex-1 inline-flex items-center justify-center border-2 border-blue-600 px-4 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Configure
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-blue-50 py-12 border-y border-blue-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">2 Year</div>
              <div className="text-sm text-slate-600">Warranty</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">30+</div>
              <div className="text-sm text-slate-600">Years Experience</div>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Happy Owners</div>
            </div>
            <div className="text-center">
              <Check className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">Premium</div>
              <div className="text-sm text-slate-600">Quality Standard</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Model Comparison Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
            Complete Guide to Choosing Your <span className="text-blue-600">3.5t, 4.5t or 7.2t Horsebox</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            With over 30 years of experience building horseboxes, we understand that choosing the right model is crucial. 
            Our comprehensive range covers every need from amateur riders to Olympic competitors.
          </p>
        </div>

        {/* Detailed Model Information */}
        <div className="prose prose-lg max-w-none mb-16">
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Understanding Horsebox Weight Categories</h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 border-2 border-blue-100">
              <h4 className="text-xl font-semibold text-blue-600 mb-4">3.5 Tonne Horseboxes</h4>
              <p className="text-slate-600 mb-4">
                Our most popular category, 3.5t horseboxes are perfect for owners who want to use their standard driving license 
                (if passed before 1997). These models comfortably transport two horses up to 16.2hh while offering essential 
                living amenities.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>JTH Principle 35:</strong> £18,500 - Best value, quality construction</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>JTH Professional 35:</strong> £22,950 - Premium features, professional specification</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos QV ST 35:</strong> £24,500 - Stallion partition, enhanced versatility</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 border-2 border-blue-100">
              <h4 className="text-xl font-semibold text-blue-600 mb-4">4.5 Tonne Horseboxes</h4>
              <p className="text-slate-600 mb-4">
                Stepping up to 4.5t provides significantly more payload, allowing for enhanced living quarters, additional 
                equipment storage, and the ability to carry larger horses or three ponies. Requires C1 license.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos QV 45:</strong> £28,950 - Quality 4.5t model with essential features</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Edge 45:</strong> £31,500 - Professional competition specification</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Freedom 45:</strong> £36,500 - Weekender model with family-friendly design</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Discovery 45:</strong> £46,100 - Luxury apartment-style living</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 border-2 border-blue-100">
              <h4 className="text-xl font-semibold text-blue-600 mb-4">7.2 & 7.5 Tonne Horseboxes</h4>
              <p className="text-slate-600 mb-4">
                Our flagship Aeos Discovery 72 and Helios 75 models represent the pinnacle of horsebox luxury. With capacity for 2-4 horses and 
                apartment-quality living quarters, they're the choice of international competitors and professional teams.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Aeos Discovery 72:</strong> £74,600 - Ultimate 7.2t luxury</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Helios 75:</strong> £82,500 - Flagship 7.5t model</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Apartment-quality living quarters</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
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
                  <td className="p-4 font-medium text-blue-600">JTH Principle 35</td>
                  <td className="p-4 text-center">3.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Basic</td>
                  <td className="p-4 text-center font-semibold">£18,500</td>
                  <td className="p-4 text-center">First-time buyers, budget conscious</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-600">JTH Professional 35</td>
                  <td className="p-4 text-center">3.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Comfort</td>
                  <td className="p-4 text-center font-semibold">£22,950</td>
                  <td className="p-4 text-center">Regular competitors, professionals</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-600">Aeos QV ST 35</td>
                  <td className="p-4 text-center">3.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Luxury</td>
                  <td className="p-4 text-center font-semibold">£24,500</td>
                  <td className="p-4 text-center">Stallion transport, versatile use</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-600">Aeos QV 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2-3</td>
                  <td className="p-4 text-center">Standard</td>
                  <td className="p-4 text-center font-semibold">£28,950</td>
                  <td className="p-4 text-center">Regular competitors</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-600">Aeos Edge 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2-3</td>
                  <td className="p-4 text-center">Extended</td>
                  <td className="p-4 text-center font-semibold">£31,500</td>
                  <td className="p-4 text-center">Serious competitors, multi-day events</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-600">Aeos Freedom 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2-3</td>
                  <td className="p-4 text-center">Weekender</td>
                  <td className="p-4 text-center font-semibold">£36,500</td>
                  <td className="p-4 text-center">Families, weekend trips</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-600">Aeos Discovery 45</td>
                  <td className="p-4 text-center">4.5t</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">Luxury</td>
                  <td className="p-4 text-center font-semibold">£46,100</td>
                  <td className="p-4 text-center">Luxury living, extended stays</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-blue-600">Aeos Discovery 72</td>
                  <td className="p-4 text-center">7.2t</td>
                  <td className="p-4 text-center">2-4</td>
                  <td className="p-4 text-center">Ultimate</td>
                  <td className="p-4 text-center font-semibold">£74,600</td>
                  <td className="p-4 text-center">International competitors, teams</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-blue-600">Helios 75</td>
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
                    <span><strong>Purchase Price:</strong> From £18,500 to £74,600+ depending on model</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Running Costs:</strong> 3.5t models have lower fuel and insurance costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Finance Options:</strong> HP and lease purchase available from 1-7 years</span>
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
      <section className="bg-gradient-to-br from-slate-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
              Why Choose <span className="text-blue-600">JTH Horseboxes?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every JTH horsebox is built with precision, innovation, and the highest quality materials.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">British Innovation</h3>
              <p className="text-slate-600">
                Leading the industry with creative designs and advanced materials technology.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Premium Quality</h3>
              <p className="text-slate-600">
                Stunning finish and premium materials fitted as standard on every horsebox.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Made in Britain</h3>
              <p className="text-slate-600">
                Built in Great Britain with decades of expertise and craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Contact Info */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Ready to Find Your Perfect Horsebox?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Configure your ideal 3.5t, 4.5t or 7.2t horsebox online or visit our Norfolk showroom to see our models in person.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/configurator" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold hover:bg-slate-50 transition-all">
                Configure Online
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="tel:01603552109" className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition-all">
                <Phone className="mr-2 w-5 h-5" />
                Call 01603 552109
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 pt-12 border-t border-blue-500">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Norfolk Showroom</h3>
              <p className="text-blue-100 text-sm">Beeston, Norfolk<br />United Kingdom</p>
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
              <h3 className="text-white font-semibold mb-2">Experience</h3>
              <p className="text-blue-100 text-sm">30+ Years<br />500+ Happy Customers</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
