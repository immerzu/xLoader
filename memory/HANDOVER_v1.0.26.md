# HANDOVER v1.0.26 — Release, 2026-10-21

## Freigabe und unveränderte Fassung

Der Nutzer hat unter Windows den schnellen Speichern-Dialog und beide Videos
des Tweets https://x.com/TruthTrencher/status/2111770022419075168 erfolgreich
getestet und Commit, main-Push, Tag, GitHub-Release und GF-Sync ausdrücklich
freigegeben. Damit ist die frühere native Testlücke aus v1.0.25 geschlossen.
Keine Browser-/Profil-/Tampermonkey-Änderungen für die Veröffentlichung nötig.
Keine erneute Versionsanhebung: die vorhandene, getestete v1.0.26 bleibt exakt.

- Quelle: xLoader.user.js; @version und Init-Log 1.0.26.
- Asset: Ausgabe/xLoader-v1.0.26.user.js; byte-identisch, 88.142 Bytes.
- SHA-256: E673B1F25F022598A6F114EB46001D953DB6C7956D431E5795F4BC0FF95FD808
- v1.0.25 bleibt ein lokaler Zwischenstand und wird nicht veröffentlicht.

## Änderung gegenüber veröffentlichtem v1.0.24

Bei unterstützten Browsern erste Dateiauswahl vor dem Datentransfer, danach
GM_xmlhttpRequest-Stream in die gewählte Datei. Weitere Medien bleiben auf
GM_download mit first/all; fehlender Picker/Benutzeraktivierung nutzt Fallback.
Streamstart mit Status 0 zulassen; kein sofortiger Fetch-timeout:0;
onloadend für Stream-Endsignal abonnieren; erfolgreiche finale HTTP-Antwort,
Streamende und Größenprüfung vor Dateiübernahme. Fehler aborten den Writable.
Details der belegt korrigierten Regression in HANDOVER_v1.0.25.md.

## Prüfung

Für exakt diesen Hash Syntax und 71 lokale Tests erneut erfolgreich:
11 DOM, 13 Fix, 19 Watchdog, 28 Downloadtests. Reale lokale HTTP/Disk-Prüfung
mit 512 KiB und SHA-256 enthalten. Frühere reale TM5.5.1-Übertragungen beider
CDN-MP4s hatten unabhängig gleiche Hashes; Browser-Datei-Adapter war simuliert.
Native End-to-End-Abnahme ist die ausdrückliche aktuelle Nutzerbestätigung.
Keine automatischen nativen Dialog-Millisekunden behaupten.

## Veröffentlichung und Belege

GitHub: https://github.com/immerzu/xLoader/releases/tag/v1.0.26
Greasy Fork: https://greasyfork.org/de/scripts/589456-xloader
Rohdatei: https://update.greasyfork.org/scripts/589456/xLoader.user.js

Belege dieser Veröffentlichung lokal unter Ausgabe/release-v1.0.26/:
Sicherung des vorgefundenen Arbeitsstands, tests.log, Release-Notes und
publication-verification.json. Erst nach tatsächlicher Prüfung beider Dienste
Erfolg melden. GF darf ausschließlich @updateURL/@downloadURL ersetzen und
verschieben; Vergleich ohne diese Zeilen muss exakt übereinstimmen.

Vorbestehende Änderungen in .gitignore und memory/HANDOVER_v1.0.24.md bleiben
außerhalb des Release-Commits. Keine Ausgabe-/Profil-/Temporärdaten oder
.reasonix-Dateien committen. Autor immerzu, main. Gültige Windows-gh-Anmeldung
wird ggf. von ungültigem GH_TOKEN überlagert: nur im Kindprozess GH_TOKEN und
GITHUB_TOKEN entfernen, keine globale Authentifizierung ändern.

## Verifizierter Abschluss

- Release-Commit und Tag v1.0.26: d5dd2d374ba8303479a385c6b43ded2bfcebb7bf.
- GitHub-Release veröffentlicht (kein Draft/Prerelease); Asset erneut
  heruntergeladen: 88.142 Bytes, SHA-256 E673B1F25F022598A6F114EB46001D953DB6C7956D431E5795F4BC0FF95FD808.
- GitHub Raw für Tag und main byte-identisch mit der freigegebenen Quelle.
- GF-Seite und Rohdatei zeigen 1.0.26. Automatischer Webhook-Sync genügte;
  kein manueller Trigger. Rohdatei 88.118 Bytes, SHA-256 ECAD442C559554D12505009D55E0DC4FDDF3D8E7951D25ECF2844FC140C5D51E.
  Nach Entfernen ausschließlich der beiden GF-eigenen Update-/Download-URL-
  Zeilen ist der gesamte Inhalt exakt identisch, einschließlich Reihenfolge.
- Alle 71 Tests und Syntax erfolgreich. Vorbestehende .gitignore und
  HANDOVER_v1.0.24.md gegen Sicherung bytegleich; keine Browseraktionen.
- Ein nachfolgender reiner Doku-Commit protokolliert diese Abschlussnachweise;
  Tag/Release-Commit und Userscript bleiben unverändert.
