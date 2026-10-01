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
