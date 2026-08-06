# xLoader

**English 🇬🇧**

One-click media downloader userscript for X.com/Twitter. Every tweet with media gets a download button; one click opens the native "Save as" dialog with all images, videos and GIFs. Media URLs are prefetched in the background so the dialog appears instantly.

**Deutsch 🇩🇪**

Medien-Downloader-Userscript für X.com/Twitter mit einem Klick. Jeder Tweet mit Medien bekommt einen Download-Button; ein Klick öffnet den nativen „Speichern unter“-Dialog mit allen Bildern, Videos und GIFs. Die Medien-URLs werden im Hintergrund vorgeladen, sodass der Dialog unmittelbar erscheint.

**Русский 🇷🇺**

Пользовательский скрипт для скачивания медиа с X.com/Twitter в один клик. Под каждым твитом с медиа появляется кнопка загрузки; один клик открывает стандартный диалог «Сохранить как» со всеми изображениями, видео и GIF. URL медиа предзагружаются в фоне, поэтому диалог появляется мгновенно.

---

## Installation / Установка

**English 🇬🇧**
1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox).
2. Install the script: open [xLoader.user.js](https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js) — Tampermonkey will offer the installation. (Alternative: clone the repo and import the file via the Tampermonkey dashboard.)
3. Open [x.com](https://x.com) — every tweet with media gets a download button in the action bar.

**Deutsch 🇩🇪**
1. [Tampermonkey](https://www.tampermonkey.net/) installieren (Chrome/Edge/Firefox).
2. Skript installieren: [xLoader.user.js](https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js) öffnen — Tampermonkey bietet die Installation an. (Alternativ: Repo klonen und die Datei im Tampermonkey-Dashboard importieren.)
3. [x.com](https://x.com) öffnen — unter jedem Tweet mit Medien erscheint ein Download-Button in der Aktionsleiste.

**Русский 🇷🇺**
1. Установите [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox).
2. Установите скрипт: откройте [xLoader.user.js](https://raw.githubusercontent.com/immerzu/xLoader/main/xLoader.user.js) — Tampermonkey предложит установку. (Альтернатива: склонируйте репозиторий и импортируйте файл через панель Tampermonkey.)
3. Откройте [x.com](https://x.com) — под каждым твитом с медиа появится кнопка загрузки в панели действий.

## Features / Funktionen / Возможности

**English 🇬🇧**
- **Images, videos and GIFs** — one button per tweet; the **"Save as" dialog appears for the first medium** by default (configurable: all media via the Tampermonkey menu).
- **Instant dialog:** media URLs are prefetched for visible tweets (IntersectionObserver), so the save dialog appears immediately after the click.
- **Reliable URL extraction:** X.com renders videos/GIFs only as posters — xLoader combines the X API (`conversation.json`, live-token retry on auth errors) with the visible DOM media (posters, article-card images `card_img`) and resolves real MP4 URLs via the playback performance buffer.
- **Filenames:** default `@{handle}_{tweetId}_{index}.{ext}` (e.g. `@elonmusk_123456789_1.mp4`) — configurable via the Tampermonkey menu: placeholders `{handle}` `{id}` `{index}` `{ext}` `{date}` `{time}` `{type}`.
- **Layout:** the button is cloned from an existing X.com action-bar button, so it adapts perfectly (desktop and mobile).
- **Tampermonkey menu:** toggle "Save as" mode (first medium only / all media), change the filename template and clear the media cache.
- No tracking, no analytics, no remote dependencies.

**Deutsch 🇩🇪**
- **Bilder, Videos und GIFs** — ein Button pro Tweet; der **„Speichern unter“-Dialog erscheint standardmäßig nur für das erste Medium** (umschaltbar über das Tampermonkey-Menü).
- **Sofortiger Dialog:** Medien-URLs werden für sichtbare Tweets vorgeladen (IntersectionObserver) — der Dialog erscheint unmittelbar nach dem Klick.
- **Zuverlässige URL-Extraktion:** X.com rendert Videos/GIFs nur als Poster — xLoader kombiniert die X-API (`conversation.json`, Live-Token-Retry bei Auth-Fehlern) mit den sichtbaren DOM-Medien (Poster, Artikel-Card-Bilder `card_img`) und löst echte MP4-URLs über den Wiedergabe-Performance-Buffer auf.
- **Dateinamen:** Standard `@{handle}_{tweetId}_{index}.{ext}` (z. B. `@elonmusk_123456789_1.mp4`) — konfigurierbar über das Tampermonkey-Menü: Platzhalter `{handle}` `{id}` `{index}` `{ext}` `{date}` `{time}` `{type}`.
- **Layout:** Der Button wird aus einem vorhandenen X.com-Aktionsleisten-Button geklont und passt sich damit exakt an (Desktop und mobil).
- **Tampermonkey-Menü:** „Speichern unter“-Modus umschalten (nur erstes Medium / alle Medien), Dateinamen-Muster ändern und Medien-Cache leeren.
- Kein Tracking, keine Analyse, keine externen Abhängigkeiten.

**Русский 🇷🇺**
- **Изображения, видео и GIF** — одна кнопка на твит; по умолчанию диалог «Сохранить как» открывается для первого медиа (настраивается: все медиа через меню Tampermonkey).
- **Мгновенный диалог:** URL медиа предзагружаются для видимых твитов (IntersectionObserver) — диалог появляется сразу после клика.
- **Надёжное извлечение URL:** X.com показывает видео/GIF только как постеры — xLoader объединяет X API (`conversation.json`, повторный запрос live-токена при ошибках авторизации) с видимыми DOM-медиа (постеры, изображения карточек статей `card_img`) и определяет реальные MP4-URL через performance buffer воспроизведения.
- **Имена файлов:** по умолчанию `@{handle}_{tweetId}_{index}.{ext}` (например `@elonmusk_123456789_1.mp4`) — настраивается через меню Tampermonkey: плейсхолдеры `{handle}` `{id}` `{index}` `{ext}` `{date}` `{time}` `{type}`.
- **Макет:** кнопка клонируется из существующей кнопки панели действий X.com и идеально подстраивается (десктоп и мобильные).
- **Меню Tampermonkey:** переключение режима «Сохранить как» (только первое медиа / все), смена шаблона имени файла и очистка кэша медиа.
- Нет аналитики, нет внешних зависимостей, нет сервера.

## How it works / Technik / Как это работает

**English 🇬🇧:** Greasemonkey metadata: `@match https://x.com/*` and `https://twitter.com/*`, grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`. Click fallback chain (cache miss): X API → live-token retry → DOM merge (posters, article-card images; video MP4s resolved via the playback performance buffer) → error message. No external dependencies, no server.

**Deutsch 🇩🇪:** Greasemonkey-Metadaten: `@match https://x.com/*` und `https://twitter.com/*`, Grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`. Fallback-Kette beim Klick (Cache-Miss): X-API → Live-Token-Retry → DOM-Merge (Poster, Artikel-Card-Bilder; Video-MP4s über den Performance-Buffer) → Fehlermeldung. Keine externen Abhängigkeiten, keine Server.

**Русский 🇷🇺:** Метаданные Greasemonkey: `@match https://x.com/*` и `https://twitter.com/*`, гранты `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`. Цепочка при клике (кэш-промах): X API → повторный запрос live-токена → объединение DOM (постеры, изображения карточек; видео-MP4 через performance buffer) → сообщение об ошибке. Без внешних зависимостей и серверов.

## Version history / Versionshistorie / История версий

**English 🇬🇧:** Latest version: **v1.0.16** — the full changelog lives in the comment at the top of `xLoader.user.js`.

- **v1.0.16** — configurable filename template (Tampermonkey menu, persisted in localStorage).
- **v1.0.15** — article-card images (`card_img`) + multi-media fix: media-based tweet ID, DOM/API merge with dedup, video MP4 resolver (performance buffer).
- **v1.0.12** — fixes: isMediaUrl regression (v1.0.9), GM_download timeout, no token retry on 429, prefetch retry guard, recheck up to 3×, GIF poster → MP4.
- **v1.0.11** — "NaN%" progress fix; progress badge only for videos ≥ 5 MB.
- **v1.0.10** — progress display fixed: badge element, percent computed from `done`/`total`.
- **v1.0.9** — optimizations: guest-token fix, live-token fallback, prefetch retry, progress display, IntersectionObserver prefetch, error messages, metadata.
- **v1.0.8** — live-token retry also with cached token; re-prefetch after cache invalidation.
- **v1.0.7** — Tampermonkey menu (save-as mode, clear cache), robust tweet-ID extraction.
- **v1.0.6** — renamed to "xLoader" (previously "Downloadhilfe").

**Deutsch 🇩🇪:** Neueste Version: **v1.0.16** — der vollständige Changelog steht im Kommentar oben in `xLoader.user.js`.

- **v1.0.16** — konfigurierbares Dateinamen-Muster (Tampermonkey-Menü, in localStorage gespeichert).
- **v1.0.15** — Artikel-Card-Bilder (`card_img`) + Multi-Medien-Fix: medienbasierte Tweet-ID, DOM/API-Merge mit Dedup, Video-MP4-Resolver (Performance-Buffer).
- **v1.0.12** — Fixes: isMediaUrl-Regression (v1.0.9), GM_download-Timeout, kein Token-Retry bei 429, Prefetch-Retry-Guard, Recheck bis 3×, GIF-Poster → MP4.
- **v1.0.11** — „NaN%“-Fix in der Fortschrittsanzeige; Badge nur noch bei Videos ≥ 5 MB.
- **v1.0.10** — Fortschrittsanzeige repariert: Badge-Element, Prozent aus `done`/`total` berechnet.
- **v1.0.9** — Optimierungen: Guest-Token-Fix, Live-Token-Fallback, Prefetch-Retry, Fortschrittsanzeige, IntersectionObserver-Prefetch, Fehlermeldungen, Metadaten.
- **v1.0.8** — Live-Token-Retry auch bei gecachtem Token; Re-Prefetch nach Cache-Invalidierung.
- **v1.0.7** — Tampermonkey-Menü (Speichern-Modus, Cache leeren), robustere Tweet-ID-Extraktion.
- **v1.0.6** — Umbenennung auf „xLoader“ (zuvor „Downloadhilfe“).

**Русский 🇷🇺:** Последняя версия: **v1.0.16** — полный журнал изменений находится в комментарии в начале `xLoader.user.js`.

- **v1.0.16** — настраиваемый шаблон имени файла (меню Tampermonkey, сохраняется в localStorage).
- **v1.0.15** — изображения карточек статей (`card_img`) + исправление нескольких медиа: ID твита на основе медиа, объединение DOM/API с дедупликацией, резолвер видео-MP4 (performance buffer).
- **v1.0.12** — исправления: регрессия isMediaUrl (v1.0.9), таймаут GM_download, без повторного запроса токена при 429, защита повторного prefetch, повторная проверка до 3×, GIF-постер → MP4.
- **v1.0.11** — исправление «NaN%»; бейдж прогресса только для видео ≥ 5 МБ.
- **v1.0.10** — исправлена индикация прогресса: элемент-бейдж, процент из `done`/`total`.
- **v1.0.9** — оптимизации: исправление guest-токена, запасной live-токен, повторный prefetch, индикация прогресса, prefetch через IntersectionObserver, сообщения об ошибках, метаданные.
- **v1.0.8** — повторный запрос live-токена также с кэшированным токеном; повторный prefetch после инвалидации кэша.
- **v1.0.7** — меню Tampermonkey (режим сохранения, очистка кэша), надёжное извлечение ID твита.
- **v1.0.6** — переименование в «xLoader» (ранее «Downloadhilfe»).

Git tags / Git-Tags / теги: v1.0.6 – v1.0.12, v1.0.15, v1.0.16 (v1.0.13/v1.0.14 never published / wurden nie veröffentlicht / никогда не публиковались). Latest release on [GitHub](https://github.com/immerzu/xLoader/releases) and [Greasy Fork](https://greasyfork.org/de/scripts/589456-xloader).

## License / Lizenz / Лицензия

MIT — see [LICENSE](LICENSE) (or `@license MIT` in the script metadata block). / MIT — siehe [LICENSE](LICENSE) (bzw. `@license MIT` im Skript-Metadatenblock). / MIT — см. [LICENSE](LICENSE) (или `@license MIT` в метаданных скрипта).
