# Hallazgos de CodeQL y tipado del dato del portfolio

Registro del lote que cierra las 18 alertas que CodeQL abrió sobre el PR de la
auditoría (`chore/portfolio-audit-optimizations`, que integra las 30 mejoras del
repositorio y la versión inglesa del sitio).

El workflow de CodeQL se añadió en ese mismo PR, así que estas alertas son el
primer resultado de un control nuevo: el job `Analyze JavaScript/TypeScript`
pasaba y el check `CodeQL` fallaba por los hallazgos. Las dos clases de alerta
venían del trabajo de i18n, no de código heredado.

## 1. La alerta alta: el filtro de etiquetas del gate de i18n

`js/bad-tag-filter` · severidad alta · `tools/check-i18n.js`

El detector de fugas de español eliminaba `<script>`, `<style>`, `<svg>` y los
subárboles `lang="es"` con expresiones sensibles a mayúsculas. HTML no lo es, así
que un `<SCRIPT>` o un `lang='ES'` atravesaba el filtro intacto y su contenido se
contaba como texto visible del documento.

Es la segunda vez que este fichero falla por la misma razón de fondo: el filtro
decide qué NO se mira, de modo que un filtro demasiado estrecho deja pasar ruido
y uno demasiado ancho borra el documento (la primera versión casaba cualquier
etiqueta con `lang="es"` y, al coincidir con `<html lang="es">`, informaba
«limpio» sobre cualquier página).

Correcciones aplicadas:

- todos los filtros de etiqueta llevan `i`, incluida la extracción de `<title>`
  y `<body>`;
- `\b` tras el nombre de la etiqueta, así `<a …>` ya no casa dentro de `<abbr …>`
  ni `<svg…>` cubre una etiqueta que sólo empiece igual;
- la etiqueta de cierre tolera espacios (`</script >`);
- `lang\s*=\s*["']es["']` acepta comillas simples y espacios alrededor del `=`;
- el filtro de comentarios reconoce `--!>`, que el parser real de HTML cierra
  igual que `-->`.

Verificado con la misma prueba de control que descubrió el defecto original: las
páginas españolas deben DISPARAR el detector y las inglesas callar.

| Página | Marcadores de español |
| --- | --- |
| `/`, `/about.html`, `/courses.html` | 24, 19, 20 |
| `/en/`, `/en/about.html`, `/en/courses.html` | 0, 0, 0 |

## 2. Las 17 alertas de «base siempre undefined», y el hueco real que destapan

`js/property-access-on-non-object` · severidad error · `src/i18n/content.ts`

CodeQL no resolvía el especificador `../data/portfolio.js` desde un fichero
`.ts`, así que tomaba el módulo entero por `undefined` y marcaba cada acceso a
`profile.facts`, `writing.outlets`, etc. Ninguno era un defecto de ejecución: las
17 propiedades existen en el dato.

Pero la alerta apuntaba a una debilidad que sí era real. El dato vivía en
JavaScript sin tipos, así que el resolutor de i18n afirmaba las formas a mano:

```ts
return (skills as Skill[]).map(…)
return (projects as Project[])
const raw = writing as { kicker: string; … }
```

Una aserción `as` **no se comprueba**. Si el dato se desviaba de su tipo, no lo
cazaba nadie y `astro check` seguía en 0.

El arreglo elimina la causa en vez de silenciar el síntoma:

- `src/data/portfolio.js` pasa a `src/data/portfolio.ts` y cada export lleva su
  tipo (`export const skills: Skill[] = …`), de modo que el **compilador valida
  el dato contra el contrato**;
- `src/types/content.ts` es el único hogar de cada forma: se le añadieron las que
  no tenían tipo (`Profile`, `ContentMeta`, `AudienceMetrics`,
  `ExperienceRecord`, `Writing`, `CvLink`, `CollaborationMode`, `TeachingEntry`,
  `ChannelEntry`, `OpenWebinarsCourse`, `StackGroup`) y se trajeron las que
  `src/i18n/content.ts` declaraba por su cuenta;
- las aserciones del resolutor bajan de **23 a 2**, y las dos que quedan son
  legítimas (`Object.keys` siempre devuelve `string[]`, y el acumulador que se
  rellena clave a clave);
- las claves de audiencia se tipan (`AudienceMetricKey`), lo que elimina el
  indexado por `string` que obligaba a castear en tres funciones. Los dos mapas
  de traducción de métricas, idénticos en `getTeaching` y `getChannels`, quedan
  en un solo `metricTranslator`.

Quien edita el portfolio sigue escribiendo objetos literales. Lo único que no
existía antes es la comprobación.

### La validación se verificó con una prueba de control

«0 errores» sólo significa algo si el tipado puede fallar. Sobre el árbol
construido:

| Alteración del dato | `astro check` |
| --- | --- |
| Quitar un campo obligatorio (`evidence` de un skill) | 1 error |
| Cambiar el tipo (`yearsExperience: 10` → `'diez'`) | 1 error |
| Dato intacto | 0 errores |

Con `as Skill[]` ninguna de las dos alteraciones se cazaba.

## 3. Dos exports muertos que la i18n dejó atrás

- `stackGroups`: el agrupado del stack lo hace `getStackGroups`, que selecciona
  por clave neutra y muestra el nombre traducido. El export del dato quedaba
  fijado al español y sin un solo consumidor.
- `experienceLede`: sustituido por `getExperienceLede`, que interpola los años en
  el idioma pedido. Cero referencias en el repositorio.

## 4. Verificabilidad del propio control

`codeql.yml` sólo disparaba en `main` (`push`/`pull_request: branches: [main]`) y
en el cron semanal. Un PR apilado sobre otra rama de feature no lo dispara, así
que un arreglo de hallazgos no se podía verificar hasta integrarlo. Se añadió
`workflow_dispatch` para poder re-escanear una rama a demanda.

## 5. Coherencia de referencias

El generador del registro de mejoras exige que cada ruta citada exista
(`tools/gen-improvements-record.js`), así que la ruta del dato se actualizó en
los documentos y en los gates que la leen **como texto** (no la importan):
`tools/check-certificates.js`, `check-headers.js`, `check-i18n.js`,
`check-links.js`, `gen-sitemap.js`, `validate-site.js`, las tres suites que la
inspeccionan y `README.md`. La prosa de los registros históricos no se tocó.

`docs/PORTFOLIO-ASTRO.md` llevaba desde la i18n una tabla desfasada: señalaba
`src/pages/*.astro` como origen del marcado y listaba exports directos, incluido
`experienceLede`. Ahora describe la estructura real (envoltorios de ruta,
componentes de página compartidos y resolutores).

### El gate de i18n se declaró ciego, y eso es la señal correcta

Al anotar los exports, la extracción de claves de `check-i18n.js` dejó de casar
(`export const projects =` pasó a `export const projects: Project[] =`). El gate
**no pasó en falso**: informó «No se pudo extraer ningún proyecto … el gate
quedaría ciego», que es la salvaguarda que se le puso al escribirlo. Corregido
para tolerar la anotación, y comprobado que vuelve a ver el dato completo: 10
proyectos, 13 skills, 8 etapas de trayectoria y 7 cursos.

## Validación

`npm ci` limpio en contenedor Node 22:

| Gate | Resultado |
| --- | --- |
| `astro check` | 0 errores · 0 avisos · 1 pista |
| `npm run build` | 14 páginas |
| `npm test` | 41/41 |
| `validate` | 7 rutas Astro, datos, seguridad y assets |
| `validate:sprite` | 32/32 símbolos |
| `validate:i18n` | cobertura + 0 fugas (control: ES 19-24, EN 0) |
| `validate:design` | marca 18,59:1 oscuro · 17,37:1 claro |
| `links` | sin enlaces rotos |
| `headers`, `sitemap:check`, `sync:static:check` | correctos |
| `content:health`, `lint:css`, `youtube:dry-run` | correctos |
| Playwright + axe 4.13 | 27/27 |
| pa11y-ci WCAG2AA | 12/12 rutas, 0 errores |
| Lighthouse | 8 rutas · 24 corridas en presupuesto |
| markdownlint, actionlint | limpios |

## Lo que sigue siendo decisión del usuario

No es código y no se implementó aquí:

- **Protección de la rama `main`**: sin ella un CodeQL rojo no bloquea nada, y
  un push o un merge directo entra igual. Es lo que convierte estos gates en
  obligatorios.
- **`LICENSE`**: el repositorio es público y no declara ninguna, así que
  legalmente nadie puede reutilizar su contenido. La elección es del autor.
- **Dependabot security updates** y **secret scanning**: ambos desactivados;
  son gratuitos en repositorios públicos.
- **GitHub Pages**: sigue activo y construyendo desde `main` con el dominio
  apuntado, mientras producción la sirve Vercel, de modo que `deploy-pages.yml`
  despliega en cada push sin que nadie consuma el resultado.
