// srs.js - Spaced Repetition System
const SRS = (() => {
  const DEFAULT_EASE = 2.5;
  const MIN_EASE = 1.3;
  const INTERVALS = [1, 6]; // days

  function getDueCards(vocabIds) {
    const data = StorageManager.getSRSData();
    const now = new Date();
    return vocabIds.filter(id => {
      const card = data[id];
      if (!card) return true; // chưa có dữ liệu -> cần ôn
      return new Date(card.nextReview) <= now;
    });
  }

  function updateCard(wordId, quality) { // quality: 0-5
    const data = StorageManager.getSRSData();
    let card = data[wordId] || {
      interval: 0,
      repetitions: 0,
      easeFactor: DEFAULT_EASE,
      nextReview: new Date().toISOString()
    };

    if (quality >= 3) {
      if (card.repetitions === 0) card.interval = 1;
      else if (card.repetitions === 1) card.interval = 6;
      else card.interval = Math.round(card.interval * card.easeFactor);
      card.repetitions++;
    } else {
      card.repetitions = 0;
      card.interval = 1;
    }

    card.easeFactor = Math.max(MIN_EASE, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const next = new Date();
    next.setDate(next.getDate() + card.interval);
    card.nextReview = next.toISOString();
    data[wordId] = card;
    StorageManager.saveSRSData(data);
    return card;
  }

  return { getDueCards, updateCard };
})();
