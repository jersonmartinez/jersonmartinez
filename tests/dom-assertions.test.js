const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Item 49: aserciones sobre el DOM COMPILADO (dist/), no regex sobre el código fuente.
// Estas pruebas verifican el resultado renderizado real que antes se inferia leyendo src/*.
// Se ejecutan sólo tras `npm run build` con VALIDATE_BUILD=1 (igual que compiled-html.test.js).

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const read = (file) => fs.readFileSync(file, 'utf8');
const ready = process.env.VALIDATE_BUILD === '1' && fs.existsSync(path.join(distDir, 'index.html'));
const skip = ready ? false : 'Ejecuta tras npm run build con VALIDATE_BUILD=1.';
const load = (route) => read(path.join(distDir, route));
const count = (html, re) => (html.match(re) || []).length;

test('el inicio renderiza la navegación con iconos y una sola página actual', { skip }, () => {
  const home = load('index.html');
  // Iconos renderizados como elementos reales (no sólo clases en el fuente).
  assert.ok(count(home, /<i class="fa[sb] fa-/g) >= 6, 'faltan iconos de navegación renderizados');
  assert.equal(count(home, /aria-current="page"/g), 1, 'el inicio debe marcar exactamente una página actual');
});

test('la rejilla de habilidades compila como tablist accesible', { skip }, () => {
  const home = load('index.html');
  assert.ok(count(home, /role="tab"/g) > 1, 'debe haber varias tabs');
  assert.ok(count(home, /role="tabpanel"/g) > 1, 'debe haber varios paneles');
  assert.match(home, /data-skill-slug="/, 'las tabs deben exponer su slug para el estado en URL');
});

test('las certificaciones compiladas exponen credenciales verificables', { skip }, () => {
  const certs = load('certifications.html/index.html');
  assert.ok(count(certs, /credential-badge/g) >= 10, 'deben renderizarse al menos 10 credenciales');
  assert.ok(count(certs, /credential-verify/g) >= 1, 'debe haber enlaces de verificación');
});

test('la sección de evidencia técnica compila con código real y diagrama accesible', { skip }, () => {
  const home = load('index.html');
  assert.match(home, /id="evidencia-tecnica"/, 'falta la sección de evidencia');
  assert.match(home, /codeblock-pre/, 'falta el bloque de código');
  assert.match(home, /validate\.yml/, 'el bloque de código debe mostrar un workflow real del repo');
  assert.match(home, /<svg[^>]*role="img"[^>]*>[\s\S]*<title/, 'el diagrama SVG debe ser accesible con title');
});

test('cada ruta compilada enlaza los scripts externos (CSP, sin inline)', { skip }, () => {
  for (const route of ['index.html', 'projects.html/index.html', 'about.html/index.html']) {
    const html = load(route);
    assert.match(html, /src="\/scripts\/site\.js"/, `${route}: falta site.js`);
    assert.match(html, /src="\/scripts\/command-palette\.js"/, `${route}: falta command-palette.js`);
    assert.doesNotMatch(html, /<script(?![^>]*application\/ld\+json)(?![^>]*\ssrc=)[^>]*>[^<]/, `${route}: script inline ejecutable`);
  }
});

test('el tema y la paleta exponen controles accesibles en el DOM', { skip }, () => {
  const home = load('index.html');
  assert.match(home, /data-theme-toggle[^>]*aria-pressed/, 'el conmutador de tema debe exponer aria-pressed');
  assert.match(home, /data-command-palette[^>]*role="dialog"[^>]*aria-modal/, 'la paleta debe ser un diálogo modal');
});
