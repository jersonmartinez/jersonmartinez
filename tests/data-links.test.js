const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Item 44: validador de enlaces de datos. Comprueba que todos los href
// declarados en src/data/portfolio.js (repos GitHub, Udemy, YouTube,
// credenciales, CV) tienen un formato válido y que no queda ningún enlace
// vacío o apuntando a '#'. No hace peticiones de red: valida sólo el formato.
//
// portfolio.js es ESM pero el paquete es type:commonjs, así que -igual que el
// resto de tests del repo- se lee como TEXTO y se extraen los href por regex,
// en lugar de importarlo (import() lo trataría como CJS y fallaría).

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const data = read('src/data/portfolio.js');

// Extrae todos los valores href: pares de tuplas ['label', 'https://...'] y
// campos href:/logo:/website:/github:/linkedin: con string literal.
function collectHrefs(source) {
  const hrefs = new Set();
  // Campos con clave explícita: href, logo, website, github, linkedin.
  for (const m of source.matchAll(/\b(?:href|logo|website|github|linkedin)\s*:\s*'([^']*)'/g)) hrefs.add(m[1]);
  // Tuplas de cvLinks / facts: ['texto', 'https://...'] — captura el 2º literal si parece URL.
  for (const m of source.matchAll(/'(https?:\/\/[^']*)'/g)) hrefs.add(m[1]);
  return [...hrefs];
}

// Un href es válido si es http(s), mailto:, tel:, o una ruta interna absoluta
// (empieza por '/'). Se rechazan vacíos, '#' y anclas sueltas sin ruta.
const isValidHref = (value) => {
  const v = String(value).trim();
  if (!v || v === '#') return false;
  if (v.startsWith('#')) return false;
  if (/^(mailto:|tel:)/i.test(v)) return v.length > 7;
  if (/^https?:\/\//i.test(v)) {
    try { new URL(v); return true; } catch { return false; }
  }
  return v.startsWith('/') && v.length > 1; // ruta interna absoluta, no sólo '/'
};

test('todos los href de portfolio.js tienen formato válido y no hay enlaces vacíos o a "#"', () => {
  const hrefs = collectHrefs(data);
  assert.ok(hrefs.length > 0, 'No se recolectó ningún href de portfolio.js.');
  const invalid = hrefs.filter((href) => !isValidHref(href));
  assert.deepEqual(invalid, [], `Enlaces inválidos en portfolio.js: ${JSON.stringify(invalid)}`);
});

test('portfolio.js no contiene enlaces vacíos, a "#" ni placeholders', () => {
  // href/cta a cadena vacía o a '#'
  assert.doesNotMatch(data, /\bhref\s*:\s*'(?:#?)'/, 'Hay un href vacío o a "#" en portfolio.js.');
  // dominios placeholder típicos
  assert.doesNotMatch(data, /https?:\/\/(?:example\.com|localhost|xxxx)/i, 'Hay un enlace placeholder en portfolio.js.');
});

test('los repositorios enlazados y las credenciales usan https', () => {
  const hrefs = collectHrefs(data);
  const repos = hrefs.filter((h) => h.includes('github.com/jersonmartinez/'));
  assert.ok(repos.length >= 5, 'Se esperaban al menos 5 repositorios GitHub enlazados.');
  for (const r of repos) assert.match(r, /^https:\/\//, `El repo ${r} debe ser https://`);
  const creds = hrefs.filter((h) => /certmetrics\.com|learn\.microsoft\.com\/api\/credentials|credly\.com\/badges/.test(h));
  for (const c of creds) assert.match(c, /^https:\/\//, `La credencial ${c} debe ser https://`);
});
