'use strict';

// 動的に生成した GLB を保持し、/pipe.glb へのリクエストに返す Service Worker

let glbBuffer = null;

// インストール後すぐに有効化
self.addEventListener('install',  e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// メインページから GLB データを受け取る
self.addEventListener('message', e => {
  if (e.data?.type === 'SET_GLB') {
    glbBuffer = e.data.buffer;
  }
});

// pipe.glb へのリクエストを横取りして GLB を返す
self.addEventListener('fetch', e => {
  const path = new URL(e.request.url).pathname;
  if (path.endsWith('/pipe.glb')) {
    if (glbBuffer) {
      e.respondWith(new Response(glbBuffer.slice(0), {
        status: 200,
        headers: {
          'Content-Type': 'model/gltf-binary',
          'Cache-Control': 'no-store'
        }
      }));
    } else {
      e.respondWith(new Response('GLB not ready', { status: 503 }));
    }
  }
});
