'use client'

import { useState } from 'react'
import type { LeadFormData } from '@/lib/configurator/types'
import { 
  User, Mail, Phone, Building, 
  MessageSquare, Send, Check,
  AlertCircle
} from 'lucide-react'

interface LeadCaptureFormProps {
  onSubmit: (data: LeadFormData) => Promise<void>
  isSubmitting: boolean
}

export default function LeadCaptureForm({ onSubmit, isSubmitting }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    consent_marketing: false
  })

  const [errors, setErrors] = useState<Partial<LeadFormData>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const validateField = (field: keyof LeadFormData, value: any) => {
    let error = ''

    switch (field) {
      case 'first_name':
        if (!value) error = 'First name is required'
        else if (value.length < 2) error = 'First name must be at least 2 characters'
        break
      case 'last_name':
        if (!value) error = 'Last name is required'
        else if (value.length < 2) error = 'Last name must be at least 2 characters'
        break
      case 'email':
        if (!value) error = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email address'
        break
      case 'phone':
        if (!value) error = 'Phone number is required'
        else if (!/^[\d\s\-\+\(\)]+$/.test(value)) error = 'Invalid phone number'
        else if (value.replace(/\D/g, '').length < 10) error = 'Phone number must be at least 10 digits'
        break
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }))

    return !error
  }

  const handleFieldChange = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validate if field has been touched
    if (touched.has(field)) {
      validateField(field, value)
    }
  }

  const handleFieldBlur = (field: keyof LeadFormData) => {
    setTouched(prev => new Set(prev).add(field))
    validateField(field, formData[field])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const fieldsToValidate: (keyof LeadFormData)[] = ['first_name', 'last_name', 'email', 'phone']
    let isValid = true

    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field])
      if (!fieldValid) isValid = false
    })

    // Mark all fields as touched
    setTouched(new Set(fieldsToValidate))

    if (!isValid) {
      return
    }

    // Submit the form
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">Request Your Quote</h3>
        <p className="text-blue-100">
          Enter your details below and we'll send you a formal quote for your configured horsebox
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                onBlur={() => handleFieldBlur('first_name')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.first_name && touched.has('first_name')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-blue-600'
                }`}
                placeholder="John"
              />
            </div>
            {errors.first_name && touched.has('first_name') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.first_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                onBlur={() => handleFieldBlur('last_name')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.last_name && touched.has('last_name')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-blue-600'
                }`}
                placeholder="Smith"
              />
            </div>
            {errors.last_name && touched.has('last_name') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email && touched.has('email')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-blue-600'
                }`}
                placeholder="john.smith@example.com"
              />
            </div>
            {errors.email && touched.has('email') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone && touched.has('phone')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-blue-600'
                }`}
                placeholder="07123 456789"
              />
            </div>
            {errors.phone && touched.has('phone') && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Company Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company (Optional)
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={formData.company || ''}
              onChange={(e) => handleFieldChange('company', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Your company name"
            />
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Additional Message (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <textarea
              value={formData.message || ''}
              onChange={(e) => handleFieldChange('message', e.target.value)}
              rows={4}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              placeholder="Any specific requirements or questions?"
            />
          </div>
        </div>

        {/* Marketing Consent */}
        <div className="bg-slate-50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.consent_marketing}
              onChange={(e) => handleFieldChange('consent_marketing', e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-700 border-slate-300 rounded focus:ring-blue-600"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">
                Keep me updated with news and offers
              </span>
              <p className="text-xs text-slate-500 mt-1">
                We'll send you occasional updates about new models, special offers, and events. 
                You can unsubscribe at any time.
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isSubmitting
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-700 text-white hover:bg-blue-800'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Request Quote
            </>
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-xs text-slate-500 text-center">
          By submitting this form, you agree to our{' '}
          <a href="/privacy" className="text-blue-700 hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" className="text-blue-700 hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </form>
  )
}