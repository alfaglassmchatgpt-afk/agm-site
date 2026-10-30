/* Use the same preference keys as the site's shared theme layer. */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'alfaglass-theme-mode';
  const legacyKey = 'alfaglass-home-theme';
  const media = matchMedia('(prefers-color-scheme: dark)');
  const read = name => { try { return localStorage.getItem(name); } catch (_) { return null; } };
  function savedMode() {
    const mode = read(key);
    if (['light', 'dark', 'system'].includes(mode)) return mode;
    const legacy = read(legacyKey);
    return ['light', 'dark'].includes(legacy) ? legacy : 'system';
  }
  let mode = savedMode();
  function apply() {
    const resolved = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    root.dataset.theme = resolved;
    root.dataset.themeMode = mode;
    root.style.colorScheme = resolved;
    const button = document.getElementById('theme');
    if (button) {
      button.setAttribute('aria-pressed', String(resolved === 'dark'));
      button.setAttribute('aria-label', resolved === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    }
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme');
    if (button) button.addEventListener('click', () => {
      mode = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, mode); localStorage.setItem(legacyKey, mode); } catch (_) {}
      apply();
    });
    apply();
  }, { once: true });
  const refresh = () => { mode = savedMode(); apply(); };
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === legacyKey || event.key === null) refresh();
  });
  const systemChanged = () => { if (mode === 'system') apply(); };
  if (media.addEventListener) media.addEventListener('change', systemChanged);
  else media.addListener(systemChanged);
})();
