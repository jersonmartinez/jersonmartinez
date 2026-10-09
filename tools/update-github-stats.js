#!/usr/bin/env node
/* obtiene estadísticas públicas de GitHub y las guarda en data/github-state.json.
   Patrón de caché del repo (igual que youtube-state.json): un workflow programado ejecuta este
   script y commitea el estado; el BUILD lee el estado cacheado, nunca la red. Si la red falla,
   el estado previo se conserva (no se inventan cifras). Sin dependencias externas: usa fetch.

   Uso:  node tools/update-github-stats.js            (refresca el cache)
         node tools/update-github-stats.js --check    (sale 0 si el cache existe y es válido)
*/
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const STATE = path.join(ROOT, 'data/github-state.json');
const USER = 'jersonmartinez';

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return null; }
}

async function fetchJson(url) {
  const headers = { 'User-Agent': 'portfolio-build', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function refresh() {
  const previous = readState();
  try {
    const user = await fetchJson(`https://api.github.com/users/${USER}`);
    let stars = 0;
    let page = 1;
    let publicRepos = 0;
    for (;;) {
      const repos = await fetchJson(`https://api.github.com/users/${USER}/repos?per_page=100&page=${page}`);
      if (!Array.isArray(repos) || repos.length === 0) break;
      for (const repo of repos) { if (!repo.fork) { publicRepos += 1; stars += repo.stargazers_count || 0; } }
      if (repos.length < 100) break;
      page += 1;
    }
    // Los valores llegan de la API y se escriben en el cache que lee el build,
    // así que se COERCIONAN a entero finito y no negativo antes de persistirlos
    // (CodeQL js/http-to-file-access). Una respuesta malformada deja de poder
    // meter `null`, `NaN` o una cadena en el fichero de estado.
    const count = (value) => {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
    };
    const state = {
      version: 1,
      lastValidAt: new Date().toISOString(),
      user: USER,
      followers: count(user.followers),
      publicRepos: count(publicRepos),
      stars: count(stars),
    };
    fs.writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);
    console.log(`GitHub stats actualizadas: ${publicRepos} repos, ${stars} estrellas, ${user.followers} seguidores.`);
  } catch (error) {
    // Degradación: se conserva el estado previo si existe; si no, se deja sin tocar.
    console.warn(`No se pudo refrescar GitHub (${error.message}). Se conserva el cache previo.`);
    if (!previous) process.exitCode = 0; // no es error duro en build
  }
}

function check() {
  const state = readState();
  if (!state || typeof state.publicRepos !== 'number') { console.error('github-state.json ausente o inválido.'); process.exitCode = 1; return; }
  console.log('github-state.json válido.');
}

if (process.argv.includes('--check')) check(); else refresh();
