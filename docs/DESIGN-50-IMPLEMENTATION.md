# Design pass 50 — Copperline Nocturne

Este lote implementa los 50 puntos del backlog visual posterior al merge de #35 en un solo cambio. La regla de producto se mantiene: los botones y sus estados aprobados no se rediseñan; el trabajo se concentra en tokens, superficies, composición, jerarquía, estados secundarios, responsive y documentación.

## Trazabilidad

| # | Implementación | Capa |
|---:|---|---|
| 1 | Unificación operativa mediante aliases semánticos en `palette.css`; siguiente migración puede retirar aliases históricos. | Tokens |
| 2 | Compatibilidad explícita de `--cyan`, `--lime` y `--orange` sin introducir nuevos usos. | Tokens |
| 3 | Roles `--surface-*`, `--text-*`, `--state-*` y `--border-*`. | Tokens |
| 4 | Escala `--surface-canvas`, `--surface-1`, `--surface-2`, `--surface-3`, `--surface-inset`, `--surface-floating`. | Tokens |
| 5 | `--border-structural`, `--border-interactive`, `--border-accent`, `--border-focus`. | Tokens |
| 6 | Violeta y azul eléctrico reservados para información y datos; coral para énfasis. | Tokens |
| 7 | Estados success/info/warning/danger con fondo y texto asociados. | Tokens |
| 8 | Ritmo de sección, gaps de card y medidas de lectura tokenizados. | Tokens |
| 9 | Variables decorativas agrupadas para glow, rejilla, artwork y ruido. | Tokens |
| 10 | Guía visual ampliable con la escala semántica y componentes actualizados. | Docs |
| 11 | Escalera de superficies aplicada a cards, paneles y contenido. | CSS |
| 12 | Hero con composición de halo, rejilla y punto focal. | CSS |
| 13 | Variantes de fondo para hero general, `about` y 404. | CSS |
| 14 | Textura de rejilla/puntos con opacidad perceptible pero contenida. | CSS |
| 15 | Separación de hero y contenido mediante borde y wash. | CSS |
| 16 | Perfil con profundidad, halo y superficie diferenciada. | CSS |
| 17 | Bandas alternas de sección con wash editorial. | CSS |
| 18 | Contacto con tratamiento de cierre y gradiente de tres acentos. | CSS |
| 19 | Footer con borde y texto terciario específicos. | CSS |
| 20 | Fondos hero y puntos limitados en móvil para evitar ruido. | Responsive |
| 21 | Cards con composición editorial y gradiente de superficie. | CSS |
| 22 | Primer proyecto destacado con superficie propia. | CSS |
| 23 | Segundo proyecto destacado con wash violeta. | CSS |
| 24 | Métricas `.value-card` con número dominante y elevación propia. | CSS |
| 25 | Timeline como columna cromática continua. | CSS |
| 26 | Impacto numérico con escala y color de estado. | CSS |
| 27 | Separación semántica entre evidencia, capacidad y resultado. | CSS |
| 28 | Certificaciones con placa neutra oficial y verificación positiva. | CSS |
| 29 | Formación/cursos con artwork remapeado a la paleta. | CSS |
| 30 | Secciones del home conectadas mediante ritmo y washes alternos. | CSS |
| 31 | Badges y chips remapeados a superficies inset y bordes estructurales. | CSS |
| 32 | Pills limitados a metadatos y estados, sin afectar botones. | CSS |
| 33 | Links de lectura usan azul eléctrico; acciones de contexto conservan jerarquía. | CSS |
| 34 | Nueva jerarquía visual para cards de evidencia y diagramas. | CSS |
| 35 | Nueva jerarquía para métricas y resultados. | CSS |
| 36 | Skills explorer con superficie, icono y panel activo más diferenciados. | CSS |
| 37 | Rail de trayectoria con violeta como señal activa. | CSS |
| 38 | Command palette con panel flotante y estado activo semántico. | CSS |
| 39 | Diagramas usan nodo violeta, edge eléctrico y accent positivo. | CSS |
| 40 | Iconos secundarios adoptan roles semánticos y no solo color primario. | CSS |
| 41 | Metadata monoespaciada queda subordinada al texto de contenido. | Typography |
| 42 | Roles de texto primario, secundario y terciario. | Typography |
| 43 | Tracking de labels conserva legibilidad mediante escala y medida. | Typography |
| 44 | Links de lectura mantienen subrayado contextual y color eléctrico. | CSS |
| 45 | Transiciones y focus siguen tokens, con fallback de movimiento reducido. | A11y |
| 46 | Estados dinámicos consumen superficies flotantes y tokens de estado. | CSS |
| 47 | Estados vacíos heredan superficie soft y color terciario. | CSS |
| 48 | `prefers-reduced-motion` elimina desplazamientos decorativos nuevos. | A11y |
| 49 | Overlays de imagen y artwork usan superficies oscuras y texto semántico. | CSS |
| 50 | Este documento y la guía visual dejan una revisión humana trazable por ruta/estado. | Docs |

## Regla de botones

No se redefinen `.button`, `.button--ghost`, ni sus estados hover/active. La capa nueva evita seleccionar botones en los overrides de foco y composición; solo consume sus tokens existentes sin alterar su gramática aprobada.

## Verificación prevista

- Build Astro y `astro check`.
- Suite de tests de dist.
- Stylelint.
- Validación de sitio, enlaces, headers, sprite y diseño.
- Contraste WCAG de roles nuevos en oscuro y claro.
- Revisión visual humana en rutas principales, 404, guía visual, móvil, ambos temas, estados activos y reduced motion.
