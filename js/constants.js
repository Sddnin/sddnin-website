'use strict';

const APP = {
  name: 'EnglishFlow',
  version: '2.0.0',
  storageKey: 'englishflow_data',
  usersKey: 'englishflow_users'
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

const CEFR_DESCRIPTIONS = {
  A1: 'Beginner — Mới bắt đầu',
  A2: 'Elementary — Sơ cấp',
  B1: 'Intermediate — Trung cấp',
  B2: 'Upper Intermediate — Trung cấp cao',
  C1: 'Advanced — Nâng cao'
};

const CEFR_COLORS = {
  A1: '#22c55e',
  A2: '#3b82f6',
  B1: '#8b5cf6',
  B2: '#f59e0b',
  C1: '#ef4444'
};

const XP_VALUES = {
  vocabulary: 5,
  flashcard: 3,
  grammar: 10,
  reading: 15,
  listening: 15,
  speaking: 20,
  writing: 20,
  game: 10,
  dailyGoal: 20
};

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1850,
  2350, 2900, 3500, 4200, 5000, 5900, 6900,
  8000, 9200, 10500, 12000, 13500
];

const ROUTES = {
  login: '/login',
  register: '/register',
  home: '/home',
  vocabulary: '/vocabulary',
  vocabularyDetail: '/vocabulary/:id',
  flashcards: '/flashcards',
  grammar: '/grammar',
  grammarDetail: '/grammar/:id',
  reading: '/reading',
  readingDetail: '/reading/:id',
  listening: '/listening',
  listeningDetail: '/listening/:id',
  speaking: '/speaking',
  writing: '/writing',
  practice: '/practice',
  aiTutor: '/ai-tutor',
  progress: '/progress',
  profile: '/profile',
  settings: '/settings'
};

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home', route: '/home' },
  { icon: '📚', label: 'Vocabulary', route: '/vocabulary' },
  { icon: '📖', label: 'Grammar', route: '/grammar' },
  { icon: '🎧', label: 'Listening', route: '/listening' },
  { icon: '📰', label: 'Reading', route: '/reading' },
  { icon: '🎮', label: 'Practice', route: '/practice' },
  { icon: '🤖', label: 'AI Tutor', route: '/ai-tutor' },
  { icon: '📊', label: 'Progress', route: '/progress' }
];

const MOBILE_NAV_ITEMS = [
  { icon: '🏠', label: 'Home', route: '/home' },
  { icon: '📚', label: 'Learn', route: '/vocabulary' },
  { icon: '🎮', label: 'Practice', route: '/practice' },
  { icon: '🤖', label: 'AI', route: '/ai-tutor' },
  { icon: '👤', label: 'Profile', route: '/profile' }
];

const TOPICS = [
  'Daily Life', 'Family', 'School', 'Education', 'Work',
  'Travel', 'Food', 'Health', 'Shopping', 'Technology',
  'Environment', 'Relationships', 'Emotions', 'Business', 'Society'
];

const DAILY_GOALS_DEFAULT = {
  vocabulary: { label: 'Vocabulary', unit: 'words', target: 20, completed: 0, date: null },
  grammar: { label: 'Grammar', unit: 'lessons', target: 1, completed: 0, date: null },
  listening: { label: 'Listening', unit: 'min', target: 10, completed: 0, date: null },
  speaking: { label: 'Speaking', unit: 'min', target: 5, completed: 0, date: null }
};

const ACHIEVEMENTS_DEF = [
  { id: 'first_day', icon: '🔥', title: 'First Day', desc: 'Hoàn thành ngày đầu tiên' },
  { id: 'streak_7', icon: '🔥', title: '7 Day Streak', desc: 'Duy trì 7 ngày liên tiếp' },
  { id: 'streak_30', icon: '🔥', title: '30 Day Streak', desc: 'Duy trì 30 ngày liên tiếp' },
  { id: 'vocab_100', icon: '📚', title: '100 Words', desc: 'Học 100 từ vựng' },
  { id: 'vocab_500', icon: '📚', title: '500 Words', desc: 'Học 500 từ vựng' },
  { id: 'vocab_1000', icon: '📚', title: '1000 Words', desc: 'Học 1000 từ vựng' },
  { id: 'first_listening', icon: '🎧', title: 'First Listening', desc: 'Hoàn thành bài nghe đầu tiên' },
  { id: 'first_speaking', icon: '🗣️', title: 'First Speaking', desc: 'Hoàn thành bài nói đầu tiên' },
  { id: 'first_writing', icon: '✍️', title: 'First Writing', desc: 'Hoàn thành bài viết đầu tiên' },
  { id: 'complete_a1', icon: '🏆', title: 'Complete A1', desc: 'Hoàn thành cấp độ A1' },
  { id: 'complete_a2', icon: '🏆', title: 'Complete A2', desc: 'Hoàn thành cấp độ A2' }
];