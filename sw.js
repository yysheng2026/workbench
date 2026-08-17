// 个人工作台 PWA service worker —— network-first 导航 + cache-first 同源静态 + 跨域放行 + mp4 断点续传(206)
const CACHE = 'wb-pwa-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// 媒体文件（mp4）断点续传：Cloudflare Pages 不支持 Range，iOS Safari 必须 206 才能播放。
// 这里从缓存/网络拿到完整文件，再按请求的 Range 切片返回 206。
async function serveMedia(req, cacheName) {
  const cache = await caches.open(cacheName);
  let resp = await cache.match(req);
  if (!resp) {
    try {
      resp = await fetch(req);
      if (resp && resp.ok) cache.put(req, resp.clone());
    } catch (_) {}
  }
  if (!resp || !resp.ok) {
    return new Response('媒体文件离线不可用', { status: 504, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const buf = await resp.arrayBuffer();
  const total = buf.byteLength;
  const ctype = resp.headers.get('Content-Type') || 'video/mp4';
  const range = req.headers.get('Range');
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = (m && m[1]) ? parseInt(m[1], 10) : 0;
    let end = (m && m[2]) ? parseInt(m[2], 10) : total - 1;
    if (isNaN(start)) start = 0;
    if (isNaN(end) || end >= total) end = total - 1;
    if (start > end || start >= total) {
      return new Response('', { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
    }
    const slice = buf.slice(start, end + 1);
    return new Response(slice, {
      status: 206,
      headers: {
        'Content-Type': ctype,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': slice.byteLength,
        'Cache-Control': 'no-cache'
      }
    });
  }
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': ctype,
      'Accept-Ranges': 'bytes',
      'Content-Length': total,
      'Cache-Control': 'no-cache'
    }
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 跨域（Google Fonts / JSONBin）不缓存，直接放行

  // mp4 走断点续传处理，iOS Safari 才能播放
  if (url.pathname.endsWith('.mp4')) {
    e.respondWith(serveMedia(req, CACHE));
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req, {cache:'reload'});
        const c = await caches.open(CACHE);
        c.put('./index.html', res.clone());
        return res;
      } catch (_) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const c = await caches.open(CACHE);
      c.put(req, res.clone());
      return res;
    } catch (_) {
      return cached || new Response('', { status: 504 });
    }
  })());
});
