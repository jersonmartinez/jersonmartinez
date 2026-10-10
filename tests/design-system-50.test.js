const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('design system 50 exposes semantic surfaces, states and accents', () => {
  const palette = read('src/styles/palette.css');
  for (const token of [
    '--surface-canvas', '--surface-1', '--surface-2', '--surface-3', '--surface-inset',
    '--text-primary', '--text-secondary', '--state-success', '--state-warning',
    '--state-danger', '--border-structural', '--border-focus', '--measure-prose',
    '--violet', '--electric', '--section-wash',
  ]) assert.match(palette, new RegExp(`${token.replaceAll('-', '\\-')}\\s*:`), token);
  for (const selector of ['.hero::after', '.project-case-tagline::before', '.timeline::before', '.diagram-node', '.value-card']) {
    assert.match(palette, new RegExp(selector.replace(/[.:]/g, '\\$&')), selector);
  }
});

test('the approved button grammar remains outside the new design-50 layer', () => {
  const palette = read('src/styles/palette.css');
  const marker = palette.indexOf('Design system 50: Nocturne editorial layer');
  assert.ok(marker > 0);
  const designLayer = palette.slice(marker);
  assert.doesNotMatch(designLayer, /^\.button(?:--ghost)?[^\{]*\{/m);
  assert.match(palette.slice(0, marker), /\.button \{/);
  assert.match(palette.slice(0, marker), /\.button:hover \{/);
});

test('visual guide lists the semantic palette introduced by design system 50', () => {
  const guide = read('src/pages/guia-visual.astro');
  for (const token of ['--primary', '--violet', '--electric', '--state-success', '--surface-3']) {
    assert.match(guide, new RegExp(token.replaceAll('-', '\\-')), token);
  }
});
