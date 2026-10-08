// Ajudante do app (service worker): guarda a página do portal para abrir mais rápido
// e mostrar a tela mesmo com a internet fraca. Os dados (servidor do Google) nunca ficam guardados aqui.
const VERSAO = 'portal-locacao-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone-192.png', './icone-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(chaves => Promise.all(chaves.filter(k => k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Sempre tenta a internet primeiro (assim o portal fica sempre atualizado); sem internet, usa a cópia guardada
self.addEventListener('fetch', e => {
  const pedido = e.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(pedido).then(resposta => {
      const copia = resposta.clone();
      caches.open(VERSAO).then(c => c.put(pedido, copia));
      return resposta;
    }).catch(() => caches.match(pedido).then(r => r || caches.match('./index.html')))
  );
});
