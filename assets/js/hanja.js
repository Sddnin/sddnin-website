// === FILE: hanja.js ===
// Load và hiển thị dữ liệu Hanja

(function() {
    'use strict';

    class HanjaManager {
        constructor() {
            this.hanjaData = [];
            
            this.elements = {
                hanjaGrid: document.getElementById('hanja-grid'),
                hanjaDetail: document.getElementById('hanja-detail'),
                closeDetail: document.getElementById('close-detail'),
                detailCharacter: document.getElementById('detail-character'),
                detailHangul: document.getElementById('detail-hangul'),
                detailSino: document.getElementById('detail-sino'),
                detailMeaning: document.getElementById('detail-meaning'),
                detailWords: document.getElementById('detail-words')
            };
        }

        async init() {
            await this.loadHanjaData();
            this.renderHanjaGrid();
            this.setupEventListeners();
        }

        async loadHanjaData() {
            try {
                const response = await fetch('../assets/data/hanja.json');
                this.hanjaData = await response.json();
            } catch (error) {
                console.error('Error loading hanja data:', error);
                // Fallback data
                this.hanjaData = [
                    {
                        "id": 1,
                        "character": "學",
                        "hangul": "학",
                        "sinoVietnamese": "Học",
                        "meaning": "Học tập, học hành",
                        "words": ["학교 (trường học)", "학생 (học sinh)", "공학 (kỹ thuật)", "과학 (khoa học)"]
                    },
                    {
                        "id": 2,
                        "character": "大",
                        "hangul": "대",
                        "sinoVietnamese": "Đại",
                        "meaning": "Lớn, to lớn",
                        "words": ["대학교 (đại học)", "대통령 (tổng thống)", "대문 (cổng lớn)", "확대 (phóng to)"]
                    },
                    {
                        "id": 3,
                        "character": "人",
                        "hangul": "인",
                        "sinoVietnamese": "Nhân",
                        "meaning": "Người",
                        "words": ["인간 (con người)", "개인 (cá nhân)", "주인 (chủ nhân)", "노인 (người già)"]
                    },
                    {
                        "id": 4,
                        "character": "山",
                        "hangul": "산",
                        "sinoVietnamese": "Sơn",
                        "meaning": "Núi",
                        "words": ["산책 (đi dạo)", "등산 (leo núi)", "산소 (mộ phần)", "화산 (núi lửa)"]
                    },
                    {
                        "id": 5,
                        "character": "水",
                        "hangul": "수",
                        "sinoVietnamese": "Thủy",
                        "meaning": "Nước",
                        "words": ["수영 (bơi lội)", "생수 (nước uống)", "수도 (thủ đô)", "홍수 (lũ lụt)"]
                    },
                    {
                        "id": 6,
                        "character": "日",
                        "hangul": "일",
                        "sinoVietnamese": "Nhật",
                        "meaning": "Ngày, mặt trời",
                        "words": ["일요일 (chủ nhật)", "생일 (sinh nhật)", "일기 (nhật ký)", "일본 (Nhật Bản)"]
                    }
                ];
            }
        }

        setupEventListeners() {
            if (this.elements.closeDetail) {
                this.elements.closeDetail.addEventListener('click', () => {
                    this.hideDetail();
                });
            }

            // Click outside to close
            if (this.elements.hanjaDetail) {
                this.elements.hanjaDetail.addEventListener('click', (e) => {
                    if (e.target === this.elements.hanjaDetail) {
                        this.hideDetail();
                    }
                });
            }

            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideDetail();
                }
            });
        }

        renderHanjaGrid() {
            if (!this.elements.hanjaGrid) return;

            this.elements.hanjaGrid.innerHTML = '';

            this.hanjaData.forEach((hanja, index) => {
                const card = document.createElement('div');
                card.className = 'hanja-card fade-in';
                card.style.animationDelay = `${index * 0.1}s`;
                
                card.innerHTML = `
                    <div class="hanja-char">${hanja.character}</div>
                    <div class="hangul">${hanja.hangul}</div>
                    <div class="meaning">${hanja.meaning}</div>
                `;

                card.addEventListener('click', () => {
                    this.showDetail(hanja);
                });

                this.elements.hanjaGrid.appendChild(card);
            });
        }

        showDetail(hanja) {
            if (!this.elements.hanjaDetail) return;

            if (this.elements.detailCharacter) {
                this.elements.detailCharacter.textContent = hanja.character;
            }
            if (this.elements.detailHangul) {
                this.elements.detailHangul.textContent = hanja.hangul;
            }
            if (this.elements.detailSino) {
                this.elements.detailSino.textContent = hanja.sinoVietnamese;
            }
            if (this.elements.detailMeaning) {
                this.elements.detailMeaning.textContent = hanja.meaning;
            }
            if (this.elements.detailWords) {
                this.elements.detailWords.innerHTML = '';
                if (hanja.words && hanja.words.length > 0) {
                    hanja.words.forEach(word => {
                        const li = document.createElement('li');
                        li.textContent = word;
                        this.elements.detailWords.appendChild(li);
                    });
                }
            }

            this.elements.hanjaDetail.style.display = 'flex';
            this.elements.hanjaDetail.classList.add('fade-in');
        }

        hideDetail() {
            if (this.elements.hanjaDetail) {
                this.elements.hanjaDetail.style.display = 'none';
            }
        }
    }

    // Khởi tạo khi trang hanja được load
    if (document.querySelector('.hanja-main')) {
        const hanjaManager = new HanjaManager();
        document.addEventListener('DOMContentLoaded', () => hanjaManager.init());
        window.HanjaManager = hanjaManager;
    }
})();
