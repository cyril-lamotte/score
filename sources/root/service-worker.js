
// List all static ressources that will be cached.
var staticAssets = [
  'index.html',
  'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
  'assets/css/common.css',
  'assets/css/features.css',
  'assets/js/score.config.js',
  'assets/js/score.db.js',
  'assets/js/score.ui.js',
  'assets/js/score.players.js',
  'assets/js/score.js',
  'assets/img/qrcode.jpg',
  'assets/fonts/OpenSans/opensans-light-webfont.woff2',
  'assets/fonts/OpenSans/opensans-regular-webfont.woff2'
];

// Install is triggered the first time the user hits the page.
// It cache statics files.
self.addEventListener('install', function(event) {

  event.waitUntil(
    caches.open('cache').then(function(cache) {

      // addAll() will fail if one ressource or more is not reachable.
      return cache.addAll(staticAssets);

    })
  );

});


self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});


// Fetch is triggered for every request that is made.
// Get cached version if exist.
self.addEventListener('fetch', function(event) {

  //console.log('fetch', event.request.url);

  event.respondWith(
    caches
      .match(event.request)
      .then(function(response) {

        if (!response) {
          console.log('Not cached :', event.request.url);
        }

        return response || fetch(event.request);

      })
  );

});



