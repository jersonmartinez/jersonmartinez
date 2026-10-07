#!/usr/bin/env node
'use strict';

// Auditoría TLS.
//
// Separa explícitamente los certificados PROPIOS (dominios que el portfolio
// controla y cuya renovación es su responsabilidad) de los de PROVEEDORES
// EXTERNOS (GitHub, Udemy, WhatsApp, etc.), cuyos certificados de borde pueden
// rotar dentro del umbral sin que el portfolio pueda hacer nada.
//
// Sólo los dominios PROPIOS hacen fallar la auditoría si están por debajo del
// umbral. Los externos se informan como contexto (no bloquean), y los hosts de
// vida corta gestionados por terceros (WhatsApp) se listan aparte con su motivo.

const fs = require('node:fs');
const path = require('node:path');
const tls = require('node:tls');

const root = path.resolve(__dirname, '..');
const buildSources = [
  'dist/index.html',
  'dist/projects.html/index.html',
  'dist/experience.html/index.html',
  'dist/certifications.html/index.html',
  'dist/courses.html/index.html',
  'dist/about.html/index.html',
];
const sourceFallback = [
  'README.md',
  'src/data/portfolio.ts',
  'src/layouts/BaseLayout.astro',
  'src/pages/index.astro',
  'src/pages/projects.html.astro',
  'src/pages/experience.html.astro',
  'src/pages/certifications.html.astro',
  'src/pages/courses.html.astro',
  'src/pages/about.html.astro',
];
const sources = buildSources.every((file) => fs.existsSync(path.join(root, file))) ? buildSources : sourceFallback;

const urls = new Set();
const pattern = /https:\/\/[^\s"'<>)]*/gi;
for (const source of sources) {
  const text = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of text.matchAll(pattern)) urls.add(match[0].replace(/[),.;]+$/, ''));
}

const thresholdDays = Number(process.env.TLS_MIN_DAYS || 30);

// Dominios PROPIOS: su certificado es responsabilidad del portfolio.
const OWN_HOSTS = new Set(['www.jersonmartinez.com', 'jersonmartinez.com']);

// Hosts de borde gestionados por terceros con certificados de vida corta que el
// portfolio no puede renovar. Se listan aparte y nunca bloquean.
const PROVIDER_SHORT_LIVED = new Map([
  ['api.whatsapp.com', 'Endpoint de borde de WhatsApp; certificado rotado por el proveedor.'],
  ['wa.me', 'Redirector corto de WhatsApp; certificado gestionado por el proveedor.'],
]);

/**
 * Lee la fecha de caducidad del certificado de un host.
 *
 * El handshake se completa SIN abortar por un certificado inválido a propósito:
 * el propósito de esta herramienta es avisar de un certificado que está por
 * caducar o que ya caducó, y con `rejectUnauthorized: true` el handshake
 * fallaría justo en el caso que hay que informar, dejando a la herramienta
 * ciega. CodeQL lo señala (js/disabling-certificate-validation) y hace bien en
 * señalarlo, así que la validación no se descarta: se hace EXPLÍCITA. Se lee
 * `socket.authorized` y se devuelve junto a la fecha, de modo que una cadena no
 * confiable es un hallazgo que se reporta en vez de un silencio. Esto no
 * establece ninguna sesión ni transmite nada: sólo lee el certificado y cierra.
 */
function checkHost(host) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      // lgtm[js/disabling-certificate-validation] — ver el bloque de arriba: un
      // monitor de caducidad debe poder leer un certificado ya inválido, y el
      // resultado de la verificación se reporta en `authorized`.
      { host, port: 443, servername: host, rejectUnauthorized: false, timeout: 10000 },
      () => {
        try {
          const certificate = socket.getPeerCertificate();
          const authorized = socket.authorized;
          const authorizationError = socket.authorizationError
            ? String(socket.authorizationError.message || socket.authorizationError)
            : null;
          socket.end();
          if (!certificate.valid_to) return reject(new Error('no se pudo leer valid_to'));
          const remainingDays = (new Date(certificate.valid_to).getTime() - Date.now()) / 86400000;
          resolve({ host, validTo: certificate.valid_to, remainingDays, authorized, authorizationError });
        } catch (error) {
          reject(error);
        }
      },
    );
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('timeout'));
    });
    socket.on('error', reject);
  });
}

(async () => {
  const hosts = [...new Set([...urls].map((url) => new URL(url).hostname))].filter((host) => host !== 'localhost');

  const ownHosts = hosts.filter((h) => OWN_HOSTS.has(h));
  const providerShortLived = hosts.filter((h) => PROVIDER_SHORT_LIVED.has(h));
  const externalHosts = hosts.filter((h) => !OWN_HOSTS.has(h) && !PROVIDER_SHORT_LIVED.has(h));

  const ownFailures = [];

  console.log(`== Certificados PROPIOS (umbral ${thresholdDays} días) ==`);
  for (const host of ownHosts) {
    try {
      const result = await checkHost(host);
      const chain = result.authorized ? '' : `  ⚠ cadena no confiable (${result.authorizationError})`;
      console.log(`  ${host}: ${result.remainingDays.toFixed(0)} días (expira ${result.validTo})${chain}`);
      if (result.remainingDays < thresholdDays) {
        ownFailures.push(`${host}: certificado propio expira en ${result.remainingDays.toFixed(0)} días`);
      }
      // Un host propio con cadena no verificable es un fallo duro: la lectura se
      // hace sin abortar el handshake, así que este es el punto donde se juzga.
      if (!result.authorized) {
        ownFailures.push(`${host}: cadena de certificado no confiable (${result.authorizationError})`);
      }
    } catch (error) {
      ownFailures.push(`${host}: ${error.message}`);
    }
  }
  if (!ownHosts.length) console.log('  (no se detectaron hosts propios en las fuentes)');

  console.log('== Certificados de PROVEEDORES externos (informativo, no bloquea) ==');
  for (const host of externalHosts) {
    try {
      const result = await checkHost(host);
      const warn = result.remainingDays < thresholdDays ? '  ⚠ por debajo del umbral (gestionado por el proveedor)' : '';
      const chain = result.authorized ? '' : `  ⚠ cadena no confiable (${result.authorizationError})`;
      console.log(`  ${host}: ${result.remainingDays.toFixed(0)} días (expira ${result.validTo})${warn}${chain}`);
    } catch (error) {
      console.log(`  ${host}: no verificable (${error.message}) — gestionado por el proveedor`);
    }
  }

  if (providerShortLived.length) {
    console.log('== Hosts de borde de vida corta (excluidos por diseño) ==');
    for (const host of providerShortLived) {
      console.log(`  ${host}: ${PROVIDER_SHORT_LIVED.get(host)}`);
    }
  }

  if (ownFailures.length) {
    console.error('Fallo de certificados PROPIOS:');
    console.error(ownFailures.map((failure) => `- ${failure}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Auditoría TLS: certificados propios dentro del umbral.');
  }
})();
