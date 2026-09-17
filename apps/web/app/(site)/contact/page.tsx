import ContactPageClient from './ContactPageClient'
import Schema, { localBusinessSchema, generateBreadcrumbSchema } from '@/components/Schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact J Taylor Horseboxes | Visit Our Norfolk Workshop',
  description: 'Contact JTH for premium horseboxes. Visit our Norfolk workshop, call 01603 552109, or email sales@jthltd.co.uk. Open Monday to Friday, weekends by appointment.',
  keywords: 'contact JTH, J Taylor Horseboxes contact, horsebox manufacturer Norfolk, Beeston horsebox, JTH phone number, horsebox viewing',
  openGraph: {
    title: 'Contact J Taylor Horseboxes',
    description: 'Get in touch with JTH. Visit our workshop, arrange a viewing, or discuss your requirements with our expert team.',
    images: ['/contact/showroom.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact J Taylor Horseboxes',
    description: 'Get in touch with JTH. Visit our workshop, arrange a viewing, or discuss your requirements with our expert team.',
    images: ['/contact/showroom.jpg'],
  },
  alternates: {
    canonical: 'https://jthltd.co.uk/contact',
  },
}

const breadcrumbs = [
  { name: 'Home', url: 'https://jthltd.co.uk' },
  { name: 'Contact', url: 'https://jthltd.co.uk/contact' }
]

export default function ContactPage() {
  return (
    <>
      <Schema schema={[localBusinessSchema, generateBreadcrumbSchema(breadcrumbs)]} />
      <ContactPageClient />
    </>
  )
}