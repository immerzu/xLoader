# xLoader — FACT SHEET (Stand: v1.0.33, 2026-10-21)

Dauerhaftes Projektwissen zum xLoader-Userscript. Bei Änderungen immer die
Stand-Zeile oben aktualisieren. Vollständiger Changelog: Kommentar oben in
`xLoader.user.js` (dort ist die Historie v1.0.4–v1.0.26 dokumentiert).

## Kerndaten

- **Projekt-Root:** `F:\001_Coding_Projekte\xLoader\`
- **Arbeitsdatei:** `xLoader.user.js` (Projektstamm, `@version 1.0.33`). Dialogoptimierung aus der Nutzer-Testfassung, anschließend ausdrücklich beauftragter Streamingfix: Status 0 zulassen, keinen Fetch-timeout:0, onloadend anfordern, HTTP-Abschluss vor Dateiübernahme prüfen.
- **Versionsarchive:** seit v1.0.24 `Ausgabe/xLoader-v1.0.X.user.js`, ältere Archive `xLoader-v1.0.X.js`. `Ausgabe/` bleibt gitignored und wird nie committet.
- **Git-Repo:** `immerzu/xLoader` (Branch `main`) — Git-Autor **immerzu** (repo-local `user.name`/`user.email` setzen, NICHT global ändern).
- **Greasy Fork:** Skript **589456** (`https://greasyfork.org/de/scripts/589456-xloader`), Account `immerzu`.
- **Webhook (Hauptweg seit 05.08.2026):** GitHub-Hook 661732365 (push-Event) → GF-Skript-Sync „Automatisch“, Sync-URL `https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js`. Commit+Push genügt; manueller GF-Upload nur Fallback.
- **Auto-Update im Skript:** `@updateURL`/`@downloadURL` = raw GitHub `main`.
- **Install-Link:** `https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js` (Tampermonkey bietet Installation an).
- **Zweck:** Ein Downloadbutton pro Tweet mit Medien. Unterstützte Browser wählen das erste Ziel vor dem Streaming-Transfer; fehlende Benutzeraktivierung/API nutzt GM_download. Prefetch reduziert die Metadatensuche.
- **Veröffentlichter Ausgangsstand:** v1.0.24, Commit `e16a6cf`. v1.0.26 ist veröffentlicht und auf GitHub sowie Greasy Fork verifiziert (Release-Commit `d5dd2d374ba8303479a385c6b43ded2bfcebb7bf`); aktueller Einstieg `HANDOVER_v1.0.26.md`. v1.0.25 wird nicht nachträglich veröffentlicht.

## Aktueller Stand (v1.0.33)

- **v1.0.33, 2026-10-21:** Nutzerbestätigter Browser-Praxistest von v1.0.33-dev: HLS-/Broadcast-Download und Abbruchbestätigung beim erneuten Klick, Fortschrittsanzeige beibehalten. Offizielle Fassung v1.0.33: nur Release-Metadaten/-Beschreibungen (Name, Namespace, Versionsangabe, Auto-Update-URLs, Init-Log), Downloadlogik unverändert. Unterstützte Player-Cards, HLS/fMP4, Broadcast-/TS-Streams, `@connect pscp.tv` und Browser-Netzwerk-Fallback; nicht alle geschützten Streams. GitHub-Quellcode per Commit veröffentlicht; GF-Auto-Sync per Push ausgelöst. GitHub-Release-Tag und Asset gesondert prüfen.


- **v1.0.26, 2026-10-21:** Auf Nutzeranweisung jedes neue Build mit höherer Patchversion ausgeben. Metablock, Changelog, Init-Log und README angepasst, Downloadlogik unverändert. Lokales Build Ausgabe/xLoader-v1.0.26.user.js, SHA-256 E673B1F25F022598A6F114EB46001D953DB6C7956D431E5795F4BC0FF95FD808. Alte Archive erhalten. GitHub-Asset und Raw-Quellen byte-identisch; GF automatisch synchronisiert, nur GF-Update-/Download-URLs abweichend. Nutzer bestätigt schnelle native Windows-Dateiauswahl und beide gespeicherten Videos; Veröffentlichung der unveränderten Bytes ausdrücklich freigegeben. Regel für neue Builds verbindlich in AGENTS.md; bestehende freigegebene Version bei reiner Veröffentlichung nicht erneut erhöhen.

- **v1.0.25, 2026-10-21:** Nutzer bestätigt die getestete Dialogoptimierung und den schnellen Speichern-Dialog im eigenen Browser; Veröffentlichung ausdrücklich freigegeben. Grundlage vor dem anschließend vom Nutzer beauftragten Streamingfix: `Ausgabe/xLoader-v1.0.24-dialog-test-20261021.user.js` (SHA-256 `58847020F66CECABABCD4780E745BE2DB17D9F6A20AF286C6F05890317D73F6B`). Erste Dateiauswahl vor DOM-/Video-Merge; Streaming mit Fortschritt und Fehlerbereinigung. Weitere Medien und Browser ohne Picker behalten GM_download. Keine automatisch ermittelte native Millisekundenmessung; kein allgemeiner Nachweis für alle Browser. Streamingfix mit echtem Tampermonkey 5.5.1 an beiden gemeldeten Videos geprüft: 42.683.448 und 558.184 Bytes, SHA-256 unabhängig identisch; Datei-Adapter statt nativer Speicherdialog. 43 Regressionstests und 28 Downloadtests bestanden. Tests und Release-Hash im Handover.
- **Browser 2026-10-21:** Dauerhaftes Playwright-Nutzerprofil mit regulär installiertem Tampermonkey 5.5.1. Tampermonkey **nicht per `--load-extension` starten**: wiederholtes Installationsereignis sperrte alle vorhandenen Skripte wegen unbekannter Herkunft (Code 12), trotz grünem Schalter. Nach Reparatur blieben die fünf zuvor aktiven Skripte nach Neustarts aktiv (Code 0), xLoader 1.0.24 zeigte auf echtem X.com wieder den Downloadbutton. **Verbindliche Details:** [BROWSER_STARTUP_2026-10-21.md](BROWSER_STARTUP_2026-10-21.md), vor Browserarbeiten lesen; ältere Startflag-Empfehlungen sind überholt. Die Browserreparatur ist unabhängig vom Release; bei Releasearbeiten keine Browserprofile oder Einstellungen verändern.
- **v1.0.24** — Release: zehn lokale Download-Korrekturen, 5-min-Stillstands-Watchdog, klarere `GM_download`-Fehler (`not_enabled`/`not_permitted`/`not_whitelisted`/`not_succeeded`). Getestet: 13/13 Fix-, 11/11 DOM-, 19/19 Watchdog-Tests; portabler Chrome + Yandex (Browser-API).
- **v1.0.23** — Kurzbeschreibung lokalisiert: `@description` = deutsche Default-Zeile (= GF-Skript-Locale `de`) + `@description:en` + `@description:ru`. Grund: Die GF-Suche filtert standardmäßig nach Sprache (Quellcode-belegt: greasyfork-org/greasyfork `script.rb` `set_locale`/`update_localized_attribute`, `script_indexing.rb:131`, `script_listings.rb` `filter_locale`) — die einzeilige DE/EN/RU-Mischbeschreibung (v1.0.20–22) machte das Skript nur in der **deutschen** Suche auffindbar (Live-Test: EN-Suche fand xLoader nicht). Mit Lokalisierung erscheint es in DE/EN/RU-Suchen. Kein `@description:de` (wird bei Locale `de` ignoriert), keine `@name:xx`-Zeilen. Init-Log + Changelog-Kopf auf v1.0.23.
- **v1.0.22** — Projekt-Umzug: Repo liegt jetzt unter `F:\001_Coding_Projekte\xLoader` (vorher „Downloadhilfe“); Pfade/Verweise (Skills, Memory, Doku) aktualisiert. README: Platzhalter `{id}` korrigiert (statt `{tweetId}`), „How it works“ + neuer „Development“-Abschnitt (dreisprachig). ru-board-Post auf v1.0.21 aktualisiert.
- **v1.0.21** — Fix DOM-Fallback: `extractDomMedia` verwarf ALLE Medien des eigenen Tweets — der Guard filterte auf `div[data-testid="tweet"]` (Body-Container) statt auf eingebettete Tweets. Guard prüft jetzt gegen das nächstgelegene `article[data-testid="tweet"]`.
- Live auf X.com verifizierte Hintergrund-Tatsache: **`window.__INITIAL_STATE__` existiert nicht mehr**; X.com rendert Videos/GIFs nur als Poster-`<img>`, echte MP4-URLs liefert nur die X-API.

## Metablock & Greasy-Fork-Format (WICHTIG)

- **`@match`:** `https://x.com/*` und `https://twitter.com/*`; **Grants:** `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`; **`@connect`:** `x.com`, `twitter.com`, `pbs.twimg.com`, `video.twimg.com`, `abs.twimg.com`, `pscp.tv`; **`@noframes`, `@run-at document-end`, `@license MIT`.**
- **`@description`-Format (seit v1.0.23):** **lokalisiert** — `@description` = deutsche Kurzbeschreibung (Default; entspricht der GF-Skript-Locale `de` von xLoader) + `@description:en` + `@description:ru` (je eigene Zeile). Damit ist das Skript in der GF-Suche unter DE/EN/RU auffindbar. **Kein** `@description:de` (wird bei Skript-Locale `de` von GF ignoriert), keine `@name:xx`-Zeilen ohne passendes `@description:xx` (GF-Validierung), keine einzeiligen DE/EN/RU-Mischtexte (v1.0.20–22: machten das Skript nur in EINER Sprache auffindbar). Vor v1.0.20: v1.0.19 = EN + `@description:de` + `@description:ru` (GF-i18n), davor zweisprachig.
- **`description.md`** (Repo-Root): Quelle für Greasy Fork „Zusätzliche Informationen“ — DE → RU → EN, jeweils ein Absatz, KEINE Flaggen-Überschriften; im GF-Admin als zusätzliche Sync-Quelle hinterlegt (Format **markdown**).
- **GF-Admin-Falle:** es gibt ZWEI Sync-Felder mit gleichem Platzhalter „(Internetadresse)“: `script[sync_identifier]` = Skript-URL (`…/xLoader.user.js`) vs. `additional_info_sync[0][sync_identifier]` = Beschreibungsdatei (`…/description.md`). Nicht verwechseln — falsches Feld synchronisiert das Skript aus der Beschreibungsdatei.

## Architektur / Code-Struktur (Zeilenangaben v1.0.22)

IIFE `(function(){ 'use strict'; … })()` (L250), Start bei `document.readyState` (L1515).

> **Zeilenangaben:** Die Tabelle unten ist Stand v1.0.22 (1520 Zeilen) und in v1.0.23 um ~11
> Zeilen verschoben. Aktuelle Zeilen (v1.0.23, 1531 Zeilen), Start L1526, vollständiger
> Funktionskatalog: `HANDOVER_v1.0.23.md` §5.
> **Release v1.0.24** (1698 Zeilen inkl. v1.0.24-Changelog-Block, `@version 1.0.24`):
> Die v1.0.23-Zeilenangaben unten verschieben sich durch den neuen Changelog-Block um +15
> (`failPrefetch` L879, `getHandle` L910, `resolvePosterVideoUrls` L1183, `mergeDomItems`
> L1247, `loadItemsLive` L1290, `onDownloadClick` L1333, `releaseDetachedTweets` L1517,
> `scheduleTweetRecheck` L1537, `processTweet` L1548, `init` L1609, Init-Log L1690).
> Art und Begründung der Änderungen: `HANDOVER_v1.0.23.md` §15/§16.

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
4. **Download (v1.0.25):** Bei verfügbaren APIs und aktiver Benutzeraktion erste Dateiauswahl vor dem DOM-Merge; danach GM_xmlhttpRequest-Stream in die gewählte Datei (Fortschritt und Stillstands-Watchdog). Weitere Medien laufen weiterhin über GM_download mit dem first/all-Modus. Ohne Picker/Benutzeraktivierung GM_download auch für das erste Medium. Abbruch der Dateiauswahl beendet die Serie; Fehler geben den Button frei.
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
- **Prefetch-Retry nur bei transienten Fehlern** (v1.0.23-Fixfassung 2026-10-18): `failPrefetch(tweetId, reason, status)` verwirft 401/403/429 ohne Retry — ein 10-s-Retry scheitert am selben Token bzw. verschärft das Limit; der Klick lädt live nach. Netzwerk-/Timeout-/Parse-Fehler und leere Antworten werden wie bisher 2× mit 10 s Cooldown wiederholt.
- **Recheck auch ohne Aktionsleiste** (Fixfassung 2026-10-18): `processTweet` plant über `scheduleTweetRecheck` bis zu 3 Rechecks à 2 s, wenn der Medien-Indikator da ist, `createButton` aber kein `div[role="group"]` findet. Vorher blieb der Button in diesem Fall dauerhaft weg.
- **Video-Resolver nur gemeinsam** (Fixfassung 2026-10-18): `resolvePosterVideoUrls` löst alle Poster eines Tweets in EINEM Poll-Zyklus mit 5-s-Gesamtdeadline. Nicht wieder pro Poster sequenziell machen (n×5 s Wartezeit; das damalige `clearResourceTimings()` je Poster verwarf bereits geladene Einträge der vorherigen Poster).
- **`getHandle` über den Medien-Article** (Fixfassung 2026-10-18): maßgeblich ist `article[data-testid="tweet"]`, in dem das Medien-Element liegt — `closest('div[data-testid="User-Name"]')` greift nie, weil dort keine Medien liegen (falscher Handle bei quoted Tweets).
- **GM_download-Timeout:** ohne `ontimeout`-Pfad deaktiviert ein hängender Download den Button dauerhaft.
- **Download-Modus/Permission** (Befund 2026-10-18): Im portablen Originalprofil ist `downloads_mode` Default und `downloads` nicht als API-Permission erteilt. Dann hängt `GM_download` ohne Callback (Button bleibt „Lädt Medien …", keine Datei). `off` liefert `not_enabled`. Abhilfe: Modus `native` (oder `downloads` erteilen). Die Fixfassung hat in `downloadUrl` einen 5-min-Stillstands-Watchdog (Fortschritt resettet; SHA-256 `8FA1B0EB…`), der hängende Aufrufe abbricht und `not_enabled`/`not_permitted` mit Handlungshinweis meldet.
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
- **v1.0.24** – Download-Fixes (10 Korrekturen, Watchdog, klarere GM_download-Fehler); Release
- **v1.0.23** – Kurzbeschreibung lokalisiert (@description DE-Default + :en + :ru) für GF-Suchbarkeit in DE/EN/RU

**Git-Tags:** v1.0.6–v1.0.12, v1.0.15, v1.0.16, v1.0.21, v1.0.22, v1.0.23, v1.0.24 (v1.0.13/v1.0.14 nie veröffentlicht; v1.0.17–v1.0.20 reine Beschreibungs-Updates ohne Tag). Latest Release: GitHub `immerzu/xLoader/releases` + Greasy Fork 589456.

## Build- & Release-Regeln (verbindlich)

1. **Fix & Version** in `xLoader.user.js`: Metablock `@version` anheben (nie doppelt!); Changelog-Kommentar oben: neuen `v1.0.X:`-Block einfügen (Titel `xLoader v1.0.X (<Kurzname>)` + Bullet-Punkte, DE); Init-Log-Zeile aktualisieren: `log.info('xLoader v1.0.X aktiv — überwache ' + CONFIG.tweetSelector + ' …');` (aktuell L1690). Bei Beschreibungsänderungen die **lokalisierte** `@description` mitpflegen (DE-Default + `:en` + `:ru`, s. o.).
2. **Tests (reproduzierbar im Repository):** `node --check xLoader.user.js`; `node tests/dom-media.test.cjs`; `node tests/fixes.test.cjs`; `node tests/watchdog.test.cjs`; `node --test tests/download-flow.test.cjs`. Fix-Klick-Harness mit Picker-Stub, Picker-/Streamingpfade separat geprüft.

   **Historische externe Testpfade:** `node --check xLoader.user.js`; falls DOM-relevant zusätzlich `node /c/Users/lolo/dh-test/xloader/dom-media-test.js xLoader.user.js` (liegt außerhalb dieses Repos, nur lokal) und `node /c/Users/lolo/dh-test/xloader/fixes-test.js xLoader.user.js` (gezielte Fix-/Regressionstests der Fixfassung 2026-10-18; gegen v1.0.23 aus HEAD rot, gegen die Fixfassung grün).
3. **Archivkopie:** `cp xLoader.user.js Ausgabe/xLoader-v1.0.X.js` — bleibt **untracked**, wird NIE committet.
4. **Commit + Push** (Git Bash ok): `git add xLoader.user.js && git commit -m "v1.0.X: <Kurzbeschreibung>"` → `git push origin main` → **Webhook feuert → Greasy Fork aktualisiert automatisch**.
5. **GF-Verifikation:** `web_fetch https://greasyfork.org/de/scripts/589456-xloader/versions` — neue Version + Datum bestätigen. Zieht GF nicht (zeitnah): GF-Admin → „Jetzt aktualisieren und synchronisieren“ (Button `input[name="update-and-sync"]`).
6. **GitHub-Release per PowerShell** (Windows-`gh`, als immerzu eingeloggt; Git-Bash/WSL-`gh` hat KEINE GitHub-Credentials): Release-Notes-Datei anlegen (EN + DE, Markdown, z. B. `.release-notes-v1.0.X.md`) → `powershell.exe -NoProfile -Command "Set-Location 'F:\001_Coding_Projekte\xLoader'; git tag v1.0.X; git push origin v1.0.X; gh release create v1.0.X 'xLoader.user.js' --title 'xLoader v1.0.X' --notes-file '.release-notes-v1.0.X.md'"` — ohne `$`-Variablen! Bei Bedarf Tag/Release als separate Befehle.
7. **Aufräumen:** `.release-notes-v1.0.X.md`, temporäre Dateien entfernen; `git status --short --branch` zeigen.

**Fallback A — manueller GF-Upload** (nur wenn Webhook nicht zieht): Browser auf `https://greasyfork.org/de/scripts/589456/versions/new`; Cloudflare-Challenge abwarten (~8 s) + neu laden; Login als immerzu prüfen; FileReader-Trick (eigenes `<input type=file>` per eval, `change`-Handler liest Datei in `textarea[name="script_version[code]"]`, dann `browser_file_upload` mit Windows-Pfad); `@version` per Regex in der Textarea verifizieren; Changelog zweisprachig EN+DE in `textarea[name="script_version[changelog]"]` + Markdown-Radio; „Neue Version veröffentlichen“; Versionsseite verifizieren.

## Wichtige Pfade

| Pfad | Zweck |
|------|-------|
| `F:\001_Coding_Projekte\xLoader\xLoader.user.js` | **Arbeitsdatei** v1.0.26; Metablock + Changelog oben |
| `F:\001_Coding_Projekte\xLoader\Ausgabe\` | Versionsarchive `xLoader-v1.0.X.js` (gitignored) |
| `F:\001_Coding_Projekte\xLoader\README.md` | Projekt-README (dreisprachig, Versionshistorie, Development) |
| `F:\001_Coding_Projekte\xLoader\description.md` | Greasy-Fork „Zusätzliche Informationen“ (DE → RU → EN) |
| `F:\001_Coding_Projekte\xLoader\ru-board_xloader_post.md` | Ru.Board-Beitragsentwurf (Forum 31, Thread 20664) |
| `F:\001_Coding_Projekte\xLoader\memory\` | Projektgedächtnis (dieses Verzeichnis) |
| `F:\001_Coding_Projekte\xLoader\.reasonix\skills\greasy-fork-release\SKILL.md` | lokales Release-Playbook (Spiegel in `!Wichtiges\Meine _Skills\projekt_weit\xLoader\`) |
| `node /c/Users/lolo/dh-test/xloader/dom-media-test.js xLoader.user.js` | optionaler DOM-Regressionstest (außerhalb Repo, lokal) |

