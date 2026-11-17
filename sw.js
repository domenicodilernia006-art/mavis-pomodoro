const CACHE='mavis-pomodoro-ipad-pwa-10';
const ASSETS=["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./assets/mavis-ambiente.wav", "./assets/mavis-silenzio.wav", "./assets/ding.wav", "./assets/icon-512.png", "./assets/icon.png", "./assets/apple-touch-icon.png", "./assets/mavis-cartoon.webp", "./assets/mavis-original.webp", "./assets/mavis-timer.webp", "./assets/mavis.webp", "./assets/pomodoro-cartoon-base.webp", "./assets/mavis-cartoon-pomodoro.webp", "./assets/pop.wav", "./assets/whoosh.wav"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('mavis-pomodoro-')&&key!==CACHE)
        .map(key=>caches.delete(key))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>
    cached||fetch(event.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    })
  ));
});
