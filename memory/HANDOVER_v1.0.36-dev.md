# xLoader v1.0.36-dev — lokale Testfassung

Stand: 2026-10-23. Nicht veröffentlicht und noch nicht im echten Browser abgenommen.

## Fortschrittskorrektur

Der bisherige Code erzeugte das Badge erst, wenn ein Fortschrittsereignis eine
endliche Gesamtgröße von mindestens 5 MiB meldete. Tampermonkeys
`GM_download` liefert im Browser-API-/Native-Modus je nach Browser keine
Fortschrittsereignisse oder keine brauchbare Gesamtgröße. Dadurch blieb die
Anzeige auch bei großen Videos vollständig unsichtbar.

v1.0.36-dev zeigt für jeden gestarteten Videotransfer sofort `…`. Bei einer
bekannten Gesamtgröße ab 5 MiB wechselt das Badge auf Prozent. Bei bekannter
kleinerer Größe wird es wie bisher ausgeblendet. HLS-/Segmentfortschritt bleibt
prozentual; das Badge verschwindet weiterhin bei Abschluss, Fehler oder Abbruch.

## Nachweise

- Syntaxprüfung erfolgreich.
- Gesamte lokale Suite: 72 Subtests, 0 Fehler.
- Gezielte Fälle: GM_download ohne Gesamtgröße zeigt `…`; ein Transfer mit
  25/50 MB wechselt auf `50%`; kein `NaN%`.
- Installierbare Testfassung:
  `F:\001_Coding_Projekte\xLoader\Ausgabe\xLoader-v1.0.36-dev.user.js`,
  159.920 Bytes, SHA-256
  `A0B5EA9350416A8E6B2B663B3FCC1C15F47F2A8B3064E5C6FACE7E6571FD4D75`.
  Sie ist byteidentisch mit `xLoader.user.js`.
