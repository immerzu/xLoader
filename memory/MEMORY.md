# xLoader — Projektgedächtnis

Dieses Verzeichnis ist das Gedächtnis für die Arbeit am xLoader-Userscript
(`immerzu/xLoader`, Greasy Fork 589456, Tampermonkey, X.com/Twitter-Medien-
Downloader). Angelegt am 05.09.2026 — nach dem Projekt-Umzug (v1.0.22) fehlte
der `memory/`-Ordner, den alle Nachbarprojekte besitzen.

- [Lolo (Benutzer)](user_lolo.md) – Sprache, Tools, Präferenzen und projektübergreifende Arbeitsregeln
- [Fakten](FACT.md) – dauerhaftes Projektwissen: Kerndaten, Architektur, Fallback-Kette, Release-Ablauf, Fallstricke
- [Arbeitsjournal](JOURNAL.jsonl) – kurze chronologische Arbeitsnotizen und wichtige Sitzungsereignisse
- [HANDOVER v1.0.22](HANDOVER_v1.0.22.md) – Übergabe-/Stand-Snapshot zum aktuellen Stand (v1.0.22)

## Pflege-Regeln

- **FACT.md** nach jeder relevanten Änderung aktualisieren (Stand-Zeile oben immer mitziehen!).
- **JOURNAL.jsonl** bei jeder Arbeitssitzung um Ereignisse ergänzen (JSONL: `{"ts":…,"tags":[…],"text":"…"}`).
- Bei größeren Meilensteinen eine **HANDOVER_<version>.md** als Stand-Snapshot anlegen.
- Keine sensiblen Daten (Tokens, Keys, Secrets, Cookies) in Gedächtnis-Dateien ablegen.
