# xLoader

Tampermonkey-Userscript: lädt Medien (Bilder, Videos, GIFs) von X.com/Twitter-Tweets über den nativen **„Speichern unter“**-Dialog herunter.

## Installation

1. [Tampermonkey](https://www.tampermonkey.net/) installieren (Chrome/Edge/Firefox).
2. Skript installieren: [xLoader.user.js](https://raw.githubusercontent.com/xLoader/xLoader/main/xLoader.user.js) öffnen — Tampermonkey bietet die Installation an. (Alternativ: Repo klonen und die Datei im Tampermonkey-Dashboard importieren.)
3. Auf [x.com](https://x.com) öffnen — unter jedem Tweet mit Medien erscheint ein Download-Button in der Aktionsleiste.

## Funktionen

- **Bilder, Videos und GIFs** — ein Button pro Tweet, „Speichern unter“-Dialog pro Medium.
- **Sofortiger Dialog**: Medien-URLs werden im Hintergrund vorgeladen (Prefetch, max. 3 parallele API-Calls), sodass der Dialog unmittelbar nach dem Klick erscheint.
- **Zuverlässige URL-Extraktion**: X.com rendert Videos/GIFs nur als Poster — die echten MP4-URLs kommen über die X-API (`conversation.json`), mit Live-Token-Retry bei Auth-Fehlern.
- **Dateinamen**: `@{handle}_{tweetId}_{index}.{ext}` (z. B. `@elonmusk_123456789_1.mp4`).
- Layout: Der Button wird aus einem vorhandenen X.com-Aktionsleisten-Button geklont und passt sich damit exakt an (Desktop und mobil).

## Technik

- Greasemonkey-Metadaten: `@match https://x.com/*` und `https://twitter.com/*`, Grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`.
- Fallback-Kette beim Klick (Cache-Miss): X-API → Live-Token-Retry → DOM (Bilder) → Fehlermeldung.
- Keine externen Abhängigkeiten, keine Server.

## Lizenz

MIT — siehe [LICENSE](LICENSE) (oder `@license MIT` im Skript-Metadatenblock).
