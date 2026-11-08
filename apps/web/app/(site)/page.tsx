"use client"

import HeroAdvanced from '@/components/HeroAdvanced'
import DissolveGallery from '@/components/DissolveGallery'
import ProductShowcase from '@/components/ProductShowcase'
import { motion } from 'framer-motion'
import Schema, { organizationSchema, localBusinessSchema } from '@/components/Schema'
import { Phone, MapPin, Check } from 'lucide-react'
import TrustIndicators from '@/components/TrustIndicators'
import Link from 'next/link'
import Image from 'next/image'

const safetyFeatures = [
  'Triple reinforced primary bulkhead',
  'Secondary aluminium bulkhead',
  'Stallion stall as standard',
  'Aluminium side wall channel',
  'Aluminium or carbon fibre composite floor',
  'Aluminium frame ramp: no gap, no step',
]

// SEO metadata is preserved from original homepage
export default function HomePage() {

  // Gallery images - mixture from optimised JTH images.
  //
  // Any image can carry `hotspots: [{ x, y, label, description }]`. x/y are
  // percentages of the gallery frame (not the photo), so set them against a
  // landscape image or the letterboxing will push them off the subject.
  // Desktop shows every label beside its dot; a phone reveals one on tap.
  const galleryImages = [
    {
      src: '/gallery/principle-01.webp',
      alt: 'JTH Principle - Exterior View',
      title: 'Principle',
      description: 'The box that goes out every weekend of the season'
    },
    {
      src: '/gallery/progeny-01.webp',
      alt: 'JTH Progeny - Interior Horse Area',
      title: 'Progeny',
      description: 'Top of the range 3.5 tonne model'
    },
    {
      src: '/gallery/freedom-01.webp',
      alt: 'Aeos Freedom 45 - Full Side View',
      title: 'Aeos Freedom 45',
      description: 'KPH heritage lightweight design'
    },
    {
      src: '/gallery/discovery45-01.webp',
      alt: 'Aeos Discovery 45 - Exterior',
      title: 'Aeos Discovery 45',
      description: 'Apartment-style living for longer stays away'
    },
    {
      src: '/gallery/discovery72-01.webp',
      alt: 'Aeos Discovery 72 - Full Length',
      title: 'Aeos Discovery 72',
      description: '7.2 tonne capacity for multiple horses'
    },
    {
      src: '/gallery/professional-02.webp',
      alt: 'JTH Professional - Three Quarter View',
      title: 'Professional',
      description: 'Showcasing premium British craftsmanship'
    },
    {
      src: '/gallery/principle-02.webp',
      alt: 'JTH Principle - Detail View',
      title: 'Principle',
      description: 'A short list of fittings, and the payload to show for it'
    },
    {
      src: '/gallery/progeny-02.webp',
      alt: 'JTH Progeny - Interior Living',
      title: 'Progeny',
      description: 'Luxury living quarters included'
    },
    {
      src: '/gallery/discovery45-02.webp',
      alt: 'Aeos Discovery 45 - Side Profile',
      title: 'Aeos Discovery 45',
      description: 'Aerodynamic design for fuel efficiency'
    }
  ]

  // Aeos — the flagship range. Only the three models with a full set of
  // photography appear here; Edge 45, Edge ST 45 and Helios 75 carry a hero
  // shot only (see docs/JTH_master_spec_sheet_2026-11-07.xlsx, Model status).
  //
  // No prices: /models already shows "Price on application" for this range,
  // and the guide prices on that page disagree with the cards. Keeping the
  // flagship off price is both the safer reading of the data and the usual
  // convention at this end of the market.
  const aeosModels = [
    {
      slug: 'aeos-freedom-45',
      name: 'Aeos Freedom 45',
      line: 'The weekender, with a family-friendly layout.',
      image: '/models/aeos-freedom-45/07.webp',
      alt: 'Aeos Freedom 45 horsebox in silver, side view',
    },
    {
      slug: 'aeos-discovery-45',
      name: 'Aeos Discovery 45',
      line: 'Apartment-style living, for longer stays away.',
      image: '/models/aeos-discovery-45/05.webp',
      alt: 'Aeos Discovery 45 horsebox in blue, front three-quarter view',
    },
    {
      slug: 'aeos-discovery-72',
      name: 'Aeos Discovery 72',
      line: '7.2 tonnes, with apartment-quality living quarters.',
      image: '/models/aeos-discovery-72/hero.jpg',
      alt: 'Aeos Discovery 72 horsebox in green, on a country lane at dusk',
    },
  ]

  // Sample products - using external shots
  const products = [
    {
      id: 'professional-35',
      title: 'Professional 35',
      subtitle: '3.5 Tonne · For the competition season',
      description: 'The full specification, for the rider who is out most weekends.',
      price: '£22,000',
      priceNote: 'body build only · exc. VAT',
      images: ['/models/professional-35/02.webp', '/models/professional-35/03.webp', '/models/professional-35/01.webp'],
      features: [
        { label: 'Payload', value: 'Minimum 1 tonne' },
        { label: 'Horse Capacity', value: '2 horses' },
        { label: 'Living', value: 'Premium specification' },
        { label: 'Warranty', value: '2 years structural' }
      ],
      availability: 'In Stock' as const,
      deliveryTime: '8-10 weeks',
      warranty: '2 Year Structural Warranty'
    },
    {
      id: 'principle-35',
      title: 'Principle 35',
      subtitle: '3.5 Tonne · For everyday work',
      description: 'A short list of fittings, and the payload to show for it.',
      price: '£19,500',
      priceNote: 'body build only · exc. VAT',
      images: ['/models/principle-35/cover.webp', '/models/principle-35/02.webp', '/models/principle-35/03.webp', '/models/principle-35/01.webp'],
      features: [
        { label: 'Payload', value: '1.1 tonnes on average' },
        { label: 'Horse Capacity', value: '2 horses' },
        { label: 'Living', value: "Fitted groom's area" },
        { label: 'Warranty', value: '12 months' }
      ],
      availability: 'Pre-Order' as const,
      deliveryTime: '10-12 weeks',
      warranty: '12 Month Build Warranty'
    },
    {
      id: 'progeny-35',
      title: 'Progeny 35',
      subtitle: '3.5 Tonne Crew Cab · For teams and families',
      description: 'Crew cab 3.5t horsebox with up to 7 seats — top of the range specification.',
      price: '£25,500',
      priceNote: 'body build only · exc. VAT',
      images: ['/models/progeny-35/02.webp', '/models/progeny-35/03.webp', '/models/progeny-35/01.webp'],
      features: [
        { label: 'Seating', value: 'Up to 7 seats' },
        { label: 'Crew Cab', value: '2-3 front + up to 4 rear' },
        { label: 'Horse Capacity', value: '2 horses' },
        { label: 'Warranty', value: '2 years structural' }
      ],
      availability: 'Limited' as const,
      deliveryTime: '12-14 weeks',
      warranty: '2 Year Structural Warranty'
    }
  ]

  return (
    <main>
      <Schema schema={[organizationSchema, localBusinessSchema]} />

      {/* Advanced Hero Section with British Racing Green */}
      <HeroAdvanced
        title="Premium British Horseboxes"
        subtitle="Built by James Taylor. Incorporating the legacy of Kevin Parker."
        description="Leading UK horsebox manufacturer in Norfolk. 3.5t, 4.5t, 7.2t & 7.5t models from £19,500 + VAT."
        primaryCTA={{
          text: "Explore Collection",
          href: "/models"
        }}
        secondaryCTA={{
          text: "Get a Quote",
          href: "/contact"
        }}
        media={[
          { type: 'image', src: '/models/professional-35/02.webp' },
          { type: 'image', src: '/models/principle-35/01.webp' },
          { type: 'image', src: '/models/progeny-35/02.webp' }
        ]}
        overlay="gradient"
        height="full"
        parallax
      />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Bento Grid Section with British Racing Green */}
      <section className="py-20 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-fluid-4xl font-light text-slate-900 mb-4">
              British Horsebox Excellence
            </h2>
            <p className="text-fluid-lg text-slate-700 max-w-3xl mx-auto">
              Experience the perfect blend of British craftsmanship and modern innovation
            </p>
          </motion.div>

          <div className="bento-grid">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bento-item-large rounded-2xl text-white relative overflow-hidden shadow-lg"
            >
              <Image
                src="/home/safety-first.webp"
                alt="Lit horse area inside a JTH horsebox, with aluminium partition and padded breast bar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
              <div className="relative z-10 p-8">
                <h3 className="text-2xl font-semibold mb-4">Safety First</h3>
                <ul className="space-y-2 text-white/90">
                  {safetyFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl text-white relative overflow-hidden min-h-[200px]"
            >
              <Image
                src="/home/premium-materials.webp"
                alt="Aluminium-framed partition doors with JTH-branded tie ring plates"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/20" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-xl font-semibold mb-2">Premium Materials</h3>
                <p className="text-sm text-white/90">Advanced GRP construction with aerospace-grade materials for superior durability, backed by a build warranty of up to 24 months</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl text-white relative overflow-hidden min-h-[200px]"
            >
              <Image
                src="/home/customisable.webp"
                alt="Bespoke groom's area with wood-effect cabinets and a quilted pink and brown bench seat"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-xl font-semibold mb-2">Customisable</h3>
                <p className="text-sm text-white/90">Bespoke to your needs</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bento-item-wide rounded-2xl text-white relative overflow-hidden min-h-[200px]"
            >
              <Image
                src="/kph-heritage.webp"
                alt="Aeos Freedom 45 horsebox - KPH Heritage"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-xl font-semibold mb-2">KPH Heritage</h3>
                <p className="text-sm text-white/90">Incorporating Kevin Parker's proven designs</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dissolve Gallery Showcase */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-fluid-4xl font-light text-slate-900 mb-4">
              Crafted in Norfolk
            </h2>
            <p className="text-fluid-lg text-slate-700 max-w-3xl mx-auto">
              Every JTH horsebox is built by hand at our Norfolk workshop. See the quality and attention to detail that goes into each build.
            </p>
          </motion.div>

          <DissolveGallery
            images={galleryImages}
            autoPlay={true}
            autoPlayInterval={5000}
            showThumbnails={true}
            enableZoom={true}
            enableFullscreen={true}
            enableHotspots={true}
            transitionType="dissolve"
            className="shadow-2xl rounded-2xl overflow-hidden"
          />
        </div>
      </section>

      {/* Aeos — the flagship range, set above the 3.5t range that follows */}
      <section className="bg-ink py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-brass">
              The flagship range
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-white mt-3 leading-[1.1]">
              Aeos
            </h2>
            <div className="w-24 h-px bg-brass/50 mx-auto my-7"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Kevin Parker&apos;s designs, acquired by JTH in 2025. Horseboxes at 4.5 and
              7.2 tonnes, for riders who are away for nights at a time.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {aeosModels.map((model, index) => (
              <motion.div
                key={model.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/models/${model.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={model.image}
                      alt={model.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <h3 className="font-display text-2xl text-white mt-5 group-hover:text-brass transition-colors">
                    {model.name}
                  </h3>
                  <p className="mt-2 text-slate-300 leading-relaxed">{model.line}</p>
                  <p className="mt-3 text-sm text-slate-400">Price on application</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/models" className="btn-on-dark-outline">
              Explore the Aeos range
            </Link>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              The 3.5 tonne range
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink mt-3 leading-[1.1]">
              Professional, Principle and Progeny
            </h2>
            <div className="w-24 h-px bg-line mx-auto my-7"></div>
            <p className="text-fluid-lg text-slate-700 max-w-2xl mx-auto font-light">
              Driven on a standard car licence, whenever you passed your test.
            </p>
          </motion.div>

          <ProductShowcase
            products={products}
            layout="featured"
            showFilters={false}
          />
        </div>
      </section>

      {/* Welcome Section with SEO Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            Made in Great Britain
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-ink mb-8 leading-[1.1]">
            Welcome to J Taylor Horseboxes
          </h2>
          <div className="w-24 h-0.5 bg-line mx-auto mb-8"></div>
          <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed font-light mb-6">
            One of the most important aspects of JTH is that we don't follow other manufacturers, 
            but lead through innovation, creative designs and materials technology.
          </p>
          <p className="text-xl text-amber-600 font-semibold">
            "Stunning comes as standard on every JTH horsebox"
          </p>
        </div>
      </section>

      {/* SEO Content Section - Comprehensive Horsebox Information */}
      <section className="bg-ink py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl text-white mb-8 leading-[1.1]">
              Why Choose JTH 3.5t Horseboxes
            </h2>
            <div className="w-24 h-0.5 bg-brass/50 mx-auto mb-8"></div>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              As one of the UK's leading horsebox manufacturers, JTH (J Taylor Horseboxes) specialises in building premium 
              3.5 tonne, 4.5 tonne, 7.2 tonne, and 7.5 tonne horseboxes. We&apos;re a family-run business of equestrians,
              building every horsebox in our Norfolk workshop.
            </p>
          </div>

          {/* British Manufacturing Excellence */}
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="glass-dark p-8 rounded-2xl">
              <h4 className="font-semibold mb-3 text-amber-400">Family Run, Built in Norfolk</h4>
              <p className="text-slate-300 leading-relaxed">
                We&apos;re equestrians ourselves. Every horsebox is built by hand in our Norfolk workshop, combining
                traditional British craftsmanship with modern materials.
              </p>
            </div>
            <div className="glass-dark p-8 rounded-2xl">
              <h4 className="font-semibold mb-3 text-amber-400">KPH Heritage</h4>
              <p className="text-slate-300 leading-relaxed">
                Incorporating the proven designs and legacy of Kevin Parker Horseboxes (KPH), built on years of refinement.
              </p>
            </div>
            <div className="glass-dark p-8 rounded-2xl">
              <h4 className="font-semibold mb-3 text-amber-400">Innovation & Technology</h4>
              <p className="text-slate-300 leading-relaxed">
                We don't follow other manufacturers but lead through innovation with advanced GRP construction techniques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="font-display text-2xl md:text-3xl text-ink mb-8 text-center leading-[1.1]">
            Visit Our Norfolk Workshop
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-blue-700 mr-2" />
                We Build Our Own Horseboxes
              </h4>
              <p className="text-slate-700 mb-4 leading-relaxed">
                Every JTH horsebox is built by our own team, here in Norfolk. Come and visit the workshop and see
                the quality of our builds for yourself, in real time, as each horsebox takes shape.
              </p>
              <address className="text-slate-800 not-italic">
                J Taylor Horseboxes<br />
                Norfolk<br />
                United Kingdom<br />
                <a href="tel:01603552109" className="text-blue-700 hover:text-blue-800 font-semibold">
                  <Phone className="inline w-4 h-4 mr-1" />01603 552109
                </a>
              </address>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">UK & Ireland Delivery</h4>
              <p className="text-slate-700 mb-4 leading-relaxed">
                We deliver new horseboxes throughout the UK and Ireland. Our delivery service includes full handover 
                training and demonstration of all features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with new colors */}
      <section className="gradient-premium py-20 md:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-8 tracking-wide leading-[1.1]">
            Ready to Buy Your Premium Horsebox?
          </h2>
          <div className="w-24 h-px bg-brass-light mx-auto mb-10"></div>
          <p className="text-lg text-white/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Get in touch for a quote or visit our Norfolk workshop. 
            Choose from our range of 3.5 tonne, 4.5 tonne, 7.2 tonne, and 7.5 tonne models.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/models" className="btn-on-dark">
              Browse All Models
            </Link>
            <Link href="/contact" className="btn-on-dark-outline">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}