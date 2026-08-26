# Onyx Cards

**English speakers:** the cards follow Home Assistant's own language setting — see
[Sprache / Language](#sprache--language) below for what that means and how to switch.
The reference documentation on this page is German.

Sieben Lovelace-Karten für Home Assistant: dunkle Flächen, Glasknöpfe, sieben wählbare
Kartenfarben — für die Bedienung am Handy gebaut.

Keine Abhängigkeiten — weder button-card noch card-mod nötig. Alle Karten lassen sich
über den **visuellen Editor** einrichten.

| Karte | Was sie kann |
|---|---|
| `onyx-room-card` | Raumübersicht, die pro Gerätegruppe **aufklappt** und jedes Gerät einzeln zeigt |
| `onyx-slider-card` | Vertikaler Zieh-Regler für Licht, Storen oder Lautstärke |
| `onyx-cover-card` | Storen mit Höhe, Lamellenwinkel, Fahrtasten und Windsperre |
| `onyx-media-card` | Medienspieler; der Kartengrund kommt aus dem Cover |
| `onyx-actions-card` | Schnellzugriffe für Szenen, Skripte und Automationen |
| `onyx-chart-card` | Bis zu drei Messwerte, einer davon als Verlauf |
| `onyx-vacuum-card` | Saugroboter mit Akkuring, Raumauswahl und Verbrauchsteilen |

## Installation über HACS

1. HACS öffnen → oben rechts ⋮ → **Benutzerdefinierte Repositories**
2. URL dieses Repositories eintragen, Kategorie **Dashboard** (früher „Lovelace"), hinzufügen
3. „Onyx Cards" suchen → **Herunterladen**
4. Home Assistant neu starten, danach den Browser hart neu laden (Strg + Shift + R)

HACS trägt die Ressource selbst ein — der Schritt unter Einstellungen → Dashboards → Ressourcen entfällt.

### Ohne HACS

`onyx-cards.js` nach `/config/www/` kopieren, dann unter
Einstellungen → Dashboards → ⋮ → Ressourcen hinzufügen:

```
URL:  /local/onyx-cards.js
Typ:  JavaScript-Modul
```

> Das Theme setzt `onyx-r` auf 24px — den Kartenradius. Änderst du ihn dort,
> ziehen alle Karten mit.

> Bei Home Assistant OS heißt der Ordner in der Samba-Freigabe `homeassistant` —
> das **ist** `/config`. Einen Unterordner `config` gibt es nicht.
> `www` gibt es frisch installiert noch nicht, den anlegen und danach
> Home Assistant einmal neu starten, sonst liefert `/local/` nichts aus.

## Theme

`onyx.yaml` nach `/config/themes/` kopieren. In der `configuration.yaml` muss einmalig stehen:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

Dann Entwicklerwerkzeuge → YAML → **Themes neu laden**, und im Benutzerprofil „Onyx" wählen.
Das Theme setzt auch die Variablen, aus denen die Karten ihren Verlauf und ihre Schatten lesen.
Ohne Theme funktionieren die Karten, sehen aber neutraler aus.

## Verwendung

### onyx-room-card

Zwei Betriebsarten. **Bereich** — die Karte sucht sich alles selbst:

```yaml
type: custom:onyx-room-card
area: wohnzimmer
navigation_path: /lovelace/wohnzimmer
```

**Eigene Listen** — du bestimmst genau, was erscheint und in welcher Reihenfolge:

```yaml
type: custom:onyx-room-card
name: Wohnzimmer
icon: mdi:sofa
temperature: sensor.wohnzimmer_temperatur
humidity: sensor.wohnzimmer_feuchte
lights:
  - light.decke
  - light.stehlampe
covers:
  - cover.sued
  - cover.west
media:
  - media_player.sonos_wohnzimmer
climate:
  - climate.wohnzimmer
```

Beides lässt sich mischen: Steht `area` da **und** eine Liste, gewinnt für diese
eine Gruppe die Liste — die übrigen kommen weiter aus dem Bereich. So kannst du
etwa nur die Lichter von Hand festlegen und Storen und Medien automatisch lassen.

Einzelne Geräte dürfen einen eigenen Namen und ein eigenes Icon bekommen:

```yaml
lights:
  - entity: light.kueche_arbeitsflaeche
    name: Arbeitsfläche
    icon: mdi:track-light
  - light.kueche_decke      # kurz, wenn nichts zu ändern ist
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `area` | — | Bereichs-ID (nicht der angezeigte Name). Liste über Entwicklerwerkzeuge → Vorlage mit `{{ areas() }}` |
| `lights` | aus dem Bereich | Welche Lampen erscheinen, in dieser Reihenfolge |
| `covers` | aus dem Bereich | Storen. Auch `storen:` oder `rollos:` geschrieben |
| `media` | aus dem Bereich | Medienspieler |
| `climate` | aus dem Bereich | Thermostate |
| `name` | Bereichsname | Überschrift der Karte |
| `icon` | Bereichs-Icon | z. B. `mdi:sofa` |
| `temperature` | erster Sensor des Bereichs | Anzeige oben rechts |
| `humidity` | erster Sensor des Bereichs | dito für die Luftfeuchte |
| `groups` | `[light, media_player, climate, cover]` | Reihenfolge der Gruppenknöpfe |
| `color` | `blau` | Kartenfarbe: `blau` `gruen` `gelb` `orange` `rot` `violett` `rosa` — oder ein eigener Hexwert wie `"#00b3a4"` |
| `label` | `Raum` | Die kleine Zeile über dem Namen |
| `navigation_path` | — | Wohin ein Tipp auf das Raum-Icon springt |

Ohne `area` musst du mindestens eine Liste angeben — sonst wüsste die Karte nicht,
was sie zeigen soll. Ohne Listen sortiert sie die Geräte des Bereichs alphabetisch;
mit Listen bleibt deine Reihenfolge stehen.

**Bedienung.** Tipp auf einen Gruppenknopf **klappt die Gruppe auf** und zeigt jedes
Gerät einzeln. **Halten schaltet die ganze Gruppe** um. In der Liste: Tipp = an/aus,
quer ziehen = Helligkeit oder Storenhöhe, Halten = Detailfenster.

> Tippen klappt auf, weil das der häufigere Wunsch ist. Alles auf einmal umzuschalten
> ist seltener und folgenreicher — das bekommt die absichtsvollere Geste.

**Farbe.** Jede Karte darf ihre eigene bekommen; sinnvoll, wenn du Räume auf einen
Blick auseinanderhalten willst:

```yaml
- type: custom:onyx-room-card
  area: wohnzimmer
  color: gruen
- type: custom:onyx-room-card
  area: kueche
  color: orange
```

Gefärbt wird nur die aktive Karte. Ist im Raum nichts an, bleibt sie neutral grau —
sonst sähen auch schlafende Räume aus, als liefe etwas.

Die Gruppenknöpfe sind umrandete Kreise; **gefüllt ist nur, was gerade läuft**, und
zwar im hellen Ton der gewählten Farbe. Dadurch bleibt die Knopfreihe ruhig und der
Blick findet sofort, was aktiv ist.

### onyx-slider-card

```yaml
type: custom:onyx-slider-card
entity: light.wohnzimmer_decke
name: Decke
grid_options: { columns: 3, rows: 3 }
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | **Pflicht.** `light.*` oder `cover.*` |
| `name` | Gerätename | Beschriftung unter dem Regler |
| `icon` | automatisch | Glühbirne bzw. Store |
| `color` | `blau` | Farbe der Füllung. Gleiche Werte wie bei der Raum-Karte |
| `show_name` | `true` | Auf `false` setzen, wenn der Name stört |

Ziehen setzt den Wert, Tippen schaltet um, Halten öffnet das Detailfenster.
Vier passen nebeneinander.

### onyx-cover-card

```yaml
type: custom:onyx-cover-card
entity: cover.wohnzimmer_sued
lock_entity: binary_sensor.windwaechter
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | **Pflicht.** `cover.*` |
| `name` | Gerätename | Steht klein oben rechts |
| `color` | `blau` | Farbe des Tageslichts im Fenster und der Tasten |
| `lock_entity` | — | Binärsensor des Windwächters. Ist er `on`, wird die Karte gesperrt dargestellt und nimmt keine Befehle mehr an |
| `lock_label` | `Windwächter aktiv` | Text im Sperr-Hinweis |

Senkrecht über das Fenster ziehen setzt die Höhe. Der Lamellenregler erscheint nur,
wenn die Store das kann **und** nicht ganz oben steht. Während der Fahrt sind
Auf und Ab gedimmt und nur Stop trägt den Verlauf.

> Prozente sind bei Storen zweideutig — Home Assistant zählt **100 % = ganz offen**.
> Die Karte schreibt deshalb immer ein Wort dazu: „60 % offen" statt nur „60 %".

### onyx-media-card

```yaml
type: custom:onyx-media-card
entity: media_player.sonos_wohnzimmer
```

Cover links, rechts Gerät, Titel, Fortschritt und Lautstärke. **Der Kartengrund
kommt aus dem Cover selbst** — gross gezogen und weichgezeichnet. Dadurch trägt
jede Karte die Farbe der Musik, die gerade läuft.

Das Cover läuft randlos bis an die Kartenkante und blendet nach rechts weich aus.
Gibt es keins, entfällt der Platz dafür ganz und der Text nimmt die volle Breite.

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | **Pflicht.** `media_player.*` |
| `name` | Gerätename | Steht fett in der Kopfzeile |
| `label` | `Lautsprecher` | Die kleine Zeile darüber |
| `color` | `blau` | Palette für den Fall, dass es **kein** Cover gibt. Gleiche Werte wie bei der Raum-Karte |
| `show_art` | `true` | `false` lässt das Cover weg und nimmt die Palette |
| `show_volume` | `true` | Blendet den Lautstärkeregler aus |

**Bedienung.** Tippen auf den grossen Knopf spielt oder hält an. Auf dem Fortschritt
ziehen spult, auf dem unteren Regler ziehen setzt die Lautstärke. Tippen auf das Cover
öffnet das Detailfenster. Die Balken oben rechts tanzen, solange etwas läuft.

Die Karte liest `supported_features`: Kann der Spieler nicht springen, sind Vor und
Zurück gedimmt; ohne Lautstärkeregelung fällt der Regler weg. Der Fortschritt läuft
sekundengenau weiter, auch zwischen zwei Zustandsmeldungen.

> Läuft nichts, schrumpft die Karte auf eine flache Kachel. Im Sections-Raster
> deshalb keine feste Zeilenzahl setzen.

### onyx-actions-card

Schnellzugriffe für Szenen, Skripte, Automationen und Helfer — in einem Rahmen,
wahlweise nach Art getrennt.

```yaml
type: custom:onyx-actions-card
title: Schnellzugriff
groups:
  - label: Szenen
    actions:
      - entity: scene.kommen
        icon: mdi:home-import-outline
      - entity: scene.gehen
        icon: mdi:exit-run
      - entity: script.staubsauger
        name: Putzen
        icon: mdi:robot-vacuum
  - label: Automationen
    actions:
      - entity: automation.nachtmodus
        icon: mdi:weather-night
      - entity: automation.beschattung
        icon: mdi:blinds-horizontal
```

Ohne Gruppen genügt eine flache Liste:

```yaml
type: custom:onyx-actions-card
title: Schnellzugriff
actions: [scene.kommen, scene.gehen, automation.nachtmodus]
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `actions` | — | Flache Liste. Einträge sind Entitäten oder Objekte mit `entity`, `name`, `icon` |
| `groups` | — | Statt `actions`: Liste aus `{ label, actions }` mit Trennlinie dazwischen |
| `title` | — | Überschrift des Rahmens; ohne Titel entfällt der Kopf |
| `subtitle` | „x von y aktiv" | Eigener Text, oder `false` zum Ausblenden |
| `shape` | `squares`, ab 9 Einträgen `chips` | `squares` · `chips` · `tiles` · `rail` |
| `columns` | `4` | Spalten bei `squares` |
| `color` | `blau` | Farbe der aktiven Knöpfe. Gleiche Werte wie bei der Raum-Karte |
| `tap_action` | — | Pro Eintrag: `trigger` löst eine Automation aus statt sie umzuschalten |

**Auslöser und Schalter werden unterschieden.** Szenen, Skripte und Buttons haben
keinen Zustand — sie leuchten beim Tippen kurz auf und zeigen einen Haken. Automationen,
Helfer und Schalter haben einen, und der steht als kleiner Punkt oben rechts im Knopf.
Kein Punkt heisst also: reiner Knopf, hier lässt sich nichts verstellen.

| Art | Tippen | Halten |
|---|---|---|
| Szene | Ausführen, Haken für 1,5 s | Detailfenster |
| Skript | Starten; läuft es, pulsiert der Knopf | Abbrechen |
| Automation | **Scharf schalten oder deaktivieren** | Detailfenster |
| Helfer, Schalter | Umschalten | Detailfenster |

Eine deaktivierte Automation bekommt leeren Punkt, Schrägstrich und weniger Deckkraft —
eine stumm gestellte Automation, die aussieht wie eine scharfe, ist die Sorte Fehler,
die man erst Wochen später bemerkt.

Wer eine Automation lieber auslösen als umschalten will, setzt das pro Eintrag:

```yaml
- entity: automation.giessen
  tap_action: trigger
```

> Eine nie ausgelöste Szene steht in Home Assistant auf `unknown`. Die Karte wertet
> das als Normalzustand, nicht als Fehler — grau wird nur, was wirklich `unavailable` ist.

### onyx-chart-card

Bis zu drei Messwerte rechts, darunter der Verlauf von einem davon. Antippen
eines Werts wechselt, welcher gezeichnet wird.

```yaml
type: custom:onyx-chart-card
title: Energie
label: Energie
icon: mdi:flash
color: orange
period: tag          # tag · woche · monat · jahr
entities:
  - entity: sensor.leistung
    name: Jetzt
  - entity: sensor.energie_heute
    name: Heute
  - entity: sensor.spitze
    name: Spitze
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entities` | — | **Pflicht.** Ein bis drei Sensoren. Mehr wird abgelehnt — die Spalte wäre sonst eine Liste |
| `period` | `tag` | Zeitraum: `tag` `woche` `monat` `jahr`. Englisch geht auch |
| `title` | Name des gewählten Werts | Überschrift der Karte |
| `label` | `Verlauf` | Die kleine Zeile darüber |
| `icon` | `mdi:chart-line` | Icon im Kreis links |
| `color` | `blau` | Farbe von Linie, Fläche und Icon |
| `tinted` | `false` | `true` färbt auch den Kartengrund, sonst bleibt er dunkel |

**Bedienung.** Tippen auf einen Wert macht ihn zum Graphen, Halten öffnet sein
Detailfenster. Der Zeitraum unten links lässt sich antippen und wandert durch
Tag → Woche → Monat → Jahr, ohne dass du die Konfiguration anfassen musst.

**Wie die Linie entsteht.** Die Kurve ist eine monotone kubische Interpolation: weich,
aber ohne Überschwinger. Eine gewöhnliche Spline schiesst nach einer Spitze über den
höchsten gemessenen Wert hinaus und zeigt dann einen Wert, den es nie gab — hier bleibt
die Kurve innerhalb der Messwerte.

Die rohe Historie liefert einen Punkt je Zustandsmeldung, oft mehrere hundert am Tag.
Die werden zu 48 Stützstellen zusammengefasst und einmal geglättet, sonst wäre die Linie
ein Zackenkamm aus Sensorrauschen. Langzeitstatistiken sind bereits gemittelt und bleiben
unangetastet. Der Graph zeigt also den Verlauf; die genauen Zahlen stehen rechts daneben.

**Woher die Daten kommen.** Für `tag` liest die Karte die rohe Historie, für die
längeren Zeiträume die Langzeitstatistiken — stündlich bei der Woche, täglich bei
Monat und Jahr, monatlich beim Jahr. Findet sie in den Statistiken nichts, fällt
sie auf die Historie zurück.

> Statistiken gibt es nur für Sensoren mit `state_class`. Fehlt die, zeigt die Karte
> über lange Zeiträume nichts — dann hilft nur, die Entität mit `state_class:
> measurement` zu versehen.

## Visueller Editor

Alle Karten bringen ab 1.2.0 einen eigenen Editor mit. Beim Hinzufügen über
**Karte hinzufügen** oder beim Klick auf den Stift öffnet sich ein Formular statt der
YAML — mit Entitäten-Picker, Bereichs-Picker, Symbolwahl und Farbliste.

Was der Editor nicht kann, und warum:

- **Eigene Namen und Symbole je Gerät** in den Listen der Raum-Karte
  (`lights: [{entity: …, name: …, icon: …}]`) gibt es nur im Code-Editor. Der visuelle
  Editor **lässt sie unangetastet** — wer eine Lampe dazunimmt, verliert die Feinheiten
  der anderen nicht. Bei den Schnellzugriffen sind Name und Symbol dagegen pro Aktion
  direkt im Formular.
- **Umschalten zwischen `actions:` und `groups:`** macht der Schalter *In Gruppen
  aufteilen*. Beim Ausschalten wandern alle Aktionen in eine Liste, es geht nichts
  verloren.

Zwischen Formular und YAML kann jederzeit hin- und hergewechselt werden. Der Editor
schreibt nur, was vom Standard abweicht — leere Felder und Schalter auf ihrem
Normalwert landen nicht in der Konfiguration.

## Sprache / Language

Die Karten übernehmen die Spracheinstellung von Home Assistant. Steht das Profil auf
Deutsch, schreiben sie deutsch; auf Englisch, englisch. Andere Sprachen fallen auf
Englisch zurück. Umgestellt wird nichts in der Karte, sondern unter
**Profil → Sprache** — beim nächsten Neuladen der Seite ist alles übersetzt,
Kartentexte, Fehlermeldungen und der visuelle Editor.

Getrennt davon gelten **Profil → Zahlenformat** und **Zeitformat**: Wer die Oberfläche
auf Englisch stellt, aber `1.234,56` sehen will, bekommt das. Zeiten erscheinen als
`07:12` oder `7:12 AM`, je nach Einstellung.

Die **Konfiguration** ist in beiden Sprachen gültig und war es schon immer. `covers:`
und `storen:` meinen dasselbe, ebenso `lights:`/`lampen:`, `green`/`gruen`,
`week`/`woche`. Ein Dashboard funktioniert also unverändert, egal in welcher Sprache es
geschrieben wurde.

Eine weitere Sprache ist eine weitere Spalte in `STRINGS` am Kopf von
`onyx-cards.js` — 123 Schlüssel, Pull Requests willkommen.

---

**English.** The cards follow the Home Assistant language setting (**Profile → Language**).
German and English are built in; any other language falls back to English. Number and
time formatting follow **Profile → Number format** and **Time format** independently, so
an English UI with `1.234,56` works.

Configuration keys are bilingual: `covers:` equals `storen:`, `lights:` equals `lampen:`,
`green` equals `gruen`, `week` equals `woche`. Card options are documented in German
above, but every key has the English form shown here.

Adding a language means adding one more block to `STRINGS` at the top of
`onyx-cards.js` — 123 keys. Pull requests welcome.

### onyx-vacuum-card

```yaml
type: custom:onyx-vacuum-card
entity: vacuum.roborock
color: violett
consumables:
  - entity: sensor.roborock_filter_left
    name: Filter
    icon: mdi:air-filter
  - entity: sensor.roborock_main_brush_left
    name: Hauptbürste
    icon: mdi:brush
rooms:
  - { name: Wohnen, id: 16, icon: mdi:sofa }
  - { name: Küche, id: 17, icon: mdi:silverware-fork-knife }
  - { name: Bad, id: 18, icon: mdi:shower }
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | Pflicht. Muss aus der Domäne `vacuum` kommen |
| `name` | Gerätename | Überschrift |
| `label` | Saugroboter | Die kleine Zeile darüber |
| `icon` | `mdi:robot-vacuum` | Symbol im Ring |
| `color` | blau | Kartenfarbe, gleiche Werte wie bei der Raum-Karte |
| `battery_entity` | wird gesucht | Eigener Akku-Sensor, falls die Entität keinen `battery_level` hat |
| `rooms` | — | Liste aus `{name, id, icon}`. `id` ist die Segment-Nummer des Herstellers |
| `room_command` | `app_segment_clean` | Der Befehl, den `vacuum.send_command` bekommt |
| `consumables` | — | Sensoren für Filter, Bürsten, Wischtuch |
| `show_fan_speed` | `true` | Blendet die Stufenreihe aus |

**Der Akkuring.** Der Symbolkreis oben links trägt den Akkustand als Kegelverlauf.
Damit steht die Zahl zweimal da: als Ring zum Überfliegen, als Prozentwert zum
Nachlesen. **Unter 20 % wird der Ring rot**, unabhängig von der Kartenfarbe — ein
leerer Akku soll auch auf einer violetten Karte auffallen. Während des Saugens dreht
er sich langsam.

Den Akkustand holt die Karte aus dem Attribut `battery_level`. Neuere Integrationen
führen ihn als eigenen Sensor; dann sucht die Karte am selben Gerät nach einem Sensor
mit `device_class: battery`. Findet sie den nicht, hilft `battery_entity`.

**Der Hauptknopf** wechselt mit dem Zustand: Starten → Pause → Weiter → Abbrechen.
Sind Räume ausgewählt, wird er zu „2 Räume saugen".

**Eine Störung übersteuert die Kartenfarbe** und färbt alles rot, mit dem Fehlertext
in derselben Pille wie die Windsperre der Storen-Karte. Ein stehender Roboter, der in
fröhlichem Violett leuchtet, wird übersehen.

**Bedienung.** Tippen auf den Kopf blättert durch Räume und Verbrauchsteile, Halten
öffnet das Detailfenster. Tippen auf eine Raumkachel wählt aus, **Halten saugt sofort
nur diesen Raum**. Tippen auf eine Stufe setzt sie.

**Räume sind herstellerabhängig.** Home Assistant hat dafür keine einheitliche
Schnittstelle; die Karte schickt `vacuum.send_command` mit `app_segment_clean` und den
Nummern als Parameter. Das passt für Roborock und Xiaomi. Verlangt dein Modell etwas
anderes, ändert `room_command` den Befehl. Ohne `rooms:` entfällt der ganze Block.

Die **Segment-Nummern** stehen nicht in Home Assistant, sondern in der App des
Herstellers — bei Roborock in der Kartenverwaltung, wenn man einen Raum antippt.

**Verbrauchsteile** in Prozent werden direkt gezeichnet. Zählt dein Sensor
Reststunden, gib mit `max:` den vollen Wert an, dann rechnet die Karte um. Unter 10 %
wird die Zeile rot.

## Beispiel-Dashboard

`dashboard-beispiel.yaml` enthält eine Startseite aus Raum-Karten und eine
Raumseite mit Reglern, Storen, Media und Klima. Einsetzen über
Dashboard → ⋮ → **Raw-Konfigurationseditor**, dann Bereichs-IDs und Entitäten anpassen.

## Was noch fehlt

Alle Karten tragen dasselbe dunkle Design.

Noch nicht gebaut: Klima-Ring, Energie-Card und die Statusleiste.

## Fehlersuche

**„Custom element doesn't exist"** — fast immer der Browser-Cache. Hart neu laden;
in der App: Einstellungen → Companion-App → Frontend-Cache leeren.

**„Bereich … nicht gefunden"** — es muss die Bereichs-*ID* sein, nicht der Name.
`{{ areas() }}` in den Entwicklerwerkzeugen listet sie auf.

**Gruppe bleibt leer** — die Geräte hängen an keinem Bereich. Entweder in Home Assistant
zuweisen oder `entities:` mit festen Listen benutzen.

**Schrift sieht anders aus** — die Karten laden Poppins von Google Fonts. Ohne Internet
fällt sie auf die Standardschrift zurück. Wer das nicht will, setzt im Theme `onyx-font`
auf eine lokale Schrift.

## Umstieg von Lavendel Cards

Bis Version 1.5.0 hiessen die Karten `lavendel-…`. Der Name kam vom ersten, hellen
Entwurf, den es seit der dunklen Fassung nicht mehr gibt. Ab 2.0.0 heissen sie
`onyx-…` — **ohne Rückwärtskompatibilität**: Die alten Namen sind nicht mehr
registriert, ein Dashboard mit `custom:lavendel-room-card` zeigt „Custom element
doesn't exist".

**1. In HACS austauschen**

HACS → Lavendel Cards → ⋮ → **Entfernen**. Dann ⋮ oben rechts →
**Benutzerdefinierte Repositories** → dieses Repository eintragen, Kategorie
**Dashboard** → herunterladen. Home Assistant neu starten.

**2. Dashboard-YAML anpassen**

Dashboard → ⋮ → **Raw-Konfigurationseditor**, dann alle sechs Vorkommen ersetzen:

| alt | neu |
|---|---|
| `custom:lavendel-room-card` | `custom:onyx-room-card` |
| `custom:lavendel-slider-card` | `custom:onyx-slider-card` |
| `custom:lavendel-cover-card` | `custom:onyx-cover-card` |
| `custom:lavendel-media-card` | `custom:onyx-media-card` |
| `custom:lavendel-actions-card` | `custom:onyx-actions-card` |
| `custom:lavendel-chart-card` | `custom:onyx-chart-card` |

Alle **Optionen bleiben unverändert** — `area:`, `color:`, `entities:`, `period:`,
`groups:`, alles. Es ändert sich nur das Wort vor dem Bindestrich. Wer die YAML in
einer Datei liegen hat, kommt mit einem Befehl durch:

```bash
sed -i 's/custom:lavendel-/custom:onyx-/g' ui-lovelace.yaml
```

**3. Theme austauschen**

Die CSS-Variablen heissen jetzt `--onyx-…` statt `--lav-…`. Das alte
`/config/themes/lavendel.yaml` löschen, `onyx.yaml` an dieselbe Stelle legen, unter
Entwicklerwerkzeuge → YAML → **Themes neu laden**, und im Benutzerprofil „Onyx"
auswählen. Ohne diesen Schritt funktionieren die Karten weiter, greifen aber auf ihre
eingebauten Farben zurück statt auf die des Themes.

**4. Alte Ressource entfernen**

Wer die Datei früher von Hand unter `/local/lavendel-cards.js` eingetragen hatte:
Einstellungen → Dashboards → ⋮ → **Ressourcen** → Eintrag löschen und
`/config/www/lavendel-cards.js` wegräumen.

## Umstieg von der Hand-Installation

Läuft die Datei schon unter `/local/`, muss der alte Eintrag weg — sonst sind zwei
Fassungen derselben Karten geladen und nur eine gewinnt:

1. Einstellungen → Dashboards → ⋮ → **Ressourcen** → Eintrag `/local/onyx-cards.js` löschen
2. `/config/www/onyx-cards.js` löschen (optional, aber sauberer)
3. In HACS herunterladen, Home Assistant neu starten, Browser hart neu laden

Das Theme unter `/config/themes/onyx.yaml` bleibt liegen — HACS liefert es nicht mit.

Passiert es doch, meldet sich die Karte in der Browser-Konsole mit einem Hinweis,
statt einfach weiß zu bleiben.

## Änderungen

**2.1.0** — Neue Saugroboter-Karte mit Akkuring, Raumauswahl und Verbrauchsteilen
**2.0.0** — Umbenannt: `lavendel-…` heisst jetzt `onyx-…`. Kein Rückwärtsbetrieb, siehe [Umstieg](#umstieg-von-lavendel-cards)
**1.5.0** — Zweisprachig: Texte, Zahlen- und Zeitformat folgen den Einstellungen von Home Assistant
**1.4.0** — Diagramm-Karte: weiche Linie ohne Überschwinger, Rauschen wird zusammengefasst
**1.3.0** — Regler, Storen und Schnellzugriffe im dunklen Design; Farbwahl auch dort
**1.2.0** — Visueller Editor für alle sechs Karten; brauchbare Startkonfiguration aus der Kartenauswahl
**1.1.0** — Neue Diagramm-Karte
**1.0.0** — Masse am Vorbild nachgemessen: Radius 24, Glasknöpfe, Coverblende
**0.9.0** — Raumname neben das Icon, Karte kompakter
**0.8.0** — Gruppenknöpfe umrandet statt gefüllt, grösser; aktive Farbe aus der Palette
**0.7.1** — Cover randlos mit weichem Übergang, Knöpfe und Regler nach Vorbild
**0.7.0** — Media-Karte im neuen Design, Kartengrund aus dem Cover
**0.6.0** — Tippen klappt auf, Halten schaltet; Kartenfarbe wählbar
**0.5.0** — Raum-Karte im dunklen Design; Theme auf Dunkel umgestellt
**0.4.0** — Schnellzugriff-Karte für Szenen, Skripte und Automationen
**0.3.0** — Raum-Karte: Geräte einzeln angeben mit `lights:`, `covers:`, `media:`, `climate:`
**0.2.2** — Hovern mit der Maus verstellte Werte und fror die Karte ein
**0.2.1** — Schutz gegen doppelt geladene Ressourcen (Umstieg auf HACS)
**0.2.0** — Media-Karte
**0.1.0** — Raum-Karte, Zieh-Regler, Storen-Karte, Theme

## Lizenz

MIT
