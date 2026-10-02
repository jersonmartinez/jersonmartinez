#!/usr/bin/env node
/**
 * Instantánea de estilos COMPUTADOS de los elementos clave, por ruta y tema.
 * Sirve para demostrar que una refactorización a tokens no altera el render oscuro
 * publicado: se compara el JSON antes/después y cualquier diferencia debe ser intencional.
 *
 * Uso: node tools/style-snapshot.cjs <baseUrl> > snapshot.json
 */
const { chromium } = require('@playwright/test');

const ROUTES = ['/', '/projects.html', '/courses.html', '/certifications.html', '/experience.html', '/about.html'];

const SELECTORS = [
  'body', '.site-header', '.site-nav a', '.nav-contact', '.theme-toggle', '.command-open',
  '.button', '.button--ghost', '.card', '.card-label', '.card-link', '.skills-explorer',
  '.skills-panel', '.skill-tab', '.skill-list li', '.credential-badge', '.credential-code',
  '.credential-verify', '.cert-provider-logo', '.timeline-card', '.timeline-dot', '.logo-pill',
  '.profile-panel', '.profile-social', '.contact-panel', '.filter-button', '.page-hero',
  '.hero-facts', '.impact-item', '.course-card', '.course-summary', '.project-facts li',
  '.section-kicker', '.lede', 'h1', 'h2', 'h3', '.skip-link', '.footer-inner a',
];

const PROPS = [
  'backgroundColor', 'backgroundImage', 'color', 'borderTopColor', 'borderRightColor',
  'borderBottomColor', 'borderLeftColor', 'borderTopWidth', 'borderTopLeftRadius',
  'borderBottomRightRadius', 'boxShadow', 'fontSize', 'fontWeight', 'lineHeight',
  'paddingTop', 'paddingLeft', 'marginBottom', 'minHeight', 'transitionDuration',
  'transitionProperty', 'letterSpacing', 'outlineColor',
];

const run = async () => {
  const base = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
  const browser = await chromium.launch();
  const result = {};

  for (const theme of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      await page.goto(base + route, { waitUntil: 'load' });
      if (theme === 'light') {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        await page.waitForTimeout(160);
      }
      const snap = await page.evaluate(({ selectors, props }) => {
        const out = {};
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (!el) continue;
          const cs = getComputedStyle(el);
          const row = {};
          for (const p of props) row[p] = cs[p];
          out[sel] = row;
        }
        return out;
      }, { selectors: SELECTORS, props: PROPS });
      result[`${theme}${route}`] = snap;
    }
    await ctx.close();
  }

  await browser.close();
  process.stdout.write(JSON.stringify(result, null, 1));
};

run().catch((e) => { console.error(e); process.exit(1); });
