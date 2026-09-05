const CACHE="ai-nova-v2";

const FILES=[
"./",
"./index.html",
"./assets/app.js",
"./assets/style.css",
"./assets/icon.svg",
"./assets/img-ai.svg",
"./assets/img-android.svg",
"./assets/img-guide.svg",
"./assets/img-security.svg",
"./manifest.webmanifest"
];

self.addEventListener("install",event=>{
event.waitUntil(
caches.open(CACHE).then(cache=>cache.addAll(FILES))
);
self.skipWaiting();
});

self.addEventListener("activate",event=>{
event.waitUntil(
caches.keys().then(keys=>
Promise.all(
keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
)
)
);
self.clients.claim();
});

self.addEventListener("fetch",event=>{
if(event.request.method!=="GET")return;

event.respondWith(
caches.match(event.request).then(cached=>{
return cached || fetch(event.request).then(response=>{
const copy=response.clone();
caches.open(CACHE).then(cache=>cache.put(event.request,copy));
return response;
}).catch(()=>caches.match("./index.html"));
})
);
});
