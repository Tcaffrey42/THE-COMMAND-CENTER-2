COMMANDCENTER V2.16.1 STATIC NO-SRC ROOT UPLOAD

This package intentionally removes /src, /dist, package.json, and buildCommand.
It deploys as a plain static app:
- index.html
- app.js
- styles.css
- auth.js
- env.js
- logo/image files

Use this when Vercel/GitHub keeps failing around src/build output.
Upload the CONTENTS of this folder to the GitHub repo root.
Do not upload the folder itself.
Do not upload the zip itself.

Vercel settings:
- Framework Preset: Other
- Build Command: leave blank
- Output Directory: leave blank
- Install Command: leave blank

Root must show index.html and app.js directly.
