const fs = require('node:fs');
const path = require('node:path');

const README_PATH = path.resolve(__dirname, '../../README.md');
const MAX_RESULTS = 6;

const channels = [
  {
    name: 'DevOpsea',
    id: 'UCHQb90WIYhLUObEc8uVJR6A',
    handle: '@DevOpsea',
    start: '<!-- DEVOPSEA-YOUTUBE-VIDEOS-LIST-BEGIN -->',
    end: '<!-- DEVOPSEA-YOUTUBE-VIDEOS-LIST-END -->',
  },
  {
    name: 'Side Master',
    id: 'UC-_To7b_NPrxvgG-_de5HRA',
    handle: '@SideMaster',
    start: '<!-- SIDEMASTER-YOUTUBE-VIDEOS-LIST-BEGIN -->',
    end: '<!-- SIDEMASTER-YOUTUBE-VIDEOS-LIST-END -->',
  },
];

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTagValue(entry, tagName) {
  const match = entry.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`));
  return match ? decodeXml(match[1]).trim() : '';
}

function parseEntries(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, entry]) => ({
      id: getTagValue(entry, 'yt:videoId'),
      title: getTagValue(entry, 'title'),
      published: getTagValue(entry, 'published'),
    }))
    .filter(({ id, title }) => id && title)
    .slice(0, MAX_RESULTS);
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}

function renderVideoGrid(entries) {
  if (entries.length === 0) {
    return '<p><em>No hay videos disponibles en este momento.</em></p>';
  }

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

async function fetchFromChannelPage(channel) {
  const response = await fetch(`https://www.youtube.com/${channel.handle}/videos`, {
    headers: { 'user-agent': 'jersonmartinez-readme-updater/1.0' },
  });

  if (!response.ok) {
    throw new Error(`${channel.name}: la página del canal respondió con HTTP ${response.status}`);
  }

  const html = await response.text();
  const ids = [...html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})/g)]
    .map(([, id]) => id)
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, MAX_RESULTS);

  const entries = await Promise.all(ids.map(async (id) => {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`;
    const oEmbedResponse = await fetch(oEmbedUrl);
    if (!oEmbedResponse.ok) return null;

    const metadata = await oEmbedResponse.json();
    return { id, title: metadata.title, published: '' };
  }));

  return entries.filter(Boolean);
}

async function fetchChannel(channel) {
  try {
    const entries = await fetchFromChannelPage(channel);
    if (entries.length === 0) {
      throw new Error('la página del canal no contiene videos reconocibles');
    }

    return { ...channel, entries };
  } catch (pageError) {
    try {
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      const response = await fetch(url, {
        headers: { 'user-agent': 'jersonmartinez-readme-updater/1.0' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const entries = parseEntries(await response.text());
      if (entries.length === 0) {
        throw new Error('el feed no contiene videos reconocibles');
      }

      console.warn(`${channel.name}: se utilizó RSS como respaldo de la página del canal.`);
      return { ...channel, entries };
    } catch (rssError) {
      throw new Error(`${channel.name}: falló la página (${pageError.message}) y también RSS (${rssError.message})`);
    }
  }
}

function replaceSection(readme, channel) {
  const sectionPattern = new RegExp(
    `(${escapeRegExp(channel.start)}\\s*)([\\s\\S]*?)(\\s*${escapeRegExp(channel.end)})`,
  );

  if (!sectionPattern.test(readme)) {
    throw new Error(`${channel.name}: no se encontraron los marcadores del README`);
  }

  return readme.replace(sectionPattern, `$1${renderVideoGrid(channel.entries)}$3`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  const results = await Promise.all(channels.map(fetchChannel));
  let readme = fs.readFileSync(README_PATH, 'utf8');

  for (const channel of results) {
    readme = replaceSection(readme, channel);
  }

  fs.writeFileSync(README_PATH, `${readme.trimEnd()}\n`);
  console.log(`README actualizado con ${results.map(({ name, entries }) => `${name}: ${entries.length}`).join(', ')}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
