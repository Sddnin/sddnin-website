const UI = (() => {
  // DOM elements
  const sidebar = document.getElementById('sidebar');
  const deckList = document.getElementById('deck-list');
  const studyView = document.getElementById('study-view');
  const quizView = document.getElementById('quiz-view');
  const grammarView = document.getElementById('grammar-view');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeModalBtn = document.querySelector('.close-modal');

  // Buttons & selects
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnAddDeck = document.getElementById('btn-add-deck');
  const btnImport = document.getElementById('btn-import');
  const btnExport = document.getElementById('btn-export');
  const btnOpenSettings = document.getElementById('btn-open-settings');

  // Study elements
  const studyDeckSelect = document.getElementById('study-deck-select');
  const btnDirectionEnVi = document.getElementById('btn-direction-en-vi');
  const btnDirectionViEn = document.getElementById('btn-direction-vi-en');
  const btnStartStudy = document.getElementById('btn-start-study');
  const studyArea = document.getElementById('study-area');
  const flashcard = document.getElementById('flashcard');
  const cardFrontText = document.getElementById('card-front-text');
  const cardBackText = document.getElementById('card-back-text');
  const cardExample = document.getElementById('card-example');
  const cardImage = document.getElementById('card-image');
  const ratingButtons = document.getElementById('rating-buttons');
  const studyProgressFill = document.getElementById('study-progress-fill');
  const studyProgressText = document.getElementById('study-progress-text');

  // Quiz elements
  const quizDeckSelect = document.getElementById('quiz-deck-select');
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const quizArea = document.getElementById('quiz-area');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const quizProgressText = document.getElementById('quiz-progress-text');
  const quizScore = document.getElementById('quiz-score');
  const btnSpeakQuizQuestion = document.getElementById('btn-speak-quiz-question');

  // Manage elements (sống bên trong #settings-template — được query lại
  // mỗi lần mở modal Cài đặt, vì trước đó chúng chưa tồn tại trong DOM)
  let manageDeckSelect, btnAddCard, btnEditDeckName, btnDeleteDeck, cardsContainer;

  // State
  let currentDecks = [];
  let activeDeckId = null;
  let studyDirection = 'en-vi';

  async function init() {
    currentDecks = await Storage.initialize();
    renderDeckList();
    populateSelectors();
    attachGlobalEvents();
    attachStudyEvents();
    attachQuizEvents();
    setActiveNav('study');
  }

  function showView(viewName) {
    studyView.classList.remove('active');
    quizView.classList.remove('active');
    grammarView.classList.remove('active');
    if (viewName === 'study') studyView.classList.add('active');
    else if (viewName === 'quiz') quizView.classList.add('active');
    else if (viewName === 'grammar') grammarView.classList.add('active');
  }

  function renderDeckList() {
    const now = Date.now();
    deckList.innerHTML = currentDecks.map(deck => {
      const dueCount = deck.cards.filter(c => c.nextReview <= now).length;
      return `
      <li data-id="${deck.id}" class="deck-item ${deck.id === activeDeckId ? 'active' : ''}">
        <span class="deck-name">${deck.name}</span>
        <span class="deck-badges">
          ${dueCount > 0 ? `<span class="deck-due-count">🔔 ${dueCount}</span>` : ''}
          <span class="deck-card-count">${deck.cards.length} thẻ</span>
        </span>
      </li>
    `;
    }).join('');

    document.querySelectorAll('.deck-item').forEach(item => {
      item.addEventListener('click', () => {
        activeDeckId = item.dataset.id;
        renderDeckList();
        studyDeckSelect.value = activeDeckId;
        quizDeckSelect.value = activeDeckId;
        if (manageDeckSelect) {
          manageDeckSelect.value = activeDeckId;
          renderCardsForManage();
        }
      });
    });
  }

  function populateSelectors() {
    const options = currentDecks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('');
    studyDeckSelect.innerHTML = '<option value="">-- Chọn bộ thẻ --</option>' + options;
    quizDeckSelect.innerHTML = '<option value="">-- Chọn bộ thẻ --</option>' + options;
    if (manageDeckSelect) {
      manageDeckSelect.innerHTML = '<option value="">-- Chọn bộ thẻ --</option>' + options;
    }
  }

  // ================== STUDY ==================
  function attachStudyEvents() {
    btnDirectionEnVi.addEventListener('click', () => {
      btnDirectionEnVi.classList.add('active');
      btnDirectionViEn.classList.remove('active');
      studyDirection = 'en-vi';
    });
    btnDirectionViEn.addEventListener('click', () => {
      btnDirectionViEn.classList.add('active');
      btnDirectionEnVi.classList.remove('active');
      studyDirection = 'vi-en';
    });

    btnStartStudy.addEventListener('click', () => {
      const deckId = studyDeckSelect.value;
      if (!deckId) return UI_Toast.show('Vui lòng chọn bộ thẻ', 'err');
      const deck = currentDecks.find(d => d.id === deckId);
      if (!deck || deck.cards.length === 0) return UI_Toast.show('Bộ thẻ không có thẻ nào', 'err');

      Study.startStudy(deck, studyDirection);
      studyArea.style.display = 'block';
      showCurrentStudyCard();
    });

    // Flip card
    flashcard.addEventListener('click', () => {
      flashcard.classList.toggle('flipped');
      ratingButtons.style.display = flashcard.classList.contains('flipped') ? 'flex' : 'none';
    });

    // Rating
    ratingButtons.addEventListener('click', (e) => {
      if (e.target.classList.contains('rating-btn')) {
        const rating = parseInt(e.target.dataset.rating);
        const card = Study.getCurrentCard();
        if (card) {
          Study.rateCard(card, rating);
        }
        flashcard.classList.remove('flipped');
        ratingButtons.style.display = 'none';
        const nextCard = Study.nextCard();
        if (nextCard) {
          showCurrentStudyCard();
        } else {
          studyArea.style.display = 'none';
          UI_Toast.show('Bạn đã hoàn thành lượt học này!', 'ok');
          // Cập nhật lại danh sách thẻ (vì dữ liệu đã thay đổi)
          refreshData();
        }
      }
    });

    // Speak buttons
    document.getElementById('btn-speak-front').addEventListener('click', (e) => {
      e.stopPropagation();
      const card = Study.getCurrentCard();
      if (card) {
        const text = studyDirection === 'en-vi' ? card.front : card.back;
        Speech.speak(text, studyDirection === 'en-vi' ? 'en-US' : 'vi-VN');
      }
    });
    document.getElementById('btn-speak-back').addEventListener('click', (e) => {
      e.stopPropagation();
      const card = Study.getCurrentCard();
      if (card) {
        const text = studyDirection === 'en-vi' ? card.back : card.front;
        Speech.speak(text, studyDirection === 'en-vi' ? 'vi-VN' : 'en-US');
      }
    });
  }

  function showCurrentStudyCard() {
    const card = Study.getCurrentCard();
    if (!card) return;
    const front = studyDirection === 'en-vi' ? card.front : card.back;
    const back = studyDirection === 'en-vi' ? card.back : card.front;
    cardFrontText.textContent = front;
    cardBackText.textContent = back;
    cardExample.textContent = card.example || '';
    if (card.image) {
      cardImage.src = card.image;
      cardImage.style.display = 'block';
    } else {
      cardImage.removeAttribute('src');
      cardImage.style.display = 'none';
    }
    updateStudyProgress();
  }

  function updateStudyProgress() {
    const progress = Study.getProgress();
    studyProgressText.textContent = `${progress.current}/${progress.total}`;
    const percent = progress.total ? (progress.current / progress.total) * 100 : 0;
    studyProgressFill.style.width = percent + '%';
  }

  // ================== QUIZ ==================
  function attachQuizEvents() {
    btnStartQuiz.addEventListener('click', () => {
      const deckId = quizDeckSelect.value;
      if (!deckId) return UI_Toast.show('Chọn bộ thẻ', 'err');
      const deck = currentDecks.find(d => d.id === deckId);
      if (!deck || deck.cards.length < 2) return UI_Toast.show('Cần ít nhất 2 thẻ để làm quiz', 'err');
      Quiz.startQuiz(deck, 10);
      quizArea.style.display = 'block';
      btnNextQuestion.style.display = 'none';
      showQuizQuestion();
    });

    quizOptions.addEventListener('click', (e) => {
      if (!e.target.classList.contains('quiz-option')) return;
      if (!quizArea.style.display || quizArea.style.display === 'none') return;

      const selected = e.target.textContent;
      const question = Quiz.getCurrentQuestion();
      if (!question) return;

      const correctAnswer = question.answer;
      const isCorrect = Quiz.checkAnswer(selected);

      // Highlight đáp án
      const allOptions = quizOptions.querySelectorAll('.quiz-option');
      allOptions.forEach(opt => {
        if (opt.textContent === correctAnswer) {
          opt.classList.add('correct');
        } else if (opt.textContent === selected && !isCorrect) {
          opt.classList.add('wrong');
        }
        opt.style.pointerEvents = 'none';
      });

      const progress = Quiz.getProgress();
      quizScore.textContent = `Điểm: ${progress.score}`;
      btnNextQuestion.style.display = 'inline-block';
      if (progress.current >= progress.total) {
        btnNextQuestion.textContent = 'Kết thúc Quiz';
      } else {
        btnNextQuestion.textContent = 'Câu tiếp theo';
      }
    });

    btnNextQuestion.addEventListener('click', () => {
      const next = Quiz.nextQuestion();
      if (next) {
        showQuizQuestion();
        btnNextQuestion.style.display = 'none';
      } else {
        quizArea.style.display = 'none';
        const progress = Quiz.getProgress();
        UI_Toast.show(`Kết thúc Quiz! Điểm của bạn: ${progress.score}/${progress.total}`, 'ok', 5000);
      }
    });

    btnSpeakQuizQuestion.addEventListener('click', (e) => {
      e.stopPropagation();
      const question = Quiz.getCurrentQuestion();
      if (!question) return;
      // askVi=true nghĩa là câu hỏi đang hiện là card.back (tiếng Việt);
      // askVi=false nghĩa là card.front (tiếng Anh) — xem quiz.js startQuiz().
      Speech.speak(question.question, question.askVi ? 'vi-VN' : 'en-US');
    });
  }

  function showQuizQuestion() {
    const q = Quiz.getCurrentQuestion();
    if (!q) return;
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = q.options.map(opt => `<div class="quiz-option">${opt}</div>`).join('');
    const progress = Quiz.getProgress();
    quizProgressText.textContent = `Câu ${progress.current}/${progress.total}`;
    quizScore.textContent = `Điểm: ${progress.score}`;
  }

  // ================== MANAGE ==================
  // Gọi lại mỗi lần mở modal Cài đặt, vì các phần tử bên dưới nằm trong
  // #settings-template và chỉ tồn tại trong DOM sau khi template được inject.
  function attachManageEvents() {
    manageDeckSelect = document.getElementById('manage-deck-select');
    btnAddCard = document.getElementById('btn-add-card');
    btnEditDeckName = document.getElementById('btn-edit-deck-name');
    btnDeleteDeck = document.getElementById('btn-delete-deck');
    cardsContainer = document.getElementById('cards-container');

    manageDeckSelect.value = activeDeckId || '';
    renderCardsForManage();

    manageDeckSelect.addEventListener('change', () => {
      renderCardsForManage();
    });

    btnAddCard.addEventListener('click', () => {
      const deckId = manageDeckSelect.value;
      if (!deckId) return UI_Toast.show('Chọn bộ thẻ trước', 'err');
      openModal('card-form', { deckId });
    });

    btnEditDeckName.addEventListener('click', () => {
      const deckId = manageDeckSelect.value;
      if (!deckId) return UI_Toast.show('Chọn bộ thẻ', 'err');
      const deck = currentDecks.find(d => d.id === deckId);
      if (deck) {
        openModal('deck-form', { deckId, currentName: deck.name });
      }
    });

    btnDeleteDeck.addEventListener('click', () => {
      const deckId = manageDeckSelect.value;
      if (!deckId) return UI_Toast.show('Chọn bộ thẻ', 'err');
      if (confirm('Bạn có chắc muốn xoá bộ thẻ này?')) {
        Storage.deleteDeck(deckId);
        refreshData();
      }
    });

    cardsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-edit-card')) {
        const cardId = e.target.dataset.cardId;
        const deckId = manageDeckSelect.value;
        const deck = currentDecks.find(d => d.id === deckId);
        const card = deck && deck.cards.find(c => c.id === cardId);
        if (card) {
          openModal('card-form', { deckId, cardId, front: card.front, back: card.back, example: card.example, image: card.image });
        }
      } else if (e.target.classList.contains('btn-delete-card')) {
        const cardId = e.target.dataset.cardId;
        const deckId = manageDeckSelect.value;
        if (confirm('Xoá thẻ này?')) {
          Storage.deleteCard(deckId, cardId);
          refreshData();
        }
      }
    });
  }

  // Phân loại trạng thái ôn tập của thẻ dựa trên level/reviewCount.
  // Phòng thủ: thẻ import từ JSON cũ/thiếu field có thể không có
  // reviewCount hoặc level — coi như 0 thay vì để undefined làm sai lệch.
  function getCardStatusLabel(card) {
    const reviewCount = card.reviewCount || 0;
    const level = card.level || 0;
    if (reviewCount === 0) return { text: 'Mới', cls: 'status-new' };
    if (level < 2) return { text: 'Đang học', cls: 'status-learning' };
    return { text: 'Đã thuộc', cls: 'status-mastered' };
  }

  function renderCardsForManage() {
    if (!cardsContainer) return;
    const deckId = manageDeckSelect.value;
    if (!deckId) {
      cardsContainer.innerHTML = '<p>Chọn bộ thẻ để xem danh sách.</p>';
      return;
    }
    const deck = currentDecks.find(d => d.id === deckId);
    if (!deck) return;
    cardsContainer.innerHTML = deck.cards.map(card => {
      const status = getCardStatusLabel(card);
      const reviewCount = card.reviewCount || 0;
      return `
      <div class="card-item">
        <div class="card-status-row">
          <span class="card-status-badge ${status.cls}">${status.text}</span>
          ${reviewCount > 0 ? `<span class="card-review-count">Đã ôn ${reviewCount} lần</span>` : ''}
        </div>
        <div><strong>${card.front}</strong> → ${card.back}</div>
        ${card.example ? `<div><em>${card.example}</em></div>` : ''}
        ${card.image ? `<img src="${card.image}" style="max-width:100px;"/>` : ''}
        <div class="card-actions">
          <button class="btn-edit-card btn-secondary" data-card-id="${card.id}">✏️ Sửa</button>
          <button class="btn-delete-card btn-danger" data-card-id="${card.id}">🗑️ Xoá</button>
        </div>
      </div>
    `;
    }).join('');
  }

  // ================== MODAL ==================
  function openModal(formType, data) {
    let formHTML = '';
    if (formType === 'deck-form') {
      formHTML = document.getElementById('deck-form-template').innerHTML;
      modalBody.innerHTML = formHTML;
      document.getElementById('deck-name-input').value = data.currentName || '';
      document.getElementById('btn-save-deck').onclick = () => {
        const name = document.getElementById('deck-name-input').value.trim();
        if (!name) return UI_Toast.show('Tên không được để trống', 'err');
        if (data.deckId) {
          Storage.updateDeckName(data.deckId, name);
        } else {
          Storage.addDeck(name);
        }
        closeModal();
        refreshData();
      };
    } else if (formType === 'card-form') {
      formHTML = document.getElementById('card-form-template').innerHTML;
      modalBody.innerHTML = formHTML;
      document.getElementById('card-front-input').value = data.front || '';
      document.getElementById('card-back-input').value = data.back || '';
      document.getElementById('card-example-input').value = data.example || '';
      document.getElementById('card-image-input').value = data.image || '';
      document.getElementById('btn-save-card').onclick = () => {
        const front = document.getElementById('card-front-input').value.trim();
        const back = document.getElementById('card-back-input').value.trim();
        if (!front || !back) return UI_Toast.show('Cần nhập từ và nghĩa', 'err');
        const cardData = {
          front, back,
          example: document.getElementById('card-example-input').value.trim(),
          image: document.getElementById('card-image-input').value.trim()
        };
        if (data.cardId) {
          Storage.updateCard(data.deckId, data.cardId, cardData);
        } else {
          Storage.addCardToDeck(data.deckId, cardData);
        }
        closeModal();
        refreshData();
      };
    } else if (formType === 'import') {
      formHTML = document.getElementById('import-template').innerHTML;
      modalBody.innerHTML = formHTML;
      document.getElementById('btn-do-import').onclick = () => {
        const json = document.getElementById('import-json').value;
        const result = Storage.importData(json);
        if (result.success) {
          const msg = result.skippedCount > 0
            ? `Nhập thành công (${result.deckCount} bộ thẻ, đã bỏ qua ${result.skippedCount} thẻ thiếu dữ liệu)`
            : `Nhập thành công (${result.deckCount} bộ thẻ)`;
          UI_Toast.show(msg, 'ok');
          closeModal();
          refreshData();
        } else {
          UI_Toast.show('Dữ liệu JSON không hợp lệ', 'err');
        }
      };
    }
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  // ================== GLOBAL ==================
  function attachGlobalEvents() {
    btnToggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });

    btnAddDeck.addEventListener('click', () => openModal('deck-form', {}));
    btnImport.addEventListener('click', () => openModal('import', {}));
    btnExport.addEventListener('click', () => {
      const data = Storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcard_backup.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    btnOpenSettings.addEventListener('click', () => openSettingsPanel());

    // Nút chuyển view
    document.getElementById('nav-study').addEventListener('click', () => setActiveNav('study'));
    document.getElementById('nav-quiz').addEventListener('click', () => setActiveNav('quiz'));
    document.getElementById('nav-grammar').addEventListener('click', () => setActiveNav('grammar'));
  }

  // Mở modal Cài đặt gộp (Quản lý thẻ + AI). Inject template 1 lần,
  // rồi wire cả 2 phần: quản lý thẻ ở đây, AI settings uỷ quyền cho AISettings.
  function openSettingsPanel() {
    const formHTML = document.getElementById('settings-template').innerHTML;
    modalBody.innerHTML = formHTML;
    attachManageEvents();
    AISettings.wireSettingsSection();
    modal.classList.add('active');
  }

  function setActiveNav(viewName) {
    showView(viewName);
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('nav-' + viewName).classList.add('active');
  }

  async function refreshData() {
    currentDecks = Storage.loadDecksSync();
    renderDeckList();
    populateSelectors();
    renderCardsForManage();
  }

  return { init, openSettingsPanel };
})();
