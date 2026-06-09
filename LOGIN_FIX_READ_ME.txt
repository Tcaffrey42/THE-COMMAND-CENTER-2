COMMANDCENTER LOGIN FIX

Problem fixed:
- If Supabase Authentication > Users has zero users, Supabase rejects login with "Invalid login credentials."
- The app now includes a local demo login fallback so you can get past the login screen immediately.

Use this demo login:
Email: admin@commandcenter.local
Password: demo

Also accepted for convenience:
Email: tcaffrey42@gmail.com
Password: demo

Important:
- This is for demo/development access.
- For production, create real users inside Supabase > Authentication > Users, then add/repair their row in public.profiles.
- Sign out clears the local demo session.
