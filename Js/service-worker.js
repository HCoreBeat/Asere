// service-worker.js
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://asereshops.com') // Cambia a la URL de tu página web
    );
});
