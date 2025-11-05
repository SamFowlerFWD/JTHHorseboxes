"use client"

import HeroAdvanced from '@/components/HeroAdvanced'
import DissolveGallery from '@/components/DissolveGallery'
import ProductShowcase from '@/components/ProductShowcase'
import { motion } from 'framer-motion'

export default function ShowcasePage() {
  // Sample gallery images
  const galleryImages = [
    {
      src: '/models/professional-35/01.jpg',
      alt: 'Professional 35 - Exterior View',
      title: 'Professional 35',
      description: 'Premium British horsebox with luxury finish',
      hotspots: [
        { x: 30, y: 40, label: 'GRP Construction', description: 'Durable and lightweight' },
        { x: 70, y: 60, label: 'Safety Features', description: 'Advanced safety systems' }
      ]
    },
    {
      src: '/models/principle-35/01.jpg',
      alt: 'Principle 35 - Side View',
      title: 'Principle 35',
      description: 'Perfect balance of quality and value'
    },
    {
      src: '/models/progeny-35/01.jpg',
      alt: 'Progeny 35 - Front View',
      title: 'Progeny 35',
      description: 'Top of the range with Pioneer Package'
    }
  ]

  // Sample products
  const products = [
    {
      id: 'professional-35',
      title: 'Professional 35',
      subtitle: '3.5 Tonne Luxury',
      description: 'The ultimate in luxury and performance for the professional rider.',
      price: '£22,000',
      priceNote: 'exc. VAT',
      images: ['/models/professional-35/01.jpg', '/models/professional-35/02.jpg'],
      badge: {
        text: 'Most Popular',
        variant: 'default' as const
      },
      rating: 4.8,
      reviews: 47,
      features: [
        { label: 'Payload', value: '1,200kg' },
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
      subtitle: '3.5 Tonne Essential',
      description: 'Perfect balance of quality and value for the discerning owner.',
      price: '£18,500',
      priceNote: 'exc. VAT',
      images: ['/models/principle-35/01.jpg'],
      badge: {
        text: 'Best Value',
        variant: 'secondary' as const
      },
      rating: 4.6,
      reviews: 31,
      features: [
        { label: 'Payload', value: '1,250kg' },
        { label: 'Horse Capacity', value: '2 horses' },
        { label: 'Living', value: 'Essential features' },
        { label: 'Warranty', value: '2 years structural' }
      ],
      availability: 'Pre-Order' as const,
      deliveryTime: '10-12 weeks',
      warranty: '2 Year Structural Warranty'
    },
    {
      id: 'progeny-35',
      title: 'Progeny 35',
      subtitle: '3.5 Tonne Premium',
      description: 'Top of the range with Pioneer Package included.',
      price: '£25,500',
      priceNote: 'exc. VAT',
      images: ['/models/progeny-35/01.jpg'],
      badge: {
        text: 'Premium',
        variant: 'default' as const
      },
      rating: 5.0,
      reviews: 18,
      features: [
        { label: 'Payload', value: '1,150kg' },
        { label: 'Horse Capacity', value: '2 horses' },
        { label: 'Living', value: 'Pioneer Package (£10,800)' },
        { label: 'Warranty', value: '2 years structural' }
      ],
      availability: 'Limited' as const,
      deliveryTime: '12-14 weeks',
      warranty: '2 Year Structural Warranty'
    }
  ]

  return (
    <main>
      {/* Advanced Hero Section */}
      <HeroAdvanced
        title="Experience Premium Innovation"
        subtitle="British Horsebox Excellence"
        description="Discover the future of horsebox design with our cutting-edge 2025 collection."
        primaryCTA={{
          text: "Explore Collection",
          href: "/models"
        }}
        secondaryCTA={{
          text: "View Gallery",
          href: "#gallery"
        }}
        media={[
          { type: 'image', src: '/hero.jpg' },
          { type: 'image', src: '/models/professional-35/01.jpg' }
        ]}
        overlay="gradient"
        height="full"
        parallax
      />

      {/* Bento Grid Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-fluid-4xl font-light text-slate-900 mb-4">
              Cutting-Edge Features
            </h2>
            <p className="text-fluid-lg text-slate-600 max-w-3xl mx-auto">
              Experience the perfect blend of British craftsmanship and modern innovation
            </p>
          </motion.div>

          <div className="bento-grid">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bento-item-large glass-light p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">Premium Materials</h3>
              <p className="text-slate-600">Advanced GRP construction with aerospace-grade materials</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-blue p-8 rounded-2xl text-white"
            >
              <h3 className="text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-sm opacity-90">Advanced safety systems</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="neu-flat p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Customisable</h3>
              <p className="text-sm text-slate-600">Bespoke to your needs</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bento-item-wide gradient-premium p-8 rounded-2xl text-white"
            >
              <h3 className="text-xl font-semibold mb-2">30+ Years Experience</h3>
              <p className="text-sm opacity-90">Incorporating the legacy of KPH</p>
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
              Immersive Gallery Experience
            </h2>
            <p className="text-fluid-lg text-slate-600 max-w-3xl mx-auto">
              Explore our models with our flagship dissolve-style gallery featuring hotspot interactions
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

      {/* Product Showcase */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-fluid-4xl font-light text-slate-900 mb-4">
              Interactive Product Showcase
            </h2>
            <p className="text-fluid-lg text-slate-600 max-w-3xl mx-auto">
              Discover our range with advanced 3D hover effects and micro-interactions
            </p>
          </motion.div>

          <ProductShowcase
            products={products}
            layout="featured"
            showFilters={false}
          />
        </div>
      </section>

      {/* Scroll Animations Demo */}
      <section className="py-20 bg-gradient-mesh min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="text-fluid-5xl font-light text-white mb-8"
          >
            Premium British Engineering
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-3 gap-8 mt-12"
          >
            {[
              { number: '500+', label: 'Happy Customers' },
              { number: '30+', label: 'Years Experience' },
              { number: '100%', label: 'British Made' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.2 }}
                className="glass-light p-8 rounded-2xl"
              >
                <div className="text-5xl font-bold text-amber-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-white/90">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}