# DAIL Hackathon — C03: Tyre inspection → customer offer

A coordinator workflow that turns technician tyre inspections into approved customer offers.
Synthetic exercise data — no real customers, shops or messages, and nothing is ever actually sent.

```
.
├── app/                    Next.js application (the deliverable)
├── brief.md                Case brief
├── SRS.md                  Requirements
├── initial.json            Ground-truth data (never altered)
└── master-build-prompt.md  Build spec
```

Full product documentation lives in [`app/README.md`](app/README.md) — routes, the stock gate,
priority scoring, channels, alerts, and what is real vs. simulated.

## Run locally

```bash
cd app
npm install
npm run dev
```

Open the printed URL. No environment variables, no database, no backend — all state is in memory
for the session, seeded from `initial.json`.

## Deploy to Vercel

The app is a static/client-rendered Next.js build with its data compiled in, so a deployment shows
**exactly the same data as local** — nothing to configure, no env vars, no database.

### Option A — from the GitHub repo (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import `G-Zak/DAIL_Hackathon`.
2. **Set Root Directory to `app`.** This is the only setting that matters — the Next.js project
   lives in a subfolder, so Vercel needs pointing at it.
3. Leave everything else on defaults (Framework: Next.js, Build: `next build`, Install: `npm install`).
4. Leave Environment Variables empty.
5. Deploy.

Every push to `main` redeploys automatically; pull requests get preview URLs.

### Option B — from the CLI

```bash
npm i -g vercel
cd app
vercel          # first run: link the project, accept the defaults
vercel --prod   # promote to production
```

Run these from inside `app/`, so the root directory is already correct.

### Why the data matches local

Records come from `app/lib/seed-data.ts`, a verbatim copy of `initial.json` plus clearly labeled
demo rows. Nothing is fetched at runtime. Appointment dates are derived from the session's start
date, so "Day 4" is always four days out wherever it runs. Reloading resets the demo to the same
starting point — by design.

When Supabase is added later, that seed module is the single place the data layer swaps out.
