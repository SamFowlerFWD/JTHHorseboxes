import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for J Taylor Horseboxes Ltd. Read our terms of service and purchasing conditions.',
}

export default function TermsConditionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">Terms & Conditions</h1>
      <p className="text-slate-600">Terms coming soon.</p>
    </main>
  )
}
