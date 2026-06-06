# CommandCenter V2.13.2 — Vercel URL Fix

This package is prepared specifically so Vercel creates a live deployment URL.

## Critical GitHub rule

After unzipping, your GitHub repository root must show these files directly:

- package.json
- index.html
- vercel.json
- src/
- scripts/

Do **not** upload a folder that contains another folder with these files inside it.

## Vercel import settings

When importing the GitHub repo into Vercel:

- Framework Preset: Other
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

If Vercel asks for environment variables, skip them for now. The app opens in demo mode without Supabase keys.

## If Vercel still does not create a URL

Open the Vercel deployment log and look for one of these:

- Root Directory wrong
- No package.json found
- Build command failed
- Output directory dist not found

The most common issue is that GitHub has the files inside an extra folder layer instead of at the repo root.


## V2.14 Update
- Added Preventive Maintenance Planner page.
- Added PM-to-Work-Order conversion workflow.
- Repaired repo structure so `src/app.js`, `src/styles.css`, and `src/env.js` are the deployed source of truth.


V2.14.1 hotfix: preserves root-only Vercel-safe deployment and restores/backfills SLA, Locations, Heat Map seed data if a previous broken build emptied localStorage or cloud-loaded blank tables.
