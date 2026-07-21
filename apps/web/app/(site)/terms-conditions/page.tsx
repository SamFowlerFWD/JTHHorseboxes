import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY, LEGAL_LAST_UPDATED, orPlaceholder } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms governing use of the J Taylor Horseboxes website. Terms of sale for a horsebox order are provided separately with your order documentation.',
  alternates: { canonical: 'https://jthltd.co.uk/terms-conditions' },
}

export default function TermsConditionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">Terms &amp; Conditions</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-10 text-sm text-slate-700">
        <p>
          These terms cover your use of this website. They are <strong>not</strong> the terms on
          which we sell a horsebox. Terms of sale — including specification, payment, deposits,
          delivery, cancellation and warranty — are provided separately as part of your order
          documentation and are what govern any purchase.
        </p>
      </div>

      <div className="space-y-8 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-blue-600 [&_a]:underline">
        <section>
          <h2>1. Who we are</h2>
          <p>
            This website is operated by {COMPANY.name}, trading as {COMPANY.tradingAs}, a company
            registered in England and Wales under number {orPlaceholder(COMPANY.companyNumber)}, with
            its registered office at {orPlaceholder(COMPANY.registeredAddress)}. You can reach us at{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or{' '}
            <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a>.
          </p>
        </section>

        <section>
          <h2>2. Accepting these terms</h2>
          <p>
            By using this website you accept these terms. If you do not accept them, please do not
            use the site. We may update these terms from time to time; the version published here
            when you use the site is the one that applies.
          </p>
        </section>

        <section>
          <h2>3. Using the site</h2>
          <p>You may use this website for your own personal and business purposes. You must not:</p>
          <ul>
            <li>use it in any way that is unlawful or fraudulent;</li>
            <li>attempt to gain unauthorised access to it, or to any server or database behind it;</li>
            <li>introduce malicious code, or attempt to disrupt or overload the service;</li>
            <li>
              systematically extract content from it, whether by scraping, automated collection or
              otherwise, without our written permission.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Prices, specifications and availability</h2>
          <p>
            Every horsebox we build is made to order and specifications vary. Prices shown on this
            site are indicative starting prices for the body build, exclude VAT unless stated
            otherwise, and do not include the chassis, options or delivery unless we say so.
          </p>
          <p className="mt-3">
            Prices, specifications, payloads, dimensions, materials and lead times are subject to
            change, and images are illustrative — the horsebox you order may differ in detail from
            the one photographed. Nothing on this website is an offer to sell. A binding contract is
            formed only when we accept your order in writing.
          </p>
        </section>

        <section>
          <h2>5. Enquiries</h2>
          <p>
            Submitting an enquiry through this site does not place an order and does not oblige
            either of us to enter a contract. We handle the personal data in your enquiry as set out
            in our <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>6. Intellectual property</h2>
          <p>
            All content on this website — including text, photographs, designs, logos and the
            JTH and KPH names and marks — belongs to us or is used with permission, and is protected
            by copyright and trade mark law. You may view and print pages for your own use, but you
            may not reproduce, republish or use our content commercially without our written consent.
          </p>
        </section>

        <section>
          <h2>7. Accuracy and availability</h2>
          <p>
            We take care to keep this site accurate and up to date, but we do not guarantee that it
            is free from errors or that it will always be available. We may change, suspend or
            withdraw any part of it without notice.
          </p>
        </section>

        <section>
          <h2>8. Links to other sites</h2>
          <p>
            Where we link to third-party websites, we do so for information only. We have no control
            over them and accept no responsibility for their content.
          </p>
        </section>

        <section>
          <h2>9. Our liability</h2>
          <p>
            Nothing in these terms limits or excludes our liability for death or personal injury
            caused by our negligence, for fraud or fraudulent misrepresentation, or for anything else
            that cannot lawfully be limited or excluded.
          </p>
          <p className="mt-3">
            Subject to that, we are not liable for any loss of profit, loss of business, business
            interruption or loss of anticipated savings arising from your use of this website. If you
            are a consumer, these terms do not affect your statutory rights, and you keep the
            protection of any mandatory consumer law that applies where you live.
          </p>
        </section>

        <section>
          <h2>10. Governing law</h2>
          <p>
            These terms are governed by the law of England and Wales, and the courts of England and
            Wales have jurisdiction. If you are a consumer resident in Ireland or elsewhere in the
            EU, this does not deprive you of the protection of the mandatory consumer law of your
            country, and you may bring proceedings in your local courts.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Questions about these terms? Email{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call{' '}
            <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a>. Customers in
            Ireland can also contact {COMPANY.ieRepresentative.name} on{' '}
            <a href={`tel:${COMPANY.ieRepresentative.phone.replace(/\s/g, '')}`}>
              {COMPANY.ieRepresentative.phone}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
