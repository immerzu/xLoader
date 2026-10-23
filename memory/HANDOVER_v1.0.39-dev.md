# xLoader v1.0.39-dev — lokale Testfassung

Stand: 2026-10-23. Nicht veröffentlicht und noch nicht im echten Browser abgenommen.

## Härtung der Fortschrittsbindung

v1.0.39-dev härtet die in v1.0.37-dev und v1.0.38-dev eingeführte
Wiederherstellung der Downloadanzeige gegen weitere Formen des X-DOM-Recyclings:

- Ein von X für einen anderen Tweet wiederverwendeter xLoader-Button wird vom
  alten Downloadtask getrennt. Ein Klick kann dadurch nicht versehentlich den
  Download eines anderen Tweets abbrechen.
- Aus dem DOM entfernte Buttons werden unmittelbar aus der WeakMap und aus der
  Buttonliste des laufenden Tasks entfernt. Lange Downloads sammeln dadurch
  keine verwaisten DOM-Verweise an.
- Wenn derselbe Tweet gleichzeitig mehrfach sichtbar ist, werden Busy-Zustand,
  Titel und Fortschrittswert auf alle verbundenen Buttons gespiegelt.
- Die Wiederherstellung nach vollständigem und teilweisem DOM-Recycling aus
  v1.0.38-dev bleibt erhalten.

## Nachweise

- `node --check xLoader.user.js`: erfolgreich.
- Gezielter Testlauf `download-flow.test.cjs` + `fixes.test.cjs`: 35/35 bestanden.
- Gesamte lokale Node-Suite: 75/75 Subtests, 0 Fehler.
- Enthaltene neue Fehlerfälle: verwaiste Buttonbindung, recycelter Button mit
  fremder Tweet-ID und mehrere sichtbare Darstellungen eines laufenden Tweets.
- Installierbare Testfassung:
  `F:\001_Coding_Projekte\xLoader\Ausgabe\xLoader-v1.0.39-dev.user.js`,
  166.379 Bytes, SHA-256
  `96838BC81BE222746E24A999D9692E0AC66D53F708427D17BD2E21BF66C0111D`.
  Sie ist byteidentisch mit `xLoader.user.js`.

## Prüfgrenze

Die Tests sind lokale Node-/VM-Prüfungen einschließlich eines realen lokalen
HTTP-Streams. Es wurde in diesem Durchlauf kein Browserprofil geändert und kein
echter X.com-/Tampermonkey-Scrolltest ausgeführt. Diese Abnahme bleibt beim
Nutzer. Kein Commit, Push, Tag oder Release wurde erstellt.
