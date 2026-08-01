# xLoader

**English:** Tampermonkey userscript that downloads media (images, videos, GIFs) from X.com/Twitter tweets via the native **"Save as"** dialog. Media URLs are prefetched in the background, so the dialog opens instantly after clicking the download button.

**Deutsch:** Tampermonkey-Userscript, das Medien (Bilder, Videos, GIFs) von X.com/Twitter-Tweets über den nativen **„Speichern unter“**-Dialog herunterlädt. Die Medien-URLs werden im Hintergrund vorgeladen, sodass der Dialog unmittelbar nach dem Klick erscheint.

---

## Installation / Installation

**English:**
1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox).
2. Install the script: open [xLoader.user.js](https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js) — Tampermonkey will offer the installation. (Alternative: clone the repo and import the file via the Tampermonkey dashboard.)
3. Open [x.com](https://x.com) — every tweet with media gets a download button in the action bar.

**Deutsch:**
1. [Tampermonkey](https://www.tampermonkey.net/) installieren (Chrome/Edge/Firefox).
2. Skript installieren: [xLoader.user.js](https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js) öffnen — Tampermonkey bietet die Installation an. (Alternativ: Repo klonen und die Datei im Tampermonkey-Dashboard importieren.)
3. [x.com](https://x.com) öffnen — unter jedem Tweet mit Medien erscheint ein Download-Button in der Aktionsleiste.

## Features / Funktionen

**English:**
- **Images, videos and GIFs** — one button per tweet; the **"Save as" dialog appears for the first medium** by default (configurable: all media via the Tampermonkey menu).
- **Instant dialog:** media URLs are prefetched in the background (max. 3 parallel API calls), so the dialog appears immediately after the click.
- **Reliable URL extraction:** X.com renders videos/GIFs only as posters — the real MP4 URLs come from the X API (`conversation.json`), with live-token retry on auth errors.
- **Filenames:** `@{handle}_{tweetId}_{index}.{ext}` (e.g. `@elonmusk_123456789_1.mp4`).
- **Layout:** the button is cloned from an existing X.com action-bar button, so it adapts perfectly (desktop and mobile).
- **Tampermonkey menu:** toggle "Save as" mode (first medium only / all media) and clear the media cache.

**Deutsch:**
- **Bilder, Videos und GIFs** — ein Button pro Tweet; der **„Speichern unter“-Dialog erscheint standardmäßig nur für das erste Medium** (umschaltbar über das Tampermonkey-Menü).
- **Sofortiger Dialog:** Medien-URLs werden im Hintergrund vorgeladen (max. 3 parallele API-Calls), sodass der Dialog unmittelbar nach dem Klick erscheint.
- **Zuverlässige URL-Extraktion:** X.com rendert Videos/GIFs nur als Poster — die echten MP4-URLs kommen über die X-API (`conversation.json`), mit Live-Token-Retry bei Auth-Fehlern.
- **Dateinamen:** `@{handle}_{tweetId}_{index}.{ext}` (z. B. `@elonmusk_123456789_1.mp4`).
- **Layout:** Der Button wird aus einem vorhandenen X.com-Aktionsleisten-Button geklont und passt sich damit exakt an (Desktop und mobil).
- **Tampermonkey-Menü:** „Speichern unter“-Modus umschalten (nur erstes Medium / alle Medien) und Medien-Cache leeren.

## Technical / Technik

**English:** Greasemonkey metadata: `@match https://x.com/*` and `https://twitter.com/*`, grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`. Click fallback chain (cache miss): X API → live-token retry → DOM (images) → error message. No external dependencies, no server.

**Deutsch:** Greasemonkey-Metadaten: `@match https://x.com/*` und `https://twitter.com/*`, Grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`. Fallback-Kette beim Klick (Cache-Miss): X-API → Live-Token-Retry → DOM (Bilder) → Fehlermeldung. Keine externen Abhängigkeiten, keine Server.

## License / Lizenz

MIT — see [LICENSE](LICENSE) (or `@license MIT` in the script metadata block). / MIT — siehe [LICENSE](LICENSE) (bzw. `@license MIT` im Skript-Metadatenblock).
