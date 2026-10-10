# Cinematic redesign: plan, ledger and Flow asset requests

Branch: `main` (one commit per task, nothing pushed). Both themes (`craft`, `precision`) are art-directed.
Run tools with node directly (the `&` in the parent folder breaks npm's shims):
`node node_modules/astro/astro.js build|check|preview` · `node node_modules/vitest/vitest.mjs run` · `node tests/e2e/smoke.mjs <preview-url>`
(set `BROWSER=firefox` or `webkit` for the other engines; run it against the built preview, not the dev server).

## Direction: "Site diary"

A builder's drawing set, not a magazine. Limestone ground, ironbark dark sections, the existing terracotta kept for
conversion actions only, and one signature motif: the **string line**, the taut line a builder sets work to.

| Token | Craft | Precision |
|---|---|---|
| Ground / paper / inset | `#f1eee8` / `#faf9f6` / `#e6e1d7` | `#eef0f1` / `#f8f9f9` / `#dfe3e5` |
| Ink / dark section | `#1f1c18` / `#26221d` | `#14181c` / `#1a1f24` |
| Accent / accent as text / accent on dark | `#c2410c` / `#a8380b` / `#e8a27c` | `#ea580c` / `#b6430a` / `#fb923c` |
| Linework (decorative) | blueprint `#5f7482`, timber `#b08968` | steel `#5b6770` |
| Display / body | Besley / Plus Jakarta Sans | Barlow Condensed (caps) / Inter |

Motion: four behaviours only (reveal, image mask, line-draw, parallax), 600–900 ms ease-out, CSS + one
`IntersectionObserver`. Off under `prefers-reduced-motion`. No animation library.

## Ledger

Rulings are decisions taken on the owner's behalf; each names its cost if wrong.

- [x] A1 Safety net: e2e runs on Windows; slider, "nearby" checker and menu assertions
- [x] A2 Tokens for both themes
- [x] A3 Self-hosted fonts, preload, metric-matched fallbacks (measured CLS 0.000–0.010 on a throttled connection)
- [x] A4 Primitives: Button, Badge, SectionHeading, Photo, global.css
- [x] A5 Motion system: `src/styles/motion.css`, `src/scripts/motion.ts`
- [x] A6 `Video.astro` + `video.ts` + `config/media.ts` (renders nothing video-related when the file is absent)
- [x] B1 Header + full-screen mobile menu
- [x] B2 Hero + trust strip
- [x] B3 Services
- [x] B4 Process
- [x] B5 Case study
- [x] B6 Recent projects (+ optional interlude)
- [x] B7 Pricing
- [x] B8 Reviews
- [x] B9 Area checker
- [x] B10 Quote form (styling only)
- [x] B11 FAQ
- [x] B12 Closing CTA, footer, call bar
- [x] B13 Sub-pages (PageHeader, all routes)
- [x] C1 Media pipeline (`media-src/flow/` → `public/videos/`)
- [x] C2 Hero video · C3 Closing video · C4 Interlude · C5 Before/after pair (Flow files supplied; see "Flow footage, as supplied")
- [x] D1 Responsive pass · D2 Accessibility · D3 Performance + `og:image`
- [x] E1 Regression (Chromium, Firefox, WebKit: smoke 12/12 in each)
- [x] E2 Polish, whole-branch review, report

### Rulings

- **Display face: Besley, not Fraunces.** The headline carries two ampersands and Fraunces' ornate `&` dominated it in a
  specimen; Besley's Clarendon forms read as trade signwriting. Cost if wrong: one font package and one token.
- **Three process steps kept.** The brief suggested four; the business config has three and a fourth would be invented copy.
- **Project cards stay non-links.** There are no project detail pages; inventing them would be fake routes.
- **A2–B13 landed as two commits, verified at the tip only.** The work was built as one pass across shared tokens, so
  per-task commits would have been reconstructed after the fact. Cost if wrong: coarser `git bisect`.
- **Header overlays the hero on the home page only.** Inner pages open on a light title band where a transparent header
  has nothing to sit on. Cost if wrong: one prop on `BaseLayout`.
- **Mobile menu is a native modal `<dialog>`.** Focus trap, Escape and focus return come from the browser instead of
  script. Cost if wrong: in browsers without `<dialog>` (Safari before 15.4, March 2022) the menu does not open; the
  header phone link, the call bar and the footer links still work.
- **Hero headline has no coloured phrase; services and projects carry no numbering.** Accent colour is reserved for
  conversion, and only the process (a real sequence) and the form steps are numbered. Cost if wrong: styling only.
- **Reviews moved from a dark band to the page ground.** The case study above it is the one dark section mid-page; two
  in a row flattened both. Cost if wrong: one section class.
- **Latin subset fonts only.** All site copy is English. Cost if wrong: add the `latin-ext` files to `fonts.css`.
- **Price table reads as a list below 640px.** A three-column table cut its last column off on phones. Cost if wrong:
  delete one media query.
- **The hero's phone button is hidden below 480px.** The fixed call bar already shows the same number one thumb away,
  and two phone buttons crowded the headline. Cost if wrong: delete one media query in `Hero.astro`.
- **The video pause button sits top-right, under the header.** Bottom-right collided with the call bar on phones and
  with the trust strip on desktop. Cost if wrong: one custom property (`--video-toggle-inset`).
- **No loop cross-fade in `tools/media.mjs`.** Reversed once the footage arrived — see "Flow footage, as supplied".
- **Pressing "Send my request" with a mouse or finger does not move focus to the button.** Moving focus cleared the
  edited field's error, the page shifted, and Safari dropped the tap. Keyboard focus is unchanged. Cost if wrong:
  delete one line in `quote-form.ts`.
- **The menu button takes focus before the menu opens.** Safari does not focus a clicked button, so the dialog had
  nothing to hand focus back to on close. Cost if wrong: none known.

### Final review (whole branch, fresh reviewer)

No critical findings. Fixed in one pass, each with a check that failed first (smoke suite 16/16 in Chromium, Firefox
and WebKit afterwards):

- Final: fixed menu links clipped on short screens (landscape phones) — smoke "menu links stay reachable on a short
  screen" RED→GREEN.
- Final: fixed share image emitted at 1200x1500 while the tags said 1200x630 — it is now cropped to 1.91:1 and the
  tags carry its real size (1000x525 from the stock photo, 1200x630 from a video poster) — smoke "share image is a
  1.91:1 card" RED→GREEN.
- Final: fixed clear home header following the page over light sections when the site script does not run — it is
  sticky only once `site.ts` has marked it ready — smoke "without JavaScript the clear home header stays with the
  hero" RED→GREEN.
- Final: fixed header text contrast over the hero photo (worst pixels 2.5:1) — the top shade now holds through the
  header's height; measured worst case 6.2:1 across both themes, both hero layouts, 390–1920px.
- Final: fixed the kitchen interlude that this plan promised but no page rendered — built, and checked with a
  synthetic clip (present with the clip, absent without it).
- Final: fixed reveal content printing blank — the reveal rules are screen-only — smoke "printing shows content that
  has not been scrolled to" RED→GREEN.
- Final: fixed (re-graded from minor) the hero video being scaled 12% with no drift while its still drifted; the
  media tool forcing 30 fps on 24 fps footage, ignoring a supplied poster and depending on the working directory;
  a hard-coded craft tint and a faux-bold heading in the precision theme; the pause button reading poorly on bright
  footage. Pointer tilt was removed: the card link covered the photo so it never fired, and it was not one of the
  four motion behaviours.
- Final: Ruling: the quote button's `mousedown` handler stands — the reviewer found no functional downside in three
  engines; on a phone the on-screen keyboard may stay up while a send error shows under the button — cost if wrong:
  a customer on a short phone has to dismiss the keyboard to read a send error (not checked on a real device).
- Final: minor (deferred): unused `reveal`/`parallax` props on `Photo.astro` and the `data-reveal='mask'` rules they
  drive; unused `align` prop on `SectionHeading.astro`; a dead `~` selector in `CaseStudy.astro`; unused tokens
  `--color-star`, `--color-timber`, `--color-warm`, `--font-mono`, `--overlay`.
- Final: minor (deferred): the hero's "Sample project" card picks the first featured project from an unsorted
  collection, so it can differ between builds (line predates the redesign).
- Final: minor (deferred): footer and breadcrumb links are 16px tall at phone width (29px pitch, which meets the
  WCAG 2.2 spacing exception); a taller hit area would be kinder.
- Final: minor (deferred): the clip list in `tools/media.mjs` repeats `src/config/media.ts`; a transcode that fails
  midway leaves a partial file the next build treats as present (the page falls back to the still at run time).
- Final: minor (deferred): on a slow, uncompressed connection the phone hero shifts once (CLS 0.02, target 0.05)
  when the service links under the headline arrive in a later chunk of HTML than the headline.

### Flow footage, as supplied

Three 10 s 1080p 24 fps clips and the matched before/after pair arrived. Checked after transcoding: video test all
PASS in Chrome, smoke 16/16 in Chromium, Firefox and WebKit, header text over the brightest part of the hero clip
7.5:1 or better in both themes, home LCP 1.7 s (phone) and 1.8 s (desktop) throttled.

- Ruling: `tools/media.mjs` now dissolves the last second of each clip into its first. None of the takes loops
  (first frame against last: 9–13 dB PSNR; after the change the join differs by one frame of motion, 25–26 dB) —
  cost if wrong: one second of every loop is a dissolve, and a take that already loops gets one it did not need.
- Ruling: the hero take is cut at 7.5 s (`end` in the clip list). After that the camera has carried the carpenter in
  behind the headline at desktop widths — cost if wrong: the loop is 6.5 s and the carpenter lowering the level is
  never shown; delete `end` to restore it.
- Ruling: below 960px the hero media is anchored at 74% across, so the slice a phone shows holds the carpenter and
  not the out-of-focus post in the foreground — cost if wrong: one CSS line in `Hero.astro`.
- Ruling: the builder's wrap in the hero clip carries lettering that is not real words. Kept: it is out of focus and
  under the hero shade — cost if wrong: a visitor who pauses on it sees nonsense print; fix by regenerating the take.
- Ruling: the before/after stills came as 16:9, not the 4:3 asked for. Used as they are; the slider shows the middle
  4:3 of each and the window, ceiling line and bench still line up — cost if wrong: none seen at 390–1440px.
- The posters are the frame each loop starts on, so the still and the first video frame match.
- The "Reozix" link in the demo ribbon was 16px tall on phones; it now has a 24px hit area. A stray `nojs.png` test screenshot was removed from the repo root.
- `docs/photo-credits.md` now lists the generated files; they stay under the "Sample project" labels.

### Frontend to lead store audit

Asked: is everything in the frontend working, connected and routed to the backend. There is no server: the
"backend" is `LocalLeadRepository` (the visitor's own browser storage). The audit covers the wiring up to that seam.

Checked on the built site: a static pass over all 19 pages (668 internal links, 1043 asset references, fragments,
label and ARIA ids, sitemap, structured data), then a 26-step browser run in Chromium, Firefox and WebKit: every
page loads with no failed request or error; header, phone menu, footer, call bar and in-page buttons by clicking;
service and suburb handed to the quote form; a full request with photos stored field for field and read back in
the console (contact links, photos, status, notes, filters, CSV); validation, photo rules, spam guard, rate limit,
blocked storage (no false confirmation), full storage; console settings reaching the public pages; counters;
clear and sign out. All 26 pass in the three engines. Smoke is now 17/17 in the three engines.

Fixed:

- The site address was `https://trades.reozix.com`, a domain with no DNS record, so on the live host every canonical
  link, the sitemap, the share image and the structured data pointed at nothing. Ruling: `site` now comes from
  `SITE_URL`, else Vercel's production domain, else the old value — cost if wrong: a non-Vercel host built without
  `SITE_URL` still gets the old address. Checked by building with Vercel's variable set; not checked on Vercel itself.
- `robots.txt` did not exist. It now names the sitemap. Ruling: nothing is disallowed, because the console is kept
  out of search by `noindex`, which a crawler cannot read on a page it is forbidden to fetch — cost if wrong: crawlers
  spend a request on `/console/`.
- The 404 page declared `/404/` as its canonical address and `og:url`. Both are gone from that page.
- `tools/relativize.mjs` left `data-src-small` root-absolute, so the sub-folder bundle could not load the 720p
  video on small screens. Checked by serving the bundle from `/demo/trades/` and crawling it at 390 and 1280px.
- Console: the Email action on a lead with no email was a link to `#`. It is now not a link.
- The page cross-fade was dropped, with a console error, on the first visit to each page in Chrome: the opt-in sat in
  a linked stylesheet that had not been applied when the new page started. It is now inline in the head (0 of 12
  first visits fade before, 12 of 12 after).

Left as they are, for a decision:

- No server. Requests never leave the visitor's browser, nobody is alerted, and the console sign-in is a demo.
  A real backend is a separate piece of work that needs a provider and credentials.
- "Email (for a copy of your request)" on the form: no copy is sent until there is a backend.
- "All reviews on Google" and the trust strip rating link go to `https://www.google.com/maps`, the placeholder in
  `business.ts`, because the sample business has no profile.
- A request sent from a service or area page records that page as its source but does not fill in the service or
  suburb for the customer.

## Google Flow asset requests

Save raw downloads to `media-src/flow/` (git-ignored) with the exact filenames below. I transcode them to
`public/videos/` (H.264, no audio, 1080p + 720p) and cut the poster frame. Until a file exists the site uses the
fallback named for it, so nothing is ever broken. AI footage is illustrative: fine while `demoMode` is on and the
"Sample" labels show; a real client replaces it with their own footage.

Settings for every video: **Veo, 16:9, 8–10 seconds, 1080p, no audio needed.** Generate 2–4 takes and keep the one with
the steadiest geometry and the calmest left side.

### FT-V1 · Hero (essential)

- Purpose: full-bleed background behind the home-page headline.
- Save as: `media-src/flow/ft-hero-site.mp4` → I produce `public/videos/ft-hero-site.mp4` and `src/assets/photos/hero-poster.jpg`.
- Optional: a still exported from the same take as `media-src/flow/ft-hero-site-poster.jpg` (used instead of the
  clip's first frame; the same `<name>-poster.jpg` convention works for the other clips).
- Fallback until then: split hero using the existing `hero.jpg`.

**Prompt**

> Premium architectural documentary footage, shot on a 35mm lens at f/2.8. Early morning on a residential building
> site in Western Sydney, Australia: a single-storey brick-veneer home with a new timber-framed rear extension —
> pine wall studs, noggins, top plate and roof trusses, silver builder's wrap on one wall, eucalyptus trees behind.
> One carpenter in a long-sleeve hi-vis orange work shirt, navy shorts, work boots and a tool belt stands side-on to
> camera. He holds a long spirit level against a stud, checks it, then makes a small pencil mark on the timber. He
> never looks at the camera. One continuous, very slow left-to-right dolly move, perfectly stabilised, no cuts. Low
> golden sunlight raking across the frame from the right, long soft shadows, muted warm natural colour grade, fine
> film grain.

- Composition: carpenter about two-thirds across the frame, in the right-hand part, framed head to knee. The left 45%
  of the frame stays calm, darker and low in detail (shadowed framing, soft-focus background) so a headline can sit
  there. Keep the top 15% simple (sky or roof line). Keep the bottom 20% low in contrast.
- Continuity: rigid, architecturally correct geometry; studs perfectly straight and evenly spaced; the level stays
  straight and the same length; hands have five fingers; the first and last frames are nearly identical so it can loop.
- Avoid: any text, signage, logos, watermarks or captions; warped or bending timber; tools that morph; extra or fused
  fingers; distorted faces; additional workers; cranes or high-rise buildings; American-style houses, vinyl siding or
  basements; jump cuts; fast camera moves; lens flares; heavy filters; a CGI or video-game look; dust bursts.
- Loop: the last second is dissolved into the first when transcoding, so the take does not have to loop by itself.

### FT-V2 · Closing call-to-action (essential; fallback exists)

- Purpose: background for the closing "plan your project" band on every page that has one.
- Save as: `media-src/flow/ft-craft-joinery.mp4` → `public/videos/ft-craft-joinery.mp4`, poster `src/assets/photos/cta-poster.jpg`.
- Fallback until then: `service-carpentry-and-joinery.jpg` under a charcoal overlay.

**Prompt**

> Close-up craft documentary footage, 50mm lens at f/2, shallow depth of field. A tidy Australian joinery workshop in
> late afternoon. A spotted gum hardwood benchtop fills the lower frame; hand tools hang out of focus on a wall rack
> behind. A forearm and hand — rolled grey work-shirt sleeve, no jewellery or watch — wipe a folded cotton cloth along
> the grain in one long, steady stroke, applying oil. The timber deepens in colour and takes on a soft sheen behind
> the cloth. No face in frame. Continuous, very slow left-to-right slider move, low to the bench surface. A single
> warm window light from the right, low-key, gentle highlights on the oiled timber.

- Composition: the hand and cloth sit in the lower-right third. The left half is dark negative space. Nothing bright
  in the top-left.
- Continuity: five fingers at all times; the cloth stays one piece; the grain pattern is fixed to the timber and does
  not swim; the bench edge is straight; start and end frames similar enough to loop.
- Avoid: text, logos or product labels; finger errors; a second hand appearing; shifting grain; morphing tools; faces;
  sparks, power tools or flying sawdust; fast movement; harsh light; over-saturated orange; a CGI or plastic look.

### FT-V3 · Kitchen interlude (optional)

- Purpose: one full-bleed, silent pause between the case study and Recent work (`.interlude` in `src/pages/index.astro`).
  The section is omitted while the file is absent.
- Save as: `media-src/flow/ft-showcase-kitchen.mp4` → `public/videos/ft-showcase-kitchen.mp4`, poster `src/assets/photos/showcase-poster.jpg`.

**Prompt**

> Architectural interior film, 24mm lens at f/4, verticals perfectly level. A renovated open-plan kitchen and living
> area in a contemporary Australian family home, mid-morning. A pale honed-stone island bench with a waterfall end,
> full-height oak veneer cabinetry with shadow-line handles, a plain white splashback, matt black tapware, oak
> floorboards, and stacker doors opening to a timber-ceilinged alfresco and a garden. Simple, lived-in styling. No
> people. A very slow lateral tracking move, left to right, at chest height, parallel to the island. Soft natural
> daylight, true-to-life colour.

- Composition: island and joinery centre-right; the lower-left quarter stays calm for a title.
- Continuity: rigid geometry, straight cabinet lines, consistent reflections, loop-compatible start and end.
- Avoid: text, logos, brand names or lettered artwork; people or pets; warped cabinetry; flicker; impossible
  reflections; wide-angle distortion; mansion-scale luxury; fast movement; HDR look; CGI look.

### FT-I1 · Matched before/after stills (optional)

The current before and after photos are two different kitchens. A matched pair makes the slider honest-looking, and it
stays labelled "Sample project".

- Settings: image generation, 4:3, at least 1600×1200.
- Save as: `media-src/flow/project-penrith-kitchen-renovation.jpg` (after) and
  `media-src/flow/project-penrith-kitchen-renovation-before.jpg` (before).

**Step 1 — generate the AFTER image**

> Interior architectural photograph, 24mm, level verticals, soft daylight. A renovated open-plan kitchen in an
> Australian family home: stone island bench with a waterfall end in the centre, oak veneer cabinetry along the back
> wall, a window above the sink on the left wall, oak floorboards, and the living area visible on the right where a
> wall has been removed. No people, no text, no logos.

**Step 2 — edit that image into the BEFORE image** (same camera position, same window, same ceiling)

> Same room, same camera position, window and ceiling, before renovation: dated 1990s orange-toned laminate cabinets,
> beige laminate benchtops, cream wall tiles, vinyl flooring, an old white freestanding stove, a solid wall on the
> right closing the room in, no island bench, flatter and duller light. No people, no text, no logos.
