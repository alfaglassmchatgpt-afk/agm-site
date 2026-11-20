/* The label and chevron both toggle the existing panel, with no extra navigation. */
(() => {
  function init() {
    document.querySelectorAll('header [id$="desktop-products"],header [id$="mobile-products"]').forEach(panel => {
      const group = panel.closest('.nav-dropdown,.agm-nav-dropdown');
      if (!group || group.dataset.catalogReady) return;
      group.dataset.catalogReady = 'true';
      const parent = group.querySelector('.nav-parent,.agm-nav-parent');
      const button = parent.querySelector('button');
      const label = parent.querySelector('a');
      // Own hover handling on both header versions; touch retains click behaviour.
      let leaveTimer;
      group.addEventListener('pointerenter', event => {
        event.stopImmediatePropagation();
        if (event.pointerType !== 'mouse' || !group.closest('.desktop-nav')) return;
        clearTimeout(leaveTimer);
        group.closest('header').querySelectorAll('.nav-dropdown,.agm-nav-dropdown').forEach(other => {
          const otherPanel = other.querySelector('.nav-panel,.agm-nav-panel');
          const otherButton = other.querySelector('.nav-expand,.agm-nav-expand');
          if (otherPanel && otherButton) { otherPanel.hidden = other !== group; otherButton.setAttribute('aria-expanded', String(other === group)); }
        });
      }, true);
      group.addEventListener('pointerleave', event => {
        event.stopImmediatePropagation();
        if (event.pointerType !== 'mouse' || !group.closest('.desktop-nav')) return;
        leaveTimer = setTimeout(() => {
          if (!group.contains(document.activeElement)) { panel.hidden = true; button.setAttribute('aria-expanded', 'false'); }
        }, 150);
      }, true);
      label.setAttribute('role', 'button');
      label.setAttribute('aria-controls', panel.id);
      label.setAttribute('aria-expanded', 'false');
      const sync = () => label.setAttribute('aria-expanded', String(!panel.hidden));
      new MutationObserver(sync).observe(panel, {attributes:true,attributeFilter:['hidden']});
      // Reuse the page's existing chevron handler to keep outside-click and Escape behaviour.
      label.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); button.click(); }, true);
      label.addEventListener('keydown', event => { if(event.key === ' ') { event.preventDefault(); label.click(); } });
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
