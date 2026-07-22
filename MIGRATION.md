# builtbybasics CMS Migration

This repo has migrated from hand-edited static HTML to **Sanity CMS + Astro**.

## Project layout

```
BuiltByBasics/
├── studio/              Sanity Studio (content editing + seed data)
│   └── data/            Seed sources (programs-data.js, articles/*.md)
├── astro-site/          Public Astro site
│   ├── legacy/          HTML sources still loaded for home/basics/coaching/thank-you
│   └── public/          CSS, JS, images, assets
├── netlify.toml
└── package.json         Workspace scripts (dev:site, dev:studio, build:site)
```

## Phase 1 checklist

- [x] Sanity Studio scaffolded with article, program, and movement pattern schemas
- [x] Seed script for `studio/data/programs-data.js`
- [x] Astro site scaffolded with shared layout
- [x] `/programs` index page wired to Sanity
- [x] `/programs/[slug]` detail page wired to Sanity

## Phase 2 checklist

- [x] Articles seeded from `studio/data/articles/*.md` (`npm run seed:articles`)
- [x] `/library` lists programs + published articles from Sanity
- [x] `/articles/[slug]` renders article body from Sanity
- [x] `index`, `basics`, `coaching`, `thank-you` ported via legacy HTML loader
- [x] Redirects configured (`netlify.toml`, `astro-site/vercel.json`)
- [x] Legacy static site removed from repo root (assets live under `astro-site/`)
- [ ] Deploy Astro site to Netlify/Cloudflare (you)
- [ ] Sanity webhook → rebuild on publish (you)

## Run locally

### 1. Configure environment variables

**Studio** — copy `studio/.env.example` to `studio/.env`:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
SANITY_API_WRITE_TOKEN=your_write_token
SANITY_STUDIO_PREVIEW_URL=http://localhost:4321
```

Get tokens at [sanity.io/manage](https://www.sanity.io/manage) → your project → API → Tokens.

- **Viewer** token → use as `SANITY_API_READ_TOKEN` in Astro (read-only; required for Presentation draft preview)
- **Editor** token → use as `SANITY_API_WRITE_TOKEN` in Studio (for seeding)

**Astro** — copy `astro-site/.env.example` to `astro-site/.env`:

```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_viewer_token
PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
```

**CORS (one-time, for live preview):** In [sanity.io/manage](https://www.sanity.io/manage) → API → CORS origins, add `http://localhost:4321` with **Allow credentials** checked (or run `npx sanity cors add http://localhost:4321 --credentials` from `studio/`).

### 2. Install dependencies (if needed)

```bash
cd studio && npm install
cd ../astro-site && npm install
```

### 3. Seed content

From `studio/`:

```bash
npm run seed           # programs + movement patterns
npm run seed:articles  # articles from studio/data/articles/*.md
# or
npm run seed:all
```

This upserts:

- **16 movement patterns** from `MOVEMENT_PATTERNS` in `studio/data/programs-data.js`
- **2 programs** (`full-body-2x`, `upper-lower-4x`) with all workout days
- **3 articles** from `studio/data/articles/` (`strength-training.md`, `cardiofitness.md`, `fatloss.md`)

### 4. Start dev servers

From repo root:

```bash
npm run dev:studio   # http://localhost:3333
npm run dev:site     # http://localhost:4321
```

Or from each folder: `npm run dev`

### 5. Verify

| URL | Expected |
|---|---|
| `http://localhost:3333` | Sanity Studio |
| `http://localhost:3333` → **Presentation** | Article live preview iframe (needs both servers + CORS) |
| `http://localhost:4321/` | Home page |
| `http://localhost:4321/library` | Programs card + article cards |
| `http://localhost:4321/articles/strength-training` | Article from CMS |
| `http://localhost:4321/programs` | Program cards + movement patterns |
| `http://localhost:4321/basics` | Basics of Training |
| `http://localhost:4321/coaching` | Coaching page |

### Live preview (Presentation)

1. Start both `dev:studio` and `dev:site`
2. Ensure CORS credentials origin `http://localhost:4321` is set (see above)
3. In Studio, open **Presentation**, select an article — the site loads in an iframe and refreshes as you edit

## Deploy the Astro site

### Netlify

1. Connect repo, set **Base directory** to `astro-site` (or use root `netlify.toml`)
2. Build command: `npm run build`
3. Publish directory: `astro-site/dist`
4. Add env vars: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`

### Sanity rebuild webhook

In [sanity.io/manage](https://www.sanity.io/manage) → API → Webhooks:

- URL: your host's deploy hook URL
- Trigger on create/update/delete for `article`, `program`, `movementPattern`

## Data mapping (`programs-data.js` → Sanity)

| Legacy source | Sanity field |
|---|---|
| `MOVEMENT_PATTERNS[id].label` | `movementPattern.title` |
| Object key (`squat`, `hinge`, …) | `movementPattern.slug` |
| `MOVEMENT_PATTERNS[id].examples` | `movementPattern.examples[]` |
| `PROGRAM_COLLECTIONS[]` | `program` document metadata |
| `PROGRAMS_BY_COLLECTION[id][]` | `program.days[]` |
| `slot.patternId` | `workoutSlot` with `slotType: "pattern"` + reference |
| `slot.choice[]` | `workoutSlot` with `slotType: "choice"` + references |
| `day.accessories[]` | `programDay.accessories[]` |

## Deploy Studio (optional)

From `studio/`:

```bash
npm run deploy
```

Hosts Studio at `https://<your-studio>.sanity.studio`.

## Phase 3 (later)

- Stripe Checkout for paid programs
- Optional user accounts for "My Programs"
- Rewrite remaining legacy HTML pages into native Astro components

## Manual steps only you can do

1. Create/link Sanity project and copy Project ID
2. Create API tokens (Viewer + Editor)
3. Fill in local `.env` files (never commit these)
4. Run seed script once content schemas are ready
5. Merge branch and switch production deploy when Phase 2 is complete
