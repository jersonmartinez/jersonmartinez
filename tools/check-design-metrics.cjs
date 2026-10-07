#!/usr/bin/env node
/**
 * Gate de MEDIDAS DE DISEÑO sobre el dist servido.
 *
 * Fija como invariantes las magnitudes que estaban medidamente mal y se corrigieron en
 * este lote. Ningún gate existente las cubre: Lighthouse puntúa rendimiento, pa11y y axe
 * juzgan accesibilidad, y los tests comparan marcado — ninguno mide composición.
 *
 * Uso: node tools/check-design-metrics.cjs [baseUrl]
 */
const { chromium } = require('@playwright/test');

// Las rutas se miden en los DOS idiomas: el texto de la navegación y de los
// controles tiene longitudes distintas, y el header es justo donde un texto más
// largo desborda. Medir sólo el español dejaría /en sin cubrir.
const ES_ROUTES = ['/', '/projects.html', '/courses.html', '/certifications.html', '/experience.html', '/about.html'];
const ROUTES = [...ES_ROUTES, ...ES_ROUTES.map((route) => (route === '/' ? '/en' : `/en${route}`))];
// Anchos elegidos para cubrir las franjas donde aparecieron defectos reales: el suelo de
// 320 px, el colapso del menú, y los anchos por encima de --max donde la fila del header
// desbordaba porque el contenedor ya no crece con el viewport.
const WIDTHS = [320, 360, 390, 680, 768, 900, 1000, 1100, 1199, 1200, 1280, 1320, 1340, 1440, 1920];

const run = async () => {
  const base = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
  const browser = await chromium.launch();
  const fails = [];
  const checks = [];
  const ok = (name) => checks.push(name);

  // 1. Sin desbordamiento horizontal en ninguna ruta ni ancho, hasta el suelo de 320 px.
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      await page.goto(base + route, { waitUntil: 'load' });
      const m = await page.evaluate(() => {
        const d = document.documentElement;
        const inner = document.querySelector('.header-inner');
        const nav = document.querySelector('.site-nav');
        const cta = document.querySelector('.nav-contact');
        const ctrl = document.querySelector('.header-controls');
        // Un contenedor flex cuyo hijo se comprime por debajo de su contenido NO produce
        // desbordamiento del documento: los hijos simplemente pintan encima. Medir sólo
        // scrollWidth dejó pasar que el CTA de WhatsApp cubriera el grupo de controles.
        const navCollapsed = nav && getComputedStyle(nav).position === 'absolute';
        const overlap = (!navCollapsed && cta && ctrl)
          ? Math.round(cta.getBoundingClientRect().right - ctrl.getBoundingClientRect().left)
          : -1;
        return {
          overflow: d.scrollWidth - d.clientWidth,
          headerOverflow: inner ? inner.scrollWidth - inner.clientWidth : 0,
          navOverflow: nav ? nav.scrollWidth - nav.clientWidth : 0,
          overlap,
          brand: Math.round(document.querySelector('.brand').getBoundingClientRect().width),
          themeVisible: (() => { const t = document.querySelector('[data-theme-toggle]'); return !!t && t.getBoundingClientRect().width > 0; })(),
        };
      });
      if (m.overflow > 0) fails.push(`${route} @${width}px: desbordamiento horizontal de ${m.overflow}px`);
      if (m.headerOverflow > 0) fails.push(`${route} @${width}px: el header desborda ${m.headerOverflow}px`);
      if (m.navOverflow > 0) fails.push(`${route} @${width}px: la navegación desborda su caja ${m.navOverflow}px`);
      if (m.overlap > 0) fails.push(`${route} @${width}px: el CTA de navegación se solapa ${m.overlap}px con los controles`);
      // La marca no debe comprimirse: la fila del header tiene cinco ítems flex.
      // El umbral depende del ancho porque el ancho INTENCIONADO depende del ancho:
      // por debajo de 421 px la hoja de estilos la fija en 8rem (128 px) para que
      // la fila quepa en el suelo de diseño de 320 px. Lo que este check persigue
      // es la compresión por flex (se midió una caída de 158 a 67 px), no un valor
      // de diseño declarado, así que compara contra el esperado en cada tramo.
      const brandExpected = width <= 420 ? 128 : 150;
      if (m.brand < brandExpected) fails.push(`${route} @${width}px: la marca se comprimió a ${m.brand}px (esperado >= ${brandExpected}px)`);
      // Los controles no son navegación: deben seguir alcanzables con el menú colapsado.
      if (!m.themeVisible) fails.push(`${route} @${width}px: el conmutador de tema no está visible`);
    }
    await ctx.close();
  }
  ok(`sin desbordamiento ni compresión del header en ${WIDTHS.length} anchos x ${ROUTES.length} rutas`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 2. El desplazamiento de ancla cubre la altura real del header pegajoso.
  await page.goto(`${base}/`, { waitUntil: 'load' });
  const anchor = await page.evaluate(() => {
    const header = document.querySelector('.site-header').getBoundingClientRect().height;
    const smt = parseFloat(getComputedStyle(document.querySelector('section[id]')).scrollMarginTop);
    return { header: Math.round(header), smt };
  });
  if (!(anchor.smt >= anchor.header)) {
    fails.push(`desplazamiento de ancla ${anchor.smt}px por debajo de la altura del header ${anchor.header}px: el encabezado enlazado queda tapado`);
  } else ok(`ancla ${anchor.smt}px >= header ${anchor.header}px`);

  // 3. El encabezado de sección y su entradilla no se tocan.
  const gap = await page.evaluate(() => {
    const h2 = document.querySelector('.section-heading h2');
    const lede = h2 && h2.parentElement.querySelector('.lede');
    if (!h2 || !lede) return null;
    return Math.round(lede.getBoundingClientRect().top - h2.getBoundingClientRect().bottom);
  });
  if (gap === null) fails.push('no se encontró un par encabezado/entradilla que medir');
  else if (gap < 8) fails.push(`encabezado y entradilla separados sólo ${gap}px`);
  else ok(`separación encabezado/entradilla ${gap}px`);

  // 4. Medida de lectura del cuerpo largo.
  await page.goto(`${base}/experience.html`, { waitUntil: 'load' });
  const measure = await page.evaluate(() => Math.round(document.querySelector('.timeline-card p').getBoundingClientRect().width));
  if (measure > 820) fails.push(`el cuerpo de la trayectoria mide ${measure}px de ancho; demasiado para una lectura cómoda`);
  else ok(`medida del cuerpo de la trayectoria ${measure}px`);

  // 5. Las tarjetas de curso de una misma fila alinean su etiqueta y su enlace.
  await page.goto(`${base}/courses.html`, { waitUntil: 'load' });
  const rowAlign = await page.evaluate(() => {
    const tops = (sel) => [...document.querySelectorAll(sel)].slice(0, 3).map((e) => Math.round(e.getBoundingClientRect().top));
    return { labels: tops('.course-card .course-access-label'), links: tops('.course-card .card-link') };
  });
  for (const [name, arr] of Object.entries(rowAlign)) {
    if (arr.length === 3 && new Set(arr).size !== 1) fails.push(`las tarjetas de curso desalinean ${name}: ${arr.join(', ')}`);
  }
  if (!fails.some((f) => f.includes('desalinean'))) ok('etiquetas y enlaces de curso alineados en la fila');

  await ctx.close();

  // 6. El CTA principal entra completo en el primer viewport móvil.
  const mctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const mpage = await mctx.newPage();
  await mpage.goto(`${base}/`, { waitUntil: 'load' });
  const cta = await mpage.evaluate(() => {
    const r = document.querySelector('.hero-actions .button').getBoundingClientRect();
    return { bottom: Math.round(r.bottom), viewport: window.innerHeight };
  });
  if (cta.bottom > cta.viewport) fails.push(`el CTA del hero termina en ${cta.bottom}px, fuera del primer viewport de ${cta.viewport}px`);
  else ok(`CTA del hero visible en el primer viewport (${cta.bottom}/${cta.viewport}px)`);
  await mctx.close();

  // 7. La marca es legible en AMBOS temas: debe seguir al color de texto, no a un fill fijo.
  const tctx = await browser.newContext({ viewport: { width: 1440, height: 400 } });
  const tpage = await tctx.newPage();
  for (const theme of ['dark', 'light']) {
    await tpage.goto(`${base}/`, { waitUntil: 'load' });
    await tpage.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await tpage.waitForTimeout(150);
    const brand = await tpage.evaluate(() => {
      const svg = document.querySelector('.brand svg');
      const text = svg && svg.querySelector('text');
      if (!text) return null;
      const parse = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const lum = ([r, g, b]) => {
        const f = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const fill = parse(getComputedStyle(text).fill);
      const bg = parse(getComputedStyle(document.querySelector('.site-header')).backgroundColor);
      const [a, b] = [lum(fill), lum(bg)].sort((x, y) => y - x);
      return { ratio: Number(((a + 0.05) / (b + 0.05)).toFixed(2)) };
    });
    if (!brand) fails.push('la marca no es un SVG inline con texto: no puede heredar el color del tema');
    else if (brand.ratio < 4.5) fails.push(`la marca contrasta ${brand.ratio}:1 sobre el header en tema ${theme}`);
    else ok(`contraste de la marca en tema ${theme}: ${brand.ratio}:1`);
  }
  await tctx.close();

  await browser.close();

  for (const c of checks) console.log(`  ok  ${c}`);
  if (fails.length) {
    console.error(`\nMedidas de diseño INCORRECTAS (${fails.length}):`);
    for (const f of fails) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nMedidas de diseño correctas.');
};

run().catch((e) => { console.error(e); process.exit(1); });
