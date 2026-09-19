/* eslint-disable no-restricted-globals */
// Service Worker do love2 — recebe push notifications e faz clique abrir a rota certa.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'love2', body: event.data.text() };
  }
  const title = payload.title || 'love2';
  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge.png',
    tag: payload.tag || 'love2',
    data: { url: payload.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((all) => {
      const client = all.find((c) => 'focus' in c);
      if (client) {
        client.focus();
        client.navigate(targetUrl);
        return;
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
