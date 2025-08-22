import { notFound } from 'next/navigation'
import { loadPricingConfig } from '@/lib/pricing'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { ArrowRight, Check, Shield, Award, Star, Truck, ChevronRight, Phone, Mail, MapPin, Users, Clock } from 'lucide-react'
import type { Metadata } from 'next'

// Import Schema component at the top
import Schema, { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/components/Schema'

// Model-specific content and SEO data
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
}> = {
  'professional-35': {
    title: 'Professional 35 - Premium 3.5t Horsebox for Serious Competitors',
    description: 'The JTH Professional 35 is the ultimate 3.5 tonne horsebox for professional riders and serious competitors. Premium features, luxury finish, advanced safety systems. British-built in Norfolk from £22,000.',
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
    gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
    testimonial: {
      name: 'Sarah Thompson',
      role: 'Professional Event Rider',
      quote: 'The Professional 35 has transformed my competition experience. The quality is outstanding and the attention to detail is second to none. It\'s given me a real competitive edge.'
    },
    seoKeywords: '3.5t professional horsebox, Professional 35, premium 3.5 tonne horsebox, competition horsebox, luxury horsebox, British horsebox manufacturer, best 3.5t horsebox UK, professional horse transport',
    heroImage: '/models/professional-35/01.jpg'
  },
  'principle-35': {
    title: 'Principle 35 - Essential Quality 3.5t Horsebox',
    description: 'The JTH Principle 35 offers the perfect balance of quality and value for discerning horsebox owners. British built 3.5 tonne horsebox with essential features from £18,500.',
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
    gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
    testimonial: {
      name: 'Louise Carter',
      role: 'Happy Hacker',
      quote: 'The Principle 35 is perfect for my needs. Great value without compromising on quality or safety. I couldn\'t be happier with my choice.'
    },
    seoKeywords: '3.5t horsebox, value horsebox, Principle 35, affordable horsebox, British horsebox, 3.5 tonne horsebox for sale',
    heroImage: '/models/principle-35/01.jpg'
  },
  'progeny-35': {
    title: 'Progeny 35 - Top of the Range 3.5t Horsebox',
    description: 'The JTH Progeny 35 is our flagship 3.5 tonne horsebox, featuring the highest specification and luxury finishes. British-built in Norfolk from £25,500.',
    longDescription: [
      'The Progeny 35 represents the pinnacle of 3.5 tonne horsebox design. This flagship model incorporates every premium feature as standard, including our exclusive Pioneer Package worth £10,800.',
      'Building on the Professional 35 platform, the Progeny adds premium materials throughout, advanced technology features, and bespoke customization options that set it apart from any other horsebox in its class.',
      'For owners who demand the absolute best, the Progeny 35 delivers an unmatched combination of luxury, performance, and British engineering excellence.'
    ],
    features: [
      'Exclusive Pioneer package included',
      'Premium leather upholstery',
      'Advanced technology suite',
      'Luxury living quarters',
      'Premium paint and graphics',
      'Solar power system',
      'CCTV monitoring system',
      'Hydraulic ramp option'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.0m',
        'Overall Width': '2.3m',
        'Overall Height': '3.2m',
        'Internal Height': '2.3m',
        'Horse Area': '3.8m'
      },
      weights: {
        'Gross Weight': '3,500kg',
        'Unladen Weight': '2,300kg',
        'Payload': '1,200kg',
        'Horse Capacity': '2 Horses',
        'Tack Storage': 'Luxury'
      },
      safety: [
        'Advanced CCTV system',
        'Emergency exit doors',
        'Premium anti-slip flooring',
        'LED lighting throughout',
        'Reinforced construction',
        'GPS tracking system'
      ]
    },
    gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
    testimonial: {
      name: 'Richard Pemberton',
      role: 'Competition Rider',
      quote: 'The Progeny 35 exceeds all expectations. The Pioneer package adds features I didn\'t know I needed but now can\'t live without.'
    },
    seoKeywords: '3.5t luxury horsebox, Progeny 35, premium horsebox, Pioneer package, top specification horsebox, best 3.5 tonne horsebox',
    heroImage: '/models/progeny-35/01.jpg'
  },
  'aeos-edge-45': {
    title: 'Aeos Edge 45 - Professional 4.5t Horsebox',
    description: 'The Aeos Edge 45 delivers professional-grade features in a 4.5 tonne package. Perfect for serious competitors needing extra capacity.',
    longDescription: [
      'The Aeos Edge 45 represents the cutting edge of 4.5 tonne horsebox design. With increased payload capacity and spacious living quarters, this model is perfect for professional riders and serious competitors.',
      'Built on the reliable Iveco Daily 45 chassis, the Edge offers superior handling and performance while maintaining the luxury and quality that JTH is known for.',
      'The additional capacity of the 4.5 tonne platform allows for more extensive living facilities, making this the ideal choice for extended competitions and events.'
    ],
    features: [
      'Spacious living area with sleeping',
      'Full kitchen facilities',
      'Increased payload capacity',
      'Professional specification',
      'Air suspension option',
      'External tack locker',
      'Awning ready',
      'Generator compatible'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.5m',
        'Overall Width': '2.4m',
        'Overall Height': '3.4m',
        'Internal Height': '2.4m',
        'Horse Area': '3.8m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Unladen Weight': '2,800kg',
        'Payload': '1,700kg',
        'Horse Capacity': '2-3 Horses',
        'Tack Storage': 'Professional'
      },
      safety: [
        'Reinforced chassis',
        'Advanced braking system',
        'Emergency exits',
        'CCTV ready',
        'LED lighting',
        'Anti-slip flooring'
      ]
    },
    gallery: ['01.jpg', '02.jpg', '03.jpg'],
    testimonial: {
      name: 'Amanda Stevens',
      role: 'Event Rider',
      quote: 'The Edge 45 gives me everything I need for multi-day events. The extra space and payload make all the difference.'
    },
    seoKeywords: '4.5t horsebox, 4.5 tonne horsebox, Aeos Edge 45, professional horsebox, competition horsebox, larger horsebox',
    heroImage: '/models/aeos-edge-45/01.jpg'
  },
  'aeos-freedom-45': {
    title: 'Aeos Freedom 45 - Versatile 4.5t Horsebox',
    description: 'The Aeos Freedom 45 offers versatility and comfort in a 4.5 tonne horsebox. Perfect for families and leisure riders wanting extra space.',
    longDescription: [
      'The Aeos Freedom 45 embodies the spirit of equestrian adventure. With generous living space and flexible configurations, this model adapts to your lifestyle whether competing, training, or enjoying leisure rides.',
      'The Freedom\'s thoughtful design maximizes every inch of space, providing comfortable accommodation for extended trips while maintaining excellent horse facilities.',
      'Popular with families and riding clubs, the Freedom 45 offers the perfect balance of practicality, comfort, and British build quality.'
    ],
    features: [
      'Flexible living configuration',
      'Family-friendly design',
      'Generous storage',
      'Comfortable sleeping for two',
      'Full bathroom option',
      'Entertainment system ready',
      'Large water capacity',
      'External shower option'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.5m',
        'Overall Width': '2.4m',
        'Overall Height': '3.4m',
        'Internal Height': '2.4m',
        'Horse Area': '3.6m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Unladen Weight': '2,700kg',
        'Payload': '1,800kg',
        'Horse Capacity': '2-3 Horses',
        'Tack Storage': 'Extensive'
      },
      safety: [
        'Family safety features',
        'Child-proof locks',
        'Emergency communication',
        'Enhanced visibility',
        'Stability control',
        'Premium brakes'
      ]
    },
    gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
    testimonial: {
      name: 'The Johnson Family',
      role: 'Leisure Riders',
      quote: 'The Freedom 45 is perfect for our family adventures. Plenty of space for everyone and everything we need.'
    },
    seoKeywords: '4.5t family horsebox, Aeos Freedom 45, versatile horsebox, leisure horsebox, spacious horsebox, 4.5 tonne horsebox UK',
    heroImage: '/models/aeos-freedom-45/01.jpg'
  },
  'aeos-discovery-45': {
    title: 'Aeos Discovery 45 - Luxury Living 4.5t Horsebox',
    description: 'The Aeos Discovery 45 features luxury living quarters in a 4.5 tonne horsebox. The ultimate in comfort for extended stays at events.',
    longDescription: [
      'The Aeos Discovery 45 redefines luxury in the 4.5 tonne horsebox market. With apartment-quality living quarters and premium finishes throughout, this model is designed for those who refuse to compromise on comfort.',
      'Every Discovery is built with meticulous attention to detail, from the hand-stitched leather upholstery to the solid surface worktops. The living area rivals the finest motorhomes while maintaining excellent horse facilities.',
      'Perfect for international competitors and discerning owners who spend significant time traveling with their horses, the Discovery 45 is a home away from home.'
    ],
    features: [
      'Luxury apartment-style living',
      'Premium kitchen with appliances',
      'Separate shower room',
      'King-size bed option',
      'Satellite TV system',
      'Climate control',
      'Wine storage',
      'Bose sound system'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '8.0m',
        'Overall Width': '2.4m',
        'Overall Height': '3.5m',
        'Internal Height': '2.4m',
        'Horse Area': '3.6m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Unladen Weight': '2,900kg',
        'Payload': '1,600kg',
        'Horse Capacity': '2 Horses',
        'Tack Storage': 'Premium'
      },
      safety: [
        'Full CCTV system',
        'Remote monitoring',
        'Alarm system',
        'Emergency beacon',
        'Fire suppression',
        'Medical kit storage'
      ]
    },
    gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
    testimonial: {
      name: 'Charlotte Windsor',
      role: 'International Competitor',
      quote: 'The Discovery 45 is simply outstanding. It\'s like having a luxury hotel room that travels with me to every event.'
    },
    seoKeywords: '4.5t luxury horsebox, Aeos Discovery 45, premium living horsebox, luxury horse transport, best 4.5 tonne horsebox, competition horsebox',
    heroImage: '/models/aeos-discovery-45/01.jpg'
  },
  'aeos-edge-st-45': {
    title: 'Aeos Edge ST 45 - Stallion 4.5t Horsebox',
    description: 'The Aeos Edge ST 45 features reinforced stallion partitions for safe transport of stallions. Professional grade 4.5 tonne horsebox.',
    longDescription: [
      'The Aeos Edge ST 45 is specifically designed for the safe transportation of stallions. With reinforced partitions and enhanced safety features, this model provides peace of mind when transporting valuable breeding stock.',
      'Built on the proven Edge 45 platform, the ST variant adds specialized features required for stallion transport while maintaining the comfort and quality of the standard model.',
      'Every aspect of the stallion area has been engineered for strength and safety, from the reinforced walls to the heavy-duty breast and bum bars.'
    ],
    features: [
      'Reinforced stallion partition',
      'Heavy-duty construction',
      'Enhanced ventilation',
      'Separate stallion access',
      'Reinforced flooring',
      'Additional safety barriers',
      'CCTV monitoring',
      'Emergency restraint system'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.5m',
        'Overall Width': '2.4m',
        'Overall Height': '3.4m',
        'Internal Height': '2.4m',
        'Stallion Area': '4.0m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Unladen Weight': '2,850kg',
        'Payload': '1,650kg',
        'Horse Capacity': '1 Stallion + 1 Horse',
        'Partition Strength': 'Reinforced'
      },
      safety: [
        'Stallion-grade partitions',
        'Reinforced kick walls',
        'Emergency sedation access',
        'Dual exit routes',
        'Heavy-duty locks',
        'Surveillance system'
      ]
    },
    gallery: ['01.jpg', '02.jpg', '03.jpg'],
    testimonial: {
      name: 'David Mitchell',
      role: 'Stud Owner',
      quote: 'The Edge ST 45 gives me complete confidence when transporting our valuable stallions. The reinforced construction is exceptional.'
    },
    seoKeywords: '4.5t stallion horsebox, Aeos Edge ST 45, stallion transport, reinforced horsebox, breeding horsebox, stallion partition',
    heroImage: '/models/aeos-edge-st-45/01.jpg'
  },
  'aeos-discovery-72': {
    title: 'Aeos Discovery 72 - Luxury Living 7.2t Horsebox',
    description: 'The Aeos Discovery 72 is our flagship 7.2 tonne horsebox with unparalleled luxury living quarters. Maximum comfort and space for extended stays at events.',
    longDescription: [
      'The Aeos Discovery 72 represents the pinnacle of luxury horsebox living. This 7.2 tonne masterpiece prioritizes spacious, apartment-quality accommodation while maintaining excellent facilities for two horses.',
      'Built for discerning owners who spend significant time at events and competitions, the Aeos Discovery 72 features living quarters that rival the finest motorhomes. The additional space allows for amenities typically impossible in smaller horseboxes.',
      'Every Aeos Discovery 72 is custom-built to the owner\'s exact specifications, with virtually unlimited options for customization. From the chassis specification to the interior design, every detail can be tailored to create your perfect mobile home.'
    ],
    features: [
      'Capacity for 2 horses',
      'Luxury apartment living',
      'Separate bedroom',
      'Full bathroom with shower',
      'Gourmet kitchen',
      'Slide-out sections available',
      'Satellite communications',
      'Workshop area option',
      'Pop-up roof option',
      'Hydraulic leveling system'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '10.5m',
        'Overall Width': '2.5m',
        'Overall Height': '3.8m',
        'Internal Height': '2.5m',
        'Horse Area': '5.0m'
      },
      weights: {
        'Gross Weight': '7,200kg',
        'Unladen Weight': '4,500kg',
        'Payload': '2,700kg',
        'Horse Capacity': '2 Horses',
        'Living Space': 'Luxury Apartment'
      },
      safety: [
        'Commercial-grade chassis',
        'Air brakes',
        'Stability management',
        'Full CCTV coverage',
        'Fire suppression system',
        'Emergency communication',
        'Medical equipment storage'
      ]
    },
    gallery: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg'],
    testimonial: {
      name: 'Team GB Rider',
      role: 'Olympic Competitor',
      quote: 'The Aeos Discovery 72 is essential for international competition. It\'s our mobile base, providing everything we need to perform at the highest level.'
    },
    seoKeywords: '7.2t horsebox, 7.2 tonne horsebox, Aeos Discovery 72, Aeos Discovery 72, large horsebox, luxury horsebox, professional team horsebox, 4 horse transport',
    heroImage: '/models/aeos-discovery-72/01.jpg'
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const content = modelContent[params.slug]
  if (!content) {
    return {
      title: 'Model Not Found | JTH Horseboxes',
      description: 'The requested horsebox model could not be found.'
    }
  }

  return {
    title: `${content.title} | J Taylor Horseboxes`,
    description: content.description,
    keywords: content.seoKeywords,
    openGraph: {
      title: content.title,
      description: content.description,
      images: [content.heroImage],
    },
  }
}

export default async function ModelDetailPage({ params }: { params: { slug: string } }) {
  const content = modelContent[params.slug]
  
  // If no content exists for this model, show 404
  if (!content) {
    return notFound()
  }

  // Generate FAQ data for this model
  const modelFAQs = [
    {
      question: `How much does the ${content.title.split(' - ')[0]} cost?`,
      answer: `The ${content.title.split(' - ')[0]} starts from the prices shown, excluding VAT. Final pricing depends on your chosen options and customizations. We offer competitive finance packages and accept part exchange.`
    },
    {
      question: `What license do I need to drive this horsebox?`,
      answer: params.slug.includes('35') 
        ? 'The 3.5 tonne models can be driven on a standard car license if you passed your test before 1997. Otherwise, you\'ll need B+E or C1 license.'
        : params.slug.includes('45')
        ? 'The 4.5 tonne models require a C1 license. We can recommend training providers if needed.'
        : 'The 7.2 tonne Zenos requires a C1 or full HGV license depending on configuration.'
    },
    {
      question: `What warranty comes with this model?`,
      answer: `Every ${content.title.split(' - ')[0]} comes with our comprehensive 2-year structural warranty covering all manufacturing defects and structural elements.`
    },
    {
      question: `Can I customize this horsebox?`,
      answer: `Yes, the ${content.title.split(' - ')[0]} can be fully customized to your requirements including paint colors, interior layout, and equipment specifications.`
    }
  ]

  // Try to load pricing config, but don't fail if model isn't in it
  let model: any = null
  let basePrice: number | null = null
  
  try {
    const cfg = await loadPricingConfig()
    model = cfg.models.find(m => m.slug === params.slug)
    if (model && model.basePricePence != null) {
      basePrice = model.basePricePence / 100
    }
  } catch (error) {
    // Pricing config not available or model not in config
    console.log(`Model ${params.slug} not in pricing config, using default pricing`)
  }
  
  // Use default prices if not in pricing config
  if (!basePrice) {
    const defaultPrices: Record<string, number> = {
      'principle-35': 18500,
      'professional-35': 22000,
      'progeny-35': 25500,
      'aeos-qv-45': 28950,
      'aeos-edge-45': 31500,
      'aeos-freedom-45': 36500,
      'aeos-discovery-45': 46100,
      'aeos-freedom-st-45': 38500,
      'aeos-edge-st-45': 33500,
      'aeos-qv-st-45': 30950,
      'aeos-discovery-72': 74600,
      'helios-75': 82500
    }
    basePrice = defaultPrices[params.slug] || 0
  }
  
  // Use content title as model name if not in pricing config
  const modelName = model?.name || content.title.split(' - ')[0]

  // Determine model category
  const is35t = params.slug.includes('35')
  const is45t = params.slug.includes('45')
  const is72t = params.slug.includes('72')
  const isStallion = params.slug.includes('-st-')
  
  const modelCategory = is35t ? '3.5 Tonne' : is45t ? '4.5 Tonne' : '7.2 Tonne'

  // Generate schema markup
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Models', url: 'https://jthltd.co.uk/models' },
    { name: modelName, url: `https://jthltd.co.uk/models/${params.slug}` }
  ]

  const productSchema = generateProductSchema({
    name: modelName,
    description: content.description,
    image: `https://jthltd.co.uk${content.heroImage}`,
    price: basePrice,
    sku: params.slug.toUpperCase(),
    category: `${modelCategory} Horsebox`
  })

  return (
    <>
      <Schema schema={[generateBreadcrumbSchema(breadcrumbs), productSchema, generateFAQSchema(modelFAQs)]} />
      <main className="bg-white">
      {/* Hero Section */}
      <Hero 
        primarySrc={content.heroImage}
        fallbackSrc="/models/hero.jpg"
        height="xl"
        overlay="gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wider uppercase mb-8 animate-fadeIn">
            <Star className="w-4 h-4" />
            <span>{modelCategory} Model {isStallion && '- Stallion Specification'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-slideUp">
            {modelName}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-slideUp animation-delay-200">
            {content.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 animate-slideUp animation-delay-400">
            <Link href={`/configurator/${params.slug}`} className="btn-premium">
              Configure Your {modelName}
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
              <div className="text-2xl font-bold text-white">£{basePrice.toLocaleString()}</div>
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
                British Excellence
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">
                {is72t ? 'Ultimate Capacity & Luxury' : is45t ? 'Enhanced Space & Capability' : 'Perfect Balance & Performance'}
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
              "{content.testimonial.quote}"
            </blockquote>
            <div>
              <p className="text-xl text-white font-semibold">{content.testimonial.name}</p>
              <p className="text-blue-400">{content.testimonial.role}</p>
            </div>
          </div>
        </section>
      )}

      {/* Comprehensive FAQ Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
              Everything You Need to Know About the <span className="text-blue-600">{modelName}</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Common questions about specifications, pricing, and customization options
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
                  The horse area is {content.specifications.dimensions['Horse Area'] || content.specifications.dimensions['Horse Area Length'] || content.specifications.dimensions['Stallion Area'] || 'spacious'} 
                  with a gross weight capacity of {content.specifications.weights['Gross Weight']}.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What\'s included as standard in the {modelName}?
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
                  Can I view the {modelName} before purchasing?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Absolutely! Visit our Norfolk showroom to see the {modelName} and other models in our range. 
                  We\'re open Monday-Friday 9am-5pm and Saturday 10am-4pm. Call 01603 552109 to book your viewing.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What finance options are available?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We offer competitive HP and lease purchase options from 1-7 years with deposits from 10%. 
                  Part exchange is welcome and can form part or all of your deposit. 
                  Monthly payments for the {modelName} typically start from £{Math.round(basePrice * 0.02)} per month.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  How long does delivery take?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Build time for the {modelName} is typically 8-12 weeks from order confirmation, depending on 
                  specification and customization requirements. We deliver throughout the UK and Ireland with 
                  full handover training included.
                </p>
              </div>
            </div>
          </div>

          {/* Additional buying guide content */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-12">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
              Why Choose JTH for Your {modelCategory} Horsebox?
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
                <h4 className="font-semibold text-slate-900 mb-3">Comprehensive Support</h4>
                <p className="text-slate-600">
                  From initial consultation through to aftercare, we\'re with you every step of the way. 
                  Our 2-year warranty is twice the industry standard, and our service team is always available to help.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Proven Track Record</h4>
                <p className="text-slate-600">
                  With over 500 happy customers and 30+ years of experience (including our KPH heritage), 
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
            Configure your perfect horsebox online or contact our team for a personal consultation
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href={`/configurator/${params.slug}`} className="btn-premium bg-white text-blue-600 hover:bg-slate-50">
              Configure Now
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
                <h3 className="text-white font-semibold mb-4">Visit Our Showroom</h3>
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
                <h3 className="text-white font-semibold mb-4">Opening Hours</h3>
                <p className="text-blue-100">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Monday - Friday: 9am - 5pm<br />
                  Saturday: 10am - 4pm<br />
                  Sunday: By appointment
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