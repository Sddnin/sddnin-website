const UI = (() => {
  // DOM elements
  const sidebar = document.getElementById('sidebar');
  const deckList = document.getElementById('deck-list');
  const studyView = document.getElementById('study-view');
  const quizView = document.getElementById('quiz-view');
  const manageView = document.getElementById('manage-view');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeModalBtn = document.querySelector('.close-modal');

  // Buttons & selects
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnAddDeck = document.getElementById('btn-add-deck');
  const btnImport = document.getElementById('btn-import');
  const btnExport = document.getElementById('btn-export');

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

  // Manage elements
  const manageDeckSelect = document.getElementById('manage-deck-select');
  const btnAddCard = document.getElementById('btn-add-card');
  const btnEditDeckName = document.getElementById('btn-edit-deck-name');
  const btnDeleteDeck = document.getElementById('btn-delete-deck');
  const cardsContainer = document.getElementById('cards-container');

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
    attachManageEvents();
    showView('study');
  }

  function showView(viewName) {
    studyView.classList.remove('active');
    quizView.classList.remove('active');
    manageView.classList.remove('active');
    if (viewName === 'study') studyView.classList.add('active');
    else if (viewName === 'quiz') quizView.classList.add('active');
    else if (viewName === 'manage') manageView.classList.add('active');
  }

  function renderDeckList() {
    deckList.innerHTML = currentDecks.map(deck => `
      <li data-id="${deck.id}" class="deck-item ${deck.id === activeDeckId ? 'active' : ''}">
        <span>${deck.name}</span>
        <span class="deck-card-count">${deck.cards.length} thẻ</span>
      </li>
    `).join('');

    document.querySelectorAll('.deck-item').forEach(item => {
      item.addEventListener('click', () => {
        activeDeckId = item.dataset.id;
        renderDeckList();
        studyDeckSelect.value = activeDeckId;
        quizDeckSelect.value = activeDeckId;
        manageDeckSelect.value = activeDeckId;
        if (manageView.classList.contains('active')) {
          renderCardsForManage();
        }
      });
    });
  }

  function populateSelectors() {
    const options = currentDecks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('');
    studyDeckSelect.innerHTML = '<option value="">-- Chọn bộ thẻ --</option>' + options;
    quizDeckSelect.innerHTML = '<option value="">-- Chọn bộ thẻ --</option>' + options;
    manageDeckSelect.innerHTML = '<option value="">-- Chọn bộ thẻ --</option>' + options;
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
      if (!deckId) return alert('Vui lòng chọn bộ thẻ');
      const deck = currentDecks.find(d => d.id === deckId);
      if (!deck || deck.cards.length === 0) return alert('Bộ thẻ không có thẻ nào');

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
          alert('Bạn đã hoàn thành lượt học này!');
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
    cardImage.src = card.image || '';
    cardImage.style.display = card.image ? 'block' : 'none';
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
      if (!deckId) return alert('Chọn bộ thẻ');
      const deck = currentDecks.find(d => d.id === deckId);
      if (!deck || deck.cards.length < 2) return alert('Cần ít nhất 2 thẻ để làm quiz');
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
        alert(`Kết thúc Quiz! Điểm của bạn: ${progress.score}/${progress.total}`);
      }
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
  function attachManageEvents() {
    manageDeckSelect.addEventListener('change', () => {
      renderCardsForManage();
    });

    btnAddCard.addEventListener('click', () => {
      const deckId = manageDeckSelect.value;
      if (!deckId) return alert('Chọn bộ thẻ trước');
      openModal('card-form', { deckId });
    });

    btnEditDeckName.addEventListener('click', () => {
      const deckId = manageDeckSelect.value;
      if (!deckId) return alert('Chọn bộ thẻ');
      const deck = currentDecks.find(d => d.id === deckId);
      if (deck) {
        openModal('deck-form', { deckId, currentName: deck.name });
      }
    });

    btnDeleteDeck.addEventListener('click', () => {
      const deckId = manageDeckSelect.value;
      if (!deckId) return alert('Chọn bộ thẻ');
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
        const card = deck.cards.find(c => c.id === cardId);
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

  function renderCardsForManage() {
    const deckId = manageDeckSelect.value;
    if (!deckId) {
      cardsContainer.innerHTML = '<p>Chọn bộ thẻ để xem danh sách.</p>';
      return;
    }
    const deck = currentDecks.find(d => d.id === deckId);
    if (!deck) return;
    cardsContainer.innerHTML = deck.cards.map(card => `
      <div class="card-item">
        <div><strong>${card.front}</strong> → ${card.back}</div>
        ${card.example ? `<div><em>${card.example}</em></div>` : ''}
        ${card.image ? `<img src="${card.image}" style="max-width:100px;"/>` : ''}
        <div class="card-actions">
          <button class="btn-edit-card btn-secondary" data-card-id="${card.id}">✏️ Sửa</button>
          <button class="btn-delete-card btn-danger" data-card-id="${card.id}">🗑️ Xoá</button>
        </div>
      </div>
    `).join('');
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
        if (!name) return alert('Tên không được để trống');
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
        if (!front || !back) return alert('Cần nhập từ và nghĩa');
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
        if (Storage.importData(json)) {
          alert('Nhập thành công');
          closeModal();
          refreshData();
        } else {
          alert('Dữ liệu JSON không hợp lệ');
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

    // Nút chuyển view
    document.getElementById('nav-study').addEventListener('click', () => showView('study'));
    document.getElementById('nav-quiz').addEventListener('click', () => showView('quiz'));
    document.getElementById('nav-manage').addEventListener('click', () => showView('manage'));
  }

  async function refreshData() {
    currentDecks = Storage.loadDecksSync();
    renderDeckList();
    populateSelectors();
    if (manageView.classList.contains('active')) {
      renderCardsForManage();
    }
  }

  return { init };
})();
