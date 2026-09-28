const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'projects.html', 'experience.html', 'certifications.html'];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('todas las páginas exponen metadata y datos estructurados del portfolio', () => {
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /rel="canonical"/);
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /portfolio\.css\?v=2/);
  }
});

test('la portada mantiene CTA, procedencia de métricas y especialidades', () => {
  const html = read('index.html');
  assert.match(html, /class="hero-proof"/);
  assert.match(html, /class="stat-band"/);
  assert.match(html, /Cifras tomadas del CV facilitado/);
  assert.match(html, /Hablemos de arquitectura/);
});

test('proyectos distingue estados y ejemplos conceptuales', () => {
  const html = read('projects.html');
  assert.match(html, /03 \/ AUTOMATION/);
  assert.match(html, /Proyecto académico documentado/);
  assert.match(html, /Proyecto descrito en el CV/);
  assert.match(html, /no representa telemetría en tiempo real/);
  assert.match(html, /role="tablist"/);
});

test('experiencia y credenciales exponen datos agrupados y contextualizados', () => {
  const experience = read('experience.html');
  const certifications = read('certifications.html');
  assert.match(experience, /class="timeline-summary"/);
  assert.match(experience, /class="timeline-tags"/);
  assert.match(experience, /resultados reportados/);
  assert.match(certifications, /100\+ cursos y certificaciones/);
  assert.match(certifications, /no sustituye la verificación/);
  assert.match(certifications, /class="credential-meta"/);
});

test('la interacción compartida soporta menú, tabs y movimiento reducido', () => {
  const javascript = read('src/libs/custom/js/portfolio.js');
  const css = read('src/libs/custom/css/portfolio.css');
  assert.match(javascript, /aria-expanded/);
  assert.match(javascript, /event\.key === 'Home'/);
  assert.match(javascript, /event\.key === 'End'/);
  assert.match(javascript, /aria-orientation/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 560px\)/);
});
