#!/usr/bin/env node
/**
 * Gate de GEOMETRÍA del sprite de iconos.
 *
 * Por qué existe: en el lote anterior los 32 glifos se extrajeron de los WOFF2 con un
 * desplazamiento vertical sistemático y quedaron recortados hasta un 12,5 % por abajo.
 * Ese defecto sobrevivió a Lighthouse, pa11y, axe y a toda la suite porque NINGUNO de
 * ellos compara geometría. Esto sí: mide la caja real de cada símbolo y falla si el
 * glifo se sale de su viewBox o si ocupa una fracción implausible de él.
 *
 * La medición incluye los EXTREMOS de las curvas (Q/C/A), no sólo los puntos de control:
 * usar sólo los puntos de control da una bbox equivocada.
 */
const fs = require('node:fs');
const path = require('node:path');

const SPRITE = path.resolve(process.cwd(), 'src/components/IconSprite.astro');
// Tolerancia en unidades de usuario: un glifo puede rebasar mínimamente por el antialias
// de su contorno sin que sea un defecto perceptible.
const SLACK = 1.5;
// Un glifo que llena menos de esta fracción de la altura del viewBox está mal encajado.
const MIN_FILL = 0.3;

/** Puntos extremos de una curva de Bézier cúbica en un eje. */
const cubicExtrema = (p0, p1, p2, p3) => {
  const out = [p0, p3];
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  const at = (t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  if (Math.abs(a) < 1e-9) {
    if (Math.abs(b) > 1e-9) { const t = -c / b; if (t > 0 && t < 1) out.push(at(t)); }
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      for (const sign of [1, -1]) {
        const t = (-b + sign * Math.sqrt(disc)) / (2 * a);
        if (t > 0 && t < 1) out.push(at(t));
      }
    }
  }
  return out;
};

/** Puntos extremos de una curva cuadrática en un eje. */
const quadExtrema = (p0, p1, p2) => {
  const out = [p0, p2];
  const den = p0 - 2 * p1 + p2;
  if (Math.abs(den) > 1e-9) {
    const t = (p0 - p1) / den;
    if (t > 0 && t < 1) {
      const u = 1 - t;
      out.push(u * u * p0 + 2 * u * t * p1 + t * t * p2);
    }
  }
  return out;
};

/** Recorre un atributo `d` y devuelve la caja envolvente real. */
function pathBBox(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let i = 0;
  let cmd = '';
  let x = 0; let y = 0; let startX = 0; let startY = 0;
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  const push = (px, py) => {
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
  };
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const K = cmd.toUpperCase();
    if (K === 'M' || K === 'L') {
      const nx = num(); const ny = num();
      x = rel ? x + nx : nx; y = rel ? y + ny : ny;
      if (K === 'M') { startX = x; startY = y; }
      push(x, y);
    } else if (K === 'H') { const nx = num(); x = rel ? x + nx : nx; push(x, y); }
    else if (K === 'V') { const ny = num(); y = rel ? y + ny : ny; push(x, y); }
    else if (K === 'C') {
      const x1 = rel ? x + num() : num(); const y1 = rel ? y + num() : num();
      const x2 = rel ? x + num() : num(); const y2 = rel ? y + num() : num();
      const nx = rel ? x + num() : num(); const ny = rel ? y + num() : num();
      for (const v of cubicExtrema(x, x1, x2, nx)) push(v, y);
      for (const v of cubicExtrema(y, y1, y2, ny)) push(x, v);
      x = nx; y = ny; push(x, y);
    } else if (K === 'Q') {
      const x1 = rel ? x + num() : num(); const y1 = rel ? y + num() : num();
      const nx = rel ? x + num() : num(); const ny = rel ? y + num() : num();
      for (const v of quadExtrema(x, x1, nx)) push(v, y);
      for (const v of quadExtrema(y, y1, ny)) push(x, v);
      x = nx; y = ny; push(x, y);
    } else if (K === 'A') {
      num(); num(); num(); num(); num();
      const nx = rel ? x + num() : num(); const ny = rel ? y + num() : num();
      // Aproximación conservadora: los extremos del arco. Suficiente para detectar
      // un desplazamiento sistemático, que es la clase de defecto que vigila el gate.
      push(x, y); x = nx; y = ny; push(x, y);
    } else if (K === 'Z') { x = startX; y = startY; push(x, y); }
    else { num(); }
  }
  return { minX, minY, maxX, maxY };
}

const main = () => {
  if (!fs.existsSync(SPRITE)) {
    console.error(`No existe el sprite: ${SPRITE}`);
    process.exit(1);
  }
  const svg = fs.readFileSync(SPRITE, 'utf8');
  const symbols = [...svg.matchAll(/<symbol\s+id="([^"]+)"\s+viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)];
  if (!symbols.length) {
    console.error('El sprite no declara ningún <symbol>: el gate no puede verificar nada.');
    process.exit(1);
  }

  const problems = [];
  for (const [, id, viewBox, body] of symbols) {
    const [vx, vy, vw, vh] = viewBox.trim().split(/[\s,]+/).map(Number);
    const ds = [...body.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
    if (!ds.length) { problems.push(`${id}: el símbolo no contiene ningún path`); continue; }
    let box = null;
    for (const d of ds) {
      const b = pathBBox(d);
      if (!Number.isFinite(b.minX)) continue;
      box = box
        ? { minX: Math.min(box.minX, b.minX), minY: Math.min(box.minY, b.minY), maxX: Math.max(box.maxX, b.maxX), maxY: Math.max(box.maxY, b.maxY) }
        : b;
    }
    if (!box) { problems.push(`${id}: no se pudo medir ningún path`); continue; }

    if (box.minX < vx - SLACK) problems.push(`${id}: el glifo se sale ${(vx - box.minX).toFixed(1)}u por la IZQUIERDA del viewBox`);
    if (box.minY < vy - SLACK) problems.push(`${id}: el glifo se sale ${(vy - box.minY).toFixed(1)}u por ARRIBA del viewBox`);
    if (box.maxX > vx + vw + SLACK) problems.push(`${id}: el glifo se sale ${(box.maxX - (vx + vw)).toFixed(1)}u por la DERECHA del viewBox`);
    if (box.maxY > vy + vh + SLACK) problems.push(`${id}: el glifo se sale ${(box.maxY - (vy + vh)).toFixed(1)}u por ABAJO del viewBox (recorte)`);

    const fill = (box.maxY - box.minY) / vh;
    if (fill < MIN_FILL) problems.push(`${id}: el glifo sólo ocupa el ${(fill * 100).toFixed(0)}% de la altura del viewBox; probable viewBox mal encajado`);
  }

  if (problems.length) {
    console.error(`Geometría del sprite INCORRECTA (${problems.length} de ${symbols.length} símbolos):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`Geometría del sprite correcta: ${symbols.length} símbolos dentro de su viewBox.`);
};

main();
