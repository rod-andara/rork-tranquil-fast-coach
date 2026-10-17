/* Progressive enhancement only: all information and links work without JS. */
(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let saved;
  try { saved = localStorage.getItem('tf-theme'); } catch (_) { /* Storage can be blocked. */ }
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  function setTheme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  setTheme(saved === 'dark' || (saved !== 'light' && systemDark));
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      setTheme(root.dataset.theme !== 'dark');
      try { localStorage.setItem('tf-theme', root.dataset.theme); } catch (_) { /* Keep this tab's choice. */ }
    });
  }
  const button = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNavigation');
  if (button && nav) {
    function closeMenu() { nav.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); }
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { closeMenu(); button.focus(); }
    });
    button.hidden = false;
    root.classList.add('js');
  }
})();
