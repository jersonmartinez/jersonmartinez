#!/usr/bin/env node
/** Revisión del tema claro: activa data-theme='light' y captura/mide superficies críticas. */
const { chromium } = require('@playwright/test');

const run = async () => {
  const base = process.argv[2] || 'http://127.0.0.1:4321';
  const out = process.argv[3] || '/work/visual-light';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const [name, route] of [['home', '/'], ['certifications', '/certifications.html'], ['courses', '/courses.html']]) {
    await page.goto(base + route, { waitUntil: 'load' });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/${name}-light.png` });
  }

  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(200);
  const info = await page.evaluate(() => {
    const read = (sel, prop) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el)[prop] : null;
    };
    const themeColorMeta = [...document.querySelectorAll('meta[name="theme-color"]')]
      .map((m) => `${m.getAttribute('media') || 'no-media'}=${m.content}`);
    return {
      bodyBg: read('body', 'backgroundColor'),
      logoSrc: document.querySelector('.brand img')?.getAttribute('src'),
      bodyOverlayGradient: getComputedStyle(document.body, '::before').backgroundImage.slice(0, 120),
      heroGridColor: getComputedStyle(document.querySelector('.hero'), '::before').backgroundImage.slice(0, 90),
      profilePanelBg: read('.profile-panel', 'backgroundColor'),
      certLogoBg: null,
      themeColorMeta,
      statusDotShadow: read('.status-dot', 'boxShadow'),
      heroFactsBorder: read('.hero-facts', 'borderTopColor'),
      buttonBg: read('.button', 'backgroundColor'),
      buttonColor: read('.button', 'color'),
    };
  });
  await ctx.close();
  await browser.close();
  console.log(JSON.stringify(info, null, 2));
};

run().catch((e) => { console.error(e); process.exit(1); });
