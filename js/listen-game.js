/**
 * ListenGame — trò chơi "Nghe đoán từ": nghe phát âm tiếng Anh (không
 * hiện chữ), gõ đúng từ đó. Luôn hỏi theo chiều nghe Anh -> gõ Anh (gõ
 * đúng chính tả từ mình nghe được), vì đây là bài tập luyện nghe/chính
 * tả, khác với hướng học Anh<->Việt của các chế độ khác.
 */
const ListenGame = (() => {
  let deck = null;
  let questions = []; // [{ cardId, word, back }]
  let currentIndex = 0;
  let score = 0;

  function startGame(selectedDeck, numQuestions = 10) {
    deck = selectedDeck;
    const total = Math.min(numQuestions, deck.cards.length);
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, total).map(card => ({
      cardId: card.id,
      word: card.front,
      back: card.back,
    }));
    currentIndex = 0;
    score = 0;
    return questions;
  }

  function getCurrentQuestion() {
    return questions[currentIndex];
  }

  // So khớp không phân biệt hoa/thường và bỏ khoảng trắng thừa đầu/cuối
  // — người học không nên bị tính sai chỉ vì gõ hoa/thường khác, đây là
  // bài luyện nghe/chính tả chứ không phải bài kiểm tra viết hoa.
  function checkAnswer(userInput) {
    const q = questions[currentIndex];
    if (!q) return false;
    const normalize = (s) => String(s).trim().toLowerCase();
    const isCorrect = normalize(userInput) === normalize(q.word);
    if (isCorrect) score++;
    return isCorrect;
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
      return questions[currentIndex];
    }
    return null;
  }

  function getProgress() {
    return { current: currentIndex + 1, total: questions.length, score };
  }

  return { startGame, getCurrentQuestion, checkAnswer, nextQuestion, getProgress };
})();
