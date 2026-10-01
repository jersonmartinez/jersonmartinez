const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const read = (file) => fs.readFileSync(file, 'utf8');
const BUILD_PAGES = [
  { route: '/', file: 'index.html' }, { route: '/projects.html', file: 'projects.html/index.html' },
  { route: '/experience.html', file: 'experience.html/index.html' }, { route: '/certifications.html', file: 'certifications.html/index.html' },
  { route: '/courses.html', file: 'courses.html/index.html' }, { route: '/about.html', file: 'about.html/index.html' },
  { route: '/404.html', file: '404.html' },
];
function loadBuiltPages() {
  if (process.env.VALIDATE_BUILD !== '1' || !fs.existsSync(path.join(distDir, 'index.html'))) return null;
  const pages = [];
  for (const entry of BUILD_PAGES) {
    const full = path.join(distDir, entry.file);
    if (!fs.existsSync(full)) return { missing: entry.file };
    pages.push({ ...entry, html: read(full) });
  }
  return pages;
}
const built = loadBuiltPages();
const skip = built === null ? 'Ejecuta tras npm run build con VALIDATE_BUILD=1.' : false;
const matches = (html, regex) => [...html.matchAll(regex)];

test('cada página compilada tiene un h1 y jerarquía continua', { skip }, () => {
  if (built?.missing) assert.fail(`Falta dist/${built.missing}`);
  for (const { route, html } of built) {
    assert.equal(matches(html, /<h1[\s>]/gi).length, 1, `${route}: h1`);
    const levels = matches(html, /<(h[1-6])[\s>]/gi).map((m) => Number(m[1][1]));
    for (let i = 1; i < levels.length; i += 1) assert.ok(levels[i] <= levels[i - 1] + 1, `${route}: h${levels[i - 1]} a h${levels[i]}`);
  }
});

test('todas las imágenes tienen alt y dimensiones', { skip }, () => {
  if (built?.missing) assert.fail(`Falta dist/${built.missing}`);
  for (const { route, html } of built) {
    const images = matches(html, /<img\b[^>]*>/gi).map((m) => m[0]);
    assert.deepEqual(images.filter((img) => !/\salt=/.test(img)), [], `${route}: img sin alt`);
    assert.deepEqual(images.filter((img) => !/\swidth=/.test(img) || !/\sheight=/.test(img)), [], `${route}: img sin dimensiones`);
  }
});

test('anclas internas del inicio existen', { skip }, () => {
  if (built?.missing) assert.fail(`Falta dist/${built.missing}`);
  const home = built.find((page) => page.route === '/').html;
  const ids = new Set(matches(home, /\bid="([^"]+)"/g).map((m) => m[1]));
  for (const anchor of ['recorridos', 'impacto', 'skills', 'proyectos', 'ensenanza', 'certificaciones', 'contacto']) assert.ok(ids.has(anchor), `Falta #${anchor}`);
  const broken = matches(home, /href="#([^"]+)"/g).map((m) => m[1]).filter((anchor) => !ids.has(anchor));
  assert.deepEqual(broken, []);
});

test('cada página tiene canonical, OG, Twitter y JSON-LD válido', { skip }, () => {
  if (built?.missing) assert.fail(`Falta dist/${built.missing}`);
  for (const { route, html } of built) {
    for (const marker of ['rel="canonical"', 'property="og:image"', 'name="twitter:card"']) assert.ok(html.includes(marker), `${route}: falta ${marker}`);
    for (const [, json] of matches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.doesNotThrow(() => JSON.parse(json), `${route}: JSON-LD inválido`);
  }
});

test('no hay estilos ni scripts ejecutables inline', { skip }, () => {
  if (built?.missing) assert.fail(`Falta dist/${built.missing}`);
  for (const { route, html } of built) {
    assert.doesNotMatch(html, /\sstyle="/i, `${route}: style inline`);
    const executableInline = matches(html, /<script(?![^>]*application\/ld\+json)(?![^>]*\ssrc=)[^>]*>/gi);
    assert.equal(executableInline.length, 0, `${route}: script ejecutable inline`);
  }
});

test('header compilado marca una sola página actual', { skip }, () => {
  if (built?.missing) assert.fail(`Falta dist/${built.missing}`);
  for (const { route, html } of built.filter((page) => page.route !== '/404.html')) {
    const expected = route === '/' ? 1 : 3;
    assert.equal(matches(html, /aria-current="page"/g).length, expected, `${route}: estados de página actual`);
  }
});
