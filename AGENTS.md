# Portfolio Website Rules
- This repository hosts my live GitHub Pages portfolio at https://sheikhsobanfayaz.github.io/securitywithsoban/.
- Never use long dashes (em dashes or en dashes) anywhere in the site.
- Never mention vendor-specific employers like SonicWall; keep network security experience vendor-neutral.
- Whenever I ask to add, remove, or update anything on the site:
  1. Edit `index.html` or `projects.json` as requested.
  2. Validate that `projects.json` is valid JSON if modified.
  3. Run `git add . && git commit -m "<brief description>" && git push origin main` so GitHub Pages deploys automatically.