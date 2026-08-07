// === FILE: app.js ===
// Điều khiển ứng dụng chính

(function() {
    'use strict';

    // Khởi tạo ứng dụng
    function initApp() {
        console.log('Korean Flashcard Hub initialized');
        
        // Kiểm tra và áp dụng theme đã lưu
        const savedTheme = StorageManager.getTheme();
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeButton(savedTheme);
        }

        // Highlight active nav link
        highlightActiveNav();
        
        // Khởi tạo theme toggle
        initThemeToggle();
    }

    // Highlight navigation link hiện tại
    function highlightActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentPath.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }

    // Khởi tạo nút chuyển theme
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                StorageManager.saveTheme(newTheme);
                updateThemeButton(newTheme);
            });
        }
    }

    // Cập nhật icon nút theme
    function updateThemeButton(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Format số với dấu phẩy
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Tạo element với class và attributes
    function createElement(tag, className, attributes = {}) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    // Export utilities
    window.AppUtils = {
        formatNumber,
        createElement,
        initApp
    };

    // Chạy khi DOM ready
    document.addEventListener('DOMContentLoaded', initApp);
})();
