const scope = new URL(self.registration.scope);
const cachePrefix = `lifesaver:${scope.pathname}:`;
const cacheName = `${cachePrefix}57`;
const assets = [
  'phone-placement.jpeg',
  'recorded-voice.js?v=55',
  'app.js?v=56',
  'recorded-voice.js',
  'instructor-voice-01.mp3?v=55',
  'instructor-voice-02.mp3?v=55',
  'instructor-voice-03.mp3?v=55',
  'instructor-voice-04.mp3?v=55',
  'instructor-voice-05.mp3?v=55',
  'instructor-voice-06.mp3?v=55',
  'instructor-voice-07.mp3?v=55',
  'instructor-voice-08.mp3?v=55',
  'instructor-voice-09.mp3?v=55',
  'instructor-voice-10.mp3?v=55',
  'instructor-voice-11.mp3?v=55',
  'instructor-voice-12.mp3?v=55',
  'instructor-voice-13.mp3?v=55',
  'instructor-voice-14.mp3?v=55',
  'instructor-voice-15.mp3?v=55',
  'instructor-voice-16.mp3?v=55',
  'instructor-voice-17.mp3?v=55',
  'instructor-voice-18.mp3?v=55',
  'instructor-voice-19.mp3?v=55',
  'instructor-voice-20.mp3?v=55',
  'instructor-voice-21.mp3?v=55',
  'instructor-voice-22.mp3?v=55',
  'instructor-voice-23.mp3?v=55',
  'instructor-voice-24.mp3?v=55',
  'instructor-voice-25.mp3?v=55',
  'instructor-voice-phone.mp3?v=55',
  'references.js',
  'teaching-aed-clear.webp',
  'teaching-cpr-team.webp',
  'teaching-pressure-warm.webp',
  'teaching-fracture-support.webp',
  'cpr-motion.js',
  'cpr-feedback.js',
  'vision_LICENSE.txt',
  'vision_NOTICE.txt',
  'dual-tracking.js',
  'tracking-worker.js',
  'pose_landmarker_lite.task',
  'hand_landmarker.task',
  'vision_bundle.mjs',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_internal.js',
  'vision_wasm_nosimd_internal.wasm',
  'index.html',
  'bls.js',
  'aed-pads.svg',
  'signal.js',
  'clinical.js',
  'cpr-visual.webp',
  'hands-off-visual.webp',
  'questions.json',
  'scenarios.json',
  'sources.json',
  'manifest.webmanifest',
  'icon.svg',
  'hands-to-hearts-logo.jpeg',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'reference-burns.webp',
  'reference-choking.webp',
  'reference-seizures.webp',
  'reference-allergy.webp',
  'reference-wounds.webp',
  'reference-fracture.webp',
  'reference-recognize.webp',
  'reference-pressure.webp',
  'reference-packing.webp',
  'reference-tourniquet.webp',
  'reference-infant-choking.webp',
];

self.addEventListener('install', event => {
  const requests = assets.map(path => new Request(new URL(path, scope), { cache: 'no-cache' }));
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(requests))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) {
    return;
  }

  const isAppNavigation = request.mode === 'navigate' &&
    (url.pathname === scope.pathname || url.pathname === new URL('index.html', scope).pathname);
  const resource = isAppNavigation ? new URL('index.html', scope) : request;
  const network = isAppNavigation ? fetch(request, { cache: 'no-cache' }) : fetch(request);

  event.respondWith(network.catch(async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(resource) || Response.error();
  }));
});
