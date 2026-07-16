# builtbybasics CMS Migration

This repo is migrating from hand-edited static HTML to **Sanity CMS + Astro**.

Phase 1 adds the foundation without removing the legacy site at the repo root.

## Project layout

```
BuiltByBasics/
├── studio/          Sanity Studio (content editing)
├── astro-site/      New Astro site (public build)
├── index.html       Legacy static pages (unchanged in Phase 1)
├── programs.html
└── js/programs-data.js
```

## Phase 1 checklist

- [x] Sanity Studio scaffolded with article, program, and movement pattern schemas
- [x] Seed script for `js/programs-data.js`
- [x] Astro site scaffolded with shared layout
- [x] `/programs` index page wired to Sanity
- [x] `/programs/[slug]` detail page wired to Sanity

## Phase 2 checklist

- [x] Articles seeded from `content/*.md` (`npm run seed:articles`)
- [x] `/library` lists programs + published articles from Sanity
- [x] `/articles/[slug]` renders article body from Sanity
- [x] `index`, `basics`, `coaching`, `thank-you` ported via legacy HTML loader
- [x] Redirects configured (`netlify.toml`, `astro-site/vercel.json`)
- [ ] Deploy Astro site to Netlify/Cloudflare (you)
- [ ] Sanity webhook → rebuild on publish (you)

## Run locally

### 1. Configure environment variables

**Studio** — copy `studio/.env.example` to `studio/.env`:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
SANITY_API_WRITE_TOKEN=your_write_token
```

Get tokens at [sanity.io/manage](https://www.sanity.io/manage) → your project → API → Tokens.

- **Viewer** token → use as `SANITY_API_READ_TOKEN` in Astro (read-only)
- **Editor** token → use as `SANITY_API_WRITE_TOKEN` in Studio (for seeding)

**Astro** — copy `astro-site/.env.example` to `astro-site/.env`:

```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_viewer_token
```

### 2. Install dependencies (if needed)

```bash
cd studio && npm install
cd ../astro-site && npm install
```

### 3. Seed content

From `studio/`:

```bash
npm run seed           # programs + movement patterns
npm run seed:articles  # articles from content/*.md
# or
npm run seed:all
```

This upserts:

- **16 movement patterns** from `MOVEMENT_PATTERNS` in `js/programs-data.js`
- **2 programs** (`full-body-2x`, `upper-lower-4x`) with all workout days
- **3 articles** from `content/strength-training.md`, `content/cardiofitness.md`, `content/fatloss.md`

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
| `http://localhost:4321/` | Home page |
| `http://localhost:4321/library` | Programs card + article cards |
| `http://localhost:4321/articles/strength-training` | Article from CMS |
| `http://localhost:4321/programs` | Program cards + movement patterns |
| `http://localhost:4321/basics` | Basics of Training |
| `http://localhost:4321/coaching` | Coaching page |

Legacy files at repo root remain as fallback until you switch production deploy.

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

## Phase 3 (later)

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

## Manual steps only you can do

1. Create/link Sanity project and copy Project ID
2. Create API tokens (Viewer + Editor)
3. Fill in local `.env` files (never commit these)
4. Run seed script once content schemas are ready
5. Merge branch and switch production deploy when Phase 2 is complete
