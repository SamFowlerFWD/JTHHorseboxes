import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JTH Horseboxes - Premium 3.5t, 4.5t, 7.2t & 7.5t British Horseboxes | Norfolk UK',
  description: 'Leading British horsebox manufacturer in Norfolk. Premium 3.5 tonne horseboxes from £18,500. Professional 35, Principle 35, Progeny 35 models. Incorporating KPH legacy. 30+ years experience building luxury horseboxes.',
  keywords: '3.5t horsebox, 3.5 tonne horsebox, British horsebox manufacturer, luxury horsebox UK, horsebox for sale Norfolk, custom horsebox builder UK, JTH horseboxes, J Taylor Horseboxes, KPH horseboxes, Professional 35, Principle 35, Progeny 35, Pioneer Package',
  openGraph: {
    title: 'JTH Horseboxes - Premium British Horseboxes | 3.5t, 4.5t, 7.2t & 7.5t Models',
    description: 'Leading British horsebox manufacturer. Premium 3.5t, 4.5t, 7.2t & 7.5t models from £18,500. 30+ years experience. Visit our Norfolk showroom.',
    images: ['/hero.jpg'],
    type: 'website',
    locale: 'en_GB',
    siteName: 'JTH Horseboxes',
  },
  alternates: {
    canonical: 'https://jthltd.co.uk',
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
}