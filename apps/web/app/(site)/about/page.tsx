import Hero from '@/components/Hero'
import Schema, { organizationSchema, generateBreadcrumbSchema, generateServiceSchema } from '@/components/Schema'
import Link from 'next/link'
import type { Metadata } from 'next'
import ClickableImage from '@/components/ClickableImage'
import {
  Award,
  Shield,
  Users,
  CheckCircle,
  Factory,
  Heart,
  Wrench,
  Target,
  Hammer,
  Stethoscope,
  HardHat,
  Cpu,
  Cog
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About J Taylor Horseboxes | British Horsebox Manufacturer in Norfolk',
  description: 'Meet the JTH team. Founded by James Taylor with 10+ years experience. Incorporating the KPH legacy from Kevin Parker. Safety, Quality, Durability - built in Beeston, Norfolk.',
  keywords: 'about JTH, J Taylor Horseboxes, James Taylor, KPH heritage, Kevin Parker Horseboxes, British horsebox manufacturer, Norfolk horsebox builder, Beeston Norfolk',
  openGraph: {
    title: 'About J Taylor Horseboxes | British Horsebox Excellence',
    description: 'Meet the team behind JTH. Founded by James Taylor, incorporating KPH legacy. Safety, Quality, Durability.',
    images: ['/models/professional-35/01.webp'],
  },
}

const breadcrumbs = [
  { name: 'Home', url: 'https://jthltd.co.uk' },
  { name: 'About', url: 'https://jthltd.co.uk/about' }
]

const serviceSchema = generateServiceSchema({
  name: 'Premium Horsebox Manufacturing',
  description: 'British-built luxury horseboxes from 3.5t to 7.5t with full customization options',
  serviceType: 'Vehicle Manufacturing',
  areaServed: ['GB', 'IE']
})

const values = [
  {
    icon: Shield,
    title: 'Safety',
    description: 'Manufacturing the safest possible horse transport is our primary concern. We never compromise on the wellbeing of horses and their owners.'
  },
  {
    icon: Award,
    title: 'Quality',
    description: 'British manufacturing excellence with attention to every detail. Each horsebox is built by skilled craftsmen using premium materials.'
  },
  {
    icon: Hammer,
    title: 'Durability',
    description: 'Built to last with advanced GRP construction and quality components. Our horseboxes are designed for years of reliable service.'
  },
  {
    icon: Heart,
    title: 'Customer Focus',
    description: 'We build relationships, not just horseboxes. The majority of our new business comes from customer recommendations.'
  }
]

const team = [
  {
    name: 'James Taylor',
    role: 'Owner & Lead Builder',
    icon: Wrench,
    description: 'Over a decade of horsebox-building expertise. Before establishing JTH, James created custom horseboxes for personal clients and collaborated with industry leaders.'
  },
  {
    name: 'Jennifer',
    role: 'Partner',
    icon: Stethoscope,
    description: 'Veterinarian specialising in small animals and an active competitor in equestrian sports. Brings invaluable insight into horse welfare and rider needs.'
  },
  {
    name: 'Owen',
    role: 'Senior Craftsman',
    icon: HardHat,
    description: 'James\'s father with over 30 years of construction experience. Also a BSJA competitor, bringing both expertise and equestrian understanding to every build.'
  },
  {
    name: 'Steve',
    role: 'Specialist Craftsman',
    icon: Cog,
    description: 'Multi-skilled craftsperson with expertise in welding and woodworking. Brings precision and attention to detail to every component.'
  },
  {
    name: 'Sam',
    role: 'Digital & Workshop',
    icon: Cpu,
    description: 'Digital support and workshop assistance. Also works as a farrier in Norfolk, providing additional equestrian expertise to the team.'
  },
  {
    name: 'Rob',
    role: 'Technical Specialist',
    icon: Factory,
    description: 'Mechanically-minded technician and multi-task contributor. Ensures all mechanical systems meet the highest standards.'
  }
]

const stats = [
  { value: 'British', label: 'Built', description: 'In Beeston, Norfolk' },
  { value: 'KPH', label: 'Heritage', description: 'Proven designs' },
  { value: 'Family', label: 'Run', description: 'Personal service' },
  { value: 'Custom', label: 'Options', description: 'Built to your spec' }
]

export default function AboutPage() {
  return (
    <>
      <Schema schema={[organizationSchema, generateBreadcrumbSchema(breadcrumbs), serviceSchema]} />
      <main className="bg-white">
        {/* Hero Section */}
        <Hero
          primarySrc="/models/jth-professional-45/04.webp"
          fallbackSrc="/models/principle-35/01.webp"
          height="lg"
          overlay="gradient"
        >
          <div className="w-full self-end pb-16 md:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.04] animate-slideUp">
                  About JTH
                </h1>
                <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed animate-slideUp animation-delay-200">
                  Safety, quality and durability &mdash; the foundation of every horsebox we build.
                </p>
                <div className="mt-10 flex flex-col gap-[4px] animate-slideUp animation-delay-200">
                  <span className="block h-[2px] w-32 bg-brass-light" />
                  <span className="block h-px w-20 bg-brass-light/60" />
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-4 animate-slideUp animation-delay-400">
                  <Link href="/models" className="btn-on-dark">
                    View Our Models
                  </Link>
                  <Link href="/contact" className="btn-on-dark-outline">
                    Visit Our Workshop
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Hero>

        {/* Stats Bar */}
        <section className="bg-slate-900 py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-3xl text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400 tracking-wide">{stat.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-20 md:py-32 bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="fade-in-up">
                <p className="mb-5 flex items-center gap-3 text-sm text-slate-500">
                  <span className="block h-px w-8 bg-brass" />
                  Beeston, Norfolk
                </p>
                <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.1] mb-8">
                  British Manufacturing
                  <span className="block mt-2">Built on Trust</span>
                </h2>
                <div className="w-28 h-[2px] bg-brass mb-8"></div>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  One of the most important aspects of JTH is that we don't follow other manufacturers,
                  but lead through innovation, creative designs and materials technology.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  JTH was founded by James Taylor, bringing over a decade of horsebox-building expertise.
                  In early 2025, we acquired the KPH Horseboxes designs and brand from Kevin Parker,
                  continuing his legacy of quality and innovation in the industry.
                </p>
                <blockquote className="my-10 border-l-2 border-brass pl-6">
                  <p className="font-display text-2xl text-ink leading-snug">
                    Stunning comes as standard on every JTH horsebox.
                  </p>
                </blockquote>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-brass mr-3" strokeWidth={1.5} />
                    <span className="text-slate-700">Family-run business</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-brass mr-3" strokeWidth={1.5} />
                    <span className="text-slate-700">KPH Heritage</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-brass mr-3" strokeWidth={1.5} />
                    <span className="text-slate-700">Customer recommended</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <ClickableImage
                  src="/about-workshop.webp"
                  alt="JTH horsebox craftsmanship"
                  width={600}
                  height={400}
                  className="w-full h-auto shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* KPH Heritage Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.1] mb-6">
                The KPH Legacy
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Continuing Kevin Parker's commitment to excellence in horsebox manufacturing
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="bg-slate-50 p-8">
                <Factory className="w-12 h-12 text-blue-700 mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Incorporating KPH</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  In early 2025, JTH acquired the KPH Horseboxes designs and brand from Kevin Parker.
                  This wasn't just a business acquisition – it was a commitment to continuing decades
                  of innovation, craftsmanship, and dedication to quality.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  The KPH range represents years of refinement and customer feedback, and we're proud
                  to carry this legacy forward while adding our own innovations to the designs.
                </p>
              </div>

              <div className="bg-slate-50 p-8">
                <Target className="w-12 h-12 text-blue-700 mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  To manufacture the safest possible horse transport while building strong customer
                  relationships founded on trust. Your satisfaction is the foundation of our business.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  The majority of our new business comes through customer recommendations – a testament
                  to the relationships we build and the quality we deliver with every horsebox.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-32 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.1] mb-6">
                Our Values
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Safety, Quality, and Durability guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="card-dark p-8 text-center">
                  <div className="flex justify-center mb-5">
                    <value.icon className="w-7 h-7 text-brass" strokeWidth={1.25} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{value.title}</h3>
                  <p className="text-slate-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-32 bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.1] mb-6">
                Meet the Team
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                A dedicated team combining horsebox expertise with equestrian knowledge
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {team.map((member, index) => (
                <div key={index} className="bg-white p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex mb-5">
                    <member.icon className="w-7 h-7 text-brass" strokeWidth={1.25} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-blue-700 font-medium mb-4">{member.role}</p>
                  <p className="text-slate-600">{member.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-8 md:p-12 text-center">
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                Our team combines decades of construction and manufacturing experience with genuine
                equestrian expertise. Several team members are active competitors and horse owners
                themselves, bringing real-world understanding to every horsebox we build.
              </p>
              <p className="text-slate-900 font-semibold">
                Building relationships, not just horseboxes
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose JTH */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.1] mb-8">
                  Why Choose
                  <span className="block mt-2">J Taylor Horseboxes?</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-brass mt-1 mr-4 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Innovation Leaders</h3>
                      <p className="text-slate-600">We don't follow other manufacturers – we lead through innovation, creative designs and materials technology.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-brass mt-1 mr-4 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">KPH Heritage</h3>
                      <p className="text-slate-600">Incorporating the proven designs and expertise of Kevin Parker Horseboxes, refined over many years.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-brass mt-1 mr-4 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Equestrian Expertise</h3>
                      <p className="text-slate-600">Our team includes active competitors and horse professionals who understand your needs.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-brass mt-1 mr-4 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Customer Recommended</h3>
                      <p className="text-slate-600">The majority of our new business comes from customer recommendations – the best endorsement possible.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-brass mt-1 mr-4 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">British Built</h3>
                      <p className="text-slate-600">Every horsebox is built at our facility in Beeston, Norfolk by skilled British craftsmen.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <ClickableImage
                  src="/models/jth-progeny-45/01.webp"
                  alt="JTH Progeny horsebox"
                  width={600}
                  height={500}
                  className="w-full h-auto shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.1] mb-8">
              Visit Our Norfolk Workshop
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Come and see our craftsmanship firsthand in Beeston, Norfolk.
              We'd love to show you around and discuss your horsebox requirements.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/models" className="btn-on-dark">
                View Our Models
              </Link>
              <Link href="/contact" className="btn-on-dark-outline">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
