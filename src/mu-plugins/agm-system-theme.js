/* Shared preference layer for the existing page-specific theme switches. */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'alfaglass-theme-mode';
  const legacyKey = 'alfaglass-home-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const labels = { system: 'Как на устройстве', light: 'Светлая', dark: 'Тёмная' };
  const selector = 'button.theme-toggle, button#theme-toggle';
  const read = name => { try { return localStorage.getItem(name); } catch (_) { return null; } };
  function savedMode() {
    const value = read(key);
    if (Object.prototype.hasOwnProperty.call(labels, value)) return value;
    const old = read(legacyKey);
    return old === 'light' || old === 'dark' ? old : 'system';
  }
  let mode = savedMode();
  let panel, trigger;
  function apply() {
    const resolved = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    root.dataset.theme = resolved;
    root.dataset.themeMode = mode;
    root.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'dark' ? '#0a1721' : '#f8fbff';
    document.querySelectorAll(selector).forEach(button => {
      button.removeAttribute('aria-pressed');
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-controls', 'agm-theme-choice');
      button.setAttribute('aria-expanded', String(button === trigger && panel && !panel.hidden || false));
      button.setAttribute('aria-label', 'Тема оформления: ' + labels[mode]);
      button.title = 'Тема оформления: ' + labels[mode];
    });
    if (panel) panel.querySelectorAll('button').forEach(button => button.setAttribute('aria-checked', String(button.dataset.mode === mode)));
  }
  function select(value) {
    mode = value;
    try {
      localStorage.setItem(key, mode);
      if (mode === 'system') localStorage.removeItem(legacyKey);
      else localStorage.setItem(legacyKey, mode);
    } catch (_) { /* The current tab still works when storage is unavailable. */ }
    apply();
  }
  function close(restoreFocus = false) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    apply();
    if (restoreFocus && trigger) trigger.focus();
  }
  function open(button) {
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'agm-theme-choice';
      panel.hidden = true;
      panel.setAttribute('role', 'menu');
      panel.setAttribute('aria-label', 'Тема оформления');
      Object.entries(labels).forEach(([value, label]) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.dataset.mode = value;
        item.setAttribute('role', 'menuitemradio');
        item.textContent = label;
        item.addEventListener('click', () => { select(value); close(true); });
        panel.append(item);
      });
      document.body.append(panel);
    }
    if (!panel.hidden && trigger === button) { close(true); return; }
    trigger = button;
    panel.hidden = false;
    const rect = button.getBoundingClientRect();
    panel.style.left = Math.max(12, Math.min(rect.right - panel.offsetWidth, window.innerWidth - panel.offsetWidth - 12)) + 'px';
    panel.style.top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - panel.offsetHeight - 12)) + 'px';
    apply();
    panel.querySelector('[aria-checked="true"]').focus();
  }
  // Capture avoids a second toggle by the existing per-page click handlers.
  document.addEventListener('click', event => {
    const button = event.target.closest(selector);
    if (button) { event.preventDefault(); event.stopImmediatePropagation(); open(button); }
    else if (panel && !panel.contains(event.target)) close();
  }, true);
  document.addEventListener('keydown', event => {
    if (!panel || panel.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const items = [...panel.querySelectorAll('button')];
      const index = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next].focus();
    } else if (event.key === 'Tab') close();
  });
  const systemChanged = () => { if (mode === 'system') apply(); };
  if (media.addEventListener) media.addEventListener('change', systemChanged);
  else media.addListener(systemChanged);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === legacyKey || event.key === null) { mode = savedMode(); apply(); }
  });
  window.addEventListener('resize', () => close());
  window.addEventListener('scroll', () => close(), true);
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
})();
