# Contribuir

Este es el repositorio del portfolio profesional de Jerson Martínez
([jersonmartinez.com](https://www.jersonmartinez.com)). Es un sitio estático con
[Astro](https://astro.build). Las correcciones de contenido, accesibilidad,
rendimiento y SEO son bienvenidas vía issue o PR.

## Requisitos

- Node.js `>=22` (ver [`.nvmrc`](./.nvmrc)).

## Puesta en marcha

```bash
npm ci
npm run dev      # servidor de desarrollo
npm run build    # build de producción a dist/
```

## Antes de abrir un PR

Todos los gates de CI deben pasar en local. Ejecuta:

```bash
npm run check                 # astro check (0 errores)
VALIDATE_BUILD=1 npm test     # suite completa sobre el HTML compilado
npm run validate              # rutas, datos, seguridad y assets
npm run validate:sprite       # geometría del sprite SVG
npm run validate:design       # medidas de composición
npm run lint:css              # stylelint
npm run links                 # enlaces internos
```

## Convenciones

- Español en el contenido del sitio (coherente con la audiencia).
- Toda imagen con `width`/`height` explícitos para evitar CLS.
- Sin estilos ni scripts inline (CSP estricta sin `unsafe-inline`).
- Las dependencias y acciones de GitHub se fijan por versión/SHA; Dependabot
  mantiene las actualizaciones agrupadas.
- Los commits siguen Conventional Commits (`feat`, `fix`, `docs`, `chore`…).
