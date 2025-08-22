import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Inter, Playfair_Display } from 'next/font/google'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://jthltd.co.uk'),
  title: {
    default: 'JTH Horseboxes - Premium 3.5t, 4.5t & 7.2t British Horseboxes | Norfolk UK',
    template: '%s | JTH Horseboxes Norfolk'
  },
  description: 'Leading British horsebox manufacturer in Norfolk. Premium 3.5 tonne, 4.5 tonne & 7.2 tonne horseboxes from £18,500. Professional 35, Principle 35, Progeny 35 & Zenos 72 models. Formerly KPH. 30+ years building luxury horseboxes. Factory showroom visits welcome.',
  keywords: '3.5t horsebox, 3.5 tonne horsebox, 4.5t horsebox, 4.5 tonne horsebox, 7.2t horsebox, 7.2 tonne horsebox, British horsebox manufacturer, luxury horsebox UK, horsebox for sale Norfolk, custom horsebox builder UK, JTH horseboxes, J Taylor Horseboxes, KPH horseboxes, horse lorry UK, equine transport, horsebox Norfolk, horsebox East Anglia',
  authors: [{ name: 'J Taylor Horseboxes' }],
  creator: 'J Taylor Horseboxes',
  publisher: 'J Taylor Horseboxes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://jthltd.co.uk',
    siteName: 'JTH Horseboxes',
    title: 'JTH Horseboxes - Premium British Horseboxes | 3.5t, 4.5t & 7.2t Models',
    description: 'Leading British horsebox manufacturer. Premium 3.5t, 4.5t & 7.2t models from £18,500. Visit our Norfolk showroom.',
    images: [
      {
        url: 'https://jthltd.co.uk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JTH Horseboxes - British Built Luxury',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JTH Horseboxes - Premium British Horseboxes',
    description: 'Leading British horsebox manufacturer. 3.5t, 4.5t & 7.2t models from £18,500.',
    images: ['https://jthltd.co.uk/og-image.jpg'],
    creator: '@jthhorseboxes',
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://jthltd.co.uk',
    languages: {
      'en-GB': 'https://jthltd.co.uk',
      'en-IE': 'https://jthltd.ie',
    },
  },
}

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} min-h-screen bg-white text-slate-800 antialiased flex flex-col`}>
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
