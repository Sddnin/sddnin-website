class ReviewManager {
  constructor() {
    this.vocabulary = [];
    this.currentTab = 'srs';
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
    await this.loadWords();
    this.setupTabs();
    this.filterByTab(this.currentTab);
    this.updateStats();
    document.addEventListener('reviewUpdated', () => {
      this.filterByTab(this.currentTab);
      this.updateStats();
    });
  }

  async loadWords() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      this.vocabulary = await res.json();
    } catch(e) {}
    this.vocabulary = [...this.vocabulary, ...StorageManager.getCustomVocab()];
  }

  setupTabs() {
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
    const known = StorageManager.getKnownWords();
    const diff = StorageManager.getDifficultWords();
    switch(tab) {
      case 'srs':
        const due = SRS.getDueCards(this.vocabulary.map(w => w.id));
        this.filteredWords = this.vocabulary.filter(w => due.includes(w.id));
        break;
      case 'difficult':
        this.filteredWords = this.vocabulary.filter(w => diff.includes(w.id));
        break;
      case 'unlearned':
        this.filteredWords = this.vocabulary.filter(w => !known.includes(w.id));
        break;
      case 'learned':
        this.filteredWords = this.vocabulary.filter(w => known.includes(w.id));
        break;
      default:
        this.filteredWords = [...this.vocabulary];
    }
    this.render();
  }

  render() {
    if (!this.elements.reviewContainer) return;
    this.elements.reviewContainer.innerHTML = this.filteredWords.map((w, i) => `
      <div class="review-word-item animate-slide-up" style="animation-delay:${i*0.03}s">
        <div><strong>${w.korean}</strong> - ${w.meaning}</div>
        <div class="rating-buttons">
          <button onclick="ReviewManager.rate(${w.id}, 1)">1</button>
          <button onclick="ReviewManager.rate(${w.id}, 3)">3</button>
          <button onclick="ReviewManager.rate(${w.id}, 5)">5</button>
        </div>
      </div>
    `).join('');
  }

  static rate(id, quality) {
    SRS.updateCard(id, quality);
    document.dispatchEvent(new Event('reviewUpdated'));
  }

  updateStats() {
    if (this.elements.totalWords) this.elements.totalWords.textContent = this.vocabulary.length;
    if (this.elements.learnedWords) this.elements.learnedWords.textContent = StorageManager.getKnownWords().length;
    if (this.elements.difficultWords) this.elements.difficultWords.textContent = StorageManager.getDifficultWords().length;
  }
}

if (document.querySelector('.review-main')) {
  const rm = new ReviewManager();
  document.addEventListener('DOMContentLoaded', () => rm.init());
  window.ReviewManager = rm;
}
