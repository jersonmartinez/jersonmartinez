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
 * Lee la fecha de caducidad del certificado de un host, CON validación.
 *
 * La versión anterior pasaba `rejectUnauthorized: false` para poder leer un
 * certificado ya inválido, razonando que ése es justo el caso a informar. Pero
 * desactivar la validación no hacía falta: cuando la cadena no verifica, el
 * handshake falla y el fallo ES el hallazgo — un monitor de caducidad no
 * necesita la fecha de un certificado que ya está roto, necesita decir que lo
 * está. Así que se valida, y la ruta de error clasifica el motivo (caducado,
 * cadena no verificable, nombre que no corresponde) y lo devuelve.
 *
 * Esto cierra js/disabling-certificate-validation arreglando el diseño en vez
 * de silenciar la alerta, y deja la herramienta MÁS estricta: antes una cadena
 * no confiable en un host propio pasaba inadvertida mientras quedaran días.
 */
function checkHost(host) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port: 443, servername: host, timeout: 10000 },
      () => {
        try {
          const certificate = socket.getPeerCertificate();
          socket.end();
          if (!certificate.valid_to) return reject(new Error('no se pudo leer valid_to'));
          const remainingDays = (new Date(certificate.valid_to).getTime() - Date.now()) / 86400000;
          resolve({ host, validTo: certificate.valid_to, remainingDays });
        } catch (error) {
          reject(error);
        }
      },
    );
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('timeout'));
    });
    // Si la cadena no verifica, el handshake falla aquí. El código de error ES
    // el hallazgo (CERT_HAS_EXPIRED, UNABLE_TO_VERIFY_LEAF_SIGNATURE,
    // ERR_TLS_CERT_ALTNAME_INVALID…), así que se nombra en vez de propagarse
    // como un error de red indistinguible de un host caído.
    socket.on('error', (error) => {
      const code = error.code || error.reason || 'error de TLS';
      reject(new Error(`certificado no válido o inalcanzable (${code})`));
    });
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
      // La validación la hizo el handshake: llegar aquí significa cadena
      // confiable, nombre correcto y certificado vigente.
      const result = await checkHost(host);
      console.log(`  ${host}: ${result.remainingDays.toFixed(0)} días (expira ${result.validTo})`);
      if (result.remainingDays < thresholdDays) {
        ownFailures.push(`${host}: certificado propio expira en ${result.remainingDays.toFixed(0)} días`);
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
      console.log(`  ${host}: ${result.remainingDays.toFixed(0)} días (expira ${result.validTo})${warn}`);
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
