'use strict';

const Modal = {
  _el: null,

  init() {
    this._el = document.getElementById('modal-container');
  },

  show(opts) {
    if (!this._el) this.init();
    const { title, content, actions, size } = Object.assign({ size: 'medium' }, opts);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal modal-' + size + '">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + title + '</h3>' +
          '<button class="modal-close-btn" aria-label="Close">×</button>' +
        '</div>' +
        '<div class="modal-body">' + content + '</div>' +
        (actions ? '<div class="modal-footer">' + actions + '</div>' : '') +
      '</div>';

    this._el.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('modal-show'));

    overlay.querySelector('.modal-close-btn').onclick = () => this.close(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(overlay);
    });

    return overlay;
  },

  close(overlay) {
    overlay.classList.remove('modal-show');
    setTimeout(() => overlay.remove(), 300);
  },

  closeAll() {
    if (!this._el) return;
    this._el.querySelectorAll('.modal-overlay').forEach(m => m.remove());
  },

  confirm(opts) {
    const { title, message, confirmText, cancelText, onConfirm, onCancel } =
      Object.assign({ confirmText: 'Xác nhận', cancelText: 'Hủy' }, opts);

    const modal = this.show({
      title,
      content: '<p style="color:var(--text-secondary)">' + message + '</p>',
      actions:
        '<button class="btn btn-ghost" id="_mc">' + cancelText + '</button>' +
        '<button class="btn btn-primary" id="_mo">' + confirmText + '</button>',
      size: 'small'
    });

    modal.querySelector('#_mo').onclick = () => { if (onConfirm) onConfirm(); this.close(modal); };
    modal.querySelector('#_mc').onclick = () => { if (onCancel) onCancel(); this.close(modal); };
    return modal;
  }
};