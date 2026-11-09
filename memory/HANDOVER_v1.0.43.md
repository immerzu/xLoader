# xLoader v1.0.43 — Dateiauswahl bei zitierten Videos

Stand: 2026-11-09. Vom Nutzer beauftragt nach einem gemeldeten Fehler.

## Gemeldeter Fehler

Download bei `x.com/MyLordBebo/status/2119675299055210789` (Post mit eingebettetem
Video und zitiertem Post) sowie beim zitierten Status `…110095`: Es entstand eine
**leere Datei** `@MyLordBebo_2119546779570000095_1.mp4` (0 Byte), am Button stand
`Fehler beim Laden: Videokarte ohne Videodatei: Dateiauswahl nicht übernommen`.

## Ursache (belegt)

- X rendert den zitierten Tweet **im selben `<article>`** wie den äußeren Post. Der
  Video-Player des Zitats wurde dadurch als eigener Player des äußeren Posts
  gewertet, obwohl dieser nur Bilder hat.
- Folge: frühe Dateiauswahl mit `.mp4` (aus `ownPlayers`, alte Zeilen 2995–3005),
  danach liefert die Medienauflösung Bilder; der Endungskonflikt brach mit einer
  Exception ab und die per `createWritable()` angelegte Datei blieb leer.
- Zusatzbefund, nicht behoben: `/i/api/2/timeline/conversation/<id>.json` liefert
  für alle geprüften Tweets HTTP 404; der Prefetch läuft ins Leere, die
  Medienauflösung stützt sich auf React-Props, DOM und Syndication. Eine
  Umstellung auf GraphQL-`TweetDetail` wurde bewusst nicht umgesetzt (Query-IDs
  sind nicht stabil, neuer Fehlerpfad ohne Bezug zum gemeldeten Fehler).

## Korrekturen

1. Neue Prüfung `playerBelongsToTweet(player, tweetId)`: Ein Player im selben
   `<article>` zählt nur zum Tweet, wenn sein Status-Link auf dessen eigene ID
   zeigt; fehlt der Link oder zeigt er auf eine andere ID, wird der Player
   übersprungen. Damit öffnet ein zitiertes Video keinen `.mp4`-Dialog mehr für
   einen Bild-Post.
2. Endungskonflikt bricht nicht mehr ab: Passt eine früh gewählte `.mp4`-Datei
   nicht zum ersten Medium, wird die Auswahl verworfen (`pickerRejected`), die
   leere Zieldatei nicht weiterverwendet und `GM_download` übernimmt mit der
   korrekten Endung. Es entsteht keine 0-Byte-Datei mehr und der Lauf endet ohne
   Fehlermeldung erfolgreich.

## Prüfungen

- `node --check xLoader.user.js`: erfolgreich.
- Gesamte lokale Suite: `dom-media 11`, `fixes 16`, `download-flow 41`,
  `hardening 23`, `progressive-media 18`, `watchdog 19` = **128 Subtests, 0 Fehler**.
- Neue Regressionstests in `tests/download-flow.test.cjs`:
  - `video player of a quoted tweet does not belong to the outer tweet`
    (fremde/fehlende Status-ID → nicht zugeordnet),
  - `rejected .mp4 picker keeps running with the correct extension`
    (kein Abbruch, keine zweite Dateiauswahl, `GM_download` mit `.jpg`).
- Kein Browserlauf in dieser Fassung; der gemeldete Fall wurde vor dem Fix im
  echten Profil (Chrome for Testing, Tampermonkey 5.5.1, xLoader 1.0.42)
  nachgestellt und die Fehlermeldung des Nutzers im Code belegt.

## Veröffentlichung

Wird nach der Kontrolle von GitHub und Greasy Fork ergänzt.
