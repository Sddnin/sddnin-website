// sw.js - Service Worker cho Korean Flashcard Hub
const CACHE_NAME = 'korean-flashcard-v3';
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, ''); // lấy base path động

const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/pages/home.html`,
  `${BASE_PATH}/pages/flashcard.html`,
  `${BASE_PATH}/pages/review.html`,
  `${BASE_PATH}/pages/hanja.html`,
  `${BASE_PATH}/pages/grammar.html`,
  `${BASE_PATH}/pages/quiz.html`,
  `${BASE_PATH}/pages/add-word.html`,
  `${BASE_PATH}/pages/stats.html`,
  `${BASE_PATH}/assets/css/base/variables.css`,
  `${BASE_PATH}/assets/css/base/reset.css`,
  `${BASE_PATH}/assets/css/base/typography.css`,
  `${BASE_PATH}/assets/css/layout/header.css`,
  `${BASE_PATH}/assets/css/layout/footer.css`,
  `${BASE_PATH}/assets/css/components/card.css`,
  `${BASE_PATH}/assets/css/components/button.css`,
  `${BASE_PATH}/assets/css/utilities/animations.css`,
  `${BASE_PATH}/assets/css/utilities/responsive.css`,
  `${BASE_PATH}/assets/css/pages/flashcard.css`,
  `${BASE_PATH}/assets/css/pages/quiz.css`,
  `${BASE_PATH}/assets/css/pages/stats.css`,
  `${BASE_PATH}/assets/js/core/app.js`,
  `${BASE_PATH}/assets/js/core/storage.js`,
  `${BASE_PATH}/assets/js/modules/theme.js`,
  `${BASE_PATH}/assets/js/modules/voice.js`,
  `${BASE_PATH}/assets/js/modules/srs.js`,
  `${BASE_PATH}/assets/js/modules/search.js`,
  `${BASE_PATH}/assets/js/modules/pwa.js`,
  `${BASE_PATH}/assets/js/pages/flashcard.js`,
  `${BASE_PATH}/assets/js/pages/review.js`,
  `${BASE_PATH}/assets/js/pages/hanja.js`,
  `${BASE_PATH}/assets/js/pages/grammar.js`,
  `${BASE_PATH}/assets/js/pages/quiz.js`,
  `${BASE_PATH}/assets/js/pages/add-word.js`,
  `${BASE_PATH}/assets/js/pages/stats.js`,
  `${BASE_PATH}/assets/js/utils/helpers.js`,
  `${BASE_PATH}/assets/data/vocabulary.json`,
  `${BASE_PATH}/assets/data/hanja.json`,
  `${BASE_PATH}/assets/data/grammar.json`
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

// Fetch (cache first, network fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});