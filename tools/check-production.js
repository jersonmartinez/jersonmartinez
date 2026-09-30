#!/usr/bin/env node
const BASE_URL = new URL(process.env.PRODUCTION_BASE_URL || 'https://www.jersonmartinez.com');
const APEX_URL = new URL(process.env.PRODUCTION_APEX_URL || 'https://jersonmartinez.com');
const routes = [
  ['/', 'Ingeniero DevOps, SRE y DevSecOps'],
  ['/projects.html/', 'Una trayectoria contada como sistemas.'],
  ['/courses.html/', 'Una ruta visual para aprender Go.'],
  ['/certifications.html/', 'Aprender para operar mejor.'],
  ['/experience.html/', 'Experiencia construyendo sistemas y equipos que escalan.'],
  ['/about.html/', 'Ingeniería que conecta personas, plataformas y resultados.']
];

async function fetchPage(url, options = {}) {
  return fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'jersonmartinez-portfolio-production-smoke/1.0', accept: 'text/html' },
    ...options
  });
}

function expectedCanonical(route) {
  return new URL(route === '/' ? '/' : route.replace(/\/$/, ''), BASE_URL).href;
}

async function main() {
  const failures = [];
  const apex = await fetchPage(APEX_URL, { redirect: 'manual' });
  const location = apex.headers.get('location') || '';
  if (![301, 302, 307, 308].includes(apex.status) || !location.includes(BASE_URL.host)) {
    failures.push(`dominio raíz: se esperaba redirección a ${BASE_URL.host}, status=${apex.status}, location=${location || '(vacío)'}`);
  }

  for (const [route, marker] of routes) {
    const url = new URL(route, BASE_URL);
    const response = await fetchPage(url);
    const html = await response.text();
    if (!response.ok) failures.push(`${route}: HTTP ${response.status}`);
    if (!/text\/html/i.test(response.headers.get('content-type') || '')) failures.push(`${route}: content-type no HTML`);
    if (!html.includes('Jerson Martínez')) failures.push(`${route}: falta la marca`);
    if (!html.includes(marker)) failures.push(`${route}: falta el contenido principal esperado`);
    if (!html.includes(`<link rel="canonical" href="${expectedCanonical(route)}"`)) failures.push(`${route}: canonical inesperado`);
  }

  if (failures.length) {
    console.error(failures.map((failure) => `- ${failure}`).join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log(`Production smoke OK: ${routes.length} rutas, canonical y redirección raíz verificados en ${BASE_URL.origin}.`);
}

main().catch((error) => {
  console.error(`Production smoke error: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { expectedCanonical, routes };
