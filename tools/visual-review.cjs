#!/usr/bin/env node
/**
 * Revisión visual del dist servido: captura cada ruta por franjas del tamaño del viewport
 * (nunca una imagen de página completa, que puede superar el límite de 8000 px) y reporta
 * desbordamiento horizontal, errores de consola y particiones de texto en la navegación.
 *
 * Uso: node tools/visual-review.cjs <baseUrl> <outDir> [--widths 1440,1280,900,390]
 */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const ROUTES = [
  ['home', '/'],
  ['projects', '/projects.html'],
  ['courses', '/courses.html'],
  ['certifications', '/certifications.html'],
  ['experience', '/experience.html'],
  ['about', '/about.html'],
  ['guia-visual', '/guia-visual'],
  ['404', '/does-not-exist'],
];

async function main() {
  const baseUrl = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
  const outDir = process.argv[3] || 'visual';
  const widthArg = process.argv.find((a) => a.startsWith('--widths'));
  const widths = widthArg
    ? widthArg.split('=')[1].split(',').map(Number)
    : [1440, 1280, 900, 390];
  const maxSlices = Number(process.env.MAX_SLICES || 4);

  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const findings = [];

  for (const width of widths) {
    const height = width >= 900 ? 900 : 780;
    const context = await browser.newContext({ viewport: { width, height } });
    for (const [name, route] of ROUTES) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', (e) => consoleErrors.push(String(e)));
      await page.goto(baseUrl + route, { waitUntil: 'load' });
      await page.waitForTimeout(220);

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflowing = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > doc.clientWidth + 1 || r.left < -1);
          })
          .slice(0, 6)
          .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);
        // Etiquetas partidas en más de una línea. Se cuentan CAJAS DE LÍNEA reales con
        // Range.getClientRects() sobre los nodos de texto: la altura del elemento incluye
        // padding y daría falsos positivos en cualquier botón.
        const lineBoxes = (el) => {
          const rects = [];
          for (const node of el.childNodes) {
            if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const r of range.getClientRects()) {
              if (r.width > 0 && !rects.some((p) => Math.abs(p - r.top) < 2)) rects.push(r.top);
            }
          }
          return rects.length;
        };
        const wrapped = [...document.querySelectorAll('.site-nav a, .footer-links a, .button, .card-link, .credential-verify')]
          .filter((el) => lineBoxes(el) > 1)
          .map((el) => `${el.textContent.trim().slice(0, 30)}`);
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          scrollHeight: doc.scrollHeight,
          overflowing,
          wrapped,
        };
      });

      if (metrics.scrollWidth > metrics.clientWidth + 1) {
        findings.push(`[overflow] ${name} @${width}px scrollWidth=${metrics.scrollWidth} clientWidth=${metrics.clientWidth} :: ${metrics.overflowing.join(', ')}`);
      }
      if (metrics.wrapped.length) {
        findings.push(`[wrapped] ${name} @${width}px :: ${metrics.wrapped.join(' | ')}`);
      }
      if (consoleErrors.length) {
        findings.push(`[console] ${name} @${width}px :: ${consoleErrors.slice(0, 3).join(' // ')}`);
      }

      const slices = Math.min(maxSlices, Math.ceil(metrics.scrollHeight / height));
      for (let i = 0; i < slices; i += 1) {
        await page.evaluate((y) => window.scrollTo(0, y), i * height);
        await page.waitForTimeout(140);
        await page.screenshot({
          path: path.join(outDir, `${name}-${width}-${i}.png`),
        });
      }
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'findings.txt'), findings.join('\n') + '\n');
  console.log(findings.length ? findings.join('\n') : 'sin hallazgos automáticos');
}

main().catch((error) => { console.error(error); process.exit(1); });
