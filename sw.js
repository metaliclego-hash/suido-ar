'use strict';

let pipeGLB = null;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'STORE_GLB') {
    pipeGLB = event.data.buffer;
    if (event.ports.length > 0) {
      event.ports[0].postMessage({ ok: true });
    }
  }
});

self.addEventListener('fetch', event => {
  const { pathname } = new URL(event.request.url);
  if (pathname.endsWith('/pipe.glb') && pipeGLB) {
    event.respondWith(
      new Response(pipeGLB, {
        status: 200,
        headers: {
          'Content-Type': 'model/gltf-binary',
          'Cache-Control': 'no-store, no-cache',
          'Content-Length': String(pipeGLB.byteLength),
        },
      })
    );
  }
});
