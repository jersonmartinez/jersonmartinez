const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const pages = ['index.astro', 'projects.html.astro', 'experience.html.astro', 'certifications.html.astro', 'courses.html.astro', 'about.html.astro', '404.astro'];

test('Astro expone siete rutas con layout compartido', () => {
  for (const page of pages) assert.match(read(`src/pages/${page}`), /BaseLayout/);
});

test('identidad, tipografías e iconos se sirven localmente', () => {
  assert.match(read('src/components/SiteHeader.astro'), /brand\/logo\.svg/);
  assert.match(read('src/styles/global.css'), /fonts\.css/);
  assert.match(read('src/styles/global.css'), /icons\.css/);
  assert.doesNotMatch(read('src/styles/global.css'), /fonts\.googleapis|fontawesome\/css\/all/);
  for (const file of ['public/fonts/manrope-latin.woff2', 'public/fonts/dm-mono-400-latin.woff2', 'public/fonts/fa-solid-900.woff2', 'public/fonts/fa-brands-400.woff2']) assert.ok(exists(file), `Falta ${file}`);
  assert.ok(!exists('src/libs'), 'Las librerías legacy no deben volver al árbol activo');
});

test('antigüedad y cronología tienen una sola fuente', () => {
  const data = read('src/data/portfolio.js');
  const about = read('src/pages/about.html.astro');
  assert.match(data, /careerStartYear: 2016/);
  assert.match(data, /yearsExperience: 10/);
  assert.match(data, /continuousLearningSince: '2017-12'/);
  assert.match(data, /Proyectos tecnológicos independientes/);
  assert.doesNotMatch(about, /\+8|8\+ años/);
});

test('header tiene un único estado de página y el menú gestiona foco', () => {
  const header = read('src/components/SiteHeader.astro');
  const script = read('public/scripts/site.js');
  assert.match(header, /aria-current=\{current \? 'page'/);
  assert.doesNotMatch(header, /\/#impacto|\/#contacto/);
  assert.match(script, /aria-current', 'location'/);
  assert.match(script, /element\.inert = value/);
  assert.match(script, /event\.key !== 'Tab'/);
});

test('skills incluyen evidencia, navegación por teclado y WSL Container', () => {
  const data = read('src/data/portfolio.js');
  const component = read('src/components/SkillsExplorer.astro');
  const script = read('public/scripts/site.js');
  assert.match(data, /WSL Container/);
  assert.match(data, /evidence:/);
  assert.match(component, /Capacidad aplicada/);
  assert.match(component, /role="tablist"/);
  assert.match(script, /ArrowDown/);
});

test('proyectos usan categorías declaradas y casos de estudio', () => {
  const data = read('src/data/portfolio.js');
  const card = read('src/components/ProjectCard.astro');
  const page = read('src/pages/projects.html.astro');
  assert.match(data, /categories: \['personal', 'teaching'\]/);
  assert.match(data, /https:\/\/factib\.com/);
  for (const value of ['problem:', 'contribution:', 'outcome:', 'language:', 'license:']) assert.match(data, new RegExp(value));
  assert.match(card, /Problema/);
  assert.doesNotMatch(page, /function filterFor/);
});

test('métricas confirmadas incluyen fecha y OpenWebinars separado', () => {
  const data = read('src/data/portfolio.js');
  for (const value of ['Más de 77 mil estudiantes', '+14K suscriptores', '+5K suscriptores', '+60 artículos', '7 cursos impartidos', 'lastVerifiedAt']) assert.ok(data.includes(value), `Falta ${value}`);
  assert.doesNotMatch(data, /\+60 artículos y cursos/);
});

test('solo se publican diez certificaciones oficiales', () => {
  const data = read('src/data/portfolio.js');
  const page = read('src/pages/certifications.html.astro');
  const credentialLinks = (data.match(/credentialId:/g) || []).length;
  assert.equal(credentialLinks, 10);
  assert.match(page, /CredentialCard/);
  assert.match(page, /Diez credenciales/);
  assert.match(data, /GitHub Foundations/);
  const githubBlock = data.slice(data.indexOf("provider: 'GitHub'"), data.indexOf('export const youtubeChannels'));
  assert.doesNotMatch(githubBlock, /GitHub Actions|Gobernanza de repositorios/);
});

test('cursos y OpenWebinars exponen rutas verificables', () => {
  const data = read('src/data/portfolio.js');
  assert.equal((data.match(/openwebinars\.net\/cursos\//g) || []).length, 7);
  assert.equal((data.match(/www\.udemy\.com\/course\//g) || []).length, 7);
  assert.match(read('src/components/CourseCard.astro'), /Al completar esta etapa/);
  assert.doesNotMatch(read('src/pages/courses.html.astro'), /ficha pública consultada/);
});

test('CV, imágenes responsive, OG y PWA existen', () => {
  for (const file of ['public/cv/jerson-martinez-cv-es.pdf', 'public/cv/jerson-martinez-cv-en.pdf', 'public/images/profile-v2-320.avif', 'public/images/profile-v2-640.webp', 'public/images/profile-v2-960.jpg', 'public/social/home.png', 'public/social/projects.png', 'public/brand/favicon-192.png', 'public/brand/favicon-512.png', 'public/brand/apple-touch-icon.png']) assert.ok(exists(file), `Falta ${file}`);
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.icons.length, 2);
  assert.match(read('src/layouts/BaseLayout.astro'), /1200/);
});

test('CSP no usa unsafe-inline y no quedan dependencias visuales remotas', () => {
  const vercel = read('vercel.json');
  const sources = pages.map((page) => read(`src/pages/${page}`)).join('\n') + read('src/layouts/BaseLayout.astro');
  assert.doesNotMatch(vercel, /unsafe-inline/);
  assert.match(vercel, /script-src 'self'/);
  assert.doesNotMatch(sources, /style="|cdn\.simpleicons|fonts\.googleapis/);
});

test('SEO y sitemap cubren rutas reales con lastmod', () => {
  const sitemap = read('public/sitemap.xml');
  for (const route of ['/', '/projects.html', '/courses.html', '/certifications.html', '/experience.html', '/about.html']) assert.ok(sitemap.includes(`https://www.jersonmartinez.com${route}`));
  assert.match(sitemap, /<lastmod>2026-09-30<\/lastmod>/);
  assert.match(read('src/layouts/BaseLayout.astro'), /application\/ld\+json/);
  assert.match(read('src/pages/courses.html.astro'), /'@type': 'Course'/);
  assert.match(read('src/pages/certifications.html.astro'), /EducationalOccupationalCredential/);
});

test('la generación de assets y documentación técnica están versionadas', () => {
  assert.ok(exists('tools/generate-visual-assets.py'));
  assert.ok(exists('SECURITY-HEADERS.md'));
  assert.ok(exists('docs/PORTFOLIO-INTEGRITY-2026.md'));
});
