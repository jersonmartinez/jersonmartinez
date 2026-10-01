const { test, expect } = require('@playwright/test');
const path = require('node:path');
const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:4321';
const routes = ['/', '/projects.html/', '/courses.html/', '/certifications.html/', '/experience.html/', '/about.html/'];

for (const route of routes) {
  test(`axe moderno no detecta violaciones en ${route}`, async ({ page }) => {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const result = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    }));
    const violations = result.violations.map(({ id, impact, help, nodes }) => ({
      id, impact, help, targets: nodes.map((node) => node.target),
    }));
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}
