'use strict';

const Router = {
  _routes: {},
  _current: null,
  _guard: null,

  register(path, handler) {
    this._routes[path] = handler;
  },

  beforeEach(fn) {
    this._guard = fn;
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  getCurrent() {
    return this._current;
  },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  },

  _resolve() {
    let hash = window.location.hash.slice(1) || '/home';

    if (this._guard) {
      const redirect = this._guard(hash);
      if (redirect && redirect !== hash) {
        window.location.hash = '#' + redirect;
        return;
      }
    }

    let handler = this._routes[hash];
    let params = {};

    if (!handler) {
      for (const [pattern, h] of Object.entries(this._routes)) {
        const regex = new RegExp(
          '^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:[\w]+/g, '([\\w-]+)') + '$'
        );
        const match = hash.match(regex);
        if (match) {
          handler = h;
          const keys = (pattern.match(/:[\w]+/g) || []).map(k => k.slice(1));
          keys.forEach((k, i) => { params[k] = match[i + 1]; });
          break;
        }
      }
    }

    if (handler) {
      this._current = hash;
      const container = document.getElementById('app');
      if (container) {
        container.innerHTML = '';
        handler(container, params);
      }
      this._highlightNav(hash);
      window.scrollTo(0, 0);
    } else {
      this.navigate('/home');
    }
  },

  _highlightNav(hash) {
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const route = link.getAttribute('data-route');
      const isActive = route === hash || (hash.startsWith(route) && route !== '/home');
      link.classList.toggle('active', isActive);
    });
  }
};