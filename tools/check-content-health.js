const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const state = JSON.parse(fs.readFileSync(path.join(root, 'data/youtube-state.json'), 'utf8'));
const maxAgeDays = Number(process.env.MAX_CONTENT_AGE_DAYS || 45);
const now = Date.now();
const failures = [];

for (const [name, channel] of Object.entries(state.channels || {})) {
  if (!channel.lastValidAt || Number.isNaN(new Date(channel.lastValidAt).getTime())) {
    failures.push(`${name}: no tiene lastValidAt válido`);
    continue;
  }
  const ageDays = (now - new Date(channel.lastValidAt).getTime()) / 86400000;
  if (ageDays > maxAgeDays) failures.push(`${name}: caché de ${ageDays.toFixed(1)} días (límite ${maxAgeDays})`);
  if (!Array.isArray(channel.entries) || channel.entries.length === 0) failures.push(`${name}: no tiene videos válidos en caché`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Content health OK: ${Object.keys(state.channels || {}).length} canales dentro de ${maxAgeDays} días.`);
}
