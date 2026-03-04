import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie policy for J Taylor Horseboxes Ltd. Learn about the cookies we use and how to manage your preferences.',
}

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">Cookie Policy</h1>
      <p className="text-slate-600">Cookie policy coming soon.</p>
    </main>
  )
}
