COMMANDCENTER V2.16.21 — SUPABASE ENV LOGIN MASTER

This package is based on your uploaded master:
CC_CommandCenter_V2_16_LOGIN_ROLES_FROM_MASTER(1).zip

Changes made:
1. env.js now contains your Supabase project URL.
2. env.js now contains your Supabase publishable/anon key.
3. Added window.ENV compatibility alias.
4. Changed CLOUD_TABLES users mapping from app_users to users to match your pasted schema.
5. Updated visible build label to V2.16.21 Supabase Env Login Master.

Deploy settings:
Framework: Other
Install Command: npm install
Build Command: npm run build
Output Directory: dist

Login:
Use the Supabase Auth user that exists in Authentication > Users.
Expected demo account if created:
admin@commandcenter.local
demo

Important:
If login fails with "Invalid login credentials", the frontend is connected and Supabase rejected the username/password.
If login fails with a profile/role message, create or repair the public.profiles row for that auth user.
