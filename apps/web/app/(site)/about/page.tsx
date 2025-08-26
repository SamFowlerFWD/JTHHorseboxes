import Hero from '@/components/Hero'
import Schema, { organizationSchema, generateBreadcrumbSchema, generateServiceSchema } from '@/components/Schema'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { 
  ArrowRight, 
  Award, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle,
  Factory,
  Sparkles,
  Heart,
  Wrench,
  Target,
  TrendingUp
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About J Taylor Horseboxes | 30+ Years of British Excellence',
  description: 'Discover the JTH story. With over 30 years of experience and 500+ happy customers, we are the UK\'s trusted horsebox manufacturer. British built in Norfolk.',
  keywords: 'about JTH, J Taylor Horseboxes, British horsebox manufacturer, Norfolk horsebox builder, KPH heritage, horsebox company, UK horsebox manufacturer',
  openGraph: {
    title: 'About J Taylor Horseboxes | British Horsebox Excellence',
    description: 'Over 30 years of crafting premium horseboxes. 500+ happy customers. British manufacturing at its finest.',
    images: ['/about/workshop.jpg'],
  },
}

const breadcrumbs = [
  { name: 'Home', url: 'https://jthltd.co.uk' },
  { name: 'About', url: 'https://jthltd.co.uk/about' }
]

const serviceSchema = generateServiceSchema({
  name: 'Premium Horsebox Manufacturing',
  description: 'British-built luxury horseboxes from 3.5t to 7.2t with full customization options',
  serviceType: 'Vehicle Manufacturing',
  areaServed: ['GB', 'IE', 'FR', 'NL', 'BE', 'DE']
})

const milestones = [
  { year: '1993', event: 'Company Founded', description: 'Started with a vision for quality horseboxes' },
  { year: '2005', event: 'KPH Heritage Integration', description: 'Incorporated decades of KPH expertise' },
  { year: '2015', event: 'Norfolk Facility Expansion', description: 'Doubled production capacity' },
  { year: '2020', event: '500th Customer Milestone', description: 'Celebrated 500 happy customers' },
  { year: '2024', event: 'Innovation Award', description: 'Recognized for sustainable manufacturing' },
]

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Every horsebox is built with safety as the paramount concern. We never compromise on the wellbeing of horses and riders.'
  },
  {
    icon: Award,
    title: 'Quality Craftsmanship',
    description: 'British manufacturing excellence with attention to every detail. Each horsebox is built by skilled craftsmen.'
  },
  {
    icon: Heart,
    title: 'Customer Focus',
    description: 'We build relationships, not just horseboxes. Your satisfaction drives everything we do.'
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'Continuously improving designs and incorporating the latest technology for better performance.'
  }
]

const stats = [
  { value: '30+', label: 'Years Experience', description: 'Including KPH heritage' },
  { value: '500+', label: 'Happy Customers', description: 'Across UK & Ireland' },
  { value: '100%', label: 'British Built', description: 'In Norfolk, England' },
  { value: '2 Year', label: 'Warranty', description: 'Comprehensive coverage' }
]

export default function AboutPage() {
  return (
    <>
      <Schema schema={[organizationSchema, generateBreadcrumbSchema(breadcrumbs), serviceSchema]} />
      <main className="bg-white">
        {/* Hero Section */}
        <Hero 
          primarySrc="/about/workshop.jpg"
          fallbackSrc="/hero-about.jpg"
          height="lg"
          overlay="gradient"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-slideUp">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-slideUp animation-delay-200">
              Three decades of British excellence in horsebox manufacturing
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 animate-slideUp animation-delay-400">
              <Link href="/models" className="btn-premium">
                View Our Models
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/contact" className="btn-premium-outline border-white text-white hover:text-slate-900">
                Visit Our Showroom
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </Hero>

        {/* Stats Bar */}
        <section className="bg-slate-900 py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
                  Est. 1993
                </div>
                <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">
                  British Manufacturing
                  <span className="text-gradient-blue block mt-2">At Its Finest</span>
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-700 to-amber-500 mb-8"></div>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  J Taylor Horseboxes represents over three decades of British manufacturing excellence. 
                  From our Norfolk facility, we've built a reputation for quality, reliability, and innovation 
                  that extends across the UK and Ireland.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Our journey began in 1993 with a simple vision: to build the finest horseboxes available. 
                  Through incorporating the expertise and heritage of KPH, we've refined our craft to deliver 
                  horseboxes that exceed expectations in every way.
                </p>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Today, with over 500 satisfied customers, we continue to lead the industry through 
                  innovation, craftsmanship, and an unwavering commitment to quality.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-blue-700 mr-3" />
                    <span className="text-slate-700">Family-run business</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-blue-700 mr-3" />
                    <span className="text-slate-700">British workforce</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-blue-700 mr-3" />
                    <span className="text-slate-700">Premium materials</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-700 to-amber-500 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative image-premium">
                  <Image 
                    src="/about/team.jpg"
                    alt="JTH team at work"
                    width={600} 
                    height={400} 
                    className="shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Heritage & Timeline */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
                Our Heritage & Journey
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Building on the legacy of KPH, we've created a company that honors tradition while embracing innovation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="bg-slate-50 p-8">
                <Factory className="w-12 h-12 text-blue-700 mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">The KPH Legacy</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Our story is deeply intertwined with KPH, one of the pioneering names in British horsebox manufacturing. 
                  When we incorporated their expertise and knowledge, we didn't just acquire assets – we inherited 
                  decades of innovation, craftsmanship, and a commitment to excellence.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  This heritage forms the foundation of everything we build today, combining time-tested 
                  techniques with modern technology to create horseboxes that set the standard for the industry.
                </p>
              </div>

              <div className="bg-slate-50 p-8">
                <Target className="w-12 h-12 text-blue-700 mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  To design and build the finest horseboxes available, ensuring every customer receives 
                  a vehicle that exceeds their expectations in quality, safety, and performance.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We believe that a horsebox is more than just transport – it's an essential partner in 
                  your equestrian journey. That's why we build each one as if it were our own, with 
                  meticulous attention to detail and an uncompromising commitment to excellence.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-700 to-amber-500"></div>
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className={`bg-white p-6 shadow-lg border border-slate-200 ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'} max-w-md`}>
                      <span className="text-blue-700 font-bold text-xl">{milestone.year}</span>
                      <h3 className="text-xl font-semibold text-slate-900 mt-2 mb-2">{milestone.event}</h3>
                      <p className="text-slate-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-700 rounded-full border-4 border-white shadow"></div>
                  <div className="hidden md:block md:w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-32 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
                Our Values
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="card-dark p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{value.title}</h3>
                  <p className="text-slate-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manufacturing Process */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
                Our Manufacturing Process
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                From concept to completion, every step is carefully managed to ensure perfection
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-white p-8 mb-6">
                  <div className="text-4xl font-bold text-blue-700 mb-4">01</div>
                  <Wrench className="w-12 h-12 text-slate-700 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Design & Planning</h3>
                <p className="text-slate-600">
                  Every horsebox begins with detailed consultation and planning. We work with you to understand 
                  your needs and create a specification that perfectly matches your requirements.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-white p-8 mb-6">
                  <div className="text-4xl font-bold text-blue-700 mb-4">02</div>
                  <Factory className="w-12 h-12 text-slate-700 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Build & Craft</h3>
                <p className="text-slate-600">
                  Our skilled craftsmen bring your horsebox to life using premium materials and time-tested 
                  techniques. Every detail is meticulously executed to ensure the highest quality.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-white p-8 mb-6">
                  <div className="text-4xl font-bold text-blue-700 mb-4">03</div>
                  <CheckCircle className="w-12 h-12 text-slate-700 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Test & Deliver</h3>
                <p className="text-slate-600">
                  Rigorous quality checks ensure your horsebox meets our exacting standards. We then provide 
                  comprehensive handover training to ensure you're completely confident with your new vehicle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose JTH */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">
                  Why Choose
                  <span className="text-gradient-blue block mt-2">J Taylor Horseboxes?</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Unmatched Experience</h3>
                      <p className="text-slate-600">Over 30 years of expertise, including our KPH heritage, ensures you're working with true industry leaders.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">British Quality</h3>
                      <p className="text-slate-600">Every horsebox is built in Norfolk by skilled British craftsmen using premium materials.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Complete Customization</h3>
                      <p className="text-slate-600">Your horsebox, your way. We offer unlimited customization options to meet your exact requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Exceptional Support</h3>
                      <p className="text-slate-600">From initial consultation to aftercare, our team is always here to support you.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Proven Track Record</h3>
                      <p className="text-slate-600">Over 500 happy customers across the UK and Ireland trust JTH for their horsebox needs.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-700 to-amber-500 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative image-premium">
                  <Image 
                    src="/about/quality.jpg"
                    alt="Quality craftsmanship at JTH"
                    width={600} 
                    height={500} 
                    className="shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Dedicated professionals passionate about building the finest horseboxes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Design Team</h3>
                <p className="text-slate-600">Expert designers who bring your vision to life with innovative solutions</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Wrench className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Production Team</h3>
                <p className="text-slate-600">Skilled craftsmen with decades of combined experience</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Customer Care</h3>
                <p className="text-slate-600">Dedicated support team ensuring your complete satisfaction</p>
              </div>
            </div>

            <div className="bg-blue-50 p-8 md:p-12 text-center">
              <p className="text-lg text-slate-700 italic mb-6">
                "We don't just build horseboxes, we build relationships. Every member of our team 
                is committed to delivering excellence and ensuring your complete satisfaction."
              </p>
              <p className="text-slate-900 font-semibold">The JTH Team</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-r from-blue-700 to-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
              Experience British Excellence
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Visit our Norfolk showroom to see our craftsmanship firsthand
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/models" className="btn-premium bg-white text-blue-700 hover:bg-slate-50">
                View Our Models
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/contact" className="btn-premium-outline border-white text-white">
                Contact Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}