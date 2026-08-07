// ==UserScript==
// @name         xLoader
// @namespace    https://github.com/immerzu/xLoader
// @version      1.0.20
// @description  Fügt auf X.com/Twitter unter jedem Tweet einen Download-Button hinzu und lädt dessen Medien (Bilder, Videos, GIFs) über den nativen "Speichern unter"-Dialog herunter. Die Medien-URLs werden im Hintergrund vorgeladen, sodass der Dialog unmittelbar nach dem Klick erscheint. Speichern-Dialog-Modus und Cache sind über das Tampermonkey-Menü konfigurierbar. / Adds a download button to every tweet with media on X.com/Twitter and downloads its images, videos and GIFs via the native "Save as" dialog. Media URLs are prefetched in the background so the dialog opens instantly. Save-as mode and cache are configurable via the Tampermonkey menu. / Добавляет кнопку загрузки под каждый твит с медиа на X.com/Twitter и скачивает его медиафайлы (изображения, видео, GIF) через стандартный диалог «Сохранить как». URL медиа предзагружаются в фоне, поэтому диалог появляется сразу. Режим сохранения и кэш настраиваются через меню Tampermonkey.
// @author       xLoader
// @license      MIT
// @homepageURL  https://github.com/immerzu/xLoader
// @supportURL   https://github.com/immerzu/xLoader/issues
// @updateURL    https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js
// @downloadURL  https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_download
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      x.com
// @connect      twitter.com
// @connect      pbs.twimg.com
// @connect      video.twimg.com
// @connect      abs.twimg.com
// @noframes
// @run-at       document-end
// ==/UserScript==

/*
 * xLoader v1.0.20 (dreisprachige Kurzbeschreibung)
 * ---------------------------------------------------------------------------
 * v1.0.20:
 *  - Kurzbeschreibung (@description) jetzt EN/DE/RU — die Greasy-Fork-Skript-
 *    seite ist damit dreisprachig (konsistent zur GitHub-README).
 * ---------------------------------------------------------------------------
 * v1.0.17 (zweisprachige Beschreibung)
 * ---------------------------------------------------------------------------
 * v1.0.17:
 *  - Beschreibung (@description) zweisprachig (Englisch + Deutsch) — die
 *    Greasy-Fork-Skriptseite zeigt die Kurzbeschreibung damit immer EN/DE.
 * ---------------------------------------------------------------------------
 * v1.0.16 (Dateinamen-Template)
 * ---------------------------------------------------------------------------
 * v1.0.16:
 *  - Neu: Konfigurierbares Dateinamen-Muster (Tampermonkey-Menü, persistiert
 *    in localStorage). Platzhalter: {handle} {id} {index} {ext} {date} {time}
 *    {type}. Default: @{handle}_{id}_{index}.{ext} (bisheriges Verhalten).
 * ---------------------------------------------------------------------------
 * v1.0.15 (Artikel-Card-Bilder)
 * ---------------------------------------------------------------------------
 * v1.0.15:
 *  - Fix: Bilder von Artikel-Cards (verlinkte Artikel) wurden nicht geladen —
 *    sie liegen auf pbs.twimg.com/card_img/... (nicht pbs.twimg.com/media/)
 *    und wurden gefiltert; außerdem fehlte der Medien-Indikator, sodass bei
 *    solchen Tweets gar kein Download-Button erschien. card_img wird jetzt
 *    als Medium erkannt und heruntergeladen (beste Auflösung via srcset).
 * ---------------------------------------------------------------------------
 * v1.0.14 (mehrere Medien pro Tweet)
 * ---------------------------------------------------------------------------
 * v1.0.14:
 *  - Fix: Bei Tweets mit eingebetteten Medien (Quoted-/Link-Cards auf
 *    Detailseiten) wurde der falsche Tweet adressiert: getTweetId nahm den
 *    ersten Zeitstempel (äußerer Tweet), obwohl die sichtbaren Poster zum
 *    eingebetteten Tweet gehörten. getTweetId/getHandle orientieren sich
 *    jetzt am Medien-Element (findMediaElement) und dessen /status/-Link.
 *  - Fix: Es wurden nicht mehr ALLE sichtbaren Medien eines Tweets geladen —
 *    nur noch die, die die X-API liefert. X.com kürzt Medien in Konversations-
 *    Antworten (v. a. Videos verlinkter Tweets). Jetzt werden die API-Medien
 *    um die im DOM sichtbaren Poster/Standbilder ergänzt (mergeDomItems, mit
 *    Dedup: gleiche Media-ID oder URL-Basis) — auch bei Cache-Treffern.
 *  - Neu: Echte Video-MP4s für Poster, die die API nicht liefert: Das Poster
 *    wird angetippt (X.com startet die Wiedergabe), die Voll-MP4 wird aus dem
 *    Performance-Buffer gelesen (video.twimg.com/amplify_video/<id>/vid/avc1/
 *    0/0/<res>/<hash>.mp4) und das Video sofort stummgeschaltet/pausiert.
 *    Schlägt das fehl, bleibt das Poster als Bild-Notnagel.
 * ---------------------------------------------------------------------------
 * v1.0.12 (Fehlerbehebungen)
 * ---------------------------------------------------------------------------
 * v1.0.12:
 *  - Fix: normalizeMediaUrl akzeptierte wieder ALLE URLs — der isMediaUrl-
 *    Filter ging bei der m3u8-Bereinigung in v1.0.9 verloren. Der DOM-
 *    Fallback hätte dadurch auch Avatare/Icons/Emojis/externe Bilder als
 *    Medien heruntergeladen.
 *  - Fix: GM_download ohne timeout — ein hängender Download (Server ohne
 *    Antwort) deaktivierte den Button dauerhaft ("Lädt Medien …"). Jetzt
 *    greift nach CONFIG.requestTimeoutMs (60 s) der ontimeout-Pfad.
 *  - Fix: Live-Token-Retry wurde auch bei HTTP 429 (Rate-Limit) ausgelöst —
 *    der Token ist dort nicht das Problem, der Retry verschärfte das Limit
 *    nur. Token-Retry jetzt nur bei Auth-/Netzwerkfehlern.
 *  - Fix: Tweets im Prefetch-Retry-Cooldown wurden bei erneutem Erscheinen
 *    im DOM sofort neu gestartet (Doppel-Request). schedulePrefetch wartet
 *    jetzt auf den geplanten Retry.
 *  - Verbessert: Medien-Recheck läuft bis zu 3× (vorher genau 1×) — Tweets,
 *    deren Medien erst später laden (Lazy-Loading), bekommen nun doch einen
 *    Download-Button.
 *  - Fix: GIF-Tweets lieferten im DOM-Fallback (API nicht erreichbar) nichts
 *    ("Keine Medien gefunden") — das Poster (tweet_video_thumb) wurde nicht
 *    erkannt. Aus dem Poster wird jetzt die echte MP4-URL abgeleitet
 *    (pbs.twimg.com/tweet_video_thumb/<id> -> video.twimg.com/tweet_video/<id>.mp4,
 *    live verifiziert) — GIFs sind auf X.com MP4-Streams.
 * ---------------------------------------------------------------------------
 * v1.0.11 (Bugfix: "NaN%" im Fortschritt)
 * ---------------------------------------------------------------------------
 * v1.0.11:
 *  - Fix: Bei Downloads ohne brauchbare Größenangabe zeigte das Fortschritts-
 *    Badge "NaN%" — Tampermonkey liefert in onprogress teils fehlende oder
 *    NaN-Werte für done/total (z. B. unbekannte Gesamtgröße). Fehlende/nicht-
 *    endliche Werte werden jetzt ignoriert (Badge bleibt unverändert), nur
 *    gültige Prozente werden angezeigt.
 *  - Badge jetzt nur noch bei Videodateien ab 5 MB (CONFIG.progressBadgeMinBytes):
 *    Bei Bildern und kurzen Videos erscheint keine Fortschrittsanzeige mehr.
 * ---------------------------------------------------------------------------
 * v1.0.10 (Bugfix Fortschrittsanzeige)
 * ---------------------------------------------------------------------------
 * v1.0.10:
 *  - Fix: Fortschrittsanzeige funktionierte nicht — Tampermonkey liefert im
 *    GM_download-onprogress nur { done, total } (Bytes), kein percent. Der
 *    Prozentwert wird jetzt daraus berechnet (progress.percent wird weiterhin
 *    unterstützt, falls ein Manager ihn liefert).
 *  - Neu: Sichtbares Fortschritts-Badge über dem Button (vorher lief die
 *    Anzeige nur über btn.title = Hover-Tooltip und war praktisch nicht
 *    wahrnehmbar). Das Badge zeigt "42%" und verschwindet nach dem Download
 *    automatisch.
 * ---------------------------------------------------------------------------
 * v1.0.9 (Optimierungen)
 * ---------------------------------------------------------------------------
 * v1.0.9:
 *  - Bugfix: x-guest-token-Header hing fälschlich an der ct0-Länge (32) statt
 *    am Guest-Token selbst — der Header wird jetzt immer mitgesendet, wenn ein
 *    Guest-Token existiert.
 *  - Bugfix: Kaputter Live-Token-Fallback (erfundene main.{Timestamp}.js-URL,
 *    garantiert 404) entfernt; der Token wird zuerst direkt im HTML der
 *    Startseite gesucht, erst dann in den echten Script-URLs. Zusätzlich
 *    @connect abs.twimg.com ergänzt (X.com-Scripts liegen dort und wurden von
 *    GM_xmlhttpRequest bisher blockiert).
 *  - Bugfix: Prefetch-Fehler (401/429/Timeout/leere Antwort) blockierten den
 *    Tweet dauerhaft (prefetchSeen blieb gesetzt). Jetzt max. 2 automatische
 *    Retries mit 10-s-Cooldown, danach Aufgeben bis zum nächsten Klick.
 *  - Bugfix: m3u8→mp4-Umbenennung im DOM-Fallback entfernt (erzeugte
 *    potenziell kaputte Downloads — Playlisten lassen sich nicht einfach
 *    umbenennen).
 *  - Neu: Fortschrittsanzeige beim Download (GM_download onprogress) im
 *    Button-Titel ("Lade i/n … 42%").
 *  - Neu: Prefetch nur für sichtbare Tweets (IntersectionObserver,
 *    rootMargin 200px) — deutlich weniger API-Calls beim schnellen Scrollen.
 *  - Fehlermeldungen differenziert: 429 (Rate-Limit) und 401/403 werden
 *    explizit angezeigt statt "Keine Medien gefunden".
 *  - Konsistenz: Log-Präfix [xLoader], localStorage-Keys, data-Attribute und
 *    CSS-Klassen auf xLoader umgestellt (alter Live-Token-Key wird beim
 *    ersten Lesen migriert).
 *  - Metadaten: @homepageURL/@supportURL/@updateURL/@downloadURL auf GitHub
 *    (immerzu/xLoader) ergänzt.
 * ---------------------------------------------------------------------------
 * v1.0.8:
 *  - Live-Token-Retry wird nicht mehr durch einen gecachten (möglicherweise
 *    veralteten) Live-Token blockiert: Bei API-Fehlern (401/403, z. B. nach
 *    Token-Rotation durch X.com) wird jetzt IMMER versucht, einen frischen
 *    Bearer-Token zu holen. Vorher brachen Video-/GIF-Downloads nach einer
 *    Token-Rotation bis zum Ablauf der 1-h-TTL des Caches („Keine Medien
 *    gefunden“).
 *  - Prefetch-Cache-Verhalten korrigiert: Nach einem Download (Cache wird
 *    invalidiert) wird der Tweet jetzt wieder im Hintergrund vorgeladen, wenn
 *    er erneut im DOM erscheint (prefetchSeen-Eintrag wird geleert). Zudem
 *    blockieren abgelaufene Cache-Einträge (TTL 5 min) keinen neuen Prefetch
 *    mehr (getCachedItems statt mediaCache.has).
 * ---------------------------------------------------------------------------
 * v1.0.7 (Optionale Verbesserungen)
 * ---------------------------------------------------------------------------
 * v1.0.7:
 *  - Tampermonkey-Menü (GM_registerMenuCommand):
 *      * "Speichern unter-Dialog" umschalten: nur erstes Medium (Default) oder
 *        alle Medien (persistiert in localStorage)
 *      * "Medien-Cache leeren" (Prefetch-Cache + Queue zurücksetzen)
 *  - Tweet-ID-Extraktion robuster: bevorzugt den Zeitstempel-Link (garantiert
 *    die Haupt-Tweet-ID), dann Links ohne /photo|/video|/analytics-Suffix.
 *    Behebt Randfälle bei Quoted-Tweets und Analytics-Links.
 *  - saveAs-Logik: Bei Modus "nur erster" bekommt nur das erste Medium den
 *    "Speichern unter"-Dialog, weitere Medien gehen direkt in den Download-
 *    Ordner (deutlich weniger Klicks bei Mehrfachmedien).
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
        // Fortschritts-Badge nur bei größeren Videodateien (bei Bildern/
        // kurzen Videos ist die Anzeige sinnlos)
        progressBadgeMinBytes: 5 * 1024 * 1024,
        logPrefix: '[xLoader]',
        btnAttribute: 'data-xloader',
        // Speichern-Dialog-Modus (persistiert): 'first' (nur erstes Medium) | 'all'
        saveAsModeKey: 'xloader-saveas-mode',
        // Dateinamen-Muster (persistiert), Platzhalter:
        // {handle} {id} {index} {ext} {date} {time} {type}
        filenameTemplateKey: 'xloader-filename-template',
        defaultFilenameTemplate: '@{handle}_{id}_{index}.{ext}',
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
            localStorageKey: 'xloader-live-token'
        }
    };

    const CSS = [
        // Layout kommt vom geklonten X.com-Button; hier nur Zähler ausblenden,
        // Hover-/Fehlerfarben und Icon-Stil.
        '.xloader-wrap > button > div > div:nth-child(2) { display: none; }',
        '.xloader-wrap:hover > button > div,',
        '.xloader-btn:hover > div { color: rgb(29, 155, 240); }',
        '.xloader-wrap:hover > button > div > div > div,',
        '.xloader-btn:hover > div > div > div { background-color: rgba(29, 155, 240, 0.1); }',
        '.xloader-wrap:active > button > div > div > div,',
        '.xloader-btn:active > div > div > div { background-color: rgba(29, 155, 240, 0.2); }',
        '.xloader-btn:disabled { opacity: 0.5; cursor: default; }',
        '.xloader-wrap.is-error > button > div,',
        '.xloader-btn.is-error > div { color: rgb(244, 33, 46); }',
        '.xloader-wrap.is-error > button > div > div > div,',
        '.xloader-btn.is-error > div > div > div { background-color: rgba(244, 33, 46, 0.1); }',
        '.xloader-btn svg path {',
        '  fill: none;',
        '  stroke: currentColor;',
        '  stroke-width: 2;',
        '  stroke-linecap: round;',
        '  stroke-linejoin: round;',
        '}',
        // Fortschritts-Badge: sichtbare Prozent-Anzeige während des Downloads
        '.xloader-progress {',
        '  position: absolute;',
        '  top: -8px;',
        '  right: -8px;',
        '  min-width: 22px;',
        '  height: 18px;',
        '  padding: 0 5px;',
        '  border-radius: 9999px;',
        '  background: rgb(29, 155, 240);',
        '  color: #fff;',
        '  font-size: 11px;',
        '  font-weight: 700;',
        '  line-height: 18px;',
        '  text-align: center;',
        '  z-index: 5;',
        '  pointer-events: none;',
        '  box-sizing: border-box;',
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
        // Artikel-Card-Bilder (verlinkte Artikel, pbs.twimg.com/card_img/...)
        if (url.indexOf('pbs.twimg.com/card_img/') !== -1) return true;
        if (url.indexOf('video.twimg.com/') !== -1) return true;
        // Video-Poster als Medien akzeptieren (letzter Notnagel: Standbilder,
        // wenn die X-API die echten Videos nicht liefert — z. B. bei gekürzten
        // Konversations-Antworten). tweet_video_thumb wird von
        // normalizeMediaUrl vorher in die echte GIF-MP4 umgebaut.
        if (/pbs\.twimg\.com\/(amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)\//.test(url)) return true;
        return false;
    }

    function normalizeMediaUrl(url) {
        if (!url || typeof url !== 'string') return null;
        url = url.trim();
        if (!url || url.indexOf('blob:') === 0 || url.indexOf('data:') === 0) return null;
        // GIF-Poster (tweet_video_thumb) -> echte MP4-URL ableiten (X.com-GIFs
        // sind MP4-Streams): pbs.twimg.com/tweet_video_thumb/<id>?format=jpg
        // liefert nur das Poster; video.twimg.com/tweet_video/<id>.mp4 das GIF.
        var gifMatch = url.match(/pbs\.twimg\.com\/tweet_video_thumb\/([A-Za-z0-9_-]+)/);
        if (gifMatch) {
            return 'https://video.twimg.com/tweet_video/' + gifMatch[1] + '.mp4';
        }
        // Nur echte X.com-Medien-URLs akzeptieren (Avatar-/Icon-/Emoji-Bilder
        // und externe URLs gehören nicht in den Download).
        if (!isMediaUrl(url)) return null;
        // m3u8-Playlisten NICHT in .mp4 umbenennen — das erzeugt kaputte
        // Downloads (die Server liefern dann 404 oder falschen Content-Type).
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
     * Liefert das erste Medien-Element eines Tweets (Bild oder Video-Poster).
     * Wird von hasMediaIndicator und getTweetId genutzt.
     */
    function findMediaElement(tweet) {
        var imgs = tweet.querySelectorAll('img');
        for (var i = 0; i < imgs.length; i++) {
            var src = (imgs[i].getAttribute('src') || '') + ' ' + (imgs[i].getAttribute('srcset') || '');
            if (src.indexOf('pbs.twimg.com/media/') !== -1) return imgs[i];
            if (src.indexOf('pbs.twimg.com/card_img/') !== -1) return imgs[i];
            if (/amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb/.test(src)) return imgs[i];
        }
        return tweet.querySelector('video') || null;
    }

    /**
     * Medien-Indikator für die Button-Injektion: true, wenn der Tweet Bilder
     * (pbs.twimg.com/media) ODER Video-/GIF-Poster (amplify_video_thumb,
     * ext_tw_video_thumb, tweet_video_thumb) ODER ein <video>-Element trägt.
     */
    function hasMediaIndicator(tweet) {
        return !!findMediaElement(tweet);
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
            if (!raw) {
                // Migration vom alten Key (downloadhilfe-live-token)
                var legacy = localStorage.getItem('downloadhilfe-live-token');
                if (legacy) {
                    localStorage.setItem(CONFIG.api.localStorageKey, legacy);
                    raw = legacy;
                }
            }
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
        if (cookies.gt) {
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
                        var err = new Error('API HTTP ' + res.status);
                        err.status = res.status;
                        reject(err);
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
                // 1) Zuerst direkt im HTML suchen — Inline-Scripts enthalten den
                //    Token oft bereits.
                var inline = TOKEN_RE.exec(html);
                if (inline && inline[1]) return inline[1];

                // 2) Externe Script-URLs aus dem HTML einsammeln (nur echte
                //    src-URLs — keine erfundenen Cache-Buster-URLs).
                var srcRe = /<script[^>]+src=["']([^"']+)["']/gi;
                var m;
                while ((m = srcRe.exec(html)) !== null) {
                    var url = m[1];
                    if (url.indexOf('//') === 0) url = 'https:' + url;
                    if (url.indexOf('http') !== 0) continue;
                    if (url.indexOf('twimg.com/') === -1 && url.indexOf('twitter.com/') === -1 && url.indexOf('x.com/') === -1) continue;
                    scriptUrls.push(url);
                }

                if (!scriptUrls.length) throw new Error('keine Scripts im HTML');

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
    // Fehlversuche pro Tweet-ID (max. MAX_PREFETCH_RETRIES, dann aufgeben)
    var prefetchRetries = new Map();
    var prefetchQueue = [];
    var activePrefetches = 0;
    var MAX_PREFETCH_RETRIES = 2;
    var PREFETCH_RETRY_DELAY_MS = 10000;

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
        if (!tweetId || getCachedItems(tweetId) !== null || prefetchSeen.has(tweetId)) return;
        // Tweet im Retry-Cooldown (z. B. nach 429) nicht sofort neu starten —
        // der geplante Retry übernimmt das nach PREFETCH_RETRY_DELAY_MS.
        if (prefetchRetries.has(tweetId)) return;
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
                prefetchRetries.delete(tweetId);
                log.info('Prefetch abgeschlossen für Tweet ' + tweetId +
                    ' (' + parsed.media.length + ' Medium/Medien).');
            } else {
                failPrefetch(tweetId, 'leere Medien-Antwort');
            }
        } catch (err) {
            failPrefetch(tweetId, err.message);
        } finally {
            activePrefetches--;
            drainPrefetchQueue();
        }
    }

    /**
     * Behandelt einen fehlgeschlagenen Prefetch: max. MAX_PREFETCH_RETRIES
     * automatische Versuche mit PREFETCH_RETRY_DELAY_MS Cooldown, danach
     * Aufgeben (prefetchSeen bleibt gesetzt -> erst wieder nach einem Klick).
     */
    function failPrefetch(tweetId, reason) {
        var tries = (prefetchRetries.get(tweetId) || 0) + 1;
        if (tries >= MAX_PREFETCH_RETRIES) {
            prefetchRetries.delete(tweetId);
            log.warn('Prefetch für Tweet ' + tweetId + ' endgültig aufgegeben: ' + reason);
            return;
        }
        prefetchRetries.set(tweetId, tries);
        prefetchSeen.delete(tweetId); // Retry erlauben
        setTimeout(function () {
            if (prefetchSeen.has(tweetId) || getCachedItems(tweetId) !== null) return;
            prefetchSeen.add(tweetId);
            log.info('Prefetch-Retry (' + tries + '/' + MAX_PREFETCH_RETRIES + ') für Tweet ' + tweetId);
            prefetch(tweetId); // fire-and-forget
        }, PREFETCH_RETRY_DELAY_MS);
    }

    function drainPrefetchQueue() {
        while (activePrefetches < CONFIG.maxParallelPrefetch && prefetchQueue.length) {
            var tweetId = prefetchQueue.shift();
            prefetch(tweetId); // fire-and-forget
        }
    }

    // ============================ Metadaten (Dateiname) ====================

    function getHandle(tweet) {
        // Bevorzugt den User-Name-Bereich, der zum Medien-Element gehört
        // (bei eingebetteten Tweets kann der erste User-Name der des äußeren
        // Tweets sein).
        var mediaEl = findMediaElement(tweet);
        var userScope = mediaEl ? (mediaEl.closest('div[data-testid="User-Name"]') || null) : null;
        var scope = userScope || tweet;
        var userLink = scope.querySelector('div[data-testid="User-Name"] a[href^="/"]');
        var href = userLink ? (userLink.getAttribute('href') || '') : '';
        var m = href.match(/^\/([^/?#]+)/);
        return m ? m[1] : 'unknown';
    }

    function getTweetId(tweet) {
        // 0) Medien-Element: dessen /status/-Link gehört zum Medien-Tweet.
        //    Wichtig bei eingebetteten Tweets (Quoted-/Link-Cards auf Detail-
        //    seiten), wo der erste Zeitstempel den ÄUSSEREN Tweet liefert und
        //    sonst der falsche Tweet (bzw. nur dessen erstes Medium) geladen
        //    würde.
        var mediaEl = findMediaElement(tweet);
        if (mediaEl) {
            var mediaLink = mediaEl.closest('a[href*="/status/"]');
            var mm0 = mediaLink ? (mediaLink.getAttribute('href') || '').match(/\/status\/(\d+)/) : null;
            if (mm0) return mm0[1];
        }

        // 1) Zeitstempel-Link: zeigt garantiert auf die Haupt-Tweet-ID
        var timeEl = tweet.querySelector('time');
        var timeLink = timeEl ? timeEl.closest('a[href*="/status/"]') : null;
        var m = timeLink ? (timeLink.getAttribute('href') || '').match(/\/status\/(\d+)/) : null;
        if (m) return m[1];

        // 2) Bevorzugt "saubere" Links (ohne /photo|/video|/analytics-Suffix)
        var links = tweet.querySelectorAll('a[href*="/status/"]');
        for (var i = 0; i < links.length; i++) {
            var h = links[i].getAttribute('href') || '';
            if (!/\/status\/\d+\/(photo|video|analytics)/.test(h)) {
                var mm = h.match(/\/status\/(\d+)/);
                if (mm) return mm[1];
            }
        }
        // 3) Letzter Fallback: irgendein /status/-Link
        for (var j = 0; j < links.length; j++) {
            var mm2 = (links[j].getAttribute('href') || '').match(/\/status\/(\d+)/);
            if (mm2) return mm2[1];
        }
        return String(Date.now());
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

    /**
     * Extrahiert die Media-ID aus einer X.com-Medien-URL (amplify_video,
     * ext_tw_video, tweet_video ...). Dient der Deduplizierung: Ein Poster,
     * dessen Video die API bereits liefert, wird nicht doppelt geladen.
     */
    function mediaIdOf(url) {
        var m = String(url).match(/(?:amplify_video|ext_tw_video|tweet_video)[^/]*\/([A-Za-z0-9_-]+)/);
        return m ? m[1] : null;
    }

    // ============================ Download-Mechanismus ====================

    /**
     * Startet den Download direkt über GM_download mit der URL. saveAs: true
     * öffnet den nativen "Speichern unter"-Dialog sofort; bei saveAs: false
     * wird direkt in den Download-Ordner gespeichert (Modus "nur erster").
     */
    function downloadUrl(url, filename, saveAs, onProgress) {
        return new Promise(function (resolve, reject) {
            var opts = {
                url: url,
                name: filename,
                saveAs: saveAs,
                timeout: CONFIG.requestTimeoutMs,
                onload: function () {
                    resolve();
                },
                onerror: function (err) {
                    reject(new Error('GM_download: ' + (err && err.error ? err.error : 'unbekannter Fehler')));
                },
                ontimeout: function () {
                    reject(new Error('GM_download: Timeout'));
                }
            };
            if (typeof onProgress === 'function') opts.onprogress = onProgress;
            GM_download(opts);
        });
    }

    // ============================ Menü & Konfiguration ====================

    // 'first' = nur erstes Medium bekommt den "Speichern unter"-Dialog
    // 'all'   = jedes Medium bekommt einen eigenen Dialog (früheres Verhalten)
    var saveAsMode = getSaveAsMode();

    function getSaveAsMode() {
        try {
            var m = localStorage.getItem(CONFIG.saveAsModeKey);
            return (m === 'all' || m === 'first') ? m : 'first';
        } catch (e) {
            return 'first';
        }
    }

    function persistSaveAsMode() {
        try {
            localStorage.setItem(CONFIG.saveAsModeKey, saveAsMode);
        } catch (e) { /* ignore */ }
    }

    function toggleSaveAsMode() {
        saveAsMode = (saveAsMode === 'first') ? 'all' : 'first';
        persistSaveAsMode();
        log.info('Speichern unter-Dialog-Modus: ' + (saveAsMode === 'first' ? 'nur erstes Medium' : 'alle Medien'));
    }

    // ============================ Dateinamen-Template ====================

    function getFilenameTemplate() {
        try {
            var t = localStorage.getItem(CONFIG.filenameTemplateKey);
            return (t && t.trim()) ? t.trim() : CONFIG.defaultFilenameTemplate;
        } catch (e) {
            return CONFIG.defaultFilenameTemplate;
        }
    }

    function setFilenameTemplate(t) {
        try {
            localStorage.setItem(CONFIG.filenameTemplateKey, t);
        } catch (e) { /* ignore */ }
    }

    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    /**
     * Ersetzt die Platzhalter {handle} {id} {index} {ext} {date} {time} {type}
     * im Dateinamen-Muster. Unbekannte Platzhalter werden entfernt.
     */
    function formatFilename(template, data) {
        var now = new Date();
        var type = (/^(jpe?g|png|webp)$/i.test(data.ext || '')) ? 'image' : 'video';
        var map = {
            handle: data.handle || 'unknown',
            id: data.id || '',
            index: data.index || 1,
            ext: data.ext || 'jpg',
            date: now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()),
            time: pad2(now.getHours()) + '-' + pad2(now.getMinutes()) + '-' + pad2(now.getSeconds()),
            type: type
        };
        return String(template).replace(/\{([a-zA-Z]+)\}/g, function (m, key) {
            return (key in map) ? String(map[key]) : '';
        });
    }

    function clearMediaCache() {
        var before = mediaCache.size;
        mediaCache.clear();
        prefetchSeen.clear();
        prefetchRetries.clear();
        prefetchQueue.length = 0;
        log.info('Medien-Cache geleert (' + before + ' Einträge entfernt).');
    }

    function setupMenu() {
        if (typeof GM_registerMenuCommand !== 'function') return;
        GM_registerMenuCommand(
            'Speichern unter: ' + (saveAsMode === 'first' ? 'nur erstes Medium (klicken → alle)' : 'alle Medien (klicken → nur erstes)'),
            toggleSaveAsMode
        );
        GM_registerMenuCommand('Medien-Cache leeren', clearMediaCache);
        GM_registerMenuCommand('Dateinamen-Muster ändern: ' + getFilenameTemplate(), function () {
            var t = prompt(
                'Dateinamen-Muster (Platzhalter: {handle} {id} {index} {ext} {date} {time} {type}):',
                getFilenameTemplate()
            );
            if (t !== null && t.trim()) {
                setFilenameTemplate(t.trim());
                log.info('Dateinamen-Muster: ' + getFilenameTemplate());
            }
        });
    }

    // ============================ Button-Verhalten =========================

    function setBusy(btn, busy) {
        btn.disabled = busy;
        btn.title = busy ? 'Lädt Medien …' : 'Medien herunterladen';
    }

    function getWrap(btn) {
        return btn.closest ? btn.closest('.xloader-wrap') : null;
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
     * Sichtbare Fortschrittsanzeige: kleines Badge über dem Button-Wrapper.
     * Erscheint nur während eines Downloads (hideProgress blendet es aus).
     */
    function showProgress(btn, percent) {
        var wrap = getWrap(btn) || btn;
        if (!wrap.style.position) wrap.style.position = 'relative';
        var badge = wrap.querySelector('.xloader-progress');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'xloader-progress';
            wrap.appendChild(badge);
        }
        badge.textContent = percent + '%';
        badge.style.display = 'block';
    }

    function hideProgress(btn) {
        var wrap = getWrap(btn) || btn;
        var badge = wrap.querySelector('.xloader-progress');
        if (badge) badge.style.display = 'none';
    }

    // Letzter HTTP-Status der X-API beim Live-Fallback (für Fehlermeldungen)
    var lastApiStatus = null;

    /**
     * URL-Basis ohne Query/Hash und ohne Dateiendung — für die Deduplizierung
     * (die API liefert z. B. ".../X.jpg?name=orig", das DOM ".../X?format=jpg&
     * name=900x900" — beides ist dasselbe Bild).
     */
    function normBase(url) {
        return String(url).split('?')[0].split('#')[0].replace(/\.(jpe?g|png|gif|webp|mp4)$/i, '');
    }

    function findPosterElementByMediaId(tweet, mediaId) {
        if (!mediaId) return null;
        var imgs = tweet.querySelectorAll('img');
        for (var i = 0; i < imgs.length; i++) {
            var src = (imgs[i].getAttribute('src') || '') + ' ' + (imgs[i].getAttribute('srcset') || '');
            if (src.indexOf('_thumb/' + mediaId) !== -1) return imgs[i];
        }
        return null;
    }

    /**
     * Findet die echte Video-MP4 eines Posters, indem das Poster angetippt wird
     * (X.com startet die Wiedergabe) und die URL aus dem Performance-Buffer
     * gelesen wird. X.com lädt dabei die Voll-MP4 (vid/avc1/0/0/...mp4), deren
     * Hash nirgendwo sonst verfügbar ist (API liefert ihn nicht). Das Video
     * wird sofort stummgeschaltet und pausiert.
     */
    async function resolvePosterVideoUrl(tweet, mediaId) {
        var posterEl = findPosterElementByMediaId(tweet, mediaId);
        if (!posterEl || !posterEl.isConnected) return null;
        // Nur für amplify/ext_tw-Poster — tweet_video_thumb (GIFs) sind schon
        // in echte MP4-URLs umgebaut (normalizeMediaUrl).
        var src = (posterEl.getAttribute('src') || '') + ' ' + (posterEl.getAttribute('srcset') || '');
        if (src.indexOf('tweet_video_thumb') !== -1) return null;

        try {
            var player = posterEl.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"], div[role="button"]') || posterEl.parentElement;
            if (!player) return null;
            performance.clearResourceTimings();
            player.click();

            var deadline = Date.now() + 5000;
            while (Date.now() < deadline) {
                var entries = performance.getEntriesByType('resource');
                for (var i = entries.length - 1; i >= 0; i--) {
                    var u = entries[i].name;
                    if (u.indexOf('video.twimg.com/amplify_video/' + mediaId + '/vid/avc1/') !== -1 &&
                        /\.mp4(\?|$)/.test(u) && u.indexOf('.m4s') === -1 && u.indexOf('.m3u8') === -1) {
                        // Video stumm + pausiert, damit keine Wiedergabe hörbar ist
                        var article = posterEl.closest('article[data-testid="tweet"]');
                        if (article) {
                            var vids = article.querySelectorAll('video');
                            for (var v = 0; v < vids.length; v++) { vids[v].muted = true; vids[v].pause(); }
                        }
                        return u;
                    }
                }
                await new Promise(function (r) { setTimeout(r, 300); });
            }
        } catch (e) { /* Stille ignorieren — Poster bleibt dann Bild-Notnagel */ }
        return null;
    }

    /**
     * Ergänzt API-Medien um die im DOM sichtbaren Poster/Standbilder, die die
     * API nicht liefert (X.com kürzt Medien in Konversations-Antworten). Für
     * Video-Poster wird versucht, die echte MP4 per Wiedergabe-Resolver zu
     * finden; sonst bleibt das Poster als Bild-Notnagel. Überspringt Medien,
     * die bereits vorhanden sind (gleiche Media-ID oder URL-Basis). Idempotent.
     */
    async function mergeDomItems(tweet, items) {
        var result = items.slice();
        var domUrls = extractDomMedia(tweet);
        for (var d = 0; d < domUrls.length; d++) {
            var domUrl = domUrls[d];
            var domId = mediaIdOf(domUrl);
            var domBase = normBase(domUrl);
            var duplicate = false;
            for (var k = 0; k < result.length; k++) {
                var it = result[k];
                var itId = mediaIdOf(it.url);
                var itBase = normBase(it.url);
                if ((domId && domId === itId) || domBase === itBase) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate) continue;
            // Für Video-Poster die echte MP4 versuchen (nur wenn das Poster
            // selbst nicht schon als MP4 vorliegt, z. B. GIFs).
            var resolved = null;
            if (domUrl.indexOf('.mp4') === -1 && domUrl.indexOf('tweet_video/') === -1) {
                resolved = await resolvePosterVideoUrl(tweet, domId);
            }
            if (resolved) {
                result.push({ url: resolved, ext: 'mp4' });
            } else {
                result.push({ url: domUrl, ext: extFromUrl(domUrl) });
            }
        }
        return result;
    }

    /**
     * Live-Fallback für den Klick (Cache-Miss): API -> Live-Token-Retry ->
     * DOM (Bilder). Liefert ein Array von { url, ext }.
     */
    async function loadItemsLive(tweet, tweetId) {
        var items = [];
        var apiFailed = false;
        try {
            var data = await fetchTweetData(tweetId);
            items = parseApiData(data, tweetId).media;
        } catch (apiErr) {
            apiFailed = true;
            lastApiStatus = apiErr.status || null;
            log.warn('API-Fehler (' + apiErr.message + ').');
        }

        // Live-Token-Retry auch bei bereits gecachtem (möglicherweise veraltetem)
        // Token versuchen — X.com rotiert diese Tokens regelmäßig; ein stale
        // Token würde sonst jeden 401-Fall blockieren (Videos/GIFs brechen).
        if (!items.length && lastApiStatus !== 429 && (apiFailed || !liveToken)) {
            log.info('Versuche Live-Bearer-Token-Retry …');
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

        // DOM-Medien ergänzen (Poster/Standbilder, die die API nicht liefert)
        return mergeDomItems(tweet, items);    }

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
        lastApiStatus = null;
        var items = getCachedItems(tweetId);

        if (items && items.length) {
            log.info('Cache-Treffer für Tweet ' + tweetId + ' — sofortiger Download.');
        } else {
            if (mediaCache.has(tweetId)) mediaCache.delete(tweetId); // abgelaufen
            items = await loadItemsLive(tweet, tweetId);
        }
        // Immer DOM-Poster/Standbilder ergänzen — auch bei Cache-Treffer,
        // sonst fehlen Medien, die die API (bzw. der Prefetch) nicht liefert.
        items = await mergeDomItems(tweet, items || []);

        if (!items.length) {
            setBusy(btn, false);
            var msg = 'Keine Medien gefunden';
            if (lastApiStatus === 429) {
                msg = 'Rate-Limit (429) - kurz warten, dann erneut versuchen';
            } else if (lastApiStatus === 401 || lastApiStatus === 403) {
                msg = 'Zugriff verweigert (' + lastApiStatus + ')';
            }
            flashError(btn, msg);
            log.warn('Keine Medien für Tweet ' + tweetId + ' gefunden (Cache + API + DOM). API-Status: ' + lastApiStatus);
            return;
        }

        var failed = 0;
        for (var i = 0; i < items.length; i++) {
            var filename = sanitizeFilenamePart(formatFilename(getFilenameTemplate(), {
                handle: handle,
                id: tweetId,
                index: i + 1,
                ext: items[i].ext
            }));
            var saveAs = (saveAsMode === 'all') || (i === 0);
            // Fortschritts-Badge nur bei Videos relevant (Bilder/kurze Videos: nein)
            var isVideo = (items[i].ext === 'mp4');
            try {
                log.info('Lade Medien ' + (i + 1) + '/' + items.length + ' → ' + filename);
                await downloadUrl(items[i].url, filename, saveAs, function (progress) {
                    // Badge nur bei Videodateien ab einer Mindestgröße — bei
                    // Bildern und kurzen Videos wird nichts angezeigt.
                    if (!progress || !isVideo) return;
                    var total = Number(progress.total);
                    if (!isFinite(total) || total < CONFIG.progressBadgeMinBytes) return;
                    // Tampermonkey liefert { done, total } (Bytes) — percent
                    // existiert dort nicht, wird aber unterstützt, falls ein
                    // anderer Manager ihn liefert. done kann fehlen oder NaN
                    // sein (z. B. unbekannte Gesamtgröße) — dann wird kein
                    // Prozentwert angezeigt statt "NaN%".
                    var pct = progress.percent;
                    if (typeof pct !== 'number') {
                        var done = Number(progress.done);
                        if (isFinite(done) && isFinite(total) && total > 0) {
                            pct = Math.round((done / total) * 100);
                        }
                    }
                    if (typeof pct === 'number' && isFinite(pct)) {
                        pct = Math.max(0, Math.min(100, Math.round(pct)));
                        showProgress(btn, pct);
                        btn.title = 'Lade ' + (i + 1) + '/' + items.length + ' … ' + pct + '%';
                    }
                });
                log.info('Gespeichert: ' + filename);
            } catch (err) {
                failed++;
                log.error('Download fehlgeschlagen (' + items[i].url + '): ' + err.message);
            }
        }
        hideProgress(btn);

        // Cache invalidieren: X.com-URLs sind temporär; ein erneuter Klick
        // lädt die Medien frisch (Live-Fallback). Zusätzlich prefetchSeen
        // leeren, damit der Tweet beim nächsten Erscheinen wieder im
        // Hintergrund vorgeladen werden kann (Cache füllen).
        mediaCache.delete(tweetId);
        prefetchSeen.delete(tweetId);

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

        if (clone !== btn) clone.classList.add('xloader-wrap');
        btn.classList.add('xloader-btn');

        btn.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            onDownloadClick(tweet, btn);
        });

        actionBar.appendChild(clone);
        return btn;
    }

    /**
     * Plant den Prefetch erst, wenn der Tweet sichtbar wird (Intersection-
     * Observer, rootMargin 200px). Tweets, die beim Scrollen nur kurz durchs
     * DOM laufen und nie sichtbar werden, kosten so keine API-Calls.
     * Fallback ohne IntersectionObserver: sofortiger Prefetch wie bisher.
     */
    var prefetchObserver = null;

    function observeForPrefetch(tweet) {
        if (!('IntersectionObserver' in window)) {
            schedulePrefetch(tweet);
            return;
        }
        if (!prefetchObserver) {
            prefetchObserver = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) {
                        var t = entries[i].target;
                        prefetchObserver.unobserve(t);
                        schedulePrefetch(t);
                    }
                }
            }, { rootMargin: '200px 0px' });
        }
        prefetchObserver.observe(tweet);
    }

    // Maximale Anzahl Medien-Rechecks pro Tweet (Lazy-Loading-Abdeckung)
    var MAX_TWEET_RECHECKS = 3;

    function processTweet(tweet) {
        if (!tweet || !tweet.isConnected) return;
        if (tweet.querySelector('button[' + CONFIG.btnAttribute + ']')) return;

        if (hasMediaIndicator(tweet)) {
            var btn = createButton(tweet);
            if (btn) log.info('Download-Button eingefügt für Tweet ' + getTweetId(tweet));
            // Medien-URLs im Hintergrund vorladen, sobald der Tweet sichtbar ist
            observeForPrefetch(tweet);
        } else {
            // Medien können nachgeladen werden (z. B. Lazy-Loading) — Recheck
            // bis zu MAX_TWEET_RECHECKS Mal, dann aufgeben.
            var rechecks = parseInt(tweet.dataset.xloaderRechecked || '0', 10);
            if (rechecks < MAX_TWEET_RECHECKS) {
                tweet.dataset.xloaderRechecked = String(rechecks + 1);
                setTimeout(function () {
                    if (tweet.isConnected && !tweet.querySelector('button[' + CONFIG.btnAttribute + ']')) {
                        processTweet(tweet);
                    }
                }, CONFIG.recheckDelayMs);
            }
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
        setupMenu();
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

        log.info('xLoader v1.0.20 aktiv — überwache ' + CONFIG.tweetSelector + ' …');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
