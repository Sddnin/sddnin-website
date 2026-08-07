// === FILE: grammar.js ===
// Load và hiển thị dữ liệu Grammar

(function() {
    'use strict';

    class GrammarManager {
        constructor() {
            this.grammarData = [];
            this.elements = {
                grammarList: document.getElementById('grammar-list')
            };
        }

        async init() {
            await this.loadGrammarData();
            this.renderGrammarList();
        }

        async loadGrammarData() {
            try {
                const response = await fetch('../assets/data/grammar.json');
                this.grammarData = await response.json();
            } catch (error) {
                console.error('Error loading grammar data:', error);
                // Fallback data
                this.grammarData = [
                    {
                        "id": 1,
                        "pattern": "V/A + 아/어요",
                        "meaning": "Thì hiện tại, câu trần thuật lịch sự",
                        "structure": "Động từ/Tính từ + 아요 (nếu âm cuối là ㅏ, ㅗ) / 어요 (các âm khác)",
                        "examples": [
                            { "ko": "가다 → 가요", "vi": "Đi → Đi ạ" },
                            { "ko": "먹다 → 먹어요", "vi": "Ăn → Ăn ạ" },
                            { "ko": "좋다 → 좋아요", "vi": "Tốt → Tốt ạ" }
                        ]
                    },
                    {
                        "id": 2,
                        "pattern": "V/A + 았/었어요",
                        "meaning": "Thì quá khứ",
                        "structure": "Động từ/Tính từ + 았어요 (âm cuối ㅏ,ㅗ) / 었어요 (các âm khác)",
                        "examples": [
                            { "ko": "가다 → 갔어요", "vi": "Đi → Đã đi" },
                            { "ko": "먹다 → 먹었어요", "vi": "Ăn → Đã ăn" },
                            { "ko": "좋다 → 좋았어요", "vi": "Tốt → Đã tốt" }
                        ]
                    },
                    {
                        "id": 3,
                        "pattern": "V + (으)ㄹ 거예요",
                        "meaning": "Thì tương lai, dự định",
                        "structure": "Động từ + ㄹ 거예요 (không patchim) / 을 거예요 (có patchim)",
                        "examples": [
                            { "ko": "가다 → 갈 거예요", "vi": "Đi → Sẽ đi" },
                            { "ko": "먹다 → 먹을 거예요", "vi": "Ăn → Sẽ ăn" },
                            { "ko": "공부하다 → 공부할 거예요", "vi": "Học → Sẽ học" }
                        ]
                    },
                    {
                        "id": 4,
                        "pattern": "N + 이에요/예요",
                        "meaning": "Là (danh từ)",
                        "structure": "Danh từ + 이에요 (có patchim) / 예요 (không patchim)",
                        "examples": [
                            { "ko": "학생이에요", "vi": "Là học sinh" },
                            { "ko": "의사예요", "vi": "Là bác sĩ" },
                            { "ko": "책이에요", "vi": "Là quyển sách" }
                        ]
                    },
                    {
                        "id": 5,
                        "pattern": "V + 고 싶어요",
                        "meaning": "Muốn làm gì",
                        "structure": "Động từ (bỏ 다) + 고 싶어요",
                        "examples": [
                            { "ko": "먹고 싶어요", "vi": "Muốn ăn" },
                            { "ko": "가고 싶어요", "vi": "Muốn đi" },
                            { "ko": "보고 싶어요", "vi": "Muốn xem / Nhớ" }
                        ]
                    }
                ];
            }
        }

        renderGrammarList() {
            if (!this.elements.grammarList) return;

            this.elements.grammarList.innerHTML = '';

            this.grammarData.forEach((grammar, index) => {
                const item = document.createElement('div');
                item.className = 'grammar-item slide-in-left';
                item.style.animationDelay = `${index * 0.1}s`;

                let examplesHTML = '';
                if (grammar.examples && grammar.examples.length > 0) {
                    examplesHTML = '<ul class="grammar-examples">';
                    grammar.examples.forEach(ex => {
                        examplesHTML += `
                            <li>
                                <span class="example-ko">${ex.ko}</span>
                                <br>
                                <span class="example-vi">${ex.vi}</span>
                            </li>
                        `;
                    });
                    examplesHTML += '</ul>';
                }

                item.innerHTML = `
                    <div class="grammar-pattern">${grammar.pattern}</div>
                    <div class="grammar-meaning"><strong>Ý nghĩa:</strong> ${grammar.meaning}</div>
                    <div class="grammar-structure">${grammar.structure}</div>
                    ${examplesHTML}
                `;

                this.elements.grammarList.appendChild(item);
            });
        }
    }

    // Khởi tạo khi trang grammar được load
    if (document.querySelector('.grammar-main')) {
        const grammarManager = new GrammarManager();
        document.addEventListener('DOMContentLoaded', () => grammarManager.init());
        window.GrammarManager = grammarManager;
    }
})();
