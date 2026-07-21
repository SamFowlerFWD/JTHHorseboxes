import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY, LEGAL_LAST_UPDATED } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'The cookies J Taylor Horseboxes Ltd uses. We set one functional cookie to remember your region, and no analytics or advertising cookies.',
  alternates: { canonical: 'https://jthltd.co.uk/cookie-policy' },
}

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">Cookie Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="space-y-8 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-blue-600 [&_a]:underline">
        <section>
          <p className="text-lg">
            We use a single cookie, and it exists only to remember whether you are browsing our UK or
            Irish site. We do not use analytics, advertising or social media cookies, and we do not
            track you across other websites.
          </p>
        </section>

        <section>
          <h2>The cookie we set</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-left">
                  <th className="py-2 pr-4 font-semibold text-slate-900">Name</th>
                  <th className="py-2 pr-4 font-semibold text-slate-900">Purpose</th>
                  <th className="py-2 pr-4 font-semibold text-slate-900">Expires</th>
                  <th className="py-2 font-semibold text-slate-900">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-3 pr-4 font-mono text-xs">region</td>
                  <td className="py-3 pr-4">
                    Remembers whether you are viewing the United Kingdom or Ireland version of the
                    site, so that pricing, contact details and available models are shown correctly.
                  </td>
                  <td className="py-3 pr-4">1 year</td>
                  <td className="py-3">Functional</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            This cookie is strictly necessary to deliver the site you asked for, so we do not ask for
            consent to set it. It holds only a two-letter region code. It contains no name, no
            identifier and nothing that could be used to recognise you elsewhere.
          </p>
        </section>

        <section>
          <h2>What we do not use</h2>
          <ul>
            <li>No Google Analytics or any other analytics tool.</li>
            <li>No advertising, retargeting or conversion-tracking pixels.</li>
            <li>No social media tracking cookies.</li>
            <li>No cross-site tracking of any kind.</li>
          </ul>
          <p className="mt-3">
            This is why you do not see a cookie consent banner on our site — there is nothing to
            consent to beyond the functional cookie above.
          </p>
        </section>

        <section>
          <h2>Managing cookies</h2>
          <p>
            You can delete or block cookies through your browser settings. If you block the{' '}
            <span className="font-mono text-sm">region</span> cookie, the site will still work, but
            it may show you the wrong region&rsquo;s contact details and you may need to reselect
            your region on each visit.
          </p>
        </section>

        <section>
          <h2>More information</h2>
          <p>
            Our <Link href="/privacy-policy">Privacy Policy</Link> explains how we handle personal
            data more generally. If you have a question about cookies, email{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </section>
      </div>
    </main>
  )
}
