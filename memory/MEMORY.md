# xLoader — Projektgedächtnis

Dieses Verzeichnis ist das Gedächtnis für die Arbeit am xLoader-Userscript
(`immerzu/xLoader`, Greasy Fork 589456, Tampermonkey, X.com/Twitter-Medien-
Downloader). Angelegt am 05.09.2026 — nach dem Projekt-Umzug (v1.0.22) fehlte
der `memory/`-Ordner, den alle Nachbarprojekte besitzen.

- [Lolo (Benutzer)](user_lolo.md) – Sprache, Tools, Präferenzen und projektübergreifende Arbeitsregeln
- [Fakten](FACT.md) – dauerhaftes Projektwissen: Kerndaten, Architektur, Fallback-Kette, Release-Ablauf, Fallstricke
- [Arbeitsjournal](JOURNAL.jsonl) – kurze chronologische Arbeitsnotizen und wichtige Sitzungsereignisse
- [Browser-Neustartfehler und verbindliche Lösung](BROWSER_STARTUP_2026-10-21.md) – **Pflichtlektüre vor Browserarbeiten**: persistentes Profil, dauerhafte Tampermonkey-Installation, Herkunftssperre 12, gültige Startpfade und Neustart-Abnahme. Ersetzt ältere Empfehlungen, Tampermonkey per `--load-extension` zu starten.
- [HANDOVER v1.0.33](HANDOVER_v1.0.33.md) – aktueller Quell-/Release-Stand: Agent-A-Freigabe, HLS und Abbruch, Integritätsnachweise.
- [HANDOVER v1.0.28](HANDOVER_v1.0.28.md) – historische lokale Testfassung; 903-Byte-Initsegment-Bug, Nachweise und Grenzen; nicht veröffentlicht.
- [HANDOVER v1.0.26](HANDOVER_v1.0.26.md) – historischer Release-Stand: bestätigter Windows-Test, unveränderte Freigabedatei und Veröffentlichung.
- [HANDOVER v1.0.25](HANDOVER_v1.0.25.md) – historischer lokaler Zwischenstand mit Streamingdiagnose; durch v1.0.26 abgelöst.
- [HANDOVER v1.0.24](HANDOVER_v1.0.24.md) – historischer Release-Stand v1.0.24, Download-Fixes, Tests, Release-Nachweise
- [HANDOVER v1.0.23 (vollständig)](HANDOVER_v1.0.23.md) – historischer kompletter Bericht (Architektur mit Zeilen v1.0.23, Datenflüsse, Tests, Release, Schwachstellen, Stand)

- [HANDOVER v1.0.22](HANDOVER_v1.0.22.md) – historischer Snapshot nach dem Projektumzug.
- [Bestandsaufnahme und offene Bereinigungskandidaten](CLEANUP_2026-10-21.md) – lokale Profile, Archive und Werkzeugdaten; keine Löschfreigabe.

Aktueller Einstieg: `AGENTS.md` → dieses Verzeichnis → `FACT.md` und Handover v1.0.33. Ältere Handovers und Journal-Einträge beschreiben historische Zustände und sind keine aktuellen Browser- oder Release-Anweisungen.

## Pflege-Regeln

- Die Projektanweisungen in `../AGENTS.md` beachten; Browserreparaturen erst nach zwei erfolgreichen vollständigen Neustartprüfungen als dauerhaft behoben melden.

- **FACT.md** nach jeder relevanten Änderung aktualisieren (Stand-Zeile oben immer mitziehen!).
- **JOURNAL.jsonl** bei jeder Arbeitssitzung um Ereignisse ergänzen (JSONL: `{"ts":…,"tags":[…],"text":"…"}`).
- Bei größeren Meilensteinen eine **HANDOVER_<version>.md** als Stand-Snapshot anlegen.
- Keine sensiblen Daten (Tokens, Keys, Secrets, Cookies) in Gedächtnis-Dateien ablegen.
