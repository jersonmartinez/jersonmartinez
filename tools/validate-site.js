const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const SOURCE_PAGES = ['src/pages/index.astro', 'src/pages/projects.html.astro', 'src/pages/experience.html.astro', 'src/pages/certifications.html.astro', 'src/pages/courses.html.astro', 'src/pages/about.html.astro', 'src/pages/404.astro'];
const BUILD_ROUTES = ['index.html', 'projects.html/index.html', 'experience.html/index.html', 'certifications.html/index.html', 'courses.html/index.html', 'about.html/index.html', '404.html'];
const ASSETS = ['public/brand/logo.svg', 'public/brand/favicon.svg', 'public/brand/favicon-192.png', 'public/brand/favicon-512.png', 'public/images/profile-v2-320.avif', 'public/images/profile-v2-640.webp', 'public/images/profile-v2-960.jpg', 'public/brands/aws.svg', 'public/brands/azure.svg', 'public/brands/github.svg', 'public/brands/openwebinars.svg', 'public/brands/googlecloud.svg', 'public/brands/docker.svg', 'public/brands/python.svg', 'public/brands/go.svg', 'public/cv/jerson-martinez-cv-es.pdf', 'public/cv/jerson-martinez-cv-en.pdf'];
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));
function fail(message) { throw new Error(message); }

function validateSources() {
  for (const page of SOURCE_PAGES) {
    if (!exists(page)) fail(`Falta ${page}`);
    if (!read(page).includes('<BaseLayout')) fail(`${page}: no usa BaseLayout`);
  }
  for (const file of ASSETS) if (!exists(file)) fail(`Falta asset ${file}`);
  const data = read('src/data/portfolio.js');
  for (const value of ['careerStartYear: 2016', 'yearsExperience: 10', 'Más de 77 mil estudiantes', '+14K suscriptores', '+5K suscriptores', '+60 artículos', '7 cursos impartidos', 'WSL Container', 'GitHub Foundations', 'Infralytics']) if (!data.includes(value)) fail(`Falta dato: ${value}`);
  if ((data.match(/credentialId:/g) || []).length !== 10) fail('Se esperaban exactamente 10 credenciales oficiales.');
  if (data.includes('+60 artículos y cursos')) fail('OpenWebinars debe separar artículos y cursos.');
  if (exists('src/libs')) fail('El árbol legacy src/libs no debe existir.');
  const active = SOURCE_PAGES.map(read).join('\n') + read('src/layouts/BaseLayout.astro') + read('src/styles/global.css');
  if (/cdn\.simpleicons|fonts\.googleapis|\sstyle="/.test(active)) fail('Quedan dependencias visuales remotas o estilos inline.');
}

function validateDist() {
  if (process.env.VALIDATE_BUILD !== '1' || !exists('dist/index.html')) return;
  for (const route of BUILD_ROUTES) if (!exists(`dist/${route}`)) fail(`Build incompleto: dist/${route}`);
  for (const asset of ASSETS.map((file) => `dist/${file.replace(/^public\//, '')}`)) if (!exists(asset)) fail(`Build incompleto: ${asset}`);
  for (const route of BUILD_ROUTES) {
    const html = read(`dist/${route}`);
    if ((html.match(/<h1[\s>]/gi) || []).length !== 1) fail(`dist/${route}: debe tener un h1`);
    if (/\sstyle="/.test(html)) fail(`dist/${route}: contiene style inline`);
    if (!html.includes('property="og:image"')) fail(`dist/${route}: metadata social incompleta`);
    if (route !== '404.html' && !html.includes('application/ld+json')) fail(`dist/${route}: schema.org ausente`);
  }
  const home = read('dist/index.html');
  for (const anchor of ['recorridos', 'impacto', 'skills', 'proyectos', 'ensenanza', 'certificaciones', 'contacto']) if (!home.includes(`id="${anchor}"`)) fail(`Falta #${anchor}`);
}

function validateStaticFiles() {
  for (const file of ['README.md', 'CNAME', 'robots.txt', 'sitemap.xml', 'public/robots.txt', 'public/sitemap.xml', 'config/youtube-channels.json', 'data/youtube-state.json', 'vercel.json']) if (!exists(file)) fail(`Falta ${file}`);
  if (read('robots.txt') !== read('public/robots.txt')) fail('robots raíz y public están desincronizados');
  if (read('sitemap.xml') !== read('public/sitemap.xml')) fail('sitemap raíz y public están desincronizados');
}

function main() { validateSources(); validateStaticFiles(); validateDist(); console.log(`Validación correcta: ${SOURCE_PAGES.length} rutas Astro, datos, seguridad y assets.`); }
try { main(); } catch (error) { console.error(`Validación fallida: ${error.message}`); process.exitCode = 1; }
module.exports = { validateSources, validateDist, validateStaticFiles };
