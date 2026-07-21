import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY, LEGAL_LAST_UPDATED, orPlaceholder } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How J Taylor Horseboxes Ltd collects, uses and protects your personal data, and the rights you have under UK and EU data protection law.',
  alternates: { canonical: 'https://jthltd.co.uk/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="space-y-8 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-blue-600 [&_a]:underline">
        <section>
          <h2>1. Who we are</h2>
          <p>
            {COMPANY.name} (trading as {COMPANY.tradingAs}, &ldquo;we&rdquo;, &ldquo;us&rdquo;) builds
            horseboxes in {COMPANY.generalLocation} and sells to customers in the United Kingdom and
            Ireland. We are the data controller for the personal data described in this policy.
          </p>
          <ul className="mt-3">
            <li>Registered company number: {orPlaceholder(COMPANY.companyNumber)}</li>
            <li>Registered office: {orPlaceholder(COMPANY.registeredAddress)}</li>
            <li>ICO registration: {orPlaceholder(COMPANY.icoRegistration)}</li>
            <li>
              Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </li>
            <li>
              Telephone: <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a>
            </li>
          </ul>
        </section>

        <section>
          <h2>2. What personal data we collect</h2>
          <p>
            We only collect personal data that you choose to give us. We do not buy data, and we do
            not build profiles of visitors.
          </p>
          <h3 className="mt-4">Enquiry form</h3>
          <p>When you send an enquiry through our website, we collect:</p>
          <ul>
            <li>your name;</li>
            <li>your email address;</li>
            <li>your telephone number;</li>
            <li>the model you are interested in, if you tell us; and</li>
            <li>the content of your message.</li>
          </ul>
          <p className="mt-3">
            The form also records whether you ticked the box consenting to marketing contact. That
            box is never pre-ticked, and leaving it unticked does not affect our reply to you.
          </p>
          <h3 className="mt-4">Technical data</h3>
          <p>
            Our hosting provider processes your IP address and basic request information in order to
            serve the site and protect it from abuse. We do not use this to identify you.
          </p>
        </section>

        <section>
          <h2>3. Why we use it, and our lawful basis</h2>
          <ul>
            <li>
              <strong>To answer your enquiry and discuss a possible order</strong> — our legitimate
              interests, and where you have asked us to do something before entering a contract,
              steps taken at your request prior to a contract.
            </li>
            <li>
              <strong>To send you marketing about our horseboxes</strong> — your consent, given by
              ticking the marketing box. You can withdraw it at any time and we will stop.
            </li>
            <li>
              <strong>To keep the website secure and working</strong> — our legitimate interests in
              running a safe, functioning service.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Who we share it with</h2>
          <p>
            We do not sell your personal data or share it for anyone else&rsquo;s marketing. We use a
            small number of service providers who process data on our instructions:
          </p>
          <ul>
            <li>
              <strong>Resend</strong> — delivers enquiry emails from the website to our sales inbox.
            </li>
            <li>
              <strong>Cloudflare</strong> — hosts the website and provides security and content
              delivery.
            </li>
          </ul>
          <p className="mt-3">
            Some of these providers process data outside the UK and European Economic Area. Where
            that happens, the transfer is covered by appropriate safeguards, such as the UK
            International Data Transfer Addendum or the European Commission&rsquo;s Standard
            Contractual Clauses. We may also disclose data where the law requires it.
          </p>
        </section>

        <section>
          <h2>5. How long we keep it</h2>
          <p>
            Enquiries are received and kept as email in our business mailbox. We keep them for{' '}
            {orPlaceholder(COMPANY.enquiryRetention)}, after which they are deleted. Where an
            enquiry becomes an order, we keep the associated records for as long as we need them for
            the contract and for the periods required by tax and accounting law. Marketing consent
            records are kept until you withdraw consent, and for a short period afterwards so that
            we can evidence that we acted on your withdrawal.
          </p>
        </section>

        <section>
          <h2>6. Your rights</h2>
          <p>
            Under UK GDPR and, for customers in Ireland, EU GDPR, you have the right to ask us to:
          </p>
          <ul>
            <li>give you a copy of the personal data we hold about you;</li>
            <li>correct data that is wrong or incomplete;</li>
            <li>delete your data, where there is no good reason for us to keep it;</li>
            <li>restrict how we use it, or object to us using it;</li>
            <li>transfer it to you or another provider in a portable format; and</li>
            <li>stop sending you marketing, at any time.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
            We will respond within one month. Exercising your rights is free.
          </p>
        </section>

        <section>
          <h2>7. Complaints</h2>
          <p>
            If you are unhappy with how we have handled your data, please tell us first so we can put
            it right. You also have the right to complain to a supervisory authority:
          </p>
          <ul>
            <li>
              <strong>United Kingdom</strong> — Information Commissioner&rsquo;s Office,{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noreferrer">
                ico.org.uk
              </a>
            </li>
            <li>
              <strong>Ireland</strong> — Data Protection Commission,{' '}
              <a href="https://www.dataprotection.ie" target="_blank" rel="noreferrer">
                dataprotection.ie
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            We use one functional cookie and no analytics or advertising cookies. Our{' '}
            <Link href="/cookie-policy">Cookie Policy</Link> explains it in full.
          </p>
        </section>

        <section>
          <h2>9. Changes to this policy</h2>
          <p>
            If we change how we handle personal data we will update this page and the date at the
            top. Please check it from time to time.
          </p>
        </section>
      </div>
    </main>
  )
}
