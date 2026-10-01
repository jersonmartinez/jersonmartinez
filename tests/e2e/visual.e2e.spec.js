const { test } = require('@playwright/test');

// comparación visual automática por PR. Captura screenshots viewport-only de las rutas
// y de estados clave (tema claro, paleta) como ARTEFACTOS del PR (se suben en e2e.yml). No se usa
// un gate de pixel-diff duro porque el render de fuentes varía entre entornos y lo volvería
// inestable; el artefacto permite la comparación visual humana en cada PR.

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:4321';
const routes = ['/', '/projects.html/', '/courses.html/', '/certifications.html/', '/experience.html/', '/about.html/'];

test.describe('Snapshots visuales (artefactos de PR)', () => {
  for (const route of routes) {
    test(`captura ${route}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      const shot = await page.screenshot();
      await testInfo.attach(`route${route.replace(/\//g, '_') || 'home'}`, { body: shot, contentType: 'image/png' });
    });
  }

  test('captura tema claro (home)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await testInfo.attach('home-light', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('captura móvil (home)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await testInfo.attach('home-mobile', { body: await page.screenshot(), contentType: 'image/png' });
  });
});
