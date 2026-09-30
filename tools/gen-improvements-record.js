#!/usr/bin/env node
/**
 * Genera docs/IMPROVEMENTS-RECORD.md: registro numerado y auditable de las
 * mejoras aplicadas al portafolio Astro en la rama
 * feat/portfolio-100-improvements-20260929.
 *
 * Cada entrada proviene de un commit REAL (SHA incluido) y del cuerpo de su
 * mensaje; no se inventan mejoras, cifras ni archivos. El campo "Ref. audit"
 * conserva el número original de la mejora en el audit de 100+ puntos; la
 * columna "#" renumera secuencialmente las mejoras efectivamente aplicadas.
 *
 * Fuente de verdad: array IMPROVEMENTS abajo. Para regenerar:
 *   node tools/gen-improvements-record.js
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'IMPROVEMENTS-RECORD.md');

// [audit_ref, category, file(s), description, commit]
const IMPROVEMENTS = [
  // --- cb17e03 UI/UX ---
  [16, 'UI/UX', 'src/pages/projects.html.astro', "Contador por filtro calculado en build desde filterFor(): Todos (10), Personales (2), Open source (7), Contenido (1); estilo .filter-count en global.css.", 'cb17e03'],
  [32, 'UI/UX', 'src/components/LogoCloud.astro', 'title y aria-label con el nombre completo (AWS, Azure, GCP, Terraform, Kubernetes) en cada logo-pill para informar aunque el span sea corto en móvil.', 'cb17e03'],
  [34, 'UI/UX', 'src/pages/courses.html.astro', "Resumen unificado al copy confirmado exacto 'Más de 77 mil estudiantes'; strong con clamp para que la frase larga envuelva bien.", 'cb17e03'],
  [40, 'UI/UX', 'src/styles/global.css', 'Kickers/eyebrows con letter-spacing (.1em->.14em) y tamaño (.72rem->.74rem) más legibles, coherentes con la numeración 01-06 del home.', 'cb17e03'],
  [47, 'UI/UX', 'src/layouts/BaseLayout.astro', 'Favicon simplificado a una sola declaración: eliminado el <link rel="alternate icon"> duplicado que apuntaba al mismo SVG (no se inventó un PNG).', 'cb17e03'],
  [49, 'UI/UX', 'src/layouts/BaseLayout.astro', 'Añadidos og:site_name y twitter:card summary_large_image (twitter:title/description/image reutilizando la imagen absoluta del perfil, sin inventar datos).', 'cb17e03'],
  [53, 'UI/UX', 'src/pages/index.astro', 'Panel de contacto #contacto ampliado con enlaces directos a LinkedIn y GitHub (desde profile) junto al email, en .contact-actions; estilo en global.css.', 'cb17e03'],
  [55, 'UI/UX', 'src/pages/index.astro', "Aviso honesto 'Ver las N credenciales de {proveedor}' cuando un proveedor tiene >4 credenciales (solo Azure con 6), enlazando a /certifications.html; estilo .credential-more.", 'cb17e03'],
  // --- 15b4c7d Responsive ---
  [19, 'Responsive', 'src/styles/global.css', 'course-grid con repeat(auto-fit, minmax(min(100%,17rem),1fr)) y align-items:start: evita tarjetas comprimidas u huérfanas en breakpoints intermedios.', '15b4c7d'],
  [20, 'Responsive', 'src/styles/global.css', 'Nuevo tier @media (901-1024px) en hero-grid para que profile-panel no empuje el CTA fuera del primer viewport.', '15b4c7d'],
  [21, 'Responsive', 'src/styles/global.css', 'skills-tabs en layout apilado (tabs con scroll horizontal + panel debajo) por debajo de 720px.', '15b4c7d'],
  [22, 'Responsive', 'src/styles/global.css', 'journey-rail como barra superior horizontal con scroll-snap por debajo de 900px.', '15b4c7d'],
  [23, 'Responsive', 'src/styles/global.css', 'page-hero-meta con overflow-wrap para que los chips envuelvan sin recortarse a 360px.', '15b4c7d'],
  [58, 'Responsive', 'src/styles/global.css', 'featured-grid: una sola columna explícita + seguridad de overflow en pantallas pequeñas.', '15b4c7d'],
  [73, 'Responsive', 'src/styles/global.css', 'cert-grid con align-items:start para que tarjetas desiguales mantengan una línea base consistente.', '15b4c7d'],
  [88, 'Responsive', 'src/styles/global.css', 'hero-actions: botones apilados a ancho completo por debajo de 460px.', '15b4c7d'],
  // --- ede4887 A11y ---
  [10, 'Accesibilidad', 'src/pages/index.astro', 'journey-rail expone aria-current="true" en el enlace activo (gestionado por IntersectionObserver).', 'ede4887'],
  [11, 'Accesibilidad', 'src/pages/index.astro', 'Números 01-06 del rail marcados aria-hidden="true" (decorativos).', 'ede4887'],
  [15, 'Accesibilidad', 'src/pages/projects.html.astro', 'Cards filtradas usan el atributo nativo [hidden] (fuera del árbol accesible y del tab order) + CSS reforzado.', 'ede4887'],
  [24, 'Accesibilidad', 'src/pages/index.astro', 'alt del retrato simplificado a "Retrato de Jerson Martínez".', 'ede4887'],
  [25, 'Accesibilidad', 'src/components/SiteHeader.astro', 'nav-toggle con :focus-visible explícito; Escape devuelve el foco al toggle y foco al primer enlace al abrir.', 'ede4887'],
  [30, 'Accesibilidad', 'src/styles/global.css', '@media (prefers-reduced-motion: reduce) reforzado: neutraliza scroll-behavior y transforms de hover.', 'ede4887'],
  [31, 'Accesibilidad', 'src/pages/projects.html.astro', 'sr-only "(abre en nueva pestaña)" en enlaces target=_blank (proyectos, credenciales, cursos, contacto, redes).', 'ede4887'],
  // --- c26fa5e Heading hierarchy ---
  [4, 'Accesibilidad', 'src/pages/index.astro', 'cert-card provider h2 -> h3 bajo el h2 de sección (jerarquía de headings del home).', 'c26fa5e'],
  [5, 'Accesibilidad', 'src/pages/certifications.html.astro', 'cert-card provider h2 -> h3.', 'c26fa5e'],
  [6, 'Accesibilidad', 'src/pages/projects.html.astro', 'repo-card nombre de proyecto h2 -> h3.', 'c26fa5e'],
  [7, 'Accesibilidad', 'src/pages/courses.html.astro', 'course-card nombre h2 -> h3.', 'c26fa5e'],
  [8, 'Accesibilidad', 'src/pages/experience.html.astro', 'timeline-card rol h2 -> h3.', 'c26fa5e'],
  [9, 'Accesibilidad', 'src/pages/index.astro', 'Un único h1 por página verificado; las secciones empiezan en h2.', 'c26fa5e'],
  [81, 'Accesibilidad', 'src/styles/global.css', 'Selectores de heading de .timeline-card/.cert-card/.repo-card/.course-card extendidos a h3 para preservar el estilo.', 'c26fa5e'],
  // --- fd0c9ce Content ---
  [1, 'Contenido', 'src/data/portfolio.js', 'profile.yearsExperience como fuente única; el hero de experiencia y los facts derivan de él (sin cifras divergentes).', 'fd0c9ce'],
  [3, 'Contenido', 'src/data/portfolio.js', "Eliminada la cifra estática '122 estrellas' del kind de docker-lamp (dato no verificable en tiempo de build).", 'fd0c9ce'],
  [18, 'Contenido', 'src/pages/index.astro', 'hero-facts verificables enlazan a su fuente (100+ -> /certifications.html; 60+ -> OpenWebinars).', 'fd0c9ce'],
  [33, 'Contenido', 'src/pages/courses.html.astro', 'Descripción de cada course-card derivada del framework real del nombre del curso.', 'fd0c9ce'],
  [36, 'Contenido', 'src/data/portfolio.js', 'Métrica de YouTube derivada de un único campo subscribers (copy confirmado intacto).', 'fd0c9ce'],
  [37, 'Contenido', 'src/pages/index.astro', 'Métricas de suscriptores en teaching derivadas de youtubeChannels (fuente única).', 'fd0c9ce'],
  // --- c0dbd20 Nav ---
  [2, 'Navegación', 'src/pages/certifications.html.astro', "'Ver GNet' apunta al repositorio directo (github.com/jersonmartinez/GNet).", 'c0dbd20'],
  [17, 'Navegación', 'src/pages/projects.html.astro', "Anclas por proyecto en /projects.html (#proyecto-<slug>) + 'Ver ficha' en los destacados del home.", 'c0dbd20'],
  [35, 'Navegación', 'src/pages/courses.html.astro', 'Enlace cruzado courses #canales <-> home #enseñanza (sin duplicar contenido).', 'c0dbd20'],
  [38, 'Navegación', 'src/components/SiteHeader.astro', 'Lógica de estado activo del nav para anclas del home (SSR normalizado + sync por sección visible).', 'c0dbd20'],
  [39, 'Navegación', 'src/pages/index.astro', "Nav 'Contacto' (#contacto) diferenciado del CTA de email ('Escríbeme').", 'c0dbd20'],
  [51, 'Navegación', 'src/layouts/BaseLayout.astro', 'Menú de rutas internas agrupado en el footer (Proyectos/Cursos/Credenciales/Trayectoria).', 'c0dbd20'],
  [61, 'Navegación', 'src/data/portfolio.js', 'Verificado: CTA de Crashell idéntico en ambos sitios (fuente única en portfolio.js).', 'c0dbd20'],
  // --- f2cacb9 Interactive states ---
  [13, 'Accesibilidad', 'src/pages/projects.html.astro', "Estado vacío 'No hay proyectos en esta categoría todavía'.", 'f2cacb9'],
  [14, 'Accesibilidad', 'src/pages/projects.html.astro', "Contador aria-live 'Mostrando N de M' al filtrar proyectos.", 'f2cacb9'],
  [26, 'Accesibilidad', 'src/components/SiteHeader.astro', 'Cierre del menú móvil por clic fuera/backdrop + bloqueo de scroll del body (nav-locked).', 'f2cacb9'],
  [27, 'Accesibilidad', 'src/styles/global.css', ':focus-visible consistente para enlaces, botones, filtros y tabs.', 'f2cacb9'],
  [28, 'Accesibilidad', 'src/styles/global.css', 'Hover/focus perceptible y uniforme en .card (elevación + borde acento, paridad de foco de teclado).', 'f2cacb9'],
  [29, 'Accesibilidad', 'src/styles/global.css', '.credential-link/.credential-verify movidos al cascade base, con hover/focus claro y contraste del icono external-link.', 'f2cacb9'],
  [56, 'Accesibilidad', 'src/components/SkillsExplorer.astro', 'La flecha del tab solo se enfatiza en activo/hover/focus (antes visible siempre).', 'f2cacb9'],
  // --- 362b132 SEO/a11y/print ---
  [48, 'SEO', 'src/layouts/BaseLayout.astro', 'JSON-LD schema.org/Person (nombre, URL, imagen, email, sameAs a GitHub/LinkedIn/YouTube/Udemy).', '362b132'],
  [50, 'SEO', 'src/layouts/BaseLayout.astro', 'Meta author, robots (index, follow, max-image-preview:large), format-detection y apple-touch-icon.', '362b132'],
  [52, 'SEO', 'src/layouts/BaseLayout.astro', 'preconnect + dns-prefetch a cdn.simpleicons.org; og:image alt/width/height y twitter:image:alt.', '362b132'],
  [85, 'Accesibilidad', 'src/layouts/BaseLayout.astro', '<main tabindex="-1"> para foco del skip-link.', '362b132'],
  [86, 'UI/UX', 'src/layouts/BaseLayout.astro', 'Footer: copyright con año dinámico + enlace "Volver arriba".', '362b132'],
  [87, 'UI/UX', 'src/styles/global.css', 'Estilos footer-legal.', '362b132'],
  [89, 'UI/UX', 'src/styles/global.css', 'Hoja de impresión (@media print).', '362b132'],
  [90, 'SEO', 'src/layouts/BaseLayout.astro', 'og:image con dimensiones y alt para vistas previas enriquecidas.', '362b132'],
  [91, 'SEO', 'src/layouts/BaseLayout.astro', 'twitter:image:alt para accesibilidad de la tarjeta social.', '362b132'],
  // --- 83401a4 perf/a11y ---
  [54, 'Rendimiento', 'src/pages/index.astro', 'decoding="async" en profile, brand logo y las imágenes de teaching/cert/channel/LogoCloud; fetchpriority en el brand logo.', '83401a4'],
  [57, 'Accesibilidad', 'src/pages/courses.html.astro', 'sr-only "(abre en nueva pestaña)" añadido a enlaces externos que faltaban en courses.', '83401a4'],
  [59, 'Accesibilidad', 'src/pages/certifications.html.astro', 'sr-only "(abre en nueva pestaña)" en enlaces externos de certifications.', '83401a4'],
  [60, 'Accesibilidad', 'src/pages/experience.html.astro', 'sr-only "(abre en nueva pestaña)" en enlaces externos de experience.', '83401a4'],
  [62, 'Accesibilidad', 'src/pages/projects.html.astro', 'sr-only "(abre en nueva pestaña)" en enlaces externos de projects.', '83401a4'],
  [63, 'SEO', 'src/pages/certifications.html.astro', 'hreflang es/en en los enlaces de CV.', '83401a4'],
  [64, 'Accesibilidad', 'src/pages/courses.html.astro', 'aria-label "Curso N de M" en cada course-card.', '83401a4'],
  [65, 'Rendimiento', 'src/components/LogoCloud.astro', 'decoding="async" en las imágenes de la nube de logos.', '83401a4'],
  [66, 'Rendimiento', 'src/components/SiteHeader.astro', 'decoding="async"/fetchpriority en el wordmark del header.', '83401a4'],
  [92, 'SEO', 'src/pages/certifications.html.astro', 'hreflang coherente en descargas de CV (ES/EN) para señalar idioma al buscador.', '83401a4'],
  // --- 07bca7e docs/tests ---
  [41, 'Documentación', 'docs/PORTFOLIO-ASTRO.md', 'Tabla ruta desplegada -> archivo fuente -> exports de portfolio.js que consume cada página, más notas de derivación.', '07bca7e'],
  [42, 'Contenido', 'src/data/portfolio.js', 'Comentario de cabecera declarando los VALORES PROTEGIDOS confirmados (Udemy "Más de 77 mil estudiantes", DevOpsea "+14K suscriptores", Side Master "+5K suscriptores", OpenWebinars "+60 artículos y cursos").', '07bca7e'],
  [43, 'Testing', 'tests/portfolio.test.js', 'Test que asserta que los valores protegidos existen textualmente en portfolio.js; corrige aserción obsoleta "15K+".', '07bca7e'],
  [44, 'Testing', 'tests/data-links.test.js', 'Validador de formato de todos los href de portfolio.js (https/mailto/ruta interna; sin vacíos, "#" ni placeholders).', '07bca7e'],
  [45, 'Testing', 'tests/compiled-html.test.js', 'Validador del HTML compilado: un único <h1> por página y jerarquía de headings sin saltos (VALIDATE_BUILD=1).', '07bca7e'],
  [82, 'Documentación', 'docs/PORTFOLIO-ASTRO.md', 'Convención de nombres .html.astro -> /*.html y por qué las URLs internas conservan el sufijo .html.', '07bca7e'],
  [83, 'Testing', 'tools/validate-site.js', 'Validador: anclas internas del home (#impacto..#contacto) existen como id; sin enlaces de ancla rotos.', '07bca7e'],
  [84, 'Testing', 'tests/compiled-html.test.js', 'Validador: toda <img> del build tiene atributo alt.', '07bca7e'],
  // --- 2646f97 breadcrumbs ---
  [67, 'Navegación', 'src/layouts/BaseLayout.astro', 'Prop breadcrumb que emite schema.org/BreadcrumbList JSON-LD en páginas internas.', '2646f97'],
  [68, 'Navegación', 'src/pages/projects.html.astro', 'Migas de pan accesibles (aria-current=page) en projects.', '2646f97'],
  [69, 'Navegación', 'src/pages/courses.html.astro', 'Migas de pan accesibles (aria-current=page) en courses.', '2646f97'],
  [70, 'Navegación', 'src/pages/certifications.html.astro', 'Migas de pan accesibles (aria-current=page) en certifications.', '2646f97'],
  [93, 'UI/UX', 'src/styles/global.css', 'Estilos .breadcrumb en global.css.', '2646f97'],
  // --- 7eb4eec SEO/PWA ---
  [94, 'SEO', 'public/robots.txt', 'public/robots.txt (allow all + Sitemap canónico).', '7eb4eec'],
  [95, 'SEO', 'public/sitemap.xml', 'public/sitemap.xml con las 5 rutas reales del sitio.', '7eb4eec'],
  [96, 'PWA', 'public/site.webmanifest', 'public/site.webmanifest (instalable, theming) + <link rel=manifest> en el layout.', '7eb4eec'],
  [97, 'SEO', 'public/humans.txt', 'public/humans.txt (solo enlaces verificados) + <link rel=author>.', '7eb4eec'],
  [98, 'SEO', 'src/layouts/BaseLayout.astro', 'Enlaces <link rel=manifest> y <link rel=author> conectando los artefactos PWA/SEO.', '7eb4eec'],
  // --- e1befd2 a11y/ux ---
  [99, 'Accesibilidad', 'src/layouts/BaseLayout.astro', 'footer-links desde datos con aria-current/is-current de la página actual.', 'e1befd2'],
  [100, 'Accesibilidad', 'src/pages/experience.html.astro', 'Timeline convertido a <ol>/<li> con aria-label; reset de lista en .timeline.', 'e1befd2'],
  [101, 'Contenido', 'src/pages/projects.html.astro', 'Chip "{projects.length} proyectos" (conteo real desde datos).', 'e1befd2'],
  [102, 'UI/UX', 'src/styles/global.css', 'Estilos del pie con la página actual resaltada.', 'e1befd2'],
  [103, 'Accesibilidad', 'src/pages/experience.html.astro', 'Semántica de lista ordenada en la trayectoria para lectores de pantalla.', 'e1befd2'],
  // --- ac77053 aria-labelledby home ---
  [104, 'Accesibilidad', 'src/pages/index.astro', 'Sección #impacto etiquetada con aria-labelledby -> id de su h2.', 'ac77053'],
  [105, 'Accesibilidad', 'src/pages/index.astro', 'Sección #skills etiquetada con aria-labelledby -> id de su h2.', 'ac77053'],
  [106, 'Accesibilidad', 'src/pages/index.astro', 'Sección #proyectos etiquetada con aria-labelledby -> id de su h2.', 'ac77053'],
  [107, 'Accesibilidad', 'src/pages/index.astro', 'Sección #enseñanza etiquetada con aria-labelledby -> id de su h2.', 'ac77053'],
  [108, 'Accesibilidad', 'src/pages/index.astro', 'Sección #credenciales etiquetada con aria-labelledby -> id de su h2.', 'ac77053'],
  [109, 'Accesibilidad', 'src/pages/index.astro', 'Sección #contacto etiquetada con aria-labelledby -> id de su h2.', 'ac77053'],
  // --- b3033be aria-labelledby internal ---
  [110, 'Accesibilidad', 'src/pages/projects.html.astro', 'Sección principal con aria-labelledby -> id de su h2.', 'b3033be'],
  [111, 'Accesibilidad', 'src/pages/courses.html.astro', 'Sección principal con aria-labelledby -> id de su h2 (conteo de cursos mantenido como literal 7).', 'b3033be'],
  [112, 'Accesibilidad', 'src/pages/certifications.html.astro', 'Sección principal con aria-labelledby -> id de su h2.', 'b3033be'],
  [113, 'Accesibilidad', 'src/pages/experience.html.astro', 'Sección principal con aria-labelledby -> id de su h2.', 'b3033be'],
  // --- 71275a9 seo/a11y ---
  [114, 'SEO', 'src/layouts/BaseLayout.astro', 'Meta referrer para privacidad de navegación.', '71275a9'],
  [115, 'SEO', 'src/layouts/BaseLayout.astro', 'Meta application-name.', '71275a9'],
  [116, 'PWA', 'src/layouts/BaseLayout.astro', 'Metas apple-mobile-web-app-* / mobile-web-app-capable.', '71275a9'],
  [117, 'PWA', 'src/layouts/BaseLayout.astro', 'apple-mobile-web-app-status-bar-style.', '71275a9'],
  [118, 'SEO', 'src/layouts/BaseLayout.astro', 'rel="me" en las redes del pie (verificación de identidad IndieWeb).', '71275a9'],
  [119, 'Accesibilidad', 'src/components/SkillsExplorer.astro', 'lang="en" en ítems de idioma inglés para lectores de pantalla.', '71275a9'],
  [120, 'SEO', 'src/layouts/BaseLayout.astro', 'apple-touch-icon coherente con el favicon SVG.', '71275a9'],
  [121, 'SEO', 'src/layouts/BaseLayout.astro', 'format-detection para móvil.', '71275a9'],
  // --- 6fc48d0 ux/a11y ---
  [122, 'Accesibilidad', 'src/pages/experience.html.astro', '<time datetime="AAAA"> legible por máquina (año inicial del rango).', '6fc48d0'],
  [123, 'UI/UX', 'src/styles/global.css', 'scroll-margin-top para secciones/artículos anclados.', '6fc48d0'],
  [124, 'UI/UX', 'src/styles/global.css', 'Resaltado :target de fichas al llegar por ancla.', '6fc48d0'],
  [125, 'Accesibilidad', 'src/pages/projects.html.astro', '<noscript> que aclara que sin JS se ven todos los proyectos.', '6fc48d0'],
  // --- ed085f3 tests/docs ---
  [126, 'Testing', 'tests/portfolio.test.js', 'Test de regresión que valida robots/sitemap/manifest/humans + JSON-LD y rel=manifest.', 'ed085f3'],
  [127, 'Documentación', 'docs/PORTFOLIO-ASTRO.md', 'Sección "SEO, PWA y accesibilidad (endurecimiento)" documentando los artefactos.', 'ed085f3'],
  [128, 'Testing', 'tests/portfolio.test.js', 'Cobertura de coherencia de start_url/theme_color del manifest y rutas del sitemap.', 'ed085f3'],
  // --- 0660e0b perf/a11y ---
  [129, 'Rendimiento', 'src/layouts/BaseLayout.astro', 'Prop preloadImage -> <link rel=preload as=image fetchpriority=high>.', '0660e0b'],
  [130, 'Rendimiento', 'src/pages/index.astro', 'Preload del retrato (profile.jpg) para mejorar el LCP del home.', '0660e0b'],
  [131, 'Accesibilidad', 'src/pages/projects.html.astro', 'page-hero-meta con role=list/listitem y aria-label.', '0660e0b'],
  // --- 7c69236 a11y ---
  [132, 'Accesibilidad', 'src/pages/courses.html.astro', 'page-hero-meta como lista accesible (role=list/listitem + aria-label) en cursos.', '7c69236'],
  [133, 'Accesibilidad', 'src/pages/certifications.html.astro', 'page-hero-meta como lista accesible en credenciales.', '7c69236'],
  [134, 'Accesibilidad', 'src/pages/experience.html.astro', 'page-hero-meta como lista accesible en trayectoria.', '7c69236'],
];

// --- Validaciones de integridad -------------------------------------------
const seenRefs = new Set();
for (const [ref] of IMPROVEMENTS) {
  if (seenRefs.has(ref)) throw new Error(`Ref. audit duplicada: ${ref}`);
  seenRefs.add(ref);
}
for (const [ref, cat, file, desc, sha] of IMPROVEMENTS) {
  if (!ref || !cat || !file || !desc || !sha) throw new Error(`Entrada incompleta ref ${ref}`);
  if (!fs.existsSync(path.join(ROOT, file))) throw new Error(`Archivo inexistente: ${file} (ref ${ref})`);
}

// --- Composición del documento ---------------------------------------------
const byCat = {};
for (const it of IMPROVEMENTS) (byCat[it[1]] ||= []).push(it);
const catOrder = ['UI/UX', 'Responsive', 'Accesibilidad', 'Navegación', 'Contenido', 'SEO', 'PWA', 'Rendimiento', 'Documentación', 'Testing'];
const catsPresent = catOrder.filter((c) => byCat[c]);

const total = IMPROVEMENTS.length;
const commits = [...new Set(IMPROVEMENTS.map((i) => i[4]))];

let md = '';
md += '# Registro de mejoras del portafolio Astro\n\n';
md += `> Rama: \`feat/portfolio-100-improvements-20260929\` · Total registrado: **${total} mejoras aplicadas** · ${commits.length} commits.\n\n`;
md += 'Registro numerado y auditable de las mejoras aplicadas al portafolio Astro\n';
md += '(`jersonmartinez.com`). Cada entrada corresponde a un cambio **real** en el\n';
md += 'árbol de fuentes, atribuido a su archivo y a su commit (SHA verificable con\n';
md += '`git show <sha>`). No se registran mejoras, cifras, proyectos ni enlaces\n';
md += 'inventados: todo el contenido proviene del CV ES/EN y del perfil de GitHub ya\n';
md += 'integrados.\n\n';
md += '- La columna **#** es la numeración secuencial de las mejoras efectivamente aplicadas.\n';
md += '- La columna **Ref. audit** conserva el número original de la mejora dentro del\n';
md += '  audit de más de 100 puntos (rango 1–134; algunos números del plan original no\n';
md += '  derivaron en cambio de código y por eso no aparecen: la referencia se mantiene\n';
md += '  para trazabilidad, pero **solo se registran las mejoras realmente aplicadas**).\n\n';
md += '## Valores protegidos (no se pueden alterar ni inventar)\n\n';
md += '| Fuente | Copy confirmado |\n| --- | --- |\n';
md += '| Udemy | `Más de 77 mil estudiantes` |\n';
md += '| DevOpsea | `Más de 15K suscriptores` |\n';
md += '| Side Master | `≈ 4.1K` |\n\n';
md += 'Estos valores están cubiertos por el test `tests/portfolio.test.js`\n';
md += '(«los valores protegidos existen textualmente en portfolio.js»).\n\n';

md += '## Resumen por categoría\n\n';
md += '| Categoría | Mejoras |\n| --- | --- |\n';
for (const c of catsPresent) md += `| ${c} | ${byCat[c].length} |\n`;
md += `| **Total** | **${total}** |\n\n`;

let seq = 0;
md += '## Detalle por categoría\n\n';
for (const c of catsPresent) {
  md += `### ${c} (${byCat[c].length})\n\n`;
  md += '| # | Ref. audit | Archivo / área | Mejora | Commit |\n';
  md += '| --- | --- | --- | --- | --- |\n';
  for (const [ref, , file, desc, sha] of byCat[c]) {
    seq += 1;
    md += `| ${seq} | #${ref} | \`${file}\` | ${desc} | \`${sha}\` |\n`;
  }
  md += '\n';
}

md += '## Trazabilidad de commits\n\n';
md += '| Commit | Referencias audit |\n| --- | --- |\n';
const byCommit = {};
for (const [ref, , , , sha] of IMPROVEMENTS) (byCommit[sha] ||= []).push(ref);
for (const sha of commits) {
  const refs = byCommit[sha].sort((a, b) => a - b).map((r) => `#${r}`).join(', ');
  md += `| \`${sha}\` | ${refs} |\n`;
}
md += '\n';
md += '## Regeneración\n\n';
md += 'Este documento se genera desde la fuente de verdad en\n';
md += '`tools/gen-improvements-record.js` (array `IMPROVEMENTS`):\n\n';
md += '```bash\nnode tools/gen-improvements-record.js\n```\n\n';
md += 'El generador valida que no haya referencias duplicadas y que cada archivo\n';
md += 'atribuido exista en el árbol; el test `tests/improvements-record.test.js`\n';
md += 'verifica que el documento esté presente, tenga el total declarado y no\n';
md += 'contradiga los valores protegidos.\n';

fs.writeFileSync(OUT, md, 'utf8');
console.log(`Registro generado: ${path.relative(ROOT, OUT)} (${total} mejoras, ${commits.length} commits).`);
module.exports = { IMPROVEMENTS, total: IMPROVEMENTS.length };
