# xLoader — FACT SHEET (Stand: v1.0.22, 2026-09-05)

Dauerhaftes Projektwissen zum xLoader-Userscript. Bei Änderungen immer die
Stand-Zeile oben aktualisieren. Vollständiger Changelog: Kommentar oben in
`xLoader.user.js` (dort ist die Historie v1.0.4–v1.0.22 dokumentiert).

## Kerndaten

- **Projekt-Root:** `F:\001_Coding_Projekte\xLoader\`
- **Arbeitsdatei:** `xLoader.user.js` (Projektstamm, 1520 Zeilen, `@version 1.0.22`)
- **Versionsarchive:** `Ausgabe\xLoader-v1.0.X.js` — Bindestrich-Schema mit echter `@version` (seit 12.08.2026; vorher `xLoader_v1.0.X.js` / `Downloadhilfe_v*.js` im Repo-Root). `Ausgabe/` ist gitignored, Archive bleiben **untracked und werden NIE committet**.
- **Git-Repo:** `immerzu/xLoader` (Branch `main`) — Git-Autor **immerzu** (repo-local `user.name`/`user.email` setzen, NICHT global ändern).
- **Greasy Fork:** Skript **589456** (`https://greasyfork.org/de/scripts/589456-xloader`), Account `immerzu`.
- **Webhook (Hauptweg seit 05.08.2026):** GitHub-Hook 661732365 (push-Event) → GF-Skript-Sync „Automatisch“, Sync-URL `https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js`. Commit+Push genügt; manueller GF-Upload nur Fallback.
- **Auto-Update im Skript:** `@updateURL`/`@downloadURL` = raw GitHub `main`.
- **Install-Link:** `https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js` (Tampermonkey bietet Installation an).
- **Zweck:** Ein Download-Button pro Tweet mit Medien; ein Klick öffnet den nativen „Speichern unter“-Dialog (Bilder, Videos, GIFs). Medien-URLs werden im Hintergrund vorgeladen (sofortiger Dialog).
- **Git-Stand (05.09.2026):** Arbeitsbaum sauber, HEAD `e71eaae` (v1.0.22-Doku). 11 GitHub-Releases.

## Aktueller Stand (v1.0.22)

- **v1.0.22** — Projekt-Umzug: Repo liegt jetzt unter `F:\001_Coding_Projekte\xLoader` (vorher „Downloadhilfe“); Pfade/Verweise (Skills, Memory, Doku) aktualisiert. README: Platzhalter `{id}` korrigiert (statt `{tweetId}`), „How it works“ + neuer „Development“-Abschnitt (dreisprachig). ru-board-Post auf v1.0.21 aktualisiert.
- **v1.0.21** — Fix DOM-Fallback: `extractDomMedia` verwarf ALLE Medien des eigenen Tweets — der Guard filterte auf `div[data-testid="tweet"]` (Body-Container) statt auf eingebettete Tweets. Guard prüft jetzt gegen das nächstgelegene `article[data-testid="tweet"]`.
- Live auf X.com verifizierte Hintergrund-Tatsache: **`window.__INITIAL_STATE__` existiert nicht mehr**; X.com rendert Videos/GIFs nur als Poster-`<img>`, echte MP4-URLs liefert nur die X-API.

## Metablock & Greasy-Fork-Format (WICHTIG)

- **`@match`:** `https://x.com/*` und `https://twitter.com/*`; **Grants:** `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`; **`@connect`:** `x.com`, `twitter.com`, `pbs.twimg.com`, `video.twimg.com`, `abs.twimg.com`; **`@noframes`, `@run-at document-end`, `@license MIT`.**
- **`@description`-Format (seit v1.0.20):** einzeilig dreisprachig DE / EN / RU, Sprachen durch ` / ` getrennt (z. B. `…konfigurierbar. / Adds … / Добавляет…`). Vor v1.0.20: v1.0.19 = EN + `@description:de` + `@description:ru` (GF-i18n), davor zweisprachig.
- **`description.md`** (Repo-Root): Quelle für Greasy Fork „Zusätzliche Informationen“ — DE → RU → EN, jeweils ein Absatz, KEINE Flaggen-Überschriften; im GF-Admin als zusätzliche Sync-Quelle hinterlegt (Format **markdown**).
- **GF-Admin-Falle:** es gibt ZWEI Sync-Felder mit gleichem Platzhalter „(Internetadresse)“: `script[sync_identifier]` = Skript-URL (`…/xLoader.user.js`) vs. `additional_info_sync[0][sync_identifier]` = Beschreibungsdatei (`…/description.md`). Nicht verwechseln — falsches Feld synchronisiert das Skript aus der Beschreibungsdatei.

## Architektur / Code-Struktur (Zeilenangaben v1.0.22)

IIFE `(function(){ 'use strict'; … })()` (L250), Start bei `document.readyState` (L1515).

| Bereich | Funktion | Zeile | Rolle |
|---|---|---|---|
| Konfig | `CONFIG` | 255 | Selektoren, Timeouts, Cache-TTL, API, localStorage-Keys (`xloader-saveas-mode`, `xloader-filename-template`, `xloader-live-token`) |
| Logging | `log` | 349 | Prefix `[xLoader]` (info/warn/error) |
| DOM-Medien | `isMediaUrl` / `normalizeMediaUrl` | 364 / 383 | URL-Filter / Normalisierung (m3u8-bereinigt, GIF-Poster → echte MP4 `video.twimg.com/tweet_video/<id>.mp4`) |
| DOM-Medien | `bestImageUrl` / `collectVideoUrls` / `urlsFromStyle` | 402 / 422 / 436 | beste Auflösung via srcset / Video-URLs / style-Hintergründe |
| DOM-Medien | `extractDomMedia` | 448 | sichtbare Medien des Tweets (Guard gegen eingebettete Tweets, seit v1.0.21) |
| DOM-Medien | `findMediaElement` / `hasMediaIndicator` | 501 / 517 | Medien-Element / Button-Indikator |
| Auth | `getCookies` | 523 | Cookie-Paar `auth_token`/`ct0` für API-Requests |
| Auth | `getCachedLiveToken` / `cacheLiveToken` | 538 / 559 | Live-Bearer-Token (TTL 1 h) |
| API | `fetchTweetData` | 573 | GET `location.origin + '/i/api/2/timeline/conversation/' + id + '.json?tweet_mode=extended&include_entities=true&include_user_entities=false'` mit Guest-/Bearer-/csrf-Headern |
| API | `collectTweetObjects` / `apiMediaFromTweet` / `originalImageUrl` / `parseApiData` | 619 / 647 / 681 / 696 | JSON → Medienliste `{url, ext}` (Bilder in Originalgröße) |
| Auth | `fetchLiveBearerToken` | 717 | Live-Token zuerst im HTML der Startseite, dann in echten Script-URLs (abs.twimg.com) suchen |
| Cache | `getCachedItems` / `schedulePrefetch` / `failPrefetch` / `drainPrefetchQueue` | 789 / 805 / 845 / 862 | Prefetch-Cache (TTL 5 min), max. 2 Retries mit 10-s-Cooldown |
| Tweet | `getHandle` / `getTweetId` | 871 / 884 | orientieren sich am Medien-Element + dessen `/status/`-Link (eingebettete Tweets, v1.0.14) |
| Dateiname | `sanitizeFilenamePart` / `extFromUrl` / `mediaIdOf` / `formatFilename` / `pad2` | 920 / 924 / 938 / 1024 / 1016 | Template `{handle} {id} {index} {ext} {date} {time} {type}`, Default `@{handle}_{id}_{index}.{ext}` |
| Download | `downloadUrl` | 950 | `GM_download` direkt (kein Blob), `saveAs` nach Modus, Timeout `CONFIG.requestTimeoutMs` (60 s) → `ontimeout` |
| Modus | `getSaveAsMode` / `toggleSaveAsMode` | 978 / 993 | `'first'` (nur erstes Medium, Default) / `'all'` |
| Menü | `setupMenu` | 1050 | 3 Einträge: Speichern-Modus umschalten, Cache leeren, Dateinamen-Muster ändern |
| UI | `setBusy` / `flashError` / `showProgress` / `hideProgress` | 1071 / 1080 / 1097 / 1110 | Button-Zustände, Fehler-Flash, Fortschritts-Badge (nur ≥ 5 MB) |
| Resolver | `findPosterElementByMediaId` | 1128 | Poster-Element zu Media-ID |
| Resolver | `resolvePosterVideoUrl` (async) | 1145 | Poster antippen → echte Voll-MP4 aus Performance-Buffer (`video.twimg.com/amplify_video/<id>/vid/avc1/…/mp4`), Video sofort stumm+pausiert, 5-s-Deadline |
| Merge | `mergeDomItems` (async) | 1188 | API-Medien + sichtbare DOM-Poster/Standbilder, Dedup (Media-ID/URL-Basis), idempotent |
| Klick | `loadItemsLive` (async) | 1225 | Live-Fallback: API → Live-Token-Retry → DOM-Merge |
| Klick | `onDownloadClick` (async) | 1264 | Cache → live → Download pro Medium → Cache invalidieren |
| Button | `createButton` | 1363 | **Klont einen vorhandenen X.com-Aktionsleisten-Button** (v1.0.5-Ansatz) → exaktes Layout Desktop/Mobil; nur SVG-Icon ersetzt (`SVG_ICON_INNER`, L344), Zähler per CSS ausgeblendet; Marker `data-xloader`, `aria-label` „Medien herunterladen“ |
| Prefetch | `observeForPrefetch` | 1415 | IntersectionObserver (rootMargin `200px 0px`), nur sichtbare Tweets |
| Scan | `processTweet` / `scanInitial` / `scheduleProcess` | 1437 / 1461 / 1472 | Button bei Medien-Indikator, sonst Recheck bis 3× (Lazy-Loading); rAF-gebündelte Verarbeitung |
| Init | `init` | 1495 | `GM_addStyle(CSS)` + Menü + Initial-Scan + MutationObserver (body, childList+subtree) |

## Kernabläufe

1. **Injektion:** Initial-Scan + MutationObserver; `processTweet` fügt pro Tweet mit Medien-Indikator einen geklonten Button ein; Lazy-Loading wird bis 3× nachgeprüft.
2. **Prefetch:** erst wenn der Tweet sichtbar wird (IntersectionObserver) → API-Call im Hintergrund (max. 3 parallel, Queue max. 30) → Cache `Map<tweetId,{items,fetchedAt}>`, TTL 5 min. Prefetch-Fehler (401/429/Timeout/leer): max. 2 automatische Retries mit 10-s-Cooldown, still verworfen.
3. **Klick (Cache-Miss-Fallback-Kette):** X-API (`conversation.json`) → **Live-Token-Retry** (nur bei 401/403/Netzwerkfehler, **NICHT bei 429**) → **DOM-Merge** (`mergeDomItems`: Poster/Standbilder, `card_img`; Video-MP4 via `resolvePosterVideoUrl`) → differenzierte Fehlermeldung (429 / 401+403 / sonst). Cache-Treffer: sofortiger Download ohne API-Call.
4. **Download:** direkter `GM_download(url, …, saveAs: true)` — Dialog erscheint unmittelbar. Modus „first“: nur das erste Medium bekommt den Dialog, weitere gehen direkt in den Download-Ordner. Button beim Klick sofort deaktiviert (Doppelklick-Guard). Fortschritts-Badge nur bei Videos ≥ 5 MB, Prozent aus `done`/`total`. Nach Download Cache-Eintrag invalidieren.
5. **Token:** Guest-Bearer (fest im Code, aus x.com main.js) + dynamischer Live-Bearer-Token (Regex `A{20,}…`, TTL 1 h, localStorage `xloader-live-token`, Migration alter Key beim ersten Lesen). Header `x-guest-token` immer senden, wenn Guest-Token existiert.

## Medien-Domains & Typen

- `pbs.twimg.com/media/…` — normale Bilder (Originalgröße via `originalImageUrl`).
- `pbs.twimg.com/card_img/…` — **Artikel-Card-Bilder** (seit v1.0.15 als Medium erkannt; beste Auflösung via srcset).
- `video.twimg.com/amplify_video/<id>/vid/avc1/…mp4` — echte Videos (Resolver via Performance-Buffer).
- `video.twimg.com/tweet_video/<id>.mp4` — **GIFs** (auf X.com MP4-Streams; Poster `pbs.twimg.com/tweet_video_thumb/…` wird umgebaut).
- `abs.twimg.com` — X.com-Scripts (für Live-Token-Suche, `@connect` nötig).

## Bekannte Fallstricke & Erkenntnisse

- **Nie dieselbe Version zweimal veröffentlichen** — Greasy Fork lehnt identische Versionen ab (auch nach mehreren Änderungen: erneut anheben).
- **DOM-Fallback-Guard (v1.0.21-Lektion):** Filter gegen `article[data-testid="tweet"]` (nächstgelegenes) — niemals gegen den Body-Container `div[data-testid="tweet"]` prüfen, sonst werden eigene Medien verworfen.
- **Eingebettete Tweets (v1.0.14-Lektion):** Tweet-ID/Handle vom Medien-Element aus ableiten (Status-Link), nicht vom ersten Zeitstempel.
- **Token-Retry nicht bei 429** (Rate-Limit) auslösen — verschärft nur das Limit.
- **GM_download-Timeout:** ohne `ontimeout`-Pfad deaktiviert ein hängender Download den Button dauerhaft.
- **Kein Blob-Umweg / kein m3u8→mp4-Umbenennen:** Blob verzögert den Dialog; Playlisten lassen sich nicht einfach umbenennen (kaputte Downloads).
- **GF-Admin:** zwei Sync-Felder nicht verwechseln (siehe oben); **„Zusätzliche Informationen“ ≠ Changelog-Textarea**.
- **Manueller GF-Upload (Fallback):** Greasy Forks „Choose File“-Button befüllt die Textarea per Playwright NICHT → FileReader-Trick (eval-basierter Handler) nötig. **Der eval-Trick funktioniert auf greasyfork.org, NICHT auf x.com** (CSP).
- **Playwright-/DOM-Tests auf x.com:** CSP blockt Inline-Injektion → Skript-Install/-Update nur über offiziellen Tampermonkey-Import bzw. `tm-import.mjs`-Weg (Skill `tampermonkey-install-update`).
- **PowerShell-Befehle im Bash-Wrapper:** keine `$`-Variablen verwenden (Wrapper strippt sie).
- Kein Tracking, keine Analyse, keine externen Abhängigkeiten/Server.

## Versionshistorie (Meilensteine)

- **v1.0.4** – Metadaten für Veröffentlichung (`@license MIT`, `@description`), Platzhalter-Hinweis @author/@namespace
- **v1.0.5** – Layout-Fix: Button durch Klonen eines X.com-Leisten-Buttons (davor fester 36px-Button)
- **v1.0.6** – Umbenennung „Downloadhilfe“ → „xLoader“ (@author/@namespace auf Veröffentlichungs-Identität)
- **v1.0.7** – Tampermonkey-Menü (Speichern-Modus, Cache leeren); robustere Tweet-ID-Extraktion
- **v1.0.8** – Live-Token-Retry auch mit gecachtem Token; Re-Prefetch nach Cache-Invalidierung
- **v1.0.9** – Guest-Token-Fix, Live-Token-Fallback (Startseiten-HTML), Prefetch-Retry, Fortschrittsanzeige, IntersectionObserver-Prefetch, differenzierte Fehlermeldungen, Metadaten auf GitHub
- **v1.0.10** – Fortschrittsanzeige repariert (Prozent aus `done`/`total`), sichtbares Badge
- **v1.0.11** – „NaN%“-Fix; Badge nur bei Videos ≥ 5 MB
- **v1.0.12** – Fixes: isMediaUrl-Regression, GM_download-Timeout, kein Token-Retry bei 429, Prefetch-Retry-Guard, Recheck bis 3×, GIF-Poster → MP4
- **v1.0.14** – Eingebettete Medien: medienbasierte Tweet-ID, DOM/API-Merge mit Dedup (`mergeDomItems`), Video-MP4-Resolver (Performance-Buffer)
- **v1.0.15** – Artikel-Card-Bilder (`card_img`)
- **v1.0.16** – Konfigurierbares Dateinamen-Template (Menü, localStorage)
- **v1.0.17–v1.0.20** – Beschreibungs-Updates (nur Doku, ohne Git-Tag): zweisprachig → GF-i18n → einzeilig dreisprachig
- **v1.0.21** – Fix DOM-Fallback (Guard `article[data-testid="tweet"]`)
- **v1.0.22** – Projekt-Umzug nach `F:\001_Coding_Projekte\xLoader`; README/ru-board-Post aktualisiert

**Git-Tags:** v1.0.6–v1.0.12, v1.0.15, v1.0.16, v1.0.21, v1.0.22 (v1.0.13/v1.0.14 nie veröffentlicht; v1.0.17–v1.0.20 reine Beschreibungs-Updates ohne Tag). Latest Release: GitHub `immerzu/xLoader/releases` + Greasy Fork 589456.

## Build- & Release-Regeln (verbindlich)

1. **Fix & Version** in `xLoader.user.js`: Metablock `@version` anheben (nie doppelt!); Changelog-Kommentar oben: neuen `v1.0.X:`-Block einfügen (Titel `xLoader v1.0.X (<Kurzname>)` + Bullet-Punkte, DE); Init-Log-Zeile aktualisieren: `log.info('xLoader v1.0.X aktiv — überwache ' + CONFIG.tweetSelector + ' …');` (aktuell L1512). Bei inhaltlichen Änderungen `@description` (dreisprachig) mitpflegen.
2. **Tests:** `node --check xLoader.user.js`; falls DOM-relevant zusätzlich `node /c/Users/lolo/dh-test/xloader/dom-media-test.js xLoader.user.js` (liegt außerhalb dieses Repos, nur lokal).
3. **Archivkopie:** `cp xLoader.user.js Ausgabe/xLoader-v1.0.X.js` — bleibt **untracked**, wird NIE committet.
4. **Commit + Push** (Git Bash ok): `git add xLoader.user.js && git commit -m "v1.0.X: <Kurzbeschreibung>"` → `git push origin main` → **Webhook feuert → Greasy Fork aktualisiert automatisch**.
5. **GF-Verifikation:** `web_fetch https://greasyfork.org/de/scripts/589456-xloader/versions` — neue Version + Datum bestätigen. Zieht GF nicht (zeitnah): GF-Admin → „Jetzt aktualisieren und synchronisieren“ (Button `input[name="update-and-sync"]`).
6. **GitHub-Release per PowerShell** (Windows-`gh`, als immerzu eingeloggt; Git-Bash/WSL-`gh` hat KEINE GitHub-Credentials): Release-Notes-Datei anlegen (EN + DE, Markdown, z. B. `.release-notes-v1.0.X.md`) → `powershell.exe -NoProfile -Command "Set-Location 'F:\001_Coding_Projekte\xLoader'; git tag v1.0.X; git push origin v1.0.X; gh release create v1.0.X 'xLoader.user.js' --title 'xLoader v1.0.X' --notes-file '.release-notes-v1.0.X.md'"` — ohne `$`-Variablen! Bei Bedarf Tag/Release als separate Befehle.
7. **Aufräumen:** `.release-notes-v1.0.X.md`, temporäre Dateien entfernen; `git status --short --branch` zeigen.

**Fallback A — manueller GF-Upload** (nur wenn Webhook nicht zieht): Browser auf `https://greasyfork.org/de/scripts/589456/versions/new`; Cloudflare-Challenge abwarten (~8 s) + neu laden; Login als immerzu prüfen; FileReader-Trick (eigenes `<input type=file>` per eval, `change`-Handler liest Datei in `textarea[name="script_version[code]"]`, dann `browser_file_upload` mit Windows-Pfad); `@version` per Regex in der Textarea verifizieren; Changelog zweisprachig EN+DE in `textarea[name="script_version[changelog]"]` + Markdown-Radio; „Neue Version veröffentlichen“; Versionsseite verifizieren.

## Wichtige Pfade

| Pfad | Zweck |
|------|-------|
| `F:\001_Coding_Projekte\xLoader\xLoader.user.js` | **Arbeitsdatei** (v1.0.22, 1520 Zeilen; Metablock + vollständiger Changelog oben) |
| `F:\001_Coding_Projekte\xLoader\Ausgabe\` | Versionsarchive `xLoader-v1.0.X.js` (gitignored) |
| `F:\001_Coding_Projekte\xLoader\README.md` | Projekt-README (dreisprachig, Versionshistorie, Development) |
| `F:\001_Coding_Projekte\xLoader\description.md` | Greasy-Fork „Zusätzliche Informationen“ (DE → RU → EN) |
| `F:\001_Coding_Projekte\xLoader\ru-board_xloader_post.md` | Ru.Board-Beitragsentwurf (Forum 31, Thread 20664) |
| `F:\001_Coding_Projekte\xLoader\memory\` | Projektgedächtnis (dieses Verzeichnis) |
| `F:\001_Coding_Projekte\xLoader\.reasonix\skills\greasy-fork-release\SKILL.md` | lokales Release-Playbook (Spiegel in `!Wichtiges\Meine _Skills\projekt_weit\xLoader\`) |
| `node /c/Users/lolo/dh-test/xloader/dom-media-test.js xLoader.user.js` | optionaler DOM-Regressionstest (außerhalb Repo, lokal) |
