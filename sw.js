/*
   CARPE DIEM  |  Copyright (c) 2026 Yannie D. Forest. All rights reserved.
   NO LICENCE IS GRANTED. No copying, adaptation, redistribution, reverse
   engineering or commercial use without the author's written permission.
   See LICENCE.txt. Every distributed copy carries a build marker.
*/
const CACHE = "carpe-diem-demo-committee-v202610181052";
// this keeper's own name without its build number: only stores that begin
// with it are this keeper's older versions
const OWN = CACHE.replace(/v\d+$/, "");
const ASSETS = [
  "./index.html", "TERMS.md", "LICENCE.txt", "robots.txt", "favicon.ico","./manifest.webmanifest",
  "./icons/icon-192.png","./icons/icon-512.png","./icons/icon-512-maskable.png",
  "./icons/icon-256.png","./icons/icon-384.png","./icons/apple-touch-icon.png",
  "./icons/icon-180.png","./icons/icon-167.png","./icons/icon-152.png",
  "./icons/icon-120.png","./icons/icon-32.png","./icons/icon-16.png", "favicon.ico?v=1050", "./icons/icon-192.png?v=1050", "./icons/icon-512.png?v=1050", "./icons/icon-512-maskable.png?v=1050", "./icons/icon-256.png?v=1050", "./icons/icon-384.png?v=1050", "./icons/apple-touch-icon.png?v=1050", "favicon-dark.ico", "./icons/icon-dark-32.png", "./icons/icon-dark-180.png", "./icons/icon-dark-192.png", "./icons/icon-dark-512.png", "favicon.ico?v=1052", "favicon-dark.ico?v=1052", "./icons/icon-32.png?v=1052", "./icons/icon-dark-32.png?v=1052", "./icons/icon-192.png?v=1052", "./icons/icon-dark-192.png?v=1052", "./icons/icon-512.png?v=1052", "./icons/icon-dark-512.png?v=1052", "./icons/apple-touch-icon.png?v=1052", "./icons/icon-dark-180.png?v=1052"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  // Only this edition's own older stores are cleared: Scriba keeps Whisper in
  // stores of its own (build 1044), and the writing model in another (build
  // 1046); clearing those would throw the downloads away with every new build.
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf(OWN) === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const req = e.request;
  // Requests to other sites (Whisper's first fetch, look-ups in Fontes) pass
  // straight through; Scriba keeps its own copy of what it needs.
  if (new URL(req.url).origin !== self.location.origin) return;
  const isDoc = req.mode === "navigate" || req.destination === "document" || /index\.html$|\/$/.test(req.url);
  if (isDoc) {
    // Network-first for the app page, so a new build loads as soon as it is reachable; fall back to cache when offline.
    e.respondWith(
      fetch(req).then(resp => {
        try { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } catch (_) {}
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
  } else {
    // Cache-first for static icons and assets.
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(resp => {
        try { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } catch (_) {}
        return resp;
      }))
    );
  }
});
