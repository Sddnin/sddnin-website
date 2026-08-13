/**
 * MatchGame — trò chơi "Ghép thẻ": lật ô tìm cặp Anh-Việt giống nhau,
 * kiểu game lật ô trí nhớ (memory/concentration) cổ điển.
 */
const MatchGame = (() => {
  const PAIRS_COUNT = 6; // số cặp thẻ mỗi lượt chơi (6 cặp = 12 ô)

  let tiles = []; // [{ id, cardId, text, side: 'front'|'back', state: 'hidden'|'flipped'|'matched' }]
  let firstPick = null; // index của ô đầu tiên đang lật trong 1 lượt so khớp
  let matchedPairs = 0;
  let totalPairs = 0;
  let moves = 0;
  let locked = false; // true trong lúc đang hiện kết quả sai, chặn lật thêm

  function startGame(deck) {
    const pairsCount = Math.min(PAIRS_COUNT, deck.cards.length);
    const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5).slice(0, pairsCount);

    tiles = [];
    shuffledCards.forEach(card => {
      tiles.push({ id: card.id + '-front', cardId: card.id, text: card.front, side: 'front', state: 'hidden' });
      tiles.push({ id: card.id + '-back', cardId: card.id, text: card.back, side: 'back', state: 'hidden' });
    });
    tiles.sort(() => Math.random() - 0.5);

    firstPick = null;
    matchedPairs = 0;
    totalPairs = pairsCount;
    moves = 0;
    locked = false;

    return getTiles();
  }

  function getTiles() {
    return tiles;
  }

  function getProgress() {
    return { matchedPairs, totalPairs, moves };
  }

  function isLocked() {
    return locked;
  }

  // Lật 1 ô. Trả về kết quả để UI biết cần hiện gì:
  // - 'invalid': ô không thể lật (đã matched, đang locked, hoặc index sai)
  // - 'first-pick': đây là ô đầu tiên của 1 lượt, chỉ lật lên và chờ
  // - 'match': ô thứ 2 khớp với ô đầu -> cả 2 thành matched
  // - 'no-match': ô thứ 2 KHÔNG khớp -> khoá lại, UI tự gọi resolveNoMatch() sau khi hiện đỏ 1 chút
  function flipTile(index) {
    if (locked) return { result: 'invalid' };
    const tile = tiles[index];
    if (!tile || tile.state === 'matched' || tile.state === 'flipped') return { result: 'invalid' };

    tile.state = 'flipped';

    if (firstPick === null) {
      firstPick = index;
      return { result: 'first-pick', index };
    }

    moves++;
    const firstTile = tiles[firstPick];
    const secondIndex = index;

    // Khớp đúng khi 2 ô cùng cardId (1 front + 1 back của cùng 1 thẻ)
    // và khác side (tránh trường hợp lý thuyết trùng id nếu dữ liệu lỗi).
    const isMatch = firstTile.cardId === tile.cardId && firstTile.side !== tile.side;

    if (isMatch) {
      firstTile.state = 'matched';
      tile.state = 'matched';
      matchedPairs++;
      const firstIndex = firstPick;
      firstPick = null;
      return { result: 'match', firstIndex, secondIndex, matchedPairs, totalPairs, moves };
    } else {
      locked = true; // chặn lật thêm cho tới khi UI gọi resolveNoMatch()
      const firstIndex = firstPick;
      return { result: 'no-match', firstIndex, secondIndex, moves };
    }
  }

  // UI gọi hàm này sau khi đã cho người chơi thấy 2 ô sai (delay ~800ms) —
  // úp lại cả 2 ô về trạng thái ẩn và mở khoá cho lượt lật tiếp theo.
  function resolveNoMatch(firstIndex, secondIndex) {
    if (tiles[firstIndex] && tiles[firstIndex].state !== 'matched') tiles[firstIndex].state = 'hidden';
    if (tiles[secondIndex] && tiles[secondIndex].state !== 'matched') tiles[secondIndex].state = 'hidden';
    firstPick = null;
    locked = false;
  }

  function isComplete() {
    return matchedPairs === totalPairs && totalPairs > 0;
  }

  return { startGame, getTiles, getProgress, isLocked, flipTile, resolveNoMatch, isComplete };
})();
