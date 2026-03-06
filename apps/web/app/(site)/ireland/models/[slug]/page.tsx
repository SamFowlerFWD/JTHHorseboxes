import { notFound } from 'next/navigation'
import { loadPricingConfig } from '@/lib/pricing'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'

export const runtime = 'edge'
import { ArrowRight, Check, Shield, Award, Star, Truck, ChevronRight, Phone, Mail, MapPin, Users, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Schema, { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/components/Schema'
import { formatPrice } from '@/lib/configurator/calculations'
import { getRegionConfig } from '@/lib/configurator/region'

const ieConfig = getRegionConfig('IE')
const toEur = (gbp: number) => Math.round(gbp * ieConfig.markup * ieConfig.exchangeRate)

// Only serve these two models for Ireland
const IRELAND_SLUGS = ['principle-35', 'professional-35'] as const

// Model-specific content (same as UK versions)
const modelContent: Record<string, {
  title: string
  description: string
  longDescription: string[]
  features: string[]
  specifications: {
    dimensions: Record<string, string>
    weights: Record<string, string>
    safety: string[]
  }
  gallery: string[]
  testimonial?: {
    name: string
    role: string
    quote: string
  }
  seoKeywords: string
  heroImage: string
  gbpBasePrice: number
}> = {
  'professional-35': {
    title: 'Professional 35 - Premium 3.5t Horsebox for Serious Competitors',
    description: 'The JTH Professional 35 is the ultimate 3.5 tonne horsebox for professional riders and serious competitors. Premium features, luxury finish, advanced safety systems. British-built in Norfolk.',
    longDescription: [
      'The Professional 35 represents the pinnacle of 3.5 tonne horsebox design and engineering. Built for professional riders, serious competitors, and discerning owners who demand the very best, this model combines luxury, performance, and practicality in a package that can be driven on a standard car license.',
      'Every Professional 35 is handcrafted at our Norfolk facility using the finest materials and components. The premium GRP construction ensures exceptional durability while keeping weight to a minimum, maximizing your available payload for horses and equipment. The Iveco Daily chassis provides reliable performance and excellent handling characteristics that inspire confidence on any journey.',
      'The living area in the Professional 35 sets new standards for the 3.5 tonne category. Premium upholstery, solid surface worktops, and thoughtful storage solutions create a comfortable environment for competition days. The horse area features our advanced safety systems including reinforced partitions, premium anti-slip flooring, and comprehensive CCTV monitoring.',
      'Professional riders choose the Professional 35 because it delivers everything needed for successful competition without compromise. From the hydraulic ramp option to the solar power system, every feature has been carefully selected to enhance your equestrian lifestyle. This is more than just transport – it\'s your mobile base for achieving excellence.'
    ],
    features: [
      'Premium GRP monocoque construction for strength and low weight',
      'Luxury living area with leather upholstery and solid surfaces',
      'Advanced CCTV system with horse area monitoring',
      'Solar panel system with leisure battery and inverter',
      'Hydraulic ramp option for easy loading',
      'Premium Iveco Daily chassis with enhanced suspension',
      'Full LED lighting throughout including external work lights',
      'Bluetooth sound system with premium speakers',
      'Air conditioning in living area',
      'External hot and cold shower',
      'Reinforced breast and bum bars',
      'Premium paint finish with metallic options',
      'Tack locker with saddle racks and bridle hooks',
      'Water tank with pump system',
      'Gas hob and grill in kitchen area',
      'Luxury seating converts to sleeping area',
      'Comprehensive warranty and aftercare package'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '6.8m',
        'Overall Width': '2.3m',
        'Overall Height': '3.2m',
        'Internal Height': '2.3m',
        'Horse Area Length': '3.6m',
        'Living Area Length': '2.2m'
      },
      weights: {
        'Gross Weight': '3,500kg',
        'Unladen Weight': '2,200kg',
        'Payload': '1,300kg',
        'Horse Capacity': '2 Horses up to 16.2hh',
        'Tack Storage': 'Premium Locker',
        'Water Capacity': '120 Litres'
      },
      safety: [
        'CCTV monitoring system',
        'Emergency exit doors front and rear',
        'Premium anti-slip rubber flooring',
        'Internal and external LED lighting',
        'Reinforced padded partitions',
        'Secure multi-point door locks',
        'Fire extinguisher and first aid kit',
        'Emergency breakdown kit included'
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp'],
    testimonial: {
      name: 'Sarah Thompson',
      role: 'Professional Event Rider',
      quote: 'The Professional 35 has transformed my competition experience. The quality is outstanding and the attention to detail is second to none. It\'s given me a real competitive edge.'
    },
    seoKeywords: '3.5t horsebox Ireland, Professional 35 Ireland, premium 3.5 tonne horsebox Ireland, competition horsebox Ireland, luxury horsebox delivered Ireland, British horsebox manufacturer, best 3.5t horsebox Ireland',
    heroImage: '/models/professional-35/01.webp',
    gbpBasePrice: 22000,
  },
  'principle-35': {
    title: 'Principle 35 - Essential Quality 3.5t Horsebox',
    description: 'The JTH Principle 35 offers the perfect balance of quality and value for discerning horsebox owners. British built 3.5 tonne horsebox with essential features, delivered direct to Ireland.',
    longDescription: [
      'The Principle 35 represents exceptional value in the 3.5 tonne horsebox market. Built with the same British craftsmanship and attention to detail as our premium models, the Principle 35 delivers essential features without compromise.',
      'Perfect for owners seeking quality construction and reliable performance, this model includes everything you need for safe and comfortable horse transportation. Every Principle 35 is built in our Norfolk facility with decades of expertise.',
      'The Principle 35 proves that quality doesn\'t have to mean expensive. With thoughtful design and efficient production, we deliver a horsebox that meets the needs of most equestrian enthusiasts.'
    ],
    features: [
      'Quality GRP construction',
      'Essential safety features',
      'Comfortable living area',
      'Practical storage solutions',
      'Reliable Iveco Daily chassis',
      'Full 2-year warranty',
      'British built quality',
      'Customization options available'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '6.5m',
        'Overall Width': '2.3m',
        'Overall Height': '3.1m',
        'Internal Height': '2.2m',
        'Horse Area': '3.4m'
      },
      weights: {
        'Gross Weight': '3,500kg',
        'Unladen Weight': '2,100kg',
        'Payload': '1,400kg',
        'Horse Capacity': '2 Horses',
        'Tack Storage': 'Standard'
      },
      safety: [
        'Emergency exit doors',
        'Anti-slip rubber flooring',
        'Internal lighting',
        'Padded partitions',
        'Secure door locks'
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp'],
    testimonial: {
      name: 'Louise Carter',
      role: 'Happy Hacker',
      quote: 'The Principle 35 is perfect for my needs. Great value without compromising on quality or safety. I couldn\'t be happier with my choice.'
    },
    seoKeywords: '3.5t horsebox Ireland, Principle 35 Ireland, value horsebox Ireland, affordable horsebox Ireland, British horsebox delivered Ireland, 3.5 tonne horsebox for sale Ireland',
    heroImage: '/models/principle-35/01.webp',
    gbpBasePrice: 18500,
  },
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const content = modelContent[params.slug]
  if (!content) {
    return {
      title: 'Model Not Found | JTH Horseboxes Ireland',
      description: 'The requested horsebox model could not be found.'
    }
  }

  const eurPrice = formatPrice(content.gbpBasePrice, 'IE')

  return {
    title: `${content.title} | JTH Horseboxes Ireland`,
    description: `${content.description} From ${eurPrice} exc. VAT. Delivered direct to Ireland.`,
    keywords: content.seoKeywords,
    openGraph: {
      title: `${content.title} - Delivered to Ireland`,
      description: `${content.description} From ${eurPrice} exc. VAT.`,
      images: [content.heroImage],
      locale: 'en_IE',
    },
    alternates: {
      canonical: `https://jthltd.co.uk/ireland/models/${params.slug}`,
    },
  }
}

export default async function IrelandModelDetailPage({ params }: { params: { slug: string } }) {
  // Only serve principle-35 and professional-35
  if (!IRELAND_SLUGS.includes(params.slug as typeof IRELAND_SLUGS[number])) {
    return notFound()
  }

  const content = modelContent[params.slug]
  if (!content) {
    return notFound()
  }

  // Try to load pricing config, fall back to content default
  let basePrice: number = content.gbpBasePrice
  try {
    const cfg = await loadPricingConfig()
    const model = cfg.models.find(m => m.slug === params.slug)
    if (model && model.basePricePence != null) {
      basePrice = model.basePricePence / 100
    }
  } catch {
    // Pricing config not available, use default
  }

  const eurPrice = formatPrice(basePrice, 'IE')
  const eurNumeric = toEur(basePrice)
  const modelName = content.title.split(' - ')[0]
  const modelCategory = '3.5 Tonne'

  // Generate FAQ data
  const modelFAQs = [
    {
      question: `How much does the ${modelName} cost in Ireland?`,
      answer: `The ${modelName} starts from ${eurPrice} excluding VAT when delivered to Ireland. Final pricing depends on your chosen options and customizations. We offer competitive finance packages and accept part exchange.`
    },
    {
      question: `What license do I need to drive this horsebox?`,
      answer: 'The 3.5 tonne models can be driven on a standard car license if you passed your test before 1997. Otherwise, you\'ll need B+E or C1 license.'
    },
    {
      question: `What warranty comes with the ${modelName}?`,
      answer: `Every ${modelName} comes with our comprehensive 2-year structural warranty covering all manufacturing defects and structural elements. We support customers across the UK and Ireland.`
    },
    {
      question: `Do you deliver the ${modelName} to Ireland?`,
      answer: `Yes, we deliver directly to customers throughout Ireland. Every delivery includes a comprehensive handover and training session at your door. Delivery is included in the price.`
    }
  ]

  // Schema markup
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Ireland', url: 'https://jthltd.co.uk/ireland' },
    { name: modelName, url: `https://jthltd.co.uk/ireland/models/${params.slug}` }
  ]

  const productSchema = generateProductSchema({
    name: `JTH ${modelName}`,
    description: content.description,
    image: `https://jthltd.co.uk${content.heroImage}`,
    price: eurNumeric,
    sku: `${params.slug.toUpperCase()}-IE`,
    category: `${modelCategory} Horsebox`,
    priceCurrency: 'EUR',
  })

  return (
    <>
      <Schema schema={[generateBreadcrumbSchema(breadcrumbs), productSchema, generateFAQSchema(modelFAQs)]} />
      <main className="bg-white">
      {/* Hero Section */}
      <Hero
        primarySrc={content.heroImage}
        fallbackSrc="/models/professional-35/01.webp"
        height="xl"
        overlay="gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wider uppercase mb-8 animate-fadeIn">
            <Star className="w-4 h-4" />
            <span>{modelCategory} Model — Delivered to Ireland</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-slideUp">
            {modelName}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-slideUp animation-delay-200">
            {content.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 animate-slideUp animation-delay-400">
            <Link href="/contact" className="btn-premium">
              Get a Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="#specifications" className="btn-premium-outline border-white text-white hover:text-slate-900">
              View Specifications
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </Hero>

      {/* Key Features Bar */}
      <section className="bg-slate-900 py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{eurPrice}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Starting Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{content.specifications.weights['Gross Weight']}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Gross Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{content.specifications.weights['Horse Capacity']}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2 Year</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                British Excellence — Delivered to Ireland
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">
                Perfect Balance & Performance
                <span className="text-gradient-blue block mt-2">Built Without Compromise</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mb-8"></div>
              {content.longDescription.map((paragraph, index) => (
                <p key={index} className="text-lg text-slate-600 mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="space-y-4 mt-8">
                {content.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative image-premium">
                <Image
                  src={content.gallery[1] ? `/models/${params.slug}/${content.gallery[1]}` : content.heroImage}
                  alt={`${modelName} interior view`}
                  width={600}
                  height={400}
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specifications" className="py-20 md:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge-gold mx-auto mb-6">
              Full Specifications
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              {modelName} Technical Details
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every {modelName} is built to the highest standards with premium components throughout.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Dimensions Card */}
            <div className="card-dark p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6">Dimensions</h3>
              <div className="space-y-4">
                {Object.entries(content.specifications.dimensions).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-slate-800">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weights & Capacity Card */}
            <div className="card-dark p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6">Weights & Capacity</h3>
              <div className="space-y-4">
                {Object.entries(content.specifications.weights).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-slate-800">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Features Card */}
            <div className="card-dark p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6">Safety Features</h3>
              <div className="space-y-4">
                {content.specifications.safety.map((feature, index) => (
                  <div key={index} className="flex items-center py-3 border-b border-slate-800">
                    <Check className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Key Features & Options
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every {modelName} comes with essential features as standard, with extensive customization options available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-start p-4 bg-white border border-slate-200 hover:border-blue-400 transition-colors">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 md:py-32 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Gallery
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore the {modelName} in detail
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.gallery.map((image, index) => (
              <div key={index} className="image-premium group cursor-pointer">
                <Image
                  src={`/models/${params.slug}/${image}`}
                  alt={`${modelName} view ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      {content.testimonial && (
        <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-light text-white mb-8 italic">
              &ldquo;{content.testimonial.quote}&rdquo;
            </blockquote>
            <div>
              <p className="text-xl text-white font-semibold">{content.testimonial.name}</p>
              <p className="text-blue-400">{content.testimonial.role}</p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
              Everything You Need to Know About the <span className="text-blue-600">{modelName}</span> in Ireland
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Common questions about specifications, pricing, and delivery to Ireland
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What makes the {modelName} different from other {modelCategory.toLowerCase()} horseboxes?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {content.longDescription[0]}
                </p>
              </div>

              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  How many horses can the {modelName} carry?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  The {modelName} can safely transport {content.specifications.weights['Horse Capacity']}.
                  The horse area is {content.specifications.dimensions['Horse Area'] || content.specifications.dimensions['Horse Area Length']}
                  {' '}with a gross weight capacity of {content.specifications.weights['Gross Weight']}.
                </p>
              </div>

              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What&apos;s included as standard in the {modelName}?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Standard features include: {content.features.slice(0, 5).join(', ')}.
                  All models come with our 2-year structural warranty and comprehensive handover training.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Do you deliver the {modelName} to Ireland?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Yes! We deliver directly to customers throughout Ireland. Every delivery includes a comprehensive
                  walkthrough and training session at your door. Our team stays until you are fully confident with
                  every detail of your new horsebox.
                </p>
              </div>

              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What finance options are available?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We offer competitive HP and lease purchase options from 1-7 years with deposits from 10%.
                  Part exchange is welcome and can form part or all of your deposit.
                  Monthly payments for the {modelName} typically start from {formatPrice(Math.round(basePrice * 0.02), 'IE')} per month.
                </p>
              </div>

              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  How long does delivery take to Ireland?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Build time for the {modelName} is typically 8-12 weeks from order confirmation, depending on
                  specification and customization requirements. We deliver directly to your door anywhere in Ireland
                  with full handover training included.
                </p>
              </div>
            </div>
          </div>

          {/* Buying guide */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-12">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
              Why Choose JTH for Your {modelCategory} Horsebox in Ireland?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">British Manufacturing Excellence</h4>
                <p className="text-slate-600">
                  Every {modelName} is built at our Norfolk facility by skilled craftsmen with decades of experience.
                  We use only premium materials and components, ensuring your horsebox will provide years of reliable service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Direct Delivery to Ireland</h4>
                <p className="text-slate-600">
                  We deliver directly to your door anywhere in Ireland. Every delivery includes a comprehensive
                  handover and training session. Our aftercare team supports customers across Ireland.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Proven Track Record</h4>
                <p className="text-slate-600">
                  Incorporating the heritage of KPH Horseboxes and built in our Norfolk workshop,
                  JTH is a name you can trust for quality, reliability, and value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
            Ready to Experience the {modelName}?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Configure your perfect horsebox online or contact our team for a personal consultation.
            We deliver direct to Ireland with full handover training included.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/contact" className="btn-premium bg-white text-blue-600 hover:bg-slate-50">
              Get a Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="tel:01603552109" className="btn-premium-outline border-white text-white">
              <Phone className="mr-2 w-5 h-5" />
              Call 01603 552109
            </a>
            <Link href="/contact" className="btn-premium-outline border-white text-white">
              <Mail className="mr-2 w-5 h-5" />
              Request Brochure
            </Link>
          </div>

          <div className="mt-16 pt-16 border-t border-blue-500">
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="text-white font-semibold mb-4">Norfolk Workshop</h3>
                <p className="text-blue-100">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  J Taylor Horseboxes<br />
                  Beeston, Norfolk<br />
                  United Kingdom
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                <p className="text-blue-100">
                  <Phone className="inline w-4 h-4 mr-2" />
                  01603 552109<br />
                  <Mail className="inline w-4 h-4 mr-2" />
                  sales@jthltd.co.uk
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Ireland Delivery</h3>
                <p className="text-blue-100">
                  <Truck className="inline w-4 h-4 mr-2" />
                  Direct to your door<br />
                  Full handover training included
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
