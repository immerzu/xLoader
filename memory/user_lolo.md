---
name: Lolo (Benutzer)
description: Sprache, Tools, Präferenzen und Verhaltensregeln im xLoader-Projekt
type: user
---

## Sprache

- Deutsch — alle Kommunikation auf Deutsch.

## Arbeitsweise (xLoader-spezifisch)

- Bestehende Skript-Struktur, Metablock (Grants/`@connect`/`@match`), CONFIG-Muster und UI-Verhalten respektieren; nichts ohne Not umbauen.
- Keine Git-Commits, Pushes, Tags, GitHub-Releases, Greasy-Fork-Veröffentlichungen oder Änderungen der Publikations-/Sync-Konfiguration ohne ausdrückliche Freigabe.
- Release nur nach dem festen Ablauf in `FACT.md` („Build- & Release-Regeln“): Version nie doppelt vergeben, `node --check`, Archivkopie nach `Ausgabe/` (nie committen), Commit+Push → GF-Webhook → Verifikation, GitHub-Release per Windows-`gh` in PowerShell (Git-Bash-`gh` hat keine Credentials), Aufräumen der Release-Notes.
- Git-Autor **immerzu** repo-local setzen (`user.name`/`user.email`), niemals global ändern.
- PowerShell-Befehle ohne `$`-Variablen formulieren (der Bash-Wrapper strippt sie).
- Das Repo `immerzu/xLoader` ist **öffentlich** — keine sensiblen Daten (Tokens, Keys, Secrets, Cookies) in Code, README, Beschreibungen oder Memory-Dateien speichern. Keine externen Abhängigkeiten/Server einführen.
- Dateien komplett lesen, bevor über sie geurteilt oder geändert wird.
