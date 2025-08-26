import Link from 'next/link'
import Logo from '@/components/Logo'
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, ChevronRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Stay Updated</h3>
              <p className="text-blue-100">Get the latest news and exclusive offers</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white text-slate-900 placeholder-slate-500 flex-1 md:w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo width={160} height={44} className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Premium British horseboxes for discerning owners. Incorporating the legacy of KPH, 
              built for the future with innovation and materials technology.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center">
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center">
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center">
                <Youtube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/models" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  All Models
                </Link>
              </li>
              <li>
                <Link href="/configurator" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  Configurator
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Model Ranges */}
          <div>
            <h3 className="font-semibold text-white mb-6">Model Ranges</h3>
            <ul className="space-y-4">
              <li>
                <div className="text-blue-400 font-medium mb-2">JTH Range</div>
                <ul className="ml-3 space-y-2">
                  <li>
                    <Link href="/models/professional-35" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Professional 35
                    </Link>
                  </li>
                  <li>
                    <Link href="/models/principle-35" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Principle 35
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <div className="text-blue-400 font-medium mb-2">AEOS Range</div>
                <ul className="ml-3 space-y-2">
                  <li>
                    <Link href="/models/aeos-edge-45" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Edge 45
                      <span className="text-xs bg-amber-700 text-amber-100 px-1 py-0.5 rounded ml-1">Pre-Built</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/models/aeos-discovery-45" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Discovery 45
                      <span className="text-xs bg-amber-700 text-amber-100 px-1 py-0.5 rounded ml-1">Pre-Built</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <div className="text-blue-400 font-medium mb-2">Premium Range</div>
                <ul className="ml-3 space-y-2">
                  <li>
                    <Link href="/models/zenos-72" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Zenos 72
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+441603552109" className="text-slate-400 hover:text-blue-400 transition-colors flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Call Us</div>
                    <div>+44 1603 552109</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:sales@jthltd.co.uk" className="text-slate-400 hover:text-blue-400 transition-colors flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Email</div>
                    <div>sales@jthltd.co.uk</div>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-slate-400">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Location</div>
                    <div>Norfolk, England</div>
                  </div>
                </div>
              </li>
            </ul>
            
            <Link 
              href="/contact" 
              className="inline-flex items-center mt-6 px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Get Quote
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm text-slate-400">
              <p>&copy; {new Date().getFullYear()} J Taylor Horseboxes Ltd. All rights reserved.</p>
              <span className="text-blue-400 font-medium">Made in Great Britain</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-blue-400 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-blue-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}