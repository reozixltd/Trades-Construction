# Design review: UI/UX Pro Max pass

Date: 2 October 2026 · Tools: `ui-ux-pro-max` and `design` skills, installed in `.claude/skills/` with `npx ui-ux-pro-max-cli init --ai claude`.

**Precedence:** the skill's generic design-system output suggested a green palette and Inter. The Stitch *Architectural Craft* tokens stay, because the skill's own rule is that the project's existing system wins. These findings use the skill's UX rules, the product and landing patterns, and the Astro stack guidance.

## Matches used

| Query | Match | What it says |
|---|---|---|
| `home services contractor` (product) | Home Services (Plumber/Electrician) | Conversion-Optimized + Trust; trust blue/slate + safety orange (our slate + terracotta fits) |
| `hero social proof trust local service` (landing) | Trust & Authority + Conversion; Hero + Testimonials + CTA | Proof (certs, stats) straight after the hero; social proof **before** the CTA; low-friction form |
| `construction contractor …` (design system) | Anti-patterns | **No map**, **Hidden reviews** |
| `image lazy loading layout shift` (ux) | Lazy Loading; Content Jumping (High) | Lazy-load below the fold; reserve `aspect-ratio` for media |
| `form progressive disclosure inline validation` (ux) | Inline Validation; Focusable Error Summary (High); Submit Feedback (High) | Validate on blur; error summary that takes focus; loading → success state |
| `touch target spacing mobile` (ux) | Touch Spacing | ≥8px between adjacent targets |
| `image optimization assets` (astro stack) | Optimize with astro:assets (High); `<Picture>`; preload critical assets | Use `<Picture>` with modern formats; preload the hero (LCP) image |

## Findings → changes

| # | Severity | Finding | Change |
|---|---|---|---|
| 1 | High | Every image slot is a placeholder, so the site doesn't look like a trades business | A photo slot system: drop `<slot>.jpg` into `src/assets/photos/` and it renders as an optimised AVIF/WebP `<Picture>` with fixed aspect ratio. The labelled placeholder appears only when a file is missing. `docs/photo-brief.md` lists every slot. |
| 2 | High | Hero image is hidden on phones, where most visitors are | Show a 16:10 hero photo on mobile under the CTAs; preload it as the LCP image |
| 3 | High | Service cards have no imagery | Add a photo to each service card and a wide photo on each service page |
| 4 | High | Anti-pattern: no map of the service area | Inline SVG coverage map (no external embed, works offline and in previews) on the area checker |
| 5 | High | Anti-pattern: reviews sit mid-page, away from the form | Featured review beside the quote form (social proof before the CTA) |
| 6 | High | Form validates only on submit; no error summary; no sending state | Blur validation on required fields, a focusable error summary with links to the fields, and a "Sending…" state with `aria-busy` |
| 7 | Medium | No explicit "how it works" funnel (pattern: Funnel / 3-step conversion) | 3-step band after services: Send details & photos → Price range or site visit → Written quote |
| 8 | Medium | Area pages and About have no local imagery | Photo slot per area page and for the owner portrait |
| 9 | Low | Card hover feedback is colour-only | Subtle 200ms lift on clickable cards (respects reduced motion) |

Kept as is: tap targets (44px, fixed in the last pass), focus rings, reduced motion, 375px/1280px layouts with no horizontal scroll, and AA contrast tokens.
