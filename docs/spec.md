# Trades & Construction Demo Site: Spec

Status: v0.3 · 2 October 2026 · built (see §14–15)
Owner: Reozix · Reviewers: Roby (technical scope), Rownak (delivery and cost), final approver (positioning and pricing)
Inputs: the Stitch export *Form & Trade* (`architectural_craft` and `architectural_precision` DESIGN.md files, the home-page mock and the logo), and the doc *Trades & Construction — Must-Have Website Checklist*

---

## 1. Goal

Build the Trades & Construction demo site (working name `trades.reozix.com`) so affiliates can show a builder, renovator or handyman a real, working site on a phone in about 3 minutes.

Done means:

1. Every **Must** item in the checklist works in the demo (traceability in §9).
2. Anything else is clearly labelled PLANNED.
3. A new client can be set up by editing **one config file and the content folder**, with no component changes.
4. The code is modular, typed and tested, so another developer can change one module without reading the rest.

Non-goals for this build: real SMS sending, payments, job-management integrations, and editing content from the console. These are Should/Later items (§10).

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **Astro 5 + TypeScript (strict), static output** | Pages ship as plain HTML with near-zero JS, so mobile PageSpeed 90+ is realistic. Components are `.astro` files with scoped CSS, so modules are isolated. Hosts on any static host or CDN. |
| D2 | **Plain CSS on design tokens, no Tailwind CDN** | The Stitch export loads Tailwind's runtime CDN, which is slow and not meant for production. Tokens live in one file as CSS custom properties, and components use them through scoped styles. |
| D3 | **Two themes from the two DESIGN.md files** | `craft` (Plus Jakarta Sans, terracotta accent) is the default and matches the mock. `precision` (Barlow Condensed + Inter, safety-amber accent) is a second skin. A client picks one with a single config value, which white-labels the site with no code change. |
| D4 | **One business config file** (`src/config/business.ts`) | Name, licences, ABN, phone, hours, callback promise, emergency setting, service areas and stats all come from here. The trust strip, footer, schema, header and quote form all read it, so licence details can never drift between pages. |
| D5 | **Content collections** for services, areas, projects, reviews and FAQs | Typed with zod schemas, so a missing licence field or a broken photo reference fails the build, not the live site. |
| D6 | **Lead storage behind an interface** (`LeadRepository`) | The demo uses `LocalLeadRepository` (browser storage, demo only). Production swaps in `HttpLeadRepository` pointing at an API, and no form or console code changes. |
| D7 | **Owner console = client-side mini app at `/console`** | Lead inbox, status pipeline, notes, CSV export and business settings (emergency toggle, callback promise). Demo sign-in with labelled demo credentials. |
| D8 | **Demo business: "Form & Trade Building Co.", Western Sydney, NSW** | Keeps the Stitch brand. Located in NSW because NSW advertising rules are confirmed. A multi-trade builder/renovator/repairer shows emergency jobs, licensing, a portfolio and photo quotes in one site. |
| D9 | **Sample data is visibly sample** | `demoMode: true` shows a "Sample business, demo content" ribbon. Licence and ABN use obviously fake numbers. Phone numbers use the ACMA fictional ranges (`02 5550 xxxx`, `0491 570 xxx`). Stats and reviews are labelled sample. This avoids ACL issues and matches the café kit's "The Urban Fork is fictional" note. |
| D10 | **Photos: labelled placeholders** | No stock images that could be mistaken for real jobs (ACL: no fake before/after). Placeholders are blueprint-style SVG panels in the brand palette, captioned "Job photo". Real clients drop real photos into `src/assets/projects/`. |

## 3. Improvements over the Stitch design

The Stitch mock is visually strong but written for a US luxury guild. Changes:

| Area | Stitch mock | This build |
|---|---|---|
| Market | US (Portland OR, ZIP, $, "Guild") | Australia: suburbs and postcodes, AUD incl./excl. GST, ABN, NSW licence |
| Compliance | No licence number anywhere | Licensee name + licence class/number in the trust strip and on every page's footer; ABN; no regulator logos |
| Claims | "2,400+ works", "4.98 rating", "Zero hidden markups", "$5M insurance" | Stats come from config and are labelled sample in demo mode; wording avoids absolute promises |
| Pricing | "Fixed GMP", "Cost + 14%", "$125/hr" jargon tiers | "How we price" in plain words: fixed-price quotes, or a call-out fee + hourly rate for repairs, shown as full "from" prices (NSW: no partial prices) |
| Mobile CTA | Header button only | Sticky Call / Get a quote bar on mobile; tap-to-call in the header |
| Quote intake | 3-step "investment tier" form, no photos, ZIP | Two-step form: 3 required fields that always submit, then optional details plus up to 5 photos; suburb check; urgency |
| Service area | None | Suburb checker + one page per main suburb |
| Emergency | "<2-Hour dispatch" stat | Emergency banner + after-hours number shown only when the owner switches it on |
| Owner side | None | Owner console: lead inbox, statuses, notes, CSV, settings |
| Performance | Tailwind CDN, Material Symbols font (~300KB), remote images | Static HTML, scoped CSS, inline SVG icons (only those used), no runtime framework |
| Accessibility | Low-contrast labels, a drag-only slider | AA contrast tokens, 44px tap targets, labelled fields, keyboard-operable before/after slider (range input) |
| Navigation | 6 items + mega menu | Services · Projects · Areas · About · Contact, plus the Get a quote button |

## 4. Information architecture

```
/                       Home
/services/              All services
/services/[slug]/       One page per service (4)
/areas/                 Areas we cover + suburb checker
/areas/[slug]/          One page per main suburb (4)
/projects/              Project gallery with service filter
/about/                 Owner, licences, insurance, years in trade
/contact/               Phone, hours, short form
/quote/                 Full two-step quote request (?service=slug preselects)
/privacy/  /terms/      Policies
/console/               Owner console (demo sign-in)
/404
```

**Home page sections, in order:** Hero (trade + area headline, CTAs, callback promise) → Trust strip → Services grid → Featured case study (before/after) → Recent projects → How we price → Reviews → Suburb checker → Quote form (short) → FAQ → Final CTA.

## 5. Architecture

```
trades-site/
├─ docs/spec.md
├─ src/
│  ├─ config/
│  │  ├─ business.ts        ← ONE file per client: identity, licences, contact, hours, areas, stats, theme
│  │  ├─ pricing.ts         ← "How we price" models
│  │  └─ navigation.ts      ← header/footer links
│  ├─ content/              ← content collections (Markdown + JSON), schemas in content.config.ts
│  │  ├─ services/*.md
│  │  ├─ areas/*.md
│  │  ├─ projects/*.md
│  │  ├─ reviews.json
│  │  └─ faqs.json
│  ├─ styles/
│  │  ├─ tokens.css         ← design tokens, both themes
│  │  └─ global.css         ← reset, base type, layout primitives (.container, .stack, .grid)
│  ├─ components/
│  │  ├─ ui/                ← stateless primitives: Button, Badge, Card, Icon, Field, SectionHeading, Placeholder
│  │  ├─ layout/            ← Header, Footer, MobileCallBar, EmergencyBanner, DemoRibbon, TrustStrip, Seo
│  │  └─ sections/          ← page sections built from ui/: Hero, ServicesGrid, CaseStudy, ProjectGrid,
│  │                           Pricing, Reviews, AreaChecker, QuoteForm, Faq, CtaBand
│  ├─ layouts/BaseLayout.astro
│  ├─ lib/                  ← framework-free TypeScript, unit-tested
│  │  ├─ areas.ts           ← normalise + look up suburb/postcode → covered | nearby | not covered
│  │  ├─ format.ts          ← phone tel: links, AUD, dates
│  │  ├─ schema.ts          ← LocalBusiness JSON-LD from business config
│  │  ├─ leads/
│  │  │  ├─ types.ts        ← Lead, LeadStatus, LeadInput
│  │  │  ├─ validation.ts   ← step-1/step-2 validation, photo limits
│  │  │  ├─ repository.ts   ← LeadRepository interface
│  │  │  └─ local-repository.ts ← demo implementation (browser storage, safe fallbacks)
│  │  └─ settings.ts        ← owner-editable settings (emergency, callback promise) with config defaults
│  ├─ scripts/              ← small client modules, one per interactive island
│  │  ├─ quote-form.ts  area-checker.ts  before-after.ts  project-filter.ts
│  │  ├─ live-settings.ts   ← applies owner settings (emergency banner, callback text) on page load
│  │  └─ console/ app.ts  inbox.ts  lead-detail.ts  settings-panel.ts  csv.ts
│  └─ pages/                ← thin: compose layout + sections, no business logic
└─ tests/  areas.test.ts  validation.test.ts  repository.test.ts  csv.test.ts  schema.test.ts
```

**Rules that keep it maintainable**

1. Pages compose sections; sections compose ui primitives. No page contains styling beyond layout.
2. No hard-coded business facts in components. Everything comes from `business.ts` or content.
3. No raw colour, font or spacing values outside `tokens.css`. Components use `var(--…)`.
4. Logic lives in `src/lib` (pure, tested). `src/scripts` only wires DOM events to lib functions.
5. Interactive islands are progressive: links and `tel:` work with JS off. The quote form shows the phone number if storage is unavailable.
6. One component per file, under ~150 lines. If it grows past that, split it.

## 6. Design system mapping

Tokens follow the DESIGN.md files exactly; the theme sets the values.

| Token | craft (default) | precision |
|---|---|---|
| `--color-ink` | #0F172A Structural Slate | #0F172A |
| `--color-accent` | #C2410C Fired Terracotta (hover #9A3412) | #EA580C Safety Amber (hover #C2410C) |
| `--color-warm` | #D97706 Tooling Amber | #D97706 Site Amber |
| `--color-muted` | #64748B Mortar Slate | #475569 |
| `--color-canvas` / `--color-surface` / `--color-inset` | #F8F9FA / #FFFFFF / #F1F5F9 | #F8FAFC / #FFFFFF / #F1F5F9 |
| `--color-line` / `--color-line-strong` | #E2E8F0 / #CBD5E1 | same |
| `--font-display` / `--font-body` | Plus Jakarta Sans / Plus Jakarta Sans | Barlow Condensed / Inter |
| Radius | 4px controls, 8px cards | same |
| Elevation | hairline borders; L1 / L2 / L3 shadows as specified | same, flatter L1 |
| Inputs | 44px height (field-ready), slate focus ring | 44px (raised from 40px for tap targets) |

Type scale: display 56/64 (mobile 36/44), headline-lg 32/40 (mobile 26/34), headline-md 24/32, headline-sm 20/28, title 16/24, body-lg 18/28, body 15/24 (16px on inputs to stop iOS zoom), body-sm 13/20, label 12/16 (+0.04em), label-sm 11/14 (+0.06em, uppercase).

Grid: 4 / 8 / 12 columns at <768 / 768–1199 / 1200+. Margins 16 / 32 / 40px. Max width 1280px for marketing pages (the 1440px in DESIGN.md is for dense app screens).

Domain components carried over from the design system: **Spec metric tiles** (stats), **status badges** (lead statuses, project tags), **blueprint line-item rows** (console lead table, project spec list), **milestone track** (the "what happens next" steps after a quote request).

## 7. Key behaviours

**Quote form (two-step)**
- Step 1, always submittable: name, mobile (AU format, 04xx or landline), "What do you need done?" (10–1000 characters).
- Step 2, optional ("Add details — helps us quote faster"): service (preselected from `?service=`), suburb or postcode, urgency (Emergency / This week / Flexible / Just planning), best time to call, property type, up to 5 photos (JPEG/PNG/HEIC/WebP, ≤10MB each; downscaled client-side to ≤1600px for storage in the demo).
- On submit: validate → save via `LeadRepository` → show confirmation that restates the callback promise and the "what happens next" track. Suburb outside the area is accepted and flagged `outOfArea`.
- Spam: hidden honeypot field + minimum 3 seconds on the form + max 5 submissions per browser per hour (demo).
- Consent line linking the privacy policy.

**Suburb checker:** input suburb or postcode → `covered` (lists the area page), `nearby` (within the config's "ask us" list), or `not-covered` (shows the phone number: "call us, we may still help").

**Emergency mode:** config default + owner override in the console. When on: red-iron banner above the header with the after-hours number, and an "Emergency" urgency option shown first in the form. When off, both are hidden.

**Owner console (demo)**
- Sign-in with shown demo credentials (no real auth in the demo; production uses the platform's auth).
- Inbox: newest first, urgency badge, suburb, service, photo count, status; filter by status.
- Lead detail: all fields, photos, one-tap Call / SMS / Email links, status pipeline (New → Contacted → Site visit booked → Quoted → Won / Lost), notes with timestamps.
- CSV export of all leads.
- Settings: emergency toggle, callback promise text. These apply to the public site straight away in the same browser.
- "Load sample leads" and "Clear demo data" buttons for affiliate demos.

## 8. SEO, compliance, performance

- `Seo` component per page: unique title/description, canonical, Open Graph.
- JSON-LD `HomeAndConstructionBusiness` from config: name, phone, ABN as `taxID`, `areaServed`, hours, aggregate rating only when real reviews exist (off in demo mode).
- Licence block (licensee name, each licence class + number, ABN) in the footer of every page and in the trust strip. Trading name always next to the licensed name.
- No regulator logos. Prices are full "from" amounts with GST status stated.
- Upload reminder in the console and form: "Use real, unedited photos of your own work."
- Budgets: HTML+CSS ≤ 60KB gzipped per page; JS ≤ 15KB except the console; fonts preconnected, `display=swap`; images WebP, lazy-loaded below the fold.
- Accessibility: WCAG 2.1 AA contrast, focus rings, skip link, labelled fields, `aria-live` form status, 44px tap targets, reduced-motion respected.

## 9. Checklist traceability (all Musts)

| Checklist Must | Where it lives |
|---|---|
| Trade + area headline | `sections/Hero` ← `business.headline` |
| Tap-to-call header + sticky mobile bar | `layout/Header`, `layout/MobileCallBar` |
| Callback promise near CTA (owner-editable) | `Hero`, `QuoteForm` ← `lib/settings` |
| Trust strip (name, licence, ABN, insured, years, rating) | `layout/TrustStrip` |
| Emergency toggle + banner | `layout/EmergencyBanner`, `scripts/live-settings`, console Settings |
| One page per service, FAQs, quote button | `pages/services/[slug]`, `content/services` |
| Full "from" price per service | `content/services` (`priceFrom`, `priceNote`), `sections/Pricing` |
| Suburb checker | `sections/AreaChecker`, `lib/areas` |
| Service-area pages | `pages/areas/[slug]`, `content/areas` |
| Project gallery, before/after | `pages/projects`, `sections/ProjectGrid`, `sections/CaseStudy` |
| Reviews + Google link | `sections/Reviews`, `content/reviews.json` |
| About (licence, insurance, years) | `pages/about` |
| Contact page | `pages/contact` |
| Privacy + terms | `pages/privacy`, `pages/terms` |
| Two-step form, photo upload, out-of-area flag | `sections/QuoteForm`, `scripts/quote-form`, `lib/leads/*` |
| Owner alert | Demo: console inbox + new-lead badge. **SMS/email = PLANNED** (needs provider, open decision) |
| Customer confirmation | On-screen confirmation. **Email = PLANNED** (needs mail provider) |
| Spam protection | honeypot + timing + rate limit in `lib/leads/validation` |
| Quote button pre-fills service | `/quote?service=slug` |
| Call/form tracking counts | `lib/analytics.ts` → console counters (tel clicks, submissions) |
| Lead inbox, statuses, one-tap actions, CSV | `scripts/console/*` |
| Edit services / areas / projects / reviews from console | **PLANNED (Phase 2)**: Git-based CMS (e.g. Keystatic) over the same content folder; no component changes needed |
| Business details single source | `config/business.ts` (+ console overrides for emergency and callback) |
| Owner login, staff role | Demo sign-in; **real auth = platform** |
| Licence on every page, trading name rule, multiple licences, no regulator logos, ABN | `Footer`, `TrustStrip`, `business.licences[]` |
| ACL guardrails | Sample labelling, upload reminder, no fabricated ratings in schema |
| Privacy policy + consent | `pages/privacy`, consent line in the form |
| LocalBusiness schema, unique meta, sitemap | `lib/schema`, `layout/Seo`, `@astrojs/sitemap` |
| Mobile PageSpeed 90+, WebP | Static output, budgets in §8 |
| SSL, backups, uptime | Hosting / Care Plan (outside the codebase) |
| Accessibility AA | Tokens + components (§8) |

## 10. Out of scope / PLANNED

Quote builder (PDF quotes), review-request SMS, missed-call text-back, online booking, ServiceM8/Tradify/Fergus/simPRO sync, Stripe deposits, AI quote drafts, customer portal, multi-location franchise.

## 11. Testing

- **Unit (Vitest):** `areas` lookup (case, spacing, postcode vs suburb, nearby, unknown), lead validation (each field, AU phone formats, photo limits, honeypot/timing), `LocalLeadRepository` (create, list order, update status, notes, storage unavailable), CSV escaping, schema output (no rating in demo mode).
- **Build checks:** `astro check` (types), `astro build` fails on any content schema error.
- **Smoke (Playwright):** home at 375px and 1280px renders the trust strip and licence number; quote form submits with step 1 only; submitted lead appears in the console; emergency toggle shows the banner on the home page.

## 12. Setting up a new client

1. Copy the repo. Edit `src/config/business.ts` (name, licences, ABN, phones, hours, areas, theme, `demoMode: false`).
2. Replace the Markdown in `src/content/services`, `areas` and `projects`, and the photos in `src/assets/projects/`.
3. Replace `reviews.json` with real reviews (or leave it empty, and the section hides).
4. Swap `LocalLeadRepository` for `HttpLeadRepository` in `src/lib/leads/index.ts`.
5. `npm run build` → deploy `dist/`.

## 13. Open questions (from the checklist)

- SMS/email provider for owner alerts and customer confirmations (Rownak)
- Where lead photos are stored in production, AU region (Roby)
- Reuse of the café platform's console and auth vs. this console (Roby)
- VIC/WA/SA/TAS advertising rules before selling outside NSW/QLD (Rownak)
- Package names and AUD prices (final approver)

## 14. Build notes (v0.2)

Built as specified, with these changes after an independent code review:

- **ACL:** in demo mode, every sample review, project, case study and stat is labelled "Sample". Absolute promises were removed ("finished on the date we agree", "no surprises", "fully insured", warranty as a selling point). "Free quote" became "Get a quote", because repairs carry a call-out fee.
- **Licensing:** the trust strip and the quote page now show the licensee name together with "trading as" the trading name.
- **Emergency mode:** all 24/7 and after-hours elements follow the owner's toggle. A pre-paint script stops the banner flashing on page load.
- **Reliability:**
  - If browser storage is unavailable, the form says so and shows the phone number instead of a false confirmation.
  - Every error shows a tap-to-call fallback.
  - Photos the browser can't process (HEIC outside Safari) are flagged to both the customer and the owner.
- **Suburb checker:** a typed suburb name now takes priority over a conflicting postcode.
- **Accessibility:** the console tabs work with arrow keys, Home and End. Tap targets are 44px. JS scrolling respects reduced motion. The photo picker shows a focus ring. Star ratings are announced.
- **Code structure:**
  - Pricing models moved to `config/pricing.ts`.
  - Emergency copy, state and base suburb moved to `business.ts`.
  - `QuoteForm` was split into `quote/PhotoField` and `quote/QuoteDone`.
  - Demo-only seeding is now outside the `LeadRepository` interface.
  - Storage keys are exported from their owning modules.
  - JSON-LD is escaped through `jsonLd()`.

Known follow-ups:

- Some pages still carry their own layout CSS (about, contact, quote, service detail, console). Extract it into sections when those pages next change.
- The demo placeholder gradients use raw colours, which is acceptable because they are demo artwork only.

**Tests:** 49 unit tests (Vitest). A 9-step Playwright smoke test covers 375px and 1280px layouts, licence display on every page, the suburb checker, the quote flow, the console and the emergency toggle.

## 15. v0.3: photos and UI/UX Pro Max review

- **Photo slot system** (`config/photo-slots.ts`, `lib/photos.ts`, `ui/Photo.astro`): 17 slots covering the hero, owner, 4 services, 6 projects plus a before shot, and 4 areas. Files are found automatically and served as AVIF/WebP `<Picture>` with responsive widths, a fixed aspect ratio (no layout shift), lazy loading, and an eager, high-priority hero. Missing files fall back to the labelled placeholder.
- **Demo photos:** Unsplash, free licence (`docs/photo-credits.md`). The shot list for a real client is in `docs/photo-brief.md`.
- **Design review** (`docs/design-review.md`), run with UI/UX Pro Max:
  - Added the service-area map (`ServiceAreaMap`, `lib/geo.ts`, tested).
  - Added the "How it works" funnel (`HowItWorks`, `config/process.ts`).
  - Added a featured review beside the quote form.
  - The form now validates on blur, shows a focusable error summary, and has a sending state.
  - Service and area cards have photos and a hover lift.
  - The hero photo now shows on mobile.
- **Fix:** an Astro compiler quirk emitted a stray link after a `<template>` that contained expressions. The suburb checker now uses hidden `[data-tpl]` blocks instead.
- **Tests:** 53 unit tests and the 9-step smoke test pass.
