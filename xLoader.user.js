// ==UserScript==
// @name         xLoader
// @namespace    https://github.com/immerzu/xLoader
// @version      1.0.42
// @description  Lädt Bilder, Videos, GIFs und unterstützte HLS-Aufzeichnungen von X.com/Twitter herunter. Schnelle Dateiauswahl vor dem Streaming, zuverlässige Medienauflösung in Timeline und Einzelansicht, Fortschritt, Abbruchbestätigung, GM_download-Fallback und Dateinamenoptionen.
// @description:en Downloads images, videos, GIFs and supported HLS recordings from X.com/Twitter. Fast file selection before streaming, reliable media resolution in timelines and individual posts, progress, cancel confirmation, GM_download fallback and filename options.
// @description:ru Загружает изображения, видео, GIF и поддерживаемые записи HLS с X.com/Twitter. Быстрый выбор файла до потоковой передачи, надёжное определение медиа в ленте и отдельном посте, прогресс, подтверждение отмены, резервный GM_download и настройка имён файлов.
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
// @connect      pscp.tv
// @connect      cdn.syndication.twimg.com
// @noframes
// @run-at       document-end
// ==/UserScript==

/*
 * xLoader v1.0.42 (ansichtsunabhängiger Timeline-Metadatenfallback)
 *  - Wenn Timeline-React-Daten und Conversation-API kein Video liefern,
 *    werden öffentliche X-Syndication-Metadaten anhand der Status-ID geladen.
 *  - Die Hauptansicht erhält damit dieselben vollständigen mediaDetails wie
 *    der bereits funktionierende geöffnete Tweet.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.41 (laufende Timeline-Videos und Prozentfortschritt)
 *  - Bereits laufende Timeline-Player werden nicht mehr angehalten; vorhandene
 *    Netzwerkdaten bleiben erhalten und werden vor einem Resolver-Klick geprüft.
 *  - Progressive ext_tw_video-/amplify_video-Quellen werden einheitlich über
 *    ihre Media-ID zugeordnet.
 *  - Ein paralleler HEAD-Abruf ergänzt fehlende Stream-Gesamtgrößen, damit
 *    große direkte Videos wieder Prozentfortschritt anzeigen können.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.40 (frische Videoquelle nach Timeline-Dateiauswahl)
 *  - Der schnelle Speicherdialog bleibt vor dem Datentransfer erhalten.
 *  - Timeline-Videos aus React-/Prefetch-Daten werden nach der Dateiauswahl
 *    noch einmal über die Tweet-API abgeglichen; abgelaufene Quellen erzeugen
 *    dadurch keine leere Zieldatei mehr.
 *  - Unvollständige Live-Antworten ersetzen keine zusätzlichen Cache-Medien.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.39 (Härtung der DOM-Wiederanbindung)
 *  - Wiederverwendete Buttons sicher von Tasks anderer Tweet-IDs lösen.
 *  - Entfernte Buttons sofort aus WeakMap und Taskliste entfernen.
 *  - Fortschritt an alle verbundenen Darstellungen desselben Tweets spiegeln.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.38-dev (Fortschritts-Badge nach Teil-Recycling wiederherstellen)
 *  - Bereits vorhandene xLoader-Buttons bei DOM-Änderungen erneut anbinden.
 *  - Auch reine Entfernungen innerhalb eines Tweets zur Wiederherstellung prüfen.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.37-dev (Fortschritt nach Timeline-DOM-Recycling)
 *  - Laufende Downloads zusätzlich nach Tweet-ID verfolgen.
 *  - Neu gerenderte Downloadbuttons wieder an Status, Prozent und Abbruch binden.
 *  - Fortschritt bleibt nach Weg- und Zurückscrollen sichtbar.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.36-dev (Fortschritt auch ohne bekannte Gesamtgröße)
 *  - Videotransfers zeigen sofort eine neutrale laufende Anzeige.
 *  - Sobald Bytes und Gesamtgröße verfügbar sind, wechselt sie auf Prozent.
 *  - GM_download ohne onprogress/total bleibt damit sichtbar aktiv.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.35-dev (Quoted-Video statt Vorschaubild herunterladen)
 *  - Medien aus verschachtelten quoted_tweet-/GraphQL-Ergebnissen erkennen.
 *  - Syndication-mediaDetails als echte Videoquelle auswerten.
 *  - Ungelöste Video-Poster nie als JPG-Erfolg bzw. Download anbieten.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.34-dev (Härtung von Medienintegrität und Ressourcen)
 *  - HTTP-Teilantworten, Fehlertexte und unplausible Medienantworten ablehnen.
 *  - HLS-Initialisierung, Fragmente, Track-IDs, Zeitachsen, Lücken und
 *    tatsächlichen TS-/MP4-Container vor dem Finalisieren prüfen.
 *  - Abbruchsignal bis in Metadaten-, Token-, Broadcast- und Medienabrufe führen.
 *  - Medienhosts/-pfade strikt validieren; Cache, Retries und Segmentgrößen
 *    begrenzen und Cacheleeren gegen alte Hintergrundaufgaben absichern.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.33 (HLS-/Broadcast-Downloads und Abbruchbestätigung)
 *  - Erneuter Klick auf den laufenden Downloadpfeil zeigt kleine Bestätigung.
 *  - Nein/Schließen setzt ohne Unterbrechung fort; Ja bricht laufende
 *    Tampermonkey-, Browser- und HLS-Segmentabrufe tatsächlich ab.
 *  - Unfertige File-System-Access-Dateien abbrechen, nicht finalisieren;
 *    blaue Fortschrittsanzeige und gewohnter Downloadpfeil bleiben erhalten.
 *  - Nutzerbestätigter Browser-Praxistest; zur Veröffentlichung freigegeben.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.32-dev (TEST – HLS-Netzwerkzugriff)
 *  - Tampermonkey-@connect für alle pscp.tv-Subdomains dokumentationskonform.
 *  - Bei Fehler im Hintergrund-XHR HLS-Quelle über Browser-Fetch versuchen.
 *  - Ursächliche HTTP-/Host-/Netzwerk-Fehler ohne vertrauliche URL-Parameter ausgeben.
 *  - Direkten MP4-Stream und bestehende HLS-Zusammenführung nicht geändert.
 *  - Noch kein Live-Nachweis am RealAmVoice-Beitrag.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.31-dev (TEST – Broadcast-Replay-Erkennung)
 *  - X-Broadcast-ID aus Card/DOM aufloesen, Playback-URL abfragen.
 *  - Wiedergabequellen der Broadcast-Infrastruktur unter *.pscp.tv erkennen.
 *  - Abgeschlossene, unverschluesselte HLS-MPEG-TS-Aufzeichnungen als .ts
 *    speichern (nicht falsch als MP4 deklarieren). Bestehende MP4- und
 *    fMP4-HLS-Pfade beibehalten. Nicht live am Beispiel-Tweet verifiziert.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.30-dev (TEST – HLS/fMP4, nicht veröffentlicht)
 *  - HLS-Player-Cards und Video-/Audio-Varianten erkennen.
 *  - Abgeschlossene HLS-Aufnahmen als echte fragmentierte MP4 mit Tonspur
 *    streamen. Nicht unterstützte/verschlüsselte Streams sicher ablehnen.
 *  - Geprüfte direkte MP4-Downloads beibehalten.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.29-dev (TEST – nicht veröffentlicht)
 *  - Player-Card-Felder (unified_card/media_entities und player_stream_url)
 *    mit Prüfung auf vollständige progressive MP4 auswerten.
 *  - Doppelte Tweet-Objekte mit vollständigerer Medienliste bevorzugen.
 *  - Fehler als sichtbare Meldung statt ausschließlich kurzem Tooltip zeigen.
 *  - Streaming-Dateiauswahl und Downloaddatenpfad unverändert lassen.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.28 (Lokale Testfassung: vollständige progressive MP4)
 * ---------------------------------------------------------------------------
 * v1.0.28:
 *  - HLS-/DASH-Playlisten, Initialisierungssegmente und Fragmente ausschließen.
 *  - Vorhandene Metadaten des exakt passenden gerenderten Tweets nutzen;
 *    progressive MP4 mit höchster Bitrate statt Playback-Initsegment wählen.
 *  - Quellenprüfung auch vor Streaming und GM_download; schneller Picker,
 *    GIFs, Bilder, Mehrfachmedien und bisheriger Fallback bleiben erhalten.
 *  - Grundlage unverändert veröffentlichtes v1.0.26, nicht v1.0.27-dev.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.26 (Lokales Build, 2026-10-21)
 * ---------------------------------------------------------------------------
 * v1.0.26:
 *  - Neue eindeutige Patchversion fuer das korrigierte lokale Build.
 *  - Streamingfix der lokalen v1.0.25 uebernommen; Downloadlogik unveraendert.
 * ---------------------------------------------------------------------------
 * xLoader v1.0.25 (Dateiauswahl vor Datentransfer, Release 2026-10-21)
 * ---------------------------------------------------------------------------
 * v1.0.25:
 *  - Erstes bekanntes Medium: nativer Dateidialog vor dem DOM-/Video-Merge;
 *    anschließend GM_xmlhttpRequest-Stream in die gewählte Datei.
 *  - Tampermonkey-Window-Proxy: nativer Picker mit document.defaultView als
 *    Receiver. Ohne Picker/Benutzeraktivierung bleibt GM_download erhalten.
 *  - Fortschritt, Stillstands-Watchdog, HTTP-/Netzwerkfehler und Dateiabbruch;
 *    weitere Medien behalten die bestehenden first/all-Speicheroptionen.
 *  - Vom Nutzer im Browser erfolgreich getestet: schneller Speichern-Dialog.
 *  - Streaming-Korrektur: Status 0 beim Start zulassen; HTTP-Abschluss vor
 *    Dateiübernahme prüfen. Kein timeout:0 beim Fetch; Stream-Ende anfordern.
 *  - Syntaxprüfung, 43 Regressionstests und 28 gezielte Downloadtests; darunter
 *    realer HTTP-Stream mit Byte-/SHA-256-Vergleich der gespeicherten Datei.
 *    Native Dialogzeiten wurden nicht automatisiert vermessen.
 *    Beide Videos des gemeldeten Tweets mit echtem Tampermonkey 5.5.1
 *    übertragen; Größen und SHA-256 unabhängig verglichen (Datei-Adapter).
 *
 * xLoader v1.0.24 (Download-Fixes, Watchdog, klarere Fehlermeldungen)
 * ---------------------------------------------------------------------------
 * v1.0.24:
 *  - Zehn lokale Korrekturen übernommen: getHandle nutzt den Article des
 *    Medien-Elements (quoted Tweets), Recheck auch bei fehlender Aktionsleiste,
 *    loadItemsLive liefert {items, apiStatus} lokal, gemeinsamer
 *    Video-Poster-Resolver mit einer 5-s-Deadline, mergeDomItems nur einmal,
 *    try/catch/finally in onDownloadClick, failPrefetch ohne Retry bei
 *    401/403/429, prefetchSeen-Freigabe nach Erfolg, gmGet mit Timeout,
 *    releaseDetachedTweets und scheduleProcess mit closest-Filter.
 *  - Download-Watchdog: 5-min-Stillstands-Timeout (onprogress setzt zurück),
 *    abort() und klare Timeout-Meldung; keine starre Gesamtgrenze.
 *  - Klarere GM_download-Fehler: not_enabled/not_permitted/not_whitelisted/
 *    not_succeeded mit Handlungshinweis (Download-Modus auf Nativ/Browser-API).
 *  - Getestet: 13/13 Fix-, 11/11 DOM-, 19/19 Watchdog-Tests; portabler Chrome
 *    und Yandex (Browser-API).
 * ---------------------------------------------------------------------------
 * v1.0.23:
 *  - Kurzbeschreibung (@description) lokalisiert: deutsche Default-Zeile
 *    (= GF-Skript-Locale de) + @description:en + @description:ru — das Skript
 *    ist damit in der Greasy-Fork-Suche unter DE/EN/RU auffindbar. Grund: Die
 *    GF-Suche filtert standardmäßig nach Sprache; die bisherige einzeilige
 *    DE/EN/RU-Mischbeschreibung machte das Skript nur in der deutschen Suche
 *    auffindbar (EN/RU-Suche: unsichtbar). Kein @description:de (wird bei
 *    GF-Skript-Locale de ignoriert), keine @name:xx-Zeilen.
 * ---------------------------------------------------------------------------
 * v1.0.22:
 *  - Projektumzug: Repository liegt jetzt unter F:\001_Coding_Projekte\xLoader
 *    (vorher Downloadhilfe); alle Pfade/Verweise (Skills, Memory, Doku)
 *    entsprechend aktualisiert.
 *  - README: Platzhalter-Angabe korrigiert ({id} statt {tweetId}), Abschnitt
 *    „How it works" um @connect/@noframes/@run-at/@updateURL ergänzt, neuer
 *    Abschnitt „Development" (dreisprachig) mit Repo-/Release-Erläuterung.
 *  - ru-board-Post: Versionsstand auf v1.0.21 aktualisiert.
 * ---------------------------------------------------------------------------
 * v1.0.21:
 *  - Fix: extractDomMedia verwarf ALLE Medien des eigenen Tweets — der Guard
 *    filterte auf div[data-testid="tweet"] (den Body-Container, in dem auch
 *    die Medien liegen) statt auf eingebettete Tweets. DOM-Fallback und
 *    mergeDomItems (DOM-Poster/Standbilder ergänzen) waren damit funktionslos.
 *    Der Guard prüft jetzt gegen das nächstgelegene article[data-testid="tweet"]:
 *    eingebettete Tweets werden ausgeschlossen, die eigenen Medien gefunden.
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
        maxCacheEntries: 200,
        maxPrefetchSeenEntries: 500,
        maxHlsManifestBytes: 2 * 1024 * 1024,
        maxHlsSegmentBytes: 256 * 1024 * 1024,
        maxHlsSegments: 12000,
        performanceEntryMaxAgeMs: 30000,
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

    function downloadAbortError() {
        var e = new Error('Download vom Benutzer abgebrochen');
        e.name = 'AbortError';
        return e;
    }
    function ensureNotCancelled(signal) {
        if (signal && signal.aborted) throw downloadAbortError();
    }
    function isCancellation(e, signal) {
        return (signal && signal.aborted) || (e && e.name === 'AbortError');
    }
    function onDownloadAbort(signal, fn) {
        if (!signal) return function () {};
        if (signal.aborted) { fn(); return function () {}; }
        signal.addEventListener('abort', fn, { once: true });
        return function () { signal.removeEventListener('abort', fn); };
    }
    function abortableDelay(ms, signal) {
        ensureNotCancelled(signal);
        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () { cleanup(); resolve(); }, ms);
            var cleanup = onDownloadAbort(signal, function () {
                clearTimeout(timer);
                cleanup();
                reject(downloadAbortError());
            });
        });
    }

    // ============================ DOM-Medien-Extraktion ====================
    // (nur als Fallback für statische Bilder, wenn die API nicht erreichbar ist)

    // HLS VOD herunterladen: Video- und AAC-Spur als fMP4-Fragmentstrom
    // in eine echte gemeinsame MP4-Datei zusammenführen, ohne große RAM-Blobs.
    function allowedVideoHost(host) {
        return host === 'video.twimg.com' || host === 'video.pscp.tv' ||
            host.endsWith('.video.pscp.tv');
    }
    function allowedImageUrl(url) {
        try {
            var u = new URL(url);
            return u.protocol === 'https:' && u.hostname === 'pbs.twimg.com' &&
                /^\/(?:media|card_img|amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)\//.test(u.pathname);
        } catch (e) { return false; }
    }
    function isVideoPosterUrl(url) {
        try {
            var u = new URL(url);
            return u.protocol === 'https:' && u.hostname === 'pbs.twimg.com' &&
                /^\/(?:amplify_video_thumb|ext_tw_video_thumb)\//.test(u.pathname);
        } catch (e) { return false; }
    }
    function downloadableImageUrl(url) {
        try {
            var u = new URL(url);
            return u.protocol === 'https:' && u.hostname === 'pbs.twimg.com' &&
                /^\/(?:media|card_img)\//.test(u.pathname);
        } catch (e) { return false; }
    }
    function responseHeader(headers, name) {
        var match = new RegExp('(?:^|\\r?\\n)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            ':\\s*([^\\r\\n]+)', 'i').exec(headers || '');
        return match ? match[1].trim() : '';
    }
    function assertFullHttpResponse(status, headers, label) {
        if (status !== 200) throw new Error(label + ' HTTP ' + status +
            (status === 206 ? ' (unerwartete Teilantwort)' : ''));
        if (responseHeader(headers, 'content-range')) throw new Error(label + ': unerwartete Teilantwort');
    }
    function assertResponseSize(headers, actual, limit, label) {
        var declared = Number(responseHeader(headers, 'content-length'));
        if (isFinite(declared) && declared > limit) throw new Error(label + ': Antwort zu groß');
        if (actual > limit) throw new Error(label + ': Antwort zu groß');
        if (declared > 0 && actual !== declared) throw new Error(label + ': unvollständige Antwort');
    }
    function assertMediaContentType(headers, url) {
        var type = responseHeader(headers, 'content-type').split(';')[0].trim().toLowerCase();
        if (!type) return;
        var valid = allowedImageUrl(url) ? (/^image\//.test(type) || type === 'application/octet-stream') :
            (type === 'video/mp4' || type === 'application/mp4' || type === 'application/octet-stream');
        if (!valid) throw new Error('Download: unzulässiger Inhaltstyp ' + type);
    }
    function assertMediaPrefix(bytes, url) {
        if (!bytes || bytes.length < 12) throw new Error('Download: unplausibler Medieninhalt');
        if (allowedImageUrl(url)) {
            var jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
            var png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
                bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
            var gif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
                (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61;
            var webp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
            if (!jpeg && !png && !gif && !webp) throw new Error('Download: ungültige Bildsignatur');
            return;
        }
        var declared = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
        var type = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
        if (type !== 'ftyp' || declared < 8) throw new Error('Download: ungültige MP4-Signatur');
    }
    function hlsUrl(url) {
        try {
            var u = new URL(url);
            return u.protocol === 'https:' && allowedVideoHost(u.hostname) && /\.m3u8$/i.test(u.pathname);
        } catch (e) { return false; }
    }

    function mp4Boxes(bytes, start, end) {
        start = start || 0;
        end = end == null ? bytes.length : end;
        var found = [], view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        while (start + 8 <= end) {
            var size = view.getUint32(start), header = 8;
            if (size === 1) {
                if (start + 16 > end) throw new Error('MP4: ungültige Boxgröße');
                size = view.getUint32(start + 8) * 4294967296 + view.getUint32(start + 12);
                header = 16;
            }
            if (size === 0) size = end - start;
            if (size < header || start + size > end) throw new Error('MP4: beschädigtes Fragment');
            found.push({ start: start, end: start + size, head: header,
                type: String.fromCharCode.apply(null, Array.from(bytes.slice(start + 4, start + 8))) });
            start += size;
        }
        if (start !== end) throw new Error('MP4: überzählige Bytes');
        return found;
    }
    function mp4First(bytes, type, start, end) {
        return mp4Boxes(bytes, start, end).find(function (b) { return b.type === type; });
    }
    function mp4Children(bytes, b) { return mp4Boxes(bytes, b.start + b.head, b.end); }
    function mp4Path(bytes, types) {
        var b = { start: 0, end: bytes.length, head: 0 };
        for (var i = 0; i < types.length; i++) {
            b = mp4First(bytes, types[i], b.start + b.head, b.end);
            if (!b) throw new Error('MP4: fehlende ' + types[i] + '-Box');
        }
        return b;
    }
    function mp4Piece(bytes, b) { return bytes.slice(b.start, b.end); }
    function mp4Concat(parts) {
        var length = 0;
        for (var i = 0; i < parts.length; i++) length += parts[i].length;
        var out = new Uint8Array(length), offset = 0;
        for (var j = 0; j < parts.length; j++) { out.set(parts[j], offset); offset += parts[j].length; }
        return out;
    }
    function mp4Box(type, payload) {
        var out = new Uint8Array(payload.length + 8), view = new DataView(out.buffer);
        view.setUint32(0, out.length);
        for (var i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
        out.set(payload, 8);
        return out;
    }
    function mp4GetId(bytes, b, offset) {
        return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(b.start + offset);
    }
    function mp4SetId(bytes, b, offset, id) {
        new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(b.start + offset, id);
    }
    function mp4TrackId(bytes, trak) {
        var tkhd = mp4First(bytes, 'tkhd', trak.start + trak.head, trak.end);
        if (!tkhd) throw new Error('HLS: Trackheader fehlt');
        var offset = bytes[tkhd.start + 8] === 1 ? 28 : 20;
        var id = mp4GetId(bytes, tkhd, offset);
        if (!id) throw new Error('HLS: ungültige Track-ID');
        return id;
    }
    function mp4ValidateInit(bytes) {
        var ftyp = mp4First(bytes, 'ftyp'), moov = mp4First(bytes, 'moov');
        if (!ftyp || !moov) throw new Error('HLS: ungültige MP4-Initialisierung');
        var children = mp4Children(bytes, moov);
        var tracks = children.filter(function (b) { return b.type === 'trak'; });
        var mvex = children.find(function (b) { return b.type === 'mvex'; });
        if (!tracks.length || !mvex) throw new Error('HLS: Initialisierung ohne Track/mvex');
        var ids = tracks.map(function (t) { return mp4TrackId(bytes, t); });
        if (new Set(ids).size !== ids.length) throw new Error('HLS: doppelte Track-ID');
        var trexIds = mp4Children(bytes, mvex).filter(function (b) { return b.type === 'trex'; })
            .map(function (b) { return mp4GetId(bytes, b, 12); });
        if (!ids.every(function (id) { return trexIds.indexOf(id) !== -1; }))
            throw new Error('HLS: Track ohne TREX');
        return ids;
    }
    function mp4ValidateFragment(bytes, allowedIds) {
        var boxes = mp4Boxes(bytes);
        var moofs = boxes.filter(function (b) { return b.type === 'moof'; });
        var mdats = boxes.filter(function (b) { return b.type === 'mdat'; });
        if (moofs.length !== 1 || !mdats.length || !mdats.some(function (b) { return b.end - b.start > b.head; }))
            throw new Error('HLS: unvollständiges MP4-Medienfragment');
        var mediaBytes = mdats.reduce(function (sum, b) { return sum + b.end - b.start - b.head; }, 0);
        var trafs = mp4Children(bytes, moofs[0]).filter(function (b) { return b.type === 'traf'; });
        if (!trafs.length) throw new Error('HLS: Fragment ohne Track');
        var sampleCount = 0, decodeTimes = [];
        trafs.forEach(function (traf) {
            var parts = mp4Children(bytes, traf);
            var tfhd = parts.find(function (b) { return b.type === 'tfhd'; });
            var tfdt = parts.find(function (b) { return b.type === 'tfdt'; });
            var truns = parts.filter(function (b) { return b.type === 'trun'; });
            if (!tfhd || !tfdt || !truns.length) throw new Error('HLS: Fragment ohne tfhd/tfdt/trun');
            var id = mp4GetId(bytes, tfhd, 12);
            if (allowedIds.indexOf(id) === -1) throw new Error('HLS: unbekannte Fragment-Track-ID');
            var tfdtView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            var version = bytes[tfdt.start + 8];
            var time = version === 1 ? tfdtView.getUint32(tfdt.start + 12) * 4294967296 +
                tfdtView.getUint32(tfdt.start + 16) : tfdtView.getUint32(tfdt.start + 12);
            if (!Number.isSafeInteger(time) || time < 0) throw new Error('HLS: ungültige Fragmentzeit');
            decodeTimes.push(time);
            truns.forEach(function (trun) {
                var count = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(trun.start + 12);
                if (!count) throw new Error('HLS: Fragment ohne Samples');
                sampleCount += count;
            });
        });
        if (!sampleCount) throw new Error('HLS: Fragment ohne Samples');
        if (sampleCount > mediaBytes) throw new Error('HLS: Sampleanzahl passt nicht zu den Mediendaten');
        return { decodeTime: Math.min.apply(null, decodeTimes), samples: sampleCount };
    }
    function validateTsSegment(bytes) {
        if (bytes.length < 188 || bytes.length % 188 !== 0) throw new Error('HLS: ungültiges MPEG-TS-Segment');
        var hasPayload = false;
        for (var i = 0; i < bytes.length; i += 188) {
            if (bytes[i] !== 0x47 || (bytes[i + 1] & 0x80)) throw new Error('HLS: ungültiges MPEG-TS-Segment');
            var pid = ((bytes[i + 1] & 0x1f) << 8) | bytes[i + 2];
            var control = (bytes[i + 3] >> 4) & 3;
            if (!control) throw new Error('HLS: ungültiges MPEG-TS-Paket');
            if (pid !== 0x1fff && (control & 1)) hasPayload = true;
        }
        if (!hasPayload) throw new Error('HLS: TS-Segment ohne Nutzdaten');
    }
    function mp4CombinedInit(videoInit, audioInit) {
        // X liefert oft zwei einzelne MP4-Tracks. Die Boxen der Audio-Spur
        // werden mit eigener Track-ID in den gemeinsamen moov übernommen.
        var vMoov = mp4Path(videoInit, ['moov']);
        var aMoov = mp4Path(audioInit, ['moov']);
        var vTracks = mp4Children(videoInit, vMoov).filter(function (b) { return b.type === 'trak'; });
        var aTracks = mp4Children(audioInit, aMoov).filter(function (b) { return b.type === 'trak'; });
        if (vTracks.length !== 1 || aTracks.length !== 1) throw new Error('HLS: unerwartete Track-Anzahl');
        var videoTkhd = mp4Path(videoInit, ['moov', 'trak', 'tkhd']);
        var audioTkhd = mp4Path(audioInit, ['moov', 'trak', 'tkhd']);
        var trackOffset = function (bytes, b) { return bytes[b.start + 8] === 1 ? 28 : 20; };
        var videoId = mp4GetId(videoInit, videoTkhd, trackOffset(videoInit, videoTkhd));
        var audioId = mp4GetId(audioInit, audioTkhd, trackOffset(audioInit, audioTkhd));
        var newAudioId = videoId === 1 ? 2 : 1;
        var audioTrack = mp4Piece(audioInit, aTracks[0]);
        var tkh = mp4First(audioTrack, 'tkhd', 8, audioTrack.length);
        if (!tkh) throw new Error('HLS: Audio-Trackheader fehlt');
        mp4SetId(audioTrack, tkh, trackOffset(audioTrack, tkh), newAudioId);
        var videoMvex = mp4Path(videoInit, ['moov', 'mvex']);
        var audioMvex = mp4Path(audioInit, ['moov', 'mvex']);
        var aTrex = mp4Children(audioInit, audioMvex).find(function (b) { return b.type === 'trex'; });
        if (!aTrex) throw new Error('HLS: Audio-TREX fehlt');
        var audioTrex = mp4Piece(audioInit, aTrex);
        mp4SetId(audioTrex, { start: 0 }, 12, newAudioId);
        var mvexParts = mp4Children(videoInit, videoMvex).map(function (b) { return mp4Piece(videoInit, b); });
        mvexParts.push(audioTrex);
        var newMvex = mp4Box('mvex', mp4Concat(mvexParts));
        var moovParts = [];
        mp4Children(videoInit, vMoov).forEach(function (b) {
            moovParts.push(b.type === 'mvex' ? newMvex : mp4Piece(videoInit, b));
            if (b.type === 'trak') moovParts.push(audioTrack);
        });
        var ftyp = mp4First(videoInit, 'ftyp');
        if (!ftyp) throw new Error('HLS: ftyp fehlt');
        return { init: mp4Concat([mp4Piece(videoInit, ftyp), mp4Box('moov', mp4Concat(moovParts))]),
            originalAudioId: audioId, newAudioId: newAudioId };
    }
    function mp4AudioFragment(bytes, originalId, newId) {
        var out = bytes.slice();
        mp4Boxes(out).forEach(function (box) {
            if (box.type !== 'moof') return;
            mp4Children(out, box).forEach(function (traf) {
                if (traf.type !== 'traf') return;
                mp4Children(out, traf).forEach(function (tfhd) {
                    if (tfhd.type === 'tfhd') {
                        if (mp4GetId(out, tfhd, 12) !== originalId) throw new Error('HLS: unbekannte Audio-Track-ID');
                        mp4SetId(out, tfhd, 12, newId);
                    }
                });
            });
        });
        return out;
    }
    function hlsAttributes(value) {
        var result = {}, re = /([A-Z0-9-]+)=("[^"]*"|[^,]*)/g, m;
        while ((m = re.exec(value))) result[m[1]] = m[2].charAt(0) === '"' ? m[2].slice(1, -1) : m[2];
        return result;
    }
    function hlsPlaylist(text, baseUrl) {
        if (typeof text !== 'string' || text.length > CONFIG.maxHlsManifestBytes)
            throw new Error('HLS: Playlist zu groß');
        if (!/^#EXTM3U(?:\s|$)/.test(text)) throw new Error('HLS: ungültige Playlist');
        var lines = text.replace(/\r/g, '').split('\n').map(function (s) { return s.trim(); });
        var variants = [], audio = [], entries = [], initUrl = null, endlist = false;
        var pendingInf = null, duration = 0, discontinuities = 0, gapPending = false;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (!line) continue;
            if (line.indexOf('#EXT-X-STREAM-INF:') === 0) {
                var attr = hlsAttributes(line.slice(18));
                var candidate = lines[++i];
                if (!candidate || candidate.charAt(0) === '#') throw new Error('HLS: ungültige Variant-Playlist');
                variants.push({ url: new URL(candidate, baseUrl).href, attr: attr });
            } else if (line.indexOf('#EXT-X-MEDIA:') === 0) {
                var at = hlsAttributes(line.slice(13));
                if (at.TYPE === 'AUDIO' && at.URI) audio.push({ url: new URL(at.URI, baseUrl).href, attr: at });
            } else if (line.indexOf('#EXT-X-MAP:') === 0) {
                var ma = hlsAttributes(line.slice(11));
                if (!ma.URI || ma.BYTERANGE) throw new Error('HLS: nicht unterstütztes EXT-X-MAP');
                var nextInit = new URL(ma.URI, baseUrl).href;
                if (initUrl && initUrl !== nextInit) throw new Error('HLS: EXT-X-MAP-Wechsel nicht unterstützt');
                initUrl = nextInit;
            } else if (line.indexOf('#EXTINF:') === 0) {
                pendingInf = Number(line.slice(8).split(',')[0]);
                if (!isFinite(pendingInf) || pendingInf <= 0) throw new Error('HLS: ungültige Segmentdauer');
            } else if (line.indexOf('#EXT-X-KEY:') === 0 && !/METHOD=NONE(?:,|$)/.test(line)) {
                throw new Error('HLS: verschlüsselter Stream nicht unterstützt');
            } else if (line.indexOf('#EXT-X-BYTERANGE:') === 0) {
                throw new Error('HLS: Byte-Range nicht unterstuetzt');
            } else if (line.indexOf('#EXT-X-DISCONTINUITY') === 0) {
                discontinuities++;
            } else if (line === '#EXT-X-GAP') {
                gapPending = true;
            } else if (line === '#EXT-X-ENDLIST') {
                endlist = true;
            } else if (line.charAt(0) !== '#' && pendingInf !== null) {
                if (gapPending) throw new Error('HLS: Playlist enthält eine Medienlücke');
                entries.push({ url: new URL(line, baseUrl).href, time: duration, duration: pendingInf });
                duration += pendingInf;
                pendingInf = null;
                gapPending = false;
            }
        }
        if (pendingInf !== null || gapPending) throw new Error('HLS: unvollständiger Playlist-Eintrag');
        return { variants: variants, audio: audio, initUrl: initUrl, segments: entries, endlist: endlist, discontinuities: discontinuities };
    }
    // GM_xmlhttpRequest läuft im Tampermonkey-Hintergrund. Für Broadcast-
    // CDNs kann die Browser-Seite einen anderen, funktionierenden Netzpfad
    // besitzen. Nach einem erfolgreichen Browser-Fallback diesen bevorzugen.
    var hlsPreferBrowserFetch = false;
    function hlsFetchBrowser(url, kind, signal) {
        var browserFetch = typeof fetch === 'function' ? fetch :
            (typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch.bind(window) : null);
        if (!browserFetch) return Promise.reject(new Error('Browser-Fetch nicht verfügbar'));
        ensureNotCancelled(signal);
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, CONFIG.requestTimeoutMs) : null;
        var cleanupAbort = onDownloadAbort(signal, function () { if (controller) controller.abort(); });
        return Promise.resolve().then(function () {
            ensureNotCancelled(signal);
            return browserFetch(url, { method: 'GET', mode: 'cors', credentials: 'omit',
                signal: controller ? controller.signal : undefined });
        }).then(async function (response) {
            if (!response) throw new Error('Browser HTTP ?');
            assertFullHttpResponse(response.status, response.headers && response.headers.get ?
                Array.from(response.headers.entries()).map(function (v) { return v[0] + ': ' + v[1]; }).join('\n') : '', 'Browser');
            var limit = kind === 'text' ? CONFIG.maxHlsManifestBytes : CONFIG.maxHlsSegmentBytes;
            var declared = Number(response.headers && response.headers.get ? response.headers.get('content-length') : 0);
            if (isFinite(declared) && declared > limit) throw new Error('Browser-Fetch: Antwort zu groß');
            if (kind === 'text') {
                var value = await response.text();
                if (value.length > limit) throw new Error('Browser-Fetch: Antwort zu groß');
                return value;
            }
            var data = new Uint8Array(await response.arrayBuffer());
            assertResponseSize('content-length: ' + (declared || ''), data.length, limit, 'Browser-Fetch');
            if (!data.length) throw new Error('Browser-Fetch: leeres Segment');
            return data;
        }).finally(function () {
            if (timer) clearTimeout(timer);
            cleanupAbort();
        });
    }
    function hlsFetchGM(url, kind, signal) {
        ensureNotCancelled(signal);
        return new Promise(function (resolve, reject) {
            var handle = null, settled = false;
            var cleanupAbort = function () {};
            function settle(err, data) {
                if (settled) return;
                settled = true;
                cleanupAbort();
                if (err) reject(err); else resolve(data);
            }
            function abortRequest() {
                try { if (handle && typeof handle.abort === 'function') handle.abort(); } catch (_) {}
                settle(downloadAbortError());
            }
            cleanupAbort = onDownloadAbort(signal, abortRequest);
            if (signal && signal.aborted) { abortRequest(); return; }
            var opts = { method: 'GET', url: url, timeout: CONFIG.requestTimeoutMs,
                onload: function (r) {
                    if (signal && signal.aborted) { settle(downloadAbortError()); return; }
                    try {
                        assertFullHttpResponse(r.status, r.responseHeaders, 'GM');
                        var limit = kind === 'text' ? CONFIG.maxHlsManifestBytes : CONFIG.maxHlsSegmentBytes;
                        if (kind === 'text') {
                            var text = r.responseText || r.response;
                            if (typeof text !== 'string' || !text.length) throw new Error('GM: leere Playlist');
                            assertResponseSize(r.responseHeaders, text.length, limit, 'GM');
                            settle(null, text);
                        } else if (r.response && r.response.byteLength) {
                            var bytes = new Uint8Array(r.response);
                            assertResponseSize(r.responseHeaders, bytes.length, limit, 'GM');
                            settle(null, bytes);
                        } else throw new Error('GM: leeres Segment');
                    } catch (e) { settle(e); }
                },
                onerror: function (r) {
                    if (signal && signal.aborted) { settle(downloadAbortError()); return; }
                    var detail = String((r && (r.error || r.statusText)) || '');
                    var category = /not.permitted|not.whitelisted|refused to connect|@connect/i.test(detail) ? 'Zugriff nicht erlaubt' :
                        /blacklist/i.test(detail) ? 'Domain gesperrt' : 'Netzwerkfehler';
                    settle(new Error('GM: ' + category));
                },
                ontimeout: function () { settle(new Error('GM: Timeout')); },
                onabort: function () { settle(signal && signal.aborted ? downloadAbortError() : new Error('GM: abgebrochen')); }
            };
            if (kind !== 'text') opts.responseType = 'arraybuffer';
            try {
                handle = GM_xmlhttpRequest(opts);
                if (signal && signal.aborted) abortRequest();
            } catch (e) { settle(new Error('GM: Aufruf gescheitert')); }
        });
    }
    async function hlsFetch(url, kind, signal) {
        ensureNotCancelled(signal);
        if (!hlsUrl(url) && !hlsMediaPartUrl(url)) throw new Error('HLS: unzulässige Medienadresse');
        var host = new URL(url).hostname;
        var first = hlsPreferBrowserFetch ? hlsFetchBrowser : hlsFetchGM;
        var second = hlsPreferBrowserFetch ? hlsFetchGM : hlsFetchBrowser;
        try { return await first(url, kind, signal); }
        catch (firstError) {
            if (isCancellation(firstError, signal)) throw downloadAbortError();
            try {
                var value = await second(url, kind, signal);
                ensureNotCancelled(signal);
                if (!hlsPreferBrowserFetch) hlsPreferBrowserFetch = true;
                return value;
            } catch (secondError) {
                if (isCancellation(secondError, signal)) throw downloadAbortError();
                throw new Error('HLS-Zugriff auf ' + host + ' fehlgeschlagen: ' +
                    firstError.message + '; zweiter Abruf: ' + secondError.message);
            }
        }
    }
    function hlsMediaPartUrl(url) {
        try {
            var u = new URL(url);
            return u.protocol === 'https:' && allowedVideoHost(u.hostname) &&
                /\.(?:m4s|mp4|cmfv|cmfa|ts|m4a)$/i.test(u.pathname);
        } catch (e) { return false; }
    }
    async function hlsResolve(url, signal) {
        var master = hlsPlaylist(await hlsFetch(url, 'text', signal), url);
        var selected = null, audioUrl = null;
        if (master.variants.length) {
            var isAudioOnly = function (v) {
                return (/mp4a|aac/i.test(v.attr.CODECS || '') && !/avc1|hvc1|hev1/i.test(v.attr.CODECS || '')) ||
                    /\/pl\/mp4a\//.test(v.url);
            };
            var videoVariants = master.variants.filter(function (v) { return !isAudioOnly(v); });
            var audioVariants = master.variants.filter(isAudioOnly);
            videoVariants.sort(function (a, b) {
                return Number(b.attr['AVERAGE-BANDWIDTH'] || b.attr.BANDWIDTH || 0) -
                    Number(a.attr['AVERAGE-BANDWIDTH'] || a.attr.BANDWIDTH || 0);
            });
            audioVariants.sort(function (a, b) { return Number(b.attr.BANDWIDTH || 0) - Number(a.attr.BANDWIDTH || 0); });
            selected = videoVariants[0];
            if (!selected) throw new Error('HLS: keine Video-Variante');
            var group = selected.attr.AUDIO;
            var candidateAudio = master.audio.filter(function (v) { return !group || v.attr['GROUP-ID'] === group; });
            candidateAudio.sort(function (a, b) { return Number(b.attr.DEFAULT === 'YES') - Number(a.attr.DEFAULT === 'YES'); });
            audioUrl = candidateAudio.length ? candidateAudio[0].url :
                (audioVariants.length ? audioVariants[0].url : null);
        }
        var videoUrl = selected ? selected.url : url;
        var video = selected ? hlsPlaylist(await hlsFetch(videoUrl, 'text', signal), videoUrl) : master;
        // Broadcast-Replays werden haeufig als MPEG-TS statt fMP4 ausgeliefert.
        var transportStream = !video.initUrl && video.segments.length && video.segments.every(function (seg) {
            return /\.ts$/i.test(new URL(seg.url).pathname);
        });
        if ((!video.initUrl && !transportStream) || !video.segments.length)
            throw new Error('HLS: weder fMP4- noch TS-Videosegmente');
        if (video.discontinuities)
            throw new Error('HLS: Zeitachsenwechsel nicht unterstützt');
        if (!video.endlist) throw new Error('HLS: laufender Stream ohne vollständiges Aufnahmeende');
        if (video.segments.length > CONFIG.maxHlsSegments) throw new Error('HLS: Segmentzahl zu groß');
        var audio = null;
        if (audioUrl) {
            audio = hlsPlaylist(await hlsFetch(audioUrl, 'text', signal), audioUrl);
            if (!audio.initUrl || !audio.endlist || !audio.segments.length) throw new Error('HLS: Audio-Aufnahme nicht vollständig');
            if (audio.discontinuities) throw new Error('HLS: Audio-Zeitachsenwechsel nicht unterstützt');
            if (audio.segments.length > CONFIG.maxHlsSegments) throw new Error('HLS: Audio-Segmentzahl zu groß');
        }
        if (transportStream && audio) throw new Error('HLS: TS-Aufnahme mit separater Tonspur nicht unterstuetzt');
        ensureNotCancelled(signal);
        return { video: video, audio: audio, transportStream: transportStream };
    }
    async function downloadHlsFile(url, file, onProgress, signal, expectedExt) {
        var writable = null;
        try {
            ensureNotCancelled(signal);
            var playlist = await hlsResolve(url, signal);
            var actualExt = playlist.transportStream ? 'ts' : 'mp4';
            if (expectedExt && expectedExt.toLowerCase() !== actualExt) {
                var mismatch = new Error('HLS: tatsächlicher Container .' + actualExt +
                    ' stimmt nicht mit .' + expectedExt + ' überein; erneut speichern');
                mismatch.code = 'HLS_CONTAINER_MISMATCH';
                mismatch.actualExt = actualExt;
                throw mismatch;
            }
            ensureNotCancelled(signal);
            // fMP4-Init enthält die Codec-Informationen; erst danach schreiben.
            if (playlist.transportStream) {
                ensureNotCancelled(signal);
                writable = await file.createWritable();
                ensureNotCancelled(signal);
                var tsCount = 0;
                for (var si = 0; si < playlist.video.segments.length; si++) {
                    var segment = await hlsFetch(playlist.video.segments[si].url, 'bytes', signal);
                    ensureNotCancelled(signal);
                    validateTsSegment(segment);
                    await writable.write(segment);
                    ensureNotCancelled(signal);
                    tsCount += segment.length;
                    if (onProgress) onProgress({ done: si + 1, total: playlist.video.segments.length,
                        percent: Math.round((si + 1) * 100 / playlist.video.segments.length), segmented: true });
                }
                if (!tsCount) throw new Error('HLS: leere TS-Aufzeichnung');
                ensureNotCancelled(signal);
                await writable.close();
                writable = null;
                return;
            }
            var videoInit = await hlsFetch(playlist.video.initUrl, 'bytes', signal);
            var audioInit = playlist.audio ? await hlsFetch(playlist.audio.initUrl, 'bytes', signal) : null;
            var videoTrackIds = mp4ValidateInit(videoInit);
            var audioTrackIds = audioInit ? mp4ValidateInit(audioInit) : null;
            var muxInfo = audioInit ? mp4CombinedInit(videoInit, audioInit) : null;
            var init = muxInfo ? muxInfo.init : videoInit;
            var outputTrackIds = mp4ValidateInit(init);
            var jobs = [];
            playlist.video.segments.forEach(function (s) { jobs.push({ url: s.url, time: s.time, kind: 'video' }); });
            if (playlist.audio) playlist.audio.segments.forEach(function (s) { jobs.push({ url: s.url, time: s.time, kind: 'audio' }); });
            jobs.sort(function (a, b) { return a.time - b.time || (a.kind === 'video' ? -1 : 1); });
            ensureNotCancelled(signal);
            writable = await file.createWritable();
            ensureNotCancelled(signal);
            await writable.write(init);
            var lastTime = { video: -1, audio: -1 };
            for (var i = 0; i < jobs.length; i++) {
                var bytes = await hlsFetch(jobs[i].url, 'bytes', signal);
                ensureNotCancelled(signal);
                var sourceIds = jobs[i].kind === 'audio' ? audioTrackIds : videoTrackIds;
                var fragment = mp4ValidateFragment(bytes, sourceIds);
                if (fragment.decodeTime < lastTime[jobs[i].kind]) throw new Error('HLS: nicht monotone Fragmentzeit');
                lastTime[jobs[i].kind] = fragment.decodeTime;
                if (jobs[i].kind === 'audio') {
                    bytes = mp4AudioFragment(bytes, muxInfo.originalAudioId, muxInfo.newAudioId);
                    mp4ValidateFragment(bytes, outputTrackIds);
                }
                await writable.write(bytes);
                ensureNotCancelled(signal);
                if (onProgress) onProgress({ done: i + 1, total: jobs.length, percent: Math.round((i + 1) * 100 / jobs.length), segmented: true });
            }
            ensureNotCancelled(signal);
            await writable.close();
            writable = null;
        } catch (e) {
            if (writable) try { await writable.abort(); } catch (_) { /* unveränderte Datei schützen */ }
            throw e;
        }
    }

    function isProgressiveVideoUrl(url) {
        try {
            var u = new URL(url);
            if (u.protocol !== 'https:' || u.hostname !== 'video.twimg.com') return false;
            // HLS-Initsegmente enthalten vor der Auflösung Zeitbereiche /0/0/.
            // Nur progressive MP4-Pfade (inkl. älterem /pu/vid/) und GIF-MP4.
            return /\/vid\/(?:[a-z][a-z0-9_-]*\/)?\d+x\d+\/[^/]+\.mp4$/i.test(u.pathname) ||
                /^\/tweet_video\/[^/]+\.mp4$/i.test(u.pathname);
        } catch (e) { return false; }
    }

    function isMediaUrl(url) {
        if (!url || typeof url !== 'string') return false;
        var parsed;
        try {
            parsed = new URL(url);
        } catch (e) {
            return false;
        }
        if (parsed.protocol !== 'https:') return false;
        if (parsed.hostname === 'pbs.twimg.com') return allowedImageUrl(url);
        if (parsed.hostname === 'video.twimg.com') return isProgressiveVideoUrl(url) || hlsUrl(url);
        return hlsUrl(url);
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
            // Elemente in EINGEBETTETEN Tweets überspringen (deren nächst-
            // gelegenes article ist nicht der Ziel-Tweet). Der eigene Body-
            // Container div[data-testid="tweet"] ist dagegen normal — dort
            // liegen auch die Medien (tweetPhoto/videoPlayer); ein Filter auf
            // div[data-testid="tweet"] würde ALLE Medien des eigenen Tweets
            // verwerfen und den DOM-Fallback/mergeDomItems lahmlegen.
            if (el.closest('article[data-testid="tweet"]') !== tweet) continue;

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
            if (box.closest('article[data-testid="tweet"]') !== tweet) continue;
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

    function gmTextRequest(url, headers, signal, label) {
        ensureNotCancelled(signal);
        return new Promise(function (resolve, reject) {
            var handle = null, settled = false, cleanupAbort = function () {};
            function finish(err, value) {
                if (settled) return;
                settled = true;
                cleanupAbort();
                if (err) reject(err); else resolve(value);
            }
            function abortRequest() {
                try { if (handle && typeof handle.abort === 'function') handle.abort(); } catch (_) {}
                finish(downloadAbortError());
            }
            cleanupAbort = onDownloadAbort(signal, abortRequest);
            if (signal && signal.aborted) { abortRequest(); return; }
            try {
                handle = GM_xmlhttpRequest({
                    method: 'GET', url: url, headers: headers || {}, timeout: CONFIG.requestTimeoutMs,
                    onload: function (res) {
                        if (signal && signal.aborted) { abortRequest(); return; }
                        if (res.status === 200) finish(null, res.responseText);
                        else {
                            var err = new Error(label + ' HTTP ' + res.status);
                            err.status = res.status;
                            finish(err);
                        }
                    },
                    onerror: function () { finish(new Error(label + ' Netzwerk-/CORS-Fehler')); },
                    ontimeout: function () { finish(new Error(label + ' Timeout')); },
                    onabort: function () { finish(signal && signal.aborted ? downloadAbortError() : new Error(label + ' abgebrochen')); }
                });
                if (signal && signal.aborted) abortRequest();
            } catch (e) { finish(new Error(label + ': Aufruf gescheitert')); }
        });
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
    async function fetchTweetData(statusId, signal) {
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

        var text = await gmTextRequest(url, headers, signal, 'API');
        ensureNotCancelled(signal);
        try { return JSON.parse(text); }
        catch (e) { throw new Error('API JSON-Parse-Fehler'); }
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
            var id = obj.rest_id || obj.id_str || obj.id ||
                (obj.legacy && obj.legacy.id_str) || null;
            if (id && (obj.extended_entities || obj.entities || obj.mediaDetails || obj.full_text || obj.text ||
                obj.card || obj.quoted_tweet || obj.quoted_status_result ||
                (obj.legacy && (obj.legacy.extended_entities || obj.legacy.card)))) {
                var prior = map.get(String(id));
                // Ein späteres abgespecktes Objekt darf die vollständigere
                // Tweet-/Card-Repräsentation nicht überschreiben.
                if (!prior || apiMediaFromTweet(obj).length > apiMediaFromTweet(prior).length) {
                    map.set(String(id), obj);
                }
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
    // Player-Card-Bindings werden von X sowohl als Liste mit {key,value}
    // als auch als Objekt mit direkten keys geliefert (manchmal unter legacy).
    function cardBinding(card, name) {
        var values = card && (card.binding_values || (card.legacy && card.legacy.binding_values));
        if (!values) return null;
        var raw = null;
        if (Array.isArray(values)) {
            for (var i = 0; i < values.length; i++) {
                if (values[i] && values[i].key === name) { raw = values[i].value; break; }
            }
        } else {
            raw = values[name];
        }
        if (typeof raw === 'string') return raw;
        if (!raw || typeof raw !== 'object') return null;
        return typeof raw.string_value === 'string' ? raw.string_value :
            (raw.value && typeof raw.value.string_value === 'string' ? raw.value.string_value : null);
    }

    function broadcastIdOf(url) {
        if (!url || typeof url !== 'string') return null;
        try {
            var parsed = new URL(url, location.origin);
            if (!['x.com', 'twitter.com', 'www.x.com', 'www.twitter.com'].includes(parsed.hostname)) return null;
            var match = parsed.pathname.match(/^\/i\/broadcasts\/([A-Za-z0-9]+)(?:\/|$)/);
            return match ? match[1] : null;
        } catch (e) { return null; }
    }
    function broadcastItem(id) {
        return { url: 'https://x.com/i/broadcasts/' + id, ext: 'ts', broadcastId: id };
    }
    function broadcastFromDom(tweet) {
        var anchors = tweet.querySelectorAll('a[href*="/i/broadcasts/"]');
        for (var i = 0; i < anchors.length; i++) {
            if (anchors[i].closest(CONFIG.tweetSelector) !== tweet) continue;
            var id = broadcastIdOf(anchors[i].href || anchors[i].getAttribute('href'));
            if (id) return broadcastItem(id);
        }
        return null;
    }
    async function gmBroadcastJson(url, signal) {
        var cookies = getCookies();
        var headers = {authorization: 'Bearer ' + (liveToken || CONFIG.api.guestBearer),
            'x-twitter-active-user': 'yes', 'x-csrf-token': cookies.ct0 || '',
            'x-twitter-client-language': cookies.lang || 'en'};
        if (cookies.gt) headers['x-guest-token'] = cookies.gt;
        var text = await gmTextRequest(url, headers, signal, 'Broadcast API');
        ensureNotCancelled(signal);
        try { return JSON.parse(text); }
        catch (e) { throw new Error('Broadcast: Antwort unlesbar'); }
    }
    async function broadcastPlaybackUrl(id, signal) {
        // X-Broadcast-Aufloesung: Broadcast-ID -> media_key -> Replay-Manifest.
        log.info('Lade Broadcast-Metadaten (ID: ' + id + ')');
        var show = await gmBroadcastJson(location.origin + '/i/api/1.1/broadcasts/show.json?ids=' + encodeURIComponent(id), signal);
        ensureNotCancelled(signal);
        var entry = show.broadcasts && show.broadcasts[id];
        var mediaKey = entry && entry.media_key;
        if (!mediaKey) throw new Error('Broadcast: media_key nicht verfuegbar');
        log.info('Broadcast-Medienschluessel gefunden; lade Replay-Adresse.');
        var data = await gmBroadcastJson(location.origin + '/i/api/1.1/live_video_stream/status/' +
            encodeURIComponent(mediaKey) + '?client=web&use_syndication_guest_id=false&cookie_set_host=x.com', signal);
        ensureNotCancelled(signal);
        var source = data.source || {};
        var candidates = [source.noRedirectPlaybackUrl, source.location, source.url];
        for (var i = 0; i < candidates.length; i++) {
            var raw = candidates[i];
            if (!raw) continue;
            if (hlsUrl(raw)) { log.info('Replay-CDN: ' + new URL(raw).hostname); return raw; }
            try {
                // X kann die eigentliche CDN-URL in einem erlaubten Redirect-Link kapseln.
                var wrapped = new URL(raw);
                if (['x.com', 'twitter.com'].includes(wrapped.hostname)) {
                    var nested = wrapped.searchParams.get('url');
                    if (nested && hlsUrl(nested)) { log.info('Replay-CDN: ' + new URL(nested).hostname); return nested; }
                }
            } catch (e) { /* naechster Kandidat */ }
        }
        throw new Error('Broadcast: keine zulaessige Replay-Playlist erhalten');
    }

    function cardMediaFromTweet(tweetObj) {
        var found = [];
        var card = tweetObj.card || (tweetObj.legacy && tweetObj.legacy.card);
        if (!card || typeof card !== 'object') {
            var tweetUrls = (tweetObj.legacy || tweetObj).entities;
            var expanded = tweetUrls && tweetUrls.urls;
            if (Array.isArray(expanded)) {
                expanded.forEach(function (u) {
                    var id = broadcastIdOf(u.expanded_url || u.url);
                    if (id && !found.some(function (f) { return f.broadcastId === id; })) found.push(broadcastItem(id));
                });
            }
            return found;
        }
        var broadcastId = broadcastIdOf(cardBinding(card, 'broadcast_url')) ||
            broadcastIdOf(cardBinding(card, 'player_url')) ||
            broadcastIdOf(cardBinding(card, 'url')) || broadcastIdOf(card.url);
        var ent = (tweetObj.legacy || tweetObj).entities;
        var links = ent && ent.urls;
        if (!broadcastId && Array.isArray(links)) {
            for (var li = 0; li < links.length; li++) {
                broadcastId = broadcastIdOf(links[li].expanded_url || links[li].url);
                if (broadcastId) break;
            }
        }
        if (broadcastId && (/(?:^|:)broadcast$/.test(card.name || '') ||
            (links && links.some && links.some(function (v) { return broadcastIdOf(v.expanded_url) === broadcastId; })))) {
            // Broadcast und dessen generischer Player-Link sind dieselbe Aufnahme.
            found.push(broadcastItem(broadcastId));
            return found;
        }

        function addVideoInfo(entry) {
            if (!entry || !entry.video_info || !Array.isArray(entry.video_info.variants)) return;
            var best = null, playlist = null;
            for (var i = 0; i < entry.video_info.variants.length; i++) {
                var v = entry.video_info.variants[i];
                if (!v || !v.url) continue;
                if (v.content_type === 'video/mp4' && isProgressiveVideoUrl(v.url) &&
                    (!best || (v.bitrate || 0) > (best.bitrate || 0))) best = v;
                else if (hlsUrl(v.url) && !playlist) playlist = v;
            }
            if (best || playlist) {
                var chosen = (best || playlist).url;
                var replay = !!playlist && new URL(chosen).hostname !== 'video.twimg.com';
                found.push({ url: chosen, ext: replay ? 'ts' : 'mp4', hls: !best, broadcast: replay });
            }
        }

        // Unified Cards enthalten echte media_entities (nicht nur Poster).
        var unified = cardBinding(card, 'unified_card');
        if (unified && unified.length < 1024 * 1024) {
            try {
                var data = JSON.parse(unified);
                var entities = data && data.media_entities;
                if (entities && typeof entities === 'object') {
                    Object.keys(entities).forEach(function (id) { addVideoInfo(entities[id]); });
                }
            } catch (e) { log.warn('Player-Card: unified_card nicht lesbar.'); }
        }
        // Einige Card-Antworten liefern media_entities ohne JSON-Wrapper.
        var directEntities = card.media_entities || (card.legacy && card.legacy.media_entities);
        if (directEntities && typeof directEntities === 'object') {
            Object.keys(directEntities).forEach(function (id) { addVideoInfo(directEntities[id]); });
        }
        // Player Cards können stattdessen eine direkte Videodatei nennen.
        // Manifest-/Segmentadressen werden ausdrücklich NICHT übernommen.
        var playerUrl = cardBinding(card, 'player_stream_url');
        if (playerUrl && (isProgressiveVideoUrl(playerUrl) || hlsUrl(playerUrl))) {
            var isReplay = hlsUrl(playerUrl) && new URL(playerUrl).hostname !== 'video.twimg.com';
            found.push({ url: playerUrl, ext: isReplay ? 'ts' : 'mp4', hls: hlsUrl(playerUrl), broadcast: isReplay });
        }
        return found;
    }

    function apiMediaFromTweet(tweetObj) {
        if (!tweetObj || typeof tweetObj !== 'object') return [];
        var legacy = tweetObj.legacy || tweetObj;
        var media = [];
        var sources = [];
        if (legacy.extended_entities && Array.isArray(legacy.extended_entities.media)) {
            sources = legacy.extended_entities.media;
        } else if (Array.isArray(tweetObj.mediaDetails)) {
            // cdn.syndication.twimg.com liefert dieselben video_info-Daten
            // unter mediaDetails statt unter legacy.extended_entities. Das
            // parallele entities.media enthält dort nur Linkdaten ohne Typ
            // und darf diese vollständige Quelle nicht verdrängen.
            sources = tweetObj.mediaDetails;
        } else if (legacy.entities && Array.isArray(legacy.entities.media)) {
            sources = legacy.entities.media;
        }
        for (var i = 0; i < sources.length; i++) {
            var m = sources[i];
            if (!m) continue;
            if (m.type === 'photo' && m.media_url_https) {
                var imageUrl = originalImageUrl(m.media_url_https);
                if (imageUrl && downloadableImageUrl(imageUrl)) {
                    media.push({ url: imageUrl, ext: extFromUrl(imageUrl) || 'jpg' });
                }
            } else if (m.type === 'video' || m.type === 'animated_gif') {
                var variants = (m.video_info && m.video_info.variants) || [];
                var best = null, playlist = null;
                for (var j = 0; j < variants.length; j++) {
                    var v = variants[j];
                    if (!v || !v.url) continue;
                    if (v.content_type === 'video/mp4' && isProgressiveVideoUrl(v.url)) {
                        if (!best || (v.bitrate || 0) > (best.bitrate || 0)) best = v;
                    } else if (hlsUrl(v.url) && !playlist) playlist = v;
                }
                if (best || playlist) media.push({ url: (best || playlist).url, ext: 'mp4', hls: !best });
            }
        }
        // Gezielt Card-Medien ergänzen, ohne bereits vorhandene MP4 doppelt
        // herunterzuladen. Ein echtes Tweet-Video hat dabei Vorrang.
        var cardItems = cardMediaFromTweet(tweetObj);
        for (var k = 0; k < cardItems.length; k++) {
            var candidate = cardItems[k];
            var id = mediaIdOf(candidate.url);
            if (!media.some(function (item) {
                return item.url === candidate.url || (id && mediaIdOf(item.url) === id);
            })) media.push(candidate);
        }
        return media;
    }

    function unwrapTweetResult(value) {
        var seen = new Set();
        while (value && typeof value === 'object' && !seen.has(value)) {
            seen.add(value);
            if (value.legacy || value.extended_entities || value.entities || value.mediaDetails) return value;
            if (value.result && typeof value.result === 'object') value = value.result;
            else if (value.tweet && typeof value.tweet === 'object') value = value.tweet;
            else break;
        }
        return value && typeof value === 'object' ? value : null;
    }

    function nestedRelatedTweets(tweetObj) {
        if (!tweetObj || typeof tweetObj !== 'object') return [];
        var legacy = tweetObj.legacy || {};
        var candidates = [
            tweetObj.quoted_tweet, tweetObj.retweeted_status,
            tweetObj.quoted_status_result, tweetObj.retweeted_status_result,
            legacy.quoted_tweet, legacy.retweeted_status,
            legacy.quoted_status_result, legacy.retweeted_status_result
        ];
        var result = [];
        for (var i = 0; i < candidates.length; i++) {
            var related = unwrapTweetResult(candidates[i]);
            if (related && result.indexOf(related) === -1) result.push(related);
        }
        return result;
    }

    function renderedTweetMedia(tweet, statusId) {
        // Ausschließlich den Ziel-Tweet lesen, nicht dessen Nachbarn/Replies.
        // React-Metadaten sind optional; kein Eingriff in X oder dessen APIs.
        try {
            var key = Object.keys(tweet).filter(function (k) { return k.indexOf('__reactFiber$') === 0; })[0];
            var fiber = key && tweet[key];
            for (var depth = 0; fiber && depth < 30; depth++, fiber = fiber.return) {
                var value = fiber.memoizedProps && fiber.memoizedProps.tweet;
                if (!value) continue;
                var legacy = value.legacy || value;
                if (String(value.rest_id || legacy.id_str || legacy.id) !== String(statusId)) continue;
                var media = apiMediaFromTweet(value);
                if (media.length) return media;
            }
        } catch (e) { /* X kann die internen Props ändern: regulärer Fallback. */ }
        return [];
    }

    function originalImageUrl(src) {
        try {
            var u = new URL(src);
            if (!allowedImageUrl(u.href)) return null;
            u.searchParams.set('name', 'orig');
            return u.toString();
        } catch (e) {
            return null;
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
            var nested = nestedRelatedTweets(tweet);
            for (var n = 0; n < nested.length && !media.length; n++) {
                media = apiMediaFromTweet(nested[n]);
            }
        }

        if (!media.length && tweet) {
            var quotedSource = tweet.legacy || tweet;
            var quotedId = quotedSource.quoted_status_id_str || quotedSource.retweeted_status_id_str ||
                quotedSource.quoted_status_id || quotedSource.retweeted_status_id;
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
    function fetchLiveBearerToken(signal) {
        var TOKEN_RE = CONFIG.api.liveTokenRe;

        function gmGet(url) {
            return gmTextRequest(url, {}, signal, 'Token');
        }

        return (function () {
            var scriptUrls = [];
            return gmGet(location.origin + '/').then(function (html) {
                ensureNotCancelled(signal);
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
                    try {
                        var parsedScript = new URL(url, location.origin);
                        if (parsedScript.protocol !== 'https:' ||
                            !['abs.twimg.com', 'x.com', 'twitter.com'].includes(parsedScript.hostname)) continue;
                        scriptUrls.push(parsedScript.href);
                    } catch (e) { continue; }
                }

                if (!scriptUrls.length) throw new Error('keine Scripts im HTML');

                var chain = Promise.reject(new Error('keine Scripts'));
                scriptUrls.slice(0, 5).forEach(function (scriptUrl) {
                    chain = chain.catch(function () {
                        ensureNotCancelled(signal);
                        return gmGet(scriptUrl).then(function (js) {
                            ensureNotCancelled(signal);
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
    var prefetchSeenAt = new Map();
    // Fehlversuche pro Tweet-ID (max. MAX_PREFETCH_RETRIES, dann aufgeben)
    var prefetchRetries = new Map();
    var prefetchQueue = [];
    var prefetchRetryTimers = new Map();
    var cacheGeneration = 0;
    var activePrefetches = 0;
    var MAX_PREFETCH_RETRIES = 2;
    var PREFETCH_RETRY_DELAY_MS = 10000;

    function pruneMediaState() {
        var now = Date.now();
        mediaCache.forEach(function (entry, id) {
            if (!entry || now - entry.fetchedAt > CONFIG.cacheTtlMs) mediaCache.delete(id);
        });
        while (mediaCache.size > CONFIG.maxCacheEntries) mediaCache.delete(mediaCache.keys().next().value);
        prefetchSeen.forEach(function (id) {
            var seenAt = prefetchSeenAt.get(id) || 0;
            if (now - seenAt > CONFIG.cacheTtlMs) {
                prefetchSeen.delete(id);
                prefetchSeenAt.delete(id);
            }
        });
        while (prefetchSeen.size > CONFIG.maxPrefetchSeenEntries) {
            var oldest = prefetchSeen.values().next().value;
            prefetchSeen.delete(oldest);
            prefetchSeenAt.delete(oldest);
        }
    }
    function setCachedItems(tweetId, items) {
        pruneMediaState();
        mediaCache.delete(tweetId);
        mediaCache.set(tweetId, { items: items, fetchedAt: Date.now() });
        pruneMediaState();
    }
    function markPrefetchSeen(tweetId) {
        prefetchSeen.delete(tweetId);
        prefetchSeen.add(tweetId);
        prefetchSeenAt.set(tweetId, Date.now());
        pruneMediaState();
    }
    function queuePrefetch(tweetId, generation) {
        if (prefetchQueue.length >= CONFIG.maxPrefetchQueue) return false;
        markPrefetchSeen(tweetId);
        prefetchQueue.push({ tweetId: tweetId, generation: generation });
        drainPrefetchQueue();
        return true;
    }

    /**
     * Liefert gecachte Medien-Items für eine Tweet-ID oder null.
     * Abgelaufene Einträge (TTL 5 min) werden dabei entfernt.
     */
    function getCachedItems(tweetId) {
        pruneMediaState();
        var entry = mediaCache.get(tweetId);
        if (!entry) return null;
        mediaCache.delete(tweetId);
        mediaCache.set(tweetId, entry);
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
        queuePrefetch(tweetId, cacheGeneration);
    }

    async function prefetch(tweetId, generation) {
        generation = generation == null ? cacheGeneration : generation;
        activePrefetches++;
        try {
            if (generation !== cacheGeneration) return;
            var data = await fetchTweetData(tweetId);
            if (generation !== cacheGeneration) return;
            var parsed = parseApiData(data, tweetId);
            if (parsed.media && parsed.media.length) {
                setCachedItems(tweetId, parsed.media);
                prefetchRetries.delete(tweetId);
                // Freigeben, sobald der Cache den Tweet abdeckt: Nach Ablauf der
                // TTL (5 min) und erneutem Sichtbarwerden darf wieder vorgeladen
                // werden — der Cache-Guard verhindert Doppel-Prefetches vorher.
                prefetchSeen.delete(tweetId);
                prefetchSeenAt.delete(tweetId);
                log.info('Prefetch abgeschlossen für Tweet ' + tweetId +
                    ' (' + parsed.media.length + ' Medium/Medien).');
            } else {
                failPrefetch(tweetId, 'leere Medien-Antwort', null, generation);
            }
        } catch (err) {
            if (generation === cacheGeneration) failPrefetch(tweetId, err.message, err.status, generation);
        } finally {
            activePrefetches--;
            drainPrefetchQueue();
        }
    }

    /**
     * Behandelt einen fehlgeschlagenen Prefetch.
     * Auth- und Rate-Limit-Fehler (401/403/429) sind nicht transient: ein Retry
     * nach 10 s scheitert am selben Token bzw. verschärft das Limit — der Klick
     * lädt in diesen Fällen live nach (dort greift der Live-Token-Retry).
     * Netzwerk-/Timeout-/Parse-Fehler und leere Antworten werden bis zu
     * MAX_PREFETCH_RETRIES Mal mit PREFETCH_RETRY_DELAY_MS Cooldown wiederholt.
     */
    function failPrefetch(tweetId, reason, status, generation) {
        generation = generation == null ? cacheGeneration : generation;
        if (generation !== cacheGeneration) return;
        if (status === 401 || status === 403 || status === 429) {
            prefetchRetries.delete(tweetId);
            prefetchSeen.delete(tweetId);
            prefetchSeenAt.delete(tweetId);
            log.warn('Prefetch für Tweet ' + tweetId + ' ohne Retry (HTTP ' + status + '): ' + reason);
            return;
        }
        var tries = (prefetchRetries.get(tweetId) || 0) + 1;
        if (tries >= MAX_PREFETCH_RETRIES) {
            prefetchRetries.delete(tweetId);
            prefetchSeen.delete(tweetId);
            prefetchSeenAt.delete(tweetId);
            log.warn('Prefetch für Tweet ' + tweetId + ' endgültig aufgegeben: ' + reason);
            return;
        }
        prefetchRetries.set(tweetId, tries);
        prefetchSeen.delete(tweetId); // Retry erlauben
        prefetchSeenAt.delete(tweetId);
        var oldTimer = prefetchRetryTimers.get(tweetId);
        if (oldTimer) clearTimeout(oldTimer);
        var timer = setTimeout(function () {
            prefetchRetryTimers.delete(tweetId);
            if (generation !== cacheGeneration) return;
            if (prefetchSeen.has(tweetId) || getCachedItems(tweetId) !== null) return;
            log.info('Prefetch-Retry (' + tries + '/' + MAX_PREFETCH_RETRIES + ') für Tweet ' + tweetId);
            queuePrefetch(tweetId, generation);
        }, PREFETCH_RETRY_DELAY_MS);
        prefetchRetryTimers.set(tweetId, timer);
    }

    function drainPrefetchQueue() {
        while (activePrefetches < CONFIG.maxParallelPrefetch && prefetchQueue.length) {
            var job = prefetchQueue.shift();
            if (!job || job.generation !== cacheGeneration) continue;
            prefetch(job.tweetId, job.generation); // fire-and-forget
        }
    }

    // ============================ Metadaten (Dateiname) ====================

    function getHandle(tweet) {
        // Bevorzugt den Tweet, in dem das Medien-Element liegt: bei
        // eingebetteten Tweets gehört der Dateiname zu deren Autor (getTweetId
        // liefert ebenfalls die ID des eingebetteten Tweets). Ein closest() auf
        // div[data-testid="User-Name"] greift nicht — dort liegen keine Medien.
        var mediaEl = findMediaElement(tweet);
        var mediaArticle = mediaEl ? mediaEl.closest('article[data-testid="tweet"]') : null;
        var scope = (mediaArticle && mediaArticle !== tweet) ? mediaArticle : tweet;
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
        var value = String(str).replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g, '_')
            .replace(/[ .]+$/g, '').trim();
        if (!value) value = 'download';
        var dot = value.lastIndexOf('.');
        var stem = dot > 0 ? value.slice(0, dot) : value;
        var suffix = dot > 0 ? value.slice(dot) : '';
        if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(stem)) stem = '_' + stem;
        var maxLength = 180;
        if (stem.length + suffix.length > maxLength) {
            stem = stem.slice(0, Math.max(1, maxLength - suffix.length)).replace(/[ .]+$/g, '');
        }
        return (stem || 'download') + suffix;
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
     * Dateiauswahl vor dem Datentransfer. Der Picker muss
     * innerhalb der Benutzeraktivierung aufgerufen werden; deshalb vor dem
     * asynchronen DOM-/Video-Merge. Ohne API/Benutzeraktivierung bleibt der
     * bestehende GM_download-Pfad erhalten. Abbrechen startet keinen Download.
     */
    async function selectDownloadFile(filename) {
        if (typeof window.showSaveFilePicker !== 'function' ||
            (navigator.userActivation && !navigator.userActivation.isActive)) return null;
        try {
            // Tampermonkeys window ist ein Proxy. Der native Aufruf benötigt
            // als Receiver das echte Window aus dem DOM (sonst TypeError:
            // Illegal invocation). Kein zusätzlicher unsafeWindow-Grant nötig.
            return await window.showSaveFilePicker.call(document.defaultView, { suggestedName: filename });
        } catch (err) {
            if (err.name === 'AbortError') throw err;
            if (err.name === 'SecurityError' || err.name === 'NotSupportedError' || err.name === 'TypeError') {
                log.warn('Direkte Dateiauswahl nicht verfügbar; verwende GM_download.');
                return null;
            }
            throw err;
        }
    }

    function mediaTotalFromHeaders(headers) {
        var contentRange = responseHeader(headers, 'content-range');
        var rangeMatch = contentRange.match(/\/(\d+)\s*$/);
        if (rangeMatch) return Number(rangeMatch[1]) || 0;
        var contentLength = Number(responseHeader(headers, 'content-length'));
        return isFinite(contentLength) && contentLength > 0 ? contentLength : 0;
    }

    /**
     * Tampermonkeys Fetch-Stream liefert beim onloadstart häufig Status 0 und
     * noch keine Header. Ein paralleler HEAD-Abruf ermittelt dann die Größe,
     * ohne Mediendaten vorab herunterzuladen. Fehler sind nicht fatal: Der
     * eigentliche Stream läuft mit neutraler Fortschrittsanzeige weiter.
     */
    function beginDirectMediaSizeProbe(url, signal, onSize) {
        if (typeof onSize !== 'function' || !isMediaUrl(url) || hlsUrl(url)) return function () {};
        var handle = null;
        var settled = false;
        var cleanupAbort = function () {};
        function finish(size) {
            if (settled) return;
            settled = true;
            cleanupAbort();
            if (size > 0) onSize(size);
        }
        function cancel() {
            if (settled) return;
            settled = true;
            cleanupAbort();
            try { if (handle && typeof handle.abort === 'function') handle.abort(); } catch (e) {}
        }
        cleanupAbort = onDownloadAbort(signal, cancel);
        if (signal && signal.aborted) { cancel(); return function () {}; }
        try {
            handle = GM_xmlhttpRequest({
                method: 'HEAD', url: url, timeout: Math.min(CONFIG.requestTimeoutMs, 15000),
                onload: function (res) {
                    if (res.status >= 200 && res.status < 400) finish(mediaTotalFromHeaders(res.responseHeaders));
                    else finish(0);
                },
                onerror: function () { finish(0); },
                ontimeout: function () { finish(0); },
                onabort: function () { finish(0); }
            });
        } catch (e) { finish(0); }
        return cancel;
    }

    /**
     * Erst nach der Dateiauswahl anfordern. GM-Streaming umgeht Seiten-CORS,
     * hält keine vollständige Mediendatei im RAM und erhält Fortschritt sowie
     * einen 5-min-Stillstands-Watchdog. createWritable/abort schützt vorhandene
     * Dateiinhalte bei Übertragungsfehlern; erst close übernimmt das Ergebnis.
     */
    async function downloadSelectedFile(url, file, onProgress, signal) {
        if (!isMediaUrl(url) || hlsUrl(url)) throw new Error('Download: unzulässige direkte Medienadresse');
        ensureNotCancelled(signal);
        var cleanupAbort = function () {};
        var request = null;
        var reader = null;
        var writable = null;
        var timer = null;
        var transferError = null;
        var rejectResponse = null;
        var rejectComplete = null;
        var latestResponse = null;
        var probedTotal = 0;
        var latestDone = 0;
        var stopSizeProbe = function () {};
        var resolveComplete;
        var rejectCancelled;
        var cancelled = new Promise(function (resolve, reject) { rejectCancelled = reject; });
        cancelled.catch(function () {});
        var complete = new Promise(function (resolve, reject) {
            resolveComplete = resolve;
            rejectComplete = reject;
        });
        // Fehler können vor dem ersten Stream-Chunk eintreffen.
        complete.catch(function () {});
        function fail(err) {
            if (transferError) return;
            transferError = err;
            rejectCancelled(err);
            if (rejectResponse) rejectResponse(err);
            if (rejectComplete) rejectComplete(err);
            try { if (request) request.abort(); } catch (e) {}
            if (reader) reader.cancel().catch(function () {});
        }
        function arm() {
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                fail(new Error('Download: keine Antwort/Fortschritt (Timeout)'));
            }, 5 * 60 * 1000);
        }
        try {
            cleanupAbort = onDownloadAbort(signal, function () { fail(downloadAbortError()); });
            ensureNotCancelled(signal);
            if (typeof onProgress === 'function') {
                stopSizeProbe = beginDirectMediaSizeProbe(url, signal, function (size) {
                    probedTotal = size;
                    if (latestDone > 0) onProgress({ done: latestDone, total: probedTotal });
                });
            }
            arm();
            var response = await new Promise(function (resolve, reject) {
                rejectResponse = reject;
                request = GM_xmlhttpRequest({
                    // Bei Tampermonkeys Fetch-Transport kann timeout: 0 sofort
                    // abbrechen. Ausschließlich der Fortschritts-Watchdog gilt.
                    method: 'GET', url: url, responseType: 'stream',
                    onloadstart: function (res) {
                        // Tampermonkey startet den Fetch-Stream mit Status 0,
                        // bevor HTTP-Status und Header verfügbar sind.
                        try {
                            if (res.status) assertFullHttpResponse(res.status, res.responseHeaders, 'Download');
                            if (res.status) assertMediaContentType(res.responseHeaders, url);
                        } catch (e) { fail(e); return; }
                        if (!res.response || typeof res.response.getReader !== 'function') {
                            fail(new Error('Tampermonkey liefert keinen Download-Stream'));
                        } else resolve(res);
                    },
                    onreadystatechange: function (res) {
                        if (res.readyState < 2) return;
                        latestResponse = res;
                        try {
                            if (res.status) assertFullHttpResponse(res.status, res.responseHeaders, 'Download');
                            if (res.status) assertMediaContentType(res.responseHeaders, url);
                        } catch (e) { fail(e); }
                    },
                    onload: function (res) {
                        latestResponse = res;
                        try {
                            assertFullHttpResponse(res.status, res.responseHeaders, 'Download');
                            assertMediaContentType(res.responseHeaders, url);
                            resolveComplete(res);
                        } catch (e) { fail(e); }
                    },
                    // Tampermonkey fordert damit auch das Stream-Endsignal an.
                    onloadend: function (res) {
                        try { assertFullHttpResponse(res.status, res.responseHeaders, 'Download'); }
                        catch (e) { fail(e); }
                    },
                    onerror: function () { fail(new Error('Download: Netzwerkfehler')); },
                    ontimeout: function () { fail(new Error('Download: Timeout')); },
                    onabort: function () { fail(new Error('Download abgebrochen')); }
                });
            });
            if (transferError) throw transferError;
            ensureNotCancelled(signal);
            reader = response.response.getReader();
            writable = await file.createWritable();
            ensureNotCancelled(signal);
            function contentLength(res) {
                return mediaTotalFromHeaders(res && res.responseHeaders) || probedTotal;
            }
            var total = contentLength(response);
            var done = 0;
            var prefixParts = [], prefixLength = 0;
            while (true) {
                var part = await Promise.race([reader.read(), cancelled]);
                if (transferError) throw transferError;
                ensureNotCancelled(signal);
                if (part.done) break;
                arm();
                await writable.write(part.value);
                ensureNotCancelled(signal);
                if (prefixLength < 64) {
                    var keep = part.value.subarray(0, Math.min(part.value.byteLength, 64 - prefixLength));
                    prefixParts.push(new Uint8Array(keep));
                    prefixLength += keep.byteLength;
                }
                done += part.value.byteLength;
                latestDone = done;
                total = contentLength(latestResponse || response);
                if (typeof onProgress === 'function') onProgress({ done: done, total: total });
            }
            // Stream-Ende allein beweist keinen erfolgreichen HTTP-Abschluss.
            var finalResponse = await complete;
            if (transferError) throw transferError;
            assertFullHttpResponse(finalResponse.status, finalResponse.responseHeaders, 'Download');
            total = contentLength(finalResponse);
            if (!done || (total && done !== total)) throw new Error('Download unvollständig');
            var prefix = new Uint8Array(prefixLength), prefixOffset = 0;
            prefixParts.forEach(function (part) { prefix.set(part, prefixOffset); prefixOffset += part.byteLength; });
            assertMediaPrefix(prefix, url);
            ensureNotCancelled(signal);
            await writable.close();
            writable = null;
        } catch (err) {
            fail(err);
            if (writable) { try { await writable.abort(); } catch (e) {} }
            throw err;
        } finally {
            cleanupAbort();
            stopSizeProbe();
            if (timer) clearTimeout(timer);
            if (reader) try { reader.releaseLock(); } catch (_) {}
        }
    }

    /**
     * Bestehender Browser-Download für weitere Medien und Browser ohne Picker.
     * saveAs fordert einen Dialog an; wann er sichtbar wird, bestimmt der
     * Browser/Downloadmodus (im Standardmodus ggf. erst nach dem Transfer).
     */
    function downloadUrl(url, filename, saveAs, onProgress, signal) {
        if (!isMediaUrl(url) || hlsUrl(url)) return Promise.reject(new Error('Download: unzulässige direkte Medienadresse'));
        ensureNotCancelled(signal);
        return new Promise(function (resolve, reject) {
            var settled = false;
            var handle = null;
            var cleanupAbort = function () {};
            var lastActivity = Date.now();
            // 5 Minuten Stillstand statt starrer 65 s: der native Modus liefert
            // keinen onprogress, ein laufender 5-MB-Download über 75 s darf
            // nicht abgebrochen werden. Mit onprogress wird der Timer bei
            // jedem Fortschritt zurückgesetzt.
            var watchdogMs = 5 * 60 * 1000;
            var timer = null;

            function fail(message) {
                if (settled) return;
                settled = true;
                if (timer) clearTimeout(timer);
                cleanupAbort();
                try { if (handle && typeof handle.abort === 'function') handle.abort(); } catch (e) {}
                reject(new Error(message));
            }

            // Watchdog nur bei fehlender Aktivität: Ein laufender Download, der
            // Fortschritt meldet, darf nicht an einer starren Gesamtgrenze
            // scheitern. Ohne Download-Berechtigung hängt GM_download dagegen
            // ohne Callback; dann greift der Timer nach watchdogMs.
            function arm() {
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    if (settled) return;
                    if (Date.now() - lastActivity < watchdogMs) { arm(); return; }
                    fail('GM_download: keine Antwort/Fortschritt (Timeout)');
                }, watchdogMs);
            }
            arm();

            function settle(fn) {
                return function (arg) {
                    if (settled) return;
                    settled = true;
                    if (timer) clearTimeout(timer);
                    cleanupAbort();
                    fn(arg);
                };
            }

            var opts = {
                url: url,
                name: filename,
                saveAs: saveAs,
                // Kein starrer Gesamt-Timeout: der Fortschritts-Watchdog unten
                // übernimmt die Überwachung (große Videos können länger dauern).
                timeout: 0,
                onload: settle(function () {
                    resolve();
                }),
                onerror: settle(function (err) {
                    var reason = err && err.error ? err.error : 'unbekannter Fehler';
                    var hint = '';
                    if (reason === 'not_enabled') hint = ' – Tampermonkey-Download ist deaktiviert (Download-Modus auf Nativ stellen)';
                    else if (reason === 'not_permitted') hint = ' – keine Download-Berechtigung (Modus Nativ oder Berechtigung erteilen)';
                    else if (reason === 'not_whitelisted') hint = ' – Dateiendung ist in Tampermonkey nicht erlaubt';
                    else if (reason === 'not_succeeded') hint = ' – Download konnte nicht gestartet werden';
                    reject(new Error('GM_download: ' + reason + hint));
                }),
                ontimeout: settle(function () {
                    reject(new Error('GM_download: Timeout'));
                })
            };
            if (typeof onProgress === 'function') {
                opts.onprogress = function (progress) {
                    if (settled || (signal && signal.aborted)) return;
                    lastActivity = Date.now();
                    onProgress(progress);
                };
            }
            cleanupAbort = onDownloadAbort(signal, function () {
                if (settled) return;
                settled = true;
                if (timer) clearTimeout(timer);
                cleanupAbort();
                try { if (handle && typeof handle.abort === 'function') handle.abort(); } catch (_) {}
                reject(downloadAbortError());
            });
            if (signal && signal.aborted) {
                fail('Download abgebrochen');
                return;
            }
            try {
                handle = GM_download(opts);
                if (signal && signal.aborted) {
                    try { if (handle && typeof handle.abort === 'function') handle.abort(); } catch (_) {}
                }
            } catch (err) {
                fail('GM_download: ' + (err && err.message ? err.message : String(err)));
            }
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
        cacheGeneration++;
        mediaCache.clear();
        prefetchSeen.clear();
        prefetchSeenAt.clear();
        prefetchRetries.clear();
        prefetchQueue.length = 0;
        prefetchRetryTimers.forEach(function (timer) { clearTimeout(timer); });
        prefetchRetryTimers.clear();
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

    var runningDownloads = new WeakMap();
    var runningDownloadsByTweet = new Map();
    function setBusy(btn, busy) {
        // Ein laufender Download darf den Button nicht deaktivieren:
        // ein erneuter Klick öffnet die Abbruch-Bestätigung.
        btn.disabled = false;
        if (busy) btn.setAttribute('aria-busy', 'true');
        else btn.removeAttribute('aria-busy');
        btn.title = busy ? 'Download läuft – erneut klicken zum Abbrechen' : 'Medien herunterladen';
    }
    function closeCancelPopup(task) {
        if (!task || !task.popup) return;
        if (task.closePopup) task.closePopup();
    }
    function showCancelPopup(btn, task) {
        if (!task || task.signal.aborted || task.popup) return;
        var popup = document.createElement('div');
        popup.className = 'xloader-cancel-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-label', 'Download abbrechen?');
        popup.style.cssText = 'position:fixed;z-index:2147483646;padding:12px 14px;' +
            'min-width:205px;background:#20262d;color:#fff;border:1px solid #637082;' +
            'border-radius:11px;box-shadow:0 6px 26px #0007;font:14px/1.5 system-ui,sans-serif;';
        var caption = document.createElement('div');
        caption.textContent = 'Download abbrechen?';
        caption.style.cssText = 'margin-bottom:10px;font-weight:600;';
        popup.appendChild(caption);
        var actions = document.createElement('div');
        actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
        function makeButton(label, bg) {
            var el = document.createElement('button');
            el.type = 'button'; el.textContent = label;
            el.style.cssText = 'border:0;border-radius:7px;padding:7px 15px;' +
                'font:600 13px system-ui,sans-serif;cursor:pointer;background:' + bg + ';color:#fff;';
            return el;
        }
        var yes = makeButton('Ja', '#c93543');
        var no = makeButton('Nein', '#4d5968');
        actions.appendChild(no); actions.appendChild(yes);
        popup.appendChild(actions);
        var cleanup = function () {
            popup.removeEventListener('keydown', keydown);
            if (popup.parentNode) popup.remove();
            if (task.popup === popup) task.popup = null;
            task.closePopup = null;
            btn.focus();
        };
        function keydown(ev) {
            if (ev.key === 'Escape') { ev.preventDefault(); cleanup(); }
        }
        popup.addEventListener('keydown', keydown);
        popup.addEventListener('click', function (ev) { ev.stopPropagation(); });
        no.addEventListener('click', function (ev) { ev.stopPropagation(); cleanup(); });
        yes.addEventListener('click', function (ev) {
            ev.stopPropagation();
            cleanup();
            task.controller.abort();
        });
        document.body.appendChild(popup);
        var rect = btn.getBoundingClientRect();
        var size = popup.getBoundingClientRect();
        popup.style.left = Math.max(8, Math.min(window.innerWidth - size.width - 8, rect.right - size.width)) + 'px';
        popup.style.top = (rect.top >= size.height + 12 ? rect.top - size.height - 8 : rect.bottom + 8) + 'px';
        task.popup = popup;
        task.closePopup = cleanup;
        no.focus();
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
        // Die bisherige 2,5-s-Farbmarkierung war ohne sichtbaren Fehlertext.
        // Nur textContent: API-/Fehlertexte niemals als HTML interpretieren.
        var old = document.getElementById('xloader-error-toast');
        if (old) old.remove();
        var toast = document.createElement('div');
        toast.id = 'xloader-error-toast';
        toast.setAttribute('role', 'alert');
        toast.style.cssText = 'position:fixed;right:20px;bottom:24px;max-width:min(460px,90vw);' +
            'padding:12px 16px;background:#25292f;color:white;border:2px solid #ff6677;' +
            'border-radius:10px;font:14px/1.45 system-ui,sans-serif;z-index:2147483647;' +
            'box-shadow:0 6px 24px #0005;';
        toast.textContent = 'xLoader: ' + String(message).slice(0, 240);
        document.body.appendChild(toast);
        setTimeout(function () { if (toast.parentNode) toast.remove(); }, 12000);
        setTimeout(function () {
            btn.classList.remove('is-error');
            if (wrap) wrap.classList.remove('is-error');
            if (btn.title === message) btn.title = previousTitle;
        }, CONFIG.errorFlashMs);
    }

    /**
     * Sichtbare Fortschrittsanzeige: kleines Badge über dem Button-Wrapper.
     * Erscheint nur während eines Downloads (hideProgress blendet es aus).
     */
    function showProgress(btn, value) {
        var wrap = getWrap(btn) || btn;
        if (!wrap.style.position) wrap.style.position = 'relative';
        var badge = wrap.querySelector('.xloader-progress');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'xloader-progress';
            wrap.appendChild(badge);
        }
        badge.textContent = (typeof value === 'number') ? value + '%' : (value || '…');
        badge.style.display = 'block';
    }

    function hideProgress(btn) {
        var wrap = getWrap(btn) || btn;
        var badge = wrap.querySelector('.xloader-progress');
        if (badge) badge.style.display = 'none';
    }

    function pruneTaskButtons(task) {
        if (!task || !task.buttons) return;
        var retained = [];
        for (var i = 0; i < task.buttons.length; i++) {
            var candidate = task.buttons[i];
            if (candidate && candidate.isConnected !== false) retained.push(candidate);
            else if (candidate) runningDownloads.delete(candidate);
        }
        task.buttons = retained;
        if (task.btn && retained.indexOf(task.btn) === -1) {
            task.btn = retained.length ? retained[retained.length - 1] : null;
        }
    }

    function detachRunningDownloadButton(task, btn, resetUi) {
        if (!task || !btn) return;
        runningDownloads.delete(btn);
        if (task.buttons) task.buttons = task.buttons.filter(function (item) { return item !== btn; });
        if (task.btn === btn) {
            closeCancelPopup(task);
            task.btn = task.buttons && task.buttons.length ? task.buttons[task.buttons.length - 1] : null;
        }
        if (resetUi && btn.isConnected !== false) {
            hideProgress(btn);
            setBusy(btn, false);
        }
    }

    function bindRunningDownloadButton(task, btn) {
        if (!task || !btn || task.signal.aborted) return;
        var priorTask = runningDownloads.get(btn);
        if (priorTask && priorTask !== task) detachRunningDownloadButton(priorTask, btn, false);
        if (!task.buttons) task.buttons = [];
        pruneTaskButtons(task);
        if (task.buttons.indexOf(btn) === -1) task.buttons.push(btn);
        if (task.btn && task.btn !== btn) closeCancelPopup(task);
        task.btn = btn;
        runningDownloads.set(btn, task);
        setBusy(btn, true);
        if (task.progressVisible) showProgress(btn, task.progressValue);
        if (task.statusTitle) btn.title = task.statusTitle;
    }

    function setTaskProgress(task, value, title) {
        if (!task) return;
        task.progressVisible = true;
        task.progressValue = value;
        task.statusTitle = title;
        pruneTaskButtons(task);
        for (var i = 0; i < task.buttons.length; i++) {
            showProgress(task.buttons[i], value);
            task.buttons[i].title = title;
        }
    }

    function hideTaskProgress(task) {
        if (!task) return;
        task.progressVisible = false;
        pruneTaskButtons(task);
        for (var i = 0; i < task.buttons.length; i++) hideProgress(task.buttons[i]);
    }

    function isTweetDetailView(tweetId) {
        if (typeof location === 'undefined') return false;
        return new RegExp('/status/' + String(tweetId).replace(/[^0-9]/g, '') + '(?:/|$)').test(location.pathname || '');
    }

    function refreshItemKey(item) {
        if (!item || !item.url) return '';
        if (item.broadcastId) return 'broadcast:' + item.broadcastId;
        var mediaId = mediaIdOf(item.url);
        if (mediaId) return 'video:' + mediaId;
        try {
            var parsed = new URL(item.url);
            return parsed.hostname + parsed.pathname;
        } catch (e) {
            return String(item.url).split('?')[0].split('#')[0];
        }
    }

    /**
     * Bevorzugt frische Tweet-API-Adressen, ohne bei einer gekürzten Antwort
     * weitere Medien aus React-/Prefetch-Daten zu verlieren.
     */
    function preferFreshItems(current, fresh) {
        if (!fresh || !fresh.length) return current;
        if (!current || fresh.length >= current.length) return fresh.slice();
        var result = current.slice();
        for (var i = 0; i < fresh.length; i++) {
            var key = refreshItemKey(fresh[i]);
            var index = -1;
            for (var j = 0; j < result.length; j++) {
                if (key && refreshItemKey(result[j]) === key) { index = j; break; }
            }
            if (index >= 0) {
                result[index] = fresh[i];
            } else {
                result.push(fresh[i]);
            }
        }
        return result;
    }

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
     * Löst die echten Video-MP4s mehrerer Poster gemeinsam: alle Poster einmal
     * antippen (X.com startet die Wiedergabe), dann den Performance-Buffer bis
     * zu 5 s lang auswerten. Früher wurde pro Poster sequenziell bis zu 5 s
     * gewartet — bei mehreren Video-Postern entsprechend länger; außerdem
     * verwarf jedes clearResourceTimings() die bereits geladenen Einträge der
     * vorherigen Poster. Die Wiedergabe wird in jedem Fall wieder gestoppt.
     */
    async function resolvePosterVideoUrls(tweet, mediaIds, signal) {
        var targets = [];
        for (var i = 0; i < mediaIds.length; i++) {
            var mediaId = mediaIds[i];
            var posterEl = findPosterElementByMediaId(tweet, mediaId);
            if (!posterEl || !posterEl.isConnected) continue;
            var src = (posterEl.getAttribute('src') || '') + ' ' + (posterEl.getAttribute('srcset') || '');
            // Nur für amplify/ext_tw-Poster — tweet_video_thumb (GIFs) sind schon
            // in echte MP4-URLs umgebaut (normalizeMediaUrl).
            if (src.indexOf('tweet_video_thumb') !== -1) continue;
            var player = posterEl.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"], div[role="button"]') || posterEl.parentElement;
            if (!player) continue;
            var video = player.querySelector('video');
            var directUrls = video ? collectVideoUrls(video) : [];
            var directUrl = null;
            for (var du = 0; du < directUrls.length; du++) {
                if (isProgressiveVideoUrl(directUrls[du]) && mediaIdOf(directUrls[du]) === mediaId) {
                    directUrl = directUrls[du];
                    break;
                }
            }
            targets.push({ id: mediaId, player: player, video: video,
                wasPlaying: !!(video && !video.paused), startedByResolver: false, url: directUrl });
        }
        if (!targets.length) return {};

        try {
            ensureNotCancelled(signal);
            var initialEntries = performance.getEntriesByType('resource');
            for (var ie = initialEntries.length - 1; ie >= 0; ie--) {
                var initialUrl = initialEntries[ie].name;
                if (!isProgressiveVideoUrl(initialUrl)) continue;
                var initialId = mediaIdOf(initialUrl);
                for (var it = 0; it < targets.length; it++) {
                    if (!targets[it].url && initialId === targets[it].id) targets[it].url = initialUrl;
                }
            }
            for (var c = 0; c < targets.length; c++) {
                // Ein laufender Player lädt bereits selbst. Ein Klick würde ihn
                // pausieren und kann genau die gesuchte Netzwerkquelle verlieren.
                if (!targets[c].url && !targets[c].wasPlaying) {
                    targets[c].player.click();
                    targets[c].startedByResolver = true;
                }
            }

            var deadline = Date.now() + 5000;
            var open = targets.filter(function (target) { return !target.url; }).length;
            while (open > 0 && Date.now() < deadline) {
                ensureNotCancelled(signal);
                var entries = performance.getEntriesByType('resource');
                for (var e = 0; e < entries.length; e++) {
                    var u = entries[e].name;
                    if (!isProgressiveVideoUrl(u)) continue;
                    for (var t = 0; t < targets.length; t++) {
                        if (!targets[t].url && mediaIdOf(u) === targets[t].id) {
                            targets[t].url = u;
                            open--;
                        }
                    }
                }
                if (open > 0) {
                    await abortableDelay(300, signal);
                }
            }
        } catch (e) { /* Stille ignorieren — Poster bleibt dann Bild-Notnagel */ } finally {
            // Nur vom Resolver gestartete Wiedergaben wieder anhalten. Bereits
            // laufende Nutzervideos dürfen unverändert weiterlaufen.
            for (var v = 0; v < targets.length; v++) {
                var startedVideo = targets[v].player.querySelector('video');
                if (startedVideo && targets[v].startedByResolver) {
                    startedVideo.muted = true;
                    startedVideo.pause();
                }
            }
        }

        var resolved = {};
        for (var r = 0; r < targets.length; r++) {
            if (targets[r].url) resolved[targets[r].id] = targets[r].url;
        }
        return resolved;
    }

    /**
     * Ergänzt API-Medien um die im DOM sichtbaren Poster/Standbilder, die die
     * API nicht liefert (X.com kürzt Medien in Konversations-Antworten).
     * Video-Poster werden gemeinsam aufgelöst; bleibt die MP4 aus, bleibt das
     * Poster als Bild-Notnagel. Überspringt Medien, die bereits vorhanden sind
     * (gleiche Media-ID oder URL-Basis). Idempotent.
     */
    function performanceHlsFromTweet(tweet) {
        if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') return [];
        var ids = new Set();
        var visible = tweet.querySelectorAll('img, video');
        for (var i = 0; i < visible.length; i++) {
            if (visible[i].closest(CONFIG.tweetSelector) !== tweet) continue;
            var urls = [visible[i].getAttribute('src'), visible[i].getAttribute('poster'), visible[i].currentSrc];
            for (var j = 0; j < urls.length; j++) {
                var id = mediaIdOf(urls[j] || '');
                if (id) ids.add(id);
            }
        }
        if (!ids.size) {
            var activeVideos = Array.prototype.slice.call(tweet.querySelectorAll('video')).filter(function (v) {
                return v.closest(CONFIG.tweetSelector) === tweet && !v.paused;
            });
            if (activeVideos.length !== 1) return [];
            var playingAnywhere = document.querySelectorAll('video');
            var countPlaying = 0;
            for (var ai = 0; ai < playingAnywhere.length; ai++) if (!playingAnywhere[ai].paused) countPlaying++;
            if (countPlaying !== 1) return [];
            var now = typeof performance.now === 'function' ? performance.now() : Infinity;
            var pscpUrls = performance.getEntriesByType('resource').filter(function (entry) {
                    var observed = Number(entry.responseEnd || entry.startTime || 0);
                    return isFinite(now) && observed > 0 && now - observed <= CONFIG.performanceEntryMaxAgeMs;
                }).map(function (e) { return e.name; }).filter(function (url) {
                    try { return hlsUrl(url) && new URL(url).hostname !== 'video.twimg.com'; }
                    catch (e) { return false; }
                });
            // Nie eine Playlist eines anderen Players blind zuordnen.
            var unique = Array.from(new Set(pscpUrls));
            return unique.length === 1 ? [{ url: unique[0], ext: 'ts', hls: true, broadcast: true }] : [];
        }
        var found = [], entries = performance.getEntriesByType('resource');
        for (var k = entries.length - 1; k >= 0; k--) {
            var url = entries[k].name, mediaId = mediaIdOf(url);
            if (hlsUrl(url) && mediaId && ids.has(mediaId)) {
                found.push({ url: url, ext: 'mp4', hls: true });
                ids.delete(mediaId);
            }
        }
        return found;
    }

    async function mergeDomItems(tweet, items, signal) {
        ensureNotCancelled(signal);
        var result = items.slice();
        var performanceItems = performanceHlsFromTweet(tweet);
        for (var perf = 0; perf < performanceItems.length; perf++) {
            var perfId = mediaIdOf(performanceItems[perf].url);
            if (!result.some(function (item) { return item.url === performanceItems[perf].url ||
                (perfId && perfId === mediaIdOf(item.url)); })) result.push(performanceItems[perf]);
        }
        var rendered = renderedTweetMedia(tweet, getTweetId(tweet));
        for (var r = 0; r < rendered.length; r++) {
            var renderedId = mediaIdOf(rendered[r].url);
            var duplicateRendered = result.some(function (item) {
                return item.url === rendered[r].url ||
                    (renderedId && mediaIdOf(item.url) === renderedId);
            });
            if (!duplicateRendered) result.push(rendered[r]);
        }
        var domUrls = extractDomMedia(tweet);
        var pending = [];
        var resolveIds = [];

        for (var d = 0; d < domUrls.length; d++) {
            var domUrl = domUrls[d];
            var domId = mediaIdOf(domUrl);
            var domBase = normBase(domUrl);
            var duplicate = false;
            for (var k = 0; k < result.length; k++) {
                var it = result[k];
                if ((domId && domId === mediaIdOf(it.url)) || domBase === normBase(it.url)) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate) continue;
            // GIFs liegen bereits als MP4 vor; nur echte Video-Poster auflösen.
            var needsResolve = !!domId && domUrl.indexOf('.mp4') === -1 && domUrl.indexOf('tweet_video/') === -1;
            pending.push({ url: domUrl, id: needsResolve ? domId : null });
            if (needsResolve && resolveIds.indexOf(domId) === -1) resolveIds.push(domId);
        }

        var resolved = resolveIds.length ? await resolvePosterVideoUrls(tweet, resolveIds, signal) : {};
        ensureNotCancelled(signal);
        for (var p = 0; p < pending.length; p++) {
            var item = pending[p];
            if (item.id && resolved[item.id]) {
                result.push({ url: resolved[item.id], ext: 'mp4' });
            } else if (!isVideoPosterUrl(item.url)) {
                // Ein Video-Poster ist kein Bildmedium des Tweets. Wenn seine
                // Videoquelle nicht auflösbar ist, muss der Download scheitern,
                // statt irreführend ein JPG als Erfolg zu speichern.
                result.push({ url: item.url, ext: extFromUrl(item.url) });
            }
        }
        return result;
    }

    function syndicationToken(statusId) {
        var numericId = Number(statusId);
        if (!isFinite(numericId) || numericId <= 0) return '';
        return ((numericId / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
    }

    async function fetchSyndicationData(statusId, signal) {
        var token = syndicationToken(statusId);
        if (!token) throw new Error('Syndication: ungültige Tweet-ID');
        var url = 'https://cdn.syndication.twimg.com/tweet-result?id=' +
            encodeURIComponent(statusId) + '&lang=en&token=' + encodeURIComponent(token);
        var text = await gmTextRequest(url, {}, signal, 'Syndication');
        ensureNotCancelled(signal);
        try { return JSON.parse(text); }
        catch (e) { throw new Error('Syndication JSON-Parse-Fehler'); }
    }

    /**
     * Live-Fallback für den Klick (Cache-Miss): API -> Live-Token-Retry.
     * Liefert { items, apiStatus } — der Fehlerstatus wird bewusst lokal
     * zurückgegeben statt global gespeichert, damit parallele Klicks auf
     * verschiedene Tweets sich die Fehlermeldung nicht überschreiben.
     */
    async function loadItemsLive(tweetId, signal) {
        var items = [];
        var apiFailed = false;
        var apiStatus = null;
        try {
            var data = await fetchTweetData(tweetId, signal);
            items = parseApiData(data, tweetId).media;
        } catch (apiErr) {
            apiFailed = true;
            apiStatus = apiErr.status || null;
            log.warn('API-Fehler (' + apiErr.message + ').');
        }

        // Live-Token-Retry auch bei bereits gecachtem (möglicherweise veraltetem)
        // Token versuchen — X.com rotiert diese Tokens regelmäßig; ein stale
        // Token würde sonst jeden 401-Fall blockieren (Videos/GIFs brechen).
        if (!items.length && apiStatus !== 429 && (apiFailed || !liveToken)) {
            log.info('Versuche Live-Bearer-Token-Retry …');
            try {
                var token = await fetchLiveBearerToken(signal);
                if (token) {
                    liveToken = token;
                    cacheLiveToken(token);
                    log.info('Live-Bearer-Token ermittelt.');
                    var data2 = await fetchTweetData(tweetId, signal);
                    items = parseApiData(data2, tweetId).media;
                    apiStatus = null; // zweiter Call war erfolgreich
                }
            } catch (retryErr) {
                log.warn('Live-Token-Retry fehlgeschlagen: ' + retryErr.message);
            }
        }

        // Die Timeline enthält je nach X-Rendering weder vollständige React-
        // Props noch eine erfolgreiche Conversation-Antwort. Die öffentliche
        // Syndication-Antwort ist an die Status-ID gebunden und liefert dieselben
        // mediaDetails unabhängig davon, ob der Tweet geöffnet wurde.
        if (!items.length) {
            log.info('Versuche ansichtsunabhängigen Syndication-Fallback …');
            try {
                var syndication = await fetchSyndicationData(tweetId, signal);
                items = parseApiData(syndication, tweetId).media;
                if (items.length) {
                    apiStatus = null;
                    log.info('Syndication-Medien ermittelt (' + items.length + ').');
                }
            } catch (syndicationErr) {
                log.warn('Syndication-Fallback fehlgeschlagen: ' + syndicationErr.message);
            }
        }

        return { items: items, apiStatus: apiStatus };
    }

    /**
     * Klick-Fluss: 1) Cache prüfen (Treffer -> sofortiger Download, kein
     * API-Call). 2) Cache-Miss -> Live-Fallback. 3) DOM-Poster/Standbilder
     * genau einmal ergänzen. 4) Download pro Medium mit saveAs nach Modus.
     * 5) Cache invalidieren. Fehler und Ausnahmen geben den Button in jedem
     * Fall wieder frei (finally), sonst bliebe er dauerhaft gesperrt.
     */
    async function onDownloadClick(tweet, btn) {
        var tweetId = getTweetId(tweet);
        var active = runningDownloads.get(btn) || runningDownloadsByTweet.get(tweetId);
        if (active) {
            bindRunningDownloadButton(active, btn);
            showCancelPopup(btn, active);
            return;
        }
        var controller = new AbortController();
        var task = { controller: controller, signal: controller.signal, popup: null, closePopup: null,
            tweetId: tweetId, btn: null, buttons: [], progressVisible: false,
            progressValue: null, statusTitle: null };
        runningDownloadsByTweet.set(tweetId, task);
        bindRunningDownloadButton(task, btn);

        var handle = sanitizeFilenamePart(getHandle(tweet));
        var items = [];
        var apiStatus = null;
        var failed = 0;
        var firstFailure = null;
        var errorMessage = null;
        var selectedFile = null;
        var selectedFilename = null;
        var retryItems = null;
        var usedFastItems = false;

        try {
            ensureNotCancelled(task.signal);
            var rendered = renderedTweetMedia(tweet, tweetId).filter(function (item) {
                return !isVideoPosterUrl(item.url);
            });
            var cached = rendered.length ? rendered : getCachedItems(tweetId);
            if (cached) cached = cached.filter(function (item) { return !isVideoPosterUrl(item.url); });
            var domBroadcast = broadcastFromDom(tweet);
            if ((!cached || !cached.length) && domBroadcast) cached = [domBroadcast];
            if ((!cached || !cached.length) && tweet.querySelectorAll) {
                var ownPlayers = tweet.querySelectorAll('video, [data-testid="videoPlayer"], [data-testid="videoComponent"]');
                for (var pv = 0; pv < ownPlayers.length; pv++) {
                    if (ownPlayers[pv].closest(CONFIG.tweetSelector) !== tweet) continue;
                    selectedFilename = sanitizeFilenamePart(formatFilename(getFilenameTemplate(), {
                        handle: handle, id: tweetId, index: 1, ext: 'mp4'
                    }));
                    selectedFile = await selectDownloadFile(selectedFilename);
                    break;
                }
            }
            if (cached && cached.length) {
                log.info('Cache-Treffer für Tweet ' + tweetId + ' — sofortiger Download.');
                items = cached;
                usedFastItems = true;
            } else {
                if (mediaCache.has(tweetId)) mediaCache.delete(tweetId); // abgelaufen
                var live = await loadItemsLive(tweetId, task.signal);
                items = live.items;
                apiStatus = live.apiStatus;
            }
            ensureNotCancelled(task.signal);
            // Das erste API-Medium bleibt beim DOM-Merge an erster Stelle.
            // Daher kann sein Dialog bereits vor einem ggf. 5-s-Video-Resolver
            // erscheinen. Ohne API-Medien muss erst die Endung geklärt werden.
            if (items.length && !selectedFilename) {
                selectedFilename = sanitizeFilenamePart(formatFilename(getFilenameTemplate(), {
                    handle: handle, id: tweetId, index: 1, ext: items[0].ext
                }));
                selectedFile = await selectDownloadFile(selectedFilename);
            }
            // React-/Prefetch-URLs können in einer langen Timeline bereits
            // abgelaufen oder nur unvollständig sein. Der Dialog bleibt sofort:
            // Erst NACH der Dateiauswahl wird eine frische Videoquelle geladen.
            // Die Einzelansicht hat bereits frische Tweet-Metadaten und bleibt
            // unverändert. Bei API-Fehlern gilt weiterhin der schnelle Fallback.
            if (selectedFile && usedFastItems && items.length &&
                (items[0].ext === 'mp4' || items[0].ext === 'ts') &&
                !isTweetDetailView(tweetId)) {
                setTaskProgress(task, '…', 'Aktualisiere Videoquelle …');
                var refreshed = await loadItemsLive(tweetId, task.signal);
                ensureNotCancelled(task.signal);
                if (refreshed.items && refreshed.items.length) {
                    items = preferFreshItems(items, refreshed.items);
                    apiStatus = refreshed.apiStatus;
                    log.info('Videoquelle nach Timeline-Dateiauswahl aktualisiert.');
                } else {
                    log.warn('Frische Timeline-Metadaten nicht verfügbar; verwende vorgeladene Quelle.');
                }
            }
            // Bei einem Cache-Miss kann die API erst nach dem bereits geoeffneten
            // MP4-Dialog eine TS-Broadcastquelle liefern. Niemals TS als MP4
            // speichern; Quelle fuer den naechsten Klick kurz zwischenspeichern.
            if (selectedFile && items.length && items[0].ext === 'ts' &&
                selectedFilename && /\.mp4$/i.test(selectedFilename)) {
                setCachedItems(tweetId, items);
                throw new Error('Broadcast-Quelle ermittelt. Erneut klicken, um .ts als Dateityp zu waehlen.');
            }
            // Immer DOM-Poster/Standbilder ergänzen — auch bei Cache-Treffer,
            // sonst fehlen Medien, die die API (bzw. der Prefetch) nicht liefert.
            items = await mergeDomItems(tweet, items, task.signal);
            ensureNotCancelled(task.signal);
            if (selectedFile && items.length && items[0].ext !== 'mp4' && selectedFilename && /\.mp4$/i.test(selectedFilename)) {
                // No incorrect extension: the picker chose an MP4 but API found an image.
                throw new Error('Videokarte ohne Videodatei: Dateiauswahl nicht übernommen');
            }

            ensureNotCancelled(task.signal);
            if (!items.length) {
                errorMessage = 'Keine abrufbare Medienquelle gefunden (auch Broadcast geprueft)';
                if (apiStatus === 429) {
                    errorMessage = 'Rate-Limit (429) - kurz warten, dann erneut versuchen';
                } else if (apiStatus === 401 || apiStatus === 403) {
                    errorMessage = 'Zugriff verweigert (' + apiStatus + ')';
                }
                log.warn('Keine Medien für Tweet ' + tweetId + ' gefunden (Cache + API + DOM). API-Status: ' + apiStatus);
            } else {
                for (var i = 0; i < items.length; i++) {
                    ensureNotCancelled(task.signal);
                    var filename = sanitizeFilenamePart(formatFilename(getFilenameTemplate(), {
                        handle: handle,
                        id: tweetId,
                        index: i + 1,
                        ext: items[i].ext
                    }));
                    if (i === 0 && selectedFile) filename = selectedFilename;
                    var saveAs = (saveAsMode === 'all') || (i === 0);
                    // Fortschritts-Badge nur bei Videos relevant (Bilder/kurze Videos: nein)
                    var isVideo = (items[i].ext === 'mp4' || items[i].ext === 'ts');
                    try {
                        log.info('Lade Medien ' + (i + 1) + '/' + items.length + ' → ' + filename);
                        // GM_download liefert im Browser-API-/Native-Modus nicht
                        // zuverlässig onprogress oder eine Gesamtgröße. Deshalb
                        // den laufenden Videotransfer sofort neutral anzeigen.
                        if (isVideo) {
                            setTaskProgress(task, '…', 'Lade ' + (i + 1) + '/' + items.length + ' …');
                        }
                        var reportProgress = function (progress) {
                            // Badge nur bei Videodateien ab einer Mindestgröße — bei
                            // Bildern und kurzen Videos wird nichts angezeigt.
                            if (!progress || !isVideo) return;
                            var total = Number(progress.total);
                            if (!isFinite(total) || total <= 0) {
                                setTaskProgress(task, '…', 'Lade ' + (i + 1) + '/' + items.length + ' …');
                                return;
                            }
                            if (!progress.segmented && total < CONFIG.progressBadgeMinBytes) {
                                hideTaskProgress(task);
                                return;
                            }
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
                                setTaskProgress(task, pct,
                                    'Lade ' + (i + 1) + '/' + items.length + ' … ' + pct + '%');
                            }
                        };
                        if (i === 0) {
                            // Reiner DOM-Fallback: jetzt erst steht die Endung
                            // fest. Falls die Aktivierung abgelaufen ist, wird
                            // unverändert GM_download verwendet.
                            if (!selectedFile && !selectedFilename) selectedFile = await selectDownloadFile(filename);
                        }
                        if (items[i].broadcastId) {
                            var broadcastUrl = await broadcastPlaybackUrl(items[i].broadcastId, task.signal);
                            var broadcastFile = (i === 0 && selectedFile) ? selectedFile : await selectDownloadFile(filename);
                            if (!broadcastFile) throw new Error('Broadcast: Dateiauswahl erforderlich (erneut klicken)');
                            var manifest = await hlsResolve(broadcastUrl, task.signal);
                            if (!manifest.transportStream) throw new Error('Broadcast: Replay ist kein MPEG-TS (MP4-Ausgabe noch nicht unterstuetzt)');
                            await downloadHlsFile(broadcastUrl, broadcastFile, reportProgress, task.signal, 'ts');
                        } else if (hlsUrl(items[i].url)) {
                            if (items[i].broadcast) {
                                var broadcastManifest = await hlsResolve(items[i].url, task.signal);
                                if (!broadcastManifest.transportStream) throw new Error('Broadcast: Playlist ist kein MPEG-TS');
                            }
                            // Große HLS-Dateien müssen auf die gewählte Datei gestreamt
                            // werden; GM_download würde nur eine Text-Playlist speichern.
                            var hlsFile = (i === 0 && selectedFile) ? selectedFile : await selectDownloadFile(filename);
                            if (!hlsFile) {
                                var pickerError = new Error('HLS-Dateiauswahl benötigt einen neuen Klick; erneut klicken');
                                pickerError.code = 'HLS_PICKER_REQUIRED';
                                throw pickerError;
                            }
                            await downloadHlsFile(items[i].url, hlsFile, reportProgress, task.signal, items[i].ext);
                        } else if (i === 0 && selectedFile) {
                            await downloadSelectedFile(items[i].url, selectedFile, reportProgress, task.signal);
                        } else {
                            await downloadUrl(items[i].url, filename, saveAs, reportProgress, task.signal);
                        }
                        ensureNotCancelled(task.signal);
                        log.info('Gespeichert: ' + filename);
                    } catch (err) {
                        if (isCancellation(err, task.signal)) return;
                        failed++;
                        if (!firstFailure) firstFailure = (err && err.message) || 'unbekannter Fehler';
                        log.error('Download fehlgeschlagen: ' + ((err && err.message) || 'unbekannter Fehler'));
                        if (err && (err.code === 'HLS_CONTAINER_MISMATCH' || err.code === 'HLS_PICKER_REQUIRED')) {
                            retryItems = items.slice(i).map(function (item) { return Object.assign({}, item); });
                            if (err.code === 'HLS_CONTAINER_MISMATCH') retryItems[0].ext = err.actualExt;
                            break;
                        }
                    }
                }

                // Cache invalidieren: X.com-URLs sind temporär; ein erneuter Klick
                // lädt die Medien frisch (Live-Fallback). Zusätzlich prefetchSeen
                // leeren, damit der Tweet beim nächsten Erscheinen wieder im
                // Hintergrund vorgeladen werden kann (Cache füllen).
                if (retryItems && retryItems.length) setCachedItems(tweetId, retryItems);
                else mediaCache.delete(tweetId);
                prefetchSeen.delete(tweetId);
                prefetchSeenAt.delete(tweetId);

                if (failed > 0) {
                    errorMessage = failed + ' von ' + items.length + ' fehlgeschlagen: ' + firstFailure;
                }
            }
        } catch (err) {
            if (isCancellation(err, task.signal)) return;
            errorMessage = 'Fehler beim Laden: ' + ((err && err.message) || 'unbekannter Fehler');
            log.error('Download-Ablauf fehlgeschlagen (Tweet ' + tweetId + '): ' + (err && err.message ? err.message : err));
        } finally {
            closeCancelPopup(task);
            if (runningDownloadsByTweet.get(tweetId) === task) runningDownloadsByTweet.delete(tweetId);
            for (var taskButtonIndex = 0; taskButtonIndex < task.buttons.length; taskButtonIndex++) {
                runningDownloads.delete(task.buttons[taskButtonIndex]);
                hideProgress(task.buttons[taskButtonIndex]);
                setBusy(task.buttons[taskButtonIndex], false);
            }
        }
        if (errorMessage) flashError(task.btn || btn, errorMessage);
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
        var activeTask = runningDownloadsByTweet.get(getTweetId(tweet));
        if (activeTask) bindRunningDownloadButton(activeTask, btn);
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

    /**
     * Entfernte Tweets aus dem IntersectionObserver lösen: X.com hängt Artikel
     * beim Scrollen aus dem DOM; ohne unobserve würde der Observer sie samt
     * Inhalt dauerhaft halten (wachsender Speicher in langen Sitzungen).
     */
    function releaseDetachedTweets(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (prefetchObserver && node.matches && node.matches(CONFIG.tweetSelector)) prefetchObserver.unobserve(node);
            var detachedButtons = [];
            if (node.matches && node.matches('button[' + CONFIG.btnAttribute + ']')) detachedButtons.push(node);
            if (node.querySelectorAll) {
                var nested = node.querySelectorAll(CONFIG.tweetSelector);
                if (prefetchObserver) {
                    for (var j = 0; j < nested.length; j++) prefetchObserver.unobserve(nested[j]);
                }
                var nestedButtons = node.querySelectorAll('button[' + CONFIG.btnAttribute + ']');
                for (var b = 0; b < nestedButtons.length; b++) detachedButtons.push(nestedButtons[b]);
            }
            for (var d = 0; d < detachedButtons.length; d++) {
                var task = runningDownloads.get(detachedButtons[d]);
                if (task) detachRunningDownloadButton(task, detachedButtons[d], false);
            }
        }
    }

    // Maximale Anzahl Medien-Rechecks pro Tweet (Lazy-Loading-Abdeckung)
    var MAX_TWEET_RECHECKS = 3;

    /**
     * Plant einen erneuten Verarbeitungslauf (max. MAX_TWEET_RECHECKS), wenn
     * Medien oder die Aktionsleiste erst später gerendert werden. Der Zähler im
     * data-Attribut verhindert Endlosschleifen und doppelte Buttons.
     */
    function scheduleTweetRecheck(tweet) {
        var rechecks = parseInt(tweet.dataset.xloaderRechecked || '0', 10);
        if (rechecks >= MAX_TWEET_RECHECKS) return;
        tweet.dataset.xloaderRechecked = String(rechecks + 1);
        setTimeout(function () {
            if (tweet.isConnected && !tweet.querySelector('button[' + CONFIG.btnAttribute + ']')) {
                processTweet(tweet);
            }
        }, CONFIG.recheckDelayMs);
    }

    function processTweet(tweet) {
        if (!tweet || !tweet.isConnected) return;
        var existingButton = tweet.querySelector('button[' + CONFIG.btnAttribute + ']');
        if (existingButton) {
            // X recycelt häufig nur Teile eines Tweets: Der xLoader-Button
            // bleibt dabei erhalten, sein Badge-Wrapper kann aber neu aufgebaut
            // werden. Den laufenden Zustand deshalb auch in diesem Pfad erneut
            // anwenden statt die Verarbeitung sofort zu beenden.
            var currentTweetId = getTweetId(tweet);
            var mappedTask = runningDownloads.get(existingButton);
            if (mappedTask && mappedTask.tweetId !== currentTweetId) {
                // X kann denselben Artikel/Knopf für einen anderen Timeline-
                // Eintrag wiederverwenden. Niemals den alten Task dort zeigen
                // oder einen Klick als Abbruch des falschen Downloads behandeln.
                detachRunningDownloadButton(mappedTask, existingButton, true);
            }
            var existingTask = runningDownloadsByTweet.get(currentTweetId);
            if (existingTask) bindRunningDownloadButton(existingTask, existingButton);
            return;
        }

        if (hasMediaIndicator(tweet)) {
            var btn = createButton(tweet);
            if (btn) {
                log.info('Download-Button eingefügt für Tweet ' + getTweetId(tweet));
            } else {
                // div[role="group"] (Aktionsleiste) ist evtl. noch nicht gerendert
                scheduleTweetRecheck(tweet);
            }
            // Medien-URLs im Hintergrund vorladen, sobald der Tweet sichtbar ist
            observeForPrefetch(tweet);
        } else {
            // Medien können nachgeladen werden (z. B. Lazy-Loading) — Recheck
            // bis zu MAX_TWEET_RECHECKS Mal, dann aufgeben.
            scheduleTweetRecheck(tweet);
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
                // Liegt der eingefügte Knoten bereits in einem Tweet, reicht
                // dieser Tweet — erspart querySelectorAll über den Teilbaum.
                var host = node.closest ? node.closest(CONFIG.tweetSelector) : null;
                if (host) {
                    tweets.add(host);
                    continue;
                }
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
            var removed = [];
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === Node.ELEMENT_NODE) nodes.push(added[j]);
                }
                var gone = mutations[i].removedNodes;
                for (var k = 0; k < gone.length; k++) {
                    if (gone[k].nodeType === Node.ELEMENT_NODE) removed.push(gone[k]);
                }
                // Bei einem teilweisen X-Re-Render kann ausschließlich das
                // Fortschritts-Badge entfernt werden. mutation.target liegt
                // weiterhin im Tweet und muss dann die Wiederanbindung auslösen.
                if (gone.length && mutations[i].target && mutations[i].target.nodeType === Node.ELEMENT_NODE) {
                    var changedTweet = mutations[i].target.closest ?
                        mutations[i].target.closest(CONFIG.tweetSelector) : null;
                    if (changedTweet) nodes.push(changedTweet);
                }
            }
            if (nodes.length) scheduleProcess(nodes);
            if (removed.length) releaseDetachedTweets(removed);
        });
        observer.observe(document.body, { childList: true, subtree: true });

        log.info('xLoader v1.0.42 aktiv — überwache ' + CONFIG.tweetSelector + ' …');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
