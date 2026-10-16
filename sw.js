/* KoBo – service worker : fonctionnement hors ligne + rappel du soir */
const CACHE = 'kobo-v7';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/logo.png', '/icons/emblem.png',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/icons/favicon-64.png', '/icons/badge-96.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return; // jamais de cache pour l'API
  // pages : réseau d'abord (pour avoir la dernière version), cache si hors ligne
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put('/', r.clone())); return r; })
      .catch(() => caches.match('/').then(r => r || caches.match('/index.html'))));
    return;
  }
  // fichiers (icônes, polices) : cache d'abord, mise à jour en arrière-plan
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});

/* notification du soir */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'KoBo', {
    body: d.body || 'Comment s\u2019est passée ta journée sportive ? Note ta séance ou débriefe ton combat.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: 'kobo-recap',
    renotify: true,
    data: { url: d.url || '/?recap=1' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/?recap=1';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if (new URL(c.url).origin === location.origin) { c.postMessage({ type: 'recap' }); return c.focus(); }
    }
    return self.clients.openWindow(target);
  }));
});
