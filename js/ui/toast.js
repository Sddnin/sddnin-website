'use strict';

const Toast = {
  _el: null,

  init() {
    this._el = document.getElementById('toast-container');
  },

  show(msg, type, duration) {
    if (!this._el) this.init();
    type = type || 'info';
    duration = duration || 3500;

    const icons = { success: '✓', error: '✕', warning: '!', info: 'i' };
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML =
      '<span class="toast-icon">' + (icons[type] || 'i') + '</span>' +
      '<span class="toast-message">' + msg + '</span>' +
      '<button class="toast-close" aria-label="Close">×</button>';

    el.querySelector('.toast-close').onclick = () => this._remove(el);
    this._el.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast-show'));
    setTimeout(() => this._remove(el), duration);
  },

  _remove(el) {
    el.classList.remove('toast-show');
    setTimeout(() => el.remove(), 300);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};
