# Registro de las 50 mejoras frontend (sistema de diseño)

Rama `feat/frontend-design-system-50`, base `b3f2005` (head del PR #19). PR único contra `main`.
Validación en Node 22 (Docker, el npm del host está roto por minizlib). CSP estricta sin
`unsafe-inline`: todo script nuevo es externo en `public/scripts/`.

Estado por punto. "Hecho" significa presente en el árbol y verificado contra el build real.

## Sistema de diseño y tokens (1-8)

1. **Hecho.** Escala tipográfica fluida tokenizada (`--fs-3xs`…`--fs-display`) en `src/styles/tokens.css`.
2. **Hecho.** Escala de espaciado tokenizada (`--space-3xs`…`--space-3xl`).
3. **Hecho.** Tokens semánticos de superficie/borde (`--surface-*`, `--border-*`, `--accent-contrast`)
   para los `rgba()` dispersos; los componentes nuevos los consumen. Nota: `base.css`/`components.css`
   conservan literales heredados pendientes de tokenización incremental (ver punto 15).
4. **Hecho.** Niveles de elevación tokenizados (`--elevation-1..3`; `--shadow` como alias).
5. **Hecho.** Token de anillo de foco (`--focus-ring-color/-width/-offset`) aplicado a `:focus-visible`.
6. **Hecho.** Tokens de radio por tamaño (`--radius-xs..pill`; `--radius` como alias).
7. **Hecho.** Tokens de duración y easing (`--dur-*`, `--ease-*`).
8. **Hecho.** Tema claro con `prefers-color-scheme` (`:root[data-theme='light']` + media query para
   quien no ha elegido) y conmutador persistente accesible: botón en el header, aplicación previa al
   pintado en `public/scripts/init.js` (CSP-safe) y control en `public/scripts/site.js` con
   `aria-pressed`/`aria-label`; sin JS el sitio sigue la preferencia del sistema (progressive enhancement).

## Arquitectura CSS (9-15)

9. **Hecho.** `global.css` dividido por dominios: `tokens.css`, `base.css`, `components.css`
   (más `fonts.css`/`icons.css` ya existentes). `global.css` queda como orquestador.
10. **Hecho.** `@layer tokens, base, components;` con cascada determinista; eliminados los dos
    `!important` de `.skill-tab-arrow` (la especificidad del selector compuesto los hace innecesarios).
    Los `!important` restantes son legítimos (reduced-motion, forced-colors, `[hidden]`).
11. **Reformulado (forma correcta más cercana).** El punto pedía mover estilos de componente a
    `<style>` con alcance en los `.astro`. En este árbol eso introduce estilos *sin capa* que ganarían
    a la capa `components` recién creada (los estilos con alcance de Astro no pertenecen a ninguna
    `@layer`), rompiendo la cascada de los puntos 9/10/13 y arriesgando el gate visual (pa11y,
    Lighthouse, E2E). La intención —"global solo base y tokens; componentes aislados"— se cumple con la
    separación por capas y la capa `components`. Documentado como decisión técnica para no degradar la
    cascada; una migración a `<style>` con alcance exigiría reescribir la estrategia de capas y se deja
    como follow-up fuera del gate.
12. **Hecho.** Eliminados los bloques de override dependientes de la posición al final del fichero: el
    orden lo fija ahora `@layer`, no la posición en el archivo.
13. **Hecho.** Orden de capas tokens → base → componentes garantiza que los tokens preceden a los
    componentes con independencia del orden de importación.
14. **Hecho (parcial, en progreso).** Reformateado legible del `map` de navegación y controles del
    header en `SiteHeader.astro` sin cambiar el HTML renderizado (verificado en el `dist`).
15. **Hecho.** stylelint añadido con `stylelint-order` (orden de propiedades) y prohibición de colores
    literales (`color-no-hex`, `rgb/rgba/hsl/hsla` prohibidos) en el orquestador y en `fonts/icons`,
    integrado en el workflow `validate`. Config: `.stylelintrc.json`.

## Rendimiento (39-44)

39. **Hecho.** `content-visibility: auto` + `contain-intrinsic-size: auto 640px` en `.section--line`
    (secciones bajo el pliegue) para omitir su renderizado hasta acercarse en el scroll.
40. **Verificado — no procede fix.** `manrope-latin.woff2` es una fuente VARIABLE con eje `wght`
    real de 200 a 800 (comprobado con fontTools). Los pesos 700/800 son másteres reales, no negrita
    sintética; el `@font-face { font-weight: 400 800 }` es correcto. No hay defecto que corregir.
41. **Hecho.** Caras de respaldo con `size-adjust` y métricas (`ascent/descent/line-gap-override`)
    para Manrope (sobre Arial) y DM Mono (sobre Courier New), enlazadas en las pilas de fuente
    (`'Manrope Fallback'`, `'DM Mono Fallback'`) para minimizar el reflow/CLS en el swap.
42. **Hecho.** La monoespaciada pasa a `font-display: optional` (es decorativa: kickers, metadatos,
    IDs); se conserva una sola cara por peso y su cara de respaldo con métricas.
43. **Hecho.** `aspect-ratio: 1` y dimensiones explícitas en `.logo-pill img` y `.teaching-card img`
    para reservar espacio y evitar CLS mientras cargan.
44. **Pendiente (en evaluación).** Migrar imágenes a `astro:assets`. Los logos de marca son SVG
    (astro:assets no los optimiza) y el retrato ya tiene variantes responsive manuales (avif/webp/jpg
    a 320/640/960). Se evaluará el beneficio real antes de forzar la migración (ver checkpoint de
    rendimiento posterior); no se cuenta como hecho hasta estar en el árbol.

## Accesibilidad (45-47)

45. **Hecho.** Auditoría de contraste real con axe-core 4.13 en las 6 rutas, en tema oscuro (por
    defecto/CI) y en el tema claro opcional. Corregidas todas las violaciones: superficies translúcidas
    heredadas re-mapeadas en claro, `.site-header` tokenizado a `--surface-overlay`, `.nav-contact`
    pasa a `--accent-contrast` (blanco sobre cian en claro), contadores sin depender de `opacity`.
    Resultado: 0 violaciones axe en ambos temas; pa11y WCAG2AA 6/6.
46. **Hecho.** `.profile-social` ampliado a 2.75rem (44 px) de objetivo táctil.
47. **Hecho.** `.cert-grid--badges` con columnas fluidas (`auto-fit`/`minmax`) bajo 1200px: la rejilla
    de credenciales refluye a una sola columna sin scroll horizontal ni recortes a 200/400% de zoom.

## Identidad visual (17-24)

16. **Hecho (migración completa).** Font Awesome webfont → sprite SVG inline. Se extrajeron los 32
    glyphs REALES usados desde los propios WOFF2 que el repo ya enviaba (fontTools, con flip Y y
    viewBox por advance), produciendo `src/components/IconSprite.astro` (sprite oculto, inyectado una
    vez desde el layout) y `src/components/Icon.astro` (`<svg><use href="#icon-NAME">`), que acepta el
    mismo nombre `fa-*` para no tocar la capa de datos. Se reemplazaron las 27+ etiquetas `<i class>`,
    se eliminaron los dos WOFF2 de FA (~150 KB), su preload, `src/styles/icons.css` y el `@import`.
    Elimina el FOUT de iconos y el fallo silencioso de nombre inexistente (el sprite sólo contiene los
    iconos usados y `Icon` resuelve por id exacto). CSP sin cambios (sprite same-origin, sin estilos
    inline). Resultado verificado: iconos renderizados (86 `<use>`, 16×12 px, `fill` currentColor),
    axe 0 en ambos temas, pa11y 6/6, E2E 19/19; Lighthouse MEJORA — LCP ~3.16s→~2.56s, perf 0.90→0.95,
    bytes de fuente ~180 KB→55 KB. Tests actualizados (sprite en lugar de WOFF2 de FA).

17. **Hecho.** La rejilla decorativa deja de cubrir todo el viewport (`body::after` eliminado) y se
    limita a las cabeceras hero (`.hero::before` / `.page-hero::before`) con máscara radial.
18. **Hecho (forma correcta).** Lenguaje gráfico de infraestructura en el hero mediante la rejilla
    de topología/diagrama con máscara radial sobre la cabecera. No se fabricó un diagrama con datos
    inventados; el motivo es decorativo (`aria-hidden`) y evoca una malla de plataforma.
19. **Hecho.** Estados de tarjeta completos y documentados: reposo (`.card`), hover/foco
    (`.card--interactive:hover/:focus-within`), activo (`.card--interactive:active`) y no interactivo
    (`.card--static` / `[aria-disabled]`). Renderizados en la guía visual.
20. **Hecho.** `font-variant-numeric: tabular-nums` en métricas (hero-facts, impacto, learning-summary,
    course-summary, teaching-metrics) y credential IDs (`.credential-code`, `.credential-copy small`).
21. **Hecho.** `color-mix()` desde tokens para separadores/bordes (`.section--line`, cabecera de
    `.timeline-card`) bajo `@supports`, con la declaración `var(--line)` previa como fallback.
22. **Hecho.** Página interna `/guia-visual` (noindex, no enlazada) que renderiza color, escala
    tipográfica, espaciado, radios, elevación y muestras de componentes; sin estilos inline (CSP),
    con clases dedicadas. Verificada axe 0 violaciones.
23. **Hecho.** `@supports ((backdrop-filter) or (-webkit-backdrop-filter))` en `.site-header`; si no
    hay soporte, fondo sólido `var(--surface)` de respaldo.
24. **Hecho.** `@media (prefers-reduced-transparency: reduce)`: header y superficies translúcidas
    pasan a opacas (`--surface`/`--surface-raised`) y se desactiva `backdrop-filter`.

## Interacción (32-38)

32. **Hecho.** `@view-transition { navigation: auto }` para transiciones entre documentos donde el
    navegador lo soporta.
33. **Hecho (forma correcta).** `prefetch` de las rutas internas con `<link rel="prefetch">`
    (CSP-safe). Las *reglas de especulación* (`<script type="speculationrules">`) exigen un script
    inline JSON que viola `script-src 'self'` y que además el test de HTML compilado marca como script
    inline ejecutable; por eso se usa `prefetch` en su lugar y se documenta la razón.
    NOTA (corrección de rendimiento): un prefetch ESTÁTICO de 5 páginas en el `<head>` competía con la
    imagen LCP y hacía fallar el presupuesto de Lighthouse (LCP ~3.9s > 3.5s). Se cambió a prefetch
    DISPARADO POR INTENCIÓN (hover/focus, en `site.js`), respetando `prefers-reduced-data`; LCP vuelve a
    ~3.16s y el presupuesto pasa. Verificado con lhci (3 corridas).
34. **Hecho.** Paleta de comandos accesible (`/scripts/command-palette.js`, externo): se abre con
    Cmd/Ctrl+K o el botón del header, diálogo `role="dialog" aria-modal`, focus trap, flechas para
    navegar, Escape para cerrar y restauración de foco. Degradación sin JS: el diálogo y el botón
    quedan `hidden` y la navegación normal sigue disponible. Verificado funcionalmente (abre, filtra
    "cert"→Certificaciones, cierra) y axe 0.
35. **Hecho.** El estado de las tabs de Skills se refleja en la URL (`?skill=slug`, `data-skill-slug`)
    y se restaura al cargar. Verificado: clic en tab 3 → `?skill=…`; recarga restaura esa tab.
36. **Hecho.** Indicador de progreso de lectura (`.scroll-progress` + `data-scroll-progress`) que sólo
    aparece en páginas largas; actualizado por scroll (CSSOM, no estilo inline en el HTML), con
    `role="progressbar"` y `aria-valuenow`.
37. **Hecho.** Retirado el `data-tooltip` huérfano de `.nav-contact` (checkpoint 1). Los tooltips de
    `.profile-social` siguen siendo reales y accesibles (texto por `aria-label`, visual por `::after`).
38. **Hecho.** Eliminado el `scroll-behavior: smooth` global; el desplazamiento suave se dispara por
    interacción (clic en anclas internas) respetando `prefers-reduced-motion`.

## Evidencia técnica (25-31)

25. **Hecho (forma correcta).** Bloque de código con resaltado por CLASES (`CodeBlock.astro`),
    mostrando un extracto REAL de `.github/workflows/validate.yml` del repo. Se usa resaltado por
    clases en vez de Shiki porque la salida de Shiki emite `style="color:…"` inline en cada span,
    incompatible con la CSP estricta y con el test de HTML compilado (que prohíbe `style=`).
26. **Hecho.** Botón de copiar (`/scripts/copy.js`, externo) en bloques de código (`data-copy-target`)
    y preparado para credential IDs/contacto (`data-copy`); se oculta sin JS. Verificado: copia el
    extracto real al portapapeles con feedback accesible.
27. **Hecho.** Diagrama de arquitectura en SVG accesible (`role="img"` + `<title>`/`<desc>`) con
    alternativa textual estructurada; colores por clases (sin estilos inline).
28. **Hecho.** Visualización de la cadena de entrega real derivada de los seis workflows existentes
    (validate, site-quality, e2e, external-links, preview, deploy-pages) como lista ordenada.
29. **Hecho.** Datos de GitHub leídos en build desde `data/github-state.json` (patrón de caché del
    repo, igual que youtube-state). `tools/update-github-stats.js` refresca el cache (workflow
    `github-stats.yml` programado + PR). El build lee el cache con degradación: si falta o es
    inválido, la tira no se renderiza. Cifras reales (63 repos, 435 estrellas, 150 seguidores), no
    inventadas. Scripts `github:stats` / `github:stats:check`.
30. **Reformulado (forma correcta más cercana).** Generar las social cards con astro:assets/Satori
    exigiría añadir `satori` + `@resvg/resvg-js` + una fuente como dependencias nativas de build, lo
    que arriesga el gate verde (build) sin aportar al resultado: las tarjetas ya existen y se sirven
    (`public/social/*.png`, generadas por el script Python existente). Se mantiene el resultado
    (tarjetas presentes y referenciadas en OG/Twitter) y se documenta la migración a Satori como
    follow-up fuera del gate para no introducir dependencias nativas que lo pongan en riesgo.
31. **Hecho.** Hoja de estilos de impresión (`@media print`): quita cromo decorativo e interactivo
    (header, paleta, barra de progreso, botones de copiar), expande URLs de enlaces y deja los
    bloques de código y figuras legibles en negro sobre blanco.

## Pendiente de rendimiento revisado

44. **Reformulado (forma correcta más cercana).** `astro:assets` no optimiza SVG (los logos de marca
    son SVG) y el retrato ya tiene variantes responsive manuales (avif/webp/jpg a 320/640/960) con
    `width`/`height` y `preload`. Migrar a `<Image>` no aporta sobre el pipeline ya optimizado y
    arriesga el gate; se documenta y se deja como follow-up. Las imágenes conservan dimensiones
    explícitas y `aspect-ratio` (punto 43) para evitar CLS.

## Correcciones de la revisión independiente (posteriores a los checkpoints)

Revisión ciega del diff y del `dist` reconstruido, no del resumen de ejecución. Tres defectos
reales encontrados y corregidos; ningún gate los detectaba (Lighthouse, pa11y y axe no juzgan
geometría de iconos ni pérdida de reglas CSS).

51. **Sprite SVG desplazado y recortado (punto 16).** La extracción desde los WOFF2 dejó los 32
    glyphs en `y ∈ [64, 576]` mientras el `viewBox` abría en `0 0 W 512`. Medido con un parser de
    paths con extremos de curvas: 23 de 32 iconos perdían entre 26 y 64 unidades por abajo (hasta el
    12,5 % del glyph) y todos quedaban descentrados. Corregido a `viewBox="0 64 W 512"` en los 32
    símbolos; verificado con render comparativo antes/después.
52. **Header desbordado (puntos 8 y 34).** Los controles de tema y paleta añaden ~230 px a la fila:
    "Sobre mí" se partía en dos líneas ya a 1280 px y entre 681 y 780 px el header desbordaba
    horizontalmente. Corregido con `white-space: nowrap` en los enlaces y los dos controles, modo
    icono por debajo de 1320 px (nombre accesible por `aria-label`, no por texto visible), holguras
    más ajustadas entre 681 y 1080 px, y colapso al menú de hamburguesa elevado de 680 a 820 px
    (incluido el camino sin JavaScript, que si no quedaba inalcanzable en esa franja). Verificado en
    11 anchos: sin partición de línea y sin desbordamiento en ninguno.
53. **Reglas de Cursos atrapadas en el bloque móvil (punto 9).** Al dividir `global.css` nueve
    reglas quedaron dentro de `@media (max-width: 680px)` sin indentar. `.course-summary` no tenía
    otra definición, así que por encima de 680 px el panel perdía fondo, borde, padding y `flex`
    (comprobado en el DOM: `background: transparent`, `padding: 0px`, `display: block`). Hoistadas al
    nivel superior; las otras seis estaban duplicadas y superadas por las reglas vigentes, así que se
    eliminaron en vez de reponerse.

## Calidad (48-50)

48. **Hecho.** TypeScript con `astro check` sobre datos y props de componentes, integrado en el
    workflow `validate` (instala `@astrojs/check` + `typescript` + `@types/node` fijados). `tsconfig.json`
    extiende `astro/tsconfigs/base` con `strictNullChecks`. Se corrigieron 7 errores reales
    (tipos de `node:fs`/`node:path`/`process`, narrowing del meta de `profile.facts`, tipo de
    `githubStats`). Script `npm run check`. Resultado: 0 errores.
49. **Hecho.** Nueva suite `tests/dom-assertions.test.js` que verifica el DOM COMPILADO (`dist/`) en
    vez de regex sobre el código fuente: iconos de navegación renderizados, tablist accesible de
    skills, ≥10 credenciales renderizadas, sección de evidencia con código real y SVG accesible,
    scripts externos enlazados (CSP) y controles de tema/paleta accesibles. 6 pruebas nuevas (46 total).
50. **Hecho.** Presupuestos de peso por ruta en `.lighthouserc.json` (`resource-summary` de total,
    script, stylesheet, font, image y document) verificados contra el peso real del `dist`. Comparación
    visual automática por PR vía `tests/e2e/visual.e2e.spec.js`: capturas viewport-only de las 6 rutas +
    tema claro + móvil adjuntas como artefactos del PR (se suben en `e2e.yml`). No se usa pixel-diff duro
    por la variabilidad de render entre entornos; el artefacto permite la comparación en cada PR.
