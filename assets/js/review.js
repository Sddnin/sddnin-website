// === FILE: review.js ===
// Xử lý ôn tập, điểm nhớ, tiến độ

(function() {
    'use strict';

    class ReviewManager {
        constructor() {
            this.vocabulary = [];
            this.currentTab = 'difficult';
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
                const response = await fetch('../assets/data/vocabulary.json');
                this.vocabulary = await response.json();
            } catch (error) {
                console.error('Error loading vocabulary:', error);
                this.vocabulary = [
                    { "id": 1, "korean": "안녕하세요", "romanization": "annyeonghaseyo", "meaning": "Xin chào", "example": "안녕하세요, 반갑습니다.", "level": "TOPIK 1" },
                    { "id": 2, "korean": "감사합니다", "romanization": "gamsahamnida", "meaning": "Cảm ơn", "example": "도와주셔서 감사합니다.", "level": "TOPIK 1" },
                    { "id": 3, "korean": "사랑해요", "romanization": "saranghaeyo", "meaning": "Yêu", "example": "엄마, 사랑해요.", "level": "TOPIK 1" },
                    { "id": 4, "korean": "미안합니다", "romanization": "mianhamnida", "meaning": "Xin lỗi", "example": "늦어서 미안합니다.", "level": "TOPIK 1" },
                    { "id": 5, "korean": "반갑습니다", "romanization": "bangapseumnida", "meaning": "Rất vui được gặp", "example": "만나서 반갑습니다.", "level": "TOPIK 1" }
                ];
            }
        }

        setupEventListeners() {
            if (this.elements.tabBtns) {
                this.elements.tabBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.elements.tabBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.currentTab = btn.dataset.tab;
                        this.filterByTab(this.currentTab);
                    });
                });
            }
        }

        filterByTab(tab) {
            const knownWords = StorageManager.getKnownWords();
            const difficultWords = StorageManager.getDifficultWords();

            switch(tab) {
                case 'difficult':
                    this.filteredWords = this.vocabulary.filter(word => 
                        difficultWords.includes(word.id)
                    );
                    // Ưu tiên từ khó: sắp xếp theo độ khó (difficult words first)
                    this.filteredWords.sort((a, b) => {
                        const aDiff = difficultWords.includes(a.id) ? 1 : 0;
                        const bDiff = difficultWords.includes(b.id) ? 1 : 0;
                        return bDiff - aDiff;
                    });
                    break;
                case 'unlearned':
                    this.filteredWords = this.vocabulary.filter(word => 
                        !knownWords.includes(word.id)
                    );
                    break;
                case 'learned':
                    this.filteredWords = this.vocabulary.filter(word => 
                        knownWords.includes(word.id)
                    );
                    break;
                case 'all':
                default:
                    this.filteredWords = [...this.vocabulary];
                    // Sắp xếp: từ khó -> chưa học -> đã học
                    this.filteredWords.sort((a, b) => {
                        const aDiff = difficultWords.includes(a.id) ? 0 : (knownWords.includes(a.id) ? 2 : 1);
                        const bDiff = difficultWords.includes(b.id) ? 0 : (knownWords.includes(b.id) ? 2 : 1);
                        return aDiff - bDiff;
                    });
                    break;
            }
            
            this.renderWords();
        }

        renderWords() {
            if (!this.elements.reviewContainer) return;

            this.elements.reviewContainer.innerHTML = '';

            if (this.filteredWords.length === 0) {
                this.elements.reviewContainer.innerHTML = `
                    <div class="empty-state fade-in" style="text-align: center; padding: 40px;">
                        <p style="font-size: 3rem;">📭</p>
                        <p>Không có từ nào trong danh sách này.</p>
                    </div>
                `;
                return;
            }

            this.filteredWords.forEach((word, index) => {
                const wordItem = this.createWordItem(word, index);
                this.elements.reviewContainer.appendChild(wordItem);
            });
        }

        createWordItem(word, index) {
            const item = document.createElement('div');
            item.className = 'review-word-item slide-in-left';
            item.style.animationDelay = `${index * 0.05}s`;

            const isKnown = StorageManager.isKnown(word.id);
            const isDifficult = StorageManager.isDifficult(word.id);
            const isFav = StorageManager.isFavorite(word.id);

            item.innerHTML = `
                <div class="word-info">
                    <span class="word-korean">${word.korean}</span>
                    <span class="word-meaning"> - ${word.meaning}</span>
                    ${isDifficult ? '<span class="badge badge-difficult">Khó</span>' : ''}
                    ${isKnown ? '<span class="badge badge-known">Đã thuộc</span>' : ''}
                </div>
                <div class="word-actions">
                    <button class="fav-btn" data-id="${word.id}" title="Yêu thích">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                    <button class="known-toggle-btn" data-id="${word.id}" title="Đánh dấu đã thuộc">
                        ${isKnown ? '✅' : '☐'}
                    </button>
                    <button class="difficult-toggle-btn" data-id="${word.id}" title="Đánh dấu từ khó">
                        ${isDifficult ? '⚠️' : '⚡'}
                    </button>
                    <button class="pronounce-btn-small" data-word="${word.korean}" title="Phát âm">🔊</button>
                </div>
            `;

            // Event listeners cho các nút
            setTimeout(() => {
                const favBtn = item.querySelector('.fav-btn');
                const knownBtn = item.querySelector('.known-toggle-btn');
                const difficultBtn = item.querySelector('.difficult-toggle-btn');
                const pronounceBtn = item.querySelector('.pronounce-btn-small');

                if (favBtn) {
                    favBtn.addEventListener('click', () => {
                        StorageManager.toggleFavorite(word.id);
                        this.filterByTab(this.currentTab);
                        this.updateStats();
                    });
                }

                if (knownBtn) {
                    knownBtn.addEventListener('click', () => {
                        if (StorageManager.isKnown(word.id)) {
                            StorageManager.removeKnownWord(word.id);
                        } else {
                            StorageManager.addKnownWord(word.id);
                        }
                        this.filterByTab(this.currentTab);
                        this.updateStats();
                    });
                }

                if (difficultBtn) {
                    difficultBtn.addEventListener('click', () => {
                        if (StorageManager.isDifficult(word.id)) {
                            StorageManager.removeDifficultWord(word.id);
                        } else {
                            StorageManager.addDifficultWord(word.id);
                        }
                        this.filterByTab(this.currentTab);
                        this.updateStats();
                    });
                }

                if (pronounceBtn) {
                    pronounceBtn.addEventListener('click', () => {
                        this.pronounceWord(word.korean);
                    });
                }
            }, 0);

            return item;
        }

        pronounceWord(koreanWord) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(koreanWord);
                utterance.lang = 'ko-KR';
                utterance.rate = 0.8;
                window.speechSynthesis.speak(utterance);
            }
        }

        updateStats() {
            if (this.elements.totalWords) {
                this.elements.totalWords.textContent = this.vocabulary.length;
            }
            if (this.elements.learnedWords) {
                this.elements.learnedWords.textContent = StorageManager.getKnownWords().length;
            }
            if (this.elements.difficultWords) {
                this.elements.difficultWords.textContent = StorageManager.getDifficultWords().length;
            }
        }
    }

    // Khởi tạo khi trang review được load
    if (document.querySelector('.review-main')) {
        const reviewManager = new ReviewManager();
        document.addEventListener('DOMContentLoaded', () => reviewManager.init());
        window.ReviewManager = reviewManager;
    }
})();
