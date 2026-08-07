// storage.js - Quản lý toàn bộ LocalStorage
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

  // --- Theme ---
  function saveTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  }
  function getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'auto';
  }

  // --- Favorites ---
  function getFavorites() {
    return JSON.parse(localStorage.getItem(KEYS.FAVORITES) || '[]');
  }
  function addFavorite(id) {
    const favs = getFavorites();
    if (!favs.includes(id)) {
      favs.push(id);
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    }
  }
  function removeFavorite(id) {
    const favs = getFavorites().filter(i => i !== id);
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
  }
  function isFavorite(id) {
    return getFavorites().includes(id);
  }
  function toggleFavorite(id) {
    isFavorite(id) ? removeFavorite(id) : addFavorite(id);
  }

  // --- Known words ---
  function getKnownWords() {
    return JSON.parse(localStorage.getItem(KEYS.KNOWN) || '[]');
  }
  function addKnown(id) {
    const known = getKnownWords();
    if (!known.includes(id)) {
      known.push(id);
      localStorage.setItem(KEYS.KNOWN, JSON.stringify(known));
    }
  }
  function removeKnown(id) {
    const known = getKnownWords().filter(i => i !== id);
    localStorage.setItem(KEYS.KNOWN, JSON.stringify(known));
  }
  function isKnown(id) {
    return getKnownWords().includes(id);
  }

  // --- Difficult words ---
  function getDifficultWords() {
    return JSON.parse(localStorage.getItem(KEYS.DIFFICULT) || '[]');
  }
  function addDifficult(id) {
    const diff = getDifficultWords();
    if (!diff.includes(id)) {
      diff.push(id);
      localStorage.setItem(KEYS.DIFFICULT, JSON.stringify(diff));
    }
  }
  function removeDifficult(id) {
    const diff = getDifficultWords().filter(i => i !== id);
    localStorage.setItem(KEYS.DIFFICULT, JSON.stringify(diff));
  }
  function isDifficult(id) {
    return getDifficultWords().includes(id);
  }

  // --- Progress ---
  function getProgress() {
    return JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '{"cardsReviewed":0,"lastStudyDate":null,"streak":0}');
  }
  function updateProgress(cardsReviewed) {
    const progress = getProgress();
    progress.cardsReviewed = cardsReviewed;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (progress.lastStudyDate === yesterday) {
      progress.streak++;
    } else if (progress.lastStudyDate !== today) {
      progress.streak = 1;
    }
    progress.lastStudyDate = today;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  }

  // --- SRS Data (Spaced Repetition) ---
  function getSRSData() {
    return JSON.parse(localStorage.getItem(KEYS.SRS_DATA) || '{}');
  }
  function saveSRSData(data) {
    localStorage.setItem(KEYS.SRS_DATA, JSON.stringify(data));
  }

  // --- Custom Vocabulary ---
  function getCustomVocab() {
    return JSON.parse(localStorage.getItem(KEYS.CUSTOM_VOCAB) || '[]');
  }
  function addCustomWord(word) {
    const words = getCustomVocab();
    word.id = Date.now(); // tạo id duy nhất
    words.push(word);
    localStorage.setItem(KEYS.CUSTOM_VOCAB, JSON.stringify(words));
  }
  function removeCustomWord(id) {
    const words = getCustomVocab().filter(w => w.id !== id);
    localStorage.setItem(KEYS.CUSTOM_VOCAB, JSON.stringify(words));
  }

  // --- Export / Import toàn bộ dữ liệu ---
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
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  return {
    saveTheme,
    getTheme,
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getKnownWords,
    addKnown,
    removeKnown,
    isKnown,
    getDifficultWords,
    addDifficult,
    removeDifficult,
    isDifficult,
    getProgress,
    updateProgress,
    getSRSData,
    saveSRSData,
    getCustomVocab,
    addCustomWord,
    removeCustomWord,
    exportAll,
    importAll
  };
})();
