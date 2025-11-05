'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Download, Mail, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [leadId, setLeadId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setLeadId(id)
    } else {
      // Redirect to configurator if no ID
      router.push('/configurator')
    }
  }, [searchParams, router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-blue-700" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Configuration Submitted Successfully!
          </h1>
          <p className="text-lg text-slate-600">
            Thank you for your interest in J Taylor Horseboxes. Your configuration has been saved and our team will prepare your formal quote.
          </p>
          {leadId && (
            <p className="mt-4 text-sm text-slate-500">
              Reference: <span className="font-mono font-medium">{leadId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Quote Preparation</h3>
                <p className="text-slate-600">
                  Our team will review your configuration and prepare a detailed formal quote including all specifications and payment terms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Email Confirmation</h3>
                <p className="text-slate-600">
                  You'll receive an email within 24 hours with your formal quote PDF and a link to review your configuration online.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Personal Consultation</h3>
                <p className="text-slate-600">
                  One of our horsebox specialists will contact you to discuss your requirements, answer questions, and arrange a viewing if desired.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Build Slot Reservation</h3>
                <p className="text-slate-600">
                  Once you're ready to proceed, your deposit will secure your build slot and we'll begin the exciting journey of creating your custom horsebox.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">Need Immediate Assistance?</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="tel:+441603552109"
              className="flex items-center gap-3 text-blue-700 hover:text-blue-800 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>Call: 01603 552109</span>
            </a>
            <a
              href="mailto:sales@jthltd.co.uk"
              className="flex items-center gap-3 text-blue-700 hover:text-blue-800 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Email: sales@jthltd.co.uk</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/configurator"
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-center"
          >
            Create Another Configuration
          </Link>
          <Link
            href="/models"
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-center flex items-center justify-center gap-2"
          >
            Browse Our Models
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ConfiguratorSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}