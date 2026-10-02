/* botón de copiar en snippets, credential IDs y contacto. Script externo (CSP).
   - [data-copy-target="id"]: copia el textContent del elemento con ese id (bloques de código).
   - [data-copy="texto"]: copia el valor del atributo (IDs de credencial, email/teléfono).
   Degradación sin JS: los botones están hidden y el contenido sigue siendo seleccionable/visible. */
(function () {
  const buttons = [...document.querySelectorAll('[data-copy-target], [data-copy]')];
  if (!buttons.length || !navigator.clipboard) return;

  const feedback = (button) => {
    const icon = button.querySelector('i');
    const label = button.querySelector('[class$="-copy-label"], .copy-label');
    const prevIcon = icon ? icon.className : null;
    if (icon) icon.className = 'fas fa-check';
    if (label) { label.dataset.prev = label.textContent; label.textContent = 'Copiado'; }
    button.setAttribute('data-copied', 'true');
    window.setTimeout(() => {
      if (icon && prevIcon) icon.className = prevIcon;
      if (label && label.dataset.prev) label.textContent = label.dataset.prev;
      button.removeAttribute('data-copied');
    }, 1600);
  };

  buttons.forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      let text = '';
      const targetId = button.getAttribute('data-copy-target');
      if (targetId) {
        const target = document.getElementById(targetId);
        text = target ? target.textContent : '';
      } else {
        text = button.getAttribute('data-copy') || '';
      }
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        feedback(button);
      } catch (error) {
        /* permiso denegado o contexto no seguro: no se interrumpe la navegación */
      }
    });
  });
})();
