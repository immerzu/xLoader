# xLoader v1.0.38-dev — lokale Testfassung

Stand: 2026-10-23. Nicht veröffentlicht und noch nicht im echten Browser abgenommen.

## Teilweises Timeline-DOM-Recycling

Der v1.0.37-dev-Fix deckte einen vollständig neu erzeugten Downloadbutton ab.
X kann beim Scrollen jedoch den vorhandenen xLoader-Button behalten und nur
dessen umgebenden Inhalt beziehungsweise das Fortschritts-Badge entfernen.
`processTweet()` beendete sich bei einem bereits vorhandenen Button sofort und
stellte das Badge deshalb nicht wieder her.

v1.0.38-dev bindet auch vorhandene Buttons erneut an den laufenden Tweet-Task.
Der MutationObserver stößt diese Wiederherstellung nun ebenfalls an, wenn
innerhalb eines Tweets ausschließlich DOM-Knoten entfernt wurden. Vollständiger
Buttonersatz, Prozent-/Neutralanzeige und Abbruchbindung aus v1.0.37-dev bleiben
erhalten.

## Nachweise

- Syntaxprüfung erfolgreich.
- Gesamte lokale Suite: 73 Subtests, 0 Fehler.
- Gezielte Fälle: vollständiger Buttonersatz mit Wiederherstellung von `63%`;
  vorhandener Button nach Badge-Verlust wird erneut gebunden.
- Installierbare Testfassung:
  `F:\001_Coding_Projekte\xLoader\Ausgabe\xLoader-v1.0.38-dev.user.js`,
  163.453 Bytes, SHA-256
  `53BEB3EC75C31DBC774454E9E54CD961F589AE11214F8EEB5E8CB301F3BD4A8E`.
  Sie ist byteidentisch mit `xLoader.user.js`.
