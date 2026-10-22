// Cross Stats の Service Worker
// - ページ本体 (HTML) やアイコン等のハッシュ無しファイルはネットワーク優先: 更新をすぐ反映し、オフライン時のみキャッシュを返す
// - assets/ 配下のハッシュ付き JS / CSS / フォント等はキャッシュ優先: 2 回目以降の表示を高速化
// キャッシュ名を上げると古いチャンクはまとめて削除される
const PREFIX = 'cross-stats-';
const CACHE = `${PREFIX}v2`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', './index.html']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  // 同じオリジン (<user>.github.io) の他アプリのキャッシュは消さないよう、自分の接頭辞のものだけ削除する
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

const put = (key, res) => {
  if (!res.ok) return;
  const copy = res.clone();
  caches.open(CACHE).then((cache) => cache.put(key, copy));
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          put('./index.html', res);
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  const hashed = url.pathname.includes('/assets/');
  if (!hashed) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          put(req, res);
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          put(req, res);
          return res;
        }),
    ),
  );
});
