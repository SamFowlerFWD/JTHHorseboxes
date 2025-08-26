"use client"

import { useEffect } from 'react'
import HeroAdvanced from '@/components/HeroAdvanced'
import DissolveGallery from '@/components/DissolveGallery'
import ProductShowcase from '@/components/ProductShowcase'
import { motion } from 'framer-motion'
import { organizationSchema, localBusinessSchema } from '@/components/Schema'
import { Star, Shield, Award, Truck, Phone, MapPin, ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// SEO metadata is preserved from original homepage
export default function HomePage() {
  // Add structured data to head
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify([organizationSchema, localBusinessSchema])
    document.head.appendChild(script)
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Sample gallery images with British Racing Green theme
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
      {/* Advanced Hero Section with British Racing Green */}
      <HeroAdvanced
        title="Premium British Horseboxes"
        subtitle="Incorporating the Legacy of KPH"
        description="Leading UK horsebox manufacturer in Norfolk. 3.5t, 4.5t, 7.2t & 7.5t models from £18,500."
        primaryCTA={{
          text: "Explore Collection",
          href: "/models"
        }}
        secondaryCTA={{
          text: "Start Configuring",
          href: "/configurator"
        }}
        media={[
          { type: 'image', src: '/hero.jpg' },
          { type: 'image', src: '/models/professional-35/01.jpg' }
        ]}
        overlay="gradient"
        height="full"
        parallax
      />

      {/* Trust Indicators with new colors */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">2 Year</div>
              <div className="text-sm text-slate-700">Structural Warranty</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-blue-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">30+</div>
              <div className="text-sm text-slate-700">Years Experience</div>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-700">Happy Customers</div>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-blue-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">UK & IE</div>
              <div className="text-sm text-slate-700">Delivery Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section with British Racing Green */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-fluid-4xl font-light text-slate-900 mb-4">
              British Horsebox <span className="text-blue-700">Excellence</span>
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
              className="bento-item-large glass-light p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">Premium Materials</h3>
              <p className="text-slate-700">Advanced GRP construction with aerospace-grade materials for superior durability</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-blue p-8 rounded-2xl text-white"
            >
              <h3 className="text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-sm text-white/90">Advanced safety systems</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="neu-flat p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Customizable</h3>
              <p className="text-sm text-slate-700">Bespoke to your needs</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bento-item-wide gradient-premium p-8 rounded-2xl text-white"
            >
              <h3 className="text-xl font-semibold mb-2">30+ Years Experience</h3>
              <p className="text-sm text-white/90">Incorporating the legacy of KPH</p>
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
              Immersive Gallery <span className="text-amber-500">Experience</span>
            </h2>
            <p className="text-fluid-lg text-slate-700 max-w-3xl mx-auto">
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
              Our Premium <span className="text-blue-700">3.5 Tonne Range</span>
            </h2>
            <p className="text-fluid-lg text-slate-700 max-w-3xl mx-auto">
              Discover our range with advanced hover effects and micro-interactions
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
          <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-8">
            Welcome to <span className="text-blue-700">JTH Horseboxes</span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-700 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed font-light mb-6">
            One of the most important aspects of JTH is that we don't follow other manufacturers, 
            but lead through innovation, creative designs and materials technology.
          </p>
          <p className="text-xl text-amber-600 font-semibold">
            "Stunning is fitted as standard on every JTH horsebox"
          </p>
        </div>
      </section>

      {/* SEO Content Section - Comprehensive Horsebox Information */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-white mb-8">
              Why Choose JTH <span className="text-amber-400">3.5t Horseboxes</span>
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              As one of the UK's leading horsebox manufacturers, JTH (J Taylor Horseboxes) specializes in building premium 
              3.5 tonne, 4.5 tonne, 7.2 tonne, and 7.5 tonne horseboxes at our state-of-the-art facility in Norfolk.
            </p>
          </div>

          {/* British Manufacturing Excellence */}
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="glass-dark p-8 rounded-2xl">
              <h4 className="font-semibold mb-3 text-amber-400">Norfolk Manufacturing Facility</h4>
              <p className="text-slate-300 leading-relaxed">
                Based in Beeston, Norfolk, our purpose-built facility combines traditional British craftsmanship with modern 
                manufacturing technology.
              </p>
            </div>
            <div className="glass-dark p-8 rounded-2xl">
              <h4 className="font-semibold mb-3 text-amber-400">30+ Years of Experience</h4>
              <p className="text-slate-300 leading-relaxed">
                Incorporating the legacy of Kevin Parker Horseboxes (KPH), we bring over 30 years of horsebox building expertise.
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
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 text-center">
            Visit Our Norfolk Showroom
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-blue-700 mr-2" />
                Norfolk Showroom & Manufacturing
              </h4>
              <p className="text-slate-700 mb-4 leading-relaxed">
                Visit our Norfolk showroom to view our range of 3.5t, 4.5t, and 7.2t horseboxes. Located in Beeston, 
                just outside Norwich, we're easily accessible from the A47 and A11.
              </p>
              <address className="text-slate-800 not-italic">
                J Taylor Horseboxes<br />
                Beeston, Norfolk<br />
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
          <h2 className="text-3xl md:text-4xl font-light text-white mb-8 tracking-wide">
            Ready to Buy Your Premium Horsebox?
          </h2>
          <div className="w-24 h-px bg-amber-400 mx-auto mb-10"></div>
          <p className="text-lg text-white/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Configure your perfect JTH horsebox online or visit our Norfolk showroom. 
            Choose from our range of 3.5 tonne, 4.5 tonne, 7.2 tonne, and 7.5 tonne models.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/models" className="inline-flex items-center px-10 py-4 bg-white text-blue-700 font-medium hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 rounded-lg">
              Browse All Models
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/configurator" className="inline-flex items-center px-10 py-4 border-2 border-white text-white font-medium hover:bg-white hover:text-blue-700 transition-all duration-300 rounded-lg">
              Start Configuring
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}