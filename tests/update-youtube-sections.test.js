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
  assert.doesNotMatch(html, /<script>/);
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
  const response = await sync.fetchWithRetry('https://example.test', {
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

test('extrae videos únicos de una página de canal', () => {
  const html = fs.readFileSync(path.join(__dirname, 'fixtures/channel-page.html'), 'utf8');
  assert.deepEqual(sync.parseChannelPage(html, 6).map((entry) => entry.id), ['abcDEF12345', 'zyxWVU98765']);
});
