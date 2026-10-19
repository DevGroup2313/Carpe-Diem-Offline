/* The Offline Project's keeper: the hall, its pictures and icons are kept when it is installed, and each app the
   first time it is opened (with the files it reads later), so the whole site opens again with no connection. A new build
   brings a new name, and the old keep is let go. */
const CACHE = "offline-project-1058-641-5.9-7.49";
const WITH = {"apps/inkwell.html": ["apps/vendor/scowl-words.txt", "apps/vendor/verb-form-vocab.txt", "apps/vendor/wordnet-lex.txt", "apps/vendor/citeproc.js", "apps/vendor/pdf.min.js", "apps/vendor/pdf.worker.min.js", "apps/vendor/csl/apa.csl", "apps/vendor/csl/chicago-author-date.csl", "apps/vendor/csl/chicago-notes-bibliography.csl", "apps/vendor/csl/harvard-cite-them-right.csl", "apps/vendor/csl/ieee.csl", "apps/vendor/csl/locales-en-GB.xml", "apps/vendor/csl/locales-en-US.xml", "apps/vendor/csl/mhra-notes.csl", "apps/vendor/csl/modern-language-association.csl", "apps/vendor/csl/nature.csl", "apps/vendor/csl/oscola-no-ibid.csl", "apps/vendor/csl/oscola.csl"]};
const SHELL = ["./", "index.html", "manifest.webmanifest", "assets/icons/favicon.ico", "assets/icons/shield-32.png", "assets/icons/shield-192.png", "assets/icons/shield-512.png", "assets/icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("offline-project-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url), home = new URL("./", self.registration.scope).pathname; if (u.origin !== location.origin || !u.pathname.startsWith(home)) return;
  const also = WITH[u.pathname.slice(home.length)];
  if (also) e.waitUntil(caches.open(CACHE).then(c => Promise.all(also.map(f => c.match(f).then(h => h || c.add(f).catch(() => {}))))));
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => c.match("index.html")))));
});
