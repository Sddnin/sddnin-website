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

    // Sinh đáp án sai — đảm bảo KHÔNG trùng đáp án đúng và KHÔNG trùng
    // lẫn nhau. Deck có thể chứa 2 thẻ khác nhau nhưng cùng nghĩa dịch
    // (front/back trùng), nên không thể chỉ lọc theo id của thẻ; phải
    // lọc theo giá trị thực tế sẽ hiển thị. Nếu deck quá nhỏ để đủ 3
    // đáp án nhiễu khác biệt, câu hỏi sẽ có ít hơn 4 lựa chọn thay vì
    // độn chuỗi giả '???' — một lựa chọn giả không giúp ích gì và trông
    // như lỗi khi 2 ô hiện cùng 1 nội dung.
    //
    // So khớp trùng lặp dựa trên giá trị đã trim (phòng dữ liệu cũ có
    // khoảng trắng thừa đầu/cuối chưa qua các bước chuẩn hoá mới hơn) —
    // nhưng vẫn PUSH giá trị gốc (chưa trim) vào wrongs/options, vì đó
    // là những gì thực sự hiển thị và được so khớp khi người dùng bấm chọn.
    questions.forEach(q => {
      const otherCards = deck.cards.filter(c => c.id !== q.cardId);
      const candidateWrongs = otherCards
        .sort(() => Math.random() - 0.5)
        .map(c => (q.askVi ? c.front : c.back));

      const wrongs = [];
      const seen = new Set([String(q.answer).trim()]);
      for (const candidate of candidateWrongs) {
        if (wrongs.length >= 3) break;
        const key = String(candidate).trim();
        if (seen.has(key)) continue;
        seen.add(key);
        wrongs.push(candidate);
      }

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
