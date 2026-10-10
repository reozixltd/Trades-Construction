# Cinematic redesign: plan, ledger and Flow asset requests

Branch: `main` (one commit per task, nothing pushed). Both themes (`craft`, `precision`) are art-directed.
Run tools with node directly (the `&` in the parent folder breaks npm's shims):
`node node_modules/astro/astro.js build|check|preview` · `node node_modules/vitest/vitest.mjs run` · `node tests/e2e/smoke.mjs`.

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
- [ ] A2 Tokens for both themes
- [ ] A3 Self-hosted fonts, preload, metric-matched fallbacks (target CLS < 0.05)
- [ ] A4 Primitives: Button, Badge, SectionHeading, Photo, global.css
- [ ] A5 Motion system: `src/styles/motion.css`, `src/scripts/motion.ts`
- [ ] A6 `Video.astro` + `video.ts` + `config/media.ts` (renders nothing video-related when the file is absent)
- [ ] B1 Header + full-screen mobile menu
- [ ] B2 Hero + trust strip
- [ ] B3 Services
- [ ] B4 Process
- [ ] B5 Case study
- [ ] B6 Recent projects (+ optional interlude)
- [ ] B7 Pricing
- [ ] B8 Reviews
- [ ] B9 Area checker
- [ ] B10 Quote form (styling only)
- [ ] B11 FAQ
- [ ] B12 Closing CTA, footer, call bar
- [ ] B13 Sub-pages (PageHeader, all routes)
- [ ] C1 Media pipeline (`media-src/flow/` → `public/videos/`)
- [ ] C2 Hero video · C3 Closing video · C4 Interlude (optional) · C5 Before/after pair (optional): **waiting on Flow files**
- [ ] D1 Responsive pass · D2 Accessibility · D3 Performance + `og:image`
- [ ] E1 Regression (Chromium, Firefox, WebKit) · E2 Polish + report

### Rulings

- **Display face: Besley, not Fraunces.** The headline carries two ampersands and Fraunces' ornate `&` dominated it in a
  specimen; Besley's Clarendon forms read as trade signwriting. Cost if wrong: one font package and one token.
- **Three process steps kept.** The brief suggested four; the business config has three and a fourth would be invented copy.
- **Project cards stay non-links.** There are no project detail pages; inventing them would be fake routes.

## Google Flow asset requests

Save raw downloads to `media-src/flow/` (git-ignored) with the exact filenames below. I transcode them to
`public/videos/` (H.264, no audio, 1080p + 720p) and cut the poster frame. Until a file exists the site uses the
fallback named for it, so nothing is ever broken. AI footage is illustrative: fine while `demoMode` is on and the
"Sample" labels show; a real client replaces it with their own footage.

Settings for every video: **Veo, 16:9, 8 seconds, 1080p, no audio needed.** Generate 2–4 takes and keep the one with
the steadiest geometry and the calmest left side.

### FT-V1 · Hero (essential)

- Purpose: full-bleed background behind the home-page headline.
- Save as: `media-src/flow/ft-hero-site.mp4` → I produce `public/videos/ft-hero-site.mp4` and `src/assets/photos/hero-poster.jpg`.
- Optional: a still exported from the same take as `media-src/flow/ft-hero-site-poster.jpg`.
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
- Loop: I cross-fade the last 0.7 s into the first when transcoding, so a near-matching start and end is enough.

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

- Purpose: one full-bleed pause between the case study and Recent work. The section is omitted while the file is absent.
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
