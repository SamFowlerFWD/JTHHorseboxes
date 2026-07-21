import HeroAdvanced from '@/components/HeroAdvanced'
import Schema, { generateBreadcrumbSchema } from '@/components/Schema'
import Link from 'next/link'
import type { Metadata } from 'next'
import ClickableImage from '@/components/ClickableImage'
import LightboxGallery from '@/components/Lightbox'
import {
  ArrowRight,
  Shield,
  CheckCircle,
  Droplets,
  Leaf,
  Sparkles,
  Volume2,
  ThermometerSun,
  Timer,
  Layers,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Coat-X Protective Coating | Better Than Horsebox Rubber Matting | JTH',
  description:
    'Coat-X is our high-performance polyurea protective coating, replacing heavy rubber matting and kick sheets. Independently slip tested to British Standards 7976-2. Available as an optional extra on all horseboxes.',
  keywords:
    'Coat-X, polyurea protective coating, horsebox rubber matting alternative, horsebox floor coating, slip tested BS 7976-2, horsebox ramp coating, JTH horsebox coating, JTH protective coating',
  openGraph: {
    title: 'Coat-X Protective Coating | JTH Horseboxes',
    description:
      'High-performance polyurea coating replacing heavy rubber matting. Independently slip tested to BS 7976-2.',
    images: ['/coat-x/coat-x-polyurea-protective-coating-horsebox.jpg'],
  },
}

const breadcrumbs = [
  { name: 'Home', url: 'https://jthltd.co.uk' },
  { name: 'Coat-X Protective Coating', url: 'https://jthltd.co.uk/coat-x' },
]

const advantages = [
  { icon: Shield, text: 'Amazing durability for horsebox ramps, floors and walls' },
  { icon: Layers, text: 'Replaces heavy rubber matting, kick sheets and spray-on rubber' },
  { icon: Sparkles, text: 'Does not dry out, shrink or crack — maintenance free' },
  { icon: Droplets, text: '100% waterproof — can be steam cleaned and power washed daily' },
  { icon: CheckCircle, text: 'Independently slip tested wet and dry to British Standards 7976-2' },
  { icon: ThermometerSun, text: 'Not affected by moisture, temperature or ageing' },
  { icon: Volume2, text: 'Sound deadening qualities with high impact resistance' },
  { icon: Leaf, text: 'Environmentally safe — no solvents, VOCs or CFCs' },
  { icon: Timer, text: 'Lasts the full lifecycle of the horsebox with zero maintenance' },
  { icon: Layers, text: 'Smart one-piece finish with no loss of load space' },
]

const applicationSteps = [
  'Vehicle enters Coat-X department',
  'Mask the entire vehicle',
  'Inspect surface for imperfections',
  'Wipe surfaces clean',
  'Spray Coat-X to desired thickness',
  'Demask',
  'Rebuild',
  'Clean vehicle',
]

const galleryImages = [
  {
    src: '/coat-x/coat-x-protecting-horsebox-walls.jpg',
    alt: 'Coat-X polyurea protective coating applied to horsebox walls',
  },
  {
    src: '/coat-x/coat-x-improved-horse-protection.jpg',
    alt: 'Coat-X coating providing improved horse protection inside horsebox',
  },
  {
    src: '/coat-x/coat-x-horse-safety-coating.jpg',
    alt: 'Coat-X non-slip coating for horse safety in transit',
  },
  {
    src: '/coat-x/coat-x-horse-area-application.jpg',
    alt: 'Coat-X applied to horse area inside Aeos horsebox',
  },
  {
    src: '/coat-x/coat-x-coating-horsebox-ramp.jpg',
    alt: 'Coat-X non-slip coating on horsebox loading ramp',
  },
  {
    src: '/coat-x/coat-x-application-process.jpg',
    alt: 'Coat-X polyurea coating application process at JTH factory',
  },
]

export default function CoatXPage() {
  return (
    <>
      <Schema schema={generateBreadcrumbSchema(breadcrumbs)} />

      {/* Hero Section */}
      <HeroAdvanced
        title="Coat-X Protective Coating"
        subtitle="Pioneering Polyurea Technology"
        description="Our high-performance spray-on coating replaces heavy rubber matting — independently slip tested to British Standards 7976-2"
        primaryCTA={{
          text: 'View All Models',
          href: '/models',
        }}
        secondaryCTA={{
          text: 'Get a Quote',
          href: '/contact',
        }}
        media={[
          {
            type: 'image' as const,
            src: '/coat-x/coat-x-polyurea-protective-coating-horsebox.jpg',
          },
        ]}
        overlay="gradient"
        height="medium"
      />

      {/* What is Coat-X */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                What is Coat-X Polyurea Protective Coating?
              </h1>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  We designed and developed our innovative Coat-X Polyurea as a spray-on protective
                  coating that completely replaces problematic surfaces like heavy rubber mats and
                  kick sheets for horseboxes. This groundbreaking and durable solution provides a
                  one-coat totally waterproof finish that is engineered to last the full lifecycle of
                  our horseboxes.
                </p>
                <p>
                  It features a non-slip finish that has been independently tested and proven to
                  outperform rubber matting for grip in both wet and dry conditions, meeting{' '}
                  <strong>British Standards 7976-2</strong>.
                </p>
                <p>
                  Coat-X is a high-performance polyurea protective coating, developed with the aid of
                  chemists. It is the result of a sophisticated chemical reaction known as
                  polyaddition, involving a polyamine and a di-isocyanate. The application process
                  utilises specialised dispensing equipment with precise metering pumps to combine
                  Coat-X R (resin) and Coat-X H (hardener) in a 1:1 ratio.
                </p>
                <p>
                  Its 100% solids composition facilitates excellent application characteristics,
                  including rapid curing even at low temperatures. Coat-X is impervious to air
                  moisture content, heat, and ageing. As a corrosion-resistant barrier, it excels by
                  preventing the transfer of corrosion-accelerating ions such as sulphides and
                  chlorides.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <ClickableImage
                src="/coat-x/coat-x-polyurea-protective-coating-horsebox.jpg"
                alt="Coat-X polyurea protective coating applied inside a JTH horsebox"
                width={600}
                height={426}
                className="w-full h-auto shadow-lg"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Advantages of Coat-X
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete replacement for traditional rubber matting with superior performance in
              every category
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 font-medium">{advantage.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Application Process & Environment */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Application Process */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Coat-X Application Process
              </h2>
              <ol className="space-y-3">
                {applicationSteps.map((step, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Environment */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Environmentally Responsible
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Coat-X stands out as an environmentally responsible coating solution, offering
                  several key advantages that make it a superior choice for both performance and
                  sustainability.
                </p>
                <p>
                  This innovative coating boasts a solvent-free formulation, eliminating Volatile
                  Organic Compounds (VOCs) and Chlorofluorocarbons (CFCs). By avoiding these harmful
                  chemicals, Coat-X ensures a safer application process and minimises any
                  environmental impact.
                </p>
                <p>
                  Once applied, it does not age, so lasts the full life cycle of the horsebox needing
                  no maintenance or replacement.
                </p>
              </div>
              <div className="mt-8 bg-green-50 border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Leaf className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-900">Eco Credentials</h3>
                </div>
                <ul className="space-y-2 text-green-800 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    No solvents, VOCs or CFCs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Zero maintenance — no replacement waste
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Lasts full lifecycle of horsebox
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Pioneered */}
      <section className="py-16 md:py-24 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why We Pioneered Coat-X
            </h2>
            <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
              <p>
                Drawing upon decades of expertise in horsebox manufacturing, we have firsthand
                experience with the limitations of traditional flooring and grip solutions. Heavy
                rubber mats, liquid rubber flooring, kick sheets, EVA matting, and various cappings,
                paints, and sealants have consistently failed to meet our stringent standards for
                durability and longevity.
              </p>
              <p>
                Our relentless pursuit of excellence led us to pioneer the groundbreaking Coat-X
                Polyurea protective coating. This revolutionary product for horsebox ramps and horse
                areas significantly outperforms all other options available on the market, offering
                unparalleled durability and a long-lasting finish that additionally enhances resale
                values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
            Coat-X Gallery
          </h2>
          <LightboxGallery images={galleryImages} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Upgrade Your Horsebox with Coat-X
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Coat-X is available as an optional extra on all our horseboxes. Get in touch to arrange a viewing
            and see the difference for yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/models"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            >
              View All Models
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get a Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
