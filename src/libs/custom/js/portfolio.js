(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  const desktopQuery = window.matchMedia('(min-width: 821px)');

  const setNavState = (isOpen, { returnFocus = false } = {}) => {
    if (!navToggle || !nav) return;
    nav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('nav-open', isOpen);
    if (returnFocus) navToggle.focus();
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => setNavState(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setNavState(false);
    });
    document.addEventListener('click', (event) => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !navToggle.contains(event.target)) setNavState(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) setNavState(false, { returnFocus: true });
    });
    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) setNavState(false);
    });
  }

  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = [...tabs.querySelectorAll('[data-tab]')];
    const panels = [...tabs.querySelectorAll('[data-panel]')];
    const tabList = tabs.querySelector('[role="tablist"]');

    if (!buttons.length) return;
    if (tabList) tabList.setAttribute('aria-orientation', 'vertical');

    const activate = (name, shouldFocus = false) => {
      buttons.forEach((button) => {
        const selected = button.dataset.tab === name;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected && shouldFocus) button.focus();
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== name;
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button.dataset.tab));
      button.addEventListener('keydown', (event) => {
        let nextIndex = index;
        if (['ArrowDown', 'ArrowRight'].includes(event.key)) nextIndex = (index + 1) % buttons.length;
        if (['ArrowUp', 'ArrowLeft'].includes(event.key)) nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        if (nextIndex === index) return;
        event.preventDefault();
        activate(buttons[nextIndex].dataset.tab, true);
      });
    });

    const first = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
    activate(first.dataset.tab);
  });

  const scrollTop = document.querySelector('[data-scroll-top]');
  if (scrollTop) {
    const updateScrollButton = () => {
      const isVisible = window.scrollY > 520;
      scrollTop.classList.toggle('is-visible', isVisible);
      scrollTop.setAttribute('tabindex', isVisible ? '0' : '-1');
    };
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    updateScrollButton();
    scrollTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute('rel', 'noopener noreferrer');
  });
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
