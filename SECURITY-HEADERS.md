# Cabeceras de seguridad y estrategia de rutas

`vercel.json` aplica en Vercel una CSP estricta sin `unsafe-inline`, HSTS,
protección contra framing y MIME sniffing, política de permisos, aislamiento de
contexto y una política de referrer limitada.

Los scripts interactivos viven en `public/scripts/` y los estilos inline fueron
retirados. Los únicos scripts inline restantes son bloques JSON-LD no
ejecutables. Fuentes, logos y fotos se sirven desde el mismo origen.

## Caché

Los assets con hash de Astro, las fuentes, las tarjetas sociales y las variantes
`profile-v2-*` son inmutables. Los logos usan una caché semanal con
`stale-while-revalidate`; los documentos HTML conservan revalidación inmediata.

## Rutas

Las variantes `*.html/` redirigen permanentemente a `*.html`. Las rutas limpias
redirigen a la URL `.html` canónica para conservar enlaces ya publicados.

## GitHub Pages

GitHub Pages no admite cabeceras HTTP personalizadas. La política completa se
aplica en Vercel, que sirve el dominio principal. Los validadores no atribuyen
estas cabeceras a Pages.

## Fuentes estáticas duplicadas

`public/robots.txt` y `public/sitemap.xml` son la fuente canónica. El comando
`npm run sync:static` replica esas versiones en la raíz y CI comprueba que no se
desincronicen.
