import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for J Taylor Horseboxes Ltd. Learn how we collect, use, and protect your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">Privacy Policy</h1>
      <p className="text-slate-600">Privacy policy coming soon.</p>
    </main>
  )
}
