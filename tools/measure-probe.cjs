#!/usr/bin/env node
/** Mediciones puntuales sobre el dist servido para confirmar hallazgos con números. */
const { chromium } = require('@playwright/test');

const run = async () => {
  const base = process.argv[2] || 'http://127.0.0.1:4321';
  const browser = await chromium.launch();

  // Desktop 1440
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${base}/`, { waitUntil: 'load' });
  const desktop = await page.evaluate(() => {
    const header = document.querySelector('.site-header');
    const h2 = document.querySelector('.section-heading h2');
    const lede = h2?.parentElement.querySelector('.lede');
    const gap = h2 && lede
      ? Math.round(lede.getBoundingClientRect().top - h2.getBoundingClientRect().bottom)
      : null;
    const smt = getComputedStyle(document.querySelector('section[id]')).scrollMarginTop;
    const measure = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const w = el.getBoundingClientRect().width;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      return { px: Math.round(w), ch: Math.round(w / (fs * 0.5)) };
    };
    return {
      headerHeight: Math.round(header.getBoundingClientRect().height),
      scrollMarginTop: smt,
      h2LedeGap: gap,
      deliveryText: measure('.delivery-chain li span:last-child'),
      cardP: measure('.card p'),
    };
  });

  await page.goto(`${base}/experience.html`, { waitUntil: 'load' });
  const exp = await page.evaluate(() => {
    const p = document.querySelector('.timeline-card p');
    const fs = parseFloat(getComputedStyle(p).fontSize);
    const w = p.getBoundingClientRect().width;
    return { timelinePx: Math.round(w), timelineCh: Math.round(w / (fs * 0.5)), fontSize: fs };
  });

  await page.goto(`${base}/courses.html`, { waitUntil: 'load' });
  const courses = await page.evaluate(() => {
    // Alineación del enlace final entre tarjetas de la misma fila.
    const links = [...document.querySelectorAll('.course-card .card-link')].slice(0, 3)
      .map((a) => Math.round(a.getBoundingClientRect().top));
    const labels = [...document.querySelectorAll('.course-card .course-access-label')].slice(0, 3)
      .map((a) => Math.round(a.getBoundingClientRect().top));
    return { linkTops: links, labelTops: labels };
  });

  await ctx.close();

  // Mobile 390
  const mctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const mpage = await mctx.newPage();
  await mpage.goto(`${base}/`, { waitUntil: 'load' });
  const mobile = await mpage.evaluate(() => {
    const cta = document.querySelector('.hero-actions .button');
    const h1 = document.querySelector('.hero h1');
    const r = cta.getBoundingClientRect();
    const themeVisible = (() => {
      const t = document.querySelector('[data-theme-toggle]');
      if (!t) return 'absent';
      const rect = t.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 ? 'visible' : 'hidden-in-collapsed-nav';
    })();
    const small = [...document.querySelectorAll('a, button')]
      .filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && (b.width < 24 || b.height < 24);
      })
      .map((el) => `${el.className || el.tagName}:${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
    return {
      h1Height: Math.round(h1.getBoundingClientRect().height),
      h1FontSize: getComputedStyle(h1).fontSize,
      ctaTop: Math.round(r.top),
      ctaFullyVisible: r.bottom <= 780,
      themeToggle: themeVisible,
      smallTargets: small.slice(0, 8),
    };
  });
  await mctx.close();
  await browser.close();
  console.log(JSON.stringify({ desktop, exp, courses, mobile }, null, 2));
};

run().catch((e) => { console.error(e); process.exit(1); });
