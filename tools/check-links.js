const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'dist');
const sources = fs.existsSync(BUILD)
  ? ['dist/index.html', 'dist/projects.html/index.html', 'dist/experience.html/index.html', 'dist/certifications.html/index.html', 'dist/courses.html/index.html', 'dist/about.html/index.html', 'README.md']
  : ['README.md', 'src/pages/index.astro', 'src/pages/projects.html.astro', 'src/pages/experience.html.astro', 'src/pages/certifications.html.astro', 'src/pages/courses.html.astro', 'src/pages/about.html.astro'];
const URL_PATTERN = /(?:href|src)=["']([^"']+)["']|\[[^\]]+\]\(([^)]+)\)/gi;
const failures = [];
let checked = 0;

function resolveLocal(source, value) {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || /^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(clean)) return null;
  const base = source === 'README.md' ? ROOT : ROOT;
  if (source === 'README.md') return path.normalize(path.join(base, clean));
  const raw = clean.startsWith('/') ? path.join(BUILD, clean) : path.join(ROOT, path.dirname(source), clean);
  if (fs.existsSync(raw)) return raw;
  if (fs.existsSync(`${raw}/index.html`)) return `${raw}/index.html`;
  if (clean === '/') return path.join(BUILD, 'index.html');
  return raw;
}

for (const source of sources) {
  const file = path.join(ROOT, source);
  if (!fs.existsSync(file)) { failures.push(`${source}: fuente ausente`); continue; }
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(URL_PATTERN)) {
    const value = match[1] || match[2];
    if (!value || value.startsWith('#')) continue;
    const local = resolveLocal(source, value);
    if (!local) continue;
    checked += 1;
    if (!fs.existsSync(local)) failures.push(`${source}: recurso interno inexistente ${value}`);
  }
}

const report = { generatedAt: new Date().toISOString(), checked, failures };
fs.writeFileSync(process.env.LINK_REPORT_PATH || path.join(ROOT, 'link-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Auditoría de enlaces locales: ${checked} referencias revisadas, ${failures.length} fallos.`);
if (failures.length) { console.error(failures.map((item) => `- ${item}`).join('\n')); process.exitCode = 1; }
