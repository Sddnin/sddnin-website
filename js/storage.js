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

  function importData(jsonString) {
    try {
      const decks = JSON.parse(jsonString);
      if (!Array.isArray(decks)) throw new Error('Sai định dạng');
      saveDecks(decks);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  return { initialize, loadDecksSync, saveDecks, addDeck, updateDeckName, deleteDeck, addCardToDeck, updateCard, deleteCard, exportData, importData };
})();
