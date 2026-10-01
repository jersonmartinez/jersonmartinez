# Consolidación de Dependabot y endurecimiento de CI (2026-10-01)

Reemplaza las cinco PRs sueltas que Dependabot abrió el 28 de septiembre de 2026
por un único cambio verificado, y corrige la causa de que se acumularan.

## 1. Actualizaciones consolidadas

Las cinco PRs de Dependabot (#4, #5, #6, #7, #8) se cerraron como supersedidas
por esta. Sus bumps se aplicaron sobre el `main` actual, no mediante merge de sus
ramas: se crearon antes de que entraran las PRs #18, #19 y #20, así que sus
diffs apuntaban a versiones anteriores de los workflows.

| Acción | Antes | Ahora | PR original |
| --- | --- | --- | --- |
| `actions/checkout` | v4.2.2 | v7.0.1 | #6 |
| `actions/setup-node` | v4.4.0 | v7.0.0 | #8 |
| `actions/upload-artifact` | v4.6.2 | v7.0.1 | #5 |
| `actions/deploy-pages` | v4.0.5 | v5.0.1 | #7 |
| `peter-evans/create-pull-request` | v7.0.8 | v8.1.1 | #4 |
| `actions/configure-pages` | v5.0.0 | v6.0.0 | ninguna |
| `actions/upload-pages-artifact` | v3.0.1 | v5.0.0 | ninguna |

Las dos últimas estaban desactualizadas y **sin PR de Dependabot**: el
`open-pull-requests-limit: 5` se agotó con las otras cinco, así que quedaron
invisibles. Es el síntoma directo del problema que corrige el punto 3.

## 2. Pinning inmutable por SHA

Las 11 workflows referenciaban las acciones por etiqueta (`@v4.2.2`). Una
etiqueta es un puntero mutable: quien controla el repositorio de la acción puede
reapuntarla a otro commit y ejecutar código distinto con los permisos del
workflow. Ahora las 30 referencias usan el SHA completo del commit con el
nombre de versión como comentario:

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

Dependabot actualiza el SHA **y** el comentario en la misma operación, así que
el pinning no congela las actualizaciones. Es la recomendación de endurecimiento
de GitHub y de OpenSSF Scorecard (`Pinned-Dependencies`).

## 3. Agrupación de Dependabot

`.github/dependabot.yml` ahora agrupa:

- **GitHub Actions**: un grupo con `patterns: ['*']`, así que las siete acciones
  llegan en **una sola PR** en vez de una por acción.
- **npm**: `minor`/`patch` en una PR agrupada y los `major` aparte, para poder
  evaluar el cambio de contrato sin bloquear el resto.

Además se fijan `commit-message.prefix`, `labels`, `assignees` y una ventana
semanal explícita con zona horaria, y el límite baja a 3 porque ya no hace falta
una PR por dependencia.

## 4. Correcciones de consistencia

- `update-thumbnails.yml` usaba `node-version: 20` mientras
  `package.json` declara `engines.node >= 22` y las otras ocho workflows usan 22.
  Unificado en 22.
- Siete workflows no tenían `concurrency`: `validate`, `e2e`, `preview` y
  `site-quality` cancelan la ejecución anterior de la misma rama o PR
  (`cancel-in-progress: true`), y las programadas `certificates`,
  `content-health` y `production-smoke` se serializan sin cancelar
  (`cancel-in-progress: false`), que es lo correcto para un chequeo periódico.

## 5. Verificación

Los bumps mayores cruzan el salto a Node 24 en el runner (`checkout` v5,
`setup-node` v5, `upload-artifact` v5, `create-pull-request` v8). Todos los
runners son `ubuntu-latest` alojados por GitHub, que ya cumplen el mínimo de
runner 2.327.1; no hay runners self-hosted en este repositorio.

`actions/upload-pages-artifact` v4 dejó de incluir ficheros ocultos en el
artefacto. Se comprobó sobre el `dist` recién construido: **0 ficheros ocultos**,
y el despliegue por artefacto no ejecuta Jekyll, así que no requiere `.nojekyll`.
El cambio no afecta a este sitio.

Ejecutado en contenedor limpio Node 22 sobre el `dist` reconstruido desde cero:

| Gate | Resultado |
| --- | --- |
| `npm ci` | correcto |
| `astro build` | 8 páginas |
| `astro check` | 0 errores, 0 avisos |
| `node --test` con `VALIDATE_BUILD=1` | 46/46 |
| `validate-site.js` | 7 rutas, datos, seguridad y assets |
| `check-links.js` | 309 referencias internas, 0 fallos |
| `check-headers.js` | cabeceras, metadata social, schema.org y sitemap |
| `sync:static:check` | raíz sincronizada con `public/` |
| `youtube:dry-run` | 0 errores |
| markdownlint-cli2 | 0 incidencias |
| stylelint | 0 incidencias |
| actionlint 1.7.7 | 11 workflows correctos |

Tres de los siete bumps (`checkout`, `setup-node`, `upload-artifact`) se
ejecutan de verdad en los checks de esta PR. Los de Pages sólo corren en `push`
a `main` y `create-pull-request` sólo por programación o `workflow_dispatch`, así
que su ejecución real queda posterior al merge; `github-stats.yml` acepta
`dry_run` para probarlo sin abrir una PR.
