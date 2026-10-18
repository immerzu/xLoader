# HANDOVER — xLoader, vollständiger Übergabebericht

**Zielgruppe:** nachfolgender Agent ohne Vorkenntnis dieses Projekts.
**Stand:** 2026-10-18, Arbeitsdatei `xLoader.user.js`, `@version 1.0.23`, 1531 Zeilen.
**Belege:** Code vollständig gelesen; `node --check xLoader.user.js` → exit 0;
`node C:\Users\lolo\dh-test\xloader\dom-media-test.js xLoader.user.js` → 11/11 PASS;
`git log`/`git status` geprüft. Alle Zeilenangaben unten beziehen sich auf **v1.0.23**.

---

## 1. Was das Projekt ist

- Ein **Userscript** (Tampermonkey/Greasemonkey) für **X.com und twitter.com**.
- Zweck: **ein Download-Button pro Tweet mit Medien**; ein Klick öffnet den nativen
  „Speichern unter"-Dialog (Bilder, Videos, GIFs). Medien-URLs werden im Hintergrund
  vorgeladen, damit der Dialog sofort erscheint.
- Veröffentlicht bei **Greasy Fork 589456** (Account `immerzu`), Quellcode auf
  **GitHub `immerzu/xLoader`** (öffentlich, Branch `main`). Auto-Update läuft über
  `@updateURL`/`@downloadURL` = raw GitHub `main`.
- Keine Server, kein Tracking, keine externen Abhängigkeiten, keine Build-Kette
  (reine Datei, kein Transpiler). Lizenz MIT.

## 2. Repo-Struktur (alles unter `F:\001_Coding_Projekte\xLoader\`)

| Pfad | Rolle |
|---|---|
| `xLoader.user.js` | **einzige Arbeitsdatei**; Metablock + Changelog-Kommentar (v1.0.4–v1.0.23) + Code |
| `README.md` | dreisprachige Projektseite (EN/DE/RU): Installation, Features, „How it works", Versionshistorie, „Development" |
| `description.md` | Text für Greasy Fork „Zusätzliche Informationen" (DE → RU → EN, je ein Absatz, keine Flaggen-Überschriften); als zweite GF-Sync-Quelle hinterlegt |
| `ru-board_xloader_post.md` | russischer Forum-Beitragsentwurf (Forum 31, Thread 20664/20659) |
| `Ausgabe/` | Versionsarchive `xLoader-v1.0.X.js`; **gitignored, nie committen** |
| `memory/` | Projektgedächtnis: `MEMORY.md` (Index), `FACT.md` (Fakten), `JOURNAL.jsonl`, `user_lolo.md`, `HANDOVER_*.md` |
| `.reasonix/` | Altbestand (Skills/Attachments aus Reasonix-Zeit), **untracked** |
| `.gitignore` | `.playwright-mcp/`, `node_modules/`, `_tmp_*`, `Ausgabe/` |
| außerhalb | `C:\Users\lolo\dh-test\xloader\dom-media-test.js` — optionaler DOM-Regressionstest (bewusst nicht im Repo) |

## 3. Metablock (L1–L27) — verbindlich

- `@name xLoader`, `@namespace https://github.com/immerzu/xLoader`, `@author xLoader`, `@license MIT`
- `@version 1.0.23` (**jede Veröffentlichung hebt sie an; GF lehnt identische Versionen ab**)
- **Lokalisierte Beschreibung** (seit v1.0.23): `@description` = deutsche Zeile (Default,
  entspricht GF-Skript-Locale `de`) + `@description:en` + `@description:ru`.
  Kein `@description:de`, keine `@name:xx`-Zeilen. Grund: GF-Suche filtert nach Sprache.
- `@match https://x.com/*`, `@match https://twitter.com/*`
- Grants: `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`
- `@connect x.com`, `twitter.com`, `pbs.twimg.com`, `video.twimg.com`, `abs.twimg.com`
- `@noframes`, `@run-at document-end`

**Nicht ändern ohne Grund:** Grants/`@connect`/`@match`/`@noframes` sind funktional
notwendig (API-Call, Token-Suche in `abs.twimg.com`-Scripts, kein Doppel-Button in iframes).

## 4. Aufbau der Datei

1. **Metablock** (L1–27)
2. **Changelog-Kommentar** (L29–259): neuester Block oben (`v1.0.23:`), darunter absteigend
   bis v1.0.4 + Hintergrundnotizen (X.com rendert Videos nur als Poster; `window.__INITIAL_STATE__`
   existiert nicht mehr).
3. **IIFE** `(function(){ 'use strict'; … })()` ab **L261**, Ende L1531.
4. Startschalter L1526–1530: bei `readyState === 'loading'` → `DOMContentLoaded`, sonst `init()`.

## 5. Funktionskatalog (Zeilen = v1.0.23)

| Bereich | Funktion | Zeile | Rolle |
|---|---|---|---|
| Konfig | `CONFIG` | 266 | Selektoren, Timeouts, Cache-Grenzen, API, localStorage-Keys |
| Style | `CSS` | 310 | Hover-/Fehlerfarben, Zähler ausblenden, Fortschritts-Badge (`.xloader-progress`), SVG-Stroke |
| Icon | `SVG_ICON_INNER` | 356 | drei Pfade (Pfeil + Basislinie), wird in geklontes X-SVG gesetzt |
| Logging | `log.info/warn/error` | 360 | Präfix `[xLoader]` |
| DOM-Medien | `isMediaUrl` | 375 | akzeptiert `pbs.twimg.com/media/`, `pbs.twimg.com/card_img/`, `video.twimg.com/`, `*_video_thumb/`-Poster |
| DOM-Medien | `normalizeMediaUrl` | 394 | verwirft `blob:`/`data:`; **GIF-Poster `tweet_video_thumb/<id>` → `video.twimg.com/tweet_video/<id>.mp4`**; sonst `isMediaUrl`-Filter; m3u8 bleibt unverändert |
| DOM-Medien | `bestImageUrl` | 413 | srcset: bevorzugt `name=orig`/`4096x4096`, sonst letzter Eintrag, sonst `currentSrc`/`src` |
| DOM-Medien | `collectVideoUrls` | 433 | `<source>`, `src`, `currentSrc`, `data-*`-Attribute |
| DOM-Medien | `urlsFromStyle` | 447 | `url(...)` aus `style` |
| DOM-Medien | `extractDomMedia` | 459 | sichtbare Medien eines Tweets; **Guard: `el.closest('article[data-testid="tweet"]') === tweet`** |
| DOM-Medien | `findMediaElement` | 512 | erstes Bild mit Medien-URL oder `<video>` |
| DOM-Medien | `hasMediaIndicator` | 528 | Button-Voraussetzung |
| Auth | `getCookies` | 534 | Cookie-Map (`ct0`, `gt`, `lang`, `auth_token` ungenutzt) |
| Auth | `getCachedLiveToken` | 549 | localStorage, TTL 1 h, migriert Alt-Key `downloadhilfe-live-token` |
| Auth | `cacheLiveToken` | 570 | schreibt `{token, ts}` |
| API | `fetchTweetData` | 584 | GET `location.origin + /i/api/2/timeline/conversation/<id>.json?tweet_mode=extended&include_entities=true&include_user_entities=false` |
| API | `collectTweetObjects` | 630 | rekursiv, WeakSet-Guard; erkennt Objekte mit `id_str`/`id` **und** (`extended_entities` \| `entities` \| `full_text`) |
| API | `apiMediaFromTweet` | 658 | photo → `originalImageUrl` (`name=orig`), video/animated_gif → MP4-Variante mit höchster `bitrate`, `ext: 'mp4'` |
| API | `originalImageUrl` | 692 | setzt Query `name=orig` |
| API | `parseApiData` | 707 | Tweet per ID; ohne Medien Fallback auf `quoted_status_id_str`/`retweeted_status_id_str` |
| Auth | `fetchLiveBearerToken` | 728 | Token zuerst im Startseiten-HTML, dann in bis zu 5 echten Script-URLs (nur twimg/twitter/x.com), sequenzielle Promise-Kette |
| Cache | `getCachedItems` | 800 | TTL 5 min, löscht abgelaufene Einträge |
| Cache | `schedulePrefetch` | 816 | Guards: connected, keine Cache-Items, nicht `prefetchSeen`, nicht im Retry-Cooldown, Queue < 30 |
| Cache | `prefetch` | 830 | API-Call, Cache nur bei Medien; sonst `failPrefetch` |
| Cache | `failPrefetch` | 856 | max. 2 Retries, 10 s Cooldown, dann endgültig aufgeben (`prefetchSeen` bleibt) |
| Cache | `drainPrefetchQueue` | 873 | max. 3 parallel |
| Namen | `getHandle` | 882 | Handle aus `div[data-testid="User-Name"] a[href^="/"]` |
| Namen | `getTweetId` | 895 | 0) `/status/`-Link am Medien-Element, 1) `time`-Link, 2) „sauberer" Link, 3) irgendein `/status/`-Link, sonst `Date.now()` |
| Namen | `sanitizeFilenamePart` | 931 | ersetzt `\ / : * ? " < > \|` durch `_` |
| Namen | `extFromUrl` | 935 | `format=gif` → gif; `.mp4/.gif/.webp/.png/.jpe?g`; `format=`; sonst jpg |
| Namen | `mediaIdOf` | 949 | ID aus `amplify_video`/`ext_tw_video`/`tweet_video`-URLs (Dedup) |
| Download | `downloadUrl` | 961 | `GM_download({url, name, saveAs, timeout, onprogress})`, Fehler/Timeout → reject |
| Menü | `saveAsMode` | 987 | Modul-Zustand `'first'` (Default) \| `'all'` |
| Menü | `getSaveAsMode`/`persistSaveAsMode`/`toggleSaveAsMode` | 989/998/1004 | localStorage `xloader-saveas-mode` |
| Namen | `getFilenameTemplate`/`setFilenameTemplate` | 1012/1021 | localStorage `xloader-filename-template` |
| Namen | `pad2` | 1027 | zweistellig |
| Namen | `formatFilename` | 1035 | Platzhalter `{handle}{id}{index}{ext}{date}{time}{type}`; unbekannte → leer; `type` = image/video (jpg/png/webp = image) |
| Menü | `clearMediaCache` | 1052 | leert `mediaCache`, `prefetchSeen`, `prefetchRetries`, `prefetchQueue` |
| Menü | `setupMenu` | 1061 | 3 Einträge: Speichern-Modus (Label zeigt aktuellen Modus), Cache leeren, Dateinamen-Muster (`prompt`) |
| UI | `setBusy` | 1082 | `disabled` + `title` „Lädt Medien …" |
| UI | `getWrap` | 1087 | `.xloader-wrap` |
| UI | `flashError` | 1091 | 2,5 s rot (`is-error`), Titel = Meldung |
| UI | `showProgress`/`hideProgress` | 1108/1121 | Badge `.xloader-progress`, setzt ggf. `position: relative` am Wrapper |
| Fehler | `lastApiStatus` | 1128 | letzter HTTP-Status für Fehlermeldung (globale Variable) |
| Dedup | `normBase` | 1135 | URL ohne Query/Hash/Endung |
| Resolver | `findPosterElementByMediaId` | 1139 | Bild mit `_thumb/<mediaId>` in `src`/`srcset` |
| Resolver | `resolvePosterVideoUrl` | 1156 | **Poster klicken → Performance-Buffer pollen (5 s, 300 ms) → `video.twimg.com/amplify_video/<id>/vid/avc1/…mp4`**, Videos im Artikel stumm+pausiert; GIF-Poster (tweet_video_thumb) skipped |
| Merge | `mergeDomItems` | 1199 | API-Items + DOM-Medien, Dedup über Media-ID **oder** `normBase`; für Poster ohne `.mp4` Resolver, sonst Poster als Bild; idempotent |
| Klick | `loadItemsLive` | 1236 | API → Live-Token-Retry → `mergeDomItems` |
| Klick | `onDownloadClick` | 1275 | Cache → live → Merge → Download-Schleife → Cache-Invalidierung |
| Button | `createButton` | 1374 | klont letzten `:scope > div`-Wrapper mit `button` aus `div[role="group"]` |
| Prefetch | `prefetchObserver`/`observeForPrefetch` | 1424/1426 | IntersectionObserver, `rootMargin: '200px 0px'`, `unobserve` nach Treffer; ohne IO sofortiger Prefetch |
| Scan | `MAX_TWEET_RECHECKS` | 1446 | 3 |
| Scan | `processTweet` | 1448 | Button vorhanden → skip; Medien-Indikator → Button + Prefetch; sonst Recheck (2 s, max. 3×) |
| Scan | `scanInitial` | 1472 | alle `article[data-testid="tweet"]` |
| Scan | `scheduleProcess` | 1483 | rAF-Bündelung, `Set`-Dedup, sammelt auch verschachtelte Tweets |
| Init | `init` | 1506 | `GM_addStyle(CSS)`, `setupMenu()`, `scanInitial()`, MutationObserver auf `document.body` (childList+subtree), Init-Log |

## 6. Datenflüsse

### 6.1 Injektion
`init` → `scanInitial` → `processTweet` je Tweet; parallel MutationObserver → `scheduleProcess`
(rAF) → `processTweet`. Voraussetzung: `hasMediaIndicator` (Bild/Poster/Video), sonst Recheck
bis 3× alle 2 s (Lazy-Loading). Button-Existenz wird über `button[data-xloader]` erkannt.

### 6.2 Prefetch (Hintergrund)
Nur wenn Tweet **sichtbar** wird (IO, 200 px Rand). `schedulePrefetch` → Queue (max. 30) →
`prefetch` (max. 3 parallel) → `fetchTweetData(tweetId)` → `parseApiData` → Cache
`Map<tweetId, {items, fetchedAt}>`, TTL 5 min. Fehler: max. 2 Retries nach 10 s, dann still
aufgeben. **Prefetch cached nur API-Items — DOM-Merge passiert erst beim Klick.**

### 6.3 Klick (Fallback-Kette, L1275 ff.)
1. `btn.disabled` → Doppelklick-Guard; Button sofort sperren.
2. `getTweetId` + `getHandle` + `sanitizeFilenamePart`.
3. Cache-Treffer → sofort; Cache-Miss → `loadItemsLive`:
   a. `fetchTweetData` → `parseApiData`;
   b. bei Fehler **und** Status ≠ 429 **und** (`apiFailed` **oder** kein Live-Token) →
      `fetchLiveBearerToken` → Token cachen → erneuter API-Call;
   c. `mergeDomItems` (DOM-Poster/Standbilder ergänzen).
4. Immer noch `mergeDomItems` (auch bei Cache-Treffer).
5. Keine Items → Fehlermeldung differenziert: 429 Rate-Limit, 401/403 Zugriff verweigert,
   sonst „Keine Medien gefunden".
6. Download-Schleife: `formatFilename` → `sanitizeFilenamePart` → `downloadUrl` mit
   `saveAs = (mode === 'all') || i === 0`; Fortschritts-Badge nur bei `ext === 'mp4'` **und**
   `total ≥ 5 MB`; Prozent aus `percent` oder `done/total`, NaN/unendlich → kein Badge.
7. `hideProgress`, Cache-Delete, `prefetchSeen`-Delete, Button freigeben, bei Fehlern
   „n von m fehlgeschlagen" (rot).

### 6.4 Live-Bearer-Token
Guest-Bearer fest im Code (L303, Kopie aus x.com `main.js`). Bei Auth-Fehlern: `fetchLiveBearerToken`
sucht `/"A{20,}…{40,}"/` im Startseiten-HTML, dann in ≤ 5 Script-URLs; Ergebnis in
`localStorage.xloader-live-token` mit 1 h TTL. Header immer: `authorization`, `x-twitter-active-user`,
`x-twitter-client-language` (aus Cookie `lang`, sonst `en`), `x-csrf-token` (aus `ct0`),
`x-guest-token` (aus `gt`, nur wenn vorhanden).

### 6.5 Video-MP4-Resolver (`resolvePosterVideoUrl`)
X liefert echte `amplify_video`-MP4s (mit Hash) nirgends im DOM. Trick: Poster-Container
`click()` (X startet Wiedergabe) → `performance.getEntriesByType('resource')` nach
`video.twimg.com/amplify_video/<id>/vid/avc1/…mp4` pollen (max. 5 s, alle 300 ms, `.m4s`/`.m3u8`
ausgeschlossen) → Video stumm + `pause()`. Ergebnis wird in `mergeDomItems` als `{url, ext:'mp4'}`
übernommen; scheitert es, bleibt das Poster als Bild (Standbild-Notnagel).

## 7. Zustand / Persistenz

| Speicher | Key / Struktur | Inhalt |
|---|---|---|
| localStorage | `xloader-saveas-mode` | `first` \| `all` |
| localStorage | `xloader-filename-template` | Dateinamen-Muster, Default `@{handle}_{id}_{index}.{ext}` |
| localStorage | `xloader-live-token` | `{token, ts}`, TTL 1 h, Alt-Key-Migration |
| RAM | `mediaCache` | `Map<tweetId, {items, fetchedAt}>` |
| RAM | `prefetchSeen` | Set geplanter/gestarteter Prefetches |
| RAM | `prefetchRetries` | Map ID → Fehlversuche |
| RAM | `prefetchQueue`, `activePrefetches` | Queue (max. 30), Parallelität (max. 3) |
| DOM | `data-xloader` | Button-Marker |
| DOM | `data-xloader-rechecked` | Recheck-Zähler (als `dataset.xloaderRechecked`) |

localStorage ist **pro Origin** getrennt — Einstellungen gelten je `x.com` und `twitter.com` separat.

## 8. Medien-Domains

- `pbs.twimg.com/media/…` — Bilder, Original via `?name=orig`
- `pbs.twimg.com/card_img/…` — Artikel-Card-Bilder (seit v1.0.15)
- `pbs.twimg.com/{amplify_video_thumb,ext_tw_video_thumb,tweet_video_thumb}/…` — Poster
- `video.twimg.com/tweet_video/<id>.mp4` — GIFs (MP4-Streams; Poster wird umgebaut)
- `video.twimg.com/amplify_video/<id>/vid/avc1/…mp4` — echte Videos (nur via Resolver)
- `abs.twimg.com` — X-Scripts für die Token-Suche

## 9. UI

- Button = **Klon** des letzten Aktionsleisten-Buttons (Layout/Größe/Responsivität von X
  übernommen). Icon ersetzt (`SVG_ICON_INNER`), Zähler per CSS
  (`.xloader-wrap > button > div > div:nth-child(2)`) ausgeblendet, `data-testid` entfernt,
  `aria-label`/`title` = „Medien herunterladen", Klassen `xloader-wrap` (Wrapper) + `xloader-btn`.
- Hover/Active blau (`rgb(29,155,240)`), Fehler 2,5 s rot (`rgb(244,33,46)`).
- Fortschritts-Badge `.xloader-progress` absolut oben rechts am Wrapper, nur Videos ≥ 5 MB.

## 10. Tests & Verifikation

1. **Syntax:** `node --check xLoader.user.js` — muss exit 0 liefern (heute: 0).
2. **DOM-Regressionstest (optional, außerhalb Repo):**
   `node C:\Users\lolo\dh-test\xloader\dom-media-test.js F:\001_Coding_Projekte\xLoader\xLoader.user.js`
   → 11 Prüfungen: `extractDomMedia` findet eigenes Medium, ignoriert Avatar und Bilder
   eingebetteter Tweets; `normalizeMediaUrl` (GIF-Thumb→MP4, externe URL abgelehnt, m3u8
   unverändert); Fortschrittsbedingung. **Grenze:** der Test extrahiert nur den Block
   DOM-Medien-Extraktion und baut die Fortschrittsbedingung nach — er testet **nicht**
   `onDownloadClick`, API, Button-Injektion oder Resolver.
3. **Manuell auf x.com** (einzige echte Funktionprüfung): Bild-Tweet, Multi-Image, Video,
   GIF, Artikel-Card, quoted Tweet; Konsole auf `[xLoader]`-Logs achten.
4. **Playwright auf x.com ist ungeeignet für Skript-Injektion** (CSP blockt Inline-Scripts).
   Installation/Update nur über offiziellen Tampermonkey-Import (Skill
   `tampermonkey-install-update`). Auf greasyfork.org funktioniert der FileReader-Trick.
5. **GF-Verifikation:** `https://greasyfork.org/de/scripts/589456-xloader/versions`.

## 11. Release-Ablauf (verbindlich, nur mit Freigabe)

1. `@version` anheben (nie doppelt vergeben), Changelog-Block oben in der Datei einfügen,
   Init-Log-Zeile L1523 anpassen (`log.info('xLoader v1.0.X aktiv — überwache …')`).
   Bei Beschreibungsänderungen die lokalisierten `@description`-Zeilen mitpflegen.
2. `node --check` (+ optional DOM-Test).
3. Archivkopie nach `Ausgabe/xLoader-v1.0.X.js` — **untracked, nie committen**.
4. `git add xLoader.user.js` → `git commit -m "v1.0.X: …"` → `git push origin main`
   (Git-Autor **immerzu** repo-local; nie global ändern).
5. Push feuert **GitHub-Webhook 661732365** → Greasy-Fork-Sync („Automatisch", Quell-URL
   raw GitHub `main`) → GF-Version prüfen. Zieht GF nicht: GF-Admin
   „Jetzt aktualisieren und synchronisieren" (`input[name="update-and-sync"]`).
6. GitHub-Release nur mit **Windows-`gh`** in PowerShell, **ohne `$`-Variablen**
   (Bash-Wrapper strippt sie): `.release-notes-v1.0.X.md` anlegen (EN+DE), dann
   `git tag v1.0.X; git push origin v1.0.X; gh release create v1.0.X 'xLoader.user.js' --title 'xLoader v1.0.X' --notes-file '.release-notes-v1.0.X.md'`.
7. Aufräumen (Release-Notes, Temp-Dateien), `git status --short --branch` zeigen.

**GF-Admin-Fallen:** zwei Sync-Felder mit gleichem Platzhalter — `script[sync_identifier]` =
Skript-URL, `additional_info_sync[0][sync_identifier]` = `description.md`. Verwechseln
synchronisiert das Skript aus der Beschreibungsdatei. „Zusätzliche Informationen" ≠ Changelog-Textarea.

## 12. Bekannte Schwachstellen / offene Punkte (im Code belegt, nicht behoben)

1. **`getHandle` greift bei quoted Tweets daneben** (L882–893): `mediaEl.closest('div[data-testid="User-Name"]')`
   ist praktisch immer `null` (Medien liegen nicht im User-Name-Bereich) → Fallback auf den
   **äußeren** Tweet. `getTweetId` liefert dagegen die ID des **eingebetteten** Tweets →
   Dateiname `@<äußerer Handle>_<ID des eingebetteten Tweets>`. Fix-Idee: User-Name in
   DOM-Reihenfolge vor dem Medien-Element suchen oder `screen_name` aus der API-Antwort nehmen.
2. **Kein Recheck, wenn die Aktionsleiste fehlt** (L1452–1469): Bei Medien-Indikator, aber
   `createButton` → `null` (kein `div[role="group"]` gefunden), wird nicht erneut versucht.
   Der Button erscheint erst, wenn der Tweet durch einen späteren Mutations-Lauf erneut
   verarbeitet wird.
3. **`lastApiStatus` ist global** (L1128, gesetzt L1244, gelesen L1297): parallele Klicks auf
   verschiedene Tweets können die Fehlermeldung vermischen. Nur Diagnose, kein Datenproblem.
4. **Wartezeit pro Video-Poster bis 5 s**, sequenziell in `mergeDomItems` (L1219–1222):
   bei mehreren Video-Postern kann der Button viele Sekunden gesperrt bleiben.
5. **Prefetch lädt DOM-Poster nicht mit** (L830 ff. cached nur API-Items): Cache-Treffer
   kann trotzdem in den Resolver laufen.
6. **API-Endpoint ist inoffiziell** (`/i/api/2/timeline/conversation/…`, L298–301). Funktion
   in älteren Sitzungen belegt; **in dieser Sitzung nicht live geprüft**. Fällt er weg, greift
   noch der DOM-Pfad (Bilder/Poster), Videos nur, wenn der Resolver greift.
7. **Header-Set ggf. veraltet** (L587–595): kein `x-client-transaction-id` o. ä. — ob X ihn
   inzwischen verlangt, ist **nicht geprüft** (kein Beleg).
8. **`formatFilename` ohne Kollisionsschutz:** gleicher Name → der Browser/TM hängt `(1)` an.
9. **`sanitizeFilenamePart`** ersetzt nur 9 Windows-Zeichen; führende/abschließende Punkte,
   Leerzeichen oder reservierte Namen (CON, NUL …) bleiben möglich.
10. **`clearMediaCache`** setzt `activePrefetches` nicht zurück (laufende Prefetches füllen
    den Cache danach wieder) — kosmetisch.
11. **Doku-Drift:** die Zeilentabelle in `memory/FACT.md` stammt aus v1.0.22 (ca. +11 Zeilen
    verschoben). Maßgeblich ist dieser Bericht (§5).
12. **Tests decken API, Button-Injektion, Merge und Resolver nicht ab** (§10.2).

## 13. Arbeitsregeln für den nächsten Agenten

- **Sprache:** Deutsch (Antworten und Denkschritte). Code, Pfade, IDs unverändert lassen.
- **Stil:** maximal verdichtet, Stichpunkte, ein Bericht am Ende.
- **Keine Aussagen über Kontextfenster/Tokenbudget** — nicht belegbar; nur der Nutzer sieht die Anzeige.
- **Keine Git-Commits, Pushes, Tags, Releases, GF-Veröffentlichungen oder Sync-Änderungen
  ohne ausdrückliche Freigabe.**
- Bestehende Struktur/Metablock/CONFIG-Muster respektieren, nichts ohne Not umbauen.
- Dateien **vollständig lesen**, bevor geurteilt oder geändert wird.
- Keine Secrets in Code/Doku/Memory (Repo ist öffentlich).
- Memory-Pflege: `FACT.md` Stand-Zeile mitziehen, `JOURNAL.jsonl` je Sitzung ergänzen.
- Build/Version: Skill `versionierung-bei-build` (csproj/.iss) gilt hier nicht — xLoader hat
  nur `@version` im Metablock; relevant sind `tampermonkey-install-update` und
  `userscript-beschreibungen-immerzu` (DE/EN/RU-Regeln).

## 14. Aktueller Stand (2026-10-18)

- `@version 1.0.23`; 1531 Zeilen; Syntax-Check grün; DOM-Test 11/11.
- Git: HEAD `6f4420d` („v1.0.23: Kurzbeschreibung lokalisiert …"), `main` = `origin/main`,
  Arbeitsbaum sauber außer untracked `.reasonix/`.
- Greasy Fork 589456 mit v1.0.23 veröffentlicht (laut Journal/Changelog; nicht erneut live geprüft).
- Tags: v1.0.6–v1.0.12, v1.0.15, v1.0.16, v1.0.21, v1.0.22; v1.0.23 hat **keinen** Tag
  (reines Beschreibungs-Update).
- Archivkopien vorhanden: `Ausgabe/xLoader-v1.0.22.js`, `Ausgabe/xLoader-v1.0.23.js`.
- Nächster sinnvoller Schritt, falls gewünscht: Schwachstelle 1 (`getHandle`) beheben —
  erfordert Versionssprung (z. B. v1.0.24) und Freigabe für den Release-Ablauf.

## 15. Nachtrag 2026-10-18 — lokale Fixfassung (unveröffentlicht)

Ausgangslage: v1.0.23, 1531 Zeilen, HEAD `6f4420d`, `main` = `origin/main`, Arbeitsbaum
sauber (nur untracked `.reasonix/`, `memory/HANDOVER_v1.0.23.md` neu). Ausgangs-Hash der
Arbeitsdatei: `116A8FDB…C80358E8` (SHA-256, vollständig im Journal).

**Ergebnis:** `xLoader.user.js` = 1625 Zeilen, `@version` **unverändert 1.0.23** (kein
Versionssprung, keine Veröffentlichung, kein Commit), Changelog-Kopf unverändert.

### Behobene Befunde (§12)

| # | Befund | Ursache | Fix | Zeile |
|---|---|---|---|---|
| 1 | Falscher Handle bei quoted Tweets | `closest('div[data-testid="User-Name"]')` liefert nie ein Element | `getHandle` nimmt das `article`, in dem das Medien-Element liegt | 895 |
| 2 | Button fehlt dauerhaft bei später Aktionsleiste | Recheck nur im „keine Medien"-Zweig | `scheduleTweetRecheck` auch bei `createButton === null` | 1522/1533 |
| 3 | Vermischte Fehlermeldungen | globales `lastApiStatus` | `loadItemsLive` liefert `{items, apiStatus}` lokal zurück | 1275/1318 |
| 4 | Bis zu 5 s Wartezeit je Video-Poster | Resolver sequenziell je Poster, `clearResourceTimings()` je Poster | `resolvePosterVideoUrls`: alle Poster gemeinsam, **eine** 5-s-Deadline, Videos im `finally` gestoppt | 1168/1232 |
| 5 | Doppeltes `mergeDomItems` (Cache-Miss-Pfad) | `loadItemsLive` merged, `onDownloadClick` merged erneut | Merge genau einmal in `onDownloadClick`; `loadItemsLive` nur API + Token-Retry | 1275/1318 |

### Weitere Korrekturen (belegt, ohne eigenen Testfall)

- **Button-Freigabe bei Ausnahmen:** `onDownloadClick` hat jetzt `try/catch/finally`; `hideProgress`
  und `setBusy(false)` laufen immer, Fehler werden als „Fehler beim Laden" geflasht. Vorher blieb
  der Button bei jeder unerwarteten Ausnahme dauerhaft gesperrt (L1318 ff.).
- **`failPrefetch(tweetId, reason, status)`:** 401/403/429 lösen keinen 10-s-Retry mehr aus
  (verschärft nur das Limit bzw. scheitert am selben Token); transiente Fehler und leere
  Antworten behalten die 2 Retries (L864).
- **`prefetchSeen` wird nach erfolgreichem Prefetch freigegeben** (L842): Nach Ablauf der
  Cache-TTL konnte der Tweet vorher nie wieder vorgeladen werden — jeder spätere Klick lud live.
  Der Cache-Guard verhindert weiterhin Doppel-Prefetches innerhalb der TTL.
- **`gmGet` in `fetchLiveBearerToken` hat `timeout`** (L733): ein hängender Token-Request
  blockierte den Klick unbegrenzt.
- **IntersectionObserver-Leck:** `releaseDetachedTweets` (L1502) meldet entfernte Tweets ab;
  X.com hängt Artikel beim Scrollen aus dem DOM, der Observer hielt sie samt Inhalt.
- **`scheduleProcess`** prüft zuerst `closest(tweetSelector)` und erspart sich damit
  `querySelectorAll` über jeden eingefügten Teilbaum innerhalb eines Tweets (L1565 ff.).

### Tests (Stand 2026-10-18)

| Prüfung | Methode | Ergebnis |
|---|---|---|
| Syntax | `node --check xLoader.user.js` | exit 0 |
| DOM-Regression | `dom-media-test.js` (11 Fälle) | 11/11 PASS |
| Fix-/Regressionstests | `C:\Users\lolo\dh-test\xloader\fixes-test.js` (13 Fälle, extrahiert echte Funktionsblöcke) | gegen HEAD-v1.0.23: **8 FAIL** (F1, F2, F3a, F4, F5b, F8, F9, F10) — gegen Fixfassung: **13/13 PASS**, exit 0 |
| Browser-Integration (echtes Chromium, lokale Seite mit nachgebautem X-DOM, GM-Stubs) | Playwright | Button-Injektion 1× je Tweet, `aria-label` gesetzt, CSS aktiv; Recheck bei nach 100 ms eingefügter Aktionsleiste ⇒ Button erscheint nach 2 s; Klick auf quoted-Fall ⇒ Downloadname `@quoted_user_111_1.jpg`; keine Duplikate nach weiteren Mutationen |
| x.com live | **nicht ausgeführt** | keine Freigabe für eine Skript-Installation ins Nutzerprofil; ohne installierte Fixfassung kein End-to-End-Test möglich |

### Verbleibende Punkte (bewusst nicht geändert)

- **API-Endpoint / Header** (`/i/api/2/timeline/conversation/…`, L298–301; Header L587–595):
  nicht live geprüft, ob X den Pfad bzw. zusätzliche Header verlangt. Kein Codeänderungsgrund
  ohne Beleg; der DOM-Pfad bleibt Fallback.
- **Prefetch cached weiter nur API-Items** (§12.5): bewusst — DOM-Merge inkl. Poster-Klick
  gehört nicht in den Hintergrund-Prefetch (würde Videos beim Scrollen starten).
- **`sanitizeFilenamePart`, Kollisionsschutz, `clearMediaCache`/`activePrefetches`** (§12.8–10):
  unverändert, geringe Auswirkung.
- **`prefetchSeen`-Restgröße:** nach endgültig aufgegebenem Prefetch bleibt der Eintrag bis zum
  Klick — gewollt (verhindert Endlos-Retries bei dauerhaftem 429).

### Zustand nach der Arbeit

- `xLoader.user.js` geändert (uncommitted), `@version 1.0.23`, 1625 Zeilen.
- `memory/FACT.md` (Stand-Zeile, Zeilenkarte, Fallstricke, Testbefehl), `memory/JOURNAL.jsonl`
  und dieser Nachtrag aktualisiert. `README.md`, `description.md`, Changelog-Kopf und
  `Ausgabe/` unverändert.
- Git: kein Commit, kein Push, kein Tag, kein Release; `main` = `origin/main` unverändert.

## 16. Nachtrag 2026-10-18 — Downloadfehler: Default-Modus ohne Download-Permission

Im portablen Originalprofil (`Profile 1`) ist `downloads_mode` **nicht explizit gesetzt**
(Default) und `downloads` **nicht** als API-Permission erteilt; `user_scripts_enabled` ist true,
xLoader 1.0.23 ist aktiviert. Der frühere `off`-Befund stammte aus dem Testprofil nach
Backup-Import, nicht aus dem portablen Originalprofil.

Beleg (lokale HTTPS-x.com-Simulation, echtes TM 5.5.1, portable Chrome 155):
- Default + fehlende `downloads`-Permission: `GM_download` bleibt ohne Callback hängen; Button
  bleibt „Lädt Medien …", keine Datei, keine Fehlermeldung.
- `off`: Log `GM_download: not_enabled`, keine Datei.
- `native`: Einzelbild → 70-Byte-PNG; Multi-Image → zwei Dateien; API-404 → DOM-Fallback.

**Scriptfix:** `downloadUrl` hat einen Stillstands-Watchdog (5 min ohne Fortschritt;
`onprogress` resettet), der hängende `GM_download`-Aufrufe abbricht, den Button freigibt und
`GM_download: keine Antwort/Fortschritt (Timeout)` loggt. Bei `not_enabled`/`not_permitted`/
`not_whitelisted`/`not_succeeded` enthält die Meldung einen Handlungshinweis. Neue Fassung:
**1683 Zeilen**, SHA-256 `8FA1B0EB0A5CDB004FA5809FE87D34C28615B5DA4CF570B88C10918FE1D86414`.
Tests: 5-MB-Download über 75 s erfolgreich (kein Abbruch); `off` → klare Meldung;
13/13 Fix-Tests, 11/11 DOM-Tests.

**Nutzerhandlung:** Im portablen Originalprofil Tampermonkey → Einstellungen → Downloads →
Download-Modus = **Nativ** (oder Browser-API mit erteilter Download-Berechtigung). Zusätzlich
die neue Fixfassung installieren.

Offen: x.com-Live-Test (keine Anmeldung) und Video-Resolver/API im Live-Betrieb.
