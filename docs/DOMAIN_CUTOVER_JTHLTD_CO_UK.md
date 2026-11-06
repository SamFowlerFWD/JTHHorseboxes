# jthltd.co.uk — DNS migration & launch runbook

Verified against live DNS on 2026-11-06. `jthltd.co.uk` is the primary domain
(`www` 301s to the apex today, so the apex stays canonical).

**The mailboxes are Hostinger Email and must keep working throughout.** Every
mail record below is reproduced exactly as it exists now; nothing about the
mailboxes, passwords or Hostinger Email subscription changes.

---

## 1. Current state

### jthltd.co.uk — DNS at Hostinger (`ns1/ns2.dns-parking.com`)

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `@` | `89.117.229.191` | legacy WordPress (LiteSpeed) |
| A | `www` | `89.117.229.191` | 301 → apex |
| A | `ftp` | `89.117.229.191` | Hostinger FTP |
| MX | `@` | `mx1.hostinger.com` (5) | **mail** |
| MX | `@` | `mx2.hostinger.com` (10) | **mail** |
| TXT | `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | **mail (SPF)** |
| TXT | `_dmarc` | `v=DMARC1; p=none` | **mail (DMARC)** |
| CNAME | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` | **mail (DKIM)** |
| CNAME | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` | **mail (DKIM)** |
| CNAME | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` | **mail (DKIM)** |
| CNAME | `autodiscover` | `autodiscover.mail.hostinger.com` | **mail (Outlook)** |
| CNAME | `autoconfig` | `autoconfig.mail.hostinger.com` | **mail (Thunderbird)** |

No CAA, no SRV, no `mail`/`webmail`/`cpanel` records.

### Related domains — do not touch

- **`kphltd.co.uk`** (legacy KPH). DNS at `livedns.co.uk`, not easily under our
  control. Its A record points at the **same Hostinger box** (`89.117.229.191`),
  which is what issues its `301 → https://jthltd.co.uk/`. It has its **own
  Google Workspace MX** — unrelated to Hostinger mail.
- **`jthltd.ie`** — already on Cloudflare, Google Workspace mail, custom domain
  on the `jth-web` Pages project.

### Target

`jth-web` Cloudflare Pages project. Currently serves `jth-web.pages.dev`,
`jthltd.ie`, `www.jthltd.ie`. **One deployment serves all of them.**

---

## 2. Why the nameservers have to move

Cloudflare Pages needs a CNAME to `jth-web.pages.dev`. A bare apex cannot hold a
CNAME, and Hostinger's DNS editor has no ALIAS/ANAME/flattening. Cloudflare does
flatten a CNAME at the apex — but only when Cloudflare is authoritative for the
zone. Since `jthltd.co.uk` is primary, the zone moves to Cloudflare.

Alternative, if the NS move is ever blocked: make `www` canonical via CNAME and
leave the apex as a Hostinger redirect. Rejected — the apex is the primary.

---

## Status — 2026-11-06

**Stage 1 complete.** `jthltd.co.uk` is now served by Cloudflare DNS. The site
still comes from Hostinger and mail is untouched, exactly as intended — this
stage moved authority only.

- Zone created on the Free plan in the same account as `jthltd.ie`
  (`7b60dc867df57475de974e49866d013b`), zone id
  `faf1a49f6b4d78c72ea440ace44bf489`.
- Nameservers `kyrie.ns.cloudflare.com` / `leia.ns.cloudflare.com`, changed at
  the Hostinger registrar. Zone went **active 2026-11-06 19:20 UTC**.
- DNSSEC was checked first: no DS, no DNSKEY, nothing to disable. Had it been
  signed, switching nameservers would have broken resolution outright.
- All 12 records verified against the new nameservers. MX, SPF, DMARC, the
  three DKIM CNAMEs and autodiscover/autoconfig all resolve to the original
  Hostinger targets. `jthltd.co.uk` 200s, `www` and `kphltd.co.uk` still 301 to
  the apex.
- The DKIM chain resolves end to end: `hostingermail-a` returns a real 408-char
  key. `-b` and `-c` return `v=DKIM1;p=` with an empty key — unused rotation
  slots. Those CNAMEs point at Hostinger-controlled hosts, so their contents are
  Hostinger's and are unchanged by this migration.

**The trap this stage walked into:** Cloudflare's import defaulted 8 of the 12
records to Proxied, including all three DKIM CNAMEs and autodiscover. Left that
way, DKIM lookups would have returned Cloudflare IPs — mail would still send but
fail signature validation and drift into spam, with nothing erroring. All 12 are
DNS only.

**Mail confirmed working on a real `@jthltd.co.uk` mailbox after the switch**
(2026-11-06). Stage 1 is closed.

Stage 3 is not gated on mail. It changes only the apex and `www` A records; it
does not touch MX, SPF, DKIM, DMARC or autodiscover. So the decision to launch
is about whether the new UK site is ready to replace the WordPress one for the
public — not about leaving the mail to settle.

## 3. Stage 1 — move DNS with **zero visible change**

Do not combine the DNS migration with the site launch. Stage 1 moves authority
only: the site still serves from Hostinger, mail still flows to Hostinger.
Nothing a visitor or mailbox sees changes, so there is nothing to roll back
under pressure.

1. In Cloudflare, **Add a site** → `jthltd.co.uk`. Let the scan import records.
2. **Reconcile against the table in §1 by hand.** The scan is best-effort and
   routinely misses DKIM and `_dmarc`. Every row must be present and exact.
3. Set the web records to match what is live today, so answers are identical
   from either nameserver during propagation:
   - `A @ → 89.117.229.191` — **DNS only (grey cloud)**
   - `A www → 89.117.229.191` — **DNS only**
   - `A ftp → 89.117.229.191` — **DNS only**
4. **Mail records must all be DNS only (grey cloud).** Proxying a DKIM or
   autodiscover CNAME makes Cloudflare answer with its own IPs, which breaks
   DKIM validation and Outlook/Thunderbird setup. MX cannot be proxied at all.
5. Only once the Cloudflare zone is complete, change the nameservers at the
   registrar to the two Cloudflare nameservers that zone was assigned.
6. Leave TTLs on Auto. `.co.uk` delegation usually flips within an hour or two.

### Verify stage 1 before going further

```bash
dig +short NS jthltd.co.uk            # expect the Cloudflare pair
dig +short MX jthltd.co.uk            # expect mx1/mx2.hostinger.com (5/10)
dig +short TXT jthltd.co.uk           # expect the Hostinger SPF, unchanged
dig +short TXT _dmarc.jthltd.co.uk
dig +short CNAME hostingermail-a._domainkey.jthltd.co.uk
dig +short CNAME autodiscover.jthltd.co.uk
curl -sS -o /dev/null -w '%{http_code}\n' https://jthltd.co.uk   # expect 200, still WordPress
```

Then **send and receive a real test email** on a Hostinger mailbox. Do not
proceed to stage 3 until that passes.

---

## 4. Stage 2 — prerequisites for launch (code, not DNS)

Both are now done, but **neither is deployed**.

1. **The password gate — done, undeployed.** `apps/web/middleware.ts` used to
   gate *every* host that is not `.ie` and not localhost, so the public UK site
   would have demanded `jth2026` the moment DNS landed. It now gates
   `*.pages.dev` only, so the preview stays protected and both custom domains
   are public.
2. **Redirects — done.** 52 legacy URLs are inventoried in
   `docs/legacy-url-inventory.txt` (29 pages, 19 posts, 3 categories, 1 author)
   and all 52 are now accounted for by the `redirects()` map in
   `next.config.js`: 49 explicit 301 rules, plus `/`, `/contact` and
   `/privacy-policy`, whose paths are unchanged in the new site. Every rule was
   probed against the deployed preview on 2026-11-06 and resolves 200.

   Legacy URLs carry a trailing slash, so each one takes two hops — Next 308s
   `/foo/` → `/foo`, then the 301 lands on the destination. Search engines
   follow that fine; collapsing it would mean duplicating every rule.

Note: `/api` and `/admin` are excluded from the gate, so `/admin` is reachable
without the preview password today. Worth closing separately.

Remember that deploying either change **also ships to the live `jthltd.ie`
site** — one Pages project, one deployment.

---

## 5. Stage 3 — launch

1. Add `jthltd.co.uk` and `www.jthltd.co.uk` as custom domains on `jth-web`
   (Pages dashboard — wrangler has no custom-domain command).
2. Swap the web records; mail records stay exactly as they are:
   - `@` → CNAME `jth-web.pages.dev`, **proxied** (Cloudflare flattens it)
   - `www` → CNAME `jth-web.pages.dev`, **proxied**
   - keep `A ftp → 89.117.229.191`, DNS only
3. Add a `www` → apex redirect so the apex stays canonical, matching today.
4. Re-verify mail with a live send/receive, and spot-check redirects.

---

## 6. Do not break

- **Keep the Hostinger hosting plan alive after cutover.** `kphltd.co.uk` points
  at that box for its `301 → jthltd.co.uk`, and its DNS is not easily ours to
  change. Cancel the hosting and the KPH legacy redirect dies with it.
- Confirm in the Hostinger panel whether the mailbox is a standalone **Hostinger
  Email** subscription or bundled with the hosting plan, before changing any
  billing.
- Hostinger's panel may warn that the domain no longer uses its nameservers.
  That is expected and harmless while MX, SPF and DKIM resolve correctly.
