# Auditoría del repositorio — 30 mejoras y optimizaciones

Lote de auditoría tras los PR #22/#27/#28: fallos, puntos de optimización y
señales de calidad del repositorio, en un solo PR. Sin dependencias de ejecución
nuevas. Verificado contra el `dist` reconstruido en un contenedor Node 22 limpio y
con los gates completos.

## Rendimiento y peso

- **1 — Preload del héroe responsivo.** `BaseLayout` precargaba un `href` fijo
  (`profile-v2-640.webp`) mientras el `<picture>` del héroe elige entre 320/640/960
  por `sizes`. En anchos distintos de ~640 el recurso precargado no coincidía con el
  elegido: byte desperdiciado o sin beneficio de LCP. Ahora el `preload` lleva
  `imagesrcset` + `imagesizes` idénticos al `<source>`, así que el candidato
  precargado es exactamente el que pinta.
- **2 — Asset huérfano eliminado.** `public/brands/github.png` no se referencia en
  ninguna parte (el sitio usa `github.svg`). Peso muerto en repo y `dist`.
- **3 — `theme-color` del cromo antes del primer pintado.** Las dos
  `<meta name="theme-color">` condicionadas por `prefers-color-scheme` no siguen al
  tema ELEGIDO; hasta que corría `site.js`, un usuario con sistema oscuro y tema
  claro conservaba la barra del navegador oscura. `init.js` fija ahora una meta sin
  media antes del primer pintado.
- **4 — Cache-Control explícito para `/scripts/`.** Los scripts no llevan hash en el
  nombre; caían al default del proveedor. Se declara `max-age=3600, must-revalidate`
  (revalidación correcta para recursos mutables, frente al `immutable` de `/_astro/`).
- **5 — Guarda de CLS.** Las imágenes de primera parte ya declaraban `width`/`height`
  y los logos del ecosistema reservan `aspect-ratio`; se añade un gate que lo
  EXIGE en todo `<img>` del build para que no pueda regresar.

## SEO y datos estructurados

- **6 — `sitemap.xml` generado desde las rutas reales.** Era estático con `lastmod`
  fijo y propenso a drift (una ruta nueva no aparecía). `tools/gen-sitemap.js` lo
  genera desde las rutas indexables y una única fecha (`contentMeta.lastReviewed`),
  con `npm run sitemap:check` cableado a CI. Se eliminaron además las dos fechas
  hardcodeadas duplicadas en `check-headers.js` y en la suite: ahora derivan de la
  fuente única.
- **7 — `/.well-known/security.txt` (RFC 9116).** Contacto, política, idiomas y
  expiración; señal DevSecOps. Un gate verifica su presencia y que `Expires` no esté
  caducado.
- **8-10 — `Person` JSON-LD enriquecido.** `alumniOf` (UNAN-León, Ingeniería en
  Telemática), `knowsLanguage` (es, en) y `email`/contacto desde la fuente de datos.
- **11 — `og:locale:alternate` inexacto retirado.** Declaraba una versión en_US que
  no existe (no hay página localizada en inglés, sólo CV bilingüe).

## Accesibilidad

- **12 — `aria-hidden` en el `⌘K` decorativo.** El `<kbd>` del atajo lo leían algunos
  lectores de pantalla como ruido; el nombre accesible ya lo da el `aria-label` del
  botón.
- **13 — Indicación de nueva pestaña en los sociales del pie.** Coherencia con el
  resto de enlaces externos del sitio.

## Salud del repositorio y DX

- **14-21 —** `.editorconfig`, `.nvmrc` (22, alineado con `engines.node`),
  `.github/CODEOWNERS`, `SECURITY.md` (política de divulgación, distinta de
  `SECURITY-HEADERS.md`), plantilla de PR, plantillas de issue (fallo / contenido)
  con `config.yml` que desactiva issues en blanco y enlaza contacto, y metadatos de
  `package.json` (`repository`, `homepage`, `author`, `bugs`, `keywords`).

## CI y cadena de suministro

- **22 — CodeQL.** Análisis de JavaScript/TypeScript en `pull_request`, `push` a main
  y semanal, con las acciones fijadas por SHA y permisos mínimos. Cierra el hueco de
  "sin análisis de código" para un perfil DevSecOps.
- **23 — Badge de CodeQL** en la sección del repositorio del README (no en el héroe,
  para no recargar la portada orientada a reclutador).

## Gates y robustez

- **24 — Gate anti-asset-huérfano** en `public/brands`: cada logo debe estar
  referenciado en el sitio (habría cazado el `github.png` del punto 2).
- **25 — Gate de SEO por página:** `title`, `description` y `canonical` no vacíos en
  cada ruta indexable del build.
- **26 — Gate de integridad de imágenes:** toda imagen local referenciada existe en
  el build (`<img src>`), evitando rutas rotas silenciosas.

## Documentación

- **27 —** `CONTRIBUTING.md` conciso (requisitos, puesta en marcha y gates).
- **28 —** Este registro.
- **29 —** Cableado de `sitemap:check` a `validate.yml` y del lint de Markdown a
  `SECURITY.md` / `CONTRIBUTING.md`.
- **30 —** Coherencia de referencias (badge, scripts npm, metadatos) con el estado
  real del repositorio.

## Pendiente a decisión del propietario

Son ajustes de **configuración del repositorio** o decisiones legales, no de código:

- **Licencia.** No hay `LICENSE`; GitHub lo trata como "todos los derechos
  reservados" (coherente con el pie del sitio). Elegir y añadir una licencia explícita
  es una decisión del propietario.
- **Protección de rama `main`** y **GitHub Pages** (en conflicto con Vercel) y
  **Dependabot security updates / secret scanning**: ya señalados en PR #23; tocan
  control de acceso y despliegue.
- **OpenSSF Scorecard:** recomendable una vez activa la protección de rama (de la que
  depende para puntuar); se omite aquí porque no es verificable en el PR sin ella.

## Validación

Contenedor Node 22 desde `npm ci`: build 8 páginas, `astro check` 0/0/1, sprite
32/32, tests sobre el HTML compilado, `validate` (con los gates nuevos), `sitemap:check`,
`sync:static:check`, `headers`, `links`, `lint:css`, `youtube:dry-run`, markdownlint,
actionlint, y los gates pesados (axe, pa11y, Lighthouse). Preview desplegado comprobado.
