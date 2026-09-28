const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCES = ['README.md', 'index.html', 'projects.html', 'experience.html', 'certifications.html'];
const URL_PATTERN = /(?:href|src)=["']([^"']+)["']|\[[^\]]+\]\(([^)]+)\)/gi;
const args = new Set(process.argv.slice(2));
const external = args.has('--external');
const timeoutMs = 10000;

function localTarget(source, value) {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || /^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(clean)) return null;
  return path.normalize(path.join(ROOT, path.dirname(source), clean));
}

async function request(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'jersonmartinez-link-audit/1.0' } });
      if (response.ok || response.status === 405) return response.status;
      if (response.status < 500 && response.status !== 429) return response.status;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    finally { clearTimeout(timer); }
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  throw lastError || new Error('request failed');
}

async function main() {
  const failures = [];
  const checked = [];
  for (const source of SOURCES) {
    const content = fs.readFileSync(path.join(ROOT, source), 'utf8');
    for (const match of content.matchAll(URL_PATTERN)) {
      const value = match[1] || match[2];
      if (!value || value.startsWith('#')) continue;
      const internal = localTarget(source, value);
      if (internal) {
        checked.push({ source, target: value, kind: 'internal' });
        if (!fs.existsSync(internal)) failures.push(`${source}: recurso interno inexistente ${value}`);
      } else if (external && /^https?:\/\//i.test(value)) {
        try {
          const status = await request(value);
          checked.push({ source, target: value, kind: 'external', status });
          if (status >= 400) failures.push(`${source}: ${value} respondió HTTP ${status}`);
        } catch (error) { failures.push(`${source}: ${value} no respondió (${error.message})`); }
      }
    }
  }
  const report = { generatedAt: new Date().toISOString(), external, checked, failures };
  const reportPath = process.env.LINK_REPORT_PATH || path.join(ROOT, 'link-report.json');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Auditoría de enlaces: ${checked.length} referencias revisadas, ${failures.length} fallos.`);
  if (failures.length) { console.error(failures.map((failure) => `- ${failure}`).join('\n')); process.exitCode = 1; }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
