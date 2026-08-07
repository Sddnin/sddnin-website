/**
 * Korean Learning App Engine 3.0
 * Features Tab-Lifecycle Protection, Gemini AI Integration & Mini Games
 */

const defaultDeck = [
    { front: "안녕하세요", roman: "annyeonghaseyo", back: "Xin chào", category: "Giao tiếp", fav: false, hard: false },
    { front: "감사합니다", roman: "gamsahamnida", back: "Cảm ơn", category: "Giao tiếp", fav: false, hard: false },
    { front: "죄송합니다", roman: "joesonghamnida", back: "Xin lỗi", category: "Giao tiếp", fav: false, hard: false },
    { front: "물", roman: "mul", back: "Nước", category: "Du lịch", fav: false, hard: false },
    { front: "밥", roman: "bap", back: "Cơm", category: "Du lịch", fav: false, hard: false },
    { front: "학교", roman: "hakgyo", back: "Trường học", category: "TOPIK 1", fav: false, hard: false }
];

let masterDeck = JSON.parse(localStorage.getItem('kr_deck_2')) || defaultDeck;
let filteredDeck = [...masterDeck];
let currentIndex = 0;
let activeCategory = 'ALL';
let currentMode = 'dict'; 
let lastDictResult = null;

// Lock Flags
let isFlipping = false;
let isFetchingDict = false;
let isProcessingQuiz = false;
let isProcessingMatch = false;
let isProcessingTyping = false;
let isChatting = false;

// Timers & Speech Cleanups
let gameTimeout = null;
let recognition = null;
let chatRec = null;

function setGameTimeout(fn, delay) {
    clearGameTimers();
    gameTimeout = setTimeout(fn, delay);
}

function clearGameTimers() {
    if (gameTimeout) {
        clearTimeout(gameTimeout);
        gameTimeout = null;
    }
}

function stopAllSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognition) { try { recognition.abort(); } catch(e){} }
    if (chatRec) { try { chatRec.abort(); } catch(e){} }

    const mic1 = document.getElementById('btn-mic');
    if (mic1) mic1.classList.remove('recording');
    const mic2 = document.getElementById('btn-chat-mic');
    if (mic2) mic2.classList.remove('recording');
    const status = document.getElementById('mic-status');
    if (status) status.innerText = 'Nhấn micro và đọc';
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAllSpeech();
});

function playSFX(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'correct') {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'wrong') {
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        }
    } catch(e) {}
}

function saveDeck() {
    localStorage.setItem('kr_deck_2', JSON.stringify(masterDeck));
    applyFilter();
}

function initSettings() {
    if (localStorage.getItem('kr_darkmode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
    document.getElementById('gemini-api-key').value = localStorage.getItem('gemini_api_key') || '';

    const lastActive = localStorage.getItem('kr_last_active');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('kr_streak_count') || '1');
    if (lastActive && lastActive !== today) {
        const diffDays = Math.round((new Date(today) - new Date(lastActive)) / 86400000);
        streak = diffDays === 1 ? streak + 1 : 1;
    }
    localStorage.setItem('kr_last_active', today);
    localStorage.setItem('kr_streak_count', streak);
    document.getElementById('daily-streak').innerText = streak;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('kr_darkmode', document.body.classList.contains('dark-mode'));
    document.getElementById('theme-icon').className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
}

function saveApiKey() {
    localStorage.setItem('gemini_api_key', document.getElementById('gemini-api-key').value.trim());
    alert('Đã lưu API Key!');
}

function filterCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.cat-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === cat));
    applyFilter();
}

function applyFilter() {
    filteredDeck = activeCategory === 'ALL' ? [...masterDeck] : (activeCategory === 'Yêu thích' ? masterDeck.filter(w => w.fav) : masterDeck.filter(w => w.category === activeCategory));
    if (filteredDeck.length === 0) filteredDeck = [{ front: "Không có từ", roman: "-", back: "-", category: "-" }];
    if (currentIndex >= filteredDeck.length) currentIndex = 0;
    updateCard();
}

const card = document.getElementById('flashcard');
function updateCard() {
    card.classList.remove('is-flipped');
    const c = filteredDeck[currentIndex];
    document.getElementById('front-text').innerText = c.front;
    document.getElementById('back-text').innerText = c.back;
    document.getElementById('front-roman').innerText = c.roman || '';
    document.getElementById('back-roman').innerText = c.roman || '';
    document.getElementById('front-cat').innerText = c.category || 'Chủ đề';
    document.getElementById('back-cat').innerText = c.category || 'Chủ đề';
    document.getElementById('current-idx').innerText = filteredDeck.length ? currentIndex + 1 : 0;
    document.getElementById('total-idx').innerText = filteredDeck.length;
    document.getElementById('progress-fill').style.width = filteredDeck.length ? ((currentIndex + 1) / filteredDeck.length) * 100 + '%' : '0%';
    document.getElementById('btn-fav').className = c.fav ? 'active-love' : '';
    document.getElementById('btn-hard').className = c.hard ? 'active-hard' : '';
    document.getElementById('count-badge').innerText = masterDeck.length;
}

function flipCard() {
    if (isFlipping) return;
    isFlipping = true;
    card.classList.toggle('is-flipped');
    setTimeout(() => { isFlipping = false; }, 400); 
}

function prevCard() { if (currentIndex > 0) { currentIndex--; updateCard(); } }
function nextCard() { if (currentIndex < filteredDeck.length - 1) { currentIndex++; updateCard(); } }

function toggleStatus(type) {
    const c = filteredDeck[currentIndex];
    if (!c || c.front === "Không có từ") return;
    if (type === 'fav') c.fav = !c.fav;
    if (type === 'hard') c.hard = !c.hard;
    saveDeck();
}

function deleteCurrentWord() {
    const c = filteredDeck[currentIndex];
    if (!c || c.front === "Không có từ") return;
    if (confirm(`Xóa từ "${c.front}"?`)) { masterDeck = masterDeck.filter(w => w.front !== c.front); saveDeck(); }
}

function speakText(text) {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ko-KR'; u.rate = 0.8;
        window.speechSynthesis.speak(u);
    }
}

async function lookupDictionary() {
    if (isFetchingDict) return;
    const query = document.getElementById('dict-input').value.trim();
    if (!query) return;
    
    isFetchingDict = true;
    const btn = document.getElementById('btn-dict-search');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tra...';
    document.getElementById('dict-result').style.display = 'block';
    document.getElementById('res-kr').innerText = 'Đang tra...';
    document.getElementById('res-vi').innerText = '';

    try {
        const isKorean = /[\u3131-\u318E\uAC00-\uD7A3]/.test(query);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${isKorean?'ko':'vi'}&tl=${isKorean?'vi':'ko'}&dt=t&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        const kr = isKorean ? data[0][0][1] : data[0][0][0];
        const vi = isKorean ? data[0][0][0] : data[0][0][1];
        document.getElementById('res-kr').innerText = kr;
        document.getElementById('res-vi').innerText = vi;
        lastDictResult = { front: kr, roman: 'Tra cứu', back: vi, category: 'Đã lưu', fav: false, hard: false };
    } catch (e) { document.getElementById('res-kr').innerText = 'Lỗi tra cứu!'; }

    isFetchingDict = false;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> Tra';
}

function addDictResultToDeck() {
    if (!lastDictResult || masterDeck.some(c => c.front === lastDictResult.front)) return alert('Từ này đã có hoặc chưa hợp lệ!');
    masterDeck.push(lastDictResult); saveDeck(); alert(`Đã lưu "${lastDictResult.front}"!`);
}

function openAddModal() { document.getElementById('add-modal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('add-modal').style.display = 'none'; }
function saveCustomWord() {
    const kr = document.getElementById('new-kr').value.trim();
    const rm = document.getElementById('new-rm').value.trim();
    const vi = document.getElementById('new-vi').value.trim();
    const cat = document.getElementById('new-cat').value.trim() || 'Cá nhân';
    if (!kr || !vi) return alert('Nhập đủ từ Hàn và Việt!');
    masterDeck.push({ front: kr, roman: rm, back: vi, category: cat, fav: false, hard: false });
    saveDeck(); closeAddModal(); alert('Đã thêm!');
}

function exportImportData() {
    const choice = prompt("Nhập '1' để XUẤT, '2' để NHẬP JSON.");
    if (choice === '1') {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(masterDeck, null, 2)], { type: 'application/json' }));
        a.download = 'bo_tu.json'; a.click();
    } else if (choice === '2') document.getElementById('import-file').click();
}

function handleFileImport(e) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            if (Array.isArray(data)) { masterDeck = data; saveDeck(); alert('Đã nhập dữ liệu!'); }
        } catch(err) { alert('Lỗi định dạng!'); }
    };
    if(e.target.files[0]) reader.readAsText(e.target.files[0]);
}

function switchMode(mode) {
    currentMode = mode;
    stopAllSpeech();
    clearGameTimers();

    ['dict', 'flashcard', 'game', 'aichat'].forEach(m => {
        const el = document.getElementById(m + (m==='dict'?'-container':(m==='aichat'?'-main-container':'-main-wrapper')));
        if (el) el.style.display = m === mode ? 'block' : 'none';
        const btn = document.getElementById('mode-' + m);
        if (btn) btn.className = m === mode ? 'active-mode' : '';
    });

    if (mode === 'game') {
        const activeSub = document.querySelector('.game-selector .active-subgame');
        const subId = activeSub ? activeSub.dataset.sub : 'speaking';
        switchSubGame(subId);
    }

    if (mode === 'aichat' && chatHistory.length === 0) {
        initAiChat();
    }
}

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

// Games Logic
let quizScore = 0, quizStreak = 0, currentQuiz = null;
function startQuizGame() {
    isProcessingQuiz = false;
    document.getElementById('quiz-fb').innerText = '';
    currentQuiz = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    document.getElementById('quiz-kr').innerText = currentQuiz.front;
    document.getElementById('quiz-rm').innerText = currentQuiz.roman || '';
    const opts = [currentQuiz.back];
    while(opts.length < Math.min(4, masterDeck.length)) {
        const r = masterDeck[Math.floor(Math.random() * masterDeck.length)].back;
        if(!opts.includes(r)) opts.push(r);
    }
    opts.sort(() => Math.random() - 0.5);
    const container = document.getElementById('quiz-opts');
    container.innerHTML = '';
    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn'; btn.innerText = opt;
        btn.onclick = () => {
            if (isProcessingQuiz) return;
            isProcessingQuiz = true;
            if(opt === currentQuiz.back) {
                btn.classList.add('correct'); playSFX('correct');
                quizScore += 10; quizStreak++;
                document.getElementById('quiz-fb').innerHTML = '<span style="color:var(--success-color);">Chính xác!</span>';
            } else {
                btn.classList.add('wrong'); playSFX('wrong');
                quizStreak = 0;
                document.getElementById('quiz-fb').innerHTML = `<span style="color:var(--danger-color);">Sai! Đáp án: ${currentQuiz.back}</span>`;
            }
            document.getElementById('quiz-score').innerText = quizScore;
            document.getElementById('quiz-streak').innerText = quizStreak;
            setGameTimeout(startQuizGame, 1000);
        };
        container.appendChild(btn);
    });
}

let selectedKrElem = null, selectedViElem = null, matchedPairsCount = 0, totalPairsInRound = 0;
function startMatchGame() {
    document.getElementById('match-fb').innerText = '';
    selectedKrElem = null; selectedViElem = null; matchedPairsCount = 0;
    const krListDiv = document.getElementById('col-kr-list');
    const viListDiv = document.getElementById('col-vi-list');
    krListDiv.innerHTML = ''; viListDiv.innerHTML = '';
    
    const sampleSize = Math.min(4, masterDeck.length);
    totalPairsInRound = sampleSize;
    const roundWords = [...masterDeck].sort(() => Math.random() - 0.5).slice(0, sampleSize);
    const shuffledVi = [...roundWords].sort(() => Math.random() - 0.5);

    roundWords.forEach(w => {
        const div = document.createElement('div');
        div.className = 'cross-card'; div.innerText = w.front; div.dataset.id = w.front;
        div.onclick = () => selectCrossCard(div, 'kr');
        krListDiv.appendChild(div);
    });
    shuffledVi.forEach(w => {
        const div = document.createElement('div');
        div.className = 'cross-card'; div.innerText = w.back; div.dataset.id = w.front;
        div.onclick = () => selectCrossCard(div, 'vi');
        viListDiv.appendChild(div);
    });
}

function selectCrossCard(elem, colType) {
    if (isProcessingMatch || elem.classList.contains('matched-correct')) return;
    if (colType === 'kr') {
        if (selectedKrElem) selectedKrElem.classList.remove('selected');
        selectedKrElem = elem; selectedKrElem.classList.add('selected');
    } else {
        if (selectedViElem) selectedViElem.classList.remove('selected');
        selectedViElem = elem; selectedViElem.classList.add('selected');
    }

    if (selectedKrElem && selectedViElem) {
        if (selectedKrElem.dataset.id === selectedViElem.dataset.id) {
            playSFX('correct');
            selectedKrElem.className = 'cross-card matched-correct';
            selectedViElem.className = 'cross-card matched-correct';
            selectedKrElem = null; selectedViElem = null; matchedPairsCount++;
            if (matchedPairsCount === totalPairsInRound) document.getElementById('match-fb').innerHTML = '<span style="color:var(--success-color);">Tuyệt vời! Hoàn thành! 🎉</span>';
        } else {
            isProcessingMatch = true;
            playSFX('wrong');
            const tempKr = selectedKrElem, tempVi = selectedViElem;
            tempKr.classList.add('matched-wrong'); tempVi.classList.add('matched-wrong');
            selectedKrElem = null; selectedViElem = null;
            setGameTimeout(() => {
                tempKr.classList.remove('selected', 'matched-wrong');
                tempVi.classList.remove('selected', 'matched-wrong');
                isProcessingMatch = false;
            }, 500);
        }
    }
}

let typingScore = 0, currentTyping = null;
function startTypingGame() {
    isProcessingTyping = false;
    document.getElementById('btn-typing-submit').disabled = false;
    document.getElementById('typing-fb').innerText = '';
    document.getElementById('typing-input').value = '';
    currentTyping = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    document.getElementById('typing-vi').innerText = currentTyping.back;
}

function checkTyping() {
    if (isProcessingTyping) return;
    const val = document.getElementById('typing-input').value.trim();
    if (!val) return;
    
    isProcessingTyping = true;
    document.getElementById('btn-typing-submit').disabled = true;

    if (val === currentTyping.front) {
        playSFX('correct'); typingScore += 10;
        document.getElementById('typing-score').innerText = typingScore;
        document.getElementById('typing-fb').innerHTML = '<span style="color:var(--success-color);">Đúng rồi!</span>';
        setGameTimeout(startTypingGame, 1000);
    } else {
        playSFX('wrong');
        document.getElementById('typing-fb').innerHTML = `<span style="color:var(--danger-color);">Sai! Đáp án: <strong>${currentTyping.front}</strong></span>`;
        setGameTimeout(() => { 
            isProcessingTyping = false; 
            document.getElementById('btn-typing-submit').disabled = false;
        }, 1000);
    }
}

let currentSpeaking = null;
function calcSim(s1, s2) {
    s1 = s1.replace(/\s+/g,'').toLowerCase(); s2 = s2.replace(/\s+/g,'').toLowerCase();
    if(s1===s2) return 100;
    const len = Math.max(s1.length, s2.length);
    if(len===0) return 100;
    let m = [];
    for(let i=0; i<=s1.length; i++) m[i] = [i];
    for(let j=0; j<=s2.length; j++) m[0][j] = j;
    for(let i=1; i<=s1.length; i++){
        for(let j=1; j<=s2.length; j++){
            if(s1[i-1]===s2[j-1]) m[i][j] = m[i-1][j-1];
            else m[i][j] = Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
        }
    }
    return Math.round(Math.max(0, (1 - m[s1.length][s2.length]/len)*100));
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec(); recognition.lang = 'ko-KR'; recognition.interimResults = false;
    recognition.onstart = () => {
        document.getElementById('btn-mic').classList.add('recording');
        document.getElementById('btn-mic').disabled = true;
        document.getElementById('mic-status').innerText = 'Đang nghe...';
        document.getElementById('eval-box').style.display = 'none';
    };
    recognition.onresult = (e) => {
        const res = e.results[0][0].transcript.trim();
        const sim = calcSim(currentSpeaking.front, res);
        document.getElementById('eval-box').style.display = 'block';
        document.getElementById('eval-score').innerText = `${sim}%`;
        document.getElementById('eval-transcript').innerText = `Máy nghe: "${res}"`;
        if(sim>=85){ playSFX('correct'); document.getElementById('eval-rating').innerHTML = '<span style="color:var(--success-color);">Xuất sắc!</span>'; }
        else if(sim>=50){ playSFX('correct'); document.getElementById('eval-rating').innerHTML = '<span style="color:var(--warning-color);">Khá tốt!</span>'; }
        else{ playSFX('wrong'); document.getElementById('eval-rating').innerHTML = '<span style="color:var(--danger-color);">Cần luyện lại</span>'; }
    };
    recognition.onend = () => {
        document.getElementById('btn-mic').classList.remove('recording');
        document.getElementById('btn-mic').disabled = false;
        document.getElementById('mic-status').innerText = 'Nhấn mic để đọc';
    };
}

function startSpeakingGame() {
    document.getElementById('speak-fb').innerText = ''; document.getElementById('eval-box').style.display = 'none';
    currentSpeaking = masterDeck[Math.floor(Math.random() * masterDeck.length)];
    document.getElementById('speak-target').innerText = currentSpeaking.front;
    document.getElementById('speak-vi').innerText = currentSpeaking.back;
}

// AI Chat
const scenariosPrompt = {
    free: { prompt: "Giáo viên tiếng Hàn. Trò chuyện 1-2 câu.", greeting: "안녕하세요! 무슨 이야기하고 싶어요?", vi: "Xin chào! Bạn muốn nói chuyện gì?", sug: ["오늘 날씨 어때요?", "한국어 공부하고 있어요", "취미가 무엇이에요?"] },
    food: { prompt: "Phục vụ nhà hàng Hàn Quốc. Khách gọi món.", greeting: "어서 오세요! 몇 분이세요?", vi: "Chào quý khách! Đi mấy người ạ?", sug: ["비빔밥 하나 주세요", "메뉴판 좀 주세요", "이거 얼마예요?"] },
    taxi: { prompt: "Tài xế taxi ở Seoul.", greeting: "안녕하세요! 어디로 모실까요?", vi: "Xin chào! Tôi đưa bạn đi đâu?", sug: ["명동으로 가주세요", "얼마나 걸려요?", "여기서 세워주세요"] },
    hotel: { prompt: "Lễ tân khách sạn.", greeting: "한국 호텔입니다. 예약하셨나요?", vi: "Khách sạn Hàn Quốc. Bạn đã đặt phòng chưa?", sug: ["예약했어요", "체크인 하고 싶어요", "방 있어요?"] }
};
let currentScenario = 'free', chatHistory = [];

function setScenario(k) {
    currentScenario = k;
    document.querySelectorAll('.scen-chip').forEach(c => c.classList.toggle('active', c.dataset.scen === k));
    initAiChat();
}

function initAiChat() {
    document.getElementById('chat-box').innerHTML = ''; 
    chatHistory = []; 
    const s = scenariosPrompt[currentScenario];
    appendMessage('ai', s.greeting, s.vi); 
    renderSuggestions(s.sug);
}

function renderSuggestions(arr) {
    const c = document.getElementById('chat-sug'); c.innerHTML = '';
    (arr||[]).forEach(t => {
        const d = document.createElement('div'); d.className = 'sug-chip'; d.innerText = t;
        d.onclick = () => { document.getElementById('chat-input').value = t; sendChatMessage(); };
        c.appendChild(d);
    });
}

function appendMessage(sender, kr, vi, corr) {
    chatHistory.push({ sender, kr, vi, corr });

    const b = document.getElementById('chat-box'), d = document.createElement('div');
    d.className = `chat-msg ${sender}`;
    let h = `<div class="msg-kr">${kr} <button class="btn-msg-audio" onclick="speakText('${kr.replace(/'/g,"\\'")}')"><i class="fas fa-volume-up"></i></button></div>`;
    if(vi) h += `<div class="msg-vi">${vi}</div>`;
    if(corr) h += `<div class="msg-correction"><i class="fas fa-magic"></i> ${corr}</div>`;
    if(sender==='system') h = kr;
    d.innerHTML = h; b.appendChild(d); b.scrollTop = b.scrollHeight;

    if(sender==='ai' && currentMode === 'aichat') speakText(kr);
}

async function sendChatMessage() {
    if(isChatting) return;
    const inp = document.getElementById('chat-input'), msg = inp.value.trim();
    if(!msg) return;

    isChatting = true;
    const btn = document.getElementById('btn-chat-send');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    inp.value = ''; 
    appendMessage('user', msg); 
    document.getElementById('chat-sug').innerHTML = '';

    const key = localStorage.getItem('gemini_api_key');
    if(!key) {
        setTimeout(() => {
            appendMessage('system', 'Vui lòng nhập Gemini API Key (góc trên) để AI trả lời.');
            isChatting = false; btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }, 500);
        return;
    }

    try {
        const bodyObj = { contents: [{ parts: [{ text: `Kịch bản: ${scenariosPrompt[currentScenario].prompt}. Người dùng: "${msg}". Yêu cầu JSON: {"korean":"1-2 câu tiếng Hàn","vietnamese":"nghĩa","correction":"sửa lỗi nếu có, ko thì rỗng","suggestions":["3 câu gợi ý"]}` }]}] };
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(bodyObj) });
        const data = await res.json();
        
        const clean = data.candidates[0].content.parts[0].text.replace(/```json/g,'').replace(/```/g,'').trim();
        const obj = JSON.parse(clean);
        appendMessage('ai', obj.korean, obj.vietnamese, obj.correction);
        renderSuggestions(obj.suggestions);
    } catch(e) { 
        appendMessage('system', 'Lỗi kết nối AI hoặc định dạng trả về.'); 
    }
    
    isChatting = false;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
}

function toggleChatMic() {
    if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return alert('Không hỗ trợ mic!');
    if(!chatRec) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        chatRec = new SpeechRec(); chatRec.lang = 'ko-KR';
        chatRec.onstart = () => document.getElementById('btn-chat-mic').classList.add('recording');
        chatRec.onresult = (e) => { document.getElementById('chat-input').value = e.results[0][0].transcript; sendChatMessage(); };
        chatRec.onend = () => document.getElementById('btn-chat-mic').classList.remove('recording');
    }
    try { chatRec.start(); } catch(e) {}
}

function searchWord() {
    const v = document.getElementById('search-input').value.toLowerCase().trim();
    if(!v) return;
    const i = filteredDeck.findIndex(c => c.front.toLowerCase().includes(v) || c.back.toLowerCase().includes(v));
    if(i !== -1) { currentIndex = i; updateCard(); } else alert("Không tìm thấy!");
}

// Event Listeners Binding
document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    applyFilter();
    switchMode('dict');

    // Navigation & Category Events
    document.querySelectorAll('.mode-switcher button').forEach(b => b.addEventListener('click', (e) => switchMode(e.currentTarget.dataset.mode)));
    document.querySelectorAll('#category-bar .cat-chip').forEach(b => b.addEventListener('click', (e) => filterCategory(e.currentTarget.dataset.cat)));
    document.querySelectorAll('.game-selector button').forEach(b => b.addEventListener('click', (e) => switchSubGame(e.currentTarget.dataset.sub)));
    document.querySelectorAll('#ai-scenario-bar .scen-chip').forEach(b => b.addEventListener('click', (e) => setScenario(e.currentTarget.dataset.scen)));

    // Top buttons
    document.getElementById('btn-toggle-theme').addEventListener('click', toggleDarkMode);
    document.getElementById('btn-open-add').addEventListener('click', openAddModal);
    document.getElementById('btn-export-import').addEventListener('click', exportImportData);
    document.getElementById('import-file').addEventListener('change', handleFileImport);

    // Modal
    document.getElementById('btn-close-modal').addEventListener('click', closeAddModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeAddModal);
    document.getElementById('btn-save-modal').addEventListener('click', saveCustomWord);

    // Dict
    document.getElementById('btn-dict-search').addEventListener('click', lookupDictionary);
    document.getElementById('dict-input').addEventListener('keyup', (e) => { if(e.key === 'Enter') lookupDictionary(); });
    document.getElementById('btn-dict-speak').addEventListener('click', () => speakText(document.getElementById('res-kr').innerText));
    document.getElementById('btn-dict-add').addEventListener('click', addDictResultToDeck);

    // Flashcard
    document.getElementById('flashcard').addEventListener('click', flipCard);
    document.getElementById('btn-card-audio').addEventListener('click', (e) => { e.stopPropagation(); speakText(filteredDeck[currentIndex].front); });
    document.getElementById('btn-prev-card').addEventListener('click', prevCard);
    document.getElementById('btn-flip-card').addEventListener('click', flipCard);
    document.getElementById('btn-next-card').addEventListener('click', nextCard);
    document.getElementById('btn-fav').addEventListener('click', () => toggleStatus('fav'));
    document.getElementById('btn-hard').addEventListener('click', () => toggleStatus('hard'));
    document.getElementById('btn-delete-word').addEventListener('click', deleteCurrentWord);
    document.getElementById('btn-search-word').addEventListener('click', searchWord);
    document.getElementById('search-input').addEventListener('keyup', (e) => { if(e.key === 'Enter') searchWord(); });

    // Games
    document.getElementById('btn-refresh-match').addEventListener('click', startMatchGame);
    document.getElementById('btn-typing-listen').addEventListener('click', () => speakText(currentTyping ? currentTyping.front : ''));
    document.getElementById('btn-typing-submit').addEventListener('click', checkTyping);
    document.getElementById('typing-input').addEventListener('keyup', (e) => { if(e.key === 'Enter') checkTyping(); });
    document.getElementById('btn-next-speak').addEventListener('click', startSpeakingGame);
    document.getElementById('btn-speak-sample').addEventListener('click', () => speakText(currentSpeaking ? currentSpeaking.front : ''));
    document.getElementById('btn-mic').addEventListener('click', () => { if(recognition) try { recognition.start(); } catch(e){} else alert('Không hỗ trợ mic!'); });

    // AI Chat
    document.getElementById('btn-save-key').addEventListener('click', saveApiKey);
    document.getElementById('btn-chat-send').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keyup', (e) => { if(e.key === 'Enter') sendChatMessage(); });
    document.getElementById('btn-chat-mic').addEventListener('click', toggleChatMic);
});
