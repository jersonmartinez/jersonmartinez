const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
// El marcado de cada página vive en src/components/pages/ (compartido por los dos
// idiomas); src/pages/** son envoltorios que sólo fijan `lang`. El gate mira donde
// está el marcado real: comprobarlo sobre el envoltorio pasaría sin verificar nada.
const SOURCE_PAGES = ['src/components/pages/HomePage.astro', 'src/components/pages/ProjectsPage.astro', 'src/components/pages/ExperiencePage.astro', 'src/components/pages/CertificationsPage.astro', 'src/components/pages/CoursesPage.astro', 'src/components/pages/AboutPage.astro', 'src/pages/404.astro'];
// Las rutas construidas incluyen el idioma inglés: así los checks de SEO por página
// (title, description, canonical) cubren también /en, no sólo el español.
const BUILD_ROUTES = ['index.html', 'projects.html/index.html', 'experience.html/index.html', 'certifications.html/index.html', 'courses.html/index.html', 'about.html/index.html', 'en/index.html', 'en/projects.html/index.html', 'en/experience.html/index.html', 'en/certifications.html/index.html', 'en/courses.html/index.html', 'en/about.html/index.html', '404.html'];
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
  // Sin assets huérfanos en public/brands: cada logo debe estar referenciado en el sitio.
  // El recorrido es RECURSIVO: src/components/pages/ es un directorio, y leerlo como
  // fichero rompía el gate con EISDIR además de dejar fuera justo los componentes
  // de página, que son los que declaran los logos del ecosistema.
  const componentFiles = fs.readdirSync(path.join(ROOT, 'src/components'), { recursive: true })
    .map((entry) => `src/components/${entry}`)
    .filter((file) => fs.statSync(path.join(ROOT, file)).isFile());
  const brandRefs = componentFiles.map(read).join('\n')
    + read('src/data/portfolio.ts') + SOURCE_PAGES.map(read).join('\n');
  for (const file of fs.readdirSync(path.join(ROOT, 'public/brands'))) {
    if (!brandRefs.includes(`brands/${file}`)) fail(`Asset huérfano: public/brands/${file} no se referencia en el sitio.`);
  }
  // security.txt: presente, con los campos que RFC 9116 exige y con MARGEN.
  //
  // El check anterior sólo fallaba cuando ya estaba caducado, que es demasiado
  // tarde por dos motivos: un security.txt expirado es INVÁLIDO para los
  // escáneres que lo consumen (lo ignoran, así que el canal de divulgación
  // desaparece en silencio), y CI se pone rojo el mismo día sin margen para
  // rotar la fecha. Con ventana de preaviso el aviso llega con un mes de sobra.
  const securityTxt = 'public/.well-known/security.txt';
  if (!exists(securityTxt)) fail(`Falta ${securityTxt}`);
  else {
    const body = read(securityTxt);
    for (const field of ['Contact:', 'Expires:', 'Canonical:']) {
      if (!new RegExp(`^${field}`, 'm').test(body)) fail(`security.txt: falta el campo ${field.slice(0, -1)} (RFC 9116).`);
    }
    const expires = body.match(/^Expires:\s*(.+)$/m);
    const when = expires ? new Date(expires[1].trim()).getTime() : NaN;
    const LEAD_DAYS = 30;
    const leadMs = LEAD_DAYS * 24 * 60 * 60 * 1000;
    if (!expires) fail('security.txt: falta el campo Expires (RFC 9116).');
    else if (Number.isNaN(when)) fail(`security.txt: Expires no es una fecha válida (${expires[1].trim()}).`);
    else if (when <= Date.now()) fail(`security.txt: Expires CADUCADO (${expires[1].trim()}); el fichero es inválido para los escáneres.`);
    else if (when - Date.now() < leadMs) {
      const days = Math.ceil((when - Date.now()) / (24 * 60 * 60 * 1000));
      fail(`security.txt: Expires vence en ${days} día(s); renueva la fecha antes de que el fichero deje de ser válido.`);
    }
  }
  // Cada página indexable declara title y description en BaseLayout.
  for (const page of SOURCE_PAGES) {
    const text = read(page);
    if (!/\btitle=("|\{|`)/.test(text)) fail(`${page}: BaseLayout sin title.`);
    if (!/\bdescription=("|\{|`)/.test(text)) fail(`${page}: BaseLayout sin description.`);
  }
  const data = read('src/data/portfolio.ts');
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
    // Cabecera SEO mínima: title y description no vacíos; canonical en rutas indexables.
    if (!/<title>[^<]+<\/title>/.test(html)) fail(`dist/${route}: <title> vacío`);
    if (!/name="description" content="[^"]+"/.test(html)) fail(`dist/${route}: description vacía`);
    if (route !== '404.html' && !/rel="canonical" href="[^"]+"/.test(html)) fail(`dist/${route}: canonical ausente`);
    // CLS: toda imagen renderizada declara width y height.
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      const tag = match[0];
      if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag)) fail(`dist/${route}: <img> sin width/height (CLS): ${tag.slice(0, 90)}`);
    }
    // Integridad: toda imagen local referenciada existe en el build.
    for (const match of html.matchAll(/\ssrc="(\/[^"']+\.(?:svg|png|jpe?g|webp|avif|gif))"/g)) {
      const rel = match[1].replace(/^\//, '');
      if (!exists(`dist/${rel}`)) fail(`dist/${route}: imagen local inexistente ${match[1]}`);
    }
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
