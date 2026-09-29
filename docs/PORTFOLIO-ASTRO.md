# Portfolio architecture

## Framework choice

The portfolio now uses **Astro 5** with static output. This fits a profile site hosted on Vercel/GitHub Pages because the rendered pages are fast, crawlable and dependency-light, while small client scripts add only the interactions that matter: the ordered navigation, responsive menu and project filters.

## Route map

- `/` — ordered presentation: impact, systems, teaching, credentials and contact.
- `/projects.html` — personal products, public repositories and a filterable project index.
- `/courses.html` — siete cursos de Udemy, total de estudiantes y canales de YouTube.
- `/certifications.html` — AWS, Microsoft Azure y GitHub credentials with official local logo assets.
- `/experience.html` — CV-backed professional timeline.

The `.html` suffix is intentionally preserved for existing links and bookmarks while the implementation is now under `src/pages/*.astro`.

## Brand assets

- `public/brand/logo.svg` is the horizontal Jerson Martínez mark.
- `public/brand/favicon.svg` is the square `JM` favicon.
- `public/images/profile.jpg` is the public profile image used by the site.
- `public/brands/aws.svg`, `public/brands/azure.svg`, `public/brands/github.png` y `public/brands/openwebinars.svg` son assets locales para evitar fallos de CDN en logos.

## Content provenance

Content in `src/data/portfolio.js` is restricted to information confirmed in the supplied Spanish/English CVs, the public GitHub profile and the existing README:

- Factib and Crashell are presented as personal products.
- `mcp-github-projects`, `mcp-monday-projects`, `kiro-crew`, `InfraQuiz`, `GNet`, `reusable-workflows`, `DevOps-YouTube-Channels` and `docker-lamp` link to public repositories confirmed on the GitHub profile.
- Udemy, DevOpsea, Side Master y OpenWebinars se muestran como trabajo de formación y contenido. El catálogo de Udemy contiene 7 cursos y más de 77 mil estudiantes; DevOpsea se presenta con más de 15K suscriptores y Side Master con su cifra aproximada redondeada por YouTube.
- Las verificaciones AWS, Microsoft Azure y GitHub se extraen de los enlaces incrustados en los PDF y se mantienen como enlaces públicos por credencial.
- Factib has no public repository link in the consulted profile, so the portfolio does not invent one.
- Certification names and professional metrics are marked as CV-based; they are not presented as independently verified by this site.

## Local workflow

```bash
npm ci
npm run dev
npm run build
npm test
npm run validate
npm run links
```

The GitHub Actions validation workflow builds `dist`, validates the generated assets and checks local links. The deployment workflow publishes only `dist`; it never uploads the source tree as the site artifact.
