/* ==========================================================================
   APP STATE & INITIALIZATION
   ========================================================================== */
let masterDeck = [];      
let filteredDeck = [];    
let currentIndex = 0;     
let activeMode = 'dict';   
let currentCategory = 'ALL';

let gameTimers = [];
let isProcessingQuiz = false;
let currentQuiz = null;
let quizScore = 0;
let quizStreak = 0;

let selectedKrCard = null;
let selectedViCard = null;

let currentTypingWord = null;
let typingScore = 0;

let currentSpeakingWord = null;
let currentScenario = 'free';

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateCard();
    initTheme();
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
    filterCategory(currentCategory);
}

function saveData() {
    localStorage.setItem('masterDeck', JSON.stringify(masterDeck));
    filterCategory(currentCategory);
}

function getSampleData() {
    return [
        { front: '안녕하세요', back: 'Xin chào', roman: 'annyeonghaseyo', category: 'Giao tiếp', fav: false, hard: false },
        { front: '감사합니다', back: 'Cảm ơn', roman: 'gamsahamnida', category: 'Giao tiếp', fav: false, hard: false },
        { front: '비빔밥', back: 'Cơm trộn', roman: 'bibimbap', category: 'Du lịch', fav: false, hard: false },
        { front: '학생', back: 'Học sinh', roman: 'haksaeng', category: 'TOPIK 1', fav: false, hard: false }
    ];
}

/* ==========================================================================
   UTILITY & AUDIO / SPEECH
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

function speakKorean(text) {
    if (!('speechSynthesis' in window)) {
        alert('Trình duyệt của bạn không hỗ trợ phát âm (TTS).');
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function stopAllSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

/* ==========================================================================
   THEME & MODAL & IMPORT/EXPORT
   ========================================================================== */
function initTheme() {
    const isDark = localStorage.getItem('theme_dark') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = 'fas fa-sun';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme_dark', isDark);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(masterDeck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "korean_vocab_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                masterDeck = imported;
                saveData();
                updateCard();
                alert('Đã nhập dữ liệu thành công!');
            }
        } catch (err) {
            alert('File JSON không hợp lệ!');
        }
    };
    reader.readAsText(file);
}

/* ==========================================================================
   FLASHCARD SYSTEM
   ========================================================================== */
function filterCategory(cat) {
    currentCategory = cat;
    if (cat === 'ALL') {
        filteredDeck = [...masterDeck];
    } else if (cat === 'Yêu thích') {
        filteredDeck = masterDeck.filter(item => item.fav);
    } else {
        filteredDeck = masterDeck.filter(item => item.category === cat);
    }
    currentIndex = 0;
    updateCard();
}

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

function toggleFavCard() {
    if (!filteredDeck || filteredDeck.length === 0) return;
    const c = filteredDeck[currentIndex];
    c.fav = !c.fav;
    saveData();
    updateCard();
}

function toggleHardCard() {
    if (!filteredDeck || filteredDeck.length === 0) return;
    const c = filteredDeck[currentIndex];
    c.hard = !c.hard;
    saveData();
    updateCard();
}

function deleteCurrentCard() {
    if (!filteredDeck || filteredDeck.length === 0) return;
    const c = filteredDeck[currentIndex];
    if (confirm(`Bạn có chắc muốn xóa từ "${c.front}"?`)) {
        masterDeck = masterDeck.filter(item => item !== c);
        saveData();
        updateCard();
    }
}

/* ==========================================================================
   TRA TỪ (DICTIONARY MODE)
   ========================================================================== */
function searchDictionary() {
    const input = document.getElementById('dict-input').value.trim().toLowerCase();
    if (!input) return;

    const resBox = document.getElementById('dict-result');
    const found = masterDeck.find(item => 
        item.front.toLowerCase().includes(input) || item.back.toLowerCase().includes(input)
    );

    resBox.style.display = 'block';
    if (found) {
        setElementText('res-kr', found.front);
        setElementText('res-vi', found.back + (found.roman ? ` (${found.roman})` : ''));
    } else {
        setElementText('res-kr', input);
        setElementText('res-vi', 'Từ chưa có trong bộ thẻ. Bấm bên dưới để lưu.');
    }
}

function addDictToDeck() {
    const kr = document.getElementById('res-kr').innerText;
    const vi = document.getElementById('res-vi').innerText;
    if (!kr || kr === '---') return;

    const exists = masterDeck.some(item => item.front === kr);
    if (exists) {
        alert('Từ này đã có trong bộ từ vựng!');
        return;
    }

    masterDeck.push({
        front: kr,
        back: vi.includes('Từ chưa có') ? 'Nghĩa tự chọn' : vi,
        roman: '',
        category: 'Giao tiếp',
        fav: false,
        hard: false
    });
    saveData();
    alert(`Đã thêm "${kr}" vào bộ từ vựng!`);
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
                quizScore += 10; 
                quizStreak++;
                const fb = document.getElementById('quiz-fb');
                if (fb) fb.innerHTML = '<span style="color:var(--success-color);">Chính xác!</span>';
            } else {
                btn.classList.add('wrong'); 
                quizStreak = 0;
                const fb = document.getElementById('quiz-fb');
                if (fb) fb.innerHTML = `<span style="color:var(--danger-color);">Sai! Đáp án: ${currentQuiz.back}</span>`;
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
    selectedKrCard = null;
    selectedViCard = null;
    setElementText('match-fb', '');

    const colKr = document.getElementById('col-kr-list');
    const colVi = document.getElementById('col-vi-list');
    if (!colKr || !colVi) return;

    colKr.innerHTML = '';
    colVi.innerHTML = '';

    if (!masterDeck || masterDeck.length < 2) {
        setElementText('match-fb', 'Cần ít nhất 2 từ vựng để chơi nối từ.');
        return;
    }

    const pool = [...masterDeck].sort(() => Math.random() - 0.5).slice(0, 4);
    
    const krList = pool.map(item => ({ id: item.front, text: item.front })).sort(() => Math.random() - 0.5);
    const viList = pool.map(item => ({ id: item.front, text: item.back })).sort(() => Math.random() - 0.5);

    krList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cross-card';
        div.innerText = item.text;
        div.onclick = () => selectMatchCard(div, item.id, 'kr');
        colKr.appendChild(div);
    });

    viList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cross-card';
        div.innerText = item.text;
        div.onclick = () => selectMatchCard(div, item.id, 'vi');
        colVi.appendChild(div);
    });
}

function selectMatchCard(el, id, type) {
    if (el.classList.contains('matched-correct')) return;

    if (type === 'kr') {
        if (selectedKrCard) selectedKrCard.el.classList.remove('selected');
        selectedKrCard = { el, id };
        el.classList.add('selected');
    } else {
        if (selectedViCard) selectedViCard.el.classList.remove('selected');
        selectedViCard = { el, id };
        el.classList.add('selected');
    }

    if (selectedKrCard && selectedViCard) {
        if (selectedKrCard.id === selectedViCard.id) {
            selectedKrCard.el.className = 'cross-card matched-correct';
            selectedViCard.el.className = 'cross-card matched-correct';
            selectedKrCard = null;
            selectedViCard = null;

            const remaining = document.querySelectorAll('.cross-card:not(.matched-correct)');
            if (remaining.length === 0) {
                setElementText('match-fb', 'Xuất sắc! Đã nối hết các từ.');
                setGameTimeout(startMatchGame, 1200);
            }
        } else {
            const krTemp = selectedKrCard.el;
            const viTemp = selectedViCard.el;
            krTemp.classList.add('matched-wrong');
            viTemp.classList.add('matched-wrong');
            
            selectedKrCard = null;
            selectedViCard = null;

            setGameTimeout(() => {
                krTemp.classList.remove('selected', 'matched-wrong');
                viTemp.classList.remove('selected', 'matched-wrong');
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

    const userAns = input.value.trim();
    const correctAns = currentTypingWord.front.trim();

    if (userAns === correctAns) {
        typingScore += 10;
        setElementText('typing-score', typingScore);
        setElementText('typing-fb', '<span style="color:var(--success-color);">Chính xác! +10 điểm</span>');
        setGameTimeout(startTypingGame, 1000);
    } else {
        setElementText('typing-fb', `<span style="color:var(--danger-color);">Chưa đúng! Đáp án đúng: ${correctAns}</span>`);
    }
}

// 4. Luyện phát âm Game
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

function startMicRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Trình duyệt của bạn không hỗ trợ Nhận diện giọng nói.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;

    const btnMic = document.getElementById('btn-mic');
    if (btnMic) btnMic.classList.add('recording');
    setElementText('mic-status', 'Đang nghe... Bắt đầu đọc!');

    recognition.start();

    recognition.onresult = (event) => {
        if (btnMic) btnMic.classList.remove('recording');
        setElementText('mic-status', 'Nhấn micro và đọc');

        const transcript = event.results[0][0].transcript.trim();
        evaluatePronunciation(transcript);
    };

    recognition.onerror = () => {
        if (btnMic) btnMic.classList.remove('recording');
        setElementText('mic-status', 'Không thể nhận diện. Thử lại!');
    };

    recognition.onend = () => {
        if (btnMic) btnMic.classList.remove('recording');
    };
}

function evaluatePronunciation(transcript) {
    if (!currentSpeakingWord) return;
    const target = currentSpeakingWord.front.trim();

    const evalBox = document.getElementById('eval-box');
    if (evalBox) evalBox.style.display = 'block';

    setElementText('eval-transcript', `Giọng nói nhận diện: ${transcript}`);

    if (transcript === target) {
        setElementText('eval-score', '100%');
        setElementText('eval-rating', 'Perfect! Phát âm chuẩn xác!');
    } else if (transcript.includes(target) || target.includes(transcript)) {
        setElementText('eval-score', '75%');
        setElementText('eval-rating', 'Gần đúng! Cố gắng nói rõ hơn.');
    } else {
        setElementText('eval-score', '30%');
        setElementText('eval-rating', 'Chưa đúng. Hãy thử nghe lại từ mẫu.');
    }
}

/* ==========================================================================
   GEMINI AI INTEGRATION
   ========================================================================== */
async function callGeminiAPI(promptText) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        throw new Error("Chưa nhập API Key! Vui lòng dán Gemini API Key ở ô phía trên.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    let scenarioPrompt = "";
    if (currentScenario === 'food') scenarioPrompt = "Bạn là nhà hàng Hàn Quốc. Bắt đầu trò chuyện bằng tiếng Hàn để giúp người học gọi món.";
    else if (currentScenario === 'taxi') scenarioPrompt = "Bạn là tài xế taxi ở Seoul. Bắt đầu trò chuyện bằng tiếng Hàn.";
    else if (currentScenario === 'hotel') scenarioPrompt = "Bạn là lễ tân khách sạn. Hãy giao tiếp tiếng Hàn ngắn gọn.";
    else scenarioPrompt = "Bạn là trợ lý học tiếng Hàn thông minh. Trả lời ngắn gọn bằng tiếng Hàn và kèm dịch nghĩa tiếng Việt.";

    const fullPrompt = `${scenarioPrompt}\nNgười học nói: "${promptText}". Trả lời câu trên. Trả lời bằng định dạng:\nTiếng Hàn: <câu tiếng Hàn>\nTiếng Việt: <dịch tiếng Việt>`;

    const requestBody = {
        contents: [{ parts: [{ text: fullPrompt }] }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Lỗi API HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Phản hồi từ Gemini bị rỗng.");
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    appendChatMessage('user', message);
    input.value = '';

    const chatBox = document.getElementById('chat-box');
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-msg system';
    loadingMsg.innerText = 'AI đang trả lời...';
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const reply = await callGeminiAPI(message);
        chatBox.removeChild(loadingMsg);
        appendChatMessage('ai', reply);
    } catch (err) {
        chatBox.removeChild(loadingMsg);
        appendChatMessage('system', `Lỗi: ${err.message}`);
    }
}

function appendChatMessage(role, text) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* ==========================================================================
   DOM & EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
    // Mode Switcher (Tab chính)
    document.querySelectorAll('.mode-switcher button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            activeMode = mode;

            document.querySelectorAll('.mode-switcher button').forEach(b => b.classList.remove('active-mode'));
            e.currentTarget.classList.add('active-mode');

            document.getElementById('dict-container').style.display = mode === 'dict' ? 'block' : 'none';
            document.getElementById('fc-main-wrapper').style.display = mode === 'flashcard' ? 'block' : 'none';
            document.getElementById('game-main-container').style.display = mode === 'game' ? 'none' : 'none';
            document.getElementById('game-main-container').style.display = mode === 'game' ? 'block' : 'none';
            document.getElementById('aichat-main-container').style.display = mode === 'aichat' ? 'block' : 'none';

            if (mode === 'game') {
                switchSubGame('quiz');
            } else {
                stopAllSpeech();
                clearGameTimers();
            }
        });
    });

    // Category chips
    document.querySelectorAll('.category-bar .cat-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.category-bar .cat-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            filterCategory(e.currentTarget.dataset.cat);
        });
    });

    // Subgame buttons
    document.querySelectorAll('.game-selector button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchSubGame(e.currentTarget.dataset.sub);
        });
    });

    // Flashcard events
    const fc = document.getElementById('flashcard');
    if (fc) fc.addEventListener('click', flipCard);

    document.getElementById('btn-prev-card')?.addEventListener('click', prevCard);
    document.getElementById('btn-next-card')?.addEventListener('click', nextCard);
    document.getElementById('btn-flip-card')?.addEventListener('click', flipCard);
    document.getElementById('btn-fav')?.addEventListener('click', toggleFavCard);
    document.getElementById('btn-hard')?.addEventListener('click', toggleHardCard);
    document.getElementById('btn-delete-word')?.addEventListener('click', deleteCurrentCard);
    document.getElementById('btn-card-audio')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (filteredDeck[currentIndex]) speakKorean(filteredDeck[currentIndex].front);
    });

    // Tra từ events
    document.getElementById('btn-dict-search')?.addEventListener('click', searchDictionary);
    document.getElementById('dict-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchDictionary();
    });
    document.getElementById('btn-dict-speak')?.addEventListener('click', () => {
        const text = document.getElementById('res-kr').innerText;
        if (text && text !== '---') speakKorean(text);
    });
    document.getElementById('btn-dict-add')?.addEventListener('click', addDictToDeck);

    // Mini game typing events
    document.getElementById('btn-typing-submit')?.addEventListener('click', checkTypingAnswer);
    document.getElementById('typing-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkTypingAnswer();
    });
    document.getElementById('btn-typing-listen')?.addEventListener('click', () => {
        if (currentTypingWord) speakKorean(currentTypingWord.front);
    });

    // Speaking game events
    document.getElementById('btn-speak-sample')?.addEventListener('click', () => {
        if (currentSpeakingWord) speakKorean(currentSpeakingWord.front);
    });
    document.getElementById('btn-next-speak')?.addEventListener('click', startSpeakingGame);
    document.getElementById('btn-mic')?.addEventListener('click', startMicRecognition);
    document.getElementById('btn-refresh-match')?.addEventListener('click', startMatchGame);

    // AI Chat events
    document.getElementById('btn-save-key')?.addEventListener('click', () => {
        const key = document.getElementById('gemini-api-key').value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            alert('Đã lưu Gemini API Key!');
        }
    });
    document.getElementById('btn-chat-send')?.addEventListener('click', sendChatMessage);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Scenario chips
    document.querySelectorAll('.ai-scenario-bar .scen-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.ai-scenario-bar .scen-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentScenario = e.currentTarget.dataset.scen;
            appendChatMessage('system', `Đã đổi kịch bản sang: ${e.currentTarget.innerText}`);
        });
    });

    // Theme & Modal & Import/Export
    document.getElementById('btn-toggle-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-open-add')?.addEventListener('click', () => {
        document.getElementById('add-modal').style.display = 'flex';
    });
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
        document.getElementById('add-modal').style.display = 'none';
    });
    document.getElementById('btn-cancel-modal')?.addEventListener('click', () => {
        document.getElementById('add-modal').style.display = 'none';
    });
    document.getElementById('btn-save-modal')?.addEventListener('click', () => {
        const kr = document.getElementById('new-kr').value.trim();
        const rm = document.getElementById('new-rm').value.trim();
        const vi = document.getElementById('new-vi').value.trim();
        const cat = document.getElementById('new-cat').value.trim() || 'Giao tiếp';

        if (!kr || !vi) {
            alert('Vui lòng nhập đủ từ tiếng Hàn và nghĩa tiếng Việt.');
            return;
        }

        masterDeck.push({ front: kr, roman: rm, back: vi, category: cat, fav: false, hard: false });
        saveData();
        updateCard();

        document.getElementById('new-kr').value = '';
        document.getElementById('new-rm').value = '';
        document.getElementById('new-vi').value = '';
        document.getElementById('new-cat').value = '';
        document.getElementById('add-modal').style.display = 'none';
    });

    document.getElementById('btn-export-import')?.addEventListener('click', () => {
        const choice = confirm("Bấm OK để XUẤT (Export) dữ liệu ra file JSON.\nBấm CANCEL để NHẬP (Import) dữ liệu từ file JSON.");
        if (choice) {
            exportData();
        } else {
            document.getElementById('import-file').click();
        }
    });

    document.getElementById('import-file')?.addEventListener('change', importData);

    // Keyboard navigation cho Flashcard
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
