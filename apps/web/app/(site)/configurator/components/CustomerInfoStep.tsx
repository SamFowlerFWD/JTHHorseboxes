'use client'

import { useConfiguratorStore } from '@/lib/configurator/store'
import { Mail, Phone, User, UserCheck } from 'lucide-react'

// List of agents (could be fetched from database)
const AGENTS = [
  'No Agent',
  'John Smith',
  'Sarah Johnson',
  'Mike Williams',
  'Emma Brown',
  'Tom Davis'
]

export default function CustomerInfoStep() {
  const {
    customerName,
    customerEmail,
    customerPhone,
    agentName,
    setCustomerInfo
  } = useConfiguratorStore()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Customer Information</h2>
        
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={customerName}
                onChange={(e) => setCustomerInfo({ name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                required
              />
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={customerEmail}
                onChange={(e) => setCustomerInfo({ email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                required
              />
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                placeholder="+44 7XXX XXXXXX"
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                required
              />
              <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Agent Selection */}
          <div>
            <label htmlFor="agent" className="block text-sm font-medium text-slate-700 mb-2">
              Sales Agent (Optional)
            </label>
            <div className="relative">
              <select
                id="agent"
                value={agentName}
                onChange={(e) => setCustomerInfo({ agent: e.target.value })}
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors appearance-none bg-white"
              >
                {AGENTS.map((agent) => (
                  <option key={agent} value={agent === 'No Agent' ? '' : agent}>
                    {agent}
                  </option>
                ))}
              </select>
              <UserCheck className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              If you've been working with one of our sales agents, please select their name.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Your information will be used to generate a formal quote and will be kept confidential. 
            We will contact you within 24 hours to discuss your requirements.
          </p>
        </div>
      </div>
    </div>
  )
}