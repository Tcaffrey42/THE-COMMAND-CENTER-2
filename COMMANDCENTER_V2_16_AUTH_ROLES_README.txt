COMMANDCENTER V2.16 — LOGIN + USER ROLES

This build branches from MASTER BASELINE V2.15.7.

WHAT CHANGED
- Added Supabase login gate.
- Added role-based navigation.
- Added permission checks for work order creation, proposal creation, and export.
- Added logout button.
- Added visible role badge in the top-right controls.
- Uses your EXISTING Supabase project through env.js.

DO NOT CHANGE
- Do not create a new Supabase project.
- Do not change your Supabase URL or anon key unless the current env.js is blank/wrong.
- Do not overwrite your V2.15.7 master baseline.

REQUIRED SUPABASE TABLE
profiles
- id uuid primary key references auth.users(id)
- email text
- full_name text
- role text
- company text
- created_at timestamptz

SUPPORTED ROLES
- admin
- executive
- facility_manager
- vendor
- technician
- client

FIRST ADMIN SETUP
Run this in Supabase SQL Editor after replacing the email:

update profiles
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';

DEPLOYMENT
Upload the root files only to GitHub/Vercel. Do not upload the zip itself to GitHub.
