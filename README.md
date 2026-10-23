# xLoader

**English 🇬🇧**

Media downloader userscript for X.com/Twitter. Recognized tweet media gets a download button. Supported browsers offer an early Save As dialog for the first medium; other media follow the configured save mode. Supported HLS/broadcast recordings, progress display and a cancel confirmation are included.

**Deutsch 🇩🇪**

Medien-Downloader-Userscript für X.com/Twitter. Bei erkannten Medien erscheint ein Download-Button. Unterstützte Browser öffnen den ersten Speicherdialog frühzeitig; weitere Medien folgen dem eingestellten Modus. Unterstützte HLS-/Broadcast-Aufzeichnungen, Fortschrittsanzeige und eine Abbruchbestätigung sind enthalten.

**Русский 🇷🇺**

Скрипт для загрузки медиа с X.com/Twitter. Для распознанных медиа появляется кнопка загрузки. В поддерживаемых браузерах первый диалог сохранения открывается заранее, остальные файлы сохраняются согласно выбранному режиму. Есть поддержка некоторых HLS/трансляций, прогресс и подтверждение отмены.

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

## What's new in v1.0.39 / Neu in v1.0.39 / Новое в v1.0.39

- **EN:** Hardens media integrity, cancellation, URL validation and HLS processing; fixes nested/quoted media, preserves complete multi-media downloads and keeps progress visible while X recycles timeline DOM nodes.
- **DE:** Härtet Medienintegrität, Abbruch, URL-Prüfung und HLS-Verarbeitung; korrigiert verschachtelte/zitierte Medien, erhält vollständige Mehrfachdownloads und hält den Fortschritt beim Timeline-DOM-Recycling sichtbar.
- **RU:** Усилены проверки целостности медиа, отмена, URL и обработка HLS; исправлены вложенные/цитируемые медиа, полная загрузка нескольких файлов и сохранение прогресса при переработке DOM ленты X.

## Features / Funktionen / Возможности

**English 🇬🇧**
- **Images, videos and GIFs** — one button per tweet; the **"Save as" dialog appears for the first medium** by default (configurable: all media via the Tampermonkey menu).
- **Choose first, download afterwards:** supported Chromium browsers open the first file picker before streaming the media to disk. Prefetch reduces metadata lookup time. Without File System Access or an active user gesture, the existing `GM_download` path is used. Subsequent media retain the first/all save modes.
- **Media resolution:** combines cached/rendered tweet metadata, the X API, visible media and progressive/HLS/broadcast candidates. Only supported recording formats are assembled; manifests and initialization segments are not standalone videos.
- **Filenames:** default `@{handle}_{id}_{index}.{ext}` (e.g. `@elonmusk_123456789_1.mp4`) — configurable via the Tampermonkey menu: placeholders `{handle}` `{id}` `{index}` `{ext}` `{date}` `{time}` `{type}`.
- **Layout:** the button is cloned from an existing X.com action-bar button, so it adapts perfectly (desktop and mobile).
- **Tampermonkey menu:** toggle "Save as" mode (first medium only / all media), change the filename template and clear the media cache.
- No tracking, no analytics, no remote dependencies.

**Deutsch 🇩🇪**
- **Bilder, Videos und GIFs** — ein Button pro Tweet; der **„Speichern unter“-Dialog erscheint standardmäßig nur für das erste Medium** (umschaltbar über das Tampermonkey-Menü).
- **Erst auswählen, dann herunterladen:** unterstützte Chromium-Browser öffnen die erste Dateiauswahl vor dem Streaming auf die Festplatte. Prefetch verkürzt die Metadatensuche. Ohne File System Access oder aktive Benutzeraktion greift der bisherige `GM_download`-Pfad. Weitere Medien behalten die Speicheroptionen first/all.
- **Medienauflösung:** kombiniert Cache/gerenderte Tweet-Metadaten, X-API, sichtbare Medien und progressive/HLS-/Broadcast-Kandidaten. Nur unterstützte Aufzeichnungen werden zusammengesetzt; Manifeste und Initialisierungssegmente sind keine eigenständigen Videos.
- **Dateinamen:** Standard `@{handle}_{id}_{index}.{ext}` (z. B. `@elonmusk_123456789_1.mp4`) — konfigurierbar über das Tampermonkey-Menü: Platzhalter `{handle}` `{id}` `{index}` `{ext}` `{date}` `{time}` `{type}`.
- **Layout:** Der Button wird aus einem vorhandenen X.com-Aktionsleisten-Button geklont und passt sich damit exakt an (Desktop und mobil).
- **Tampermonkey-Menü:** „Speichern unter“-Modus umschalten (nur erstes Medium / alle Medien), Dateinamen-Muster ändern und Medien-Cache leeren.
- Kein Tracking, keine Analyse, keine externen Abhängigkeiten.

**Русский 🇷🇺**
- **Изображения, видео и GIF** — одна кнопка на твит; по умолчанию диалог «Сохранить как» открывается для первого медиа (настраивается: все медиа через меню Tampermonkey).
- **Сначала выбор файла, затем загрузка:** поддерживаемые Chromium-браузеры открывают первый диалог до потоковой записи на диск. Предзагрузка ускоряет поиск URL. Без File System Access или активного действия пользователя используется прежний путь `GM_download`. Для остальных медиа сохраняются режимы first/all.
- **Поиск медиа:** используются кэш, метаданные отображаемого твита, X API, видимые медиа и progressive/HLS/трансляции. Собираются только поддерживаемые записи; манифесты и начальные сегменты не являются самостоятельными видео.
- **Имена файлов:** по умолчанию `@{handle}_{id}_{index}.{ext}` (например `@elonmusk_123456789_1.mp4`) — настраивается через меню Tampermonkey: плейсхолдеры `{handle}` `{id}` `{index}` `{ext}` `{date}` `{time}` `{type}`.
- **Макет:** кнопка клонируется из существующей кнопки панели действий X.com и идеально подстраивается (десктоп и мобильные).
- **Меню Tampermonkey:** переключение режима «Сохранить как» (только первое медиа / все), смена шаблона имени файла и очистка кэша медиа.
- Нет аналитики, нет внешних зависимостей, нет сервера.

## How it works / Technik / Как это работает

**English 🇬🇧:** Greasemonkey metadata: `@match https://x.com/*` and `https://twitter.com/*`; grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`; `@connect` for `x.com`, `twitter.com`, `pbs.twimg.com`, `video.twimg.com`, `abs.twimg.com`, `pscp.tv`; `@noframes`, `@run-at document-end`, auto-update via `@updateURL`/`@downloadURL` (raw GitHub `main`). Media resolution uses cached/rendered metadata, the X API and DOM/progressive/HLS/broadcast fallbacks. No external dependencies, no server.

**Deutsch 🇩🇪:** Greasemonkey-Metadaten: `@match https://x.com/*` und `https://twitter.com/*`; Grants `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`; `@connect` für `x.com`, `twitter.com`, `pbs.twimg.com`, `video.twimg.com`, `abs.twimg.com`, `pscp.tv`; `@noframes`, `@run-at document-end`, Auto-Update via `@updateURL`/`@downloadURL` (raw GitHub `main`). Medienauflösung über Cache/gerenderte Metadaten, X-API und DOM-/progressive/HLS-/Broadcast-Fallbacks. Keine externen Abhängigkeiten, keine Server.

**Русский 🇷🇺:** Метаданные Greasemonkey: `@match https://x.com/*` и `https://twitter.com/*`; гранты `GM_download`, `GM_addStyle`, `GM_xmlhttpRequest`, `GM_registerMenuCommand`; `@connect` для `x.com`, `twitter.com`, `pbs.twimg.com`, `video.twimg.com`, `abs.twimg.com`, `pscp.tv`; `@noframes`, `@run-at document-end`, автообновление через `@updateURL`/`@downloadURL` (raw GitHub `main`). Медиа определяются через кэш/метаданные, X API и DOM/progressive/HLS/трансляции. Без внешних зависимостей и серверов.

## Version history / Versionshistorie / История версий

**English 🇬🇧:** Latest version: **v1.0.39** — the full changelog lives in the comment at the top of `xLoader.user.js`.

- **v1.0.39** — hardened media/HLS integrity and cancellation, fixed nested/quoted media, complete multi-media downloads, and persistent progress across timeline DOM recycling.

- **v1.0.33** — supported HLS/Player-Card/broadcast recordings, MPEG-TS output, progress and confirmed cancellation on a second click.

- **v1.0.26** — save dialog before media transfer; correct streaming startup, timeout handling and completion prevent empty first video files. The user confirmed the fast dialog and both saved videos on Windows.

- **v1.0.25 (local only)** — first file picker before DOM/video merge and media transfer; streaming write with progress, stall watchdog and error cleanup. Existing filenames, multi-media options and `GM_download` fallback remain. The user confirmed the faster dialog in their browser; no automated native dialog timing is claimed.

- **v1.0.24** — download fixes: quoted-tweet handle, recheck without action bar, local API status, shared video resolver, single DOM merge; robust error handling and a 5-minute stall watchdog; clearer `GM_download` errors. Tested: 13/13 fix, 11/11 DOM, 19/19 watchdog tests; portable Chrome and Yandex (Browser API).

- **v1.0.23** — short description localized: German default `@description` (= Greasy Fork script locale `de`) + `@description:en` + `@description:ru` — the script is now findable in the Greasy Fork search under DE/EN/RU (GF language filter; the previous one-line DE/EN/RU mix made it visible only in the German search).
- **v1.0.22** — project move: repository now lives under `F:\001_Coding_Projekte\xLoader` (previously `Downloadhilfe`); all paths/refs (skills, memory, docs) updated accordingly. README: placeholder corrected (`{id}` instead of `{tweetId}`), „How it works“ extended (`@connect`/`@noframes`/`@run-at`/`@updateURL`), new „Development“ section (trilingual). ru-board post: version bumped to v1.0.21.
- **v1.0.21** — DOM-fallback fix: `extractDomMedia` discarded all media of the own tweet (the guard checked the body container `div[data-testid="tweet"]` instead of embedded tweets); DOM fallback and `mergeDomItems` work again.
- **v1.0.20** — short description now trilingual DE/EN/RU in `@description` (`:de`/`:ru` lines removed).
- **v1.0.19** — metadata descriptions unified to the Greasy Fork i18n format (EN + `@description:de` + `@description:ru`).
- **v1.0.18** — trilingual description EN/DE/RU (`@description` + `description.md` for Greasy Fork).
- **v1.0.17** — bilingual description (`@description` EN+DE) for the Greasy Fork script page.
- **v1.0.16** — configurable filename template (Tampermonkey menu, persisted in localStorage).
- **v1.0.15** — article-card images (`card_img`) + multi-media fix: media-based tweet ID, DOM/API merge with dedup, video MP4 resolver (performance buffer).
- **v1.0.12** — fixes: isMediaUrl regression (v1.0.9), GM_download timeout, no token retry on 429, prefetch retry guard, recheck up to 3×, GIF poster → MP4.
- **v1.0.11** — "NaN%" progress fix; progress badge only for videos ≥ 5 MB.
- **v1.0.10** — progress display fixed: badge element, percent computed from `done`/`total`.
- **v1.0.9** — optimizations: guest-token fix, live-token fallback, prefetch retry, progress display, IntersectionObserver prefetch, error messages, metadata.
- **v1.0.8** — live-token retry also with cached token; re-prefetch after cache invalidation.
- **v1.0.7** — Tampermonkey menu (save-as mode, clear cache), robust tweet-ID extraction.
- **v1.0.6** — renamed to "xLoader" (previously "Downloadhilfe").

**Deutsch 🇩🇪:** Neueste veröffentlichte Version: **v1.0.39** — der vollständige Changelog steht im Kommentar oben in `xLoader.user.js`.

- **v1.0.39** — Medien-/HLS-Integrität und Abbruch gehärtet, verschachtelte/zitierte Medien korrigiert, vollständige Mehrfachdownloads sowie dauerhafte Fortschrittsanzeige beim Timeline-DOM-Recycling.

- **v1.0.33** — unterstützte HLS-/Player-Card-/Broadcast-Aufzeichnungen, MPEG-TS-Ausgabe, Fortschritt und bestätigter Abbruch per erneutem Klick.

- **v1.0.26** — Dateiauswahl vor dem Datentransfer; korrigierter Streamstart, Timeout und Abschluss verhindern leere erste Videodateien. Der Nutzer bestätigt unter Windows den schnellen Dialog und beide gespeicherten Videos.

- **v1.0.25 (nur lokal)** — erste Dateiauswahl vor DOM-/Video-Merge und Datentransfer; Streaming mit Fortschritt, Stillstands-Watchdog und Fehlerbereinigung. Dateinamen, Mehrfachmedienoptionen und `GM_download`-Fallback bleiben erhalten. Der Nutzer hat den schnellen Dialog im Browser bestätigt; keine automatisch gemessenen nativen Dialogzeiten.

- **v1.0.24** — Download-Fixes: quoted-Tweet-Handle, Recheck ohne Aktionsleiste, lokaler API-Status, gemeinsamer Video-Resolver, einmaliger DOM-Merge; robuste Fehlerbehandlung und 5-Minuten-Stillstands-Watchdog; klarere `GM_download`-Fehler. Getestet: 13/13 Fix-, 11/11 DOM-, 19/19 Watchdog-Tests; portabler Chrome und Yandex (Browser-API).

- **v1.0.23** — Kurzbeschreibung lokalisiert: deutsche Default-`@description` (= GF-Skript-Locale `de`) + `@description:en` + `@description:ru` — das Skript ist damit in der Greasy-Fork-Suche unter DE/EN/RU auffindbar (GF-Sprachfilter; die bisherige einzeilige DE/EN/RU-Mischbeschreibung machte es nur in der deutschen Suche sichtbar).
- **v1.0.22** — Projekt-Umzug: Repository liegt jetzt unter `F:\001_Coding_Projekte\xLoader` (vorher `Downloadhilfe`); alle Pfade/Verweise (Skills, Memory, Doku) entsprechend aktualisiert. README: Platzhalter korrigiert (`{id}` statt `{tweetId}`), „How it works“ erweitert (`@connect`/`@noframes`/`@run-at`/`@updateURL`), neuer Abschnitt „Development“ (dreisprachig). ru-board-Post: Versionsstand auf v1.0.21 aktualisiert.
- **v1.0.21** — DOM-Fallback-Fix: `extractDomMedia` verwarf alle Medien des eigenen Tweets (der Guard prüfte den Body-Container `div[data-testid="tweet"]` statt eingebettete Tweets); DOM-Fallback und `mergeDomItems` funktionieren wieder.
- **v1.0.20** — Kurzbeschreibung jetzt dreisprachig DE/EN/RU in `@description` (`:de`/`:ru`-Zeilen entfernt).
- **v1.0.19** — Metablock-Beschreibungen auf das Greasy-Fork-i18n-Format vereinheitlicht (EN + `@description:de` + `@description:ru`).
- **v1.0.18** — Dreisprachige Beschreibung EN/DE/RU (`@description` + `description.md` für Greasy Fork).
- **v1.0.17** — Zweisprachige Beschreibung (`@description` EN+DE) für die Greasy-Fork-Skriptseite.
- **v1.0.16** — konfigurierbares Dateinamen-Muster (Tampermonkey-Menü, in localStorage gespeichert).
- **v1.0.15** — Artikel-Card-Bilder (`card_img`) + Multi-Medien-Fix: medienbasierte Tweet-ID, DOM/API-Merge mit Dedup, Video-MP4-Resolver (Performance-Buffer).
- **v1.0.12** — Fixes: isMediaUrl-Regression (v1.0.9), GM_download-Timeout, kein Token-Retry bei 429, Prefetch-Retry-Guard, Recheck bis 3×, GIF-Poster → MP4.
- **v1.0.11** — „NaN%“-Fix in der Fortschrittsanzeige; Badge nur noch bei Videos ≥ 5 MB.
- **v1.0.10** — Fortschrittsanzeige repariert: Badge-Element, Prozent aus `done`/`total` berechnet.
- **v1.0.9** — Optimierungen: Guest-Token-Fix, Live-Token-Fallback, Prefetch-Retry, Fortschrittsanzeige, IntersectionObserver-Prefetch, Fehlermeldungen, Metadaten.
- **v1.0.8** — Live-Token-Retry auch bei gecachtem Token; Re-Prefetch nach Cache-Invalidierung.
- **v1.0.7** — Tampermonkey-Menü (Speichern-Modus, Cache leeren), robustere Tweet-ID-Extraktion.
- **v1.0.6** — Umbenennung auf „xLoader“ (zuvor „Downloadhilfe“).

**Русский 🇷🇺:** Последняя версия: **v1.0.39** — полный журнал изменений находится в комментарии в начале `xLoader.user.js`.

- **v1.0.39** — усилена целостность медиа/HLS и отмена, исправлены вложенные/цитируемые медиа, полная загрузка нескольких файлов и сохранение прогресса при переработке DOM.

- **v1.0.33** — поддерживаемые HLS/Player Card/трансляции, вывод MPEG-TS, прогресс и подтверждение отмены при повторном нажатии.

- **v1.0.26** — выбор файла до передачи данных; исправлены запуск потока, таймаут и завершение загрузки первого видео. Пользователь подтвердил быстрый диалог и сохранение обоих видео в Windows.

- **v1.0.25 (только локально)** — первый выбор файла до DOM/video-merge и передачи данных; потоковая запись с прогрессом, watchdog и обработкой ошибок. Сохранены имена файлов, режимы нескольких медиа и запасной `GM_download`. Пользователь подтвердил быстрый диалог в браузере; автоматический замер нативного диалога не проводился.

- **v1.0.24** — исправления загрузки: handle для quoted-твитов, повторная проверка без панели действий, локальный статус API, общий видео-резолвер, однократный DOM-merge; надёжная обработка ошибок и 5-минутный watchdog; понятные ошибки `GM_download`. Проверено: 13/13 fix, 11/11 DOM, 19/19 watchdog; портативный Chrome и Yandex (Browser API).

- **v1.0.23** — Краткое описание локализовано: немецкое описание по умолчанию `@description` (= локаль скрипта Greasy Fork `de`) + `@description:en` + `@description:ru` — скрипт теперь находится в поиске Greasy Fork на DE/EN/RU (языковой фильтр GF; прежнее однострочное DE/EN/RU-описание делало его видимым только в немецком поиске).
- **v1.0.22** — перенос проекта: репозиторий теперь находится в `F:\001_Coding_Projekte\xLoader` (ранее `Downloadhilfe`); все пути/ссылки (скиллы, память, документация) обновлены. README: исправлен плейсхолдер (`{id}` вместо `{tweetId}`), раздел «How it works» расширен (`@connect`/`@noframes`/`@run-at`/`@updateURL`), добавлен раздел «Development» (трёхъязычный). Пост на Ru.Board: версия обновлена до v1.0.21.
- **v1.0.21** — Исправление DOM-запасного пути: `extractDomMedia` отбрасывал все медиа собственного твита (проверка смотрела на контейнер `div[data-testid="tweet"]`, а не на встроенные твиты); DOM-запасной путь и `mergeDomItems` снова работают.
- **v1.0.20** — Краткое описание теперь на трёх языках DE/EN/RU в `@description` (строки `:de`/`:ru` удалены).
- **v1.0.19** — Описания в метаблоке приведены к формату i18n Greasy Fork (EN + `@description:de` + `@description:ru`).
- **v1.0.18** — Трёхъязычное описание EN/DE/RU (`@description` + `description.md` для Greasy Fork).
- **v1.0.17** — Двуязычное описание (`@description` EN+DE) для страницы скрипта на Greasy Fork.
- **v1.0.16** — настраиваемый шаблон имени файла (меню Tampermonkey, сохраняется в localStorage).
- **v1.0.15** — изображения карточек статей (`card_img`) + исправление нескольких медиа: ID твита на основе медиа, объединение DOM/API с дедупликацией, резолвер видео-MP4 (performance buffer).
- **v1.0.12** — исправления: регрессия isMediaUrl (v1.0.9), таймаут GM_download, без повторного запроса токена при 429, защита повторного prefetch, повторная проверка до 3×, GIF-постер → MP4.
- **v1.0.11** — исправление «NaN%»; бейдж прогресса только для видео ≥ 5 МБ.
- **v1.0.10** — исправлена индикация прогресса: элемент-бейдж, процент из `done`/`total`.
- **v1.0.9** — оптимизации: исправление guest-токена, запасной live-токен, повторный prefetch, индикация прогресса, prefetch через IntersectionObserver, сообщения об ошибках, метаданные.
- **v1.0.8** — повторный запрос live-токена также с кэшированным токеном; повторный prefetch после инвалидации кэша.
- **v1.0.7** — меню Tampermonkey (режим сохранения, очистка кэша), надёжное извлечение ID твита.
- **v1.0.6** — переименование в «xLoader» (ранее «Downloadhilfe»).

Git tags / Git-Tags / теги: v1.0.6 – v1.0.12, v1.0.15, v1.0.16, v1.0.21, v1.0.22, v1.0.23, v1.0.24, v1.0.26, v1.0.33, v1.0.39 (v1.0.25 was local only / war nur lokal / была только локальной; v1.0.13/v1.0.14 never published / wurden nie veröffentlicht / никогда не публиковались; v1.0.17–v1.0.20 were documentation-only updates without a tag / waren reine Beschreibungs-Updates ohne Tag / были только обновлениями описания без тега). Latest release on [GitHub](https://github.com/immerzu/xLoader/releases) and [Greasy Fork](https://greasyfork.org/de/scripts/589456-xloader).

## Development / Entwicklung / Разработка

Published source / veröffentlichte Quelle: **v1.0.39**. It retains the previous media support, hardens download integrity and cancellation, restores progress after timeline DOM recycling, rejects cross-tweet button reuse, prunes detached bindings and mirrors progress across visible representations; see [HANDOVER v1.0.39](memory/HANDOVER_v1.0.39.md). Earlier test builds remain historical local archives.

**English 🇬🇧:** Edit [xLoader.user.js](xLoader.user.js); its opening comment is the authoritative changelog. There is no compilation step or npm dependency installation. Tests use Node.js built-ins (checked with Node.js 22.23.2). Run the syntax check below from the project root. Archives and evidence belong in ignored `Ausgabe/`. Release steps require explicit permission; see [FACT.md](memory/FACT.md).

**Deutsch 🇩🇪:** Arbeitsdatei ist [xLoader.user.js](xLoader.user.js); der Kommentar am Anfang enthält den maßgeblichen Changelog. Kein Kompilieren oder Installieren von npm-Abhängigkeiten nötig. Tests verwenden Node.js-Bordmittel (geprüft mit Node.js 22.23.2). Die folgende Syntaxprüfung im Projektstamm ausführen. Versionsarchive und Prüfnachweise gehören nach `Ausgabe/` (ignoriert). Release-Schritte benötigen ausdrückliche Freigabe; Ablauf in [FACT.md](memory/FACT.md).

**Русский 🇷🇺:** Исходник — [xLoader.user.js](xLoader.user.js); основной журнал изменений находится в начальном комментарии. Компиляция и установка npm-зависимостей не нужны. Тесты используют встроенные модули Node.js (проверено с Node.js 22.23.2). Проверка синтаксиса ниже выполняется из корня проекта. Архивы и результаты проверок хранятся в игнорируемом `Ausgabe/`. Публикация требует явного разрешения; порядок — в [FACT.md](memory/FACT.md).

```powershell
node --check xLoader.user.js
```

The v1.0.34-dev hardening and later fixes remain documented in their handovers. v1.0.39 passed 75 local tests and was user-verified under Windows/Tampermonkey for progress and complete multi-media downloads. Publication evidence is recorded in [HANDOVER v1.0.39](memory/HANDOVER_v1.0.39.md); earlier v1.0.33 evidence remains in [HANDOVER v1.0.33](memory/HANDOVER_v1.0.33.md).

| Path / Pfad / Путь | Purpose / Zweck / Назначение |
|---|---|
| [xLoader.user.js](xLoader.user.js) | Source, metadata and full changelog / Quelle, Metadaten und Changelog |
| [tests/](tests/) | Local regression tests / lokale Regressionstests |
| [description.md](description.md) | Greasy Fork additional-info sync source, DE → RU → EN |
| [memory/MEMORY.md](memory/MEMORY.md) | Current instructions and historical handovers / Projektgedächtnis |
| [ru-board_xloader_post.md](ru-board_xloader_post.md) | Historical forum draft, v1.0.24; review before reuse / historischer Entwurf |
| `Ausgabe/` | Ignored version archives, backups and evidence; not part of a fresh clone |

Local cleanup candidates and retained artifacts: [CLEANUP_2026-10-21.md](memory/CLEANUP_2026-10-21.md). Historical handovers retain the facts from their respective dates; the current starting point is the memory index.

## License / Lizenz / Лицензия

MIT — see [LICENSE](LICENSE) (or `@license MIT` in the script metadata block). / MIT — siehe [LICENSE](LICENSE) (bzw. `@license MIT` im Skript-Metadatenblock). / MIT — см. [LICENSE](LICENSE) (или `@license MIT` в метаданных скрипта).
