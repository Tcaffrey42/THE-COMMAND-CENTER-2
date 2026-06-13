COMMANDCENTER V2.18.1 REAL USA MAP RESTORATION PATCH

Upload/replace these files in the project root:
- app.js
- styles.css

Optional:
- index.html only if you are replacing the saved/static HTML file directly.

What this patch does:
- Removes the fake SVG USA map installer from app.js.
- Overrides Portfolio Heat Map with a real Leaflet/OpenStreetMap USA map.
- Adds red/orange/yellow/green risk pins from existing location lat/lon data.
- Keeps branding, auth, sidebar, Work Orders, AI Copilot, and other modules untouched.

Success test:
Open Portfolio Heat Map. You should see a real full-color interactive USA map with zoom/pan and risk pins.
