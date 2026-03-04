import { Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <p className="text-7xl font-bold text-blue-700 mb-4">404</p>

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Page not found
        </h1>
        <p className="text-slate-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to homepage
        </Link>
      </div>
    </main>
  )
}
