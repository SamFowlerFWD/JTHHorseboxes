import ContactPageClient from './ContactPageClient'
import Schema, { localBusinessSchema, generateBreadcrumbSchema } from '@/components/Schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact J Taylor Horseboxes | Visit Our Norfolk Showroom',
  description: 'Contact JTH for premium horseboxes. Visit our Norfolk showroom, call 01603 552109, or email sales@jthltd.co.uk. Open Mon-Sat for viewings and test drives.',
  keywords: 'contact JTH, J Taylor Horseboxes contact, horsebox showroom Norfolk, Beeston horsebox, JTH phone number, horsebox viewing, test drive horsebox',
  openGraph: {
    title: 'Contact J Taylor Horseboxes | Norfolk Showroom',
    description: 'Get in touch with JTH. Visit our showroom, arrange a viewing, or discuss your requirements with our expert team.',
    images: ['/contact/showroom.jpg'],
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