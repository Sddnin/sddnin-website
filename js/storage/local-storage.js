'use strict';

const Storage = {
  _key: APP.storageKey,

  _getDefault() {
    return {
      user: null,
      progress: {
        xp: 0,
        level: 1,
        streak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        totalStudyMinutes: 0,
        dailyGoal: JSON.parse(JSON.stringify(DAILY_GOALS_DEFAULT))
      },
      vocabulary: {
        learned: {},
        favorites: [],
        difficult: [],
        srs: {},
        history: []
      },
      grammar: {
        completed: [],
        scores: {},
        history: []
      },
      reading: { completed: [], scores: {} },
      listening: { completed: [], scores: {} },
      speaking: { sessions: [] },
      writing: { submissions: [] },
      achievements: [],
      mistakes: { vocabulary: [], grammar: [] },
      settings: {
        theme: 'dark',
        language: 'vi',
        dailyGoalMinutes: 30,
        soundEnabled: true,
        showRomanization: false,
        cardsPerSession: 20
      }
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return this._getDefault();
      return this._deepMerge(this._getDefault(), JSON.parse(raw));
    } catch (e) {
      console.error('Storage.load error:', e);
      return this._getDefault();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this._key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage.save error:', e);
      Toast.error('Không thể lưu dữ liệu. Bộ nhớ có thể đã đầy.');
    }
  },

  get(path) {
    if (!path) return this.load();
    const data = this.load();
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, data);
  },

  set(path, value) {
    const data = this.load();
    const keys = path.split('.');
    let cur = data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
    this.save(data);
    return data;
  },

  clear() {
    localStorage.removeItem(this._key);
  },

  exportAll() {
    return JSON.stringify(this.load(), null, 2);
  },

  importAll(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (typeof imported !== 'object') throw new Error('Invalid format');
      const merged = this._deepMerge(this._getDefault(), imported);
      this.save(merged);
      return { success: true, data: merged };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
      ) {
        result[key] = this._deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
};
