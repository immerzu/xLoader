# Härtungsanalyse xLoader v1.0.33 — 2026-10-22

Untersuchung der gesamten Laufzeitlogik, Schwerpunkt Downloadintegrität,
HLS, Abbruch und Ressourcenbegrenzung. Keine Codekorrektur, neue Version,
Browseränderung oder Veröffentlichung. Vorhandene lokale Änderungen geschützt.

Quelle: xLoader.user.js, 138.353 Bytes,
SHA-256 6047F2D8EC3DEAC008B9703A37E4A4088046E35C05A1005BF3683359B5A22BF1.

## Befunde nach Priorität

### H1 — Hoch: Teilantwort kann als vollständiges Video übernommen werden

Betroffen: downloadSelectedFile, Zeilen 1732–1755 und 1785–1791;
HLS-Abrufe hlsFetchBrowser/hlsFetchGM akzeptieren ebenfalls jeden 2xx-Status.
Die Abschlussprüfung vergleicht nur die übertragenen Bytes mit Content-Length
der Antwort, nicht mit der Gesamtgröße aus Content-Range. Lokale Probe:
HTTP 206, Content-Range bytes 0-2/1000, Content-Length 3, Körper 3 Bytes:
close wurde einmal aufgerufen, abort nicht. Damit können drei von 1000 Bytes
als erfolgreicher Download gelten. Zudem wird der progressive Antwortinhalt
nicht auf ein plausibles Medienformat geprüft.

Härtung: Für Abrufe ohne Range-Anforderung vollständige HTTP-Antwort verlangen;
unerwartetes Content-Range zurückweisen. Antworttyp und Container plausibilisieren,
bevor eine Datei übernommen wird. Keine Volltext-/Fehlerantwort als Medium akzeptieren.

### H2 — Hoch: HLS-Prüfung beweist keine vorhandenen Videodaten

Betroffen: downloadHlsFile, Zeilen 817–841; mp4CombinedInit/mp4AudioFragment.
Für fMP4 genügen bisher ftyp/moov und moof/mdat auf oberster Ebene.
Lokale Probe mit ausschließlich vier leeren Boxen: 32 Bytes geschrieben und
close erfolgreich, obwohl weder Tracks noch Samples vorhanden sind.
Die TS-Prüfung kontrolliert lediglich Länge und die ersten beiden Syncbytes.

Härtung: Track- und Fragmentstruktur, Sampleanzahl/-bereiche, Track-IDs,
Zeitstempel und erlaubte Adressierung prüfen; bei Zusammenführung auch
Audio-/Video-Zeitachsen und die verwendeten Boxvarianten berücksichtigen.
Das ist eine Formatprüfung, keine Garantie für die Decodierbarkeit jedes Codecs.
Die W3C-BMFF-Beschreibung verlangt unter anderem traf/tfdt und alle von trun
referenzierten Samples; die bloße Existenz von moof/mdat genügt nicht.
Quelle: https://www.w3.org/TR/mse-byte-stream-format-isobmff/#media-segments

### H3 — Hoch: HLS-Initialisierung wird über Segmentgrenzen hinweg überschrieben

Betroffen: hlsPlaylist Zeile 621, hlsResolve Zeilen 771–781,
downloadHlsFile Zeilen 817–839.
Es gibt nur ein initUrl pro Playlist. Eine zweite EXT-X-MAP-Anweisung ersetzt
die erste, während alle Segmente erhalten bleiben. Probe: init-a, Segment a,
init-b, Segment b ergibt zwei Segmente, aber ausschließlich init-b.
Das kann Segmente mit unpassender Initialisierung kombinieren.
Audio-Discontinuities werden im Gegensatz zu Video nicht zurückgewiesen.
EXT-X-GAP wird ignoriert und der betroffene Eintrag wie ein normales Segment
behandelt (ebenfalls lokal geprüft). Ein fehlendes GAP-Segment erzeugt dann
gewöhnlich einen Downloadfehler; kein nachgewiesener stiller Erfolg in diesem Fall.

Härtung: Nicht unterstützte Mapwechsel, Audio-Zeitachsenwechsel und Lücken
früh und eindeutig ablehnen; alternativ nur mit korrekter segmentweiser
Zuordnung unterstützen. EXT-X-MAP gilt nur bis zur folgenden MAP-Anweisung.
Quelle: https://www.rfc-editor.org/rfc/rfc8216.html#section-4.3.2.5

### H4 — Mittel: TS-Inhalt kann unter MP4-Dateiname gespeichert werden

Betroffen: apiMediaFromTweet Zeile 1337; onDownloadClick Zeilen 2497–2505;
downloadHlsFile Zeilen 791–813.
Normale API-Video-HLS-Varianten bekommen pauschal ext=mp4. Der HLS-Downloader
kann dieselbe Quelle als MPEG-TS erkennen und unverändert schreiben.
Probe: normale video.twimg.com-Playlist mit .ts-Segment; API-Item ext=mp4,
376 TS-Bytes vom Downloader akzeptiert. Broadcast-Sonderpfade verhindern das
für bestimmte Quellen, der allgemeine HLS-Pfad tut es nicht.

Härtung: Tatsächlichen Container vor Übernahme verbindlich mit Dateityp und
gewähltem Ziel abgleichen. Bei abweichender Endung sauber abbrechen und eine
korrekte neue Auswahl ermöglichen, ohne TS als MP4 zu melden.

### H5 — Mittel: Abbruch erreicht Metadatenabrufe nicht

Betroffen: fetchTweetData, fetchLiveBearerToken, gmBroadcastJson,
broadcastPlaybackUrl, loadItemsLive; Aufruf in onDownloadClick Zeile 2490.
Diese Pfade erhalten kein AbortSignal und geben ihre Requesthandles nicht
an den Downloadtask weiter. Probe während Broadcast-Metadaten:
controller.abort() führt zu null Requestabbrüchen, Klick-Promise bleibt bis
zur simulierten HTTP-Antwort offen. Erst danach greift die Abbruchbehandlung.
Je nach Metadaten-/Tokenkette können mehrere Requests weiterlaufen.

Härtung: Signal bis zu sämtlichen Abrufen und Resolver-Warteschleifen
weiterreichen, laufende Handles abbrechen und Timer/Listener bereinigen.

### H6 — Mittel: Bild-URL-Prüfung verwendet Teilstrings statt Hostprüfung

Betroffen: isMediaUrl Zeilen 860–879, normalizeMediaUrl, originalImageUrl.
Sowohl https://untrusted.invalid/pbs.twimg.com/media/test.jpg als auch
http://pbs.twimg.com/media/test.jpg werden als Medien akzeptiert.
Video- und HLS-URLs haben bereits strengere HTTPS-/Hostprüfungen.
Eine tatsächliche externe Übertragung wurde nicht ausgelöst; Tampermonkey-
Berechtigungen und Downloadmodus sind eine zusätzliche Grenze. Der Befund
belegt eine fehlerhafte Zulassung, keine nachgewiesene Datenexfiltration.

Härtung: Zentral HTTPS, exakten erlaubten Host und passenden Pfad prüfen;
auch API-Fotos und die finalen Download-Eingänge durch diese Prüfung führen.

### H7 — Mittel: Ressourcen- und Parallelitätsgrenzen sind unvollständig

Betroffen: hlsFetchBrowser Zeile 660, hlsFetchGM Zeile 692,
getCachedItems, failPrefetch Zeilen 1556–1562, clearMediaCache.
HLS-Segmente werden jeweils vollständig als ArrayBuffer geladen, ohne
Byteobergrenze; die Grenze 12.000 Segmente beschränkt nicht deren Größe.
Cache-TTL entfernt nur den gerade abgefragten Schlüssel. Probe: 10.000
abgelaufene Einträge, ein Lookup lässt 9.999 bestehen. Auch prefetchSeen
hat keinen globalen Lebenszyklus für abgegebene/abgelehnte Tweets.
Prefetch-Retries rufen prefetch direkt statt über die begrenzte Queue auf.
Probe: vier Retry-Timer erzeugen vier parallele Abrufe trotz Limit drei.
Cacheleeren verwaltet keine Retry-Timer oder Generationen; alte Aufgaben
können den Cache nach dem Leeren erneut füllen.

Härtung: Segment-/Manifestgrößen begrenzen und Übergrößen früh abbrechen;
Cache/Seen mit TTL/LRU und Höchstzahl verwalten. Retries über dieselbe Queue
führen; Cacheleeren muss alte Timer/Ergebnisse entwerten. Keine pauschale
kleine Gesamtdateigrenze, die normale lange Videos beschädigt.

## Bereits vorhandene Schutzmaßnahmen

- Direkte Videoquellen: HTTPS und exakter video.twimg.com-Host mit progressiven Pfaden.
- HLS-Quellen/Segmente: Host-/HTTPS-Prüfung; Verschlüsselung und Byte-Ranges werden abgewiesen.
- File-System-Access: Staging mit abort statt close auf Fehlerpfaden.
- Progressiver Stream: Abschlussstatus, Leerdatei-/Längenprüfung und Stillstands-Watchdog.
- Fehleranzeigen nutzen textContent; innerHTML setzt nur das konstante eigene SVG.
- Begrenzte React-Fibersuche, Prefetch-Grundqueue und teilweise Retry-Schutz.

## Nachweise und Grenzen

Neun lokale Fehlerszenarien mit echten Funktionen aus der unveränderten Quelle
in isolierter Node-VM und synthetischen Antworten/Speicherzielen untersucht.
Drei Gegenproben erfolgreich: AES-128-Playlist abgelehnt, Byte-Range abgelehnt,
abweichende Content-Length abgelehnt (abort=1, close=0).
node --check erfolgreich. Rohbeobachtungen: Ausgabe/hardening-20261022/observations.json.

Kein Browser-/Tampermonkey-Laufzeittest, kein neuer Test echter X-Medien, keine
Dialogzeitmessung. Die synthetischen Fälle belegen Schutzlücken; sie belegen
nicht, dass X aktuell jede dieser Antworten tatsächlich ausliefert.
Historische v1.0.28-Regressionen wurden nicht als aktuelle v1.0.33-Prüfung verwendet.
Weitere Prüfziele: zweite HLS-Dateiauswahl nach abgelaufener Benutzeraktivierung,
Abbruch während createWritable/write/close, Dateinamen mit Windows-Sonderfällen,
veraltete Performance-Einträge bei Broadcast-Zuordnung. Hierzu keine neue
Runtime-Abnahme; keine weiteren bestätigten Sicherheitsfehler behauptet.

Empfohlene Reihenfolge: H1–H3 (Integrität), H4–H5 (Dateityp/Abbruch),
H6 (URL-Grenzen), H7 (lange Sitzungen/Ressourcen). Keine Umsetzung erfolgt.

## Umsetzung v1.0.34-dev — 2026-10-22

Alle sieben Befunde wurden anschließend im lokalen Arbeitsstand behoben:

- H1: nur vollständiges HTTP 200 ohne Content-Range; Content-Length,
  Content-Type und Bild-/MP4-Signatur werden vor dem Finalisieren geprüft.
- H2: fMP4 benötigt Tracks, eindeutige Track-IDs, TREX, MOOF/MDAT,
  TFHD/TFDT/TRUN, Samples, plausible Nutzdaten und monotone Zeitwerte;
  MPEG-TS wird paketweise geprüft.
- H3: wechselndes EXT-X-MAP, EXT-X-GAP sowie Video-/Audio-
  Discontinuities werden eindeutig als nicht unterstützt abgelehnt.
- H4: ermittelter TS-/MP4-Container muss zur Endung passen. Bei Abweichung
  bleibt die Quelle für eine neue korrekte Dateiauswahl erhalten.
- H5: AbortSignal erreicht API-, Token-, Broadcast-, Resolver-, HLS- und
  progressive Abrufe; Requests, Warte-Timer, Reader und Stagingdatei werden
  auf dem Fehlerpfad beendet.
- H6: zentrale HTTPS-, Host- und Pfadgrenzen für Bild-, Video-, HLS- und
  Segmentadressen ersetzen Teilstringprüfungen.
- H7: Manifest-/Segment-/Segmentzahlgrenzen, TTL/LRU-Höchstzahlen,
  gemeinsame Retry-Queue und Cachegeneration verhindern ungebremstes Wachstum
  und das Wiederbefüllen nach Cacheleeren.

Zusätzlich geprüft und korrigiert: eine nach Ablauf der Benutzeraktivierung
nicht mehr mögliche zweite HLS-Dateiauswahl bewahrt die restlichen Medien für
den nächsten Klick; Abbruch während `write`, Windows-reservierte/ungültige
Dateinamen und veraltete Broadcast-Performance-Einträge.

Nachweise stehen in `tests/hardening.test.cjs` und der vollständigen Testsuite.
Sie sind synthetische Node-/VM- und lokale HTTP-/Datei-Harness-Tests. Es gab
keinen neuen Browser-/Tampermonkey-Lauf und keine Veröffentlichung. Der
ursprüngliche v1.0.33-Analysetext oben bleibt als historische Befundgrundlage
erhalten.
