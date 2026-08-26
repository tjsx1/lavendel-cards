/*!
 * Onyx Cards für Home Assistant
 * Version 2.5.0
 *
 * Enthält:
 *   custom:onyx-room-card    – Raum-Karte, aufklappbar pro Gerätegruppe
 *   custom:onyx-slider-card  – vertikaler Zieh-Regler (Licht, Storen, Lautstärke)
 *   custom:onyx-cover-card   – Storen mit Höhe, Lamellen und Fahrtasten
 *   custom:onyx-media-card   – Medienspieler mit Cover, Fortschritt und Lautstärke
 *   custom:onyx-actions-card – Schnellzugriffe für Szenen, Skripte, Automationen
 *   custom:onyx-chart-card   – bis zu drei Messwerte, einer davon als Verlauf
 *   custom:onyx-vacuum-card  – Saugroboter mit Akkuring, Räumen, Verbrauchsteilen
 *   custom:onyx-weather-card – Wetter mit gezeichneter Szene und Vorhersage
 *   custom:onyx-light-card   – Licht als eine Zeile, ausklappbar
 *
 * Installation:
 *   1. Datei nach /config/www/onyx-cards.js kopieren
 *   2. Einstellungen → Dashboards → ⋮ → Ressourcen → Hinzufügen
 *      URL /local/onyx-cards.js   ·   Typ: JavaScript-Modul
 *   3. Browser hart neu laden (Strg/Cmd + Shift + R)
 */

const ONYX_VERSION = '2.3.0';

console.info(
  `%c ONYX-CARDS %c ${ONYX_VERSION} `,
  'background:#15181d;color:#8ad2f2;border-radius:4px 0 0 4px;padding:2px 6px',
  'background:#2fa8f0;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px'
);

/* ------------------------------------------------------------------ *
 * Schrift einmalig ins Dokument hängen (Shadow DOM kann das nicht)
 * ------------------------------------------------------------------ */
let fontRequested = false;
function ensureFont() {
  if (fontRequested || typeof document === 'undefined') return;
  fontRequested = true;
  if (document.querySelector('link[data-onyx-font]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.onyxFont = '1';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
}

/* ------------------------------------------------------------------ *
 * Sprache und Zahlenformat
 *
 * Home Assistant kennt die Sprache seines Nutzers (`hass.locale.language`)
 * und getrennt davon, wie er Zahlen und Uhrzeiten geschrieben haben will
 * (`hass.locale.number_format`, `hass.locale.time_format`). Beides lesen
 * wir aus, statt Deutsch und Schweizer Zahlen fest einzubauen.
 *
 * Alle Karten auf einer Seite hängen am selben Home Assistant, deshalb
 * genügt eine Einstellung je Fenster — die spart es, die Sprache durch
 * jede einzelne Funktion durchzureichen.
 * ------------------------------------------------------------------ */

const STRINGS = {
  de: {
    room: 'Raum',
    vac: 'Saugroboter',
    w: 'Wetter',
    lt: 'Licht',
    'lt.color': 'Farbe',
    'lt.tapOn': 'Antippen schaltet ein',
    'err.needLight': 'Die Entität muss aus der Domäne "light" kommen.',
    'card.light': 'Onyx Licht-Karte',
    'card.light.d': 'Kompakt, mit ausklappbarer Farbe und Farbtemperatur',
    'ed.colors': 'Farbtupfer',
    'ed.show_color_temp': 'Farbtemperatur zeigen',
    'ed.show_colors': 'Farben zeigen',
    'ed.show_effects': 'Effekte zeigen',
    'ed.always_open': 'Immer ausgeklappt',
    'ed.h.always_open': 'Zeigt Farbtemperatur, Farben und Effekte ohne Antippen',
    'ed.h.colors': 'Hexwerte, mit Komma getrennt — leer lassen für die Vorgabe',
    'ed.h.light': 'Was das Leuchtmittel nicht kann, blendet die Karte von selbst aus',
    'w.temp': 'Temperatur',
    'w.wind': 'Wind',
    'w.lux': 'Licht',
    'w.hum': 'Feuchte',
    'w.daily': 'Tage',
    'w.hourly': 'Stunden',
    'w.today': 'Heute',
    'w.noForecast': 'Keine Vorhersage verfügbar',
    'w.tapPeriod': 'Antippen wechselt Tage und Stunden',
    'w.dirs': 'N,NNO,NO,ONO,O,OSO,SO,SSO,S,SSW,SW,WSW,W,WNW,NW,NNW',
    'cond.sunny': 'Sonnig',
    'cond.clear-night': 'Klar',
    'cond.partlycloudy': 'Teils bewölkt',
    'cond.cloudy': 'Bewölkt',
    'cond.rainy': 'Regen',
    'cond.pouring': 'Starkregen',
    'cond.snowy': 'Schnee',
    'cond.snowy-rainy': 'Schneeregen',
    'cond.fog': 'Nebel',
    'cond.hail': 'Hagel',
    'cond.lightning': 'Gewitter',
    'cond.lightning-rainy': 'Gewitter mit Regen',
    'cond.windy': 'Windig',
    'cond.windy-variant': 'Windig',
    'cond.exceptional': 'Unwetter',
    'cond.unavailable': 'Nicht erreichbar',
    'cond.unknown': 'Unbekannt',
    'err.needWeather': 'Die Entität muss aus der Domäne "weather" kommen.',
    'err.forecast': 'forecast muss daily, hourly oder none sein.',
    'card.weather': 'Onyx Wetter-Karte',
    'card.weather.d': 'Gezeichnete Wetterszene, Messwerte und Vorhersage',
    'ed.forecast': 'Vorhersage',
    'ed.forecast_count': 'Anzahl Spalten',
    'ed.illuminance': 'Beleuchtungsstärke',
    'ed.wind': 'Wind',
    'ed.sun': 'Sonnenstand',
    'ed.h.forecast': 'Tage, Stunden oder ausblenden',
    'ed.h.station': 'Aus der eigenen Wetterstation; leer lassen für die Werte des Dienstes',
    'ed.h.illuminance': 'Nur aus der eigenen Station — Wetterdienste liefern das nicht',
    'ed.h.sun': 'Entscheidet, ob nachts der Mond gezeichnet wird',
    'ed.fc.daily': 'Tage',
    'ed.fc.hourly': 'Stunden',
    'ed.fc.none': 'Keine',
    'vac.cleaning': 'saugt',
    'vac.paused': 'pausiert',
    'vac.returning': 'kehrt zurück',
    'vac.stopped': 'steht',
    'vac.idle': 'bereit',
    'vac.charging': 'lädt',
    'vac.charged': 'geladen',
    'vac.docked': 'An der Ladestation',
    'vac.toDock': 'Auf dem Weg zur Station',
    'vac.errorGeneric': 'Störung',
    'vac.start': 'Starten',
    'vac.pause': 'Pause',
    'vac.resume': 'Weiter',
    'vac.cancel': 'Abbrechen',
    'vac.cleanRoom': '1 Raum saugen',
    'vac.cleanRooms': '{n} Räume saugen',
    'vac.rooms': 'Räume',
    'vac.selected': '{n} ausgewählt',
    'vac.consumables': 'Verbrauchsteile',
    'vac.due': '{n} fällig',
    'vac.since': 'seit {t}',
    'vac.minutes': '{n} Min',
    'vac.area': '{n} m²',
    'err.needVacuum': 'Die Entität muss aus der Domäne "vacuum" kommen.',
    'card.vacuum': 'Onyx Saugroboter-Karte',
    'card.vacuum.d': 'Akkuring, Räume und Verbrauchsteile',
    'ed.battery_entity': 'Akku-Sensor',
    'ed.show_fan_speed': 'Saugstufen anzeigen',
    'ed.rooms': 'Räume',
    'ed.consumables': 'Verbrauchsteile',
    'ed.room_command': 'Befehl für Räume',
    'ed.id': 'Segment-Nummer',
    'ed.max': 'Voller Wert',
    'ed.h.battery_entity': 'Leer lassen: die Karte sucht den Akku beim selben Gerät',
    'ed.h.room_command': 'Roborock und Xiaomi: app_segment_clean',
    'ed.h.rooms': 'Die Segment-Nummern stehen in der App des Herstellers',
    'ed.h.consumables': 'Sensoren in Prozent; für Stundenzähler den vollen Wert angeben',
    'ed.addRoom': 'Raum',
    inRoom: '{g} im Raum',
    'log.dup': '"{tag}" ist bereits registriert — diese Datei ({v}) wird ignoriert. '
      + 'Vermutlich sind zwei Ressourcen eingetragen: die alte unter /local/ und die von '
      + 'HACS unter /hacsfiles/. Den alten Eintrag unter Einstellungen → Dashboards → ⋮ → '
      + 'Ressourcen entfernen.',
    'log.editorLoad': 'Editor-Bündel liess sich nicht vorladen:',
    'group.light': 'Lichter',
    'group.media_player': 'Medien',
    'group.climate': 'Klima',
    'group.cover': 'Storen',
    lightOn: '{n} Licht an',
    lightsOn: '{n} Lichter an',
    musicPlaying: 'Musik läuft',
    heating: 'heizt',
    cooling: 'kühlt',
    coverOpen: '{n} Store offen',
    coversOpen: '{n} Storen offen',
    allOff: 'Alles aus',
    unavailable: 'Nicht erreichbar',
    on: 'An',
    off: 'Aus',
    open: 'Offen',
    closed: 'Zu',
    pctOpen: '{n} % offen',
    playing: 'Läuft',
    nOfMOpen: '{n} von {m} offen',
    nOfMOn: '{n} von {m} an',
    closeAllCovers: 'Alle Storen zu',
    turnAllOff: 'Alle aus',

    windLock: 'Windwächter aktiv',
    slats: 'Lamellen',
    slatsAngle: 'Lamellen {n}°',
    opening: 'fährt auf',
    closing: 'fährt zu',

    speaker: 'Lautsprecher',
    nothingPlaying: 'Nichts läuft',

    armed: 'Scharf',
    disabled: 'Deaktiviert',
    running: 'Läuft',
    ready: 'Bereit',
    scene: 'Szene',
    lastRun: 'Zuletzt {time}',
    nActive: '{n} von {m} aktiv',

    history: 'Verlauf',
    'period.tag': 'Tag',
    'period.woche': 'Woche',
    'period.monat': 'Monat',
    'period.jahr': 'Jahr',
    noHistory: 'Kein Verlauf für diesen Zeitraum',
    historyFailed: 'Verlauf nicht verfügbar',
    tapToSwitch: 'Wert antippen wechselt den Graphen',

    'err.entity': 'Entität {id} gibt es nicht.',
    'err.needEntity': 'Bitte "entity" angeben.',
    'err.needArea': 'Bitte "area" angeben (die Bereichs-ID) oder Listen wie "lights:", "covers:", "media:".',
    'err.area': 'Bereich "{id}" nicht gefunden.',
    'err.color': 'Farbe "{c}" gibt es nicht. Möglich: {list}',
    'err.needActions': 'Bitte "actions:" oder "groups:" mit Einträgen angeben.',
    'err.needEntities': 'Bitte "entities:" mit ein bis drei Sensoren angeben.',
    'err.tooMany': 'Höchstens drei Entitäten — sonst wird die Spalte zur Liste.',
    'err.period': 'period muss tag, woche, monat oder jahr sein.',

    'card.room': 'Onyx Raum-Karte',
    'card.room.d': 'Raumübersicht, die pro Gerätegruppe aufklappt',
    'card.slider': 'Onyx Zieh-Regler',
    'card.slider.d': 'Vertikaler Regler für Licht, Storen oder Lautstärke',
    'card.cover': 'Onyx Storen-Karte',
    'card.cover.d': 'Storen mit Höhe, Lamellen und Fahrtasten',
    'card.media': 'Onyx Media-Karte',
    'card.media.d': 'Cover als Hintergrund, schrumpft wenn nichts läuft',
    'card.actions': 'Onyx Schnellzugriffe',
    'card.actions.d': 'Szenen, Skripte und Automationen in einem Rahmen',
    'card.chart': 'Onyx Diagramm-Karte',
    'card.chart.d': 'Bis zu drei Messwerte, einer davon als Verlauf',

    'ed.entity': 'Entität',
    'ed.entities': 'Entitäten',
    'ed.area': 'Bereich',
    'ed.name': 'Name',
    'ed.label': 'Beschriftung',
    'ed.icon': 'Symbol',
    'ed.color': 'Farbe',
    'ed.title': 'Titel',
    'ed.shape': 'Form',
    'ed.columns': 'Spalten',
    'ed.period': 'Zeitraum',
    'ed.temperature': 'Temperatur-Sensor',
    'ed.humidity': 'Feuchte-Sensor',
    'ed.navigation_path': 'Ziel des Pfeils',
    'ed.groups': 'Sichtbare Gruppen',
    'ed.lights': 'Lampen',
    'ed.covers': 'Storen',
    'ed.media': 'Medienspieler',
    'ed.climate': 'Heizung',
    'ed.lock_entity': 'Sperre',
    'ed.lock_label': 'Text bei Sperre',
    'ed.show_name': 'Namen anzeigen',
    'ed.show_art': 'Cover anzeigen',
    'ed.show_volume': 'Lautstärke anzeigen',
    'ed.tinted': 'Fläche einfärben',
    'ed.grouped': 'In Gruppen aufteilen',
    'ed.h.color': 'Sieben Paletten — oder ein eigener Hexwert wie #00b3a4',
    'ed.h.area': 'Ohne Listen unten zeigt die Karte alle Geräte dieses Bereichs',
    'ed.h.navigation_path': 'z. B. /lovelace/wohnzimmer',
    'ed.h.lock_entity': 'Steht diese Entität auf "an", sind die Fahrtasten gesperrt',
    'ed.h.sensor': 'Leer lassen: die Karte sucht selbst einen Sensor im Bereich',
    'ed.h.entities': 'Ein bis drei Messwerte',
    'ed.h.columns': 'Gilt nicht für Kacheln und Leiste',
    'ed.roomHint': 'Die vier Listen leer lassen: dann zeigt die Karte alle passenden Geräte '
      + 'des Bereichs, alphabetisch. Eigene Namen und Symbole je Gerät gibt es nur im '
      + 'Code-Editor — der Editor hier lässt sie unangetastet.',
    'ed.tooMany': 'Höchstens drei Messwerte — die überzähligen wurden verworfen.',
    'ed.addAction': 'Aktion',
    'ed.addGroup': 'Gruppe',
    'ed.shape.squares': 'Quadrate',
    'ed.shape.chips': 'Chips',
    'ed.shape.tiles': 'Kacheln',
    'ed.shape.rail': 'Leiste',
    'ed.c.blau': 'Blau', 'ed.c.gruen': 'Grün', 'ed.c.gelb': 'Gelb',
    'ed.c.orange': 'Orange', 'ed.c.rot': 'Rot', 'ed.c.violett': 'Violett',
    'ed.c.rosa': 'Rosa',
    'ed.g.light': 'Lampen', 'ed.g.cover': 'Storen',
    'ed.g.media_player': 'Medienspieler', 'ed.g.climate': 'Heizung',
    'ed.newGroup': 'Szenen'
  },

  en: {
    room: 'Room',
    vac: 'Vacuum',
    w: 'Weather',
    lt: 'Light',
    'lt.color': 'Color',
    'lt.tapOn': 'Tap to switch on',
    'err.needLight': 'The entity must come from the "light" domain.',
    'card.light': 'Onyx Light Card',
    'card.light.d': 'Compact, with color and color temperature on tap',
    'ed.colors': 'Swatches',
    'ed.show_color_temp': 'Show color temperature',
    'ed.show_colors': 'Show colors',
    'ed.show_effects': 'Show effects',
    'ed.always_open': 'Always expanded',
    'ed.h.always_open': 'Shows color temperature, colors and effects without tapping',
    'ed.h.colors': 'Hex values, comma separated — leave empty for the default set',
    'ed.h.light': 'Whatever the bulb cannot do, the card hides by itself',
    'w.temp': 'Temperature',
    'w.wind': 'Wind',
    'w.lux': 'Light',
    'w.hum': 'Humidity',
    'w.daily': 'Days',
    'w.hourly': 'Hours',
    'w.today': 'Today',
    'w.noForecast': 'No forecast available',
    'w.tapPeriod': 'Tap to switch days and hours',
    'w.dirs': 'N,NNE,NE,ENE,E,ESE,SE,SSE,S,SSW,SW,WSW,W,WNW,NW,NNW',
    'cond.sunny': 'Sunny',
    'cond.clear-night': 'Clear',
    'cond.partlycloudy': 'Partly cloudy',
    'cond.cloudy': 'Cloudy',
    'cond.rainy': 'Rain',
    'cond.pouring': 'Heavy rain',
    'cond.snowy': 'Snow',
    'cond.snowy-rainy': 'Sleet',
    'cond.fog': 'Fog',
    'cond.hail': 'Hail',
    'cond.lightning': 'Thunderstorm',
    'cond.lightning-rainy': 'Thunderstorm with rain',
    'cond.windy': 'Windy',
    'cond.windy-variant': 'Windy',
    'cond.exceptional': 'Severe weather',
    'cond.unavailable': 'Unavailable',
    'cond.unknown': 'Unknown',
    'err.needWeather': 'The entity must come from the "weather" domain.',
    'err.forecast': 'forecast must be daily, hourly or none.',
    'card.weather': 'Onyx Weather Card',
    'card.weather.d': 'Drawn weather scene, readings and forecast',
    'ed.forecast': 'Forecast',
    'ed.forecast_count': 'Columns',
    'ed.illuminance': 'Illuminance',
    'ed.wind': 'Wind',
    'ed.sun': 'Sun position',
    'ed.h.forecast': 'Days, hours or hidden',
    'ed.h.station': 'From your own weather station; leave empty for the service values',
    'ed.h.illuminance': 'Only from your own station — weather services do not provide it',
    'ed.h.sun': 'Decides whether the moon is drawn at night',
    'ed.fc.daily': 'Days',
    'ed.fc.hourly': 'Hours',
    'ed.fc.none': 'None',
    'vac.cleaning': 'cleaning',
    'vac.paused': 'paused',
    'vac.returning': 'returning',
    'vac.stopped': 'stopped',
    'vac.idle': 'idle',
    'vac.charging': 'charging',
    'vac.charged': 'charged',
    'vac.docked': 'Docked',
    'vac.toDock': 'On the way to the dock',
    'vac.errorGeneric': 'Error',
    'vac.start': 'Start',
    'vac.pause': 'Pause',
    'vac.resume': 'Resume',
    'vac.cancel': 'Stop',
    'vac.cleanRoom': 'Clean 1 room',
    'vac.cleanRooms': 'Clean {n} rooms',
    'vac.rooms': 'Rooms',
    'vac.selected': '{n} selected',
    'vac.consumables': 'Consumables',
    'vac.due': '{n} due',
    'vac.since': 'for {t}',
    'vac.minutes': '{n} min',
    'vac.area': '{n} m²',
    'err.needVacuum': 'The entity must come from the "vacuum" domain.',
    'card.vacuum': 'Onyx Vacuum Card',
    'card.vacuum.d': 'Battery ring, rooms and consumables',
    'ed.battery_entity': 'Battery sensor',
    'ed.show_fan_speed': 'Show fan speeds',
    'ed.rooms': 'Rooms',
    'ed.consumables': 'Consumables',
    'ed.room_command': 'Room command',
    'ed.id': 'Segment number',
    'ed.max': 'Full value',
    'ed.h.battery_entity': 'Leave empty and the card looks for the battery on the same device',
    'ed.h.room_command': 'Roborock and Xiaomi: app_segment_clean',
    'ed.h.rooms': 'The segment numbers are listed in the vendor app',
    'ed.h.consumables': 'Percentage sensors; for hour counters give the full value',
    'ed.addRoom': 'Room',
    inRoom: '{g} in this room',
    'log.dup': '"{tag}" is already registered — this file ({v}) is being ignored. '
      + 'Most likely two resources are set up: the old one under /local/ and the HACS one '
      + 'under /hacsfiles/. Remove the old entry under Settings → Dashboards → ⋮ → Resources.',
    'log.editorLoad': 'Could not preload the editor bundle:',
    'group.light': 'Lights',
    'group.media_player': 'Media',
    'group.climate': 'Climate',
    'group.cover': 'Blinds',
    lightOn: '{n} light on',
    lightsOn: '{n} lights on',
    musicPlaying: 'Music playing',
    heating: 'heating',
    cooling: 'cooling',
    coverOpen: '{n} blind open',
    coversOpen: '{n} blinds open',
    allOff: 'All off',
    unavailable: 'Unavailable',
    on: 'On',
    off: 'Off',
    open: 'Open',
    closed: 'Closed',
    pctOpen: '{n} % open',
    playing: 'Playing',
    nOfMOpen: '{n} of {m} open',
    nOfMOn: '{n} of {m} on',
    closeAllCovers: 'Close all blinds',
    turnAllOff: 'All off',

    windLock: 'Wind guard active',
    slats: 'Slats',
    slatsAngle: 'Slats {n}°',
    opening: 'opening',
    closing: 'closing',

    speaker: 'Speaker',
    nothingPlaying: 'Nothing playing',

    armed: 'Armed',
    disabled: 'Disabled',
    running: 'Running',
    ready: 'Ready',
    scene: 'Scene',
    lastRun: 'Last {time}',
    nActive: '{n} of {m} active',

    history: 'History',
    'period.tag': 'Day',
    'period.woche': 'Week',
    'period.monat': 'Month',
    'period.jahr': 'Year',
    noHistory: 'No history for this period',
    historyFailed: 'History unavailable',
    tapToSwitch: 'Tap a value to switch the graph',

    'err.entity': 'Entity {id} does not exist.',
    'err.needEntity': 'Please set "entity".',
    'err.needArea': 'Please set "area" (the area ID) or lists such as "lights:", "covers:", "media:".',
    'err.area': 'Area "{id}" not found.',
    'err.color': 'Unknown color "{c}". Available: {list}',
    'err.needActions': 'Please set "actions:" or "groups:" with entries.',
    'err.needEntities': 'Please set "entities:" with one to three sensors.',
    'err.tooMany': 'Three entities at most — beyond that the column becomes a list.',
    'err.period': 'period must be day, week, month or year.',

    'card.room': 'Onyx Room Card',
    'card.room.d': 'Room overview that expands per device group',
    'card.slider': 'Onyx Slider',
    'card.slider.d': 'Vertical slider for lights, blinds or volume',
    'card.cover': 'Onyx Blind Card',
    'card.cover.d': 'Blinds with height, slats and travel buttons',
    'card.media': 'Onyx Media Card',
    'card.media.d': 'Cover art as the background, shrinks when idle',
    'card.actions': 'Onyx Quick Actions',
    'card.actions.d': 'Scenes, scripts and automations in one frame',
    'card.chart': 'Onyx Chart Card',
    'card.chart.d': 'Up to three readings, one of them as a graph',

    'ed.entity': 'Entity',
    'ed.entities': 'Entities',
    'ed.area': 'Area',
    'ed.name': 'Name',
    'ed.label': 'Caption',
    'ed.icon': 'Icon',
    'ed.color': 'Color',
    'ed.title': 'Title',
    'ed.shape': 'Shape',
    'ed.columns': 'Columns',
    'ed.period': 'Period',
    'ed.temperature': 'Temperature sensor',
    'ed.humidity': 'Humidity sensor',
    'ed.navigation_path': 'Arrow target',
    'ed.groups': 'Visible groups',
    'ed.lights': 'Lights',
    'ed.covers': 'Blinds',
    'ed.media': 'Media players',
    'ed.climate': 'Thermostats',
    'ed.lock_entity': 'Lock',
    'ed.lock_label': 'Text while locked',
    'ed.show_name': 'Show name',
    'ed.show_art': 'Show cover art',
    'ed.show_volume': 'Show volume',
    'ed.tinted': 'Tint the background',
    'ed.grouped': 'Split into groups',
    'ed.h.color': 'Seven palettes — or your own hex value such as #00b3a4',
    'ed.h.area': 'Without the lists below the card shows every device in this area',
    'ed.h.navigation_path': 'e.g. /lovelace/living-room',
    'ed.h.lock_entity': 'While this entity is "on" the travel buttons are locked',
    'ed.h.sensor': 'Leave empty and the card looks for a sensor in the area itself',
    'ed.h.entities': 'One to three readings',
    'ed.h.columns': 'Does not apply to tiles and rail',
    'ed.roomHint': 'Leave the four lists empty and the card shows every matching device '
      + 'in the area, alphabetically. Per-device names and icons are only available in '
      + 'the code editor — this editor leaves them untouched.',
    'ed.tooMany': 'Three readings at most — the surplus was dropped.',
    'ed.addAction': 'Action',
    'ed.addGroup': 'Group',
    'ed.shape.squares': 'Squares',
    'ed.shape.chips': 'Chips',
    'ed.shape.tiles': 'Tiles',
    'ed.shape.rail': 'Rail',
    'ed.c.blau': 'Blue', 'ed.c.gruen': 'Green', 'ed.c.gelb': 'Yellow',
    'ed.c.orange': 'Orange', 'ed.c.rot': 'Red', 'ed.c.violett': 'Violet',
    'ed.c.rosa': 'Pink',
    'ed.g.light': 'Lights', 'ed.g.cover': 'Blinds',
    'ed.g.media_player': 'Media players', 'ed.g.climate': 'Thermostats',
    'ed.newGroup': 'Scenes'
  }
};

/** Sprache der Oberfläche; Englisch ist der Rückfall für alles Unbekannte */
let LANG = 'en';
/** Kürzel für Intl — Zahlen, Datum, Uhrzeit */
let NUM_LOCALE = 'en';
let DATE_LOCALE = 'en';
let HOUR12 = null;

/**
 * Home Assistant trennt Anzeigesprache und Zahlenformat. Wer die
 * Oberfläche auf Englisch stellt, aber "1.234,56" sehen will, soll das
 * bekommen — also lesen wir beide Einstellungen einzeln aus.
 */
const NUMBER_LOCALE = {
  comma_decimal: 'en-US',     // 1,234.56
  decimal_comma: 'de-DE',     // 1.234,56
  space_comma: 'fr-FR',       // 1 234,56
  none: null                  // ohne Tausendertrennung
};

function applyLocale(hass) {
  const loc = (hass && hass.locale) || {};
  const lang = loc.language || (hass && hass.language) || 'en';
  const short = String(lang).slice(0, 2).toLowerCase();
  LANG = STRINGS[short] ? short : 'en';
  DATE_LOCALE = lang;

  const nf = loc.number_format;
  NUM_LOCALE = nf && NUMBER_LOCALE[nf] !== undefined ? NUMBER_LOCALE[nf] : lang;

  HOUR12 = loc.time_format === '12' ? true : loc.time_format === '24' ? false : null;
}

/** Text nachschlagen. `{n}` und Freunde werden ersetzt. */
function t(key, vars) {
  let s = STRINGS[LANG][key];
  if (s == null) s = STRINGS.en[key];
  if (s == null) return key;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(vars[k]);
  }
  return s;
}

/** Uhrzeit im Format des Nutzers */
function fmtTime(d, opts) {
  const o = Object.assign({ hour: '2-digit', minute: '2-digit' }, opts);
  if (HOUR12 !== null) o.hour12 = HOUR12;
  try { return d.toLocaleTimeString(DATE_LOCALE, o); }
  catch (err) { return d.toLocaleTimeString(undefined, o); }
}

/** Datum im Format des Nutzers */
function fmtDate(d, opts) {
  try { return d.toLocaleDateString(DATE_LOCALE, opts); }
  catch (err) { return d.toLocaleDateString(undefined, opts); }
}

/** Zahl im Format des Nutzers */
function fmtNum(v, opts) {
  if (NUM_LOCALE === null) {
    return v.toLocaleString('en-US', Object.assign({ useGrouping: false }, opts));
  }
  try { return v.toLocaleString(NUM_LOCALE, opts); }
  catch (err) { return v.toLocaleString(undefined, opts); }
}

/**
 * Sprache für die Kartenauswahl. Die wird beim Laden der Datei
 * eingetragen, lange bevor es ein `hass` gibt — deshalb hier ausnahmsweise
 * die Browsersprache. Sie stimmt fast immer mit der von Home Assistant
 * überein, und wenn nicht, steht in der Auswahlliste eben Englisch.
 */
function bootLang() {
  const l = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  const short = String(l).slice(0, 2).toLowerCase();
  return STRINGS[short] ? short : 'en';
}

// Bis das erste `hass` eintrifft, gilt die Browsersprache — davon leben
// die Einträge in der Kartenauswahl und die Meldungen in der Konsole.
LANG = bootLang();

/* ------------------------------------------------------------------ *
 * Hilfsfunktionen
 * ------------------------------------------------------------------ */
const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const DEAD = ['unavailable', 'unknown', 'none', null, undefined];
const isDead = (st) => !st || DEAD.includes(st.state);

function isOn(st) {
  if (isDead(st)) return false;
  const d = st.entity_id.split('.')[0];
  if (d === 'media_player') return ['playing', 'paused', 'buffering', 'on'].includes(st.state);
  if (d === 'climate') return st.state !== 'off';
  if (d === 'cover') return st.state === 'open' || (st.attributes.current_position || 0) > 0;
  return st.state === 'on';
}

/** Prozentwert eines Geräts: Helligkeit bzw. Storenposition. -1 = kein Wert */
function pctOf(st) {
  if (isDead(st)) return -1;
  const d = st.entity_id.split('.')[0];
  if (d === 'light') {
    if (st.state !== 'on') return 0;
    const b = st.attributes.brightness;
    return b == null ? 100 : Math.round((b / 255) * 100);
  }
  if (d === 'cover') {
    const p = st.attributes.current_position;
    return p == null ? (st.state === 'open' ? 100 : 0) : Math.round(p);
  }
  if (d === 'media_player') {
    const v = st.attributes.volume_level;
    return v == null ? -1 : Math.round(v * 100);
  }
  return -1;
}

function nameOf(hass, id, fallback) {
  const st = hass.states[id];
  return (st && st.attributes.friendly_name) || fallback || id;
}

/** Entitäten eines Bereichs, ohne Diagnose-, versteckte und deaktivierte */
function entitiesInArea(hass, areaId, domain) {
  const reg = hass.entities || {};
  const devs = hass.devices || {};
  const out = [];
  for (const id of Object.keys(reg)) {
    if (!id.startsWith(domain + '.')) continue;
    const e = reg[id];
    if (e.hidden || e.hidden_by || e.disabled_by || e.entity_category) continue;
    const area = e.area_id || (e.device_id && devs[e.device_id] ? devs[e.device_id].area_id : null);
    if (area === areaId) out.push(id);
  }
  return out.sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b), 'de'));
}

function fireMoreInfo(el, entityId) {
  el.dispatchEvent(new CustomEvent('hass-more-info', {
    detail: { entityId }, bubbles: true, composed: true
  }));
}

function navigate(el, path) {
  history.pushState(null, '', path);
  el.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
}

function haptic(el, kind) {
  el.dispatchEvent(new CustomEvent('haptic', { detail: kind, bubbles: true, composed: true }));
}

/* ------------------------------------------------------------------ *
 * Gemeinsame Optik
 * ------------------------------------------------------------------ */
const BASE_CSS = `
:host{
  --grad: var(--onyx-grad, linear-gradient(135deg,#4ec5e8 0%,#7b6bf0 52%,#e7599b 100%));
  --glow: var(--onyx-glow, 0 6px 16px rgba(123,107,240,.35));
  --soft: var(--onyx-soft, 0 2px 10px rgba(80,66,160,.07));
  --surface: var(--card-background-color,#f7f7fa);
  --surface-on: var(--onyx-card-on,#ffffff);
  --ink: var(--primary-text-color,#1c1c22);
  --ink2: var(--secondary-text-color,#6b6b78);
  --ink3: var(--onyx-ink3,#a3a3b0);
  --line: var(--divider-color,#ebebf1);
  --flat: var(--onyx-flat, rgba(120,120,140,.10));
  --r-card: var(--onyx-radius, 20px);
  font-family: var(--onyx-font, 'Poppins', var(--paper-font-body1_-_font-family, inherit));
  display:block;
}
ha-card{
  display:block;
  background:var(--surface); border-radius:var(--r-card); border:none;
  box-shadow:none; padding:15px; overflow:hidden;
  transition:background .18s ease, box-shadow .18s ease;
}
ha-card.on{ background:var(--surface-on); box-shadow:var(--soft); }
.ico{
  width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;
  background:var(--surface-on);color:var(--ink2);box-shadow:var(--soft);
  --mdc-icon-size:20px;
}
.ico.flat{ background:var(--flat); color:var(--ink3); box-shadow:none; }
.ico.grad{ background:var(--grad); color:#fff; box-shadow:var(--glow); }
.held{ transform:scale(.96); }
*{ box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
.pressable{ cursor:pointer; transition:transform .12s ease; touch-action:manipulation; }
`;

/* ------------------------------------------------------------------ *
 * Basisklasse: rendert nur neu, wenn sich wirklich etwas geändert hat
 * ------------------------------------------------------------------ */
class OnyxBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._busy = false;      // während Ziehen kein Neuaufbau
    this._sig = null;
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._sig = null;
    ensureFont();
    this._tryRender();
  }

  /**
   * Sicherheitsnetz für die Zieh-Sperre. Verschluckt der Browser ein
   * Loslassen — abgebrochene Touch-Geste, Fenster verliert den Fokus —
   * bliebe die Karte sonst für immer eingefroren.
   */
  connectedCallback() {
    if (!this._release) {
      this._release = () => {
        if (this._busy) { this._busy = false; this._tryRender(); }
      };
      window.addEventListener('pointerup', this._release);
      window.addEventListener('pointercancel', this._release);
      window.addEventListener('blur', this._release);
    }
  }

  disconnectedCallback() {
    if (this._release) {
      window.removeEventListener('pointerup', this._release);
      window.removeEventListener('pointercancel', this._release);
      window.removeEventListener('blur', this._release);
      this._release = null;
    }
  }

  set hass(hass) {
    this._hass = hass;
    applyLocale(hass);
    this._tryRender();
  }
  get hass() { return this._hass; }

  _tryRender() {
    if (!this._hass || !this._config || this._busy) return;
    let model;
    try {
      model = this._model();
    } catch (err) {
      this._error(err);
      return;
    }
    const sig = JSON.stringify(model);
    if (sig === this._sig) return;
    this._sig = sig;
    try {
      this.shadowRoot.innerHTML =
        `<style>${BASE_CSS}${this.constructor.CSS || ''}</style>${this._html(model)}`;
      this._bind(model);
    } catch (err) {
      this._sig = null;
      this._error(err);
    }
  }

  /** Freundliche Fehlerkarte statt einer weissen Fläche */
  _error(err) {
    this.shadowRoot.innerHTML =
      `<style>${BASE_CSS}</style><ha-card><div style="color:#c0392b;font-size:13px">
       Onyx: ${esc(err.message)}</div></ha-card>`;
  }

  /** erzwingt Neuaufbau nach lokaler Zustandsänderung (Auf-/Zuklappen) */
  _repaint() { this._sig = null; this._tryRender(); }

  /**
   * Tippen / Halten auf einem Element.
   * Ziehen kann optional aktiviert werden (onDrag/onDrop in Prozent).
   */
  _press(el, opts) {
    const holdMs = 500;
    // "down" ist der wichtigste Zustand hier: Ohne ihn hält eine blosse
    // Mausbewegung über der Karte schon für ein Ziehen her.
    let timer = null, held = false, dragging = false, down = false, sx = 0, sy = 0;

    const pctFrom = (ev) => {
      const r = el.getBoundingClientRect();
      if (opts.axis === 'y') return clamp(Math.round(((r.bottom - ev.clientY) / r.height) * 100), 0, 100);
      return clamp(Math.round(((ev.clientX - r.left) / r.width) * 100), 0, 100);
    };

    el.addEventListener('pointerdown', (ev) => {
      if (ev.button != null && ev.button > 0) return;   // Rechts- und Mittelklick ignorieren
      down = true; held = false; dragging = false;
      sx = ev.clientX; sy = ev.clientY;
      el.setPointerCapture && el.setPointerCapture(ev.pointerId);
      el.classList.add('held');
      if (opts.onHold) {
        timer = setTimeout(() => { held = true; haptic(this, 'medium'); opts.onHold(); }, holdMs);
      }
    });

    el.addEventListener('pointermove', (ev) => {
      if (!down) return;                                 // blosses Hovern ist kein Ziehen
      const dx = Math.abs(ev.clientX - sx), dy = Math.abs(ev.clientY - sy);
      if (!dragging && opts.onDrag && Math.max(dx, dy) > 8) {
        dragging = true; this._busy = true; clearTimeout(timer);
      }
      if (dragging) { ev.preventDefault(); opts.onDrag(pctFrom(ev)); }
      else if (Math.max(dx, dy) > 10) clearTimeout(timer);
    });

    const finish = (ev, cancelled) => {
      if (!down) return;
      down = false;
      clearTimeout(timer);
      el.classList.remove('held');
      if (dragging) {
        this._busy = false;
        if (!cancelled) { haptic(this, 'light'); opts.onDrop && opts.onDrop(pctFrom(ev)); }
        this._repaint();
      } else if (!held && !cancelled) {
        haptic(this, 'light');
        opts.onTap && opts.onTap();
      }
      dragging = false; held = false;
    };

    el.addEventListener('pointerup', (ev) => finish(ev, false));
    el.addEventListener('pointercancel', (ev) => finish(ev, true));
  }

  call(domain, service, data) {
    this._hass.callService(domain, service, data);
  }
}

/* ================================================================== *
 * 1) RAUM-KARTE
 * ================================================================== */

const GROUPS = {
  light:        { icon: 'mdi:lightbulb' },
  media_player: { icon: 'mdi:music-note' },
  climate:      { icon: 'mdi:thermostat' },
  cover:        { icon: 'mdi:window-shutter' }
};

/** Kartenfarben. Deutsch und englisch geschrieben führen zur selben Palette. */
const PALETTES = {
  blau: 'blau', blue: 'blau',
  gruen: 'gruen', grün: 'gruen', green: 'gruen',
  gelb: 'gelb', yellow: 'gelb',
  orange: 'orange',
  rot: 'rot', red: 'rot',
  violett: 'violett', violet: 'violett', purple: 'violett', lila: 'violett',
  rosa: 'rosa', pink: 'rosa'
};

/**
 * Eigene Farbe als Hex: daraus werden die vier Werte der Palette gerechnet.
 * Der Verlauf bleibt dunkel genug zum Lesen, der Akzent hell genug zum Sehen.
 */
function paletteFromHex(hex) {
  return [
    `--w1:color-mix(in srgb, ${hex} 20%, #0c0e12)`,
    `--w2:color-mix(in srgb, ${hex} 42%, #0c0e12)`,
    `--acc:color-mix(in srgb, ${hex} 55%, #ffffff)`,
    `--sub:color-mix(in srgb, ${hex} 62%, #9bb0c0)`,
    `--lab:color-mix(in srgb, ${hex} 40%, #8fa3b3)`,
    `--btn:color-mix(in srgb, ${hex} 88%, #ffffff)`
  ].join(';');
}


/* ------------------------------------------------------------------ *
 * Sieben Paletten, von allen Karten geteilt. Jede setzt die beiden
 * Ecken des Verlaufs, den Ton für Werte und die Farbe des aktiven Knopfes.
 * ------------------------------------------------------------------ */
const PAL_CSS = `
ha-card{ --w1:#0d1b2e; --w2:#113a52; --acc:#8ad2f2; --sub:#6ba8cc; --lab:#6f9fc0; --btn:#2fa8f0; }
ha-card.p-gruen  { --w1:#0d2419; --w2:#12452e; --acc:#7fe0ab; --sub:#6bbf95; --lab:#6fa88c;
                   --btn:#2fc48a; }
ha-card.p-gelb   { --w1:#2b2410; --w2:#4d411a; --acc:#f0d27a; --sub:#cbb26a; --lab:#b3a074;
                   --btn:#e8c34a; }
ha-card.p-orange { --w1:#2e1c0d; --w2:#532f14; --acc:#f0ac74; --sub:#cf9166; --lab:#b8886a;
                   --btn:#f0913c; }
ha-card.p-rot    { --w1:#2e1114; --w2:#521c22; --acc:#f2949a; --sub:#d1787f; --lab:#b87a80;
                   --btn:#ef5f68; }
ha-card.p-violett{ --w1:#1d1233; --w2:#34215c; --acc:#c3a8f5; --sub:#a48ddb; --lab:#9484c0;
                   --btn:#9b7bf5; }
ha-card.p-rosa   { --w1:#2e1224; --w2:#521f3d; --acc:#f2a0cd; --sub:#d183b0; --lab:#b87fa2;
                   --btn:#ef6bb0; }
`;

/** Farbklasse und Inline-Stil aus der Konfiguration ableiten */
function paletteAttrs(color) {
  if (!color) return { cls: '', style: '' };
  if (String(color).charAt(0) === '#') return { cls: '', style: ` style="${paletteFromHex(color)}"` };
  const key = PALETTES[String(color).toLowerCase()];
  if (!key) throw new Error(
    t('err.color', { c: color, list: [...new Set(Object.values(PALETTES))].join(', ') }));
  return { cls: key === 'blau' ? '' : ' p-' + key, style: '' };
}

/** Erste Entität einer Domain — für die Startkonfiguration aus der Kartenauswahl */
function firstEntity(hass, domains, extra) {
  const list = Array.isArray(domains) ? domains : [domains];
  const ids = Object.keys((hass && hass.states) || {});
  for (const d of list) {
    for (const id of ids) {
      if (id.slice(0, d.length + 1) !== d + '.') continue;
      if (extra && !extra(hass.states[id])) continue;
      return id;
    }
  }
  return '';
}

/** Kurzschreibweisen im YAML → Domain */
const GROUP_KEYS = {
  light:        ['lights', 'lampen'],
  media_player: ['media', 'media_players'],
  climate:      ['climate'],
  cover:        ['covers', 'storen', 'rollos']
};

/**
 * Eine Geräteliste aus der Konfiguration einlesen. Erlaubt sind
 *   - "light.decke"                              (nur die Entität)
 *   - { entity: light.decke, name: …, icon: … }  (mit eigenem Namen)
 */
function normList(list) {
  if (!list) return null;
  const arr = Array.isArray(list) ? list : [list];
  return arr
    .map((e) => (typeof e === 'string' ? { entity: e } : Object.assign({}, e)))
    .filter((e) => e && e.entity);
}

class OnyxRoomCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:12px; border-radius:var(--onyx-r, 24px); border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:10px; overflow:hidden;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
      box-shadow:none;
    }
    ha-card.warm{
      background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%);
    }

    .head{ display:flex; align-items:center; justify-content:space-between; gap:11px; }
    .hleft{ display:flex; align-items:center; gap:11px; min-width:0; cursor:pointer; }
    .hname{ font-size:13px; font-weight:600; line-height:18px; color:#c3ccd6;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .hname{ color:#e9f1f8; }
    .hico{ width:34px;height:34px;border-radius:50%;flex:none;
           background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10);
           display:grid; place-items:center; color:#8ea3b5; --mdc-icon-size:18px; cursor:pointer; }
    ha-card.warm .hico{ color:var(--acc); }
    .env{ text-align:right; line-height:1.35; font-variant-numeric:tabular-nums; }
    .env .t{ font-size:16px; font-weight:700; letter-spacing:-.02em; color:#9fb0be; }
    .env .h{ font-size:12px; color:#72879a; }
    ha-card.warm .env .t{ color:var(--acc); }
    ha-card.warm .env .h{ color:var(--sub); }

    .lab{ font-size:11px; font-weight:400; line-height:14px; color:#6f8497; }
    ha-card.warm .lab{ color:var(--lab); }
    .sub{ font-size:12px; line-height:16px; color:#72879a; }
    ha-card.warm .sub{ color:var(--sub); }

    .ctl{ display:flex; align-items:center; gap:8px; }
    /* Glasknöpfe. Aktiv ist kein Vollton, sondern ein Schleier der Kartenfarbe
       mit Rand und weichem Schein — sonst erschlägt die Reihe die Karte. */
    .gbtn{ width:36px; height:36px; border-radius:50%; flex:none;
           background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
           -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
           border:1px solid rgba(255,255,255,.11);
           display:grid; place-items:center; color:#fff; --mdc-icon-size:18px;
           cursor:pointer; transition:transform .12s ease, background .18s ease; }
    .gbtn.on{ background:color-mix(in srgb, var(--btn) 60%, transparent);
              border-color:color-mix(in srgb, var(--btn) 78%, transparent);
              color:#fff;
              box-shadow:0 0 0 1px color-mix(in srgb, var(--btn) 22%, transparent),
                         0 10px 26px color-mix(in srgb, var(--btn) 26%, transparent); }
    .gbtn.armed{ box-shadow:0 0 0 2px rgba(255,255,255,.85),
                 0 0 0 4px color-mix(in srgb, var(--btn) 45%, transparent); }
    .gbtn.held{ transform:scale(.9); }
    .gbtn.nav{ margin-left:auto; background:none; -webkit-backdrop-filter:none;
               backdrop-filter:none; border-color:rgba(255,255,255,.10);
               color:rgba(255,255,255,.30); }

    .divide{ height:1px; background:rgba(255,255,255,.09); }
    .grp{ display:flex; justify-content:space-between; align-items:baseline;
          font-size:11px; color:#6f9fc0; }
    .grp b{ font-weight:600; color:var(--acc); }
    .rows{ display:flex; flex-direction:column; gap:7px; }
    .lrow{ position:relative; overflow:hidden; border-radius:12px; height:46px;
           display:flex; align-items:center; gap:11px; padding:0 12px;
           background:rgba(255,255,255,.055); cursor:pointer; touch-action:pan-y; }
    .lfill{ position:absolute; left:0; top:0; bottom:0; transition:width .12s linear;
            background:color-mix(in srgb, var(--acc) 22%, transparent); }
    .lrow > *:not(.lfill){ position:relative; z-index:1; }
    .handle{ position:absolute; top:50%; transform:translateY(-50%); width:2.5px; height:18px;
             border-radius:9px; background:rgba(255,255,255,.55); z-index:2; }
    .lico{ width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;
           background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
           border:1px solid rgba(255,255,255,.11);
           color:#c8d8e6; --mdc-icon-size:16px; }
    .lico.grad{ background:color-mix(in srgb, var(--btn) 60%, transparent);
                border-color:color-mix(in srgb, var(--btn) 78%, transparent); color:#fff; }
    .lname{ flex:1; min-width:0; font-size:13px; font-weight:500; color:#cddceb;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .lval{ font-size:12.5px; color:var(--sub); font-variant-numeric:tabular-nums;
           white-space:nowrap; }
    .lrow.off .lname, .lrow.off .lval{ color:#7b8fa0; }
    .lrow.dead{ opacity:.45; }
    .allout{ height:42px; border-radius:12px; background:rgba(255,255,255,.055);
             display:flex; align-items:center; justify-content:center; gap:8px;
             font-size:12.5px; font-weight:500; color:#a8c2d4; cursor:pointer;
             --mdc-icon-size:15px; }
    `;
  }

  static getStubConfig(hass) {
    const first = Object.keys(hass.areas || {})[0];
    return { type: 'custom:onyx-room-card', area: first || '' };
  }

  setConfig(config) {
    const hasList = Object.keys(GROUPS).some((d) => this.constructor._listFor(config, d));
    if (!config.area && !hasList) {
      throw new Error(t('err.needArea'));
    }
    this._open = this._open || null;
    super.setConfig(config);
  }

  /** Findet die konfigurierte Liste einer Domain, egal in welcher Schreibweise */
  static _listFor(cfg, domain) {
    for (const key of GROUP_KEYS[domain]) {
      if (cfg[key]) return cfg[key];
    }
    if (cfg.entities && cfg.entities[domain]) return cfg.entities[domain];
    return null;
  }

  /**
   * Geräte einer Gruppe. Steht eine Liste in der Konfiguration, gilt die —
   * in genau der Reihenfolge, in der du sie geschrieben hast. Sonst wird
   * der Bereich durchsucht und alphabetisch sortiert.
   */
  _groupItems(domain) {
    const cfg = this._config;
    const listed = normList(this.constructor._listFor(cfg, domain));
    if (listed) return listed;
    if (!cfg.area) return [];
    return entitiesInArea(this._hass, cfg.area, domain).map((entity) => ({ entity }));
  }

  _model() {
    const hass = this._hass, cfg = this._config;
    const area = (hass.areas || {})[cfg.area];
    if (cfg.area && !area) throw new Error(t('err.area', { id: cfg.area }));

    const wanted = cfg.groups || ['light', 'media_player', 'climate', 'cover'];
    const groups = [];
    for (const d of wanted) {
      if (!GROUPS[d]) continue;
      const listed = this._groupItems(d);
      if (!listed.length) continue;
      const items = listed.map((entry) => {
        const id = entry.entity;
        const st = hass.states[id];
        // Ein Thermostat ist fast immer eingeschaltet. Als "läuft gerade" zählt
        // es nur, wenn es tatsächlich heizt oder kühlt — sonst leuchtete der
        // Klima-Knopf rund ums Jahr.
        const act = st && st.attributes.hvac_action;
        const on = d === 'climate' && act
          ? (act === 'heating' || act === 'cooling' || act === 'drying')
          : isOn(st);
        return {
          id,
          name: entry.name || nameOf(hass, id),
          icon: entry.icon || GROUPS[d].icon,
          on,
          dead: isDead(st),
          pct: pctOf(st),
          state: st ? st.state : 'unavailable',
          action: st && st.attributes.hvac_action ? st.attributes.hvac_action : null,
          title: st && st.attributes.media_title ? st.attributes.media_title : null,
          temp: st && st.attributes.current_temperature != null ? st.attributes.current_temperature : null,
          target: st && st.attributes.temperature != null ? st.attributes.temperature : null
        };
      });
      groups.push({ domain: d, items, onCount: items.filter((i) => i.on).length });
    }

    const tempId = cfg.temperature || this._autoSensor('temperature');
    const humId = cfg.humidity || this._autoSensor('humidity');
    const readOut = (id) => {
      const st = id && hass.states[id];
      if (!st || isDead(st)) return null;
      const unit = st.attributes.unit_of_measurement || '';
      const num = Number(st.state);
      if (isNaN(num)) return `${st.state} ${unit}`.trim();
      // Prozente ohne Nachkomma, Temperaturen mit einer Stelle —
      // im Zahlenformat des Nutzers, nicht mit fest eingebautem Komma
      const txt = unit === '%' ? nfmt(num, 0) : nfmt(num, 1);
      return `${txt} ${unit}`.trim();
    };

    return {
      name: cfg.name || (area ? area.name : t('room')),
      label: cfg.label || t('room'),
      color: cfg.color || null,
      icon: cfg.icon || (area && area.icon) || 'mdi:home-outline',
      temp: readOut(tempId),
      hum: readOut(humId),
      groups,
      open: this._open,
      path: cfg.navigation_path || null
    };
  }

  _autoSensor(kind) {
    const hass = this._hass;
    if (!this._config.area) return null;
    for (const id of entitiesInArea(hass, this._config.area, 'sensor')) {
      const st = hass.states[id];
      if (st && st.attributes.device_class === kind) return id;
    }
    return null;
  }

  _summary(m) {
    const bits = [];
    for (const g of m.groups) {
      if (!g.onCount) continue;
      if (g.domain === 'light') {
        bits.push(t(g.onCount === 1 ? 'lightOn' : 'lightsOn', { n: g.onCount }));
      } else if (g.domain === 'media_player') {
        bits.push(t('musicPlaying'));
      } else if (g.domain === 'climate') {
        // nur melden, wenn wirklich gerade geheizt oder gekühlt wird
        const act = g.items.find((i) => i.action === 'heating' || i.action === 'cooling');
        if (act) bits.push(t(act.action === 'cooling' ? 'cooling' : 'heating'));
      } else if (g.domain === 'cover') {
        bits.push(t(g.onCount === 1 ? 'coverOpen' : 'coversOpen', { n: g.onCount }));
      }
    }
    return bits.length ? bits.join(' · ') : t('allOff');
  }

  _rowText(it, domain) {
    if (it.dead) return t('unavailable');
    if (domain === 'light') return it.on ? `${it.pct} %` : t('off');
    if (domain === 'cover') return it.pct > 0 ? t('pctOpen', { n: it.pct }) : t('closed');
    if (domain === 'media_player') return it.on ? (it.title || t('playing')) : t('off');
    if (domain === 'climate') {
      if (it.state === 'off') return t('off');
      const one = (v) => (v == null ? '–' : nfmt(v, v % 1 ? 1 : 0));
      return `${one(it.temp)} → ${one(it.target)} °C`;
    }
    return it.state;
  }

  _html(m) {
    const anyOn = m.groups.some((g) => g.onCount > 0);

    const buttons = m.groups.map((g) => `
      <div class="gbtn ${g.onCount ? 'on' : ''} ${m.open === g.domain ? 'armed' : ''}"
           data-grp="${g.domain}">
        <ha-icon icon="${GROUPS[g.domain].icon}"></ha-icon>
      </div>`).join('');

    let panel = '';
    const og = m.groups.find((g) => g.domain === m.open);
    if (og) {
      const dragable = og.domain === 'light' || og.domain === 'cover';
      const rows = og.items.map((it) => {
        const pct = dragable && it.pct > 0 ? it.pct : 0;
        return `
        <div class="lrow ${it.dead ? 'dead' : ''} ${!it.on && !it.dead ? 'off' : ''}"
             data-ent="${esc(it.id)}" data-dom="${og.domain}">
          <div class="lfill" style="width:${pct}%"></div>
          ${pct > 0 ? `<div class="handle" style="left:${pct}%"></div>` : ''}
          <div class="lico ${it.on ? 'grad' : ''}"><ha-icon icon="${esc(it.icon)}"></ha-icon></div>
          <div class="lname">${esc(it.name)}</div>
          <div class="lval">${esc(this._rowText(it, og.domain))}</div>
        </div>`;
      }).join('');

      const allOff = og.domain === 'light' || og.domain === 'media_player' || og.domain === 'cover';
      panel = `
      <div class="divide"></div>
      <div class="grp">
        <span>${esc(t('inRoom', { g: t('group.' + og.domain) }))}</span>
        <b>${esc(t(og.domain === 'cover' ? 'nOfMOpen' : 'nOfMOn',
                     { n: og.onCount, m: og.items.length }))}</b>
      </div>
      <div class="rows">${rows}</div>
      ${allOff ? `<div class="allout" id="alloff">
          <ha-icon icon="${GROUPS[og.domain].icon}"></ha-icon>
          ${esc(t(og.domain === 'cover' ? 'closeAllCovers' : 'turnAllOff'))}
        </div>` : ''}`;
    }

    const { cls: pal, style } = paletteAttrs(m.color);

    return `
    <ha-card class="${anyOn ? 'warm' : ''}${pal}"${style}>
      <div class="head">
        <div class="hleft" id="head">
          <div class="hico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
          <div style="min-width:0">
            <div class="lab">${esc(m.label)}</div>
            <div class="hname">${esc(m.name)}</div>
          </div>
        </div>
        <div class="env">
          ${m.temp ? `<div class="t">${esc(m.temp)}</div>` : ''}
          ${m.hum ? `<div class="h">${esc(m.hum)}</div>` : ''}
        </div>
      </div>
      <div class="sub">${esc(this._summary(m))}</div>
      <div class="ctl">
        ${buttons}
        ${m.path ? `<div class="gbtn nav" id="nav"><ha-icon icon="mdi:tune-variant"></ha-icon></div>` : ''}
      </div>
      ${panel}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;

    const toRoom = () => { if (m.path) navigate(this, m.path); };
    ['head', 'nav'].forEach((id) => {
      const el = root.getElementById(id);
      if (el) this._press(el, { onTap: toRoom, onHold: () => { this._open = null; this._repaint(); } });
    });

    root.querySelectorAll('.gbtn[data-grp]').forEach((chip) => {
      const domain = chip.dataset.grp;
      const grp = m.groups.find((g) => g.domain === domain);
      this._press(chip, {
        // Tippen klappt auf — das ist der häufigere Wunsch.
        // Schalten ist der seltenere und der folgenreichere Griff, also Halten.
        onTap: () => { this._open = this._open === domain ? null : domain; this._repaint(); },
        onHold: () => this._toggleGroup(grp)
      });
    });

    root.querySelectorAll('.lrow').forEach((row) => {
      const id = row.dataset.ent;
      const domain = row.dataset.dom;
      const fill = row.querySelector('.lfill');
      const handle = row.querySelector('.handle');
      const val = row.querySelector('.lval');
      const canDrag = domain === 'light' || domain === 'cover';

      this._press(row, {
        axis: 'x',
        onTap: () => this._toggleOne(id, domain),
        onHold: () => fireMoreInfo(this, id),
        onDrag: canDrag ? (pct) => {
          fill.style.width = pct + '%';
          if (handle) handle.style.left = pct + '%';
          val.textContent = domain === 'cover' ? `${pct} % offen` : `${pct} %`;
        } : null,
        onDrop: canDrag ? (pct) => {
          if (domain === 'light') {
            if (pct <= 0) this.call('light', 'turn_off', { entity_id: id });
            else this.call('light', 'turn_on', { entity_id: id, brightness_pct: pct });
          } else {
            this.call('cover', 'set_cover_position', { entity_id: id, position: pct });
          }
        } : null
      });
    });

    const allOff = root.getElementById('alloff');
    if (allOff) {
      const grp = m.groups.find((g) => g.domain === m.open);
      this._press(allOff, { onTap: () => this._allOff(grp) });
    }

  }

  _toggleOne(id, domain) {
    if (domain === 'climate') { fireMoreInfo(this, id); return; }
    if (domain === 'media_player') { this.call('media_player', 'media_play_pause', { entity_id: id }); return; }
    if (domain === 'cover') {
      const st = this._hass.states[id];
      this.call('cover', isOn(st) ? 'close_cover' : 'open_cover', { entity_id: id });
      return;
    }
    this.call('light', 'toggle', { entity_id: id });
  }

  _toggleGroup(grp) {
    if (!grp) return;
    const ids = grp.items.map((i) => i.id);
    if (grp.domain === 'light') {
      this.call('light', grp.onCount ? 'turn_off' : 'turn_on', { entity_id: ids });
    } else if (grp.domain === 'media_player') {
      this.call('media_player', 'media_play_pause', { entity_id: ids });
    } else if (grp.domain === 'cover') {
      this.call('cover', grp.onCount ? 'close_cover' : 'open_cover', { entity_id: ids });
    } else {
      fireMoreInfo(this, ids[0]);
    }
  }

  _allOff(grp) {
    if (!grp) return;
    const ids = grp.items.map((i) => i.id);
    if (grp.domain === 'light') this.call('light', 'turn_off', { entity_id: ids });
    else if (grp.domain === 'media_player') this.call('media_player', 'turn_off', { entity_id: ids });
    else if (grp.domain === 'cover') this.call('cover', 'close_cover', { entity_id: ids });
  }

  getCardSize() {
    const og = this._open;
    if (!og) return 3;
    try { return 3 + this._groupItems(og).length; } catch (e) { return 4; }
  }
}

/* ================================================================== *
 * 2) ZIEH-REGLER
 * ================================================================== */
class OnyxSliderCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{ padding:0; background:none; border:none; box-shadow:none; overflow:visible; }
    .sl{ width:100%; height:168px; border-radius:var(--onyx-r,24px);
         border:1px solid rgba(255,255,255,.09);
         background:linear-gradient(to right bottom,
           var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
         position:relative; overflow:hidden; display:flex; flex-direction:column;
         justify-content:space-between; align-items:center; padding:13px 0 12px;
         cursor:pointer; touch-action:pan-x; }
    /* Der Füllstand ist die Kartenfarbe, nach oben hin dünner. So bleibt der
       Wert lesbar und der Regler wird nicht zum Farbbalken. */
    .fill{ position:absolute; left:0; right:0; bottom:0; transition:height .12s linear;
           background:linear-gradient(to top,
             color-mix(in srgb, var(--btn) 66%, transparent) 0%,
             color-mix(in srgb, var(--btn) 28%, transparent) 100%); }
    .pct{ position:relative; font-size:13px; font-weight:600; color:#7d8fa0;
          font-variant-numeric:tabular-nums; }
    .sl.on .pct{ color:#fff; }
    /* Der Griff liegt unter dem Symbol: bei kleinen Werten kreuzen sie sich,
       und eine Linie quer durchs Symbol sieht nach Fehler aus. */
    .grip{ position:absolute; left:50%; transform:translateX(-50%); width:24px; height:2.5px;
           border-radius:9px; background:rgba(255,255,255,.55); z-index:1; }
    .sico{ position:relative; z-index:2; width:34px; height:34px; border-radius:50%;
           display:grid; place-items:center; color:#8ea3b5; --mdc-icon-size:18px;
           background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
           -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
           border:1px solid rgba(255,255,255,.11);
           transition:background .18s ease; }
    .sl.on .sico{ background:color-mix(in srgb, var(--btn) 60%, transparent);
                  border-color:color-mix(in srgb, var(--btn) 78%, transparent); color:#fff; }
    .sl.dead{ opacity:.45; }
    .nm{ text-align:center; font-size:12px; color:#72879a; margin-top:8px;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-slider-card', entity: firstEntity(hass, ['light', 'cover']) };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    super.setConfig(config);
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(t('err.entity', { id: this._config.entity }));
    const pct = pctOf(st);
    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      icon: this._config.icon || (this._config.entity.startsWith('cover.') ? 'mdi:window-shutter' : 'mdi:lightbulb'),
      pct: pct < 0 ? 0 : pct,
      dead: isDead(st),
      color: this._config.color || null,
      domain: this._config.entity.split('.')[0]
    };
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const on = !m.dead && m.pct > 0;
    return `
    <ha-card class="${cls.trim()}"${style}>
      <div class="sl${on ? ' on' : ''}${m.dead ? ' dead' : ''}" id="sl">
        <div class="fill" style="height:${m.pct}%"></div>
        <div class="pct" id="pct">${m.dead ? '–' : m.pct + ' %'}</div>
        ${m.pct > 0 && m.pct < 100 ? `<div class="grip" id="grip" style="bottom:calc(${m.pct}% - 1px)"></div>` : ''}
        <div class="sico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
      </div>
      ${this._config.show_name === false ? '' : `<div class="nm">${esc(m.name)}</div>`}
    </ha-card>`;
  }

  _bind(m) {
    const sl = this.shadowRoot.getElementById('sl');
    const fill = sl.querySelector('.fill');
    const grip = this.shadowRoot.getElementById('grip');
    const pct = this.shadowRoot.getElementById('pct');

    this._press(sl, {
      axis: 'y',
      onTap: () => {
        if (m.domain === 'cover') this.call('cover', m.pct > 0 ? 'close_cover' : 'open_cover', { entity_id: m.id });
        else this.call('light', 'toggle', { entity_id: m.id });
      },
      onHold: () => fireMoreInfo(this, m.id),
      onDrag: (v) => {
        fill.style.height = v + '%';
        pct.textContent = v + ' %';
        sl.classList.toggle('on', v > 0);
        if (grip) grip.style.bottom = `calc(${v}% - 1px)`;
      },
      onDrop: (v) => {
        if (m.domain === 'cover') this.call('cover', 'set_cover_position', { entity_id: m.id, position: v });
        else if (v <= 0) this.call('light', 'turn_off', { entity_id: m.id });
        else this.call('light', 'turn_on', { entity_id: m.id, brightness_pct: v });
      }
    });
  }

  getCardSize() { return 2; }
}

/* ================================================================== *
 * 3) STOREN-KARTE
 * ================================================================== */
/* Lamellenregler: Knopfmitte von 6,5 px bis Breite minus 6,5 px */
const KNOB_POS = (v) => `calc((100% - 13px) * ${v} / 100)`;
const KNOB_FILL = (v) => `calc(6.5px + (100% - 13px) * ${v} / 100)`;

class OnyxCoverCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:12px; border-radius:var(--onyx-r,24px); border:1px solid rgba(255,255,255,.09);
      box-shadow:none; overflow:hidden;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
    }
    ha-card.warm{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }

    .top{ display:flex; justify-content:space-between; align-items:center;
          gap:11px; margin-bottom:11px; }
    .cico{ width:34px;height:34px;border-radius:50%;flex:none; display:grid;place-items:center;
           background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10);
           color:#8ea3b5; --mdc-icon-size:18px; }
    ha-card.warm .cico{ background:color-mix(in srgb, var(--acc) 16%, transparent);
                        border-color:color-mix(in srgb, var(--acc) 32%, transparent);
                        color:var(--acc); }
    .pos{ text-align:right; line-height:1.3; min-width:0; }
    .pos b{ display:block; font-size:17px; font-weight:700; letter-spacing:-.02em;
            color:#9fb0be; font-variant-numeric:tabular-nums; }
    ha-card.warm .pos b{ color:var(--acc); }
    .pos span{ display:block; font-size:11.5px; color:#72879a;
               overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .pos span{ color:var(--sub); }

    /* Das Fenster von innen gesehen: draussen ist es hell, die Lamellen
       liegen davor. Je weiter unten sie enden, desto mehr Licht kommt durch. */
    .win{ position:relative; height:92px; border-radius:14px; overflow:hidden; cursor:pointer;
          touch-action:pan-x; border:1px solid rgba(255,255,255,.07);
          background:linear-gradient(180deg,
            color-mix(in srgb, var(--acc) 44%, transparent) 0%,
            color-mix(in srgb, var(--acc) 26%, transparent) 72%,
            color-mix(in srgb, var(--acc) 15%, transparent) 100%); }
    .glow{ position:absolute; right:15px; width:15px; height:15px; border-radius:50%;
           background:#ffffff;
           box-shadow:0 0 18px 6px color-mix(in srgb, var(--acc) 55%, transparent); }
    .sill{ position:absolute; left:0; right:0; bottom:0; height:6px;
           background:rgba(255,255,255,.12); }
    /* Verdeckt gegen offen muss auf einen Blick zu sehen sein. Deshalb sind
       die Lamellen kräftig dunkel; geöffnet lassen sie Licht durch die Spalten. */
    .slats{ position:absolute; left:0; right:0; top:0; transition:height .12s linear; }
    .slats.zu{ background:repeating-linear-gradient(180deg,
                 rgba(16,19,24,.97) 0 6px, rgba(41,47,57,.97) 6px 7px); }
    .slats.offen{ background:repeating-linear-gradient(180deg,
                    rgba(16,19,24,.94) 0 4px, rgba(16,19,24,.18) 4px 9px); }
    .kasten{ position:absolute; left:0; right:0; top:0; height:8px; background:#39404b;
             border-radius:0 0 3px 3px; }

    .lam{ display:flex; align-items:center; gap:10px; margin-top:11px; }
    .lam-lbl{ font-size:11px; color:#6f8497; white-space:nowrap; }
    .lam-track{ flex:1; height:16px; display:flex; align-items:center; cursor:pointer;
                position:relative; touch-action:pan-y; }
    .lam-track .bg{ position:absolute; left:0; right:0; height:6px; border-radius:99px;
                    background:rgba(255,255,255,.09); }
    .lam-track .on{ position:absolute; left:0; height:6px; border-radius:99px;
                    background:color-mix(in srgb, var(--btn) 72%, transparent); }
    /* Der Knopf bleibt ganz in der Schiene — sonst ragt er bei 0 % in die
       Beschriftung und bei 100 % über den Kartenrand hinaus. */
    .lam-track .knob{ position:absolute; width:13px; height:13px; border-radius:50%;
                      background:#fff; box-shadow:0 2px 7px rgba(0,0,0,.5); }

    .lock{ display:inline-flex; align-items:center; gap:6px; margin-top:11px;
           background:rgba(240,172,116,.14); border:1px solid rgba(240,172,116,.28);
           color:#f0ac74; border-radius:99px; padding:4px 11px; font-size:11.5px;
           font-weight:500; --mdc-icon-size:13px; }

    .btns{ display:flex; gap:8px; margin-top:11px; }
    .cbtn{ flex:1; height:40px; border-radius:13px; display:grid; place-items:center;
           color:#fff; --mdc-icon-size:17px; cursor:pointer;
           background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
           -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
           border:1px solid rgba(255,255,255,.11);
           transition:transform .12s ease, background .18s ease; }
    .cbtn.act{ background:color-mix(in srgb, var(--btn) 60%, transparent);
               border-color:color-mix(in srgb, var(--btn) 78%, transparent);
               box-shadow:0 0 0 1px color-mix(in srgb, var(--btn) 22%, transparent),
                          0 10px 26px color-mix(in srgb, var(--btn) 26%, transparent); }
    .cbtn.dim{ opacity:.36; }
    .cbtn.held{ transform:scale(.94); }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-cover-card', entity: firstEntity(hass, 'cover') };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    super.setConfig(config);
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(t('err.entity', { id: this._config.entity }));
    const f = st.attributes.supported_features || 0;
    const tiltRaw = st.attributes.current_tilt_position;
    const lockId = this._config.lock_entity;
    const lockSt = lockId ? this._hass.states[lockId] : null;
    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      pos: st.attributes.current_position != null
        ? Math.round(st.attributes.current_position)
        : (st.state === 'open' ? 100 : 0),
      tilt: tiltRaw == null ? null : Math.round(tiltRaw),
      canTilt: (f & 16) !== 0 || tiltRaw != null,
      moving: st.state === 'opening' || st.state === 'closing',
      dir: st.state === 'opening' ? 'opening' : st.state === 'closing' ? 'closing' : null,
      dead: isDead(st),
      color: this._config.color || null,
      locked: !!(lockSt && lockSt.state === 'on'),
      lockLabel: this._config.lock_label || t('windLock')
    };
  }

  _html(m) {
    const closed = 100 - m.pos;              // Anteil, den die Store verdeckt
    const slatClass = m.tilt != null && m.tilt < 35 ? 'zu' : 'offen';
    const showTilt = m.canTilt && m.pos < 98;
    const { cls, style } = paletteAttrs(m.color);
    const warm = m.pos > 0 && !m.locked && !m.dead;

    return `
    <ha-card class="${(cls + (warm ? ' warm' : '')).trim()}"${style}>
      <div class="top">
        <div class="cico"><ha-icon icon="mdi:window-shutter"></ha-icon></div>
        <div class="pos">
          <b>${m.dead ? '–' : m.pos >= 98 ? esc(t('open')) : m.pos <= 2 ? esc(t('closed')) : m.pos + ' %'}</b>
          <span>${m.moving ? esc(t(m.dir))
            : m.tilt != null ? esc(t('slatsAngle', { n: Math.round(m.tilt * 0.9) })) : esc(m.name)}</span>
        </div>
      </div>

      <div class="win" id="win" style="${m.locked ? 'opacity:.7' : ''}">
        ${m.pos > 30 ? `<div class="glow" style="top:calc(${closed}% + 11px)"></div>` : ''}
        <div class="slats ${slatClass}" style="height:${closed}%"></div>
        <div class="kasten"></div>
        <div class="sill"></div>
      </div>

      ${showTilt ? `
      <div class="lam">
        <span class="lam-lbl">${esc(t('slats'))}</span>
        <div class="lam-track" id="lam">
          <div class="bg"></div>
          <div class="on" style="width:${KNOB_FILL(m.tilt || 0)}"></div>
          <div class="knob" style="left:${KNOB_POS(m.tilt || 0)}"></div>
        </div>
      </div>` : ''}

      ${m.locked ? `<div class="lock"><ha-icon icon="mdi:lock"></ha-icon>${esc(m.lockLabel)}</div>` : ''}

      <div class="btns" style="${m.locked ? 'opacity:.35' : ''}">
        <div class="cbtn ${m.moving ? 'dim' : ''}" id="up"><ha-icon icon="mdi:triangle"></ha-icon></div>
        <div class="cbtn ${m.moving ? 'act' : ''}" id="stop"><ha-icon icon="mdi:square"></ha-icon></div>
        <div class="cbtn ${m.moving ? 'dim' : ''}" id="down"><ha-icon icon="mdi:triangle-down"></ha-icon></div>
      </div>
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;
    const guard = (fn) => () => { if (!m.locked) fn(); };

    const win = root.getElementById('win');
    const slats = win.querySelector('.slats');
    const posOut = root.querySelector('.pos b');

    this._press(win, {
      axis: 'y',
      onTap: guard(() => this.call('cover', m.pos > 50 ? 'close_cover' : 'open_cover', { entity_id: m.id })),
      onHold: () => fireMoreInfo(this, m.id),
      onDrag: m.locked ? null : (v) => {
        slats.style.height = (100 - v) + '%';
        posOut.textContent = v >= 98 ? t('open') : v <= 2 ? t('closed') : v + ' %';
      },
      onDrop: m.locked ? null : (v) => this.call('cover', 'set_cover_position', { entity_id: m.id, position: v })
    });

    const lam = root.getElementById('lam');
    if (lam) {
      const on = lam.querySelector('.on'), knob = lam.querySelector('.knob');
      this._press(lam, {
        axis: 'x',
        onTap: guard(() => this.call('cover', 'set_cover_tilt_position',
          { entity_id: m.id, tilt_position: m.tilt > 50 ? 0 : 100 })),
        onDrag: m.locked ? null : (v) => {
          on.style.width = KNOB_FILL(v); knob.style.left = KNOB_POS(v);
        },
        onDrop: m.locked ? null : (v) =>
          this.call('cover', 'set_cover_tilt_position', { entity_id: m.id, tilt_position: v })
      });
    }

    this._press(root.getElementById('up'),
      { onTap: guard(() => this.call('cover', 'open_cover', { entity_id: m.id })) });
    this._press(root.getElementById('stop'),
      { onTap: guard(() => this.call('cover', 'stop_cover', { entity_id: m.id })) });
    this._press(root.getElementById('down'),
      { onTap: guard(() => this.call('cover', 'close_cover', { entity_id: m.id })) });
  }

  getCardSize() { return 3; }
}

/* ================================================================== *
 * 4) MEDIA-KARTE
 * ================================================================== */

/** Bits aus supported_features des media_player */
const MF = {
  PAUSE: 1, SEEK: 2, VOLUME_SET: 4, VOLUME_MUTE: 8,
  PREV: 16, NEXT: 32, TURN_ON: 128, TURN_OFF: 256,
  STOP: 4096, PLAY: 16384
};

const mmss = (s) => {
  if (s == null || isNaN(s) || s < 0) return '0:00';
  const sec = Math.floor(s);
  const m = Math.floor(sec / 60), r = sec % 60;
  if (m < 60) return `${m}:${String(r).padStart(2, '0')}`;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

class OnyxMediaCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      position:relative; overflow:hidden; padding:0;
      border:1px solid rgba(255,255,255,.09); border-radius:var(--onyx-r,24px);
      box-shadow:none;
      background:linear-gradient(135deg,
        var(--onyx-cold-1,#111318) 0%, var(--onyx-cold-2,#171b22) 100%);
    }
    ha-card.live{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }

    /* Der Kartengrund kommt aus dem Cover: gross gezogen und weichgezeichnet.
       Dadurch trägt jede Karte die Farbe der Musik, die gerade läuft. */
    .bg{ position:absolute; inset:-25%; background-size:cover; background-position:center;
         filter:blur(34px) saturate(170%); }
    .veil{ position:absolute; inset:0; background:linear-gradient(100deg,
           rgba(0,0,0,.16) 0%, rgba(0,0,0,.30) 42%, rgba(0,0,0,.48) 100%); }

    /* Das Cover läuft randlos bis an die Kartenkante und blendet nach
       rechts weich aus — kein Rahmen, kein harter Schnitt. */
    .art{ position:absolute; left:0; top:0; bottom:0; width:39%; cursor:pointer;
          background-size:cover; background-position:center;
          -webkit-mask-image:linear-gradient(90deg,#000 0%,#000 82%,rgba(0,0,0,.96) 89%,
                             rgba(0,0,0,.68) 95%,rgba(0,0,0,.22) 99%,rgba(0,0,0,0) 100%);
                  mask-image:linear-gradient(90deg,#000 0%,#000 82%,rgba(0,0,0,.96) 89%,
                             rgba(0,0,0,.68) 95%,rgba(0,0,0,.22) 99%,rgba(0,0,0,0) 100%); }
    /* Ohne Cover gibt es keinen Platzhalter — der Text nimmt die ganze Breite. */
    ha-card.nocover .info{ margin-left:0; padding-left:12px; }
    .info{ position:relative; margin-left:39%; min-height:150px; padding:12px 12px 12px 4px;
           display:flex; flex-direction:column; color:#fff; }

    .r1{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
    .lab{ font-size:11px; color:rgba(255,255,255,.62); line-height:1.3; }
    .dev{ font-size:12.5px; font-weight:600; line-height:1.3;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .eq{ display:flex; align-items:flex-end; gap:2.5px; height:16px; flex:none; padding-top:2px; }
    .eq i{ width:2.5px; height:5px; border-radius:2px; background:rgba(255,255,255,.85); }
    ha-card.run .eq i{ animation:onyxbar .9s ease-in-out infinite; }
    ha-card.run .eq i:nth-child(2){ animation-delay:.15s; }
    ha-card.run .eq i:nth-child(3){ animation-delay:.30s; }
    ha-card.run .eq i:nth-child(4){ animation-delay:.45s; }
    @keyframes onyxbar{ 0%,100%{ height:4px } 50%{ height:16px } }

    .r2{ display:flex; align-items:center; justify-content:space-between; gap:10px;
         margin:9px 0 8px; flex:1; }
    .tx{ min-width:0; }
    .title{ font-size:15px; font-weight:700; letter-spacing:-.01em; line-height:1.25;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .artist{ font-size:12px; color:rgba(255,255,255,.66);
             overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .pbtn{ width:46px; height:50px; border-radius:15px; flex:none; cursor:pointer;
           display:grid; place-items:center; background:rgba(255,255,255,.20); color:#fff;
           --mdc-icon-size:21px; transition:transform .12s ease; }
    .pbtn.held{ transform:scale(.92); }

    .r3{ display:flex; align-items:center; gap:9px; }
    .tm{ font-size:10.5px; color:rgba(255,255,255,.72); flex:none;
         font-variant-numeric:tabular-nums; }
    .prog{ flex:1; position:relative; height:14px; display:flex; align-items:center;
           cursor:pointer; touch-action:pan-y; }
    .prog .tr{ position:absolute; left:0; right:0; height:2px; border-radius:9px;
               background:rgba(255,255,255,.28); }
    .prog .on{ position:absolute; left:0; height:2px; border-radius:9px; background:#fff; }

    .r4{ display:flex; align-items:center; gap:10px; margin-top:8px; }
    .vico{ flex:none; color:rgba(255,255,255,.8); --mdc-icon-size:15px; cursor:pointer; }
    .vol{ flex:1; position:relative; height:16px; display:flex; align-items:center;
          cursor:pointer; touch-action:pan-y; }
    .vol .tr{ position:absolute; left:0; right:0; height:3px; border-radius:9px;
              background:rgba(255,255,255,.28); }
    .vol .on{ position:absolute; left:0; height:3px; border-radius:9px; background:#fff; }
    .vol .kn{ position:absolute; width:17px; height:17px; border-radius:50%; background:#fff;
              transform:translateX(-50%); box-shadow:0 2px 7px rgba(0,0,0,.45); }
    .sk{ flex:none; color:rgba(255,255,255,.92); --mdc-icon-size:19px; cursor:pointer; }
    .pbtn{ -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px); }
    .sk.off{ opacity:.32; }

    /* Ruhezustand: flache Kachel wie bei der Raum-Karte */
    .idle{ position:relative; display:flex; align-items:center; gap:12px; padding:13px; }
    .iico{ width:34px; height:34px; border-radius:50%; flex:none; display:grid; place-items:center;
           background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10);
           color:#8ea3b5; --mdc-icon-size:18px; }
    .inm{ font-size:13px; font-weight:600; color:#c3ccd6; }
    .ist{ font-size:12px; color:#72879a; }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-media-card', entity: firstEntity(hass, 'media_player') };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    super.setConfig(config);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopTicker();
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(t('err.entity', { id: this._config.entity }));
    const a = st.attributes;
    const f = a.supported_features || 0;
    const playing = st.state === 'playing';
    const active = ['playing', 'paused', 'buffering'].includes(st.state);

    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      label: this._config.label || t('speaker'),
      color: this._config.color || null,
      state: st.state,
      active, playing,
      dead: isDead(st),
      title: a.media_title || null,
      sub: a.media_artist || a.media_album_name || a.media_series_title || a.app_name || a.source || null,
      pic: this._config.show_art === false ? null : (a.entity_picture || null),
      dur: a.media_duration != null ? Math.round(a.media_duration) : null,
      pos: a.media_position != null ? a.media_position : null,
      posAt: a.media_position_updated_at || null,
      vol: a.volume_level != null ? Math.round(a.volume_level * 100) : null,
      muted: !!a.is_volume_muted,
      can: {
        seek: !!(f & MF.SEEK), prev: !!(f & MF.PREV), next: !!(f & MF.NEXT),
        vol: !!(f & MF.VOLUME_SET), mute: !!(f & MF.VOLUME_MUTE)
      },
      showVol: this._config.show_volume !== false
    };
  }

  /** Live-Position: läuft zwischen zwei Zustandsmeldungen weiter */
  _livePos(m) {
    if (m.pos == null) return null;
    if (!m.playing || !m.posAt) return m.pos;
    const drift = (Date.now() - Date.parse(m.posAt)) / 1000;
    return Math.min(m.dur == null ? Infinity : m.dur, m.pos + Math.max(0, drift));
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);

    if (!m.active) {
      return `
      <ha-card class="${cls}"${style}>
        <div class="idle" id="idle">
          <div class="iico"><ha-icon icon="mdi:speaker"></ha-icon></div>
          <div>
            <div class="inm">${esc(m.name)}</div>
            <div class="ist">${esc(t(m.dead ? 'unavailable' : 'nothingPlaying'))}</div>
          </div>
        </div>
      </ha-card>`;
    }

    const p = this._livePos(m);
    const pct = m.dur ? clamp((p / m.dur) * 100, 0, 100) : 0;
    const vol = m.muted ? 0 : (m.vol || 0);

    return `
    <ha-card class="live ${m.playing ? 'run' : ''} ${m.pic ? '' : 'nocover'}${cls}"${style}>
      ${m.pic ? `<div class="bg" style="background-image:url('${esc(m.pic)}')"></div>` : ''}
      <div class="veil"></div>
      ${m.pic ? `<div class="art" id="art" style="background-image:url('${esc(m.pic)}')"></div>` : ''}
      <div class="info">
        <div class="r1">
          <div style="min-width:0">
            <div class="lab">${esc(m.label)}</div>
            <div class="dev">${esc(m.name)}</div>
          </div>
          <div class="eq"><i></i><i></i><i></i><i></i></div>
        </div>

        <div class="r2">
          <div class="tx">
            <div class="title">${esc(m.title || m.name)}</div>
            ${m.sub ? `<div class="artist">${esc(m.sub)}</div>` : ''}
          </div>
          <div class="pbtn" id="play">
            <ha-icon icon="${m.playing ? 'mdi:pause' : 'mdi:play'}"></ha-icon>
          </div>
        </div>

        <div class="r3">
          <span class="tm" id="tnow">${mmss(p)}</span>
          <div class="prog" id="prog"><div class="tr"></div>
            <div class="on" style="width:${pct}%"></div></div>
          <span class="tm">${m.dur ? mmss(m.dur) : '--:--'}</span>
        </div>

        <div class="r4">
          <div class="vico" id="mute">
            <ha-icon icon="${m.muted ? 'mdi:volume-off' : 'mdi:volume-medium'}"></ha-icon></div>
          ${m.showVol && m.can.vol ? `
          <div class="vol" id="vol"><div class="tr"></div>
            <div class="on" style="width:${vol}%"></div>
            <div class="kn" style="left:${vol}%"></div></div>` : '<div style="flex:1"></div>'}
          <div class="sk ${m.can.prev ? '' : 'off'}" id="prev">
            <ha-icon icon="mdi:skip-previous"></ha-icon></div>
          <div class="sk ${m.can.next ? '' : 'off'}" id="next">
            <ha-icon icon="mdi:skip-next"></ha-icon></div>
        </div>
      </div>
    </ha-card>`;
  }

  _bind(m) {
    this._stopTicker();
    const root = this.shadowRoot;

    const idle = root.getElementById('idle');
    if (idle) { this._press(idle, { onTap: () => fireMoreInfo(this, m.id) }); return; }

    const tap = (id, fn, enabled) => {
      const el = root.getElementById(id);
      if (el) this._press(el, { onTap: () => { if (enabled !== false) fn(); } });
    };
    tap('play', () => this.call('media_player', 'media_play_pause', { entity_id: m.id }));
    tap('prev', () => this.call('media_player', 'media_previous_track', { entity_id: m.id }), m.can.prev);
    tap('next', () => this.call('media_player', 'media_next_track', { entity_id: m.id }), m.can.next);
    tap('mute', () => this.call('media_player', 'volume_mute',
      { entity_id: m.id, is_volume_muted: !m.muted }), m.can.mute);

    const art = root.getElementById('art');
    if (art) this._press(art, { onTap: () => fireMoreInfo(this, m.id) });

    // Fortschritt: ziehen spult im Stück
    const prog = root.getElementById('prog');
    if (prog && m.dur) {
      const on = prog.querySelector('.on');
      const now = root.getElementById('tnow');
      this._press(prog, {
        axis: 'x',
        onTap: () => fireMoreInfo(this, m.id),
        onDrag: m.can.seek ? (v) => {
          on.style.width = v + '%';
          if (now) now.textContent = mmss((v / 100) * m.dur);
        } : null,
        onDrop: m.can.seek ? (v) => this.call('media_player', 'media_seek',
          { entity_id: m.id, seek_position: Math.round((v / 100) * m.dur) }) : null
      });
    }

    const vol = root.getElementById('vol');
    if (vol) {
      const on = vol.querySelector('.on'), kn = vol.querySelector('.kn');
      this._press(vol, {
        axis: 'x',
        onDrag: (v) => { on.style.width = v + '%'; kn.style.left = v + '%'; },
        onDrop: (v) => this.call('media_player', 'volume_set',
          { entity_id: m.id, volume_level: v / 100 })
      });
    }

    if (m.playing && m.dur) this._startTicker(m);
  }

  _startTicker(m) {
    const root = this.shadowRoot;
    const on = root.querySelector('.prog .on');
    const now = root.getElementById('tnow');
    if (!on) return;
    this._tick = setInterval(() => {
      if (this._busy) return;                 // nicht während des Ziehens
      const p = this._livePos(m);
      const pct = clamp((p / m.dur) * 100, 0, 100);
      on.style.width = pct + '%';
      if (now) now.textContent = mmss(p);
    }, 1000);
  }

  _stopTicker() { if (this._tick) { clearInterval(this._tick); this._tick = null; } }

  getCardSize() { return this._sig && this._sig.includes('"active":true') ? 3 : 1; }
}

/* ================================================================== *
 * 5) SCHNELLZUGRIFFE
 * ================================================================== */

const ACT_ICON = {
  scene: 'mdi:palette', script: 'mdi:script-text',
  automation: 'mdi:robot', input_boolean: 'mdi:toggle-switch-outline',
  switch: 'mdi:power-plug', light: 'mdi:lightbulb', input_button: 'mdi:gesture-tap-button',
  button: 'mdi:gesture-tap-button'
};

/** Auslöser haben keinen Zustand, Schalter schon. Daran hängt alles. */
const TRIGGER_DOMAINS = ['scene', 'script', 'button', 'input_button'];

class OnyxActionsCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:14px; border-radius:var(--onyx-r,24px); border:1px solid rgba(255,255,255,.09);
      box-shadow:none; overflow:hidden;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
    }
    .fhead{ display:flex; justify-content:space-between; align-items:center; margin-bottom:13px; }
    .ftitle{ font-size:15px; font-weight:600; color:#dbe6f0; }
    .fsub{ font-size:11.5px; color:#6f8497; }
    .flabel{ font-size:11px; color:#6f8497; margin-bottom:9px; }
    .fsep{ height:1px; background:rgba(255,255,255,.09); margin:14px 0 12px; }

    /* Glas ist der Ruhezustand. Gefüllt in der Kartenfarbe ist nur, was
       gerade läuft — so bleibt die Fläche ruhig und das Aktive springt heraus. */

    /* Quadrate */
    .grid{ display:grid; gap:12px; }
    .sq{ text-align:center; cursor:pointer; }
    .sq .box{ position:relative; width:100%; aspect-ratio:1; max-width:76px; margin:0 auto 8px;
              border-radius:20px; display:grid; place-items:center; color:#c8d8e6;
              --mdc-icon-size:25px;
              background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
              -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
              border:1px solid rgba(255,255,255,.11);
              transition:transform .12s ease, background .18s ease; }
    .sq.on .box{ background:color-mix(in srgb, var(--btn) 60%, transparent);
                 border-color:color-mix(in srgb, var(--btn) 78%, transparent); color:#fff;
                 box-shadow:0 0 0 1px color-mix(in srgb, var(--btn) 22%, transparent),
                            0 10px 26px color-mix(in srgb, var(--btn) 26%, transparent); }
    .sq.off .box{ color:#7b8fa0; }
    .sq.dead .box{ opacity:.45; color:#7b8fa0; }
    .sq.held .box{ transform:scale(.94); }
    .sq span{ font-size:11px; color:#a8bccd; display:block; line-height:1.3; }
    .sq.off span{ color:#7b8fa0; }
    .sq.dead span{ color:#7b8fa0; opacity:.7; }
    .dot{ position:absolute; top:9px; right:9px; width:7px; height:7px; border-radius:50%;
          background:var(--btn); box-shadow:0 0 0 2px rgba(0,0,0,.3); }
    .dot.hollow{ background:none; border:1.5px solid rgba(255,255,255,.38); box-shadow:none; }
    .slash{ position:absolute; inset:0; display:grid; place-items:center; pointer-events:none; }
    .slash::after{ content:""; width:58%; height:1.5px; background:rgba(255,255,255,.38);
                   transform:rotate(-45deg); }
    @keyframes onyxpulse{ 0%,100%{opacity:1} 50%{opacity:.45} }
    .sq.run .box{ animation:onyxpulse 1.1s ease-in-out infinite; }

    /* Chips */
    .chips{ display:flex; flex-wrap:wrap; gap:8px; }
    .chip{ display:flex; align-items:center; gap:9px; height:40px; padding:0 14px 0 7px;
           border-radius:14px; font-size:13px; font-weight:500; color:#c8d8e6; cursor:pointer;
           background:linear-gradient(rgba(255,255,255,.11), rgba(255,255,255,.035));
           -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
           border:1px solid rgba(255,255,255,.10);
           transition:transform .12s ease, background .18s ease; }
    .chip .ci{ width:26px; height:26px; border-radius:9px; display:grid; place-items:center;
               background:rgba(255,255,255,.08); color:#8ea3b5; flex:none; --mdc-icon-size:15px; }
    .chip.on{ background:color-mix(in srgb, var(--btn) 55%, transparent);
              border-color:color-mix(in srgb, var(--btn) 74%, transparent); color:#fff; }
    .chip.on .ci{ background:rgba(255,255,255,.22); color:#fff; }
    .chip.off{ color:#8ea3b5; }
    .chip.dead{ opacity:.45; }
    .chip.held{ transform:scale(.96); }

    /* Kacheln */
    .tile{ border-radius:18px; padding:13px; cursor:pointer;
           background:rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.07);
           transition:transform .12s ease, background .18s ease; }
    .tile.on{ background:linear-gradient(150deg,
                color-mix(in srgb, var(--btn) 24%, transparent) 0%, rgba(255,255,255,.05) 62%);
              border-color:color-mix(in srgb, var(--btn) 30%, transparent); }
    .tile.dead{ opacity:.45; }
    .tile.held{ transform:scale(.97); }
    .tico{ width:34px; height:34px; border-radius:11px; display:grid; place-items:center;
           color:#8ea3b5; --mdc-icon-size:19px;
           background:linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.04));
           border:1px solid rgba(255,255,255,.10); }
    .tile.on .tico{ background:color-mix(in srgb, var(--btn) 60%, transparent);
                    border-color:color-mix(in srgb, var(--btn) 78%, transparent); color:#fff; }
    .tname{ font-size:13px; font-weight:600; margin-top:12px; color:#c8d8e6; }
    .tstate{ font-size:11.5px; color:#72879a; }
    .tstate.hot{ color:var(--acc); font-weight:500; }

    /* Leiste */
    .rail{ display:flex; justify-content:space-between; gap:8px;
           background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07);
           border-radius:16px; padding:9px 12px; }
    .rail .r{ width:38px; height:38px; border-radius:50%; display:grid; place-items:center;
              color:#c8d8e6; cursor:pointer; --mdc-icon-size:19px; flex:none;
              background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
              -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
              border:1px solid rgba(255,255,255,.11);
              transition:transform .12s ease, background .18s ease; }
    .rail .r.on{ background:color-mix(in srgb, var(--btn) 60%, transparent);
                 border-color:color-mix(in srgb, var(--btn) 78%, transparent); color:#fff; }
    .rail .r.off{ color:#8ea3b5; }
    .rail .r.dead{ opacity:.45; }
    .rail .r.held{ transform:scale(.92); }
    `;
  }

  static getStubConfig(hass) {
    const first = firstEntity(hass, ['scene', 'script', 'automation', 'input_boolean']);
    return {
      type: 'custom:onyx-actions-card', title: 'Schnellzugriff',
      actions: first ? [first] : []
    };
  }

  setConfig(config) {
    const hasFlat = config.actions && config.actions.length;
    const hasGroups = config.groups && config.groups.length;
    if (!hasFlat && !hasGroups) {
      throw new Error(t('err.needActions'));
    }
    super.setConfig(config);
  }

  _entry(entry) {
    const hass = this._hass;
    const cfg = typeof entry === 'string' ? { entity: entry } : entry;
    const id = cfg.entity;
    const st = hass.states[id];
    const domain = id.split('.')[0];
    const kind = TRIGGER_DOMAINS.includes(domain) ? 'trigger' : 'switch';
    // Eine nie ausgelöste Szene steht auf "unknown" — das ist ihr Normalzustand,
    // nicht etwa ein Fehler. Nur "unavailable" heisst wirklich nicht erreichbar.
    const dead = !st || st.state === 'unavailable'
      || (kind === 'switch' && st.state === 'unknown');
    const on = !dead && st.state === 'on';

    // Untertitel für die Kachelform
    let sub = '';
    if (dead) sub = t('unavailable');
    else if (domain === 'automation') sub = t(on ? 'armed' : 'disabled');
    else if (domain === 'script') sub = t(on ? 'running' : 'ready');
    else if (domain === 'scene') {
      const ts = Date.parse(st.state);
      sub = isNaN(ts) ? t('scene') : t('lastRun', { time: fmtTime(new Date(ts)) });
    } else sub = t(on ? 'on' : 'off');

    return {
      id, domain, kind, on, dead, sub,
      name: cfg.name || nameOf(hass, id),
      icon: cfg.icon || (st && st.attributes.icon) || ACT_ICON[domain] || 'mdi:flash',
      tap: cfg.tap_action || null,
      // Punkt nur bei Dingen mit Zustand — beim Skript nur solange es läuft
      showDot: kind === 'switch' || (domain === 'script' && on),
      running: domain === 'script' && on
    };
  }

  _model() {
    const cfg = this._config;
    const groups = cfg.groups && cfg.groups.length
      ? cfg.groups.map((g) => ({
          label: g.label || '',
          items: (g.actions || []).map((e) => this._entry(e))
        }))
      : [{ label: '', items: (cfg.actions || []).map((e) => this._entry(e)) }];

    const all = groups.reduce((n, g) => n.concat(g.items), []);
    const switches = all.filter((i) => i.kind === 'switch');

    return {
      title: cfg.title || null,
      subtitle: cfg.subtitle === false ? null
        : (cfg.subtitle || (switches.length
            ? t('nActive', { n: switches.filter((i) => i.on).length, m: switches.length })
            : null)),
      shape: cfg.shape || (all.length > 8 ? 'chips' : 'squares'),
      columns: cfg.columns || 4,
      color: cfg.color || null,
      groups,
      flash: this._flash || null
    };
  }

  _item(it, shape, flash) {
    const flashing = flash === it.id;
    const icon = flashing ? 'mdi:check' : it.icon;
    const cls = [
      it.dead ? 'dead' : '',
      it.running ? 'run' : '',
      flashing || it.running || (it.kind === 'switch' && it.on) ? 'on' : '',
      it.kind === 'switch' && !it.on && !it.dead ? 'off' : ''
    ].join(' ');

    if (shape === 'chips') {
      return `<div class="chip ${cls}" data-e="${esc(it.id)}">
        <span class="ci"><ha-icon icon="${esc(icon)}"></ha-icon></span>${esc(it.name)}</div>`;
    }
    if (shape === 'rail') {
      return `<div class="r ${cls}" data-e="${esc(it.id)}" title="${esc(it.name)}">
        <ha-icon icon="${esc(icon)}"></ha-icon></div>`;
    }
    if (shape === 'tiles') {
      return `<div class="tile ${cls}" data-e="${esc(it.id)}">
        <div class="tico"><ha-icon icon="${esc(icon)}"></ha-icon></div>
        <div class="tname">${esc(it.name)}</div>
        <div class="tstate ${it.on && !it.dead ? 'hot' : ''}">${esc(it.sub)}</div>
      </div>`;
    }
    const dot = it.showDot && !it.dead
      ? `<span class="dot ${it.on ? '' : 'hollow'}"></span>` : '';
    const slash = it.kind === 'switch' && !it.on && !it.dead ? '<div class="slash"></div>' : '';
    return `<div class="sq ${cls}" data-e="${esc(it.id)}">
      <div class="box">${dot}<ha-icon icon="${esc(icon)}"></ha-icon>${slash}</div>
      <span>${esc(it.name)}</span>
    </div>`;
  }

  _html(m) {
    const wrapOpen = (shape, cols) => {
      if (shape === 'chips') return '<div class="chips">';
      if (shape === 'rail') return '<div class="rail">';
      if (shape === 'tiles') return `<div class="grid" style="grid-template-columns:repeat(${Math.min(cols, 2)},1fr)">`;
      return `<div class="grid" style="grid-template-columns:repeat(${cols},1fr)">`;
    };

    const body = m.groups.map((g, i) => `
      ${i > 0 ? '<div class="fsep"></div>' : ''}
      ${g.label ? `<div class="flabel">${esc(g.label)}</div>` : ''}
      ${wrapOpen(m.shape, m.columns)}
        ${g.items.map((it) => this._item(it, m.shape, m.flash)).join('')}
      </div>`).join('');

    const head = m.title ? `
      <div class="fhead">
        <div>
          <div class="ftitle">${esc(m.title)}</div>
          ${m.subtitle ? `<div class="fsub">${esc(m.subtitle)}</div>` : ''}
        </div>
      </div>` : '';

    const { cls, style } = paletteAttrs(m.color);
    return `<ha-card class="${cls.trim()}"${style}>${head}${body}</ha-card>`;
  }

  _bind(m) {
    const all = m.groups.reduce((n, g) => n.concat(g.items), []);
    this.shadowRoot.querySelectorAll('[data-e]').forEach((el) => {
      const it = all.find((x) => x.id === el.dataset.e);
      if (!it) return;
      this._press(el, {
        onTap: () => this._run(it),
        onHold: () => {
          if (it.domain === 'script' && it.on) this.call('script', 'turn_off', { entity_id: it.id });
          else fireMoreInfo(this, it.id);
        }
      });
    });
  }

  _run(it) {
    if (it.dead) return;

    // Ausdrückliche Vorgabe in der Konfiguration schlägt alles
    if (it.tap === 'trigger' && it.domain === 'automation') {
      this.call('automation', 'trigger', { entity_id: it.id, skip_condition: true });
      this._blink(it.id);
      return;
    }
    if (it.tap === 'toggle') { this.call('homeassistant', 'toggle', { entity_id: it.id }); return; }

    if (it.domain === 'scene') { this.call('scene', 'turn_on', { entity_id: it.id }); this._blink(it.id); return; }
    if (it.domain === 'script') { this.call('script', 'turn_on', { entity_id: it.id }); this._blink(it.id); return; }
    if (it.domain === 'button' || it.domain === 'input_button') {
      this.call(it.domain, 'press', { entity_id: it.id }); this._blink(it.id); return;
    }
    // Automationen, Helfer, Schalter: umschalten
    this.call('homeassistant', 'toggle', { entity_id: it.id });
  }

  /** Kurze Bestätigung: Haken für anderthalb Sekunden */
  _blink(id) {
    this._flash = id;
    this._repaint();
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => { this._flash = null; this._repaint(); }, 1500);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._flashTimer);
  }

  getCardSize() {
    try {
      const m = this._model();
      const rows = m.groups.reduce((n, g) =>
        n + Math.ceil(g.items.length / (m.shape === 'tiles' ? 2 : m.columns)), 0);
      return 1 + rows * (m.shape === 'chips' ? 1 : 2);
    } catch (e) { return 3; }
  }
}

/* ================================================================== *
 * 6) DIAGRAMM-KARTE
 * ================================================================== */

const PERIODS = {
  tag:   { hours: 24,       stat: null,    ticks: 'time' },
  woche: { hours: 24 * 7,   stat: 'hour',  ticks: 'day' },
  monat: { hours: 24 * 30,  stat: 'day',   ticks: 'date' },
  jahr:  { hours: 24 * 365, stat: 'month', ticks: 'month' }
};
const PERIOD_ALIAS = {
  tag: 'tag', day: 'tag', heute: 'tag',
  woche: 'woche', week: 'woche',
  monat: 'monat', month: 'monat',
  jahr: 'jahr', year: 'jahr'
};
const PERIOD_ORDER = ['tag', 'woche', 'monat', 'jahr'];

const nfmt = (v, digits) => {
  if (v == null || isNaN(v)) return '–';
  const d = digits != null ? digits : (Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2);
  return fmtNum(v, { minimumFractionDigits: d, maximumFractionDigits: d });
};

/** Weiche Kurve durch die Punkte — Catmull-Rom, in Bézier übersetzt */
/**
 * Messreihe auf gleichmässige Stützstellen bringen.
 *
 * Die Historie liefert einen Punkt je Zustandsmeldung — mal drei in einer
 * Minute, mal keinen in einer Stunde. Hunderte ungleich verteilte Punkte
 * auf 300 Bildpunkten ergeben Zacken, die kein Mensch lesen kann und die
 * auch nichts aussagen: das ist Rauschen des Sensors, nicht der Verlauf.
 * Also fassen wir sie zu Abschnitten zusammen und mitteln je Abschnitt.
 */
function resample(pts, n) {
  if (pts.length <= n) return pts;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const span = t1 - t0;
  if (span <= 0) return pts;

  const sum = new Float64Array(n), cnt = new Float64Array(n);
  for (const p of pts) {
    const k = Math.min(n - 1, Math.floor(((p.t - t0) / span) * n));
    sum[k] += p.v; cnt[k]++;
  }
  const out = [];
  let last = null;
  for (let k = 0; k < n; k++) {
    // Ein Abschnitt ohne Meldung heisst "unverändert", nicht "null".
    const v = cnt[k] ? sum[k] / cnt[k] : last;
    if (v == null) continue;
    last = v;
    out.push({ t: t0 + (span * (k + 0.5)) / n, v });
  }
  return out.length >= 2 ? out : pts;
}

/**
 * Eine sanfte Glättung über die Stützstellen: jeder Punkt zieht seine
 * beiden Nachbarn zur Hälfte mit hinein. Ein Durchgang reicht — die Linie
 * wird ruhig, die Form bleibt. Die Enden bleiben unangetastet, damit der
 * erste und der letzte Messwert stehen, wo sie hingehören.
 */
function soften(pts) {
  if (pts.length < 5) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    out.push({ t: pts[i].t, v: (pts[i - 1].v + 2 * pts[i].v + pts[i + 1].v) / 4 });
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * Monotone kubische Interpolation nach Fritsch–Carlson.
 *
 * Eine gewöhnliche Catmull-Rom-Spline läuft weich durch alle Punkte, aber
 * sie schwingt zwischen ihnen über: nach einer Spitze schiesst die Kurve
 * höher als der höchste gemessene Wert. Bei einem Diagramm ist das keine
 * Schönheitsfrage — die Kurve zeigt dann einen Wert, den es nie gab.
 * Diese Variante bleibt weich und hält sich trotzdem an die Messwerte.
 */
function smoothPath(pts) {
  const n = pts.length;
  if (!n) return '';
  if (n < 3) return 'M' + pts.map((p) => `${p[0]} ${p[1]}`).join(' L');

  const dx = [], sl = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    sl[i] = dx[i] === 0 ? 0 : (pts[i + 1][1] - pts[i][1]) / dx[i];
  }

  // Steigung je Stützstelle: das Mittel der Nachbarn, aber flach dort,
  // wo die Reihe die Richtung wechselt — sonst entsteht der Überschwinger.
  const m = [sl[0]];
  for (let i = 1; i < n - 1; i++) {
    m[i] = sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2;
  }
  m[n - 1] = sl[n - 2];

  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / sl[i], b = m[i + 1] / sl[i];
    const q = a * a + b * b;
    if (q > 9) {
      const k = 3 / Math.sqrt(q);
      m[i] = k * a * sl[i];
      m[i + 1] = k * b * sl[i];
    }
  }

  const f = (v) => (Math.round(v * 100) / 100);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${f(pts[i][0] + h)} ${f(pts[i][1] + m[i] * h)},`
       + ` ${f(pts[i + 1][0] - h)} ${f(pts[i + 1][1] - m[i + 1] * h)},`
       + ` ${f(pts[i + 1][0])} ${f(pts[i + 1][1])}`;
  }
  return d;
}

class OnyxChartCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:12px; border-radius:var(--onyx-r,24px); border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:10px; overflow:hidden; box-shadow:none;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
    }
    ha-card.tinted{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }

    .head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .hleft{ display:flex; align-items:center; gap:10px; min-width:0; }
    .hico{ width:34px;height:34px;border-radius:50%;flex:none; display:grid;place-items:center;
           background:color-mix(in srgb, var(--acc) 16%, transparent);
           border:1px solid color-mix(in srgb, var(--acc) 30%, transparent);
           color:var(--acc); --mdc-icon-size:17px; }
    .lab{ font-size:11px; line-height:14px; color:#6f8497; }
    .nm{ font-size:13px; font-weight:600; line-height:18px; color:#dbe6f0;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* Die drei Messwerte rechts sind zugleich die Auswahl für den Graphen */
    .vals{ display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex:none; }
    .v{ text-align:right; cursor:pointer; line-height:1.15; padding:1px 0;
        font-variant-numeric:tabular-nums; }
    .v .n{ font-size:13px; font-weight:600; color:#7d8fa0; }
    .v .u{ font-size:10.5px; font-weight:500; color:#66788a; margin-left:2px; }
    .v .cap{ font-size:9.5px; color:#5d6b7a; letter-spacing:.02em; }
    .v.sel .n{ font-size:22px; font-weight:700; letter-spacing:-.02em; color:#ffffff; }
    .v.sel .u{ font-size:13px; color:rgba(255,255,255,.75); }
    .v.sel .cap{ color:var(--acc); }
    .v.held{ opacity:.6; }

    .chart{ position:relative; }
    svg{ display:block; width:100%; height:96px; overflow:visible; }
    .axis{ display:flex; justify-content:space-between; margin-top:4px; }
    .axis span{ font-size:10px; color:#5d6b7a; font-variant-numeric:tabular-nums; }

    .foot{ display:flex; align-items:center; justify-content:space-between; }
    .per{ font-size:10.5px; color:#6f8497; cursor:pointer; padding:2px 8px; border-radius:9px;
          border:1px solid rgba(255,255,255,.10);
          background:linear-gradient(rgba(255,255,255,.10), rgba(255,255,255,.03)); }
    .per.held{ opacity:.6; }
    .hint{ font-size:10px; color:#4f5c69; }

    .empty{ height:96px; display:grid; place-items:center; font-size:12px; color:#5d6b7a; }
    `;
  }

  static getStubConfig(hass) {
    // Nur Sensoren mit Zahl und Einheit — ein Textsensor gäbe eine leere Kurve.
    const first = firstEntity(hass, 'sensor', (st) =>
      st.attributes.unit_of_measurement && !isNaN(parseFloat(st.state)));
    return {
      type: 'custom:onyx-chart-card', title: t('history'),
      entities: first ? [first] : []
    };
  }

  setConfig(config) {
    const list = normList(config.entities);
    if (!list || !list.length) throw new Error(t('err.needEntities'));
    if (list.length > 3) throw new Error(t('err.tooMany'));
    const p = PERIOD_ALIAS[String(config.period || 'tag').toLowerCase()];
    if (!p) throw new Error(t('err.period'));
    this._period = this._period || p;
    this._sel = this._sel == null ? 0 : this._sel;
    super.setConfig(config);
  }

  set hass(hass) {
    this._hass = hass;
    applyLocale(hass);
    this._maybeFetch();
    this._tryRender();
  }
  get hass() { return this._hass; }

  _list() { return normList(this._config.entities) || []; }

  _key() { return this._list().map((e) => e.entity).join('|') + '@' + this._period; }

  /** Verlauf holen: kurzer Zeitraum aus der Historie, längere aus den Statistiken */
  async _maybeFetch(force) {
    if (!this._hass || !this._config) return;
    const key = this._key();
    if (!force && this._fetchedKey === key && Date.now() - (this._fetchedAt || 0) < 120000) return;
    if (this._fetching === key) return;
    this._fetching = key;

    const def = PERIODS[this._period];
    const end = new Date();
    const start = new Date(end.getTime() - def.hours * 3600 * 1000);
    const ids = this._list().map((e) => e.entity);

    try {
      let series = {};
      if (def.stat) {
        const res = await this._hass.callWS({
          type: 'recorder/statistics_during_period',
          start_time: start.toISOString(), end_time: end.toISOString(),
          statistic_ids: ids, period: def.stat, types: ['mean', 'state']
        });
        for (const id of ids) {
          series[id] = (res[id] || []).map((r) => ({
            t: typeof r.start === 'number' ? r.start : Date.parse(r.start),
            v: r.mean != null ? r.mean : r.state
          })).filter((p) => p.v != null);
        }
      }
      // Nichts in den Statistiken? Dann die rohe Historie versuchen.
      if (!def.stat || ids.every((id) => !series[id] || !series[id].length)) {
        const res = await this._hass.callWS({
          type: 'history/history_during_period',
          start_time: start.toISOString(), end_time: end.toISOString(),
          entity_ids: ids, minimal_response: true, no_attributes: true
        });
        for (const id of ids) {
          series[id] = (res[id] || []).map((r) => ({
            t: (r.lu != null ? r.lu * 1000 : Date.parse(r.last_updated)),
            v: parseFloat(r.s != null ? r.s : r.state)
          })).filter((p) => !isNaN(p.v) && !isNaN(p.t));
        }
      }
      this._series = series;
      this._error = null;
    } catch (err) {
      this._error = err && err.message ? err.message : t('historyFailed');
      this._series = {};
    }
    this._fetchedKey = key;
    this._fetchedAt = Date.now();
    this._fetching = null;
    this._repaint();
  }

  _model() {
    const hass = this._hass;
    const items = this._list().map((e, i) => {
      const st = hass.states[e.entity];
      const raw = st ? parseFloat(st.state) : NaN;
      const pts = (this._series && this._series[e.entity]) || [];
      return {
        id: e.entity, i,
        name: e.name || nameOf(hass, e.entity),
        unit: e.unit || (st && st.attributes.unit_of_measurement) || '',
        value: isNaN(raw) ? null : raw,
        dead: isDead(st),
        n: pts.length,
        last: pts.length ? pts[pts.length - 1].v : null
      };
    });
    const sel = Math.min(this._sel, items.length - 1);
    return {
      title: this._config.title || null,
      label: this._config.label || t('history'),
      icon: this._config.icon || 'mdi:chart-line',
      color: this._config.color || null,
      tinted: this._config.tinted === true,
      period: this._period,
      items, sel,
      error: this._error || null
    };
  }

  _tickLabels(from, to) {
    const p = this._period;
    const f = (d) => {
      if (p === 'tag') return fmtTime(d);
      if (p === 'woche') return fmtDate(d, { weekday: 'short' });
      if (p === 'monat') return fmtDate(d, { day: '2-digit', month: '2-digit' });
      return fmtDate(d, { month: 'short' });
    };
    const mid = new Date((from + to) / 2);
    return [f(new Date(from)), f(mid), f(new Date(to))];
  }

  _chart(m) {
    const it = m.items[m.sel];
    const raw = (this._series && this._series[it.id]) || [];
    if (m.error) return `<div class="empty">${esc(m.error)}</div>`;
    if (raw.length < 2) return `<div class="empty">${esc(t('noHistory'))}</div>`;
    // Nur die rohe Historie wird zusammengefasst und geglättet — sie
    // liefert Hunderte zappelnder Punkte. Langzeitstatistiken sind bereits
    // gemittelt; die bleiben unangetastet, sonst würden aus gemessenen
    // Monatswerten weichgezeichnete Näherungen.
    const pts = raw.length > 48 ? soften(resample(raw, 48)) : raw;

    const W = 100, H = 40, pad = 1.5;          // in viewBox-Einheiten
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    let lo = Math.min(...pts.map((p) => p.v)), hi = Math.max(...pts.map((p) => p.v));
    if (hi === lo) { hi = lo + 1; lo -= 1; }
    const span = hi - lo;
    lo -= span * 0.12; hi += span * 0.12;

    const xy = pts.map((p) => [
      ((p.t - t0) / (t1 - t0 || 1)) * W,
      H - pad - ((p.v - lo) / (hi - lo)) * (H - pad * 2)
    ]);
    const line = smoothPath(xy);
    const area = `${line} L${W} ${H} L0 ${H} Z`;
    const ticks = this._tickLabels(t0, t1);
    const gid = 'g' + m.sel;

    return `
    <div class="chart">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--acc)" stop-opacity=".38"/>
            <stop offset="100%" stop-color="var(--acc)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <line x1="50" y1="0" x2="50" y2="${H}" stroke="rgba(255,255,255,.06)"
              stroke-width=".4" stroke-dasharray="1 2"/>
        <path d="${area}" fill="url(#${gid})"/>
        <path d="${line}" fill="none" stroke="var(--acc)" stroke-width="2"
              vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
      <div class="axis">${ticks.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
    </div>`;
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const vals = m.items.map((it) => `
      <div class="v ${it.i === m.sel ? 'sel' : ''}" data-i="${it.i}">
        <div><span class="n">${it.dead ? '–' : esc(nfmt(it.value))}</span><span class="u">${esc(it.unit)}</span></div>
        <div class="cap">${esc(it.name)}</div>
      </div>`).join('');

    return `
    <ha-card class="${m.tinted ? 'tinted' : ''}${cls}"${style}>
      <div class="head">
        <div class="hleft">
          <div class="hico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
          <div style="min-width:0">
            <div class="lab">${esc(m.label)}</div>
            <div class="nm">${esc(m.title || m.items[m.sel].name)}</div>
          </div>
        </div>
        <div class="vals">${vals}</div>
      </div>
      ${this._chart(m)}
      <div class="foot">
        <div class="per" id="per">${esc(t('period.' + m.period))}</div>
        <div class="hint">${m.items.length > 1 ? esc(t('tapToSwitch')) : ''}</div>
      </div>
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;
    root.querySelectorAll('.v[data-i]').forEach((el) => {
      const i = Number(el.dataset.i);
      this._press(el, {
        onTap: () => { this._sel = i; this._repaint(); },
        onHold: () => fireMoreInfo(this, m.items[i].id)
      });
    });
    const per = root.getElementById('per');
    if (per) this._press(per, {
      onTap: () => {
        const n = PERIOD_ORDER[(PERIOD_ORDER.indexOf(this._period) + 1) % PERIOD_ORDER.length];
        this._period = n;
        this._maybeFetch(true);
        this._repaint();
      }
    });
  }

  getCardSize() { return 4; }
}

/* ================================================================== *
 * 7) SAUGROBOTER-KARTE
 * ================================================================== */

/** Bits aus supported_features des vacuum */
const VF = {
  TURN_ON: 1, TURN_OFF: 2, PAUSE: 4, STOP: 8, RETURN_HOME: 16,
  FAN_SPEED: 32, BATTERY: 64, STATUS: 128, SEND_COMMAND: 256,
  LOCATE: 512, CLEAN_SPOT: 1024, MAP: 2048, STATE: 4096, START: 8192
};

/** Zustände, in denen der Roboter wirklich arbeitet */
const VAC_BUSY = ['cleaning', 'returning', 'paused', 'error'];

/** Verstrichene Zeit auf Minuten gerundet — sonst zeichnet die Karte sekündlich neu */
function sinceMin(iso) {
  const t = Date.parse(iso);
  if (isNaN(t)) return null;
  const m = Math.floor((Date.now() - t) / 60000);
  return m >= 0 && m < 60 * 24 ? m : null;
}

class OnyxVacuumCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:12px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:10px; overflow:hidden;
      box-shadow:none;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
    }
    ha-card.warm{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }

    .head{ display:flex; align-items:center; justify-content:space-between; gap:11px; }
    .hleft{ display:flex; align-items:center; gap:11px; min-width:0; cursor:pointer; }

    /* Der Akkuring: ein Kegelverlauf als Rand um den Symbolkreis, den jede
       Karte ohnehin hat. Der Akkustand ist die Zahl, die man beim
       Saugroboter zuerst sucht — deshalb steht sie zweimal da, einmal zum
       Überfliegen und einmal zum Nachlesen. */
    .ring{ width:42px; height:42px; border-radius:50%; padding:2.5px; flex:none;
           background:conic-gradient(var(--acc) calc(var(--b) * 1%),
                                     rgba(255,255,255,.10) 0); }
    /* Unter 20 % rot, unabhängig von der Kartenfarbe — ein leerer Akku soll
       auch auf einer violetten Karte auffallen. */
    .ring.low{ background:conic-gradient(#ef5f68 calc(var(--b) * 1%),
                                         rgba(255,255,255,.10) 0); }
    .ring > .vico{ width:100%; height:100%; border-radius:50%; display:grid;
                   place-items:center; background:#15181d; color:#8ea3b5;
                   --mdc-icon-size:19px; }
    ha-card.warm .ring > .vico{ background:color-mix(in srgb, var(--w1) 82%, #000);
                                color:var(--acc); }
    .ring.dead{ opacity:.45; }
    /* Nicht erreichbar: die ganze Karte tritt zurück und nimmt keine Befehle */
    ha-card.off{ opacity:.55; }
    ha-card.off .prim, ha-card.off .gbtn{ cursor:default; }
    @keyframes onyxspin{ to{ transform:rotate(360deg) } }
    .ring.run{ animation:onyxspin 3.4s linear infinite; }
    .ring.run > .vico{ animation:onyxspin 3.4s linear infinite reverse; }

    .lab{ font-size:11px; line-height:14px; color:#6f8497; }
    ha-card.warm .lab{ color:var(--lab); }
    .nm{ font-size:13px; font-weight:600; line-height:18px; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .nm{ color:#e9f1f8; }
    .env{ text-align:right; line-height:1.35; font-variant-numeric:tabular-nums; }
    .env .t{ font-size:16px; font-weight:700; letter-spacing:-.02em; color:#9fb0be; }
    ha-card.warm .env .t{ color:var(--acc); }
    .env .h{ font-size:12px; color:#72879a; }
    ha-card.warm .env .h{ color:var(--sub); }

    .sub{ font-size:12px; line-height:16px; color:#72879a; }
    ha-card.warm .sub{ color:var(--sub); }

    /* Störung im selben Ton wie die Windsperre der Storen-Karte */
    .warn{ display:inline-flex; align-items:center; gap:6px; align-self:flex-start;
           background:rgba(240,172,116,.14); border:1px solid rgba(240,172,116,.28);
           color:#f0ac74; border-radius:99px; padding:4px 11px; font-size:11.5px;
           font-weight:500; --mdc-icon-size:13px; }

    /* Bedienreihe. Start und Pause ist die eine Handlung, für die man die
       Karte öffnet — die bekommt Text, nicht bloss ein Symbol. */
    .ctl{ display:flex; align-items:center; gap:8px; }
    .glass{ background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
            -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
            border:1px solid rgba(255,255,255,.11); }
    .prim{ flex:1; height:40px; border-radius:13px; display:flex; align-items:center;
           justify-content:center; gap:8px; color:#fff; font-size:13px; font-weight:600;
           --mdc-icon-size:18px; cursor:pointer;
           transition:transform .12s ease, background .18s ease; }
    .prim.on{ background:color-mix(in srgb, var(--btn) 60%, transparent);
              border-color:color-mix(in srgb, var(--btn) 78%, transparent);
              box-shadow:0 0 0 1px color-mix(in srgb, var(--btn) 22%, transparent),
                         0 10px 26px color-mix(in srgb, var(--btn) 26%, transparent); }
    .prim.held{ transform:scale(.97); }
    .gbtn{ width:40px; height:40px; border-radius:50%; flex:none; display:grid;
           place-items:center; color:#fff; --mdc-icon-size:18px; cursor:pointer;
           transition:transform .12s ease, background .18s ease; }
    .gbtn.dim{ opacity:.38; }
    .gbtn.held{ transform:scale(.92); }

    /* Saugstufe steht immer sichtbar: vier Stufen durchzutippen wäre lästig,
       und man will vor dem Starten sehen, worauf sie steht. */
    .fans{ display:flex; gap:6px; }
    .fan{ flex:1; height:28px; border-radius:9px; display:grid; place-items:center;
          font-size:11.5px; color:#8ea3b5; cursor:pointer; padding:0 4px;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07);
          transition:background .18s ease; }
    .fan.on{ background:color-mix(in srgb, var(--btn) 45%, transparent);
             border-color:color-mix(in srgb, var(--btn) 65%, transparent);
             color:#fff; font-weight:600; }
    .fan.held{ opacity:.6; }

    .divide{ height:1px; background:rgba(255,255,255,.09); }
    .grp{ display:flex; justify-content:space-between; align-items:baseline;
          font-size:11px; color:#6f8497; }
    ha-card.warm .grp{ color:var(--lab); }
    .grp b{ font-weight:600; color:var(--acc); }

    /* Räume: dieselben Kacheln wie die Schnellzugriffe */
    .rooms{ display:grid; gap:10px; }
    .rm{ text-align:center; cursor:pointer; }
    .rm .box{ width:100%; aspect-ratio:1; max-width:70px; margin:0 auto 6px;
              border-radius:18px; display:grid; place-items:center; color:#c8d8e6;
              --mdc-icon-size:22px;
              background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
              -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
              border:1px solid rgba(255,255,255,.11);
              transition:transform .12s ease, background .18s ease; }
    .rm.on .box{ background:color-mix(in srgb, var(--btn) 60%, transparent);
                 border-color:color-mix(in srgb, var(--btn) 78%, transparent); color:#fff; }
    .rm.held .box{ transform:scale(.94); }
    .rm span{ font-size:10.5px; color:#a8bccd; display:block; line-height:1.3;
              overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .rm.on span{ color:#fff; }

    /* Verbrauchsteile: dieselben Zeilen wie die Geräteliste der Raumkarte */
    .rows{ display:flex; flex-direction:column; gap:7px; }
    .lrow{ position:relative; overflow:hidden; border-radius:12px; height:46px;
           display:flex; align-items:center; gap:11px; padding:0 12px;
           background:rgba(255,255,255,.055); cursor:pointer; }
    .lfill{ position:absolute; left:0; top:0; bottom:0;
            background:color-mix(in srgb, var(--acc) 22%, transparent); }
    .lrow > *:not(.lfill){ position:relative; z-index:1; }
    .lico{ width:30px; height:30px; border-radius:50%; flex:none; display:grid;
           place-items:center; color:#c8d8e6; --mdc-icon-size:16px;
           background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
           border:1px solid rgba(255,255,255,.11); }
    .lname{ flex:1; min-width:0; font-size:13px; font-weight:500; color:#cddceb;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .lval{ font-size:12.5px; color:var(--sub); font-variant-numeric:tabular-nums; }
    .lrow.due .lfill{ background:rgba(239,95,104,.22); }
    .lrow.due .lval{ color:#f2949a; }
    .lrow.held{ opacity:.7; }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-vacuum-card', entity: firstEntity(hass, 'vacuum') };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    if (config.entity.split('.')[0] !== 'vacuum') throw new Error(t('err.needVacuum'));
    this._open = this._open || null;
    this._picked = this._picked || [];
    super.setConfig(config);
  }

  /* --- Akku: Attribut, eigene Entität, sonst der Sensor am selben Gerät --- */
  _battery(st) {
    const a = st.attributes.battery_level;
    if (a != null && !isNaN(a)) return Math.round(Number(a));

    const cfgId = this._config.battery_entity;
    if (cfgId) {
      const b = this._hass.states[cfgId];
      const n = b ? Number(b.state) : NaN;
      return isNaN(n) ? null : Math.round(n);
    }

    // Neuere Integrationen führen den Akku als eigenen Sensor. Wir suchen
    // ihn am selben Gerät statt über Namensraten — das trifft auch dann,
    // wenn der Sensor ganz anders heisst.
    const ent = (this._hass.entities || {})[this._config.entity];
    const dev = ent && ent.device_id;
    if (!dev) return null;
    for (const [id, e] of Object.entries(this._hass.entities || {})) {
      if (e.device_id !== dev || id.split('.')[0] !== 'sensor') continue;
      const s = this._hass.states[id];
      if (!s || s.attributes.device_class !== 'battery') continue;
      const n = Number(s.state);
      if (!isNaN(n)) return Math.round(n);
    }
    return null;
  }

  _rooms() {
    return (this._config.rooms || [])
      .map((r) => (typeof r === 'string' ? { name: r, id: r } : Object.assign({}, r)))
      .filter((r) => r.id != null && r.id !== '');
  }

  /** Verbrauchsteile in Prozent. Manche Sensoren melden Prozent, andere Stunden. */
  _consumables() {
    const list = normList(this._config.consumables) || [];
    return list.map((c) => {
      const st = this._hass.states[c.entity];
      const unit = st ? (st.attributes.unit_of_measurement || '') : '';
      let pct = null;
      if (st && !isDead(st)) {
        const n = Number(st.state);
        if (!isNaN(n)) {
          // Prozentsensoren direkt, Stundensensoren gegen ihren Maximalwert
          pct = unit === '%' ? n
            : c.max ? clamp(Math.round((n / c.max) * 100), 0, 100) : null;
        }
      }
      return {
        id: c.entity,
        name: c.name || nameOf(this._hass, c.entity),
        icon: c.icon || (st && st.attributes.icon) || 'mdi:air-filter',
        pct,
        raw: st && !isDead(st) ? `${nfmt(Number(st.state), 0)} ${unit}`.trim() : '–',
        due: pct != null && pct <= 10,
        dead: !st || isDead(st)
      };
    });
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(t('err.entity', { id: this._config.entity }));
    const a = st.attributes;
    const f = a.supported_features || 0;
    const state = st.state;
    const batt = this._battery(st);
    const rooms = this._rooms();
    const cons = this._open === 'cons' ? this._consumables() : [];

    // "docked" heisst nicht automatisch voll: unter 100 % wird geladen.
    const charging = state === 'docked' && batt != null && batt < 100;
    const busy = VAC_BUSY.includes(state);

    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      label: this._config.label || t('vac'),
      icon: this._config.icon || 'mdi:robot-vacuum',
      color: this._config.color || null,
      state,
      dead: isDead(st) && state !== 'idle',
      batt,
      charging,
      busy,
      minutes: busy ? sinceMin(st.last_changed) : null,
      area: a.cleaned_area != null ? Math.round(Number(a.cleaned_area)) : null,
      status: a.status || null,
      error: state === 'error' ? (a.error || t('vac.errorGeneric')) : null,
      fan: a.fan_speed || null,
      fanList: (f & VF.FAN_SPEED) && Array.isArray(a.fan_speed_list)
        ? a.fan_speed_list : [],
      can: {
        start: !!(f & (VF.START | VF.TURN_ON)),
        pause: !!(f & VF.PAUSE),
        stop: !!(f & VF.STOP),
        home: !!(f & VF.RETURN_HOME),
        locate: !!(f & VF.LOCATE),
        send: !!(f & VF.SEND_COMMAND)
      },
      rooms: rooms.map((r, i) => Object.assign({ i }, r,
        { on: this._picked.includes(String(r.id)) })),
      picked: this._picked.length,
      cons,
      dueCount: cons.filter((c) => c.due).length,
      open: this._open,
      hasRooms: rooms.length > 0,
      hasCons: (normList(this._config.consumables) || []).length > 0,
      showFan: this._config.show_fan_speed !== false
    };
  }

  /** Zustand in Worte: die Kopfzeile knapp, die Zeile darunter ausführlich */
  _stateWord(m) {
    if (m.dead) return t('unavailable');
    if (m.state === 'cleaning') return t('vac.cleaning');
    if (m.state === 'paused') return t('vac.paused');
    if (m.state === 'returning') return t('vac.returning');
    if (m.state === 'error') return t('vac.stopped');
    if (m.state === 'docked') return t(m.charging ? 'vac.charging' : 'vac.charged');
    return t('vac.idle');
  }

  _summary(m) {
    const bits = [];
    if (m.state === 'returning') bits.push(t('vac.toDock'));
    else if (m.state === 'docked') bits.push(t('vac.docked'));
    else if (m.status) bits.push(m.status);
    else bits.push(this._stateWord(m));

    if (m.minutes != null) bits.push(t('vac.since', { t: t('vac.minutes', { n: m.minutes }) }));
    if (m.area) bits.push(t('vac.area', { n: nfmt(m.area, 0) }));
    return bits.join(' · ');
  }

  /** Welcher Knopf wo hinführt, hängt allein am Zustand */
  _primary(m) {
    if (m.state === 'cleaning') return { key: 'pause', icon: 'mdi:pause', text: t('vac.pause') };
    if (m.state === 'paused') return { key: 'start', icon: 'mdi:play', text: t('vac.resume') };
    if (m.state === 'returning') return { key: 'stop', icon: 'mdi:stop', text: t('vac.cancel') };
    if (m.picked) {
      return { key: 'segments', icon: 'mdi:play',
        text: t(m.picked === 1 ? 'vac.cleanRoom' : 'vac.cleanRooms', { n: m.picked }) };
    }
    return { key: 'start', icon: 'mdi:play', text: t('vac.start') };
  }

  _html(m) {
    // Eine Störung übersteuert die Kartenfarbe. Ein stehender Roboter, der
    // in fröhlichem Violett leuchtet, wird übersehen — und genau das ist
    // die Meldung, die man nicht übersehen darf.
    const { cls, style } = paletteAttrs(m.error ? 'rot' : m.color);
    const warm = (m.busy || m.charging) && !m.dead;
    const p = this._primary(m);
    const ringCls = [m.batt != null && m.batt < 20 ? 'low' : '',
      m.state === 'cleaning' ? 'run' : '', m.dead ? 'dead' : ''].join(' ');

    const sections = [];
    if (m.open === 'rooms' && m.hasRooms) {
      const cols = Math.min(4, Math.max(2, m.rooms.length));
      sections.push(`
        <div class="divide"></div>
        <div class="grp"><span>${esc(t('vac.rooms'))}</span>
          <b>${m.picked ? esc(t('vac.selected', { n: m.picked })) : ''}</b></div>
        <div class="rooms" style="grid-template-columns:repeat(${cols},1fr)">
          ${m.rooms.map((r) => `
            <div class="rm ${r.on ? 'on' : ''}" data-room="${esc(r.id)}">
              <div class="box"><ha-icon icon="${esc(r.icon || 'mdi:floor-plan')}"></ha-icon></div>
              <span>${esc(r.name)}</span>
            </div>`).join('')}
        </div>`);
    }
    if (m.open === 'cons' && m.hasCons) {
      sections.push(`
        <div class="divide"></div>
        <div class="grp"><span>${esc(t('vac.consumables'))}</span>
          <b>${m.dueCount ? esc(t('vac.due', { n: m.dueCount })) : ''}</b></div>
        <div class="rows">
          ${m.cons.map((c) => `
            <div class="lrow ${c.due ? 'due' : ''}" data-cons="${esc(c.id)}">
              <div class="lfill" style="width:${c.pct == null ? 0 : c.pct}%"></div>
              <div class="lico"><ha-icon icon="${esc(c.icon)}"></ha-icon></div>
              <div class="lname">${esc(c.name)}</div>
              <div class="lval">${c.pct == null ? esc(c.raw) : c.pct + ' %'}</div>
            </div>`).join('')}
        </div>`);
    }

    return `
    <ha-card class="${(cls + (warm ? ' warm' : '') + (m.dead ? ' off' : '')).trim()}"${style}>
      <div class="head">
        <div class="hleft" id="hl">
          <div class="ring ${ringCls}" style="--b:${m.batt == null ? 0 : m.batt}">
            <div class="vico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
          </div>
          <div style="min-width:0">
            <div class="lab">${esc(m.label)}</div>
            <div class="nm">${esc(m.name)}</div>
          </div>
        </div>
        <div class="env">
          <div class="t">${m.batt == null ? '–' : m.batt + ' %'}</div>
          <div class="h">${esc(this._stateWord(m))}</div>
        </div>
      </div>

      ${m.error ? `<div class="warn"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${esc(m.error)}</div>`
        : m.dead ? '' : `<div class="sub">${esc(this._summary(m))}</div>`}

      <div class="ctl">
        <div class="prim glass ${(m.busy || m.picked) && !m.dead ? 'on' : ''}" id="prim">
          <ha-icon icon="${esc(p.icon)}"></ha-icon>${esc(p.text)}</div>
        <div class="gbtn glass ${m.state === 'docked' || !m.can.home ? 'dim' : ''}" id="home">
          <ha-icon icon="mdi:home-import-outline"></ha-icon></div>
        <div class="gbtn glass ${m.can.locate ? '' : 'dim'}" id="locate">
          <ha-icon icon="mdi:map-marker"></ha-icon></div>
      </div>

      ${m.showFan && m.fanList.length && !m.dead ? `
      <div class="fans">
        ${m.fanList.map((f) => `
          <div class="fan ${f === m.fan ? 'on' : ''}" data-fan="${esc(f)}">${esc(f)}</div>`).join('')}
      </div>` : ''}

      ${sections.join('')}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;
    const p = this._primary(m);

    // Tippen auf den Kopf blättert durch die eingerichteten Abschnitte,
    // Halten öffnet das Detailfenster — wie in der Raumkarte.
    this._press(root.getElementById('hl'), {
      onTap: () => {
        const steps = [null];
        if (m.hasRooms) steps.push('rooms');
        if (m.hasCons) steps.push('cons');
        if (steps.length === 1) { fireMoreInfo(this, m.id); return; }
        const next = steps[(steps.indexOf(this._open) + 1) % steps.length];
        this._open = next;
        this._repaint();
      },
      onHold: () => fireMoreInfo(this, m.id)
    });

    this._press(root.getElementById('prim'), {
      onTap: () => {
        if (m.dead) return;
        if (p.key === 'pause') return this.call('vacuum', 'pause', { entity_id: m.id });
        if (p.key === 'stop') return this.call('vacuum', 'stop', { entity_id: m.id });
        if (p.key === 'segments') {
          this.call('vacuum', 'send_command', {
            entity_id: m.id,
            command: this._config.room_command || 'app_segment_clean',
            params: this._picked.map((x) => (isNaN(Number(x)) ? x : Number(x)))
          });
          this._picked = [];
          this._repaint();
          return;
        }
        this.call('vacuum', m.can.start && !m.can.pause ? 'turn_on' : 'start',
          { entity_id: m.id });
      },
      onHold: () => fireMoreInfo(this, m.id)
    });

    this._press(root.getElementById('home'), {
      onTap: () => {
        if (!m.dead && m.can.home) this.call('vacuum', 'return_to_base', { entity_id: m.id });
      }
    });
    this._press(root.getElementById('locate'), {
      onTap: () => {
        if (!m.dead && m.can.locate) this.call('vacuum', 'locate', { entity_id: m.id });
      }
    });

    root.querySelectorAll('[data-fan]').forEach((el) => {
      this._press(el, {
        onTap: () => this.call('vacuum', 'set_fan_speed',
          { entity_id: m.id, fan_speed: el.dataset.fan })
      });
    });

    root.querySelectorAll('[data-room]').forEach((el) => {
      const id = el.dataset.room;
      this._press(el, {
        onTap: () => {
          const i = this._picked.indexOf(id);
          if (i < 0) this._picked.push(id); else this._picked.splice(i, 1);
          this._repaint();
        },
        // Halten saugt sofort nur diesen einen Raum
        onHold: () => {
          this.call('vacuum', 'send_command', {
            entity_id: m.id,
            command: this._config.room_command || 'app_segment_clean',
            params: [isNaN(Number(id)) ? id : Number(id)]
          });
          this._picked = [];
          this._repaint();
        }
      });
    });

    root.querySelectorAll('[data-cons]').forEach((el) => {
      this._press(el, { onTap: () => fireMoreInfo(this, el.dataset.cons) });
    });
  }

  getCardSize() {
    return this._open ? 5 : 3;
  }
}

/* ------------------------------------------------------------------ *
 * Wetterszenen
 *
 * Statt eines Symbols aus der Schriftart zeichnet die Wetterkarte eine
 * kleine Szene: Sonne mit Strahlen, ziehende Wolken, fallende Tropfen.
 * Alles als SVG im Dokument, damit es die Kartenfarbe annehmen kann und
 * ohne Bilddatei auskommt — die Karten sollen weiter eine einzelne Datei
 * ohne Abhängigkeiten bleiben.
 *
 * Die Verläufe brauchen IDs. Weil jede Karte in ihrem eigenen Schatten-
 * baum steckt, können sich die nicht in die Quere kommen.
 * ------------------------------------------------------------------ */

const WX_CSS = `
  @keyframes wxSpin{ to{ transform:rotate(360deg) } }
  @keyframes wxDrift{ 0%,100%{ transform:translateX(-1.5px) } 50%{ transform:translateX(1.5px) } }
  @keyframes wxFall{ 0%{ transform:translateY(-4px); opacity:0 }
                     20%{ opacity:1 } 100%{ transform:translateY(12px); opacity:0 } }
  @keyframes wxFlake{ 0%{ transform:translate(0,-3px); opacity:0 }
                      25%{ opacity:1 }
                      100%{ transform:translate(3px,12px); opacity:0 } }
  @keyframes wxFlash{ 0%,88%,100%{ opacity:.35 } 92%{ opacity:1 } 95%{ opacity:.5 } }
  @keyframes wxGust{ 0%{ transform:translateX(-4px); opacity:0 }
                     30%{ opacity:.9 } 100%{ transform:translateX(6px); opacity:0 } }

  .wx .sun{ transform-origin:32px 32px; animation:wxSpin 40s linear infinite; }
  .wx .cloud{ animation:wxDrift 7s ease-in-out infinite; }
  .wx .cloud2{ animation:wxDrift 9s ease-in-out infinite reverse; }
  .wx .drop{ animation:wxFall 1.15s linear infinite; }
  .wx .flake{ animation:wxFlake 2.6s linear infinite; }
  .wx .bolt{ animation:wxFlash 3.2s ease-in-out infinite; }
  .wx .gust{ animation:wxGust 3.4s ease-in-out infinite; }
  /* Wer Bewegung im Betriebssystem abbestellt hat, bekommt ein Standbild. */
  @media (prefers-reduced-motion: reduce){
    .wx .sun, .wx .cloud, .wx .cloud2, .wx .drop,
    .wx .flake, .wx .bolt, .wx .gust{ animation:none; }
  }
`;

/** Sonne: Kern mit Schein, darum acht Strahlen */
function wxSun(id, cx, cy, r) {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = cx + Math.cos(a) * (r + 3.5), y1 = cy + Math.sin(a) * (r + 3.5);
    const x2 = cx + Math.cos(a) * (r + 8), y2 = cy + Math.sin(a) * (r + 8);
    rays.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}"
      x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`);
  }
  return `
    <g class="sun" style="transform-origin:${cx}px ${cy}px">
      <g stroke="url(#s${id})" stroke-width="2.6" stroke-linecap="round"
         opacity=".85">${rays.join('')}</g>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="url(#g${id})"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#s${id})"/>`;
}

/** Mond: eine Scheibe, aus der eine zweite ausgeschnitten wird */
function wxMoon(id, cx, cy, r) {
  return `
    <mask id="m${id}">
      <rect width="64" height="64" fill="#000"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>
      <circle cx="${cx + r * 0.55}" cy="${cy - r * 0.5}" r="${r * 0.88}" fill="#000"/>
    </mask>
    <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="url(#g${id})"/>
    <g mask="url(#m${id})"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#s${id})"/></g>`;
}

/** Wolke aus drei Kuppen auf einem Sockel */
function wxCloud(cx, cy, s, cls, op) {
  const f = `fill="url(#c)" opacity="${op == null ? 1 : op}"`;
  return `
    <g class="${cls || 'cloud'}">
      <circle cx="${cx - 7 * s}" cy="${cy}" r="${6.5 * s}" ${f}/>
      <circle cx="${cx + 1 * s}" cy="${cy - 4.5 * s}" r="${9 * s}" ${f}/>
      <circle cx="${cx + 9 * s}" cy="${cy}" r="${7 * s}" ${f}/>
      <rect x="${cx - 13.5 * s}" y="${cy}" width="${27 * s}" height="${7 * s}"
            rx="${3.5 * s}" ${f}/>
    </g>`;
}

const wxDrops = (n, y) => Array.from({ length: n }, (_, i) => {
  const x = 20 + i * (24 / Math.max(1, n - 1));
  return `<line class="drop" x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + 6}"
    stroke="url(#c)" stroke-width="2.4" stroke-linecap="round"
    style="animation-delay:${(i * 0.28).toFixed(2)}s" opacity=".9"/>`;
}).join('');

const wxFlakes = (n, y) => Array.from({ length: n }, (_, i) => {
  const x = 21 + i * (22 / Math.max(1, n - 1));
  return `<circle class="flake" cx="${x}" cy="${y}" r="1.9" fill="url(#c)"
    style="animation-delay:${(i * 0.55).toFixed(2)}s"/>`;
}).join('');

const wxGusts = (ys) => ys.map((y, i) => `
  <path class="gust" d="M14 ${y}h20a3.4 3.4 0 1 0-3.4-3.4"
    fill="none" stroke="url(#c)" stroke-width="2.4" stroke-linecap="round"
    style="animation-delay:${(i * 0.5).toFixed(2)}s"/>`).join('');

/**
 * Eine Szene zur Wetterlage. `night` schaltet Sonne gegen Mond.
 * Die Farben kommen aus den Verläufen, die Verläufe aus der Palette —
 * so folgt die Szene der Karte.
 */
function wxScene(cond, night, id) {
  const sunish = night ? wxMoon : wxSun;
  const defs = `
    <defs>
      <radialGradient id="g${id}">
        <stop offset="0%" stop-color="var(--wx-hot)" stop-opacity=".55"/>
        <stop offset="100%" stop-color="var(--wx-hot)" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--wx-hot2)"/>
        <stop offset="100%" stop-color="var(--wx-hot)"/>
      </linearGradient>
      <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--wx-cloud2)"/>
        <stop offset="100%" stop-color="var(--wx-cloud)"/>
      </linearGradient>
    </defs>`;

  let body;
  switch (cond) {
    case 'sunny':
    case 'clear-night':
      body = sunish(id, 32, 31, 11);
      break;
    case 'partlycloudy':
      body = sunish(id, 25, 24, 9) + wxCloud(36, 38, 1, 'cloud');
      break;
    case 'cloudy':
      body = wxCloud(26, 26, .78, 'cloud2', .45) + wxCloud(34, 36, 1, 'cloud');
      break;
    case 'rainy':
    case 'snowy-rainy':
      body = wxCloud(32, 26, 1, 'cloud')
        + (cond === 'rainy' ? wxDrops(3, 38) : wxDrops(2, 38) + wxFlakes(2, 40));
      break;
    case 'pouring':
      body = wxCloud(32, 25, 1.05, 'cloud') + wxDrops(5, 38);
      break;
    case 'snowy':
      body = wxCloud(32, 26, 1, 'cloud') + wxFlakes(3, 40);
      break;
    case 'hail':
      body = wxCloud(32, 26, 1, 'cloud') + wxFlakes(4, 39);
      break;
    case 'lightning':
    case 'lightning-rainy':
      body = wxCloud(32, 25, 1, 'cloud')
        + (cond === 'lightning-rainy' ? wxDrops(2, 38) : '')
        + `<path class="bolt" d="M33 33l-7 10h5l-2 9 9-12h-5l3-7z"
             fill="#ffd85e"/>`;
      break;
    case 'fog':
      body = wxCloud(30, 24, .9, 'cloud2', .5)
        + [38, 44, 50].map((y, i) => `
          <line class="cloud${i % 2 ? '2' : ''}" x1="${14 + i * 2}" y1="${y}"
            x2="${50 - i * 2}" y2="${y}" stroke="var(--wx-cloud2)" stroke-width="3"
            stroke-linecap="round" opacity="${(.8 - i * .16).toFixed(2)}"/>`).join('');
      break;
    case 'windy':
    case 'windy-variant':
      body = wxGusts([24, 33, 42]);
      break;
    case 'exceptional':
      body = `<path d="M32 14l19 34H13z" fill="none" stroke="#ffcf6b"
                stroke-width="3" stroke-linejoin="round"/>
              <path d="M32 27v10" stroke="#ffcf6b" stroke-width="3.2"
                stroke-linecap="round"/>
              <circle cx="32" cy="42" r="1.9" fill="#ffd85e"/>`;
      break;
    default:
      body = wxCloud(32, 30, 1, 'cloud');
  }
  return `<svg class="wx" viewBox="0 0 64 64" aria-hidden="true">${defs}${body}</svg>`;
}

/** Nachtfassung einer Lage: nur klar und teils bewölkt sehen nachts anders aus */
const wxIsNight = (sun) => sun && sun.state === 'below_horizon';

/* ================================================================== *
 * 8) WETTER-KARTE
 * ================================================================== */

/**
 * Wetterlage zur Palette. Bedeckt und neblig bekommen bewusst keine —
 * die Karte bleibt dann grau, und das ist genau die Aussage.
 */
const WX_PALETTE = {
  sunny: 'gelb',
  'clear-night': 'violett',
  partlycloudy: 'blau',
  rainy: 'blau', pouring: 'blau', 'snowy-rainy': 'blau',
  snowy: 'blau', hail: 'blau',
  lightning: 'violett', 'lightning-rainy': 'violett',
  exceptional: 'rot'
};

/** Vier Messwerte in fester Reihenfolge, jeder aus der Station oder dem Dienst */
const WX_VALS = [
  { key: 'temperature', icon: 'mdi:thermometer', lab: 'w.temp' },
  { key: 'wind', icon: 'mdi:weather-windy', lab: 'w.wind' },
  { key: 'illuminance', icon: 'mdi:white-balance-sunny', lab: 'w.lux' },
  { key: 'humidity', icon: 'mdi:water-percent', lab: 'w.hum' }
];

/** Grad in eine Himmelsrichtung, 16 Sektoren */
function wxBearing(deg) {
  if (deg == null || isNaN(deg)) return '';
  const dirs = t('w.dirs').split(',');
  return dirs[Math.round((Number(deg) % 360) / 22.5) % 16];
}

class OnyxWeatherCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + WX_CSS + `
    ha-card{
      position:relative; padding:12px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:10px; overflow:hidden;
      box-shadow:none;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
      /* Die Sonne ist gelb, egal welche Farbe die Karte trägt. Nur der
         Mond nimmt den Akzent an — sonst sähe eine Vollmondnacht aus
         wie ein Sonnentag. */
      --wx-hot:#f7b93f; --wx-hot2:#ffe9a8;
      --wx-cloud:#7e93ab; --wx-cloud2:#dfe9f4;
    }
    ha-card.warm{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }
    ha-card.night{ --wx-hot:var(--acc); --wx-hot2:#f3edff; }

    .scene{ position:absolute; top:-8px; right:-10px; width:124px; height:124px;
            pointer-events:none; opacity:.95; }
    .scene svg{ width:100%; height:100%; display:block; }
    .glow{ position:absolute; top:-46px; right:-46px; width:190px; height:190px;
           border-radius:50%; pointer-events:none;
           background:radial-gradient(closest-side,
             color-mix(in srgb, var(--acc) 16%, transparent), transparent); }

    .head{ position:relative; cursor:pointer; }
    .lab{ font-size:11px; line-height:14px; color:#6f8497; }
    ha-card.warm .lab{ color:var(--lab); }
    .nm{ font-size:13px; font-weight:600; line-height:18px; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
         max-width:calc(100% - 110px); }
    ha-card.warm .nm{ color:#e9f1f8; }

    .now{ position:relative; display:flex; align-items:flex-end; gap:12px;
          margin-top:2px; }
    .temp{ font-size:44px; font-weight:300; line-height:1; letter-spacing:-.03em;
           color:#dbe6f0; font-variant-numeric:tabular-nums; }
    ha-card.warm .temp{ color:#fff; }
    .temp s{ text-decoration:none; font-size:26px; font-weight:300;
             vertical-align:top; line-height:1.1; margin-left:1px; color:var(--acc); }
    .cond{ padding-bottom:4px; min-width:0; }
    .c1{ font-size:13px; font-weight:600; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .c1{ color:var(--acc); }
    .c2{ font-size:12px; color:#72879a; font-variant-numeric:tabular-nums; }
    ha-card.warm .c2{ color:var(--sub); }

    /* Vier Messwerte. Ohne Station kommen sie vom Wetterdienst; was es
       nirgends gibt — meist die Beleuchtungsstärke — fällt weg. */
    .vals{ position:relative; display:grid; gap:8px; }
    .v{ display:flex; align-items:center; gap:7px; min-width:0; }
    .v .vi{ width:26px; height:26px; border-radius:50%; flex:none; display:grid;
            place-items:center; color:#8ea3b5; --mdc-icon-size:15px;
            background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10); }
    ha-card.warm .v .vi{ background:color-mix(in srgb, var(--acc) 15%, transparent);
                         border-color:color-mix(in srgb, var(--acc) 28%, transparent);
                         color:var(--acc); }
    .v .vt{ min-width:0; line-height:1.2; }
    .v .vn{ font-size:13px; font-weight:600; color:#cddceb;
            font-variant-numeric:tabular-nums; white-space:nowrap; }
    .v .vu{ font-size:10.5px; font-weight:500; color:#7d8fa0; margin-left:2px; }
    .v .vl{ font-size:10px; color:#6f8497; overflow:hidden;
            text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .v .vl{ color:var(--lab); }

    .divide{ height:1px; background:rgba(255,255,255,.09); }

    /* Vorhersage: eine Spalte je Tag oder Stunde */
    .fc{ position:relative; display:grid; gap:6px; }
    .d{ text-align:center; cursor:pointer; padding:2px 0; border-radius:10px; }
    .d.held{ background:rgba(255,255,255,.05); }
    .d .dd{ font-size:10.5px; color:#6f8497; white-space:nowrap; }
    ha-card.warm .d .dd{ color:var(--lab); }
    .d .ds{ width:34px; height:34px; margin:1px auto 0; }
    .d .ds svg{ width:100%; height:100%; display:block; }
    .d .dt{ font-size:12.5px; font-weight:600; color:#cddceb;
            font-variant-numeric:tabular-nums; }
    .d .dl{ font-size:11.5px; color:#72879a; font-variant-numeric:tabular-nums; }
    .d .dp{ font-size:10px; color:var(--acc); font-variant-numeric:tabular-nums; }

    .foot{ position:relative; display:flex; align-items:center;
           justify-content:space-between; }
    .per{ font-size:10.5px; color:#6f8497; cursor:pointer; padding:2px 8px;
          border-radius:9px; border:1px solid rgba(255,255,255,.10);
          background:linear-gradient(rgba(255,255,255,.10), rgba(255,255,255,.03)); }
    .per.held{ opacity:.6; }
    .hint{ font-size:10px; color:#4f5c69; }
    .empty{ position:relative; height:60px; display:grid; place-items:center;
            font-size:12px; color:#5d6b7a; }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-weather-card', entity: firstEntity(hass, 'weather') };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    if (config.entity.split('.')[0] !== 'weather') throw new Error(t('err.needWeather'));
    const f = String(config.forecast == null ? 'daily' : config.forecast).toLowerCase();
    if (!['daily', 'hourly', 'none', 'false'].includes(f)) {
      throw new Error(t('err.forecast'));
    }
    this._fcType = this._fcType || (f === 'daily' || f === 'hourly' ? f : 'daily');
    this._fcOff = f === 'none' || f === 'false';
    super.setConfig(config);
    this._subscribe();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    applyLocale(hass);
    if (first) this._subscribe();
    this._tryRender();
  }
  get hass() { return this._hass; }

  connectedCallback() {
    super.connectedCallback();
    this._alive = true;
    this._subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._alive = false;
    this._unsub();
  }

  _unsub() {
    if (this._unsubFn) { try { this._unsubFn(); } catch (err) { /* egal */ } }
    this._unsubFn = null;
    this._subKey = null;
  }

  /**
   * Seit 2024 stehen die Vorhersagen nicht mehr in den Attributen, sondern
   * kommen über ein Abonnement. Ältere Installationen liefern weiter das
   * Attribut — deshalb beides.
   */
  _subscribe() {
    if (!this._hass || !this._config || this._fcOff) return;
    const key = this._config.entity + '|' + this._fcType;
    if (this._subKey === key) return;
    this._unsub();
    this._subKey = key;

    const conn = this._hass.connection;
    if (!conn || !conn.subscribeMessage) return;
    conn.subscribeMessage(
      (ev) => {
        this._forecast = (ev && ev.forecast) || [];
        this._repaint();
      },
      { type: 'weather/subscribe_forecast', forecast_type: this._fcType,
        entity_id: this._config.entity }
    ).then((un) => {
      // Zwischen Anfrage und Antwort kann die Karte längst weg sein.
      if (this._alive === false || this._subKey !== key) { try { un(); } catch (e) { /* egal */ } }
      else this._unsubFn = un;
    }).catch(() => {
      this._forecast = null;
      this._repaint();
    });
  }

  /** Einen der vier Messwerte holen: erst die Station, dann der Dienst */
  _value(kind, a) {
    const id = this._config[kind];
    if (id) {
      const st = this._hass.states[id];
      if (!st || isDead(st)) return null;
      const n = Number(st.state);
      return {
        num: isNaN(n) ? null : n,
        text: isNaN(n) ? st.state : nfmt(n, Math.abs(n) >= 100 ? 0 : 1),
        unit: st.attributes.unit_of_measurement || ''
      };
    }
    if (kind === 'temperature' && a.temperature != null) {
      return { num: a.temperature, text: nfmt(a.temperature, 1),
        unit: a.temperature_unit || '°C' };
    }
    if (kind === 'humidity' && a.humidity != null) {
      return { num: a.humidity, text: nfmt(a.humidity, 0), unit: '%' };
    }
    if (kind === 'wind' && a.wind_speed != null) {
      return { num: a.wind_speed, text: nfmt(a.wind_speed, 0),
        unit: a.wind_speed_unit || 'km/h', extra: wxBearing(a.wind_bearing) };
    }
    // Beleuchtungsstärke kennt kein Wetterdienst — die gibt es nur aus der Station.
    return null;
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(t('err.entity', { id: this._config.entity }));
    const a = st.attributes;
    const cond = st.state;

    const sunId = this._config.sun || 'sun.sun';
    const night = cond === 'clear-night'
      || (['partlycloudy', 'cloudy'].includes(cond) && wxIsNight(this._hass.states[sunId]));

    const vals = WX_VALS.map((v) => {
      const got = this._value(v.key, a);
      return got && { key: v.key, icon: v.icon, lab: t(v.lab),
        text: got.text, unit: got.unit, extra: got.extra || '' };
    }).filter(Boolean);

    const raw = this._forecast != null ? this._forecast : (a.forecast || []);
    const count = clamp(Number(this._config.forecast_count) || 5, 2, 8);
    const fc = this._fcOff ? [] : raw.slice(0, count).map((f, i) => {
      const d = new Date(f.datetime);
      return {
        when: this._fcType === 'hourly' ? fmtTime(d)
          : i === 0 ? t('w.today') : fmtDate(d, { weekday: 'short' }),
        cond: f.condition || 'cloudy',
        night: f.condition === 'clear-night',
        hi: f.temperature != null ? Math.round(f.temperature) : null,
        lo: f.templow != null ? Math.round(f.templow) : null,
        pop: f.precipitation_probability != null
          ? Math.round(f.precipitation_probability) : null
      };
    });

    // Steht eine Stationstemperatur zur Verfügung, gilt die auch oben.
    // Sonst stünden zwei verschiedene Ist-Temperaturen auf derselben Karte.
    const tnum = this._config.temperature ? this._value('temperature', a) : null;

    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      label: this._config.label || t('w'),
      color: this._config.color || null,
      cond, night,
      dead: isDead(st),
      temp: tnum && tnum.num != null ? Math.round(tnum.num)
        : a.temperature != null ? Math.round(a.temperature) : null,
      unit: tnum && tnum.num != null ? (tnum.unit || '°C') : (a.temperature_unit || '°C'),
      // Hoch und Tief gibt es nur bei der Tagesvorhersage — eine Stunde
      // hat kein Tagestief, da stünde sonst "12° / –".
      hi: this._fcType === 'daily' && raw[0] && raw[0].temperature != null
        ? Math.round(raw[0].temperature) : null,
      lo: this._fcType === 'daily' && raw[0] && raw[0].templow != null
        ? Math.round(raw[0].templow) : null,
      vals, fc,
      fcType: this._fcType,
      fcOff: this._fcOff,
      noForecast: !this._fcOff && raw.length === 0
    };
  }

  _html(m) {
    // "auto" (die Vorgabe) leitet die Farbe aus der Wetterlage ab. Bedeckt
    // und neblig bleiben absichtlich ohne — eine graue Karte an einem
    // grauen Tag sagt mehr als jede Farbe.
    const auto = !m.color || m.color === 'auto';
    const pal = auto ? WX_PALETTE[m.cond] : m.color;
    const { cls, style } = paletteAttrs(pal || null);
    const warm = !!pal && !m.dead;

    const cells = m.vals.map((v) => `
      <div class="v">
        <div class="vi"><ha-icon icon="${esc(v.icon)}"></ha-icon></div>
        <div class="vt">
          <div class="vn">${esc(v.text)}<span class="vu">${esc(v.unit)}</span>${
            v.extra ? `<span class="vu">${esc(v.extra)}</span>` : ''}</div>
          <div class="vl">${esc(v.lab)}</div>
        </div>
      </div>`).join('');

    const days = m.fc.map((d, i) => `
      <div class="d" data-day="${i}">
        <div class="dd">${esc(d.when)}</div>
        <div class="ds">${wxScene(d.cond, d.night, 'f' + i)}</div>
        <div class="dt">${d.hi == null ? '–' : d.hi + '°'}</div>
        ${d.lo != null ? `<div class="dl">${d.lo}°</div>` : ''}
        ${d.pop ? `<div class="dp">${d.pop} %</div>` : ''}
      </div>`).join('');

    return `
    <ha-card class="${(cls + (warm ? ' warm' : '') + (m.night ? ' night' : '')).trim()}"${style}>
      <div class="glow"></div>
      <div class="scene">${wxScene(m.cond, m.night, 'm')}</div>

      <div class="head" id="hd">
        <div class="lab">${esc(m.label)}</div>
        <div class="nm">${esc(m.name)}</div>
        <div class="now">
          <div class="temp">${m.temp == null ? '–' : m.temp}<s>${esc(m.unit)}</s></div>
          <div class="cond">
            <div class="c1">${esc(t('cond.' + m.cond))}</div>
            ${m.hi != null && m.lo != null
              ? `<div class="c2">${m.hi}° / ${m.lo}°</div>` : ''}
          </div>
        </div>
      </div>

      ${m.vals.length ? `<div class="vals"
        style="grid-template-columns:repeat(${Math.min(m.vals.length, 2)},1fr)">${cells}</div>` : ''}

      ${m.fcOff ? '' : `
        <div class="divide"></div>
        ${m.noForecast
          ? `<div class="empty">${esc(t('w.noForecast'))}</div>`
          : `<div class="fc" style="grid-template-columns:repeat(${m.fc.length},1fr)">${days}</div>`}
        <div class="foot">
          <div class="per" id="per">${esc(t('w.' + m.fcType))}</div>
          <div class="hint">${esc(t('w.tapPeriod'))}</div>
        </div>`}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;
    this._press(root.getElementById('hd'), {
      onTap: () => fireMoreInfo(this, m.id),
      onHold: () => fireMoreInfo(this, m.id)
    });

    const per = root.getElementById('per');
    if (per) {
      this._press(per, {
        onTap: () => {
          this._fcType = this._fcType === 'daily' ? 'hourly' : 'daily';
          this._forecast = null;
          this._subscribe();
          this._repaint();
        }
      });
    }

    root.querySelectorAll('[data-day]').forEach((el) => {
      this._press(el, { onTap: () => fireMoreInfo(this, m.id) });
    });
  }

  getCardSize() { return this._fcOff ? 3 : 5; }
}

/* ================================================================== *
 * 9) LICHT-KARTE
 * ================================================================== */

/** Farbmodi, die eine Farbe können (im Gegensatz zu bloss Weiss) */
const LT_COLOR_MODES = ['hs', 'xy', 'rgb', 'rgbw', 'rgbww'];

/** Vorgegebene Farbtupfer: warm bis kalt, dann vier gesättigte */
const LT_COLORS = ['#ffb15c', '#ffd9a8', '#ffffff', '#a8d8ff',
  '#7fe0ab', '#9b7bf5', '#ef6bb0'];

/**
 * Farbtemperatur in RGB, Näherung nach Tanner Helland.
 * Gebraucht wird sie zweimal: für den Verlauf des Reglers und dafür, dass
 * die Karte die Farbe des Lichts annehmen kann, auch wenn das Licht gar
 * keine Farbe kennt, sondern nur warm und kalt.
 */
function kelvinRgb(k) {
  const t = clamp(Number(k) || 2700, 1000, 12000) / 100;
  let r, g, b;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [r, g, b].map((v) => clamp(Math.round(v), 0, 255));
}

const ltHex = (rgb) => '#' + rgb.map((v) =>
  clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

/**
 * Die Farbe, in der die Karte getönt wird — nicht dieselbe wie die Farbe
 * des Lichts. Ein Leuchtmittel auf 6200 K ist fast weiss; würde man das
 * direkt in den Kartenverlauf mischen, käme ein milchiges Grau heraus,
 * auf dem nichts mehr zu lesen ist. Also: kräftig genug für einen Verlauf,
 * und für Weisstöne ein bewusst gewählter Ton von Orange nach Blau.
 */
function ltTint(rgb, kelvin, kMin, kMax) {
  if (rgb) {
    const [h, sat, l] = rgbToHsl(rgb);
    // Fast farbloses Licht hat keinen verlässlichen Farbton — dann lieber
    // über die Farbtemperatur gehen als einen Zufallston zu verstärken.
    if (sat >= 0.18) return ltHex(hslToRgb(h, Math.max(sat, 0.55), clamp(l, 0.38, 0.6)));
  }
  const f = kelvin && kMax > kMin
    ? clamp((kelvin - kMin) / (kMax - kMin), 0, 1) : 0.35;
  const warm = [240, 145, 60], cool = [95, 168, 232];
  return ltHex(warm.map((v, i) => v + (cool[i] - v) * f));
}

function rgbToHsl(rgb) {
  const [r, g, b] = rgb.map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const l = (mx + mn) / 2;
  if (!d) return [0, 0, l];
  const sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (mx === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, sat, l];
}

function hslToRgb(h, sat, l) {
  if (!sat) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
  const p = 2 * l - q;
  const hue = (x) => {
    let v = x < 0 ? x + 1 : x > 1 ? x - 1 : x;
    if (v < 1 / 6) return p + (q - p) * 6 * v;
    if (v < 1 / 2) return q;
    if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
    return p;
  };
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)].map((v) => v * 255);
}

/** Wo der Knopf einer Schiene steht — er soll die Rundungen nie berühren */
const LT_KNOB = (v) => `calc(9px + (100% - 18px) * ${v} / 100)`;

class OnyxLightCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:12px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:10px; overflow:hidden;
      box-shadow:none; container-type:inline-size;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
      --lite:#8ea3b5;
    }
    /* Weiss das Leuchtmittel nichts über seine Farbe, bleibt die Karte bei
       der Akzentfarbe ihrer Palette — der Balken erfindet dann keine. */
    ha-card.warm{ --lite:var(--acc);
      background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }
    ha-card.off{ opacity:.55; }
    /* Auf einer halben Spalte reicht der Platz nur für die Helligkeit;
       die Farbtemperatur oder der Effekt fällt dann weg, statt in drei
       Punkten zu enden. */
    @container (max-width: 240px){ .p2 .xtra{ display:none; } }

    /* Kopfzeile: abgerundetes Quadrat links, daneben Name und Zustand.
       Zwei Zeilen, kein Knopf zu viel — die Karte soll auch auf einer
       halben Spalte noch ganz sein. */
    .row{ display:flex; align-items:center; gap:10px; }
    .sq{ width:42px; height:42px; border-radius:12px; flex:none; display:grid;
         place-items:center; cursor:pointer; --mdc-icon-size:22px; color:#8ea3b5;
         background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10);
         transition:transform .12s ease, background .18s ease; }
    ha-card.warm .sq{ color:#fff;
      background:color-mix(in srgb, var(--lite) 26%, transparent);
      border-color:color-mix(in srgb, var(--lite) 46%, transparent);
      box-shadow:0 0 20px color-mix(in srgb, var(--lite) 30%, transparent); }
    .sq.held{ transform:scale(.92); }
    .txt{ flex:1; min-width:0; cursor:pointer; }
    .p1{ font-size:14px; font-weight:600; line-height:19px; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .p1{ color:#e9f1f8; }
    .p2{ font-size:12.5px; line-height:17px; color:#72879a;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .p2{ color:var(--sub); }
    .caret{ flex:none; width:16px; height:16px; display:grid; place-items:center;
            cursor:pointer; color:rgba(255,255,255,.30); --mdc-icon-size:17px;
            transition:transform .2s ease, color .2s ease; }
    .caret.open{ transform:rotate(180deg); color:rgba(255,255,255,.6); }

    /* Flache Balken über die ganze Breite: der Helligkeitsregler und,
       ausgeklappt, die Schiene der Farbtemperatur. */
    .bar{ position:relative; height:42px; border-radius:12px; overflow:hidden;
          cursor:pointer; touch-action:pan-y; background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.06); }
    .fill{ position:absolute; left:0; top:0; bottom:0; transition:width .12s linear;
           background:linear-gradient(90deg,
             color-mix(in srgb, var(--lite) 45%, transparent) 0%,
             color-mix(in srgb, var(--lite) 85%, transparent) 100%); }
    .grip{ position:absolute; top:50%; transform:translate(-50%,-50%); width:2.5px;
           height:22px; border-radius:9px; background:rgba(255,255,255,.6); z-index:2; }
    .cap{ position:absolute; inset:0; display:flex; align-items:center; gap:7px;
          padding:0 12px; font-size:12.5px; font-weight:600; color:#fff; z-index:1;
          --mdc-icon-size:16px; pointer-events:none;
          white-space:nowrap; overflow:hidden; }
    .bar.mute .cap{ color:#6f8497; font-weight:500; font-size:11.5px; }
    /* Kaltweiss auf voller Helligkeit ist fast weiss; darauf ist weisse
       Schrift nicht mehr zu lesen. */
    .bar.bright .cap{ color:#1b1e24; }
    .bar.bright .grip{ background:rgba(0,0,0,.45); }
    .knob{ position:absolute; top:50%; transform:translate(-50%,-50%); width:6px;
           height:26px; border-radius:99px; background:#fff; z-index:2;
           box-shadow:0 2px 8px rgba(0,0,0,.45); }

    /* Farbtupfer und Effekte — abgerundete Quadrate, damit sie zum
       Symbol oben passen; sie brechen um, wenn die Spalte schmal ist. */
    .sws{ display:flex; gap:6px; flex-wrap:wrap; }
    .sw{ flex:1 1 28px; min-width:28px; height:30px; border-radius:10px; cursor:pointer;
         border:1px solid rgba(255,255,255,.18);
         transition:transform .12s ease, box-shadow .18s ease; }
    .sw.on{ box-shadow:0 0 0 2px rgba(255,255,255,.85),
                       0 0 0 4px color-mix(in srgb, var(--lite) 42%, transparent); }
    .sw.held{ transform:scale(.9); }

    .fx{ display:flex; gap:6px; flex-wrap:wrap; }
    .fxi{ height:30px; border-radius:10px; display:flex; align-items:center; padding:0 11px;
          font-size:11.5px; color:#8ea3b5; cursor:pointer; max-width:100%;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.07); }
    .fxi.on{ background:color-mix(in srgb, var(--btn) 45%, transparent);
             border-color:color-mix(in srgb, var(--btn) 65%, transparent);
             color:#fff; font-weight:600; }
    .fxi.held{ opacity:.6; }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-light-card', entity: firstEntity(hass, 'light') };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    if (config.entity.split('.')[0] !== 'light') throw new Error(t('err.needLight'));
    this._open = this._open || false;
    super.setConfig(config);
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(t('err.entity', { id: this._config.entity }));
    const a = st.attributes;
    const modes = a.supported_color_modes || [];
    const on = st.state === 'on';
    const pct = pctOf(st);

    const kMin = a.min_color_temp_kelvin || 2000;
    const kMax = a.max_color_temp_kelvin || 6500;
    const kelvin = a.color_temp_kelvin || null;

    // Die Farbe, die das Licht gerade wirklich hat: erst RGB, sonst aus der
    // Farbtemperatur gerechnet, sonst ein warmes Weiss.
    const rgb = a.rgb_color || (kelvin ? kelvinRgb(kelvin) : null);
    const lite = on ? ltHex(rgb || [255, 217, 168]) : '#8ea3b5';
    // Nur tönen, wenn das Leuchtmittel überhaupt etwas über seine Farbe
    // weiss. Eine schlichte Dimmlampe ist nicht automatisch warmweiss —
    // dann bleibt die Karte bei der Standardpalette, statt eine Farbe zu
    // behaupten, die niemand gemessen hat.
    const knowsColor = !!(a.rgb_color || kelvin);
    const tint = knowsColor ? ltTint(a.rgb_color || null, kelvin, kMin, kMax) : null;

    const swatches = (this._config.colors || LT_COLORS).map((c) => String(c));
    const cur = a.rgb_color ? ltHex(a.rgb_color).toLowerCase() : null;

    const canTemp = this._config.show_color_temp !== false && modes.includes('color_temp');
    const canColor = this._config.show_colors !== false
      && modes.some((m) => LT_COLOR_MODES.includes(m));
    const fx = this._config.show_effects !== false && Array.isArray(a.effect_list)
      ? a.effect_list.slice(0, 12) : [];

    const dead = isDead(st);
    // Auch der Helligkeitsregler steckt im Ausgeklappten — zugeklappt ist
    // die Karte eine Zeile hoch.
    const canDim = modes.some((m) => m !== 'onoff');
    const expandable = !dead && (canDim || canTemp || canColor || fx.length > 0);
    const always = this._config.always_open === true;

    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      icon: this._config.icon || a.icon || 'mdi:lightbulb',
      color: this._config.color || null,
      on,
      pct: pct < 0 ? 0 : pct,
      dead,
      lite, tint,
      canDim,
      // Wie hell die Leuchtfarbe selbst ist — entscheidet über die
      // Schriftfarbe im Balken
      lum: rgb ? (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 : 0,
      canTemp, canColor,
      kelvin, kMin, kMax,
      // Der Verlauf der Schiene ist der echte Kelvin-Verlauf des Leuchtmittels
      ramp: [0, .25, .5, .75, 1]
        .map((f) => ltHex(kelvinRgb(kMin + (kMax - kMin) * f))).join(','),
      mode: a.color_mode || null,
      swatches: swatches.map((c) => ({ c, on: cur === c.toLowerCase() })),
      fx,
      effect: a.effect || null,
      expandable, always,
      open: expandable && (always || this._open)
    };
  }

  /**
   * Zweite Zeile: was gerade eingestellt ist. Zugeklappt ist sie das
   * Einzige, was über den Zustand Auskunft gibt — also steht die
   * Helligkeit hier und nicht nur im Regler.
   */
  _detail(m) {
    if (m.dead) return { main: t('unavailable'), extra: '' };
    if (!m.on) return { main: t('off'), extra: '' };
    let extra = '';
    if (m.effect && m.effect !== 'None') extra = m.effect;
    else if (m.mode === 'color_temp' && m.kelvin) extra = nfmt(m.kelvin, 0) + ' K';
    else if (m.mode && LT_COLOR_MODES.includes(m.mode)) extra = t('lt.color');
    if (!m.canDim) return { main: extra || t('on'), extra: '' };
    return { main: m.pct + ' %', extra };
  }

  /** Beschriftung im Helligkeitsbalken */
  _cap(m) {
    if (m.dead) return { mute: true, html: esc(t('unavailable')) };
    if (!m.on) return { mute: true, html: esc(t('lt.tapOn')) };
    return {
      mute: false,
      html: '<ha-icon icon="mdi:brightness-percent"></ha-icon><span>' + m.pct + ' %</span>'
    };
  }

  _html(m) {
    // "auto" ist die Vorgabe: die Karte nimmt die Farbe an, die das Licht
    // gerade hat. Ein warmes Licht macht eine warme Karte.
    const auto = !m.color || m.color === 'auto';
    const { cls, style } = auto
      ? (m.on && m.tint
          ? { cls: '', style: ` style="${paletteFromHex(m.tint)}"` }
          : paletteAttrs(null))
      : paletteAttrs(m.color);
    const warm = m.on && !m.dead;
    // Die Leuchtfarbe nur dann in den Balken schreiben, wenn sie gemessen
    // ist. Sonst gilt die Regel aus dem Stylesheet: Akzentfarbe der Palette.
    const lite = m.on && m.tint ? `--lite:${m.lite}` : '';
    const styled = lite
      ? (style ? style.replace(/"$/, ';' + lite + '"') : ` style="${lite}"`)
      : style;

    const det = this._detail(m);
    const cap = this._cap(m);
    const showGrip = m.on && m.pct > 2 && m.pct < 100;
    const barCls = [
      cap.mute ? 'mute' : '',
      m.on && m.pct >= 45 && m.lum > 0.72 ? 'bright' : ''
    ].filter(Boolean).join(' ');

    const panel = !m.open ? '' : `
      ${m.canDim ? `
        <div class="bar ${barCls}" id="field">
          ${m.on ? `<div class="fill" style="width:${m.pct}%"></div>` : ''}
          ${showGrip ? `<div class="grip" id="grip" style="left:${m.pct}%"></div>` : ''}
          <div class="cap">${cap.html}</div>
        </div>` : ''}
      ${m.canTemp ? `
        <div class="bar" id="temp"
             style="background:linear-gradient(90deg,${esc(m.ramp)})">
          <div class="knob" style="left:${LT_KNOB(this._kPct(m))}"></div>
        </div>` : ''}
      ${m.canColor ? `
        <div class="sws">
          ${m.swatches.map((s) => `
            <div class="sw ${s.on ? 'on' : ''}" data-sw="${esc(s.c)}"
                 style="background:${esc(s.c)}"></div>`).join('')}
        </div>` : ''}
      ${m.fx.length ? `
        <div class="fx">
          ${m.fx.map((f) => `
            <div class="fxi ${f === m.effect ? 'on' : ''}"
                 data-fx="${esc(f)}">${esc(f)}</div>`).join('')}
        </div>` : ''}`;

    return `
    <ha-card class="${(cls + (warm ? ' warm' : '') + (m.dead ? ' off' : '')).trim()}"${styled}>
      <div class="row">
        <div class="sq" id="ico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
        <div class="txt" id="txt">
          <div class="p1">${esc(m.name)}</div>
          <div class="p2">${esc(det.main)}${det.extra
            ? `<span class="xtra"> \u00b7 ${esc(det.extra)}</span>` : ''}</div>
        </div>
        ${m.expandable && !m.always ? `
          <div class="caret ${m.open ? 'open' : ''}" id="caret">
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </div>` : ''}
      </div>

      ${panel}
    </ha-card>`;
  }

  /** Farbtemperatur als Anteil der Schiene */
  _kPct(m) {
    if (!m.kelvin || m.kMax <= m.kMin) return 0;
    return clamp(Math.round(((m.kelvin - m.kMin) / (m.kMax - m.kMin)) * 100), 0, 100);
  }

  _bind(m) {
    const root = this.shadowRoot;
    const guard = (fn) => () => { if (!m.dead) fn(); };
    const call = (data) => this.call('light', 'turn_on',
      Object.assign({ entity_id: m.id }, data));
    const toggle = guard(() => this.call('light', 'toggle', { entity_id: m.id }));

    this._press(root.getElementById('ico'), {
      onTap: toggle,
      onHold: () => fireMoreInfo(this, m.id)
    });

    // Text und Pfeil klappen auf. Kann das Leuchtmittel nichts, was sich
    // ausklappen liesse, führt derselbe Griff in die Geräteansicht.
    const fold = () => {
      if (!m.expandable || m.always) { fireMoreInfo(this, m.id); return; }
      this._open = !m.open;
      this._repaint();
    };
    ['txt', 'caret'].forEach((id) => {
      const el = root.getElementById(id);
      if (el) this._press(el, { onTap: fold, onHold: () => fireMoreInfo(this, m.id) });
    });

    const field = root.getElementById('field');
    if (field) {
      const fill = field.querySelector('.fill');
      const grip = root.getElementById('grip');
      const cap = field.querySelector('.cap');
      this._press(field, {
        axis: 'x',
        onTap: toggle,
        onHold: () => fireMoreInfo(this, m.id),
        onDrag: m.dead ? null : (v) => {
          if (fill) fill.style.width = v + '%';
          if (grip) grip.style.left = v + '%';
          const out = cap.querySelector('span');
          if (out) out.textContent = v + ' %';
        },
        onDrop: m.dead ? null : (v) => {
          if (v <= 0) this.call('light', 'turn_off', { entity_id: m.id });
          else call({ brightness_pct: v });
        }
      });
    }

    const temp = root.getElementById('temp');
    if (temp) {
      const knob = temp.querySelector('.knob');
      const toK = (v) => Math.round(m.kMin + ((m.kMax - m.kMin) * v) / 100);
      this._press(temp, {
        axis: 'x',
        onDrag: m.dead ? null : (v) => { knob.style.left = LT_KNOB(v); },
        onDrop: m.dead ? null : (v) => call({ color_temp_kelvin: toK(v) })
      });
    }

    root.querySelectorAll('[data-sw]').forEach((el) => {
      const hex = el.dataset.sw;
      this._press(el, {
        onTap: guard(() => {
          const n = hex.replace('#', '');
          call({ rgb_color: [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) });
        })
      });
    });

    root.querySelectorAll('[data-fx]').forEach((el) => {
      this._press(el, { onTap: guard(() => call({ effect: el.dataset.fx })) });
    });
  }

  getCardSize() {
    return this._open || this._config.always_open === true ? 4 : 1;
  }
}

/* ==================================================================== *
 * Visuelle Editoren
 *
 * Home Assistant fragt eine Karte über `static getConfigElement()` nach
 * ihrem Editor. Wir liefern ein Element, das im Kern <ha-form> ist: das
 * Formularelement des Frontends, das Entitäten-Picker, Bereichs-Picker,
 * Symbolwahl und Schalter selbst rendert. Wir beschreiben nur, welche
 * Felder es geben soll.
 * ==================================================================== */

/**
 * <ha-form> und die Picker stecken im Editor-Bündel des Frontends. Das
 * wird erst nachgeladen, wenn schon einmal irgendein eingebauter
 * Karten-Editor offen war. Ohne dieses Vorladen bleibt unser Editor beim
 * allerersten Öffnen leer — ein Fehler, den man nur einmal sieht und dann
 * nie wieder reproduziert. Also erzwingen wir das Nachladen selbst.
 */
let _formReady = null;
function ensureFormLoaded() {
  if (_formReady) return _formReady;
  _formReady = (async () => {
    if (customElements.get('ha-form')) return;
    try {
      const helpers = await window.loadCardHelpers();
      await helpers.createCardElement({ type: 'entities', entities: [] });
      await customElements.whenDefined('hui-entities-card');
      const cls = customElements.get('hui-entities-card');
      if (cls && cls.getConfigElement) await cls.getConfigElement();
    } catch (err) {
      console.warn('[onyx-cards] ' + t('log.editorLoad'), err);
    }
    // Auch wenn der Umweg oben scheitert: warten, bis ha-form da ist.
    await Promise.race([
      customElements.whenDefined('ha-form'),
      new Promise((r) => setTimeout(r, 3000))
    ]);
  })();
  return _formReady;
}

/* Beschriftungen und Hilfetexte kommen aus der Sprachtabelle.
   Die Feldnamen sind zugleich die Schlüssel: `ed.<feld>` für die
   Beschriftung, `ed.h.<feld>` für den Hilfetext darunter. */
const ED_HELP_KEY = {
  color: 'ed.h.color', area: 'ed.h.area', navigation_path: 'ed.h.navigation_path',
  lock_entity: 'ed.h.lock_entity', temperature: 'ed.h.sensor', humidity: 'ed.h.sensor',
  entities: 'ed.h.entities', columns: 'ed.h.columns',
  battery_entity: 'ed.h.battery_entity', room_command: 'ed.h.room_command',
  consumables: 'ed.h.consumables'
};

const ED_CSS = `
  .ed{ display:flex; flex-direction:column; gap:16px; }
  .sec{ font-size:12px; font-weight:600; letter-spacing:.05em; text-transform:uppercase;
        color:var(--secondary-text-color); margin-bottom:-6px; }
  .hint{ font-size:12px; line-height:1.5; color:var(--secondary-text-color); }
  .warn{ font-size:12px; line-height:1.5; color:var(--error-color, #db4437); }
  .grp{ border:1px solid var(--divider-color, rgba(127,127,127,.3)); border-radius:12px;
        padding:12px; display:flex; flex-direction:column; gap:10px; }
  .grp .ghead{ display:flex; align-items:center; gap:8px; }
  .grp .ghead ha-form{ flex:1; }
  .row{ display:flex; align-items:flex-start; gap:6px; }
  .row ha-form{ flex:1; min-width:0; }
  .btn{ font:inherit; font-size:13px; cursor:pointer; border-radius:9px;
        border:1px solid var(--divider-color, rgba(127,127,127,.3));
        background:none; color:var(--primary-text-color); padding:7px 12px;
        display:inline-flex; align-items:center; gap:6px; --mdc-icon-size:17px; }
  .btn:hover{ background:var(--secondary-background-color, rgba(127,127,127,.12)); }
  .btn.x{ border:none; padding:6px; margin-top:6px; color:var(--secondary-text-color); }
  .btn.x:hover{ color:var(--error-color, #db4437); background:none; }
  .adds{ display:flex; gap:8px; flex-wrap:wrap; }
`;

const ED_COLORS = ['blau', 'gruen', 'gelb', 'orange', 'rot', 'violett', 'rosa'];
/** Feld für die Kartenfarbe — die sieben Paletten plus freier Hexwert */
function fieldColor() {
  return {
    name: 'color',
    selector: {
      select: {
        mode: 'dropdown',
        custom_value: true,
        options: ED_COLORS.map((v) => ({ value: v, label: t('ed.c.' + v) }))
      }
    }
  };
}

const fieldText = (name) => ({ name, selector: { text: {} } });
const fieldIcon = (name) => ({ name, selector: { icon: {} } });
const fieldBool = (name) => ({ name, selector: { boolean: {} } });
const fieldEntity = (name, domain, multiple) => ({
  name,
  selector: { entity: Object.assign({}, multiple ? { multiple: true } : null,
    domain ? { filter: { domain } } : null) }
});
const grid = (...schema) => ({ type: 'grid', name: '', schema });

/**
 * Aus dem Formular zurück in die Konfiguration. Leere Felder fliegen raus,
 * damit die YAML nicht mit `name: ""` zuwächst, und Schalter, die ohnehin
 * auf ihrem Normalwert stehen, ebenso.
 */
function tidyConfig(cfg, defaults) {
  const out = {};
  for (const key of Object.keys(cfg)) {
    const v = cfg[key];
    if (v === '' || v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (defaults && Object.prototype.hasOwnProperty.call(defaults, key) && v === defaults[key]) continue;
    out[key] = v;
  }
  return out;
}

/**
 * Eine Geräteliste zurückschreiben. Wer im YAML `{entity: …, name: …,
 * icon: …}` geschrieben hat, soll das nicht verlieren, bloss weil er im
 * Editor eine Lampe dazugenommen hat. Also: neue Reihenfolge aus dem
 * Picker, alte Feinheiten aus der bisherigen Liste.
 */
function mergeList(ids, previous) {
  const old = {};
  for (const e of normList(previous) || []) old[e.entity] = e;
  return (ids || []).map((id) => {
    const kept = old[id];
    if (kept && (kept.name || kept.icon)) return Object.assign({}, kept);
    return id;
  });
}

/**
 * Vergleichbare Fassung eines Objekts: Schlüssel sortiert, damit ein
 * zurückgereichtes `config` auch dann als "unsere eigene" erkannt wird,
 * wenn Home Assistant die Reihenfolge unterwegs ändert.
 */
function stableJson(v) {
  if (Array.isArray(v)) return '[' + v.map(stableJson).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort()
      .map((k) => JSON.stringify(k) + ':' + stableJson(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

/** Eine einzelne Aktion so knapp wie möglich schreiben */
function packItem(it) {
  if (!it || !it.entity) return null;
  if (it.name || it.icon) {
    const o = { entity: it.entity };
    if (it.name) o.name = it.name;
    if (it.icon) o.icon = it.icon;
    return o;
  }
  return it.entity;
}

/* ------------------------------------------------------------------ *
 * Basisklasse
 * ------------------------------------------------------------------ */
class OnyxEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    const incoming = stableJson(config);
    // Kommt die Konfiguration von aussen (YAML-Editor, anderes Fenster),
    // verwerfen wir unseren Zwischenstand. Kommt sie von uns selbst
    // zurück, behalten wir ihn — sonst verschwinden halbfertige Zeilen.
    if (incoming !== this._echo) this._state = null;
    this._config = Object.assign({}, config);
    this._render();
  }

  set hass(hass) { this._hass = hass; applyLocale(hass); this._render(); }
  get hass() { return this._hass; }

  connectedCallback() {
    ensureFormLoaded().then(() => this._render());
    this._render();
  }

  /* --- von den Unterklassen zu füllen --- */
  static get DEFAULTS() { return null; }
  /** Hilfetext-Schlüssel eines Feldes; Unterklassen dürfen übersteuern */
  _helpKey(name) { return ED_HELP_KEY[name] || ''; }
  _schema() { return []; }
  _toForm(cfg) { return cfg; }
  _fromForm(data) { return Object.assign({}, this._config, data); }
  _extra() {}

  _emit(cfg) {
    const clean = tidyConfig(cfg, this.constructor.DEFAULTS);
    clean.type = cfg.type || this._config.type;
    this._config = clean;
    this._echo = stableJson(clean);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: clean }, bubbles: true, composed: true
    }));
    this._render();
  }

  _root() {
    if (this._rootEl) return this._rootEl;
    const style = document.createElement('style');
    style.textContent = ED_CSS;
    this._rootEl = document.createElement('div');
    this._rootEl.className = 'ed';
    this.shadowRoot.append(style, this._rootEl);
    return this._rootEl;
  }

  _makeForm(onChange) {
    const f = document.createElement('ha-form');
    f.computeLabel = (x) => (x.name ? t('ed.' + x.name) : '');
    f.computeHelper = (x) => {
      const key = this._helpKey(x.name);
      return key ? t(key) : '';
    };
    f.addEventListener('value-changed', (ev) => {
      ev.stopPropagation();
      onChange(ev.detail.value);
    });
    return f;
  }

  /**
   * Formular auffrischen, ohne es neu zu bauen — sonst springt bei jedem
   * Zustandswechsel im Haus der Textcursor aus dem Feld.
   */
  _fillForm(form, schema, data) {
    const sig = JSON.stringify(schema);
    if (sig !== form.__onyxSchema) {
      form.schema = schema;
      form.__onyxSchema = sig;
    }
    form.hass = this._hass;
    form.data = data;
  }

  _render() {
    if (!this._config || !this._hass) return;
    const root = this._root();
    if (!this._form) {
      this._form = this._makeForm((d) => this._emit(this._fromForm(d)));
      root.appendChild(this._form);
    }
    this._fillForm(this._form, this._schema(), this._toForm(this._config));
    this._extra(root);
  }
}

/* ------------------------------------------------------------------ *
 * Zieh-Regler
 * ------------------------------------------------------------------ */
class OnyxSliderEditor extends OnyxEditor {
  static get DEFAULTS() { return { show_name: true }; }

  _schema() {
    return [
      fieldEntity('entity', ['light', 'cover', 'media_player']),
      grid(fieldText('name'), fieldIcon('icon')),
      fieldColor(),
      fieldBool('show_name')
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      icon: c.icon || '',
      color: c.color || '',
      show_name: c.show_name !== false
    };
  }
}

/* ------------------------------------------------------------------ *
 * Storen
 * ------------------------------------------------------------------ */
class OnyxCoverEditor extends OnyxEditor {
  _schema() {
    return [
      fieldEntity('entity', 'cover'),
      grid(fieldText('name'), fieldColor()),
      fieldEntity('lock_entity', ['binary_sensor', 'input_boolean', 'switch']),
      fieldText('lock_label')
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      color: c.color || '',
      lock_entity: c.lock_entity || '',
      lock_label: c.lock_label || ''
    };
  }
}

/* ------------------------------------------------------------------ *
 * Medienspieler
 * ------------------------------------------------------------------ */
class OnyxMediaEditor extends OnyxEditor {
  static get DEFAULTS() { return { show_art: true, show_volume: true }; }

  _schema() {
    return [
      fieldEntity('entity', 'media_player'),
      grid(fieldText('name'), fieldText('label')),
      fieldColor(),
      grid(fieldBool('show_art'), fieldBool('show_volume'))
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      label: c.label || '',
      color: c.color || '',
      show_art: c.show_art !== false,
      show_volume: c.show_volume !== false
    };
  }
}

/* ------------------------------------------------------------------ *
 * Diagramm
 * ------------------------------------------------------------------ */
class OnyxChartEditor extends OnyxEditor {
  static get DEFAULTS() { return { tinted: false }; }

  _schema() {
    return [
      fieldEntity('entities', ['sensor', 'counter', 'input_number', 'number'], true),
      grid(fieldText('title'), fieldText('label')),
      grid(fieldIcon('icon'), fieldColor()),
      grid(
        {
          name: 'period',
          selector: {
            select: {
              mode: 'dropdown',
              options: PERIOD_ORDER.map((v) => ({ value: v, label: t('period.' + v) }))
            }
          }
        },
        fieldBool('tinted')
      )
    ];
  }

  _toForm(c) {
    return {
      entities: (normList(c.entities) || []).map((e) => e.entity),
      title: c.title || '',
      label: c.label || '',
      icon: c.icon || '',
      color: c.color || '',
      period: PERIOD_ALIAS[String(c.period || 'tag').toLowerCase()] || 'tag',
      tinted: c.tinted === true
    };
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    // Die Karte verträgt höchstens drei — lieber hier abschneiden als
    // eine Konfiguration speichern, die beim Laden auf einen Fehler läuft.
    const ids = (data.entities || []).slice(0, 3);
    this._tooMany = (data.entities || []).length > 3;
    cfg.entities = mergeList(ids, this._config.entities);
    return cfg;
  }

  _extra(root) {
    if (!this._note) {
      this._note = document.createElement('p');
      this._note.className = 'warn';
      root.appendChild(this._note);
    }
    this._note.textContent = this._tooMany ? t('ed.tooMany') : '';
  }
}

/* ------------------------------------------------------------------ *
 * Raum
 * ------------------------------------------------------------------ */
const ROOM_LISTS = [
  { field: 'lights', domain: 'light' },
  { field: 'covers', domain: 'cover' },
  { field: 'media', domain: 'media_player' },
  { field: 'climate', domain: 'climate' }
];

class OnyxRoomEditor extends OnyxEditor {
  _schema() {
    return [
      { name: 'area', selector: { area: {} } },
      grid(fieldText('name'), fieldText('label')),
      grid(fieldIcon('icon'), fieldColor()),
      grid(
        fieldEntity('temperature', 'sensor'),
        fieldEntity('humidity', 'sensor')
      ),
      fieldText('navigation_path'),
      {
        name: 'groups',
        selector: {
          select: {
            multiple: true,
            options: ['light', 'cover', 'media_player', 'climate']
              .map((v) => ({ value: v, label: t('ed.g.' + v) }))
          }
        }
      },
      fieldEntity('lights', 'light', true),
      fieldEntity('covers', 'cover', true),
      fieldEntity('media', 'media_player', true),
      fieldEntity('climate', 'climate', true)
    ];
  }

  _toForm(c) {
    const out = {
      area: c.area || '',
      name: c.name || '',
      label: c.label || '',
      icon: c.icon || '',
      color: c.color || '',
      temperature: c.temperature || '',
      humidity: c.humidity || '',
      navigation_path: c.navigation_path || '',
      groups: c.groups || ['light', 'cover', 'media_player', 'climate']
    };
    for (const { field, domain } of ROOM_LISTS) {
      const list = normList(OnyxRoomCard._listFor(c, domain)) || [];
      out[field] = list.map((e) => e.entity);
    }
    return out;
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    for (const { field, domain } of ROOM_LISTS) {
      // In welchen Schlüssel geschrieben wird, entscheidet der Bestand:
      // wer `storen:` geschrieben hat, behält `storen:`.
      let key = field;
      for (const k of GROUP_KEYS[domain]) {
        if (this._config[k]) { key = k; break; }
      }
      for (const k of GROUP_KEYS[domain]) delete cfg[k];
      delete cfg[field];
      const ids = data[field] || [];
      if (ids.length) {
        cfg[key] = mergeList(ids, OnyxRoomCard._listFor(this._config, domain));
      }
    }
    // Alle vier Gruppen sichtbar ist der Normalfall — dann muss es nicht
    // in der YAML stehen.
    if (cfg.groups && cfg.groups.length === 4) delete cfg.groups;
    return cfg;
  }

  _extra(root) {
    if (this._note) return;
    this._note = document.createElement('p');
    this._note.className = 'hint';
    this._note.textContent = t('ed.roomHint');
    root.appendChild(this._note);
  }
}

/* ------------------------------------------------------------------ *
 * Schnellzugriffe
 *
 * Hier reicht ein Schema nicht: Gruppen mit je mehreren Aktionen, jede
 * mit eigenem Namen und Symbol, dazu Hinzufügen und Entfernen. Das bauen
 * wir selbst — die einzelnen Felder bleiben aber <ha-form>, damit die
 * Picker dieselben sind wie überall sonst.
 * ------------------------------------------------------------------ */
const ACT_DOMAINS = ['scene', 'script', 'automation', 'button', 'input_button',
  'switch', 'input_boolean'];

class OnyxActionsEditor extends OnyxEditor {
  _schema() {
    return [
      fieldText('title'),
      grid(
        {
          name: 'shape',
          selector: {
            select: {
              mode: 'dropdown',
              options: ['squares', 'chips', 'tiles', 'rail']
                .map((v) => ({ value: v, label: t('ed.shape.' + v) }))
            }
          }
        },
        { name: 'columns', selector: { number: { min: 2, max: 6, mode: 'box' } } }
      ),
      fieldColor(),
      fieldBool('grouped')
    ];
  }

  /** Konfiguration → einheitliches Arbeitsmodell */
  _model() {
    if (this._state) return this._state;
    const c = this._config;
    if (c.groups && c.groups.length) {
      this._state = {
        grouped: true,
        groups: c.groups.map((g) => ({
          label: g.label || '',
          actions: normList(g.actions) || []
        }))
      };
    } else {
      this._state = {
        grouped: false,
        groups: [{ label: '', actions: normList(c.actions) || [] }]
      };
    }
    return this._state;
  }

  /** Arbeitsmodell → Konfiguration */
  _commit() {
    const st = this._state;
    const cfg = Object.assign({}, this._config);
    delete cfg.actions;
    delete cfg.groups;
    if (st.grouped) {
      cfg.groups = st.groups.map((g) => {
        const o = {};
        if (g.label) o.label = g.label;
        o.actions = g.actions.map(packItem).filter(Boolean);
        return o;
      });
    } else {
      const first = st.groups[0] || { actions: [] };
      cfg.actions = first.actions.map(packItem).filter(Boolean);
    }
    this._emit(cfg);
    this._render();
  }

  _toForm() {
    const st = this._model();
    return {
      title: this._config.title || '',
      shape: this._config.shape || 'squares',
      columns: this._config.columns || 4,
      color: this._config.color || '',
      grouped: st.grouped
    };
  }

  _fromForm(data) {
    const st = this._model();
    if (data.grouped !== st.grouped) {
      if (data.grouped) {
        // Flach → eine Gruppe, die der Nutzer gleich benennen kann
        st.grouped = true;
        st.groups = [{ label: t('ed.newGroup'), actions: st.groups[0] ? st.groups[0].actions : [] }];
      } else {
        // Gruppen → alles in eine Liste, nichts geht verloren
        st.grouped = false;
        const all = [];
        for (const g of st.groups) all.push(...g.actions);
        st.groups = [{ label: '', actions: all }];
      }
    }
    const cfg = Object.assign({}, this._config, {
      title: data.title,
      shape: data.shape,
      columns: data.columns,
      color: data.color
    });
    delete cfg.grouped;
    // shape NICHT weglassen, wenn es "squares" ist: die Karte schaltet ab
    // neun Aktionen von selbst auf Chips um. Wer im Editor bewusst
    // Quadrate wählt, soll Quadrate bekommen.
    if (cfg.columns === 4) delete cfg.columns;
    // Die Listen kommen aus dem Arbeitsmodell, nicht aus dem Formular
    delete cfg.actions;
    delete cfg.groups;
    if (st.grouped) {
      cfg.groups = st.groups.map((g) => {
        const o = {};
        if (g.label) o.label = g.label;
        o.actions = g.actions.map(packItem).filter(Boolean);
        return o;
      });
    } else {
      cfg.actions = (st.groups[0] ? st.groups[0].actions : []).map(packItem).filter(Boolean);
    }
    return cfg;
  }

  _rowSchema() {
    return [
      fieldEntity('entity', ACT_DOMAINS),
      grid(fieldText('name'), fieldIcon('icon'))
    ];
  }

  _btn(icon, text, onClick, cls) {
    const b = document.createElement('button');
    b.className = 'btn' + (cls ? ' ' + cls : '');
    b.type = 'button';
    b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>${text ? '<span></span>' : ''}`;
    if (text) b.querySelector('span').textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  _extra(root) {
    const st = this._model();
    const sig = st.grouped + '|' + st.groups.map((g) => g.actions.length).join(',');

    if (!this._list) {
      this._list = document.createElement('div');
      this._list.className = 'ed';
      root.appendChild(this._list);
    }

    // Nur neu bauen, wenn sich die Struktur ändert. Sonst würde jeder
    // Tastendruck das Feld unter dem Cursor wegreissen.
    if (sig !== this._listSig) {
      this._listSig = sig;
      this._forms = [];
      this._list.textContent = '';

      st.groups.forEach((g, gi) => {
        const box = document.createElement('div');
        box.className = 'grp';

        if (st.grouped) {
          const head = document.createElement('div');
          head.className = 'ghead';
          const lf = this._makeForm((d) => {
            st.groups[gi].label = d.label || '';
            this._commit();
          });
          lf.schema = [fieldText('label')];
          lf.__onyxSchema = 'label';
          this._forms.push({ form: lf, data: () => ({ label: st.groups[gi].label }) });
          head.appendChild(lf);
          head.appendChild(this._btn('mdi:delete-outline', '', () => {
            st.groups.splice(gi, 1);
            if (!st.groups.length) st.groups.push({ label: '', actions: [] });
            this._listSig = null;
            this._commit();
          }, 'x'));
          box.appendChild(head);
        }

        g.actions.forEach((_, ai) => {
          const row = document.createElement('div');
          row.className = 'row';
          const rf = this._makeForm((d) => {
            st.groups[gi].actions[ai] = {
              entity: d.entity || '',
              name: d.name || '',
              icon: d.icon || ''
            };
            this._commit();
          });
          this._forms.push({
            form: rf,
            schema: this._rowSchema(),
            data: () => {
              const it = st.groups[gi].actions[ai] || {};
              return { entity: it.entity || '', name: it.name || '', icon: it.icon || '' };
            }
          });
          row.appendChild(rf);
          row.appendChild(this._btn('mdi:close', '', () => {
            st.groups[gi].actions.splice(ai, 1);
            this._listSig = null;
            this._commit();
          }, 'x'));
          box.appendChild(row);
        });

        const adds = document.createElement('div');
        adds.className = 'adds';
        adds.appendChild(this._btn('mdi:plus', t('ed.addAction'), () => {
          st.groups[gi].actions.push({ entity: '', name: '', icon: '' });
          this._listSig = null;
          this._render();
        }));
        box.appendChild(adds);
        this._list.appendChild(box);
      });

      if (st.grouped) {
        const adds = document.createElement('div');
        adds.className = 'adds';
        adds.appendChild(this._btn('mdi:plus', t('ed.addGroup'), () => {
          st.groups.push({ label: '', actions: [] });
          this._listSig = null;
          this._render();
        }));
        this._list.appendChild(adds);
      }
    }

    for (const f of this._forms) {
      if (f.schema) this._fillForm(f.form, f.schema, f.data());
      else { f.form.hass = this._hass; f.form.data = f.data(); }
      f.form.computeLabel = (x) => (x.name ? t('ed.' + x.name) : '');
    }
  }
}

/* ------------------------------------------------------------------ *
 * Saugroboter
 *
 * Die Räume brauchen mehr als ein Schema: Name, Segment-Nummer und Symbol
 * je Zeile, dazu Hinzufügen und Entfernen. Das bauen wir wie bei den
 * Schnellzugriffen selbst — die Felder bleiben <ha-form>.
 * ------------------------------------------------------------------ */
class OnyxVacuumEditor extends OnyxEditor {
  static get DEFAULTS() { return { show_fan_speed: true, room_command: 'app_segment_clean' }; }

  _schema() {
    return [
      fieldEntity('entity', 'vacuum'),
      grid(fieldText('name'), fieldText('label')),
      grid(fieldIcon('icon'), fieldColor()),
      fieldEntity('battery_entity', 'sensor'),
      fieldEntity('consumables', 'sensor', true),
      grid(fieldText('room_command'), fieldBool('show_fan_speed'))
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      label: c.label || '',
      icon: c.icon || '',
      color: c.color || '',
      battery_entity: c.battery_entity || '',
      consumables: (normList(c.consumables) || []).map((e) => e.entity),
      room_command: c.room_command || 'app_segment_clean',
      show_fan_speed: c.show_fan_speed !== false
    };
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    cfg.consumables = mergeList(data.consumables || [], this._config.consumables);
    cfg.rooms = this._state ? this._packRooms() : this._config.rooms;
    return cfg;
  }

  /* --- Räume als eigene Liste --- */
  _model() {
    if (!this._state) {
      this._state = {
        rooms: (this._config.rooms || []).map((r) => (typeof r === 'string'
          ? { name: r, id: r, icon: '' }
          : { name: r.name || '', id: r.id == null ? '' : String(r.id), icon: r.icon || '' }))
      };
    }
    return this._state;
  }

  _packRooms() {
    return this._state.rooms
      .filter((r) => r.id !== '' && r.id != null)
      .map((r) => {
        const o = { name: r.name || String(r.id), id: isNaN(Number(r.id)) ? r.id : Number(r.id) };
        if (r.icon) o.icon = r.icon;
        return o;
      });
  }

  _commit() {
    const cfg = Object.assign({}, this._config);
    cfg.rooms = this._packRooms();
    this._emit(cfg);
  }

  _roomSchema() {
    return [grid(fieldText('name'), fieldText('id')), fieldIcon('icon')];
  }

  _btn(icon, text, onClick, cls) {
    const b = document.createElement('button');
    b.className = 'btn' + (cls ? ' ' + cls : '');
    b.type = 'button';
    b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>${text ? '<span></span>' : ''}`;
    if (text) b.querySelector('span').textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  _extra(root) {
    const st = this._model();
    const sig = 'r' + st.rooms.length;

    if (!this._list) {
      this._hint = document.createElement('p');
      this._hint.className = 'hint';
      root.appendChild(this._hint);
      this._list = document.createElement('div');
      this._list.className = 'ed';
      root.appendChild(this._list);
    }
    this._hint.textContent = t('ed.h.rooms');

    if (sig !== this._listSig) {
      this._listSig = sig;
      this._forms = [];
      this._list.textContent = '';

      const box = document.createElement('div');
      box.className = 'grp';
      const head = document.createElement('div');
      head.className = 'sec';
      head.textContent = t('ed.rooms');
      box.appendChild(head);

      st.rooms.forEach((_, i) => {
        const row = document.createElement('div');
        row.className = 'row';
        const rf = this._makeForm((d) => {
          st.rooms[i] = { name: d.name || '', id: d.id || '', icon: d.icon || '' };
          this._commit();
          this._render();
        });
        this._forms.push({
          form: rf,
          schema: this._roomSchema(),
          data: () => Object.assign({ name: '', id: '', icon: '' }, st.rooms[i])
        });
        row.appendChild(rf);
        row.appendChild(this._btn('mdi:close', '', () => {
          st.rooms.splice(i, 1);
          this._listSig = null;
          this._commit();
          this._render();
        }, 'x'));
        box.appendChild(row);
      });

      const adds = document.createElement('div');
      adds.className = 'adds';
      adds.appendChild(this._btn('mdi:plus', t('ed.addRoom'), () => {
        st.rooms.push({ name: '', id: '', icon: '' });
        this._listSig = null;
        this._render();
      }));
      box.appendChild(adds);
      this._list.appendChild(box);
    }

    for (const f of this._forms) {
      this._fillForm(f.form, f.schema, f.data());
      f.form.computeLabel = (x) => (x.name ? t('ed.' + x.name) : '');
    }
  }
}

/* ------------------------------------------------------------------ *
 * Wetter
 * ------------------------------------------------------------------ */
const WX_HELP = {
  forecast: 'ed.h.forecast', temperature: 'ed.h.station', humidity: 'ed.h.station',
  wind: 'ed.h.station', illuminance: 'ed.h.illuminance', sun: 'ed.h.sun',
  color: 'ed.h.color'
};

class OnyxWeatherEditor extends OnyxEditor {
  static get DEFAULTS() { return { forecast: 'daily', forecast_count: 5 }; }

  _helpKey(name) { return WX_HELP[name] || ED_HELP_KEY[name] || ''; }

  _schema() {
    return [
      fieldEntity('entity', 'weather'),
      grid(fieldText('name'), fieldText('label')),
      grid(fieldColor(),
        { name: 'forecast', selector: { select: { mode: 'dropdown',
          options: ['daily', 'hourly', 'none']
            .map((v) => ({ value: v, label: t('ed.fc.' + v) })) } } }),
      { name: 'forecast_count', selector: { number: { min: 2, max: 8, mode: 'box' } } },
      grid(fieldEntity('temperature', 'sensor'), fieldEntity('humidity', 'sensor')),
      grid(fieldEntity('wind', 'sensor'), fieldEntity('illuminance', 'sensor')),
      fieldEntity('sun', 'sun')
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      label: c.label || '',
      color: c.color || '',
      forecast: ['daily', 'hourly', 'none'].includes(c.forecast) ? c.forecast : 'daily',
      forecast_count: c.forecast_count || 5,
      temperature: c.temperature || '',
      humidity: c.humidity || '',
      wind: c.wind || '',
      illuminance: c.illuminance || '',
      sun: c.sun || ''
    };
  }

  _extra(root) {
    if (this._note) return;
    this._note = document.createElement('p');
    this._note.className = 'hint';
    this._note.textContent = t('ed.h.station');
    root.appendChild(this._note);
  }
}

/* ------------------------------------------------------------------ *
 * Licht
 * ------------------------------------------------------------------ */
class OnyxLightEditor extends OnyxEditor {
  static get DEFAULTS() {
    return {
      show_color_temp: true, show_colors: true, show_effects: true,
      always_open: false
    };
  }

  _helpKey(name) {
    if (name === 'colors') return 'ed.h.colors';
    if (name === 'always_open') return 'ed.h.always_open';
    return ED_HELP_KEY[name] || '';
  }

  _schema() {
    return [
      fieldEntity('entity', 'light'),
      grid(fieldText('name'), fieldIcon('icon')),
      fieldColor(),
      fieldText('colors'),
      grid(fieldBool('show_color_temp'), fieldBool('show_colors')),
      grid(fieldBool('show_effects'), fieldBool('always_open'))
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      icon: c.icon || '',
      color: c.color || '',
      colors: (c.colors || []).join(', '),
      show_color_temp: c.show_color_temp !== false,
      show_colors: c.show_colors !== false,
      show_effects: c.show_effects !== false,
      always_open: c.always_open === true
    };
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    // Freitext in eine Liste: nur was wie ein Hexwert aussieht
    const list = String(data.colors || '').split(',')
      .map((x) => x.trim())
      .filter((x) => /^#[0-9a-fA-F]{6}$/.test(x));
    if (list.length) cfg.colors = list; else delete cfg.colors;
    return cfg;
  }

  _extra(root) {
    if (this._note) return;
    this._note = document.createElement('p');
    this._note.className = 'hint';
    this._note.textContent = t('ed.h.light');
    root.appendChild(this._note);
  }
}

/* ------------------------------------------------------------------ *
 * Registrierung der Editoren
 * ------------------------------------------------------------------ */
function defineEditor(tag, cls) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

defineEditor('onyx-room-card-editor', OnyxRoomEditor);
defineEditor('onyx-slider-card-editor', OnyxSliderEditor);
defineEditor('onyx-cover-card-editor', OnyxCoverEditor);
defineEditor('onyx-media-card-editor', OnyxMediaEditor);
defineEditor('onyx-actions-card-editor', OnyxActionsEditor);
defineEditor('onyx-chart-card-editor', OnyxChartEditor);
defineEditor('onyx-vacuum-card-editor', OnyxVacuumEditor);
defineEditor('onyx-weather-card-editor', OnyxWeatherEditor);
defineEditor('onyx-light-card-editor', OnyxLightEditor);

/* Jede Karte meldet ihren Editor an. Als Eigenschaft gesetzt statt als
   statische Methode im Klassenrumpf — so bleibt der ganze Editor-Teil in
   einem Block und die Kartenklassen darüber unberührt. */
const EDITOR_OF = [
  [OnyxRoomCard, 'onyx-room-card-editor'],
  [OnyxSliderCard, 'onyx-slider-card-editor'],
  [OnyxCoverCard, 'onyx-cover-card-editor'],
  [OnyxMediaCard, 'onyx-media-card-editor'],
  [OnyxActionsCard, 'onyx-actions-card-editor'],
  [OnyxChartCard, 'onyx-chart-card-editor'],
  [OnyxVacuumCard, 'onyx-vacuum-card-editor'],
  [OnyxWeatherCard, 'onyx-weather-card-editor'],
  [OnyxLightCard, 'onyx-light-card-editor']
];
for (const [cls, tag] of EDITOR_OF) {
  cls.getConfigElement = async () => {
    await ensureFormLoaded();
    return document.createElement(tag);
  };
}

/* ------------------------------------------------------------------ *
 * Registrierung
 * ------------------------------------------------------------------ */
/**
 * Doppelt geladen? Passiert beim Umstieg von Hand-Installation auf HACS,
 * wenn der alte Ressourcen-Eintrag stehen bleibt. Ohne Schutz wirft
 * customElements.define() und die Karten bleiben weiß. Mit Schutz gewinnt
 * die zuerst geladene Fassung — und sagt in der Konsole, was los ist.
 */
function defineCard(tag, cls) {
  if (customElements.get(tag)) {
    console.warn(`[onyx-cards] ${t('log.dup', { tag, v: ONYX_VERSION })}`);
    return;
  }
  customElements.define(tag, cls);
}

defineCard('onyx-room-card', OnyxRoomCard);
defineCard('onyx-slider-card', OnyxSliderCard);
defineCard('onyx-cover-card', OnyxCoverCard);
defineCard('onyx-media-card', OnyxMediaCard);
defineCard('onyx-actions-card', OnyxActionsCard);
defineCard('onyx-chart-card', OnyxChartCard);
defineCard('onyx-vacuum-card', OnyxVacuumCard);
defineCard('onyx-weather-card', OnyxWeatherCard);
defineCard('onyx-light-card', OnyxLightCard);

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'onyx-room-card',
    name: t('card.room'),
    description: t('card.room.d'),
    preview: false
  },
  {
    type: 'onyx-slider-card',
    name: t('card.slider'),
    description: t('card.slider.d'),
    preview: false
  },
  {
    type: 'onyx-cover-card',
    name: t('card.cover'),
    description: t('card.cover.d'),
    preview: false
  },
  {
    type: 'onyx-media-card',
    name: t('card.media'),
    description: t('card.media.d'),
    preview: false
  },
  {
    type: 'onyx-actions-card',
    name: t('card.actions'),
    description: t('card.actions.d'),
    preview: false
  },
  {
    type: 'onyx-chart-card',
    name: t('card.chart'),
    description: t('card.chart.d'),
    preview: false
  },
  {
    type: 'onyx-vacuum-card',
    name: t('card.vacuum'),
    description: t('card.vacuum.d'),
    preview: false
  },
  {
    type: 'onyx-weather-card',
    name: t('card.weather'),
    description: t('card.weather.d'),
    preview: false
  },
  {
    type: 'onyx-light-card',
    name: t('card.light'),
    description: t('card.light.d'),
    preview: false
  }
);

export {
  OnyxRoomCard, OnyxSliderCard, OnyxCoverCard,
  OnyxMediaCard, OnyxActionsCard, OnyxChartCard, OnyxVacuumCard, OnyxWeatherCard, OnyxLightCard
};
