const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const sync = require('../src/js/update-youtube-sections');
const fixturePath = path.join(__dirname, 'fixtures/youtube-feed.xml');

test('parsea RSS, decodifica CDATA y elimina videos duplicados', () => {
  const entries = sync.parseEntries(fs.readFileSync(fixturePath, 'utf8'), 6);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].id, 'abcDEF12345');
  assert.equal(entries[0].title, 'Curso <completo> & Go 🚀');
});

test('normaliza entradas y rechaza identificadores inválidos', () => {
  assert.equal(sync.normalizeEntry({ id: 'short', title: 'x' }), null);
  assert.deepEqual(sync.normalizeEntry({ id: 'abcDEF12345', title: '  Título\ncon espacios  ' }), { id: 'abcDEF12345', title: 'Título con espacios', published: '' });
});

test('escapa HTML y renderiza una tabla de videos', () => {
  const html = sync.renderVideoGrid([{ id: 'abcDEF12345', title: '<script>alert(1)</script>', published: '' }]);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script\b/i);
});

test('deduplica por id y respeta el límite', () => {
  const entries = sync.uniqueEntries([
    { id: 'abcDEF12345', title: 'one' },
    { id: 'abcDEF12345', title: 'duplicate' },
    { id: 'zyxWVU98765', title: 'two' },
  ], 1);
  assert.deepEqual(entries.map((entry) => entry.id), ['abcDEF12345']);
});

test('parsea argumentos de modo seguro', () => {
  assert.deepEqual(sync.parseArgs(['--dry-run', '--offline', '--limit', '4']), { dryRun: true, offline: true, force: false, channel: null, limit: 4 });
  assert.throws(() => sync.parseArgs(['--limit', '99']), /--limit/);
});

test('reintenta respuestas temporales y respeta el timeout configurado', async () => {
  let calls = 0;
  // `fetchImpl` está stubeado, así que no sale ninguna petición; la URL sólo debe
  // pasar la lista blanca de hosts que `fetchWithRetry` comprueba antes de salir.
  const response = await sync.fetchWithRetry('https://www.youtube.com/__stub__', {
    timeoutMs: 1000,
    retries: 2,
    fetchImpl: async () => {
      calls += 1;
      if (calls < 2) return { ok: false, status: 503 };
      return { ok: true, status: 200 };
    },
  });
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test('decodifica entidades XML una sola vez (sin doble desescapado)', () => {
  // `&amp;lt;` describe el TEXTO literal «&lt;». Decodificar en cadena resolvía
  // primero `&amp;` y el filtro siguiente convertía el resultado en `<`,
  // reintroduciendo marcado desde un título que lo traía escapado a propósito.
  const entry = sync.normalizeEntry({ id: 'abcDEF12345', title: '&amp;lt;script&amp;gt;', published: '' });
  assert.equal(entry.title, '&lt;script&gt;');
  // Y una entidad normal sigue resolviéndose.
  assert.equal(sync.normalizeEntry({ id: 'abcDEF12345', title: 'Go &amp; Docker', published: '' }).title, 'Go & Docker');
});

test('rechaza salir a un host ajeno o por http', async () => {
  // Los identificadores de canal llegan de un fichero, así que la URL depende de
  // datos de fichero: la guarda debe actuar ANTES de cualquier petición.
  await assert.rejects(
    () => sync.fetchWithRetry('https://evil.example/feeds/videos.xml', { fetchImpl: async () => ({ ok: true }) }),
    /Host no permitido/,
  );
  await assert.rejects(
    () => sync.fetchWithRetry('http://www.youtube.com/feeds/videos.xml', { fetchImpl: async () => ({ ok: true }) }),
    /Sólo se permite https/,
  );
});

test('extrae videos únicos de una página de canal', () => {
  const html = fs.readFileSync(path.join(__dirname, 'fixtures/channel-page.html'), 'utf8');
  assert.deepEqual(sync.parseChannelPage(html, 6).map((entry) => entry.id), ['abcDEF12345', 'zyxWVU98765']);
});
