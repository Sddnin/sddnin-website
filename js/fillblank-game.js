/**
 * FillBlankGame — trò chơi "Điền từ vào chỗ trống": câu ví dụ của thẻ
 * có 1 từ bị ẩn (từ ứng với card.front), người học gõ từ đó vào.
 *
 * Chỉ những thẻ có example CHỨA được front (hoặc biến cách của nó —
 * số nhiều, thì động từ, viết hoa đầu câu...) mới dùng được cho game
 * này; thẻ không có example hoặc example không chứa từ sẽ bị loại,
 * tương tự cách các module khác trong app loại bỏ dữ liệu không đủ
 * điều kiện thay vì cố hiển thị sai.
 */
const FillBlankGame = (() => {
  let deck = null;
  let questions = []; // [{ cardId, sentenceWithBlank, matchedWord, front }]
  let currentIndex = 0;
  let score = 0;

  // Tìm từ trong câu bắt đầu bằng `front` (không phân biệt hoa/thường,
  // cho phép hậu tố như -s/-es/-ing/-ed theo sau). Trả về null nếu
  // không tìm thấy — ví dụ example rỗng hoặc không chứa từ này.
  function findWordInSentence(sentence, front) {
    if (!sentence || !front) return null;
    const escaped = String(front).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b(' + escaped + '\\w*)\\b', 'i');
    const match = sentence.match(regex);
    if (!match) return null;
    return { matchedWord: match[1], index: match.index };
  }

  function buildQuestion(card) {
    const found = findWordInSentence(card.example, card.front);
    if (!found) return null;
    const sentence = card.example;
    const before = sentence.slice(0, found.index);
    const after = sentence.slice(found.index + found.matchedWord.length);
    return {
      cardId: card.id,
      sentenceWithBlank: before + '_____' + after,
      matchedWord: found.matchedWord, // dạng từ THẬT SỰ xuất hiện trong câu (vd "Elephants")
      front: card.front, // dạng từ điển gốc (vd "elephant")
    };
  }

  function startGame(selectedDeck, numQuestions = 10) {
    deck = selectedDeck;
    // Chỉ giữ những thẻ thực sự dùng được cho game này.
    const usableCards = deck.cards.filter(c => findWordInSentence(c.example, c.front) !== null);
    const total = Math.min(numQuestions, usableCards.length);
    const shuffled = [...usableCards].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, total).map(buildQuestion).filter(q => q !== null);
    currentIndex = 0;
    score = 0;
    return questions;
  }

  function getUsableCount(selectedDeck) {
    return selectedDeck.cards.filter(c => findWordInSentence(c.example, c.front) !== null).length;
  }

  function getCurrentQuestion() {
    return questions[currentIndex];
  }

  // Chấp nhận cả dạng từ điển gốc (front) lẫn dạng thực tế xuất hiện
  // trong câu (matchedWord, có thể là số nhiều/chia thì) — mục tiêu
  // bài tập là nhớ từ vựng, không phải kiểm tra ngữ pháp chia từ.
  function checkAnswer(userInput) {
    const q = questions[currentIndex];
    if (!q) return false;
    const normalize = (s) => String(s).trim().toLowerCase();
    const input = normalize(userInput);
    const isCorrect = input === normalize(q.front) || input === normalize(q.matchedWord);
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

  return { startGame, getUsableCount, getCurrentQuestion, checkAnswer, nextQuestion, getProgress };
})();
