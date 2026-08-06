## xLoader — Media downloader for X.com/Twitter

**English:**

xLoader adds a download button to every tweet with media on X.com/Twitter. One click downloads all media (images, videos, GIFs) via the native "Save as" dialog.

- **Images, videos and GIFs** — including multi-media posts, quoted/linked tweets and article-card images
- **Instant dialog:** media URLs are prefetched for visible tweets (IntersectionObserver), so the save dialog appears immediately
- **Live bearer-token retry** — keeps working when X rotates its API tokens; no third-party servers
- **Real MP4 URLs** that the API hides are resolved via the playback performance buffer
- **Configurable filename template** in the Tampermonkey menu: `{handle} {id} {index} {ext} {date} {time} {type}`
- No tracking, no analytics, no remote dependencies

Install (Greasy Fork): https://greasyfork.org/scripts/589456-xloader
Source (GitHub): https://github.com/immerzu/xLoader
License: MIT

---

**Deutsch:**

xLoader fügt unter jedem Tweet mit Medien auf X.com/Twitter einen Download-Button ein. Ein Klick lädt alle Medien (Bilder, Videos, GIFs) über den nativen „Speichern unter"-Dialog herunter.

- **Bilder, Videos und GIFs** — inklusive Tweets mit mehreren Medien, zitierten/verlinkten Tweets und Artikel-Card-Bildern
- **Sofortiger Dialog:** Medien-URLs werden für sichtbare Tweets vorgeladen (IntersectionObserver), sodass der Dialog unmittelbar erscheint
- **Live-Bearer-Token-Retry** — funktioniert weiter, wenn X seine API-Tokens rotiert; keine Drittanbieter-Server
- **Echte MP4-URLs**, die die API versteckt, werden über den Wiedergabe-Performance-Buffer aufgelöst
- **Konfigurierbares Dateinamen-Muster** im Tampermonkey-Menü: `{handle} {id} {index} {ext} {date} {time} {type}`
- Kein Tracking, keine Analyse, keine externen Abhängigkeiten

Installation (Greasy Fork): https://greasyfork.org/scripts/589456-xloader
Quellcode (GitHub): https://github.com/immerzu/xLoader
Lizenz: MIT
