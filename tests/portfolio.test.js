const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('Astro expone las cinco rutas y el layout compartido', () => {
  for (const page of ['src/pages/index.astro', 'src/pages/projects.html.astro', 'src/pages/experience.html.astro', 'src/pages/certifications.html.astro', 'src/pages/courses.html.astro']) {
    const source = read(page);
    assert.match(source, /BaseLayout/);
    assert.match(source, /Jerson Martínez|profile|projects|experience|certifications|courses/);
  }
});

test('la identidad visual tiene wordmark, favicon y librería de iconos local', () => {
  assert.match(read('src/components/SiteHeader.astro'), /brand\/logo\.svg/);
  assert.match(read('src/components/SiteHeader.astro'), /fa-paper-plane/);
  assert.match(read('src/layouts/BaseLayout.astro'), /brand\/favicon\.svg/);
  assert.match(read('src/styles/global.css'), /fontawesome\/css\/all\.css/);
  assert.match(read('public/brand/logo.svg'), /Jerson/);
  assert.match(read('public/brand/logo.svg'), /circle/);
  assert.match(read('public/brand/favicon.svg'), /viewBox="0 0 64 64"/);
});

test('el contenido destaca productos, repositorios, IA y gobernanza', () => {
  const data = read('src/data/portfolio.js');
  for (const value of ['Factib', 'Crashell', 'IA + DevOps', 'Governance', 'MCP GitHub Projects', 'MCP Monday Projects', 'Kiro Crew']) assert.match(data, new RegExp(value.replace(/[+]/g, '\\+')));
});

test('la navegación sigue un recorrido ordenado y tiene interacción', () => {
  const home = read('src/pages/index.astro');
  const header = read('src/components/SiteHeader.astro');
  assert.match(home, /01.*Impacto/);
  assert.match(home, /02.*Skills/);
  assert.match(home, /03.*Proyectos/);
  assert.match(home, /06.*Contacto/);
  assert.doesNotMatch(header, /String\(index \+ 1\)/);
  assert.match(header, /fa-home/);
  assert.match(header, /aria-expanded/);
  assert.match(home, /IntersectionObserver/);
});

test('las estadísticas y skills corresponden al CV actualizado', () => {
  const data = read('src/data/portfolio.js');
  const home = read('src/pages/index.astro');
  for (const value of ['+10', 'Cloud Providers', '100+', '60+', 'Google Cloud Platform (GCP)', 'IA generativa']) assert.match(data, new RegExp(value.replace(/[+()]/g, '\\$&')));
  assert.match(home, /SkillsExplorer/);
  assert.match(read('src/components/SkillsExplorer.astro'), /role="tablist"/);
  assert.match(read('src/components/SkillsExplorer.astro'), /ArrowDown/);
});

test('cursos, canales y credenciales exponen métricas y enlaces verificables', () => {
  const data = read('src/data/portfolio.js');
  const courses = read('src/pages/courses.html.astro');
  const certifications = read('src/pages/certifications.html.astro');
  assert.match(data, /Más de 77 mil/);
  assert.match(data, /Más de 15K/);
  assert.match(courses, /Mis cursos \(7\)/);
  assert.match(courses, /Más de 77 mil/);
  assert.match(data, /Más de 15K suscriptores/);
  assert.match(certifications, /credential-link/);
  assert.match(data, /cp\.certmetrics\.com/);
  assert.match(data, /learn\.microsoft\.com\/api\/credentials/);
  assert.match(data, /credly\.com\/badges/);
  assert.match(data, /brands\/openwebinars\.svg/);
});

// Item 43: los VALORES PROTEGIDOS confirmados por el usuario deben existir
// textualmente en portfolio.js. Previene regresiones de contenido: si alguien
// edita una de estas cifras por error, este test falla.
test('los valores protegidos existen textualmente en portfolio.js', () => {
  const data = read('src/data/portfolio.js');
  const protectedValues = [
    'Más de 77 mil estudiantes', // Udemy
    'Más de 15K',                // DevOpsea (deriva 'Más de 15K suscriptores')
    '≈ 4.1K'                     // Side Master
  ];
  for (const value of protectedValues) {
    assert.ok(data.includes(value), `Valor protegido ausente o alterado: "${value}"`);
  }
});

// Items 126-128: los artefactos de SEO/PWA y datos estructurados existen y son coherentes.
test('SEO/PWA: robots, sitemap, manifest, humans y JSON-LD existen', () => {
  assert.match(read('public/robots.txt'), /Sitemap:\s*https:\/\/www\.jersonmartinez\.com\/sitemap\.xml/);
  const sitemap = read('public/sitemap.xml');
  for (const route of ['/', '/projects.html', '/courses.html', '/certifications.html', '/experience.html']) {
    assert.ok(sitemap.includes(`https://www.jersonmartinez.com${route}`), `Ruta ausente en sitemap: ${route}`);
  }
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.theme_color, '#07111f');
  assert.match(read('public/humans.txt'), /github\.com\/jersonmartinez/);
  const layout = read('src/layouts/BaseLayout.astro');
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /schema\.org/);
  assert.match(layout, /rel="manifest"/);
});
