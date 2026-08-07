// === FILE: search.js ===
// Tìm kiếm: Hangul, Romanization, Nghĩa tiếng Việt

(function() {
    'use strict';

    class SearchManager {
        constructor() {
            this.elements = {
                searchInput: document.getElementById('search-input'),
                searchBtn: document.getElementById('search-btn')
            };
        }

        init() {
            this.setupEventListeners();
        }

        setupEventListeners() {
            if (this.elements.searchBtn) {
                this.elements.searchBtn.addEventListener('click', () => {
                    this.performSearch();
                });
            }

            if (this.elements.searchInput) {
                this.elements.searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch();
                    }
                });
            }
        }

        performSearch() {
            if (!this.elements.searchInput) return;
            
            const query = this.elements.searchInput.value.trim();
            if (!query) {
                alert('Vui lòng nhập từ khóa tìm kiếm.');
                return;
            }

            // Kiểm tra xem FlashcardManager có tồn tại không
            if (window.FlashcardManager && typeof window.FlashcardManager.searchAndJump === 'function') {
                window.FlashcardManager.searchAndJump(query);
            } else {
                // Fallback: tìm trong vocabulary data
                this.searchInData(query);
            }
        }

        async searchInData(query) {
            try {
                const response = await fetch('../assets/data/vocabulary.json');
                const vocabulary = await response.json();
                
                const lowerQuery = query.toLowerCase();
                const results = vocabulary.filter(word => 
                    word.korean.includes(query) ||
                    word.romanization.toLowerCase().includes(lowerQuery) ||
                    word.meaning.toLowerCase().includes(lowerQuery)
                );

                this.displaySearchResults(results, query);
            } catch (error) {
                console.error('Error searching:', error);
                alert('Không thể tìm kiếm. Vui lòng thử lại.');
            }
        }

        displaySearchResults(results, query) {
            // Tạo modal hiển thị kết quả
            const existingModal = document.getElementById('search-results-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.id = 'search-results-modal';
            modal.className = 'search-results-modal';
            
            let resultsHTML = '';
            if (results.length === 0) {
                resultsHTML = '<p class="no-results">Không tìm thấy kết quả cho "' + query + '"</p>';
            } else {
                resultsHTML = `<h3>Kết quả tìm kiếm cho "${query}" (${results.length} kết quả)</h3>`;
                resultsHTML += '<div class="search-results-list">';
                results.forEach(word => {
                    resultsHTML += `
                        <div class="search-result-item">
                            <span class="result-korean">${word.korean}</span>
                            <span class="result-romanization">${word.romanization}</span>
                            <span class="result-meaning">${word.meaning}</span>
                        </div>
                    `;
                });
                resultsHTML += '</div>';
            }

            modal.innerHTML = `
                <div class="search-modal-content">
                    <span class="close-search-modal">✕</span>
                    ${resultsHTML}
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            const closeBtn = modal.querySelector('.close-search-modal');
            closeBtn.addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            // Style tạm cho modal
            const style = document.createElement('style');
            style.textContent = `
                .search-results-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 300;
                }
                .search-modal-content {
                    background: var(--background-light);
                    color: var(--text-light);
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 70vh;
                    overflow-y: auto;
                    position: relative;
                }
                .close-search-modal {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .search-results-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 15px;
                }
                .search-result-item {
                    display: flex;
                    flex-direction: column;
                    padding: 12px;
                    background: var(--card-light);
                    border-radius: 10px;
                    border: 1px solid var(--border-light);
                }
                .result-korean {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--primary-color);
                }
                .result-romanization {
                    font-style: italic;
                    opacity: 0.8;
                }
                .no-results {
                    text-align: center;
                    padding: 30px;
                    opacity: 0.7;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Khởi tạo
    const searchManager = new SearchManager();
    document.addEventListener('DOMContentLoaded', () => searchManager.init());
    window.SearchManager = searchManager;
})();
