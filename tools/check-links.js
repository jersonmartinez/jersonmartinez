#!/usr/bin/env node
'use strict';

// Auditor de enlaces del portfolio.
//
// Modo por defecto (local): recorre las fuentes (dist/ si existe, si no las
// páginas .astro + README) y verifica que cada recurso INTERNO referenciado
// exista en disco. No hace peticiones de red.
//
// Modo --external: además de lo anterior, resuelve cada enlace http(s) con una
// petición real (HEAD y, si hace falta, GET), siguiendo redirecciones, con
// timeout y reintentos, y clasifica cada URL en:
//   - ok            2xx/3xx final alcanzable.
//   - broken        4xx (salvo los códigos anti-bot conocidos) o 5xx estable.
//   - blocked       respuesta típica de protección anti-bot (401/403/405/429
//                   o host documentado como anti-bot). No es un fallo del sitio:
//                   la URL existe pero el proveedor rechaza clientes automáticos.
//   - unverifiable  no se pudo determinar (DNS/TLS/timeout/red) tras reintentos.
//
// Sólo las URLs `broken` hacen fallar la auditoría. `blocked` y `unverifiable`
// se reportan como advertencias con su motivo, para no romper CI por causas
// ajenas al portfolio (ver EXTERNAL_STRICT para endurecer).

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'dist');

const EXTERNAL = process.argv.includes('--external');
// En modo estricto, también `unverifiable` cuenta como fallo (útil en una
// corrida manual con red estable). Por defecto NO, para no romper CI por
// cortes de red transitorios.
const STRICT = process.env.EXTERNAL_STRICT === '1';

const TIMEOUT_MS = Number(process.env.LINK_TIMEOUT_MS || 12000);
const RETRIES = Number(process.env.LINK_RETRIES || 2); // reintentos adicionales
const RETRY_BASE_MS = Number(process.env.LINK_RETRY_BASE_MS || 500);
const CONCURRENCY = Number(process.env.LINK_CONCURRENCY || 6);
const USER_AGENT =
  process.env.LINK_USER_AGENT ||
  'Mozilla/5.0 (compatible; jersonmartinez-portfolio-linkcheck/1.0; +https://www.jersonmartinez.com)';

// Hosts que sirven detrás de protección anti-bot o que requieren navegador real
// y que, por diseño, responden 403/405/429 a clientes automáticos aunque la URL
// sea correcta. Se clasifican como `blocked` (no `broken`) y se documenta aquí
// el motivo para que la excepción sea explícita y auditable.
const ANTIBOT_HOSTS = new Map([
  ['www.udemy.com', 'Udemy aplica protección anti-bot (Cloudflare) y rechaza HEAD/GET automatizados.'],
  ['udemy.com', 'Udemy aplica protección anti-bot (Cloudflare) y rechaza HEAD/GET automatizados.'],
  ['www.linkedin.com', 'LinkedIn exige navegador/sesión y devuelve 999/403 a clientes automáticos.'],
  ['linkedin.com', 'LinkedIn exige navegador/sesión y devuelve 999/403 a clientes automáticos.'],
  ['www.credly.com', 'Credly protege sus páginas de insignias frente a scraping automatizado.'],
  ['credly.com', 'Credly protege sus páginas de insignias frente a scraping automatizado.'],
  ['cp.certmetrics.com', 'CertMetrics (AWS) requiere sesión y rechaza peticiones automatizadas.'],
  ['api.whatsapp.com', 'Endpoint de borde de WhatsApp; redirector gestionado por el proveedor.'],
  ['wa.me', 'Redirector corto de WhatsApp gestionado por el proveedor.'],
]);

// Códigos HTTP que, en la práctica, significan "existe pero bloquea bots".
const BLOCKED_STATUS = new Set([401, 403, 405, 429, 999]);

// --- Recolección de URLs -----------------------------------------------------

const BUILD_SOURCES = [
  'dist/index.html',
  'dist/projects.html/index.html',
  'dist/experience.html/index.html',
  'dist/certifications.html/index.html',
  'dist/courses.html/index.html',
  'dist/about.html/index.html',
  // Rutas inglesas: sus enlaces internos son DISTINTOS (llevan el prefijo /en),
  // así que un prefijo mal construido sólo se ve auditando estas páginas.
  'dist/en/index.html',
  'dist/en/projects.html/index.html',
  'dist/en/experience.html/index.html',
  'dist/en/certifications.html/index.html',
  'dist/en/courses.html/index.html',
  'dist/en/about.html/index.html',
  'dist/404.html',
];
const haveCompleteBuild = BUILD_SOURCES.every((source) => fs.existsSync(path.join(ROOT, source)));
const sources = haveCompleteBuild
  ? [...BUILD_SOURCES, 'README.md']
  : [
      'README.md',
      'src/pages/index.astro',
      'src/pages/projects.html.astro',
      'src/pages/experience.html.astro',
      'src/pages/certifications.html.astro',
      'src/pages/courses.html.astro',
      'src/pages/about.html.astro',
      'src/pages/404.astro',
      'src/data/portfolio.js',
      'src/layouts/BaseLayout.astro',
      'src/components/SiteHeader.astro',
    ];

const URL_PATTERN = /(?:href|src)=["']([^"']+)["']|\[[^\]]+\]\(([^)]+)\)/gi;

function resolveLocal(source, value) {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || /^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(clean)) return null;
  if (source === 'README.md') return path.normalize(path.join(ROOT, clean));
  if (clean.startsWith('/')) {
    if (haveCompleteBuild) {
      const built = path.join(BUILD, clean);
      if (fs.existsSync(built)) return built;
      if (fs.existsSync(`${built}/index.html`)) return `${built}/index.html`;
      if (clean === '/') return path.join(BUILD, 'index.html');
      return built;
    }
    const publicAsset = path.join(ROOT, 'public', clean.slice(1));
    if (fs.existsSync(publicAsset)) return publicAsset;
    if (clean === '/') return path.join(ROOT, 'src/pages/index.astro');
    const pageName = clean.replace(/^\//, '').replace(/\/$/, '');
    const pageSource = path.join(ROOT, 'src/pages', `${pageName}.astro`);
    return pageSource;
  }
  const raw = path.join(ROOT, path.dirname(source), clean);
  if (fs.existsSync(raw)) return raw;
  if (fs.existsSync(`${raw}/index.html`)) return `${raw}/index.html`;
  return raw;
}

const localFailures = [];
const externalUrls = new Set();
let localChecked = 0;

for (const source of sources) {
  const file = path.join(ROOT, source);
  if (!fs.existsSync(file)) {
    localFailures.push(`${source}: fuente ausente`);
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(URL_PATTERN)) {
    const value = (match[1] || match[2] || '').trim();
    if (!value || value.startsWith('#')) continue;
    if (/^https?:\/\//i.test(value)) {
      const normalized = value.replace(/[),.;]+$/, '');
      try {
        const parsed = new URL(normalized);
        if (parsed.hostname === 'www.jersonmartinez.com' && parsed.pathname === '/404.html') continue;
        externalUrls.add(normalized);
      } catch {
        localFailures.push(`${source}: URL malformada ${value}`);
      }
      continue;
    }
    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    const local = resolveLocal(source, value);
    if (!local) continue;
    localChecked += 1;
    if (!fs.existsSync(local)) localFailures.push(`${source}: recurso interno inexistente ${value}`);
  }
}

// --- Verificación externa ----------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOnce(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });
    return { status: response.status, finalUrl: response.url || url };
  } finally {
    clearTimeout(timer);
  }
}

// Clasifica una URL individual con reintentos. HEAD primero; si el servidor no
// soporta HEAD (405/501) o responde raro, reintenta con GET.
async function classifyUrl(url) {
  const host = new URL(url).hostname;
  const antibotReason = ANTIBOT_HOSTS.get(host);

  let lastError = null;
  let lastStatus = null;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    if (attempt > 0) await sleep(RETRY_BASE_MS * attempt);
    for (const method of ['HEAD', 'GET']) {
      try {
        const { status, finalUrl } = await requestOnce(url, method);
        lastStatus = status;
        if (status >= 200 && status < 400) {
          return { url, state: 'ok', status, finalUrl };
        }
        if (BLOCKED_STATUS.has(status)) {
          return {
            url,
            state: 'blocked',
            status,
            reason: antibotReason || `El servidor respondió ${status} a clientes automáticos.`,
          };
        }
        if (status === 404 || status === 410) {
          if (method === 'HEAD') continue;
          if (antibotReason) return { url, state: 'blocked', status, reason: antibotReason };
          return { url, state: 'broken', status };
        }
        if (status === 501 && method === 'HEAD') continue; // reintenta con GET
        // Otros 4xx/5xx: intenta GET; si ya es GET, cae a reintento/outer loop.
        if (method === 'HEAD') continue;
      } catch (error) {
        lastError = error;
        // Error de red/TLS/timeout: prueba el otro método y luego reintenta.
      }
    }
  }

  if (antibotReason) {
    return { url, state: 'blocked', status: lastStatus, reason: antibotReason };
  }
  if (lastStatus && lastStatus >= 500) {
    return { url, state: 'broken', status: lastStatus };
  }
  return {
    url,
    state: 'unverifiable',
    status: lastStatus,
    reason: lastError ? lastError.message : `respuesta no concluyente (status ${lastStatus})`,
  };
}

// Ejecuta classifyUrl con una ventana de concurrencia fija.
async function classifyAll(urls) {
  const queue = [...urls];
  const results = [];
  async function worker() {
    while (queue.length) {
      const url = queue.shift();
      results.push(await classifyUrl(url));
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
  return results;
}

// --- Orquestación ------------------------------------------------------------

(async () => {
  const report = {
    generatedAt: new Date().toISOString(),
    mode: EXTERNAL ? 'external' : 'local',
    local: { checked: localChecked, failures: localFailures },
    external: null,
  };

  let externalResults = [];
  if (EXTERNAL) {
    externalResults = await classifyAll(externalUrls);
    const summary = { ok: [], broken: [], blocked: [], unverifiable: [] };
    for (const result of externalResults) summary[result.state].push(result);
    report.external = {
      total: externalResults.length,
      ok: summary.ok.length,
      broken: summary.broken.map((r) => ({ url: r.url, status: r.status })),
      blocked: summary.blocked.map((r) => ({ url: r.url, status: r.status, reason: r.reason })),
      unverifiable: summary.unverifiable.map((r) => ({ url: r.url, status: r.status, reason: r.reason })),
    };
  }

  fs.writeFileSync(
    process.env.LINK_REPORT_PATH || path.join(ROOT, 'link-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  // Salida legible.
  console.log(`Auditoría local: ${localChecked} referencias internas revisadas, ${localFailures.length} fallos.`);
  if (localFailures.length) console.error(localFailures.map((item) => `- ${item}`).join('\n'));

  const hardFailures = [...localFailures];

  if (EXTERNAL && report.external) {
    const { total, ok, broken, blocked, unverifiable } = report.external;
    console.log(
      `Auditoría externa: ${total} URLs — ok ${ok}, broken ${broken.length}, blocked ${blocked.length}, unverifiable ${unverifiable.length}.`,
    );
    if (blocked.length) {
      console.log('Enlaces bloqueados por proveedor (no es fallo del sitio):');
      console.log(blocked.map((r) => `  · ${r.url} [${r.status ?? '—'}] — ${r.reason}`).join('\n'));
    }
    if (unverifiable.length) {
      console.log('Enlaces no verificables (red/TLS/timeout):');
      console.log(unverifiable.map((r) => `  · ${r.url} [${r.status ?? '—'}] — ${r.reason}`).join('\n'));
    }
    if (broken.length) {
      console.error('Enlaces rotos (fallo real):');
      console.error(broken.map((r) => `  · ${r.url} [${r.status}]`).join('\n'));
      hardFailures.push(...broken.map((r) => `enlace roto ${r.url} [${r.status}]`));
    }
    if (STRICT && unverifiable.length) {
      hardFailures.push(...unverifiable.map((r) => `no verificable (strict) ${r.url}`));
    }
  }

  if (hardFailures.length) {
    process.exitCode = 1;
  } else {
    console.log('Sin enlaces rotos.');
  }
})().catch((error) => {
  console.error(`Auditoría de enlaces: error inesperado: ${error.message}`);
  process.exitCode = 1;
});
