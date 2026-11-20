/* Only the replacement header; legacy page scripts keep their own controls. */
(() => {
  function init() {
    const header = document.querySelector('.agm-standard-header');
    if (!header || header.dataset.ready) return;
    header.dataset.ready = 'true';
    const menu = header.querySelector('.agm-mobile-nav');
    const toggle = header.querySelector('.agm-menu-toggle');
    const groups = [...header.querySelectorAll('.agm-nav-dropdown')];
    function closeGroups(except) {
      groups.forEach(group => {
        if (group === except) return;
        group.querySelector('.agm-nav-panel').hidden = true;
        group.querySelector('.agm-nav-expand').setAttribute('aria-expanded', 'false');
      });
    }
    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      closeGroups();
    }
    toggle.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      toggle.setAttribute('aria-expanded', String(!menu.hidden));
      toggle.setAttribute('aria-label', menu.hidden ? 'Открыть меню' : 'Закрыть меню');
    });
    groups.forEach(group => {
      const button = group.querySelector('.agm-nav-expand');
      const panel = group.querySelector('.agm-nav-panel');
      button.addEventListener('click', () => {
        const open = panel.hidden;
        closeGroups(group);
        panel.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
      });
      group.addEventListener('keydown', event => {
        if (event.key === 'Escape') { closeGroups(); button.focus(); event.stopPropagation(); }
      });
    });
    header.addEventListener('click', event => { if (event.target.closest('a')) { closeGroups(); closeMenu(); } });
    document.addEventListener('click', event => { if (!header.contains(event.target)) { closeGroups(); closeMenu(); } });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    matchMedia('(min-width:1001px)').addEventListener('change', closeMenu);
    if (window.ResizeObserver) new ResizeObserver(() => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', height + 'px');
      document.querySelectorAll('#shower-configurator,#door-configurator').forEach(el => el.style.scrollMarginTop = height + 'px');
    }).observe(header);
    const search = header.querySelector('.agm-search-toggle');
    if (search) search.addEventListener('click', () => {
      let dialog = document.getElementById('agm-header-search');
      if (!dialog) {
        dialog = document.createElement('dialog'); dialog.id = 'agm-header-search';
        dialog.innerHTML = '<form action="/" method="get"><label>Поиск по сайту<input name="s" type="search" required></label><button type="submit">Найти</button><button type="button" data-close>Закрыть</button></form>';
        document.body.append(dialog);
        dialog.querySelector('[data-close]').onclick = () => dialog.close();
      }
      dialog.showModal();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
