import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { ArrowRight, Check, Shield, Award, Star, Truck, Users, Clock, ChevronRight, Phone, Mail, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Schema, { organizationSchema, generateProductSchema, generateBreadcrumbSchema, generateFAQSchema, generateReviewSchema } from '@/components/Schema'

export const metadata: Metadata = {
  title: 'Professional 35 - Premium 3.5t Horsebox for Professional Riders | JTH Norfolk',
  description: 'JTH Professional 35 - The ultimate luxury 3.5 tonne horsebox for professional riders and serious competitors. Premium materials, advanced safety, British-built in Norfolk from £22,950. Car license drivable. 2-year warranty. Configure online or visit our showroom.',
  keywords: 'Professional 35 horsebox, 3.5t professional horsebox, 3.5 tonne luxury horsebox, professional competition horsebox, JTH Professional 35, British-built horsebox Norfolk, premium 3.5t horsebox UK, car license horsebox, two horse horsebox professional, luxury horsebox £22950, Professional 35 vs Principle 35, Professional 35 specifications, Professional 35 review, Professional 35 finance, best 3.5t horsebox UK 2025',
  openGraph: {
    title: 'JTH Professional 35 - Premium 3.5t Competition Horsebox',
    description: 'The ultimate luxury 3.5 tonne horsebox for professional riders. Premium materials, advanced safety, from £22,950.',
    images: [{
      url: 'https://jthltd.co.uk/models/professional-35/01.jpg',
      width: 1200,
      height: 630,
      alt: 'JTH Professional 35 luxury 3.5 tonne horsebox exterior view'
    }],
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional 35 - Premium 3.5t Horsebox',
    description: 'The ultimate luxury 3.5 tonne horsebox for professional riders from £22,950',
    images: ['https://jthltd.co.uk/models/professional-35/01.jpg'],
  },
  alternates: {
    canonical: 'https://jthltd.co.uk/models/professional-35',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function Professional35Page() {
  // Schema markup data
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Models', url: 'https://jthltd.co.uk/models' },
    { name: 'Professional 35', url: 'https://jthltd.co.uk/models/professional-35' }
  ]

  const productSchema = generateProductSchema({
    name: 'JTH Professional 35',
    description: 'Premium 3.5 tonne horsebox for professional riders. Luxury materials, advanced safety features, British-built quality.',
    image: 'https://jthltd.co.uk/models/professional-35/01.jpg',
    price: 22950,
    sku: 'PROFESSIONAL-35',
    category: '3.5 Tonne Horsebox'
  })

  const faqs = [
    {
      question: 'What license do I need to drive the Professional 35?',
      answer: 'The Professional 35 is a 3.5 tonne horsebox that can be driven on a standard car license if you passed your test before 1 January 1997. If you passed after this date, you\'ll need to take an additional test to add category B+E or C1 to your license.'
    },
    {
      question: 'How many horses can the Professional 35 carry?',
      answer: 'The Professional 35 can safely transport two horses up to 16.2hh. The horse area is 3.6m long with a gross weight capacity of 3,500kg and a payload of 1,300kg.'
    },
    {
      question: 'What makes the Professional 35 different from the Principle 35?',
      answer: 'The Professional 35 features premium materials throughout, luxury living area with leather upholstery, advanced technology package as standard, and professional-grade specifications. It\'s designed for serious competitors who demand the best.'
    },
    {
      question: 'Can I finance the Professional 35?',
      answer: 'Yes, we offer competitive HP and lease purchase options from 1-7 years with deposits from 10%. Monthly payments typically start from around £450 per month. Part exchange is also welcome.'
    },
    {
      question: 'What warranty comes with the Professional 35?',
      answer: 'Every Professional 35 comes with our comprehensive 2-year structural warranty, which is twice the industry standard. This covers all structural elements, GRP bodywork, and manufacturing defects.'
    },
    {
      question: 'How long does it take to build a Professional 35?',
      answer: 'Build time for the Professional 35 is typically 8-12 weeks from order confirmation, depending on your chosen specification and customization requirements. We deliver throughout the UK and Ireland.'
    }
  ]

  const reviews = [
    generateReviewSchema({
      author: 'Sarah Mitchell',
      reviewBody: 'The Professional 35 has transformed how I travel to competitions. The luxury living area means I can rest properly between events, and my horses travel in absolute comfort.',
      reviewRating: 5,
      datePublished: '2024-10-15',
      itemReviewed: 'JTH Professional 35'
    }),
    generateReviewSchema({
      author: 'James Thompson',
      reviewBody: 'Outstanding build quality and attention to detail. The Professional 35 is worth every penny. My horses are calmer and more relaxed when we arrive at venues.',
      reviewRating: 5,
      datePublished: '2024-09-22',
      itemReviewed: 'JTH Professional 35'
    })
  ]
  return (
    <>
      <Schema schema={[organizationSchema, generateBreadcrumbSchema(breadcrumbs), productSchema, generateFAQSchema(faqs), ...reviews]} />
      <main className="bg-white">
      {/* Hero Section with Premium Dark Overlay */}
      <Hero 
        primarySrc="/models/professional-35/01.jpg" 
        fallbackSrc="/models/professional-35/02.jpg"
        height="xl"
        overlay="gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wider uppercase mb-8 animate-fadeIn">
            <Star className="w-4 h-4" />
            <span>Premium 3.5 Tonne Model</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-slideUp">
            Professional 35
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-slideUp animation-delay-200">
            The ultimate luxury 3.5 tonne horsebox for professional riders, serious competitors, and discerning owners. 
            Where British innovation meets uncompromising quality. Built in Norfolk, delivered nationwide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 animate-slideUp animation-delay-400">
            <Link href="/configurator/professional-35" className="btn-premium">
              Configure Your Professional 35
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
              <div className="text-2xl font-bold text-white">£22,950</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Starting Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">3,500kg</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Gross Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2 Horse</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2 Year</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Introduction Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                British Excellence
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">
                Why Professional Riders Choose the 
                <span className="text-gradient-blue block mt-2">Professional 35 3.5t Horsebox</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mb-8"></div>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                The JTH Professional 35 represents the pinnacle of 3.5 tonne horsebox design in the UK market. 
                Every detail has been meticulously crafted to provide the ultimate in safety, 
                comfort, and performance for both horse and rider. Competing directly with models from 
                Bloomfields, Stephex, and Owens, the Professional 35 offers superior value and quality.
              </p>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Built in Great Britain with over 30 years of expertise, this model combines 
                traditional craftsmanship with cutting-edge innovation, setting new standards 
                in the luxury horsebox market.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Premium grade materials throughout</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Advanced safety systems as standard</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Fully customizable to your requirements</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">2-year structural warranty included</span>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative image-premium">
                <Image 
                  src="/models/professional-35/02.jpg" 
                  alt="JTH Professional 35 luxury interior" 
                  width={600} 
                  height={400} 
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Specifications Section */}
      <section id="specifications" className="py-20 md:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge-gold mx-auto mb-6">
              Full Specifications
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Professional 35 Technical Details
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every Professional 35 is built to the highest standards with premium 
              components and materials throughout.
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
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Overall Length</span>
                  <span className="text-white font-semibold">6.8m</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Overall Width</span>
                  <span className="text-white font-semibold">2.3m</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Overall Height</span>
                  <span className="text-white font-semibold">3.2m</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Internal Height</span>
                  <span className="text-white font-semibold">2.3m</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Horse Area</span>
                  <span className="text-white font-semibold">3.6m</span>
                </div>
              </div>
            </div>

            {/* Weights & Capacity Card */}
            <div className="card-dark p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6">Weights & Capacity</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Gross Weight</span>
                  <span className="text-white font-semibold">3,500kg</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Unladen Weight</span>
                  <span className="text-white font-semibold">2,200kg</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Payload</span>
                  <span className="text-white font-semibold">1,300kg</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Horse Capacity</span>
                  <span className="text-white font-semibold">2 Horses</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Tack Storage</span>
                  <span className="text-white font-semibold">Premium</span>
                </div>
              </div>
            </div>

            {/* Safety Features Card */}
            <div className="card-dark p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-white mb-6">Safety Features</h3>
              <div className="space-y-4">
                <div className="flex items-center py-3 border-b border-slate-800">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">Emergency exit doors</span>
                </div>
                <div className="flex items-center py-3 border-b border-slate-800">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">Anti-slip flooring</span>
                </div>
                <div className="flex items-center py-3 border-b border-slate-800">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">CCTV preparation</span>
                </div>
                <div className="flex items-center py-3 border-b border-slate-800">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">LED lighting system</span>
                </div>
                <div className="flex items-center py-3">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">Reinforced partitions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Grid */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Premium Features & Options
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every Professional 35 comes fully equipped with premium features. 
              Customize further with our extensive options list.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Living Area',
                features: [
                  'Luxury seating with storage',
                  'Full kitchen facilities',
                  'Sleeping accommodation',
                  'Premium upholstery',
                  'USB charging points',
                  'LED ambient lighting'
                ]
              },
              {
                title: 'Horse Area',
                features: [
                  'Padded breast and bum bars',
                  'Rubber matting throughout',
                  'Adjustable partitions',
                  'Feed mangers',
                  'Hay nets included',
                  'Ventilation system'
                ]
              },
              {
                title: 'Storage',
                features: [
                  'Large tack locker',
                  'Saddle racks',
                  'Bridle hooks',
                  'External storage compartments',
                  'Water tank (150L)',
                  'Tool storage area'
                ]
              },
              {
                title: 'Chassis & Build',
                features: [
                  'Iveco Daily chassis',
                  'Automatic gearbox option',
                  'Air suspension',
                  'Alloy wheels',
                  'Full service history',
                  'PDI inspection'
                ]
              },
              {
                title: 'Technology',
                features: [
                  'Reversing camera',
                  'Solar panel ready',
                  'Battery management',
                  'External power hookup',
                  'Interior CCTV option',
                  'GPS tracking ready'
                ]
              },
              {
                title: 'Exterior',
                features: [
                  'Premium paint finish',
                  'Chrome accessories',
                  'LED marker lights',
                  'Electric steps',
                  'Awning option',
                  'Custom graphics available'
                ]
              }
            ].map((category, index) => (
              <div key={index} className="card-premium p-8 hover-lift">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">{category.title}</h3>
                <ul className="space-y-3">
                  {category.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-20 md:py-32 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Gallery
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore the Professional 35 in detail
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="image-premium group cursor-pointer">
                <Image
                  src={`/models/professional-35/0${num}.jpg`}
                  alt={`Professional 35 view ${num}`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Why Choose the Professional 35?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Compare our Professional 35 with other models in the range
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-blue-600">Professional 35</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-500">Principle 35</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-500">Progeny 35</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-slate-700">Starting Price</td>
                  <td className="text-center py-4 px-6 font-semibold text-blue-600">£22,950</td>
                  <td className="text-center py-4 px-6 text-slate-600">£18,500</td>
                  <td className="text-center py-4 px-6 text-slate-600">£25,500</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="py-4 px-6 text-slate-700">Premium Materials</td>
                  <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="text-center py-4 px-6">Standard</td>
                  <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-slate-700">Living Area</td>
                  <td className="text-center py-4 px-6 font-semibold text-blue-600">Luxury</td>
                  <td className="text-center py-4 px-6 text-slate-600">Standard</td>
                  <td className="text-center py-4 px-6 text-slate-600">Luxury Plus</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="py-4 px-6 text-slate-700">Technology Package</td>
                  <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="text-center py-4 px-6">Optional</td>
                  <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 text-slate-700">Warranty</td>
                  <td className="text-center py-4 px-6 font-semibold text-blue-600">2 Years</td>
                  <td className="text-center py-4 px-6 text-slate-600">2 Years</td>
                  <td className="text-center py-4 px-6 text-slate-600">2 Years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Professional riders trust the Professional 35 for their competition needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Mitchell',
                role: 'Professional Event Rider',
                quote: 'The Professional 35 has transformed how I travel to competitions. The luxury living area means I can rest properly between events, and my horses travel in absolute comfort.',
                rating: 5
              },
              {
                name: 'James Thompson',
                role: 'Dressage Competitor',
                quote: 'Outstanding build quality and attention to detail. The Professional 35 is worth every penny. My horses are calmer and more relaxed when we arrive at venues.',
                rating: 5
              },
              {
                name: 'Emma Richards',
                role: 'Show Jumper',
                quote: 'After comparing all the options, the Professional 35 was the clear winner. The safety features give me peace of mind, and the customization options meant I got exactly what I needed.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
            Ready to Experience the Professional 35?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Configure your perfect horsebox online or contact our team for a personal consultation
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/configurator/professional-35" className="btn-premium bg-white text-blue-600 hover:bg-slate-50">
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

      {/* Comprehensive SEO Content Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-8">
              Complete Guide to the JTH Professional 35 3.5 Tonne Horsebox
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Why Choose the Professional 35?</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  The Professional 35 is JTH's premium 3.5 tonne horsebox, designed specifically for professional riders, 
                  serious competitors, and those who demand the very best for their horses. Built at our state-of-the-art 
                  facility in Norfolk, each Professional 35 combines over 30 years of horsebox building expertise with the 
                  latest innovations in equine transport.
                </p>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Starting from £22,950 (excluding VAT), the Professional 35 offers exceptional value when compared to similar 
                  models from competitors like Bloomfields, Stephex, and Owens. What sets it apart is the comprehensive list 
                  of premium features included as standard, the superior build quality, and our industry-leading 2-year warranty.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Whether you're competing at local shows or traveling to international events, the Professional 35 provides 
                  the perfect mobile base. The luxury living area ensures you arrive refreshed and ready to perform, while 
                  the carefully designed horse area keeps your equine partners comfortable and stress-free.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Professional 35 vs Competition</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  When comparing the Professional 35 to other premium 3.5 tonne horseboxes on the UK market, several key 
                  advantages become clear. Unlike many competitors who charge extra for essential features, the Professional 35 
                  includes premium materials, advanced safety systems, and luxury fittings as standard.
                </p>
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Key Advantages:</h4>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Price:</strong> From £22,950 vs competitors from £25,000+</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Warranty:</strong> 2 years vs standard 12 months</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Build Location:</strong> Norfolk, UK vs some imported</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Customization:</strong> Fully bespoke vs limited options</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Delivery:</strong> UK & Ireland vs UK only</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Professional 35 Specifications & Performance</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Chassis & Performance</h4>
                  <p className="text-slate-600">
                    Built on the reliable Iveco Daily chassis, the Professional 35 offers excellent handling and performance. 
                    The 3.5 tonne gross weight allows it to be driven on a standard car license (pre-1997), making it accessible 
                    to more riders. With a payload of 1,300kg, you have ample capacity for two horses plus all your equipment.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Living Quarters</h4>
                  <p className="text-slate-600">
                    The luxury living area in the Professional 35 sets new standards for the 3.5 tonne category. Premium leather 
                    upholstery, solid surface worktops, full kitchen facilities, and sleeping accommodation ensure comfort during 
                    long competition days. The attention to detail rivals motorhomes costing significantly more.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Horse Area</h4>
                  <p className="text-slate-600">
                    The 3.6m horse area comfortably accommodates two horses up to 16.2hh. Premium rubber matting, padded partitions, 
                    and excellent ventilation ensure your horses travel in comfort. The layout has been optimized based on feedback 
                    from professional riders to minimize stress and maximize safety.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Frequently Asked Questions About the Professional 35</h3>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3">{faq.question}</h4>
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-12 rounded-lg">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                Visit Our Norfolk Showroom to See the Professional 35
              </h3>
              <p className="text-slate-600 text-center mb-8 max-w-3xl mx-auto">
                We encourage all potential buyers to visit our showroom in Beeston, Norfolk to see the Professional 35 in person. 
                Our experienced team can demonstrate all features, discuss customization options, and arrange test drives.
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">Location</h4>
                  <p className="text-slate-600">Beeston, Norfolk<br />Easy access from A47 & A11</p>
                </div>
                <div>
                  <Phone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">Contact</h4>
                  <p className="text-slate-600">01603 552109<br />sales@jthltd.co.uk</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">Opening Hours</h4>
                  <p className="text-slate-600">Mon-Fri: 9am-5pm<br />Sat: 10am-4pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}