#!/usr/bin/env node
const BASE_URL = new URL(process.env.PRODUCTION_BASE_URL || 'https://www.jersonmartinez.com');
const APEX_URL = new URL(process.env.PRODUCTION_APEX_URL || 'https://jersonmartinez.com');
const routes = [
  ['/', 'Plataformas cloud confiables'], ['/projects.html', 'Sistemas que muestran cómo convierto problemas'],
  ['/courses.html', 'Una ruta práctica para aprender desarrollo web con Go'], ['/certifications.html', 'Diez credenciales verificables'],
  ['/experience.html', 'Experiencia construyendo sistemas y equipos que escalan'], ['/about.html', 'Ingeniería que conecta personas, plataformas y resultados'],
];
const redirects = ['/projects', '/courses', '/certifications', '/experience', '/about'];
async function fetchPage(url, options = {}) { return fetch(url, { redirect: 'follow', headers: { 'user-agent': 'jersonmartinez-portfolio-production-smoke/2.0', accept: 'text/html' }, ...options }); }
function expectedCanonical(route) { return new URL(route, BASE_URL).href; }
async function main() {
  const failures = [];
  const apex = await fetchPage(APEX_URL, { redirect: 'manual' });
  const location = apex.headers.get('location') || '';
  if (![301, 302, 307, 308].includes(apex.status) || !location.includes(BASE_URL.host)) failures.push(`dominio raíz: status=${apex.status}, location=${location || '(vacío)'}`);
  for (const [route, marker] of routes) {
    const response = await fetchPage(new URL(route, BASE_URL));
    const html = await response.text();
    if (!response.ok) failures.push(`${route}: HTTP ${response.status}`);
    if (!/text\/html/i.test(response.headers.get('content-type') || '')) failures.push(`${route}: content-type no HTML`);
    if (!html.includes(marker)) failures.push(`${route}: falta contenido principal`);
    if (!html.includes(`<link rel="canonical" href="${expectedCanonical(route)}"`)) failures.push(`${route}: canonical inesperado`);
    for (const meta of ['property="og:image"', 'name="twitter:card"', 'application/ld+json']) if (!html.includes(meta)) failures.push(`${route}: falta ${meta}`);
  }
  for (const route of redirects) {
    const response = await fetchPage(new URL(route, BASE_URL), { redirect: 'manual' });
    if (![301, 302, 307, 308].includes(response.status)) failures.push(`${route}: se esperaba redirect, status=${response.status}`);
  }
  const home = await fetchPage(BASE_URL);
  for (const header of ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy']) if (!home.headers.get(header)) failures.push(`producción: falta ${header}`);
  const missing = await fetchPage(new URL('/ruta-inexistente-smoke', BASE_URL));
  if (missing.status !== 404) failures.push(`404: status inesperado ${missing.status}`);
  if (failures.length) { console.error(failures.map((failure) => `- ${failure}`).join('\n')); process.exitCode = 1; return; }
  console.log(`Production smoke OK: ${routes.length} rutas, ${redirects.length} redirects, metadata, 404 y cabeceras.`);
}
main().catch((error) => { console.error(`Production smoke error: ${error.message}`); process.exitCode = 1; });
module.exports = { expectedCanonical, routes, redirects };
