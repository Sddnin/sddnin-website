/* ==========================================================================
   APP STATE & INITIALIZATION
   ========================================================================== */
let masterDeck = [];      
let filteredDeck = [];    
let currentIndex = 0;     
let activeMode = 'dict'; 
let currentCategory = 'ALL';

// Game variables
let gameTimers = [];
let isProcessingQuiz = false;
let currentQuiz = null;
let quizScore = 0;
let quizStreak = 0;

let matchScore = 0;
let selectedKrCard = null;
let selectedViCard = null;

let currentTypingWord = null;
let typingScore = 0;

let currentSpeakingWord = null;
let recognition = null;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initSpeechRecognition();
    setupEventListeners();
    updateCard();
    checkDailyStreak();
});

/* ==========================================================================
   DATA MANAGEMENT (LOCALSTORAGE & STREAK)
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
    applyCategoryFilter(currentCategory);
}

function saveData() {
    localStorage.setItem('masterDeck', JSON.stringify(masterDeck));
    applyCategoryFilter(currentCategory);
}

function getSampleData() {
    return [
        { front: '안녕하세요', back: 'Xin chào', roman: 'An-nyeong-ha-se-yo', category: 'Giao tiếp', fav: false, hard: false },
        { front: '감사합니다', back: 'Cảm ơn', roman: 'Gam-sa-ham-ni-da', category: 'Giao tiếp', fav: false, hard: false },
        { front: '맛있어요', back: 'Ngon lắm', roman: 'Mas-iss-eo-yo', category: 'Du lịch', fav: false, hard: false },
        { front: '물', back: 'Nước', roman: 'Mul', category: 'TOPIK 1', fav: false, hard: false }
    ];
}

function checkDailyStreak() {
    const lastVisit = localStorage.getItem('last_visit_date');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('daily_streak') || '1', 10);

    if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            streak += 1;
        } else if (diffDays > 1) {
            streak = 1;
        }
    }
    localStorage.setItem('last_visit_date', today);
    localStorage.setItem('daily_streak', streak);
    setElementText('daily-streak', streak);
}

function applyCategoryFilter(cat) {
    currentCategory = cat;
    if (cat === 'ALL') {
        filteredDeck = [...masterDeck];
    } else if (cat === 'Yêu thích') {
        filteredDeck = masterDeck.filter(c => c.fav);
    } else {
        filteredDeck = masterDeck.filter(c => c.category === cat);
    }
    currentIndex = 0;
    updateCard();
}

/* ==========================================================================
   UTILITY & SPEECH SYNTHESIS / RECOGNITION
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

function stopAllSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speakKorean(text) {
    if (!('speechSynthesis' in window)) return;
    stopAllSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

/* ==========================================================================
   FLASHCARD SYSTEM
   ========================================================================== */
function updateCard() {
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('is-flipped');
    
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
        setElementText('count-badge', masterDeck.length);
        return;
    }

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
    if (!filteredDeck || filteredDeck.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredDeck.length;
    updateCard();
}

function prevCard() {
    if (!filteredDeck || filteredDeck.length === 0) return;
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
        if (btn) {
            if (g === sub) btn.classList.add('active-subgame');
            else btn.classList.remove('active-subgame');
        }
    });

    if (sub === 'quiz') startQuizGame();
    if (sub === 'match') startMatchGame();
    if (sub === 'typing') startTypingGame();
    if (sub === 'speaking') startSpeakingGame();
}

// 1. Trắc nghiệm
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
                quizScore += 10; 
                quizStreak++;
                setElementText('quiz-fb', 'Chính xác!');
                const fb = document.getElementById('quiz-fb');
                if (fb) fb.style.color = 'var(--success-color)';
            } else {
                btn.classList.add('wrong'); 
                quizStreak = 0;
                setElementText('quiz-fb', `Sai! Đáp án đúng: ${currentQuiz.back}`);
                const fb = document.getElementById('quiz-fb');
                if (fb) fb.style.color = 'var(--danger-color)';
            }
            
            setElementText('quiz-score', quizScore);
            setElementText('quiz-streak', quizStreak);
            setGameTimeout(startQuizGame, 1200);
        };
        container.appendChild(btn);
    });
}

// 2. Nối từ
function startMatchGame() {
    selectedKrCard = null;
    selectedViCard = null;
    setElementText('match-fb', '');

    const krCol = document.getElementById('col-kr-list');
    const viCol = document.getElementById('col-vi-list');
    if (!krCol || !viCol) return;
    
    krCol.innerHTML = '';
    viCol.innerHTML = '';

    if (!masterDeck || masterDeck.length < 2) {
        krCol.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">Cần tối thiểu 2 từ vựng.</p>';
        return;
    }

    const pool = [...masterDeck].sort(() => Math.random() - 0.5).slice(0, 4);
    
    const krList = pool.map((item, id) => ({ id, text: item.front })).sort(() => Math.random() - 0.5);
    const viList = pool.map((item, id) => ({ id, text: item.back })).sort(() => Math.random() - 0.5);

    krList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cross-card';
        div.innerText = item.text;
        div.onclick = () => selectMatchItem(div, item, 'kr');
        krCol.appendChild(div);
    });

    viList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cross-card';
        div.innerText = item.text;
        div.onclick = () => selectMatchItem(div, item, 'vi');
        viCol.appendChild(div);
    });
}

function selectMatchItem(el, item, type) {
    if (el.classList.contains('matched-correct')) return;

    if (type === 'kr') {
        if (selectedKrCard) selectedKrCard.el.classList.remove('selected');
        selectedKrCard = { el, item };
        el.classList.add('selected');
    } else {
        if (selectedViCard) selectedViCard.el.classList.remove('selected');
        selectedViCard = { el, item };
        el.classList.add('selected');
    }

    if (selectedKrCard && selectedViCard) {
        if (selectedKrCard.item.id === selectedViCard.item.id) {
            selectedKrCard.el.className = 'cross-card matched-correct';
            selectedViCard.el.className = 'cross-card matched-correct';
            matchScore += 20;
            selectedKrCard = null;
            selectedViCard = null;

            const remaining = document.querySelectorAll('.cross-card:not(.matched-correct)').length;
            if (remaining === 0) {
                setElementText('match-fb', 'Hoàn thành tuyệt vời!');
                setGameTimeout(startMatchGame, 1200);
            }
        } else {
            const krEl = selectedKrCard.el;
            const viEl = selectedViCard.el;
            krEl.classList.add('matched-wrong');
            viEl.classList.add('matched-wrong');
            
            selectedKrCard = null;
            selectedViCard = null;

            setGameTimeout(() => {
                krEl.classList.remove('selected', 'matched-wrong');
                viEl.classList.remove('selected', 'matched-wrong');
            }, 600);
        }
    }
}

// 3. Gõ phím
function startTypingGame() {
    setElementText('typing-fb', '');
    const input = document.getElementById('typing-input');
    if (input) input.value = '';

    if (!masterDeck || masterDeck.length === 0) {
        setElementText('typing-vi', 'Chưa có từ vựng');
        return;
    }

    currentTypingWord = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('typing-vi', currentTypingWord.back);
}

function checkTypingAnswer() {
    if (!currentTypingWord) return;
    const input = document.getElementById('typing-input');
    if (!input) return;

    const userAns = input.value.trim().toLowerCase();
    const correctAns = currentTypingWord.front.trim().toLowerCase();

    const fb = document.getElementById('typing-fb');
    if (userAns === correctAns) {
        typingScore += 10;
        setElementText('typing-score', typingScore);
        if (fb) {
            fb.innerText = 'Đúng rồi!';
            fb.style.color = 'var(--success-color)';
        }
        setGameTimeout(startTypingGame, 1000);
    } else {
        if (fb) {
            fb.innerText = `Chưa đúng! Đáp án đúng: ${currentTypingWord.front}`;
            fb.style.color = 'var(--danger-color)';
        }
    }
}

// 4. Luyện phát âm
function startSpeakingGame() {
    setElementText('speak-fb', '');
    const evalBox = document.getElementById('eval-box');
    if (evalBox) evalBox.style.display = 'none';

    if (!masterDeck || masterDeck.length === 0) {
        setElementText('speak-target', 'Chưa có từ vựng');
        setElementText('speak-vi', '');
        return;
    }

    currentSpeakingWord = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    setElementText('speak-target', currentSpeakingWord.front);
    setElementText('speak-vi', currentSpeakingWord.back);
}

function recordAndEvaluate() {
    if (!recognition) {
        alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.");
        return;
    }

    const micBtn = document.getElementById('btn-mic');
    if (micBtn) micBtn.classList.add('recording');
    setElementText('mic-status', 'Đang nghe...');

    recognition.start();

    recognition.onresult = (event) => {
        if (micBtn) micBtn.classList.remove('recording');
        setElementText('mic-status', 'Nhấn micro và đọc');
        
        const transcript = event.results[0][0].transcript.trim();
        const target = currentSpeakingWord ? currentSpeakingWord.front.trim() : '';

        const evalBox = document.getElementById('eval-box');
        if (evalBox) evalBox.style.display = 'block';

        setElementText('eval-transcript', `Giọng nói nhận diện: "${transcript}"`);

        if (transcript === target) {
            setElementText('eval-score', '100%');
            setElementText('eval-rating', 'Phát âm tuyệt vời!');
        } else if (transcript.includes(target) || target.includes(transcript)) {
            setElementText('eval-score', '70%');
            setElementText('eval-rating', 'Khá tốt! Cần rõ hơn chút.');
        } else {
            setElementText('eval-score', '30%');
            setElementText('eval-rating', 'Thử lại nhé, hãy phát âm chuẩn hơn.');
        }
    };

    recognition.onerror = () => {
        if (micBtn) micBtn.classList.remove('recording');
        setElementText('mic-status', 'Lỗi nhận diện. Nhấn lại để thử!');
    };

    recognition.onend = () => {
        if (micBtn) micBtn.classList.remove('recording');
    };
}

/* ==========================================================================
   TRA TỪ
   ========================================================================== */
function handleDictSearch() {
    const input = document.getElementById('dict-input');
    if (!input || !input.value.trim()) return;

    const query = input.value.trim().toLowerCase();
    const resultBox = document.getElementById('dict-result');
    
    const match = masterDeck.find(item => 
        item.front.toLowerCase() === query || item.back.toLowerCase() === query
    );

    if (resultBox) resultBox.style.display = 'block';

    if (match) {
        setElementText('res-kr', match.front);
        setElementText('res-vi', match.back);
    } else {
        setElementText('res-kr', query);
        setElementText('res-vi', 'Từ mới (Chưa có trong bộ từ)');
    }
}

/* ==========================================================================
   GROQ API INTEGRATION (OpenAI-compatible)
   ========================================================================== */
async function callGroqAPI(promptText) {
    const apiKey = localStorage.getItem('gemini_api_key'); // Dùng chung key input trên giao diện hoặc bạn có thể đổi ID
    if (!apiKey) {
        throw new Error("Chưa nhập Groq API Key! Vui lòng dán khóa API của bạn vào ô bên trên.");
    }

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const requestBody = {
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: 'Bạn là trợ lý AI thông minh chuyên dạy tiếng Hàn cho người Việt. Hãy trả lời ngắn gọn, rõ ràng, kèm phiên âm và nghĩa tiếng Việt.' },
            { role: 'user', content: promptText }
        ],
        temperature: 0.7
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    } else {
        throw new Error("Phản hồi từ Groq API bị rỗng.");
    }
}

async function handleSendMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    appendChatMessage('user', userText);
    input.value = '';

    try {
        const reply = await callGroqAPI(userText);
        appendChatMessage('ai', reply);
    } catch (err) {
        appendChatMessage('system', `Lỗi: ${err.message}`);
    }
}

function appendChatMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerText = text;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* ==========================================================================
   EVENT LISTENERS & BINDINGS
   ========================================================================== */
function setupEventListeners() {
    // Mode Switcher
    document.querySelectorAll('.mode-switcher button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            activeMode = mode;

            document.querySelectorAll('.mode-switcher button').forEach(b => b.classList.remove('active-mode'));
            e.currentTarget.classList.add('active-mode');

            document.getElementById('dict-container').style.display = mode === 'dict' ? 'block' : 'none';
            document.getElementById('fc-main-wrapper').style.display = mode === 'flashcard' ? 'block' : 'none';
            document.getElementById('game-main-container').style.display = mode === 'game' ? 'block' : 'none';
            document.getElementById('aichat-main-container').style.display = mode === 'aichat' ? 'block' : 'none';

            if (mode === 'game') switchSubGame('quiz');
            else stopAllSpeech();
        });
    });

    // Category Filter Chips
    document.querySelectorAll('#category-bar .cat-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#category-bar .cat-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            applyCategoryFilter(e.currentTarget.dataset.cat);
        });
    });

    // Sub-Game Selector
    document.querySelectorAll('.game-selector button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchSubGame(e.currentTarget.dataset.sub);
        });
    });

    // Flashcard Controls
    const btnFlip = document.getElementById('btn-flip-card');
    if (btnFlip) btnFlip.onclick = flipCard;

    const btnNext = document.getElementById('btn-next-card');
    if (btnNext) btnNext.onclick = nextCard;

    const btnPrev = document.getElementById('btn-prev-card');
    if (btnPrev) btnPrev.onclick = prevCard;

    const flashcardEl = document.getElementById('flashcard');
    if (flashcardEl) flashcardEl.onclick = (e) => {
        if (!e.target.closest('#btn-card-audio')) flipCard();
    };

    const btnCardAudio = document.getElementById('btn-card-audio');
    if (btnCardAudio) btnCardAudio.onclick = (e) => {
        e.stopPropagation();
        if (filteredDeck.length > 0) speakKorean(filteredDeck[currentIndex].front);
    };

    // Card Actions
    const btnFav = document.getElementById('btn-fav');
    if (btnFav) btnFav.onclick = () => {
        if (filteredDeck.length === 0) return;
        filteredDeck[currentIndex].fav = !filteredDeck[currentIndex].fav;
        saveData();
        updateCard();
    };

    const btnHard = document.getElementById('btn-hard');
    if (btnHard) btnHard.onclick = () => {
        if (filteredDeck.length === 0) return;
        filteredDeck[currentIndex].hard = !filteredDeck[currentIndex].hard;
        saveData();
        updateCard();
    };

    const btnDelete = document.getElementById('btn-delete-word');
    if (btnDelete) btnDelete.onclick = () => {
        if (filteredDeck.length === 0) return;
        const currentItem = filteredDeck[currentIndex];
        masterDeck = masterDeck.filter(item => item !== currentItem);
        saveData();
        updateCard();
    };

    // Dictionary Search
    const btnDictSearch = document.getElementById('btn-dict-search');
    if (btnDictSearch) btnDictSearch.onclick = handleDictSearch;

    const btnDictSpeak = document.getElementById('btn-dict-speak');
    if (btnDictSpeak) btnDictSpeak.onclick = () => {
        const text = document.getElementById('res-kr').innerText;
        if (text && text !== '---') speakKorean(text);
    };

    const btnDictAdd = document.getElementById('btn-dict-add');
    if (btnDictAdd) btnDictAdd.onclick = () => {
        const kr = document.getElementById('res-kr').innerText;
        const vi = document.getElementById('res-vi').innerText;
        if (kr && kr !== '---') {
            masterDeck.push({ front: kr, back: vi, roman: '', category: 'Giao tiếp', fav: false, hard: false });
            saveData();
            alert('Đã lưu vào bộ từ vựng!');
        }
    };

    // Typing Game Buttons
    const btnTypingSubmit = document.getElementById('btn-typing-submit');
    if (btnTypingSubmit) btnTypingSubmit.onclick = checkTypingAnswer;

    const btnTypingListen = document.getElementById('btn-typing-listen');
    if (btnTypingListen) btnTypingListen.onclick = () => {
        if (currentTypingWord) speakKorean(currentTypingWord.front);
    };

    const typingInput = document.getElementById('typing-input');
    if (typingInput) typingInput.onkeypress = (e) => { if (e.key === 'Enter') checkTypingAnswer(); };

    // Match Game Refresh
    const btnRefreshMatch = document.getElementById('btn-refresh-match');
    if (btnRefreshMatch) btnRefreshMatch.onclick = startMatchGame;

    // Speaking Game Controls
    const btnNextSpeak = document.getElementById('btn-next-speak');
    if (btnNextSpeak) btnNextSpeak.onclick = startSpeakingGame;

    const btnSpeakSample = document.getElementById('btn-speak-sample');
    if (btnSpeakSample) btnSpeakSample.onclick = () => {
        if (currentSpeakingWord) speakKorean(currentSpeakingWord.front);
    };

    const btnMic = document.getElementById('btn-mic');
    if (btnMic) btnMic.onclick = recordAndEvaluate;

    // Groq API Key & Send
    const btnSaveKey = document.getElementById('btn-save-key');
    if (btnSaveKey) btnSaveKey.onclick = () => {
        const keyInput = document.getElementById('gemini-api-key');
        if (keyInput && keyInput.value.trim()) {
            localStorage.setItem('gemini_api_key', keyInput.value.trim());
            alert('Đã lưu Groq API Key!');
        }
    };

    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        const keyInput = document.getElementById('gemini-api-key');
        if (keyInput) keyInput.value = savedKey;
    }

    const btnChatSend = document.getElementById('btn-chat-send');
    if (btnChatSend) btnChatSend.onclick = handleSendMessage;

    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleSendMessage(); };

    // Modal Add Word
    const btnOpenAdd = document.getElementById('btn-open-add');
    const addModal = document.getElementById('add-modal');
    if (btnOpenAdd && addModal) btnOpenAdd.onclick = () => addModal.style.display = 'flex';

    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    if (btnCloseModal && addModal) onCloseModal.onclick = () => addModal.style.display = 'none'; // safe check
    if (btnCloseModal && addModal) btnCloseModal.onclick = () => addModal.style.display = 'none';
    if (btnCancelModal && addModal) btnCancelModal.onclick = () => addModal.style.display = 'none';

    const btnSaveModal = document.getElementById('btn-save-modal');
    if (btnSaveModal) btnSaveModal.onclick = () => {
        const kr = document.getElementById('new-kr').value.trim();
        const rm = document.getElementById('new-rm').value.trim();
        const vi = document.getElementById('new-vi').value.trim();
        const cat = document.getElementById('new-cat').value.trim() || 'Chủ đề';

        if (kr && vi) {
            masterDeck.push({ front: kr, roman: rm, back: vi, category: cat, fav: false, hard: false });
            saveData();
            addModal.style.display = 'none';
            document.getElementById('new-kr').value = '';
            document.getElementById('new-rm').value = '';
            document.getElementById('new-vi').value = '';
            document.getElementById('new-cat').value = '';
        }
    };

    // Dark Mode Toggle
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    if (btnToggleTheme) btnToggleTheme.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
        }
    };

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (activeMode !== 'flashcard') return;
        if (e.key === 'ArrowRight') nextCard();
        if (e.key === 'ArrowLeft') prevCard();
        if (e.key === ' ') {
            e.preventDefault();
            flipCard();
        }
    });
}
