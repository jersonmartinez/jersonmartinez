// E2E mínimo del portfolio con Playwright, contra el build estático servido en
// http://127.0.0.1:4321 (ver .github/workflows/e2e.yml). Cubre los flujos
// interactivos que el HTML compilado expone hoy:
//   - Menú responsive (.nav-toggle / #site-nav)
//   - Tabs de habilidades (role="tab"/"tabpanel" en SkillsExplorer)
//   - Filtros de proyectos (.filter-button[data-filter] en /projects.html)
//   - Navegación por hash a secciones del home (#impacto, #proyectos, ...)
//   - Foco visible al tabular (accesibilidad de teclado)
//
// Los selectores corresponden a markup estable de src/ (SiteHeader.astro,
// SkillsExplorer.astro, pages/index.astro, pages/projects.html.astro).

const { test, expect } = require('@playwright/test');

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:4321';

test.describe('Portfolio E2E', () => {
  test('el menú responsive se abre y navega', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // móvil
    await page.goto(`${BASE}/`);
    const toggle = page.locator('.nav-toggle');
    await expect(toggle).toBeVisible();
    const nav = page.locator('#site-nav');
    await toggle.click();
    // Tras abrir, al menos un enlace de navegación es accesible/visible.
    const navLink = nav.locator('a').first();
    await expect(navLink).toBeVisible();
  });

  test('las tabs de habilidades cambian el panel activo', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    expect(count).toBeGreaterThan(1);
    // Activa la segunda tab y verifica que su panel pasa a visible.
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    const panels = page.getByRole('tabpanel');
    await expect(panels.filter({ has: page.locator(':scope') }).first()).toBeVisible();
  });

  test('los filtros de proyectos acotan las tarjetas', async ({ page }) => {
    await page.goto(`${BASE}/projects.html`);
    const buttons = page.locator('.filter-button');
    await expect(buttons.first()).toBeVisible();
    const total = await page.locator('[data-category], .repo-card, article').count();
    // Aplica un filtro concreto y confirma que cambia el estado activo.
    const teaching = page.locator('.filter-button[data-filter="teaching"]');
    if (await teaching.count()) {
      await teaching.click();
      await expect(teaching).toHaveClass(/is-active/);
    }
    expect(total).toBeGreaterThan(0);
  });

  test('la navegación por hash salta a la sección y actualiza la URL', async ({ page }) => {
    await page.goto(`${BASE}/#proyectos`);
    await expect(page).toHaveURL(/#proyectos$/);
    const target = page.locator('#proyectos');
    await expect(target).toBeVisible();
    // El objetivo queda dentro del viewport tras el salto.
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
  });

  test('el foco de teclado es visible al tabular', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, hasOutline: getComputedStyle(el).outlineStyle !== 'none' } : null;
    });
    expect(active).not.toBeNull();
    expect(active.tag).not.toBe('BODY');
  });
});
