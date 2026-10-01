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
