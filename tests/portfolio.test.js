const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
// Rutas públicas por idioma. El español no lleva prefijo; el inglés vive bajo /en.
const routeFiles = ['index.astro', 'projects.html.astro', 'experience.html.astro', 'certifications.html.astro', 'courses.html.astro', 'about.html.astro'];
const pageComponents = ['HomePage', 'ProjectsPage', 'ExperiencePage', 'CertificationsPage', 'CoursesPage', 'AboutPage'];

test('cada ruta existe en los dos idiomas y comparte un único marcado', () => {
  // El marcado vive UNA vez por página en src/components/pages/: es lo que impide
  // que una corrección se aplique a un idioma y se olvide en el otro.
  for (const component of pageComponents) {
    assert.match(read(`src/components/pages/${component}.astro`), /BaseLayout/, `${component} debe usar BaseLayout`);
  }
  assert.match(read('src/pages/404.astro'), /BaseLayout/);
  // Los doce envoltorios sólo fijan el idioma y delegan en el componente.
  for (const file of routeFiles) {
    const es = read(`src/pages/${file}`);
    const en = read(`src/pages/en/${file}`);
    assert.match(es, /lang="es"/, `src/pages/${file} debe fijar lang="es"`);
    assert.match(en, /lang="en"/, `src/pages/en/${file} debe fijar lang="en"`);
    assert.ok(pageComponents.some((component) => es.includes(component)), `src/pages/${file} debe delegar en un componente de página`);
  }
});

test('identidad, tipografías e iconos se sirven localmente', () => {
  // La marca se incrusta como SVG inline y hereda currentColor. Servida como <img> con
  // un fill fijo quedaba invisible sobre el header claro, y un <img> no hereda el color.
  assert.match(read('src/components/SiteHeader.astro'), /BrandMark/);
  assert.match(read('src/components/BrandMark.astro'), /fill="currentColor"/);
  assert.doesNotMatch(read('src/components/SiteHeader.astro'), /<img[^>]*brand\/logo\.svg/);
  assert.match(read('src/styles/global.css'), /fonts\.css/);
  // los iconos ya no usan webfont de Font Awesome, sino un sprite SVG inline.
  assert.match(read('src/components/IconSprite.astro'), /<symbol id="icon-/);
  assert.match(read('src/components/Icon.astro'), /#icon-/);
  assert.doesNotMatch(read('src/styles/global.css'), /fonts\.googleapis|fontawesome\/css\/all|icons\.css/);
  for (const file of ['public/fonts/manrope-latin.woff2', 'public/fonts/dm-mono-400-latin.woff2']) assert.ok(exists(file), `Falta ${file}`);
  // Los WOFF2 de Font Awesome ya no se envían.
  assert.ok(!exists('public/fonts/fa-solid-900.woff2'), 'El WOFF2 de FA solid no debe enviarse');
  assert.ok(!exists('public/fonts/fa-brands-400.woff2'), 'El WOFF2 de FA brands no debe enviarse');
  assert.ok(!exists('src/libs'), 'Las librerías legacy no deben volver al árbol activo');
});

test('antigüedad y cronología tienen una sola fuente', () => {
  const data = read('src/data/portfolio.js');
  // El marcado de «sobre mí» vive en el componente compartido: asertar sobre el
  // envoltorio pasaría trivialmente y dejaría de cubrir nada.
  const about = read('src/components/pages/AboutPage.astro');
  const ui = read('src/i18n/ui.ts');
  assert.match(data, /careerStartYear: 2016/);
  assert.match(data, /yearsExperience: 10/);
  assert.match(data, /continuousLearningSince: '2017-12'/);
  assert.match(data, /Proyectos tecnológicos independientes/);
  assert.doesNotMatch(about, /\+8|8\+ años/);
  // Los años se interpolan desde el dato en los dos idiomas, nunca se escriben a mano.
  assert.match(about, /page\.lede\(profile\.yearsExperience\)/);
  assert.doesNotMatch(ui, /Más de 10 años combinando|More than 10 years combining/);
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
  const ui = read('src/i18n/ui.ts');
  const script = read('public/scripts/site.js');
  assert.match(data, /WSL Container/);
  assert.match(data, /evidence:/);
  assert.match(component, /c\.skillApplied/);
  assert.match(ui, /skillApplied: 'Capacidad aplicada'/);
  assert.match(component, /role="tablist"/);
  assert.match(script, /ArrowDown/);
});

test('proyectos usan categorías declaradas y casos de estudio', () => {
  const data = read('src/data/portfolio.js');
  const card = read('src/components/ProjectCard.astro');
  const ui = read('src/i18n/ui.ts');
  const page = read('src/components/pages/ProjectsPage.astro');
  assert.match(data, /categories: \['personal', 'teaching'\]/);
  assert.match(data, /https:\/\/factib\.com/);
  for (const value of ['problem:', 'contribution:', 'outcome:', 'language:', 'license:']) assert.match(data, new RegExp(value));
  assert.match(card, /c\.projectProblem/);
  assert.match(ui, /projectProblem: 'Problema'/);
  assert.doesNotMatch(page, /function filterFor/);
});

test('métricas confirmadas incluyen fecha y OpenWebinars separado', () => {
  const data = read('src/data/portfolio.js');
  for (const value of ['Más de 77 mil estudiantes', '+14K suscriptores', '+5K suscriptores', '+60 artículos', '7 cursos impartidos', 'lastVerifiedAt']) assert.ok(data.includes(value), `Falta ${value}`);
  assert.doesNotMatch(data, /\+60 artículos y cursos/);
});

test('solo se publican diez certificaciones oficiales', () => {
  const data = read('src/data/portfolio.js');
  const page = read('src/components/pages/CertificationsPage.astro');
  const ui = read('src/i18n/ui.ts');
  const credentialLinks = (data.match(/credentialId:/g) || []).length;
  assert.equal(credentialLinks, 10);
  assert.match(page, /CredentialCard/);
  assert.match(ui, /h1: 'Diez credenciales/);
  assert.match(ui, /h1: 'Ten verifiable credentials/);
  assert.match(data, /GitHub Foundations/);
  const githubBlock = data.slice(data.indexOf("provider: 'GitHub'"), data.indexOf('export const youtubeChannels'));
  assert.doesNotMatch(githubBlock, /GitHub Actions|Gobernanza de repositorios/);
});

test('cursos y OpenWebinars exponen rutas verificables', () => {
  const data = read('src/data/portfolio.js');
  assert.equal((data.match(/openwebinars\.net\/cursos\//g) || []).length, 7);
  assert.equal((data.match(/www\.udemy\.com\/course\//g) || []).length, 7);
  assert.match(read('src/i18n/ui.ts'), /courseOutcomeLabel: 'Al completar esta etapa'/);
  assert.doesNotMatch(read('src/components/pages/CoursesPage.astro'), /ficha pública consultada/);
});

test('CV, imágenes responsive, OG y PWA existen', () => {
  for (const file of ['public/cv/jerson-martinez-cv-es.pdf', 'public/cv/jerson-martinez-cv-en.pdf', 'public/images/profile-v2-320.avif', 'public/images/profile-v2-640.webp', 'public/images/profile-v2-960.jpg', 'public/social/home.jpg', 'public/social/projects.jpg', 'public/brand/favicon-192.png', 'public/brand/favicon-512.png', 'public/brand/apple-touch-icon.png']) assert.ok(exists(file), `Falta ${file}`);
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.icons.length, 2);
  assert.match(read('src/layouts/BaseLayout.astro'), /1200/);
});

test('CSP no usa unsafe-inline y no quedan dependencias visuales remotas', () => {
  const vercel = read('vercel.json');
  // Se escanea donde vive el marcado (componentes de página) Y los envoltorios de
  // ambos idiomas, para que un estilo inline no pueda colarse por ninguna vía.
  const sources = pageComponents.map((component) => read(`src/components/pages/${component}.astro`)).join('\n')
    + routeFiles.map((file) => read(`src/pages/${file}`) + read(`src/pages/en/${file}`)).join('\n')
    + read('src/layouts/BaseLayout.astro');
  assert.doesNotMatch(vercel, /unsafe-inline/);
  assert.match(vercel, /script-src 'self'/);
  assert.doesNotMatch(sources, /style="|cdn\.simpleicons|fonts\.googleapis/);
});

test('SEO y sitemap cubren rutas reales con lastmod', () => {
  const sitemap = read('public/sitemap.xml');
  const routes = ['/', '/projects.html', '/courses.html', '/certifications.html', '/experience.html', '/about.html'];
  for (const route of routes) assert.ok(sitemap.includes(`https://www.jersonmartinez.com${route}`), `Falta ${route}`);
  // El sitemap es MULTILINGÜE: cada ruta aparece en los dos idiomas y declara sus
  // alternativas, incluido x-default hacia el español (el idioma sin prefijo).
  for (const route of routes) {
    const en = route === '/' ? '/en' : `/en${route}`;
    assert.ok(sitemap.includes(`<loc>https://www.jersonmartinez.com${en}</loc>`), `Falta la versión inglesa de ${route}`);
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length * 2);
  assert.match(sitemap, /hreflang="x-default" href="https:\/\/www\.jersonmartinez\.com\/"/);
  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  const lastReviewed = (read('src/data/portfolio.js').match(/lastReviewed:\s*'(\d{4}-\d{2}-\d{2})'/) || [])[1];
  assert.ok(lastReviewed, 'contentMeta.lastReviewed presente');
  assert.match(sitemap, new RegExp(`<lastmod>${lastReviewed}</lastmod>`));
  assert.match(read('src/layouts/BaseLayout.astro'), /application\/ld\+json/);
  assert.match(read('src/components/pages/CoursesPage.astro'), /'@type': 'Course'/);
  assert.match(read('src/components/pages/CertificationsPage.astro'), /EducationalOccupationalCredential/);
});

test('la generación de assets y documentación técnica están versionadas', () => {
  assert.ok(exists('tools/generate-visual-assets.py'));
  assert.ok(exists('SECURITY-HEADERS.md'));
  assert.ok(exists('docs/PORTFOLIO-INTEGRITY-2026.md'));
});
