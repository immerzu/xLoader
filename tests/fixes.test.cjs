// xLoader — gezielter Fixtest für die Befunde aus HANDOVER_v1.0.23 §12.
// Extrahiert die echten Funktionsblöcke aus xLoader.user.js und prüft sie mit
// leichtgewichtigem DOM-/Performance-Mock. Kein Browser, kein Netz.
// Aufruf: node fixes-test.js [Pfad zu xLoader.user.js]
// Erwartung: gegen v1.0.23 (unbehoben) ROT, gegen die lokale Fixfassung GRÜN.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC_PATH = process.argv[2] || path.join(__dirname, '..', 'xLoader.user.js');
const SRC = fs.readFileSync(SRC_PATH, 'utf8');

function slice(from, to) {
  const a = SRC.indexOf(from);
  const b = a < 0 ? -1 : SRC.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error('Marker nicht gefunden: ' + from + ' / ' + to);
  return SRC.slice(a, b);
}

// ---- CONFIG-Mock (nur benötigte Felder) ----
const CONFIG = {
  mediaSelectors: ['img', 'video', 'source'],
  tweetSelector: 'article[data-testid="tweet"]',
  containerSelector: '[data-testid="videoPlayer"],[data-testid="videoComponent"],[data-testid="tweetPhoto"],[data-testid="tweetVideo"]',
  dataUrlAttrs: ['data-src', 'data-url', 'data-image-url', 'data-video-url', 'data-media-url'],
  btnAttribute: 'data-xloader',
  recheckDelayMs: 2000,
  cacheTtlMs: 5 * 60 * 1000,
  maxParallelPrefetch: 3,
  maxPrefetchQueue: 30,
  maxCacheEntries: 200,
  maxPrefetchSeenEntries: 500,
  performanceEntryMaxAgeMs: 30000,
  requestTimeoutMs: 60000
};

// ---- Stubs für Nachbarfunktionen ----
const log = { info() {}, warn() {}, error() {} };
function createButton() { return null; }            // Aktionsleiste fehlt
function observeForPrefetch() {}
const runningDownloadsByTweet = new Map();
function bindRunningDownloadButton(task, btn) { task.reboundButton = btn; }
const runningDownloads = new WeakMap();
function detachRunningDownloadButton(task, btn) { task.detachedButton = btn; runningDownloads.delete(btn); }
let apiResponse = { media: [{ url: 'https://pbs.twimg.com/media/API.jpg?name=orig', ext: 'jpg' }] };
function fetchTweetData() { return Promise.resolve({}); }
function parseApiData() { return apiResponse; }
function renderedTweetMedia() { return []; } // Isolierter Legacy-Fix-Harness; echte Props separat getestet.
function ensureNotCancelled(signal) { if (signal && signal.aborted) throw new Error('abgebrochen'); }
function abortableDelay(ms) { return new Promise(resolve => realSetTimeout(resolve, ms)); }
function isCancellation(err, signal) { return !!(signal && signal.aborted) || !!(err && err.name === 'AbortError'); }

// ---- Timer: kurze Delays (Poll-Schleife) echt, lange Delays nur registriert ----
const realSetTimeout = global.setTimeout;
const longTimers = [];
global.setTimeout = function (fn, ms) {
  if (ms >= 1000) { longTimers.push({ fn, ms }); return longTimers.length; }
  return realSetTimeout(fn, ms);
};
function drainLongTimers(ms) {
  let guard = 0;
  for (;;) {
    const idx = longTimers.findIndex(t => t.ms === ms);
    if (idx < 0 || guard++ > 20) return;
    longTimers.splice(idx, 1)[0].fn();
  }
}

// ---- Performance-Mock: pro Zyklus (clearResourceTimings) ist der 1. Abruf leer ----
const perfEntries = [
  'https://video.twimg.com/amplify_video/ID1/vid/avc1/1280x720/a.mp4',
  'https://video.twimg.com/amplify_video/ID2/vid/avc1/1920x1080/b.mp4'
];
const perf = {
  entries: perfEntries,
  totalCalls: 0,
  cycleCalls: 0,
  clears: 0,
  clearResourceTimings() { this.clears++; this.cycleCalls = 0; },
  getEntriesByType() {
    this.totalCalls++;
    this.cycleCalls++;
    return this.cycleCalls >= 2 ? this.entries.map(n => ({ name: n })) : [];
  },
  getEntriesByName() { return []; }
};
Object.defineProperty(globalThis, 'performance', { value: perf, configurable: true, writable: true });

// ---- Mini-DOM ----
class El {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.children = [];
    this.parent = null;
    this.dataset = {};
    this.isConnected = true;
    this.style = {};
    this._src = attrs.src || '';
    this._srcset = attrs.srcset || '';
    this.src = this._src;
    this.currentSrc = this._src;
    this.clicked = 0;
  }
  append(child) { child.parent = this; this.children.push(child); return child; }
  getAttribute(name) {
    if (name === 'src') return this._src || null;
    if (name === 'srcset') return this._srcset || null;
    return (name in this.attrs) ? String(this.attrs[name]) : null;
  }
  matches(sel) { return matchSel(this, sel); }
  closest(sel) { let n = this; while (n) { if (matchSel(n, sel)) return n; n = n.parent; } return null; }
  querySelectorAll(sel) {
    const out = [];
    (function walk(n) { for (const c of n.children) { if (matchSel(c, sel)) out.push(c); walk(c); } })(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  click() { this.clicked++; }
}

function matchSel(el, sel) {
  sel = sel.trim();
  if (sel.includes(',')) return sel.split(',').some(s => matchSel(el, s));
  if (sel.includes(' ')) {
    const parts = sel.split(/\s+/);
    const last = parts.pop();
    if (!matchSel(el, last)) return false;
    const ancestor = parts[parts.length - 1];
    let n = el.parent;
    while (n) { if (matchSel(n, ancestor)) return true; n = n.parent; }
    return false;
  }
  const m = sel.match(/^([a-z*]+)?(\[([a-z-]+)(?:(\^?=|\*=)"([^"]*)")?\])?$/i);
  if (!m) return false;
  if (m[1] && m[1] !== '*' && el.tagName !== m[1].toUpperCase()) return false;
  if (m[3]) {
    const v = el.getAttribute(m[3]);
    if (v === null) return false;
    if (m[5] !== undefined) {
      if (m[4] === '^=') return v.indexOf(m[5]) === 0;
      if (m[4] === '*=') return v.indexOf(m[5]) >= 0;
      return v === m[5];
    }
  }
  return true;
}

// ---- DOM-Fabriken ----
const img = (src, srcset) => new El('img', { src, srcset });
const div = testid => new El('div', { 'data-testid': testid });
const article = () => new El('article', { 'data-testid': 'tweet' });
const link = href => new El('a', { href });
const photo = () => new El('div', { 'data-testid': 'tweetPhoto' });

// ---- Funktionsblöcke aus dem Skript extrahieren und evaluieren ----
const B_dom = slice('// ============================ DOM-Medien-Extraktion', '// ============================ X-API');
const B_names = slice('function getHandle(tweet)', 'function sanitizeFilenamePart');
const B_names2 = slice('function sanitizeFilenamePart', '// ============================ Download-Mechanismus');
const B_merge = slice('function normBase(url)', 'async function loadItemsLive');
const B_prefetch = slice('// Cache: tweetId -> { items', '// ============================ Metadaten');
const B_scan = slice('// Maximale Anzahl Medien-Rechecks pro Tweet', 'function scanInitial');

eval([B_dom, B_names, B_names2, B_merge, B_prefetch, B_scan].join('\n') + `
;globalThis.__x = {
  extractDomMedia, findMediaElement, hasMediaIndicator, getHandle, getTweetId,
  extFromUrl, mediaIdOf, normBase, mergeDomItems,
  prefetch, failPrefetch, prefetchSeen, prefetchRetries, mediaCache,
  getCachedItems, prefetchQueue, processTweet, runningDownloadsByTweet, runningDownloads
};`);
const X = globalThis.__x;

// ---- Prüfrahmen ----
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (cond ? '' : '  => ' + detail));
  if (!cond) failures++;
}
const sleep = ms => new Promise(r => realSetTimeout(r, ms));

(async function main() {
  // ===== F1: getHandle bei quoted Tweet =====
  const outer = article();
  const outerName = div('User-Name');
  outerName.append(link('/outer_user'));
  outer.append(outerName);
  const quoted = article();
  const qName = div('User-Name');
  qName.append(link('/quoted_user'));
  quoted.append(qName);
  const qPhoto = photo();
  qPhoto.append(img('https://pbs.twimg.com/media/Q1.jpg?format=jpg&name=large'));
  quoted.append(qPhoto);
  outer.append(quoted);
  check('F1 getHandle: Medien im quoted Tweet => Autor des quoted Tweets',
    X.getHandle(outer) === 'quoted_user', 'erhalten: ' + X.getHandle(outer));
  const plain = article();
  const pName = div('User-Name');
  pName.append(link('/plain_user'));
  plain.append(pName);
  const pPhoto = photo();
  pPhoto.append(img('https://pbs.twimg.com/media/P1.jpg?format=jpg&name=large'));
  plain.append(pPhoto);
  check('F1b getHandle: normaler Tweet => eigener Autor',
    X.getHandle(plain) === 'plain_user', 'erhalten: ' + X.getHandle(plain));

  // ===== F2: processTweet plant Recheck, wenn die Aktionsleiste fehlt =====
  longTimers.length = 0;
  const late = plain; // Medien vorhanden, createButton liefert null (Stub)
  X.processTweet(late);
  const immediateTimers = longTimers.filter(t => t.ms === 2000).length;
  drainLongTimers(2000);
  check('F2 processTweet: fehlende Aktionsleiste => Recheck bis MAX_TWEET_RECHECKS',
    late.dataset.xloaderRechecked === '3' && immediateTimers >= 1,
    'dataset=' + late.dataset.xloaderRechecked + ', Timer=' + immediateTimers);

  // Bereits vorhandener Button, dessen Badge durch X entfernt wurde: Zustand
  // des laufenden Tweet-Downloads muss erneut an denselben Button gebunden werden.
  const recycled = article();
  recycled.append(link('/user/status/123456789'));
  recycled.append(img('https://pbs.twimg.com/media/DOM.jpg'));
  const existingButton = new El('button', { 'data-xloader': '1' });
  recycled.append(existingButton);
  const runningTask = {};
  X.runningDownloadsByTweet.set('123456789', runningTask);
  X.processTweet(recycled);
  check('F2b processTweet: vorhandener Button erhält laufenden Zustand erneut',
    runningTask.reboundButton === existingButton, 'Button wurde nicht erneut gebunden');
  X.runningDownloadsByTweet.delete('123456789');

  const reused = article();
  reused.append(link('/user/status/987654321'));
  reused.append(img('https://pbs.twimg.com/media/REUSED.jpg'));
  const reusedButton = new El('button', { 'data-xloader': '1' });
  reused.append(reusedButton);
  const oldTask = { tweetId: '123456789' };
  X.runningDownloads.set(reusedButton, oldTask);
  X.processTweet(reused);
  check('F2c processTweet: recycelter Button löst falschen alten Tweet-Task',
    oldTask.detachedButton === reusedButton && !X.runningDownloads.has(reusedButton),
    'alter Task blieb am neuen Tweet gebunden');

  // ===== F3: failPrefetch — kein Retry bei 429/401/403, Retry bei transienten Fehlern =====
  longTimers.length = 0;
  X.prefetchSeen.add('T429');
  X.failPrefetch('T429', 'API HTTP 429', 429);
  check('F3a failPrefetch: 429 => kein Retry-Timer',
    longTimers.filter(t => t.ms === 10000).length === 0,
    'Timer: ' + longTimers.map(t => t.ms).join(','));
  longTimers.length = 0;
  X.prefetchSeen.add('TNET');
  X.failPrefetch('TNET', 'API Timeout');
  check('F3b failPrefetch: Timeout (transient) => Retry-Timer bleibt',
    longTimers.filter(t => t.ms === 10000).length === 1,
    'Timer: ' + longTimers.map(t => t.ms).join(','));

  // ===== F4: prefetchSeen nach erfolgreichem Prefetch freigeben =====
  X.prefetchSeen.add('T1');
  X.prefetchQueue.length = 0;
  await X.prefetch('T1');
  check('F4 prefetch: Erfolg => Cache gesetzt, prefetchSeen freigegeben (TTL-Neuladen möglich)',
    X.getCachedItems('T1') !== null && X.prefetchSeen.has('T1') === false,
    'cached=' + (X.getCachedItems('T1') !== null) + ', seen=' + X.prefetchSeen.has('T1'));

  // ===== F5: mergeDomItems löst mehrere Video-Poster in EINEM Poll-Zyklus auf =====
  perf.clears = 0; perf.totalCalls = 0; perf.cycleCalls = 0;
  const multi = article();
  ['ID1', 'ID2'].forEach(id => {
    const p = photo();
    const player = new El('div', { role: 'button' });
    player.append(img('https://pbs.twimg.com/amplify_video_thumb/' + id + '/img/x.jpg'));
    p.append(player);
    multi.append(p);
  });
  const merged = await X.mergeDomItems(multi, []);
  check('F5a mergeDomItems: beide Poster-MP4s aufgelöst',
    merged.length === 2 && merged.every(i => i.url.indexOf('/vid/avc1/') !== -1),
    JSON.stringify(merged));
  check('F5b mergeDomItems: ein gemeinsamer Poll-Zyklus (1 clear, 3 Abrufe einschließlich HLS-Prüfung)',
    perf.clears === 1 && perf.totalCalls === 3,
    'clears=' + perf.clears + ', calls=' + perf.totalCalls);

  // ===== F6: Dedup — Poster, dessen Video die API liefert, wird nicht erneut aufgelöst =====
  perf.clears = 0; perf.totalCalls = 0; perf.cycleCalls = 0;
  const dup = article();
  const dupPhoto = photo();
  const dupPlayer = new El('div', { role: 'button' });
  dupPlayer.append(img('https://pbs.twimg.com/amplify_video_thumb/ID1/img/x.jpg'));
  dupPhoto.append(dupPlayer);
  dup.append(dupPhoto);
  const apiItems = [{ url: perfEntries[0], ext: 'mp4' }];
  const mergedDup = await X.mergeDomItems(dup, apiItems);
  check('F6 mergeDomItems: API-Video + passender DOM-Poster => 1 Item, kein Resolver',
    mergedDup.length === 1 && perf.clears === 0,
    'items=' + mergedDup.length + ', clears=' + perf.clears);

  // ===== F7: getTweetId nimmt den Statuslink am Medien-Element (Regression) =====
  const quotedWithLink = article();
  const qName2 = div('User-Name');
  qName2.append(link('/quoted_user'));
  quotedWithLink.append(qName2);
  const qPhoto2 = photo();
  const mediaLink = link('/quoted_user/status/987654321');
  mediaLink.append(img('https://pbs.twimg.com/media/Q9.jpg?format=jpg&name=large'));
  qPhoto2.append(mediaLink);
  quotedWithLink.append(qPhoto2);
  const outer2 = article();
  const outerName2 = div('User-Name');
  outerName2.append(link('/outer_user'));
  outer2.append(outerName2);
  outer2.append(quotedWithLink);
  check('F7 getTweetId: Statuslink am Medien-Element => quoted Status-ID',
    X.getTweetId(outer2) === '987654321', 'erhalten: ' + X.getTweetId(outer2));

  // ===== F8–F10: onDownloadClick — Fehlerfreigabe, Statuszuordnung, Doppelklick =====
  const B_click = slice('function pruneTaskButtons', 'function normBase') +
    '\n' + slice('async function onDownloadClick', '// ============================ Button-Injektion');
  eval(`var saveAsMode = 'first';
async function selectDownloadFile() { return null; } // Picker tested separately
var lastApiStatus = null; // nur für die Altfassung (v1.0.23) nötig
var flashMessages = []; var downloads = [];
function setBusy(btn, busy) { btn.disabled = busy; }
function hideProgress() {}
function showProgress() {}
function flashError(btn, msg) { flashMessages.push(msg); }
function downloadUrl(url, name, saveAs, onProgress) { downloads.push(name); return Promise.resolve(); }
function hlsUrl() { return false; }
function formatFilename() { return 'f'; }
function getFilenameTemplate() { return 't'; }
function sanitizeFilenamePart(s) { return s; }
function getCachedItems() { return null; }
function broadcastFromDom() { return null; }
var mediaCache = new Map();
var prefetchSeen = new Set();
var prefetchSeenAt = new Map();
var runningDownloads = new WeakMap();
var runningDownloadsByTweet = new Map();
function setCachedItems(id, items) { mediaCache.set(String(id), { items: items, fetchedAt: Date.now() }); }
function showCancelPopup() {}
function closeCancelPopup() {}
function loadItemsLive() { return Promise.resolve({ items: [], apiStatus: 429 }); }
function mergeDomItems() { return Promise.resolve([]); }
function getTweetId() { return 'ID1'; }
function getHandle() { return 'u'; }
` + B_click + `
;globalThis.__click = {
  onDownloadClick, flashMessages, downloads,
  setLoad: function (f) { loadItemsLive = f; },
  setMerge: function (f) { mergeDomItems = f; }
};`);
  const C = globalThis.__click;
  const mkBtn = () => ({ disabled: false, title: '' });

  // F8: Ausnahme im Ablauf => Button muss freigegeben werden (finally)
  C.setMerge(function () { throw new Error('boom'); });
  C.flashMessages.length = 0;
  const b8 = mkBtn();
  try { await C.onDownloadClick({}, b8); } catch (e) { /* alter Code: Exception */ }
  check('F8 onDownloadClick: Ausnahme => Button wieder frei + "Fehler beim Laden"',
    b8.disabled === false && /^Fehler beim Laden/.test(C.flashMessages[0]),
    'disabled=' + b8.disabled + ', msg=' + C.flashMessages[0]);

  // F9: 429 aus dem Live-Abruf => Rate-Limit-Meldung, kein Download
  C.setMerge(function () { return Promise.resolve([]); });
  C.flashMessages.length = 0; C.downloads.length = 0;
  const b9 = mkBtn();
  await C.onDownloadClick({}, b9);
  check('F9 onDownloadClick: apiStatus 429 => Rate-Limit-Meldung, kein Download',
    C.flashMessages[0] === 'Rate-Limit (429) - kurz warten, dann erneut versuchen' &&
      C.downloads.length === 0 && b9.disabled === false,
    'msg=' + C.flashMessages[0] + ', downloads=' + C.downloads.length + ', disabled=' + b9.disabled);

  // F10: Doppelklick-Guard — zweiter Klick während des Laufs wird ignoriert
  C.setLoad(function () { return Promise.resolve({ items: [{ url: 'https://pbs.twimg.com/media/F10.jpg', ext: 'jpg' }], apiStatus: null }); });
  C.setMerge(function (t, items) { return Promise.resolve(items); });
  C.downloads.length = 0;
  const b10 = mkBtn();
  await Promise.all([C.onDownloadClick({}, b10), C.onDownloadClick({}, b10)]);
  check('F10 onDownloadClick: Doppelklick lädt nur einmal',
    C.downloads.length === 1, 'downloads=' + C.downloads.length + ', msg=' + C.flashMessages[C.flashMessages.length - 1]);

  console.log('\n' + (failures === 0 ? 'ALLE FIXTESTS BESTANDEN' : failures + ' TEST(S) FEHLGESCHLAGEN'));
  process.exitCode = failures === 0 ? 0 : 1;
})();
