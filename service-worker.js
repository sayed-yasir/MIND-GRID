// Network-first for our own files (updates arrive automatically), cache as offline fallback.
const C='mindgrid6-v4',F=['./','index.html','css/main.css','css/animations.css','manifest.json','assets/icons/icon.svg','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/icon-maskable-512.png','assets/icons/apple-touch-icon.png','js/app.js','js/engine/engine.js','js/engine/levelgen.js','js/engine/sequence.js','js/engine/difficulty.js','js/systems/flow.js','js/systems/daily.js','js/systems/audio.js','js/data/worlds.js','js/managers/save.js','js/managers/stats.js','js/managers/achievements.js','js/utils/rng.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
 e.respondWith(fetch(q,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(q,c))}return r})
  .catch(()=>caches.match(q).then(r=>r||(q.mode==='navigate'?caches.match('index.html'):Response.error()))))});
