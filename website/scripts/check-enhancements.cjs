/* Exercise privacy-browser failures without needing a browser automation dependency. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const publicDir = path.join(__dirname, '..', 'public');
function element() {
  const attributes = new Map();
  const listeners = new Map();
  const classes = new Set();
  return {
    hidden: true, focused: false, dataset: {},
    setAttribute: (k, v) => attributes.set(k, v),
    getAttribute: k => attributes.get(k) ?? null,
    addEventListener: (k, callback) => listeners.set(k, callback),
    focus() { this.focused = true; },
    fire: (k, event = {}) => listeners.get(k)?.(event),
    classList: {
      add: k => classes.add(k), remove: k => classes.delete(k),
      contains: k => classes.has(k),
      toggle: (k, state) => state ? classes.add(k) : classes.delete(k),
    },
  };
}
for (const blocked of [false, true]) {
  const root = element(), theme = element(), menu = element(), nav = element();
  const doc = element();
  const stored = new Map();
  const context = vm.createContext({
    document: Object.assign(doc, {
      documentElement: root,
      getElementById: id => ({ themeToggle: theme, menuToggle: menu, mainNavigation: nav })[id],
    }),
    window: { matchMedia: () => ({ matches: true }) },
    localStorage: {
      getItem: k => { if (blocked) throw Error('Storage unavailable'); return stored.get(k); },
      setItem: (k,v) => { if (blocked) throw Error('Storage unavailable'); stored.set(k,v); },
    },
  });
  vm.runInContext(fs.readFileSync(path.join(publicDir,'theme-init.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(publicDir,'site.js'),'utf8'),context);
  assert.equal(root.dataset.theme,'dark');
  assert.equal(theme.hidden,false);
  theme.fire('click');
  assert.equal(root.dataset.theme,'light');
  assert.equal(theme.getAttribute('aria-pressed'),'false');
  menu.fire('click');
  assert.equal(menu.getAttribute('aria-expanded'),'true');
  assert.equal(nav.classList.contains('is-open'),true);
  doc.fire('keydown',{key:'Escape'});
  assert.equal(menu.getAttribute('aria-expanded'),'false');
  assert.equal(menu.focused,true);
  menu.fire('click');
  nav.fire('click',{target:{closest:()=>({})}});
  assert.equal(menu.getAttribute('aria-expanded'),'false');
}
console.log('PASS: theme/menu initialization and interaction with available or blocked localStorage; Escape restores focus; navigation closes menu.');
