// xLoader Bug-Reproduktion: DOM-Medien-Extraktion + Fortschrittsbedingung
// Extrahiert den ECHTEN Code aus xLoader.user.js und testet ihn mit einem DOM-Mock.
// Aufruf: node dom-media-test.js [Pfad zu xLoader.user.js]
'use strict';
const fs = require('fs');
const path = require('path');

const SRC_PATH = process.argv[2] || path.join(__dirname, '..', 'xLoader.user.js');
const SRC = fs.readFileSync(SRC_PATH, 'utf8');

// ---- Funktions-Bereich DOM-Medien-Extraktion extrahieren ----
const start = SRC.indexOf('// ============================ DOM-Medien-Extraktion');
const end = SRC.indexOf('// ============================ X-API (Video-/GIF-URLs)');
if (start < 0 || end < 0) { console.error('Bereich nicht gefunden'); process.exit(1); }
const fnBlock = SRC.slice(start, end);

// ---- CONFIG-Mock (nur die vom Block benötigten Teile) ----
const CONFIG = {
  mediaSelectors: ['img', 'video', 'source'],
  containerSelector: [
    '[data-testid="videoPlayer"]',
    '[data-testid="videoComponent"]',
    '[data-testid="tweetPhoto"]',
    '[data-testid="tweetVideo"]'
  ].join(','),
  dataUrlAttrs: ['data-src', 'data-url', 'data-image-url', 'data-video-url', 'data-media-url']
};

// ---- Mini-DOM ----
class El {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.children = [];
    this.parent = null;
    this._src = attrs.src || '';
    this._srcset = attrs.srcset || '';
    this.src = this._src;      // Browser-Property (img.src liefert absolute URL)
    this.currentSrc = this._src;
  }
  append(child) { child.parent = this; this.children.push(child); return child; }
  getAttribute(name) {
    if (name === 'src') return this._src || null;
    if (name === 'srcset') return this._srcset || null;
    return (name in this.attrs) ? String(this.attrs[name]) : null;
  }
  matches(sel) { return matchSel(this, sel); }
  closest(sel) {
    let n = this;
    while (n) { if (matchSel(n, sel)) return n; n = n.parent; }
    return null;
  }
  querySelectorAll(sel) {
    const out = [];
    (function walk(n) { for (const c of n.children) { if (matchSel(c, sel)) out.push(c); walk(c); } })(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

function matchSel(el, sel) {
  // Komma-Selektoren (z. B. 'img,video,source') — OR-Verknüpfung
  if (sel.includes(',')) return sel.split(',').some(s => matchSel(el, s.trim()));
  sel = sel.trim();
  // 'tag[attr="val"]' — einfache Form, reicht für unsere Selektoren
  const m = sel.match(/^([a-z]+)?(\[[a-z-]+(?:="[^"]*")?\])?$/i);
  if (!m) return false;
  if (m[1] && el.tagName !== m[1].toUpperCase()) return false;
  if (m[2]) {
    const am = m[2].match(/^\[([a-z-]+)(?:="([^"]*)")?\]$/i);
    if (!am) return false;
    const v = el.getAttribute(am[1]);
    if (v === null) return false;
    if (am[2] !== undefined && v !== am[2]) return false;
  }
  return true;
}

// ---- DOM-Fabriken ----
function img(src, srcset) { return new El('img', { src, srcset }); }
function div(testid) { return new El('div', { 'data-testid': testid }); }
function article() { return new El('article', { 'data-testid': 'tweet' }); }

// Struktur A: typischer X.com-Tweet — Medien liegen IM inneren div[data-testid="tweet"]
function buildTweetA() {
  const outer = article();
  const inner = div('tweet');
  outer.append(inner);
  const userName = div('User-Name');
  inner.append(userName);
  userName.append(img('https://pbs.twimg.com/profile_images/123/avatar.jpg')); // Avatar
  inner.append(div('tweetText'));
  const photo = div('tweetPhoto');
  inner.append(photo);
  photo.append(img('https://pbs.twimg.com/media/ABC.jpg?format=jpg&name=large',
    'https://pbs.twimg.com/media/ABC.jpg?format=jpg&name=900x900 900w, https://pbs.twimg.com/media/ABC.jpg?name=orig 4096w'));
  return outer;
}

// Struktur B: Quoted-Tweet — inneres article mit eigenem Bild
function buildTweetB() {
  const outer = article();
  const inner = div('tweet');
  outer.append(inner);
  inner.append(div('tweetText'));
  const photo = div('tweetPhoto');
  inner.append(photo);
  photo.append(img('https://pbs.twimg.com/media/OUTER.jpg?format=jpg&name=large'));
  const quoted = article(); // eingebetteter Tweet
  outer.append(quoted);
  const qPhoto = div('tweetPhoto');
  quoted.append(qPhoto);
  qPhoto.append(img('https://pbs.twimg.com/media/QUOTED.jpg?format=jpg&name=large'));
  return outer;
}

// ---- Eval des Original-Codes ----
const sandbox = { CONFIG };
eval(fnBlock + '\n; globalThis.__api = { extractDomMedia, findMediaElement, isMediaUrl, normalizeMediaUrl, bestImageUrl };');
const { extractDomMedia, findMediaElement, isMediaUrl, normalizeMediaUrl } = globalThis.__api;

// ---- Tests ----
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (cond ? '' : '  => ' + detail));
  if (!cond) failures++;
}

// 1. Struktur A: Medien-URL des eigenen Tweets muss gefunden werden
const tA = buildTweetA();
const domA = extractDomMedia(tA);
check('A: extractDomMedia liefert Medien-URL des eigenen Tweets', domA.length === 1 && /name=orig/.test(domA[0]),
  'erhalten: ' + JSON.stringify(domA));
check('A: Avatar wird NICHT geladen', domA.every(u => u.indexOf('profile_images') === -1),
  'Avatar fälschlich enthalten: ' + JSON.stringify(domA));

// 2. Struktur B: Quoted-Tweet-Bild soll NICHT in die Medien des äußeren Tweets
const tB = buildTweetB();
const domB = extractDomMedia(tB);
check('B: Quoted-Bild (eingebettetes article) wird ausgeschlossen', domB.every(u => u.indexOf('QUOTED') === -1),
  'Quoted-Bild enthalten: ' + JSON.stringify(domB));
check('B: Äußeres Bild wird gefunden', domB.length >= 1 && domB[0].indexOf('OUTER') !== -1,
  'erhalten: ' + JSON.stringify(domB));

// 3. normalizeMediaUrl: m3u8 nicht anfassen, GIF-Thumb -> MP4
check('normalizeMediaUrl: tweet_video_thumb -> echte MP4',
  normalizeMediaUrl('https://pbs.twimg.com/tweet_video_thumb/XYZ?format=jpg') ===
    'https://video.twimg.com/tweet_video/XYZ.mp4');
check('normalizeMediaUrl: externe URL wird abgelehnt', normalizeMediaUrl('https://example.com/x.jpg') === null);
check('normalizeMediaUrl: m3u8 bleibt unverändert (kein mp4-Umbau)',
  normalizeMediaUrl('https://video.twimg.com/ext_tw_video/123/pu/pl/abc.m3u8') ===
    'https://video.twimg.com/ext_tw_video/123/pu/pl/abc.m3u8');

// 4. Fortschrittsbedingung (Logik aus onDownloadClick, Zeile ~1283-1291)
function shouldShowProgress(ext, progress) {
  if (!progress || ext !== 'mp4') return false;
  const total = Number(progress.total);
  if (!isFinite(total) || total < 5 * 1024 * 1024) return false;
  return true;
}
check('Fortschritt: Bild (jpg) => kein Badge', shouldShowProgress('jpg', { done: 1, total: 50 * 1024 * 1024 }) === false);
check('Fortschritt: kleines Video (3 MB) => kein Badge', shouldShowProgress('mp4', { done: 1, total: 3 * 1024 * 1024 }) === false);
check('Fortschritt: großes Video (50 MB) => Badge', shouldShowProgress('mp4', { done: 1, total: 50 * 1024 * 1024 }) === true);
check('Fortschritt: Video ohne total (NaN) => kein Badge', shouldShowProgress('mp4', { done: 1 }) === false);

console.log('\n' + (failures === 0 ? 'ALLE TESTS BESTANDEN' : failures + ' TEST(S) FEHLGESCHLAGEN'));
process.exit(failures === 0 ? 0 : 1);
