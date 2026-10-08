#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const notes = [];
const fail = (message) => failures.push(message);

function validateHeaders() {
  if (!exists('vercel.json')) return fail('Falta vercel.json.');
  let config;
  try { config = JSON.parse(read('vercel.json')); } catch (error) { return fail(`vercel.json inválido: ${error.message}`); }
  const globalRule = (config.headers || []).find((rule) => rule.source === '/(.*)');
  if (!globalRule) return fail('Falta regla global de cabeceras.');
  const headers = new Map(globalRule.headers.map((header) => [header.key.toLowerCase(), header.value]));
  const csp = headers.get('content-security-policy') || '';
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "script-src 'self'", "style-src 'self'"]) if (!csp.includes(directive)) fail(`CSP no incluye ${directive}.`);
  if (/unsafe-inline|unsafe-eval/.test(csp)) fail('CSP no debe usar unsafe-inline ni unsafe-eval.');
  const expected = {
    'x-content-type-options': /nosniff/i,
    'x-frame-options': /^(DENY|SAMEORIGIN)$/i,
    'referrer-policy': /strict-origin|no-referrer|same-origin/i,
    'permissions-policy': /geolocation=\(\)/i,
    'strict-transport-security': /max-age=/i,
  };
  for (const [key, pattern] of Object.entries(expected)) {
    const value = headers.get(key);
    if (!value) fail(`Falta ${key}.`); else if (!pattern.test(value)) fail(`${key} tiene valor inesperado.`);
  }
}

// Las doce páginas públicas más la 404. La lista cubría sólo las seis españolas,
// así que og:*, twitter:*, canonical y el JSON-LD de /en no estaban validados por
// este gate: una regresión que afectara sólo al inglés pasaba entera.
const ROUTE_FILES = ['index.html', 'projects.html/index.html', 'experience.html/index.html',
  'certifications.html/index.html', 'courses.html/index.html', 'about.html/index.html'];
const BUILD_PAGES = [
  ...ROUTE_FILES.map((file) => [`dist/${file}`, true]),
  ...ROUTE_FILES.map((file) => [`dist/en/${file}`, true]),
  ['dist/404.html', false],
];
function validateMetadata() {
  const haveBuild = BUILD_PAGES.every(([file]) => exists(file));
  if (!haveBuild) {
    notes.push('dist incompleto: metadata final se validará después de npm run build.');
    const layout = read('src/layouts/BaseLayout.astro');
    for (const marker of ['og:title', 'twitter:card', 'application/ld+json', '/social/']) if (!layout.includes(marker)) fail(`BaseLayout no declara ${marker}.`);
    return;
  }
  for (const [file, requireSchema] of BUILD_PAGES) {
    const html = read(file);
    for (const marker of ['property="og:title"', 'property="og:description"', 'property="og:image"', 'name="twitter:card"', 'rel="canonical"']) if (!html.includes(marker)) fail(`${file}: falta ${marker}.`);
    const image = (html.match(/property="og:image" content="https:\/\/www\.jersonmartinez\.com([^\"]+)/) || [])[1];
    if (!image || !exists(`public${image}`)) fail(`${file}: og:image no existe localmente.`);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (requireSchema && blocks.length === 0) fail(`${file}: falta JSON-LD.`);
    for (const [, json] of blocks) {
      try { const parsed = JSON.parse(json); if (!parsed['@context'] || !parsed['@type']) fail(`${file}: JSON-LD sin contexto/tipo.`); }
      catch (error) { fail(`${file}: JSON-LD inválido: ${error.message}`); }
    }
    if (file === 'dist/404.html' && !html.includes('name="robots" content="noindex, follow"')) fail('404 debe ser noindex.');
  }
}

function validateSitemap() {
  if (!exists('sitemap.xml')) return fail('Falta sitemap.xml.');
  const sitemap = read('sitemap.xml');
  const routes = ['/', '/projects.html', '/courses.html', '/certifications.html', '/about.html', '/experience.html'];
  // Prefijos por idioma: el español no lleva ninguno, el inglés vive bajo /en.
  const prefixes = ['', '/en'];
  for (const route of routes) {
    for (const prefix of prefixes) {
      const loc = prefix && route === '/'
        ? `https://www.jersonmartinez.com${prefix}`
        : `https://www.jersonmartinez.com${prefix}${route}`;
      if (!sitemap.includes(`<loc>${loc}</loc>`)) fail(`Sitemap no incluye ${loc}.`);
    }
  }
  const lastReviewed = (read('src/data/portfolio.ts').match(/lastReviewed:\s*'(\d{4}-\d{2}-\d{2})'/) || [])[1];
  if (!lastReviewed) fail('No se pudo leer contentMeta.lastReviewed.');
  // El número esperado se DERIVA de rutas x idiomas. Estaba fijado a 6, que es
  // justo la clase de valor que se queda obsoleto al añadir un idioma.
  const expected = routes.length * prefixes.length;
  const dated = (sitemap.match(new RegExp(`<lastmod>${lastReviewed}</lastmod>`, 'g')) || []).length;
  if (dated !== expected) fail(`Cada URL indexable debe declarar lastmod con la fecha de revisión (${dated}/${expected}).`);
  // Alternancia de idioma declarada: sin ella, los buscadores tratan las dos
  // versiones como contenido duplicado en vez de traducciones.
  if (!sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) fail('El sitemap multilingüe debe declarar el namespace xhtml.');
  if ((sitemap.match(/hreflang="x-default"/g) || []).length !== expected) fail('Cada URL debe declarar x-default.');
  if (sitemap.includes('/404')) fail('La 404 no debe incluirse en sitemap.');
  if (!read('robots.txt').includes('Sitemap: https://www.jersonmartinez.com/sitemap.xml')) fail('robots no referencia sitemap.');
}

function main() {
  validateHeaders(); validateMetadata(); validateSitemap();
  if (notes.length) console.log(notes.map((note) => `· nota: ${note}`).join('\n'));
  if (failures.length) { console.error(`Validación de cabeceras/metadata/sitemap: ${failures.length} fallos.`); console.error(failures.map((failure) => `- ${failure}`).join('\n')); process.exitCode = 1; }
  else console.log('Validación de cabeceras, metadata social, schema.org y sitemap: correcta.');
}
main();
module.exports = { validateHeaders, validateMetadata, validateSitemap };
