/**
 * SpeedTypeGame — trò chơi "Nối từ tốc độ": hiện từ tiếng Anh, gõ
 * nhanh nghĩa tiếng Việt trước khi hết giờ. Logic đếm giờ thuộc về
 * tầng UI (setInterval, cập nhật thanh tiến độ theo thời gian thực);
 * module này chỉ quản lý dữ liệu câu hỏi/đáp án/điểm, giống ListenGame.
 */
const SpeedTypeGame = (() => {
  let deck = null;
  let questions = []; // [{ cardId, word, answer }]
  let currentIndex = 0;
  let score = 0;
  let streak = 0; // số câu đúng liên tiếp hiện tại
  let bestStreak = 0;

  function startGame(selectedDeck, numQuestions = 10) {
    deck = selectedDeck;
    const total = Math.min(numQuestions, deck.cards.length);
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, total).map(card => ({
      cardId: card.id,
      word: card.front,
      answer: card.back,
    }));
    currentIndex = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    return questions;
  }

  function getCurrentQuestion() {
    return questions[currentIndex];
  }

  function normalize(s) {
    return String(s).trim().toLowerCase();
  }

  function checkAnswer(userInput) {
    const q = questions[currentIndex];
    if (!q) return false;
    const isCorrect = normalize(userInput) === normalize(q.answer);
    if (isCorrect) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }
    return isCorrect;
  }

  // Gọi khi hết giờ mà chưa trả lời — tính là sai, reset streak, nhưng
  // KHÔNG gọi checkAnswer() (tránh so input rỗng/dở dang một cách sai lệch).
  function markTimeout() {
    streak = 0;
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
      return questions[currentIndex];
    }
    return null;
  }

  function getProgress() {
    return { current: currentIndex + 1, total: questions.length, score, streak, bestStreak };
  }

  return { startGame, getCurrentQuestion, checkAnswer, markTimeout, nextQuestion, getProgress };
})();
