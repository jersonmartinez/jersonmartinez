# Refinamiento del portafolio — credenciales, home y CV (2026)

> Rama: `feat/credential-home-cv-polish` · Base: `origin/main@416d78a`
> Alcance: unificar la presentación de credenciales (página de certificaciones
> e inicio) con el componente aprobado, actualizar el enlace EN del CV y aplicar
> un conjunto de mejoras reales de UI/UX, accesibilidad, rendimiento, SEO,
> consistencia y pruebas.

Cada entrada es un cambio **real** en el árbol de fuentes, verificable con
`git show`/`git diff`. No se inventa contenido, cifras ni enlaces; no se altera
copy ya validado. Los PDF del CV (`public/cv/*.pdf`) **no** se modifican: ya son
byte-idénticos a los adjuntos aprobados (ver «Verificación de los PDF del CV»).

## Resumen por categoría

| Categoría | Mejoras |
| --- | --- |
| Credenciales (UI/UX + componente) | 8 |
| Accesibilidad | 7 |
| SEO / datos estructurados | 5 |
| Rendimiento | 2 |
| Consistencia / limpieza | 4 |
| CV / enlaces | 2 |
| Pruebas / contrato | 2 |
| **Total** | **30** |

## Detalle numerado

### Credenciales — componente y presentación (1–8)

1. **`src/components/CredentialCard.astro` — modo `summary`.** El componente
   aprobado admite ahora `summary` + `limit`, de modo que el inicio y la página
   de certificaciones comparten exactamente la misma estructura visual (logo +
   título «Emisor oficial» + filas compactas de credencial).
2. **Alineación título/icono.** La cabecera del proveedor usa un contenedor
   dedicado `.cert-provider-id` con `align-items: center`; el `<h3>` queda
   alineado con el logo en una sola fila, sin desalineación vertical.
3. **Eliminación de la flecha `↳`.** Se retira `.cert-list li::before { content: '↳' }`,
   origen del «salto» visual en la lista de credenciales, junto con toda la
   variante antigua. Se sustituye por un indicador profesional y accesible.
4. **Indicador de verificación accesible.** Cada fila de credencial muestra una
   etiqueta «Verificar» con icono `fa-check-circle` (`aria-hidden`) y texto
   visible, dentro de un enlace con `aria-label` descriptivo (nombre, nivel e ID).
5. **Home: estructura aprobada en lugar de la variante reducida.** El inicio deja
   de usar la tarjeta `cert-card`/`cert-list` y renderiza `CredentialCard` en
   modo `summary` (3 por proveedor), conservando el copy y el total de 10
   credenciales oficiales.
6. **Enlace honesto «Ver las N credenciales».** En modo summary, cuando un
   proveedor tiene más credenciales que el límite mostrado (solo Azure, 6), se
   muestra un enlace a `/certifications.html` con el conteo real.
7. **Realce de interacción.** `.credential-badge` recibe una micro-interacción
   `translateY(-1px)` en hover sobre `@media (hover: hover)`, respetando
   `prefers-reduced-motion`.
8. **Indicador «Ver todas» con flecha CSS.** El enlace `.credential-more` usa un
   chevron dibujado por CSS (no un glyph de fuente), evitando dependencias de
   iconos y el salto de línea del `↳` original.

### Accesibilidad (9–15)

9. **Semántica de lista preservada en credenciales.** `credential-badges`
   declara `role="list"` + `aria-label` por proveedor, evitando que el
   `list-style: none` elimine la semántica de lista en algunos lectores.
10. **`LogoCloud` con `role="list"`.** El ecosistema tecnológico mantiene
    semántica de lista pese al reseteo de estilos.
11. **Tags de proyecto como lista accesible.** `.project-meta` pasa a
    `role="list"` con `role="listitem"` por etiqueta y un `aria-label`
    («Tecnologías de …»).
12. **Panel de skills enfocable por teclado.** Cada `role="tabpanel"` recibe
    `tabindex="0"` para que su región desplazable sea alcanzable con teclado.
13. **Enlace de descarga del CV con contexto.** En certificaciones, «Descargar
    PDF» añade `type="application/pdf"`, `hreflang` y un texto `sr-only` con el
    idioma del documento.
14. **Afordancia de nueva pestaña consistente.** Los enlaces del CV en «Sobre mí»
    anuncian «(abre en nueva pestaña)» como el resto del sitio.
15. **404 con rutas de recuperación agrupadas.** Las acciones de la página 404 se
    agrupan con `role="group"` + `aria-label` y añaden un acceso a
    certificaciones.

### SEO / datos estructurados (16–20)

16. **URL de emisor oficial en cada proveedor.** `src/data/portfolio.ts` añade
    `issuerUrl` verificable (AWS, Microsoft Learn, GitHub) como fuente única.
17. **`recognizedBy.url` en el schema de credenciales.** El JSON-LD
    `EducationalOccupationalCredential` enlaza al emisor oficial cuando existe.
18. **`og:locale:alternate` (en_US).** Señala la disponibilidad bilingüe del
    contenido/CV sin inventar identidades de redes sociales.
19. **`<link rel="sitemap">` en el `<head>`.** Descubrimiento explícito del
    sitemap además de `robots.txt`.
20. **`crossorigin` correcto en preloads de fuentes.** Los `rel="preload"` de
    fuentes declaran `crossorigin="anonymous"`, requisito para que el navegador
    reutilice la fuente precargada (evita doble descarga).

### Rendimiento (21–22)

21. **Preload de la fuente de cuerpo (Manrope).** Reduce el FOUT del texto
    principal above-the-fold.
22. **Preload del webfont de iconos sólidos (FA solid).** Los iconos de la
    navegación superior aparecen sin salto perceptible.

### Consistencia / limpieza (23–26)

23. **Eliminación de CSS muerto `.cert-card`/`.cert-card-head`.** La variante
    reducida del home ya no existe.
24. **Eliminación de CSS muerto `.cert-list` y `::before` con `↳`.**
25. **Eliminación de CSS muerto `.credential-link` (dos bloques).** Sustituido en
    la lista de foco por `.credential-badge`/`.credential-more`.
26. **Foco visible coherente en los nuevos interactivos.** `.credential-badge` y
    `.credential-more` se añaden a la regla global de `:focus-visible`.

### CV / enlaces (27–28)

27. **Enlace EN del CV exacto en la app.** `src/data/portfolio.ts` usa
    exactamente la URL de Drive aprobada.
28. **Enlace EN del CV exacto en el README.** `README.md` usa la misma URL EN
    exacta; se elimina la URL EN anterior.

### Pruebas / contrato (29–30)

29. **Suite de regresión del refinamiento.**
    `tests/credential-refinement.test.js` fija el contrato: el home reutiliza
    `CredentialCard summary`; no reaparecen `↳`, `cert-list`, `credential-link`
    ni `cert-card`; `CredentialCard` expone código, verificación y modo summary;
    la URL EN exacta vive en `portfolio.ts` y `README.md`.
30. **Contrato de emisores oficiales.** La misma suite verifica que haya
    exactamente 3 `issuerUrl` y que todas sean `https://`.

## Verificación de los PDF del CV

Los adjuntos aprobados son byte-idénticos a los PDF ya publicados; **no** se
realiza ningún cambio binario (hacerlo sería fabricar un cambio inexistente).

| Archivo | SHA-256 |
| --- | --- |
| `public/cv/jerson-martinez-cv-en.pdf` | `ab06d9cb169b5c9de90c96240a1d8a7060dfee082be171be42b0dd93fea40029` |
| adjunto EN aprobado | `ab06d9cb169b5c9de90c96240a1d8a7060dfee082be171be42b0dd93fea40029` |
| `public/cv/jerson-martinez-cv-es.pdf` | `a24c1d71296504942ce4aeca080bf6371c8da8f3e7ea08016279f5669ea14cb0` |
| adjunto ES aprobado | `a24c1d71296504942ce4aeca080bf6371c8da8f3e7ea08016279f5669ea14cb0` |

## Estado de los enlaces del CV

- **CV EN (inglés): resuelto.** El enlace apunta ya a la URL de Drive aprobada
  en `src/data/portfolio.ts` y en `README.md`:
  [Google Doc EN aprobado](https://docs.google.com/document/d/18q3xhTd7bmymk-ZeMM_BHhJT6Qp4rLcxu05DozMQRYo/edit?usp=drive_link).
- **CV ES (español): pendiente de una sola línea.** La URL ES exacta llegó
  redactada por el runtime (`[REDACTED: credential]`) y **no** está en las
  anotaciones del PDF. No se inventa ni se infiere: el `href` ES actual se
  conserva tal cual como estado temporal. El cambio pendiente es una única línea
  en `cvLinks` (`src/data/portfolio.ts`), reemplazando el `href` del elemento
  `lang: 'es'` por la URL exacta cuando esté disponible; no requiere más ajustes
  de código, estilos ni pruebas.

Este PR se entrega bajo autorización explícita del usuario con el enlace ES en su
estado actual; el enlace ES se actualizará en un cambio de seguimiento de una
línea en cuanto se disponga de la URL exacta.
