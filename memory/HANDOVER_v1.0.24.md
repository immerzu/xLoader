# HANDOVER v1.0.24 — Release-Snapshot (2026-10-18)

## Stand
- `xLoader.user.js`: `@version 1.0.24`, 1698 Zeilen,
  SHA-256 `FAA9DFFB34D78499C5916A0F36535E9F1F3783FCC0F944AD47A2067F1C105CE4`.
- Ausgabe: `Ausgabe/xLoader-v1.0.24.user.js` — 78.554 Bytes, byte-identisch mit der Quelle.
- Tests: `node --check` exit 0; Fix-Tests 13/13; DOM-Tests 11/11; Watchdog-Tests 19/19.
- Git: Commit/Tag/Release siehe `git log` / `gh release list` (beim Release gesetzt).

## Inhalt v1.0.24
- Zehn lokale Download-Korrekturen: `getHandle` (quoted), Recheck ohne Aktionsleiste,
  lokaler `{items, apiStatus}`-Rückgabewert, gemeinsamer Video-Poster-Resolver,
  einmaliger DOM-Merge, `try/catch/finally` in `onDownloadClick`, `failPrefetch`
  ohne Retry bei 401/403/429, `prefetchSeen`-Freigabe, `gmGet`-Timeout,
  `releaseDetachedTweets`, `scheduleProcess` mit closest-Filter.
- 5-min-Stillstands-Watchdog in `downloadUrl` (`onprogress` setzt zurück, `abort()`,
  klare Timeout-Meldung); kein starrer Gesamt-Timeout.
- Klarere `GM_download`-Fehler: `not_enabled`/`not_permitted`/`not_whitelisted`/
  `not_succeeded` mit Handlungshinweis.
- Doku: README DE/EN/RU, FACT, MEMORY, ru-board-Post; Changelog-Kopf.

## Release
- Commit `e16a6cf` (main = origin/main), Tag `v1.0.24`.
- GitHub-Release: https://github.com/immerzu/xLoader/releases/tag/v1.0.24 — Asset
  `xLoader-v1.0.24.user.js`, 78.554 Bytes, SHA-256 `FAA9DFFB…`.
- Greasy Fork 589456: v1.0.24, Rohdatei 78.530 Bytes, SHA-256 `9F776EF2…`;
  Unterschied nur die GF-eigenen `@updateURL`/`@downloadURL`-Zeilen (bytegenau verifiziert).

## Offen / Einschränkungen
- Echter x.com-Live-Test im portablen Chrome/Yandex: vom Nutzer bestätigt,
  nicht automatisiert nachgestellt.
- FACT-Zeilenangaben: v1.0.23-Basis +15 durch den v1.0.24-Changelog-Block.
