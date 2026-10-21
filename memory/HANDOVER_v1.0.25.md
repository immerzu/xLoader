# HANDOVER v1.0.25 — Streamingfix, 2026-10-21

> Historischer Zwischenstand. Die offene native Speicherung wurde inzwischen
> vom Nutzer unter Windows mit v1.0.26 bestätigt (schneller Dialog, beide Videos).
> Veröffentlichung ausschließlich v1.0.26; siehe HANDOVER_v1.0.26.md.

## Stand und Freigabe

v1.0.25 ist lokal vorbereitet, noch nicht veröffentlicht. GitHub/GF bleiben
auf v1.0.24. Die ursprüngliche Veröffentlichungsfreigabe besteht; nach der
neuen Fehlermeldung wurde die Veröffentlichung bis zur Klärung angehalten.
Der Nutzer bestätigte zuvor den schnellen Dialog der lokalen Testfassung
(Ausgabe/xLoader-v1.0.24-dialog-test-20261021.user.js,
SHA-256 58847020F66CECABABCD4780E745BE2DB17D9F6A20AF286C6F05890317D73F6B).
Danach meldete er beim Zwei-Video-Tweet eine leere erste Datei und beauftragte
ausdrücklich Analyse und Korrektur. Die finale Implementierung ist deshalb
nicht mehr unverändert identisch mit dieser ursprünglichen Testfassung.

## Ursache und Korrektur

Tweet: https://x.com/TruthTrencher/status/2111770022419075168
API, Cache und DOM enthalten beide Videos. Die zweite vorhandene Datei ist
558.184 Bytes groß, ihr Hash stimmt mit dem zweiten MP4 überein. Die erste
Datei war 0 Bytes: Regression im neuen Streamingpfad, kein Parserverlust.

Echter Tampermonkey 5.5.1 belegt folgende Callbackfolge:
- onloadstart: readyState 1, HTTP 0, ReadableStream vorhanden.
- Mit timeout:0 folgte im Fetch-Transport sofort onloadend HTTP 408.
- Ohne diesen Parameter: readyState 2/4 HTTP 200, onload und onloadend 200.

Korrektur: Status 0 am Start zulassen, HTTP erst mit tatsächlicher Antwort
prüfen; timeout-Parameter weglassen, 5-min-Fortschrittswatchdog bleibt;
onloadend abonnieren (Tampermonkey benötigt das Endsignal zum Streamschluss);
Datei erst nach Stream-Ende UND erfolgreichem onload sowie Größenprüfung
committen. Frühen/verspäteten Fehler und leeren Stream ohne Commit ablehnen.
Weitere Medien bleiben auf dem bisherigen GM_download-Pfad (first/all).

## Nachweise

43 Regressionstests (11 DOM, 13 Fix, 19 Watchdog) und 28 Downloadtests bestanden,
node --check erfolgreich. Neue Tests schützen Status 0, fehlenden Timeout,
Endsignal, späte HTTP-Fehler, Abschlussreihenfolge und tatsächlichen Zwei-Video-
API-Datensatz. Ein lokaler HTTP/Disk-Test prüft 512 KiB mit SHA-256.

Finalen Streaminghelfer temporär im laufenden xLoader-Scope ausgeführt,
mit echtem GM_xmlhttpRequest von Tampermonkey 5.5.1 und echten CDN-Medien:
1. 42.683.448 Bytes; SHA-256
   0a36ffe83aaee556b0e9f4d24ca017393687f4c3005ea369839372ca23ffb468
2. 558.184 Bytes; SHA-256
   a78ed087097c9744e2dc8662283b12a3c8677d0a9be4732f48ba5e9976be8c75
Beide Streams endeten erfolgreich; ihre Hashes stimmen mit unabhängigen
Abrufen überein. Im Browser war der Datei-Adapter ein Speichermock: dieser
Nachweis ersetzt keinen erneuten nativen Windows-Speichervorgang der finalen
Fassung. Der schnelle Picker war nur für die ursprüngliche Fassung vom Nutzer
bestätigt. Keine neuen nativen Millisekundenmessungen behaupten.

Belege lokal: Ausgabe/release-v1.0.25/final-real-tampermonkey-both.json,
independent-media-hashes.json, tests.log. Keine Cookies/Tokens dort abgelegt.
Ein Automatisierungs-Timeout beendete die Browseranbindung; der Browser wurde
mit unveränderter Konfiguration und demselben persistenten Profil wieder
geöffnet. Keine Erweiterungs-/Tampermonkey-Einstellung geändert und kein Skript
installiert/aktualisiert. Nur temporäre Runtime-Diagnose, anschließend Reload.

## Lokale Dateien

Quelle xLoader.user.js, @version 1.0.25; beide Dateien byte-identisch:
- Ausgabe/xLoader-v1.0.25.user.js
- Ausgabe/xLoader-v1.0.25-stream-fix-20261021.user.js
Größe 87775 Bytes, SHA-256:
0B5D69ACEB87C37F95787395384387AA766686482B56CC12BE5538BCF7B1C862

Vorgefundener Stand gesichert unter
Ausgabe/release-v1.0.25-backup-20261021-054051/.
Vorheriges lokales Release-Asset zusätzlich unter
Ausgabe/release-v1.0.25/xLoader-v1.0.25-before-stream-fix.user.js.
Keine dieser Ausgabedateien committen.

## Noch offen

Erneuten nativen Speichervorgang der finalen Korrektur prüfen; anschließend
freigegebenen Releaseablauf fortsetzen. Keine Veröffentlichung behaupten.
Letzte Prüfung: main/origin main e16a6cf9d27e9ade2a84f4f3177cf50ffa418b45,
Tag/Release v1.0.25 nicht vorhanden. Keine Commits/Pushes ausgeführt.
GitHub https://github.com/immerzu/xLoader/releases/tag/v1.0.25
Greasy Fork https://greasyfork.org/de/scripts/589456-xloader
GF-Rohdatei https://update.greasyfork.org/scripts/589456/xLoader.user.js

GH_TOKEN der Sitzung ist ungültig und überlagert gültige OS-Keyring-Anmeldung
immerzu: für GH-Befehle nur im Kindprozess GH_TOKEN/GITHUB_TOKEN entfernen.
Helfer lokal Ausgabe/release-v1.0.25/run-command.py. Keine globale Auth ändern.
Vorbestehende .gitignore und memory/HANDOVER_v1.0.24.md nicht mitcommitten.
AGENTS.md und BROWSER_STARTUP_2026-10-21.md weiterhin verbindlich beachten.
