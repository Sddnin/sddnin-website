/* ==========================================================================
   HỌC TIẾNG HÀN 3.0 — app.js
   Flashcard + 4 Mini Games + Gemini AI (Tra từ / AI Chat / Chấm phát âm)

   Cấu trúc file (đọc theo thứ tự):
     1. APP STATE
     2. DATA MANAGEMENT (localStorage) — an toàn tuyệt đối
     3. UTILITY & TIMERS — clearGameTimers dùng chung cho mọi mini-game
     4. THEME (Dark/Light)
     5. NAVIGATION (Mode switcher + Category filter)
     6. FLASHCARD SYSTEM
     7. MODAL: Thêm từ mới
     8. EXPORT / IMPORT JSON
     9. DICTIONARY (Tra từ bằng Gemini AI)
    10. MINI GAME 1: Trắc nghiệm (Quiz)
    11. MINI GAME 2: Nối từ (Cross-match 2 cột, đúng cấu trúc HTML thật)
    12. MINI GAME 3: Gõ phím (Typing)
    13. MINI GAME 4: Luyện nói (SpeechRecognition + Gemini chấm điểm %)
    14. GEMINI AI CORE (gọi API dùng chung cho mọi tính năng ở trên)
    15. AI CHAT (hội thoại luyện tiếng Hàn theo kịch bản)
    16. TEXT-TO-SPEECH (phát âm mẫu)
    17. EVENT LISTENERS (setupEventListeners — nối TOÀN BỘ nút trong HTML)
    18. BOOTSTRAP
   ========================================================================== */

/* ==========================================================================
   1. APP STATE
   ========================================================================== */
let masterDeck = [];          // Toàn bộ từ vựng đã lưu (nguồn sự thật duy nhất)
let filteredDeck = [];        // Danh sách sau khi lọc theo category — Flashcard chạy trên deck này
let currentIndex = 0;         // Vị trí thẻ hiện tại trong filteredDeck
let activeCategory = 'ALL';   // Category đang chọn ở category-bar
let activeMode = 'dict';      // Mode hiện tại: dict | flashcard | game | aichat
let activeSubGame = 'speaking'; // Sub-game hiện tại trong Mini Games (HTML mặc định active là speaking)

// Timer/interval dùng chung cho MỌI mini-game — clearGameTimers() dọn tất cả
let gameTimers = [];

// --- Quiz (Trắc nghiệm) ---
let isProcessingQuiz = false; // Chặn double-click / double-submit khi đang xử lý đáp án
let currentQuiz = null;
let quizScore = 0;
let quizStreak = 0;

// --- Match (Nối từ — cấu trúc cross-match 2 cột) ---
let isProcessingMatch = false; // Chặn double-click khi 1 cặp đang trong quá trình xử lý
let matchPairs = [];           // [{id, kr, vi}] — cặp từ đang chơi trong lượt hiện tại
let matchSelectedKr = null;    // Phần tử <div> cột Hàn đang được chọn
let matchSelectedVi = null;    // Phần tử <div> cột Việt đang được chọn
let matchRemaining = 0;        // Số cặp còn lại chưa nối đúng trong lượt này

// --- Typing (Gõ phím) ---
let currentTypingWord = null;
let typingScore = 0;
let isProcessingTyping = false; // Chặn double-submit khi đang chuyển câu

// --- Speaking (Luyện nói) ---
let currentSpeakingWord = null;
let speechRecognizer = null;    // Instance SpeechRecognition (khởi tạo 1 lần, tái sử dụng)
let isRecording = false;
let isEvaluatingSpeech = false; // Chặn bấm mic liên tục trong lúc đang gọi AI chấm điểm

// --- AI Chat ---
let activeScenario = 'free';
let isSendingChatMessage = false; // Chặn double-send
let chatRecognizer = null;
let isChatRecording = false;

// --- Dictionary (Tra từ) ---
let isDictSearching = false;
let lastDictResult = null; // Kết quả tra gần nhất để nút "Lưu vào bộ từ vựng" dùng

/* ==========================================================================
   2. DATA MANAGEMENT (LOCALSTORAGE) — an toàn tuyệt đối
   ========================================================================== */

/**
 * Kiểm tra 1 object có đủ hình dạng hợp lệ của 1 thẻ từ vựng hay không.
 * Dùng để lọc bỏ rác/hỏng khi đọc từ localStorage, tránh việc 1 phần tử
 * hỏng làm sập toàn bộ app (ví dụ: c.front.trim() nếu c.front undefined).
 */
function isValidCard(c) {
    return !!(c && typeof c === 'object' && typeof c.front === 'string' && c.front.trim() !== '' && typeof c.back === 'string');
}

/**
 * Chuẩn hoá 1 thẻ: đảm bảo đủ field, đúng kiểu dữ liệu, không bao giờ undefined.
 * Mọi nơi tạo/đọc thẻ trong app đều đi qua hàm này để đồng nhất cấu trúc.
 */
function normalizeCard(raw) {
    return {
        front: String(raw.front || '').trim(),
        back: String(raw.back || '').trim(),
        roman: String(raw.roman || '').trim(),
        category: String(raw.category || 'Chung').trim(),
        fav: raw.fav === true,
        hard: raw.hard === true
    };
}

function loadData() {
    let loaded = [];
    try {
        const saved = localStorage.getItem('masterDeck');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                loaded = parsed.filter(isValidCard).map(normalizeCard);
            }
        }
    } catch (e) {
        console.warn('Dữ liệu localStorage bị hỏng, khôi phục dữ liệu mẫu:', e);
        loaded = [];
    }

    if (loaded.length === 0) {
        loaded = getSampleData();
    }

    masterDeck = loaded;
    saveData(); // Ghi lại bản đã chuẩn hoá + đồng bộ filteredDeck ngay từ đầu
}

function saveData() {
    try {
        localStorage.setItem('masterDeck', JSON.stringify(masterDeck));
    } catch (e) {
        console.error('Không thể lưu vào localStorage (có thể đã đầy):', e);
        showToast('Lỗi: Không thể lưu dữ liệu (bộ nhớ trình duyệt đầy)', 'error');
    }
    applyCategoryFilter(); // Luôn đồng bộ filteredDeck sau mỗi lần thay đổi masterDeck
}

function getSampleData() {
    return [
        { front: '안녕하세요', back: 'Xin chào', roman: 'An-nyeong-ha-se-yo', category: 'Giao tiếp', fav: false, hard: false },
        { front: '감사합니다', back: 'Cảm ơn', roman: 'Gam-sa-ham-ni-da', category: 'Giao tiếp', fav: false, hard: false },
        { front: '사과', back: 'Quả táo', roman: 'Sa-gwa', category: 'Du lịch', fav: false, hard: false },
        { front: '물', back: 'Nước', roman: 'Mul', category: 'Du lịch', fav: false, hard: false },
        { front: '학교', back: 'Trường học', roman: 'Hak-gyo', category: 'TOPIK 1', fav: false, hard: false },
        { front: '사랑해요', back: 'Anh/Em yêu em/anh', roman: 'Sa-rang-hae-yo', category: 'Giao tiếp', fav: true, hard: false }
    ];
}

/**
 * Lọc masterDeck theo activeCategory và ghi vào filteredDeck.
 * Đây là NƠI DUY NHẤT được phép gán lại filteredDeck, để đảm bảo
 * mọi thao tác thêm/sửa/xoá từ đều tự động phản ánh đúng vào Flashcard.
 */
function applyCategoryFilter() {
    if (!Array.isArray(masterDeck)) masterDeck = [];

    if (activeCategory === 'ALL') {
        filteredDeck = [...masterDeck];
    } else if (activeCategory === 'Yêu thích') {
        filteredDeck = masterDeck.filter(c => c.fav);
    } else {
        filteredDeck = masterDeck.filter(c => c.category === activeCategory);
    }

    // currentIndex có thể vượt quá độ dài mới sau khi lọc/xoá — kẹp lại an toàn
    if (filteredDeck.length === 0) {
        currentIndex = 0;
    } else if (currentIndex >= filteredDeck.length) {
        currentIndex = filteredDeck.length - 1;
    } else if (currentIndex < 0) {
        currentIndex = 0;
    }
}

/* ==========================================================================
   3. UTILITY & TIMERS
   ========================================================================== */
function setGameTimeout(callback, delay) {
    const timer = setTimeout(() => {
        // Tự loại timer khỏi mảng theo dõi sau khi chạy xong, tránh mảng phình to
        gameTimers = gameTimers.filter(t => t !== timer);
        callback();
    }, delay);
    gameTimers.push(timer);
    return timer;
}

/** Dọn dẹp TOÀN BỘ timer đang chờ của mọi mini-game. Gọi mỗi khi rời màn hình game
 *  hoặc chuyển sub-game, để tránh: 2 vòng lặp game chạy chồng nhau, timer cũ
 *  gọi vào DOM của sub-game khác (kẹt trạng thái / treo giao diện). */
function clearGameTimers() {
    gameTimers.forEach(timer => clearTimeout(timer));
    gameTimers = [];
}

/** Reset toàn bộ cờ "đang xử lý" của mọi mini-game — gọi kèm clearGameTimers()
 *  khi chuyển sub-game để đảm bảo không bị kẹt ở trạng thái "đang chấm điểm"
 *  của sub-game trước đó khi quay lại. */
function resetProcessingFlags() {
    isProcessingQuiz = false;
    isProcessingMatch = false;
    isProcessingTyping = false;
    // isEvaluatingSpeech và isRecording được xử lý riêng trong stopSpeakingRecognition()
    // vì chúng gắn với SpeechRecognition đang chạy thật sự (cần dừng, không chỉ reset cờ)
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function setElementHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function showToast(message, type) {
    // Hiển thị phản hồi nhẹ nhàng không chặn UI (thay thế alert()).
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); padding:10px 20px; border-radius:20px; color:white; font-size:13px; font-weight:600; z-index:1000; box-shadow:0 4px 15px rgba(0,0,0,0.2); max-width:90%; text-align:center; transition:opacity 0.3s;';
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'error' ? 'var(--danger-color, #e74c3c)' : (type === 'success' ? 'var(--success-color, #2ecc71)' : '#333');
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.display = 'block';

    if (toast._hideTimer) clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 300);
    }, 2600);
}

/* ==========================================================================
   3.5. STREAK TRACKING (số ngày học liên tiếp — hiển thị ở #daily-streak)
   ========================================================================== */

/** Trả về chuỗi ngày dạng YYYY-MM-DD theo giờ địa phương, dùng làm khoá so sánh ngày. */
function getLocalDateKey(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

/**
 * Cập nhật số ngày học liên tiếp mỗi khi mở app:
 * - Nếu hôm nay đã tính rồi (mở app nhiều lần trong ngày) -> giữ nguyên streak.
 * - Nếu lần truy cập gần nhất là hôm qua -> streak + 1 (duy trì chuỗi).
 * - Nếu cách xa hơn 1 ngày (bỏ lỡ) -> reset streak về 1 (bắt đầu chuỗi mới).
 * - Nếu chưa từng có dữ liệu -> khởi tạo streak = 1.
 */
function updateDailyStreak() {
    let streak = 1;
    try {
        const todayKey = getLocalDateKey();
        const lastVisit = localStorage.getItem('lastVisitDate');
        const savedStreak = parseInt(localStorage.getItem('dailyStreak'), 10);
        const validSavedStreak = Number.isFinite(savedStreak) && savedStreak > 0 ? savedStreak : 1;

        if (lastVisit === todayKey) {
            streak = validSavedStreak; // Đã mở app hôm nay rồi, giữ nguyên
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = getLocalDateKey(yesterday);

            streak = (lastVisit === yesterdayKey) ? validSavedStreak + 1 : 1;

            localStorage.setItem('lastVisitDate', todayKey);
            localStorage.setItem('dailyStreak', String(streak));
        }
    } catch (e) {
        console.warn('Không thể tính streak (localStorage lỗi):', e);
        streak = 1;
    }

    setElementText('daily-streak', streak);
}

/* ==========================================================================
   4. THEME (Dark / Light)
   ========================================================================== */
function loadTheme() {
    let isDark = false;
    try {
        isDark = localStorage.getItem('theme') === 'dark';
    } catch (e) { /* localStorage không khả dụng — mặc định sáng */ }
    applyTheme(isDark);
}

function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.classList.toggle('fa-moon', !isDark);
        icon.classList.toggle('fa-sun', isDark);
    }
}

function toggleTheme() {
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) { /* bỏ qua nếu không lưu được, giao diện vẫn đổi đúng trong phiên này */ }
}

/* ==========================================================================
   5. NAVIGATION (Mode switcher + Category filter)
   ========================================================================== */
const MODE_CONTAINER_IDS = {
    dict: 'dict-container',
    flashcard: 'fc-main-wrapper',
    game: 'game-main-container',
    aichat: 'aichat-main-container'
};

function switchMode(mode) {
    if (!MODE_CONTAINER_IDS[mode]) return;

    // Rời khỏi mode game: dừng mọi timer/cờ xử lý đang chạy để tránh
    // treo giao diện khi quay lại. Luôn dừng ghi âm/phát âm khi đổi mode
    // bất kể đang ở mode nào, để không rò rỉ tiến trình nền sang mode mới.
    if (activeMode === 'game') {
        clearGameTimers();
        resetProcessingFlags();
    }
    stopSpeakingRecognition();
    stopChatRecognition();
    stopAllSpeech();

    activeMode = mode;

    Object.entries(MODE_CONTAINER_IDS).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (key === mode) ? 'block' : 'none';
    });

    document.querySelectorAll('.mode-switcher button[data-mode]').forEach(btn => {
        btn.classList.toggle('active-mode', btn.dataset.mode === mode);
    });

    if (mode === 'flashcard') {
        updateCard();
    } else if (mode === 'game') {
        // Vào lại Mini Games luôn khởi động đúng sub-game đang active, tránh
        // trường hợp màn hình trống vì timer trước đó bị clear giữa chừng.
        switchSubGame(activeSubGame);
    }
}

function switchCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.cat-chip[data-cat]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    applyCategoryFilter();
    currentIndex = 0;
    if (activeMode === 'flashcard') updateCard();
}

/* ==========================================================================
   6. FLASHCARD SYSTEM
   ========================================================================== */

/** Cập nhật toàn bộ UI thẻ hiện tại. LUÔN reset mặt thẻ về mặt trước trước,
 *  để không bao giờ xảy ra tình trạng thẻ mới hiện ra nhưng vẫn đang lật mặt sau. */
function updateCard() {
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('is-flipped');

    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) {
        setElementText('front-text', 'Chưa có từ vựng');
        setElementText('back-text', 'Vui lòng thêm từ mới');
        setElementText('front-roman', '');
        setElementText('back-roman', '');
        setElementText('front-cat', 'Rỗng');
        setElementText('back-cat', 'Rỗng');
        setElementText('current-idx', '0');
        setElementText('total-idx', '0');

        const fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = '0%';

        const btnFav = document.getElementById('btn-fav');
        if (btnFav) btnFav.className = '';
        const btnHard = document.getElementById('btn-hard');
        if (btnHard) btnHard.className = '';

        setElementText('count-badge', masterDeck.length);
        return;
    }

    // Kẹp currentIndex an toàn (phòng trường hợp deck đổi kích thước từ nơi khác)
    if (currentIndex >= filteredDeck.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = filteredDeck.length - 1;

    const c = filteredDeck[currentIndex];
    setElementText('front-text', c.front || '');
    setElementText('back-text', c.back || '');
    setElementText('front-roman', c.roman || '');
    setElementText('back-roman', c.roman || '');
    setElementText('front-cat', c.category || 'Chủ đề');
    setElementText('back-cat', c.category || 'Chủ đề');
    setElementText('current-idx', currentIndex + 1);
    setElementText('total-idx', filteredDeck.length);

    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = ((currentIndex + 1) / filteredDeck.length * 100) + '%';

    const btnFav = document.getElementById('btn-fav');
    if (btnFav) btnFav.className = c.fav ? 'active-love' : '';

    const btnHard = document.getElementById('btn-hard');
    if (btnHard) btnHard.className = c.hard ? 'active-hard' : '';

    setElementText('count-badge', masterDeck.length);
}

function nextCard() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredDeck.length;
    updateCard();
}

function prevCard() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredDeck.length) % filteredDeck.length;
    updateCard();
}

function flipCard() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    const card = document.getElementById('flashcard');
    if (card) card.classList.toggle('is-flipped');
}

/** Tìm từ trong flashcard theo tiếng Hàn/Việt/phiên âm, nhảy đến thẻ đầu tiên khớp. */
function searchFlashcard() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const q = input.value.trim().toLowerCase();
    if (!q) return;

    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) {
        showToast('Không có từ vựng nào trong danh mục hiện tại', 'error');
        return;
    }

    const idx = filteredDeck.findIndex(c =>
        (c.front || '').toLowerCase().includes(q) ||
        (c.back || '').toLowerCase().includes(q) ||
        (c.roman || '').toLowerCase().includes(q)
    );

    if (idx === -1) {
        showToast('Không tìm thấy từ phù hợp', 'error');
        return;
    }

    currentIndex = idx;
    updateCard();
}

function toggleFavorite() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    const current = filteredDeck[currentIndex];
    const target = masterDeck.find(c => c === current || (c.front === current.front && c.back === current.back));
    if (!target) return;
    target.fav = !target.fav;
    saveData();
    updateCard();
}

function toggleHard() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    const current = filteredDeck[currentIndex];
    const target = masterDeck.find(c => c === current || (c.front === current.front && c.back === current.back));
    if (!target) return;
    target.hard = !target.hard;
    saveData();
    updateCard();
}

function deleteCurrentCard() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    const current = filteredDeck[currentIndex];

    const idxInMaster = masterDeck.findIndex(c => c === current || (c.front === current.front && c.back === current.back));
    if (idxInMaster === -1) return;

    if (!window.confirm('Xóa từ "' + current.front + '" khỏi bộ từ vựng?')) return;

    masterDeck.splice(idxInMaster, 1);
    saveData(); // saveData() tự gọi applyCategoryFilter() và kẹp currentIndex an toàn
    updateCard();
    showToast('Đã xóa từ', 'success');
}

function playCardAudio() {
    if (!Array.isArray(filteredDeck) || filteredDeck.length === 0) return;
    const c = filteredDeck[currentIndex];
    speak(c.front, 'ko-KR');
}

/* ==========================================================================
   7. MODAL: Thêm từ mới
   ========================================================================== */
function openAddModal() {
    const modal = document.getElementById('add-modal');
    if (!modal) return;
    ['new-kr', 'new-rm', 'new-vi', 'new-cat'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    modal.style.display = 'flex';
    const firstInput = document.getElementById('new-kr');
    if (firstInput) firstInput.focus();
}

function closeAddModal() {
    const modal = document.getElementById('add-modal');
    if (modal) modal.style.display = 'none';
}

function saveNewWordFromModal() {
    const kr = (document.getElementById('new-kr')?.value || '').trim();
    const rm = (document.getElementById('new-rm')?.value || '').trim();
    const vi = (document.getElementById('new-vi')?.value || '').trim();
    const cat = (document.getElementById('new-cat')?.value || '').trim();

    if (!kr || !vi) {
        showToast('Vui lòng nhập ít nhất Tiếng Hàn và Nghĩa tiếng Việt', 'error');
        return;
    }

    const newCard = normalizeCard({ front: kr, back: vi, roman: rm, category: cat || 'Chung', fav: false, hard: false });
    masterDeck.push(newCard);
    saveData();

    closeAddModal();
    showToast('Đã thêm từ mới!', 'success');

    // Nếu đang ở Flashcard, nhảy tới từ vừa thêm để người dùng thấy ngay kết quả
    if (activeMode === 'flashcard') {
        const idx = filteredDeck.findIndex(c => c === newCard || (c.front === newCard.front && c.back === newCard.back));
        if (idx !== -1) currentIndex = idx;
        updateCard();
    }
}

/* ==========================================================================
   8. EXPORT / IMPORT JSON
   ========================================================================== */
function exportData() {
    try {
        const dataStr = JSON.stringify(masterDeck, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'korean-vocab-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã xuất dữ liệu JSON', 'success');
    } catch (e) {
        console.error('Lỗi xuất dữ liệu:', e);
        showToast('Lỗi khi xuất dữ liệu', 'error');
    }
}

function triggerImport() {
    const fileInput = document.getElementById('import-file');
    if (fileInput) fileInput.click();
}

function handleImportFile(event) {
    const file = event.target && event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!Array.isArray(parsed)) {
                throw new Error('File JSON phải chứa một mảng các từ vựng');
            }
            const validCards = parsed.filter(isValidCard).map(normalizeCard);
            if (validCards.length === 0) {
                throw new Error('Không tìm thấy từ vựng hợp lệ nào trong file');
            }

            const merge = window.confirm(
                'Tìm thấy ' + validCards.length + ' từ hợp lệ.\n\nOK = Gộp vào bộ từ hiện tại\nCancel = Thay thế toàn bộ bộ từ hiện tại'
            );

            masterDeck = merge ? [...masterDeck, ...validCards] : validCards;
            currentIndex = 0;
            saveData();
            updateCard();
            showToast('Đã nhập ' + validCards.length + ' từ vựng', 'success');
        } catch (err) {
            console.error('Lỗi nhập file:', err);
            showToast('File JSON không hợp lệ: ' + err.message, 'error');
        } finally {
            // Reset input để có thể chọn lại cùng 1 file lần nữa nếu cần
            event.target.value = '';
        }
    };
    reader.onerror = () => {
        showToast('Không thể đọc file', 'error');
        event.target.value = '';
    };
    reader.readAsText(file);
}

function openExportImportMenu() {
    const choice = window.confirm('OK = Xuất dữ liệu ra file JSON\nCancel = Nhập dữ liệu từ file JSON');
    if (choice) {
        exportData();
    } else {
        triggerImport();
    }
}

/* ==========================================================================
   9. DICTIONARY (Tra từ bằng Gemini AI)
   ========================================================================== */
async function performDictSearch() {
    if (isDictSearching) return; // Chống bấm đúp

    const input = document.getElementById('dict-input');
    const query = ((input && input.value) || '').trim();
    if (!query) {
        showToast('Vui lòng nhập từ cần tra', 'error');
        return;
    }

    const resultBox = document.getElementById('dict-result');
    const searchBtn = document.getElementById('btn-dict-search');

    isDictSearching = true;
    if (searchBtn) searchBtn.disabled = true;
    setElementText('res-kr', 'Đang tra cứu...');
    setElementText('res-vi', '...');
    if (resultBox) resultBox.style.display = 'block';

    const prompt = 'Bạn là từ điển Hàn-Việt. Người dùng nhập: "' + query + '" (có thể là tiếng Hàn hoặc tiếng Việt).\n' +
        'Hãy trả lời DUY NHẤT một đối tượng JSON hợp lệ, không thêm markdown, không thêm giải thích, theo đúng cấu trúc:\n' +
        '{"korean": "<từ tiếng Hàn>", "vietnamese": "<nghĩa tiếng Việt>", "roman": "<phiên âm La-tinh>", "category": "<chủ đề ngắn gọn, ví dụ: Giao tiếp/Du lịch/Ẩm thực/TOPIK 1>"}\n' +
        'Nếu không chắc chắn hoặc từ không có nghĩa rõ ràng, vẫn cố gắng đưa ra phỏng đoán hợp lý nhất.';

    try {
        const raw = await callGeminiAPI(prompt);
        const parsed = parseJSONFromAI(raw);

        if (!parsed || !parsed.korean || !parsed.vietnamese) {
            throw new Error('AI không trả về kết quả tra từ hợp lệ');
        }

        lastDictResult = normalizeCard({
            front: parsed.korean,
            back: parsed.vietnamese,
            roman: parsed.roman || '',
            category: parsed.category || 'Chung'
        });

        setElementText('res-kr', lastDictResult.front);
        setElementText('res-vi', lastDictResult.back + (lastDictResult.roman ? ' (' + lastDictResult.roman + ')' : ''));
    } catch (err) {
        console.error('Lỗi tra từ:', err);
        setElementText('res-kr', 'Lỗi tra cứu');
        setElementText('res-vi', err.message || 'Vui lòng thử lại');
        lastDictResult = null;
        showToast(err.message || 'Lỗi tra từ', 'error');
    } finally {
        isDictSearching = false;
        if (searchBtn) searchBtn.disabled = false;
    }
}

function speakDictResult() {
    if (!lastDictResult) return;
    speak(lastDictResult.front, 'ko-KR');
}

function saveDictResultToDeck() {
    if (!lastDictResult) {
        showToast('Chưa có kết quả tra từ để lưu', 'error');
        return;
    }
    // Tránh lưu trùng nếu từ đã tồn tại sẵn trong bộ từ vựng
    const exists = masterDeck.some(c => c.front === lastDictResult.front && c.back === lastDictResult.back);
    if (exists) {
        showToast('Từ này đã có trong bộ từ vựng', 'error');
        return;
    }
    masterDeck.push(Object.assign({}, lastDictResult, { fav: false, hard: false }));
    saveData();
    showToast('Đã lưu vào bộ từ vựng!', 'success');
}

/* ==========================================================================
   10. MINI GAME SYSTEM — điều phối chung
   ========================================================================== */
const SUBGAME_KEYS = ['quiz', 'match', 'typing', 'speaking'];

function switchSubGame(sub) {
    if (SUBGAME_KEYS.indexOf(sub) === -1) return;

    // Dừng TUYỆT ĐỐI mọi thứ của sub-game trước khi chuyển: hủy timer đang chờ,
    // dừng phát âm đang đọc, dừng ghi âm đang chạy, và reset mọi cờ "đang xử lý".
    // Đây là điểm mấu chốt chống "treo khi đổi sub-game qua lại liên tục".
    clearGameTimers();
    stopAllSpeech();
    stopSpeakingRecognition();
    resetProcessingFlags();

    activeSubGame = sub;

    SUBGAME_KEYS.forEach(g => {
        const el = document.getElementById('game-' + g);
        if (el) el.style.display = (g === sub) ? 'block' : 'none';

        const btn = document.getElementById('sg-' + g);
        if (btn) btn.className = (g === sub) ? 'active-subgame' : '';
    });

    if (sub === 'quiz') startQuizGame();
    else if (sub === 'match') startMatchGame();
    else if (sub === 'typing') startTypingGame();
    else if (sub === 'speaking') startSpeakingGame();
}

/* --------------------------------------------------------------------------
   10.1 Mini Game 1: Trắc nghiệm (Quiz)
   -------------------------------------------------------------------------- */
function startQuizGame() {
    isProcessingQuiz = false;
    setElementText('quiz-fb', '');

    if (!Array.isArray(masterDeck) || masterDeck.length === 0) {
        setElementText('quiz-kr', 'Chưa có từ vựng');
        setElementText('quiz-rm', 'Hãy thêm từ mới để chơi');
        setElementHTML('quiz-opts', '');
        return;
    }

    if (masterDeck.length < 2) {
        setElementText('quiz-kr', masterDeck[0].front);
        setElementText('quiz-rm', masterDeck[0].roman || '');
        setElementHTML('quiz-opts', '<p style="grid-column:span 2; text-align:center; color:var(--text-muted); font-size:13px;">Cần ít nhất 2 từ vựng để tạo câu hỏi trắc nghiệm.</p>');
        return;
    }

    currentQuiz = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('quiz-kr', currentQuiz.front);
    setElementText('quiz-rm', currentQuiz.roman || '');

    const opts = [currentQuiz.back];
    let attempts = 0;
    const maxOpts = Math.min(4, masterDeck.length);
    while (opts.length < maxOpts && attempts < 100) {
        attempts++;
        const randomWord = masterDeck[Math.floor(Math.random() * masterDeck.length)].back;
        if (opts.indexOf(randomWord) === -1) {
            opts.push(randomWord);
        }
    }
    opts.sort(() => Math.random() - 0.5);

    const container = document.getElementById('quiz-opts');
    if (!container) return;
    container.innerHTML = '';

    const localQuiz = currentQuiz; // Chốt tham chiếu để callback đóng đúng câu hỏi tại thời điểm tạo, tránh lệch khi currentQuiz đổi

    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            // Chống bấm đúp / chống bấm vào câu hỏi đã bị thay bởi timer khác
            if (isProcessingQuiz || currentQuiz !== localQuiz) return;
            isProcessingQuiz = true;

            container.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);

            if (opt === localQuiz.back) {
                btn.classList.add('correct');
                quizScore += 10;
                quizStreak++;
                setElementHTML('quiz-fb', '<span style="color:var(--success-color, green);">Chính xác! 🎉</span>');
            } else {
                btn.classList.add('wrong');
                quizStreak = 0;
                setElementHTML('quiz-fb', '<span style="color:var(--danger-color, red);">Sai! Đáp án đúng: ' + localQuiz.back + '</span>');
                // Đánh dấu luôn đáp án đúng để người học thấy ngay
                container.querySelectorAll('.quiz-opt-btn').forEach(b => {
                    if (b.innerText === localQuiz.back) b.classList.add('correct');
                });
            }

            setElementText('quiz-score', quizScore);
            setElementText('quiz-streak', quizStreak);
            setGameTimeout(() => {
                if (activeMode === 'game' && activeSubGame === 'quiz') startQuizGame();
            }, 1200);
        };
        container.appendChild(btn);
    });
}

/* --------------------------------------------------------------------------
   10.2 Mini Game 2: Nối từ — cross-match 2 cột (đúng cấu trúc HTML thật:
   #col-kr-list bên trái / #col-vi-list bên phải, chọn 1 bên Hàn + 1 bên Việt)
   -------------------------------------------------------------------------- */
function startMatchGame() {
    isProcessingMatch = false;
    matchSelectedKr = null;
    matchSelectedVi = null;
    setElementText('match-fb', '');

    const colKr = document.getElementById('col-kr-list');
    const colVi = document.getElementById('col-vi-list');
    if (!colKr || !colVi) return;
    colKr.innerHTML = '';
    colVi.innerHTML = '';

    if (!Array.isArray(masterDeck) || masterDeck.length < 2) {
        colKr.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:13px;">Cần ít nhất 2 từ vựng.</p>';
        matchRemaining = 0;
        return;
    }

    const poolSize = Math.min(4, masterDeck.length);
    const pool = [...masterDeck].sort(() => Math.random() - 0.5).slice(0, poolSize);
    matchPairs = pool.map((item, idx) => ({ id: idx, kr: item.front, vi: item.back }));
    matchRemaining = matchPairs.length;

    const krShuffled = [...matchPairs].sort(() => Math.random() - 0.5);
    const viShuffled = [...matchPairs].sort(() => Math.random() - 0.5);

    krShuffled.forEach(pair => {
        const div = document.createElement('div');
        div.className = 'cross-card';
        div.innerText = pair.kr;
        div.dataset.pairId = String(pair.id);
        div.onclick = () => handleMatchSelectKr(div, pair);
        colKr.appendChild(div);
    });

    viShuffled.forEach(pair => {
        const div = document.createElement('div');
        div.className = 'cross-card';
        div.innerText = pair.vi;
        div.dataset.pairId = String(pair.id);
        div.onclick = () => handleMatchSelectVi(div, pair);
        colVi.appendChild(div);
    });
}

function handleMatchSelectKr(element, pair) {
    if (isProcessingMatch) return; // Chống bấm trong lúc đang xử lý cặp trước
    if (element.classList.contains('matched-correct')) return;

    if (matchSelectedKr) matchSelectedKr.classList.remove('selected');
    matchSelectedKr = element;
    element.classList.add('selected');

    tryResolveMatchPair();
}

function handleMatchSelectVi(element, pair) {
    if (isProcessingMatch) return;
    if (element.classList.contains('matched-correct')) return;

    if (matchSelectedVi) matchSelectedVi.classList.remove('selected');
    matchSelectedVi = element;
    element.classList.add('selected');

    tryResolveMatchPair();
}

function tryResolveMatchPair() {
    if (!matchSelectedKr || !matchSelectedVi) return; // Chưa đủ 1 cặp (1 bên Hàn + 1 bên Việt)

    isProcessingMatch = true;

    const krId = matchSelectedKr.dataset.pairId;
    const viId = matchSelectedVi.dataset.pairId;
    const elKr = matchSelectedKr;
    const elVi = matchSelectedVi;

    if (krId === viId) {
        elKr.classList.remove('selected');
        elVi.classList.remove('selected');
        elKr.classList.add('matched-correct');
        elVi.classList.add('matched-correct');
        matchRemaining--;
        setElementHTML('match-fb', '<span style="color:var(--success-color, green);">Chính xác!</span>');

        matchSelectedKr = null;
        matchSelectedVi = null;
        isProcessingMatch = false;

        if (matchRemaining <= 0) {
            setElementHTML('match-fb', '<span style="color:var(--success-color, green);">Hoàn thành! Đang tạo lượt mới...</span>');
            setGameTimeout(() => {
                if (activeMode === 'game' && activeSubGame === 'match') startMatchGame();
            }, 1000);
        }
    } else {
        elKr.classList.add('matched-wrong');
        elVi.classList.add('matched-wrong');
        setElementHTML('match-fb', '<span style="color:var(--danger-color, red);">Chưa đúng, thử lại!</span>');

        setGameTimeout(() => {
            elKr.classList.remove('selected', 'matched-wrong');
            elVi.classList.remove('selected', 'matched-wrong');
            matchSelectedKr = null;
            matchSelectedVi = null;
            isProcessingMatch = false;
            setElementText('match-fb', '');
        }, 700);
    }
}

/* --------------------------------------------------------------------------
   10.3 Mini Game 3: Gõ phím (Typing)
   -------------------------------------------------------------------------- */
function startTypingGame() {
    isProcessingTyping = false;
    setElementText('typing-fb', '');
    const input = document.getElementById('typing-input');
    if (input) input.value = '';

    if (!Array.isArray(masterDeck) || masterDeck.length === 0) {
        setElementText('typing-vi', 'Chưa có từ vựng');
        currentTypingWord = null;
        return;
    }

    currentTypingWord = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('typing-vi', currentTypingWord.back);
}

function checkTypingAnswer() {
    if (isProcessingTyping) return; // Chống bấm đúp / double-submit
    if (!currentTypingWord) return;

    const input = document.getElementById('typing-input');
    if (!input) return;

    const userAns = input.value.trim().toLowerCase();
    if (!userAns) return;

    const correctAns = currentTypingWord.front.trim().toLowerCase();

    if (userAns === correctAns) {
        isProcessingTyping = true;
        typingScore += 10;
        setElementText('typing-score', typingScore);
        setElementHTML('typing-fb', '<span style="color:var(--success-color, green);">Đúng rồi! 🎉</span>');
        setGameTimeout(() => {
            if (activeMode === 'game' && activeSubGame === 'typing') startTypingGame();
        }, 1000);
    } else {
        setElementHTML('typing-fb', '<span style="color:var(--danger-color, red);">Chưa đúng, thử lại nhé!</span>');
    }
}

function playTypingListen() {
    if (!currentTypingWord) return;
    speak(currentTypingWord.front, 'ko-KR');
}

/* --------------------------------------------------------------------------
   10.4 Mini Game 4: Luyện nói (SpeechRecognition + Gemini chấm điểm %)
   -------------------------------------------------------------------------- */
function isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startSpeakingGame() {
    setElementText('speak-fb', '');
    setElementText('mic-status', 'Nhấn micro và đọc');

    const evalBox = document.getElementById('eval-box');
    if (evalBox) evalBox.style.display = 'none';

    const micBtn = document.getElementById('btn-mic');
    if (micBtn) micBtn.classList.remove('recording');

    if (!Array.isArray(masterDeck) || masterDeck.length === 0) {
        setElementText('speak-target', 'Chưa có từ vựng');
        setElementText('speak-vi', 'Hãy thêm từ mới để luyện');
        currentSpeakingWord = null;
        return;
    }

    currentSpeakingWord = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('speak-target', currentSpeakingWord.front);
    setElementText('speak-vi', currentSpeakingWord.back);

    if (!isSpeechRecognitionSupported()) {
        setElementText('mic-status', 'Trình duyệt không hỗ trợ nhận diện giọng nói');
        if (micBtn) micBtn.disabled = true;
    } else if (micBtn) {
        micBtn.disabled = false;
    }
}

function playSpeakSample() {
    if (!currentSpeakingWord) return;
    speak(currentSpeakingWord.front, 'ko-KR');
}

/** Dừng tuyệt đối phiên ghi âm Luyện Nói đang chạy (nếu có), reset UI mic. */
function stopSpeakingRecognition() {
    if (speechRecognizer && isRecording) {
        try { speechRecognizer.stop(); } catch (e) { /* đã dừng sẵn, bỏ qua */ }
    }
    isRecording = false;
    isEvaluatingSpeech = false;
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) micBtn.classList.remove('recording');
}

function toggleMicRecording() {
    if (!isSpeechRecognitionSupported()) {
        setElementText('mic-status', 'Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy thử Chrome/Edge.');
        return;
    }
    if (isEvaluatingSpeech) return; // Đang chờ AI chấm điểm, chặn bấm mic tiếp
    if (!currentSpeakingWord) return;

    if (isRecording) {
        stopSpeakingRecognition();
        return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognizer = new SpeechRecognitionCtor();
    speechRecognizer.lang = 'ko-KR';
    speechRecognizer.interimResults = false;
    speechRecognizer.maxAlternatives = 1;

    const micBtn = document.getElementById('btn-mic');
    const targetWordAtStart = currentSpeakingWord; // Chốt từ mục tiêu tại thời điểm bắt đầu ghi âm

    speechRecognizer.onstart = () => {
        isRecording = true;
        if (micBtn) micBtn.classList.add('recording');
        setElementText('mic-status', 'Đang nghe... hãy đọc từ trên');
    };

    speechRecognizer.onresult = (event) => {
        const transcript = (event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript) || '';
        evaluatePronunciation(transcript, targetWordAtStart);
    };

    speechRecognizer.onerror = (event) => {
        isRecording = false;
        if (micBtn) micBtn.classList.remove('recording');
        const reason = event.error === 'no-speech' ? 'Không nghe thấy giọng nói, thử lại nhé'
            : event.error === 'not-allowed' ? 'Vui lòng cho phép quyền truy cập micro'
            : 'Lỗi ghi âm: ' + event.error;
        setElementText('mic-status', reason);
    };

    speechRecognizer.onend = () => {
        isRecording = false;
        if (micBtn) micBtn.classList.remove('recording');
    };

    try {
        speechRecognizer.start();
    } catch (e) {
        console.error('Không thể bắt đầu ghi âm:', e);
        setElementText('mic-status', 'Không thể bắt đầu ghi âm, thử lại');
        isRecording = false;
    }
}

/** Gửi transcript nhận diện được sang Gemini để so sánh với từ mẫu và chấm % chính xác. */
async function evaluatePronunciation(transcript, targetWord) {
    if (!targetWord) return;

    isEvaluatingSpeech = true;
    setElementText('mic-status', 'Đang chấm điểm phát âm bằng AI...');

    const evalBox = document.getElementById('eval-box');
    if (evalBox) evalBox.style.display = 'block';
    setElementText('eval-score', '...');
    setElementText('eval-rating', 'Đang phân tích...');
    setElementText('eval-transcript', 'Giọng nói nhận diện: "' + (transcript || '(không rõ)') + '"');

    const prompt = 'Bạn là giáo viên chấm phát âm tiếng Hàn. Từ mẫu cần đọc là: "' + targetWord.front + '" (phiên âm: ' + (targetWord.roman || 'không có') + ', nghĩa: ' + targetWord.back + ').\n' +
        'Hệ thống nhận diện giọng nói (speech-to-text) đã ghi lại người học nói là: "' + (transcript || '(không nhận diện được gì)') + '"\n\n' +
        'So sánh mức độ giống nhau về ÂM THANH (không chỉ chữ viết, vì speech-to-text tiếng Hàn có thể sai chính tả nhưng gần đúng về âm) giữa từ nhận diện được và từ mẫu. Chấm điểm phần trăm độ chính xác phát âm (0-100).\n\n' +
        'Trả lời DUY NHẤT một đối tượng JSON hợp lệ, không markdown, không giải thích thêm, theo đúng cấu trúc:\n' +
        '{"score": <số nguyên 0-100>, "rating": "<1 trong: Xuất sắc/Tốt/Khá/Cần luyện thêm>", "feedback": "<nhận xét ngắn gọn 1 câu bằng tiếng Việt>"}';

    try {
        const raw = await callGeminiAPI(prompt);
        const parsed = parseJSONFromAI(raw);

        if (!parsed || typeof parsed.score !== 'number') {
            throw new Error('AI không trả về kết quả chấm điểm hợp lệ');
        }

        const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
        setElementText('eval-score', score + '%');
        setElementText('eval-rating', parsed.rating || '---');
        setElementText('eval-transcript', 'Giọng nói nhận diện: "' + (transcript || '(không rõ)') + '"' + (parsed.feedback ? ' — ' + parsed.feedback : ''));
        setElementText('mic-status', 'Nhấn micro để thử lại');
    } catch (err) {
        console.error('Lỗi chấm điểm phát âm:', err);
        setElementText('eval-score', '---');
        setElementText('eval-rating', 'Lỗi chấm điểm');
        setElementText('eval-transcript', err.message || 'Vui lòng thử lại');
        setElementText('mic-status', 'Nhấn micro để thử lại');
        showToast(err.message || 'Lỗi chấm điểm phát âm', 'error');
    } finally {
        isEvaluatingSpeech = false;
    }
}

/* ==========================================================================
   14. GEMINI AI CORE — gọi API dùng chung cho Tra từ / AI Chat / Chấm phát âm
   ========================================================================== */
async function callGeminiAPI(promptText) {
    let apiKey = '';
    try {
        apiKey = localStorage.getItem('gemini_api_key') || '';
    } catch (e) { /* localStorage không khả dụng */ }

    if (!apiKey) {
        throw new Error('Chưa nhập API Key! Vui lòng dán Gemini API Key ở mục AI Chat và bấm Lưu.');
    }

    // Tên model Gemini dùng chung cho toàn bộ app (Tra từ / AI Chat / Chấm phát âm).
    // Google định kỳ ngừng hỗ trợ các model cũ (ví dụ gemini-1.5-flash đã bị shutdown
    // hoàn toàn) — nếu gặp lỗi "is not found for API version..." trong tương lai,
    // chỉ cần cập nhật đúng 1 hằng số này theo danh sách model Stable mới nhất tại
    // https://ai.google.dev/gemini-api/docs/models
    const GEMINI_MODEL = 'gemini-3.5-flash';

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + encodeURIComponent(apiKey);
    const requestBody = {
        contents: [{ parts: [{ text: promptText }] }]
    };

    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
    } catch (networkErr) {
        // Lỗi mạng (mất kết nối, CORS, v.v.) — fetch ném lỗi trước khi có response
        console.error('Lỗi mạng khi gọi Gemini API:', networkErr);
        throw new Error('Không thể kết nối đến Gemini AI. Kiểm tra kết nối mạng.');
    }

    if (!response.ok) {
        let errMessage = 'Lỗi kết nối HTTP: ' + response.status;
        try {
            const errData = await response.json();
            if (errData && errData.error && errData.error.message) errMessage = errData.error.message;
        } catch (e) {
            // Body lỗi không phải JSON hợp lệ — giữ nguyên message mặc định theo status code
        }
        if (response.status === 400) errMessage = 'API Key không hợp lệ hoặc yêu cầu sai định dạng.';
        if (response.status === 403) errMessage = 'API Key bị từ chối truy cập (kiểm tra lại quyền hạn key).';
        if (response.status === 429) errMessage = 'Đã vượt giới hạn số lượt gọi API, vui lòng thử lại sau.';
        throw new Error(errMessage);
    }

    let data;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error('Phản hồi từ AI không phải JSON hợp lệ.');
    }

    // Bóc tách an toàn: candidates[0].content.parts[].text — kiểm tra từng cấp
    // để không bao giờ ném TypeError "Cannot read property of undefined".
    //
    // Model dòng Gemini 3.x (gemini-3.5-flash trở lên) mặc định bật "thinking":
    // parts[] có thể chứa NHIỀU phần tử, trong đó phần tử đầu (hoặc vài phần tử
    // đầu) là suy luận nội bộ đánh dấu part.thought === true, và phần trả lời
    // thật nằm ở phần tử SAU đó — không nhất thiết là parts[0]. Vì vậy phải
    // duyệt toàn bộ mảng parts[], bỏ qua mọi phần có thought === true, và ghép
    // các đoạn text còn lại — thay vì chỉ đọc mỗi parts[0].text như model đời
    // cũ (1.x/2.x không có thinking, luôn chỉ có đúng 1 phần tử ở parts[0]).
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content &&
        data.candidates[0].content.parts;

    let text = '';
    if (Array.isArray(parts)) {
        text = parts
            .filter(p => p && p.thought !== true && typeof p.text === 'string')
            .map(p => p.text)
            .join('');
    }

    if (typeof text === 'string' && text.length > 0) {
        return text;
    }

    // Gemini có thể chặn nội dung vì lý do an toàn — báo rõ nguyên nhân thay vì lỗi chung chung
    const finishReason = data && data.candidates && data.candidates[0] && data.candidates[0].finishReason;
    if (finishReason === 'SAFETY') {
        throw new Error('Nội dung bị chặn bởi bộ lọc an toàn của Gemini AI.');
    }
    if (data && data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error('Yêu cầu bị chặn: ' + data.promptFeedback.blockReason);
    }

    throw new Error('Phản hồi từ AI bị rỗng hoặc không đúng định dạng chuẩn.');
}

/**
 * Gemini đôi khi bọc JSON trong ```json ... ``` dù đã được yêu cầu không làm vậy.
 * Hàm này bóc tách an toàn để không bao giờ ném lỗi làm treo luồng gọi AI.
 */
function parseJSONFromAI(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;

    let cleaned = rawText.trim();
    // Gỡ markdown code fence nếu có: ```json ... ``` hoặc ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

    // Nếu vẫn còn text thừa trước/sau, cố lấy đúng khối {...} đầu tiên
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Không thể parse JSON từ phản hồi AI:', e, rawText);
        return null;
    }
}

/* ==========================================================================
   15. AI CHAT (hội thoại luyện tiếng Hàn theo kịch bản)
   ========================================================================== */
const SCENARIO_PROMPTS = {
    free: 'Hãy trò chuyện tự do bằng tiếng Hàn đơn giản, phù hợp người mới học.',
    food: 'Bạn đang đóng vai nhân viên phục vụ nhà hàng Hàn Quốc, giúp người học luyện hội thoại gọi món ăn.',
    taxi: 'Bạn đang đóng vai tài xế taxi ở Hàn Quốc, giúp người học luyện hội thoại đi taxi (địa điểm, giá cước, chỉ đường).',
    hotel: 'Bạn đang đóng vai lễ tân khách sạn ở Hàn Quốc, giúp người học luyện hội thoại nhận phòng, hỏi dịch vụ khách sạn.'
};

function saveGeminiApiKey() {
    const input = document.getElementById('gemini-api-key');
    const key = ((input && input.value) || '').trim();
    if (!key) {
        showToast('Vui lòng nhập API Key trước khi lưu', 'error');
        return;
    }
    try {
        localStorage.setItem('gemini_api_key', key);
        showToast('Đã lưu API Key!', 'success');
    } catch (e) {
        showToast('Không thể lưu API Key (localStorage lỗi)', 'error');
    }
}

function loadGeminiApiKey() {
    const input = document.getElementById('gemini-api-key');
    if (!input) return;
    try {
        const saved = localStorage.getItem('gemini_api_key');
        if (saved) input.value = saved;
    } catch (e) { /* bỏ qua nếu không đọc được */ }
}

function switchScenario(scen) {
    if (!SCENARIO_PROMPTS[scen]) return;
    activeScenario = scen;
    document.querySelectorAll('.scen-chip[data-scen]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scen === scen);
    });
    setElementHTML('chat-box', '');
    setElementHTML('chat-sug', '');
    const chipEl = document.querySelector('.scen-chip[data-scen="' + scen + '"]');
    const label = chipEl ? chipEl.innerText.trim() : scen;
    appendChatMessage('system', '— Bắt đầu chủ đề: ' + label + ' —');
}

function appendChatMessage(role, text) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
}

async function sendChatMessage() {
    if (isSendingChatMessage) return; // Chống double-send

    const input = document.getElementById('chat-input');
    const message = ((input && input.value) || '').trim();
    if (!message) return;

    isSendingChatMessage = true;
    const sendBtn = document.getElementById('btn-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    appendChatMessage('user', message);
    if (input) input.value = '';

    const thinkingEl = appendChatMessage('system', 'AI đang trả lời...');

    const scenarioContext = SCENARIO_PROMPTS[activeScenario] || SCENARIO_PROMPTS.free;
    const prompt = scenarioContext + '\n' +
        'Người học (trình độ sơ cấp) vừa nói: "' + message + '"\n\n' +
        'Hãy trả lời NGẮN GỌN bằng tiếng Hàn đơn giản (1-2 câu), phù hợp bối cảnh trên. Nếu câu người học nói có lỗi ngữ pháp/chính tả rõ ràng, hãy nhẹ nhàng sửa lại ở cuối câu trả lời.\n\n' +
        'Trả lời DUY NHẤT một đối tượng JSON hợp lệ, không markdown, theo đúng cấu trúc:\n' +
        '{"korean": "<câu trả lời tiếng Hàn>", "vietnamese": "<dịch nghĩa tiếng Việt>", "correction": "<sửa lỗi cho người học nếu có, để trống nếu không có lỗi>"}';

    try {
        const raw = await callGeminiAPI(prompt);
        const parsed = parseJSONFromAI(raw);

        if (thinkingEl) thinkingEl.remove();

        if (!parsed || !parsed.korean) {
            throw new Error('AI không trả về phản hồi hợp lệ');
        }

        const box = document.getElementById('chat-box');
        if (box) {
            const div = document.createElement('div');
            div.className = 'chat-msg ai';

            const krLine = document.createElement('div');
            krLine.className = 'msg-kr';
            krLine.innerText = parsed.korean;
            div.appendChild(krLine);

            if (parsed.vietnamese) {
                const viLine = document.createElement('div');
                viLine.className = 'msg-vi';
                viLine.innerText = parsed.vietnamese;
                div.appendChild(viLine);
            }

            if (parsed.correction && parsed.correction.trim()) {
                const corLine = document.createElement('div');
                corLine.className = 'msg-correction';
                corLine.innerText = '✏️ ' + parsed.correction;
                div.appendChild(corLine);
            }

            const audioBtn = document.createElement('button');
            audioBtn.className = 'btn-msg-audio';
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            audioBtn.onclick = () => speak(parsed.korean, 'ko-KR');
            div.appendChild(audioBtn);

            box.appendChild(div);
            box.scrollTop = box.scrollHeight;
        }

        speak(parsed.korean, 'ko-KR');
    } catch (err) {
        console.error('Lỗi AI Chat:', err);
        if (thinkingEl) thinkingEl.remove();
        appendChatMessage('system', '⚠️ ' + (err.message || 'Lỗi khi gọi AI'));
        showToast(err.message || 'Lỗi AI Chat', 'error');
    } finally {
        isSendingChatMessage = false;
        if (sendBtn) sendBtn.disabled = false;
    }
}

function stopChatRecognition() {
    if (chatRecognizer && isChatRecording) {
        try { chatRecognizer.stop(); } catch (e) { /* đã dừng sẵn */ }
    }
    isChatRecording = false;
    const micBtn = document.getElementById('btn-chat-mic');
    if (micBtn) micBtn.classList.remove('recording');
}

function toggleChatMic() {
    if (!isSpeechRecognitionSupported()) {
        showToast('Trình duyệt không hỗ trợ nhận diện giọng nói', 'error');
        return;
    }

    if (isChatRecording) {
        stopChatRecognition();
        return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    chatRecognizer = new SpeechRecognitionCtor();
    chatRecognizer.lang = 'ko-KR';
    chatRecognizer.interimResults = false;
    chatRecognizer.maxAlternatives = 1;

    const micBtn = document.getElementById('btn-chat-mic');

    chatRecognizer.onstart = () => {
        isChatRecording = true;
        if (micBtn) micBtn.classList.add('recording');
    };

    chatRecognizer.onresult = (event) => {
        const transcript = (event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript) || '';
        const input = document.getElementById('chat-input');
        if (input && transcript) input.value = transcript;
    };

    chatRecognizer.onerror = () => {
        isChatRecording = false;
        if (micBtn) micBtn.classList.remove('recording');
    };

    chatRecognizer.onend = () => {
        isChatRecording = false;
        if (micBtn) micBtn.classList.remove('recording');
    };

    try {
        chatRecognizer.start();
    } catch (e) {
        console.error('Không thể bắt đầu ghi âm chat:', e);
        isChatRecording = false;
    }
}

/* ==========================================================================
   16. TEXT-TO-SPEECH (phát âm mẫu)
   ========================================================================== */
function stopAllSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speak(text, lang) {
    if (!text) return;
    if (!('speechSynthesis' in window)) {
        showToast('Trình duyệt không hỗ trợ phát âm (Text-to-Speech)', 'error');
        return;
    }
    stopAllSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || 'ko-KR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

/* ==========================================================================
   17. EVENT LISTENERS — nối TOÀN BỘ nút thực tế có trong index.html
   ========================================================================== */
function on(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

function setupEventListeners() {
    // --- Top bar ---
    on('btn-open-add', 'click', openAddModal);
    on('btn-export-import', 'click', openExportImportMenu);
    on('btn-toggle-theme', 'click', toggleTheme);

    // --- Category bar ---
    document.querySelectorAll('.cat-chip[data-cat]').forEach(btn => {
        btn.addEventListener('click', () => switchCategory(btn.dataset.cat));
    });

    // --- Mode switcher ---
    document.querySelectorAll('.mode-switcher button[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // --- Mode 1: Tra từ ---
    on('btn-dict-search', 'click', performDictSearch);
    on('dict-input', 'keypress', (e) => { if (e.key === 'Enter') performDictSearch(); });
    on('btn-dict-speak', 'click', speakDictResult);
    on('btn-dict-add', 'click', saveDictResultToDeck);

    // --- Mode 2: Flashcard ---
    on('btn-search-word', 'click', searchFlashcard);
    on('search-input', 'keypress', (e) => { if (e.key === 'Enter') searchFlashcard(); });
    on('flashcard', 'click', flipCard);
    on('btn-card-audio', 'click', (e) => {
        e.stopPropagation(); // Tránh click vào nút loa cũng kích hoạt flipCard() của thẻ cha
        playCardAudio();
    });
    on('btn-prev-card', 'click', prevCard);
    on('btn-flip-card', 'click', flipCard);
    on('btn-next-card', 'click', nextCard);
    on('btn-fav', 'click', toggleFavorite);
    on('btn-hard', 'click', toggleHard);
    on('btn-delete-word', 'click', deleteCurrentCard);

    // --- Mode 3: Mini Games ---
    document.querySelectorAll('.game-selector button[data-sub]').forEach(btn => {
        btn.addEventListener('click', () => switchSubGame(btn.dataset.sub));
    });
    // Nối từ
    on('btn-refresh-match', 'click', startMatchGame);
    // Gõ phím
    on('btn-typing-submit', 'click', checkTypingAnswer);
    on('typing-input', 'keypress', (e) => { if (e.key === 'Enter') checkTypingAnswer(); });
    on('btn-typing-listen', 'click', playTypingListen);
    // Luyện nói
    on('btn-next-speak', 'click', startSpeakingGame);
    on('btn-speak-sample', 'click', playSpeakSample);
    on('btn-mic', 'click', toggleMicRecording);

    // --- Mode 4: AI Chat ---
    on('btn-save-key', 'click', saveGeminiApiKey);
    document.querySelectorAll('.scen-chip[data-scen]').forEach(btn => {
        btn.addEventListener('click', () => switchScenario(btn.dataset.scen));
    });
    on('btn-chat-send', 'click', sendChatMessage);
    on('chat-input', 'keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });
    on('btn-chat-mic', 'click', toggleChatMic);

    // --- Modal thêm từ ---
    on('btn-close-modal', 'click', closeAddModal);
    on('btn-cancel-modal', 'click', closeAddModal);
    on('btn-save-modal', 'click', saveNewWordFromModal);
    on('add-modal', 'click', (e) => {
        // Bấm ra ngoài modal-body (vào lớp overlay) thì đóng modal
        if (e.target && e.target.id === 'add-modal') closeAddModal();
    });

    // --- Import file ---
    on('import-file', 'change', handleImportFile);

    // --- Phím tắt bàn phím (chỉ hoạt động khi đang ở Flashcard, tránh xung đột
    //     với việc gõ chữ trong các ô input ở mode khác) ---
    document.addEventListener('keydown', (e) => {
        if (activeMode !== 'flashcard') return;
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return; // Đang gõ trong ô input thì không kích hoạt phím tắt

        if (e.key === 'ArrowRight') nextCard();
        else if (e.key === 'ArrowLeft') prevCard();
        else if (e.key === ' ') {
            e.preventDefault();
            flipCard();
        }
    });

    // --- Dừng mọi tiến trình nền khi người dùng rời/ẩn tab, tránh ghi âm/timer
    //     tiếp tục chạy ngầm gây treo khi quay lại ---
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAllSpeech();
            stopSpeakingRecognition();
            stopChatRecognition();
        }
    });
}

/* ==========================================================================
   18. BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadData();
    loadGeminiApiKey();
    updateDailyStreak();
    setupEventListeners();
    switchMode('dict'); // Khớp đúng trạng thái mặc định trong HTML (mode-dict active-mode)
});
