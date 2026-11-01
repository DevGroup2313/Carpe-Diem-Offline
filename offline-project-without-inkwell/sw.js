/* The Offline Project's keeper: the hall, its pictures and icons are kept when it is installed, and each app the
   first time it is opened (with the files it reads later), so the whole site opens again with no connection. A new build
   brings a new name, and the old keep is let go. The site of four apps and the site of three can live at one address (the
   second in a folder of the first): each keeps under a name of its own (4 or 3) and lets go only its own older keeps, and
   those of the builds before the names had a number of apps in them. */
const CACHE = "offline-project-3-1080-656-6.9.3-353964fa", MINE = "offline-project-3-";
const WITH = {};
const SHELL = ["./", "index.html", "manifest.webmanifest", "assets/icons/favicon.ico", "assets/icons/shield-32.png", "assets/icons/shield-192.png", "assets/icons/shield-512.png", "assets/icons/apple-touch-icon.png",
  "assets/icons/favicon-dark.ico", "assets/icons/shield-dark-32.png", "assets/icons/shield-dark-192.png", "assets/icons/shield-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
/* a new build takes over at once; and a page still showing an older build (kept by an older keeper) is opened again, so
   nobody stays on an old hall whose apps the host no longer has */
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => { const old = ks.filter(k => (k.startsWith(MINE) || /^offline-project-\d{3,}-/.test(k)) && k !== CACHE);
  return Promise.all(old.map(k => caches.delete(k))).then(() => self.clients.claim()).then(() => { if (old.length) reopen(); }); })); });
/* the pages are opened again only once this keeper is active (a page's request waits for that, so the activation must
   not wait for the page) */
function reopen() { setTimeout(() => self.clients.matchAll({ type: "window" }).then(cs => cs.forEach(c => { if (c.frameType !== "nested") c.navigate(c.url).catch(() => {}); })), 50); }
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url), home = new URL("./", self.registration.scope).pathname; if (u.origin !== location.origin || !u.pathname.startsWith(home)) return;
  // the hall itself (and its manifest) comes from the host first whenever there is a connection, and from the keep without one
  if (u.pathname === home || u.pathname === home + "index.html" || u.pathname === home + "manifest.webmanifest") {
    e.respondWith(fetch(r, { cache: "no-cache" }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(h => h || c.match("index.html")))));
    return;
  }
  const also = WITH[u.pathname.slice(home.length)];
  if (also) e.waitUntil(caches.open(CACHE).then(c => Promise.all(also.map(f => c.match(f).then(h => h || c.add(f).catch(() => {}))))));
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => c.match("index.html")))));
});
