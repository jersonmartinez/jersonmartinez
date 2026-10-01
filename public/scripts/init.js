document.documentElement.classList.add('js');
/* Item 8: aplica el tema persistido antes del primer pintado para evitar FOUC.
   Script externo (CSP estricta sin unsafe-inline). Si no hay elección explícita,
   el tema sigue prefers-color-scheme vía CSS y no se fija data-theme. */
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) { /* almacenamiento no disponible: se usa el tema por preferencia del sistema */ }
})();
