'use strict';

let glbBuffer = null;

self.addEventListener('install',  e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// メインページから GLB を受け取り、確認応答を返す
self.addEventListener('message', async e => {
  if (e.data?.type === 'SET_GLB') {
    glbBuffer = e.data.buffer;
    // 送り元クライアントに「受け取った」を返す
    const all = await clients.matchAll({ includeUncontrolled: true });
    all.forEach(c => c.postMessage({ type: 'GLB_READY' }));
  }
});

// /pipe.glb へのリクエストを横取り
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).pathname.endsWith('/pipe.glb')) {
    if (glbBuffer) {
      e.respondWith(new Response(glbBuffer.slice(0), {
        status: 200,
        headers: {
          'Content-Type': 'model/gltf-binary',
          'Cache-Control': 'no-store'
        }
      }));
    } else {
      e.respondWith(new Response('not ready', { status: 503 }));
    }
  }
});
