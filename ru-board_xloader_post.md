# Ru.Board — Beitragsentwurf für xLoader (Russisch)

> Ziel: Forum 31 «Web-программирование» — entweder als **новый топик** (eigener Thread)
> oder als **Antwort im Thread** «Готовые скрипты для Violentmonkey / Tampermonkey» (topic=20659).
> Sprache: Russisch (Forum-Sprache). Muster wie im etablierten Userscript-Thread: Beschreibung + Code/Links.

---

## Заголовок (Vorschlag für neuen Thread)

**xLoader — скачивание медиа (фото, видео, GIF) с X.com/Twitter в один клик (Tampermonkey)**

## Текст

**xLoader** — бесплатный юзерскрипт с открытым исходным кодом (MIT) для Tampermonkey.
Он добавляет кнопку загрузки под каждый твит с медиа на X.com/Twitter: один клик — и
открывается стандартный диалог «Сохранить как» со всеми медиафайлами твита.

**Возможности:**
- 📷 Скачивание изображений, видео и GIF из любого твита — включая твиты с несколькими
  медиа, цитируемые/прикреплённые твиты и изображения из карточек статей (`card_img`);
- ⚡ Фоновая предзагрузка URL медиа (только для видимых твитов, через IntersectionObserver) —
  диалог сохранения появляется мгновенно;
- 🔄 Автоматический повторный запрос live-токена — скрипт продолжает работать, когда X
  меняет свои API-токены; без сторонних серверов и без трекинга;
- 🎞️ Определяет реальные MP4-URL для видео, которые API не отдаёт (через performance buffer);
- 📝 Настраиваемый шаблон имени файла в меню Tampermonkey:
  `{handle} {id} {index} {ext} {date} {time} {type}`, по умолчанию `@{handle}_{id}_{index}.{ext}`;
- 🚫 Нет аналитики, нет внешних зависимостей, нет сервера.

**Почему я его написал:** существующие загрузчики либо ломались после изменений API X,
либо не справлялись с краевыми случаями (цитаты, карточки статей, скрытые видео-MP4).
xLoader активно поддерживается — текущая версия **v1.0.21**.

**Установка (Greasy Fork):** https://greasyfork.org/de/scripts/589456-xloader
**Исходный код (GitHub):** https://github.com/immerzu/xLoader
**Лицензия:** MIT

Отзывы, пожелания и сообщения об ошибках приветствуются!

---

## Hinweise fürs Posten
- **Account nötig:** Ru.Board verlangt Registrierung; im Playwright-Browser ist bisher KEIN
  Ru.Board-Login vorhanden (Posten also nur manuell oder nach Login).
- **Kein reiner Link-Post:** Werbung wird streng moderiert — immer mit Beschreibung posten
  (siehe Text oben). Falls gewünscht, kann zusätzlich der Userscript-Metadatenblock
  (`==UserScript== …`) als Code-Block in den Beitrag, wie es im Thread üblich ist.
- **Kein Cross-Posting:** gleichen Text nicht zusätzlich in anderen Foren/Threads posten.
- Moderator des Forums: **Cheery**.
