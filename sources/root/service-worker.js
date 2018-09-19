const CACHE = 'cache-v1.1.0';

// List all static ressources that will be cached.
var staticAssets = [
  'index.html',
  'assets/img/qrcode.jpg',
  'assets/fonts/OpenSans/opensans-light-webfont.woff2',
  'assets/fonts/OpenSans/opensans-regular-webfont.woff2'
];

var staticAssetsDev = [
  'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
  'assets/css/common.css',
  'assets/css/features.css',
  'assets/js/score.config.js',
  'assets/js/score.db.js',
  'assets/js/score.ui.js',
  'assets/js/score.players.js',
  'assets/js/score.js'
];

var staticAssetsProd = [
  'https://cdn.jsdelivr.net/npm/vue',
  'assets/css/common.min.css',
  'assets/css/features.min.css',
  'assets/js/script.min.js',
];


// Determine if it's dev environnement.
var env = 'prod';
if (self.location.hostname.indexOf('localhost') !== -1) {
  env = 'dev';
}

// Build cache list.
var staticAssetsToCache = staticAssets.concat(staticAssetsProd);
if (env == 'dev') {
  staticAssetsToCache = staticAssets.concat(staticAssetsDev);
}


// Install is triggered the first time the user hits the page.
// It cache statics files.
self.addEventListener('install', function(event) {

  event.waitUntil(
    caches.open(CACHE).then(function(cache) {

      // addAll() will fail if one ressource or more is not reachable.
      return cache.addAll(staticAssetsToCache);

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



