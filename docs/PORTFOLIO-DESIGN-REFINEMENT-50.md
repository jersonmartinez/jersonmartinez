# Refinamiento de diseño del portfolio — 50 hallazgos

Registro de los 50 hallazgos de diseño detectados sobre el `dist` reconstruido y el render
real, y de cómo se resolvió cada uno. Cada punto se verificó con una medición o con una
lectura del código, no por inspección visual a ojo.

Base: `main` con las PR #18, #19, #20 y #21 integradas.

## Cómo se detectaron

Tres herramientas nuevas, incorporadas al repositorio:

| Herramienta | Qué mide |
| --- | --- |
| `tools/visual-review.cjs` | Desbordamiento horizontal, errores de consola y etiquetas partidas, contando **cajas de línea reales** con `Range.getClientRects()` por ancho y ruta |
| `tools/style-snapshot.cjs` | Estilos **computados** de 39 selectores en 6 rutas y 2 temas, para demostrar que la refactorización a tokens no altera el render oscuro publicado |
| `tools/check-design-metrics.cjs` | Gate de las magnitudes de composición (ahora en CI) |

El primer detector de particiones medía la altura del elemento, que incluye el `padding`, y
marcaba como partido cualquier botón: era un fallo del arnés, no del sitio. Se corrigió a
cajas de línea antes de usar sus resultados.

## Tema claro y marca (1-6)

1. **La marca era casi invisible en tema claro.** `public/brand/logo.svg` llevaba el texto
   con un relleno casi blanco fijo y se servía como `<img>`, que no hereda `currentColor`.
   Sobre el header blanco el logotipo desaparecía. Se incrusta como SVG inline
   (`src/components/BrandMark.astro`) con `fill="currentColor"`. Contraste medido: 18,59:1
   en oscuro y 17,37:1 en claro, antes del orden de 1,1:1.
2. **La rejilla del hero no reaccionaba al tema**: `rgba(186,213,231,.05)` es invisible
   sobre `#eef3f8`. Tokenizada como `--grid-line`, con valor propio por tema.
3. **Los resplandores de `body::before`** usaban rgba fija calculada para fondo oscuro.
   Tokenizados como `--glow-cyan` y `--glow-lime`.
4. **`theme-color` no seguía al tema elegido.** Las dos `<meta>` están condicionadas por
   `prefers-color-scheme`, así que un usuario con sistema oscuro que escogía el tema claro
   conservaba el cromo oscuro del navegador. El script fija ahora una `<meta>` sin `media`,
   que gana sobre las condicionadas.
5. **El halo del punto de estado** (`rgba(196,242,105,.12)`) era invisible en claro →
   `--ring-lime`.
6. **El anillo decorativo del panel de perfil** → `--ring-lime-strong`.

## Jerarquía y ritmo tipográfico (7-13)

7. **El encabezado de sección y su entradilla se tocaban a 0 px** (medido en el DOM): `h2`
   y `.lede` heredan ambos `margin: 0`. Separación explícita de 16 px.
8. **Siete tamaños de `h3` ad hoc** (1,05 / 1,2 / 1,25 / 1,3 / 1,35 / 1,45 / 1,55rem) sin
   relación entre sí. Reducidos a tres pasos con token: `--fs-h3-sm`, `--fs-h3`,
   `--fs-h3-lg`.
9. **15 `clamp()` crudos de `font-size`** fuera de `tokens.css`, pese a existir la escala
   `--fs-*`. Migrados a los tokens.
10. **El cuerpo de la trayectoria llegaba a 1093 px por línea** (unas 152 unidades de
    medida), muy por encima del rango legible. Acotado con `--measure-wide`: 612 px.
11. **La cadena de entrega llegaba a 1124 px por línea.** Acotada igual: 680 px.
12. **`.card-label` reservaba una segunda línea que nunca llega** (`min-height: 2.2rem`) y
    sumaba `margin-bottom: 2rem`: una banda vacía permanente entre la etiqueta y el título.
    Retirada la reserva y normalizado el margen.
13. **El CTA del hero quedaba fuera del primer viewport móvil.** El `h1` medía 354 px de
    alto a 390 px de ancho y empujaba el botón a `y = 747` sobre 780. Escala reducida: el
    `h1` baja a 177 px y el CTA termina en 583 px, completamente visible.

## Header y navegación (14-19)

14. **El conmutador de tema y la paleta vivían dentro de `<nav>`**, pero no son navegación.
    Movidos a un grupo propio, `.header-controls`.
15. **Y por eso quedaban inalcanzables en móvil**: al colapsar el menú medían 0x0. Ahora el
    grupo de controles es siempre visible.
16. **`scroll-margin-top` era de 84 px frente a un header de 89 px**, así que todo
    encabezado enlazado quedaba parcialmente tapado. Derivado de la altura real con
    `--anchor-offset` (104 px), con un solo origen de verdad para secciones y `:target`.
17. **«Ver credenciales» se partía en dos líneas a 900 px.** Las acciones de cabecera se
    apilan por debajo de 1000 px.
18. **Los botones de perfil de Udemy se partían a 900 px.** Mismo arreglo.
19. **El rail de secciones desaparecía tras la primera sección.** Verificado por geometría:
    sí se fija, pero su contenedor `.journey` termina con la sección `#impacto`, mientras
    sus enlaces apuntan a seis secciones de toda la página. Ver *Hallazgo estructural
    aplazado*.

## Credenciales (20-24)

20. **La rejilla de 3 columnas con 3, 6 y 1 credenciales** dejaba una columna casi vacía al
    lado de una muy alta. Se probó multicolumna y **no sirve**: al repartir en orden de
    documento deja AWS solo en una columna de 822 px (medido). Solución final: bandas a
    ancho completo por proveedor, con la lista de credenciales repartida dentro con
    `auto-fit`. No depende del orden ni del número de credenciales.
21. **En móvil la etiqueta «Verificar» caía a una fila propia pegada a la izquierda**,
    desconectada de la credencial. Ahora ocupa la segunda columna, bajo su propio texto.
22. **Los chips de código tenían anchos distintos** (`CCP` frente a `Foundations`), lo que
    desalineaba cada fila. Ancho uniforme.
23. **Los credential ID se partían a mitad de cadena.** Tamaño y altura de línea ajustados
    para que el identificador se lea como un bloque.
24. **El enlace de verificación no alcanzaba el área de pulsación mínima.**

## Tarjetas y cuadrícula (25-29)

25. **Las tarjetas de curso de una misma fila desalineaban su etiqueta de acceso 20 px**
    (medido: 1686, 1686, 1666), porque el bloque de resultado tiene altura variable. La
    etiqueta se alinea ahora desde el fondo, igual que el enlace.
26. **Las siete ilustraciones de curso eran la misma composición**, variando sólo el color
    y el rótulo: en la cuadrícula se leían como relleno repetido. Ahora la silueta cambia
    por etapa de la ruta, de forma determinista: cresta, bloques apilados, nodos conectados
    y onda. Sigue siendo un SVG inline con la misma paleta, sin peso añadido.
27. **Las fichas de proyecto apilaban dos líneas de metadatos** sobre el título (tipo y
    tema), compitiendo entre sí y con el encabezado. Unificadas en una sola fila.
28. **Los enlaces de acción medían 21 px de alto.** Elevados por encima del mínimo de
    24 px. Los enlaces en línea dentro de una frase quedan exentos por WCAG 2.5.8 y no se
    tocaron.
29. **El centrado de la última tarjeta de curso vivía en un bloque de override al final**
    del archivo. Movido junto a su cuadrícula y documentado.

## Sistema de diseño (30-40)

30. **30 literales `.18s ease`** pese a existir `--dur-base` y `--ease-standard`. Cero
    ahora.
31. **55 literales `rgba()`**, con **diez alfas distintos del mismo cian** (de .05 a .16)
    sin criterio. Colapsados sobre los tokens que ya tenían nombre, en lugar de inventar
    una escala paralela. Quedan los de la obra gráfica de curso, ahora también tokenizados
    (`--artwork-*`) y deliberadamente independientes del tema.
32. **38 literales de `border-radius`** con catorce valores distintos. Cero ahora.
33. **Nueve selectores duplicados** (`.section--line` ×3, `.logo-cloud` ×3, `.site-header`,
    `.profile-links`, `.page-hero`, `.brand`, `.logo-pill`, `.skills-explorer`,
    `.page-hero-meta`, `.course-path-step`, `.compact-course`). Fusionados en su definición
    canónica.
34. **Bloques de override posicionales al final de `components.css`**, que contradecían el
    uso de `@layer` declarado en `global.css`. Absorbidos por las reglas canónicas; sólo
    quedan las variantes por ancho, que son capas legítimas.
35. **`!important` innecesario en `.timeline-context`.** Se gana por especificidad.
36. **`!important` innecesario en `.repo-card[hidden]`.**
37. **Comentarios con numeración de lotes ya cerrados** (del «Item 1» al «Item 123») que no
    corresponden a ningún documento vigente. Retirados conservando el texto explicativo.
38. **Espaciado con literales** en lugar de la escala `--space-*`.
39. **Alias heredados `--radius` y `--shadow`**, que mantenían dos nombres para el mismo
    valor. Retirados tras migrar sus usos.
40. **`@view-transition` ignoraba `prefers-reduced-motion`.** Una transición de navegación
    también es movimiento: ahora se desactiva.

## Accesibilidad y robustez (41-44)

41. **El rótulo de los perfiles sólo existía en un tooltip `::after` por hover**, así que en
    táctil el icono quedaba sin nombre visible. Donde no hay hover, el nombre se muestra
    como texto.
42. **El cambio de tema no se anunciaba.** Sólo mutaba `aria-pressed`, que no genera aviso
    en todos los lectores. Añadido un `role="status"` que anuncia el tema resultante.
43. **`.skip-link` usaba `999px` literal** en vez del token pill, y su color de texto no
    seguía al token de contraste sobre fondo de marca.
44. **El contador del filtro aplicaba `opacity: .7` sobre el texto**, lo que degrada el
    contraste que el token ya garantiza — y el tema claro tenía que deshacerlo con dos
    parches. Hereda ahora el color del botón. **Esta corrección introdujo una regresión
    real** al fijarlo a `--muted`: sobre el botón activo cian fallaba el contraste, y el
    gate de axe 4.13 lo detectó. Resuelto con `currentColor`.

## Tooling y gates (45-50)

45. **La regla de stylelint que prohíbe color literal apuntaba a los archivos equivocados**:
    `global.css` (sólo `@import`), `fonts.css` (sin colores) y un `icons.css` inexistente.
    Las capas que sí declaran color, `base.css` y `components.css`, quedaban fuera. La
    guarda estaba vacía y por eso sobrevivieron los 55 literales. Reorientada a las capas
    reales, con `tokens.css` como único lugar donde se define un color.
46. **`astro check` y TypeScript no estaban en `devDependencies`**: `npm run check` pedía
    una instalación interactiva y no era reproducible desde `npm ci`. Añadidos y fijados.
47. **stylelint tampoco estaba en el lockfile.** Añadido; desaparecen dos
    `npm install --no-save` de CI, cuyas transitivas se resolvían sin verificación de
    integridad y a las que Dependabot no veía.
48. **No había gate que impidiera la reaparición de literales.** La regla de stylelint
    reorientada lo cubre, y se ejecuta vía `npm run lint:css`.
49. **No había gate de geometría del sprite.** El recorte de los 32 glifos del lote anterior
    sobrevivió a Lighthouse, pa11y, axe y toda la suite porque ninguno compara geometría.
    `tools/check-sprite-geometry.js` mide la caja real de cada símbolo incluyendo los
    extremos de las curvas. Prueba negativa: al reintroducir el `viewBox` anterior, reporta
    26 de 32 símbolos recortados.
50. **No había regresión de las medidas de composición.**
    `tools/check-design-metrics.cjs` fija como invariantes el desbordamiento, el
    solapamiento, la compresión de la marca, la visibilidad del conmutador, el
    desplazamiento de ancla frente a la altura real del header, la separación del
    encabezado, la medida de lectura, la alineación de tarjetas, el CTA en el primer
    viewport móvil y el contraste de la marca en **ambos** temas.

## Dos defectos que introduje y cerré

Se registran porque explican por qué el gate quedó como quedó.

**La marca comprimida.** Al sacar los controles del `<nav>`, la fila del header pasó a tener
cuatro ítems flex y la marca se encogió de 158 px a 67 px. Fijada como no comprimible.

**El CTA solapando los controles.** Con `flex: 0 1 auto` y `min-width: 0`, el `.site-nav` se
comprimía por debajo de su contenido y sus hijos pintaban **encima** del grupo de controles:
el botón de WhatsApp cubría 35 px de «Tema» a 1440 px. Un contenedor flex en ese estado **no
produce desbordamiento del documento**, así que medir sólo `scrollWidth` no lo veía — el gate
mide ahora también solapamiento.

Al investigarlo apareció un defecto que venía de antes: el modo icono de los controles estaba
condicionado a `max-width: 1320px`, pero la fila vive dentro de `.container`, cuyo ancho está
topado en `--max` (1180 px). Un viewport más ancho no le da más sitio, de modo que por encima
de 1320 px reaparecían las etiquetas y la fila desbordaba 51 px a 1340, 1440 y 1920 px. Las
etiquetas nunca caben: el modo icono es ahora incondicional y el nombre accesible lo aporta
`aria-label`.

## Hallazgo estructural aplazado

El rail de secciones del inicio (punto 19) no se arregla con CSS. Vive dentro de la rejilla
`.journey` de la sección `#impacto`, y `position: sticky` se detiene con el contenedor: a
`journeyBottom = 156px` el rail ya ha salido, mientras sus enlaces apuntan a seis secciones
de toda la página. Hacerlo persistente exige envolver las seis secciones del inicio en una
rejilla común, lo que rompe los bordes a sangre completa de `.section--line` y el
`content-visibility` de las secciones bajo el pliegue. No se fuerza un arreglo parcial: se
documenta para abordarlo como cambio estructural propio. Mientras tanto la navegación de
página sigue disponible en el header, en la paleta de comandos y en el indicador de progreso.

Se verificaron y descartaron tres sospechas, para no apuntar a la causa equivocada:
`content-visibility` **no** era la causa del rail (se midió con y sin él: idéntico); la
rejilla destacada de proyectos con cinco elementos **sí** reparte 2+3 sin fila huérfana; y el
favicon lleva fondo oscuro **por diseño**, al vivir sobre el cromo del navegador.

## Verificación

- Build limpio en Node 22 aislado: 8 páginas.
- Tests sobre el HTML compilado: 46/46.
- `astro check`: 0 errores, 0 avisos.
- stylelint con el alcance corregido: limpio.
- Geometría del sprite: 32 símbolos dentro de su `viewBox`.
- Medidas de diseño: 15 anchos x 6 rutas sin desbordamiento, solapamiento ni compresión.
- Playwright + axe-core 4.13: 19/19.
- pa11y-ci (WCAG2AA): 6/6 rutas, 0 errores.
- Lighthouse con los presupuestos del repositorio: 6/6 rutas.
- Enlaces internos: 0 roturas.
- `npm ci` reproducible y `npm audit --omit=dev`: 0 vulnerabilidades.
- Instantánea de estilos computados: las diferencias en tema **oscuro** son únicamente las
  intencionales (radios ajustados a la escala, áreas de pulsación, banda vacía retirada,
  escala de `h3`); ninguna de color.
