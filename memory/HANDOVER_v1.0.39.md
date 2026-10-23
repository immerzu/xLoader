# xLoader v1.0.39 — Release

Stand: 2026-10-23. Veröffentlicht und vom Nutzer unter Windows/Tampermonkey geprüft.

## Härtung der Fortschrittsbindung

v1.0.39 härtet die in v1.0.37-dev und v1.0.38-dev eingeführte
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
  `F:\001_Coding_Projekte\xLoader\Ausgabe\xLoader-v1.0.39.user.js`,
  166.367 Bytes, SHA-256
  `A5A78F917F1EE701CDD2152D0F8A87F6D546C5E40A6798C67A3955DFEA27EA39`.
  Sie ist byteidentisch mit `xLoader.user.js`.

## Browser- und Veröffentlichungsnachweise

Die Tests sind lokale Node-/VM-Prüfungen einschließlich eines realen lokalen
HTTP-Streams. Der Nutzer bestätigte anschließend die Fortschrittsanzeige sowie
vollständige Mehrfachmedien-Downloads im eigenen Windows-/Tampermonkey-Browser,
zuletzt zwei Bilder des zitierten Tweets `2113283120078434800` im Referenzpost
`2113429634763432360`. Das Browserprofil wurde durch die Veröffentlichung nicht
verändert.

- Commit und Tagziel: `bbd2dc7ed46399920f89b4a36977815e22bd13ba`.
- Tag: `v1.0.39`; der Tag zeigt auf den unveränderten Release-Quellcommit.
  Nachfolgende Dokumentationscommits auf `main` ändern das Release-Asset nicht.
- GitHub-Release: https://github.com/immerzu/xLoader/releases/tag/v1.0.39
- GitHub-Asset: 166.367 Bytes, SHA-256
  `A5A78F917F1EE701CDD2152D0F8A87F6D546C5E40A6798C67A3955DFEA27EA39`;
  nach erneutem Download byteidentisch mit der freigegebenen Testfassung.
- Greasy Fork: https://greasyfork.org/de/scripts/589456-xloader zeigt und liefert
  `1.0.39`. Rohfassung 166.343 Bytes, SHA-256
  `16BFAF0ACB946379EC90BD11E0E2DFB884786079F52F652DE3433EFF8708159C`.
  Nach Entfernung ausschließlich der von Greasy Fork gesetzten
  `@updateURL`-/`@downloadURL`-Zeilen ist der gesamte Inhalt identisch.
