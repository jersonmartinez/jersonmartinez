const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Tests de HTML COMPILADO (items 45, 83 y 84). Verifican el build estático real
// en dist/, no las fuentes .astro, porque los problemas de jerarquía de headings,
// anclas rotas y <img> sin alt sólo se materializan en el HTML renderizado.
//
// El build (dist/) está en .gitignore y no siempre existe/está fresco en local.
// Igual que tools/validate-site.js, estos tests sólo se ejecutan cuando
// VALIDATE_BUILD=1 y dist/ está presente; en CI el workflow corre
// `npm run build` y exporta VALIDATE_BUILD=1 antes de los tests. En local:
// `npm run build && VALIDATE_BUILD=1 npm test`.

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const read = (file) => fs.readFileSync(file, 'utf8');

const BUILD_PAGES = [
  { route: '/', file: 'index.html' },
  { route: '/projects.html', file: 'projects.html/index.html' },
  { route: '/experience.html', file: 'experience.html/index.html' },
  { route: '/certifications.html', file: 'certifications.html/index.html' },
  { route: '/courses.html', file: 'courses.html/index.html' }
];

// Sólo consideramos las páginas de primer nivel; ignora restos anidados
// (p. ej. dist/dist/** de builds antiguos) que no forman parte de la salida.
function loadBuiltPages() {
  if (process.env.VALIDATE_BUILD !== '1') return null;
  if (!fs.existsSync(path.join(distDir, 'index.html'))) return null;
  const pages = [];
  for (const { route, file } of BUILD_PAGES) {
    const full = path.join(distDir, file);
    if (!fs.existsSync(full)) return { missing: file };
    pages.push({ route, file, html: read(full) });
  }
  return pages;
}

const built = loadBuiltPages();
const skip = (built === null) ? 'Compiled-HTML: exporta VALIDATE_BUILD=1 tras `npm run build` para validar dist/.' : false;

// --- Utilidades de parseo ligero (sin dependencias) --------------------------
const matchAll = (html, re) => [...html.matchAll(re)].map((m) => m);
const countTag = (html, tag) => matchAll(html, new RegExp(`<${tag}[\\s>]`, 'gi')).length;
const headingSequence = (html) =>
  matchAll(html, /<(h[1-6])[\s>]/gi).map((m) => Number(m[1][1]));

test('cada página del build tiene exactamente un <h1>', { skip }, () => {
  if (built && built.missing) assert.fail(`Build incompleto: falta dist/${built.missing}`);
  for (const { route, html } of built) {
    const h1s = countTag(html, 'h1');
    assert.equal(h1s, 1, `${route}: se esperaba 1 <h1>, hay ${h1s}`);
  }
});

// Item 45: la jerarquía de headings no debe saltar niveles hacia abajo
// (no pasar de h2 a h4 sin h3). Detecta cert-card/repo-card/course-card/
// timeline-card mal anidados donde el contenido debería ser <h3>.
test('la jerarquía de headings no salta niveles (item 45)', { skip }, () => {
  if (built && built.missing) assert.fail(`Build incompleto: falta dist/${built.missing}`);
  for (const { route, html } of built) {
    const seq = headingSequence(html);
    let prev = 0;
    for (const level of seq) {
      if (prev !== 0 && level > prev + 1) {
        assert.fail(`${route}: salto de jerarquía h${prev} → h${level} (falta un nivel intermedio)`);
      }
      prev = level;
    }
  }
});

// Item 84: toda <img> del build debe tener atributo alt (no vacío por defecto
// salvo que sea decorativa con alt=""). Aquí exigimos que el atributo exista.
test('todas las <img> del build tienen atributo alt (item 84)', { skip }, () => {
  if (built && built.missing) assert.fail(`Build incompleto: falta dist/${built.missing}`);
  for (const { route, html } of built) {
    const imgs = matchAll(html, /<img\b[^>]*>/gi).map((m) => m[0]);
    const missing = imgs.filter((img) => !/\salt\s*=/.test(img));
    assert.deepEqual(missing, [], `${route}: ${missing.length} <img> sin atributo alt: ${missing.join(' | ')}`);
  }
});

// Item 83: todas las anclas internas del home (#impacto, #skills, #proyectos,
// #enseñanza, #credenciales, #contacto) deben existir como id en el home
// compilado, evitando enlaces rotos del rail y del header.
test('las anclas internas del home existen como id (item 83)', { skip }, () => {
  if (built && built.missing) assert.fail(`Build incompleto: falta dist/${built.missing}`);
  const home = built.find((p) => p.route === '/').html;
  const expectedAnchors = ['impacto', 'skills', 'proyectos', 'enseñanza', 'credenciales', 'contacto'];
  const ids = new Set(matchAll(home, /\bid="([^"]+)"/g).map((m) => m[1]));
  const missing = expectedAnchors.filter((a) => !ids.has(a));
  assert.deepEqual(missing, [], `Anclas del home sin id correspondiente: ${missing.map((a) => '#' + a).join(', ')}`);

  // Además, ningún enlace de ancla del home debe apuntar a un id inexistente.
  const anchorLinks = matchAll(home, /href="#([^"]+)"/g).map((m) => m[1]);
  const brokenLinks = [...new Set(anchorLinks)].filter((a) => !ids.has(a));
  assert.deepEqual(brokenLinks, [], `Enlaces de ancla rotos en el home: ${brokenLinks.map((a) => '#' + a).join(', ')}`);
});
