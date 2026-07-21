'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import { ChevronDown, Menu, X, Phone, Mail } from 'lucide-react'

function getRegionCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )region=([^;]*)/)
  return match ? match[1] : null
}


const navigation = {
  models: {
    title: 'Models',
    sections: [
      {
        title: 'JTH Range (3.5T & 4.5T)',
        isCategory: true,
        items: []
      },
      {
        title: '3.5T Models',
        items: [
          { name: 'Principle 35', href: '/models/principle-35' },
          { name: 'Professional 35', href: '/models/professional-35' },
          { name: 'Progeny 35', href: '/models/progeny-35' },
        ]
      },
      {
        title: '4.5T Models',
        items: [
          { name: 'Principle 45', href: '/models/jth-principle-45' },
          { name: 'Professional 45', href: '/models/jth-professional-45' },
          { name: 'Progeny 45', href: '/models/jth-progeny-45' },
        ]
      },
      {
        title: 'AEOS Range (4.5T Pre-Built)',
        isCategory: true,
        items: []
      },
      {
        title: '4.5T Pre-Built Models',
        items: [
          { name: 'Edge 45', href: '/models/aeos-edge-45', badge: 'Pre-Built' },
          { name: 'Freedom 45', href: '/models/aeos-freedom-45', badge: 'Pre-Built' },
          { name: 'Discovery 45', href: '/models/aeos-discovery-45', badge: 'Pre-Built' },
        ]
      },
      {
        title: 'Premium Range (7.2T & 7.5T)',
        isCategory: true,
        items: []
      },
      {
        title: '7.2T & 7.5T Models',
        items: [
          { name: 'Aeos Discovery 72', href: '/models/aeos-discovery-72' },
          { name: 'Helios 75', href: '/models/helios-75', note: 'Contact for Pricing' },
        ]
      }
    ]
  }
}

const irelandNavigation = {
  models: {
    title: 'Models',
    sections: [
      {
        title: 'Available in Ireland (3.5T)',
        isCategory: true,
        items: []
      },
      {
        title: '3.5T Models',
        items: [
          { name: 'Principle 35', href: '/ireland/models/principle-35' },
          { name: 'Professional 35', href: '/ireland/models/professional-35' },
        ]
      },
    ]
  }
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [regionCookie, setRegionCookie] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setRegionCookie(getRegionCookie())
  }, [])

  const isIreland = pathname.startsWith('/ireland') || regionCookie === 'IE'
  const activeNav = isIreland ? irelandNavigation : navigation

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-blue-400 font-medium">Made in Great Britain</span>
              <span className="text-slate-400">Safety | Quality | Durability</span>
            </div>
            <div className="flex items-center gap-6">
              <a href={isIreland ? 'tel:+353872557015' : 'tel:+441603552109'} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Phone className="h-3.5 w-3.5" />
                {isIreland ? '+353 87 255 7015' : '+44 1603 552109'}
              </a>
              <a href={isIreland ? 'mailto:Paul@JTHltd.ie' : 'mailto:sales@jthltd.co.uk'} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail className="h-3.5 w-3.5" />
                {isIreland ? 'Paul@JTHltd.ie' : 'sales@jthltd.co.uk'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={isIreland ? '/ireland' : '/'} className="flex items-center gap-3 group">
              {isIreland ? (
                <div className="overflow-hidden h-12">
                  <Image
                    src="/logo-ireland.jpg"
                    alt="J Taylor Horseboxes Ireland"
                    width={180}
                    height={50}
                    className="h-12 w-auto transition-transform group-hover:scale-105 border-0"
                    style={{ clipPath: 'inset(0 1px 0 0)' }}
                    priority
                  />
                </div>
              ) : (
                <div className="overflow-hidden h-12">
                  <Logo width={180} height={50} className="h-12 w-auto transition-transform group-hover:scale-105 border-0" priority />
                </div>
              )}
              <span className="sr-only">JTH Horseboxes</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href={isIreland ? '/ireland' : '/'} className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                Home
              </Link>

              {/* Models Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen('models')}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button
                  className="flex items-center gap-1 text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Models
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen === 'models' && (
                  <div className={`absolute top-full left-0 mt-0 pt-2 ${isIreland ? 'w-[400px]' : 'w-[700px]'}`}>
                    <div className="bg-white shadow-xl border border-slate-200">
                      <div className="p-6">
                        <div className="space-y-6">
                          {activeNav.models.sections.map((section, index) => (
                            <div key={section.title}>
                              {section.isCategory ? (
                                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                  {section.title}
                                </h2>
                              ) : (
                                <>
                                  <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                                    {section.title}
                                  </h3>
                                  <ul className="grid grid-cols-2 gap-3 mb-4">
                                    {section.items.map((item) => (
                                      <li key={item.name}>
                                        <Link
                                          href={item.href}
                                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors group"
                                        >
                                          <span className="text-sm text-slate-600 group-hover:text-blue-600">
                                            {item.name}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            {(item as { badge?: string }).badge && (
                                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                                {(item as { badge?: string }).badge}
                                              </span>
                                            )}
                                            {(item as { note?: string }).note && (
                                              <span className="text-xs text-slate-500 italic">
                                                {(item as { note?: string }).note}
                                              </span>
                                            )}
                                          </div>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                        <Link
                          href={isIreland ? '/ireland' : '/models'}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {isIreland ? 'View Ireland Range →' : 'View All Models →'}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isIreland && (
                <Link href="/coat-x" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                  Coat-X
                </Link>
              )}
              {isIreland && (
                <Link href="/ireland/in-stock" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                  In Stock
                </Link>
              )}
              <Link href="/about" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-slate-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200">
            <nav className="px-4 py-6 space-y-4">
              <Link href={isIreland ? '/ireland' : '/'} className="block text-slate-700 hover:text-blue-600 transition-colors font-medium">
                Home
              </Link>
              <div>
                <div className="font-medium text-slate-700 mb-2">Models</div>
                <div className="ml-4 space-y-3">
                  {activeNav.models.sections.map((section) => (
                    <div key={section.title}>
                      {section.isCategory ? (
                        <div className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                          {section.title}
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-3 mb-2">
                            {section.title}
                          </div>
                          {section.items.map((item) => (
                            <Link 
                              key={item.name}
                              href={item.href} 
                              className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 py-1"
                            >
                              <span>{item.name}</span>
                              <div className="flex items-center gap-2">
                                {(item as { badge?: string }).badge && (
                                  <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                    {(item as { badge?: string }).badge}
                                  </span>
                                )}
                                {(item as { note?: string }).note && (
                                  <span className="text-xs text-slate-500 italic">
                                    {(item as { note?: string }).note}
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                  
                  <Link href={isIreland ? '/ireland' : '/models'} className="block text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 pt-2 border-t border-slate-200">
                    {isIreland ? 'View Ireland Range →' : 'View All Models →'}
                  </Link>
                </div>
              </div>
              {!isIreland && (
                <Link href="/coat-x" className="block text-slate-700 hover:text-blue-600 transition-colors font-medium">
                  Coat-X
                </Link>
              )}
              {isIreland && (
                <Link href="/ireland/in-stock" className="block text-slate-700 hover:text-blue-600 transition-colors font-medium">
                  In Stock
                </Link>
              )}
              <Link href="/about" className="block text-slate-700 hover:text-blue-600 transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="block text-slate-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </Link>
              
              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/contact"
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get a Quote
                </Link>
              </div>
              
              <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
                <a href={isIreland ? 'tel:+353872557015' : 'tel:+441603552109'} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                  <Phone className="h-4 w-4" />
                  {isIreland ? '+353 87 255 7015' : '+44 1603 552109'}
                </a>
                <a href={isIreland ? 'mailto:Paul@JTHltd.ie' : 'mailto:sales@jthltd.co.uk'} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                  <Mail className="h-4 w-4" />
                  {isIreland ? 'Paul@JTHltd.ie' : 'sales@jthltd.co.uk'}
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}