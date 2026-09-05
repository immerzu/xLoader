# HANDOVER — xLoader (2026-09-05, v1.0.22)

Stand-Snapshot beim Anlegen des Projektgedächtnisses. Quelle: README.md,
description.md, Changelog in `xLoader.user.js`, Release-Playbook
`.reasonix/skills/greasy-fork-release/SKILL.md`.

## 1. Aktueller Entwicklungsstand

**Was das Skript tut (funktionsfähig, live auf X.com verifizierte Strategie):**
- Download-Button pro Tweet mit Medien, geklont aus einem vorhandenen X.com-Aktionsleisten-Button → exaktes Layout (Desktop + mobil).
- Prefetch der Medien-URLs für sichtbare Tweets (IntersectionObserver, rootMargin 200px; Cache TTL 5 min) → „Speichern unter“-Dialog erscheint unmittelbar nach dem Klick.
- URL-Extraktion: X-API (`conversation.json`, Live-Token-Retry bei 401/403, nicht bei 429) + DOM-Merge (Poster, Artikel-Card-Bilder `card_img`; Video-MP4 via Performance-Buffer-Resolver; GIFs = MP4-Streams).
- Downloads: direkter `GM_download` mit `saveAs` nach Modus „nur erstes Medium“ (Default) / „alle Medien“; Fortschritts-Badge ab 5 MB; Dateinamen-Template konfigurierbar (`@{handle}_{id}_{index}.{ext}` Default).
- Tampermonkey-Menü: Speichern-Modus, Cache leeren, Dateinamen-Muster.

**Architektur-Kernentscheidungen:**
- Metablock: `@match` x.com/twitter.com, Grants `GM_download/GM_addStyle/GM_xmlhttpRequest/GM_registerMenuCommand`, `@connect` x.com/twitter.com/pbs.twimg.com/video.twimg.com/abs.twimg.com, `@noframes`, `@run-at document-end`, `@updateURL/@downloadURL` = raw GitHub `main`.
- Fallback-Kette beim Klick (Cache-Miss): API → Live-Token-Retry → DOM-Merge → Fehlermeldung. Kein Blob-Umweg, kein m3u8-Umbenennen.
- Keine externen Abhängigkeiten, kein Server, kein Tracking.

## 2. Offene / wiederkehrende Aufgaben

- [ ] **Projektgedächtnis-Pflege etablieren:** FACT.md nach Änderungen aktualisieren (Stand-Zeile), JOURNAL.jsonl pro Sitzung ergänzen.
- [ ] (wiederkehrend) GF-Verifikation nach Releases: `https://greasyfork.org/de/scripts/589456-xloader/versions`.
- [ ] (optional, lokal) DOM-Regressionstest: `node /c/Users/lolo/dh-test/xloader/dom-media-test.js xLoader.user.js`.
- [ ] (optional) Verbleibende Reasonix-Projekt-Memorys (`greasy-fork-beschreibung-zweisprachig`, `greasy-fork-webhook-einrichten`) — Inhalt ist in FACT.md-Abschnitten abgelegt; bei Bedarf dort nachpflegen.

## 3. Wichtige Dateipfade

| Pfad | Zweck |
|------|-------|
| `F:\001_Coding_Projekte\xLoader\xLoader.user.js` | **Arbeitsdatei** (v1.0.22, 1520 Zeilen; Metablock + vollständiger Changelog oben) |
| `F:\001_Coding_Projekte\xLoader\Ausgabe\` | Versionsarchive `xLoader-v1.0.X.js` (gitignored, nie committen) |
| `F:\001_Coding_Projekte\xLoader\README.md` | Projekt-README (dreisprachig; Versionshistorie, „How it works“, „Development“) |
| `F:\001_Coding_Projekte\xLoader\description.md` | Greasy-Fork „Zusätzliche Informationen“ (DE → RU → EN) |
| `F:\001_Coding_Projekte\xLoader\ru-board_xloader_post.md` | Ru.Board-Beitragsentwurf (Forum 31, Thread 20664) |
| `F:\001_Coding_Projekte\xLoader\memory\` | Projektgedächtnis (MEMORY.md = Index, FACT.md = Fakten, JOURNAL.jsonl, user_lolo.md) |
| `.reasonix\skills\greasy-fork-release\SKILL.md` | lokales Release-Playbook (auch: `!Wichtiges\Meine _Skills\projekt_weit\xLoader\greasy-fork-release\SKILL.md`) |

## 4. Bekannte Fallstricke

1. **Nie dieselbe Version zweimal veröffentlichen** (GF lehnt identische Versionen ab).
2. **DOM-Fallback-Guard:** gegen `article[data-testid="tweet"]` prüfen, nie gegen den Body-Container `div[data-testid="tweet"]` (v1.0.21-Regression).
3. **Eingebettete Tweets:** Tweet-ID/Handle vom Medien-Element ableiten (v1.0.14).
4. **Kein Live-Token-Retry bei HTTP 429.**
5. **GF-Admin:** zwei Sync-Felder nicht verwechseln (`script[sync_identifier]` = Skript-URL vs. `additional_info_sync` = description.md); „Zusätzliche Informationen“ ≠ Changelog-Textarea.
6. **Manueller GF-Upload:** „Choose File“ befüllt Textarea per Playwright nicht → FileReader-Trick; funktioniert auf greasyfork.org, NICHT auf x.com (CSP).
7. **x.com-CSP:** Inline-Injektion blockt → Skript-Update nur via Tampermonkey-Import/`tm-import.mjs`.
8. **PowerShell-Befehle ohne `$`-Variablen** (Bash-Wrapper strippt sie); GitHub-Release nur mit Windows-`gh`.

## 5. Release-Ablauf (verbindlich, Kurzform)

1. `@version` heben (nie doppelt) + Changelog-Block + Init-Log-Zeile (`log.info('xLoader v1.0.X aktiv …')`, aktuell L1512).
2. `node --check xLoader.user.js` (+ optional DOM-Regressionstest).
3. Archivkopie `Ausgabe/xLoader-v1.0.X.js` (untracked lassen).
4. Commit + Push auf `main` → GF-Webhook (Hook 661732365) aktualisiert automatisch.
5. GF-Verifikation auf der Versionsseite; falls nötig GF-Admin „Jetzt aktualisieren und synchronisieren“.
6. GitHub-Release per PowerShell/Windows-`gh` (Tag `v1.0.X` + `gh release create` mit `xLoader.user.js` + `.release-notes-v1.0.X.md`).
7. Aufräumen (Release-Notes-Datei, temporäre Dateien), `git status` zeigen.

Ausführlich: `FACT.md` → „Build- & Release-Regeln“ bzw. SKILL `greasy-fork-release`.

## 6. Git-/Veröffentlichungsstand

- Git: `main` sauber, HEAD `e71eaae` (v1.0.22-Doku, 05.09.2026); 11 GitHub-Releases.
- Greasy Fork: Skript 589456, Sync automatisch via Webhook.
- Tags: v1.0.6–v1.0.12, v1.0.15, v1.0.16, v1.0.21, v1.0.22 (v1.0.17–v1.0.20 ohne Tag, nur Doku).
