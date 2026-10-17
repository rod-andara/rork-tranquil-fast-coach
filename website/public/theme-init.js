/* Apply the saved/system theme before first paint; storage is optional. */
(() => {
  let saved;
  try { saved = localStorage.getItem('tf-theme'); } catch (_) { /* Private browsing may block storage. */ }
  const dark = saved === 'dark' || (saved !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
