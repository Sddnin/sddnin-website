// review.js - nâng cấp
class ReviewManager {
  constructor() {
    this.vocabulary = [];
    this.currentTab = 'srs'; // mặc định tab SRS
    this.filteredWords = [];
    this.elements = {
      reviewContainer: document.getElementById('review-container'),
      totalWords: document.getElementById('total-words'),
      learnedWords: document.getElementById('learned-words'),
      difficultWords: document.getElementById('difficult-words'),
      tabBtns: document.querySelectorAll('.tab-btn')
    };
  }

  async init() {
    await this.loadVocabulary();
    this.setupEventListeners();
    this.filterByTab(this.currentTab);
    this.updateStats();
  }

  async loadVocabulary() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      this.vocabulary = await res.json();
    } catch(e) { /* fallback */ }
    const custom = StorageManager.getCustomVocab();
    this.vocabulary = [...this.vocabulary, ...custom];
  }

  setupEventListeners() {
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.filterByTab(this.currentTab);
      });
    });
  }

  filterByTab(tab) {
    const knownIds = StorageManager.getKnownWords();
    const difficultIds = StorageManager.getDifficultWords();
    const allIds = this.vocabulary.map(w => w.id);

    switch(tab) {
      case 'srs':
        const dueIds = SRS.getDueCards(allIds);
        this.filteredWords = this.vocabulary.filter(w => dueIds.includes(w.id));
        break;
      case 'difficult':
        this.filteredWords = this.vocabulary.filter(w => difficultIds.includes(w.id));
        break;
      case 'unlearned':
        this.filteredWords = this.vocabulary.filter(w => !knownIds.includes(w.id));
        break;
      case 'learned':
        this.filteredWords = this.vocabulary.filter(w => knownIds.includes(w.id));
        break;
      default: // all
        this.filteredWords = [...this.vocabulary];
    }
    this.renderWords();
  }

  renderWords() {
    // Giữ nguyên logic render cũ, nhưng thêm nút đánh giá chất lượng SRS (1-5)
    // ... (code tương tự review.js cũ, thêm data-quality)
    this.elements.reviewContainer.innerHTML = this.filteredWords.map((w, i) => `
      <div class="review-word-item" style="animation-delay:${i*0.05}s">
        <span><strong>${w.korean}</strong> - ${w.meaning}</span>
        <div>
          <button onclick="ReviewManager.rateWord(${w.id}, 1)">1</button>
          <button onclick="ReviewManager.rateWord(${w.id}, 3)">3</button>
          <button onclick="ReviewManager.rateWord(${w.id}, 5)">5</button>
        </div>
      </div>
    `).join('');
  }

  static rateWord(wordId, quality) {
    SRS.updateCard(wordId, quality);
    // Refresh lại giao diện
    document.dispatchEvent(new Event('reviewUpdated'));
  }

  updateStats() {
    // ... cập nhật số liệu
  }
}

// Khởi tạo
if (document.querySelector('.review-main')) {
  const rm = new ReviewManager();
  document.addEventListener('DOMContentLoaded', () => rm.init());
  window.ReviewManager = rm;
  document.addEventListener('reviewUpdated', () => rm.filterByTab(rm.currentTab));
}