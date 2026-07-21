/**
 * Company details used across the legal pages.
 *
 * Anything still set to null renders as a visible "[to be confirmed]" marker
 * rather than silently disappearing — these are details we cannot invent and
 * JTH has to supply before the policies are relied on.
 */

export const LEGAL_LAST_UPDATED = '21 July 2026'

export const COMPANY = {
  name: 'J Taylor Horseboxes Ltd',
  tradingAs: 'JTH Horseboxes',
  /** TODO: JTH to supply — Companies House registration number */
  companyNumber: null as string | null,
  /** TODO: JTH to supply — full registered office address including postcode */
  registeredAddress: null as string | null,
  /** TODO: JTH to supply — ICO data protection register entry, if registered */
  icoRegistration: null as string | null,
  /** TODO: JTH to confirm — how long enquiry emails are kept */
  enquiryRetention: null as string | null,
  email: 'sales@jthltd.co.uk',
  phone: '+44 1603 552109',
  generalLocation: 'Norfolk, England',
  ieRepresentative: {
    name: 'Paul Morton',
    address: 'Taylors Lane, Ballyboden, Rathfarnham, Dublin, D16 CV91',
    phone: '+353 87 255 7015',
  },
} as const

/** Renders a value, or a conspicuous placeholder when JTH has yet to supply it. */
export function orPlaceholder(value: string | null): string {
  return value ?? '[to be confirmed]'
}

export const isPlaceholder = (value: string | null): boolean => value === null
