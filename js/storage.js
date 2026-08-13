const Storage = (() => {
  const STORAGE_KEY = 'flashcard_decks';

  // Khởi tạo dữ liệu
  async function initialize() {
    let decks = loadDecksSync();
    if (!decks || decks.length === 0) {
      try {
        const response = await fetch('data/sample.json');
        if (response.ok) {
          decks = await response.json();
          saveDecks(decks);
        } else {
          throw new Error('Không tải được sample');
        }
      } catch (e) {
        decks = getDefaultDecks();
        saveDecks(decks);
      }
    }
    return decks;
  }

  function getDefaultDecks() {
    return [
      {
        id: 'deck1',
        name: 'Động vật',
        cards: [
          { id: 'c1', front: 'cat', back: 'con mèo', example: 'The cat is sleeping.', image: '', level: 0, nextReview: Date.now(), reviewCount: 0 },
          { id: 'c2', front: 'dog', back: 'con chó', example: 'I have a dog.', image: '', level: 0, nextReview: Date.now(), reviewCount: 0 },
          { id: 'c3', front: 'elephant', back: 'con voi', example: 'Elephants are big.', image: '', level: 0, nextReview: Date.now(), reviewCount: 0 }
        ]
      },
      {
        id: 'deck2',
        name: 'Trái cây',
        cards: [
          { id: 'c4', front: 'apple', back: 'quả táo', example: 'An apple a day.', image: '', level: 0, nextReview: Date.now(), reviewCount: 0 },
          { id: 'c5', front: 'banana', back: 'quả chuối', example: 'I like bananas.', image: '', level: 0, nextReview: Date.now(), reviewCount: 0 }
        ]
      }
    ];
  }

  function loadDecksSync() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveDecks(decks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }

  function addDeck(name) {
    const decks = loadDecksSync();
    const newDeck = {
      id: Date.now().toString(),
      name: name,
      cards: []
    };
    decks.push(newDeck);
    saveDecks(decks);
    return newDeck;
  }

  function updateDeckName(deckId, newName) {
    const decks = loadDecksSync();
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      deck.name = newName;
      saveDecks(decks);
    }
  }

  function deleteDeck(deckId) {
    let decks = loadDecksSync();
    decks = decks.filter(d => d.id !== deckId);
    saveDecks(decks);
  }

  function addCardToDeck(deckId, cardData) {
    const decks = loadDecksSync();
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      const newCard = {
        id: Date.now().toString(),
        front: cardData.front,
        back: cardData.back,
        example: cardData.example || '',
        image: cardData.image || '',
        level: 0,
        nextReview: Date.now(),
        reviewCount: 0
      };
      deck.cards.push(newCard);
      saveDecks(decks);
      return newCard;
    }
    return null;
  }

  function updateCard(deckId, cardId, updatedFields) {
    const decks = loadDecksSync();
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      const card = deck.cards.find(c => c.id === cardId);
      if (card) {
        Object.assign(card, updatedFields);
        saveDecks(decks);
      }
    }
  }

  function deleteCard(deckId, cardId) {
    const decks = loadDecksSync();
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      deck.cards = deck.cards.filter(c => c.id !== cardId);
      saveDecks(decks);
    }
  }

  function exportData() {
    return JSON.stringify(loadDecksSync(), null, 2);
  }

  // Sinh id duy nhất khi dữ liệu import thiếu id. crypto.randomUUID()
  // khi trình duyệt hỗ trợ; fallback kết hợp Date.now() + số ngẫu nhiên
  // để tránh trùng khi nhiều thẻ được chuẩn hoá liên tiếp trong 1ms.
  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8);
  }

  // Chuẩn hoá 1 card từ dữ liệu import: điền field thiếu (id, level,
  // nextReview, reviewCount, example, image) về giá trị mặc định giống
  // hệt addCardToDeck()/getDefaultDecks(), để mọi chỗ khác trong app
  // (renderCardsForManage, study.js, quiz.js...) không gặp undefined.
  // Trả về null nếu thiếu front/back — đây là dữ liệu cốt lõi bắt buộc,
  // thẻ không có thì vô nghĩa, nên bị loại thay vì nhét rỗng vào deck.
  function normalizeCard(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const front = typeof raw.front === 'string' ? raw.front.trim() : '';
    const back = typeof raw.back === 'string' ? raw.back.trim() : '';
    if (!front || !back) return null;
    return {
      id: raw.id || generateId(),
      front,
      back,
      example: typeof raw.example === 'string' ? raw.example : '',
      image: typeof raw.image === 'string' ? raw.image : '',
      level: typeof raw.level === 'number' && !isNaN(raw.level) ? raw.level : 0,
      nextReview: typeof raw.nextReview === 'number' && !isNaN(raw.nextReview) ? raw.nextReview : Date.now(),
      reviewCount: typeof raw.reviewCount === 'number' && !isNaN(raw.reviewCount) ? raw.reviewCount : 0,
    };
  }

  // Chuẩn hoá 1 deck: điền id thiếu, chuẩn hoá từng card bên trong,
  // loại card lỗi. Trả về null nếu deck không có tên hợp lệ.
  function normalizeDeck(raw, skippedCounter) {
    if (!raw || typeof raw !== 'object') return null;
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) return null;
    const rawCards = Array.isArray(raw.cards) ? raw.cards : [];
    const cards = [];
    rawCards.forEach(rawCard => {
      const card = normalizeCard(rawCard);
      if (card) {
        cards.push(card);
      } else {
        skippedCounter.count++;
      }
    });
    return { id: raw.id || generateId(), name, cards };
  }

  function importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('Sai định dạng: cần một mảng các bộ thẻ');

      const skippedCounter = { count: 0 };
      const decks = parsed
        .map(rawDeck => normalizeDeck(rawDeck, skippedCounter))
        .filter(deck => deck !== null);

      if (decks.length === 0) {
        return { success: false, deckCount: 0, skippedCount: skippedCounter.count };
      }

      saveDecks(decks);
      return { success: true, deckCount: decks.length, skippedCount: skippedCounter.count };
    } catch (e) {
      console.error(e);
      return { success: false, deckCount: 0, skippedCount: 0 };
    }
  }

  return { initialize, loadDecksSync, saveDecks, addDeck, updateDeckName, deleteDeck, addCardToDeck, updateCard, deleteCard, exportData, importData };
})();
