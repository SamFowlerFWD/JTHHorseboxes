import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import { ArrowRight, Star, Shield, Award, Truck, Check, Phone, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Schema, { organizationSchema, localBusinessSchema, generateFAQSchema } from '@/components/Schema'

export const metadata: Metadata = {
  title: 'JTH Horseboxes - Premium 3.5t, 4.5t, 7.2t & 7.5t British Horseboxes | Norfolk UK',
  description: 'Leading British horsebox manufacturer in Norfolk. Premium 3.5 tonne horseboxes from £18,500. Professional 35, Principle 35, Progeny 35 models. Incorporating KPH legacy. 30+ years experience building luxury horseboxes.',
  keywords: '3.5t horsebox, 3.5 tonne horsebox, British horsebox manufacturer, luxury horsebox UK, horsebox for sale Norfolk, custom horsebox builder UK, JTH horseboxes, J Taylor Horseboxes, KPH horseboxes, Professional 35, Principle 35, Progeny 35, Pioneer Package',
  openGraph: {
    title: 'JTH Horseboxes - Premium British Horseboxes | 3.5t, 4.5t, 7.2t & 7.5t Models',
    description: 'Leading British horsebox manufacturer. Premium 3.5t, 4.5t, 7.2t & 7.5t models from £18,500. 30+ years experience. Visit our Norfolk showroom.',
    images: ['/hero.jpg'],
    type: 'website',
    locale: 'en_GB',
    siteName: 'JTH Horseboxes',
  },
  alternates: {
    canonical: 'https://jthltd.co.uk',
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

export default function HomePage() {
  const homeFAQs = [
    {
      question: "What license do I need to drive a 3.5 tonne horsebox?",
      answer: "If you passed your driving test before 1 January 1997, you can drive a 3.5 tonne horsebox on your standard car license (category B). If you passed after this date, you'll need to take an additional test to add category B+E or C1 to your license."
    },
    {
      question: "How much does a JTH horsebox cost?",
      answer: "Our 3.5 tonne horseboxes start from £18,500 for the Principle 35, with the Professional 35 from £22,000 and the flagship Progeny 35 from £25,500. All prices exclude VAT. We offer competitive finance packages and accept part exchange."
    },
    {
      question: "What warranty comes with a JTH horsebox?",
      answer: "Every new JTH horsebox comes with a comprehensive 2-year structural warranty, which is twice the industry standard. This covers all structural elements, GRP bodywork, and manufacturing defects."
    },
    {
      question: "Can I customize my JTH horsebox?",
      answer: "Yes! Every JTH horsebox can be customized to your exact requirements. From paint colors and graphics to internal layouts and equipment specifications, we offer extensive customization options."
    }
  ]

  return (
    <>
      <Schema schema={[organizationSchema, localBusinessSchema, generateFAQSchema(homeFAQs)]} />
      <main>
        <Hero primarySrc="/hero.jpg" fallbackSrc="/models/professional-35/01.jpg" height="xl" overlay="gradient">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>Incorporating the Legacy of KPH</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight animate-slideUp">
            Premium British Horseboxes
            <span className="block text-blue-400">3.5t, 4.5t, 7.2t & 7.5t Models</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-slideUp animation-delay-200">
            Leading UK horsebox manufacturer in Norfolk. Handcrafted luxury horseboxes 
            from £18,500. 30+ years of British engineering excellence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slideUp animation-delay-400">
            <Link href="/models" className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              Explore Models
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/configurator" className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300">
              Start Configuring
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Hero>

      {/* Trust Indicators */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">2 Year</div>
              <div className="text-sm text-slate-600">Structural Warranty</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">30+</div>
              <div className="text-sm text-slate-600">Years Experience</div>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">UK & IE</div>
              <div className="text-sm text-slate-600">Delivery Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            Made in Great Britain
          </div>
          <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-8">
            Welcome to <span className="text-blue-600">JTH Horseboxes</span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light mb-6">
            One of the most important aspects of JTH is that we don't follow other manufacturers, 
            but lead through innovation, creative designs and materials technology.
          </p>
          <p className="text-xl text-blue-600 font-semibold">
            "Stunning is fitted as standard on every JTH horsebox"
          </p>
        </div>
      </section>

      {/* Decision Helper Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="w-12 h-12 mx-auto mb-8 text-blue-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-8 tracking-wide">
              Not sure which horsebox is for you?
            </h2>
            <div className="w-24 h-px bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto font-light">
              Explore our range of 3.5 tonne models, each designed for different needs and preferences.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Professional 35',
                slug: 'professional-35',
                description: 'The ultimate in luxury and performance for the professional rider.',
                price: '£22,000',
                features: ['Premium finish', 'Advanced features', 'Professional specification']
              },
              {
                title: 'Principle 35',
                slug: 'principle-35',
                description: 'Perfect balance of quality and value for the discerning owner.',
                price: '£18,500',
                features: ['Quality construction', 'Essential features', 'Great value']
              },
              {
                title: 'Progeny 35',
                slug: 'progeny-35',
                description: 'Top of the range with Pioneer Package included.',
                price: '£25,500',
                features: ['Pioneer Package (£10,800)', 'Highest specification', 'Premium materials']
              }
            ].map((model) => (
              <Link key={model.slug} href={`/models/${model.slug}`} className="group">
                <div className="bg-white overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                  <div className="relative h-72">
                    <Image 
                      src={`/models/${model.slug}/01.jpg`} 
                      alt={model.title} 
                      fill 
                      sizes="(min-width: 1024px) 33vw, 100vw" 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-sm font-medium">View Details</span>
                    </div>
                  </div>
                  <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-light text-slate-900 tracking-wide">{model.title}</h3>
                      <span className="text-lg font-medium text-blue-600">{model.price}</span>
                    </div>
                    <div className="w-16 h-px bg-blue-600 mb-4"></div>
                    <p className="text-slate-600 mb-6 font-light leading-relaxed">{model.description}</p>
                    <ul className="space-y-2">
                      {model.features.map((feature, index) => (
                        <li key={index} className="text-sm text-slate-500 flex items-center font-light">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                        View Details
                        <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-12 h-12 mb-8 text-blue-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-8 tracking-wide">
              British Horsebox Innovation
            </h2>
            <div className="w-24 h-px bg-blue-600 mb-8"></div>
            <p className="text-lg text-slate-600 mb-10 font-light leading-relaxed">
              We don't follow other manufacturers, but lead through innovation, creative designs 
              and materials technology. Every JTH horsebox is built with precision and care, 
              incorporating the latest advancements in safety and comfort.
            </p>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mr-4 mt-3"></div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Innovation Leadership</h3>
                  <p className="text-slate-600 font-light">Leading the industry with creative designs and advanced materials</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mr-4 mt-3"></div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Premium Quality</h3>
                  <p className="text-slate-600 font-light">Stunning finish and premium materials as standard</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mr-4 mt-3"></div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">British Heritage</h3>
                  <p className="text-slate-600 font-light">Built in Great Britain with decades of expertise</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative overflow-hidden">
              <Image 
                src="/models/professional-35/02.jpg" 
                alt="Professional 35 Horsebox" 
                width={600} 
                height={400} 
                className="relative shadow-2xl transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section - Comprehensive Horsebox Information */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-8">
            Why Choose JTH <span className="text-blue-600">3.5t Horseboxes</span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
            As one of the UK's leading horsebox manufacturers, JTH (J Taylor Horseboxes) specializes in building premium 
            3.5 tonne, 4.5 tonne, 7.2 tonne, and 7.5 tonne horseboxes at our state-of-the-art facility in Norfolk.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Our 3.5 Tonne Horsebox Range</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Our 3.5t horsebox models are the most popular choice for UK horse owners who can drive on a standard car license. 
              The <Link href="/models/professional-35" className="text-blue-600 hover:text-blue-700 font-semibold">Professional 35</Link> (from £22,000) offers the ultimate in luxury and performance for professional riders. 
              The <Link href="/models/principle-35" className="text-blue-600 hover:text-blue-700 font-semibold">Principle 35</Link> (from £18,500) provides exceptional value without compromising on quality or safety. 
              The <Link href="/models/progeny-35" className="text-blue-600 hover:text-blue-700 font-semibold">Progeny 35</Link> (from £25,500) is our flagship model with the exclusive Pioneer Package included.
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Every 3.5 tonne horsebox we build features premium GRP construction, comfortable living areas, practical storage solutions, 
              and is built on the reliable Iveco Daily chassis. All models come with our comprehensive 2-year structural warranty and are 
              designed to safely transport two horses while staying within the 3,500kg weight limit.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Can be driven on a standard car license (passed before 1997)</span>
              </div>
              <div className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Lower running costs than larger horseboxes</span>
              </div>
              <div className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Perfect for two horses up to 16.2hh</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Our 4.5, 7.2 & 7.5 Tonne Horsebox Range</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              For those requiring additional capacity, our 4.5t horsebox range offers enhanced payload and spacious living quarters. 
              The <strong>Aeos Edge 45</strong> delivers professional-grade features, while the <strong>Aeos Freedom 45</strong> provides 
              versatility for families. The <strong>Aeos Discovery 45</strong> features luxury apartment-style living for extended stays at competitions.
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed">
              At the top of our range, the <strong>Aeos Discovery 72</strong> (7.2 tonne) and <strong>Helios 75</strong> (7.5 tonne) are our flagship models, offering unparalleled luxury living 
              quarters while maintaining excellent facilities for transporting horses. With capacity for 2-4 horses and apartment-quality 
              accommodation, these models are the choice of international competitors and professional teams.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Increased payload for longer trips and more equipment</span>
              </div>
              <div className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Spacious living quarters with sleeping facilities</span>
              </div>
              <div className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Suitable for larger horses and professional use</span>
              </div>
            </div>
          </div>
        </div>

        {/* British Manufacturing Excellence */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 mb-16">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 text-center">
            British Horsebox Manufacturing Excellence in Norfolk
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Norfolk Manufacturing Facility</h4>
              <p className="text-slate-600 leading-relaxed">
                Based in Beeston, Norfolk, our purpose-built facility combines traditional British craftsmanship with modern 
                manufacturing technology. Every JTH horsebox is built by our skilled team of craftsmen who have decades of 
                experience in horsebox construction.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">30+ Years of Experience</h4>
              <p className="text-slate-600 leading-relaxed">
                Incorporating the legacy of Kevin Parker Horseboxes (KPH), we bring over 30 years of horsebox building expertise. 
                Our team understands the unique requirements of British horse owners and builds each horsebox to exceed expectations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Innovation & Technology</h4>
              <p className="text-slate-600 leading-relaxed">
                We don't follow other manufacturers but lead through innovation. From advanced GRP construction techniques to 
                integrated technology systems, every JTH horsebox incorporates the latest advancements in safety and comfort.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison with Competitors */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 text-center">
            How JTH Compares to Other UK Horsebox Manufacturers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-4 font-semibold text-slate-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-blue-600">JTH Horseboxes</th>
                  <th className="text-center p-4 font-semibold text-slate-600">Other Manufacturers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-4 text-slate-700">Starting Price (3.5t)</td>
                  <td className="p-4 text-center font-semibold text-blue-600">From £18,500</td>
                  <td className="p-4 text-center text-slate-600">From £20,000+</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 text-slate-700">Warranty</td>
                  <td className="p-4 text-center font-semibold text-blue-600">2 Year Structural</td>
                  <td className="p-4 text-center text-slate-600">12 Months Standard</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-700">Manufacturing Location</td>
                  <td className="p-4 text-center font-semibold text-blue-600">Norfolk, UK</td>
                  <td className="p-4 text-center text-slate-600">Various/Imported</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 text-slate-700">Customization Options</td>
                  <td className="p-4 text-center font-semibold text-blue-600">Fully Bespoke</td>
                  <td className="p-4 text-center text-slate-600">Limited Options</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-700">Experience</td>
                  <td className="p-4 text-center font-semibold text-blue-600">30+ Years (inc. KPH)</td>
                  <td className="p-4 text-center text-slate-600">Varies</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 text-slate-700">Delivery</td>
                  <td className="p-4 text-center font-semibold text-blue-600">UK & Ireland</td>
                  <td className="p-4 text-center text-slate-600">UK Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Location & Service Areas */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 text-center">
            Horsebox Sales & Service Across the UK
          </h3>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                Norfolk Showroom & Manufacturing
              </h4>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Visit our Norfolk showroom to view our range of 3.5t, 4.5t, and 7.2t horseboxes. Located in Beeston, 
                just outside Norwich, we're easily accessible from the A47 and A11. Our experienced team can demonstrate 
                all models and discuss your specific requirements.
              </p>
              <address className="text-slate-700 not-italic">
                J Taylor Horseboxes<br />
                Beeston, Norfolk<br />
                United Kingdom<br />
                <a href="tel:01603552109" className="text-blue-600 hover:text-blue-700 font-semibold">
                  <Phone className="inline w-4 h-4 mr-1" />01603 552109
                </a>
              </address>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">UK & Ireland Delivery Service</h4>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We deliver new horseboxes throughout the UK and Ireland. Our delivery service includes full handover 
                training and demonstration of all features. We also offer collection services for warranty work and servicing.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-slate-900">England & Wales:</strong>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    <li>• East Anglia</li>
                    <li>• Midlands</li>
                    <li>• South East</li>
                    <li>• South West</li>
                    <li>• North England</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-slate-900">Scotland & Ireland:</strong>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    <li>• Scottish Borders</li>
                    <li>• Central Scotland</li>
                    <li>• Northern Ireland</li>
                    <li>• Republic of Ireland</li>
                    <li>• Highlands (on request)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-100 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
              Frequently Asked Questions About <span className="text-blue-600">JTH Horseboxes</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to know about buying a 3.5t, 4.5t, 7.2t, or 7.5t horsebox from JTH
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                What license do I need to drive a 3.5 tonne horsebox?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                If you passed your driving test before 1 January 1997, you can drive a 3.5 tonne horsebox on your standard 
                car license (category B). If you passed after this date, you'll need to take an additional test to add category 
                B+E or C1 to your license. All our 3.5t models (Professional 35, Principle 35, and Progeny 35) are designed to 
                maximize payload while staying within the 3,500kg gross weight limit.
              </p>
            </div>
            
            <div className="bg-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                How much does a JTH horsebox cost?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our 3.5 tonne horseboxes start from £18,500 for the Principle 35, with the Professional 35 from £22,000 and 
                the Progeny 35 from £25,500. Additional models and sizes coming soon 
                (7.2 tonne) starts from £74,600 and the flagship Helios 75 (7.5 tonne) from £82,500. All prices exclude VAT. We offer finance options and part exchange on your 
                existing horsebox.
              </p>
            </div>
            
            <div className="bg-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                What's the difference between 3.5t, 4.5t, 7.2t, and 7.5t horseboxes?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                The main differences are payload capacity, living space, and license requirements. 3.5 tonne horseboxes can 
                carry two horses and basic living facilities while being drivable on a car license. 4.5 tonne models offer 
                increased payload, allowing for more extensive living quarters and equipment storage, but require a C1 license. 
                7.2 and 7.5 tonne horseboxes like our Aeos Discovery 72 and Helios 75 provide luxury apartment-style living and can accommodate 2-4 horses, 
                requiring a C1 or full HGV license.
              </p>
            </div>
            
            <div className="bg-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Do you offer horsebox finance?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Yes, we work with specialist horsebox finance providers to offer competitive HP and lease purchase options. 
                Typical terms range from 1-7 years with deposits from 10%. We can provide instant finance quotes and help 
                you find the best package for your budget. Part exchange of your existing horsebox can also form part or all 
                of your deposit.
              </p>
            </div>
            
            <div className="bg-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                What warranty comes with a JTH horsebox?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Every new JTH horsebox comes with a comprehensive 2-year structural warranty, which is twice the industry 
                standard. This covers all structural elements, GRP bodywork, and manufacturing defects. The Iveco chassis 
                comes with its own manufacturer warranty. We also offer extended warranty options and comprehensive servicing 
                packages to keep your horsebox in perfect condition.
              </p>
            </div>
            
            <div className="bg-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Can I customize my JTH horsebox?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Absolutely! Every JTH horsebox can be customized to your exact requirements. From paint colors and graphics 
                to internal layouts and equipment specifications, we offer extensive customization options. Popular upgrades 
                include solar panels, CCTV systems, hydraulic ramps, air conditioning, and luxury living packages. Our online 
                configurator lets you explore options and get instant pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-8 text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-8 tracking-wide">
            Ready to Buy Your 3.5t, 4.5t, 7.2t or 7.5t Horsebox?
          </h2>
          <div className="w-24 h-px bg-white mx-auto mb-10"></div>
          <p className="text-lg text-blue-100 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Configure your perfect JTH horsebox online or visit our Norfolk showroom. 
            Choose from our range of 3.5 tonne, 4.5 tonne, 7.2 tonne, and 7.5 tonne models.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/models" className="inline-flex items-center px-10 py-4 bg-white text-blue-600 font-medium hover:bg-slate-50 transition-all duration-300 transform hover:scale-105">
              Browse All Models
            </Link>
            <Link href="/configurator/professional-35" className="inline-flex items-center px-10 py-4 border border-white text-white font-medium hover:bg-white hover:text-blue-600 transition-all duration-300">
              Start Configuring
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
