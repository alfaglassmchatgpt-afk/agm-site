(() => {
  const header = document.querySelector('.aluminium-header');
  if (!header) return;
  const toggle = header.querySelector('.menu-toggle');
  const menu = header.querySelector('#mobile-nav');
  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
  }
  toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
    toggle.setAttribute('aria-label', menu.hidden ? 'Открыть меню' : 'Закрыть меню');
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  header.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
  // The existing AGM system-theme MU plugin owns the shared theme preference.
})();
