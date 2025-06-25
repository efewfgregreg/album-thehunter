const CACHE_NAME = 'album-thehunter-cache-v2'; // Mudei a versão para forçar a atualização
const URLS_TO_CACHE = [
    './',
    'index.html',
    'script.js',
    'manifest.json',
    'animais/placeholder.png',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
];

// Instala o service worker e armazena os arquivos essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto e arquivos essenciais salvos na v2.');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Estratégia: Network First (Tenta buscar na rede primeiro, se falhar, usa o cache)
// Isso é melhor para o desenvolvimento, pois você sempre verá as últimas alterações.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Limpa caches antigos
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});