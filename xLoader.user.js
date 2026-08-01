// ==UserScript==
// @name         xLoader
// @namespace    https://github.com/xLoader/xLoader
// @version      1.0.6
// @description  Fügt auf X.com/Twitter unter jedem Tweet einen Download-Button hinzu und lädt dessen Medien (Bilder, Videos, GIFs) über den nativen "Speichern unter"-Dialog herunter. Die Medien-URLs werden im Hintergrund vorgeladen, sodass der Dialog unmittelbar nach dem Klick erscheint.
// @author       xLoader
// @license      MIT
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_download
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      x.com
// @connect      twitter.com
// @connect      pbs.twimg.com
// @connect      video.twimg.com
// @noframes
// @run-at       document-end
// ==/UserScript==

/*
 * xLoader v1.0.6 (Veröffentlichungsversion)
 * ---------------------------------------------------------------------------
 * v1.0.6: Projekt-/Skriptname "xLoader" (zuvor Downloadhilfe); @author und
 *  @namespace auf die Veröffentlichungs-Identität gesetzt. Keine
 *  Funktionsänderungen gegenüber v1.0.5.
 * ---------------------------------------------------------------------------
 * v1.0.5 (Layout-Fix: Button "verrutscht"):
 * v1.0.5: Der Download-Button wird nicht mehr als eigenständiges Element mit
 *  fester Größe gebaut, sondern durch Klonen eines vorhandenen X.com-
 *  Aktionsleisten-Buttons (bewährter Ansatz aus X Media Downloader). Damit
 *  werden Größe, Höhe, Abstände und responsives Verhalten der Leiste exakt
 *  übernommen (vorher: fester 36px-Button, der bei manchen Tweet-Fenstern
 *  über die Leiste hinausragte). Nur das Icon (SVG) und der Zähler werden
 *  ersetzt bzw. ausgeblendet.
 * ---------------------------------------------------------------------------
 * v1.0.4: Keine Funktionsänderungen — nur Metadaten für die Veröffentlichung:
 *  - @license MIT ergänzt (Greasy Fork zeigt sonst "Alle Rechte vorbehalten")
 *  - @description überarbeitet
 *  - @author / @namespace sind Platzhalter: vor dem Einfügen bei Greasy Fork
 *    durch eigene Werte ersetzen, z. B.
 *      @author    <dein Name/Handle>
 *      @namespace https://greasyfork.org/users/<deine-User-ID>
 *    (Die User-ID steht in der URL deines Greasy-Fork-Profils.)
 * Injektion:      Ein Download-Button (Pfeil-nach-unten) wird in die
 *                 Aktionsleiste (div[role="group"]) jedes Tweets eingefügt,
 *                 sobald der Tweet ein Medien-Indiz trägt (Bild, Video-
 *                 Poster, <video>-Element). Initialer Scan + MutationObserver
 *                 decken vorhandene und nachgeladene Tweets ab.
 *
 * HINTERGRUND (live auf X.com verifiziert):
 *  X.com rendert Videos/GIFs NUR als Poster-<img>; die direkten MP4-URLs
 *  liefert ausschließlich die X-API (conversation.json mit Bearer-/csrf-
 *  Headern). window.__INITIAL_STATE__ existiert nicht mehr.
 *
 * Änderungen in v1.0.3 (sofortiger "Speichern unter"-Dialog):
 *  - PREFETCH: Sobald ein Tweet mit Medien-Indikator im DOM erscheint, wird
 *    der API-Call asynchron im Hintergrund gestartet (max. 3 parallel,
 *    Queue begrenzt). Die Medien-URLs landen in einem Cache
 *    (Map: tweetId -> { items, fetchedAt }), TTL 5 Minuten (X.com-URLs sind
 *    temporär). 401/429-Fehler beim Prefetch werden still verworfen — der
 *    Klick lädt dann live nach.
 *  - KLICK: Zuerst Cache-Check -> bei Treffer sofortiger Download ohne
 *    API-Call. Cache-Miss -> Live-Fallback (API -> Live-Token-Retry ->
 *    DOM). Nach dem Download wird der Cache-Eintrag invalidiert.
 *  - DOWNLOAD: Direkter GM_download mit der URL (saveAs: true) statt
 *    Blob-Umweg — der "Speichern unter"-Dialog öffnet sich unmittelbar
 *    nach dem Klick; die Datei wird im Hintergrund geladen.
 *    (Blob-Pfad entfernt: er verzögerte den Dialog um die Ladezeit.)
 *  - RACE-SCHUTZ: Button wird beim Klick sofort deaktiviert (Doppelklick-
 *    Guard); parallele Klicks auf verschiedene Tweets sind unabhängig.
 *
 * Fallback-Kette beim Klick (Cache-Miss): API -> Live-Token-Retry -> DOM
 * (Bilder) -> Fehlermeldung.
 * ---------------------------------------------------------------------------
 */

(function () {
    'use strict';

    // ============================ Konfiguration ============================

    const CONFIG = {
        tweetSelector: 'article[data-testid="tweet"]',
        actionBarSelector: 'div[role="group"]',
        // Kandidaten für Medien-URLs im DOM (Fallback für Bilder)
        mediaSelectors: ['img', 'video', 'source'],
        containerSelector: [
            '[data-testid="videoPlayer"]',
            '[data-testid="videoComponent"]',
            '[data-testid="tweetPhoto"]',
            '[data-testid="tweetVideo"]'
        ].join(','),
        dataUrlAttrs: ['data-src', 'data-url', 'data-image-url', 'data-video-url', 'data-media-url'],
        requestTimeoutMs: 60000,
        recheckDelayMs: 2000,
        errorFlashMs: 2500,
        logPrefix: '[Downloadhilfe]',
        btnAttribute: 'data-downloadhilfe',
        // Prefetch-Cache
        cacheTtlMs: 5 * 60 * 1000,        // X.com-Medien-URLs sind temporär
        maxParallelPrefetch: 3,           // Rate-Limiting vermeiden
        maxPrefetchQueue: 30,             // Schutz bei schnellem Scrollen
        // X-API (bewährte Strategie aus funktionierendem Referenz-Skript)
        api: {
            endpoint: function (statusId) {
                return location.origin + '/i/api/2/timeline/conversation/' + statusId +
                    '.json?tweet_mode=extended&include_entities=true&include_user_entities=false';
            },
            // Öffentlicher Guest-Bearer-Token (aus der x.com main.js)
            guestBearer: 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            liveTokenRe: /["'](A{20,}[a-zA-Z0-9%_\-]{40,})["']/,
            liveTokenTtlMs: 3600000,
            localStorageKey: 'downloadhilfe-live-token'
        }
    };

    const CSS = [
        // Layout kommt vom geklonten X.com-Button; hier nur Zähler ausblenden,
        // Hover-/Fehlerfarben und Icon-Stil.
        '.downloadhilfe-wrap > button > div > div:nth-child(2) { display: none; }',
        '.downloadhilfe-wrap:hover > button > div,',
        '.downloadhilfe-btn:hover > div { color: rgb(29, 155, 240); }',
        '.downloadhilfe-wrap:hover > button > div > div > div,',
        '.downloadhilfe-btn:hover > div > div > div { background-color: rgba(29, 155, 240, 0.1); }',
        '.downloadhilfe-wrap:active > button > div > div > div,',
        '.downloadhilfe-btn:active > div > div > div { background-color: rgba(29, 155, 240, 0.2); }',
        '.downloadhilfe-btn:disabled { opacity: 0.5; cursor: default; }',
        '.downloadhilfe-wrap.is-error > button > div,',
        '.downloadhilfe-btn.is-error > div { color: rgb(244, 33, 46); }',
        '.downloadhilfe-wrap.is-error > button > div > div > div,',
        '.downloadhilfe-btn.is-error > div > div > div { background-color: rgba(244, 33, 46, 0.1); }',
        '.downloadhilfe-btn svg path {',
        '  fill: none;',
        '  stroke: currentColor;',
        '  stroke-width: 2;',
        '  stroke-linecap: round;',
        '  stroke-linejoin: round;',
        '}'
    ].join('\n');

    // Download-Symbol: Pfeil nach unten mit Basislinie (X-Design angelehnt).
    // Wird in das geklonte X.com-SVG eingesetzt (dessen Größenklassen bleiben).
    const SVG_ICON_INNER =
        '<path d="M12 3.5v10.5"/><path d="M6.5 9.5 12 15l5.5-5.5"/><path d="M4.5 19.5h15"/>';

    // ================================ Logging ==============================

    const log = {
        info: function () {
            console.log.apply(console, [CONFIG.logPrefix].concat(Array.prototype.slice.call(arguments)));
        },
        warn: function () {
            console.warn.apply(console, [CONFIG.logPrefix].concat(Array.prototype.slice.call(arguments)));
        },
        error: function () {
            console.error.apply(console, [CONFIG.logPrefix].concat(Array.prototype.slice.call(arguments)));
        }
    };

    // ============================ DOM-Medien-Extraktion ====================
    // (nur als Fallback für statische Bilder, wenn die API nicht erreichbar ist)

    function isMediaUrl(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            new URL(url);
        } catch (e) {
            return false;
        }
        if (url.indexOf('pbs.twimg.com/media/') !== -1) return true;
        if (url.indexOf('video.twimg.com/') !== -1) return true;
        return false;
    }

    function normalizeMediaUrl(url) {
        if (!url || typeof url !== 'string') return null;
        url = url.trim();
        if (!url || url.indexOf('blob:') === 0 || url.indexOf('data:') === 0) return null;
        if (!isMediaUrl(url)) return null;
        if (/\.m3u8(\?|#|$)/i.test(url) && /\/vid\/[^/?#]+\//.test(url)) {
            return url.replace(/\.m3u8(\?|#|$)/i, '.mp4$1');
        }
        return url;
    }

    function bestImageUrl(img) {
        var srcset = img.getAttribute('srcset');
        if (srcset) {
            var entries = srcset.split(',').map(function (e) {
                return e.trim().split(/\s+/)[0];
            }).filter(Boolean);
            if (entries.length) {
                var original = null;
                for (var i = 0; i < entries.length; i++) {
                    if (/name=(orig|4096x4096)/.test(entries[i])) {
                        original = entries[i];
                        break;
                    }
                }
                return original || entries[entries.length - 1];
            }
        }
        return img.currentSrc || img.src || null;
    }

    function collectVideoUrls(videoEl) {
        var urls = [];
        var sources = videoEl.querySelectorAll('source');
        for (var i = 0; i < sources.length; i++) {
            urls.push(sources[i].getAttribute('src') || sources[i].src);
        }
        urls.push(videoEl.getAttribute('src') || videoEl.src);
        urls.push(videoEl.currentSrc);
        for (var j = 0; j < CONFIG.dataUrlAttrs.length; j++) {
            urls.push(videoEl.getAttribute(CONFIG.dataUrlAttrs[j]));
        }
        return urls;
    }

    function urlsFromStyle(el) {
        var style = el.getAttribute('style');
        if (!style) return [];
        var urls = [];
        var re = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
        var m;
        while ((m = re.exec(style))) {
            if (m[2]) urls.push(m[2]);
        }
        return urls;
    }

    function extractDomMedia(tweet) {
        var urls = [];
        var seen = {};

        function add(rawUrl) {
            var url = normalizeMediaUrl(rawUrl);
            if (!url || seen[url]) return;
            seen[url] = true;
            urls.push(url);
        }

        var candidates = tweet.querySelectorAll(CONFIG.mediaSelectors.join(','));
        for (var i = 0; i < candidates.length; i++) {
            var el = candidates[i];
            if (el.closest('div[data-testid="tweet"]')) continue;

            if (el.tagName === 'IMG') {
                add(bestImageUrl(el));
                for (var a = 0; a < CONFIG.dataUrlAttrs.length; a++) {
                    add(el.getAttribute(CONFIG.dataUrlAttrs[a]));
                }
            } else if (el.tagName === 'VIDEO') {
                var videoUrls = collectVideoUrls(el);
                for (var v = 0; v < videoUrls.length; v++) add(videoUrls[v]);
            } else if (el.tagName === 'SOURCE') {
                add(el.getAttribute('src') || el.src);
            }
        }

        var containers = tweet.querySelectorAll(CONFIG.containerSelector);
        for (var c = 0; c < containers.length; c++) {
            var box = containers[c];
            if (box.closest('div[data-testid="tweet"]')) continue;
            var bgUrls = urlsFromStyle(box);
            for (var b = 0; b < bgUrls.length; b++) add(bgUrls[b]);
            for (var d = 0; d < CONFIG.dataUrlAttrs.length; d++) {
                add(box.getAttribute(CONFIG.dataUrlAttrs[d]));
            }
        }

        return urls;
    }

    /**
     * Medien-Indikator für die Button-Injektion: true, wenn der Tweet Bilder
     * (pbs.twimg.com/media) ODER Video-/GIF-Poster (amplify_video_thumb,
     * ext_tw_video_thumb, tweet_video_thumb) ODER ein <video>-Element trägt.
     */
    function hasMediaIndicator(tweet) {
        var imgs = tweet.querySelectorAll('img');
        for (var i = 0; i < imgs.length; i++) {
            var src = (imgs[i].getAttribute('src') || '') + ' ' + (imgs[i].getAttribute('srcset') || '');
            if (src.indexOf('pbs.twimg.com/media/') !== -1) return true;
            if (/amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb/.test(src)) return true;
        }
        if (tweet.querySelector('video')) return true;
        return false;
    }

    // ============================ X-API (Video-/GIF-URLs) =================

    function getCookies() {
        var cookies = {};
        document.cookie.split(';').forEach(function (item) {
            var idx = item.indexOf('=');
            if (idx > -1) {
                var key = item.slice(0, idx).trim();
                var value = item.slice(idx + 1).trim();
                cookies[key] = value;
            }
        });
        return cookies;
    }

    var liveToken = getCachedLiveToken();

    function getCachedLiveToken() {
        try {
            var raw = localStorage.getItem(CONFIG.api.localStorageKey);
            if (!raw) return null;
            var cached = JSON.parse(raw);
            if (!cached || !cached.token || !cached.ts) return null;
            if (Date.now() - cached.ts > CONFIG.api.liveTokenTtlMs) return null;
            return cached.token;
        } catch (e) {
            return null;
        }
    }

    function cacheLiveToken(token) {
        try {
            localStorage.setItem(CONFIG.api.localStorageKey, JSON.stringify({
                token: token,
                ts: Date.now()
            }));
        } catch (e) { /* ignore */ }
    }

    /**
     * Lädt die Tweet-Daten von der X-API via GM_xmlhttpRequest. Header:
     * Bearer-Token (Guest oder Live), x-csrf-token aus Cookie ct0,
     * x-twitter-active-user, ggf. x-guest-token.
     */
    function fetchTweetData(statusId) {
        var url = CONFIG.api.endpoint(statusId);
        var cookies = getCookies();
        var headers = {
            authorization: 'Bearer ' + (liveToken || CONFIG.api.guestBearer),
            'x-twitter-active-user': 'yes',
            'x-twitter-client-language': cookies.lang || 'en',
            'x-csrf-token': cookies.ct0 || ''
        };
        if (cookies.gt && cookies.ct0 && cookies.ct0.length === 32) {
            headers['x-guest-token'] = cookies.gt;
        }

        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: headers,
                timeout: CONFIG.requestTimeoutMs,
                onload: function (res) {
                    if (res.status === 200) {
                        try {
                            resolve(JSON.parse(res.responseText));
                        } catch (e) {
                            reject(new Error('API JSON-Parse-Fehler'));
                        }
                    } else {
                        reject(new Error('API HTTP ' + res.status));
                    }
                },
                onerror: function () {
                    reject(new Error('API Netzwerk-/CORS-Fehler'));
                },
                ontimeout: function () {
                    reject(new Error('API Timeout'));
                }
            });
        });
    }

    /**
     * Sammelt alle Tweet-Objekte (id -> Tweet) aus einer API-Antwort,
     * rekursiv mit Besuchs-Guard.
     */
    function collectTweetObjects(json) {
        var map = new Map();
        var seen = new WeakSet();
        (function walk(obj) {
            if (!obj || typeof obj !== 'object' || seen.has(obj)) return;
            seen.add(obj);
            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) walk(obj[i]);
                return;
            }
            var id = obj.id_str || obj.id || null;
            if (id && (obj.extended_entities || obj.entities || obj.full_text)) {
                map.set(String(id), obj);
            }
            for (var key in obj) {
                var v = obj[key];
                if (v && typeof v === 'object') walk(v);
            }
        })(json);
        return map;
    }

    /**
     * Extrahiert Medien aus einem Tweet-Objekt:
     *  - photo:          media_url_https mit name=orig (höchste Auflösung)
     *  - video/animated_gif: MP4-Variante mit höchster Bitrate
     * GIFs sind MP4-Streams und werden wie Videos mit .mp4 benannt.
     */
    function apiMediaFromTweet(tweetObj) {
        var media = [];
        var sources = [];
        if (tweetObj.extended_entities && Array.isArray(tweetObj.extended_entities.media)) {
            for (var e = 0; e < tweetObj.extended_entities.media.length; e++) {
                sources.push(tweetObj.extended_entities.media[e]);
            }
        }
        if (!sources.length && tweetObj.entities && Array.isArray(tweetObj.entities.media)) {
            for (var f = 0; f < tweetObj.entities.media.length; f++) {
                sources.push(tweetObj.entities.media[f]);
            }
        }

        for (var i = 0; i < sources.length; i++) {
            var m = sources[i];
            if (!m) continue;
            if (m.type === 'photo' && m.media_url_https) {
                media.push({ url: originalImageUrl(m.media_url_https), ext: extFromUrl(m.media_url_https) || 'jpg' });
            } else if (m.type === 'video' || m.type === 'animated_gif') {
                var variants = (m.video_info && m.video_info.variants) || [];
                var best = null;
                for (var j = 0; j < variants.length; j++) {
                    var v = variants[j];
                    if (v && v.content_type === 'video/mp4' && v.url && v.url.indexOf('blob:') === -1) {
                        if (!best || (v.bitrate || 0) > (best.bitrate || 0)) best = v;
                    }
                }
                if (best && best.url) media.push({ url: best.url, ext: 'mp4' });
            }
        }
        return media;
    }

    function originalImageUrl(src) {
        try {
            var u = new URL(src);
            u.searchParams.set('name', 'orig');
            return u.toString();
        } catch (e) {
            return src;
        }
    }

    /**
     * Findet den Ziel-Tweet in der API-Antwort und liefert seine Medien.
     * Fallback auf Quoted-/Retweet-Tweet, wenn der Tweet selbst keine Medien
     * hat (aber ein Quoted/Retweet existiert).
     */
    function parseApiData(data, statusId) {
        var map = collectTweetObjects(data);
        var tweet = map.get(String(statusId)) || null;
        var media = tweet ? apiMediaFromTweet(tweet) : [];

        if (!media.length && tweet) {
            var quotedId = tweet.quoted_status_id_str || tweet.retweeted_status_id_str ||
                tweet.quoted_status_id || tweet.retweeted_status_id;
            if (quotedId) {
                var quoted = map.get(String(quotedId));
                if (quoted) media = apiMediaFromTweet(quoted);
            }
        }
        return { media: media };
    }

    /**
     * Extrahiert einen frischen Live-Bearer-Token aus den x.com-JS-Dateien
     * (Regex auf das bekannte AAAA...-Muster). Wird bei API-Auth-Fehlern
     * verwendet und in localStorage gecacht (TTL 1 h).
     */
    function fetchLiveBearerToken() {
        var TOKEN_RE = CONFIG.api.liveTokenRe;

        function gmGet(url) {
            return new Promise(function (resolve, reject) {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    onload: function (r) {
                        if (r.status === 200) resolve(r.responseText);
                        else reject(new Error('HTTP ' + r.status));
                    },
                    onerror: function () { reject(new Error('Netzwerkfehler')); },
                    ontimeout: function () { reject(new Error('Timeout')); }
                });
            });
        }

        return (function () {
            var scriptUrls = [];
            return gmGet(location.origin + '/').then(function (html) {
                var srcRe = /<script[^>]+src=["']([^"']+)["']/gi;
                var m;
                while ((m = srcRe.exec(html)) !== null) {
                    var url = m[1];
                    if (url.indexOf('//') === 0) url = 'https:' + url;
                    if (url.indexOf('http') !== 0) continue;
                    if (url.indexOf('twimg.com/') === -1 && url.indexOf('twitter.com/') === -1 && url.indexOf('x.com/') === -1) continue;
                    scriptUrls.push(url);
                }
                scriptUrls.push('https://abs.twimg.com/responsive-web/client-web/main.' + Date.now() + 'a.js');

                var chain = Promise.reject(new Error('keine Scripts'));
                scriptUrls.slice(0, 5).forEach(function (scriptUrl) {
                    chain = chain.catch(function () {
                        return gmGet(scriptUrl).then(function (js) {
                            var match = TOKEN_RE.exec(js);
                            if (match && match[1]) return match[1];
                            throw new Error('kein Token in ' + scriptUrl);
                        });
                    });
                });
                return chain;
            });
        })();
    }

    // ============================ Prefetch-Cache ===========================

    // Cache: tweetId -> { items: [{url, ext}], fetchedAt: number }
    var mediaCache = new Map();
    // Tweet-IDs, für die bereits ein Prefetch geplant/gestartet wurde
    var prefetchSeen = new Set();
    var prefetchQueue = [];
    var activePrefetches = 0;

    /**
     * Liefert gecachte Medien-Items für eine Tweet-ID oder null.
     * Abgelaufene Einträge (TTL 5 min) werden dabei entfernt.
     */
    function getCachedItems(tweetId) {
        var entry = mediaCache.get(tweetId);
        if (!entry) return null;
        if (Date.now() - entry.fetchedAt > CONFIG.cacheTtlMs) {
            mediaCache.delete(tweetId);
            return null;
        }
        return entry.items;
    }

    /**
     * Plant einen Hintergrund-Prefetch für einen Tweet. Nicht blockierend;
     * maximal CONFIG.maxParallelPrefetch parallele API-Calls (Queue).
     * 401/429/leere Antworten werden still verworfen — der Klick lädt dann
     * live nach (Live-Token-Retry ist bewusst nur dem Klick vorbehalten).
     */
    function schedulePrefetch(tweet) {
        if (!tweet || !tweet.isConnected) return;
        var tweetId = getTweetId(tweet);
        if (!tweetId || mediaCache.has(tweetId) || prefetchSeen.has(tweetId)) return;
        if (prefetchQueue.length >= CONFIG.maxPrefetchQueue) return;

        prefetchSeen.add(tweetId);
        prefetchQueue.push(tweetId);
        drainPrefetchQueue();
    }

    async function prefetch(tweetId) {
        activePrefetches++;
        try {
            var data = await fetchTweetData(tweetId);
            var parsed = parseApiData(data, tweetId);
            if (parsed.media && parsed.media.length) {
                mediaCache.set(tweetId, { items: parsed.media, fetchedAt: Date.now() });
                log.info('Prefetch abgeschlossen für Tweet ' + tweetId +
                    ' (' + parsed.media.length + ' Medium/Medien).');
            }
        } catch (err) {
            log.warn('Prefetch fehlgeschlagen für Tweet ' + tweetId + ': ' + err.message);
        } finally {
            activePrefetches--;
            drainPrefetchQueue();
        }
    }

    function drainPrefetchQueue() {
        while (activePrefetches < CONFIG.maxParallelPrefetch && prefetchQueue.length) {
            var tweetId = prefetchQueue.shift();
            prefetch(tweetId); // fire-and-forget
        }
    }

    // ============================ Metadaten (Dateiname) ====================

    function getHandle(tweet) {
        var userLink = tweet.querySelector('div[data-testid="User-Name"] a[href^="/"]');
        var href = userLink ? (userLink.getAttribute('href') || '') : '';
        var m = href.match(/^\/([^/?#]+)/);
        return m ? m[1] : 'unknown';
    }

    function getTweetId(tweet) {
        var statusLink = tweet.querySelector('a[href*="/status/"]');
        var href = statusLink ? (statusLink.getAttribute('href') || '') : '';
        var m = href.match(/\/status\/(\d+)/);
        return m ? m[1] : String(Date.now());
    }

    function sanitizeFilenamePart(str) {
        return String(str).replace(/[\\/:*?"<>|]/g, '_');
    }

    function extFromUrl(url) {
        if (/[?&]format=gif/i.test(url)) return 'gif';
        var extMatch = url.match(/\.(mp4|gif|webp|png|jpe?g)(\?|#|$)/i);
        if (extMatch) return extMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : extMatch[1].toLowerCase();
        var fmtMatch = url.match(/[?&]format=([a-z0-9]+)/i);
        if (fmtMatch) return fmtMatch[1].toLowerCase();
        return 'jpg';
    }

    // ============================ Download-Mechanismus ====================

    /**
     * Startet den Download direkt über GM_download mit der URL und öffnet
     * mit saveAs: true sofort den nativen "Speichern unter"-Dialog — die
     * Datei wird dabei im Hintergrund geladen (kein Blob-Umweg, keine
     * Wartezeit in der Klick-Kette).
     */
    function downloadUrl(url, filename) {
        return new Promise(function (resolve, reject) {
            GM_download({
                url: url,
                name: filename,
                saveAs: true,
                onload: function () {
                    resolve();
                },
                onerror: function (err) {
                    reject(new Error('GM_download: ' + (err && err.error ? err.error : 'unbekannter Fehler')));
                },
                ontimeout: function () {
                    reject(new Error('GM_download: Timeout'));
                }
            });
        });
    }

    // ============================ Button-Verhalten =========================

    function setBusy(btn, busy) {
        btn.disabled = busy;
        btn.title = busy ? 'Lädt Medien …' : 'Medien herunterladen';
    }

    function getWrap(btn) {
        return btn.closest ? btn.closest('.downloadhilfe-wrap') : null;
    }

    function flashError(btn, message) {
        var previousTitle = btn.title;
        var wrap = getWrap(btn);
        btn.classList.add('is-error');
        if (wrap) wrap.classList.add('is-error');
        btn.title = message;
        setTimeout(function () {
            btn.classList.remove('is-error');
            if (wrap) wrap.classList.remove('is-error');
            btn.title = previousTitle;
        }, CONFIG.errorFlashMs);
    }

    /**
     * Live-Fallback für den Klick (Cache-Miss): API -> Live-Token-Retry ->
     * DOM (Bilder). Liefert ein Array von { url, ext }.
     */
    async function loadItemsLive(tweet, tweetId) {
        var items = [];
        try {
            var data = await fetchTweetData(tweetId);
            items = parseApiData(data, tweetId).media;
        } catch (apiErr) {
            log.warn('API-Fehler (' + apiErr.message + '), versuche Live-Token-Retry …');
        }

        if (!items.length && !liveToken) {
            try {
                var token = await fetchLiveBearerToken();
                if (token) {
                    liveToken = token;
                    cacheLiveToken(token);
                    log.info('Live-Bearer-Token ermittelt.');
                    var data2 = await fetchTweetData(tweetId);
                    items = parseApiData(data2, tweetId).media;
                }
            } catch (retryErr) {
                log.warn('Live-Token-Retry fehlgeschlagen: ' + retryErr.message);
            }
        }

        if (!items.length) {
            var domUrls = extractDomMedia(tweet);
            for (var d = 0; d < domUrls.length; d++) {
                items.push({ url: domUrls[d], ext: extFromUrl(domUrls[d]) });
            }
        }
        return items;
    }

    /**
     * Klick-Fluss: 1) Cache prüfen (Treffer -> sofortiger Download, kein
     * API-Call). 2) Cache-Miss -> Live-Fallback. 3) Download pro Medium mit
     * saveAs: true. 4) Cache-Eintrag invalidieren.
     */
    async function onDownloadClick(tweet, btn) {
        if (btn.disabled) return; // Doppelklick-Guard
        setBusy(btn, true);       // Button sofort deaktivieren

        var tweetId = getTweetId(tweet);
        var handle = sanitizeFilenamePart(getHandle(tweet));
        var items = getCachedItems(tweetId);

        if (items && items.length) {
            log.info('Cache-Treffer für Tweet ' + tweetId + ' — sofortiger Download.');
        } else {
            if (mediaCache.has(tweetId)) mediaCache.delete(tweetId); // abgelaufen
            items = await loadItemsLive(tweet, tweetId);
        }

        if (!items.length) {
            setBusy(btn, false);
            flashError(btn, 'Keine Medien gefunden');
            log.warn('Keine Medien für Tweet ' + tweetId + ' gefunden (Cache + API + DOM).');
            return;
        }

        var failed = 0;
        for (var i = 0; i < items.length; i++) {
            var filename = '@' + handle + '_' + tweetId + '_' + (i + 1) + '.' + items[i].ext;
            try {
                log.info('Lade Medien ' + (i + 1) + '/' + items.length + ' → ' + filename);
                await downloadUrl(items[i].url, filename);
                log.info('Gespeichert: ' + filename);
            } catch (err) {
                failed++;
                log.error('Download fehlgeschlagen (' + items[i].url + '): ' + err.message);
            }
        }

        // Cache invalidieren: X.com-URLs sind temporär; ein erneuter Klick
        // lädt die Medien frisch (Live-Fallback).
        mediaCache.delete(tweetId);

        setBusy(btn, false);
        if (failed > 0) {
            flashError(btn, failed + ' von ' + items.length + ' fehlgeschlagen');
        }
    }

    // ============================ Button-Injektion =========================

    /**
     * Erzeugt den Download-Button durch Klonen eines vorhandenen X.com-
     * Aktionsleisten-Buttons (letzter div-Wrapper mit Button). Dadurch werden
     * Größe, Höhe, Abstände und responsives Verhalten der Leiste exakt
     * übernommen — kein eigenständiger, fest dimensionierter Button mehr.
     * Nur das Icon wird ersetzt, der Zähler per CSS ausgeblendet.
     */
    function createButton(tweet) {
        var actionBar = tweet.querySelector(CONFIG.actionBarSelector);
        if (!actionBar) return null;
        if (actionBar.querySelector('button[' + CONFIG.btnAttribute + ']')) return null;

        var wrappers = Array.prototype.slice.call(actionBar.querySelectorAll(':scope > div'));
        var source = null;
        for (var i = wrappers.length - 1; i >= 0; i--) {
            if (wrappers[i].querySelector('button')) {
                source = wrappers[i];
                break;
            }
        }
        if (!source) source = actionBar.querySelector('button');
        if (!source) return null;

        var clone = source.cloneNode(true);
        var btn = clone.matches && clone.matches('button') ? clone : clone.querySelector('button');
        if (!btn) return null;

        // Icon ersetzen — das geklonte <svg> behält seine X.com-Größenklassen
        var icon = clone.querySelector('svg');
        if (icon) icon.innerHTML = SVG_ICON_INNER;

        // X.com-Test-Attribute entfernen (der Klon darf nicht als echter
        // Leisten-Button behandelt werden) und eigene Markierung setzen
        btn.removeAttribute('data-testid');
        btn.setAttribute(CONFIG.btnAttribute, '1');
        btn.setAttribute('aria-label', 'Medien herunterladen');
        btn.title = 'Medien herunterladen';

        if (clone !== btn) clone.classList.add('downloadhilfe-wrap');
        btn.classList.add('downloadhilfe-btn');

        btn.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            onDownloadClick(tweet, btn);
        });

        actionBar.appendChild(clone);
        return btn;
    }

    function processTweet(tweet) {
        if (!tweet || !tweet.isConnected) return;
        if (tweet.querySelector('button[' + CONFIG.btnAttribute + ']')) return;

        if (hasMediaIndicator(tweet)) {
            var btn = createButton(tweet);
            if (btn) log.info('Download-Button eingefügt für Tweet ' + getTweetId(tweet));
            // Medien-URLs im Hintergrund vorladen (Cache füllen)
            schedulePrefetch(tweet);
        } else if (!tweet.dataset.downloadhilfeRechecked) {
            tweet.dataset.downloadhilfeRechecked = '1';
            setTimeout(function () {
                if (tweet.isConnected && !tweet.querySelector('button[' + CONFIG.btnAttribute + ']') &&
                    hasMediaIndicator(tweet)) {
                    createButton(tweet);
                    schedulePrefetch(tweet);
                }
            }, CONFIG.recheckDelayMs);
        }
    }

    function scanInitial() {
        var tweets = document.querySelectorAll(CONFIG.tweetSelector);
        for (var i = 0; i < tweets.length; i++) processTweet(tweets[i]);
        log.info('Initialer Scan: ' + tweets.length + ' Tweet(s) geprüft.');
    }

    // ============================ MutationObserver =========================

    var pendingNodes = [];
    var scheduled = false;

    function scheduleProcess(nodes) {
        for (var i = 0; i < nodes.length; i++) pendingNodes.push(nodes[i]);
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
            scheduled = false;
            var batch = pendingNodes;
            pendingNodes = [];
            var tweets = new Set();
            for (var j = 0; j < batch.length; j++) {
                var node = batch[j];
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                if (node.matches && node.matches(CONFIG.tweetSelector)) tweets.add(node);
                var nested = node.querySelectorAll ? node.querySelectorAll(CONFIG.tweetSelector) : [];
                for (var k = 0; k < nested.length; k++) tweets.add(nested[k]);
            }
            batch = null;
            tweets.forEach(processTweet);
        });
    }

    // ================================ Initialisierung ======================

    function init() {
        GM_addStyle(CSS);
        scanInitial();

        var observer = new MutationObserver(function (mutations) {
            var nodes = [];
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === Node.ELEMENT_NODE) nodes.push(added[j]);
                }
            }
            if (nodes.length) scheduleProcess(nodes);
        });
        observer.observe(document.body, { childList: true, subtree: true });

        log.info('xLoader v1.0.6 aktiv — überwache ' + CONFIG.tweetSelector + ' …');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
