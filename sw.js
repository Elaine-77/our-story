// Service Worker for Our Story - 离线缓存
const CACHE_NAME = 'our-story-v1';
const ASSETS_TO_CACHE = [
  './',
  './sample-game.html',
  './manifest.json',
  './icon-512.jpg',
];

// 安装时缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：优先缓存，回退网络
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 缓存命中，直接返回
      if (cachedResponse) {
        return cachedResponse;
      }

      // 缓存未命中，从网络获取
      return fetch(event.request)
        .then((response) => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 复制响应并缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 网络失败，尝试返回缓存的 sample-game.html
          if (event.request.destination === 'document') {
            return caches.match('./sample-game.html');
          }
        });
    })
  );
});
