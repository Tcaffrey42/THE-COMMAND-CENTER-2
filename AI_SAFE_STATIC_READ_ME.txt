COMMANDCENTER V2.16.8 SAFE STATIC AI MODE

This build removes the /api folder that crashed deployment/upload.
It keeps the site as a static-root Vercel build and upgrades the Copilot so it answers from the current CommandCenter data already inside app.js.

What works:
- Login screen stays intact.
- Dashboard stays static-root safe.
- Copilot answers portfolio questions using local data.
- Suggested prompts work.
- No OPENAI_API_KEY needed.

Next step after this loads:
- Add real OpenAI through a separate server/API project or Vercel function only after static deployment is stable.
