/* The label and chevron both toggle the existing panel, with no extra navigation. */
(() => {
  function init() {
    document.querySelectorAll('header [id$="desktop-products"],header [id$="mobile-products"]').forEach(panel => {
      const group = panel.closest('.nav-dropdown,.agm-nav-dropdown');
      if (!group || group.dataset.catalogReady) return;
      group.dataset.catalogReady = 'true';
      // Older homepage scripts open on hover; catalogue activation is click-only.
      ['pointerenter','pointerleave'].forEach(type => group.addEventListener(type, event => event.stopImmediatePropagation(), true));
      const parent = group.querySelector('.nav-parent,.agm-nav-parent');
      const button = parent.querySelector('button');
      const label = parent.querySelector('a');
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
