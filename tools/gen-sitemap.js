// Genera sitemap.xml desde las rutas INDEXABLES reales y una única fuente de fecha
// (contentMeta.lastReviewed en src/data/portfolio.js), en lugar de mantenerlo a mano.
// Excluye 404 y guia-visual (noindex). `--check` falla si el fichero commiteado difiere
// (guarda contra drift: una ruta nueva o una fecha vieja se detectan en CI).
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

// Rutas indexables y su prioridad. El orden define el orden del sitemap.
const ROUTES = [
  { loc: '/', priority: '1.0' },
  { loc: '/projects.html', priority: '0.8' },
  { loc: '/courses.html', priority: '0.8' },
  { loc: '/certifications.html', priority: '0.8' },
  { loc: '/about.html', priority: '0.8' },
  { loc: '/experience.html', priority: '0.8' },
];

function siteBase() {
  const data = read('src/data/portfolio.js');
  const match = data.match(/website:\s*'([^']+)'/);
  if (!match) throw new Error('No se encontró profile.website en portfolio.js');
  return match[1].replace(/\/$/, '');
}

function lastmod() {
  const data = read('src/data/portfolio.js');
  const match = data.match(/lastReviewed:\s*'(\d{4}-\d{2}-\d{2})'/);
  if (!match) throw new Error('No se encontró contentMeta.lastReviewed en portfolio.js');
  return match[1];
}

function generate() {
  const base = siteBase();
  const date = lastmod();
  const urls = ROUTES.map(({ loc, priority }) => {
    const href = loc === '/' ? `${base}/` : `${base}${loc}`;
    return `  <url><loc>${href}</loc><lastmod>${date}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
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
  console.log(`sitemap.xml generado: ${ROUTES.length} rutas, lastmod ${lastmod()}.`);
}

if (require.main === module) main();
module.exports = { generate };
