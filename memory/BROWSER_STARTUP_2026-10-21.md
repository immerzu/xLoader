# Playwright / Tampermonkey: Skripte nach Neustart gesperrt

Stand: 2026-10-21. Verbindlich vor Browserarbeiten lesen (siehe `../AGENTS.md`).
Dieser Eintrag ersetzt die Browser-Startempfehlungen aus dem Journal vom
2026-10-18, insbesondere das Laden von Tampermonkey mit beiden Erweiterungsflags.

## Fehler und belegte Ursache

Die Startkonfiguration lud Tampermonkey bei jedem Start mit
`--load-extension=...tampermonkey...`. Die so eingebundene Erweiterung wurde
beim erneuten Browserstart als Installation behandelt. Tampermonkeys eigener
`runtime.onInstalled`-Handler setzt bei `reason === 'install'` vorhandene
unbekannte Skripte auf `SEVERITY_FOISTED_SCRIPT` (Wert **12**).

Dadurch können Skripte `enabled: true` sein und einen grünen Schalter zeigen,
aber trotzdem nicht laufen. Das Dashboard meldet in Titel/Tooltip die unbekannte
Herkunft, der Name kann durchgestrichen sein; X zeigt keinen xLoader-Button.
Ein bloßes Wiedereinschalten oder Neuimportieren half nur bis zum nächsten Start.
Die Cookies waren nicht die Ursache und wurden nicht gelöscht.

Beleg aus dem tatsächlich geladenen Tampermonkey-5.5.1-`background.js`:
Der `onInstalled`-Handler protokolliert `content security: found unfamiliar script`
und setzt `script.evilness = SEVERITY_FOISTED_SCRIPT`. Diagnosewert 12 wurde
nach Neustarts bei allen acht vorhandenen Skripten gelesen. Interne Werte dienen
nur zur Diagnose, nicht zum manuellen Freischalten.

Zusätzlich trat mit der vorher eingebundenen Version 5.5.0 ein echter Startfehler
in `content.js` auf: `TypeError: ko.runtime.connect is not a function`.
Das war ein Erweiterungs-/Injektionsfehler vor der Ausführung von xLoader.
Außerdem war der Downloadmodus `off`; dieser verhindert Downloads unabhängig
vom Vorhandensein der Buttons.

## Dauerhafte Lösung und geltende Startkonfiguration

- Dasselbe persistente Nutzerprofil verwenden:
  `C:\Users\lolo\AppData\Local\Google\Chrome for Testing\User Data`.
- Konfigurationsquelle: `C:\Users\lolo\.dsh\playwright-mcp-config.json`.
  Vor Verwendung live lesen; Pfade/Versionen können später aktualisiert werden.
- Verifizierte Binary: `C:\Users\lolo\AppData\Local\ms-playwright\chromium-1247\chrome-win64\chrome.exe`
  (Chrome for Testing 155.0.8059.12).
- Tampermonkey **5.5.1**, ID `dhdgffkkebhmkfjojejmpbldmpobfkfo`, ist über Chromes
  **reguläre Ordnerinstallation** dauerhaft im Profil registriert, nicht über
  die temporäre CDP-Installation. Originalen Manifest-Public-Key/ID erhalten.
- Stabiles Quellverzeichnis:
  `C:\Users\lolo\AppData\Local\ms-playwright-mcp\tampermonkey-5.5.1`.
- Tampermonkey aus **allen** `--load-extension`-/`--disable-extensions-except`-
  Listen entfernen. Auch nicht als vermeintliche Reparatur wieder hinzufügen.
- `launchOptions.ignoreDefaultArgs` enthält `['--disable-extensions']`, damit
  Playwright die dauerhaft installierte Erweiterung nicht abschaltet.
- Der aktuelle `--load-extension`-Eintrag enthält nur Better DeepSeek und AdGuard:
  `C:\Users\lolo\AppData\Local\ms-playwright-mcp\better-deepseek-0.1.15` und
  `C:\Users\lolo\AppData\Local\ms-playwright-mcp\adguard-5.5.3.11`.
  Diese beiden Einträge nicht versehentlich mit Tampermonkey gleichsetzen.
- `initScript` bleibt `C:\Users\lolo\.dsh\tm-startseite-unterdruecken.js`.
- Tampermonkey-Einstellungen beim Abschluss: Content-Script-API
  `userscripts-dynamic`; Downloadmodus **Browser-API** (`downloads_mode: 'chrome'`).
  Downloadberechtigung separat beachten. Die Wiederkehr der Herkunftssperre
  wurde durch die dauerhafte Installation behoben, nicht allein durch den Moduswechsel.

Skriptaktivierung nach der Installation nur über Tampermonkeys vorgesehenen
Bestätigungsweg durchführen. Dessen separater `ask.html`-Tab kann
„Modifikation des Userscripts“ / „Modifizieren“ anzeigen, obwohl nur derselbe
geprüfte Code erneut bestätigt/aktiviert wird. Das Editorfenster kann währenddessen
„Bitte warten“ anzeigen. Offene Bestätigungstabs prüfen, nicht wiederholt importieren.
Vor einer Bestätigung vorhandenen Code/Herkunft prüfen und Nutzerauftrag beachten.

## Fehlversuche nicht wiederholen

1. **CDP `Extensions.loadUnpacked`:** lieferte die korrekte ID und lud die
   Erweiterung für die Sitzung, verschwand aber nach dem Schließen wieder.
   Kein Ersatz für die reguläre dauerhafte Ordnerinstallation.
2. **Alle Ladeflags entfernen, bevor Tampermonkey dauerhaft installiert ist:**
   ließ die Erweiterungen verschwinden. Erst regulär installieren, dann Neustart prüfen.
3. **Alte Konfiguration blind zurückspielen:** verwies auf inzwischen fehlende
   `Default\Extensions\...\0.1.15_0`-/`5.5.3.11_0`-Verzeichnisse und verursachte
   „Manifest-Datei fehlt oder ist nicht lesbar“. Vor Start jedes gelistete
   Verzeichnis auf lesbare `manifest.json` prüfen. Die zwei weiteren Erweiterungen
   wurden aus der vorhandenen Sicherung in die stabilen Pfade oben kopiert.
4. **Unzuverlässigen Drop wiederholen / `useDraggedPath: true` ohne echten Drop:**
   erzeugte „No dragged path“. Dies ist ein Fehler der Installationsautomatisierung,
   kein Fehler von xLoader. Fehlerdialoge/Prüftabs anschließend aufräumen.
5. **Erfolg nach einmaligem Erscheinen des Buttons melden:** war verfrüht.
   Herkunftssperre und Registrierung immer auch nach vollständigem Neustart prüfen.

## Verbindliche Abnahme nach Browserreparaturen

1. Vorherige Aktivierungszustände festhalten; keine Cookies/Anmeldedaten exportieren.
2. Auf echtem X.com mit vorhandenem Login das xLoader-Startprotokoll und
   `button[data-xloader]` prüfen. Testseite beim Abschluss:
   `https://x.com/AISafetyMemes/status/2112387283538313469`.
3. Browser vollständig schließen und mit derselben Konfiguration/demselben Profil
   neu starten. Weder neu importieren noch erneut aktivieren, um Fehler zu verdecken.
4. Dashboard/Herkunftssperren und tatsächliche Ausführung prüfen; diesen
   vollständigen Neustarttest zweimal erfolgreich durchführen.
5. Gewünschten Zustand und verbleibende Grenzen berichten. Den Browser offen lassen,
   wenn der Nutzer ihn verwenden will; eigene Diagnose-/Fehlertabs schließen.

## Verifizierter Abschluss dieser Reparatur

Nach Neustarts waren **xVKDownloader, xDeepSeek Token Badge, xLoader,
xDSH Costs (DSH) und xYTDownloader** weiter `enabled: true`, jeweils Sperrcode **0**.
Die drei schon zuvor ausgeschalteten Skripte blieben ausgeschaltet; bei ihnen
wurde der vorhandene Sperrcode 12 nicht aufgehoben. Keine pauschale Aktivierung.
Better DeepSeek, AdGuard und Tampermonkey wurden im letzten Neustart als
`ENABLED` gelesen. xLoader **1.0.24** zeigte das Startprotokoll und einen
Downloadbutton auf der echten X-Seite. Der Nutzer bestätigte anschließend „Gut!“.

Das beweist die erhaltene Aktivierung und xLoader-Injektion. Es ist **kein** neuer
Nachweis von Downloads aller Skripte oder der Zeit bis zum sichtbaren Speicherdialog.
Diese Aussagen beschreiben den Abschluss der Browserreparatur. Anschließend hat
der Nutzer die Dialog-Testfassung selbst erfolgreich getestet und die Veröffentlichung
als v1.0.25 freigegeben; siehe `HANDOVER_v1.0.25.md`. Daraus keine aktuelle
Installationsversion im Nutzerprofil ableiten und für das Release keine Profile ändern.

Vorhandene Konfigurationssicherungen liegen neben der Konfiguration unter den
Suffixen `.bak-xloader-repair-20261021`, `.bak-missing-extension-20261021` und
`.bak-permanent-install-20261021`. Sie dokumentieren Zwischenstände und sind
**keine** pauschal wiederherzustellenden funktionierenden Startkonfigurationen.
