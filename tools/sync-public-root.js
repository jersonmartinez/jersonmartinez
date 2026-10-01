#!/usr/bin/env node
'use strict';

// Consolida la duplicidad robots.txt + sitemap.xml entre la raíz del repo y
// public/.
//
// Fuente de verdad: public/robots.txt y public/sitemap.xml (los que Astro copia
// a dist/ y publica). Las copias de la raíz existen para despliegues/legacy que
// sirven el repositorio sin construir (p. ej. GitHub Pages sobre la raíz) y
// DEBEN coincidir con las de public/.
//
// Este tool NO toca public/ (sólo lo lee). Genera/actualiza las copias de la
// raíz a partir de public/:
//   node tools/sync-public-root.js          -> escribe raíz desde public/
//   node tools/sync-public-root.js --check   -> falla si raíz != public/ (CI)
//
// Así se elimina la divergencia (la raíz tenía un sitemap sin changefreq/priority
// y en otro orden) manteniendo una sola fuente editable: public/.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');

const PAIRS = [
  { from: 'public/robots.txt', to: 'robots.txt' },
  { from: 'public/sitemap.xml', to: 'sitemap.xml' },
];

const abs = (p) => path.join(root, p);
const failures = [];
let written = 0;

for (const { from, to } of PAIRS) {
  if (!fs.existsSync(abs(from))) {
    failures.push(`Falta la fuente canónica ${from}.`);
    continue;
  }
  const canonical = fs.readFileSync(abs(from), 'utf8');
  const current = fs.existsSync(abs(to)) ? fs.readFileSync(abs(to), 'utf8') : null;

  if (CHECK) {
    if (current !== canonical) {
      failures.push(`${to} está desincronizado respecto a ${from} (ejecuta: npm run sync:static).`);
    }
  } else if (current !== canonical) {
    fs.writeFileSync(abs(to), canonical);
    written += 1;
    console.log(`Sincronizado ${to} desde ${from}.`);
  }
}

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exitCode = 1;
} else if (CHECK) {
  console.log('robots.txt y sitemap.xml de la raíz están sincronizados con public/.');
} else {
  console.log(`Sincronización completa: ${written} archivo(s) actualizado(s) desde public/.`);
}
