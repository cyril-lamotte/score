var CACHE_NAME = 'v1';
var urlsToCache = [
  'index.html',
  'assets/css/style.css',
  'assets/js/app.js',
  'assets/js/app.config.js',
  'assets/js/lib/jquery.min.js',
  'assets/js/app.config.js',
  'assets/js/custom/global.js',
  'assets/js/custom/ui.js',
  'assets/js/custom/db.js',
  'assets/img/qrcode.jpg',
  'assets/fonts/OpenSans/opensans-light-webfont.woff2',
  'assets/fonts/OpenSans/opensans-regular-webfont.woff2'
];



self.addEventListener('install', function(event) {
  //console.log('Service Worker installing.');
  //debugger;
  event.waitUntil(enableCache());
});

self.addEventListener('activate', function(event) {
  //console.log('Service Worker activating.');
});


self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});


var enableCache = function() {

  caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(urlsToCache);
  });

};

