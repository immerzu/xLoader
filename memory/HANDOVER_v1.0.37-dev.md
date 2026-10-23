# xLoader v1.0.37-dev — lokale Testfassung

Stand: 2026-10-23. Nicht veröffentlicht und noch nicht im echten Browser abgenommen.

## Fortschritt nach Weg- und Zurückscrollen

X entfernt Timeline-Tweets außerhalb des sichtbaren Bereichs aus dem DOM und
erzeugt sie beim Zurückscrollen neu. Der Download lief weiter, aber sein Zustand
war bisher nur am ursprünglichen Button in einer `WeakMap` gespeichert. Prozent
und Abbruchfunktion blieben deshalb am entfernten Button hängen.

v1.0.37-dev verfolgt laufende Downloads zusätzlich anhand der Tweet-ID. Ein neu
gerenderter Downloadbutton wird an denselben Task gebunden und erhält sofort den
letzten Stand (`…` oder Prozent), den Busy-Status und die Abbruchfunktion. Nach
Abschluss, Fehler oder Abbruch werden alle Buttonbindungen und der Tweet-Eintrag
entfernt.

## Nachweise

- Syntaxprüfung erfolgreich.
- Gesamte lokale Suite: 73 Subtests, 0 Fehler.
- Neuer Regressionstest ersetzt während eines laufenden Downloads den
  ursprünglichen Button und weist die Wiederherstellung von `63%`, Titel,
  Busy-Zustand und Taskbindung nach.
- Bestehende Fortschritts-, Doppelklick-, Abbruch-, Mehrfachmedien-, HLS- und
  Streamingtests bleiben erfolgreich.
- Installierbare Testfassung:
  `F:\001_Coding_Projekte\xLoader\Ausgabe\xLoader-v1.0.37-dev.user.js`,
  162.010 Bytes, SHA-256
  `A5210E5917D9895BDD2E71A1FD230B9EC34F6C2FDDFDFDF1078768064443820F`.
  Sie ist byteidentisch mit `xLoader.user.js`.
