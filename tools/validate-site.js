const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PAGES = ['src/pages/index.astro', 'src/pages/projects.html.astro', 'src/pages/experience.html.astro', 'src/pages/certifications.html.astro', 'src/pages/courses.html.astro', 'src/pages/about.html.astro'];
const PUBLIC_FILES = ['public/brand/logo.svg', 'public/brand/favicon.svg', 'public/images/profile.jpg'];
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));
function fail(message) { throw new Error(message); }

function validateSources() {
  for (const page of SOURCE_PAGES) {
    if (!exists(page)) fail(`Falta la página Astro ${page}.`);
    const source = read(page);
    if (!source.includes('<BaseLayout')) fail(`${page}: no usa el layout compartido.`);
    if (!source.includes('data-section') && page.includes('index')) fail(`${page}: falta la navegación por recorrido.`);
    if (!source.includes('Jerson Martínez') && page.includes('index')) fail(`${page}: falta el nombre de marca.`);
  }
  for (const file of ['public/brand/logo.svg', 'public/brand/favicon.svg', 'public/images/profile.jpg', 'public/brands/aws.svg', 'public/brands/azure.svg', 'public/brands/github.svg', 'public/brands/openwebinars.svg']) if (!exists(file)) fail(`Falta el asset ${file}.`);
  const data = read('src/data/portfolio.js');
  for (const value of ['Factib', 'Crashell', 'mcp-github-projects', 'mcp-monday-projects', 'kiro-crew', 'InfraQuiz', 'DevOpsea', 'Side Master', 'Más de 77 mil', '+14K', '+5K', '+60 artículos y cursos', '+10', 'Cloud Providers', '60+', 'Google Cloud Platform (GCP)', 'courses']) {
    if (!data.includes(value)) fail(`Falta contenido verificable: ${value}.`);
  }
  const homePage = read('src/pages/index.astro');
  if (!homePage.includes('SkillsExplorer') || !homePage.includes('fa-whatsapp') || !homePage.includes('profile-social')) fail('La portada perdió la navegación de skills o los iconos principales.');
  const projectsPage = read('src/pages/projects.html.astro');
  if (!projectsPage.includes('no aparece como repositorio público')) fail('Factib debe conservar su contexto de disponibilidad pública.');
}

function validateDist() {
  if (process.env.VALIDATE_BUILD !== '1' || !exists('dist/index.html')) return;
  for (const route of ['index.html', 'projects.html/index.html', 'experience.html/index.html', 'certifications.html/index.html', 'courses.html/index.html', 'about.html/index.html']) {
    if (!exists(`dist/${route}`)) fail(`Build incompleto: falta dist/${route}.`);
  }
  for (const asset of ['dist/brand/logo.svg', 'dist/brand/favicon.svg', 'dist/images/profile.jpg', 'dist/brands/aws.svg', 'dist/brands/azure.svg', 'dist/brands/github.svg', 'dist/brands/openwebinars.svg']) if (!exists(asset)) fail(`Build incompleto: falta ${asset}.`);
  const home = read('dist/index.html');
  if (!home.includes('Jerson Martínez') || home.includes('Jerson / DevOps')) fail('El build conserva el branding antiguo.');
  if (!home.includes('/brand/favicon.svg')) fail('El build no incluye el favicon.');

  // Validadores estructurales del HTML compilado (items 45, 83, 84).
  const builtRoutes = ['index.html', 'projects.html/index.html', 'experience.html/index.html', 'certifications.html/index.html', 'courses.html/index.html', 'about.html/index.html'];
  for (const route of builtRoutes) {
    const html = read(`dist/${route}`);
    // Item 45: exactamente un <h1> y jerarquía de headings sin saltos.
    const h1s = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1s !== 1) fail(`dist/${route}: se esperaba 1 <h1>, hay ${h1s}.`);
    const seq = [...html.matchAll(/<(h[1-6])[\s>]/gi)].map((m) => Number(m[1][1]));
    let prev = 0;
    for (const level of seq) { if (prev !== 0 && level > prev + 1) fail(`dist/${route}: salto de jerarquía h${prev} → h${level}.`); prev = level; }
    // Item 84: toda <img> con atributo alt.
    const imgsNoAlt = (html.match(/<img\b[^>]*>/gi) || []).filter((img) => !/\salt\s*=/.test(img));
    if (imgsNoAlt.length) fail(`dist/${route}: ${imgsNoAlt.length} <img> sin atributo alt.`);
  }
  // Item 83: anclas internas del home existen como id.
  const homeIds = new Set([...home.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const anchor of ['impacto', 'skills', 'proyectos', 'enseñanza', 'certificaciones', 'contacto']) {
    if (!homeIds.has(anchor)) fail(`El home no expone el id de ancla #${anchor}.`);
  }
}

function validateStaticFiles() {
  for (const file of ['README.md', 'CNAME', 'robots.txt', 'sitemap.xml', 'config/youtube-channels.json', 'data/youtube-state.json']) if (!exists(file)) fail(`Falta el archivo requerido ${file}.`);
  const sitemap = read('sitemap.xml');
  if (!sitemap.includes('https://www.jersonmartinez.com/')) fail('sitemap.xml no coincide con el dominio canónico.');
  if (!read('robots.txt').includes('Sitemap: https://www.jersonmartinez.com/sitemap.xml')) fail('robots.txt no referencia el sitemap canónico.');
}

function main() {
  validateSources();
  validateStaticFiles();
  validateDist();
  console.log(`Validación correcta: ${SOURCE_PAGES.length} rutas Astro, marca, datos y assets.`);
}

try { main(); } catch (error) { console.error(`Validación fallida: ${error.message}`); process.exitCode = 1; }
module.exports = { validateSources, validateDist, validateStaticFiles };
