# xLoader — Projektgedächtnis

Dieses Verzeichnis ist das Gedächtnis für die Arbeit am xLoader-Userscript
(`immerzu/xLoader`, Greasy Fork 589456, Tampermonkey, X.com/Twitter-Medien-
Downloader). Angelegt am 05.09.2026 — nach dem Projekt-Umzug (v1.0.22) fehlte
der `memory/`-Ordner, den alle Nachbarprojekte besitzen.

- [Lolo (Benutzer)](user_lolo.md) – Sprache, Tools, Präferenzen und projektübergreifende Arbeitsregeln
- [Fakten](FACT.md) – dauerhaftes Projektwissen: Kerndaten, Architektur, Fallback-Kette, Release-Ablauf, Fallstricke
- [Arbeitsjournal](JOURNAL.jsonl) – kurze chronologische Arbeitsnotizen und wichtige Sitzungsereignisse
- [Browser-Neustartfehler und verbindliche Lösung](BROWSER_STARTUP_2026-10-21.md) – **Pflichtlektüre vor Browserarbeiten**: persistentes Profil, dauerhafte Tampermonkey-Installation, Herkunftssperre 12, gültige Startpfade und Neustart-Abnahme. Ersetzt ältere Empfehlungen, Tampermonkey per `--load-extension` zu starten.
- [HANDOVER v1.0.22](HANDOVER_v1.0.22.md) – Übergabe-/Stand-Snapshot zum Stand v1.0.22
- [HANDOVER v1.0.26](HANDOVER_v1.0.26.md) – aktueller Release-Einstieg: bestätigter Windows-Test, unveränderte Freigabedatei und Veröffentlichung.
- [HANDOVER v1.0.25](HANDOVER_v1.0.25.md) – historischer lokaler Zwischenstand mit Streamingdiagnose; durch v1.0.26 abgelöst.
- [HANDOVER v1.0.24](HANDOVER_v1.0.24.md) – **Einstieg für neue Agenten**: Release-Stand v1.0.24, Download-Fixes, Tests, Release-Nachweise
- [HANDOVER v1.0.23 (vollständig)](HANDOVER_v1.0.23.md) – **Einstieg für neue Agenten**: kompletter Bericht (Architektur mit Zeilen v1.0.23, Datenflüsse, Tests, Release, Schwachstellen, Stand)

## Pflege-Regeln

- Die Projektanweisungen in `../AGENTS.md` beachten; Browserreparaturen erst nach zwei erfolgreichen vollständigen Neustartprüfungen als dauerhaft behoben melden.

- **FACT.md** nach jeder relevanten Änderung aktualisieren (Stand-Zeile oben immer mitziehen!).
- **JOURNAL.jsonl** bei jeder Arbeitssitzung um Ereignisse ergänzen (JSONL: `{"ts":…,"tags":[…],"text":"…"}`).
- Bei größeren Meilensteinen eine **HANDOVER_<version>.md** als Stand-Snapshot anlegen.
- Keine sensiblen Daten (Tokens, Keys, Secrets, Cookies) in Gedächtnis-Dateien ablegen.
