const Quiz = (() => {
  let deck = null;
  let questions = [];
  let currentQIndex = 0;
  let score = 0;
  let totalQuestions = 10;
  let askDirection = 'en-vi'; // sẽ random từng câu

  function startQuiz(selectedDeck, numQuestions = 10) {
    deck = selectedDeck;
    totalQuestions = Math.min(numQuestions, deck.cards.length);
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, totalQuestions).map(card => {
      const askVi = Math.random() > 0.5;
      return {
        cardId: card.id,
        question: askVi ? card.back : card.front,
        answer: askVi ? card.front : card.back,
        options: [],
        askVi: askVi
      };
    });

    // Sinh đáp án sai
    questions.forEach(q => {
      const otherCards = deck.cards.filter(c => c.id !== q.cardId);
      const wrongs = otherCards.sort(() => Math.random() - 0.5).slice(0, 3).map(c => {
        return q.askVi ? c.front : c.back;
      });
      // Đảm bảo đủ 3 đáp án sai, nếu không đủ thì thêm chuỗi rỗng
      while (wrongs.length < 3) wrongs.push('???');
      q.options = [...wrongs, q.answer].sort(() => Math.random() - 0.5);
    });

    currentQIndex = 0;
    score = 0;
    return questions;
  }

  function getCurrentQuestion() {
    return questions[currentQIndex];
  }

  function checkAnswer(selected) {
    const q = questions[currentQIndex];
    const isCorrect = (selected === q.answer);
    if (isCorrect) score++;
    return isCorrect;
  }

  function nextQuestion() {
    currentQIndex++;
    if (currentQIndex < questions.length) {
      return questions[currentQIndex];
    }
    return null; // hết câu hỏi
  }

  function getProgress() {
    return {
      current: currentQIndex + 1,
      total: questions.length,
      score: score
    };
  }

  return { startQuiz, getCurrentQuestion, checkAnswer, nextQuestion, getProgress };
})();
