document.addEventListener("DOMContentLoaded", () => {
    let rawVocabulary = [];
    let filteredVocabulary = [];
    let currentIndex = 0;

    const flashcard = document.getElementById("flashcard");
    const koreanText = document.getElementById("korean-text");
    const romanizationText = document.getElementById("romanization-text");
    const meaningText = document.getElementById("meaning-text");
    const exampleText = document.getElementById("example-text");
    const counterText = document.getElementById("card-counter");

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const audioBtn = document.getElementById("audio-btn");
    const masterBtn = document.getElementById("master-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const filterSelect = document.getElementById("filter-select");

    // Tải dữ liệu từ vựng
    fetch("../assets/data/vocabulary.json")
        .then((res) => res.json())
        .then((data) => {
            rawVocabulary = data;
            applyFilter();
        })
        .catch((err) => console.error("Lỗi khi tải vocabulary.json:", err));

    function applyFilter() {
        const filterValue = filterSelect ? filterSelect.value : 'all';
        
        if (filterValue === 'unlearned') {
            filteredVocabulary = rawVocabulary.filter(item => !StorageManager.isLearned('vocab', item.id));
        } else if (filterValue === 'learned') {
            filteredVocabulary = rawVocabulary.filter(item => StorageManager.isLearned('vocab', item.id));
        } else if (filterValue === 'bookmarked') {
            filteredVocabulary = rawVocabulary.filter(item => StorageManager.isBookmarked('vocab', item.id));
        } else {
            filteredVocabulary = [...rawVocabulary];
        }

        currentIndex = 0;
        renderCard();
    }

    function renderCard() {
        if (!filteredVocabulary || filteredVocabulary.length === 0) {
            if (koreanText) koreanText.textContent = "Không có dữ liệu";
            if (meaningText) meaningText.textContent = "Hãy đổi bộ lọc khác!";
            if (counterText) counterText.textContent = "0 / 0";
            return;
        }

        const currentItem = filteredVocabulary[currentIndex];

        if (flashcard) flashcard.classList.remove("flipped");

        if (koreanText) koreanText.textContent = currentItem.korean;
        if (romanizationText) romanizationText.textContent = `[${currentItem.romanization}]`;
        if (meaningText) meaningText.textContent = currentItem.meaning;
        if (exampleText) exampleText.textContent = currentItem.example || "";

        if (counterText) {
            counterText.textContent = `${currentIndex + 1} / ${filteredVocabulary.length}`;
        }

        // Cập nhật trạng thái nút "Đã thuộc"
        if (masterBtn) {
            const isLearned = StorageManager.isLearned('vocab', currentItem.id);
            masterBtn.classList.toggle('active', isLearned);
            masterBtn.textContent = isLearned ? "✓ Đã thuộc" : "Đánh dấu thuộc";
        }
    }

    // Sự kiện lật thẻ
    if (flashcard) {
        flashcard.addEventListener("click", (e) => {
            if (e.target.closest('.no-flip')) return;
            flashcard.classList.toggle("flipped");
        });
    }

    // Nút Phát âm
    if (audioBtn) {
        audioBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (filteredVocabulary[currentIndex]) {
                App.speakKorean(filteredVocabulary[currentIndex].korean);
            }
        });
    }

    // Nút Đã thuộc
    if (masterBtn) {
        masterBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const currentItem = filteredVocabulary[currentIndex];
            if (currentItem) {
                StorageManager.toggleLearned('vocab', currentItem.id);
                App.updateHeaderStats();
                renderCard();
            }
        });
    }

    // Nút Xáo trộn
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            filteredVocabulary.sort(() => Math.random() - 0.5);
            currentIndex = 0;
            renderCard();
        });
    }

    // Nút Chuyển thẻ Next/Prev
    if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (filteredVocabulary.length === 0) return;
            currentIndex = (currentIndex + 1) % filteredVocabulary.length;
            renderCard();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (filteredVocabulary.length === 0) return;
            currentIndex = (currentIndex - 1 + filteredVocabulary.length) % filteredVocabulary.length;
            renderCard();
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
    }
});
