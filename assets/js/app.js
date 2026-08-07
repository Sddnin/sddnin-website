document.addEventListener("DOMContentLoaded", () => {
    App.init();
});

const App = {
    init() {
        this.initTheme();
        this.updateHeaderStats();
    },

    // Phát âm tiếng Hàn chuẩn TTS
    speakKorean(text) {
        if (!('speechSynthesis' in window)) {
            alert("Trình duyệt của bạn không hỗ trợ tính năng phát âm!");
            return;
        }
        window.speechSynthesis.cancel(); // Dừng câu đọc trước đó
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.85; // Tốc độ đọc chuẩn cho người học
        window.speechSynthesis.speak(utterance);
    },

    // Hiển thị Streak & Số từ đã thuộc lên UI
    updateHeaderStats() {
        const stats = StorageManager.getStats();
        const streakEl = document.getElementById('user-streak');
        const learnedEl = document.getElementById('user-learned-count');

        if (streakEl) streakEl.textContent = `🔥 ${stats.streak} ngày`;
        if (learnedEl) learnedEl.textContent = `✅ ${stats.totalLearned} từ`;
    },

    // Khởi tạo Theme
    initTheme() {
        const savedTheme = localStorage.getItem('sddnin_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
};
