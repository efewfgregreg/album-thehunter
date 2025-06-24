// Define um nome e a versão do cache
const CACHE_NAME = 'album-thehunter-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline
const URLS_TO_CACHE = [
  './',
  'index.html',
  'script.js',
  'manifest.json',
  'animais/placeholder.png', // Adicionando o placeholder ao cache
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Evento 'install' - é acionado quando o PWA é instalado
self.addEventListener('install', (event) => {
  // Espera até que o cache seja aberto e todos os arquivos sejam armazenados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto e arquivos essenciais salvos.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch' - é acionado para cada requisição que a página faz
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Tenta encontrar o recurso no cache primeiro
    caches.match(event.request)
      .then((response) => {
        // Se encontrar no cache, retorna o arquivo do cache
        if (response) {
          return response;
        }
        // Se não encontrar, busca na rede
        return fetch(event.request);
      })
  );
});