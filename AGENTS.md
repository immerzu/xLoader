# Verbindliche Projektanweisungen für Agenten

## Vor Arbeitsbeginn

1. `memory/MEMORY.md`, `memory/user_lolo.md` und `memory/FACT.md` lesen.
2. Vor jedem Start, Neustart, Browserfunktionstest oder jeder Änderung am Playwright-Browser
   zusätzlich `memory/BROWSER_STARTUP_2026-10-21.md` vollständig lesen.
3. Bestehende Nutzerarbeiten und Cookies/Anmeldungen schützen. Keine Commits,
   Pushes, Versionsanhebungen oder Veröffentlichungen ohne ausdrücklichen Auftrag.

## Build-Versionierung

- Auf ausdrücklichen Nutzerwunsch bekommt jedes neu beauftragte Build eine
  höhere Patchversion, auch bei lokalen Testfassungen (z. B. 1.0.25 → 1.0.26).
- Metablock, Changelog, Init-Log und Ausgabedateiname konsistent aktualisieren.
  Bereits vorhandene Versionsarchive erhalten; neue Builds nicht unter der
  bisherigen Versionsnummer erneut ausgeben.
- Bei der ausdrücklich beauftragten Veröffentlichung einer bereits getesteten
  und freigegebenen Fassung deren Version und Bytes unverändert beibehalten.

## Browserregeln – nicht wieder regressieren lassen

- Das dauerhafte Profil aus der bestehenden Playwright-Konfiguration verwenden.
  Kein Ersatzprofil als angeblich eingerichtetes Nutzerprofil präsentieren.
- Tampermonkey ist regulär und dauerhaft im Profil installiert. Es darf **nicht**
  erneut in `--load-extension` oder `--disable-extensions-except` aufgenommen werden.
  Sonst kann die Herkunftssperre aller Userscripts nach jedem Neustart wiederkehren.
- `Extensions.loadUnpacked` per CDP ist hier **keine dauerhafte Installation**.
  Ein erfolgreicher Rückgabewert beweist keine Persistenz.
- Die aktuelle Konfiguration und vorhandene Erweiterungsdateien vor Änderungen
  prüfen und sichern; nicht blind alte Sicherungskonfigurationen zurückspielen.
- Ein grüner Schalter genügt nicht als Funktionsnachweis. Nach einer Reparatur
  zwei vollständige Browserneustarts prüfen: gewünschte Skriptzustände erhalten,
  keine Herkunftssperre, xLoader-Startprotokoll und Downloadbutton auf echtem X.com.
- Absichtlich ausgeschaltete Skripte ausgeschaltet lassen. Keine internen
  Sperrwerte direkt überschreiben und keine Schutzprüfung im Erweiterungscode
  entfernen. Herkunft nur für geprüfte, autorisierte Skripte regulär bestätigen.
- Erfolg erst nach der Prüfung melden. UI-Anzeige, Downloadfunktion und sichtbare
  Speicherdialogzeit sind unterschiedliche Nachweise.
- Bei reinen Skript-Releases ohne Browseränderungen keine Profilreparaturen oder
  Browserneustarts ausführen. Nutzerbestätigte Tests als solche kennzeichnen;
  lokale Regressionstests benötigen weder Login noch Profiländerungen.

Details, Fehlerbilder, gültige Pfade und Nachweise stehen in
`memory/BROWSER_STARTUP_2026-10-21.md`. Historische Journal-/Handover-Einträge
mit abweichenden Startflags sind keine aktuellen Startanweisungen.
