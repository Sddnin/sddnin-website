document.addEventListener("DOMContentLoaded", () => {
    let vocabulary = [];
    let currentIndex = 0;

    const flashcard = document.getElementById("flashcard");
    const koreanText = document.getElementById("korean-text");
    const romanizationText = document.getElementById("romanization-text");
    const meaningText = document.getElementById("meaning-text");
    const exampleText = document.getElementById("example-text");
    const counterText = document.getElementById("card-counter");

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const flipBtn = document.getElementById("flip-btn");

    // Tải dữ liệu từ vocabulary.json (Lấy toàn bộ từ vựng, không dùng .slice(0,3))
    fetch("../assets/data/vocabulary.json")
        .then((response) => response.json())
        .then((data) => {
            vocabulary = data; // Load đầy đủ tất cả từ vựng
            if (vocabulary.length > 0) {
                renderCard(currentIndex);
            }
        })
        .catch((error) => {
            console.error("Lỗi khi tải từ vựng:", error);
        });

    // Hiển thị thẻ flashcard theo chỉ số index
    function renderCard(index) {
        if (!vocabulary || vocabulary.length === 0) return;

        const cardData = vocabulary[index];

        // Đảm bảo thẻ quay lại mặt trước khi đổi từ mới
        if (flashcard) {
            flashcard.classList.remove("flipped");
        }

        if (koreanText) koreanText.textContent = cardData.korean;
        if (romanizationText) romanizationText.textContent = `[${cardData.romanization}]`;
        if (meaningText) meaningText.textContent = cardData.meaning;
        if (exampleText) exampleText.textContent = cardData.example || "";

        if (counterText) {
            counterText.textContent = `${index + 1} / ${vocabulary.length}`;
        }
    }

    // Lật thẻ
    if (flashcard) {
        flashcard.addEventListener("click", () => {
            flashcard.classList.toggle("flipped");
        });
    }

    if (flipBtn) {
        flipBtn.addEventListener("click", () => {
            if (flashcard) flashcard.classList.toggle("flipped");
        });
    }

    // Chuyển sang từ tiếp theo
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (vocabulary.length === 0) return;
            currentIndex = (currentIndex + 1) % vocabulary.length;
            renderCard(currentIndex);
        });
    }

    // Quay lại từ trước đó
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (vocabulary.length === 0) return;
            currentIndex = (currentIndex - 1 + vocabulary.length) % vocabulary.length;
            renderCard(currentIndex);
        });
    }
});
