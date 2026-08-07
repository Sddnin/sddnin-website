document.addEventListener("DOMContentLoaded", () => {
    let quizData = [];
    let currentQuizIndex = 0;
    let score = 0;

    const questionEl = document.getElementById("quiz-question");
    const optionsContainer = document.getElementById("quiz-options");
    const scoreEl = document.getElementById("quiz-score");
    const restartBtn = document.getElementById("quiz-restart");

    fetch("../assets/data/vocabulary.json")
        .then(res => res.json())
        .then(data => {
            quizData = buildQuiz(data, 10); // Tạo bộ 10 câu hỏi
            renderQuizCard();
        });

    function buildQuiz(vocabList, count) {
        const shuffled = [...vocabList].sort(() => Math.random() - 0.5).slice(0, count);
        return shuffled.map(item => {
            // Lấy 3 lựa chọn sai ngẫu nhiên
            const wrongAnswers = vocabList
                .filter(v => v.id !== item.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(v => v.meaning);

            const options = [...wrongAnswers, item.meaning].sort(() => Math.random() - 0.5);

            return {
                question: item.korean,
                correctAnswer: item.meaning,
                options: options
            };
        });
    }

    function renderQuizCard() {
        if (currentQuizIndex >= quizData.length) {
            showFinalResult();
            return;
        }

        const current = quizData[currentQuizIndex];
        if (questionEl) questionEl.textContent = `Từ "${current.question}" nghĩa là gì?`;
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            current.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.textContent = option;
                btn.onclick = () => checkAnswer(option, current.correctAnswer);
                optionsContainer.appendChild(btn);
            });
        }
    }

    function checkAnswer(selected, correct) {
        if (selected === correct) {
            score += 10;
            alert("Chính xác! 🎉");
        } else {
            alert(`Sai rồi! Đáp án đúng là: ${correct}`);
        }
        
        if (scoreEl) scoreEl.textContent = `Điểm: ${score}`;
        currentQuizIndex++;
        renderQuizCard();
    }

    function showFinalResult() {
        if (questionEl) questionEl.textContent = "Hoàn thành bài kiểm tra!";
        if (optionsContainer) {
            optionsContainer.innerHTML = `<h3>Tổng điểm của bạn: ${score} / ${quizData.length * 10}</h3>`;
        }
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});
