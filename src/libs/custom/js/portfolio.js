(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = [...tabs.querySelectorAll('[data-tab]')];
    const panels = [...tabs.querySelectorAll('[data-panel]')];

    const activate = (name, focus = false) => {
      buttons.forEach((button) => {
        const selected = button.dataset.tab === name;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected && focus) button.focus();
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== name;
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button.dataset.tab));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
        event.preventDefault();
        const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
        const nextIndex = (index + direction + buttons.length) % buttons.length;
        activate(buttons[nextIndex].dataset.tab, true);
      });
    });

    const first = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
    if (first) activate(first.dataset.tab);
  });

  const scrollTop = document.querySelector('[data-scroll-top]');
  if (scrollTop) {
    const updateScrollButton = () => scrollTop.classList.toggle('is-visible', window.scrollY > 520);
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    updateScrollButton();
    scrollTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
