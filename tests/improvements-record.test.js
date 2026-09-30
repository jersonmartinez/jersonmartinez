const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Regresión del registro de mejoras (docs/IMPROVEMENTS-RECORD.md).
// Verifica que el documento exista, declare un total coherente con la fuente
// de verdad (tools/gen-improvements-record.js), registre al menos 100 mejoras,
// no contradiga los valores protegidos y que cada archivo atribuido exista.

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const { IMPROVEMENTS, total } = require('../tools/gen-improvements-record.js');
const DOC = 'docs/IMPROVEMENTS-RECORD.md';

test('el registro de mejoras existe y declara su total', () => {
  assert.ok(fs.existsSync(path.join(root, DOC)), `Falta ${DOC}`);
  const md = read(DOC);
  assert.match(md, new RegExp(`\\*\\*${total} mejoras aplicadas\\*\\*`));
  assert.match(md, new RegExp(`\\| \\*\\*Total\\*\\* \\| \\*\\*${total}\\*\\* \\|`));
});

test('se registran al menos 100 mejoras aplicadas', () => {
  assert.ok(total >= 100, `Se esperaban >=100 mejoras, hay ${total}`);
});

test('cada mejora registrada apunta a un archivo existente', () => {
  for (const [ref, , file] of IMPROVEMENTS) {
    assert.ok(fs.existsSync(path.join(root, file)), `Ref #${ref}: archivo inexistente ${file}`);
  }
});

test('las referencias de audit no se duplican', () => {
  const refs = IMPROVEMENTS.map((i) => i[0]);
  assert.equal(new Set(refs).size, refs.length, 'Hay referencias de audit duplicadas');
});

test('el registro respeta los valores protegidos', () => {
  const md = read(DOC);
  for (const value of ['Más de 77 mil estudiantes', '+14K suscriptores', '+5K suscriptores', '+60 artículos y cursos']) {
    assert.ok(md.includes(value), `Valor protegido ausente en el registro: "${value}"`);
  }
  // No debe introducir cifras alternativas prohibidas.
  assert.doesNotMatch(md, /77[.,]?259/);
});

test('el documento está sincronizado con la fuente de verdad (regenerable)', () => {
  // Todas las filas de detalle deben citar un commit de 7 hex.
  const md = read(DOC);
  const rows = md.split('\n').filter((l) => /^\| \d+ \| #\d+ \|/.test(l));
  assert.equal(rows.length, total, `Filas de detalle (${rows.length}) != total (${total})`);
  for (const row of rows) {
    assert.match(row, /\| `[0-9a-f]{7}` \|$/, `Fila sin SHA de commit: ${row}`);
  }
});
