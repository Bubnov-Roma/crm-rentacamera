self.addEventListener('push', function (event) {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'rentacamera-notification',
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-view-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-close-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});