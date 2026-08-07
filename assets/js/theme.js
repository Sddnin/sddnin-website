// theme.js
(function() {
  const ThemeManager = {
    init() {
      this.applySavedOrDefault();
      this.setupToggle();
      this.watchSystemTheme();
    },
    applySavedOrDefault() {
      const saved = StorageManager.getTheme(); // 'light','dark','auto'
      if (saved === 'auto' || !saved) {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyTheme(systemDark ? 'dark' : 'light');
        if (!saved) StorageManager.saveTheme('auto');
      } else {
        this.applyTheme(saved);
      }
    },
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateButton(theme);
    },
    toggle() {
      let current = StorageManager.getTheme() || 'auto';
      if (current === 'auto') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        current = systemDark ? 'dark' : 'light';
      }
      const newTheme = current === 'dark' ? 'light' : 'dark';
      StorageManager.saveTheme(newTheme);
      this.applyTheme(newTheme);
    },
    updateButton(theme) {
      const btn = document.getElementById('theme-toggle');
      if (btn) {
        if (theme === 'dark') btn.textContent = '☀️';
        else if (theme === 'light') btn.textContent = '🌙';
        else { // auto
          const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          btn.textContent = sysDark ? '🌙' : '☀️';
        }
      }
    },
    watchSystemTheme() {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (StorageManager.getTheme() === 'auto') {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    },
    setupToggle() {
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.addEventListener('click', () => this.toggle());
    }
  };
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  window.ThemeManager = ThemeManager;
})();
