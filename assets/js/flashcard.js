// === FILE: flashcard.js ===
// Xử lý Flashcard: lật thẻ, next, previous, shuffle, favorite

(function() {
    'use strict';

    class FlashcardManager {
        constructor() {
            this.vocabulary = [];
            this.currentIndex = 0;
            this.isFlipped = false;
            this.isShuffled = false;
            
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
                pronounceBtn: document.getElementById('pronounce-btn')
            };
        }

        async init() {
            await this.loadVocabulary();
            this.setupEventListeners();
            this.updateCard();
            this.updateProgress();
        }

        async loadVocabulary() {
            try {
                const response = await fetch('../assets/data/vocabulary.json');
                this.vocabulary = await response.json();
            } catch (error) {
                console.error('Error loading vocabulary:', error);
                // Fallback data
                this.vocabulary = [
                    {
                        "id": 1,
                        "korean": "안녕하세요",
                        "romanization": "annyeonghaseyo",
                        "meaning": "Xin chào",
                        "example": "안녕하세요, 반갑습니다.",
                        "level": "TOPIK 1"
                    },
                    {
                        "id": 2,
                        "korean": "감사합니다",
                        "romanization": "gamsahamnida",
                        "meaning": "Cảm ơn",
                        "example": "도와주셔서 감사합니다.",
                        "level": "TOPIK 1"
                    },
                    {
                        "id": 3,
                        "korean": "사랑해요",
                        "romanization": "saranghaeyo",
                        "meaning": "Yêu",
                        "example": "엄마, 사랑해요.",
                        "level": "TOPIK 1"
                    }
                ];
            }
        }

        setupEventListeners() {
            // Flip card
            if (this.elements.flashcard) {
                this.elements.flashcard.addEventListener('click', () => this.flipCard());
            }
            if (this.elements.flipBtn) {
                this.elements.flipBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.flipCard();
                });
            }

            // Navigation
            if (this.elements.prevBtn) {
                this.elements.prevBtn.addEventListener('click', () => this.previousCard());
            }
            if (this.elements.nextBtn) {
                this.elements.nextBtn.addEventListener('click', () => this.nextCard());
            }
            if (this.elements.shuffleBtn) {
                this.elements.shuffleBtn.addEventListener('click', () => this.shuffleCards());
            }

            // Actions
            if (this.elements.favoriteBtn) {
                this.elements.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
            }
            if (this.elements.knownBtn) {
                this.elements.knownBtn.addEventListener('click', () => this.markAsKnown());
            }
            if (this.elements.difficultBtn) {
                this.elements.difficultBtn.addEventListener('click', () => this.markAsDifficult());
            }

            // Pronounce
            if (this.elements.pronounceBtn) {
                this.elements.pronounceBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.pronounceWord();
                });
            }

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.previousCard();
                if (e.key === 'ArrowRight') this.nextCard();
                if (e.key === ' ') {
                    e.preventDefault();
                    this.flipCard();
                }
            });
        }

        getCurrentWord() {
            return this.vocabulary[this.currentIndex];
        }

        flipCard() {
            this.isFlipped = !this.isFlipped;
            if (this.elements.flashcard) {
                if (this.isFlipped) {
                    this.elements.flashcard.classList.add('flipped');
                } else {
                    this.elements.flashcard.classList.remove('flipped');
                }
            }
        }

        nextCard() {
            if (this.currentIndex < this.vocabulary.length - 1) {
                this.currentIndex++;
                this.isFlipped = false;
                if (this.elements.flashcard) {
                    this.elements.flashcard.classList.remove('flipped');
                }
                this.updateCard();
                this.updateProgress();
            }
        }

        previousCard() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.isFlipped = false;
                if (this.elements.flashcard) {
                    this.elements.flashcard.classList.remove('flipped');
                }
                this.updateCard();
                this.updateProgress();
            }
        }

        shuffleCards() {
            // Fisher-Yates shuffle
            for (let i = this.vocabulary.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.vocabulary[i], this.vocabulary[j]] = [this.vocabulary[j], this.vocabulary[i]];
            }
            this.currentIndex = 0;
            this.isFlipped = false;
            if (this.elements.flashcard) {
                this.elements.flashcard.classList.remove('flipped');
            }
            this.isShuffled = !this.isShuffled;
            this.updateCard();
            this.updateProgress();
            
            // Animation
            if (this.elements.flashcard) {
                this.elements.flashcard.classList.add('shake');
                setTimeout(() => {
                    this.elements.flashcard.classList.remove('shake');
                }, 500);
            }
        }

        updateCard() {
            const word = this.getCurrentWord();
            if (!word) return;

            if (this.elements.frontText) {
                this.elements.frontText.textContent = word.korean;
            }
            if (this.elements.backText) {
                this.elements.backText.textContent = word.meaning;
            }
            if (this.elements.romanizationText) {
                this.elements.romanizationText.textContent = word.romanization;
            }
            if (this.elements.exampleText) {
                this.elements.exampleText.textContent = word.example || '';
            }

            // Update action buttons
            this.updateActionButtons(word.id);
        }

        updateActionButtons(wordId) {
            // Favorite
            if (this.elements.favoriteBtn) {
                if (StorageManager.isFavorite(wordId)) {
                    this.elements.favoriteBtn.classList.add('active-favorite');
                    this.elements.favoriteBtn.textContent = '❤️ Đã thích';
                } else {
                    this.elements.favoriteBtn.classList.remove('active-favorite');
                    this.elements.favoriteBtn.textContent = '🤍 Yêu thích';
                }
            }

            // Known
            if (this.elements.knownBtn) {
                if (StorageManager.isKnown(wordId)) {
                    this.elements.knownBtn.classList.add('active-known');
                    this.elements.knownBtn.textContent = '✅ Đã thuộc';
                } else {
                    this.elements.knownBtn.classList.remove('active-known');
                    this.elements.knownBtn.textContent = '☐ Đánh dấu thuộc';
                }
            }

            // Difficult
            if (this.elements.difficultBtn) {
                if (StorageManager.isDifficult(wordId)) {
                    this.elements.difficultBtn.classList.add('active-difficult');
                    this.elements.difficultBtn.textContent = '⚠️ Đã đánh dấu khó';
                } else {
                    this.elements.difficultBtn.classList.remove('active-difficult');
                    this.elements.difficultBtn.textContent = '⚠️ Từ khó';
                }
            }
        }

        updateProgress() {
            const total = this.vocabulary.length;
            const current = this.currentIndex + 1;
            
            if (this.elements.cardCounter) {
                this.elements.cardCounter.textContent = `${current} / ${total}`;
            }
            if (this.elements.progressFill) {
                const percentage = (current / total) * 100;
                this.elements.progressFill.style.width = `${percentage}%`;
            }

            StorageManager.updateProgress(current);
        }

        toggleFavorite() {
            const word = this.getCurrentWord();
            if (!word) return;
            
            const isFav = StorageManager.toggleFavorite(word.id);
            this.updateActionButtons(word.id);
            
            // Animation
            if (this.elements.favoriteBtn) {
                this.elements.favoriteBtn.classList.add('bounce');
                setTimeout(() => {
                    this.elements.favoriteBtn.classList.remove('bounce');
                }, 600);
            }
        }

        markAsKnown() {
            const word = this.getCurrentWord();
            if (!word) return;
            
            if (StorageManager.isKnown(word.id)) {
                StorageManager.removeKnownWord(word.id);
            } else {
                StorageManager.addKnownWord(word.id);
            }
            this.updateActionButtons(word.id);
        }

        markAsDifficult() {
            const word = this.getCurrentWord();
            if (!word) return;
            
            if (StorageManager.isDifficult(word.id)) {
                StorageManager.removeDifficultWord(word.id);
            } else {
                StorageManager.addDifficultWord(word.id);
            }
            this.updateActionButtons(word.id);
        }

        pronounceWord() {
            const word = this.getCurrentWord();
            if (!word || !word.korean) return;
            
            // Sử dụng Web Speech API để phát âm
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word.korean);
                utterance.lang = 'ko-KR';
                utterance.rate = 0.8;
                window.speechSynthesis.speak(utterance);
            } else {
                alert('Trình duyệt của bạn không hỗ trợ phát âm.');
            }
        }

        // Tìm kiếm và jump đến từ
        searchAndJump(query) {
            if (!query) return;
            
            const lowerQuery = query.toLowerCase();
            const index = this.vocabulary.findIndex(word => 
                word.korean.includes(query) ||
                word.romanization.toLowerCase().includes(lowerQuery) ||
                word.meaning.toLowerCase().includes(lowerQuery)
            );
            
            if (index !== -1) {
                this.currentIndex = index;
                this.isFlipped = false;
                if (this.elements.flashcard) {
                    this.elements.flashcard.classList.remove('flipped');
                }
                this.updateCard();
                this.updateProgress();
            } else {
                alert('Không tìm thấy từ: ' + query);
            }
        }
    }

    // Khởi tạo khi trang flashcard được load
    if (document.querySelector('.flashcard-main')) {
        const flashcardManager = new FlashcardManager();
        document.addEventListener('DOMContentLoaded', () => flashcardManager.init());
        window.FlashcardManager = flashcardManager;
    }
})();
