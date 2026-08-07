// theme.js
const ThemeManager = (() => {
  const STORAGE_KEY = 'kf_theme';

  function init() {
    applyTheme(getSavedTheme());
    document.getElementById('theme-toggle')?.addEventListener('click', toggle);
    watchSystem();
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'auto';
  }

  function applyTheme(theme) {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    updateToggleIcon(theme);
  }

  function toggle() {
    const current = getSavedTheme();
    let next;
    if (current === 'auto') {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      next = isDark ? 'light' : 'dark';
    } else if (current === 'dark') {
      next = 'light';
    } else {
      next = 'dark';
    }
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    if (theme === 'dark') btn.textContent = '☀️';
    else if (theme === 'light') btn.textContent = '🌙';
    else {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      btn.textContent = sysDark ? '🌙' : '☀️';
    }
  }

  function watchSystem() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getSavedTheme() === 'auto') applyTheme('auto');
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', ThemeManager.init);
