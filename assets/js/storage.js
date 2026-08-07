const StorageManager = (() => {
  const KEYS = {
    THEME: 'kf_theme',
    FAVORITES: 'kf_fav',
    KNOWN: 'kf_known',
    DIFFICULT: 'kf_diff',
    PROGRESS: 'kf_progress',
    SRS_DATA: 'kf_srs',
    CUSTOM_VOCAB: 'kf_custom_vocab'
  };

  // Theme
  function saveTheme(t) { localStorage.setItem(KEYS.THEME, t); }
  function getTheme() { return localStorage.getItem(KEYS.THEME) || 'auto'; }

  // Favorites
  function getFavorites() { return JSON.parse(localStorage.getItem(KEYS.FAVORITES) || '[]'); }
  function addFavorite(id) { const arr = getFavorites(); if (!arr.includes(id)) { arr.push(id); localStorage.setItem(KEYS.FAVORITES, JSON.stringify(arr)); } }
  function removeFavorite(id) { const arr = getFavorites().filter(i => i !== id); localStorage.setItem(KEYS.FAVORITES, JSON.stringify(arr)); }
  function isFavorite(id) { return getFavorites().includes(id); }
  function toggleFavorite(id) { isFavorite(id) ? removeFavorite(id) : addFavorite(id); }

  // Known
  function getKnownWords() { return JSON.parse(localStorage.getItem(KEYS.KNOWN) || '[]'); }
  function addKnown(id) { const arr = getKnownWords(); if (!arr.includes(id)) { arr.push(id); localStorage.setItem(KEYS.KNOWN, JSON.stringify(arr)); } }
  function removeKnown(id) { const arr = getKnownWords().filter(i => i !== id); localStorage.setItem(KEYS.KNOWN, JSON.stringify(arr)); }
  function isKnown(id) { return getKnownWords().includes(id); }

  // Difficult
  function getDifficultWords() { return JSON.parse(localStorage.getItem(KEYS.DIFFICULT) || '[]'); }
  function addDifficult(id) { const arr = getDifficultWords(); if (!arr.includes(id)) { arr.push(id); localStorage.setItem(KEYS.DIFFICULT, JSON.stringify(arr)); } }
  function removeDifficult(id) { const arr = getDifficultWords().filter(i => i !== id); localStorage.setItem(KEYS.DIFFICULT, JSON.stringify(arr)); }
  function isDifficult(id) { return getDifficultWords().includes(id); }

  // Progress
  function getProgress() { return JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '{"cardsReviewed":0,"lastStudyDate":null,"streak":0}'); }
  function updateProgress(cards) {
    const p = getProgress();
    p.cardsReviewed = cards;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now()-864e5).toDateString();
    if (p.lastStudyDate === yesterday) p.streak++;
    else if (p.lastStudyDate !== today) p.streak = 1;
    p.lastStudyDate = today;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(p));
  }

  // SRS Data
  function getSRSData() { return JSON.parse(localStorage.getItem(KEYS.SRS_DATA) || '{}'); }
  function saveSRSData(data) { localStorage.setItem(KEYS.SRS_DATA, JSON.stringify(data)); }

  // Custom Vocabulary
  function getCustomVocab() { return JSON.parse(localStorage.getItem(KEYS.CUSTOM_VOCAB) || '[]'); }
  function addCustomWord(word) {
    const arr = getCustomVocab();
    word.id = Date.now(); // unique id
    arr.push(word);
    localStorage.setItem(KEYS.CUSTOM_VOCAB, JSON.stringify(arr));
  }
  function removeCustomWord(id) {
    const arr = getCustomVocab().filter(w => w.id !== id);
    localStorage.setItem(KEYS.CUSTOM_VOCAB, JSON.stringify(arr));
  }

  // Import/Export all data
  function exportAll() {
    const data = {
      theme: getTheme(),
      favorites: getFavorites(),
      known: getKnownWords(),
      difficult: getDifficultWords(),
      progress: getProgress(),
      srs: getSRSData(),
      customVocab: getCustomVocab()
    };
    return JSON.stringify(data, null, 2);
  }
  function importAll(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.theme) saveTheme(data.theme);
      if (data.favorites) localStorage.setItem(KEYS.FAVORITES, JSON.stringify(data.favorites));
      if (data.known) localStorage.setItem(KEYS.KNOWN, JSON.stringify(data.known));
      if (data.difficult) localStorage.setItem(KEYS.DIFFICULT, JSON.stringify(data.difficult));
      if (data.progress) localStorage.setItem(KEYS.PROGRESS, JSON.stringify(data.progress));
      if (data.srs) localStorage.setItem(KEYS.SRS_DATA, JSON.stringify(data.srs));
      if (data.customVocab) localStorage.setItem(KEYS.CUSTOM_VOCAB, JSON.stringify(data.customVocab));
      return true;
    } catch(e) { return false; }
  }

  return { saveTheme, getTheme, getFavorites, addFavorite, removeFavorite, isFavorite, toggleFavorite,
           getKnownWords, addKnown, removeKnown, isKnown,
           getDifficultWords, addDifficult, removeDifficult, isDifficult,
           getProgress, updateProgress,
           getSRSData, saveSRSData,
           getCustomVocab, addCustomWord, removeCustomWord,
           exportAll, importAll };
})();
