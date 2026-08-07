// sw.js
const CACHE_NAME = 'korean-flashcard-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/pages/home.html',
  '/pages/flashcard.html',
  '/pages/review.html',
  '/pages/hanja.html',
  '/pages/grammar.html',
  '/pages/quiz.html',
  '/pages/add-word.html',
  '/pages/stats.html',
  '/assets/css/style.css',
  '/assets/css/flashcard.css',
  '/assets/css/animation.css',
  '/assets/css/responsive.css',
  '/assets/css/quiz.css',
  '/assets/css/stats.css',
  '/assets/js/app.js',
  '/assets/js/flashcard.js',
  '/assets/js/review.js',
  '/assets/js/hanja.js',
  '/assets/js/grammar.js',
  '/assets/js/search.js',
  '/assets/js/theme.js',
  '/assets/js/storage.js',
  '/assets/js/srs.js',
  '/assets/js/quiz.js',
  '/assets/js/add-word.js',
  '/assets/js/stats.js',
  '/assets/js/pwa.js',
  '/assets/js/voice-flip.js',
  '/assets/data/vocabulary.json',
  '/assets/data/hanja.json',
  '/assets/data/grammar.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
