// Service worker minimo: serve a mostrare le notifiche di sistema degli avvisi
// della watchlist (su Android e nelle PWA `new Notification()` non è disponibile)
// e ad aprire la scheda del titolo al tocco.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = (event.notification.data && event.notification.data.url) || '/';

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
			for (const client of windows) {
				if ('focus' in client) {
					client.navigate(url).catch(() => {});
					return client.focus();
				}
			}
			return self.clients.openWindow(url);
		})
	);
});
