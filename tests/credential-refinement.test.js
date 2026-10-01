const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Contrato del refinamiento de credenciales / home / CV (PR feat/credential-home-cv-polish).
// Verifica a nivel de FUENTE (sin red) que:
//  - la variante resumida del home reutiliza el componente aprobado CredentialCard,
//  - no reaparece la flecha ↳ ni la variante antigua cert-list/credential-link,
//  - CredentialCard expone código, verificación accesible y modo summary,
//  - el enlace EN del CV usa EXACTAMENTE la URL de Drive aprobada en portfolio.js y README.
// portfolio.js es ESM con package type:commonjs, así que se lee como texto (igual
// que el resto de la suite) en lugar de importarse.

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const EN_CV_URL = 'https://docs.google.com/document/d/18q3xhTd7bmymk-ZeMM_BHhJT6Qp4rLcxu05DozMQRYo/edit?usp=drive_link';

test('el home reutiliza CredentialCard en modo summary (no la variante cert-card antigua)', () => {
  const index = read('src/pages/index.astro');
  assert.match(index, /import CredentialCard from '\.\.\/components\/CredentialCard\.astro'/);
  assert.match(index, /<CredentialCard\s+certification=\{cert\}\s+summary/);
  assert.doesNotMatch(index, /class="card cert-card"/);
  assert.doesNotMatch(index, /class="cert-list"/);
});

test('CredentialCard expone código, verificación accesible y modo summary', () => {
  const card = read('src/components/CredentialCard.astro');
  assert.match(card, /summary = false/);
  assert.match(card, /credential-code/);
  assert.match(card, /credential-verify/);
  assert.match(card, /Verificar/);
  assert.match(card, /Emisor oficial/);
  // El indicador de verificación es accesible: icono SVG del sprite (aria-hidden) + texto visible.
  assert.match(card, /<Icon name="fas fa-check-circle"/);
});

test('no quedan la flecha ↳ ni la variante antigua de credenciales en CSS', () => {
  const css = read('src/styles/global.css');
  assert.doesNotMatch(css, /↳/);
  assert.doesNotMatch(css, /\.cert-list\b/);
  assert.doesNotMatch(css, /\.credential-link\b/);
  assert.doesNotMatch(css, /\.cert-card\b/);
});

test('el enlace EN del CV usa exactamente la URL de Drive aprobada', () => {
  const data = read('src/data/portfolio.js');
  const readme = read('README.md');
  assert.ok(data.includes(EN_CV_URL), 'portfolio.js debe usar la URL EN exacta');
  assert.ok(readme.includes(EN_CV_URL), 'README.md debe usar la URL EN exacta');
  // La URL EN antigua no debe sobrevivir en ninguno de los dos.
  assert.doesNotMatch(data, /1aYwQcfaZAgsv0OWtSb56qzilAySD_xYH7YJbdNMnRl0/);
  assert.doesNotMatch(readme, /1aYwQcfaZAgsv0OWtSb56qzilAySD_xYH7YJbdNMnRl0/);
});

test('cada proveedor de certificación declara una URL de emisor oficial verificable', () => {
  const data = read('src/data/portfolio.js');
  const issuerUrls = [...data.matchAll(/issuerUrl:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.equal(issuerUrls.length, 3, 'Se esperaban 3 issuerUrl (AWS, Azure, GitHub)');
  for (const url of issuerUrls) assert.match(url, /^https:\/\//, `issuerUrl debe ser https: ${url}`);
});
