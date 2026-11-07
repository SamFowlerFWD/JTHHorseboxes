type Variant = 'default' | 'alt'

/*
 * Four short statements of fact, ruled like the columns of a maker's
 * plate. This was four coloured glyphs (shield, rosette, star, lorry)
 * centred over bold two-word slogans — the most recognisable pattern of a
 * template build, and it told the reader nothing. Each cell now carries
 * something true and specific, drawn from what the site already says
 * about JTH, and the rules do the work the icons were pretending to.
 */
const FACTS = [
  {
    lead: 'Built in Norfolk',
    detail: 'Every body is built at our workshop in Beeston.',
  },
  {
    lead: 'KPH designs',
    detail: "Kevin Parker's proven designs, acquired by JTH in 2025.",
  },
  {
    lead: 'Family run',
    detail: 'Founded by James Taylor, and still run by the family.',
  },
  {
    lead: 'UK & Ireland',
    detail: 'Delivered across both, with a representative in Dublin.',
  },
]

export default function TrustIndicators({ variant = 'default' }: { variant?: Variant }) {
  const surface = variant === 'alt' ? 'bg-white' : 'bg-paper'

  return (
    <section className={`${surface} border-y border-line`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* gap-px over a rule-coloured grid gives hairlines between cells
            only, in both directions, at every breakpoint. */}
        <dl className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.lead} className={`${surface} px-1 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-11`}>
              <dt className="font-display text-xl leading-tight text-ink lg:text-[1.7rem]">
                {fact.lead}
              </dt>
              <dd className="mt-2 sm:mt-3 max-w-[34ch] sm:max-w-[28ch] text-sm leading-relaxed text-slate-600">
                {fact.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
