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
  const swipeIndicatorLeft = document.getElementById('swipe-indicator-left');
  const swipeIndicatorRight = document.getElementById('swipe-indicator-right');
  const swipeHint = document.getElementById('swipe-hint');
  const studyProgressFill = document.getElementById('study-progress-fill');
  const studyProgressText = document.getElementById('study-progress-text');

  // Quiz elements (Trắc nghiệm — game gốc)
  const quizDeckSelect = document.getElementById('quiz-deck-select');
  const quizArea = document.getElementById('quiz-area');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const quizProgressText = document.getElementById('quiz-progress-text');
  const quizScore = document.getElementById('quiz-score');
  const btnSpeakQuizQuestion = document.getElementById('btn-speak-quiz-question');

  // Game picker
  const gamePicker = document.getElementById('game-picker');
  const btnBackToGames = document.getElementById('btn-back-to-games');
  const allGameAreas = [
    document.getElementById('quiz-area'),
    document.getElementById('listen-area'),
    document.getElementById('speedtype-area'),
    document.getElementById('match-area'),
    document.getElementById('fillblank-area'),
  ];

  // Listen game (Nghe đoán từ)
  const listenArea = document.getElementById('listen-area');
  const listenProgressText = document.getElementById('listen-progress-text');
  const listenScore = document.getElementById('listen-score');
  const btnListenReplay = document.getElementById('btn-listen-replay');
  const listenInput = document.getElementById('listen-input');
  const btnListenSubmit = document.getElementById('btn-listen-submit');
  const listenFeedback = document.getElementById('listen-feedback');
  const btnListenNext = document.getElementById('btn-listen-next');

  // SpeedType game (Nối từ tốc độ)
  const speedtypeArea = document.getElementById('speedtype-area');
  const speedtypeProgressText = document.getElementById('speedtype-progress-text');
  const speedtypeScore = document.getElementById('speedtype-score');
  const speedtypeTimerFill = document.getElementById('speedtype-timer-fill');
  const speedtypeQuestion = document.getElementById('speedtype-question');
  const speedtypeInput = document.getElementById('speedtype-input');
  const btnSpeedtypeSubmit = document.getElementById('btn-speedtype-submit');
  const speedtypeFeedback = document.getElementById('speedtype-feedback');

  // Match game (Ghép thẻ)
  const matchArea = document.getElementById('match-area');
  const matchProgressText = document.getElementById('match-progress-text');
  const matchMoves = document.getElementById('match-moves');
  const matchGrid = document.getElementById('match-grid');

  // FillBlank game (Điền từ)
  const fillblankArea = document.getElementById('fillblank-area');
  const fillblankProgressText = document.getElementById('fillblank-progress-text');
  const fillblankScore = document.getElementById('fillblank-score');
  const fillblankSentence = document.getElementById('fillblank-sentence');
  const fillblankInput = document.getElementById('fillblank-input');
  const btnFillblankSubmit = document.getElementById('btn-fillblank-submit');
  const fillblankFeedback = document.getElementById('fillblank-feedback');
  const btnFillblankNext = document.getElementById('btn-fillblank-next');

  // Manage elements (sống bên trong #settings-template — được query lại
  // mỗi lần mở modal Cài đặt, vì trước đó chúng chưa tồn tại trong DOM)
  let manageDeckSelect, btnAddCard, btnEditDeckName, btnDeleteDeck, cardsContainer;

  // State
  let currentDecks = [];
  let activeDeckId = null;
  let studyDirection = 'en-vi';
  let activeSpeedtypeTimerId = null; // theo dõi ở cấp module để showView() dừng được khi rời view giữa chừng

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
    // Nếu đang rời khỏi view Quiz mà SpeedType timer còn chạy (người
    // dùng chuyển view giữa chừng, không bấm "Chọn trò chơi khác"),
    // dừng timer lại — tránh nó tiếp tục chạy ngầm và đụng vào DOM
    // của 1 view không còn hiển thị.
    if (viewName !== 'quiz' && activeSpeedtypeTimerId) {
      clearInterval(activeSpeedtypeTimerId);
      activeSpeedtypeTimerId = null;
    }
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
      // Đảm bảo trạng thái sạch: nếu phiên học trước bị rời đi khi thẻ
      // đang lật (chưa kịp swipe), thẻ mới không nên kế thừa trạng thái đó.
      flashcard.classList.remove('flipped');
      resetCardTransform(false);
      swipeHint.style.display = 'none';
      showCurrentStudyCard();
    });

    // ================== Flip + Swipe ==================
    // Thiết kế: tap (không kéo, hoặc kéo rất ít) khi CHƯA lật -> lật thẻ.
    // Khi ĐÃ lật, kéo ngang (chuột hoặc chạm) đủ xa -> chấm điểm theo
    // hướng kéo (trái = chưa nhớ/Again, phải = nhớ/Good) thay cho 4 nút
    // Again/Hard/Good/Easy cũ. Dùng Pointer Events để 1 bộ code xử lý
    // được cả chuột lẫn cảm ứng, không cần viết riêng touch/mouse.
    const SWIPE_THRESHOLD = 100; // px kéo tối thiểu để tính là "đã chọn"
    const TAP_MOVEMENT_LIMIT = 8; // px — dưới ngưỡng này coi là tap, không phải kéo
    let dragStartX = 0;
    let dragStartY = 0;
    let dragCurrentX = 0;
    let isDragging = false;
    let pointerActive = false;

    function resetCardTransform(animate) {
      flashcard.style.transition = animate ? 'transform 0.3s ease' : 'none';
      flashcard.style.transform = '';
      swipeIndicatorLeft.style.opacity = '0';
      swipeIndicatorRight.style.opacity = '0';
    }

    function updateDragVisual(deltaX) {
      const rotation = Math.max(-15, Math.min(15, deltaX / 12));
      flashcard.style.transition = 'none';
      flashcard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      const dragRatio = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);
      if (deltaX < 0) {
        swipeIndicatorLeft.style.opacity = String(dragRatio);
        swipeIndicatorRight.style.opacity = '0';
      } else if (deltaX > 0) {
        swipeIndicatorRight.style.opacity = String(dragRatio);
        swipeIndicatorLeft.style.opacity = '0';
      } else {
        swipeIndicatorLeft.style.opacity = '0';
        swipeIndicatorRight.style.opacity = '0';
      }
    }

    // Bay thẻ ra khỏi màn hình theo hướng đã chọn, rồi chấm điểm và
    // chuyển sang thẻ tiếp theo — dùng chung cho cả swipe thật lẫn
    // (sau này có thể) nút bấm thay thế nếu cần.
    function commitSwipe(direction) {
      const rating = direction === 'right' ? 3 : 1; // phải=Good(3), trái=Again(1)
      const card = Study.getCurrentCard();
      if (card) {
        Study.rateCard(card, rating);
      }

      const flyDistance = direction === 'right' ? window.innerWidth : -window.innerWidth;
      flashcard.style.transition = 'transform 0.35s ease-in';
      flashcard.style.transform = `translateX(${flyDistance}px) rotate(${direction === 'right' ? 25 : -25}deg)`;
      if (direction === 'right') {
        swipeIndicatorRight.style.opacity = '1';
      } else {
        swipeIndicatorLeft.style.opacity = '1';
      }

      setTimeout(() => {
        flashcard.classList.remove('flipped');
        swipeHint.style.display = 'none';
        resetCardTransform(false);
        const nextCard = Study.nextCard();
        if (nextCard) {
          showCurrentStudyCard();
        } else {
          studyArea.style.display = 'none';
          UI_Toast.show('Bạn đã hoàn thành lượt học này!', 'ok');
          refreshData();
        }
      }, 350);
    }

    flashcard.addEventListener('pointerdown', (e) => {
      // Bấm vào nút phát âm không nên bắt đầu 1 cú kéo thẻ.
      if (e.target.closest('.speak-btn')) return;
      pointerActive = true;
      isDragging = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragCurrentX = e.clientX;
      flashcard.setPointerCapture(e.pointerId);
    });

    flashcard.addEventListener('pointermove', (e) => {
      if (!pointerActive) return;
      dragCurrentX = e.clientX;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      if (!isDragging && Math.abs(deltaX) > TAP_MOVEMENT_LIMIT && Math.abs(deltaX) > Math.abs(deltaY)) {
        isDragging = true;
      }
      // Chỉ cho kéo trực quan khi thẻ ĐÃ lật — trước khi lật, kéo không
      // có tác dụng chấm điểm nên không cần hiệu ứng kéo.
      if (isDragging && flashcard.classList.contains('flipped')) {
        updateDragVisual(deltaX);
      }
    });

    function endDrag(e) {
      if (!pointerActive) return;
      pointerActive = false;
      const deltaX = dragCurrentX - dragStartX;
      const wasFlipped = flashcard.classList.contains('flipped');

      if (isDragging && wasFlipped && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        commitSwipe(deltaX > 0 ? 'right' : 'left');
      } else if (isDragging && wasFlipped) {
        // Kéo chưa đủ ngưỡng -> đàn hồi thẻ về vị trí gốc.
        resetCardTransform(true);
      } else if (!isDragging) {
        // Tap thuần (không kéo đáng kể) -> lật/mở thẻ như hành vi cũ.
        const flipping = !flashcard.classList.contains('flipped');
        flashcard.classList.toggle('flipped');
        swipeHint.style.display = flipping ? 'block' : 'none';
      }
      isDragging = false;
    }

    flashcard.addEventListener('pointerup', endDrag);
    flashcard.addEventListener('pointercancel', endDrag);

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

  // ================== QUIZ / GAMES ==================
  function hideAllGameAreas() {
    allGameAreas.forEach(area => { area.style.display = 'none'; });
  }

  function showGamePicker() {
    hideAllGameAreas();
    gamePicker.style.display = 'grid';
    btnBackToGames.style.display = 'none';
  }

  function showGameArea(area) {
    gamePicker.style.display = 'none';
    btnBackToGames.style.display = 'block';
    hideAllGameAreas();
    area.style.display = 'block';
  }

  function attachQuizEvents() {
    btnBackToGames.addEventListener('click', () => {
      speedtypeStopTimer(); // an toàn: dừng timer nếu đang rời SpeedType giữa chừng
      showGamePicker();
    });

    gamePicker.addEventListener('click', (e) => {
      const card = e.target.closest('.game-card');
      if (!card) return;
      const deckId = quizDeckSelect.value;
      if (!deckId) return UI_Toast.show('Chọn bộ thẻ trước', 'err');
      const deck = currentDecks.find(d => d.id === deckId);
      if (!deck) return UI_Toast.show('Bộ thẻ không hợp lệ', 'err');

      const game = card.dataset.game;
      if (game === 'mc') startMcGame(deck);
      else if (game === 'listen') startListenGame(deck);
      else if (game === 'speedtype') startSpeedtypeGame(deck);
      else if (game === 'match') startMatchGame(deck);
      else if (game === 'fillblank') startFillblankGame(deck);
    });

    // ---------- Trắc nghiệm (game gốc, logic không đổi) ----------
    function startMcGame(deck) {
      if (deck.cards.length < 2) return UI_Toast.show('Cần ít nhất 2 thẻ để làm quiz', 'err');
      Quiz.startQuiz(deck, 10);
      showGameArea(quizArea);
      btnNextQuestion.style.display = 'none';
      showQuizQuestion();
    }

    quizOptions.addEventListener('click', (e) => {
      if (!e.target.classList.contains('quiz-option')) return;
      if (quizArea.style.display === 'none') return;

      const selected = e.target.textContent;
      const question = Quiz.getCurrentQuestion();
      if (!question) return;

      const correctAnswer = question.answer;
      const isCorrect = Quiz.checkAnswer(selected);

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
        UI_Toast.show(`Kết thúc Quiz! Điểm của bạn: ${Quiz.getProgress().score}/${Quiz.getProgress().total}`, 'ok', 5000);
        showGamePicker();
      }
    });

    btnSpeakQuizQuestion.addEventListener('click', (e) => {
      e.stopPropagation();
      const question = Quiz.getCurrentQuestion();
      if (!question) return;
      Speech.speak(question.question, question.askVi ? 'vi-VN' : 'en-US');
    });

    // ---------- Nghe đoán từ ----------
    function startListenGame(deck) {
      if (deck.cards.length < 1) return UI_Toast.show('Bộ thẻ không có thẻ nào', 'err');
      ListenGame.startGame(deck, 10);
      showGameArea(listenArea);
      showListenQuestion();
    }

    function showListenQuestion() {
      const q = ListenGame.getCurrentQuestion();
      if (!q) return;
      listenInput.value = '';
      listenInput.disabled = false;
      listenFeedback.textContent = '';
      listenFeedback.className = 'listen-feedback';
      btnListenNext.style.display = 'none';
      btnListenSubmit.style.display = 'inline-block';
      const progress = ListenGame.getProgress();
      listenProgressText.textContent = `Câu ${progress.current}/${progress.total}`;
      listenScore.textContent = `Điểm: ${progress.score}`;
      Speech.speak(q.word, 'en-US');
      listenInput.focus();
    }

    btnListenReplay.addEventListener('click', () => {
      const q = ListenGame.getCurrentQuestion();
      if (q) Speech.speak(q.word, 'en-US');
    });

    function submitListenAnswer() {
      const q = ListenGame.getCurrentQuestion();
      if (!q) return;
      if (listenInput.disabled) return; // đã nộp câu này rồi, tránh nộp trùng
      const isCorrect = ListenGame.checkAnswer(listenInput.value);
      listenInput.disabled = true;
      btnListenSubmit.style.display = 'none';
      btnListenNext.style.display = 'inline-block';
      listenFeedback.className = 'listen-feedback ' + (isCorrect ? 'correct' : 'wrong');
      listenFeedback.textContent = isCorrect ? '✓ Chính xác!' : `✗ Sai rồi — đáp án: ${q.word}`;
      const progress = ListenGame.getProgress();
      listenScore.textContent = `Điểm: ${progress.score}`;
    }

    btnListenSubmit.addEventListener('click', submitListenAnswer);
    listenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitListenAnswer();
    });

    btnListenNext.addEventListener('click', () => {
      const next = ListenGame.nextQuestion();
      if (next) {
        showListenQuestion();
      } else {
        const progress = ListenGame.getProgress();
        UI_Toast.show(`Hoàn thành! Điểm: ${progress.score}/${progress.total}`, 'ok', 5000);
        showGamePicker();
      }
    });

    // ---------- Nối từ tốc độ ----------
    const SPEEDTYPE_SECONDS = 8;
    let speedtypeRemainingMs = 0;
    let speedtypeAnswered = false;

    // Dùng duy nhất biến module activeSpeedtypeTimerId (không giữ thêm
    // biến cục bộ riêng) — để showView() luôn thấy đúng trạng thái timer
    // hiện tại mà không cần đồng bộ 2 biến song song.
    function speedtypeStopTimer() {
      if (activeSpeedtypeTimerId) {
        clearInterval(activeSpeedtypeTimerId);
        activeSpeedtypeTimerId = null;
      }
    }

    function startSpeedtypeGame(deck) {
      if (deck.cards.length < 1) return UI_Toast.show('Bộ thẻ không có thẻ nào', 'err');
      SpeedTypeGame.startGame(deck, 10);
      showGameArea(speedtypeArea);
      showSpeedtypeQuestion();
    }

    function showSpeedtypeQuestion() {
      const q = SpeedTypeGame.getCurrentQuestion();
      if (!q) return;
      speedtypeAnswered = false;
      speedtypeInput.value = '';
      speedtypeInput.disabled = false;
      speedtypeFeedback.textContent = '';
      speedtypeFeedback.className = 'listen-feedback';
      speedtypeQuestion.textContent = q.word;
      const progress = SpeedTypeGame.getProgress();
      speedtypeProgressText.textContent = `Câu ${progress.current}/${progress.total}`;
      speedtypeScore.textContent = `Điểm: ${progress.score}` + (progress.streak >= 2 ? ` 🔥x${progress.streak}` : '');
      speedtypeInput.focus();

      speedtypeStopTimer();
      speedtypeRemainingMs = SPEEDTYPE_SECONDS * 1000;
      speedtypeTimerFill.style.width = '100%';
      speedtypeTimerFill.classList.remove('urgent');
      const tickMs = 100;
      activeSpeedtypeTimerId = setInterval(() => {
        speedtypeRemainingMs -= tickMs;
        const percent = Math.max(0, (speedtypeRemainingMs / (SPEEDTYPE_SECONDS * 1000)) * 100);
        speedtypeTimerFill.style.width = percent + '%';
        if (percent < 25) speedtypeTimerFill.classList.add('urgent');
        if (speedtypeRemainingMs <= 0) {
          speedtypeStopTimer();
          handleSpeedtypeTimeout();
        }
      }, tickMs);
    }

    function handleSpeedtypeTimeout() {
      if (speedtypeAnswered) return;
      speedtypeAnswered = true;
      speedtypeInput.disabled = true;
      SpeedTypeGame.markTimeout();
      const q = SpeedTypeGame.getCurrentQuestion();
      speedtypeFeedback.className = 'listen-feedback wrong';
      speedtypeFeedback.textContent = `⏱️ Hết giờ! Đáp án: ${q ? q.answer : ''}`;
      setTimeout(advanceSpeedtype, 900);
    }

    function submitSpeedtypeAnswer() {
      if (speedtypeAnswered) return;
      speedtypeAnswered = true;
      speedtypeStopTimer();
      speedtypeInput.disabled = true;
      const q = SpeedTypeGame.getCurrentQuestion();
      const isCorrect = SpeedTypeGame.checkAnswer(speedtypeInput.value);
      speedtypeFeedback.className = 'listen-feedback ' + (isCorrect ? 'correct' : 'wrong');
      speedtypeFeedback.textContent = isCorrect ? '✓ Chính xác!' : `✗ Sai — đáp án: ${q.answer}`;
      const progress = SpeedTypeGame.getProgress();
      speedtypeScore.textContent = `Điểm: ${progress.score}` + (progress.streak >= 2 ? ` 🔥x${progress.streak}` : '');
      setTimeout(advanceSpeedtype, 700);
    }

    function advanceSpeedtype() {
      const next = SpeedTypeGame.nextQuestion();
      if (next) {
        showSpeedtypeQuestion();
      } else {
        speedtypeStopTimer();
        const progress = SpeedTypeGame.getProgress();
        UI_Toast.show(`Hoàn thành! Điểm: ${progress.score}/${progress.total} — chuỗi đúng dài nhất: ${progress.bestStreak}`, 'ok', 5000);
        showGamePicker();
      }
    }

    btnSpeedtypeSubmit.addEventListener('click', submitSpeedtypeAnswer);
    speedtypeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitSpeedtypeAnswer();
    });

    // ---------- Ghép thẻ ----------
    function startMatchGame(deck) {
      if (deck.cards.length < 2) return UI_Toast.show('Cần ít nhất 2 thẻ để ghép', 'err');
      MatchGame.startGame(deck);
      showGameArea(matchArea);
      renderMatchGrid();
    }

    function renderMatchGrid(wrongIndices) {
      const tiles = MatchGame.getTiles();
      const wrongSet = new Set(wrongIndices || []);
      matchGrid.innerHTML = tiles.map((tile, i) => {
        let stateCls = '';
        if (tile.state === 'matched') stateCls = 'matched';
        else if (wrongSet.has(i)) stateCls = 'flipped wrong-guess';
        else if (tile.state === 'flipped') stateCls = 'flipped';
        return `
        <div class="match-tile ${stateCls}" data-index="${i}">
          <div class="match-tile-inner">
            <div class="match-tile-front">❓</div>
            <div class="match-tile-back">${tile.text}</div>
          </div>
        </div>
      `;
      }).join('');
      const progress = MatchGame.getProgress();
      matchProgressText.textContent = `${progress.matchedPairs}/${progress.totalPairs} cặp`;
      matchMoves.textContent = `Lượt lật: ${progress.moves}`;
    }

    matchGrid.addEventListener('click', (e) => {
      const tileEl = e.target.closest('.match-tile');
      if (!tileEl) return;
      const index = parseInt(tileEl.dataset.index, 10);
      const result = MatchGame.flipTile(index);

      if (result.result === 'invalid') return;

      if (result.result === 'first-pick') {
        renderMatchGrid();
      } else if (result.result === 'no-match') {
        // Hiện đỏ 2 ô sai trong chốc lát trước khi úp lại — tín hiệu thị
        // giác rõ ràng hơn là chỉ im lặng úp xuống.
        renderMatchGrid([result.firstIndex, result.secondIndex]);
        setTimeout(() => {
          MatchGame.resolveNoMatch(result.firstIndex, result.secondIndex);
          renderMatchGrid();
        }, 800);
      } else if (result.result === 'match') {
        renderMatchGrid();
        if (MatchGame.isComplete()) {
          const progress = MatchGame.getProgress();
          setTimeout(() => {
            UI_Toast.show(`Hoàn thành! Ghép ${progress.totalPairs} cặp trong ${progress.moves} lượt lật.`, 'ok', 5000);
            showGamePicker();
          }, 500);
        }
      }
    });

    // ---------- Điền từ ----------
    function startFillblankGame(deck) {
      const usableCount = FillBlankGame.getUsableCount(deck);
      if (usableCount === 0) {
        return UI_Toast.show('Bộ thẻ này không có câu ví dụ phù hợp để chơi điền từ', 'err');
      }
      FillBlankGame.startGame(deck, 10);
      showGameArea(fillblankArea);
      showFillblankQuestion();
    }

    function showFillblankQuestion() {
      const q = FillBlankGame.getCurrentQuestion();
      if (!q) return;
      fillblankInput.value = '';
      fillblankInput.disabled = false;
      fillblankFeedback.textContent = '';
      fillblankFeedback.className = 'listen-feedback';
      btnFillblankNext.style.display = 'none';
      btnFillblankSubmit.style.display = 'inline-block';
      fillblankSentence.textContent = q.sentenceWithBlank;
      const progress = FillBlankGame.getProgress();
      fillblankProgressText.textContent = `Câu ${progress.current}/${progress.total}`;
      fillblankScore.textContent = `Điểm: ${progress.score}`;
      fillblankInput.focus();
    }

    function submitFillblankAnswer() {
      const q = FillBlankGame.getCurrentQuestion();
      if (!q) return;
      if (fillblankInput.disabled) return;
      const isCorrect = FillBlankGame.checkAnswer(fillblankInput.value);
      fillblankInput.disabled = true;
      btnFillblankSubmit.style.display = 'none';
      btnFillblankNext.style.display = 'inline-block';
      fillblankFeedback.className = 'listen-feedback ' + (isCorrect ? 'correct' : 'wrong');
      fillblankFeedback.textContent = isCorrect ? '✓ Chính xác!' : `✗ Sai rồi — đáp án: ${q.front}`;
      const progress = FillBlankGame.getProgress();
      fillblankScore.textContent = `Điểm: ${progress.score}`;
    }

    btnFillblankSubmit.addEventListener('click', submitFillblankAnswer);
    fillblankInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitFillblankAnswer();
    });

    btnFillblankNext.addEventListener('click', () => {
      const next = FillBlankGame.nextQuestion();
      if (next) {
        showFillblankQuestion();
      } else {
        const progress = FillBlankGame.getProgress();
        UI_Toast.show(`Hoàn thành! Điểm: ${progress.score}/${progress.total}`, 'ok', 5000);
        showGamePicker();
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
