# Refinamiento frontend del portfolio — 10 puntos

Lote ligero (sin dependencias nuevas) que atiende los 10 puntos del análisis,
preservando tokens, sprite de iconos, componentes y gates. Verificado contra el
`dist` reconstruido y evidencia visual en ambos temas.

## Rendimiento y peso

- **P1 — Foto fuente fuera de `public/`.** `public/images/profile.jpg` (376K) no
  lo solicita ninguna página, pero **sí es la fuente** del generador de retratos y
  tarjetas sociales (`tools/generate-visual-assets.py`). No se borró: se **reubicó**
  a `tools/assets/profile-source.jpg` (versionada, fuera de `public/`) y se actualizó
  el generador. El `dist` deja de servir 376K que nadie pedía; la regeneración sigue
  intacta.
- **P6 — Tarjetas sociales a JPEG.** Las 8 `og:image` PNG pesaban ~248K c/u
  (~2 MB). Al ser fotográficas + degradados, se regeneraron como JPEG progresivo
  q86: ~60K c/u (~420K en total, **−1.5 MB**). Se actualizó `og:image` a `.jpg`,
  `og:image:type` a `image/jpeg` y el test de existencia de assets.
- **P9 — CSS: reducción segura del bundle bloqueante.** Se evaluó el diferido del
  bundle (critical CSS + async) y se **rechazó con evidencia**: el hero y el header
  están sustancialmente estilados en `components.css` (hero=7, site-header=4,
  button=5 reglas), así que diferirlo introduciría CLS que pondría en riesgo el
  presupuesto Lighthouse **ya verde**. En su lugar se tomó la vía sin FOUC/CLS:
  eliminar 24 líneas de **CSS muerto verificado** (selectores legacy sin ninguna
  referencia en plantillas ni `dist`: `project-card`, `repo-card`, `tag-list`,
  `verification-*`, `disclaimer`, `about-stack-list`, `course-visual-title/subtitle`,
  `card-link--soft`). El bundle (hashed, cache `immutable`) encoge sin tocar la
  cascada. `init.js` ya fija el tema antes del primer pintado, así que no hay flash.

## Presentación de skills, proyectos y perfil

- **P2 — Banda «Escritura y divulgación»** (faceta de escritor/creador, antes casi
  ausente): temas, perfil de autor de OpenWebinars (+60 artículos reales) y Crashell.
  Solo fuentes verificables; no se inventan títulos.
- **P4 — Señal de liderazgo en el hero**: pill «Actualmente DevOps Tech Lead ·
  MindTech — Nubity», derivada de `experience[0]`.
- **P7 — Metodologías y marcos** nombrados explícitamente (GitOps, FinOps,
  DevSecOps, IaC, ITIL, ISO 27001, CI/CD, SRE) como chips en la sección de enfoque.
  Derivado de skills existentes; no añade nodos nuevos.

## UX/UI, jerarquía y navegación

- **P10 — Rail de secciones FLOTANTE.** El rail moría con su contenedor `.journey`
  (atrapado en la sección 01) aunque enlazaba seis secciones de la página. Se
  decopló: ahora es un rail de puntos fijo al viewport en pantallas ≥1180px (etiqueta
  en hover/focus), oculto donde solaparía el contenido, y reutiliza el scroll-spy que
  ya existía en `site.js`. Se añadió la nueva sección «Valor» al recorrido.

## Accesibilidad y SEO

- **P5 — Schema enriquecido.** `Person.sameAs` ahora incluye los perfiles de autor
  (OpenWebinars) y Crashell, además de GitHub, LinkedIn, YouTube y Udemy — señal de
  autoridad para la faceta de escritor.
- **P8 — Objetivo táctil.** `.profile-social` ya medía 2.75rem (44px); se añadió un
  suelo explícito `min-height/min-width: 44px` para que no baje del objetivo bajo
  ningún cambio de tokens. (La cifra de 39px del análisis era de un estado anterior
  ya corregido.)

## Valor hacia las empresas

- **P3 — Proof points de negocio** junto al CTA: banda «Qué aporto a tu empresa /
  Resultados reportados, no promesas» con cuatro cifras reportadas y enlazadas a su
  contexto (−60% costes, +80% calidad backend, +60% trazabilidad y seguridad, +77K
  estudiantes).

## Verificación

Contenedor limpio Node 22 desde `npm ci`: build 8 páginas, `astro check` 0/0/1,
sprite 32/32, tests **46/46** (incluido el que caza anclas internas rotas, que
detectó un icono fuera del sprite y obligó a usar uno existente), validate, links
306 referencias 0 fallos, headers, sync, youtube, stylelint 0, design-metrics
(CTA hero 618/780, marca 18.59:1 dark / 17.37:1 light), E2E + axe 4.13 **19/19**,
pa11y **6/6**, Lighthouse **6 rutas** en presupuesto. Evidencia visual en tema
oscuro y claro de hero, metodologías, escritura, valor y rail flotante.
