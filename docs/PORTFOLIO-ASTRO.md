# Portfolio architecture

## Framework choice

The portfolio uses **Astro 5** with static output. This fits a profile site hosted on Vercel/GitHub Pages because the rendered pages are fast, crawlable and dependency-light, while focused client scripts add only the interactions that matter: ordered navigation, responsive menu, project filters and the skills explorer.

## Route map

- `/` — ordered presentation: impact, skills, systems, teaching, certifications and contact.
- `/projects.html` — personal products, public repositories and a filterable project index.
- `/courses.html` — seven Udemy courses, individual public links, SVG course visuals and YouTube channels.
- `/certifications.html` — AWS, Microsoft Azure and GitHub certifications with direct name links.
- `/experience.html` — CV-backed professional timeline.
- `/about.html` — recruiter/client-facing profile, results, stack and collaboration context.

The `.html` suffix is intentionally preserved for existing links and bookmarks while the implementation is under `src/pages/*.astro`.

## Mapa de rutas desplegadas y datos que las alimentan (mantenimiento)

Cada ruta de `src/pages/` (y su gemela de `src/pages/en/`) es un envoltorio de tres
líneas que sólo fija `lang`: el marcado vive una sola vez en
`src/components/pages/`. El contenido procede de `src/data/portfolio.ts` (fuente
única de verdad) a través de los resolutores de `src/i18n/content.ts`, que
superponen el inglés y trasladan los enlaces internos. Para cambiar contenido,
edita `portfolio.ts` (y su entrada en `src/i18n/content.en.ts`); para cambiar
estructura/marcado, edita el componente de página.

| Ruta desplegada                      | Componente de página                          | Resolutores / exports que consume |
| ------------------------------------ | --------------------------------------------- | --------------------------------- |
| `/` · `/en/`                         | `src/components/pages/HomePage.astro`         | `getProfile`, `getProjects` (destacados: `featured`), `getTeaching`, `getSkills`, `getWriting`, `getValueProps`, `getAudienceMetrics`, `methodologies`, `projectSlug` |
| `/projects.html` · `/en/projects.html` | `src/components/pages/ProjectsPage.astro`   | `getProfile`, `getProjects`, `projectSlug` |
| `/courses.html` · `/en/courses.html` | `src/components/pages/CoursesPage.astro`      | `getCourses`, `getChannels`, `getAudienceMetrics`, `openWebinarsCourses` |
| `/certifications.html` · `/en/...`   | `src/components/pages/CertificationsPage.astro` | `getCertifications`, `getCvLinks`, `getAudienceMetrics` |
| `/about.html` · `/en/about.html`     | `src/components/pages/AboutPage.astro`        | `getProfile`, `getStackGroups`, `getCvLinks`, `getCollaborationModes` |
| `/experience.html` · `/en/...`       | `src/components/pages/ExperiencePage.astro`   | `getProfile`, `getExperience`, `getExperienceLede`, `getCvLinks` |

Componentes compartidos: `src/layouts/BaseLayout.astro` (envoltura común, usa
`getProfile` y `contentMeta`), `src/components/SiteHeader.astro` (navegación y
conmutador de idioma), `SkillsExplorer.astro` (render de skills en el home) y
`LogoCloud.astro` (nube de logos del home).

Cada export de `portfolio.ts` lleva su tipo de `src/types/content.ts`, así que el
compilador valida el dato contra su contrato: un campo que falte, sobre o cambie
de tipo rompe `astro check`.

Notas de derivación (evitan cifras divergentes):

- `profile.facts[0]` (años de experiencia) se deriva de `profile.yearsExperience`.
- Las métricas de suscriptores de YouTube en `teaching` se derivan de `youtubeChannels`.

## Convención de nombres de rutas con `.html.astro` (item 82)

Las páginas internas usan el patrón de nombre `nombre.html.astro`, que Astro compila
a la ruta `/nombre.html`:
| `about.html.astro`        | `/about.html`        |

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
- `public/images/profile-v2-*` contains the responsive AVIF, WebP and optimized JPEG portrait variants generated from the approved profile image.
- The site uses a curated local **Font Awesome 5.9 subset** (`src/styles/icons.css` plus two WOFF2 files) as its reusable UI icon system. Header actions, navigation, social links, skill categories and CTA buttons use this same set without loading the full legacy library.
- `public/brands/aws.svg`, `public/brands/azure.svg`, `public/brands/github.svg` and `public/brands/openwebinars.svg` remain provider/content logos, separate from UI iconography.

## CV-driven content

Content in `src/data/portfolio.ts` is restricted to information confirmed in the supplied updated Spanish/English CVs, the public GitHub profile and the existing README:

- Hero facts show `+10` years of experience, `3` Cloud Providers, `100+` certifications obtained through continuous learning, and `60+` published articles. OpenWebinars separately presents seven courses taught.
- `skills` contains the updated CV taxonomy: infrastructure, cloud, virtualization, containers, IaC, DevOps/CI/CD, observability, storage/backup, security/governance, generative AI, development, databases and languages.
- The home page renders those categories through `SkillsExplorer.astro`, with click, arrow-key, Home and End navigation and ARIA tab/tabpanel state.
- Factib and Crashell are presented as personal products.
- `mcp-github-projects`, `mcp-monday-projects`, `kiro-crew`, `InfraQuiz`, `GNet`, `reusable-workflows`, `DevOps-YouTube-Channels` and `docker-lamp` link to public repositories confirmed on the GitHub profile.
- Udemy, DevOpsea, Side Master and OpenWebinars are shown as teaching/content work. The Udemy catalog contains 7 courses and more than 77 thousand students; DevOpsea uses more than 15K subscribers and Side Master keeps its independent rounded public figure.
- AWS, Microsoft Azure and GitHub verification links are extracted from the updated PDF annotations and remain public per credential.
- Factib has no public repository link in the consulted profile, so the portfolio does not invent one.
- Certification names link directly to official verification sources. GitHub Actions and repository governance are competencies, not certifications.

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

- **Datos estructurados**: `BaseLayout.astro` emite JSON-LD contextual sin exponer el correo. El inicio usa `Person` y `WebSite`; las páginas internas añaden `BreadcrumbList`, `ProfilePage`, `ItemList`, `Course` o `EducationalOccupationalCredential` según corresponda.
- **Metadatos**: `author`, `robots` (`index, follow, max-image-preview:large`), `referrer`, `application-name`, `apple-touch-icon`, metas `apple-mobile-web-app-*` / `mobile-web-app-capable`, `og:image:alt/width/height` y `twitter:image:alt`.
- **Rendimiento**: fuentes y logos autoalojados, foto responsive AVIF/WebP/JPEG, CSS de iconos reducido y caché inmutable solo para assets versionados.
- **PWA/indexación**: `public/robots.txt`, `public/sitemap.xml` (6 rutas indexables), `public/site.webmanifest`, `public/humans.txt` y una séptima ruta Astro `404.html` no incluida en el sitemap.
- **Accesibilidad**: migas de pan visibles con `aria-current`, `aria-labelledby` en secciones, `<main tabindex="-1">`, avisos `sr-only` "(abre en nueva pestaña)" en enlaces externos, `hreflang` en los CV, `lang="en"` en ítems en inglés, `rel="me"` en redes del pie, y timeline como `<ol>/<li>` con `<time datetime>` legible por máquina.
- **UX**: hoja de impresión (`@media print`), pie con año dinámico y "Volver arriba", enlace de pie de la página actual, `scroll-margin-top` para anclas, resaltado `:target` y `<noscript>` que aclara el filtro de proyectos.

El test `tests/portfolio.test.js` cubre la presencia de estos artefactos (robots/sitemap/manifest/humans y el JSON-LD) además de los valores protegidos.

## Registro auditable de mejoras

El detalle numerado de todas las mejoras aplicadas al portafolio (más de 100,
por categoría, con su archivo/área afectada y el commit que las introdujo) vive
en [`docs/IMPROVEMENTS-RECORD.md`](./IMPROVEMENTS-RECORD.md).

- La fuente de verdad es `tools/gen-improvements-record.js` (array
  `IMPROVEMENTS`); el documento se regenera con `node tools/gen-improvements-record.js`.
- El generador valida que no haya referencias de audit duplicadas y que cada
  archivo atribuido exista en el árbol.
- `tests/improvements-record.test.js` verifica que el documento esté presente,
  declare un total coherente (>=100), no contradiga los valores protegidos y que
  cada fila cite el SHA de su commit.

## Mantenimiento post-merge y auditorías reales

- `npm run production:smoke` comprueba el dominio canónico, la redirección desde el dominio raíz, las seis rutas indexables, redirects limpios, metadata, cabeceras de seguridad y la respuesta 404.
- `.github/workflows/production-smoke.yml` ejecuta ese smoke de lunes a viernes y también permite lanzarlo manualmente.
- `site-quality.yml` construye `dist` y aplica Lighthouse con presupuestos y pa11y WCAG2AA como gates de PR sobre las seis rutas indexables; `e2e.yml` valida menú, tabs, filtros, hashes y foco con Playwright.
- `certificates.yml` construye `dist` antes de que `tools/check-certificates.js` extraiga hosts TLS. El checker usa HTML generado y, si no existe build, usa las fuentes Astro y los datos del portfolio como fallback. `api.whatsapp.com` queda explícitamente fuera del umbral de expiración porque es un endpoint de borde gestionado por WhatsApp; el enlace conserva el número y el mensaje del CV.
- Los nombres de AWS, Microsoft Learn, Credly y GitHub se muestran como enlaces directos a sus fuentes públicas; no se añade una etiqueta distinta al nombre.
- El manifest habilita instalación básica, pero no se anuncia soporte offline porque el portfolio todavía no incluye service worker.
- Las páginas externas pueden devolver `403` o bloquear `HEAD` (por ejemplo Udemy). Eso no invalida automáticamente un enlace; se verifica mediante navegación normal o revisión manual antes de sustituirlo.

## Diseño de enlaces de certificaciones

`certifications.html.astro` presenta cada nombre como enlace directo a su fuente pública, con foco visible, apertura en pestaña nueva y una guía visual de contexto para revisar el emisor. La experiencia usa el mismo sistema de tarjetas e iconos del portfolio y se adapta a una columna en móvil.
