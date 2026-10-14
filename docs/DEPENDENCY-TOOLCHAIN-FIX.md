# Toolchain de tipos y dependencias: por qué fallaba y qué se corrigió

Registro del fallo que Vercel notificó el 5 de octubre de 2026
(«Preview deployment failed … Command `npm install` exited with 1», rama
`dependabot/npm_and_yarn/npm-major-9520eca85a`, commit `fabe62f`) y de las dos
causas distintas que lo producían.

## Lo que falló

Dos PRs de Dependabot abiertas a la vez, y **ninguna podía estar verde por
separado**:

| PR | Contenido | Check que fallaba | Causa |
| --- | --- | --- | --- |
| npm-major | `typescript` 5.6.3 → 7.0.2, `stylelint` 16 → 17, `stylelint-order` 6 → 8 | `npm ci` (y el `npm install` de Vercel) | ERESOLVE: TypeScript 7 queda fuera del rango de par de `@astrojs/check` |
| npm-minor-patch | `@astrojs/check` 0.9.4 → 0.9.10 | `astro check` | 3 errores: `node:fs`, `node:path` y `process` sin tipos |

## Causa 1 — techo aguas arriba en TypeScript

`@astrojs/check@0.9.10`, que es **la última versión publicada**, declara:

```json
"peerDependencies": { "typescript": "^5.0.0 || ^6.0.0" }
```

TypeScript 7 no entra en ese rango, así que la resolución falla antes de
compilar nada. No es un problema del lockfile ni de la configuración de Vercel:
es un techo de la dependencia, y no existe ninguna versión de `@astrojs/check`
que lo levante.

Decisión: subir a **TypeScript 6.0.3**, que sí está soportado, y declarar en
Dependabot que `typescript >= 7` se ignora **mientras** el par lo prohíba. Sin
esa regla, Dependabot vuelve a proponer el mismo bump imposible cada lunes y
Vercel vuelve a notificar el mismo fallo.

TypeScript 6 destapó 26 errores reales de tipos en el propio código, que se
corrigieron en vez de evitarse (ver más abajo).

## Causa 2 — `@types/node` sólo existía por accidente

`tsconfig.json` declara `"types": ["node"]`, pero `@types/node` **no estaba en
`devDependencies`**. Funcionaba porque `vite` (transitiva de `astro`) lo trae…
como **peer opcional**:

```json
"peerDependencies": { "@types/node": "^20.19.0 || >=22.12.0" }
```

Un peer opcional no está garantizado. El lockfile de `main` lo tenía fijado, así
que el type-check pasaba; en cuanto Dependabot regeneró el lockfile, el paquete
desapareció del árbol (`npm ls @types/node` → vacío) y `astro check` dejó de
resolver los módulos de Node que `src/pages/index.astro` usa en build para leer
el cache de estadísticas de GitHub.

Decisión: declarar `@types/node` explícitamente, en la línea **22.x**, que es el
runtime que fija `engines.node` (`>=22`) y el que usan los workflows. Los
mayores quedan ignorados en Dependabot: un `@types/node` por delante del runtime
describiría APIs que en ejecución no existen.

## Causa estructural — el agrupamiento partía una actualización atómica

`typescript` y `@astrojs/check` están acoplados por dependencia de par, pero
caían en grupos distintos (`npm-major` y `npm-minor-patch`), así que Dependabot
los movía en **dos PRs separadas**: una subía TypeScript fuera del rango del par
y la otra dejaba el par sin su TypeScript. Ninguna de las dos podía pasar sola.

Ahora los tres paquetes viven en un grupo `astro-typecheck`, de modo que la
actualización llega siempre completa.

## Tipos: 26 errores corregidos, no silenciados

Los componentes destructuraban `Astro.props` sin interfaz, así que todo era `any`
y los parámetros de cada `.map()` heredaban ese `any` en silencio. TypeScript 5.6
lo señalaba como pista; TypeScript 6 lo convierte en error.

- `src/types/content.ts` (nuevo) declara una sola vez las formas del dato
  (`Skill`, `Certification`, `CredentialItem`, `Project`, `Course`, `LogoItem`).
  El dato sigue siendo JavaScript a propósito: quien edita el portfolio escribe
  datos, no tipos.
- Ocho componentes y el layout declaran ahora su `interface Props`.
- `CourseCard` pasa a una **unión discriminada** por `shape`. Antes `shape` se
  infería como `string` y TypeScript no podía estrechar la cadena de ternarios,
  así que leer `a.cx` / `a.w` / `a.d` no se verificaba. **No era un defecto de
  ejecución**: el ternario sí discrimina; lo que faltaba era el tipo literal que
  lo demuestra.
- `Course.free` es opcional porque en el dato real sólo la etapa gratuita declara
  el campo (comprobado en `src/data/portfolio.ts`: 1 de 7).

Resultado: `astro check` pasa de «0 errores, 18 pistas» a **0 errores, 0 avisos,
1 pista**. Las 18 pistas eran exactamente esos `any` implícitos.

## Build reproducible

Al comparar el `dist` del candidato con el de `main` para demostrar que el
tipado no altera la salida, 7 de 8 páginas eran idénticas byte a byte y
`index.html` no. La causa no era el cambio: `CodeBlock.astro` generaba su `id`
con `Math.random()`, así que **dos builds del mismo commit ya producían un `dist`
distinto** (comprobado reconstruyendo `main` dos veces).

El `id` pasa a derivarse del contenido con SHA-256. Con eso:

- dos builds del mismo árbol dan el mismo hash de `index.html`;
- normalizando sólo ese `id`, la salida es **idéntica a `main`**, lo que prueba
  que el tipado no cambió ni un byte del HTML publicado.

Un build reproducible es además lo que permite verificar por comparación de bytes
que una futura subida de dependencias no altera el sitio.

## Verificación

Contenedor limpio Node 22, desde `npm ci` con el lockfile nuevo:

| Gate | Resultado |
| --- | --- |
| `npm ci` | sin ERESOLVE |
| `npm run build` | 8 páginas |
| `astro check` | 0 errores, 0 avisos, 1 pista |
| `validate:sprite` | 32/32 símbolos dentro de su viewBox |
| `VALIDATE_BUILD=1 npm test` | 46/46 |
| `validate` | 7 rutas, datos, seguridad y assets |
| `links` | 302 referencias internas, 0 fallos |
| `headers` | cabeceras, social, schema.org y sitemap |
| `sync:static:check` | raíz sincronizada con `public/` |
| `youtube:dry-run` | sin errores |
| `lint:css` (stylelint 17) | 0 |
| `validate:design` | todas las medidas, marca 18.59:1 dark / 17.37:1 light |
| E2E + axe 4.13 | 19/19 |
| pa11y-ci WCAG2AA | 6/6 rutas, 0 errores |
| Lighthouse CI | 6 rutas dentro de presupuesto |
| actionlint 1.7.7 | 11 workflows, 0 |
| `npm audit --omit=dev` | 0 vulnerabilidades |

`npm audit` completo (incluye dev) baja de **7 a 6** avisos altos. Los 6
restantes son la cadena `braces → micromatch → fast-glob → globby` que arrastra
`stylelint`, cuya última versión publicada es la que ya se usa: no hay bump que
los cierre y no afectan a la superficie de producción, que no lleva dependencias
en ejecución.
