/**
 * UI_Toast — thông báo nổi ngắn gọn ở đầu màn hình, tự biến mất.
 */
const UI_Toast = (() => {
  function show(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'toast' + (type === 'err' ? ' err' : type === 'ok' ? ' ok' : '');
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => {
      el.style.transition = 'opacity 0.25s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 260);
    }, duration);
  }

  return { show };
})();
