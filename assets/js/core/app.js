// app.js - khởi tạo chung
(function() {
  // Highlight active nav
  const currentPath = window.location.pathname;
  document.querySelectorAll('.header__nav a').forEach(link => {
    if (currentPath.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });
})();
