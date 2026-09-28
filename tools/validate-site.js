const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'projects.html', 'experience.html', 'certifications.html'];
const STATIC_FILES = ['README.md', 'CNAME', 'robots.txt', 'sitemap.xml', 'config/youtube-channels.json', 'data/youtube-state.json'];
const URL_PATTERN = /(?:href|src)=["']([^"']+)["']/gi;

function fail(message) { throw new Error(message); }
function read(relativePath) { return fs.readFileSync(path.join(ROOT, relativePath), 'utf8'); }
function exists(relativePath) { return fs.existsSync(path.join(ROOT, relativePath)); }
function count(text, value) { return text.split(value).length - 1; }

function validatePages() {
  for (const page of PAGES) {
    if (!exists(page)) fail(`Falta la página ${page}.`);
    const html = read(page);
    if (!/<html[^>]+lang=["'][a-z]{2}/i.test(html)) fail(`${page}: falta lang.`);
    if (!/<meta[^>]+name=["']description["']/i.test(html)) fail(`${page}: falta meta description.`);
    if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${page}: falta title.`);
    for (const match of html.matchAll(URL_PATTERN)) {
      const target = match[1].split('#')[0].split('?')[0];
      if (!target || /^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(target)) continue;
      const targetPath = path.normalize(path.join(path.dirname(page), target));
      if (!exists(targetPath)) fail(`${page}: recurso local inexistente ${target}.`);
    }
  }
}

function validateReadme() {
  const readme = read('README.md');
  for (const marker of ['DEVOPSEA', 'SIDEMASTER']) {
    const start = `<!-- ${marker}-YOUTUBE-VIDEOS-LIST-BEGIN -->`;
    const end = `<!-- ${marker}-YOUTUBE-VIDEOS-LIST-END -->`;
    if (count(readme, start) !== 1 || count(readme, end) !== 1) fail(`README.md: marcadores ${marker} incompletos o duplicados.`);
  }
  if (!/^# Jerson Martínez/m.test(readme)) fail('README.md: falta el encabezado principal.');
  if (count(readme, '## Contact') !== 1 || count(readme, '## YouTube') !== 1) fail('README.md: secciones principales duplicadas o ausentes.');
}

function validateConfig() {
  const config = JSON.parse(read('config/youtube-channels.json'));
  if (!Array.isArray(config.channels) || config.channels.length !== 2) fail('La configuración debe contener los dos canales esperados.');
  for (const channel of config.channels) {
    if (!/^UC[A-Za-z0-9_-]{20,30}$/.test(channel.channelId)) fail(`${channel.name}: channelId inválido.`);
    if (!/^@[A-Za-z0-9._-]{2,100}$/.test(channel.handle)) fail(`${channel.name}: handle inválido.`);
  }
  const state = JSON.parse(read('data/youtube-state.json'));
  for (const channel of config.channels) {
    if (!state.channels[channel.name] || !Array.isArray(state.channels[channel.name].entries)) fail(`${channel.name}: falta caché de último estado válido.`);
  }
}

function validateStaticFiles() {
  for (const file of STATIC_FILES) if (!exists(file)) fail(`Falta el archivo requerido ${file}.`);
  const cname = read('CNAME').trim();
  if (!/^[a-z0-9.-]+$/i.test(cname)) fail('CNAME no contiene un dominio válido.');
  const sitemap = read('sitemap.xml');
  if (!sitemap.includes(`https://${cname}/`)) fail('sitemap.xml no coincide con CNAME.');
  const robots = read('robots.txt');
  if (!robots.includes('Sitemap:')) fail('robots.txt no referencia el sitemap.');
}

function main() {
  validateStaticFiles();
  validateConfig();
  validateReadme();
  validatePages();
  console.log(`Validación correcta: ${PAGES.length} páginas, README, configuración y recursos locales.`);
}

try { main(); } catch (error) { console.error(`Validación fallida: ${error.message}`); process.exitCode = 1; }

module.exports = { validateConfig, validatePages, validateReadme, validateStaticFiles };
