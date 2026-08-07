// === FILE: storage.js ===
// Quản lý LocalStorage: Progress, Favorite, Settings

const StorageManager = (function() {
    'use strict';

    const STORAGE_KEYS = {
        THEME: 'korean-flashcard-theme',
        FAVORITES: 'korean-flashcard-favorites',
        KNOWN_WORDS: 'korean-flashcard-known',
        DIFFICULT_WORDS: 'korean-flashcard-difficult',
        PROGRESS: 'korean-flashcard-progress',
        SETTINGS: 'korean-flashcard-settings'
    };

    // === Theme ===
    function saveTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }

    function getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    }

    // === Favorites ===
    function getFavorites() {
        const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return data ? JSON.parse(data) : [];
    }

    function addFavorite(wordId) {
        const favorites = getFavorites();
        if (!favorites.includes(wordId)) {
            favorites.push(wordId);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        }
    }

    function removeFavorite(wordId) {
        const favorites = getFavorites().filter(id => id !== wordId);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }

    function isFavorite(wordId) {
        return getFavorites().includes(wordId);
    }

    function toggleFavorite(wordId) {
        if (isFavorite(wordId)) {
            removeFavorite(wordId);
            return false;
        } else {
            addFavorite(wordId);
            return true;
        }
    }

    // === Known Words ===
    function getKnownWords() {
        const data = localStorage.getItem(STORAGE_KEYS.KNOWN_WORDS);
        return data ? JSON.parse(data) : [];
    }

    function addKnownWord(wordId) {
        const known = getKnownWords();
        if (!known.includes(wordId)) {
            known.push(wordId);
            localStorage.setItem(STORAGE_KEYS.KNOWN_WORDS, JSON.stringify(known));
        }
        // Nếu từ đã thuộc thì xóa khỏi danh sách từ khó
        removeDifficultWord(wordId);
    }

    function removeKnownWord(wordId) {
        const known = getKnownWords().filter(id => id !== wordId);
        localStorage.setItem(STORAGE_KEYS.KNOWN_WORDS, JSON.stringify(known));
    }

    function isKnown(wordId) {
        return getKnownWords().includes(wordId);
    }

    // === Difficult Words ===
    function getDifficultWords() {
        const data = localStorage.getItem(STORAGE_KEYS.DIFFICULT_WORDS);
        return data ? JSON.parse(data) : [];
    }

    function addDifficultWord(wordId) {
        const difficult = getDifficultWords();
        if (!difficult.includes(wordId)) {
            difficult.push(wordId);
            localStorage.setItem(STORAGE_KEYS.DIFFICULT_WORDS, JSON.stringify(difficult));
        }
    }

    function removeDifficultWord(wordId) {
        const difficult = getDifficultWords().filter(id => id !== wordId);
        localStorage.setItem(STORAGE_KEYS.DIFFICULT_WORDS, JSON.stringify(difficult));
    }

    function isDifficult(wordId) {
        return getDifficultWords().includes(wordId);
    }

    // === Progress ===
    function getProgress() {
        const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        return data ? JSON.parse(data) : {
            totalCards: 0,
            cardsReviewed: 0,
            lastStudyDate: null,
            streak: 0
        };
    }

    function updateProgress(cardsReviewed) {
        const progress = getProgress();
        progress.cardsReviewed = cardsReviewed;
        
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (progress.lastStudyDate === yesterday) {
            progress.streak += 1;
        } else if (progress.lastStudyDate !== today) {
            progress.streak = 1;
        }
        
        progress.lastStudyDate = today;
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }

    function resetProgress() {
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.KNOWN_WORDS);
        localStorage.removeItem(STORAGE_KEYS.DIFFICULT_WORDS);
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    }

    // === Settings ===
    function getSettings() {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            autoPlay: false,
            shuffleMode: false,
            cardsPerSession: 20
        };
    }

    function saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    // === Export ===
    return {
        saveTheme,
        getTheme,
        getFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        getKnownWords,
        addKnownWord,
        removeKnownWord,
        isKnown,
        getDifficultWords,
        addDifficultWord,
        removeDifficultWord,
        isDifficult,
        getProgress,
        updateProgress,
        resetProgress,
        getSettings,
        saveSettings
    };
})();
