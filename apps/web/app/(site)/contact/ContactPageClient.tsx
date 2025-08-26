'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Link from 'next/link'
import { 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Calendar,
  Navigation,
  CheckCircle,
  Facebook,
  Instagram,
  Car
} from 'lucide-react'

const models = [
  { value: '', label: 'Select a model (optional)' },
  { value: 'principal-35', label: 'Principal 35' },
  { value: 'professional-35', label: 'Professional 35' },
  { value: 'progeny-35', label: 'Progeny 35' },
  { value: 'aeos-edge-45', label: 'Aeos Edge 45' },
  { value: 'aeos-freedom-45', label: 'Aeos Freedom 45' },
  { value: 'aeos-discovery-45', label: 'Aeos Discovery 45' },
  { value: 'aeos-discovery-72', label: 'Aeos Discovery 72' },
]

const reasons = [
  {
    icon: Phone,
    title: 'Call Us Direct',
    description: 'Speak to our expert team for immediate assistance',
    action: '01603 552109',
    link: 'tel:01603552109'
  },
  {
    icon: Calendar,
    title: 'Book a Viewing',
    description: 'Schedule a visit to our Norfolk showroom',
    action: 'Book Now',
    link: '#contact-form'
  },
  {
    icon: Car,
    title: 'Test Drive',
    description: 'Experience our horseboxes firsthand',
    action: 'Arrange Test',
    link: '#contact-form'
  },
  {
    icon: MessageSquare,
    title: 'Get a Quote',
    description: 'Receive a personalized quotation',
    action: 'Request Quote',
    link: '/configurator'
  }
]

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    model: '',
    message: '',
    marketingConsent: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // In production, this would send to your API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          model: '',
          message: '',
          marketingConsent: false
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <Hero 
        primarySrc="/contact/showroom.jpg"
        fallbackSrc="/hero-contact.jpg"
        height="md"
        overlay="gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-slideUp">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-slideUp animation-delay-200">
            Visit our Norfolk showroom or contact our expert team
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 animate-slideUp animation-delay-400">
            <a href="tel:01603552109" className="btn-premium">
              <Phone className="mr-2 w-5 h-5" />
              Call 01603 552109
            </a>
            <a href="#contact-form" className="btn-premium-outline border-white text-white hover:text-slate-900">
              Send Message
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </Hero>

      {/* Quick Contact Options */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {reasons.map((reason, index) => (
              <a
                key={index}
                href={reason.link}
                className="bg-white p-6 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <reason.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{reason.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{reason.description}</p>
                <span className="text-blue-700 font-semibold flex items-center">
                  {reason.action}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">
                Visit Our
                <span className="text-gradient-blue block mt-2">Norfolk Showroom</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-700 to-amber-500 mb-8"></div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Showroom Address</h3>
                    <p className="text-slate-600">
                      J Taylor Horseboxes<br />
                      Beeston<br />
                      Norfolk<br />
                      United Kingdom<br />
                      NR12
                    </p>
                    <a 
                      href="https://maps.google.com/?q=J+Taylor+Horseboxes+Beeston+Norfolk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800 font-semibold mt-2 inline-flex items-center"
                    >
                      Get Directions
                      <Navigation className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Phone</h3>
                    <a href="tel:01603552109" className="text-slate-600 hover:text-blue-700">
                      01603 552109
                    </a>
                    <p className="text-sm text-slate-500 mt-1">
                      Direct line - no call centers
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Email</h3>
                    <a href="mailto:sales@jthltd.co.uk" className="text-slate-600 hover:text-blue-700">
                      sales@jthltd.co.uk
                    </a>
                    <p className="text-sm text-slate-500 mt-1">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-blue-700 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Opening Hours</h3>
                    <div className="text-slate-600 space-y-1">
                      <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 5:00 PM</p>
                      <p><span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM</p>
                      <p><span className="font-semibold">Sunday:</span> By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a 
                    href="https://facebook.com/JTHHorseboxes" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-100 hover:bg-blue-700 rounded-full flex items-center justify-center group transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-slate-600 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://instagram.com/jthhorseboxes" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-100 hover:bg-pink-600 rounded-full flex items-center justify-center group transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-slate-600 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div id="contact-form" className="bg-slate-50 p-8 md:p-10">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Send Us a Message</h3>
              
              {submitStatus === 'success' ? (
                <div className="bg-blue-50 border border-blue-200 p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-blue-700 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-blue-950 mb-2">Thank You!</h4>
                  <p className="text-blue-800">
                    We've received your message and will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="07123 456789"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-semibold text-slate-700 mb-2">
                      Model of Interest
                    </label>
                    <select
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
                    >
                      {models.map(model => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                      placeholder="Tell us about your requirements or ask any questions..."
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="marketingConsent"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleChange}
                      className="mt-1 mr-3 w-4 h-4 text-blue-700 border-slate-300 focus:ring-blue-600"
                    />
                    <label htmlFor="marketingConsent" className="text-sm text-slate-600">
                      I would like to receive news and offers from JTH. You can unsubscribe at any time.
                    </label>
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 p-4 text-red-700">
                      <p className="text-sm">
                        There was an error sending your message. Please try again or call us directly on 01603 552109.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    By submitting this form, you agree to our privacy policy. 
                    We will never share your information with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-light text-slate-900 mb-6 text-center">
              Find Us in Norfolk
            </h2>
            <div className="bg-slate-200 h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Interactive map will be displayed here</p>
                <a 
                  href="https://maps.google.com/?q=J+Taylor+Horseboxes+Beeston+Norfolk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium mt-6 inline-flex"
                >
                  Open in Google Maps
                  <Navigation className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Showroom Visits</h3>
              <p className="text-slate-600">
                See our full range of models in person. No appointment necessary during opening hours, 
                but we recommend calling ahead to ensure availability of specific models.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Expert Advice</h3>
              <p className="text-slate-600">
                Our knowledgeable team is here to help you choose the perfect horsebox. 
                We'll discuss your requirements and guide you through all available options.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Test Drives</h3>
              <p className="text-slate-600">
                Experience the quality and handling of our horseboxes with a test drive. 
                Available by appointment - bring your driving license and we'll arrange everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-700 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Whether you're ready to order or just exploring options, we're here to help
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/configurator" className="btn-premium bg-white text-blue-700 hover:bg-slate-50">
              Build Your Horsebox
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="tel:01603552109" className="btn-premium-outline border-white text-white">
              <Phone className="mr-2 w-5 h-5" />
              Call 01603 552109
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}