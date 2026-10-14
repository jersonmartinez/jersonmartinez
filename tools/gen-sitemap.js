// Genera sitemap.xml desde las rutas INDEXABLES reales y una única fuente de fecha
// (contentMeta.lastReviewed en src/data/portfolio.ts), en lugar de mantenerlo a mano.
// Excluye 404 y guia-visual (noindex). `--check` falla si el fichero commiteado difiere
// (guarda contra drift: una ruta nueva o una fecha vieja se detectan en CI).
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

// Rutas indexables y su prioridad. El orden define el orden del sitemap.
// Las rutas son las MISMAS en los dos idiomas: el inglés sólo añade el prefijo
// `/en`, así que no hay una tabla de equivalencias que mantener.
const ROUTES = [
  { loc: '/', priority: '1.0' },
  { loc: '/projects.html', priority: '0.8' },
  { loc: '/courses.html', priority: '0.8' },
  { loc: '/certifications.html', priority: '0.8' },
  { loc: '/about.html', priority: '0.8' },
  { loc: '/experience.html', priority: '0.8' },
];

// Idioma por defecto (sin prefijo) y prefijos por idioma. Debe coincidir con
// src/i18n/config.ts; el gate `sitemap:check` falla si el sitemap commiteado
// se desvía de lo que genera este fichero.
const DEFAULT_LOCALE = 'es';
const LOCALE_PREFIX = { es: '', en: '/en' };
const LOCALES = Object.keys(LOCALE_PREFIX);

/** URL absoluta de una ruta en un idioma. */
function urlFor(base, loc, locale) {
  const prefix = LOCALE_PREFIX[locale];
  if (loc === '/') return prefix ? `${base}${prefix}` : `${base}/`;
  return `${base}${prefix}${loc}`;
}

function siteBase() {
  const data = read('src/data/portfolio.ts');
  const match = data.match(/website:\s*'([^']+)'/);
  if (!match) throw new Error('No se encontró profile.website en portfolio.js');
  return match[1].replace(/\/$/, '');
}

function lastmod() {
  const data = read('src/data/portfolio.ts');
  const match = data.match(/lastReviewed:\s*'(\d{4}-\d{2}-\d{2})'/);
  if (!match) throw new Error('No se encontró contentMeta.lastReviewed en portfolio.js');
  return match[1];
}

function generate() {
  const base = siteBase();
  const date = lastmod();
  // Una entrada por (ruta, idioma). Cada una declara TODAS sus alternativas,
  // incluida la propia, que es lo que exige la especificación de sitemap
  // multilingüe: un buscador que llegue a la versión inglesa descubre así la
  // española y viceversa. `x-default` apunta al idioma sin prefijo.
  const urls = ROUTES.flatMap(({ loc, priority }) => {
    const alternates = [
      ...LOCALES.map((locale) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${urlFor(base, loc, locale)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(base, loc, DEFAULT_LOCALE)}"/>`,
    ].join('\n');
    // Misma prioridad en los dos idiomas: es el mismo contenido para audiencias
    // distintas, y la preferencia de idioma la resuelve hreflang, no la prioridad.
    return LOCALES.map((locale) =>
      `  <url>\n    <loc>${urlFor(base, loc, locale)}</loc>\n${alternates}\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function main() {
  const xml = generate();
  const targets = ['sitemap.xml', 'public/sitemap.xml'];
  if (process.argv.includes('--check')) {
    const drift = targets.filter((t) => read(t) !== xml);
    if (drift.length) {
      console.error(`sitemap desactualizado en: ${drift.join(', ')}. Ejecuta "npm run sitemap".`);
      process.exitCode = 1;
      return;
    }
    console.log('sitemap.xml está sincronizado con las rutas y la fecha de revisión.');
    return;
  }
  for (const t of targets) fs.writeFileSync(path.join(ROOT, t), xml);
  console.log(`sitemap.xml generado: ${ROUTES.length} rutas x ${LOCALES.length} idiomas = ${ROUTES.length * LOCALES.length} URLs, lastmod ${lastmod()}.`);
}

if (require.main === module) main();
module.exports = { generate };
