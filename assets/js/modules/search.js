class SearchManager {
  constructor() {
    this.flashcardManager = null;
    document.addEventListener('flashcardReady', (e) => {
      this.flashcardManager = e.detail;
    });
    this.init();
  }

  init() {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');
    if (btn) btn.addEventListener('click', () => this.search());
    if (input) input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.search();
    });
  }

  search() {
    const query = document.getElementById('search-input')?.value.trim();
    if (!query) return;
    if (this.flashcardManager) {
      this.flashcardManager.searchAndJump(query);
    } else {
      // fallback alert
      alert('Flashcard chưa sẵn sàng.');
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new SearchManager());
