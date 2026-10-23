# xLoader v1.0.35-dev — lokale Testfassung

Stand: 2026-10-23. Nicht veröffentlicht und noch nicht vom Nutzer im Browser abgenommen.

## Behobene Regression

Beim Tweet `2113396033896268085` liegt das sichtbare Video im verschachtelten
zitierten Tweet. Die Syndication-Antwort enthält dort vollständige
`mediaDetails`, daneben aber unvollständige `entities.media` ohne Videoquelle.
Die vorherige lokale Fassung übernahm stattdessen das
`amplify_video_thumb`-Vorschaubild und bot deshalb eine JPG-Datei an.

v1.0.35-dev priorisiert vollständige `mediaDetails`, folgt verschachtelten
`quoted_tweet`-/GraphQL-Ergebnissen und verwirft ungelöste Video-Poster als
Downloadmedium. Die Härtung aus v1.0.34-dev bleibt enthalten.

## Nachweise

- Syntaxprüfung erfolgreich.
- Gesamte lokale Node.js-Suite: 70 Subtests, 0 Fehler.
- Vollständige aktuelle Syndication-Antwort des Referenz-Tweets durch den
  finalen Parser geprüft: ausgewählt wird die progressive MP4-Variante
  1280 × 718 statt des JPG-Posters.
- Direkter Quellenabruf: HTTP 200, `video/mp4`, 22.847.955 Bytes.
- ffprobe: MP4, H.264 1280 × 718, AAC, 140,039 Sekunden.
- Quellenprüfdatei SHA-256:
  `7B8F953EB2EAA5F2767AC0DBBE2CCF524569C9D3674D1854F45579E56E9729AD`.
- Installierbare Testfassung:
  `F:\001_Coding_Projekte\xLoader\Ausgabe\xLoader-v1.0.35-dev.user.js`,
  158.676 Bytes, SHA-256
  `99E78F1C4A0091C4F8966FBFCD4B05F8795DBAE89C119FEA41060FF9F4ADD3D7`.
  Sie ist byteidentisch mit `xLoader.user.js`.

Diese Prüfungen belegen Quellenauswahl, Übertragbarkeit und Medienintegrität.
Ein echter Tampermonkey-/Windows-Download der neuen Testfassung ist noch offen.
