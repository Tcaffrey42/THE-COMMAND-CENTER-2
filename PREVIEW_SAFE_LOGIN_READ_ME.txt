V2.16.9 Preview Safe Login Fix

Use admin@commandcenter.local / demo in Vercel Preview.

Fixes:
- Placeholder env.js no longer tricks app into attempting Supabase login.
- Demo login button directly opens the app shell.
- Supabase errors cannot strand the preview login screen.
- No /api folder included. Static deploy remains safe.

Next: once this loads, we can wire the local AI Copilot deeper, then add real OpenAI through a separate serverless branch after deployment is stable.
