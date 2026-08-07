/* ==========================================================================
   APP STATE & INITIALIZATION
   ========================================================================== */
let masterDeck = [];      // Danh sách từ vựng gốc
let filteredDeck = [];    // Danh sách từ vựng sau khi lọc/tìm kiếm
let currentIndex = 0;     // Chỉ số từ vựng hiện tại
let activeTab = 'card';   // Tab đang mở

// Biến trạng thái cho Mini Game
let gameTimers = [];
let isProcessingQuiz = false;
let currentQuiz = null;
let quizScore = 0;
let quizStreak = 0;

let matchScore = 0;
let selectedMatchCards = [];

let currentTypingWord = null;
let typingScore = 0;

let currentSpeakingWord = null;

// Tải ứng dụng khi trang đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateCard();
});

/* ==========================================================================
   DATA MANAGEMENT (LOCALSTORAGE)
   ========================================================================== */
function loadData() {
    const saved = localStorage.getItem('masterDeck');
    if (saved) {
        try {
            masterDeck = JSON.parse(saved);
        } catch (e) {
            masterDeck = getSampleData();
        }
    } else {
        masterDeck = getSampleData();
        saveData();
    }
    filteredDeck = [...masterDeck];
}

function saveData() {
    localStorage.setItem('masterDeck', JSON.stringify(masterDeck));
}

function getSampleData() {
    return [
        { front: '안녕하세요', back: 'Xin chào', roman: 'An-nyeong-ha-se-yo', category: 'Chào hỏi', fav: false, hard: false },
        { front: '감사합니다', back: 'Cảm ơn', roman: 'Gam-sa-ham-ni-da', category: 'Chào hỏi', fav: false, hard: false },
        { front: '사과', back: 'Quả táo', roman: 'Sa-gwa', category: 'Hoa quả', fav: false, hard: false },
        { front: '물', back: 'Nước', roman: 'Mul', category: 'Đồ uống', fav: false, hard: false }
    ];
}

/* ==========================================================================
   UTILITY & TIMERS
   ========================================================================== */
function setGameTimeout(callback, delay) {
    const timer = setTimeout(callback, delay);
    gameTimers.push(timer);
    return timer;
}

function clearGameTimers() {
    gameTimers.forEach(timer => clearTimeout(timer));
    gameTimers = [];
}

function playSFX(type) {
    // Tùy chọn âm thanh nếu có
}

function stopAllSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/* ==========================================================================
   FLASHCARD SYSTEM
   ========================================================================== */
function updateCard() {
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('is-flipped');
    
    // Kiểm tra an toàn khi danh sách từ vựng rỗng
    if (!filteredDeck || filteredDeck.length === 0) {
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
        return;
    }

    if (currentIndex >= filteredDeck.length) {
        currentIndex = 0;
    }

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
    if (filteredDeck.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredDeck.length;
    updateCard();
}

function prevCard() {
    if (filteredDeck.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredDeck.length) % filteredDeck.length;
    updateCard();
}

function flipCard() {
    const card = document.getElementById('flashcard');
    if (card) card.classList.toggle('is-flipped');
}

/* ==========================================================================
   MINI GAME SYSTEM
   ========================================================================== */
function switchSubGame(sub) {
    stopAllSpeech();
    clearGameTimers();

    ['quiz', 'match', 'typing', 'speaking'].forEach(g => {
        const el = document.getElementById('game-' + g);
        if (el) el.style.display = g === sub ? 'block' : 'none';
        
        const btn = document.getElementById('sg-' + g);
        if (btn) btn.className = g === sub ? 'active-subgame' : '';
    });

    if (sub === 'quiz') startQuizGame();
    if (sub === 'match') startMatchGame();
    if (sub === 'typing') startTypingGame();
    if (sub === 'speaking') startSpeakingGame();
}

// 1. Trắc nghiệm Game
function startQuizGame() {
    isProcessingQuiz = false;
    setElementText('quiz-fb', '');

    if (!masterDeck || masterDeck.length === 0) {
        setElementText('quiz-kr', 'Chưa có từ vựng');
        setElementText('quiz-rm', 'Hãy thêm từ mới để chơi');
        const container = document.getElementById('quiz-opts');
        if (container) container.innerHTML = '';
        return;
    }

    currentQuiz = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('quiz-kr', currentQuiz.front);
    setElementText('quiz-rm', currentQuiz.roman || '');
    
    const opts = [currentQuiz.back];
    let attempts = 0;
    while (opts.length < Math.min(4, masterDeck.length) && attempts < 50) {
        attempts++;
        const randomWord = masterDeck[Math.floor(Math.random() * masterDeck.length)].back;
        if (!opts.includes(randomWord)) {
            opts.push(randomWord);
        }
    }
    opts.sort(() => Math.random() - 0.5);

    const container = document.getElementById('quiz-opts');
    if (!container) return;
    container.innerHTML = '';
    
    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (isProcessingQuiz) return;
            isProcessingQuiz = true;
            
            if (opt === currentQuiz.back) {
                btn.classList.add('correct'); 
                playSFX('correct');
                quizScore += 10; 
                quizStreak++;
                const fb = document.getElementById('quiz-fb');
                if (fb) fb.innerHTML = '<span style="color:var(--success-color, green);">Chính xác!</span>';
            } else {
                btn.classList.add('wrong'); 
                playSFX('wrong');
                quizStreak = 0;
                const fb = document.getElementById('quiz-fb');
                if (fb) fb.innerHTML = `<span style="color:var(--danger-color, red);">Sai! Đáp án: ${currentQuiz.back}</span>`;
            }
            
            setElementText('quiz-score', quizScore);
            setElementText('quiz-streak', quizStreak);
            setGameTimeout(startQuizGame, 1200);
        };
        container.appendChild(btn);
    });
}

// 2. Nối từ Game
function startMatchGame() {
    selectedMatchCards = [];
    const container = document.getElementById('match-grid');
    if (!container) return;
    container.innerHTML = '';

    if (!masterDeck || masterDeck.length < 2) {
        container.innerHTML = '<p style="grid-column: span 2; text-align: center;">Cần ít nhất 2 từ vựng để chơi nối từ.</p>';
        return;
    }

    const gamePool = [...masterDeck].sort(() => Math.random() - 0.5).slice(0, 4);
    let cardsData = [];

    gamePool.forEach((item, idx) => {
        cardsData.push({ id: idx, text: item.front, type: 'front' });
        cardsData.push({ id: idx, text: item.back, type: 'back' });
    });

    cardsData.sort(() => Math.random() - 0.5);

    cardsData.forEach(card => {
        const div = document.createElement('div');
        div.className = 'match-card';
        div.innerText = card.text;
        div.onclick = () => handleMatchSelect(div, card);
        container.appendChild(div);
    });
}

function handleMatchSelect(element, data) {
    if (element.classList.contains('matched') || element.classList.contains('selected')) return;
    if (selectedMatchCards.length >= 2) return;

    element.classList.add('selected');
    selectedMatchCards.push({ element, data });

    if (selectedMatchCards.length === 2) {
        const [c1, c2] = selectedMatchCards;
        if (c1.data.id === c2.data.id && c1.data.type !== c2.data.type) {
            c1.element.classList.remove('selected');
            c2.element.classList.remove('selected');
            c1.element.classList.add('matched');
            c2.element.classList.add('matched');
            matchScore += 20;
            setElementText('match-score', matchScore);
            selectedMatchCards = [];

            const allMatched = document.querySelectorAll('.match-card:not(.matched)').length === 0;
            if (allMatched) {
                setGameTimeout(startMatchGame, 1000);
            }
        } else {
            setGameTimeout(() => {
                c1.element.classList.remove('selected');
                c2.element.classList.remove('selected');
                selectedMatchCards = [];
            }, 800);
        }
    }
}

// 3. Gõ phím Game
function startTypingGame() {
    setElementText('typing-fb', '');
    const input = document.getElementById('typing-input');
    if (input) input.value = '';

    if (!masterDeck || masterDeck.length === 0) {
        setElementText('typing-hint', 'Chưa có từ vựng');
        return;
    }

    currentTypingWord = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('typing-hint', `Nghĩa: "${currentTypingWord.back}" (${currentTypingWord.roman || ''})`);
}

function checkTypingAnswer() {
    if (!currentTypingWord) return;
    const input = document.getElementById('typing-input');
    if (!input) return;

    const userAns = input.value.trim().toLowerCase();
    const correctAns = currentTypingWord.front.trim().toLowerCase();

    if (userAns === correctAns) {
        typingScore += 10;
        setElementText('typing-score', typingScore);
        setElementText('typing-fb', '<span style="color:var(--success-color, green);">Đúng rồi!</span>');
        setGameTimeout(startTypingGame, 1000);
    } else {
        setElementText('typing-fb', '<span style="color:var(--danger-color, red);">Chưa đúng, thử lại nhé!</span>');
    }
}

// 4. Luyện phát âm Game
function startSpeakingGame() {
    setElementText('speaking-fb', '');
    if (!masterDeck || masterDeck.length === 0) {
        setElementText('speaking-word', 'Chưa có từ vựng');
        return;
    }

    currentSpeakingWord = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('speaking-word', currentSpeakingWord.front);
    setElementText('speaking-roman', currentSpeakingWord.roman || '');
}

/* ==========================================================================
   GEMINI AI INTEGRATION (CHUẨN HÓA CHỐNG LỖI KẾT NỐI & ĐỊNH DẠNG)
   ========================================================================== */
async function callGeminiAPI(promptText) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        throw new Error("Chưa nhập API Key! Vui lòng cấu hình khóa trước.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const requestBody = {
        contents: [{ parts: [{ text: promptText }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `Lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Bóc tách an toàn tránh lỗi định dạng trả về
        if (
            data &&
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Định dạng phản hồi từ AI không hợp lệ.");
        }
    } catch (error) {
        console.error("Lỗi gọi Gemini API:", error);
        throw error;
    }
}

/* ==========================================================================
   DOM & EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
    // Chuyển Tab chính
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.tab;
            if (!target) return;

            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');

            e.currentTarget.classList.add('active');
            const targetEl = document.getElementById('tab-' + target);
            if (targetEl) targetEl.style.display = 'block';

            activeTab = target;
            if (activeTab === 'game') {
                switchSubGame('quiz');
            } else {
                stopAllSpeech();
                clearGameTimers();
            }
        });
    });

    // Bắt sự kiện bàn phím cho Flashcard
    document.addEventListener('keydown', (e) => {
        if (activeTab !== 'card') return;
        if (e.key === 'ArrowRight') nextCard();
        if (e.key === 'ArrowLeft') prevCard();
        if (e.key === ' ') {
            e.preventDefault();
            flipCard();
        }
    });

    // Lắng nghe sự kiện Enter cho game typing
    const typingInput = document.getElementById('typing-input');
    if (typingInput) {
        typingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkTypingAnswer();
        });
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}
