# Optimizaciones de alcance de gates, LCP y accesibilidad verificable

Lote posterior a la auditoría de 30 puntos, a la versión inglesa y al cierre de
CodeQL. El criterio de selección fue distinto de los lotes anteriores: en lugar
de buscar funcionalidad que falte, se midió **qué está protegido de verdad** y
qué sólo parece estarlo. La mayoría de los puntos de aquí son gates que pasaban
sin mirar nada, o cobertura que se quedó en español al añadir el inglés.

Lo que no se tocó, y por qué, está al final.

## 1. Los PR apilados no disparaban ningún gate

Los cinco workflows de `pull_request` declaraban `branches: [main]`. Un PR
abierto contra otra rama de feature — exactamente como se construyeron
[#31](https://github.com/jersonmartinez/jersonmartinez/pull/31) y
[#32](https://github.com/jersonmartinez/jersonmartinez/pull/32) — no disparaba
`validate`, `e2e`, `site-quality`, `codeql` ni `preview`. Los dos PR se
publicaron con **sólo los dos checks de Vercel**, y CodeQL hubo que lanzarlo a
mano por `workflow_dispatch` para poder verificar su propio arreglo.

El filtro se retira del disparador `pull_request` y se conserva en `push`:
publicar sigue midiendo únicamente `main`, pero cualquier PR se valida.

Dos huecos relacionados, del mismo origen:

- `validate.yml` y `preview.yml` eran los dos únicos workflows sin
  `workflow_dispatch`. Con filtros `paths` activos, un cambio fuera de esas
  rutas no disparaba nada y no había forma de validar la rama a demanda.
- El job de CodeQL era el único del repositorio sin `timeout-minutes`, así que
  heredaba las 6 h por defecto de GitHub. El escaneo real tarda ~1 min; ahora
  declara 20.

## 2. El gate de accesibilidad silenciaba la regla más importante

`.pa11yci.json` llevaba `"ignore": ["color-contrast"]` sin una línea de
explicación. Eso deja indistinguibles dos situaciones muy distintas: una
exclusión justificada y el silenciamiento de fallos reales. Se midió cuál era.

| Medición | Resultado |
| --- | --- |
| pa11y-ci 4.1.1 con la regla activada | **0 de 8** rutas pasan |
| axe-core 4.13 vía Playwright, doce rutas | **0 violaciones** de contraste |
| Par que pa11y marcaba: `--muted` `#a8bbcc` sobre `#07111f` | **9.60:1** (AA exige 4.5:1) |

pa11y-ci 4.1.1 empaqueta axe 4.11, que resuelve mal el fondo heredado y atribuye
a los textos sobre `body` un relleno de acento. El fallo no es real: 9.60:1 pasa
con holgura. La exclusión se mantiene, pero ahora **documentada con esa
medición** y con la condición de retirada (que pa11y publique axe >= 4.12).

Y como una exclusión documentada sigue siendo una regla sin cubrir, se añadió el
check que la cubre de forma determinista.

## 3. Gate determinista de contraste de tokens

`validate:design` medía un solo par: la marca sobre el header. El nuevo check
resuelve **9 pares texto/superficie por tema** desde los tokens tal como el
navegador los computa, y falla por debajo de 4.5:1.

```text
contraste de tokens en tema dark:  9 pares, peor caso 7.49:1
contraste de tokens en tema light: 9 pares, peor caso 5.02:1
```

No sustituye a axe: lo complementa donde axe no llega. El gate axe sólo ve los
colores que **algún elemento usa hoy**; este mide los tokens, así que caza una
combinación que se vuelva ilegible antes de que exista una página que la use.

Prueba de control (degradando `--muted` del tema claro a `#9aa6b2`):

```text
Medidas de diseño INCORRECTAS (3):
  - tema light: --muted sobre --ink contrasta 2.22:1 (WCAG AA exige 4.5:1)
  - tema light: --muted sobre --surface contrasta 2.48:1 (WCAG AA exige 4.5:1)
  - tema light: --muted sobre --surface-raised contrasta 2.48:1 (WCAG AA exige 4.5:1)
```

## 4. La imagen LCP se servía en el formato más pesado disponible

`public/images/` contenía tres retratos AVIF — `profile-v2-320/640/960.avif`,
46 KB en total — y **ninguno se servía**: el `<picture>` del héroe sólo
declaraba WebP y JPEG. `validate-site.js` exigía que el AVIF de 320 existiera,
de modo que el repositorio garantizaba un asset que nadie podía pedir: peso
desplegado sin un solo consumidor.

El AVIF pasa a ser la primera `<source>` del héroe y de la cara de «sobre mí»,
y es lo que se precarga:

| Candidato | AVIF | WebP | Ahorro |
| --- | --- | --- | --- |
| 320w | 5 701 B | 6 564 B | 13 % |
| 640w | 13 614 B | 16 200 B | 15 % |
| 960w | 26 505 B | 30 904 B | 14 % |

El retrato del héroe es el elemento LCP, así que el ahorro cae justo en la
métrica que decide la percepción de velocidad. Safari < 16.4 y cualquier
navegador sin AVIF siguen recibiendo WebP y, en último término, JPEG.

### Un bug latente que esto habría activado

El `<link rel="preload">` del layout fijaba `type="image/webp"` mientras la URL
llegaba por props. Precargar AVIF con ese `type` habría anunciado un formato
distinto del real, y un navegador puede descartar una precarga cuyo tipo no
coincide — dejando sin precargar exactamente el recurso crítico. El `type` se
deriva ahora de la extensión.

## 5. Huecos de cobertura que dejó la versión inglesa

La i18n extendió los gates de enlaces, medidas, axe, pa11y y SEO a `/en`. Tres
se quedaron fuera:

- **`check-headers.js`** validaba `og:*`, `twitter:*`, canonical y JSON-LD en
  seis rutas españolas + 404. Las seis inglesas no estaban validadas: una
  regresión que afectara sólo al inglés pasaba entera. Ahora son 13 páginas.
- **`check-production.js`** medía sólo el español. `/en` podía estar caída en
  producción — o servir un canonical español, que es peor, porque desindexa la
  página inglesa — sin que nada avisara. Ahora cubre las 12 rutas, los 11
  redirects y el juego `hreflang` (`es`/`en`/`x-default`) en cada una.
- **`security.txt`** se comprobaba contra la fecha de hoy, así que el fallo
  llegaba **el día** de la caducidad: demasiado tarde, porque un `security.txt`
  expirado es inválido para los escáneres que lo consumen y el canal de
  divulgación desaparece en silencio. Ahora avisa con 30 días de margen y
  verifica que los campos obligatorios de RFC 9116 estén presentes.

## 6. Las anclas del sitio no se comprobaban

`check-links.js` resuelve la página destino pero descarta el fragmento
(`value.split('#')[0]`) y salta los enlaces que son sólo ancla. El sitio tiene
**467 fragmentos** y no se comprobaba ninguno. Un ancla rota no falla en ningún
sitio: el navegador carga la página y simplemente no salta, que es
indistinguible de funcionar.

El riesgo es concreto desde la i18n, porque los fragmentos son identificadores
derivados del dato (`experience.id`, el slug de un proyecto) **compartidos entre
los dos idiomas** a propósito, sin tabla de traducción: si un id del dato cambia,
se rompen los enlaces de ES y EN a la vez.

`tools/check-anchors.js` resuelve cada fragmento contra los `id` reales de su
página destino. Los 467 resuelven hoy. Como los gates que dejan de ver su
objeto son el fallo más difícil de notar, se declara ciego si resuelve menos de
50 anclas en lugar de informar «limpio» sin haber mirado nada.

Prueba de control (renombrando `id="contacto"` en el home construido):

```text
Anclas ROTAS (1 de 467 comprobadas):
  - /: #contacto no existe en /
```

## 7. La 404 hablaba un solo idioma

El hosting sirve **una** página de error para todo el dominio, así que la misma
responde a `/en/ruta-inexistente`. Estaba sólo en español: un visitante que
llegaba desde la versión inglesa con un enlace roto recibía un mensaje que no
entiende y sin ninguna salida hacia `/en`.

No se duplica la ruta — el servidor no consultaría `/en/404` — sino que la página
habla los dos idiomas y ofrece los destinos de ambos. El bloque inglés lleva su
propio `lang` para que un lector de pantalla cambie de voz.

Por el mismo motivo, `humans.txt` pasa a ser bilingüe: el `<link rel="author">`
del layout apunta a él también desde las páginas inglesas.

## 8. Cabeceras de caché que caían al default

`vercel.json` declaraba `Cache-Control` para `/_astro/`, `/scripts/`, `/social/`,
`/fonts/`, `/brands/` y el retrato, pero no para `/brand/` (los favicons y el
apple-touch-icon, que se piden en cada visita), `/cv/` (dos PDF de ~110 KB),
`/humans.txt`, `/.well-known/` ni el trío `robots.txt` / `sitemap.xml` /
`site.webmanifest`. Todos tienen ahora una política explícita acorde a su
volatilidad.

El manifest añade además `id` — identidad estable de la aplicación instalada,
que sin declarar queda atada a `start_url` y cambia si esa URL cambia — junto a
`dir` y `categories`.

## Validación

Reproducido en contenedor Node 22 desde un `npm ci` limpio:

| Gate | Resultado |
| --- | --- |
| `astro build` | 14 páginas |
| `astro check` | 0 errores, 0 avisos |
| `npm test` | **48 · 0 fallos** |
| `validate` | correcto |
| `anchors` | **467** fragmentos resueltos |
| `headers` | **13** páginas (antes 7) |
| `validate:i18n` | cobertura y ausencia de fugas |
| `links` | **593** referencias, 0 fallos |
| `sitemap:check` / `sync:static:check` | sincronizados |
| `lint:css` | 0 |
| `validate:design` | medidas + **18** pares de contraste |
| Playwright + axe 4.13 | **27/27** |
| pa11y-ci WCAG2AA | **12/12**, 0 errores |
| Lighthouse | **8 rutas / 24 corridas** en presupuesto |
| actionlint | los 5 workflows editados, limpios |

Cada gate nuevo se verificó con una prueba de control que lo hace fallar: un
`og:title` roto sólo en la página inglesa, un `id` renombrado en el home, una
fecha de `security.txt` a 10 días y un token de color degradado. Un gate que
nunca se ha visto fallar no es evidencia de nada.

## Lo que no se tocó

- **`deploy-pages.yml`.** GitHub Pages sigue activo y construyendo desde `main`,
  mientras producción la sirve Vercel y el apex redirige a `www` servido por
  Vercel: Pages no sirve tráfico. Retirar un camino de despliegue es una
  decisión de infraestructura, no una optimización, y queda para el titular.
- **`LICENSE`.** Elegir licencia es una decisión legal del autor.
- **Protección de `main`, Dependabot security updates y secret scanning.** Son
  ajustes de repositorio que sólo un administrador puede activar. El primero es
  el de mayor retorno: mientras `main` no esté protegida, todos estos gates son
  opcionales y un push directo los salta.
