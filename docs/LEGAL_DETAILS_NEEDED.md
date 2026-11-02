# Company details needed from JTH before launch

The legal pages are written and live, but four details could not be invented, so
they render as a visible **[to be confirmed]** on the site right now — including
on jthltd.ie, which is public. They are set in
[`apps/web/lib/legal.ts`](../apps/web/lib/legal.ts); fill the `null`s in and the
placeholders disappear.

## What we need

| # | Detail | Where it appears | Why |
|---|--------|------------------|-----|
| 1 | **Companies House registration number** | Privacy policy, terms, cookie policy | A UK limited company must show its registered number on its website. |
| 2 | **Registered office address**, including postcode | Same three pages | Must be shown alongside the company number. This is the registered address from Companies House, which can differ from the workshop. |
| 3 | **ICO registration number** — or confirmation that JTH is not registered | Privacy policy | Most businesses handling personal data must register with the ICO and publish the number. If JTH is not registered, say so and we will remove the line rather than leave a gap. |
| 4 | **How long enquiry emails are kept** — e.g. "24 months after last contact" | Privacy policy | UK GDPR requires a stated retention period. Any honest period is fine; it just has to be the one actually followed. |

## Questions worth settling at the same time

- **Is `sales@jthltd.co.uk` the right contact for data protection requests?**
  The privacy policy currently sends subject access and deletion requests there.
- **Does the Irish representative (Paul Morton) handle Irish data requests,** or
  do they all come back to Norfolk? The policy names him as the Irish contact.
- **Trading name.** The pages say "J Taylor Horseboxes Ltd, trading as JTH
  Horseboxes". Confirm that matches Companies House.

## Once we have them

Fill in `COMPANY` in `apps/web/lib/legal.ts`, redeploy, and the placeholders are
gone. Also update `LEGAL_LAST_UPDATED` in that file to the date of the change.

Nothing else on the site is blocked by this, but it should be settled before
jthltd.co.uk points at the new site — and ideally sooner, since the Irish site is
already public with the gaps showing.
