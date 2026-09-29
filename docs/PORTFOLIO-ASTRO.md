# Portfolio architecture

## Framework choice

The portfolio uses **Astro 5** with static output. This fits a profile site hosted on Vercel/GitHub Pages because the rendered pages are fast, crawlable and dependency-light, while focused client scripts add only the interactions that matter: ordered navigation, responsive menu, project filters and the skills explorer.

## Route map

- `/` — ordered presentation: impact, skills, systems, teaching, credentials and contact.
- `/projects.html` — personal products, public repositories and a filterable project index.
- `/courses.html` — seven Udemy courses, student total and YouTube channels.
- `/certifications.html` — AWS, Microsoft Azure and GitHub credentials with official local logo assets.
- `/experience.html` — CV-backed professional timeline.

The `.html` suffix is intentionally preserved for existing links and bookmarks while the implementation is under `src/pages/*.astro`.

## Mapa de rutas desplegadas y datos que las alimentan (mantenimiento)

Cada página se compila desde un archivo en `src/pages/` y consume exports concretos
de `src/data/portfolio.js` (fuente única de verdad). Para cambiar contenido, edita
`portfolio.js`; para cambiar estructura/marcado, edita el `.astro` correspondiente.

| Ruta desplegada        | Archivo fuente                            | Exports de `portfolio.js` que consume |
| ---------------------- | ----------------------------------------- | ------------------------------------- |
| `/`                    | `src/pages/index.astro`                   | `profile`, `projects` (destacados: `featured`), `teaching`, `certifications`, `skills`, `projectSlug` |
| `/projects.html`       | `src/pages/projects.html.astro`           | `projects`, `profile`, `projectSlug` |
| `/courses.html`        | `src/pages/courses.html.astro`            | `courses`, `profile`, `youtubeChannels` |
| `/certifications.html` | `src/pages/certifications.html.astro`     | `certifications`, `cvLinks`, `profile` |
| `/experience.html`     | `src/pages/experience.html.astro`         | `experience`, `profile`, `experienceLede` |

Componentes compartidos: `src/layouts/BaseLayout.astro` (envoltura común, usa
`profile`), `src/components/SiteHeader.astro` (navegación), `SkillsExplorer.astro`
(render de `skills` en el home) y `LogoCloud.astro` (nube de logos del home).

Notas de derivación (evitan cifras divergentes):
- `profile.facts[0]` (años de experiencia) se deriva de `profile.yearsExperience`.
- Las métricas de suscriptores de YouTube en `teaching` se derivan de `youtubeChannels`.

## Convención de nombres de rutas con `.html.astro` (item 82)

Las páginas internas usan el patrón de nombre `nombre.html.astro`, que Astro compila
a la ruta `/nombre.html`:

| Archivo en `src/pages/`      | Ruta generada          |
| ---------------------------- | ---------------------- |
| `index.astro`                | `/`                    |
| `projects.html.astro`        | `/projects.html`       |
| `courses.html.astro`         | `/courses.html`        |
| `certifications.html.astro`  | `/certifications.html` |
| `experience.html.astro`      | `/experience.html`     |

**Por qué el sufijo `.html`:** el sitio se publicó originalmente como HTML estático
(`projects.html`, etc.). Conservar el sufijo mantiene vivos los enlaces externos,
marcadores y resultados indexados por buscadores; quitarlo rompería esas URLs.

**Regla al añadir una página nueva:** si debe conservar una URL con `.html`, nómbrala
`nueva.html.astro` (no `nueva.astro`, que generaría `/nueva`). Enlázala internamente
como `/nueva.html`. El `SiteHeader.astro` normaliza rutas con y sin `.html` y barra
final, de modo que el estado activo del menú funciona en ambas formas.

## Brand and icon system

- `public/brand/logo.svg` is the simplified horizontal **Jerson + terminal dot** wordmark; the isotipo was removed from the header.
- `public/brand/favicon.svg` is the compact J-and-dot favicon.
- `public/images/profile.jpg` is the public profile image used by the site.
- The site uses the repository's local **Font Awesome 5.9** assets as its single reusable UI icon library. Header actions, navigation entries, CTA buttons, social links, tooltips, skill categories and external-link affordances all use the same icon system.
- `public/brands/aws.svg`, `public/brands/azure.svg`, `public/brands/github.png` and `public/brands/openwebinars.svg` remain provider/content logos, separate from UI iconography.

## CV-driven content

Content in `src/data/portfolio.js` is restricted to information confirmed in the supplied updated Spanish/English CVs, the public GitHub profile and the existing README:

- Hero facts now show `+10` years of experience, `3` Cloud Providers, `100+` courses and certifications, and `60+` published articles, following the requested presentation copy.
- `skills` contains the updated CV taxonomy: infrastructure, cloud, virtualization, containers, IaC, DevOps/CI/CD, observability, storage/backup, security/governance, generative AI, development, databases and languages.
- The home page renders those categories through `SkillsExplorer.astro`, with click, arrow-key, Home and End navigation and ARIA tab/tabpanel state.
- Factib and Crashell are presented as personal products.
- `mcp-github-projects`, `mcp-monday-projects`, `kiro-crew`, `InfraQuiz`, `GNet`, `reusable-workflows`, `DevOps-YouTube-Channels` and `docker-lamp` link to public repositories confirmed on the GitHub profile.
- Udemy, DevOpsea, Side Master and OpenWebinars are shown as teaching/content work. The Udemy catalog contains 7 courses and more than 77 thousand students; DevOpsea uses more than 15K subscribers and Side Master keeps its independent rounded public figure.
- AWS, Microsoft Azure and GitHub verification links are extracted from the updated PDF annotations and remain public per credential.
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

## SEO, PWA y accesibilidad (endurecimiento)

Todo el contenido nuevo reutiliza datos ya verificados; no se añaden cifras, proyectos ni enlaces inventados.

- **Datos estructurados**: `BaseLayout.astro` emite JSON-LD `schema.org/Person` (nombre, URL, imagen, email, `sameAs` a GitHub/LinkedIn/YouTube/Udemy) y, en páginas internas, `BreadcrumbList` (prop `breadcrumb`).
- **Metadatos**: `author`, `robots` (`index, follow, max-image-preview:large`), `referrer`, `application-name`, `apple-touch-icon`, metas `apple-mobile-web-app-*` / `mobile-web-app-capable`, `og:image:alt/width/height` y `twitter:image:alt`.
- **Rendimiento**: `preconnect`/`dns-prefetch` a `cdn.simpleicons.org`; `decoding="async"` en imágenes y `fetchpriority="high"` en el retrato y el wordmark.
- **PWA/indexación**: `public/robots.txt` (con `Sitemap:`), `public/sitemap.xml` (5 rutas reales), `public/site.webmanifest` (`<link rel="manifest">`) y `public/humans.txt` (`<link rel="author">`).
- **Accesibilidad**: migas de pan visibles con `aria-current`, `aria-labelledby` en secciones, `<main tabindex="-1">`, avisos `sr-only` "(abre en nueva pestaña)" en enlaces externos, `hreflang` en los CV, `lang="en"` en ítems en inglés, `rel="me"` en redes del pie, y timeline como `<ol>/<li>` con `<time datetime>` legible por máquina.
- **UX**: hoja de impresión (`@media print`), pie con año dinámico y "Volver arriba", enlace de pie de la página actual, `scroll-margin-top` para anclas, resaltado `:target` y `<noscript>` que aclara el filtro de proyectos.

El test `tests/portfolio.test.js` cubre la presencia de estos artefactos (robots/sitemap/manifest/humans y el JSON-LD) además de los valores protegidos.
