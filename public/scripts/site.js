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
  const closeNav = ({ restoreFocus = false } = {}) => {
    nav?.classList.remove('is-open');
    document.body.classList.remove('nav-locked');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menú');
    setDocumentInert(false);
    if (restoreFocus) (lastFocus || toggle)?.focus();
  };
  const openNav = () => {
    lastFocus = document.activeElement;
    nav?.classList.add('is-open');
    document.body.classList.add('nav-locked');
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.setAttribute('aria-label', 'Cerrar menú');
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
  const activateSkill = (index, focus = false) => {
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
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateSkill(index));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== index) { event.preventDefault(); activateSkill(next, true); }
    });
  });

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
    if (filterStatus) filterStatus.textContent = `Mostrando ${visible} de ${projectCards.length} proyectos`;
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
})();
