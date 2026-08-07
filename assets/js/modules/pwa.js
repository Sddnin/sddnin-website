// pwa.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // sw.js nằm ở thư mục gốc
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ SW registered:', reg.scope))
      .catch(err => console.warn('❌ SW registration failed:', err));
  });
}
