# Lokale Testfassung v1.0.28 — 2026-10-21

## Ursache und Korrektur

Referenz RealAmVoice/2112667113039011886: Nutzerdatei 903 Bytes ist bytegleich
mit dem HLS-EXT-X-MAP-Initialisierungssegment aus /vid/avc1/0/0/1280x720/.
H.264-Metadaten, keine Frames, Dauer 0. Der alte Performance-Resolver prüfte
nur .mp4 und /vid/avc1/; Status200 und Content-Length903 waren korrekt.
Kein Datenverlust im Streaming. Legacy-API lieferte hier keine Medien,
gerenderte Tweet-Props enthielten dagegen vollständige progressive Varianten.

Fix: isProgressiveVideoUrl beschränkt Videoquellen auf vollständige progressive
MP4-Pfade und GIF-MP4. Genutzt in DOM/API/Resolver und vor beiden Transporten.
renderedTweetMedia liest begrenzt die Props des exakt passenden Tweets;
onDownloadClick nutzt sie synchron vor dem Picker, mergeDomItems ergänzt sie.
Keine Playlist-Zusammenführung nötig, keine Profileinstellungen geändert.

## Tatsächliche Nachweise

- Native Windows-Speicherung über temporären Kandidaten-Klickhandler im
  echten TM5.5.1: E:/Downloads/!rar/xLoader-native-test_2112667113039011886_1.mp4.
- 378311776 Bytes; 555.477333 Sekunden; H.264 1920x1080, AAC; 16646 Videobilder.
- SHA256 3287609f28a46cf5e99a1e3cdba2017dd4d858bb43ca34c1fb1942cdd0a4a62a.
  Unabhängiger vollständiger HTTP-Abruf identisch. FFmpeg Voll-Decodierung
  von Video und Audio mit -xerror: Exit0. Kein neuer nativer Dialogzeitmesswert.
- Zwei-Video-Tweet TruthTrencher/2111770022419075168: reale GM-Streaming-
  Übertragungen UND zwei reale GM_download-Browser-API-Dateien vollständig.
  Fallback-Test ließ Picker gezielt aus und setzte saveAs:false für beide
  Dateien; keine Aussage einer erneuten kombinierten nativen first/all-Abnahme.
- Datei1 42683448 Bytes,15.603810 Sekunden,H.264+AAC; SHA256
  0a36ffe83aaee556b0e9f4d24ca017393687f4c3005ea369839372ca23ffb468.
- Datei2 558184 Bytes,6.965986 Sekunden,H.264+AAC; SHA256
  a78ed087097c9744e2dc8662283b12a3c8677d0a9be4732f48ba5e9976be8c75.
  Beide Hashes unabhängig identisch; beide Videos vollständig decodiert.
- Syntax und83Tests:11DOM+13Fix+19Watchdog+28Download+12Progressive-Medien.
  Alte Fixtests verwendeten selbst Init-artige /0/0/-URLs: auf progressive
  Fixtures korrigiert; m3u8 wird nun abgelehnt. Neue Tests prüfen Props-ID,
  Video/GIF-URLs und frühe Ablehnung vor beiden Transporten.

## Testdatei, Zustand und Grenzen

Ausgabe/xLoader-v1.0.28.user.js,91082Bytes,bytegleich zur Arbeitsquelle.
SHA256 8D8606BB88AFE1A535520D8A6AE763EEAE254FFA36CBAB492F3CA6FE59052884.
Basis ausschließlich v1.0.26; v1.0.27-dev nicht übernommen oder lokal gefunden.
Tag/Archiv v1.0.26 unverändert. Kein Commit/Push/Tag/Release.
Lokale Belege und Videos unter Ausgabe/video-analysis-2112667113039011886/.
Die korrigierten Funktionen wurden nur temporär im installierten Script-Scope
ausgeführt; keine Installation, Erweiterungs- oder Cookieänderung. Ein frühes
Automatisierungs-Timeout erforderte Wiederöffnung mit unveränderter Konfiguration.
K4: nativer Speichervorgang erfolgreich, Pickerlogik unverändert; schnelle
Dialogöffnung wurde nicht zusätzlich zeitlich vermessen. React-Props sind eine
optionale interne X-Struktur; bei Änderung greift der gesicherte alte Fallback.
Nutzer prüft die installierbare Testdatei selbst; Veröffentlichung separat freigeben.
