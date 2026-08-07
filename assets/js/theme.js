// === FILE: theme.js ===
// Dark mode manager

(function() {
    'use strict';

    const ThemeManager = {
        init() {
            const savedTheme = StorageManager.getTheme();
            this.applyTheme(savedTheme);
            this.setupToggle();
        },

        applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            this.updateToggleButton(theme);
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            StorageManager.saveTheme(newTheme);
        },

        updateToggleButton(theme) {
            const btn = document.getElementById('theme-toggle');
            if (btn) {
                btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        },

        setupToggle() {
            const btn = document.getElementById('theme-toggle');
            if (btn) {
                btn.addEventListener('click', () => this.toggle());
            }
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
    } else {
        ThemeManager.init();
    }

    window.ThemeManager = ThemeManager;
})();
