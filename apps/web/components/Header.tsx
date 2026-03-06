'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { ChevronDown, Menu, X, Phone, Mail } from 'lucide-react'

function UKFlag({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id="uk-clip"><rect width="60" height="30" /></clipPath>
      <g clipPath="url(#uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-diag)" />
        <clipPath id="uk-diag">
          <path d="M30,15 L60,30 L60,25 ZM30,15 L0,0 L0,5 ZM30,15 L0,30 L5,30 ZM30,15 L60,0 L55,0 Z" />
        </clipPath>
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

function IrelandFlag({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="1" height="2" fill="#169B62" />
      <rect x="1" width="1" height="2" fill="#FFFFFF" />
      <rect x="2" width="1" height="2" fill="#FF883E" />
    </svg>
  )
}

function getRegionCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)region=([^;]*)/)
  return match ? match[1] : null
}

function setRegionCookie(region: string) {
  document.cookie = `region=${region}; path=/; max-age=31536000; SameSite=Lax`
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
          { name: 'Zenos 72', href: '/models/zenos-72', note: 'Contact for Pricing' },
          { name: 'Zenos XL', href: '/models/zenos-xl', note: 'Contact for Pricing' },
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
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false)
  const [region, setRegion] = useState<string>('GB')
  const regionRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Determine region from cookie or pathname
  useEffect(() => {
    const cookieRegion = getRegionCookie()
    if (cookieRegion) {
      setRegion(cookieRegion)
    } else if (pathname.startsWith('/ireland')) {
      setRegion('IE')
    }
  }, [pathname])

  // Close region dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionDropdownOpen(false)
      }
    }
    if (regionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [regionDropdownOpen])

  const isIreland = pathname.startsWith('/ireland') || region === 'IE'
  const activeNav = isIreland ? irelandNavigation : navigation

  function handleRegionSelect(newRegion: string) {
    setRegion(newRegion)
    setRegionCookie(newRegion)
    setRegionDropdownOpen(false)
    setMobileMenuOpen(false)
    if (newRegion === 'IE') {
      router.push('/ireland')
    } else {
      router.push('/')
    }
  }

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
              <a href="tel:+441603552109" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Phone className="h-3.5 w-3.5" />
                +44 1603 552109
              </a>
              <a href="mailto:sales@jthltd.co.uk" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail className="h-3.5 w-3.5" />
                sales@jthltd.co.uk
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
                <Image
                  src="/logo-ireland.jpg"
                  alt="JTH Horseboxes Ireland"
                  width={180}
                  height={50}
                  className="h-12 w-auto transition-transform group-hover:scale-105"
                  priority
                />
              ) : (
                <Logo width={180} height={50} className="h-12 w-auto transition-transform group-hover:scale-105" priority />
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
                                            {'badge' in item && item.badge && (
                                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                                {item.badge}
                                              </span>
                                            )}
                                            {'note' in item && item.note && (
                                              <span className="text-xs text-slate-500 italic">
                                                {item.note}
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

              <Link href="/about" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </Link>
            </nav>

            {/* Desktop CTA + Region Switcher */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Region Switcher */}
              <div className="relative" ref={regionRef}>
                <button
                  onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-slate-200 hover:border-slate-300 transition-colors text-sm text-slate-600"
                  aria-label="Select region"
                >
                  {region === 'IE' ? (
                    <IrelandFlag className="w-5 h-3.5 rounded-sm" />
                  ) : (
                    <UKFlag className="w-5 h-3.5 rounded-sm" />
                  )}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${regionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {regionDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white shadow-lg border border-slate-200 rounded-md overflow-hidden z-50">
                    <button
                      onClick={() => handleRegionSelect('GB')}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${region === 'GB' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                    >
                      <UKFlag className="w-6 h-4 rounded-sm flex-shrink-0" />
                      United Kingdom
                    </button>
                    <button
                      onClick={() => handleRegionSelect('IE')}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${region === 'IE' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                    >
                      <IrelandFlag className="w-6 h-4 rounded-sm flex-shrink-0" />
                      Ireland
                    </button>
                  </div>
                )}
              </div>

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
                                {'badge' in item && item.badge && (
                                  <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                                {'note' in item && item.note && (
                                  <span className="text-xs text-slate-500 italic">
                                    {item.note}
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
              
              {/* Region Switcher - Mobile */}
              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Region</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegionSelect('GB')}
                    className={`flex items-center gap-2 flex-1 px-3 py-2 rounded border text-sm transition-colors ${region === 'GB' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <UKFlag className="w-5 h-3.5 rounded-sm flex-shrink-0" />
                    UK
                  </button>
                  <button
                    onClick={() => handleRegionSelect('IE')}
                    className={`flex items-center gap-2 flex-1 px-3 py-2 rounded border text-sm transition-colors ${region === 'IE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <IrelandFlag className="w-5 h-3.5 rounded-sm flex-shrink-0" />
                    Ireland
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-2 text-sm">
                <a href="tel:+441603552109" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                  <Phone className="h-4 w-4" />
                  +44 1603 552109
                </a>
                <a href="mailto:sales@jthltd.co.uk" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                  <Mail className="h-4 w-4" />
                  sales@jthltd.co.uk
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}