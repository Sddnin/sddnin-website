/**
 * AISettings — quản lý API key Gemini và model được chọn.
 * Toàn bộ dữ liệu lưu trong localStorage của trình duyệt người dùng,
 * không gửi lên bất kỳ server nào ngoài Google (khi gọi API).
 */
const AISettings = (() => {
  const KEY_STORAGE = 'gemini_api_key';
  const MODEL_STORAGE = 'gemini_chat_model';
  const DEFAULT_MODEL = 'gemini-3.6-flash';
  const VALID_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
  const LIVE_MODEL = 'gemini-3.1-flash-live-preview';

  function getApiKey() {
    return (localStorage.getItem(KEY_STORAGE) || '').trim();
  }

  function setApiKey(key) {
    localStorage.setItem(KEY_STORAGE, (key || '').trim());
  }

  function hasApiKey() {
    return getApiKey().length > 0;
  }

  function getChatModel() {
    const m = localStorage.getItem(MODEL_STORAGE);
    return VALID_MODELS.includes(m) ? m : DEFAULT_MODEL;
  }

  function setChatModel(model) {
    if (VALID_MODELS.includes(model)) {
      localStorage.setItem(MODEL_STORAGE, model);
    }
  }

  function getLiveModel() {
    return LIVE_MODEL;
  }

  // ================== Modal UI ==================
  function openSettingsModal() {
    const formHTML = document.getElementById('ai-settings-template').innerHTML;
    const modalBody = document.getElementById('modal-body');
    const modal = document.getElementById('modal');
    modalBody.innerHTML = formHTML;

    const keyInput = document.getElementById('gemini-api-key-input');
    const toggleVisBtn = document.getElementById('btn-toggle-key-visibility');
    const saveBtn = document.getElementById('btn-save-ai-settings');
    const statusEl = document.getElementById('ai-settings-status');
    const choiceGrid = document.getElementById('chat-model-choice-grid');

    keyInput.value = getApiKey();

    const currentModel = getChatModel();
    choiceGrid.querySelectorAll('.model-choice').forEach(el => {
      const radio = el.querySelector('input[type="radio"]');
      const isSelected = el.dataset.value === currentModel;
      radio.checked = isSelected;
      el.classList.toggle('selected', isSelected);
    });

    choiceGrid.querySelectorAll('.model-choice').forEach(el => {
      el.addEventListener('click', () => {
        choiceGrid.querySelectorAll('.model-choice').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        el.querySelector('input[type="radio"]').checked = true;
      });
    });

    toggleVisBtn.addEventListener('click', () => {
      const isPassword = keyInput.type === 'password';
      keyInput.type = isPassword ? 'text' : 'password';
      toggleVisBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    saveBtn.addEventListener('click', () => {
      const key = keyInput.value.trim();
      const selectedRadio = choiceGrid.querySelector('input[type="radio"]:checked');
      const model = selectedRadio ? selectedRadio.value : DEFAULT_MODEL;

      setApiKey(key);
      setChatModel(model);

      // Đồng bộ dropdown model trong chat panel nếu đã render
      const chatModelSelect = document.getElementById('chat-model-select');
      if (chatModelSelect) chatModelSelect.value = model;

      statusEl.textContent = key
        ? '✅ Đã lưu cài đặt. Bạn có thể dùng Chat và Gọi thoại AI ngay bây giờ.'
        : '⚠️ Đã lưu, nhưng bạn chưa nhập API key nên chưa dùng được Chat/Gọi thoại.';
      statusEl.className = 'settings-status show ' + (key ? 'ok' : 'err');

      window.dispatchEvent(new CustomEvent('ai-settings-changed', { detail: { key, model } }));

      setTimeout(() => {
        modal.classList.remove('active');
      }, key ? 700 : 1400);
    });

    modal.classList.add('active');
  }

  return {
    getApiKey,
    setApiKey,
    hasApiKey,
    getChatModel,
    setChatModel,
    getLiveModel,
    openSettingsModal,
  };
})();
