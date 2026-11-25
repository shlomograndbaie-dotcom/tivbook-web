// TiVBook web app (iPhone "Add to Home Screen"): shows notifications sent by the casino.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let m = { title: "TI VEGAS", body: "", urgent: false, data: {} };
  try { m = { ...m, ...event.data.json() }; } catch { if (event.data) m.body = event.data.text(); }
  event.waitUntil((async () => {
    await self.registration.showNotification(m.title, {
      body: m.body, icon: "icon-192.png", badge: "icon-192.png", tag: m.urgent ? "place-available" : undefined,
      renotify: !!m.urgent, requireInteraction: !!m.urgent, data: m.data,
    });
    // An open app refreshes at once (offer, booking, message).
    for (const c of await self.clients.matchAll({ type: "window", includeUncontrolled: true })) c.postMessage({ type: "tivbook:refresh" });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (all.length) { await all[0].focus(); all[0].postMessage({ type: "tivbook:refresh" }); return; }
    await self.clients.openWindow("./");
  })());
});
