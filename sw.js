const CACHE_NAME = "ai-nova-v3";

const CORE = ["./", "./index.html", "./about.html", "./privacy.html", "./manifest.webmanifest", "./assets/style.css", "./assets/app.js", "./assets/icon.svg", "./assets/img-ai.svg", "./assets/img-android.svg", "./assets/img-guide.svg", "./assets/img-security.svg", "./articles/choose-ai-tool/", "./articles/android-productivity/", "./articles/free-digital-tools/", "./articles/ai-free-workflows/", "./articles/android-privacy/", "./articles/build-resource/", "./articles/ai-hallucinations/", "./articles/prompt-engineering-basics/", "./articles/cloud-vs-ondevice-ai/", "./articles/android-battery-myths/", "./articles/android-app-permissions/", "./articles/android-home-screen-organization/", "./articles/clear-documentation-guide/", "./articles/content-calendar-system/", "./articles/evaluate-online-tools/", "./articles/two-factor-authentication/", "./articles/recognizing-phishing/", "./articles/password-manager-basics/", "./articles/ai-hallucinations/", "./articles/prompt-engineering-basics/", "./articles/cloud-vs-ondevice-ai/", "./articles/android-battery-myths/", "./articles/android-app-permissions/", "./articles/android-home-screen-organization/", "./articles/clear-documentation-guide/", "./articles/content-calendar-system/", "./articles/evaluate-online-tools/", "./articles/two-factor-authentication/", "./articles/recognizing-phishing/", "./articles/password-manager-basics/"];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(CORE))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                const copy = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, copy);
                });

                return response;
            }).catch(() => caches.match("./"));
        })
    );
});
