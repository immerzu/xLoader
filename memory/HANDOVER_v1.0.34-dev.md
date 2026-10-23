# HANDOVER v1.0.34-dev — lokale Härtungsfassung, 2026-10-22

## Stand

- Ausgang: veröffentlichte v1.0.33.
- Lokal: `xLoader.user.js`, Version `1.0.34-dev`.
- Build: `Ausgabe/xLoader-v1.0.34-dev.user.js`.
- Nicht veröffentlicht; kein Commit, Push, Tag oder Release.

## Änderungen

H1–H7 aus `HARDENING_2026-10-22.md` sind umgesetzt: vollständige HTTP-
Antworten und Mediensignaturen, fMP4-/TS-Strukturprüfung, sichere HLS-
Initialisierung, Container-/Endungsabgleich, durchgängiger Abbruch,
HTTPS-/Host-/Pfadgrenzen sowie Ressourcen-, Cache- und Queue-Limits.

Die frühe erste Dateiauswahl, Mehrfachmedien, HLS/Broadcast, Fortschritt,
GM_download-Fallback und Ja/Nein-Abbruch bleiben im bestehenden Ablauf.
Eine nicht mehr mögliche zweite HLS-Auswahl speichert die restlichen Medien
für einen neuen Klick, statt eine falsche oder unvollständige Datei zu melden.

## Prüfung

- `node --check xLoader.user.js`: erfolgreich.
- `node --test tests/*.test.cjs`: 67 TAP-Einträge erfolgreich, 0 Fehler;
  die drei eingebetteten Legacy-Harnesses melden zusammen 40 Einzelprüfungen,
  insgesamt 104 einzeln ausgewiesene Prüfungen.
- H1–H7 besitzen jeweils Fehlerfall und erfolgreiche Gegen-/Regressionstests.
- Zusätzlich: HLS-Folgeauswahl, Abbruch während Dateischreiben,
  Windows-Dateinamen sowie alte/frische Broadcast-Performance-Einträge.
- Quelle und Build byte-identisch: 155.180 Bytes, SHA-256
  `61E29E2F3A185242D922B014F3AE18F1BF720AF9130F2211361AAEE58FBF6BB3`.

Alle neuen Prüfungen sind synthetische Node-/VM-Harness-Tests; der lokale
HTTP-/Dateitest überträgt echte Bytes und vergleicht SHA-256. Kein neuer
Browser-/Tampermonkey-Test und keine native Dialogzeitmessung wurden ausgeführt.

## Grenzen

Nicht unterstützte verschlüsselte, laufende, lückenhafte oder zeitlich
diskontinuierliche HLS-Konstellationen werden sichtbar abgelehnt. Der
GM_download-Fallback gibt dem Userscript keinen Zugriff auf die gespeicherten
Bytes; seine Inhaltsintegrität kann daher erst außerhalb der API geprüft
werden. Die installierbare Testfassung ist für die Nutzerabnahme vorgesehen.
