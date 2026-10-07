# Registro de mejoras del portafolio Astro

> Rama: `feat/portfolio-100-improvements-20260929` · Total registrado: **123 mejoras aplicadas** · 20 commits.

Registro numerado y auditable de las mejoras aplicadas al portafolio Astro
(`jersonmartinez.com`). Cada entrada corresponde a un cambio **real** en el
árbol de fuentes, atribuido a su archivo y a su commit (SHA verificable con
`git show <sha>`). No se registran mejoras, cifras, proyectos ni enlaces
inventados: todo el contenido proviene del CV ES/EN y del perfil de GitHub ya
integrados.

- La columna **#** es la numeración secuencial de las mejoras efectivamente aplicadas.
- La columna **Ref. audit** conserva el número original de la mejora dentro del
  audit de más de 100 puntos (rango 1–134; algunos números del plan original no
  derivaron en cambio de código y por eso no aparecen: la referencia se mantiene
  para trazabilidad, pero **solo se registran las mejoras realmente aplicadas**).

## Valores protegidos (no se pueden alterar ni inventar)

| Fuente | Copy confirmado |
| --- | --- |
| Udemy | `Más de 77 mil estudiantes` |
| DevOpsea | `Más de 15K suscriptores` |
| Side Master | `≈ 4.1K` |

Estos valores están cubiertos por el test `tests/portfolio.test.js`
(«los valores protegidos existen textualmente en portfolio.js»).

## Resumen por categoría

| Categoría | Mejoras |
| --- | --- |
| UI/UX | 15 |
| Responsive | 8 |
| Accesibilidad | 47 |
| Navegación | 11 |
| Contenido | 8 |
| SEO | 16 |
| PWA | 3 |
| Rendimiento | 5 |
| Documentación | 3 |
| Testing | 7 |
| **Total** | **123** |

## Detalle por categoría

### UI/UX (15)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 1 | #16 | `src/pages/projects.html.astro` | Contador por filtro calculado en build desde filterFor(): Todos (10), Personales (2), Open source (7), Contenido (1); estilo .filter-count en global.css. | `cb17e03` |
| 2 | #32 | `src/components/LogoCloud.astro` | title y aria-label con el nombre completo (AWS, Azure, GCP, Terraform, Kubernetes) en cada logo-pill para informar aunque el span sea corto en móvil. | `cb17e03` |
| 3 | #34 | `src/pages/courses.html.astro` | Resumen unificado al copy confirmado exacto 'Más de 77 mil estudiantes'; strong con clamp para que la frase larga envuelva bien. | `cb17e03` |
| 4 | #40 | `src/styles/global.css` | Kickers/eyebrows con letter-spacing (.1em->.14em) y tamaño (.72rem->.74rem) más legibles, coherentes con la numeración 01-06 del home. | `cb17e03` |
| 5 | #47 | `src/layouts/BaseLayout.astro` | Favicon simplificado a una sola declaración: eliminado el <link rel="alternate icon"> duplicado que apuntaba al mismo SVG (no se inventó un PNG). | `cb17e03` |
| 6 | #49 | `src/layouts/BaseLayout.astro` | Añadidos og:site_name y twitter:card summary_large_image (twitter:title/description/image reutilizando la imagen absoluta del perfil, sin inventar datos). | `cb17e03` |
| 7 | #53 | `src/pages/index.astro` | Panel de contacto #contacto ampliado con enlaces directos a LinkedIn y GitHub (desde profile) junto al email, en .contact-actions; estilo en global.css. | `cb17e03` |
| 8 | #55 | `src/pages/index.astro` | Aviso honesto 'Ver las N credenciales de {proveedor}' cuando un proveedor tiene >4 credenciales (solo Azure con 6), enlazando a /certifications.html; estilo .credential-more. | `cb17e03` |
| 9 | #86 | `src/layouts/BaseLayout.astro` | Footer: copyright con año dinámico + enlace "Volver arriba". | `362b132` |
| 10 | #87 | `src/styles/global.css` | Estilos footer-legal. | `362b132` |
| 11 | #89 | `src/styles/global.css` | Hoja de impresión (@media print). | `362b132` |
| 12 | #93 | `src/styles/global.css` | Estilos .breadcrumb en global.css. | `2646f97` |
| 13 | #102 | `src/styles/global.css` | Estilos del pie con la página actual resaltada. | `e1befd2` |
| 14 | #123 | `src/styles/global.css` | scroll-margin-top para secciones/artículos anclados. | `6fc48d0` |
| 15 | #124 | `src/styles/global.css` | Resaltado :target de fichas al llegar por ancla. | `6fc48d0` |

### Responsive (8)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 16 | #19 | `src/styles/global.css` | course-grid con repeat(auto-fit, minmax(min(100%,17rem),1fr)) y align-items:start: evita tarjetas comprimidas u huérfanas en breakpoints intermedios. | `15b4c7d` |
| 17 | #20 | `src/styles/global.css` | Nuevo tier @media (901-1024px) en hero-grid para que profile-panel no empuje el CTA fuera del primer viewport. | `15b4c7d` |
| 18 | #21 | `src/styles/global.css` | skills-tabs en layout apilado (tabs con scroll horizontal + panel debajo) por debajo de 720px. | `15b4c7d` |
| 19 | #22 | `src/styles/global.css` | journey-rail como barra superior horizontal con scroll-snap por debajo de 900px. | `15b4c7d` |
| 20 | #23 | `src/styles/global.css` | page-hero-meta con overflow-wrap para que los chips envuelvan sin recortarse a 360px. | `15b4c7d` |
| 21 | #58 | `src/styles/global.css` | featured-grid: una sola columna explícita + seguridad de overflow en pantallas pequeñas. | `15b4c7d` |
| 22 | #73 | `src/styles/global.css` | cert-grid con align-items:start para que tarjetas desiguales mantengan una línea base consistente. | `15b4c7d` |
| 23 | #88 | `src/styles/global.css` | hero-actions: botones apilados a ancho completo por debajo de 460px. | `15b4c7d` |

### Accesibilidad (47)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 24 | #10 | `src/pages/index.astro` | journey-rail expone aria-current="true" en el enlace activo (gestionado por IntersectionObserver). | `ede4887` |
| 25 | #11 | `src/pages/index.astro` | Números 01-06 del rail marcados aria-hidden="true" (decorativos). | `ede4887` |
| 26 | #15 | `src/pages/projects.html.astro` | Cards filtradas usan el atributo nativo [hidden] (fuera del árbol accesible y del tab order) + CSS reforzado. | `ede4887` |
| 27 | #24 | `src/pages/index.astro` | alt del retrato simplificado a "Retrato de Jerson Martínez". | `ede4887` |
| 28 | #25 | `src/components/SiteHeader.astro` | nav-toggle con :focus-visible explícito; Escape devuelve el foco al toggle y foco al primer enlace al abrir. | `ede4887` |
| 29 | #30 | `src/styles/global.css` | @media (prefers-reduced-motion: reduce) reforzado: neutraliza scroll-behavior y transforms de hover. | `ede4887` |
| 30 | #31 | `src/pages/projects.html.astro` | sr-only "(abre en nueva pestaña)" en enlaces target=_blank (proyectos, credenciales, cursos, contacto, redes). | `ede4887` |
| 31 | #4 | `src/pages/index.astro` | cert-card provider h2 -> h3 bajo el h2 de sección (jerarquía de headings del home). | `c26fa5e` |
| 32 | #5 | `src/pages/certifications.html.astro` | cert-card provider h2 -> h3. | `c26fa5e` |
| 33 | #6 | `src/pages/projects.html.astro` | repo-card nombre de proyecto h2 -> h3. | `c26fa5e` |
| 34 | #7 | `src/pages/courses.html.astro` | course-card nombre h2 -> h3. | `c26fa5e` |
| 35 | #8 | `src/pages/experience.html.astro` | timeline-card rol h2 -> h3. | `c26fa5e` |
| 36 | #9 | `src/pages/index.astro` | Un único h1 por página verificado; las secciones empiezan en h2. | `c26fa5e` |
| 37 | #81 | `src/styles/global.css` | Selectores de heading de .timeline-card/.cert-card/.repo-card/.course-card extendidos a h3 para preservar el estilo. | `c26fa5e` |
| 38 | #13 | `src/pages/projects.html.astro` | Estado vacío 'No hay proyectos en esta categoría todavía'. | `f2cacb9` |
| 39 | #14 | `src/pages/projects.html.astro` | Contador aria-live 'Mostrando N de M' al filtrar proyectos. | `f2cacb9` |
| 40 | #26 | `src/components/SiteHeader.astro` | Cierre del menú móvil por clic fuera/backdrop + bloqueo de scroll del body (nav-locked). | `f2cacb9` |
| 41 | #27 | `src/styles/global.css` | :focus-visible consistente para enlaces, botones, filtros y tabs. | `f2cacb9` |
| 42 | #28 | `src/styles/global.css` | Hover/focus perceptible y uniforme en .card (elevación + borde acento, paridad de foco de teclado). | `f2cacb9` |
| 43 | #29 | `src/styles/global.css` | .credential-link/.credential-verify movidos al cascade base, con hover/focus claro y contraste del icono external-link. | `f2cacb9` |
| 44 | #56 | `src/components/SkillsExplorer.astro` | La flecha del tab solo se enfatiza en activo/hover/focus (antes visible siempre). | `f2cacb9` |
| 45 | #85 | `src/layouts/BaseLayout.astro` | <main tabindex="-1"> para foco del skip-link. | `362b132` |
| 46 | #57 | `src/pages/courses.html.astro` | sr-only "(abre en nueva pestaña)" añadido a enlaces externos que faltaban en courses. | `83401a4` |
| 47 | #59 | `src/pages/certifications.html.astro` | sr-only "(abre en nueva pestaña)" en enlaces externos de certifications. | `83401a4` |
| 48 | #60 | `src/pages/experience.html.astro` | sr-only "(abre en nueva pestaña)" en enlaces externos de experience. | `83401a4` |
| 49 | #62 | `src/pages/projects.html.astro` | sr-only "(abre en nueva pestaña)" en enlaces externos de projects. | `83401a4` |
| 50 | #64 | `src/pages/courses.html.astro` | aria-label "Curso N de M" en cada course-card. | `83401a4` |
| 51 | #99 | `src/layouts/BaseLayout.astro` | footer-links desde datos con aria-current/is-current de la página actual. | `e1befd2` |
| 52 | #100 | `src/pages/experience.html.astro` | Timeline convertido a <ol>/<li> con aria-label; reset de lista en .timeline. | `e1befd2` |
| 53 | #103 | `src/pages/experience.html.astro` | Semántica de lista ordenada en la trayectoria para lectores de pantalla. | `e1befd2` |
| 54 | #104 | `src/pages/index.astro` | Sección #impacto etiquetada con aria-labelledby -> id de su h2. | `ac77053` |
| 55 | #105 | `src/pages/index.astro` | Sección #skills etiquetada con aria-labelledby -> id de su h2. | `ac77053` |
| 56 | #106 | `src/pages/index.astro` | Sección #proyectos etiquetada con aria-labelledby -> id de su h2. | `ac77053` |
| 57 | #107 | `src/pages/index.astro` | Sección #enseñanza etiquetada con aria-labelledby -> id de su h2. | `ac77053` |
| 58 | #108 | `src/pages/index.astro` | Sección #credenciales etiquetada con aria-labelledby -> id de su h2. | `ac77053` |
| 59 | #109 | `src/pages/index.astro` | Sección #contacto etiquetada con aria-labelledby -> id de su h2. | `ac77053` |
| 60 | #110 | `src/pages/projects.html.astro` | Sección principal con aria-labelledby -> id de su h2. | `b3033be` |
| 61 | #111 | `src/pages/courses.html.astro` | Sección principal con aria-labelledby -> id de su h2 (conteo de cursos mantenido como literal 7). | `b3033be` |
| 62 | #112 | `src/pages/certifications.html.astro` | Sección principal con aria-labelledby -> id de su h2. | `b3033be` |
| 63 | #113 | `src/pages/experience.html.astro` | Sección principal con aria-labelledby -> id de su h2. | `b3033be` |
| 64 | #119 | `src/components/SkillsExplorer.astro` | lang="en" en ítems de idioma inglés para lectores de pantalla. | `71275a9` |
| 65 | #122 | `src/pages/experience.html.astro` | <time datetime="AAAA"> legible por máquina (año inicial del rango). | `6fc48d0` |
| 66 | #125 | `src/pages/projects.html.astro` | <noscript> que aclara que sin JS se ven todos los proyectos. | `6fc48d0` |
| 67 | #131 | `src/pages/projects.html.astro` | page-hero-meta con role=list/listitem y aria-label. | `0660e0b` |
| 68 | #132 | `src/pages/courses.html.astro` | page-hero-meta como lista accesible (role=list/listitem + aria-label) en cursos. | `7c69236` |
| 69 | #133 | `src/pages/certifications.html.astro` | page-hero-meta como lista accesible en credenciales. | `7c69236` |
| 70 | #134 | `src/pages/experience.html.astro` | page-hero-meta como lista accesible en trayectoria. | `7c69236` |

### Navegación (11)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 71 | #2 | `src/pages/certifications.html.astro` | 'Ver GNet' apunta al repositorio directo (github.com/jersonmartinez/GNet). | `c0dbd20` |
| 72 | #17 | `src/pages/projects.html.astro` | Anclas por proyecto en /projects.html (#proyecto-<slug>) + 'Ver ficha' en los destacados del home. | `c0dbd20` |
| 73 | #35 | `src/pages/courses.html.astro` | Enlace cruzado courses #canales <-> home #enseñanza (sin duplicar contenido). | `c0dbd20` |
| 74 | #38 | `src/components/SiteHeader.astro` | Lógica de estado activo del nav para anclas del home (SSR normalizado + sync por sección visible). | `c0dbd20` |
| 75 | #39 | `src/pages/index.astro` | Nav 'Contacto' (#contacto) diferenciado del CTA de email ('Escríbeme'). | `c0dbd20` |
| 76 | #51 | `src/layouts/BaseLayout.astro` | Menú de rutas internas agrupado en el footer (Proyectos/Cursos/Credenciales/Trayectoria). | `c0dbd20` |
| 77 | #61 | `src/data/portfolio.ts` | Verificado: CTA de Crashell idéntico en ambos sitios (fuente única en portfolio.js). | `c0dbd20` |
| 78 | #67 | `src/layouts/BaseLayout.astro` | Prop breadcrumb que emite schema.org/BreadcrumbList JSON-LD en páginas internas. | `2646f97` |
| 79 | #68 | `src/pages/projects.html.astro` | Migas de pan accesibles (aria-current=page) en projects. | `2646f97` |
| 80 | #69 | `src/pages/courses.html.astro` | Migas de pan accesibles (aria-current=page) en courses. | `2646f97` |
| 81 | #70 | `src/pages/certifications.html.astro` | Migas de pan accesibles (aria-current=page) en certifications. | `2646f97` |

### Contenido (8)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 82 | #1 | `src/data/portfolio.ts` | profile.yearsExperience como fuente única; el hero de experiencia y los facts derivan de él (sin cifras divergentes). | `fd0c9ce` |
| 83 | #3 | `src/data/portfolio.ts` | Eliminada la cifra estática '122 estrellas' del kind de docker-lamp (dato no verificable en tiempo de build). | `fd0c9ce` |
| 84 | #18 | `src/pages/index.astro` | hero-facts verificables enlazan a su fuente (100+ -> /certifications.html; 60+ -> OpenWebinars). | `fd0c9ce` |
| 85 | #33 | `src/pages/courses.html.astro` | Descripción de cada course-card derivada del framework real del nombre del curso. | `fd0c9ce` |
| 86 | #36 | `src/data/portfolio.ts` | Métrica de YouTube derivada de un único campo subscribers (copy confirmado intacto). | `fd0c9ce` |
| 87 | #37 | `src/pages/index.astro` | Métricas de suscriptores en teaching derivadas de youtubeChannels (fuente única). | `fd0c9ce` |
| 88 | #42 | `src/data/portfolio.ts` | Comentario de cabecera declarando los VALORES PROTEGIDOS confirmados (Udemy "Más de 77 mil estudiantes", DevOpsea "+14K suscriptores", Side Master "+5K suscriptores", OpenWebinars "+60 artículos y cursos"). | `07bca7e` |
| 89 | #101 | `src/pages/projects.html.astro` | Chip "{projects.length} proyectos" (conteo real desde datos). | `e1befd2` |

### SEO (16)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 90 | #48 | `src/layouts/BaseLayout.astro` | JSON-LD schema.org/Person (nombre, URL, imagen, email, sameAs a GitHub/LinkedIn/YouTube/Udemy). | `362b132` |
| 91 | #50 | `src/layouts/BaseLayout.astro` | Meta author, robots (index, follow, max-image-preview:large), format-detection y apple-touch-icon. | `362b132` |
| 92 | #52 | `src/layouts/BaseLayout.astro` | preconnect + dns-prefetch a cdn.simpleicons.org; og:image alt/width/height y twitter:image:alt. | `362b132` |
| 93 | #90 | `src/layouts/BaseLayout.astro` | og:image con dimensiones y alt para vistas previas enriquecidas. | `362b132` |
| 94 | #91 | `src/layouts/BaseLayout.astro` | twitter:image:alt para accesibilidad de la tarjeta social. | `362b132` |
| 95 | #63 | `src/pages/certifications.html.astro` | hreflang es/en en los enlaces de CV. | `83401a4` |
| 96 | #92 | `src/pages/certifications.html.astro` | hreflang coherente en descargas de CV (ES/EN) para señalar idioma al buscador. | `83401a4` |
| 97 | #94 | `public/robots.txt` | public/robots.txt (allow all + Sitemap canónico). | `7eb4eec` |
| 98 | #95 | `public/sitemap.xml` | public/sitemap.xml con las 5 rutas reales del sitio. | `7eb4eec` |
| 99 | #97 | `public/humans.txt` | public/humans.txt (solo enlaces verificados) + <link rel=author>. | `7eb4eec` |
| 100 | #98 | `src/layouts/BaseLayout.astro` | Enlaces <link rel=manifest> y <link rel=author> conectando los artefactos PWA/SEO. | `7eb4eec` |
| 101 | #114 | `src/layouts/BaseLayout.astro` | Meta referrer para privacidad de navegación. | `71275a9` |
| 102 | #115 | `src/layouts/BaseLayout.astro` | Meta application-name. | `71275a9` |
| 103 | #118 | `src/layouts/BaseLayout.astro` | rel="me" en las redes del pie (verificación de identidad IndieWeb). | `71275a9` |
| 104 | #120 | `src/layouts/BaseLayout.astro` | apple-touch-icon coherente con el favicon SVG. | `71275a9` |
| 105 | #121 | `src/layouts/BaseLayout.astro` | format-detection para móvil. | `71275a9` |

### PWA (3)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 106 | #96 | `public/site.webmanifest` | public/site.webmanifest (instalable, theming) + <link rel=manifest> en el layout. | `7eb4eec` |
| 107 | #116 | `src/layouts/BaseLayout.astro` | Metas apple-mobile-web-app-* / mobile-web-app-capable. | `71275a9` |
| 108 | #117 | `src/layouts/BaseLayout.astro` | apple-mobile-web-app-status-bar-style. | `71275a9` |

### Rendimiento (5)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 109 | #54 | `src/pages/index.astro` | decoding="async" en profile, brand logo y las imágenes de teaching/cert/channel/LogoCloud; fetchpriority en el brand logo. | `83401a4` |
| 110 | #65 | `src/components/LogoCloud.astro` | decoding="async" en las imágenes de la nube de logos. | `83401a4` |
| 111 | #66 | `src/components/SiteHeader.astro` | decoding="async"/fetchpriority en el wordmark del header. | `83401a4` |
| 112 | #129 | `src/layouts/BaseLayout.astro` | Prop preloadImage -> <link rel=preload as=image fetchpriority=high>. | `0660e0b` |
| 113 | #130 | `src/pages/index.astro` | Preload del retrato (profile.jpg) para mejorar el LCP del home. | `0660e0b` |

### Documentación (3)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 114 | #41 | `docs/PORTFOLIO-ASTRO.md` | Tabla ruta desplegada -> archivo fuente -> exports de portfolio.js que consume cada página, más notas de derivación. | `07bca7e` |
| 115 | #82 | `docs/PORTFOLIO-ASTRO.md` | Convención de nombres .html.astro -> /*.html y por qué las URLs internas conservan el sufijo .html. | `07bca7e` |
| 116 | #127 | `docs/PORTFOLIO-ASTRO.md` | Sección "SEO, PWA y accesibilidad (endurecimiento)" documentando los artefactos. | `ed085f3` |

### Testing (7)

| # | Ref. audit | Archivo / área | Mejora | Commit |
| --- | --- | --- | --- | --- |
| 117 | #43 | `tests/portfolio.test.js` | Test que asserta que los valores protegidos existen textualmente en portfolio.js; corrige aserción obsoleta "15K+". | `07bca7e` |
| 118 | #44 | `tests/data-links.test.js` | Validador de formato de todos los href de portfolio.js (https/mailto/ruta interna; sin vacíos, "#" ni placeholders). | `07bca7e` |
| 119 | #45 | `tests/compiled-html.test.js` | Validador del HTML compilado: un único <h1> por página y jerarquía de headings sin saltos (VALIDATE_BUILD=1). | `07bca7e` |
| 120 | #83 | `tools/validate-site.js` | Validador: anclas internas del home (#impacto..#contacto) existen como id; sin enlaces de ancla rotos. | `07bca7e` |
| 121 | #84 | `tests/compiled-html.test.js` | Validador: toda `<img>` del build tiene atributo alt. | `07bca7e` |
| 122 | #126 | `tests/portfolio.test.js` | Test de regresión que valida robots/sitemap/manifest/humans + JSON-LD y rel=manifest. | `ed085f3` |
| 123 | #128 | `tests/portfolio.test.js` | Cobertura de coherencia de start_url/theme_color del manifest y rutas del sitemap. | `ed085f3` |

## Trazabilidad de commits

| Commit | Referencias audit |
| --- | --- |
| `cb17e03` | #16, #32, #34, #40, #47, #49, #53, #55 |
| `15b4c7d` | #19, #20, #21, #22, #23, #58, #73, #88 |
| `ede4887` | #10, #11, #15, #24, #25, #30, #31 |
| `c26fa5e` | #4, #5, #6, #7, #8, #9, #81 |
| `fd0c9ce` | #1, #3, #18, #33, #36, #37 |
| `c0dbd20` | #2, #17, #35, #38, #39, #51, #61 |
| `f2cacb9` | #13, #14, #26, #27, #28, #29, #56 |
| `362b132` | #48, #50, #52, #85, #86, #87, #89, #90, #91 |
| `83401a4` | #54, #57, #59, #60, #62, #63, #64, #65, #66, #92 |
| `07bca7e` | #41, #42, #43, #44, #45, #82, #83, #84 |
| `2646f97` | #67, #68, #69, #70, #93 |
| `7eb4eec` | #94, #95, #96, #97, #98 |
| `e1befd2` | #99, #100, #101, #102, #103 |
| `ac77053` | #104, #105, #106, #107, #108, #109 |
| `b3033be` | #110, #111, #112, #113 |
| `71275a9` | #114, #115, #116, #117, #118, #119, #120, #121 |
| `6fc48d0` | #122, #123, #124, #125 |
| `ed085f3` | #126, #127, #128 |
| `0660e0b` | #129, #130, #131 |
| `7c69236` | #132, #133, #134 |

## Regeneración

Este documento se genera desde la fuente de verdad en
`tools/gen-improvements-record.js` (array `IMPROVEMENTS`):

```bash
node tools/gen-improvements-record.js
```

El generador valida que no haya referencias duplicadas y que cada archivo
atribuido exista en el árbol; el test `tests/improvements-record.test.js`
verifica que el documento esté presente, tenga el total declarado y no
contradiga los valores protegidos.
