const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '../..');
const README_PATH = path.join(ROOT, 'README.md');
const CONFIG_PATH = path.join(ROOT, 'config/youtube-channels.json');
const STATE_PATH = path.join(ROOT, 'data/youtube-state.json');
const DEFAULT_USER_AGENT = 'jersonmartinez-profile-youtube-sync/2.0';
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateChannel(channel) {
  if (!channel || typeof channel.name !== 'string' || typeof channel.handle !== 'string' || typeof channel.channelId !== 'string') {
    throw new Error('Cada canal debe definir name, handle y channelId.');
  }
  if (!/^@[A-Za-z0-9._-]{2,100}$/.test(channel.handle)) {
    throw new Error(`${channel.name}: handle de YouTube inválido.`);
  }
  if (!/^UC[A-Za-z0-9_-]{20,30}$/.test(channel.channelId)) {
    throw new Error(`${channel.name}: channelId de YouTube inválido.`);
  }
  if (!/^[A-Z0-9-]+$/.test(channel.marker || '')) {
    throw new Error(`${channel.name}: marker inválido.`);
  }
}

function loadConfig() {
  const config = loadJson(CONFIG_PATH);
  if (!Number.isInteger(config.maxResults) || config.maxResults < 1 || config.maxResults > 20) {
    throw new Error('maxResults debe estar entre 1 y 20.');
  }
  if (!Number.isInteger(config.requestTimeoutMs) || config.requestTimeoutMs < 1000) {
    throw new Error('requestTimeoutMs debe ser al menos 1000.');
  }
  if (!Number.isInteger(config.retries) || config.retries < 0 || config.retries > 6) {
    throw new Error('retries debe estar entre 0 y 6.');
  }
  if (!Array.isArray(config.channels) || config.channels.length === 0) {
    throw new Error('Debe existir al menos un canal configurado.');
  }
  config.channels.forEach(validateChannel);
  return config;
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = { dryRun: false, offline: false, force: false, channel: null, limit: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--dry-run') args.dryRun = true;
    else if (value === '--offline') args.offline = true;
    else if (value === '--force') args.force = true;
    else if (value === '--channel') args.channel = argv[++index];
    else if (value === '--limit') args.limit = Number(argv[++index]);
    else if (value === '--help') args.help = true;
    else throw new Error(`Argumento desconocido: ${value}`);
  }
  if (args.limit !== null && (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 20)) {
    throw new Error('--limit debe ser un entero entre 1 y 20.');
  }
  return args;
}

const XML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/**
 * Decodifica entidades XML en UNA sola pasada.
 *
 * Hacerlo en cadena desescapaba dos veces: `&amp;` se resolvía primero, de modo
 * que `&amp;lt;` quedaba en `&lt;` y el filtro siguiente lo convertía en `<`,
 * reintroduciendo marcado desde un título que lo traía escapado a propósito
 * (CodeQL js/double-escaping). Con una pasada, cada entidad se resuelve una vez
 * y el resultado no vuelve a examinarse.
 */
function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(?:(amp|lt|gt|quot|apos)|#(\d+)|#x([\da-f]+));/gi, (match, name, dec, hex) => {
      if (name) return XML_ENTITIES[name.toLowerCase()] ?? match;
      if (dec !== undefined) return String.fromCodePoint(Number(dec));
      return String.fromCodePoint(parseInt(hex, 16));
    });
}

function normalizeTitle(value) {
  return decodeXml(String(value || ''))
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTagValue(entry, tagName) {
  const match = entry.match(new RegExp(`<${escapeRegExp(tagName)}(?:\\s[^>]*)?>([\\s\\S]*?)</${escapeRegExp(tagName)}>`));
  return match ? decodeXml(match[1]).trim() : '';
}

function normalizeEntry(entry) {
  const id = String(entry.id || '').trim();
  const title = normalizeTitle(entry.title);
  if (!VIDEO_ID_PATTERN.test(id) || !title) return null;
  const published = entry.published && !Number.isNaN(new Date(entry.published).getTime()) ? new Date(entry.published).toISOString() : '';
  return { id, title, published };
}

function uniqueEntries(entries, limit) {
  const seen = new Set();
  return entries.map(normalizeEntry).filter(Boolean).filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  }).slice(0, limit);
}

function parseEntries(xml, limit = 6) {
  return uniqueEntries([...String(xml).matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => ({
    id: getTagValue(entry, 'yt:videoId'),
    title: getTagValue(entry, 'title'),
    published: getTagValue(entry, 'published'),
  })), limit);
}

function parseChannelPage(html, limit = 6) {
  const ids = [...String(html).matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map(([, id]) => id);
  return uniqueEntries(ids.map((id) => ({ id, title: id, published: '' })), limit);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

function renderVideoGrid(entries) {
  if (entries.length === 0) return '<p><em>No hay videos disponibles en este momento.</em></p>';
  const cells = entries.map(({ id, title, published }) => {
    const safeTitle = escapeHtml(title);
    const date = formatDate(published);
    const dateMarkup = date ? `<br><small>Publicado: ${escapeHtml(date)}</small>` : '';
    return [
      '  <td width="33%" valign="top">',
      `    <a href="https://www.youtube.com/watch?v=${encodeURIComponent(id)}">`,
      `      <img src="https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg" alt="${safeTitle}" width="100%">`,
      `      <br><strong>${safeTitle}</strong>${dateMarkup}`,
      '    </a>',
      '  </td>',
    ].join('\n');
  });
  const rows = [];
  for (let index = 0; index < cells.length; index += 3) {
    rows.push(`  <tr>\n${cells.slice(index, index + 3).join('\n')}\n  </tr>`);
  }
  return `<table>\n${rows.join('\n')}\n</table>`;
}

function markerPair(channel) {
  return {
    start: `<!-- ${channel.marker}-YOUTUBE-VIDEOS-LIST-BEGIN -->`,
    end: `<!-- ${channel.marker}-YOUTUBE-VIDEOS-LIST-END -->`,
  };
}

function countOccurrences(value, needle) {
  return value.split(needle).length - 1;
}

function replaceSection(readme, channel, entries) {
  const { start, end } = markerPair(channel);
  if (countOccurrences(readme, start) !== 1 || countOccurrences(readme, end) !== 1) {
    throw new Error(`${channel.name}: cada marcador del README debe aparecer exactamente una vez.`);
  }
  const sectionPattern = new RegExp(`(${escapeRegExp(start)}\\s*)([\\s\\S]*?)(\\s*${escapeRegExp(end)})`);
  return readme.replace(sectionPattern, `$1${renderVideoGrid(entries)}$3`);
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function classifyError(error) {
  const message = String(error && error.message ? error.message : error);
  if (/HTTP (429|500|502|503|504)|timeout|network|fetch failed/i.test(message)) return 'temporary-network';
  if (/API key|quota|403/i.test(message)) return 'api-limit-or-auth';
  if (/marker|README/i.test(message)) return 'content-structure';
  if (/channel|video|YouTube/i.test(message)) return 'source-data';
  return 'unknown';
}

/**
 * Hosts a los que este script puede salir. Los identificadores y handles de
 * canal llegan de un fichero de configuración, así que la URL que se construye
 * depende de datos de fichero: una entrada manipulada podría apuntar la petición
 * a otro destino (CodeQL js/file-access-to-http). La lista se comprueba en el
 * ÚNICO punto de salida, de modo que ninguna ruta de obtención la esquiva.
 */
const ALLOWED_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'www.googleapis.com']);

function assertAllowedUrl(url) {
  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    throw new Error(`URL no válida: ${url}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`Sólo se permite https: ${parsed.protocol}`);
  if (!ALLOWED_HOSTS.has(parsed.hostname)) throw new Error(`Host no permitido: ${parsed.hostname}`);
  return parsed.toString();
}

async function fetchWithRetry(url, options = {}) {
  const target = assertAllowedUrl(url);
  const timeoutMs = options.timeoutMs || options.requestTimeoutMs || 10000;
  const retries = options.retries ?? 3;
  const fetchImpl = options.fetchImpl || fetch;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(target, {
        headers: { 'user-agent': DEFAULT_USER_AGENT, ...(options.headers || {}) },
        signal: controller.signal,
      });
      if (response.ok) return response;
      const error = new Error(`HTTP ${response.status} para ${url}`);
      if (![408, 425, 429, 500, 502, 503, 504].includes(response.status) || attempt === retries) throw error;
      lastError = error;
    } catch (error) {
      lastError = error.name === 'AbortError' ? new Error(`timeout tras ${timeoutMs} ms para ${url}`) : error;
      if (attempt === retries) throw lastError;
    } finally {
      clearTimeout(timer);
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
  }
  throw lastError || new Error(`No se pudo obtener ${url}`);
}

function apiEntries(payload, limit) {
  if (!payload || !Array.isArray(payload.items)) return [];
  return uniqueEntries(payload.items.map((item) => ({
    id: item.id && (item.id.videoId || item.id),
    title: item.snippet && item.snippet.title,
    published: item.snippet && item.snippet.publishedAt,
  })), limit);
}

function expectedAuthorMatches(channel, authorName) {
  if (!authorName) return false;
  const expected = channel.handle.replace(/^@/, '').toLowerCase();
  return authorName.toLowerCase().replace(/\s+/g, '').includes(expected.replace(/\s+/g, ''));
}

async function fetchFromApi(channel, config, limit, options) {
  if (!process.env.YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY no está configurada');
  const params = new URLSearchParams({
    part: 'snippet', channelId: channel.channelId, maxResults: String(limit), order: 'date', type: 'video', key: process.env.YOUTUBE_API_KEY,
  });
  const response = await fetchWithRetry(`https://www.googleapis.com/youtube/v3/search?${params}`, { ...config, ...options });
  const entries = apiEntries(await response.json(), limit);
  if (!entries.length) throw new Error(`${channel.name}: la API no devolvió videos.`);
  return entries;
}

async function fetchFromChannelPage(channel, config, limit, options) {
  const response = await fetchWithRetry(`https://www.youtube.com/${channel.handle}/videos`, { ...config, ...options });
  const html = await response.text();
  if (!html.includes(channel.channelId)) throw new Error(`${channel.name}: la página no coincide con el channelId configurado.`);
  const candidates = parseChannelPage(html, limit * 2);
  if (!candidates.length) throw new Error(`${channel.name}: la página no contiene videos reconocibles.`);
  const entries = [];
  for (const candidate of candidates) {
    try {
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${candidate.id}`)}&format=json`;
      const metadata = await (await fetchWithRetry(oEmbedUrl, { ...config, ...options })).json();
      if (!expectedAuthorMatches(channel, metadata.author_name)) continue;
      entries.push({ id: candidate.id, title: metadata.title, published: '' });
    } catch (error) {
      console.warn(`${channel.name}: no se pudo validar ${candidate.id}: ${error.message}`);
    }
    if (entries.length >= limit) break;
  }
  const normalized = uniqueEntries(entries, limit);
  if (!normalized.length) throw new Error(`${channel.name}: no se encontraron videos del autor esperado.`);
  return normalized;
}

async function fetchFromRss(channel, config, limit, options) {
  const response = await fetchWithRetry(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.channelId)}`, { ...config, ...options });
  const entries = parseEntries(await response.text(), limit);
  if (!entries.length) throw new Error(`${channel.name}: el RSS no contiene videos reconocibles.`);
  return entries;
}

function readState() {
  try { return loadJson(STATE_PATH); } catch { return { version: 1, channels: {} }; }
}

function cacheEntries(channel, state, limit) {
  return uniqueEntries(state.channels && state.channels[channel.name] && state.channels[channel.name].entries || [], limit);
}

async function fetchChannel(channel, config, state, options = {}) {
  const limit = options.limit || config.maxResults;
  const attempts = [];
  const sources = [];
  if (!options.offline && process.env.YOUTUBE_API_KEY) sources.push(['youtube-api', () => fetchFromApi(channel, config, limit, options)]);
  if (!options.offline) sources.push(['channel-page', () => fetchFromChannelPage(channel, config, limit, options)]);
  if (!options.offline) sources.push(['rss', () => fetchFromRss(channel, config, limit, options)]);
  for (const [source, loader] of sources) {
    try {
      const entries = await loader();
      return { channel, entries, source, degraded: false, attempts };
    } catch (error) {
      attempts.push({ source, category: classifyError(error), message: error.message });
    }
  }
  const cached = cacheEntries(channel, state, limit);
  if (cached.length) return { channel, entries: cached, source: 'state-cache', degraded: true, attempts };
  const detail = attempts.map((attempt) => `${attempt.source}: ${attempt.message}`).join(' | ');
  throw new Error(`${channel.name}: fallaron todas las fuentes. ${detail}`);
}

function updateState(state, results) {
  const next = { version: 1, channels: { ...(state.channels || {}) } };
  for (const result of results) {
    if (result.degraded) continue;
    const current = next.channels[result.channel.name];
    const currentEntries = JSON.stringify(current && current.entries || []);
    const nextEntries = JSON.stringify(result.entries);
    next.channels[result.channel.name] = current && currentEntries === nextEntries
      ? current
      : { lastValidAt: new Date().toISOString(), entries: result.entries };
  }
  return next;
}

function writeAtomically(filePath, content) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function writeSummary(summary) {
  const output = JSON.stringify(summary, null, 2);
  console.log(output);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = ['## YouTube synchronization', '', '| Canal | Fuente | Videos | Estado |', '| --- | --- | ---: | --- |'];
    for (const result of summary.results) lines.push(`| ${result.name} | ${result.source} | ${result.count} | ${result.degraded ? 'degradado (caché)' : 'correcto'} |`);
    if (summary.errors.length) lines.push('', '**Errores:**', ...summary.errors.map((error) => `- ${error}`));
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
  }
}

function help() {
  console.log('Uso: node src/js/update-youtube-sections.js [--dry-run] [--offline] [--force] [--channel NAME] [--limit N]');
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) return help();
  const config = loadConfig();
  const selected = args.channel ? config.channels.filter((channel) => channel.name.toLowerCase() === args.channel.toLowerCase()) : config.channels;
  if (!selected.length) throw new Error(`No existe el canal configurado: ${args.channel}`);
  const state = readState();
  const readmeBefore = fs.readFileSync(README_PATH, 'utf8');
  const results = [];
  const errors = [];
  for (const channel of selected) {
    try {
      results.push(await fetchChannel(channel, { requestTimeoutMs: config.requestTimeoutMs, retries: config.retries }, state, {
        limit: args.limit || config.maxResults,
        offline: args.offline,
      }));
    } catch (error) {
      errors.push(`${channel.name} [${classifyError(error)}]: ${error.message}`);
    }
  }
  let readmeAfter = readmeBefore;
  for (const result of results) readmeAfter = replaceSection(readmeAfter, result.channel, result.entries);
  const stateAfter = updateState(state, results);
  const stateText = `${JSON.stringify(stateAfter, null, 2)}\n`;
  const summary = { changed: args.force || hash(readmeBefore) !== hash(readmeAfter), dryRun: args.dryRun, results: results.map(({ channel, entries, source, degraded }) => ({ name: channel.name, count: entries.length, source, degraded })), errors };
  writeSummary(summary);
  if (!args.dryRun && (summary.changed || args.force)) writeAtomically(README_PATH, `${readmeAfter.trimEnd()}\n`);
  if (!args.dryRun && results.some((result) => !result.degraded)) writeAtomically(STATE_PATH, stateText);
  if (errors.length && results.length === 0) throw new Error(errors.join('\n'));
  if (errors.length) process.exitCode = 1;
  return summary;
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = {
  classifyError,
  escapeHtml,
  fetchWithRetry,
  normalizeEntry,
  parseArgs,
  parseChannelPage,
  parseEntries,
  renderVideoGrid,
  replaceSection,
  uniqueEntries,
};
