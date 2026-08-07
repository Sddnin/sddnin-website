class SearchManager {
  constructor() {
    this.flashcardManager = null;
    // ...
  }
  init() {
    // Lắng nghe event
    document.addEventListener('flashcardReady', (e) => {
      this.flashcardManager = e.detail;
    });
    this.setupListeners();
  }
  performSearch() {
    if (this.flashcardManager) {
      this.flashcardManager.searchAndJump(this.query);
    } else {
      // Fallback search modal
      this.searchInData(this.query);
    }
  }
}
// ...