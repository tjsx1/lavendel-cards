# Lavendel Cards

Vier Lovelace-Karten für Home Assistant im Lavendel-Look: weiche helle Flächen,
Verlaufs-Akzente von Türkis über Violett nach Pink, für die Bedienung am Handy gebaut.

Keine Abhängigkeiten — weder button-card noch card-mod nötig.

| Karte | Was sie kann |
|---|---|
| `lavendel-room-card` | Raumübersicht, die pro Gerätegruppe **aufklappt** und jedes Gerät einzeln zeigt |
| `lavendel-slider-card` | Vertikaler Zieh-Regler für Licht, Storen oder Lautstärke |
| `lavendel-cover-card` | Storen mit Höhe, Lamellenwinkel, Fahrtasten und Windsperre |
| `lavendel-media-card` | Medienspieler mit Cover als Hintergrund, schrumpft wenn nichts läuft |

## Installation über HACS

1. HACS öffnen → oben rechts ⋮ → **Benutzerdefinierte Repositories**
2. URL dieses Repositories eintragen, Kategorie **Dashboard** (früher „Lovelace"), hinzufügen
3. „Lavendel Cards" suchen → **Herunterladen**
4. Home Assistant neu starten, danach den Browser hart neu laden (Strg + Shift + R)

HACS trägt die Ressource selbst ein — der Schritt unter Einstellungen → Dashboards → Ressourcen entfällt.

### Ohne HACS

`lavendel-cards.js` nach `/config/www/` kopieren, dann unter
Einstellungen → Dashboards → ⋮ → Ressourcen hinzufügen:

```
URL:  /local/lavendel-cards.js
Typ:  JavaScript-Modul
```

> Bei Home Assistant OS heißt der Ordner in der Samba-Freigabe `homeassistant` —
> das **ist** `/config`. Einen Unterordner `config` gibt es nicht.
> `www` gibt es frisch installiert noch nicht, den anlegen und danach
> Home Assistant einmal neu starten, sonst liefert `/local/` nichts aus.

## Theme

`lavendel.yaml` nach `/config/themes/` kopieren. In der `configuration.yaml` muss einmalig stehen:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

Dann Entwicklerwerkzeuge → YAML → **Themes neu laden**, und im Benutzerprofil „Lavendel" wählen.
Das Theme setzt auch die Variablen, aus denen die Karten ihren Verlauf und ihre Schatten lesen.
Ohne Theme funktionieren die Karten, sehen aber neutraler aus.

## Verwendung

### lavendel-room-card

Zwei Betriebsarten. **Bereich** — die Karte sucht sich alles selbst:

```yaml
type: custom:lavendel-room-card
area: wohnzimmer
navigation_path: /lovelace/wohnzimmer
```

**Eigene Listen** — du bestimmst genau, was erscheint und in welcher Reihenfolge:

```yaml
type: custom:lavendel-room-card
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
| `groups` | `[light, media_player, climate, cover]` | Reihenfolge der Icon-Gruppen |
| `navigation_path` | — | Wohin ein Tipp auf das Raum-Icon springt |

Ohne `area` musst du mindestens eine Liste angeben — sonst wüsste die Karte nicht,
was sie zeigen soll. Ohne Listen sortiert sie die Geräte des Bereichs alphabetisch;
mit Listen bleibt deine Reihenfolge stehen.

**Bedienung.** Tipp auf ein Gruppen-Icon schaltet die ganze Gruppe.
**Halten klappt sie auf** und zeigt jedes Gerät einzeln. In der Liste: Tipp = an/aus,
quer ziehen = Helligkeit oder Storenhöhe, Halten = Detailfenster.

### lavendel-slider-card

```yaml
type: custom:lavendel-slider-card
entity: light.wohnzimmer_decke
name: Decke
grid_options: { columns: 3, rows: 3 }
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | **Pflicht.** `light.*` oder `cover.*` |
| `name` | Gerätename | Beschriftung unter dem Regler |
| `icon` | automatisch | Glühbirne bzw. Store |
| `show_name` | `true` | Auf `false` setzen, wenn der Name stört |

Ziehen setzt den Wert, Tippen schaltet um, Halten öffnet das Detailfenster.
Vier passen nebeneinander.

### lavendel-cover-card

```yaml
type: custom:lavendel-cover-card
entity: cover.wohnzimmer_sued
lock_entity: binary_sensor.windwaechter
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | **Pflicht.** `cover.*` |
| `name` | Gerätename | Steht klein oben rechts |
| `lock_entity` | — | Binärsensor des Windwächters. Ist er `on`, wird die Karte gesperrt dargestellt und nimmt keine Befehle mehr an |
| `lock_label` | `Windwächter aktiv` | Text im Sperr-Hinweis |

Senkrecht über das Fenster ziehen setzt die Höhe. Der Lamellenregler erscheint nur,
wenn die Store das kann **und** nicht ganz oben steht. Während der Fahrt sind
Auf und Ab gedimmt und nur Stop trägt den Verlauf.

> Prozente sind bei Storen zweideutig — Home Assistant zählt **100 % = ganz offen**.
> Die Karte schreibt deshalb immer ein Wort dazu: „60 % offen" statt nur „60 %".

### lavendel-media-card

```yaml
type: custom:lavendel-media-card
entity: media_player.sonos_wohnzimmer
```

| Option | Vorgabe | Wirkung |
|---|---|---|
| `entity` | — | **Pflicht.** `media_player.*` |
| `name` | Gerätename | Beschriftung im Ruhezustand |
| `show_art` | `true` | `false` lässt das Cover weg und nimmt den dunklen Verlauf |
| `show_volume` | `true` | Blendet die Lautstärkezeile aus |

Der Fortschritt läuft sekundengenau weiter, auch zwischen zwei Zustandsmeldungen;
Ziehen darauf spult. Die Karte liest `supported_features` — kann der Spieler nicht
springen, sind Vor und Zurück gedimmt.

> Läuft nichts, schrumpft die Karte auf eine flache Kachel. Im Sections-Raster
> deshalb keine feste Zeilenzahl setzen.

## Beispiel-Dashboard

`dashboard-beispiel.yaml` enthält eine Startseite aus Raum-Karten und eine
Raumseite mit Reglern, Storen, Media und Klima. Einsetzen über
Dashboard → ⋮ → **Raw-Konfigurationseditor**, dann Bereichs-IDs und Entitäten anpassen.

## Was noch fehlt

Fünf weitere Bausteine sind entworfen, aber noch nicht gebaut: Klima-Ring mit
Strichskala, Energie-Card, Szenen-Quadrate und die Statusleiste. Bis dahin decken
die eingebauten Karten das im selben Look ab.

## Fehlersuche

**„Custom element doesn't exist"** — fast immer der Browser-Cache. Hart neu laden;
in der App: Einstellungen → Companion-App → Frontend-Cache leeren.

**„Bereich … nicht gefunden"** — es muss die Bereichs-*ID* sein, nicht der Name.
`{{ areas() }}` in den Entwicklerwerkzeugen listet sie auf.

**Gruppe bleibt leer** — die Geräte hängen an keinem Bereich. Entweder in Home Assistant
zuweisen oder `entities:` mit festen Listen benutzen.

**Schrift sieht anders aus** — die Karten laden Poppins von Google Fonts. Ohne Internet
fällt sie auf die Standardschrift zurück. Wer das nicht will, setzt im Theme `lav-font`
auf eine lokale Schrift.

## Umstieg von der Hand-Installation

Läuft die Datei schon unter `/local/`, muss der alte Eintrag weg — sonst sind zwei
Fassungen derselben Karten geladen und nur eine gewinnt:

1. Einstellungen → Dashboards → ⋮ → **Ressourcen** → Eintrag `/local/lavendel-cards.js` löschen
2. `/config/www/lavendel-cards.js` löschen (optional, aber sauberer)
3. In HACS herunterladen, Home Assistant neu starten, Browser hart neu laden

Das Theme unter `/config/themes/lavendel.yaml` bleibt liegen — HACS liefert es nicht mit.
Am Dashboard-YAML ändert sich nichts, die Kartennamen sind dieselben.

Passiert es doch, meldet sich die Karte in der Browser-Konsole mit einem Hinweis,
statt einfach weiß zu bleiben.

## Änderungen

**0.3.0** — Raum-Karte: Geräte einzeln angeben mit `lights:`, `covers:`, `media:`, `climate:`
**0.2.2** — Hovern mit der Maus verstellte Werte und fror die Karte ein
**0.2.1** — Schutz gegen doppelt geladene Ressourcen (Umstieg auf HACS)
**0.2.0** — Media-Karte
**0.1.0** — Raum-Karte, Zieh-Regler, Storen-Karte, Theme

## Lizenz

MIT
