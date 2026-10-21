# xLoader — FACT SHEET (Stand: v1.0.33, 2026-10-21)

Dauerhaftes Projektwissen zum xLoader-Userscript. Bei Änderungen immer die
Stand-Zeile oben aktualisieren. Vollständiger Changelog: Kommentar oben in
`xLoader.user.js` (dort ist die Historie v1.0.4–v1.0.33 dokumentiert).

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
- **Verifizierter Release-Stand:** v1.0.33, Commit `204d9d64d0070cc75b6bfa75473abda0f81eda29`, Blob `c30c868bcd10baa27c98d1bdc602a1bb961c4fd0`. Aktueller Einstieg: `HANDOVER_v1.0.33.md`. v1.0.25/v1.0.28 bleiben historische lokale Fassungen.

## Aktueller Stand (v1.0.33)

- **v1.0.33, 2026-10-21:** Nutzerbestätigter Browser-Praxistest von v1.0.33-dev: HLS-/Broadcast-Download und Abbruchbestätigung beim erneuten Klick, Fortschrittsanzeige beibehalten. Offizielle Fassung v1.0.33: nur Release-Metadaten/-Beschreibungen (Name, Namespace, Versionsangabe, Auto-Update-URLs, Init-Log), Downloadlogik unverändert. Unterstützte Player-Cards, HLS/fMP4, Broadcast-/TS-Streams, `@connect pscp.tv` und Browser-Netzwerk-Fallback; nicht alle geschützten Streams. Tag v1.0.33 und GitHub-Asset erstellt und erneut geprüft; GF-Seite/Rohdatei 1.0.33, Inhalt bis auf Update-URLs identisch. Nachweise in HANDOVER_v1.0.33.md.



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

## Architektur / Orientierung

Eine Userscript-Quelldatei ohne Buildsystem oder externe Laufzeit-Abhängigkeiten.
Die Funktionsnamen sind die stabilen Suchpunkte; historische Zeilennummern
gelten nur für die jeweilige alte Version.

- Medien: `extractDomMedia`, `parseApiData`, `mergeDomItems`, `resolvePosterVideoUrls`.
- Cache/Prefetch: `getCachedItems`, `schedulePrefetch`, `failPrefetch`.
- Download: `onDownloadClick`, `selectDownloadFile`, `downloadSelectedFile`, `downloadUrl`.
- UI: `createButton`, `showProgress`, `processTweet`, `init`.

Historischer Funktionskatalog und alte Datenflüsse:
[HANDOVER v1.0.23 §5](HANDOVER_v1.0.23.md#5-funktionskatalog-zeilen--v1023).
Release- und Testnachweise: [HANDOVER v1.0.26](HANDOVER_v1.0.26.md).
Keine zweite veraltete Zeilentabelle hier fortschreiben.

## Kernabläufe

1. **Injektion:** Initial-Scan + MutationObserver; `processTweet` fügt pro Tweet mit Medien-Indikator einen geklonten Button ein; Lazy-Loading wird bis 3× nachgeprüft.
2. **Prefetch:** erst wenn der Tweet sichtbar wird (IntersectionObserver) → API-Call im Hintergrund (max. 3 parallel, Queue max. 30) → Cache `Map<tweetId,{items,fetchedAt}>`, TTL 5 min. 401/403/429 werden ohne automatischen Retry verworfen. Transiente Fehler und leere Antworten: maximal 2 Retries mit 10-s-Cooldown.
3. **Klick (Cache-Miss-Fallback-Kette):** X-API (`conversation.json`) → **Live-Token-Retry** (nur bei 401/403/Netzwerkfehler, **NICHT bei 429**) → **DOM-Merge** (`mergeDomItems`: Poster/Standbilder, `card_img`; Video-MP4 via `resolvePosterVideoUrl`) → differenzierte Fehlermeldung (429 / 401+403 / sonst). Cache-Treffer: sofortiger Download ohne API-Call.
4. **Progressiver Download (Basis v1.0.26):** Bei verfügbaren APIs und aktiver Benutzeraktion erste Dateiauswahl vor dem DOM-Merge; danach GM_xmlhttpRequest-Stream in die gewählte Datei (Fortschritt und Stillstands-Watchdog). Weitere Medien laufen weiterhin über GM_download mit dem first/all-Modus. Ohne Picker/Benutzeraktivierung GM_download auch für das erste Medium. Abbruch der Dateiauswahl beendet die Serie; Fehler geben den Button frei.
5. **HLS/Abbruch (v1.0.33):** Unterstützte Player-Cards und Aufzeichnungen mit geeigneten HLS-/fMP4-/MPEG-TS-Segmenten; TS gegebenenfalls als `.ts`. `pscp.tv` und alternativer Netzwerkabruf. Fortschritt bleibt; erneuter Buttonklick zeigt Ja/Nein zum Abbruch. Nicht alle geschützten Formate unterstützt. Nutzerbestätigter Browser-Test, keine neue Funktionsänderung beim lokalen Abgleich.
6. **Token:** Guest-Bearer (fest im Code, aus x.com main.js) + dynamischer Live-Bearer-Token (Regex `A{20,}…`, TTL 1 h, localStorage `xloader-live-token`, Migration alter Key beim ersten Lesen). Header `x-guest-token` immer senden, wenn Guest-Token existiert.

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

## Versionshistorie

Der maßgebliche Changelog steht im Kommentar am Anfang von `xLoader.user.js`.
Die dreisprachige Übersicht steht in [README.md](../README.md#version-history--versionshistorie--история-версий).
Historische Zustände bleiben in den versionsbezogenen Handovers und im Journal
erhalten. v1.0.25 war nur lokal; veröffentlichter Nachfolger von v1.0.24 ist
v1.0.26; aktueller Quellstand v1.0.33. Lokale Tags lassen sich mit `git tag --list` kontrollieren.

## Build- & Release-Regeln (verbindlich)

Diese Schritte sind eine Anleitung, keine Freigabe. Neue Builds und Veröffentlichungen
benötigen den jeweiligen Nutzerauftrag; reine Dokumentationspflege ändert keine Version.

1. **Freigabe und Ausgangsstand:** `git status --short --branch`, Projektanweisungen
   und zugehörige Änderungen prüfen; bestehende Nutzerarbeiten schützen.
2. **Version:** Neues Build erhält eine höhere Patchversion (Metablock, Changelog,
   Init-Log). Eine bereits getestete, ausdrücklich freigegebene Fassung zur
   Veröffentlichung unverändert verwenden; nicht erneut hochzählen.
3. **Tests:** Gemeinsame Befehlsliste in [README.md](../README.md#development--entwicklung--разработка).
   Node.js-Bordmittel, kein npm-Install nötig. Native Dialog-/Speichertests und
   lokale Simulationen als unterschiedliche Nachweise ausweisen.
4. **Archiv:** Quelle byte-identisch nach `Ausgabe/xLoader-v<VERSION>.user.js`
   kopieren; ältere Archive erhalten. Größe und SHA-256 prüfen (`Get-FileHash
   -Algorithm SHA256`); `Ausgabe/` nie committen.
5. **Commit/Push/Tag:** Nur zugehörige Dateien explizit stagen; Diff und Index
   prüfen. Autor repo-local immerzu. Commit und Push auf `main`, anschließend
   passenden Tag erstellen/pushen. Bereits ausgeführte Schritte erst prüfen.
6. **GitHub:** Windows-`gh` verwenden, Release-Notes aus einer Datei übernehmen
   (`--notes-file`), Tag mit `--verify-tag` prüfen und das kontrollierte
   `.user.js`-Archiv als Asset hochladen. Asset erneut herunterladen und Hash
   gegen Quelle vergleichen. Keine globalen Authentifizierungsänderungen.
7. **Greasy Fork:** `main`-Push löst den Webhook aus. Seite und tatsächliche
   Rohdatei kontrollieren; gesamte Fassung nach Entfernung ausschließlich
   von `@updateURL`/`@downloadURL` vergleichen (GF ersetzt/verschiebt diese).
   Falls nötig im GF-Admin nur „Jetzt aktualisieren und synchronisieren“
   (`input[name="update-and-sync"]`) auslösen; vorher automatische Aktualisierung
   abwarten. Sync-Felder für Skript und Zusatzbeschreibung nicht verwechseln.
8. **Abschluss:** Git-Endzustand, Commit/Tag, Asset-Hash und GF-Inhaltsvergleich
   im aktuellen Handover/Journal festhalten. Erfolg erst nach realer Prüfung
   beider Dienste melden.

Das lokale, werkzeugverwaltete Release-Playbook unter `.reasonix/` bleibt
unangetastet; Nutzerauftrag und `AGENTS.md` haben Vorrang. Historische externe
Testpfade und manuelle Upload-Umwege sind in [HANDOVER v1.0.23](HANDOVER_v1.0.23.md)
dokumentiert; der reguläre Ablauf benötigt keine Skriptinstallation im Browser.

## Wichtige Pfade

| Pfad | Zweck |
|------|-------|
| `F:\001_Coding_Projekte\xLoader\xLoader.user.js` | **Arbeitsdatei** v1.0.33; Metablock + Changelog oben |
| `F:\001_Coding_Projekte\xLoader\Ausgabe\` | Versionsarchive `xLoader-v1.0.X.user.js`, ältere `.js` (gitignored) |
| `F:\001_Coding_Projekte\xLoader\README.md` | Projekt-README (dreisprachig, Versionshistorie, Development) |
| `F:\001_Coding_Projekte\xLoader\description.md` | Greasy-Fork „Zusätzliche Informationen“ (DE → RU → EN) |
| `F:\001_Coding_Projekte\xLoader\ru-board_xloader_post.md` | historischer Ru.Board-Entwurf v1.0.24; Ziel-/Kontodaten vor Verwendung prüfen |
| `F:\001_Coding_Projekte\xLoader\memory\` | Projektgedächtnis (dieses Verzeichnis) |
| `F:\001_Coding_Projekte\xLoader\.reasonix\skills\greasy-fork-release\SKILL.md` | lokales Release-Playbook (Spiegel in `!Wichtiges\Meine _Skills\projekt_weit\xLoader\`) |
| `node /c/Users/lolo/dh-test/xloader/dom-media-test.js xLoader.user.js` | optionaler DOM-Regressionstest (außerhalb Repo, lokal) |


## Lokale Bereinigung

Aktuelle Bestandsaufnahme und unklare Kandidaten: [CLEANUP_2026-10-21.md](CLEANUP_2026-10-21.md).
`.gitignore` deckt lokale Profile, Ausgabe und Werkzeugdaten bereits ab.

## Lokale Fehlerkorrektur v1.0.28

Historisch, durch v1.0.33 abgelöst. Initialisierungssegment-Bug belegt und lokal korrigiert;
83 Tests sowie reale TM-/Windows-Dateien geprüft. Native Pickerlogik bleibt
unverändert; keine neue Dialogzeitmessung. Details: [HANDOVER v1.0.28](HANDOVER_v1.0.28.md).
