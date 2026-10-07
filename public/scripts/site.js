(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  let lastFocus = null;

  const navFocusable = () => [...(nav?.querySelectorAll('a, button:not([disabled])') || [])];
  const setDocumentInert = (value) => {
    [main, footer].forEach((element) => {
      if (!element) return;
      element.inert = value;
      if (value) element.setAttribute('aria-hidden', 'true'); else element.removeAttribute('aria-hidden');
    });
  };
  // Etiquetas servidas por la cabecera en el idioma de la página (data-label-*).
  // El fallback conserva el texto español anterior, así que un atributo ausente
  // degrada al comportamiento previo en vez de dejar el botón sin nombre.
  const navLabelOpen = toggle?.getAttribute('data-label-open') || 'Abrir menú';
  const navLabelClose = toggle?.getAttribute('data-label-close') || 'Cerrar menú';
  const closeNav = ({ restoreFocus = false } = {}) => {
    nav?.classList.remove('is-open');
    document.body.classList.remove('nav-locked');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', navLabelOpen);
    setDocumentInert(false);
    if (restoreFocus) (lastFocus || toggle)?.focus();
  };
  const openNav = () => {
    lastFocus = document.activeElement;
    nav?.classList.add('is-open');
    document.body.classList.add('nav-locked');
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.setAttribute('aria-label', navLabelClose);
    setDocumentInert(true);
    navFocusable()[0]?.focus();
  };
  toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (nav?.classList.contains('is-open')) closeNav({ restoreFocus: true }); else openNav();
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeNav()));
  document.addEventListener('keydown', (event) => {
    if (!nav?.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeNav({ restoreFocus: true }); return; }
    if (event.key !== 'Tab') return;
    const focusable = navFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (!nav?.classList.contains('is-open')) return;
    if (nav.contains(event.target) || toggle?.contains(event.target)) return;
    closeNav();
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => { if (event.matches) closeNav(); });

  const explorer = document.querySelector('[data-skills-explorer]');
  const tabs = explorer ? [...explorer.querySelectorAll('[data-skill-tab]')] : [];
  const panels = explorer ? [...explorer.querySelectorAll('[data-skill-panel]')] : [];
  const activateSkill = (index, focus = false, updateUrl = false) => {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    // refleja la tab activa en la URL (?skill=slug) sin ensuciar el historial.
    if (updateUrl && tabs[index]) {
      const slug = tabs[index].getAttribute('data-skill-slug') || String(index);
      const url = new URL(location.href);
      url.searchParams.set('skill', slug);
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateSkill(index, false, true));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== index) { event.preventDefault(); activateSkill(next, true, true); }
    });
  });
  // restaura la tab desde la URL al cargar.
  if (tabs.length) {
    const requestedSkill = new URL(location.href).searchParams.get('skill');
    if (requestedSkill) {
      const idx = tabs.findIndex((tab, i) => (tab.getAttribute('data-skill-slug') || String(i)) === requestedSkill);
      if (idx >= 0) activateSkill(idx);
    }
  }

  const railLinks = [...document.querySelectorAll('.journey-rail a[href^="#"]')];
  const railSections = railLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (railLinks.length && 'IntersectionObserver' in window) {
    const setRailActive = (id) => railLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setRailActive(entry.target.id); }), { rootMargin: '-35% 0px -55% 0px' });
    railSections.forEach((section) => observer.observe(section));
  }

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projectCards = [...document.querySelectorAll('[data-category]')];
  const filterStatus = document.querySelector('[data-filter-status]');
  const emptyState = document.querySelector('[data-repo-empty]');
  const applyFilter = (filter, updateUrl = false) => {
    let visible = 0;
    projectCards.forEach((card) => {
      const categories = (card.getAttribute('data-category') || '').split(/\s+/);
      const hidden = filter !== 'all' && !categories.includes(filter);
      card.hidden = hidden;
      if (!hidden) visible += 1;
    });
    filterButtons.forEach((button) => {
      const active = button.getAttribute('data-filter') === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (filterStatus) {
      // Plantilla servida en el idioma de la página; mismo texto que el build.
      const template = filterStatus.getAttribute('data-template') || 'Mostrando {shown} de {total} proyectos';
      filterStatus.textContent = template
        .replace('{shown}', String(visible))
        .replace('{total}', String(projectCards.length));
    }
    if (emptyState) emptyState.hidden = visible !== 0;
    if (updateUrl) {
      const url = new URL(location.href);
      if (filter === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', filter);
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };
  filterButtons.forEach((button) => button.addEventListener('click', () => applyFilter(button.getAttribute('data-filter') || 'all', true)));
  if (filterButtons.length) {
    const requested = new URL(location.href).searchParams.get('filter');
    const allowed = filterButtons.map((button) => button.getAttribute('data-filter'));
    applyFilter(allowed.includes(requested) ? requested : 'all');
  }

  const focusHashProject = () => {
    const hash = decodeURIComponent(location.hash || '');
    if (!hash.startsWith('#proyecto-')) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    applyFilter('all');
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };
  window.addEventListener('hashchange', focusHashProject);
  focusHashProject();

  /* conmutador de tema persistente y accesible. El botón sólo se muestra con JS
     (progressive enhancement); sin JS el sitio sigue prefers-color-scheme. */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    const root = document.documentElement;
    const systemLight = window.matchMedia('(prefers-color-scheme: light)');
    const status = document.querySelector('[data-theme-status]');
    /* Las dos <meta name="theme-color"> del documento están condicionadas por
       prefers-color-scheme, así que el color del cromo del navegador NO seguía al tema
       elegido: un usuario con sistema oscuro que escogía el tema claro conservaba la barra
       oscura. Se fija una meta propia, sin media, que gana sobre las condicionadas. */
    const CHROME = { light: '#ffffff', dark: '#07111f' };
    let chromeMeta = document.querySelector('meta[name="theme-color"]:not([media])');
    const syncChrome = (theme) => {
      if (!chromeMeta) {
        chromeMeta = document.createElement('meta');
        chromeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(chromeMeta);
      }
      chromeMeta.setAttribute('content', CHROME[theme]);
    };
    const effectiveTheme = () => {
      const explicit = root.getAttribute('data-theme');
      if (explicit === 'light' || explicit === 'dark') return explicit;
      return systemLight.matches ? 'light' : 'dark';
    };
    const reflect = (announce) => {
      const theme = effectiveTheme();
      const isLight = theme === 'light';
      const labelDark = themeToggle.getAttribute('data-label-dark') || 'Activar tema oscuro';
      const labelLight = themeToggle.getAttribute('data-label-light') || 'Activar tema claro';
      const statusLight = themeToggle.getAttribute('data-status-light') || 'Tema claro activado.';
      const statusDark = themeToggle.getAttribute('data-status-dark') || 'Tema oscuro activado.';
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? labelDark : labelLight);
      syncChrome(theme);
      if (announce && status) status.textContent = isLight ? statusLight : statusDark;
    };
    themeToggle.hidden = false;
    reflect(false);
    themeToggle.addEventListener('click', () => {
      const next = effectiveTheme() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* sin persistencia */ }
      reflect(true);
    });
    /* Si el usuario no ha elegido explícitamente, seguir los cambios del sistema. */
    systemLight.addEventListener('change', () => { if (!localStorage.getItem('theme')) reflect(false); });
  }

  /* desplazamiento suave disparado por interacción (no global). Un clic en un enlace
     interno de ancla hace scroll suave salvo que el usuario prefiera movimiento reducido. */
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* indicador de progreso de lectura en páginas largas. Barra fija alimentada por el
     scroll; se oculta en páginas cortas y respeta prefers-reduced-motion (sin transición). */
  const progressBar = document.querySelector('[data-scroll-progress]');
  if (progressBar) {
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
      progressBar.parentElement?.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    };
    const longEnough = (document.documentElement.scrollHeight - document.documentElement.clientHeight) > 800;
    if (longEnough) {
      progressBar.parentElement?.removeAttribute('hidden');
      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress, { passive: true });
    }
  }

  /* prefetch de rutas internas DISPARADO POR INTENCIÓN (hover/focus), no en la carga
     inicial. Un prefetch estático de varias páginas competía con la imagen LCP y empeoraba el
     Largest Contentful Paint; hacerlo al pasar el ratón/foco mantiene el beneficio sin coste en el
     primer render. CSP-safe (inyecta <link rel="prefetch">, no ejecuta scripts remotos). */
  const prefetched = new Set();
  const prefetch = (href) => {
    if (!href || prefetched.has(href)) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  };
  const isInternal = (anchor) => {
    try { const u = new URL(anchor.href, location.href); return u.origin === location.origin && !u.hash && u.pathname !== location.pathname; }
    catch { return false; }
  };
  const onIntent = (event) => {
    const anchor = event.target.closest('a[href]');
    if (anchor && isInternal(anchor)) prefetch(anchor.href);
  };
  if (!window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent, { passive: true });
  }
})();
