/* The Offline Project's keeper: the hall, its pictures and icons are kept when it is installed, and each app the
   first time it is opened (with the files it reads later), so the whole site opens again with no connection. A new build
   brings a new name, and the old keep is let go. The site of four apps and the site of three can live at one address (the
   second in a folder of the first): each keeps under a name of its own (4 or 3) and lets go only its own older keeps, and
   those of the builds before the names had a number of apps in them. */
const CACHE = "offline-project-3-1080-656-6.9.2", MINE = "offline-project-3-";
const WITH = {};
const SHELL = ["./", "index.html", "manifest.webmanifest", "assets/icons/favicon.ico", "assets/icons/shield-32.png", "assets/icons/shield-192.png", "assets/icons/shield-512.png", "assets/icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith(MINE) || /^offline-project-\d{3,}-/.test(k)) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url), home = new URL("./", self.registration.scope).pathname; if (u.origin !== location.origin || !u.pathname.startsWith(home)) return;
  const also = WITH[u.pathname.slice(home.length)];
  if (also) e.waitUntil(caches.open(CACHE).then(c => Promise.all(also.map(f => c.match(f).then(h => h || c.add(f).catch(() => {}))))));
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => c.match("index.html")))));
});
