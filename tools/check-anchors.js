#!/usr/bin/env node
'use strict';

/**
 * Gate de ANCLAS: resuelve cada fragmento `#id` del sitio construido contra los
 * `id` reales de su página destino.
 *
 * Por qué hace falta: `tools/check-links.js` comprueba que la PÁGINA destino
 * exista, pero descarta el fragmento (`value.split('#')[0]`) y salta los
 * enlaces que son sólo ancla. Así que de los cientos de anclas del sitio no se
 * comprobaba ninguna, y un ancla rota no falla en ningún sitio: el navegador
 * carga la página y simplemente no salta, que es indistinguible de funcionar.
 *
 * El riesgo es concreto desde la versión inglesa: los fragmentos son
 * IDENTIFICADORES derivados del dato (`experience.id`, el slug de un proyecto) y
 * se comparten entre los dos idiomas a propósito, sin tabla de traducción. Si
 * un id del dato cambia, se rompen los enlaces de los DOS idiomas a la vez y
 * nada lo señala.
 *
 *   node tools/check-anchors.js
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('No existe dist/: ejecuta `npm run build` antes de este gate.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(dist);

/** URL pública -> fichero del dist. `.../index.html` se expone sin el index. */
const pageOf = new Map();
for (const file of htmlFiles) {
  const url = file.slice(dist.length).split(path.sep).join('/').replace(/\/index\.html$/, '') || '/';
  pageOf.set(url, file);
}

const idCache = new Map();
function idsIn(file) {
  if (!idCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
  }
  return idCache.get(file);
}

/** Resuelve el destino de un href relativo al documento que lo contiene. */
function resolveTarget(href, fromUrl) {
  const target = href.slice(0, href.indexOf('#'));
  if (!target) return fromUrl; // ancla en la misma página
  const clean = target.replace(/\/$/, '') || '/';
  for (const candidate of [clean, `${clean}/`, target]) {
    if (pageOf.has(candidate)) return candidate;
  }
  return null;
}

const failures = [];
let checked = 0;

for (const file of htmlFiles) {
  const fromUrl = file.slice(dist.length).split(path.sep).join('/').replace(/\/index\.html$/, '') || '/';
  const html = fs.readFileSync(file, 'utf8');

  for (const match of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(href)) continue;

    const fragment = decodeURIComponent(href.slice(href.indexOf('#') + 1));
    if (!fragment) continue;

    const targetUrl = resolveTarget(href, fromUrl);
    if (targetUrl === null) {
      failures.push(`${fromUrl}: el destino de ${href} no corresponde a ninguna página construida`);
      continue;
    }
    checked += 1;
    if (!idsIn(pageOf.get(targetUrl)).has(fragment)) {
      failures.push(`${fromUrl}: #${fragment} no existe en ${targetUrl}`);
    }
  }
}

// Si la extracción deja de encontrar anclas, el gate pasaría en falso y nadie
// se daría cuenta. Se declara ciego antes que informar «limpio» sin haber
// mirado nada: el sitio tiene cientos de anclas por construcción.
if (checked < 50) {
  console.error(`Sólo se resolvieron ${checked} anclas: el gate quedaría ciego. Revisa la extracción de href en este tool.`);
  process.exit(1);
}

if (failures.length) {
  console.error(`Anclas ROTAS (${failures.length} de ${checked} comprobadas):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Anclas correctas: ${checked} fragmentos resueltos en ${htmlFiles.length} páginas.`);
