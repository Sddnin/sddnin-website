class FlashcardManager {
  constructor() {
    this.vocabulary = [];
    this.filteredVocab = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.topikFilter = 'all';
    this.mode = 'learn'; // 'learn' or 'srs'

    // elements...
    this.elements = {
      flashcard: document.getElementById('flashcard'),
      frontText: document.getElementById('front-text'),
      backText: document.getElementById('back-text'),
      romanizationText: document.getElementById('romanization-text'),
      exampleText: document.getElementById('example-text'),
      cardCounter: document.getElementById('card-counter'),
      progressFill: document.getElementById('progress-fill'),
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      flipBtn: document.getElementById('flip-btn'),
      shuffleBtn: document.getElementById('shuffle-btn'),
      favoriteBtn: document.getElementById('favorite-btn'),
      knownBtn: document.getElementById('known-btn'),
      difficultBtn: document.getElementById('difficult-btn'),
      pronounceBtn: document.getElementById('pronounce-btn'),
      topikSelect: document.getElementById('topik-select'),
      modeToggle: document.getElementById('mode-toggle'),
      voiceFlipBtn: document.getElementById('voice-flip-btn')
    };
  }

  async init() {
    await this.loadVocabulary();
    this.setupFilters();
    this.applyFilters();
    this.setupEventListeners();
    this.updateCard();
    this.updateProgress();
    document.dispatchEvent(new CustomEvent('flashcardReady', { detail: this }));
  }

  async loadVocabulary() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      this.vocabulary = await res.json();
    } catch(e) {
      this.vocabulary = [];
    }
    this.vocabulary = [...this.vocabulary, ...StorageManager.getCustomVocab()];
  }

  setupFilters() {
    this.elements.topikSelect?.addEventListener('change', (e) => {
      this.topikFilter = e.target.value;
      this.applyFilters();
      this.updateCard();
      this.updateProgress();
    });
    this.elements.modeToggle?.addEventListener('click', () => {
      this.mode = this.mode === 'learn' ? 'srs' : 'learn';
      this.elements.modeToggle.textContent = this.mode === 'srs' ? '📅 SRS' : '📚 Học';
      this.applyFilters();
      this.updateCard();
      this.updateProgress();
    });
  }

  applyFilters() {
    let filtered = [...this.vocabulary];
    if (this.topikFilter !== 'all') {
      filtered = filtered.filter(w => w.level && w.level.includes(this.topikFilter));
    }
    if (this.mode === 'srs') {
      const dueIds = SRS.getDueCards(filtered.map(w => w.id));
      filtered = filtered.filter(w => dueIds.includes(w.id));
    }
    this.filteredVocab = filtered.length ? filtered : this.vocabulary;
    this.currentIndex = 0;
    this.isFlipped = false;
    if (this.elements.flashcard) this.elements.flashcard.classList.remove('flipped');
  }

  setupEventListeners() {
    // Flip card
    this.elements.flashcard?.addEventListener('click', () => this.flipCard());
    this.elements.flipBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.flipCard(); });

    this.elements.prevBtn?.addEventListener('click', () => this.navigate(-1));
    this.elements.nextBtn?.addEventListener('click', () => this.navigate(1));
    this.elements.shuffleBtn?.addEventListener('click', () => this.shuffle());

    this.elements.favoriteBtn?.addEventListener('click', () => this.toggleFavorite());
    this.elements.knownBtn?.addEventListener('click', () => this.markKnown());
    this.elements.difficultBtn?.addEventListener('click', () => this.markDifficult());

    this.elements.pronounceBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.pronounce();
    });

    // Voice flip
    if (this.elements.voiceFlipBtn && 'webkitSpeechRecognition' in window) {
      const recognition = initVoiceFlip((said) => {
        const current = this.getCurrentWord();
        if (current && said === current.korean) this.flipCard();
      });
      this.elements.voiceFlipBtn.addEventListener('click', () => {
        recognition.start();
        this.elements.voiceFlipBtn.textContent = '🎤 Đang nghe...';
      });
      recognition.onend = () => this.elements.voiceFlipBtn.textContent = '🎤 Voice Flip';
    } else if (this.elements.voiceFlipBtn) {
      this.elements.voiceFlipBtn.style.display = 'none';
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
      if (e.key === ' ') { e.preventDefault(); this.flipCard(); }
    });
  }

  getCurrentWord() {
    return this.filteredVocab[this.currentIndex];
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    this.elements.flashcard.classList.toggle('flipped', this.isFlipped);
  }

  navigate(dir) {
    const newIndex = this.currentIndex + dir;
    if (newIndex >= 0 && newIndex < this.filteredVocab.length) {
      this.currentIndex = newIndex;
      this.isFlipped = false;
      this.elements.flashcard.classList.remove('flipped');
      this.updateCard();
      this.updateProgress();
    }
  }

  shuffle() {
    this.filteredVocab = shuffleArray([...this.filteredVocab]);
    this.currentIndex = 0;
    this.updateCard();
  }

  updateCard() {
    const word = this.getCurrentWord();
    if (!word) return;
    this.elements.frontText.textContent = word.korean;
    this.elements.backText.textContent = word.meaning;
    this.elements.romanizationText.textContent = word.romanization;
    this.elements.exampleText.textContent = word.example || '';
    this.updateActionButtons(word.id);
  }

  updateActionButtons(id) {
    const fav = StorageManager.isFavorite(id);
    const known = StorageManager.isKnown(id);
    const diff = StorageManager.isDifficult(id);
    if (this.elements.favoriteBtn) {
      this.elements.favoriteBtn.textContent = fav ? '❤️ Đã thích' : '🤍 Yêu thích';
      this.elements.favoriteBtn.classList.toggle('active', fav);
    }
    if (this.elements.knownBtn) {
      this.elements.knownBtn.textContent = known ? '✅ Đã thuộc' : '☐ Đánh dấu thuộc';
      this.elements.knownBtn.classList.toggle('active', known);
    }
    if (this.elements.difficultBtn) {
      this.elements.difficultBtn.textContent = diff ? '⚠️ Đã khó' : '⚠️ Từ khó';
      this.elements.difficultBtn.classList.toggle('active', diff);
    }
  }

  toggleFavorite() {
    const word = this.getCurrentWord();
    if (word) StorageManager.toggleFavorite(word.id);
    this.updateActionButtons(word.id);
  }

  markKnown() {
    const word = this.getCurrentWord();
    if (!word) return;
    if (StorageManager.isKnown(word.id)) StorageManager.removeKnown(word.id);
    else {
      StorageManager.addKnown(word.id);
      SRS.updateCard(word.id, 4);
    }
    this.updateActionButtons(word.id);
  }

  markDifficult() {
    const word = this.getCurrentWord();
    if (!word) return;
    if (StorageManager.isDifficult(word.id)) StorageManager.removeDifficult(word.id);
    else {
      StorageManager.addDifficult(word.id);
      SRS.updateCard(word.id, 1);
    }
    this.updateActionButtons(word.id);
  }

  pronounce() {
    const word = this.getCurrentWord();
    if (word && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word.korean);
      u.lang = 'ko-KR';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }

  searchAndJump(query) {
    const idx = this.filteredVocab.findIndex(w => 
      w.korean.includes(query) || w.romanization?.toLowerCase().includes(query.toLowerCase()) || w.meaning?.toLowerCase().includes(query.toLowerCase())
    );
    if (idx !== -1) {
      this.currentIndex = idx;
      this.isFlipped = false;
      this.elements.flashcard.classList.remove('flipped');
      this.updateCard();
      this.updateProgress();
    } else alert('Không tìm thấy');
  }

  updateProgress() {
    const total = this.filteredVocab.length;
    const curr = this.currentIndex + 1;
    if (this.elements.cardCounter) this.elements.cardCounter.textContent = `${curr} / ${total}`;
    if (this.elements.progressFill) this.elements.progressFill.style.width = `${(curr/total)*100}%`;
    StorageManager.updateProgress(curr);
  }
}

// init
if (document.querySelector('.flashcard-main')) {
  const fm = new FlashcardManager();
  document.addEventListener('DOMContentLoaded', () => fm.init());
  window.FlashcardManager = fm;
}
