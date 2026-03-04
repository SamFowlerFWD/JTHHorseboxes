import { Shield, Award, Star, Truck } from 'lucide-react'

type Variant = 'default' | 'alt'

export default function TrustIndicators({ variant = 'default' }: { variant?: Variant }) {
  const bg = variant === 'alt' ? 'bg-blue-50 border-y border-blue-200' : 'bg-slate-50 border-y border-slate-200'

  return (
    <section className={`${bg} py-12`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <Shield className="w-8 h-8 text-blue-700 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">British Built</div>
            <div className="text-sm text-slate-700">Beeston, Norfolk</div>
          </div>
          <div className="text-center">
            <Award className="w-8 h-8 text-blue-700 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">KPH Heritage</div>
            <div className="text-sm text-slate-700">Proven Designs</div>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">Family Run</div>
            <div className="text-sm text-slate-700">Personal Service</div>
          </div>
          <div className="text-center">
            <Truck className="w-8 h-8 text-blue-700 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-900">UK & IE</div>
            <div className="text-sm text-slate-700">Delivery Available</div>
          </div>
        </div>
      </div>
    </section>
  )
}
