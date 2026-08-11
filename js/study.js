const Study = (() => {
  let currentDeck = null;
  let studyCards = [];
  let currentIndex = 0;
  let direction = 'en-vi';

  function startStudy(deck, dir) {
    currentDeck = deck;
    direction = dir;
    const now = Date.now();
    // Lấy thẻ đến hạn ôn tập (nextReview <= now) hoặc thẻ mới chưa học
    studyCards = deck.cards.filter(c => c.nextReview <= now);
    if (studyCards.length === 0) {
      studyCards = [...deck.cards]; // Nếu không có thẻ đến hạn thì lấy tất cả
    }
    // Xáo trộn nhẹ để không bị nhàm
    studyCards.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    return studyCards;
  }

  function getCurrentCard() {
    return studyCards.length > 0 ? studyCards[currentIndex] : null;
  }

  function nextCard() {
    currentIndex++;
    if (currentIndex >= studyCards.length) {
      currentIndex = 0; // Quay vòng
    }
    return getCurrentCard();
  }

  function rateCard(card, rating) {
    const now = Date.now();
    let intervalMinutes;
    let newLevel;
    switch (rating) {
      case 1: // again
        newLevel = 0;
        intervalMinutes = 1;
        break;
      case 2: // hard
        newLevel = Math.max(card.level - 1, 1);
        intervalMinutes = 10;
        break;
      case 3: // good
        newLevel = card.level + 1;
        intervalMinutes = newLevel >= 2 ? 1440 : 240; // 1 ngày hoặc 4 giờ
        break;
      case 4: // easy
        newLevel = card.level + 2;
        intervalMinutes = 4320; // 3 ngày
        break;
      default:
        newLevel = card.level;
        intervalMinutes = 60;
    }
    card.level = newLevel;
    card.nextReview = now + intervalMinutes * 60 * 1000;
    card.reviewCount = (card.reviewCount || 0) + 1;

    // Cập nhật vào deck gốc
    if (currentDeck) {
      const idx = currentDeck.cards.findIndex(c => c.id === card.id);
      if (idx !== -1) {
        currentDeck.cards[idx] = { ...card };
      }
      // Lưu lại toàn bộ decks
      const allDecks = Storage.loadDecksSync();
      const deckIdx = allDecks.findIndex(d => d.id === currentDeck.id);
      if (deckIdx !== -1) {
        allDecks[deckIdx] = currentDeck;
        Storage.saveDecks(allDecks);
      }
    }
  }

  function getProgress() {
    return {
      current: currentIndex + 1,
      total: studyCards.length
    };
  }

  return { startStudy, getCurrentCard, nextCard, rateCard, getProgress };
})();
