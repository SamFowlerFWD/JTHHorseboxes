export default function ConfiguratorLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Fake progress bar header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="shimmer h-7 w-48 rounded mb-2" />
              <div className="shimmer h-4 w-72 rounded" />
            </div>
            <div className="shimmer h-5 w-20 rounded" />
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-blue-700/30 h-2 rounded-full w-1/5" />
          </div>
        </div>
      </div>

      {/* Fake content card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          {/* Fake form fields */}
          <div className="space-y-6">
            <div>
              <div className="shimmer h-4 w-32 rounded mb-2" />
              <div className="shimmer h-11 w-full rounded-lg" />
            </div>
            <div>
              <div className="shimmer h-4 w-40 rounded mb-2" />
              <div className="shimmer h-11 w-full rounded-lg" />
            </div>
            <div>
              <div className="shimmer h-4 w-28 rounded mb-2" />
              <div className="shimmer h-11 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Fake navigation buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
          <div className="shimmer h-12 w-32 rounded-lg" />
          <div className="shimmer h-12 w-28 rounded-lg" />
        </div>
      </div>
    </main>
  )
}
