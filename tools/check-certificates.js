const fs = require('node:fs');
const path = require('node:path');
const tls = require('node:tls');

const root = path.resolve(__dirname, '..');
const buildSources = [
  'dist/index.html',
  'dist/projects.html/index.html',
  'dist/experience.html/index.html',
  'dist/certifications.html/index.html',
  'dist/courses.html/index.html'
];
const sourceFallback = [
  'README.md',
  'src/data/portfolio.js',
  'src/layouts/BaseLayout.astro',
  'src/pages/index.astro',
  'src/pages/projects.html.astro',
  'src/pages/experience.html.astro',
  'src/pages/certifications.html.astro',
  'src/pages/courses.html.astro'
];
const sources = buildSources.every((file) => fs.existsSync(path.join(root, file))) ? buildSources : sourceFallback;
const urls = new Set();
const pattern = /https:\/\/[^\s"'<>)]*/gi;
for (const source of sources) {
  const text = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of text.matchAll(pattern)) urls.add(match[0].replace(/[),.;]+$/, ''));
}

const thresholdDays = Number(process.env.TLS_MIN_DAYS || 30);
function checkHost(host) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: 10000 }, () => {
      try {
        const certificate = socket.getPeerCertificate();
        socket.end();
        if (!certificate.valid_to) return reject(new Error('no se pudo leer valid_to'));
        const remainingDays = (new Date(certificate.valid_to).getTime() - Date.now()) / 86400000;
        resolve({ host, validTo: certificate.valid_to, remainingDays });
      } catch (error) { reject(error); }
    });
    socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
    socket.on('error', reject);
  });
}

(async () => {
  const hosts = [...urls].map((url) => new URL(url).hostname).filter((host) => host !== 'localhost');
  const failures = [];
  for (const host of new Set(hosts)) {
    try {
      const result = await checkHost(host);
      console.log(`${result.host}: ${result.remainingDays.toFixed(0)} días restantes (expira ${result.validTo})`);
      if (result.remainingDays < thresholdDays) failures.push(`${host}: certificado expira en ${result.remainingDays.toFixed(0)} días`);
    } catch (error) { failures.push(`${host}: ${error.message}`); }
  }
  if (failures.length) { console.error(failures.map((failure) => `- ${failure}`).join('\n')); process.exitCode = 1; }
})();
