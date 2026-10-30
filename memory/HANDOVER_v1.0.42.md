# xLoader v1.0.42 — Release

Stand: 2026-10-30. Vom Nutzer unter Windows/Tampermonkey bestätigt und zur Veröffentlichung freigegeben.

## Korrekturen

- Öffentliche Tweet-Medien werden bei fehlenden Timeline-React-/Conversation-Daten zusätzlich über die öffentliche X-Syndication-Schnittstelle anhand der Status-ID aufgelöst. Dadurch funktioniert die Medienauflösung unabhängig davon, ob der Beitrag in der Hauptansicht oder als Einzelbeitrag geöffnet ist.
- Nach der frühen Dateiauswahl werden veraltete Timeline-Videoquellen erneuert, bevor der eigentliche Transfer beginnt. Leere Zieldateien durch abgelaufene Quellen werden damit vermieden.
- Laufende Timeline-Player werden nicht mehr für die Quellensuche angehalten; vorhandene Performance-Einträge bleiben nutzbar. Progressive `ext_tw_video`-/`amplify_video`-Quellen werden über ihre Medien-ID zugeordnet.
- Ein paralleler HEAD-Abruf ergänzt eine fehlende Gesamtgröße für direkte Videostreams, damit große progressive Videos wieder Prozentfortschritt anzeigen können.
- Die Härtung, Mehrfachmedien-, HLS-/Broadcast-, Dateiauswahl-, Fortschritts- und Abbruchlogik der vorherigen Veröffentlichung bleibt erhalten.

## Nachweise vor der Veröffentlichung

- `node --check xLoader.user.js`: erfolgreich.
- Gesamte lokale Node-Suite: 83/83 Subtests, 0 Fehler.
- Referenzstatus `2116074797578772484`: öffentliche Syndication-Antwort enthielt vollständige Medienmetadaten; die höchste progressive MP4-Variante war 1,28 Mbit/s bei 720 × 720.
- Bereits vom Browser gespeicherte Referenzdatei: 855.774 Bytes, H.264/AAC, 10,090667 Sekunden. Sie war byteidentisch mit der erneut geladenen höchsten Quellvariante, SHA-256 `5E5F57FBCF5639380889932ACD489C753CF99DB36564AA788872BF5A734565ED`.
- Der Nutzer bestätigte anschließend die korrigierte Hauptansicht und Fortschrittsanzeige und gab v1.0.42 zur Veröffentlichung frei.

## Veröffentlichung

Die endgültigen Commit-, Tag-, GitHub-Asset- und Greasy-Fork-Nachweise werden nach der tatsächlichen Kontrolle beider Dienste ergänzt. Das Browserprofil wird für die Veröffentlichung nicht verändert.
