# Frontend refresh

## Alcance

Este documento registra la renovación visual y de contenido del portfolio estático. El trabajo conserva las rutas existentes, el sincronizador de YouTube y los workflows de calidad; solo actualiza la presentación y los contratos verificables del frontend.

## Mejoras implementadas

### Sistema visual y layout

1. Paleta de alto contraste basada en navy, cyan y lime.
2. Variables de diseño centralizadas para superficies, bordes, radios y sombras.
3. Header sticky con superficie translúcida y separación visual.
4. Indicador de página activa en la navegación.
5. CTA de contacto diferenciado del resto de enlaces.
6. Hero editorial con jerarquía tipográfica responsive.
7. Fondo con retícula técnica y ornamentación sutil.
8. Panel de perfil con foto de GitHub, estado multi-cloud y enlaces públicos.
9. Tarjetas con elevación, borde de interacción y jerarquía interna.
10. Banda de especialidades para Platform, Reliability, Security y Enablement.
11. Métricas con contexto y nota de procedencia.
12. Timeline de experiencia con marcadores, etiquetas técnicas y resumen cuantitativo.
13. Tarjetas de proyectos con estado visible y metadatos.
14. Panel de contacto con superficie diferenciada y acción principal clara.
15. Footer con navegación externa consistente.
16. Diseño móvil específico para navegación, grids, tabs y contacto.
17. `viewport-fit=cover` y `scroll-padding-top` para dispositivos y navegación anclada.

### Accesibilidad y comportamiento

18. Skip link conservado y visible con teclado.
19. `focus-visible` con contraste elevado.
20. Menú móvil con `aria-expanded` y etiqueta dinámica abrir/cerrar.
21. Cierre del menú al seleccionar un enlace.
22. Cierre del menú con Escape y al hacer clic fuera.
23. Restauración del foco en el botón del menú.
24. Reset del estado móvil al volver a desktop.
25. Tabs con `aria-selected`, `tabpanel` y orientación declarada.
26. Navegación de tabs con flechas, Home y End.
27. Roving `tabIndex` para tabs.
28. Respeto de `prefers-reduced-motion`.
29. Botón volver arriba con estado visible y `tabindex` controlado.
30. Enlaces externos normalizados con `noopener noreferrer`.
31. Etiquetas `alt`, landmarks y nombres accesibles conservados en las páginas.

### Datos, credibilidad y SEO

32. Canonical por página apuntando al dominio público con `www`.
33. Open Graph completo para portada y páginas internas.
34. JSON-LD de persona, colección, perfil y sitio.
35. GNet identificado como proyecto académico documentado.
36. Infralytics identificado como proyecto descrito en el CV, sin inventar una demo.
37. Automation renombrado para coincidir con la tarjeta y el repositorio real.
38. Ejemplos de GNet marcados como conceptuales, no como telemetría en tiempo real.
39. Métricas calificadas como resultados reportados del CV.
40. Credenciales descritas como resumen editorial que no sustituye su verificación.
41. Tecnologías agrupadas por dominio operativo.
42. Etiquetas técnicas añadidas a experiencias clave para conectar rol, impacto y stack.
43. Vista de proyectos enlazada con el contexto profesional y el repositorio real.
44. Fuente de datos y límites de verificación visibles en las superficies sensibles.

## Fuentes y límites

El contenido se basa en el README del perfil y en las versiones española e inglesa del CV facilitadas para este proyecto. Los porcentajes y recuentos son declaraciones reportadas en esas fuentes; no se presentan como métricas auditadas por terceros. No se añadieron clientes, certificaciones, productos, demos ni disponibilidad que no estuvieran respaldados por las fuentes existentes.

## Validación

- `npm test`
- `npm run validate`
- `npm run links`
- `node --check src/libs/custom/js/portfolio.js`
- Smoke visual local con `playwright-cli` en desktop y móvil.
- Menú móvil abierto y cerrado con estado ARIA comprobado.
- Tabs de GNet inspeccionados mediante árbol accesible.

## Nota sobre enlaces externos

La auditoría externa (`npm run links -- --external`) detecta respuestas 403/405 o fallos de conexión en algunos proveedores que bloquean peticiones HEAD (LinkedIn, Udemy y Crashell). Los enlaces internos y la estructura del sitio pasan; no se sustituyeron URLs legítimas basándose únicamente en esos falsos negativos de disponibilidad.
