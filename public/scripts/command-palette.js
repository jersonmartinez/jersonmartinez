/* Item 34: paleta de comandos accesible. Script externo (CSP estricta sin unsafe-inline).
   - Se abre con Cmd/Ctrl+K o con el botón [data-command-open] (sólo visible con JS).
   - Diálogo modal con focus trap, Escape para cerrar, restaura el foco al disparador.
   - Degradación sin JS: el diálogo permanece oculto ([hidden]); la navegación normal sigue
     disponible, por lo que la ausencia de JS no deja al usuario sin acceso a las rutas.
   - No introduce contenido inventado: las entradas son las rutas y secciones reales del sitio. */
(function () {
  const dialog = document.querySelector('[data-command-palette]');
  if (!dialog) return;
  const input = dialog.querySelector('[data-command-input]');
  const list = dialog.querySelector('[data-command-list]');
  const openButton = document.querySelector('[data-command-open]');
  const items = [...list.querySelectorAll('[data-command-item]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastFocus = null;

  if (openButton) openButton.hidden = false;

  const focusable = () => [input, ...items.filter((i) => !i.hidden)];

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const text = (item.getAttribute('data-command-text') || item.textContent || '').toLowerCase();
      const match = q === '' || text.includes(q);
      item.hidden = !match;
      if (match) visible += 1;
    });
    const empty = dialog.querySelector('[data-command-empty]');
    if (empty) empty.hidden = visible !== 0;
  };

  const open = () => {
    lastFocus = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add('nav-locked');
    input.value = '';
    filter();
    input.focus();
  };
  const close = () => {
    dialog.hidden = true;
    document.body.classList.remove('nav-locked');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };

  if (openButton) openButton.addEventListener('click', open);

  document.addEventListener('keydown', (event) => {
    const isShortcut = (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey);
    if (isShortcut) { event.preventDefault(); if (dialog.hidden) open(); else close(); return; }
    if (dialog.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'Tab') {
      const f = focusable();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const f = focusable();
      const idx = f.indexOf(document.activeElement);
      if (idx >= 0) {
        event.preventDefault();
        const next = event.key === 'ArrowDown' ? (idx + 1) % f.length : (idx - 1 + f.length) % f.length;
        f[next].focus();
      }
    }
  });

  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  input.addEventListener('input', filter);
  items.forEach((item) => item.addEventListener('click', () => close()));
})();
