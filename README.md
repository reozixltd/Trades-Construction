# Form & Trade — Trades & Construction demo site

The Reozix demo site for the **Trades & Construction** industry kit. It is a static Astro 5 + TypeScript site with a working quote flow and an owner console. The visual design follows the Stitch *Architectural Craft* design system, with *Architectural Precision* available as a second theme.

The full spec, including how each checklist item maps to code, is in [`docs/spec.md`](docs/spec.md).

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # 53 unit tests (Vitest)
npm run check      # Astro + TypeScript type check
npm run build      # static output in dist/
npm run preview &  # serve dist/ on :4321
npm run e2e        # Playwright smoke test against the preview
```

The console demo login is shown on `/console/`. It uses `owner@demo.formandtrade` / `demo1234`.

## Where things live

| You want to change… | Edit |
|---|---|
| Business name, licences, ABN, phones, hours, areas, stats, theme, demo mode | `src/config/business.ts` |
| "How we price" models | `src/config/pricing.ts` |
| Header/footer links | `src/config/navigation.ts` |
| Services, area pages, projects | Markdown in `src/content/services`, `areas`, `projects` |
| Reviews, FAQs | `src/content/reviews.json`, `faqs.json` |
| Photos | Drop `<slot>.jpg` into `src/assets/photos/`. Slots are in `src/config/photo-slots.ts`; run `npm run photos:status` for the shot list and gaps |
| "How it works" steps | `src/config/process.ts` |
| Service-area map | `lat`/`lng` on each area and `base` in `business.ts` |
| Colours, fonts, spacing, radius, shadows | `src/styles/tokens.css` (the only place raw values live) |
| A page section | `src/components/sections/*` |
| A primitive (button, badge, icon…) | `src/components/ui/*` |
| Business logic (area lookup, validation, lead storage, CSV, schema) | `src/lib/*`, which is unit-tested |
| Browser behaviour | `src/scripts/*`, which only wires the DOM to `lib/` |

## Setting up a real client

1. In `src/config/business.ts`, set every field and set `demoMode: false`. This removes all "sample" labels and the demo ribbon, and lets the Google rating appear in the schema.
2. Replace the content Markdown and JSON. Put real job photos in `src/assets/projects/` and swap `Placeholder` for `<Image>`.
3. Pick `theme: 'craft'` or `'precision'`.
4. Production lead storage: write an `HttpLeadRepository` that implements `LeadRepository` (`src/lib/leads/repository.ts`). Return it from `getLeadRepository()` in `src/lib/leads/index.ts`. No form or console code changes.
5. Wire owner alerts (SMS/email) on the server side of that repository. This is still open: the provider hasn't been chosen.

## Demo limitations (by design)

- Leads, settings and counters are stored in the browser (`localStorage`). They are only visible in the same browser that submitted them, which is fine for a walkthrough but not for production.
- Owner SMS/email alerts, customer confirmation emails, real auth, and editing content from the console are **planned**. See spec §10.
- Demo photos are Unsplash stock (free licence; credits in `docs/photo-credits.md`), and projects are labelled "Sample". A live client must use their own job photos for projects.

## Static preview bundle

`node tools/relativize.mjs` copies `dist/` into `dist-static/`, rewriting links so the site works from any sub-folder. This is used for hosted previews; normal deploys use `dist/`.

## Design skills

`.claude/skills/` holds **UI/UX Pro Max** and its **design** skill bundle (MIT, installed with `npx ui-ux-pro-max-cli init --ai claude`). Claude Code picks them up automatically in this repo. The last review is in `docs/design-review.md`. To query the rules directly:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form inline validation" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "image optimization" --stack astro
```
