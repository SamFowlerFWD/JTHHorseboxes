/**
 * Model weight class, derived from the slug.
 *
 * Slugs end in the weight in tenths-of-a-tonne notation: -35, -45, -72, -75.
 * The previous inline version tested `slug.includes('35') ? '3.5T' : '4.5T'`,
 * which labelled every 7.2t and 7.5t box as 4.5T on the models grid.
 */

const WEIGHT_BY_SUFFIX: Record<string, { short: string; long: string }> = {
  '35': { short: '3.5T', long: '3.5 Tonne' },
  '45': { short: '4.5T', long: '4.5 Tonne' },
  '72': { short: '7.2T', long: '7.2 Tonne' },
  '75': { short: '7.5T', long: '7.5 Tonne' },
}

function suffixOf(slug: string): string | null {
  // Match the trailing number, so "aeos-edge-st-45" reads 45 and a stray "35"
  // elsewhere in the slug cannot win.
  const match = slug.match(/(\d{2})$/)
  return match ? match[1] : null
}

/** e.g. "4.5T" — for badges. Empty string when the slug carries no weight. */
export function weightBadge(slug: string): string {
  const suffix = suffixOf(slug)
  return suffix ? WEIGHT_BY_SUFFIX[suffix]?.short ?? '' : ''
}

/** e.g. "4.5 Tonne" — for prose and schema categories. */
export function weightLabel(slug: string): string {
  const suffix = suffixOf(slug)
  return suffix ? WEIGHT_BY_SUFFIX[suffix]?.long ?? '' : ''
}

/**
 * Card photograph for a model.
 *
 * The grid assumed every model had `/models/<slug>/01.webp`. Seven of the
 * seventeen active models do not, so those cards rendered a broken image on
 * the live models page: three carry a `hero.jpg` under a different name, and
 * four have no photography at all. Returns null for the latter so the card
 * can fall back to a plain panel instead of a broken img.
 *
 * Regenerate after adding photography:
 *   node -e "const d=require('./data/pricing.json'),fs=require('fs');\
 *     for(const m of d.models.filter(m=>m.active))\
 *       if(!fs.existsSync('public/models/'+m.slug+'/01.webp')) console.log(m.slug)"
 */
const CARD_IMAGE_OVERRIDES: Record<string, string | null> = {
  'aeos-qv-45': null,
  'aeos-edge-45': '/models/aeos-edge-45/hero.jpg',
  'aeos-freedom-st-45': null,
  'aeos-edge-st-45': '/models/aeos-edge-st-45/hero.jpg',
  'aeos-qv-st-45': null,
  'zenos-72': null,
  'zenos-xl-72': null,
  'helios-75': '/models/helios-75/hero.jpg',
}

export function modelCardImage(slug: string): string | null {
  if (slug in CARD_IMAGE_OVERRIDES) return CARD_IMAGE_OVERRIDES[slug]
  return `/models/${slug}/01.webp`
}
