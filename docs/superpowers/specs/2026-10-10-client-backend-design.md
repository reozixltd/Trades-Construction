# Client backend: design

Date: 2026-10-10. Status: awaiting review.

## Goal

A client's site must hold quote requests on a server, so the owner sees every request from any device and the
customer gets the email copy the form promises. The public demo must keep working exactly as it does now, with
everything in the visitor's browser and nothing sent anywhere.

Decided by the owner of this repo:

- The demo stays browser-only. The backend is a switch for client builds.
- Server routes run on Vercel. Supabase holds the data and the photos.
- No owner alerts (email or SMS) yet.
- The customer gets a confirmation email when they give an address.
- The console has one owner password per site.

Assumed, not asked: one deployment per client, as "Setting up a real client" in the README already works.

## Not in this piece

Owner alerts, staff accounts, editing site content from the console, a CAPTCHA, data retention rules, analytics
beyond the three counters the console already shows, and anything in spec §10.

## Two modes, chosen at build time

| | Demo (default) | Server (`PUBLIC_BACKEND=server`) |
| --- | --- | --- |
| Build output | Static files, as now | Same static pages plus one Vercel function |
| Leads, photos | Browser storage | Supabase, through the function |
| Settings, counters | Browser storage | Supabase, through the function |
| Console sign-in | Demo login shown on the page | Owner password, session cookie |
| Sample-data buttons | Shown | Not rendered |
| Email field label | "Email (optional)" | "Email (for a copy of your request)", only when email is configured |

With the variable unset the build is the static demo it is today: no adapter, no server code, no Supabase library
in any bundle. `astro preview`, the static sub-folder bundle and the existing tests keep working.

## Architecture

```text
Browser (static pages)                      Vercel function                 Supabase
┌──────────────────────────┐   fetch   ┌──────────────────────────┐      ┌───────────────┐
│ quote form, console      │──────────▶│ /api/*  one router       │─────▶│ Postgres      │
│   LeadRepository         │           │   validation (shared)    │      │ Storage       │
│   ├ Local (demo)         │           │   rate limit, sessions   │      │ (private)     │
│   └ Http  (server mode)  │           │   LeadRepository         │      └───────────────┘
└──────────────────────────┘           │   ├ Supabase (deployed)  │─────▶ Resend (email)
                                       │   └ memory   (astro dev) │
                                       └──────────────────────────┘
```

The form and the console already depend only on the `LeadRepository` interface. The design keeps that interface
as the one contract and adds two implementations of it:

- `HttpLeadRepository` in the browser calls the routes below.
- `SupabaseLeadRepository` on the server talks to Supabase with the secret key. The browser never talks to
  Supabase and never holds a Supabase key.

Under `astro dev` with no Supabase variables, the server uses the existing browser store class over an in-memory
map. That is what lets the whole server flow run and be tested on a laptop with no accounts. A deployed build
with Supabase variables missing does not fall back to memory: every route answers 503 and the form shows its
"couldn't send, please call" message, because memory on a serverless host is lost between requests.

### Units

| Unit | Does | Depends on |
| --- | --- | --- |
| `src/server/api.ts` | One router: `(Request, ip) → Response` for every `/api/*` path | the units below |
| `src/server/session.ts` | Password check, signed cookie, lockout | `attempts` store |
| `src/server/supabase-repository.ts` | `LeadRepository` over Postgres and Storage | `@supabase/supabase-js` |
| `src/server/store.ts` | Settings, counters and attempts, for Supabase and for memory | same |
| `src/server/email.ts` | Sends the customer confirmation through Resend's HTTP API | `fetch` |
| `src/lib/leads/http-repository.ts` | `LeadRepository` over `fetch` | the routes |
| `astro.config.mjs` | In server mode: adds the Vercel adapter and injects the one API route | `@astrojs/vercel` |

New dependencies: `@astrojs/vercel` and `@supabase/supabase-js`, both used only in server mode. Email needs no
library.

`clear()` leaves the `LeadRepository` interface and joins `seedDemoLeads()` as a demo-only helper. A server must
not offer "delete every lead".

## Routes

All paths end in a slash, as the rest of the site does. Bodies are JSON.

| Route | Who | Does |
| --- | --- | --- |
| `POST /api/leads/` | public | Validates, stores the request and its photos, sends the confirmation, returns the lead |
| `GET /api/settings/` | public | Emergency mode and callback promise; cached at the edge for 60 s |
| `POST /api/track/` | public | Adds one to `call_click` or `area_check` |
| `POST /api/console/session/` | public | Password in, session cookie out |
| `GET`, `DELETE /api/console/session/` | owner | Is the session valid; sign out |
| `GET /api/console/leads/` | owner | All leads, newest first, photos as one-hour signed links |
| `PATCH /api/console/leads/<id>/` | owner | `{ status }` or `{ note }`; returns the lead |
| `PUT /api/console/settings/` | owner | Saves the two settings |
| `GET /api/console/counters/` | owner | The three counters |

## What the server checks on a quote request

The browser's checks stay, for fast feedback. The server repeats the ones that matter, because a request can be
sent without the page:

- The same `validateLeadInput` the form uses (name, Australian phone, job length, email shape), from the same file.
- The hidden `website` field is empty. If it is not, the server answers as if it had stored the request and stores
  nothing.
- At most 5 requests an hour from one address (the limit the demo already has). The address is stored only as a
  keyed hash.
- At most 5 photos, each a JPEG data URL (checked by its first bytes) no larger than 1 MB decoded; the whole body
  no larger than 4 MB, under Vercel's 4.5 MB limit. The browser already shrinks photos to 1280 px, so a real
  request sits well inside this.
- Unknown fields are dropped. `status`, `id`, `createdAt` and `history` are always set by the server.

The reference keeps its present form (`L-` plus letters and digits), because customers read it out on the phone.

## Sign-in

- `CONSOLE_PASSWORD` is set on the host. Fewer than 12 characters and the sign-in route answers 503, so a site
  cannot go live on a weak or forgotten default.
- The comparison is constant-time. Five wrong passwords from one address in 15 minutes locks that address out for
  the rest of the 15 minutes.
- The cookie is `HttpOnly`, `Secure`, `SameSite=Strict`, lasts 7 days, and is signed with `SESSION_SECRET` and the
  password together, so changing the password signs everyone out.
- Owner routes that change anything also require the request's `Origin` to be the site itself.

## Data

One SQL file, `supabase/schema.sql`, run once per client project in Supabase's SQL editor.

- `leads`: one column per field of the lead (so the table reads sensibly in Supabase's table editor), `photos` as
  an array of storage paths, `history` as JSON.
- `settings`: a single row.
- `counters`: name and count, with a small SQL function that adds one atomically.
- `attempts`: kind (`submit` or `signin`), hashed address, time. Used for both limits.
- Storage bucket `lead-photos`, private. Photos are read only through signed links the server makes for the owner.
- Row-level security is on for every table with no policies, so the public Supabase key, if it ever leaked into a
  page, could read and write nothing.

Known limit: notes and status changes rewrite the lead's `history`. Two changes to the same lead in the same
instant could lose one. With one owner this is accepted; the fix, if staff accounts arrive, is an events table.

## Customer confirmation email

Sent after the request is stored, when the customer gave an email and `RESEND_API_KEY` and `EMAIL_FROM` are set.
Plain content: the reference, what they asked for, the callback promise, and the phone number. Reply-to is the
business email.

A failed send never fails the request: it is already stored. The failure is written into the lead's history
("Confirmation email could not be sent") so the owner knows.

The form's label says "for a copy of your request" only in a build that will send one. Every other build,
including the demo, says "Email (optional)".

## Changes the visitor or owner can see

Demo: only the email label.

Server mode:

- Quote form: no visible change. It no longer needs browser storage to work.
- Public pages: fetch the two settings once per page and remember them in the browser, so the inline script that
  already prevents an emergency-banner flash keeps working. On a visitor's very first page, a setting the owner
  has changed appears a moment after the page does.
- Console sign-in: a password field only, with no demo hint.
- Console: "Calls" and "Forms" come from the server. The "Demo data" section is not rendered.

## Configuration

Set in Vercel for a client project (and in a git-ignored `.env` for local runs against a real project):

| Variable | For |
| --- | --- |
| `PUBLIC_BACKEND=server` | Turns the mode on |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | The client's project and its secret key |
| `CONSOLE_PASSWORD` | The owner's password, 12 characters or more |
| `SESSION_SECRET` | 32 or more random characters |
| `RESEND_API_KEY`, `EMAIL_FROM` | Optional; without both, no email is sent or promised |

The README's "Setting up a real client" gets these steps, including choosing the Sydney region in Supabase and
reviewing the privacy page, which today is a template.

## Testing

- Unit tests on the router with the memory store: a good request; each rejection above; photo rules; the limit of
  5 an hour; wrong password, lockout, a tampered cookie, an expired cookie; owner routes without a session; a
  foreign `Origin`; settings; counters; email sent, and email failing without failing the request.
- One contract suite for `LeadRepository`, run against the memory store always and against Supabase whenever its
  variables are present.
- A browser test in server mode under `astro dev`: send a request with a photo in one browser profile, sign in from
  a second profile and find it there with its photo, change its status, change a setting and see it on the public
  page in the first profile.
- The demo: the existing unit tests, the 17-step smoke test in three engines and the 26-step audit must pass
  unchanged, and the demo bundle must contain no server code.

## What cannot be checked without accounts

I can build and test everything up to two edges. Past them I need real accounts:

- Supabase: the contract suite against a throwaway project (its URL and secret key in a local `.env`, which I read
  but never print or commit).
- Resend: one real send from a verified domain.
- Vercel: a preview deployment in server mode. Nothing is pushed without a go-ahead.

Until those run, the Supabase and Resend code is written against their documented behaviour and reported as
unverified.
