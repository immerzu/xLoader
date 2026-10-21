// Watchdog-Isolationstest: extrahiert downloadUrl und simuliert die Zeit.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC_PATH = process.argv[2] || path.join(__dirname, '..', 'xLoader.user.js');
const SRC = fs.readFileSync(SRC_PATH, 'utf8');
const start = SRC.indexOf('function downloadUrl(');
const end = SRC.indexOf('// ============================ Menü & Konfiguration', start);
if (start < 0 || end < 0) throw new Error('downloadUrl nicht gefunden');
const FN = SRC.slice(start, end);

// ---- Fake-Zeit ----
let now = 0;
let nextId = 1;
const timers = new Map();
const realNow = Date.now;
Date.now = () => now;
global.setTimeout = (fn, ms) => { const id = nextId++; timers.set(id, { fn, at: now + ms }); return id; };
global.clearTimeout = (id) => { timers.delete(id); };
function advance(ms) {
  const target = now + ms;
  for (;;) {
    let pick = null;
    for (const [id, t] of timers) {
      if (t.at <= target && (!pick || t.at < pick[1].at)) pick = [id, t];
    }
    if (!pick) break;
    now = pick[1].at;
    timers.delete(pick[0]);
    pick[1].fn();
  }
  now = target;
}

const CONFIG = { requestTimeoutMs: 60000 };
let opts = null;
let abortCalls = 0;
let gmImpl = (o) => { opts = o; return { abort() { abortCalls++; } }; };
const downloadUrl = new Function('CONFIG', 'GM_download', 'return (' + FN + ')')(CONFIG, (o) => gmImpl(o));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS | ' + name); }
  else { fail++; console.log('FAIL | ' + name + (extra ? ' :: ' + extra : '')); }
}
function reset() { now = 0; timers.clear(); opts = null; abortCalls = 0; gmImpl = (o) => { opts = o; return { abort() { abortCalls++; } }; }; }
async function outcome(p) {
  try { await p; return { ok: true }; } catch (e) { return { ok: false, msg: e.message }; }
}

(async () => {
  // 1) Hängender Download -> Timeout nach 5 min, abort, Rejection, Timer leer
  reset();
  let p = downloadUrl('u', 'f.png', false);
  check('hängend: kein sofortiger Reject', timers.size === 1);
  advance(299999);
  check('hängend: vor 5 min noch offen', timers.size === 1);
  advance(1);
  let r = await outcome(p);
  check('hängend: Rejection nach 5 min', !r.ok && /keine Antwort\/Fortschritt \(Timeout\)/.test(r.msg), r.msg);
  check('hängend: abort() genau 1x', abortCalls === 1);
  check('hängend: Timer bereinigt', timers.size === 0);

  // 2) Fortschritt setzt den Stillstands-Timer zurück
  reset();
  p = downloadUrl('u', 'f.mp4', false, () => {});
  advance(120000);
  opts.onprogress({ done: 10, total: 100 });
  advance(120000);
  opts.onprogress({ done: 20, total: 100 });
  advance(120000);
  check('Fortschritt: nach 6 min noch kein Reject', timers.size === 1);
  opts.onload();
  r = await outcome(p);
  check('Fortschritt: onload resolved', r.ok, r.msg);
  check('Fortschritt: Timer nach onload bereinigt', timers.size === 0);
  advance(300000);
  check('Fortschritt: kein späterer Reject', timers.size === 0);

  // 3) onerror bereinigt Timer und liefert den Fehlertext
  reset();
  p = downloadUrl('u', 'f.png', false);
  opts.onerror({ error: 'not_enabled' });
  r = await outcome(p);
  check('onerror not_enabled: Rejection', !r.ok && /not_enabled/.test(r.msg), r.msg);
  check('onerror not_enabled: Handlungshinweis', /Download-Modus auf Nativ stellen/.test(r.msg), r.msg);
  check('onerror: Timer bereinigt', timers.size === 0);

  // 4) not_permitted
  reset();
  p = downloadUrl('u', 'f.png', false);
  opts.onerror({ error: 'not_permitted' });
  r = await outcome(p);
  check('onerror not_permitted: Hinweis', !r.ok && /keine Download-Berechtigung/.test(r.msg), r.msg);

  // 5) Mehrfach-Callbacks: onload gewinnt, danach kein zweites Settle
  reset();
  p = downloadUrl('u', 'f.png', false);
  opts.onload();
  opts.onerror({ error: 'not_succeeded' });
  opts.ontimeout();
  r = await outcome(p);
  check('Mehrfach: onload gewinnt', r.ok, r.msg);
  check('Mehrfach: kein abort', abortCalls === 0);
  check('Mehrfach: Timer bereinigt', timers.size === 0);

  // 6) ontimeout des Managers
  reset();
  p = downloadUrl('u', 'f.png', false);
  opts.ontimeout();
  r = await outcome(p);
  check('Manager-ontimeout: Rejection', !r.ok && /GM_download: Timeout/.test(r.msg), r.msg);

  // 7) GM_download wirft synchron -> Rejection ohne Timer
  reset();
  gmImpl = () => { throw new Error('boom'); };
  p = downloadUrl('u', 'f.png', false);
  r = await outcome(p);
  check('synchroner Throw: Rejection', !r.ok && /boom/.test(r.msg), r.msg);
  check('synchroner Throw: Timer bereinigt', timers.size === 0);

  Date.now = realNow;
  console.log(`\nERGEBNIS: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
