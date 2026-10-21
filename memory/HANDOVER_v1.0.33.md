# HANDOVER v1.0.33 — Abgleich und Veröffentlichung, 2026-10-21

## Freigegebene Quelle

Agent-A-Commit: 204d9d64d0070cc75b6bfa75473abda0f81eda29.
Git-Blob: c30c868bcd10baa27c98d1bdc602a1bb961c4fd0.
Quelle, lokales Asset und erneut geladenes GitHub-Asset byte-identisch:
138353 Bytes; SHA-256 6047F2D8EC3DEAC008B9703A37E4A4088046E35C05A1005BF3683359B5A22BF1.
Lokale Quelle auf kanonische Git-Blob-Zeilenenden normalisiert, keine
Downloadlogik oder Metadaten gegenüber dem freigegebenen Blob geändert.

## Funktionen und Abnahme

Player-Card-/Broadcast-/HLS-Erkennung, geeignete fMP4-/MPEG-TS-Aufzeichnungen,
pscp.tv-Berechtigung und alternativer Netzwerkabruf. Fortschritt erhalten;
erneuter Buttonklick bietet Abbruch mit Ja/Nein. Nicht alle geschützten Streams.
Nutzer bestätigt Videodownload einschließlich HLS und Abbruch im eigenen Browser.
Diese Sitzung prüft Syntax und Datei-/Veröffentlichungsintegrität; keine neuen
Browser-, Profil- oder Tampermonkey-Änderungen und keine erneute Funktionsentwicklung.
Die 83 früheren lokalen Tests gehören zum historischen v1.0.28-Stand.
Ihre Harness-Änderungen sind erhalten, aber keine neue automatisierte v1.0.33-Abnahme.

## Lokaler Arbeitsstand geschützt

Vorhandene Änderungen zuerst vollständig unter Ausgabe/release-v1.0.33/
gesichert (local-before/, Patch und Hashliste), zusätzlich in Git-Stash:
`13d788b08107c7670235222d5b1dadfd983beb3f` (nicht automatisch wieder komplett anwenden!).
Dann Fast-forward von cd9a6e5 auf Agent As Commit. Unveränderte lokale Tests,
.gitignore und HANDOVER_v1.0.24 zurückgeführt; lokale v1.0.28-Quelle bleibt
im Stash, der Dateisicherung und ihrem vorhandenen Versionsarchiv erhalten.
README/FACT manuell mit Agent As aktuellen Inhalten zusammengeführt; lokale
Bereinigungsstruktur und Historie erhalten. Journal vereinigt, Index aktualisiert.
Unpassende ältere Downloadlogik nicht über v1.0.33 zurückgespielt.

## Veröffentlichung tatsächlich geprüft

Tag v1.0.33 zeigt auf Agent As Originalcommit, nicht den späteren Doku-Commit.
GitHub: https://github.com/immerzu/xLoader/releases/tag/v1.0.33
Asset: Ausgabe/xLoader-v1.0.33.user.js; hochgeladen und erneut heruntergeladen,
SHA-256 und Größe wie oben. Release kein Draft/Prerelease.
Greasy Fork: https://greasyfork.org/de/scripts/589456-xloader
Seite UND Rohdatei liefern 1.0.33; automatischer Sync genügte, kein manueller Trigger.
GF-Rohdatei 138329 Bytes, SHA-256 1278E273A8021DBC58727018312F75851D7D27EE563DED0492150831B21090DB.
Nach Normalisierung der Zeilenenden und Entfernung ausschließlich von
@updateURL/@downloadURL ist der gesamte Inhalt exakt gleich.
Belege lokal Ausgabe/release-v1.0.33/publication-verification.json.

## Einschränkungen

Nur geeignete und nicht geschützte Streams unterstützt; Praxistest nutzerbestätigt.
Vorhandene uncommittierte Testarbeiten bleiben bewusst außerhalb des Doku-Commits.
Stash und Sicherungen behalten. Kein Profilzugriff nötig. TLS-Abruf per curl
benötigte --ssl-revoke-best-effort wegen nicht erreichbarem Sperrserver;
Zertifikatsprüfung nicht deaktiviert (kein --insecure).
