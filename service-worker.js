/* Doodle Line — minimal offline cache */
'use strict';

const CACHE_PREFIX = 'doodle-line-offline-';
const CACHE_NAME = CACHE_PREFIX + 'v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_SHELL);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestURL = new URL(request.url);
  if (requestURL.origin !== self.location.origin) return;

  /*
   * Pages: use the network when available so online updates are picked up,
   * then fall back to the cached one-file app when offline.
   */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (!response || !response.ok) return response;
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then(function (cache) {
              return cache.put('./index.html', copy);
            })
            .then(function () {
              return response;
            });
        })
        .catch(function () {
          return caches.match('./index.html')
            .then(function (cached) {
              return cached || Response.error();
            });
        })
    );
    return;
  }

  /* Static same-origin files: cache first, refresh quietly when online. */
  event.respondWith(
    caches.match(request, { ignoreSearch: true })
      .then(function (cached) {
        const refresh = fetch(request)
          .then(function (response) {
            if (!response || !response.ok) return response;
            const copy = response.clone();
            return caches.open(CACHE_NAME)
              .then(function (cache) {
                return cache.put(request, copy);
              })
              .then(function () {
                return response;
              });
          })
          .catch(function () {
            return cached || Response.error();
          });

        return cached || refresh;
      })
  );
});
