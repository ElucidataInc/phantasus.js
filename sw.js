var CACHE_NAME = 'phantasus';
var CACHED_FILES = [
	'css/phantasus-latest.min.css',
	'fonts/FontAwesome.otf',
	'fonts/fontawesome-webfont.eot',
	'fonts/fontawesome-webfont.svg',
	'fonts/fontawesome-webfont.ttf',
	'fonts/fontawesome-webfont.woff',
	'fonts/fontawesome-webfont.woff2',
	'js/phantasus-external-latest.min.js',
	'js/phantasus-latest.min.js',
	'/',
	'index.html',
	'favicon.ico'
];
self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			cache.addAll(CACHED_FILES);
		})
	);
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.match(event.request).then(function (cachedResponse) {
				if (cachedResponse) {
					// try to get an updated version
					return fetch(event.request.clone()).then(function (response) {
						cache.put(event.request, response.clone());
						return response;
					}).catch(function () {
						return cachedResponse;
					})
				} else {
					return fetch(event.request).then(function (response) {
						return response;
					});
				}
			}).catch(function (error) {
				// This catch() will handle exceptions that arise from the match() or fetch() operations.
				// Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
				// It will return a normal response object that has the appropriate error code set.
				throw error;
			});
		})
	);
});
