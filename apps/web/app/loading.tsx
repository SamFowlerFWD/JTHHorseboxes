export default function Loading() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="spinner-premium h-10 w-10 mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </main>
  )
}
