/**
 * GeminiChat — tính năng chat văn bản dùng Gemini REST API (generateContent).
 * Model do người dùng chọn: gemini-3.6-flash / gemini-3.5-flash / gemini-3.5-flash-lite.
 */
const GeminiChat = (() => {
  const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
  const HISTORY_STORAGE = 'gemini_chat_history';
  const MAX_HISTORY_TURNS = 20; // giới hạn để tránh request quá dài

  let history = []; // [{ role: 'user'|'model', text: '...' }]
  let isSending = false;

  // DOM
  let panel, messagesEl, inputEl, sendBtn, modelSelect, fabBtn, badgeEl, closeBtn, clearBtn;

  function init() {
    panel = document.getElementById('chat-panel');
    messagesEl = document.getElementById('chat-messages');
    inputEl = document.getElementById('chat-input');
    sendBtn = document.getElementById('btn-send-chat');
    modelSelect = document.getElementById('chat-model-select');
    fabBtn = document.getElementById('btn-open-chat');
    badgeEl = document.getElementById('chat-fab-badge');
    closeBtn = document.getElementById('btn-close-chat');
    clearBtn = document.getElementById('btn-clear-chat');

    modelSelect.value = AISettings.getChatModel();
    loadHistory();
    renderHistory();

    fabBtn.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', () => setPanelOpen(false));
    clearBtn.addEventListener('click', clearConversation);

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    inputEl.addEventListener('input', autoGrowInput);

    modelSelect.addEventListener('change', () => {
      AISettings.setChatModel(modelSelect.value);
    });

    window.addEventListener('ai-settings-changed', (e) => {
      if (e.detail && e.detail.model) modelSelect.value = e.detail.model;
    });
  }

  function autoGrowInput() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  }

  function togglePanel() {
    setPanelOpen(!panel.classList.contains('active'));
  }

  function setPanelOpen(open) {
    panel.classList.toggle('active', open);
    document.body.classList.toggle('chat-panel-open', open);
    if (open) {
      if (badgeEl) badgeEl.classList.remove('show');
      setTimeout(() => inputEl.focus(), 80);
      if (history.length === 0) renderEmptyState();
    }
  }

  // ================== Lịch sử hội thoại ==================
  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE);
      history = raw ? JSON.parse(raw) : [];
    } catch (e) {
      history = [];
    }
  }

  function saveHistory() {
    // Giới hạn số lượt lưu để localStorage không phình to
    const trimmed = history.slice(-MAX_HISTORY_TURNS * 2);
    localStorage.setItem(HISTORY_STORAGE, JSON.stringify(trimmed));
  }

  function clearConversation() {
    if (!confirm('Xoá toàn bộ cuộc trò chuyện với gia sư AI?')) return;
    history = [];
    localStorage.removeItem(HISTORY_STORAGE);
    messagesEl.innerHTML = '';
    renderEmptyState();
  }

  function renderHistory() {
    messagesEl.innerHTML = '';
    if (history.length === 0) {
      renderEmptyState();
      return;
    }
    history.forEach(turn => {
      appendMessage(turn.role === 'user' ? 'user' : 'assistant', turn.text, false);
    });
    scrollToBottom();
  }

  function renderEmptyState() {
    messagesEl.innerHTML = `
      <div class="chat-empty-state">
        <span class="chat-empty-icon">🤖</span>
        Chào bạn! Mình là gia sư AI tiếng Anh.<br>Hỏi mình về từ vựng, ngữ pháp, hoặc nhờ mình đặt câu ví dụ nhé.
        <div class="chat-suggestions">
          <button class="chat-suggestion-chip" data-q="Giải thích khác nhau giữa 'a lot of' và 'lots of'">a lot of vs lots of?</button>
          <button class="chat-suggestion-chip" data-q="Cho mình 3 câu ví dụ dùng từ 'however'">Ví dụ với "however"</button>
          <button class="chat-suggestion-chip" data-q="Từ nào đồng nghĩa với 'happy'?">Đồng nghĩa "happy"</button>
        </div>
      </div>
    `;
    messagesEl.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        inputEl.value = chip.dataset.q;
        handleSend();
      });
    });
  }

  // ================== Ngữ cảnh học tập ==================
  function buildStudyContext() {
    // Lấy bộ thẻ hiện đang active trong sidebar/select để AI trả lời sát hơn
    try {
      const deckSelect = document.getElementById('study-deck-select');
      const deckId = deckSelect ? deckSelect.value : '';
      if (!deckId) return '';
      const decks = Storage.loadDecksSync();
      const deck = decks.find(d => d.id === deckId);
      if (!deck || !deck.cards || deck.cards.length === 0) return '';
      const sampleWords = deck.cards.slice(0, 15).map(c => `${c.front} (${c.back})`).join(', ');
      return `\n\nNgười dùng đang học bộ thẻ "${deck.name}" gồm các từ: ${sampleWords}. Nếu câu hỏi liên quan, hãy ưu tiên dùng các từ này làm ví dụ.`;
    } catch (e) {
      return '';
    }
  }

  function buildSystemInstruction() {
    return {
      parts: [{
        text: 'Bạn là một gia sư tiếng Anh thân thiện, kiên nhẫn, dạy cho người Việt học tiếng Anh qua ứng dụng flashcard "English Flashcards". ' +
          'Luôn trả lời NGẮN GỌN, dễ hiểu, có ví dụ cụ thể khi phù hợp. ' +
          'Trả lời bằng tiếng Việt là chính, nhưng dùng tiếng Anh cho từ vựng/câu ví dụ khi cần thiết. ' +
          'Nếu người dùng hỏi về nghĩa từ, hãy cho luôn phát âm IPA (nếu biết), loại từ, và 1 câu ví dụ. ' +
          'Nếu người dùng muốn luyện tập, hãy đặt câu hỏi hoặc bài tập nhỏ để họ thực hành.' +
          buildStudyContext()
      }]
    };
  }

  // ================== Gửi tin nhắn ==================
  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text || isSending) return;

    if (!AISettings.hasApiKey()) {
      appendApiKeyMissingMessage();
      scrollToBottom();
      return;
    }

    inputEl.value = '';
    autoGrowInput();
    appendMessage('user', text, true);
    history.push({ role: 'user', text });
    saveHistory();

    setSending(true);
    const typingEl = appendTypingIndicator();

    try {
      const replyText = await sendToGemini(text);
      typingEl.remove();
      appendMessage('assistant', replyText, true);
      history.push({ role: 'model', text: replyText });
      saveHistory();
    } catch (err) {
      typingEl.remove();
      appendMessage('error', formatErrorMessage(err), true);
    } finally {
      setSending(false);
    }
  }

  function setSending(sending) {
    isSending = sending;
    sendBtn.disabled = sending;
  }

  async function sendToGemini(latestUserText) {
    const apiKey = AISettings.getApiKey();
    const model = modelSelect.value || AISettings.getChatModel();
    const url = `${API_BASE}/${model}:generateContent`;

    // Xây contents từ lịch sử (đã bao gồm tin nhắn user vừa gửi ở cuối
    // `history`). Chỉ lấy MAX_HISTORY_TURNS*2 lượt gần nhất — `history`
    // trong bộ nhớ tự nó không được cắt bớt trong suốt phiên (chỉ
    // saveHistory() cắt bản lưu localStorage), nên nếu không giới hạn
    // ở đây, request sẽ ngày càng phình to không giới hạn khi cuộc trò
    // chuyện kéo dài, trái với mục đích của MAX_HISTORY_TURNS.
    const recentHistory = history.slice(-MAX_HISTORY_TURNS * 2);
    const contents = recentHistory.map(turn => ({
      role: turn.role,
      parts: [{ text: turn.text }]
    }));

    const body = {
      systemInstruction: buildSystemInstruction(),
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      let errBody = null;
      try { errBody = await resp.json(); } catch (e) { /* ignore */ }
      const message = errBody?.error?.message || `HTTP ${resp.status}`;
      const err = new Error(message);
      err.status = resp.status;
      throw err;
    }

    const data = await resp.json();
    const candidate = data.candidates && data.candidates[0];
    const parts = candidate?.content?.parts || [];
    const textOut = parts.map(p => p.text || '').join('').trim();

    if (!textOut) {
      const finishReason = candidate?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('Câu trả lời bị chặn bởi bộ lọc an toàn của Gemini.');
      }
      throw new Error('Gemini không trả về nội dung. Vui lòng thử lại.');
    }
    return textOut;
  }

  function formatErrorMessage(err) {
    const status = err.status;
    if (status === 400) return '❌ Yêu cầu không hợp lệ (có thể do API key sai định dạng). Chi tiết: ' + err.message;
    if (status === 401 || status === 403) return '❌ API key không hợp lệ hoặc không có quyền truy cập. Kiểm tra lại key trong Cài đặt AI.';
    if (status === 404) return '❌ Không tìm thấy model. Model có thể chưa khả dụng với tài khoản của bạn.';
    if (status === 429) return '❌ Đã vượt giới hạn tốc độ (rate limit) của Gemini API. Vui lòng thử lại sau ít phút.';
    if (status >= 500) return '❌ Máy chủ Gemini đang gặp sự cố. Vui lòng thử lại sau.';
    return '❌ Lỗi: ' + (err.message || 'Không thể kết nối tới Gemini API.');
  }

  // ================== Render UI ==================
  function appendMessage(role, text, animate) {
    // role: 'user' | 'assistant' | 'error'
    const emptyState = messagesEl.querySelector('.chat-empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'error' ? 'error' : role);
    div.textContent = text;
    messagesEl.appendChild(div);
    if (animate) scrollToBottom();
    return div;
  }

  // Tin nhắn lỗi đặc biệt: "chưa nhập API key" — kèm nút bấm mở thẳng
  // modal Cài đặt, thay vì chỉ mô tả suông người dùng phải tự đi tìm nút.
  function appendApiKeyMissingMessage() {
    const emptyState = messagesEl.querySelector('.chat-empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    div.className = 'chat-msg error';

    const textEl = document.createElement('span');
    textEl.textContent = '⚠️ Bạn chưa nhập API key Gemini.';
    div.appendChild(textEl);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-error-action-btn';
    btn.textContent = '⚙️ Mở Cài đặt';
    btn.addEventListener('click', () => {
      setPanelOpen(false);
      UI.openSettingsPanel();
    });
    div.appendChild(btn);

    messagesEl.appendChild(div);
    return div;
  }

  function appendTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function notifyNewMessageBadge() {
    if (badgeEl && !panel.classList.contains('active')) {
      badgeEl.classList.add('show');
    }
  }

  return { init };
})();
