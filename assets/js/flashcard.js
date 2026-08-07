class FlashcardManager {
  constructor() {
    this.vocabulary = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.topikFilter = 'all'; // 'all','1','2',...
    this.mode = 'learn'; // 'learn' or 'srs'
    this.srsDueIds = [];

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
    // Báo cho search.js biết là đã sẵn sàng
    document.dispatchEvent(new CustomEvent('flashcardReady', { detail: this }));
  }

  async loadVocabulary() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      this.vocabulary = await res.json();
    } catch(e) { /* fallback */ }
    // Thêm từ custom
    const custom = StorageManager.getCustomVocab();
    this.vocabulary = [...this.vocabulary, ...custom];
  }

  applyFilters() {
    let filtered = [...this.vocabulary];
    if (this.topikFilter !== 'all') {
      filtered = filtered.filter(w => w.level && w.level.includes(this.topikFilter));
    }
    if (this.mode === 'srs') {
      const ids = filtered.map(w => w.id);
      this.srsDueIds = SRS.getDueCards(ids);
      filtered = filtered.filter(w => this.srsDueIds.includes(w.id));
    }
    this.filteredVocab = filtered;
    if (this.filteredVocab.length === 0) {
      this.filteredVocab = [...this.vocabulary]; // fallback
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    if (this.elements.flashcard) this.elements.flashcard.classList.remove('flipped');
  }

  setupFilters() {
    const topikSelect = this.elements.topikSelect;
    if (topikSelect) {
      topikSelect.addEventListener('change', (e) => {
        this.topikFilter = e.target.value;
        this.applyFilters();
        this.updateCard();
        this.updateProgress();
      });
    }
    const modeToggle = this.elements.modeToggle;
    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        this.mode = this.mode === 'learn' ? 'srs' : 'learn';
        modeToggle.textContent = this.mode === 'srs' ? '📅 SRS' : '📚 Học';
        this.applyFilters();
        this.updateCard();
        this.updateProgress();
      });
    }
  }

  setupEventListeners() {
    // Flip, navigation, actions... (giữ nguyên code cũ)
    // Thêm voice flip
    const voiceBtn = this.elements.voiceFlipBtn;
    if (voiceBtn && 'webkitSpeechRecognition' in window) {
      voiceBtn.style.display = 'inline-block';
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;
      voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.textContent = '🎤 Đang nghe...';
      });
      recognition.onresult = (event) => {
        const said = event.results[0][0].transcript.trim();
        const currentWord = this.getCurrentWord();
        if (currentWord && said === currentWord.korean) {
          this.flipCard();
        }
        voiceBtn.textContent = '🎤 Voice Flip';
      };
      recognition.onerror = () => { voiceBtn.textContent = '🎤 Voice Flip'; };
      recognition.onend = () => { voiceBtn.textContent = '🎤 Voice Flip'; };
    } else if (voiceBtn) {
      voiceBtn.style.display = 'none';
    }
    // ... code các nút khác
  }

  // Các method getCurrentWord, flipCard, nextCard, ... tương tự, nhưng khi đánh dấu known/difficult thì gọi SRS.updateCard
  markAsKnown() {
    const word = this.getCurrentWord();
    if (!word) return;
    StorageManager.addKnown(word.id);
    SRS.updateCard(word.id, 4); // quality 4
    this.updateActionButtons(word.id);
  }

  markAsDifficult() {
    const word = this.getCurrentWord();
    if (!word) return;
    StorageManager.addDifficult(word.id);
    SRS.updateCard(word.id, 1);
    this.updateActionButtons(word.id);
  }

  // updateCard, updateProgress giữ nguyên
  // getCurrentWord() dùng this.filteredVocab[this.currentIndex]
}
// Khởi tạo
if (document.querySelector('.flashcard-main')) {
  const fcm = new FlashcardManager();
  document.addEventListener('DOMContentLoaded', () => fcm.init());
  window.FlashcardManager = fcm;
}
