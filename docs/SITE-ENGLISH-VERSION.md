# Versión en inglés del sitio (i18n)

Registro de la implementación bilingüe del portfolio: qué decisiones se tomaron,
por qué, y cómo se verifica que la versión inglesa está completa.

## Resultado

El sitio publica **doce rutas**: las seis existentes en español, sin cambiar ni un
byte de sus URLs, y las seis equivalentes en inglés bajo `/en`.

| Español (por defecto) | Inglés |
| --- | --- |
| `/` | `/en` |
| `/projects.html` | `/en/projects.html` |
| `/courses.html` | `/en/courses.html` |
| `/certifications.html` | `/en/certifications.html` |
| `/experience.html` | `/en/experience.html` |
| `/about.html` | `/en/about.html` |

La 404 sigue siendo única y en español: Vercel sirve un solo `404.html` para
todo el dominio, así que una versión por idioma no sería alcanzable.

## Arquitectura

### El español no lleva prefijo

`/` sigue siendo `/`. Mover el español a `/es` habría invalidado todos los
enlaces publicados, los marcadores y el posicionamiento ya conseguido, a cambio
de nada. El inglés vive bajo `/en` y `x-default` apunta al español.

### Los segmentos de ruta no se traducen

`/en/projects.html`, no `/en/proyectos`. Las rutas ya estaban en inglés, así que
traducirlas sólo añadiría una tabla de equivalencias y una familia de redirects
que mantener, sin ganancia para el lector.

### Un solo marcado por página, dos idiomas

Este es el punto que decide el coste de mantenimiento. El marcado de cada página
vive **una vez** en `src/components/pages/*.astro`, y los doce ficheros de
`src/pages/**` son envoltorios de tres líneas que sólo fijan `lang`:

```astro
---
import HomePage from '../../components/pages/HomePage.astro';
---
<HomePage lang="en" />
```

La alternativa —duplicar el marcado por idioma— es la que produce deriva: una
corrección aplicada a una versión y olvidada en la otra. Con un solo marcado eso
no puede ocurrir.

### Los datos no se duplican

`src/data/portfolio.ts` sigue siendo la única fuente de verdad. El inglés es un
**solapamiento** (`src/i18n/content.en.ts`) indexado por claves que ya existen en
el dato y que no son texto visible (`experience.id`, `project.name`, el nombre de
dominio de un skill), así que reordenar los arrays no desalinea nada. Una clave
ausente cae al español: nunca rompe la página.

### Sin dependencias nuevas y sin tocar `astro.config.mjs`

No se usa la configuración `i18n` de Astro: con un idioma por defecto sin
prefijo, su aportación serían unos helpers que aquí se resuelven con las veinte
líneas de `src/i18n/config.ts`, a cambio de introducir una capa de enrutado sobre
ocho rutas que ya funcionaban.

## Cobertura garantizada por el compilador

El diccionario español es el **tipo de referencia** y el inglés se declara como
`Record<Lang, typeof es>`. Si al inglés le falta una clave o le cambia el tipo,
`astro check` falla. No hace falta un gate que compare claves: el compilador ya
lo es.

## Lo que NO se traduce, y por qué

- **Los títulos de los cursos de Udemy y OpenWebinars.** Los cursos se imparten
  en español: traducir el título anunciaría un producto que no existe. Se
  conservan tal cual, marcados con `lang="es"` para que un lector de pantalla los
  pronuncie bien, y la versión inglesa añade el aviso explícito
  *«These courses are taught in Spanish.»* Omitirlo llevaría a un lector
  anglófono a comprar un curso que no entiende.
- **Los nombres y niveles de las certificaciones.** Ya son los oficiales en
  inglés; cambiarlos rompería la correspondencia con el badge verificable.
- **El extracto del workflow de validación** del inicio. Se cita verbatim porque
  es código real del repositorio. Al comprobarlo se detectó que el extracto
  publicado decía `- name: Tests sobre el build compilado` mientras el fichero
  real dice `- name: Run tests against the compiled build`: la cita estaba
  desviada de la fuente y se corrigió, lo que además elimina la necesidad de
  traducirla.
- **Los identificadores de ancla** (`#impacto`, `#hotaka-ikhodi`,
  `#proyecto-kiro-crew`). Son identificadores que consume el scroll-spy y a los
  que apuntan enlaces ya publicados, no texto visible.

## Enlaces internos

Traducir el texto y dejar los enlaces apuntando al español habría sacado al
visitante de su idioma al primer clic. `localizePath()` traslada los enlaces de
página y **deja intactos los assets** (`/cv/*.pdf`, `/brands/*.svg`,
`/images/*`), que son compartidos: prefijarlos daría 404.

Se corrigieron dos enlaces que estaban fijados en el marcado y habrían devuelto
al visitante inglés a la versión española: el «Ver las N credenciales» de
`CredentialCard` y los enlaces de contexto de los resultados de «sobre mí».

## Los scripts de cliente también tenían texto

`public/scripts/site.js` y `copy.js` son ficheros estáticos compartidos por los
dos idiomas, así que no pueden importar el diccionario. Llevaban **seis cadenas
en español incrustadas** que se habrían visto en las páginas inglesas:

| Cadena | Dónde se veía |
| --- | --- |
| `Abrir menú` / `Cerrar menú` | nombre accesible del botón de menú |
| `Mostrando N de M proyectos` | estado del filtro de proyectos |
| `Activar tema oscuro` / `Activar tema claro` | nombre accesible del conmutador |
| `Tema claro activado.` / `Tema oscuro activado.` | aviso a lectores de pantalla |
| `Copiado` | respuesta del botón de copiar |

Solución: la cabecera las renderiza como atributos `data-*` desde el diccionario
y el script las **lee del DOM**. El script queda agnóstico al idioma y la fuente
sigue siendo única. Cada lectura conserva el texto español como respaldo, así que
un atributo ausente degrada al comportamiento anterior en vez de dejar un botón
sin nombre.

El estado del filtro es una **plantilla** (`Showing {shown} of {total} projects`),
no una función: una función no puede viajar al navegador, así que la plantilla es
lo que se comparte entre el build y el script.

## SEO

- `hreflang` recíproco (`es`, `en`, `x-default`) en las doce rutas. Sólo se emite
  cuando la página existe en los dos idiomas: anunciar un alternate hacia una URL
  que devuelve 404 es peor que no anunciar ninguno.
- `og:locale` por idioma y `og:locale:alternate` hacia el otro. (En la auditoría
  anterior se retiró un `og:locale:alternate` en_US porque era falso: no existía
  página inglesa. Ahora existe, y vuelve con fundamento.)
- **Sitemap multilingüe**: doce URLs, cada una declarando sus alternativas con
  `xhtml:link`, que es lo que distingue «traducciones» de «contenido duplicado»
  para un buscador. Misma prioridad en los dos idiomas: es el mismo contenido
  para audiencias distintas.
- `JSON-LD` con `inLanguage` por idioma; `Person.knowsLanguage` ya declaraba
  `['es', 'en']`.
- Redirects espejo para `/en`: `/en/`, `/en/index.html`, las variantes con barra
  final y las formas sin extensión.
- Las tarjetas sociales se **comparten**: no llevan texto de página, así que
  duplicarlas por idioma sería 1,5 MB de peso sin información nueva.

## El conmutador de idioma

Vive en `.header-controls`, junto al conmutador de tema, por la misma razón por
la que éste salió de `<nav>`: dentro del menú colapsado quedaría inalcanzable en
móvil. Apunta a **la misma página** en el otro idioma, no a la portada; cuando la
página no existe en el otro idioma (404, guía visual) cae al inicio de ese
idioma, que es una página real.

Su etiqueta («EN» / «ES») **sí es visible**, a diferencia de sus hermanos, que
van en modo icono: el icono de idioma no dice a qué idioma se cambia, así que las
dos letras son la información, no decoración. `lang` y `hreflang` describen el
destino, de modo que un lector de pantalla anuncia el cambio.

## Dos defectos de maquetación que introdujo el cuarto control

Se documentan porque explican los cambios de CSS, y porque los dos los detectó el
gate de medidas, no la revisión visual.

**Desbordamiento de 24 px por encima de 1320 px.** El hueco de la fila y el
relleno de los enlaces estaban dentro de `@media (max-width: 1320px)`, así que por
encima de ese ancho volvían a valores más holgados. Medido: el contenedor mide
**1180 px a todos esos anchos**, porque está topado en `--max`, de modo que el
espacio holgado nunca existió. Es la misma premisa equivocada que ya había
afectado al modo icono de los controles; ahora los valores son incondicionales.

**Desbordamiento de 11 px a 1200 px.** La navegación completa se desplegaba a
partir de 1200 px, donde el contenedor mide 1164, pero la fila española necesita
**1175 px** (marca 158 + nav 802 + controles 175 + 2 huecos de 20). El contenedor
sólo alcanza esa cifra en su tope de 1180 px, a partir de 1216 px de viewport. El
corte se subió a 1219/1220 px: el menú se despliega cuando cabe, no un paso antes.

**En el extremo estrecho** (320 px, el suelo de diseño) la fila pedía 351 px con
296 disponibles. Se retiró lo que no es accionable en táctil —el botón de la
paleta de comandos, que se abre con un atajo de teclado inexistente ahí—
extendiendo el criterio por el que ya se ocultaba la pista `⌘K` por debajo de
560 px, y el icono del conmutador (no su etiqueta). Resultado medido: 278 px, con
18 px de margen.

El gate de la marca pasó a comparar contra el valor **intencionado en cada tramo**
(128 px por debajo de 421 px), porque lo que persigue es la compresión por flex
—se midió una caída de 158 a 67 px— no un valor de diseño declarado.

## Verificación

### El gate que de verdad prueba que la traducción está completa

`npm run validate:i18n` (`tools/check-i18n.js`) hace dos cosas:

1. **Cobertura del solapamiento**: cada proyecto, skill, experiencia y curso de
   `portfolio.ts` tiene su entrada en inglés. Como el resolutor cae al español
   cuando falta una clave, un registro nuevo sin traducir se publicaría en
   español dentro de `/en` sin que nada avisara. Este check es ese aviso.
2. **Fugas de español en el `dist` de `/en`**: no depende de recordar todos los
   sitios donde hay texto, porque mira el resultado publicado. Excluye los
   subárboles marcados `lang="es"` e ignora atributos, scripts y JSON-LD.

La primera versión del detector **estaba ciega** y lo delató una prueba de
control, no el propio gate: su regla para excluir los subárboles españoles casaba
cualquier etiqueta, de modo que `<html lang="es">` coincidía y **borraba el
documento entero**; informaba «limpio» sobre cualquier página. Corregido
restringiendo la regla a etiquetas de contenido y conservando el `<title>`. La
medición de control ahora es decisiva:

| | Marcadores de español detectados |
| --- | --- |
| Páginas españolas | 19–24 |
| Páginas inglesas | 0 |

### Gates existentes extendidos a los dos idiomas

| Gate | Antes | Ahora |
| --- | --- | --- |
| Enlaces internos | 6 páginas, 315 referencias | 12 páginas, **589 referencias**, 0 fallos |
| Medidas de diseño | 15 anchos x 6 rutas | 15 anchos x **12 rutas** |
| axe (e2e) | 6 rutas | **12 rutas** |
| pa11y (WCAG2AA) | 6 rutas | **12 rutas**, 0 errores |
| SEO por página (`validate`) | 7 rutas | **13 rutas** |
| Lighthouse | 6 rutas | 6 + 2 inglesas representativas |

Lighthouse no cubre las doce a propósito: las páginas comparten componentes, CSS,
imágenes y scripts, así que el peso y el rendimiento son idénticos y lo único que
cambia es la longitud del texto. Medir las doce serían 36 corridas en un job con
25 minutos de techo sin medir nada nuevo. La **accesibilidad** de las seis
inglesas sí se cubre entera, en pa11y y en axe.

### Dos valores fijados que el idioma nuevo dejó obsoletos

- `check-headers.js` exigía exactamente **6** `lastmod`. Ahora el número se
  deriva de rutas x idiomas.
- El gate de SEO y el de assets huérfanos leían `src/pages/*.astro`, que son
  envoltorios: comprobarlos ahí habría pasado **sin verificar nada**. Apuntan a
  `src/components/pages/`. El escaneo de assets además rompía con `EISDIR` al
  encontrar el nuevo directorio, y pasó a ser recursivo.

### Pruebas nuevas

- Ida y vuelta del conmutador **sobre una página interior**, no sobre el inicio:
  un conmutador que apuntara siempre a la portada pasaría una prueba hecha en el
  inicio y perdería al visitante en cualquier otra página.
- La versión inglesa navega y filtra con las rutas prefijadas, comprobando que el
  estado del filtro que escribe `site.js` sale en inglés.

### Estado de los gates

`npm ci` limpio en contenedor Node 22: build **14 páginas**, `astro check`
0 errores / 0 avisos / 1 pista, sprite 32/32, **46/46** tests, `validate`,
`validate:i18n`, enlaces 589/0, cabeceras, sync, sitemap, stylelint 0,
medidas de diseño (marca 18,59:1 oscuro / 17,37:1 claro), **27/27** e2e con axe
4.13, pa11y **12/12 rutas con 0 errores**, Lighthouse **8 rutas / 24 corridas**
en presupuesto.
