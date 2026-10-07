// Gate de internacionalización. Dos comprobaciones independientes:
//
//  1. COBERTURA del solapamiento inglés: cada registro de src/data/portfolio.js
//     (proyecto, skill, experiencia, curso) debe tener su entrada en
//     src/i18n/content.en.ts. El resolutor cae al español cuando falta una clave,
//     que es lo correcto en ejecución (nunca rompe la página) pero significa que
//     un registro nuevo sin traducir se publicaría en español dentro de /en sin
//     que nada avisara. Este check es ese aviso.
//
//  2. FUGAS de español en el HTML compilado de /en. Es la comprobación que de
//     verdad demuestra que la traducción está completa, porque no depende de que
//     yo recuerde todos los sitios donde hay texto: mira el resultado publicado.
//     Se excluye lo que legítimamente está en español — los títulos de los cursos,
//     marcados con lang="es" — y se ignoran atributos, scripts y JSON-LD.
//
// Sin dependencias: mismas técnicas (texto + regex) que el resto de gates del repo.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));

const failures = [];
const fail = (message) => failures.push(message);

/** Extrae el bloque de un `export const <name> = [...]` como texto. */
function block(source, name) {
  const start = source.indexOf(`export const ${name} =`);
  if (start === -1) return '';
  const rest = source.slice(start + 1);
  const next = rest.indexOf('\nexport const ');
  return next === -1 ? rest : rest.slice(0, next);
}

/** Valores de una clave dentro de un bloque, p. ej. todos los `id:` o `name:`. */
function values(text, key) {
  return [...text.matchAll(new RegExp(`\\b${key}:\\s*'([^']+)'`, 'g'))].map((m) => m[1]);
}

function checkOverlayCoverage() {
  const data = read('src/data/portfolio.js');
  const overlay = read('src/i18n/content.en.ts');

  const groups = [
    { label: 'proyecto', keys: values(block(data, 'projects'), 'name') },
    { label: 'skill', keys: values(block(data, 'skills'), 'name') },
    { label: 'experiencia', keys: values(block(data, 'experience'), 'id') },
    { label: 'curso', keys: values(block(data, 'courses'), 'name') },
  ];

  for (const { label, keys } of groups) {
    if (!keys.length) {
      fail(`No se pudo extraer ningún ${label} de portfolio.js: el gate quedaría ciego.`);
      continue;
    }
    for (const key of keys) {
      // La clave aparece citada en el solapamiento, con comillas simples o como
      // identificador sin comillas cuando es un nombre válido de propiedad.
      const quoted = `'${key}'`;
      if (!overlay.includes(quoted) && !new RegExp(`(^|[\\s{,])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'm').test(overlay)) {
        fail(`Sin traducción inglesa: ${label} «${key}» no está en src/i18n/content.en.ts.`);
      }
    }
  }
}

// Palabras funcionales españolas. Se eligen por ser imposibles en texto inglés y
// frecuentes en cualquier frase real, de modo que una fuga no pase inadvertida.
const SPANISH_MARKERS = [
  'que', 'los', 'las', 'una', 'para', 'con', 'del', 'por', 'más', 'desde',
  'sobre', 'como', 'sin', 'según', 'cada', 'está', 'esta', 'este', 'ver',
  'años', 'página', 'inicio', 'cursos', 'proyectos', 'trayectoria',
];

/** Texto visible de un documento, sin atributos, scripts, estilos ni SVG. */
function visibleText(html) {
  // El <title> es texto que el visitante lee (la pestaña del navegador), así que
  // se conserva; el resto de <head> son metadatos y se descarta.
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [])[1] || html;
  return `${title} ${body}`
    // Subárboles declarados explícitamente en español: los títulos de los cursos
    // son reales y se conservan a propósito, así que no son una fuga.
    //
    // OJO: la clase de etiqueta se restringe a elementos de CONTENIDO. Casar
    // cualquier `\w+` hacía que `<html lang="es">` coincidiera y el documento
    // español entero se borrara, de modo que el detector informaba «limpio»
    // sobre cualquier página. Lo detectó la prueba de control, no el gate.
    .replace(/<(h[1-6]|p|li|span|div|strong|em|a|small|td|dd|dt)[^>]*\blang="es"[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Los atributos van fuera: contienen URLs (la de WhatsApp lleva texto en
    // español por diseño) y no son texto leído por el visitante.
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Marcadores devueltos por un texto. Es UNA sola función para que la prueba de
 * control ejercite exactamente el mismo código que el gate: una reimplementación
 * en la sonda podría pasar mientras el gate está ciego, que es justo lo que
 * ocurrió en la primera versión.
 *
 * El límite se expresa con `\P{L}` (cualquier carácter que no sea letra) en vez
 * de una lista de signos: así «más,» «(para» o «años.» cuentan, y de paso evita
 * que `\b` trate la tilde de «está» como frontera de palabra.
 */
function hasSpanish(text) {
  return SPANISH_MARKERS.filter((word) => new RegExp(`(?:^|\\P{L})${word}(?:\\P{L}|$)`, 'iu').test(text));
}

function checkEnglishPagesHaveNoSpanish() {
  const routes = ['en/index.html', 'en/projects.html/index.html', 'en/courses.html/index.html',
    'en/certifications.html/index.html', 'en/experience.html/index.html', 'en/about.html/index.html'];
  const missing = routes.filter((route) => !exists(`dist/${route}`));
  if (missing.length) {
    fail(`Build incompleto, no se puede auditar el idioma: ${missing.join(', ')}. Ejecuta npm run build.`);
    return;
  }
  for (const route of routes) {
    const found = hasSpanish(visibleText(read(`dist/${route}`)));
    if (found.length) {
      fail(`dist/${route}: texto en español sin traducir (marcadores: ${found.slice(0, 6).join(', ')}).`);
    }
  }
}

/** La versión española no debe haber perdido su idioma por el camino. */
function checkSpanishPagesStaySpanish() {
  if (!exists('dist/index.html')) return;
  const home = read('dist/index.html');
  if (!/<html lang="es">/.test(home)) fail('dist/index.html debe declarar lang="es".');
  if (!exists('dist/en/index.html')) return;
  if (!/<html lang="en">/.test(read('dist/en/index.html'))) fail('dist/en/index.html debe declarar lang="en".');
}

/** Alternancia declarada en las dos direcciones. */
function checkAlternates() {
  const pairs = [['dist/index.html', 'dist/en/index.html'], ['dist/about.html/index.html', 'dist/en/about.html/index.html']];
  for (const [es, en] of pairs) {
    if (!exists(es) || !exists(en)) continue;
    for (const [file, label] of [[es, 'español'], [en, 'inglés']]) {
      const html = read(file);
      for (const hreflang of ['es', 'en', 'x-default']) {
        if (!new RegExp(`rel="alternate" hreflang="${hreflang}"`).test(html)) {
          fail(`${file} (${label}): falta el alternate hreflang="${hreflang}".`);
        }
      }
    }
  }
}

function main() {
  checkOverlayCoverage();
  checkEnglishPagesHaveNoSpanish();
  checkSpanishPagesStaySpanish();
  checkAlternates();
  if (failures.length) {
    console.error(`Validación i18n: ${failures.length} fallos.`);
    console.error(failures.map((failure) => `- ${failure}`).join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log('Validación i18n: cobertura del solapamiento, ausencia de español en /en y alternates correctos.');
}

if (require.main === module) main();
module.exports = { visibleText, hasSpanish, SPANISH_MARKERS };
