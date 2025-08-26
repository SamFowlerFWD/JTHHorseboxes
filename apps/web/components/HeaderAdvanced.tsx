"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Search,
  ShoppingBag,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Globe,
  Calendar
} from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavigationItem {
  label: string
  href?: string
  children?: Array<{
    label: string
    href: string
    description?: string
    icon?: React.ReactNode
    badge?: string
  }>
}

const navigation: NavigationItem[] = [
  {
    label: 'Models',
    children: [
      {
        label: 'JTH Range',
        href: '#',
        description: '3.5T & 4.5T custom horseboxes',
        icon: <Settings className="w-4 h-4" />,
        badge: 'Category'
      },
      {
        label: 'Principle 35',
        href: '/models/principle-35',
        description: 'Perfect balance of quality and value',
        icon: <Settings className="w-4 h-4" />
      },
      {
        label: 'Professional 35',
        href: '/models/professional-35',
        description: 'Ultimate luxury for professional riders',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'Popular'
      },
      {
        label: 'Progeny 35',
        href: '/models/progeny-35',
        description: 'Top of the range with Pioneer Package',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'Premium'
      },
      {
        label: 'Principle 45',
        href: '/models/jth-principle-45',
        description: '4.5T version of our popular model',
        icon: <Settings className="w-4 h-4" />
      },
      {
        label: 'Professional 45',
        href: '/models/jth-professional-45',
        description: '4.5T luxury horsebox',
        icon: <Sparkles className="w-4 h-4" />
      },
      {
        label: 'Progeny 45',
        href: '/models/jth-progeny-45',
        description: 'Premium 4.5T with Pioneer Package',
        icon: <Sparkles className="w-4 h-4" />
      },
      {
        label: 'AEOS Range',
        href: '#',
        description: '4.5T pre-built horseboxes',
        icon: <ShoppingBag className="w-4 h-4" />,
        badge: 'Category'
      },
      {
        label: 'Edge 45',
        href: '/models/aeos-edge-45',
        description: 'Premium pre-built horsebox',
        icon: <ShoppingBag className="w-4 h-4" />,
        badge: 'Pre-Built'
      },
      {
        label: 'Freedom 45',
        href: '/models/aeos-freedom-45',
        description: 'Versatile pre-built design',
        icon: <ShoppingBag className="w-4 h-4" />,
        badge: 'Pre-Built'
      },
      {
        label: 'Discovery 45',
        href: '/models/aeos-discovery-45',
        description: 'Entry-level pre-built option',
        icon: <ShoppingBag className="w-4 h-4" />,
        badge: 'Pre-Built'
      },
      {
        label: 'Premium Range',
        href: '#',
        description: '7.2T & 7.5T luxury horseboxes',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'Category'
      },
      {
        label: 'Zenos 72',
        href: '/models/zenos-72',
        description: 'Ultimate 7.2T luxury experience',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'Contact for Price'
      },
      {
        label: 'Zenos XL',
        href: '/models/zenos-xl',
        description: 'Extended luxury horsebox',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'Contact for Price'
      },
      {
        label: 'Helios 75',
        href: '/models/helios-75',
        description: 'Premium 7.5T horsebox',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'Contact for Price'
      },
      {
        label: 'View All Models',
        href: '/models',
        description: 'Browse complete model range',
        icon: <ChevronRight className="w-4 h-4" />
      }
    ]
  },
  {
    label: 'Configurator',
    href: '/configurator'
  },
  {
    label: 'About',
    children: [
      {
        label: 'Our Story',
        href: '/about',
        description: '30+ years of British craftsmanship',
        icon: <Globe className="w-4 h-4" />
      },
      {
        label: 'Manufacturing',
        href: '/about/manufacturing',
        description: 'Norfolk facility tour',
        icon: <Settings className="w-4 h-4" />
      },
      {
        label: 'KPH Legacy',
        href: '/about/kph-legacy',
        description: 'Incorporating KPH excellence',
        icon: <Sparkles className="w-4 h-4" />
      }
    ]
  },
  {
    label: 'Contact',
    children: [
      {
        label: 'Get in Touch',
        href: '/contact',
        description: 'Contact our team',
        icon: <Phone className="w-4 h-4" />
      },
      {
        label: 'Visit Showroom',
        href: '/contact/showroom',
        description: 'Book appointment',
        icon: <MapPin className="w-4 h-4" />,
        badge: 'Book'
      },
      {
        label: 'Request Quote',
        href: '/contact/quote',
        description: 'Get instant pricing',
        icon: <Mail className="w-4 h-4" />
      }
    ]
  }
]

export default function HeaderAdvanced() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0.7, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [10, 20])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Announcement Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-blue-700 to-blue-800 text-white text-sm py-2 px-4 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent animate-pulse" />
        <div className="relative z-10 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="font-medium">Limited Time: 0% Finance Available</span>
          <Link href="/contact/quote" className="underline hover:no-underline ml-2">
            Get Quote →
          </Link>
        </div>
      </motion.div>

      {/* Main Header */}
      <motion.header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'py-2 shadow-lg' 
            : 'py-4'
        }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: `blur(${isScrolled ? 20 : 10}px)`,
          WebkitBackdropFilter: `blur(${isScrolled ? 20 : 10}px)`,
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-amber-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">JTH</span>
                </div>
              </motion.div>
              <div className="hidden sm:block">
                <div className="text-lg font-light text-slate-900 tracking-wide">J Taylor</div>
                <div className="text-xs font-medium text-blue-700 tracking-widest uppercase">Horseboxes</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.label}>
                      {item.children ? (
                        <>
                          <NavigationMenuTrigger className="text-slate-700 hover:text-blue-700 transition-colors font-medium">
                            {item.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <motion.ul 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="grid gap-2 p-4 md:w-[600px] lg:w-[700px] lg:grid-cols-2"
                            >
                              {item.children.map((child, index) => (
                                <motion.li
                                  key={child.label}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  {child.badge === 'Category' ? (
                                    <div className="group block p-3 rounded-lg bg-slate-100 border-l-4 border-blue-600">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-600 text-white rounded-lg">
                                          {child.icon}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">
                                              {child.label}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                              {child.badge}
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-600 mt-0.5 font-medium">
                                            {child.description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <Link href={child.href}>
                                      <NavigationMenuLink className="group block p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-700 group-hover:text-white transition-colors">
                                            {child.icon}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                                                {child.label}
                                              </span>
                                              {child.badge && child.badge !== 'Category' && (
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                  child.badge === 'Pre-Built' 
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : child.badge === 'Contact for Price'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                  {child.badge}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                              {child.description}
                                            </p>
                                          </div>
                                        </div>
                                      </NavigationMenuLink>
                                    </Link>
                                  )}
                                </motion.li>
                              ))}
                            </motion.ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <Link href={item.href!} legacyBehavior passHref>
                          <NavigationMenuLink className="text-slate-700 hover:text-blue-700 transition-colors font-medium px-4 py-2">
                            {item.label}
                          </NavigationMenuLink>
                        </Link>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-slate-600 hover:text-blue-700 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-slate-600 hover:text-blue-700 transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </motion.button>

                <Link href="/contact/quote">
                  <Button className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all">
                    Get Quote
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="relative">
                  <span className="sr-only">Open menu</span>
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                      >
                        <X className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                      >
                        <Menu className="w-6 h-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                <div className="h-full overflow-y-auto">
                  {/* Mobile Menu Header */}
                  <div className="p-6 bg-gradient-to-br from-blue-700 to-blue-800 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="font-bold text-xl">JTH</span>
                      </div>
                      <div>
                        <div className="text-lg font-light">J Taylor Horseboxes</div>
                        <div className="text-xs opacity-80">Premium British Horseboxes</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="p-6">
                    <nav className="space-y-4">
                      {navigation.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {item.children ? (
                            <details className="group">
                              <summary className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                <span className="font-medium text-slate-900">{item.label}</span>
                                <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                              </summary>
                              <div className="mt-2 ml-4 space-y-2">
                                {item.children.map((child) => (
                                  child.badge === 'Category' ? (
                                    <div
                                      key={child.label}
                                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 border-l-4 border-blue-600"
                                    >
                                      <div className="p-1.5 bg-blue-600 text-white rounded">
                                        {child.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold text-slate-900">
                                            {child.label}
                                          </span>
                                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                            {child.badge}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                          {child.description}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                      <div className="p-1.5 bg-blue-100 text-blue-700 rounded">
                                        {child.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-slate-900">
                                            {child.label}
                                          </span>
                                          {child.badge && child.badge !== 'Category' && (
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                              child.badge === 'Pre-Built' 
                                                ? 'bg-amber-100 text-amber-700'
                                                : child.badge === 'Contact for Price'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                              {child.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {child.description}
                                        </p>
                                      </div>
                                    </Link>
                                  )
                                ))}
                              </div>
                            </details>
                          ) : (
                            <Link
                              href={item.href!}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <span className="font-medium text-slate-900">{item.label}</span>
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </nav>

                    {/* Mobile CTA */}
                    <div className="mt-8 space-y-3">
                      <Link href="/contact/quote" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-medium shadow-lg">
                          Get Quote
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href="/configurator" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-blue-700 text-blue-700 hover:bg-blue-50">
                          Build Your Horsebox
                        </Button>
                      </Link>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <div className="space-y-3">
                        <a href="tel:01603552109" className="flex items-center gap-3 text-slate-600 hover:text-blue-700">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">01603 552109</span>
                        </a>
                        <a href="mailto:info@jthltd.co.uk" className="flex items-center gap-3 text-slate-600 hover:text-blue-700">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">info@jthltd.co.uk</span>
                        </a>
                        <div className="flex items-start gap-3 text-slate-600">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span className="text-sm">Beeston, Norfolk, UK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200"
            >
              <div className="max-w-3xl mx-auto p-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search models, features, specifications..."
                    className="w-full px-4 py-3 pr-12 text-lg border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    autoFocus
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-blue-700">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2 text-sm">
                  <span className="text-slate-500">Popular:</span>
                  <Link href="/models/professional-35" className="text-blue-700 hover:underline">Professional 35</Link>
                  <Link href="/configurator" className="text-blue-700 hover:underline">Configurator</Link>
                  <Link href="/contact/quote" className="text-blue-700 hover:underline">Get Quote</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}