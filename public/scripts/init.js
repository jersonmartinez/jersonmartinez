document.documentElement.classList.add('js');
/* aplica el tema persistido antes del primer pintado para evitar FOUC.
   Script externo (CSP estricta sin unsafe-inline). Si no hay elección explícita,
   el tema sigue prefers-color-scheme vía CSS y no se fija data-theme. */
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
      /* Las dos <meta name="theme-color"> condicionadas por prefers-color-scheme no siguen
         al tema ELEGIDO. Se fija aquí, antes del primer pintado, una meta sin media que gana
         sobre las condicionadas, para que el cromo del navegador coincida desde el inicio
         (site.js la vuelve a sincronizar al alternar el tema). */
      var CHROME = { light: '#ffffff', dark: '#07111f' };
      var meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', CHROME[stored]);
      document.head.appendChild(meta);
    }
  } catch (e) { /* almacenamiento no disponible: se usa el tema por preferencia del sistema */ }
})();
