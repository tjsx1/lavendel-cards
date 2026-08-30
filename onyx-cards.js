/*!
 * Onyx Cards für Home Assistant
 * Version 1.2.1
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
 *   custom:onyx-camera-card  – Kamera mit Livebild, Bewegung und Türöffner
 *   custom:onyx-lock-card    – Schloss: schieben zum Entriegeln
 *   custom:onyx-status-card  – mehrere Zustände in einer Karte
 *   custom:onyx-climate-card – Temperaturring mit Skala und Betriebsarten
 *   custom:onyx-energy-card  – Flussbild zwischen Sonne, Netz, Batterie und Haus
 *
 * Installation:
 *   1. Datei nach /config/www/onyx-cards.js kopieren
 *   2. Einstellungen → Dashboards → ⋮ → Ressourcen → Hinzufügen
 *      URL /local/onyx-cards.js   ·   Typ: JavaScript-Modul
 *   3. Browser hart neu laden (Strg/Cmd + Shift + R)
 */

const ONYX_VERSION = '1.7.0';

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
    'card.light.d': 'Eine Zeile; Regler, Farbrad und Effekte klappen aus',
    'ed.show_color_temp': 'Farbtemperatur zeigen',
    'ed.show_colors': 'Farbrad zeigen',
    'ed.show_effects': 'Effekte zeigen',
    'ed.always_open': 'Immer ausgeklappt',
    'ed.h.always_open': 'Zeigt Farbtemperatur, Farben und Effekte ohne Antippen',
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
    cam: 'Kamera',
    'cam.live': 'Live',
    'cam.motion': 'Bewegung',
    'cam.ring': 'Es klingelt',
    'cam.quiet': 'Ruhig',
    'cam.last': 'zuletzt {t}',
    'cam.open': 'Tür öffnen',
    'cam.sure': 'Sicher?',
    'err.needCamera': 'Die Entität muss aus der Domäne "camera" kommen.',
    'card.camera': 'Onyx Kamera-Karte',
    'card.camera.d': 'Livebild mit Bewegung, Licht und Türöffner',
    'log.streamLoad': 'Stream-Bündel liess sich nicht vorladen:',
    'ed.cameras': 'Weitere Kameras',
    'ed.motion_entity': 'Bewegungsmelder',
    'ed.doorbell_entity': 'Klingel',
    'ed.door_entity': 'Türöffner',
    'ed.light_entity': 'Licht',
    'ed.footer': 'Zeile unter dem Bild',
    'ed.aspect_ratio': 'Seitenverhältnis',
    'ed.h.cameras': 'Ab der zweiten Kamera erscheint ein Streifen zum Umschalten',
    'ed.h.motion_entity': 'Ein binary_sensor; färbt das Abzeichen und die Karte',
    'ed.h.door_entity': 'Schloss, Schalter oder Knopf — der Knopf braucht zwei Tipper',
    'ed.h.footer': 'Symbol, Name und Zustand unter das Bild statt darüber',
    'ed.h.aspect_ratio': 'Zum Beispiel 16/9, 4/3 oder 1/1',
    lock: 'Schloss',
    'lk.locked': 'Verriegelt',
    'lk.unlocked': 'Entriegelt',
    'lk.locking': 'Verriegelt …',
    'lk.unlocking': 'Entriegelt …',
    'lk.opening': 'Öffnet …',
    'lk.jammed': 'Klemmt',
    'lk.slide': 'Zum Entriegeln schieben',
    'lk.slideShort': 'Entriegeln',
    'lk.lock': 'Verriegeln',
    'lk.openDoor': 'Riegel zurückziehen',
    'lk.openShort': 'Riegel',
    'lk.sure': 'Sicher?',
    'lk.doorOpen': 'Tür offen',
    'lk.doorShut': 'Tür zu',
    'err.needLock': 'Die Entität muss aus der Domäne "lock" kommen.',
    'card.lock': 'Onyx Schloss-Karte',
    'card.lock.d': 'Schieben zum Entriegeln, mit Tür- und Akkustand',
    'ed.show_open': 'Riegel-Knopf zeigen',
    'ed.h.show_open': 'Nur bei Schlössern, die den Riegel selbst zurückziehen können',
    'ed.h.door_entity_lock': 'Ein binary_sensor an der Tür; zeigt offen oder zu',
    'ed.h.lockColor': 'Ohne eigene Farbe färbt sich die Karte nach dem Zustand: grün verriegelt, orange entriegelt, rot klemmt.',
    en: 'Energie',
    'en.home': 'Zuhause',
    'en.import': 'Bezug',
    'en.export': 'Einspeisung',
    'en.fromGrid': 'aus dem Netz',
    'en.own': '{n} % selbst',
    'en.produced': 'Erzeugt',
    'en.imported': 'Bezogen',
    'en.exported': 'Eingespeist',
    'en.paid': 'Heute bezahlt',
    'en.saved': 'Gespart',
    'en.currency': 'CHF',
    'err.needEnergy': 'Bitte mindestens "grid:", "grid_import:" oder "solar:" angeben.',
    'card.energy': 'Onyx Energie-Karte',
    'card.energy.d': 'Flussbild zwischen Sonne, Netz, Batterie und Haus',
    'ed.grid': 'Netz-Leistung',
    'ed.grid_import': 'Netzbezug',
    'ed.grid_export': 'Einspeisung',
    'ed.solar': 'Erzeugung',
    'ed.battery': 'Batterie-Leistung',
    'ed.battery_level': 'Batterie-Ladestand',
    'ed.house': 'Hausverbrauch',
    'ed.car': 'Wallbox',
    'ed.invert_grid': 'Netz-Vorzeichen drehen',
    'ed.invert_battery': 'Batterie-Vorzeichen drehen',
    'ed.today_solar': 'Erzeugt heute',
    'ed.today_import': 'Bezogen heute',
    'ed.today_export': 'Eingespeist heute',
    'ed.today_house': 'Verbraucht heute',
    'ed.cost_today': 'Kosten heute',
    'ed.saved_today': 'Ersparnis heute',
    'ed.price_import': 'Arbeitspreis',
    'ed.price_export': 'Einspeisevergütung',
    'ed.currency': 'Währung',
    'ed.h.grid': 'Ein Sensor mit Vorzeichen: positiv heisst Bezug. Wer getrennte '
      + 'Sensoren hat, lässt dieses Feld leer und füllt die beiden darunter.',
    'ed.h.invert_grid': 'Nur nötig, wenn dein Zähler positiv für Einspeisung misst',
    'ed.h.battery': 'Positiv heisst entladen, negativ laden',
    'ed.h.house': 'Leer lassen: dann rechnet die Karte den Rest aus',
    'ed.h.price_import': 'Pro kWh. Nur nötig, wenn du keinen fertigen Kosten-Sensor hast.',
    'ed.h.energy': 'Was du nicht angibst, verschwindet aus dem Bild — eine Anlage ohne '
      + 'Batterie zeigt keinen Batterie-Knoten. Kosten und Ersparnis erscheinen, sobald '
      + 'entweder ein Sensor oder ein Preis dasteht.',
    cl: 'Klima',
    'cl.now': 'gerade {v} °C',
    'cl.m.heat': 'Heizen',
    'cl.m.cool': 'Kühlen',
    'cl.m.heat_cool': 'Auto',
    'cl.m.auto': 'Auto',
    'cl.m.dry': 'Trocknen',
    'cl.m.fan_only': 'Lüften',
    'cl.m.off': 'Aus',
    'cl.a.heating': 'Heizt',
    'cl.a.cooling': 'Kühlt',
    'cl.a.drying': 'Trocknet',
    'cl.a.fan': 'Lüftet',
    'cl.a.idle': 'Bereit',
    'cl.a.off': 'Aus',
    'cl.a.preheating': 'Heizt vor',
    'cl.a.defrosting': 'Taut ab',
    'cl.p.none': 'Keine',
    'cl.p.home': 'Zuhause',
    'cl.p.comfort': 'Komfort',
    'cl.p.eco': 'Sparen',
    'cl.p.away': 'Abwesend',
    'cl.p.sleep': 'Nacht',
    'cl.p.boost': 'Turbo',
    'cl.p.activity': 'Aktiv',
    'cl.p.frost': 'Frostschutz',
    'cl.f.auto': 'Auto',
    'cl.f.low': 'Leise',
    'cl.f.medium': 'Mittel',
    'cl.f.high': 'Stark',
    'cl.f.off': 'Aus',
    'cl.f.on': 'An',
    'err.needClimate': 'Die Entität muss aus der Domäne "climate" kommen.',
    'card.climate': 'Onyx Klima-Karte',
    'card.climate.d': 'Temperaturring mit Skala, Betriebsarten und Voreinstellungen',
    'ed.show_modes': 'Betriebsarten zeigen',
    'ed.show_presets': 'Voreinstellungen zeigen',
    'ed.show_fan': 'Lüfterstufen zeigen',
    'ed.h.show_presets': 'Nur wenn das Gerät welche kennt',
    'ed.h.clSensor': 'Leer lassen: dann nimmt die Karte den Wert des Thermostats',
    'ed.h.climate': 'Der Ring zeigt den Bereich zwischen Minimum und Maximum des Geräts. Ziehen verstellt das Soll, die beiden Knöpfe gehen in der Schrittweite des Geräts. Nennt das Gerät zwei Sollwerte, wandert der nähere Griff mit.',
    'ed.h.climateColor': 'Ohne eigene Farbe färbt sich die Karte nach dem, was gerade '
      + 'läuft: orange beim Heizen, blau beim Kühlen, grün beim Trocknen.',
    quick: 'Schnellzugriff',
    st: 'Status',
    'st.home': 'Zuhause',
    'st.allHome': 'alle da',
    'st.nobody': 'niemand da',
    'st.cleaning': 'putzt',
    'st.cleanedToday': 'heute geputzt',
    'st.notYetCleaned': 'heute noch nicht geputzt',
    'st.mowing': 'mäht gerade',
    'st.charging': 'lädt',
    'st.stillMin': 'noch {n} Min',
    'st.pluggedIn': 'angesteckt',
    'st.climateOn': 'Klima läuft',
    'st.quiet': 'Nichts zu melden',
    'st.nMessages': '{n} Meldungen',
    'err.needRows': 'Bitte "rows:", "chips:" oder "head:" angeben.',
    'card.status': 'Onyx Status-Karte',
    'card.status.d': 'Mehrere Zustände in einer Karte, mit Bausteinen und Vorlagen',
    'log.template': 'Vorlage liess sich nicht auswerten:',
    'ed.rows': 'Zeilen',
    'ed.chips': 'Chips',
    'ed.head': 'Kopf',
    'ed.addHead': 'Kopf',
    'ed.addRow': 'Zeile',
    'ed.addChip': 'Chip',
    'ed.up': 'Nach oben',
    'ed.down': 'Nach unten',
    'ed.remove': 'Entfernen',
    'ed.module': 'Baustein',
    'ed.detail': 'Zusatztext',
    'ed.value': 'Wert rechts',
    'ed.percent': 'Balken in Prozent',
    'ed.hide': 'Ausblenden wenn',
    'ed.people': 'Personen',
    'ed.charging': 'Ladestatus',
    'ed.power': 'Ladeleistung',
    'ed.remaining': 'Restzeit',
    'ed.cable': 'Ladekabel',
    'ed.room': 'Raum-Sensor',
    'ed.done': 'Heute erledigt',
    'ed.chargeLevel': 'Ladestand',
    'ed.standClimate': 'Standklima',
    'ed.m.presence': 'Personen',
    'ed.m.car': 'Elektroauto',
    'ed.m.vacuum': 'Staubsauger',
    'ed.m.mower': 'Rasenmäher',
    'ed.m.battery': 'Batterie',
    'ed.m.entity': 'Entität',
    'ed.m.template': 'Vorlage',
    'ed.h.module': 'Jeder Baustein weiss selbst, was er bei welchem Zustand zeigt',
    'ed.h.hide': 'Vorlage, die "True" ergibt — dann fällt der Eintrag ganz weg',
    'ed.h.detail': 'Die kleine Zeile darunter; leer lassen für den Text des Bausteins',
    'ed.h.value': 'Steht rechts aussen, z. B. "67 %"',
    'ed.h.percent': 'Zahl von 0 bis 100; zeichnet einen Balken unter den Namen',
    'ed.h.people': 'Wer daheim ist, bekommt ein farbiges Köpfchen',
    'ed.h.done': 'Ein Schalter, der auf "an" steht, wenn heute schon geputzt wurde',
    'ed.h.charging': 'Steht diese Entität auf "charging" oder "an", wird geladen',
    'ed.h.room': 'Sensor mit dem Raum, in dem gerade gesaugt wird',
    'ed.h.status': 'Name, Zusatztext, Symbol, Farbe und "Ausblenden wenn" nehmen auch '
      + 'Jinja entgegen, z. B. {{ states("input_select.storen_ost") }}. Leer lassen: '
      + 'dann entscheidet der Baustein.',
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
    coverShut: '{n} Store geschlossen',
    favTilt: 'Winkel {n} %',
    favTo: 'Auf {n} % fahren',
    favStop: 'Auf die Wunschposition (my)',
    coversShut: '{n} Storen geschlossen',
    mediaPaused: 'Pausiert',
    allOff: 'Alles aus',
    unavailable: 'Nicht erreichbar',
    on: 'An',
    off: 'Aus',
    open: 'Offen',
    closed: 'Zu',
    pctOpen: '{n} % offen',
    playing: 'Läuft',
    nOfMShut: '{n} von {m} geschlossen',
    nOfMOn: '{n} von {m} an',
    closeAllCovers: 'Alle Storen zu',
    turnAllOff: 'Alle aus',
    turnAllOn: 'Alle ein',
    turnAllOnShort: 'Ein',
    turnAllOffShort: 'Aus',
    coversUp: 'Alle rauf',
    coversUpShort: 'Rauf',
    coversDown: 'Alle runter',
    coversDownShort: 'Runter',
    coverAuto: 'Automatik',
    coverAutoShort: 'Auto',
    coverWind: 'Windwächter',
    coverWindShort: 'Wind',

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
    tapToSwitch: 'Antippen wechselt, Ziehen zeigt Werte',

    'err.entity': 'Entität {id} gibt es nicht.',
    'err.needEntity': 'Bitte "entity" angeben.',
    'err.needArea': 'Bitte "area" angeben (die Bereichs-ID) oder Listen wie "lights:", "covers:", "media:".',
    'err.area': 'Bereich "{id}" nicht gefunden.',
    'err.color': 'Farbe "{c}" gibt es nicht. Möglich: {list}',
    'err.needActions': 'Bitte "actions:" oder "groups:" mit Einträgen angeben.',
    'err.needEntities': 'Bitte "entities:" mit ein bis drei Sensoren angeben.',
    'err.tooMany': 'Höchstens vier Entitäten — sonst wird die Spalte zur Liste.',
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
    'ed.subtitle': 'Untertitel',
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
    'ed.cover_auto': 'Storen-Automatik',
    'ed.favs': 'Wunschpositionen der Storen',
    'ed.h.favs': 'Wohin der Stern in der Karte fährt. Eine Store ohne Angabe '
      + 'bekommt keinen Stern.',
    'ed.h.favsArea': 'Die Storen kommen aus dem Bereich. Damit jede ihre eigene '
      + 'Wunschposition bekommen kann, muss sie als Liste in der Karte stehen.',
    'ed.listCovers': 'Storen als Liste übernehmen',
    'ed.favNone': 'keine Wunschposition',
    'ed.clearFav': 'Wunschposition löschen',
    'ed.takeNow': 'Ist-Zustand übernehmen',
    'ed.h.takeNow': 'Übernimmt Höhe und Winkel, wie die Store gerade steht — {s}.',
    'ed.position': 'Höhe',
    'ed.h.position': '0 ist ganz zu, 100 ganz offen',
    'ed.tilt': 'Lamellenwinkel',
    'ed.h.tilt': 'Nur bei Storen, die ihre Lamellen kennen',
    'ed.stop': 'Nur ein Halt schicken',
    'ed.h.stopOnly': 'Für Antriebe ohne Positionsangabe, etwa Somfy RTS: die Karte '
      + 'schickt nur ein Halt, den Rest macht der Antrieb — die my-Taste.',
    'ed.cover_favorite': 'Wunschposition der Storen',
    'ed.h.cover_favorite': 'Eine Prozentzahl (z. B. 70) oder das Wort stop. '
      + 'Bei einer Zahl fährt der Stern die Store dorthin; bei stop schickt er '
      + 'nur ein Halt — das ist bei Somfy RTS die my-Taste. Leer lassen: dann '
      + 'erscheint kein Stern. Einzelne Storen können in der YAML mit '
      + '"favorite:" davon abweichen.',
    'ed.cover_wind': 'Windwächter',
    'ed.h.cover_auto': 'Erscheint als Knopf, wenn die Storen ausgeklappt sind',
    'ed.h.cover_wind': 'Ebenso — leer lassen, wenn es keinen gibt',
    'ed.h.lights': 'Schalter dürfen mit hinein: ein Shelly, der eine Lampe schaltet, '
      + 'zählt für den Raum als Lampe',
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
    'ed.reihen': 'Die einzelnen Reihen',
    'ed.h.reihen': 'Je Reihe ein eigener Name, eine eigene Einheit und eine eigene '
      + 'Farbe. Darunter lässt sich für Woche, Monat und Jahr ein anderer Sensor '
      + 'hinterlegen — eine Momentanleistung taugt übers Jahr nichts, ein '
      + 'Zählerstand schon.',
    'ed.unit': 'Einheit',
    'ed.h.unit': 'Überschreibt nur die Beschriftung, gerechnet wird nichts um. '
      + 'Leer lassen: dann gilt die Einheit der Entität.',
    'ed.y_axis': 'Werte an der Y-Achse',
    'ed.h.y_axis': 'Höchster, mittlerer und tiefster Wert am linken Rand. Sie '
      + 'gehören der geführten Reihe — jede Reihe hat ihre eigene Skala.',
    'ed.woche': 'Sensor für die Woche',
    'ed.monat': 'Sensor für den Monat',
    'ed.jahr': 'Sensor für das Jahr',
    'ed.h.perEntity': 'Leer lassen: dann gilt die Entität von oben',
    'ed.fill': 'Flächen einfärben',
    'ed.h.fill': 'Jede gezeichnete Reihe bekommt ihre Fläche. Aus: nur die blossen '
      + 'Linien. Je mehr Flächen übereinander liegen, desto blasser wird jede.',
    'ed.graphs': 'Wie viele Linien',
    'ed.graphsAll': 'Alle',
    'ed.graphsOne': 'Nur die gewählte',
    'ed.graphsN': '{n} Linien',
    'ed.h.graphs': 'Wie viele Reihen gleichzeitig gezeichnet werden. Die Werte '
      + 'rechts erscheinen immer alle. Gezeichnet wird die angetippte Reihe und, '
      + 'bei mehr als einer Linie, die folgenden der Liste.',
    'ed.h.entities': 'Ein bis vier Messwerte. Der angetippte führt und bekommt die Fläche, die übrigen laufen als dünne Linien mit.',
    'ed.h.columns': 'Gilt nicht für Kacheln und Leiste',
    'ed.roomHint': 'Die vier Listen leer lassen: dann zeigt die Karte alle passenden Geräte '
      + 'des Bereichs, alphabetisch. Eigene Namen und Symbole je Gerät gibt es nur im '
      + 'Code-Editor — der Editor hier lässt sie unangetastet.',
    'ed.tooMany': 'Höchstens vier Messwerte — die überzähligen wurden verworfen.',
    'ed.addAction': 'Aktion',
    'ed.addGroup': 'Gruppe',
    'ed.shape.squares': 'Quadrate',
    'ed.shape.chips': 'Chips',
    'ed.shape.tiles': 'Kacheln',
    'ed.shape.rail': 'Leiste',
    'ed.chip_style': 'Bauart der Chips',
    'ed.h.chip_style': 'Gilt nur für die Form „Chips"',
    'ed.cs.icon': 'Farbe im Symbol',
    'ed.cs.fill': 'Aktive füllen sich',
    'ed.cs.ring': 'Aktive bekommen einen Rand',
    'ed.cs.detail': 'Zwei Zeilen im Chip',
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
    'card.light.d': 'One row; slider, color wheel and effects on tap',
    'ed.show_color_temp': 'Show color temperature',
    'ed.show_colors': 'Show color wheel',
    'ed.show_effects': 'Show effects',
    'ed.always_open': 'Always expanded',
    'ed.h.always_open': 'Shows color temperature, colors and effects without tapping',
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
    cam: 'Camera',
    'cam.live': 'Live',
    'cam.motion': 'Motion',
    'cam.ring': 'Ringing',
    'cam.quiet': 'All quiet',
    'cam.last': 'last {t}',
    'cam.open': 'Open door',
    'cam.sure': 'Sure?',
    'err.needCamera': 'The entity must come from the "camera" domain.',
    'card.camera': 'Onyx Camera Card',
    'card.camera.d': 'Live view with motion, light and door release',
    'log.streamLoad': 'Could not preload the stream bundle:',
    'ed.cameras': 'More cameras',
    'ed.motion_entity': 'Motion sensor',
    'ed.doorbell_entity': 'Doorbell',
    'ed.door_entity': 'Door release',
    'ed.light_entity': 'Light',
    'ed.footer': 'Row below the picture',
    'ed.aspect_ratio': 'Aspect ratio',
    'ed.h.cameras': 'From the second camera on, a strip appears for switching',
    'ed.h.motion_entity': 'A binary_sensor; tints the badge and the card',
    'ed.h.door_entity': 'Lock, switch or button — the button needs two taps',
    'ed.h.footer': 'Icon, name and state below the picture instead of over it',
    'ed.h.aspect_ratio': 'For example 16/9, 4/3 or 1/1',
    lock: 'Lock',
    'lk.locked': 'Locked',
    'lk.unlocked': 'Unlocked',
    'lk.locking': 'Locking …',
    'lk.unlocking': 'Unlocking …',
    'lk.opening': 'Opening …',
    'lk.jammed': 'Jammed',
    'lk.slide': 'Slide to unlock',
    'lk.slideShort': 'Unlock',
    'lk.lock': 'Lock',
    'lk.openDoor': 'Pull back the latch',
    'lk.openShort': 'Latch',
    'lk.sure': 'Sure?',
    'lk.doorOpen': 'Door open',
    'lk.doorShut': 'Door closed',
    'err.needLock': 'The entity must come from the "lock" domain.',
    'card.lock': 'Onyx Lock Card',
    'card.lock.d': 'Slide to unlock, with door and battery state',
    'ed.show_open': 'Show latch button',
    'ed.h.show_open': 'Only for locks that can pull back the latch themselves',
    'ed.h.door_entity_lock': 'A binary_sensor on the door; shows open or closed',
    'ed.h.lockColor': 'Without a color of your own the card follows the state: green locked, orange unlocked, red jammed.',
    en: 'Energy',
    'en.home': 'Home',
    'en.import': 'Import',
    'en.export': 'Export',
    'en.fromGrid': 'from the grid',
    'en.own': '{n} % own',
    'en.produced': 'Produced',
    'en.imported': 'Imported',
    'en.exported': 'Exported',
    'en.paid': 'Paid today',
    'en.saved': 'Saved',
    'en.currency': 'CHF',
    'err.needEnergy': 'Please provide at least "grid:", "grid_import:" or "solar:".',
    'card.energy': 'Onyx Energy Card',
    'card.energy.d': 'Flow diagram between sun, grid, battery and house',
    'ed.grid': 'Grid power',
    'ed.grid_import': 'Grid import',
    'ed.grid_export': 'Grid export',
    'ed.solar': 'Production',
    'ed.battery': 'Battery power',
    'ed.battery_level': 'Battery level',
    'ed.house': 'House consumption',
    'ed.car': 'Wallbox',
    'ed.invert_grid': 'Flip grid sign',
    'ed.invert_battery': 'Flip battery sign',
    'ed.today_solar': 'Produced today',
    'ed.today_import': 'Imported today',
    'ed.today_export': 'Exported today',
    'ed.today_house': 'Consumed today',
    'ed.cost_today': 'Cost today',
    'ed.saved_today': 'Saved today',
    'ed.price_import': 'Import price',
    'ed.price_export': 'Export rate',
    'ed.currency': 'Currency',
    'ed.h.grid': 'One signed sensor: positive means import. With separate sensors, '
      + 'leave this empty and fill the two below.',
    'ed.h.invert_grid': 'Only needed if your meter counts export as positive',
    'ed.h.battery': 'Positive means discharging, negative charging',
    'ed.h.house': 'Leave empty and the card works out the remainder',
    'ed.h.price_import': 'Per kWh. Only needed if you have no ready-made cost sensor.',
    'ed.h.energy': 'Whatever you leave out disappears from the diagram — a system '
      + 'without a battery shows no battery node. Cost and savings appear as soon as '
      + 'either a sensor or a price is given.',
    cl: 'Climate',
    'cl.now': 'now {v} °C',
    'cl.m.heat': 'Heat',
    'cl.m.cool': 'Cool',
    'cl.m.heat_cool': 'Auto',
    'cl.m.auto': 'Auto',
    'cl.m.dry': 'Dry',
    'cl.m.fan_only': 'Fan',
    'cl.m.off': 'Off',
    'cl.a.heating': 'Heating',
    'cl.a.cooling': 'Cooling',
    'cl.a.drying': 'Drying',
    'cl.a.fan': 'Fan running',
    'cl.a.idle': 'Idle',
    'cl.a.off': 'Off',
    'cl.a.preheating': 'Preheating',
    'cl.a.defrosting': 'Defrosting',
    'cl.p.none': 'None',
    'cl.p.home': 'Home',
    'cl.p.comfort': 'Comfort',
    'cl.p.eco': 'Eco',
    'cl.p.away': 'Away',
    'cl.p.sleep': 'Sleep',
    'cl.p.boost': 'Boost',
    'cl.p.activity': 'Activity',
    'cl.p.frost': 'Frost guard',
    'cl.f.auto': 'Auto',
    'cl.f.low': 'Low',
    'cl.f.medium': 'Medium',
    'cl.f.high': 'High',
    'cl.f.off': 'Off',
    'cl.f.on': 'On',
    'err.needClimate': 'The entity must come from the "climate" domain.',
    'card.climate': 'Onyx Climate Card',
    'card.climate.d': 'Temperature dial with scale, modes and presets',
    'ed.show_modes': 'Show modes',
    'ed.show_presets': 'Show presets',
    'ed.show_fan': 'Show fan speeds',
    'ed.h.show_presets': 'Only if the device offers any',
    'ed.h.clSensor': 'Leave empty and the card uses the thermostat reading',
    'ed.h.climate': 'The dial spans the minimum and maximum of the device. Dragging sets the target, the two buttons step by the device step size. If the device names two targets, the nearer handle moves.',
    'ed.h.climateColor': 'Without a colour of its own the card follows what is running: '
      + 'orange when heating, blue when cooling, green when drying.',
    quick: 'Quick access',
    st: 'Status',
    'st.home': 'Home',
    'st.allHome': 'everyone in',
    'st.nobody': 'nobody in',
    'st.cleaning': 'cleaning',
    'st.cleanedToday': 'cleaned today',
    'st.notYetCleaned': 'not cleaned yet today',
    'st.mowing': 'mowing',
    'st.charging': 'charging',
    'st.stillMin': '{n} min left',
    'st.pluggedIn': 'plugged in',
    'st.climateOn': 'climate running',
    'st.quiet': 'Nothing to report',
    'st.nMessages': '{n} messages',
    'err.needRows': 'Please set "rows:", "chips:" or "head:".',
    'card.status': 'Onyx Status Card',
    'card.status.d': 'Several states in one card, from modules and templates',
    'log.template': 'Could not render the template:',
    'ed.rows': 'Rows',
    'ed.chips': 'Chips',
    'ed.head': 'Head',
    'ed.addHead': 'Head',
    'ed.addRow': 'Row',
    'ed.addChip': 'Chip',
    'ed.up': 'Move up',
    'ed.down': 'Move down',
    'ed.remove': 'Remove',
    'ed.module': 'Module',
    'ed.detail': 'Detail text',
    'ed.value': 'Value on the right',
    'ed.percent': 'Bar in percent',
    'ed.hide': 'Hide when',
    'ed.people': 'People',
    'ed.charging': 'Charging state',
    'ed.power': 'Charging power',
    'ed.remaining': 'Time remaining',
    'ed.cable': 'Charging cable',
    'ed.room': 'Room sensor',
    'ed.done': 'Done today',
    'ed.chargeLevel': 'Charge level',
    'ed.standClimate': 'Pre-conditioning',
    'ed.m.presence': 'People',
    'ed.m.car': 'Electric car',
    'ed.m.vacuum': 'Vacuum',
    'ed.m.mower': 'Lawn mower',
    'ed.m.battery': 'Battery',
    'ed.m.entity': 'Entity',
    'ed.m.template': 'Template',
    'ed.h.module': 'Every module knows on its own what to show in which state',
    'ed.h.hide': 'A template returning "True" — then the entry disappears entirely',
    'ed.h.detail': 'The small line below; leave empty for the module text',
    'ed.h.value': 'Sits on the far right, e.g. "67 %"',
    'ed.h.percent': 'Number from 0 to 100; draws a bar under the name',
    'ed.h.people': 'Whoever is home gets a coloured badge',
    'ed.h.done': 'A switch that is "on" once the house has been cleaned today',
    'ed.h.charging': 'If this entity is "charging" or "on", the car is charging',
    'ed.h.room': 'Sensor holding the room currently being cleaned',
    'ed.h.status': 'Name, detail text, icon, colour and "Hide when" also accept Jinja, '
      + 'e.g. {{ states("input_select.blinds_east") }}. Leave empty and the module decides.',
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
    coverShut: '{n} blind closed',
    favTilt: 'Tilt {n}%',
    favTo: 'Move to {n}%',
    favStop: 'Move to the favourite position (my)',
    coversShut: '{n} blinds closed',
    mediaPaused: 'Paused',
    allOff: 'All off',
    unavailable: 'Unavailable',
    on: 'On',
    off: 'Off',
    open: 'Open',
    closed: 'Closed',
    pctOpen: '{n} % open',
    playing: 'Playing',
    nOfMShut: '{n} of {m} closed',
    nOfMOn: '{n} of {m} on',
    closeAllCovers: 'Close all blinds',
    turnAllOff: 'All off',
    turnAllOn: 'All on',
    turnAllOnShort: 'On',
    turnAllOffShort: 'Off',
    coversUp: 'All up',
    coversUpShort: 'Up',
    coversDown: 'All down',
    coversDownShort: 'Down',
    coverAuto: 'Automatic',
    coverAutoShort: 'Auto',
    coverWind: 'Wind guard',
    coverWindShort: 'Wind',

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
    tapToSwitch: 'Tap to switch, drag to read values',

    'err.entity': 'Entity {id} does not exist.',
    'err.needEntity': 'Please set "entity".',
    'err.needArea': 'Please set "area" (the area ID) or lists such as "lights:", "covers:", "media:".',
    'err.area': 'Area "{id}" not found.',
    'err.color': 'Unknown color "{c}". Available: {list}',
    'err.needActions': 'Please set "actions:" or "groups:" with entries.',
    'err.needEntities': 'Please set "entities:" with one to three sensors.',
    'err.tooMany': 'Four entities at most — beyond that the column becomes a list.',
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
    'ed.subtitle': 'Subtitle',
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
    'ed.cover_auto': 'Blind automation',
    'ed.favs': 'Favourite positions of the blinds',
    'ed.h.favs': 'Where the star in the card drives to. A blind without a setting '
      + 'gets no star.',
    'ed.h.favsArea': 'The blinds come from the area. For each one to have its own '
      + 'favourite position it has to be listed in the card.',
    'ed.listCovers': 'Take the blinds as a list',
    'ed.favNone': 'no favourite position',
    'ed.clearFav': 'Remove favourite position',
    'ed.takeNow': 'Take the current position',
    'ed.h.takeNow': 'Takes height and tilt as the blind stands right now — {s}.',
    'ed.position': 'Height',
    'ed.h.position': '0 is fully closed, 100 fully open',
    'ed.tilt': 'Slat angle',
    'ed.h.tilt': 'Only for blinds that know their slats',
    'ed.stop': 'Only send a halt',
    'ed.h.stopOnly': 'For drives without a position, such as Somfy RTS: the card '
      + 'only sends a halt, the drive does the rest — the my button.',
    'ed.cover_favorite': 'Favourite position of the blinds',
    'ed.h.cover_favorite': 'A percentage (e.g. 70) or the word stop. '
      + 'With a number the star drives the blind there; with stop it only sends '
      + 'a halt — on Somfy RTS that is the my button. Leave empty and no star '
      + 'appears. Individual blinds can override this in YAML with "favorite:".',
    'ed.cover_wind': 'Wind guard',
    'ed.h.cover_auto': 'Appears as a button while the blinds are expanded',
    'ed.h.cover_wind': 'Same — leave empty if you do not have one',
    'ed.h.lights': 'Switches are welcome: a Shelly switching a lamp counts as a lamp '
      + 'for the room',
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
    'ed.reihen': 'The individual series',
    'ed.h.reihen': 'Each series gets its own name, unit and colour. Below that you '
      + 'can name a different sensor for week, month and year — an instantaneous '
      + 'power reading is useless over a year, a meter total is not.',
    'ed.unit': 'Unit',
    'ed.h.unit': 'Overrides the label only, nothing is converted. Leave empty and '
      + 'the unit of the entity applies.',
    'ed.y_axis': 'Values on the Y axis',
    'ed.h.y_axis': 'Highest, middle and lowest value along the left edge. They '
      + 'belong to the leading series — every series has its own scale.',
    'ed.woche': 'Sensor for the week',
    'ed.monat': 'Sensor for the month',
    'ed.jahr': 'Sensor for the year',
    'ed.h.perEntity': 'Leave empty and the entity above applies',
    'ed.fill': 'Fill the areas',
    'ed.h.fill': 'Every drawn series gets its area. Off: bare lines only. The more '
      + 'areas overlap, the fainter each one becomes.',
    'ed.graphs': 'How many lines',
    'ed.graphsAll': 'All',
    'ed.graphsOne': 'Only the selected one',
    'ed.graphsN': '{n} lines',
    'ed.h.graphs': 'How many series are drawn at once. The values on the right '
      + 'always show all of them. Drawn are the one you tap and, with more than '
      + 'one line, the following ones in the list.',
    'ed.h.entities': 'One to four readings. The one you tap leads and gets the area, the others run along as thin lines.',
    'ed.h.columns': 'Does not apply to tiles and rail',
    'ed.roomHint': 'Leave the four lists empty and the card shows every matching device '
      + 'in the area, alphabetically. Per-device names and icons are only available in '
      + 'the code editor — this editor leaves them untouched.',
    'ed.tooMany': 'Four readings at most — the surplus was dropped.',
    'ed.addAction': 'Action',
    'ed.addGroup': 'Group',
    'ed.shape.squares': 'Squares',
    'ed.shape.chips': 'Chips',
    'ed.shape.tiles': 'Tiles',
    'ed.shape.rail': 'Rail',
    'ed.chip_style': 'Chip style',
    'ed.h.chip_style': 'Only applies to the "Chips" shape',
    'ed.cs.icon': 'Color in the icon',
    'ed.cs.fill': 'Active ones fill up',
    'ed.cs.ring': 'Active ones get a rim',
    'ed.cs.detail': 'Two lines per chip',
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
function t(key, vars, ersatz) {
  let s = STRINGS[LANG][key];
  if (s == null) s = STRINGS.en[key];
  // Voreinstellungen und Lüfterstufen benennt Home Assistant frei — für die
  // gibt es keine Übersetzung, und der Schlüssel wäre als Beschriftung Unsinn.
  if (s == null) return ersatz == null ? key : ersatz;
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

/**
 * Der Zustand einer Entität, so wie Home Assistant selbst ihn schreiben würde:
 * übersetzt und mit Einheit. Ältere Kerne kennen die Hilfe nicht — dann bleibt
 * der rohe Zustand stehen, wie bisher.
 */
function stateText(hass, st) {
  if (!st) return '';
  if (hass && typeof hass.formatEntityState === 'function') {
    try {
      const s = hass.formatEntityState(st);
      if (s) return s;
    } catch (e) { /* stiller Rückfall */ }
  }
  return st.state;
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
    const sig = this._sigOf(model);
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

  /**
   * Woran erkennt die Karte, dass sich etwas geändert hat? Vorgabe ist das
   * ganze Modell. Karten, in deren Modell Werte stehen, die sich von selbst
   * ändern ohne dass es etwas zu sehen gäbe, dürfen das übersteuern —
   * jeder Neuaufbau wirft schliesslich das ganze DOM weg.
   */
  _sigOf(model) { return JSON.stringify(model); }

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
      const x = clamp(Math.round(((ev.clientX - r.left) / r.width) * 100), 0, 100);
      const y = clamp(Math.round(((r.bottom - ev.clientY) / r.height) * 100), 0, 100);
      // Ein Farbfeld braucht beide Achsen auf einmal; alles andere genau eine.
      if (opts.axis === 'xy') return { x, y };
      if (opts.axis === 'y') return y;
      return x;
    };

    el.addEventListener('pointerdown', (ev) => {
      if (ev.button != null && ev.button > 0) return;   // Rechts- und Mittelklick ignorieren
      down = true; held = false; dragging = false;
      sx = ev.clientX; sy = ev.clientY;
      // Ein Zeiger, den der Browser schon losgelassen hat, lässt sich nicht
      // mehr einfangen — das darf den Rest des Griffs nicht abwürgen.
      try { el.setPointerCapture && el.setPointerCapture(ev.pointerId); } catch (e) { /* egal */ }
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
        // Der Ort des Tippens zählt nur beim Farbfeld; alle anderen
        // Empfänger nehmen kein Argument entgegen.
        opts.onTap && opts.onTap(pctFrom(ev));
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

/**
 * Die Wunschposition einer Store. Home Assistant kennt so etwas nicht —
 * die Cover-Schnittstelle hat nur auf, zu, halt, eine Höhe und einen
 * Lamellenwinkel. Erlaubt sind deshalb drei Schreibweisen:
 *   `favorite: {position: 70, tilt: 35}`   Höhe und Winkel
 *   `favorite: 70`                          nur die Höhe
 *   `favorite: stop`                        nur ein Halt — bei Somfy RTS die my-Taste
 * Steht am Eintrag nichts, gilt `cover_favorite` der ganzen Karte.
 * Heraus kommt immer `null`, `'stop'` oder `{position, tilt}`.
 */
function coverFav(entry, cfg) {
  let raw = entry && entry.favorite;
  if (raw == null || raw === '') raw = cfg && cfg.cover_favorite;
  if (raw == null || raw === '' || raw === false) return null;
  if (typeof raw === 'string' && raw.trim().toLowerCase() === 'stop') return 'stop';
  const zahl = (v) => {
    if (v == null || v === '' || v === false) return null;
    const n = Number(v);
    return isNaN(n) ? null : clamp(Math.round(n), 0, 100);
  };
  if (typeof raw === 'object') {
    if (raw.stop === true) return 'stop';
    const pos = zahl(raw.position != null ? raw.position : raw.hoehe);
    const winkel = zahl(raw.tilt != null ? raw.tilt : raw.winkel);
    if (pos == null && winkel == null) return null;
    return { position: pos, tilt: winkel };
  }
  const pos = zahl(raw);
  return pos == null ? null : { position: pos, tilt: null };
}

/** Steht die Store schon dort, wo der Stern sie hinschicken würde? */
function favErreicht(it) {
  const f = it.fav;
  if (!f || f === 'stop') return false;
  if (f.position != null && it.pct !== f.position) return false;
  if (f.tilt != null && it.tilt !== f.tilt) return false;
  return true;
}

/** Was der Stern verspricht, in Worten */
function favTitel(f) {
  if (f === 'stop') return t('favStop');
  const teile = [];
  if (f.position != null) teile.push(t('favTo', { n: f.position }));
  if (f.tilt != null) teile.push(t('favTilt', { n: f.tilt }));
  return teile.join(' \u00b7 ');
}

class OnyxRoomCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    /* Ist im Raum nichts an, bleibt die Karte trotzdem in ihrer Farbe —
       nur gedämpft, in den dunklen Grund hineingemischt. Die Farbe gehört
       zum Raum, nicht zum Zustand; ob etwas läuft, sagen der volle Verlauf,
       die Knopfreihe und die Zeile darunter. */
    ha-card{
      padding:12px; border-radius:var(--onyx-r, 24px); border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:10px; overflow:hidden;
      container-type:inline-size;
      background:linear-gradient(to right bottom,
        color-mix(in srgb, var(--w1) 72%, var(--onyx-cold-1,#141419)) 0%,
        color-mix(in srgb, var(--w2) 72%, var(--onyx-cold-2,#17171d)) 100%);
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
    /* Die Wunschposition: ein eigenes Ziel am rechten Rand der Zeile.
       Steht die Store schon dort, leuchtet der Stern in der Kartenfarbe. */
    .fav{ width:28px; height:28px; border-radius:9px; flex:none; display:grid;
          place-items:center; cursor:pointer; --mdc-icon-size:15px; color:#a8c2d4;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.10);
          transition:transform .12s ease, background .18s ease; }
    .fav.set{ background:color-mix(in srgb, var(--btn) 55%, transparent);
              border-color:color-mix(in srgb, var(--btn) 72%, transparent); color:#fff; }
    .fav.held{ transform:scale(.92); }
    .fav.leer{ background:none; border-color:transparent; pointer-events:none; }
    .lrow.dead .fav{ pointer-events:none; }
    .lrow.off .lname, .lrow.off .lval{ color:#7b8fa0; }
    .lrow.dead{ opacity:.45; }
    /* Knöpfe unter den Zeilen, paarweise nebeneinander */
    .acts{ display:flex; gap:7px; }
    .act{ flex:1; min-width:0; height:42px; border-radius:12px;
          background:rgba(255,255,255,.055); border:1px solid transparent;
          display:flex; align-items:center; justify-content:center; gap:7px;
          padding:0 6px; font-size:12.5px; font-weight:500; color:#a8c2d4;
          cursor:pointer; --mdc-icon-size:15px;
          transition:transform .12s ease, background .18s ease; }
    .act ha-icon{ flex:none; }
    .act span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .act.on{ background:color-mix(in srgb, var(--btn) 55%, transparent);
             border-color:color-mix(in srgb, var(--btn) 72%, transparent); color:#fff; }
    .act.held{ transform:scale(.97); }
    /* Auf einer halben Spalte würden aus "Alle rauf" und "Alle runter"
       zweimal "Alle r…". Dort steht deshalb die kurze Beschriftung. */
    .act .sm{ display:none; }
    @container (max-width: 270px){
      .act{ font-size:12px; gap:5px; padding:0 4px; }
      .act .lg{ display:none; }
      .act .sm{ display:inline; }
    }
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

    const wanted = cfg.groups || ['light', 'cover', 'media_player', 'climate'];
    const groups = [];
    for (const d of wanted) {
      if (!GROUPS[d]) continue;
      const listed = this._groupItems(d);
      if (!listed.length) continue;
      const items = listed.map((entry) => {
        const id = entry.entity;
        const st = hass.states[id];
        // In der Lampenliste dürfen auch Schalter stehen — ein Shelly, der
        // eine Lampe schaltet, ist für den Raum eine Lampe. Nur regeln
        // lässt er sich nicht, also merken wir uns seine echte Domäne.
        const own = id.split('.')[0];
        // Ein Thermostat ist fast immer eingeschaltet. Als "läuft gerade" zählt
        // es nur, wenn es tatsächlich heizt oder kühlt — sonst leuchtete der
        // Klima-Knopf rund ums Jahr.
        const act = st && st.attributes.hvac_action;
        const on = d === 'climate' && act
          ? (act === 'heating' || act === 'cooling' || act === 'drying')
          : isOn(st);
        // `on` heisst "eingeschaltet", `melden` heisst "davon will der Raum
        // oben etwas lesen". Bei Storen ist das Geschlossensein die Nachricht,
        // nicht das Offenstehen; ein pausierter Lautsprecher meldet nichts.
        const melden = isDead(st) ? false
          : own === 'cover' ? !on
          : own === 'media_player' ? ['playing', 'buffering'].includes(st.state)
          : on;
        return {
          id,
          own,
          // Ein Schalter kennt keine Helligkeit — die Zeile lässt sich
          // antippen, aber nicht ziehen.
          dim: own === 'light' || own === 'cover',
          name: entry.name || nameOf(hass, id),
          icon: entry.icon || (own === 'switch' && d === 'light'
            ? 'mdi:power-socket-eu' : GROUPS[d].icon),
          // Nur echte Lampen: die Zeile nimmt die Farbe an, in der sie leuchtet
          glow: own === 'light' ? lightGlow(st) : null,
          // Nur Storen tragen eine Wunschposition — und nur, wenn eine
          // eingerichtet ist. Ohne Einrichtung bleibt die Zeile, wie sie war.
          fav: own === 'cover' ? coverFav(entry, cfg) : null,
          // Der Lamellenwinkel gehört zum Vergleich mit der Wunschposition
          tilt: own === 'cover' && st && st.attributes.current_tilt_position != null
            ? Math.round(st.attributes.current_tilt_position) : null,
          on,
          melden,
          dead: isDead(st),
          pct: pctOf(st),
          state: st ? st.state : 'unavailable',
          action: st && st.attributes.hvac_action ? st.attributes.hvac_action : null,
          title: st && st.attributes.media_title ? st.attributes.media_title : null,
          temp: st && st.attributes.current_temperature != null ? st.attributes.current_temperature : null,
          target: st && st.attributes.temperature != null ? st.attributes.temperature : null
        };
      });
      groups.push({
        domain: d,
        items,
        // onCount steuert das Schalten (halten schaltet die Gruppe um),
        // meldeCount steuert, was zu lesen ist und was leuchtet.
        onCount: items.filter((i) => i.on).length,
        meldeCount: items.filter((i) => i.melden).length
      });
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
      auto: this._flagOf(cfg.cover_auto),
      wind: this._flagOf(cfg.cover_wind),
      path: cfg.navigation_path || null
    };
  }

  /** Ein Schalter, der nur an oder aus kennt — Automatik, Windwächter */
  _flagOf(id) {
    if (!id) return null;
    const st = this._hass.states[id];
    return { id, on: isOn(st), dead: isDead(st) };
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
      const n = g.meldeCount;
      if (!n) continue;
      if (g.domain === 'light') {
        bits.push(t(n === 1 ? 'lightOn' : 'lightsOn', { n }));
      } else if (g.domain === 'media_player') {
        // Nur wenn wirklich etwas spielt. Pausiert heisst: nichts zu melden.
        bits.push(t('musicPlaying'));
      } else if (g.domain === 'climate') {
        // nur melden, wenn wirklich gerade geheizt oder gekühlt wird
        const act = g.items.find((i) => i.action === 'heating' || i.action === 'cooling');
        if (act) bits.push(t(act.action === 'cooling' ? 'cooling' : 'heating'));
      } else if (g.domain === 'cover') {
        // Zu ist die Nachricht, nicht offen — offen ist der Normalzustand
        bits.push(t(n === 1 ? 'coverShut' : 'coversShut', { n }));
      }
    }
    return bits.length ? bits.join(' · ') : t('allOff');
  }

  _rowText(it, domain) {
    if (it.dead) return t('unavailable');
    if (domain === 'media_player') {
      if (it.melden) return it.title || t('playing');
      return it.on ? t('mediaPaused') : t('off');
    }
    // Ein Schalter in der Lampenliste kennt keine Helligkeit. Die Prüfung
    // steht hinter den Domänen, die ohnehin eigenen Text mitbringen.
    if (!it.dim) return it.on ? t('on') : t('off');
    if (domain === 'light') return it.on ? `${it.pct} %` : t('off');
    if (domain === 'cover') return it.pct > 0 ? t('pctOpen', { n: it.pct }) : t('closed');
    if (domain === 'climate') {
      if (it.state === 'off') return t('off');
      const one = (v) => (v == null ? '–' : nfmt(v, v % 1 ? 1 : 0));
      return `${one(it.temp)} → ${one(it.target)} °C`;
    }
    return it.state;
  }

  /**
   * Die Knöpfe unter den Zeilen. Paarweise, weil zwei nebeneinander noch
   * breit genug für ihre Beschriftung sind — bei vieren würde sie brechen.
   * Automatik und Windwächter erscheinen nur, wenn sie konfiguriert sind,
   * und leuchten mit, wenn sie eingeschaltet sind.
   */
  _actions(m, og) {
    const btn = (id, icon, key, on) => `
      <div class="act${on ? ' on' : ''}" data-act="${id}">
        <ha-icon icon="${icon}"></ha-icon
        ><span class="lg">${esc(t(key))}</span
        ><span class="sm">${esc(t(key + 'Short'))}</span>
      </div>`;
    const reihe = (inner) => `<div class="acts">${inner}</div>`;

    if (og.domain === 'light') {
      return reihe(btn('allon', 'mdi:lightbulb-on', 'turnAllOn')
        + btn('alloff', 'mdi:lightbulb-off', 'turnAllOff'));
    }
    if (og.domain === 'cover') {
      let out = reihe(btn('up', 'mdi:arrow-up', 'coversUp')
        + btn('down', 'mdi:arrow-down', 'coversDown'));
      const zwei = [];
      if (m.auto) zwei.push(btn('auto', 'mdi:calendar-clock', 'coverAuto', m.auto.on));
      if (m.wind) zwei.push(btn('wind', 'mdi:weather-windy', 'coverWind', m.wind.on));
      if (zwei.length) out += reihe(zwei.join(''));
      return out;
    }
    if (og.domain === 'media_player') {
      return reihe(btn('alloff', 'mdi:music-note-off', 'turnAllOff'));
    }
    return '';
  }

  _html(m) {
    // Warm wird die Karte, wenn im Raum etwas läuft. Geschlossene Storen
    // sind kein Betrieb — sonst leuchtete nachts jede Karte auf.
    const anyOn = m.groups.some((g) => g.domain !== 'cover' && g.meldeCount > 0);

    const buttons = m.groups.map((g) => `
      <div class="gbtn ${g.meldeCount ? 'on' : ''} ${m.open === g.domain ? 'armed' : ''}"
           data-grp="${g.domain}">
        <ha-icon icon="${GROUPS[g.domain].icon}"></ha-icon>
      </div>`).join('');

    let panel = '';
    const og = m.groups.find((g) => g.domain === m.open);
    if (og) {
      // Trägt auch nur eine Store einen Stern, halten die anderen den Platz
      // frei — sonst stünden die Prozentzahlen in der Liste versetzt.
      const platzFuerStern = og.items.some((i) => i.fav != null);
      const rows = og.items.map((it) => {
        const pct = it.dim && it.pct > 0 ? it.pct : 0;
        return `
        <div class="lrow ${it.dead ? 'dead' : ''} ${!it.on && !it.dead ? 'off' : ''}"
             data-ent="${esc(it.id)}" data-dom="${og.domain}"${
               it.glow ? ` style="--acc:${esc(it.glow)};--btn:${esc(it.glow)}"` : ''}>
          <div class="lfill" style="width:${pct}%"></div>
          <div class="lico ${it.on ? 'grad' : ''}"><ha-icon icon="${esc(it.icon)}"></ha-icon></div>
          <div class="lname">${esc(it.name)}</div>
          <div class="lval">${esc(this._rowText(it, og.domain))}</div>
          ${it.fav == null ? (platzFuerStern ? '<div class="fav leer"></div>' : '') : `<div class="fav${
            favErreicht(it) ? ' set' : ''}"
               data-fav="${esc(it.id)}" title="${esc(favTitel(it.fav))}">
            <ha-icon icon="mdi:star"></ha-icon>
          </div>`}
        </div>`;
      }).join('');

      panel = `
      <div class="divide"></div>
      <div class="grp">
        <span>${esc(t('inRoom', { g: t('group.' + og.domain) }))}</span>
        <b>${esc(t(og.domain === 'cover' ? 'nOfMShut' : 'nOfMOn',
                     { n: og.meldeCount, m: og.items.length }))}</b>
      </div>
      <div class="rows">${rows}</div>
      ${this._actions(m, og)}`;
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
      <div class="ctl">${buttons}</div>
      ${panel}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;

    // Der Weg auf die Raumseite liegt auf der Kopfzeile — ein eigener
    // Knopf dafür war einer zu viel.
    const head = root.getElementById('head');
    if (head) {
      this._press(head, {
        onTap: () => { if (m.path) navigate(this, m.path); },
        onHold: () => { this._open = null; this._repaint(); }
      });
    }

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

    // Der Stern liegt in der Zeile, die selbst auf Tippen und Ziehen hört.
    // Damit ein Griff auf den Stern nicht auch die Zeile bewegt, hält er
    // die Ereignisse bei sich.
    root.querySelectorAll('.fav[data-fav]').forEach((knopf) => {
      const og = m.groups.find((g) => g.domain === 'cover');
      const it = og && og.items.find((x) => x.id === knopf.dataset.fav);
      if (!it) return;
      ['pointerdown', 'pointerup', 'click'].forEach((art) =>
        knopf.addEventListener(art, (ev) => ev.stopPropagation()));
      this._press(knopf, { onTap: () => this._favorite(it) });
    });

    root.querySelectorAll('.lrow').forEach((row) => {
      const id = row.dataset.ent;
      const domain = row.dataset.dom;
      const fill = row.querySelector('.lfill');
      const val = row.querySelector('.lval');
      const og = m.groups.find((g) => g.domain === domain);
      const it = og && og.items.find((x) => x.id === id);
      const canDrag = !!(it && it.dim);

      this._press(row, {
        axis: 'x',
        onTap: () => this._toggleOne(id, domain),
        onHold: () => fireMoreInfo(this, id),
        onDrag: canDrag ? (pct) => {
          fill.style.width = pct + '%';
          val.textContent = domain === 'cover' ? t('pctOpen', { n: pct }) : `${pct} %`;
        } : null,
        onDrop: canDrag ? (pct) => {
          if (domain === 'cover') {
            this.call('cover', 'set_cover_position', { entity_id: id, position: pct });
          } else if (pct <= 0) {
            this.call('light', 'turn_off', { entity_id: id });
          } else {
            this.call('light', 'turn_on', { entity_id: id, brightness_pct: pct });
          }
        } : null
      });
    });

    root.querySelectorAll('.act[data-act]').forEach((el) => {
      const was = el.dataset.act;
      const grp = m.groups.find((g) => g.domain === m.open);
      this._press(el, { onTap: () => this._doAction(was, grp, m) });
    });
  }

  /** Ein Knopf unter den Zeilen */
  _doAction(was, grp, m) {
    if (was === 'alloff') { this._allOff(grp); return; }
    if (was === 'allon') { this._allOn(grp); return; }
    if (!grp) return;
    const ids = grp.items.map((i) => i.id);
    if (was === 'up') { this.call('cover', 'open_cover', { entity_id: ids }); return; }
    if (was === 'down') { this.call('cover', 'close_cover', { entity_id: ids }); return; }
    const flag = was === 'auto' ? m.auto : was === 'wind' ? m.wind : null;
    if (flag) this._toggleFlag(flag);
  }

  /**
   * Automatik und Windwächter können Hilfsschalter, echte Schalter oder
   * Automationen sein. `homeassistant.toggle` kennt sie alle.
   */
  _toggleFlag(flag) {
    if (!flag || flag.dead) return;
    this.call('homeassistant', 'toggle', { entity_id: flag.id });
  }

  _toggleOne(id, domain) {
    const own = id.split('.')[0];
    if (own === 'climate') { fireMoreInfo(this, id); return; }
    if (own === 'media_player') { this.call('media_player', 'media_play_pause', { entity_id: id }); return; }
    if (own === 'cover') {
      const st = this._hass.states[id];
      this.call('cover', isOn(st) ? 'close_cover' : 'open_cover', { entity_id: id });
      return;
    }
    // light, switch, input_boolean — jede Domäne kennt ihr eigenes toggle
    this.call(own, 'toggle', { entity_id: id });
  }

  /**
   * Auf die Wunschposition fahren. Bei `stop` ist der Knopf die my-Taste
   * der Fernbedienung: Home Assistant schickt nur ein Halt, und der Antrieb
   * selbst weiss, wohin er dann fährt.
   */
  _favorite(it) {
    if (it.fav == null) return;
    if (it.fav === 'stop') {
      this.call('cover', 'stop_cover', { entity_id: it.id });
      return;
    }
    // Beides auf einmal, so wie es eine Szene in Home Assistant auch tut.
    if (it.fav.position != null) {
      this.call('cover', 'set_cover_position',
        { entity_id: it.id, position: it.fav.position });
    }
    if (it.fav.tilt != null) {
      this.call('cover', 'set_cover_tilt_position',
        { entity_id: it.id, tilt_position: it.fav.tilt });
    }
  }

  _toggleGroup(grp) {
    if (!grp) return;
    const ids = grp.items.map((i) => i.id);
    if (grp.domain === 'light') {
      // Die Liste darf Lampen und Schalter mischen — homeassistant.turn_on
      // schickt jede Entität an ihre eigene Domäne weiter.
      this.call('homeassistant', grp.onCount ? 'turn_off' : 'turn_on', { entity_id: ids });
    } else if (grp.domain === 'media_player') {
      this.call('media_player', 'media_play_pause', { entity_id: ids });
    } else if (grp.domain === 'cover') {
      this.call('cover', grp.onCount ? 'close_cover' : 'open_cover', { entity_id: ids });
    } else {
      fireMoreInfo(this, ids[0]);
    }
  }

  _allOn(grp) {
    if (!grp || grp.domain !== 'light') return;
    this.call('homeassistant', 'turn_on', { entity_id: grp.items.map((i) => i.id) });
  }

  _allOff(grp) {
    if (!grp) return;
    const ids = grp.items.map((i) => i.id);
    if (grp.domain === 'light') this.call('homeassistant', 'turn_off', { entity_id: ids });
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
      // Steuert die Kachel eine Lampe, die ihre Farbe kennt, glüht der
      // Knopf in dieser Farbe statt in der Palette der Karte.
      glow: this._config.entity.startsWith('light.') ? lightGlow(st) : null,
      domain: this._config.entity.split('.')[0]
    };
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const on = !m.dead && m.pct > 0;
    const glow = m.glow ? `--btn:${m.glow}` : '';
    const styled = glow
      ? (style ? style.replace(/"$/, ';' + glow + '"') : ` style="${glow}"`)
      : style;
    return `
    <ha-card class="${cls.trim()}"${styled}>
      <div class="sl${on ? ' on' : ''}${m.dead ? ' dead' : ''}" id="sl">
        <div class="fill" style="height:${m.pct}%"></div>
        <div class="pct" id="pct">${m.dead ? '–' : m.pct + ' %'}</div>
        <div class="sico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
      </div>
      ${this._config.show_name === false ? '' : `<div class="nm">${esc(m.name)}</div>`}
    </ha-card>`;
  }

  _bind(m) {
    const sl = this.shadowRoot.getElementById('sl');
    const fill = sl.querySelector('.fill');
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
const KNOB_POS = (v) => `calc((100% - 15px) * ${v} / 100)`;
const KNOB_FILL = (v) => `calc(7.5px + (100% - 15px) * ${v} / 100)`;

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
    /* Ein Ring statt eines Klotzes: die Schiene läuft sichtbar hindurch,
       man sieht also, worauf man steht. */
    .lam-track .knob{ position:absolute; width:15px; height:15px; border-radius:50%;
                      background:none; border:2.5px solid #fff;
                      box-shadow:0 2px 7px rgba(0,0,0,.5),
                                 inset 0 0 0 1px rgba(0,0,0,.25); }

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

/**
 * Die Farbe eines Chips. Sie kommt aus der Domäne, bei Schloss, Alarm und
 * Klima aus dem Zustand, und wird von einem `color:` in der Aktion
 * überschrieben. Kommt nichts heraus, gilt die Farbe der Karte.
 */
const ACT_TINT = {
  light: '#f0b429', cover: '#4fb0f0', media_player: '#c3a8f5',
  vacuum: '#9b7bf5', fan: '#7fe0ab', camera: '#8ad2f2',
  humidifier: '#8ad2f2', valve: '#4fb0f0', water_heater: '#f0913c'
};

/** Die Palettennamen als Einzelfarbe — für `color:` an einer Aktion */
const PAL_HEX = {
  blau: '#2fa8f0', gruen: '#2fc48a', gelb: '#e8c34a', orange: '#f0913c',
  rot: '#ef5f68', violett: '#9b7bf5', rosa: '#ef6bb0'
};

function actionTint(st, domain, want) {
  if (want) {
    const s = String(want);
    if (s.charAt(0) === '#') return s;
    return PAL_HEX[PALETTES[s.toLowerCase()]] || null;
  }
  if (!st) return null;
  if (domain === 'alarm_control_panel') {
    return st.state === 'disarmed' ? '#7fe0ab' : '#ef5f68';
  }
  if (domain === 'lock') {
    return st.state === 'locked' ? '#7fe0ab'
      : st.state === 'jammed' ? '#ef5f68' : '#f0913c';
  }
  if (domain === 'climate') {
    const a = st.attributes.hvac_action;
    if (a === 'cooling') return '#8ad2f2';
    if (a === 'heating') return '#f0913c';
    return null;
  }
  return ACT_TINT[domain] || null;
}

/**
 * Ist eine Aktion "aktiv"? Für Schalter und Skripte heisst das schlicht
 * "an". Ein Alarm ist aktiv, wenn er nicht unscharf ist, ein Schloss,
 * wenn es nicht verriegelt ist — sonst blieben ausgerechnet die Chips
 * grau, bei denen es darauf ankommt.
 */
function actionOn(st, domain) {
  if (!st) return false;
  if (domain === 'alarm_control_panel') return st.state !== 'disarmed';
  if (domain === 'lock') return st.state !== 'locked';
  return isOn(st);
}

/** Die vier Bauarten der Chips */
const CHIP_STYLES = ['icon', 'fill', 'ring', 'detail'];

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

    /* Chips: runde Pillen. Jede Aktion bringt ihre eigene Farbe mit —
       sie steckt in --t. Was daraus wird, entscheidet chip_style. */
    .chips{ display:flex; flex-wrap:wrap; gap:9px; }
    .chip{ display:flex; align-items:center; gap:8px; height:38px; padding:0 14px 0 8px;
           border-radius:99px; font-size:12.5px; font-weight:600; color:#dbe6f0;
           cursor:pointer; white-space:nowrap; min-width:0;
           background:rgba(255,255,255,.055);
           border:1px solid rgba(255,255,255,.09);
           transition:transform .12s ease, background .18s ease, box-shadow .18s ease; }
    .chip .ci{ width:24px; height:24px; border-radius:50%; display:grid; place-items:center;
               flex:none; --mdc-icon-size:17px; color:var(--t);
               background:color-mix(in srgb, var(--t) 20%, transparent); }
    .chip.off{ color:#7f8f9d; }
    .chip.off .ci{ background:rgba(255,255,255,.06); color:#61707d; }
    .chip.dead{ opacity:.42; }
    .chip.held{ transform:scale(.96); }
    .chip.run .ci{ animation:onyxpulse 1.1s ease-in-out infinite; }

    /* fill — was läuft, färbt sich ganz */
    .chips.fill .chip.on{ color:#fff;
      background:color-mix(in srgb, var(--t) 42%, transparent);
      border-color:color-mix(in srgb, var(--t) 70%, transparent); }
    .chips.fill .chip.on .ci{ background:rgba(255,255,255,.24); color:#fff; }

    /* ring — ein Rand statt einer Füllung */
    .chips.ring .chip.on{
      border-color:color-mix(in srgb, var(--t) 75%, transparent);
      box-shadow:0 0 0 1px color-mix(in srgb, var(--t) 45%, transparent),
                 0 0 18px color-mix(in srgb, var(--t) 22%, transparent); }

    /* detail — zwei Zeilen im Chip */
    .chips.detail .chip{ height:48px; padding:0 15px 0 9px; gap:10px; }
    .chips.detail .chip .ci{ width:30px; height:30px; --mdc-icon-size:18px; }
    .chips.detail .tx{ display:flex; flex-direction:column; line-height:1.2; min-width:0; }
    .chips.detail .tx b{ font-size:12.5px; font-weight:600; }
    .chips.detail .tx i{ font-size:10.5px; font-style:normal; color:#6f8497; }
    .chips.detail .chip.on{ border-color:color-mix(in srgb, var(--t) 60%, transparent); }
    .chips.detail .chip.on .tx i{ color:var(--t); }

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
      type: 'custom:onyx-actions-card', title: t('quick'),
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
    const on = !dead && actionOn(st, domain);

    // Untertitel für die Kachelform
    let sub = '';
    if (dead) sub = t('unavailable');
    else if (domain === 'automation') sub = t(on ? 'armed' : 'disabled');
    else if (domain === 'script') sub = t(on ? 'running' : 'ready');
    else if (domain === 'scene') {
      const ts = Date.parse(st.state);
      sub = isNaN(ts) ? t('scene') : t('lastRun', { time: fmtTime(new Date(ts)) });
    } else if (domain === 'cover') {
      const pct = pctOf(st);
      sub = pct > 0 && pct < 100 ? t('pctOpen', { n: pct })
        : t(pct >= 100 ? 'open' : 'closed');
    } else if (domain === 'lock') {
      sub = t('lk.' + (st.state === 'jammed' ? 'jammed'
        : st.state === 'locked' ? 'locked' : 'unlocked'));
    } else if (domain === 'alarm_control_panel') {
      sub = t(on ? 'armed' : 'disabled');
    } else sub = t(on ? 'on' : 'off');

    return {
      id, domain, kind, on, dead, sub,
      tint: actionTint(st, domain, cfg.color),
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
      chipStyle: CHIP_STYLES.includes(cfg.chip_style) ? cfg.chip_style : 'icon',
      columns: cfg.columns || 4,
      color: cfg.color || null,
      groups,
      flash: this._flash || null
    };
  }

  _item(it, shape, flash, chipStyle) {
    const flashing = flash === it.id;
    const icon = flashing ? 'mdi:check' : it.icon;
    const cls = [
      it.dead ? 'dead' : '',
      it.running ? 'run' : '',
      flashing || it.running || (it.kind === 'switch' && it.on) ? 'on' : '',
      it.kind === 'switch' && !it.on && !it.dead ? 'off' : ''
    ].join(' ');

    if (shape === 'chips') {
      const body = chipStyle === 'detail'
        ? `<span class="tx"><b>${esc(it.name)}</b><i>${esc(it.sub)}</i></span>`
        : esc(it.name);
      return `<div class="chip ${cls}" data-e="${esc(it.id)}"
           style="--t:${esc(it.tint || 'var(--btn)')}">
        <span class="ci"><ha-icon icon="${esc(icon)}"></ha-icon></span>${body}</div>`;
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
      if (shape === 'chips') return `<div class="chips ${m.chipStyle}">`;
      if (shape === 'rail') return '<div class="rail">';
      if (shape === 'tiles') return `<div class="grid" style="grid-template-columns:repeat(${Math.min(cols, 2)},1fr)">`;
      return `<div class="grid" style="grid-template-columns:repeat(${cols},1fr)">`;
    };

    const body = m.groups.map((g, i) => `
      ${i > 0 ? '<div class="fsep"></div>' : ''}
      ${g.label ? `<div class="flabel">${esc(g.label)}</div>` : ''}
      ${wrapOpen(m.shape, m.columns)}
        ${g.items.map((it) => this._item(it, m.shape, m.flash, m.chipStyle)).join('')}
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
      return 1 + rows * (m.shape === 'chips' ? (m.chipStyle === 'detail' ? 2 : 1) : 2);
    } catch (e) { return 3; }
  }
}

/* ================================================================== *
 * 6) DIAGRAMM-KARTE
 * ================================================================== */

const PERIODS = {
  tag:   { stat: null,    ticks: 'time' },
  woche: { stat: 'hour',  ticks: 'day' },
  monat: { stat: 'day',   ticks: 'date' },
  jahr:  { stat: 'month', ticks: 'month' }
};

/**
 * Der Anfang des Zeitraums — im Kalender verankert, nicht von jetzt
 * rückwärts gezählt. "Tag" heisst heute ab Mitternacht, nicht die letzten
 * vierundzwanzig Stunden; sonst stünde um 10 Uhr die halbe gestrige Nacht
 * im Bild, und der Wert "heute" der Energie-Karte passte nicht dazu.
 */
function periodStart(period, hass) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'woche') {
    // Home Assistant kennt den ersten Wochentag; wo es ihn nicht sagt,
    // gilt Montag — das ist hierzulande der Normalfall.
    const erst = hass && hass.locale && hass.locale.first_weekday;
    const sonntag = erst === 'sunday';
    const wd = d.getDay();                       // 0 = Sonntag
    d.setDate(d.getDate() - (sonntag ? wd : (wd + 6) % 7));
  } else if (period === 'monat') {
    d.setDate(1);
  } else if (period === 'jahr') {
    d.setMonth(0, 1);
  }
  return d;
}
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

/**
 * Die Farben der Reihen. Die erste läuft in der Kartenfarbe, die weiteren
 * bekommen feste, gut unterscheidbare Töne. Am Eintrag darf `color:` stehen.
 */
const CH_FARBEN = ['#2fc48a', '#9b7bf5', '#ef6bb0'];
function chFarbe(entry, i) {
  const eigen = entry && entry.color;
  if (eigen) {
    const name = PALETTES[String(eigen).toLowerCase()];
    return name ? PAL_HEX[name] : String(eigen);
  }
  return i === 0 ? 'var(--acc)' : CH_FARBEN[(i - 1) % CH_FARBEN.length];
}

/**
 * Welcher Sensor für welchen Zeitraum. Eine Momentanleistung in Watt taugt
 * übers Jahr nichts, ein Zählerstand in Kilowattstunden dagegen schon —
 * deshalb darf jeder Eintrag je Zeitraum eine eigene Entität nennen.
 * Ohne Angabe gilt `entity`.
 */
const CH_PERIOD_KEYS = {
  tag:   ['tag', 'day'],
  woche: ['woche', 'week'],
  monat: ['monat', 'month'],
  jahr:  ['jahr', 'year']
};
function chEntity(entry, period) {
  for (const k of (CH_PERIOD_KEYS[period] || [])) {
    if (entry && entry[k]) return String(entry[k]);
  }
  return entry ? entry.entity : '';
}

/** Je mehr Linien, desto höher das Diagramm — sonst verdeckt die Blase alles */
const CH_HOEHE = [96, 96, 124, 150, 176];

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
    /* Der Punkt sagt, welche Linie zu welcher Zahl gehört */
    .v{ display:flex; align-items:center; gap:6px; justify-content:flex-end; }
    .v .dot{ width:7px; height:7px; border-radius:50%; flex:none; }
    /* Ein Wert ohne Linie hält den Platz, bleibt aber unbemalt */
    .v .dot.leer{ background:none; box-shadow:inset 0 0 0 1px rgba(255,255,255,.18); }
    .v .stapel{ display:flex; flex-direction:column; align-items:flex-end; }

    /* pan-y: senkrechtes Scrollen bleibt beim Browser, waagrechtes Ziehen
       gehört uns — so lässt sich am Telefon über die Kurve fahren. */
    .chart{ position:relative; touch-action:pan-y; }
    svg{ display:block; width:100%; height:96px; overflow:visible; }
    svg.ov{ position:absolute; left:0; top:0; right:0; pointer-events:none; }
    /* Die Punkte auf den Kurven sind HTML, nicht SVG: das Diagramm wird
       ungleichmässig gestreckt, ein <circle> darin wäre ein Ei. */
    .pts{ position:absolute; left:0; right:0; top:0; pointer-events:none; }
    .pts i{ position:absolute; width:9px; height:9px; border-radius:50%;
            transform:translate(-50%,-50%); box-shadow:0 0 0 2px rgba(12,14,18,.85); }

    /* Die Blase beim Fahren über den Graphen */
    .blase{ position:absolute; z-index:3; top:2px; transform:translateX(-50%);
            background:rgba(20,22,28,.92); border:1px solid rgba(255,255,255,.10);
            border-radius:11px; padding:6px 8px; pointer-events:none; white-space:nowrap;
            box-shadow:0 8px 24px rgba(0,0,0,.5); }
    .blase[hidden]{ display:none; }
    .blase .zeit{ font-size:10px; line-height:13px; color:#8fa3b5; margin-bottom:2px; }
    .blase .r{ display:flex; align-items:center; gap:5px; font-size:11px; color:#dbe6f0;
               line-height:15px; font-variant-numeric:tabular-nums; }
    .blase .r i{ width:6px; height:6px; border-radius:50%; flex:none; }
    .blase .r b{ font-weight:600; margin-left:auto; padding-left:11px; }
    /* Die Y-Achse gehört der geführten Reihe — jede Reihe hat ihre eigene
       Skala, eine gemeinsame Achse gäbe es also gar nicht. */
    .yax{ position:absolute; left:0; top:0; right:0; pointer-events:none; }
    .yax span{ position:absolute; left:0; transform:translateY(-50%);
               font-size:9.5px; line-height:12px; color:#6b7a89;
               font-variant-numeric:tabular-nums; white-space:nowrap;
               padding:0 4px; border-radius:5px; background:rgba(12,14,18,.55); }
    .yax i{ position:absolute; left:0; right:0; height:0;
            border-top:1px dashed rgba(255,255,255,.07); }
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

  /**
   * Wie viele Linien gezeichnet werden. `all` (Vorgabe) heisst alle, eine
   * Zahl heisst: die gewählte Reihe und die folgenden der Liste, umlaufend.
   * So bleibt bei `graphs: 1` jede Reihe durch Antippen erreichbar.
   */
  _graphCount() {
    const roh = this._config.graphs;
    if (roh == null || roh === '') return null;
    const wort = String(roh).toLowerCase();
    if (wort === 'all' || wort === 'alle') return null;
    const n = Number(roh);
    if (isNaN(n) || n < 1) return null;
    return Math.min(Math.round(n), 4);
  }

  setConfig(config) {
    const list = normList(config.entities);
    if (!list || !list.length) throw new Error(t('err.needEntities'));
    if (list.length > 4) throw new Error(t('err.tooMany'));
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

  /** Die Entitäten, wie sie für den gerade gewählten Zeitraum gelten */
  _ids() { return this._list().map((e) => chEntity(e, this._period)); }

  _key() { return this._ids().join('|') + '@' + this._period; }

  /** Verlauf holen: kurzer Zeitraum aus der Historie, längere aus den Statistiken */
  async _maybeFetch(force) {
    if (!this._hass || !this._config) return;
    const key = this._key();
    if (!force && this._fetchedKey === key && Date.now() - (this._fetchedAt || 0) < 120000) return;
    if (this._fetching === key) return;
    this._fetching = key;

    const def = PERIODS[this._period];
    const end = new Date();
    const start = periodStart(this._period, this._hass);
    const ids = this._ids();

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
      const id = chEntity(e, this._period);
      const st = hass.states[id];
      const raw = st ? parseFloat(st.state) : NaN;
      const pts = (this._series && this._series[id]) || [];
      return {
        id, i,
        color: chFarbe(e, i),
        name: e.name || nameOf(hass, id),
        unit: e.unit || (st && st.attributes.unit_of_measurement) || '',
        value: isNaN(raw) ? null : raw,
        dead: isDead(st),
        n: pts.length,
        last: pts.length ? pts[pts.length - 1].v : null
      };
    });
    const sel = Math.min(this._sel, items.length - 1);
    const wieViele = this._graphCount();
    const gezeichnet = wieViele == null
      ? items.map((_, i) => i)
      : Array.from({ length: Math.min(wieViele, items.length) },
          (_, k) => (sel + k) % items.length);
    return {
      title: this._config.title || null,
      label: this._config.label || t('history'),
      icon: this._config.icon || 'mdi:chart-line',
      color: this._config.color || null,
      tinted: this._config.tinted === true,
      period: this._period,
      items, sel, gezeichnet,
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

  /**
   * Alle Reihen in einem Bild. Jede wird auf ihre eigene Spanne skaliert —
   * Watt neben Grad auf einer gemeinsamen Achse wäre unlesbar. Die Zeitachse
   * teilen sich alle, damit der Zeiger überall dieselbe Stunde meint.
   */
  _chart(m) {
    this._geo = null;
    if (m.error) return `<div class="empty">${esc(m.error)}</div>`;

    // Nur die rohe Historie wird zusammengefasst und geglättet — sie
    // liefert Hunderte zappelnder Punkte. Langzeitstatistiken sind bereits
    // gemittelt; die bleiben unangetastet, sonst würden aus gemessenen
    // Monatswerten weichgezeichnete Näherungen.
    const reihen = m.items.map((it) => {
      const roh = (this._series && this._series[it.id]) || [];
      return roh.length > 48 ? soften(resample(roh, 48)) : roh;
    });
    const voll = reihen.filter((r, i) => r.length >= 2 && m.gezeichnet.includes(i));
    if (!voll.length) return `<div class="empty">${esc(t('noHistory'))}</div>`;

    const W = 100, H = 40, pad = 1.5;
    const t0 = Math.min(...voll.map((r) => r[0].t));
    const t1 = Math.max(...voll.map((r) => r[r.length - 1].t));
    const spanne = t1 - t0 || 1;

    // Flächen sind der Normalfall; `fill: false` lässt nur die Linien stehen.
    // Je mehr Flächen übereinander liegen, desto blasser jede einzelne —
    // sonst wird aus vier Verläufen ein Brei.
    const fuellen = this._config.fill !== false;
    const wieViele = m.gezeichnet.length;
    const staerke = wieViele <= 1 ? 0.38 : wieViele === 2 ? 0.28 : 0.20;

    const geo = [];
    const defs = [], flaechen = [], linien = [], vorne = [];
    m.items.forEach((it, i) => {
      const pts = reihen[i];
      if (pts.length < 2 || !m.gezeichnet.includes(i)) { geo.push(null); return; }
      let lo = Math.min(...pts.map((p) => p.v)), hi = Math.max(...pts.map((p) => p.v));
      if (hi === lo) { hi = lo + 1; lo -= 1; }
      const sp = hi - lo;
      lo -= sp * 0.12; hi += sp * 0.12;
      const xy = pts.map((p) => [
        ((p.t - t0) / spanne) * W,
        H - pad - ((p.v - lo) / (hi - lo)) * (H - pad * 2)
      ]);
      geo.push({ pts, xy, lo, hi });
      const d = smoothPath(xy);
      const fuehrt = i === m.sel;
      if (fuellen) {
        // Die geführte Reihe darf etwas kräftiger sein als ihre Begleiter
        const oben = (fuehrt ? staerke : staerke * 0.7).toFixed(3);
        defs.push(`<linearGradient id="ch${i}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${it.color}" stop-opacity="${oben}"/>
          <stop offset="100%" stop-color="${it.color}" stop-opacity="0"/>
        </linearGradient>`);
        flaechen.push(`<path d="${d} L${W} ${H} L0 ${H} Z" fill="url(#ch${i})"/>`);
      }
      // Erst alle Flächen, dann die Linien, die geführte zuoberst
      (fuehrt ? vorne : linien).push(`<path d="${d}" fill="none" stroke="${it.color}"
        stroke-width="${fuehrt ? 2 : 1.3}" opacity="${fuehrt ? 1 : 0.75}"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>`);
    });

    const hoehe = CH_HOEHE[Math.min(geo.filter(Boolean).length, 4)];
    this._geo = { t0, t1, reihen: geo };
    const ticks = this._tickLabels(t0, t1);
    const yachse = this._yAxis(m, geo, H, pad, hoehe);

    return `
    <div class="chart" id="chart">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${hoehe}px"
           aria-hidden="true">
        <defs>${defs.join('')}</defs>
        <line x1="50" y1="0" x2="50" y2="${H}" stroke="rgba(255,255,255,.06)"
              stroke-width=".4" stroke-dasharray="1 2"/>
        ${flaechen.join('')}${linien.join('')}${vorne.join('')}
      </svg>
      <svg class="ov" id="ov" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
           style="height:${hoehe}px" aria-hidden="true"></svg>
      ${yachse}
      <div class="pts" id="pts" style="height:${hoehe}px"></div>
      <div class="blase" id="blase" hidden></div>
      <div class="axis">${ticks.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
    </div>`;
  }

  /**
   * Die Beschriftung am linken Rand. Sie gehört der geführten Reihe: weil
   * jede Reihe auf ihre eigene Spanne gestreckt wird, gäbe es eine für alle
   * gültige Achse gar nicht. Angeschrieben werden der höchste und der
   * niedrigste gemessene Wert, dazu die Mitte dazwischen.
   */
  _yAxis(m, geo, H, pad, hoehe) {
    if (this._config.y_axis === false) return '';
    const g = geo[m.sel] || geo.find(Boolean);
    if (!g) return '';
    const it = m.items[geo.indexOf(g)] || m.items[m.sel];
    let min = Infinity, max = -Infinity;
    for (const p of g.pts) { if (p.v < min) min = p.v; if (p.v > max) max = p.v; }
    if (!isFinite(min) || !isFinite(max)) return '';

    // Von Wert zu Bildpunkt — dieselbe Rechnung wie bei der Kurve. Die
    // Beschriftung wird dabei ins Bild gezogen: der höchste Messwert sitzt
    // ganz oben, und eine halbe Zeile davon stünde sonst über dem Rand.
    const roh = (v) => (H - pad - ((v - g.lo) / (g.hi - g.lo)) * (H - pad * 2)) / H * hoehe;
    const y = (v) => clamp(roh(v), 7, Math.max(7, hoehe - 7));
    const einheit = it && it.unit ? ' ' + it.unit : '';
    const marken = max === min ? [max] : [max, (max + min) / 2, min];

    return `<div class="yax" style="height:${hoehe}px">${marken.map((v) => `
      <i style="top:${roh(v).toFixed(1)}px"></i>
      <span style="top:${y(v).toFixed(1)}px">${esc(nfmt(v))}${esc(einheit)}</span>`).join('')}</div>`;
  }

  /** Die Zeit unter dem Zeiger, so genau wie der Zeitraum es hergibt */
  _zeitText(ms) {
    const d = new Date(ms);
    if (this._period === 'tag' || this._period === 'woche') {
      return `${fmtDate(d, { weekday: 'short' })}, ${fmtTime(d)}`;
    }
    if (this._period === 'monat') return fmtDate(d, { day: '2-digit', month: 'long' });
    return fmtDate(d, { month: 'long', year: 'numeric' });
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    // Der Farbpunkt sagt, welcher Wert im Bild eine Linie hat. Bei einer
    // einzigen Reihe erklärt er nichts und bleibt weg.
    const punkte = m.items.length > 1;
    const vals = m.items.map((it) => `
      <div class="v ${it.i === m.sel ? 'sel' : ''}" data-i="${it.i}">
        ${punkte && m.gezeichnet.includes(it.i)
          ? `<span class="dot" style="background:${it.color}"></span>`
          : (punkte ? '<span class="dot leer"></span>' : '')}
        <div class="stapel">
          <div><span class="n">${it.dead ? '–' : esc(nfmt(it.value))}</span><span class="u">${esc(it.unit)}</span></div>
          <div class="cap">${esc(it.name)}</div>
        </div>
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

    const chart = root.getElementById('chart');
    if (chart && this._geo) this._scrub(chart, m);
  }

  /**
   * Über den Graphen fahren: senkrechte Linie, ein Punkt je Reihe und eine
   * Blase mit allen Werten zu dieser Zeit. Am Telefon ist es Ziehen, am
   * Rechner das blosse Darüberfahren.
   */
  _scrub(box, m) {
    const root = this.shadowRoot;
    const ov = root.getElementById('ov');
    const pts = root.getElementById('pts');
    const blase = root.getElementById('blase');
    if (!ov || !pts || !blase) return;
    const geo = this._geo;
    let zieht = false;

    const aus = () => {
      zieht = false;
      ov.textContent = '';
      pts.textContent = '';
      blase.hidden = true;
      // Die Sperre wieder lösen: Neuaufbauten sind während des Fahrens
      // gesperrt, damit die Blase nicht bei jedem Zustandswechsel im Haus
      // verschwindet. Bliebe sie stehen, fröre die Karte ein.
      if (this._busy) { this._busy = false; this._tryRender(); }
    };

    const an = (ev) => {
      const r = box.getBoundingClientRect();
      if (!r.width) return;
      const x = clamp((ev.clientX - r.left) / r.width, 0, 1);
      const zeit = geo.t0 + x * (geo.t1 - geo.t0);

      const marken = [], zeilen = [];
      geo.reihen.forEach((g, i) => {
        if (!g) return;
        let k = 0, naechste = Infinity;
        for (let j = 0; j < g.pts.length; j++) {
          const d = Math.abs(g.pts[j].t - zeit);
          if (d < naechste) { naechste = d; k = j; }
        }
        const it = m.items[i];
        marken.push(`<i style="left:${g.xy[k][0].toFixed(2)}%;
          top:${(g.xy[k][1] / 40 * 100).toFixed(2)}%; background:${it.color}"></i>`);
        zeilen.push(`<div class="r"><i style="background:${it.color}"></i>
          <span>${esc(it.name)}</span>
          <b>${esc(nfmt(g.pts[k].v))}${it.unit ? ' ' + esc(it.unit) : ''}</b></div>`);
      });
      if (!zeilen.length) return;

      const px = (x * 100).toFixed(2);
      ov.innerHTML = `<line x1="${px}" y1="0" x2="${px}" y2="40"
        stroke="rgba(255,255,255,.22)" stroke-width=".5" stroke-dasharray="1.5 1.5"
        vector-effect="non-scaling-stroke"/>`;
      pts.innerHTML = marken.join('');
      blase.innerHTML = `<div class="zeit">${esc(this._zeitText(zeit))}</div>${zeilen.join('')}`;
      blase.hidden = false;
      // Die Blase bleibt in der Karte, auch am Rand
      const halb = blase.offsetWidth / 2;
      blase.style.left =
        clamp(x * r.width, halb + 2, Math.max(halb + 2, r.width - halb - 2)) + 'px';
      this._busy = true;
    };

    box.addEventListener('pointerdown', (ev) => {
      if (ev.button != null && ev.button > 0) return;
      zieht = true;
      an(ev);
    });
    box.addEventListener('pointermove', (ev) => {
      if (zieht || ev.pointerType === 'mouse') an(ev);
    });
    box.addEventListener('pointerup', aus);
    box.addEventListener('pointercancel', aus);
    box.addEventListener('pointerleave', aus);
  }

  getCardSize() {
    try { return 3 + Math.min(this._list().length, 4); } catch (e) { return 4; }
  }
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
      box-shadow:none; container-type:inline-size;
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
    .hint{ font-size:10px; color:#4f5c69; margin-left:10px; text-align:right; }
    /* Auf einer schmalen Karte — halbe Spalte, Kartenwähler — hat der
       Hinweis keinen Platz mehr neben der Pille. Dann schweigt er. */
    @container (max-width: 290px){ .hint{ display:none; } }
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

/**
 * Farbton und Sättigung, wie Home Assistant sie in `hs_color` führt:
 * Farbton in Grad, Sättigung in Prozent. Nur als Rückfall gedacht —
 * meldet die Lampe `hs_color`, gilt das.
 */
function rgbToHs(rgb) {
  const [r, g, b] = rgb.map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, mx ? (d / mx) * 100 : 0];
}

/**
 * Die Farbe, in der eine eingeschaltete Lampe glüht — oder null, wenn sie
 * nichts über ihre Farbe weiss. Absichtlich der kräftige Ton aus ltTint
 * und nicht die rohe Farbe: der Knopf soll auf dunklem Grund noch etwas
 * hermachen, auch wenn die Lampe fast weiss leuchtet.
 */
function lightGlow(st) {
  if (!st || st.state !== 'on') return null;
  const a = st.attributes;
  const kelvin = a.color_temp_kelvin || null;
  if (!a.rgb_color && !kelvin) return null;
  return ltTint(a.rgb_color || null, kelvin,
    a.min_color_temp_kelvin || 2000, a.max_color_temp_kelvin || 6500);
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
const LT_KNOB = (v) => `calc(12px + (100% - 24px) * ${v} / 100)`;
/**
 * Farbrad und Zahlenwerte ineinander umrechnen. Der Verlauf beginnt bei
 * 90 Grad, also liegt Rot rechts und der Farbton läuft im Uhrzeigersinn.
 */
function wheelToHs(x, y) {
  const dx = x - 50, dy = 50 - y;            // y kommt von unten gezählt
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const hue = (deg - 90 + 720) % 360;
  const sat = clamp(Math.round((Math.hypot(dx, dy) / 50) * 100), 0, 100);
  return [Math.round(hue), sat];
}

function hsToWheel(hue, sat) {
  const rad = (((hue + 90) % 360) * Math.PI) / 180;
  const r = clamp(sat, 0, 100) / 2;
  return { left: 50 + r * Math.sin(rad), top: 50 - r * Math.cos(rad) };
}

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
    .cap{ position:absolute; inset:0; display:flex; align-items:center; gap:7px;
          padding:0 12px; font-size:12.5px; font-weight:600; color:#fff; z-index:1;
          --mdc-icon-size:16px; pointer-events:none;
          white-space:nowrap; overflow:hidden; }
    .bar.mute .cap{ color:#6f8497; font-weight:500; font-size:11.5px; }
    /* Kaltweiss auf voller Helligkeit ist fast weiss; darauf ist weisse
       Schrift nicht mehr zu lesen. */
    .bar.bright .cap{ color:#1b1e24; }
    /* Ein Fenster statt eines Strichs: durch den Ring sieht man genau die
       Farbe, auf der man gerade steht. */
    .knob{ position:absolute; top:50%; transform:translate(-50%,-50%); width:20px;
           height:28px; border-radius:99px; background:none; z-index:2;
           border:2.5px solid #fff;
           box-shadow:0 2px 8px rgba(0,0,0,.45), inset 0 0 0 1px rgba(0,0,0,.22); }

    /* Das Farbfeld: Farbton nach rechts, Sättigung nach unten. Eine
       Bewegung setzt beides — feste Tupfer liessen alles dazwischen aus. */
    /* Das Farbrad: Farbton rundherum, Sättigung nach aussen. Es wächst
       mit der Spalte mit, bleibt aber in beide Richtungen im Rahmen. */
    .wheelbox{ display:flex; justify-content:center; padding:2px 0; }
    .wheel{ position:relative; width:clamp(96px, 52%, 168px); aspect-ratio:1;
            border-radius:50%; cursor:pointer; touch-action:none;
            box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);
            background:
              radial-gradient(circle closest-side,
                #ffffff 0%, rgba(255,255,255,0) 100%),
              conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00,
                             #00ffff, #0000ff, #ff00ff, #ff0000); }
    .cdot{ position:absolute; transform:translate(-50%,-50%); width:22px; height:22px;
           border-radius:50%; background:none; border:2.5px solid #fff; z-index:2;
           box-shadow:0 2px 8px rgba(0,0,0,.45), inset 0 0 0 1px rgba(0,0,0,.22); }

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
      // Wo der Ring im Farbfeld steht. Ist das Licht gerade auf Weiss,
      // steht er nirgends — dann zeigt das Feld auch keinen.
      hs: on && a.color_mode && LT_COLOR_MODES.includes(a.color_mode)
        ? (a.hs_color || (a.rgb_color ? rgbToHs(a.rgb_color) : null)) : null,
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
    const lite = m.on && m.tint ? `--lite:${m.lite};--btn:${m.tint}` : '';
    const styled = lite
      ? (style ? style.replace(/"$/, ';' + lite + '"') : ` style="${lite}"`)
      : style;

    const det = this._detail(m);
    const cap = this._cap(m);
    const barCls = [
      cap.mute ? 'mute' : '',
      m.on && m.pct >= 45 && m.lum > 0.72 ? 'bright' : ''
    ].filter(Boolean).join(' ');

    const panel = !m.open ? '' : `
      ${m.canDim ? `
        <div class="bar ${barCls}" id="field">
          ${m.on ? `<div class="fill" style="width:${m.pct}%"></div>` : ''}
          <div class="cap">${cap.html}</div>
        </div>` : ''}
      ${m.canTemp ? `
        <div class="bar" id="temp"
             style="background:linear-gradient(90deg,${esc(m.ramp)})">
          ${m.mode === 'color_temp' && m.kelvin
            ? `<div class="knob" style="left:${LT_KNOB(this._kPct(m))}"></div>` : ''}
        </div>` : ''}
      ${m.canColor ? `
        <div class="wheelbox">
          <div class="wheel" id="wheel">
            ${m.hs ? (() => {
              const p = hsToWheel(m.hs[0], m.hs[1]);
              return `<div class="cdot" style="left:${p.left}%; top:${p.top}%"></div>`;
            })() : ''}
          </div>
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
      const cap = field.querySelector('.cap');
      this._press(field, {
        axis: 'x',
        onTap: toggle,
        onHold: () => fireMoreInfo(this, m.id),
        onDrag: m.dead ? null : (v) => {
          if (fill) fill.style.width = v + '%';
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
      // Leuchtet die Lampe gerade farbig, steht kein Ring auf der Schiene —
      // ein Kelvin-Wert wäre dort schlicht gelogen. Sobald man zieht,
      // erscheint er.
      let knob = temp.querySelector('.knob');
      const toK = (v) => Math.round(m.kMin + ((m.kMax - m.kMin) * v) / 100);
      const place = (v) => {
        if (!knob) {
          knob = document.createElement('div');
          knob.className = 'knob';
          temp.appendChild(knob);
        }
        knob.style.left = LT_KNOB(v);
      };
      this._press(temp, {
        axis: 'x',
        onDrag: m.dead ? null : place,
        onDrop: m.dead ? null : (v) => call({ color_temp_kelvin: toK(v) })
      });
    }

    const wheel = root.getElementById('wheel');
    if (wheel) {
      let dot = wheel.querySelector('.cdot');
      const place = (hs) => {
        if (!dot) {
          dot = document.createElement('div');
          dot.className = 'cdot';
          wheel.appendChild(dot);
        }
        const p = hsToWheel(hs[0], hs[1]);
        dot.style.left = p.left + '%';
        dot.style.top = p.top + '%';
      };
      const at = (p) => wheelToHs(p.x, p.y);
      this._press(wheel, {
        axis: 'xy',
        onTap: m.dead ? null : (p) => { const hs = at(p); place(hs); call({ hs_color: hs }); },
        onHold: () => fireMoreInfo(this, m.id),
        onDrag: m.dead ? null : (p) => place(at(p)),
        onDrop: m.dead ? null : (p) => call({ hs_color: at(p) })
      });
    }

    root.querySelectorAll('[data-fx]').forEach((el) => {
      this._press(el, { onTap: guard(() => call({ effect: el.dataset.fx })) });
    });
  }

  getCardSize() {
    return this._open || this._config.always_open === true ? 4 : 1;
  }
}

/* ================================================================== *
 * 10) KAMERA-KARTE
 * ================================================================== */

/**
 * Das Live-Bild zeichnet nicht diese Karte, sondern `<ha-camera-stream>`
 * aus dem Frontend: das Element kennt HLS und WebRTC, holt sich die
 * Zugangsdaten selbst und weiss, wann ein Stream neu aufgebaut werden
 * muss. Es steckt aber im nachgeladenen Bündel — genau wie `<ha-form>`.
 * Also erzwingen wir das Nachladen über eine eingebaute Karte, die es
 * ihrerseits mitbringt.
 */
let _streamReady = null;
function ensureStreamLoaded(entityId) {
  if (_streamReady) return _streamReady;
  _streamReady = (async () => {
    if (customElements.get('ha-camera-stream')) return;
    try {
      const helpers = await window.loadCardHelpers();
      await helpers.createCardElement({
        type: 'picture-entity', entity: entityId, camera_view: 'live'
      });
    } catch (err) {
      console.warn('[onyx-cards] ' + t('log.streamLoad'), err);
    }
    await Promise.race([
      customElements.whenDefined('ha-camera-stream'),
      new Promise((r) => setTimeout(r, 4000))
    ]);
  })();
  return _streamReady;
}

/** Wie oft sich das Standbild erneuert, wenn kein Stream zustande kommt */
const CAM_POLL = 10000;

class OnyxCameraCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      position:relative; padding:0; overflow:hidden; box-shadow:none;
      border-radius:var(--onyx-r,24px); border:1px solid rgba(255,255,255,.09);
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
      container-type:inline-size;
    }
    ha-card.foot{ padding:12px; display:flex; flex-direction:column; gap:10px; }
    /* Auf einer halben Spalte ist das Bild nur noch rund 100 px hoch —
       dann passen Knöpfe und zweite Zeile nicht mehr darüber. Übrig
       bleibt, was eine Vorschau ausmacht: Name und ob etwas los ist. */
    @container (max-width: 240px){
      .over .bar{ display:none; }
      .over .ttl .s{ display:none; }
      .badge .lb{ display:none; }
      .badge{ padding:0 7px; }
    }
    ha-card.alarm{ --acc:#f2949a; --sub:#d1787f; --lab:#b87a80; --btn:#ef5f68; }
    ha-card.off{ opacity:.6; }

    /* Das Bild. Ohne Fuss füllt es die Karte, mit Fuss sitzt es gerundet
       darin — in beiden Fällen im Seitenverhältnis der Kamera. */
    .pic{ position:relative; width:100%; aspect-ratio:16/9; overflow:hidden;
          background:#0e1116; cursor:pointer; }
    ha-card.foot .pic{ border-radius:14px; }
    .pic img, .pic video, .pic ha-camera-stream{
      display:block; width:100%; height:100%; object-fit:cover; }
    .pic ha-camera-stream video{ width:100%; height:100%; object-fit:cover; }

    /* Ein Schleier oben und unten, damit die Schrift auf jedem Bild
       lesbar bleibt — auch wenn nachts der Scheinwerfer angeht. */
    .scrim{ position:absolute; inset:0; pointer-events:none;
            background:linear-gradient(180deg, rgba(6,8,11,.72) 0%,
              rgba(6,8,11,0) 34%, rgba(6,8,11,0) 56%, rgba(6,8,11,.82) 100%); }
    .scrim.top{ background:linear-gradient(180deg, rgba(6,8,11,.7) 0%,
                  rgba(6,8,11,0) 42%); }

    /* Der Rahmen ums Bild: nur er trägt das Schwebende. Ohne ihn spannte
       sich die Auflage über die ganze Karte und die Knöpfe landeten
       hinter dem Streifen der übrigen Kameras. */
    .frame{ position:relative; }
    .over{ position:absolute; inset:0; display:flex; flex-direction:column;
           justify-content:space-between; padding:12px; pointer-events:none; }
    .over > *{ pointer-events:auto; }
    .top{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
    .ttl{ min-width:0; }
    .ttl .n{ font-size:14px; font-weight:600; line-height:19px; color:#fff;
             text-shadow:0 1px 6px rgba(0,0,0,.75);
             overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ttl .s{ font-size:11.5px; line-height:16px; color:rgba(255,255,255,.74);
             text-shadow:0 1px 6px rgba(0,0,0,.75);
             overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .badge{ display:inline-flex; align-items:center; gap:6px; height:24px; flex:none;
            padding:0 9px; border-radius:99px; font-size:11px; font-weight:600;
            color:#fff; --mdc-icon-size:13px; white-space:nowrap;
            background:rgba(12,15,20,.55); border:1px solid rgba(255,255,255,.16);
            -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); }
    .badge .dot{ width:7px; height:7px; border-radius:50%; background:#ff4d4d;
                 box-shadow:0 0 8px 2px rgba(255,77,77,.6); }
    .badge.warn{ background:color-mix(in srgb, var(--btn) 34%, transparent);
                 border-color:color-mix(in srgb, var(--btn) 55%, transparent); }
    .badge.mute{ color:rgba(255,255,255,.8); font-weight:500; }

    /* Glasknöpfe wie überall sonst, hier über dem Bild schwebend */
    .bar{ display:flex; gap:8px; }
    .gb{ flex:1; height:38px; border-radius:12px; display:flex; align-items:center;
         justify-content:center; gap:8px; color:#fff; --mdc-icon-size:18px;
         cursor:pointer; font-size:12.5px; font-weight:600;
         background:rgba(12,15,20,.42); border:1px solid rgba(255,255,255,.14);
         -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px);
         transition:transform .12s ease, background .18s ease; }
    .gb.on{ background:color-mix(in srgb, var(--btn) 58%, transparent);
            border-color:color-mix(in srgb, var(--btn) 76%, transparent); }
    .gb.wide{ flex:2.4; }
    .gb.armed{ box-shadow:0 0 0 2px rgba(255,255,255,.85),
                          0 0 0 4px color-mix(in srgb, var(--btn) 45%, transparent); }
    .gb.held{ transform:scale(.94); }

    /* Fussvariante: die gewohnte Onyx-Zeile unter dem Bild */
    .row{ display:flex; align-items:center; gap:10px; }
    .sq{ width:42px; height:42px; border-radius:12px; flex:none; display:grid;
         place-items:center; --mdc-icon-size:22px; color:#8ea3b5; cursor:pointer;
         background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10); }
    ha-card.alarm .sq{ color:#fff;
      background:color-mix(in srgb, var(--btn) 26%, transparent);
      border-color:color-mix(in srgb, var(--btn) 46%, transparent); }
    .txt{ flex:1; min-width:0; }
    .p1{ font-size:14px; font-weight:600; line-height:19px; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .p2{ font-size:12.5px; line-height:17px; color:#72879a;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.alarm .p2{ color:var(--sub); }
    .fbar{ display:flex; gap:8px; }
    .fb{ flex:1; height:38px; border-radius:12px; display:flex; align-items:center;
         justify-content:center; gap:8px; color:#fff; --mdc-icon-size:18px;
         cursor:pointer; font-size:12.5px; font-weight:600;
         background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
         -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
         border:1px solid rgba(255,255,255,.11);
         transition:transform .12s ease, background .18s ease; }
    .fb.on{ background:color-mix(in srgb, var(--btn) 58%, transparent);
            border-color:color-mix(in srgb, var(--btn) 76%, transparent); }
    .fb.wide{ flex:2.4; }
    .fb.armed{ box-shadow:0 0 0 2px rgba(255,255,255,.85),
                          0 0 0 4px color-mix(in srgb, var(--btn) 45%, transparent); }
    .fb.held{ transform:scale(.94); }

    /* Streifen der übrigen Kameras */
    .strip{ display:flex; gap:8px; }
    .thumb{ position:relative; flex:1; aspect-ratio:16/9; border-radius:10px;
            overflow:hidden; cursor:pointer; background:#0e1116;
            border:1px solid rgba(255,255,255,.10); }
    .thumb img{ display:block; width:100%; height:100%; object-fit:cover; }
    .thumb.on{ border-color:rgba(255,255,255,.85);
               box-shadow:0 0 0 2px color-mix(in srgb, var(--btn) 45%, transparent); }
    .thumb .lbl{ position:absolute; left:0; right:0; bottom:0; padding:3px 6px;
                 font-size:9.5px; color:#fff; background:rgba(6,8,11,.6);
                 overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .thumb .mv{ position:absolute; top:4px; right:4px; width:7px; height:7px;
                border-radius:50%; background:#ff4d4d;
                box-shadow:0 0 7px 2px rgba(255,77,77,.6); }
    .thumb.held{ opacity:.7; }

    .dead{ position:absolute; inset:0; display:grid; place-items:center;
           grid-auto-flow:row; justify-items:center; gap:8px;
           background:rgba(10,12,16,.82); color:#6f8497; font-size:12.5px;
           --mdc-icon-size:26px; }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-camera-card', entity: firstEntity(hass, 'camera') };
  }

  setConfig(config) {
    const list = normList(config.cameras)
      || (config.entity ? [{ entity: config.entity }] : null);
    if (!list || !list.length) throw new Error(t('err.needEntity'));
    for (const c of list) {
      if (c.entity.split('.')[0] !== 'camera') throw new Error(t('err.needCamera'));
    }
    this._idx = 0;
    this._muted = true;
    this._armed = false;
    super.setConfig(config);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._poll) { clearInterval(this._poll); this._poll = null; }
    // Der Player gehört zum DOM, das gerade verschwindet. Ihn zu behalten
    // hiesse, beim nächsten Anhängen eine Leiche einzuhängen.
    this._stream = null;
  }

  /**
   * In `entity_picture` steckt ein Zugriffszeichen, das Home Assistant alle
   * fünf Minuten neu vergibt. Zählte es zur Signatur, baute sich die Karte
   * im Fünfminutentakt neu auf — und riss dabei jedes Mal den laufenden
   * Stream ab. Für die Signatur zählt darum nur der Pfad ohne Anhang.
   */
  _sigOf(model) {
    const ohneZeichen = (u) => (typeof u === 'string' ? u.split('?')[0] : u);
    const flach = Object.assign({}, model, { pic: ohneZeichen(model.pic) });
    if (flach.strip) {
      flach.strip = flach.strip.map((c) => Object.assign({}, c, { pic: ohneZeichen(c.pic) }));
    }
    return JSON.stringify(flach);
  }

  _list() {
    return normList(this._config.cameras) || [{ entity: this._config.entity }];
  }

  /** Ein Zustand als "an" gelesen, ohne dass die Entität da sein muss */
  _flag(id) {
    const st = id && this._hass.states[id];
    return !!(st && isOn(st));
  }

  _model() {
    const hass = this._hass, cfg = this._config;
    const list = this._list();
    const idx = clamp(this._idx, 0, list.length - 1);

    const cams = list.map((c, i) => {
      const st = hass.states[c.entity];
      return {
        id: c.entity,
        name: c.name || nameOf(hass, c.entity),
        dead: isDead(st),
        // Das Standbild kommt mit einem Zeichen im Anhang, das mit jedem
        // Zustandswechsel neu vergeben wird — also nicht selbst basteln.
        pic: (st && st.attributes.entity_picture) || null,
        motion: this._flag(c.motion || (i === idx ? cfg.motion_entity : null))
      };
    });

    const cur = cams[idx];
    if (!hass.states[cur.id]) throw new Error(t('err.entity', { id: cur.id }));

    const ring = this._flag(cfg.doorbell_entity);
    const motion = this._flag(cfg.motion_entity);
    const lightId = cfg.light_entity || null;
    const doorId = cfg.door_entity || null;

    // Wann zuletzt etwas los war. Das Abzeichen sagt, was gerade ist —
    // die Zeile darunter sagt, seit wann.
    const stamps = [cfg.motion_entity, cfg.doorbell_entity]
      .map((id) => (id && hass.states[id] ? Date.parse(hass.states[id].last_changed) : NaN))
      .filter((v) => !isNaN(v));
    const last = stamps.length ? Math.max.apply(null, stamps) : null;

    const sub = cur.dead ? t('unavailable')
      : last ? t('cam.last', { t: fmtTime(new Date(last)) })
      : t('cam.quiet');

    return {
      idx,
      id: cur.id,
      name: cfg.name || cur.name,
      sub,
      pic: cur.pic,
      dead: cur.dead,
      motion, ring,
      icon: cfg.icon || (cfg.doorbell_entity ? 'mdi:doorbell-video' : 'mdi:cctv'),
      color: cfg.color || null,
      light: lightId ? { id: lightId, on: this._flag(lightId) } : null,
      door: doorId ? { id: doorId } : null,
      armed: this._armed,
      muted: this._muted,
      footer: cfg.footer === true,
      strip: cams.length > 1 ? cams : null,
      ratio: cfg.aspect_ratio || '16/9'
    };
  }

  /** Die Knopfreihe — dieselbe Auswahl, oben schwebend oder unten fest */
  _buttons(m, cls) {
    const btn = (id, extra, inner) =>
      `<div class="${cls} ${extra}" id="${id}">${inner}</div>`;
    const out = [];
    if (m.door) {
      out.push(btn('door', 'wide' + (m.armed ? ' on armed' : ''),
        `<ha-icon icon="mdi:lock-open-variant"></ha-icon>` +
        `<span>${esc(t(m.armed ? 'cam.sure' : 'cam.open'))}</span>`));
    }
    out.push(btn('full', '', '<ha-icon icon="mdi:fullscreen"></ha-icon>'));
    out.push(btn('sound', m.muted ? '' : 'on',
      `<ha-icon icon="mdi:volume-${m.muted ? 'off' : 'high'}"></ha-icon>`));
    if (m.light) {
      out.push(btn('light', m.light.on ? 'on' : '',
        '<ha-icon icon="mdi:lightbulb"></ha-icon>'));
    }
    return `<div class="${cls === 'gb' ? 'bar' : 'fbar'}">${out.join('')}</div>`;
  }

  _badge(m) {
    if (m.dead) return '';
    // Die Beschriftung steckt in einem eigenen Element, damit sie auf
    // schmalen Spalten wegfallen kann und das Zeichen stehen bleibt.
    const b = (cls, mark, label) =>
      `<span class="badge ${cls}">${mark}<span class="lb">${esc(label)}</span></span>`;
    if (m.ring) return b('warn', '<ha-icon icon="mdi:bell-ring"></ha-icon>', t('cam.ring'));
    if (m.motion) return b('warn', '<ha-icon icon="mdi:motion-sensor"></ha-icon>', t('cam.motion'));
    return b('', '<span class="dot"></span>', t('cam.live'));
  }

  _picture(m) {
    return `
      <div class="pic" id="pic" style="aspect-ratio:${esc(m.ratio)}">
        ${m.dead ? '<div class="dead"><ha-icon icon="mdi:cctv-off"></ha-icon></div>' : ''}
      </div>`;
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const alarm = (m.ring || m.motion) && !m.dead;
    const klass = (cls + (m.footer ? ' foot' : '') + (alarm ? ' alarm' : '')
      + (m.dead ? ' off' : '')).trim();

    const strip = m.strip ? `
      <div class="strip">
        ${m.strip.map((c, i) => `
          <div class="thumb ${i === m.idx ? 'on' : ''}" data-cam="${i}">
            ${c.pic ? `<img src="${esc(c.pic)}" alt="">` : ''}
            ${c.motion ? '<div class="mv"></div>' : ''}
            <div class="lbl">${esc(c.name)}</div>
          </div>`).join('')}
      </div>` : '';

    // Ohne Fuss schwebt alles über dem Bild, mit Fuss steht es darunter.
    if (!m.footer) {
      return `
      <ha-card class="${klass}"${style}>
        <div class="frame">
          ${this._picture(m)}
          <div class="scrim"></div>
          <div class="over">
            <div class="top">
              <div class="ttl">
                <div class="n">${esc(m.name)}</div>
                <div class="s">${esc(m.sub)}</div>
              </div>
              ${this._badge(m)}
            </div>
            ${m.dead ? '<div></div>' : this._buttons(m, 'gb')}
          </div>
        </div>
        ${strip ? `<div style="padding:12px">${strip}</div>` : ''}
      </ha-card>`;
    }

    return `
    <ha-card class="${klass}"${style}>
      <div class="frame">
        ${this._picture(m)}
        <div class="scrim top" style="border-radius:14px"></div>
        <div class="over" style="padding:9px; justify-content:flex-start">
          <div class="top"><div></div>${this._badge(m)}</div>
        </div>
      </div>
      <div class="row">
        <div class="sq" id="ico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
        <div class="txt">
          <div class="p1">${esc(m.name)}</div>
          <div class="p2">${esc(m.sub)}</div>
        </div>
      </div>
      ${m.dead ? '' : this._buttons(m, 'fb')}
      ${strip}
    </ha-card>`;
  }

  /**
   * Das Bild in die Karte hängen. Der Stream lebt über den Neuaufbau
   * hinweg: würde er bei jedem Zustandswechsel neu erzeugt, ruckelte
   * die Karte jedes Mal von vorne los.
   */
  /** Hängt das Stream-Element noch im Dokument und spielt damit überhaupt? */
  _streamLebt() {
    return !!(this._stream && this._stream.isConnected);
  }

  _fill(m) {
    const box = this.shadowRoot.getElementById('pic');
    if (!box || m.dead) return;
    const st = this._hass.states[m.id];

    ensureStreamLoaded(m.id).then(() => {
      if (!this.isConnected) return;
      const host = this.shadowRoot.getElementById('pic');
      if (!host) return;
      const Cls = customElements.get('ha-camera-stream');
      if (!Cls) { this._still(host, m); return; }
      // Baut sich die Karte neu auf, verlässt das Stream-Element das
      // Dokument und Home Assistant reisst den Player darin ab. Wieder
      // anhängen weckt ihn nicht — es braucht ein frisches Element.
      if (this._stream && !this._stream.isConnected) this._stream = null;
      if (!this._stream) {
        this._stream = document.createElement('ha-camera-stream');
        this._stream.controls = false;
        this._stream.allowExoPlayer = false;
      }
      this._stream.hass = this._hass;
      this._stream.stateObj = st;
      this._stream.muted = this._muted;
      if (this._stream.parentNode !== host) host.appendChild(this._stream);
      if (this._poll) { clearInterval(this._poll); this._poll = null; }
    });

    // Bis der Stream steht — und falls er nie steht — das Standbild.
    // Auch dann, wenn ein früherer Stream unterwegs abhandengekommen ist.
    if (!this._streamLebt()) this._still(box, m);
  }

  /** Rückfall: das Standbild, das sich von selbst erneuert */
  _still(host, m) {
    if (!m.pic) return;
    let img = host.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = '';
      host.insertBefore(img, host.firstChild);
    }
    // Nicht jede Bildadresse trägt schon ein Fragezeichen, und ein
    // eingebettetes Bild verträgt gar keinen Anhang.
    const bust = () => {
      const u = m.pic;
      img.src = /^data:/.test(u) ? u
        : u + (u.indexOf('?') < 0 ? '?' : '&') + '_onyx=' + Date.now();
    };
    bust();
    if (this._poll) clearInterval(this._poll);
    this._poll = setInterval(() => {
      if (!this.isConnected || this._streamLebt()) {
        clearInterval(this._poll); this._poll = null; return;
      }
      bust();
    }, CAM_POLL);
  }

  _bind(m) {
    const root = this.shadowRoot;
    this._fill(m);

    const open = () => fireMoreInfo(this, m.id);
    const pic = root.getElementById('pic');
    if (pic) this._press(pic, { onTap: open, onHold: open });

    const ico = root.getElementById('ico');
    if (ico) this._press(ico, { onTap: open, onHold: open });

    const full = root.getElementById('full');
    if (full) this._press(full, { onTap: open });

    const sound = root.getElementById('sound');
    if (sound) {
      this._press(sound, {
        onTap: () => {
          this._muted = !this._muted;
          if (this._stream) this._stream.muted = this._muted;
          this._repaint();
        }
      });
    }

    const light = root.getElementById('light');
    if (light) {
      this._press(light, {
        onTap: () => this.call('light', 'toggle', { entity_id: m.light.id }),
        onHold: () => fireMoreInfo(this, m.light.id)
      });
    }

    // Der Türöffner geht nicht auf den ersten Griff auf: einmal tippen
    // spannt ihn, das zweite Mal öffnet. Drei Sekunden später ist er
    // wieder entspannt.
    const door = root.getElementById('door');
    if (door) {
      this._press(door, {
        onTap: () => {
          if (!this._armed) {
            this._armed = true;
            clearTimeout(this._armTimer);
            this._armTimer = setTimeout(() => { this._armed = false; this._repaint(); }, 3000);
            this._repaint();
            return;
          }
          this._armed = false;
          clearTimeout(this._armTimer);
          const dom = m.door.id.split('.')[0];
          if (dom === 'lock') {
            const st = this._hass.states[m.door.id];
            const feat = (st && st.attributes.supported_features) || 0;
            this.call('lock', (feat & 1) ? 'open' : 'unlock', { entity_id: m.door.id });
          } else if (dom === 'switch' || dom === 'input_boolean') {
            this.call(dom, 'turn_on', { entity_id: m.door.id });
          } else {
            this.call('button', 'press', { entity_id: m.door.id });
          }
          this._repaint();
        },
        onHold: () => fireMoreInfo(this, m.door.id)
      });
    }

    root.querySelectorAll('[data-cam]').forEach((el) => {
      const i = Number(el.dataset.cam);
      this._press(el, {
        onTap: () => {
          if (i === m.idx) { open(); return; }
          this._idx = i;
          // Andere Kamera, anderes Bild: das Standbild muss weg, sonst
          // stünde für einen Moment die falsche Einfahrt in der Karte.
          const host = root.getElementById('pic');
          const img = host && host.querySelector('img');
          if (img) img.remove();
          this._repaint();
        }
      });
    });
  }

  getCardSize() {
    let n = 4;
    if (this._config.footer === true) n += 2;
    if (normList(this._config.cameras) && normList(this._config.cameras).length > 1) n += 1;
    return n;
  }
}

/* ================================================================== *
 * 11) SCHLOSS-KARTE
 * ================================================================== */

/** Wie weit der Griff wandern muss, damit es als Entriegeln zählt */
const LK_TRIP = 86;
/** Der Griff bleibt in der Schiene: 46 px sind Knopfbreite plus Luft */
const LK_POS = (v) => `calc((100% - 50px) * ${clamp(v, 0, 100)} / 100)`;

class OnyxLockCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:14px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09);
      display:flex; flex-direction:column; gap:12px; overflow:hidden;
      box-shadow:none; container-type:inline-size;
      background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%);
    }
    ha-card.off{ opacity:.55; }

    .hd{ display:flex; align-items:center; gap:11px; cursor:pointer; }
    .hico{ width:38px; height:38px; border-radius:50%; flex:none; display:grid;
           place-items:center; --mdc-icon-size:19px; color:var(--acc);
           border:1.5px solid color-mix(in srgb, var(--acc) 45%, transparent);
           background:color-mix(in srgb, var(--acc) 12%, transparent); }
    .txt{ flex:1; min-width:0; }
    .lab{ font-size:11px; line-height:14px; color:var(--lab); }
    .nm{ font-size:14px; font-weight:600; line-height:19px; color:#e9f1f8;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .meta{ text-align:right; line-height:1.35; flex:none; }
    .meta .d{ font-size:12px; color:var(--sub); white-space:nowrap; }
    .meta .b{ font-size:11px; color:var(--lab); font-variant-numeric:tabular-nums; }

    /* Die Bühne: das Schloss gross in der Mitte, dahinter zwei Höfe, die
       den Zustand tragen. Zugesperrt sind sie ruhig, offen leuchten sie. */
    .stage{ position:relative; height:132px; display:grid; place-items:center; }
    .halo{ position:absolute; border-radius:50%; }
    .h1{ width:126px; height:126px;
         background:color-mix(in srgb, var(--acc) 7%, transparent); }
    .h2{ width:92px; height:92px;
         background:color-mix(in srgb, var(--acc) 11%, transparent); }
    .big{ position:relative; width:62px; height:62px; border-radius:50%;
          display:grid; place-items:center; --mdc-icon-size:30px; color:#fff;
          background:color-mix(in srgb, var(--acc) 26%, transparent);
          border:1.5px solid color-mix(in srgb, var(--acc) 55%, transparent);
          box-shadow:0 0 34px color-mix(in srgb, var(--acc) 26%, transparent); }
    ha-card.busy .big{ animation:onyxPulse 1.1s ease-in-out infinite; }
    @keyframes onyxPulse{ 0%,100%{ transform:scale(1); } 50%{ transform:scale(.93); } }

    /* Der Riegel: schieben, nicht tippen. Ein Fehlgriff auf dem Handy
       soll nicht die Haustür aufsperren. */
    .slide{ position:relative; height:50px; border-radius:99px; overflow:hidden;
            cursor:pointer; touch-action:pan-y;
            background:rgba(255,255,255,.07);
            border:1px solid rgba(255,255,255,.10); }
    .trail{ position:absolute; left:0; top:0; bottom:0; width:0;
            background:color-mix(in srgb, var(--btn) 30%, transparent); }
    .cap{ position:absolute; inset:0; display:grid; place-items:center;
          font-size:13px; font-weight:600; color:var(--acc);
          padding:0 54px; text-align:center; pointer-events:none;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .knob{ position:absolute; top:4px; width:42px; height:42px; border-radius:50%;
           display:grid; place-items:center; color:#fff; --mdc-icon-size:20px;
           margin-left:4px; z-index:2;
           background:color-mix(in srgb, var(--btn) 72%, transparent);
           border:1px solid color-mix(in srgb, var(--btn) 90%, transparent);
           box-shadow:0 4px 14px rgba(0,0,0,.35); }

    /* Zurücksperren ist harmlos — dafür genügt ein Knopf. */
    .btn{ height:46px; border-radius:14px; display:flex; align-items:center;
          justify-content:center; gap:8px; cursor:pointer;
          font-size:13px; font-weight:600; color:#fff; --mdc-icon-size:18px;
          background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
          -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,.11);
          transition:transform .12s ease, background .18s ease; }
    .btn.hot{ background:color-mix(in srgb, var(--btn) 58%, transparent);
              border-color:color-mix(in srgb, var(--btn) 76%, transparent); }
    .btn.armed{ box-shadow:0 0 0 2px rgba(255,255,255,.85),
                           0 0 0 4px color-mix(in srgb, var(--btn) 45%, transparent); }
    .btn.held{ transform:scale(.97); }
    .btn.slim{ height:40px; font-size:12.5px; }
    .btn span, .cap span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .kurz{ display:none; }

    .note{ font-size:12px; line-height:1.45; color:var(--lab); text-align:center; }

    /* Auf einer halben Spalte schrumpft die Bühne, damit die Karte nicht
       zur Säule wird. */
    @container (max-width: 240px){
      .stage{ height:96px; }
      .h1{ width:92px; height:92px; }
      .h2{ width:70px; height:70px; }
      .big{ width:50px; height:50px; --mdc-icon-size:24px; }
      .meta{ display:none; }
      .cap{ font-size:12px; padding:0 12px 0 50px; }
      .lang{ display:none; }
      .kurz{ display:inline; }
    }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-lock-card', entity: firstEntity(hass, 'lock') };
  }

  setConfig(config) {
    if (!config.entity) throw new Error(t('err.needEntity'));
    if (config.entity.split('.')[0] !== 'lock') throw new Error(t('err.needLock'));
    this._armed = false;
    super.setConfig(config);
  }

  _readout(id, kind) {
    const st = id && this._hass.states[id];
    if (!st || isDead(st)) return null;
    if (kind === 'door') return isOn(st) ? t('lk.doorOpen') : t('lk.doorShut');
    const n = Number(st.state);
    return isNaN(n) ? null : nfmt(n, 0) + ' %';
  }

  _model() {
    const cfg = this._config;
    const st = this._hass.states[cfg.entity];
    if (!st) throw new Error(t('err.entity', { id: cfg.entity }));

    const state = st.state;
    const dead = isDead(st);
    const busy = state === 'locking' || state === 'unlocking' || state === 'opening';
    const locked = state === 'locked';
    const jammed = state === 'jammed';

    // Die Farbe sagt den Zustand: zu ist grün, offen ist orange, klemmt
    // ist rot. Wer eine eigene Farbe setzt, überschreibt das.
    const auto = jammed ? 'rot' : locked ? 'gruen' : 'orange';

    const feat = st.attributes.supported_features || 0;
    return {
      id: cfg.entity,
      name: cfg.name || nameOf(this._hass, cfg.entity),
      icon: cfg.icon || (jammed ? 'mdi:lock-alert'
        : locked ? 'mdi:lock' : 'mdi:lock-open-variant'),
      label: dead ? t('unavailable') : t('lk.' + (busy ? state : jammed ? 'jammed'
        : locked ? 'locked' : 'unlocked')),
      color: cfg.color || auto,
      state, dead, busy, locked, jammed,
      door: this._readout(cfg.door_entity, 'door'),
      battery: this._readout(cfg.battery_entity),
      // Manche Schlösser können den Riegel zurückziehen, also wirklich
      // öffnen. Das ist etwas anderes als entriegeln.
      canOpen: cfg.show_open !== false && (feat & 1) !== 0,
      armed: this._armed
    };
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const klass = (cls + (m.dead ? ' off' : '') + (m.busy ? ' busy' : '')).trim();

    let control = '';
    if (m.dead) {
      control = `<div class="note">${esc(t('unavailable'))}</div>`;
    } else if (m.busy) {
      control = `<div class="note">${esc(m.label)}</div>`;
    } else if (m.locked || m.jammed) {
      control = `
        <div class="slide" id="slide">
          <div class="trail" id="trail"></div>
          <div class="cap" id="cap"><span class="lang">${esc(t('lk.slide'))}</span
            ><span class="kurz">${esc(t('lk.slideShort'))}</span></div>
          <div class="knob" id="knob" style="left:${LK_POS(0)}">
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </div>
        </div>`;
    } else {
      control = `
        <div class="btn hot" id="lock">
          <ha-icon icon="mdi:lock"></ha-icon><span>${esc(t('lk.lock'))}</span>
        </div>`;
    }

    const meta = (m.door || m.battery) ? `
      <div class="meta">
        ${m.door ? `<div class="d">${esc(m.door)}</div>` : ''}
        ${m.battery ? `<div class="b">${esc(m.battery)}</div>` : ''}
      </div>` : '';

    return `
    <ha-card class="${klass}"${style}>
      <div class="hd" id="hd">
        <div class="hico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
        <div class="txt">
          <div class="lab">${esc(m.label)}</div>
          <div class="nm">${esc(m.name)}</div>
        </div>
        ${meta}
      </div>

      <div class="stage">
        <div class="halo h1"></div>
        <div class="halo h2"></div>
        <div class="big"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
      </div>

      ${control}

      ${m.canOpen && !m.dead && !m.busy ? `
        <div class="btn slim ${m.armed ? 'hot armed' : ''}" id="open">
          <ha-icon icon="mdi:door-open"></ha-icon>${m.armed
            ? `<span>${esc(t('lk.sure'))}</span>`
            : `<span class="lang">${esc(t('lk.openDoor'))}</span>` +
              `<span class="kurz">${esc(t('lk.openShort'))}</span>`}
        </div>` : ''}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;
    const more = () => fireMoreInfo(this, m.id);
    this._press(root.getElementById('hd'), { onTap: more, onHold: more });

    const slide = root.getElementById('slide');
    if (slide) {
      const knob = root.getElementById('knob');
      const trail = root.getElementById('trail');
      const cap = root.getElementById('cap');
      this._press(slide, {
        axis: 'x',
        // Antippen tut nichts: der Riegel geht nur auf, wer ihn zieht.
        onHold: more,
        onDrag: (v) => {
          knob.style.left = LK_POS(v);
          trail.style.width = v + '%';
          cap.style.opacity = String(clamp(1 - v / 70, 0, 1));
        },
        onDrop: (v) => {
          if (v >= LK_TRIP) this.call('lock', 'unlock', { entity_id: m.id });
          // Darunter federt der Griff zurück — das erledigt der Neuaufbau.
          this._repaint();
        }
      });
    }

    const lock = root.getElementById('lock');
    if (lock) {
      this._press(lock, {
        onTap: () => this.call('lock', 'lock', { entity_id: m.id }),
        onHold: more
      });
    }

    // Der Riegel ganz zurückziehen ist der folgenreichste Griff auf der
    // Karte: einmal tippen spannt, das zweite Mal öffnet.
    const open = root.getElementById('open');
    if (open) {
      this._press(open, {
        onTap: () => {
          if (!this._armed) {
            this._armed = true;
            clearTimeout(this._armTimer);
            this._armTimer = setTimeout(() => { this._armed = false; this._repaint(); }, 3000);
            this._repaint();
            return;
          }
          this._armed = false;
          clearTimeout(this._armTimer);
          this.call('lock', 'open', { entity_id: m.id });
          this._repaint();
        },
        onHold: more
      });
    }
  }

  getCardSize() { return this._config.show_open === false ? 5 : 6; }
}

/* ================================================================== *
 * 12) STATUS-KARTE
 * ================================================================== */

/** Sieht eine Angabe nach Jinja aus? */
const isTpl = (v) => typeof v === 'string' && (v.indexOf('{{') >= 0 || v.indexOf('{%') >= 0);

/** Die Felder eines Eintrags, die eine Vorlage sein dürfen */
const ST_FIELDS = ['name', 'detail', 'value', 'percent', 'icon', 'color', 'hide'];

/**
 * Die Bausteine der Status-Karte.
 *
 * Eine Tabelle für beide Seiten: die Karte liest hier nichts, aber der
 * Editor baut daraus sein Klappmenü und die Felder je Baustein. Was ein
 * Baustein an Entitäten braucht, steht in `fields`; `label` zeigt auf die
 * Beschriftung, wenn der Feldname allein nicht reicht (`entity` heisst
 * beim Auto "Ladestand", beim Staubsauger einfach "Entität").
 */
const ST_MODULES = {
  presence: {
    icon: 'mdi:home-account',
    fields: [{ n: 'people', sel: 'entity', domain: 'person', multiple: true }]
  },
  car: {
    icon: 'mdi:car-electric',
    fields: [
      { n: 'entity', sel: 'entity', domain: 'sensor', label: 'ed.chargeLevel' },
      { n: 'charging', sel: 'entity' },
      { n: 'power', sel: 'entity', domain: 'sensor' },
      { n: 'remaining', sel: 'entity', domain: 'sensor' },
      { n: 'cable', sel: 'entity', domain: 'binary_sensor' },
      { n: 'climate', sel: 'entity', domain: 'climate', label: 'ed.standClimate' }
    ]
  },
  vacuum: {
    icon: 'mdi:robot-vacuum',
    fields: [
      { n: 'entity', sel: 'entity', domain: 'vacuum' },
      { n: 'room', sel: 'entity', domain: 'sensor' },
      { n: 'done', sel: 'entity', domain: ['input_boolean', 'binary_sensor'] }
    ]
  },
  mower: {
    icon: 'mdi:robot-mower',
    fields: [{ n: 'entity', sel: 'entity', domain: 'lawn_mower' }]
  },
  battery: {
    icon: 'mdi:battery-70',
    fields: [
      { n: 'entity', sel: 'entity', domain: 'sensor' },
      { n: 'charging', sel: 'entity' }
    ]
  },
  entity: {
    icon: 'mdi:information-outline',
    fields: [{ n: 'entity', sel: 'entity' }],
    extra: [{ n: 'value', sel: 'text' }, { n: 'percent', sel: 'text' }]
  },
  template: {
    icon: 'mdi:code-braces',
    fields: [],
    extra: [{ n: 'value', sel: 'text' }, { n: 'percent', sel: 'text' }]
  }
};

/** Felder, die es bei jedem Baustein gibt */
const ST_COMMON = [
  { n: 'name', sel: 'text' }, { n: 'detail', sel: 'text' },
  { n: 'icon', sel: 'icon' }, { n: 'color', sel: 'color' },
  { n: 'hide', sel: 'text' }
];

const ST_MOD_KEYS = Object.keys(ST_MODULES);

/**
 * Welcher Baustein steckt in diesem Eintrag? Ohne `module:` entscheidet,
 * ob eine Entität dabeisteht — so bleibt die YAML frei von `module: entity`.
 */
function stModuleOf(e) {
  if (e && e.module && ST_MODULES[e.module]) return e.module;
  return e && e.entity ? 'entity' : 'template';
}

/** Vorgegebene Farben der Bausteine */
const ST_C = {
  gruen: '#7fe0ab', blau: '#4fb0f0', gelb: '#f0b429', violett: '#9b7bf5',
  rot: '#ef5f68', grau: '#8ea3b5', orange: '#f0913c', indigo: '#6b7cf5'
};

/**
 * Aus einem Text ein Kürzel machen: "Tobias Jordi" → "T". Für die
 * Köpfchen der Anwesenheit, wo kein Platz für Namen ist.
 */
const initial = (s) => String(s || '?').trim().charAt(0).toUpperCase();

class OnyxStatusCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:14px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09); box-shadow:none; overflow:hidden;
      container-type:inline-size;
      background:linear-gradient(to right bottom,
        var(--onyx-cold-1,#141419) 0%, var(--onyx-cold-2,#17171d) 100%);
    }
    /* Auf einer halben Spalte drängen die Köpfchen den Namen aus dem
       Kopf heraus. Dass jemand da ist, sagt dort die Farbe. */
    @container (max-width: 240px){
      .head{ padding:10px; gap:10px; }
      .head .i{ width:34px; height:34px; --mdc-icon-size:19px; }
      .head .who{ display:none; }
      .head .n{ font-size:13.5px; }
      .r .who{ display:none; }
    }
    .ftitle{ font-size:15px; font-weight:600; color:#dbe6f0; }
    .fsub{ font-size:11.5px; color:#6f8497; }
    .fhead{ margin-bottom:12px; }

    /* Der Kopf: was gerade am meisten zählt, oder eine Störung */
    .head{ display:flex; align-items:center; gap:12px; padding:12px;
           border-radius:18px; margin-bottom:11px; cursor:pointer;
           background:color-mix(in srgb, var(--t) 14%, transparent);
           border:1px solid color-mix(in srgb, var(--t) 24%, transparent); }
    .head .i{ width:40px; height:40px; border-radius:13px; flex:none; display:grid;
              place-items:center; --mdc-icon-size:22px; color:#fff;
              background:color-mix(in srgb, var(--t) 40%, transparent); }
    .head .tx{ flex:1; min-width:0; }
    .head .n{ font-size:15px; font-weight:600; color:#fff; line-height:20px;
              overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .head .d{ font-size:12px; color:rgba(255,255,255,.68);
              overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .head .v{ font-size:15px; font-weight:700; color:#fff; flex:none;
              font-variant-numeric:tabular-nums; }

    /* Die Zeilen darunter */
    .rows{ display:flex; flex-direction:column; }
    .r{ display:flex; align-items:center; gap:10px; min-height:34px;
        padding:3px 0; cursor:pointer; }
    .r .i{ width:26px; height:26px; border-radius:8px; flex:none; display:grid;
           place-items:center; --mdc-icon-size:15px; color:var(--t);
           background:color-mix(in srgb, var(--t) 18%, transparent); }
    .r .tx{ flex:1; min-width:0; }
    .r .n{ font-size:12.5px; color:#c3ccd6; line-height:16px;
           overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .r .d{ font-size:11px; color:#6f8497; line-height:14px;
           overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .r .v{ font-size:12.5px; font-weight:600; color:var(--t); flex:none;
           font-variant-numeric:tabular-nums; }
    .r .bar{ height:3px; border-radius:99px; background:rgba(255,255,255,.09);
             margin-top:5px; overflow:hidden; }
    .r .bar i{ display:block; height:100%; border-radius:99px; background:var(--t);
               transition:width .3s ease; }

    /* Köpfchen für die Anwesenheit */
    .who{ display:flex; gap:5px; flex:none; }
    .who span{ width:26px; height:26px; border-radius:50%; display:grid;
               place-items:center; font-size:10.5px; font-weight:700; color:#0b0d10;
               background:var(--t); }
    .who span.weg{ background:rgba(255,255,255,.08); color:#66798a; }

    .divide{ height:1px; background:rgba(255,255,255,.07); margin:9px 0; }
    .chips{ display:flex; gap:6px; flex-wrap:wrap; }
    .chip{ display:flex; align-items:center; gap:6px; height:30px; padding:0 11px 0 7px;
           border-radius:99px; font-size:11.5px; font-weight:600; color:#c3ccd6;
           cursor:pointer; --mdc-icon-size:14px; min-width:0; max-width:100%;
           background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
           transition:transform .12s ease; }
    .chip .ci{ color:var(--t); display:grid; place-items:center; flex:none; }
    .chip .cl{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .chip.held, .r.held, .head.held{ transform:scale(.98); }
    .empty{ font-size:12.5px; color:#6f8497; text-align:center; padding:10px 0; }
    `;
  }

  static getStubConfig(hass) {
    const p = firstEntity(hass, 'person');
    return {
      type: 'custom:onyx-status-card',
      title: t('st'),
      head: p ? { module: 'presence', people: [p] } : undefined,
      rows: [{ entity: firstEntity(hass, ['vacuum', 'light']) }]
    };
  }

  setConfig(config) {
    const rows = config.rows || [];
    const chips = config.chips || [];
    if (!config.head && !rows.length && !chips.length) {
      throw new Error(t('err.needRows'));
    }
    super.setConfig(config);
    // Die Vorlagen stehen fest, sobald die Konfiguration steht — also
    // hier einsammeln und nicht bei jedem Zustandswechsel neu.
    this._collectTemplates();
    if (this._hass) this._subscribe();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass && this._tplList && this._tplList.length && !this._subs) this._subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe();
  }

  set hass(hass) {
    const first = !this._hass;
    super.hass = hass;
    if (first) this._subscribe();
  }
  get hass() { return this._hass; }

  /** Alle Felder durchgehen und merken, welche eine Vorlage sind */
  _collectTemplates() {
    const list = [];
    const walk = (entry, prefix) => {
      if (!entry || typeof entry !== 'object') return;
      for (const f of ST_FIELDS) {
        if (isTpl(entry[f])) list.push({ key: prefix + ':' + f, template: entry[f] });
      }
    };
    walk(this._config.head, 'h');
    (this._config.rows || []).forEach((e, i) => walk(e, 'r' + i));
    (this._config.chips || []).forEach((e, i) => walk(e, 'c' + i));
    this._tplList = list;
    this._tpl = {};
  }

  _subscribe() {
    this._unsubscribe();
    const conn = this._hass && this._hass.connection;
    if (!conn || !conn.subscribeMessage || !this._tplList.length) return;
    this._subs = this._tplList.map(({ key, template }) =>
      conn.subscribeMessage(
        (msg) => {
          const v = msg && msg.result != null ? String(msg.result) : '';
          if (this._tpl[key] === v) return;
          this._tpl[key] = v;
          this._repaint();
        },
        { type: 'render_template', template, report_errors: false }
      ).catch((err) => {
        console.warn('[onyx-cards] ' + t('log.template'), template, err);
        return null;
      }));
  }

  _unsubscribe() {
    if (!this._subs) return;
    for (const p of this._subs) {
      Promise.resolve(p).then((u) => { if (typeof u === 'function') u(); }).catch(() => {});
    }
    this._subs = null;
  }

  /** Ein Feld auflösen: Vorlage, fester Text oder nichts */
  _field(entry, field, key) {
    const raw = entry[field];
    if (raw == null) return null;
    if (isTpl(raw)) {
      const v = this._tpl[key + ':' + field];
      return v == null ? null : v;
    }
    return String(raw);
  }

  /* ---------------- Bausteine ---------------- */

  _modPresence(e) {
    const hass = this._hass;
    const ids = (e.people || []).filter(Boolean);
    const heim = ids.filter((id) => {
      const st = hass.states[id];
      return st && st.state === 'home';
    });
    const namen = heim.map((id) => nameOf(hass, id).split(' ')[0]);
    const detail = !ids.length ? ''
      : heim.length === ids.length && ids.length > 1 ? t('st.allHome')
      : heim.length ? namen.join(', ')
      : t('st.nobody');
    return {
      icon: heim.length ? 'mdi:home-account' : 'mdi:home-export-outline',
      name: e.name || t('st.home'),
      detail,
      color: heim.length ? ST_C.gruen : ST_C.grau,
      who: ids.map((id) => ({
        k: initial(nameOf(hass, id)),
        da: !!(hass.states[id] && hass.states[id].state === 'home')
      })),
      id: ids[0] || null
    };
  }

  _modVacuum(e) {
    const hass = this._hass;
    const st = hass.states[e.entity];
    if (!st) return null;
    const s = st.state;
    const room = e.room && hass.states[e.room] ? hass.states[e.room].state : '';
    const raum = ['unknown', 'unavailable', ''].includes(room) ? '' : room;
    const pct = st.attributes.cleaning_progress;
    const done = e.done && isOn(hass.states[e.done]);
    const name = e.name || nameOf(hass, e.entity);

    if (s === 'error') {
      return { icon: 'mdi:alert', name, detail: st.attributes.error || t('vac.error'),
        color: ST_C.rot, alarm: true, id: e.entity };
    }
    if (s === 'cleaning') {
      return { icon: 'mdi:robot-vacuum', name,
        detail: t('st.cleaning') + (raum ? ' · ' + raum : ''),
        color: ST_C.violett, percent: pct == null ? null : Number(pct),
        value: pct == null ? '' : nfmt(Number(pct), 0) + ' %', id: e.entity };
    }
    if (s === 'returning') {
      return { icon: 'mdi:robot-vacuum', name, detail: t('vac.returning'),
        color: ST_C.violett, id: e.entity };
    }
    if (s === 'paused') {
      return { icon: 'mdi:robot-vacuum', name, detail: t('vac.paused'),
        color: ST_C.orange, id: e.entity };
    }
    if (done) {
      return { icon: 'mdi:check-circle', name, detail: t('st.cleanedToday'),
        color: ST_C.gruen, id: e.entity };
    }
    return { icon: 'mdi:robot-vacuum', name, detail: t('st.notYetCleaned'),
      color: ST_C.grau, id: e.entity };
  }

  _modMower(e) {
    const hass = this._hass;
    const st = hass.states[e.entity];
    if (!st) return null;
    const s = st.state;
    const name = e.name || nameOf(hass, e.entity);
    if (s === 'error') {
      return { icon: 'mdi:alert', name, detail: t('vac.error'),
        color: ST_C.rot, alarm: true, id: e.entity };
    }
    if (s === 'mowing') {
      return { icon: 'mdi:robot-mower', name, detail: t('st.mowing'),
        color: ST_C.gruen, id: e.entity };
    }
    if (s === 'returning') {
      return { icon: 'mdi:robot-mower', name, detail: t('vac.returning'),
        color: ST_C.gruen, id: e.entity };
    }
    if (s === 'paused') {
      return { icon: 'mdi:robot-mower', name, detail: t('vac.paused'),
        color: ST_C.orange, id: e.entity };
    }
    // Angedockt hat nichts zu melden — die Zeile fällt weg
    return null;
  }

  _modCar(e) {
    const hass = this._hass;
    const st = hass.states[e.entity];
    if (!st) return null;
    const num = (id) => {
      const s = id && hass.states[id];
      if (!s || isDead(s)) return null;
      const n = Number(s.state);
      return isNaN(n) ? null : n;
    };
    const bat = num(e.entity);
    const laedt = e.charging && hass.states[e.charging]
      && hass.states[e.charging].state === 'charging';
    const kabel = e.cable && isOn(hass.states[e.cable]);
    const klima = e.climate && hass.states[e.climate]
      && !['off', 'unavailable', 'unknown'].includes(hass.states[e.climate].state);

    const bits = [];
    if (laedt) {
      const kw = num(e.power), min = num(e.remaining);
      let s = t('st.charging');
      if (kw != null) s += ' · ' + nfmt(kw, kw % 1 ? 1 : 0) + ' kW';
      if (min != null) s += ' · ' + t('st.stillMin', { n: nfmt(min, 0) });
      bits.push(s);
    } else if (kabel) {
      bits.push(t('st.pluggedIn'));
    }
    if (klima) bits.push(t('st.climateOn'));

    return {
      icon: laedt ? 'mdi:battery-charging' : 'mdi:car-electric',
      name: e.name || nameOf(hass, e.entity),
      detail: bits.join(' · '),
      color: laedt ? ST_C.gruen : ST_C.blau,
      percent: bat, value: bat == null ? '' : nfmt(bat, 0) + ' %',
      id: e.entity
    };
  }

  /** Ein Sensor in Prozent, als Balken. Grün, gelb, rot nach Füllstand. */
  _modBattery(e) {
    const hass = this._hass;
    const st = hass.states[e.entity];
    if (!st || isDead(st)) return null;
    const n = Number(st.state);
    if (isNaN(n)) return null;
    const laedt = e.charging && (isOn(hass.states[e.charging])
      || (hass.states[e.charging] && hass.states[e.charging].state === 'charging'));
    return {
      icon: laedt ? 'mdi:battery-charging'
        : n <= 15 ? 'mdi:battery-alert' : 'mdi:battery-70',
      name: e.name || nameOf(hass, e.entity),
      detail: laedt ? t('st.charging') : '',
      color: laedt ? ST_C.gruen : n <= 15 ? ST_C.rot : n <= 40 ? ST_C.orange : ST_C.gruen,
      percent: n, value: nfmt(n, 0) + ' %',
      id: e.entity
    };
  }

  /** Ein einfacher Eintrag: Entität, Vorlagen, oder beides gemischt */
  _plain(e, key) {
    const hass = this._hass;
    const st = e.entity ? hass.states[e.entity] : null;
    const name = this._field(e, 'name', key)
      || (e.entity ? nameOf(hass, e.entity) : '');
    let detail = this._field(e, 'detail', key);
    if (detail == null && st) detail = stateText(hass, st);
    const pctRaw = this._field(e, 'percent', key);
    const pct = pctRaw == null || pctRaw === '' ? null : Number(pctRaw);
    const col = this._field(e, 'color', key);
    return {
      icon: this._field(e, 'icon', key)
        || (st && st.attributes.icon) || 'mdi:information-outline',
      name,
      detail: detail || '',
      value: this._field(e, 'value', key) || '',
      percent: pct == null || isNaN(pct) ? null : pct,
      color: (col && (ST_C[col] || col)) || (st && isOn(st) ? ST_C.blau : ST_C.grau),
      id: e.entity || null
    };
  }

  /**
   * Ein Eintrag wird zur Zeile — oder zu nichts. Weggelassen wird, was
   * ein `hide` wahr macht, was ein Baustein für unnötig hält, und was
   * ohne Entität und ohne Text dasteht.
   */
  _entry(e, key) {
    if (!e) return null;
    const hide = this._field(e, 'hide', key);
    if (hide != null && ['true', 'True', 'on', '1'].includes(hide.trim())) return null;

    let out = null;
    if (e.module === 'presence') out = this._modPresence(e);
    else if (e.module === 'vacuum') out = this._modVacuum(e);
    else if (e.module === 'mower') out = this._modMower(e);
    else if (e.module === 'car') out = this._modCar(e);
    else if (e.module === 'battery') out = this._modBattery(e);
    else out = this._plain(e, key);
    if (!out) return null;

    // Was ausdrücklich in der Konfiguration steht, schlägt den Baustein
    for (const f of ['name', 'detail', 'value', 'icon']) {
      const v = this._field(e, f, key);
      if (v != null && v !== '') out[f] = v;
    }
    const col = this._field(e, 'color', key);
    if (col) out.color = ST_C[col] || col;

    if (!out.name && !out.detail) return null;
    return out;
  }

  _model() {
    const cfg = this._config;
    const rows = (cfg.rows || []).map((e, i) => this._entry(e, 'r' + i)).filter(Boolean);
    const chips = (cfg.chips || []).map((e, i) => this._entry(e, 'c' + i)).filter(Boolean);
    let head = cfg.head ? this._entry(cfg.head, 'h') : null;

    // Eine Störung ist wichtiger als alles andere und wandert nach oben
    const alarmAt = rows.findIndex((r) => r.alarm);
    if (alarmAt >= 0) {
      const [alarm] = rows.splice(alarmAt, 1);
      if (head) rows.unshift(head);
      head = alarm;
    }

    // Über einer leeren Karte steht keine Zeile "0 Meldungen"
    const n = rows.length + chips.length + (head ? 1 : 0);
    return {
      title: cfg.title || null,
      subtitle: cfg.subtitle === false ? null
        : (cfg.subtitle || (n ? t('st.nMessages', { n }) : null)),
      head, rows, chips
    };
  }

  _who(o) {
    if (!o.who || !o.who.length) return '';
    return `<span class="who">${o.who.map((w) => `
      <span class="${w.da ? '' : 'weg'}">${esc(w.k)}</span>`).join('')}</span>`;
  }

  _html(m) {
    const { cls, style } = paletteAttrs(this._config.color || null);

    const head = m.head ? `
      <div class="head" style="--t:${esc(m.head.color)}" data-e="${esc(m.head.id || '')}">
        <span class="i"><ha-icon icon="${esc(m.head.icon)}"></ha-icon></span>
        <span class="tx">
          <div class="n">${esc(m.head.name)}</div>
          ${m.head.detail ? `<div class="d">${esc(m.head.detail)}</div>` : ''}
        </span>
        ${this._who(m.head) || (m.head.value ? `<span class="v">${esc(m.head.value)}</span>` : '')}
      </div>` : '';

    const rows = m.rows.map((r) => `
      <div class="r" style="--t:${esc(r.color)}" data-e="${esc(r.id || '')}">
        <span class="i"><ha-icon icon="${esc(r.icon)}"></ha-icon></span>
        <span class="tx">
          <div class="n">${esc(r.name)}${r.detail ? ' · ' + esc(r.detail) : ''}</div>
          ${r.percent != null
            ? `<div class="bar"><i style="width:${clamp(r.percent, 0, 100)}%"></i></div>` : ''}
        </span>
        ${this._who(r) || (r.value ? `<span class="v">${esc(r.value)}</span>` : '')}
      </div>`).join('');

    const chips = m.chips.length ? `
      ${m.rows.length || head ? '<div class="divide"></div>' : ''}
      <div class="chips">
        ${m.chips.map((c) => `
          <span class="chip" style="--t:${esc(c.color)}" data-e="${esc(c.id || '')}">
            <i class="ci"><ha-icon icon="${esc(c.icon)}"></ha-icon></i
            ><span class="cl">${esc(c.name)}</span>
          </span>`).join('')}
      </div>` : '';

    const title = m.title ? `
      <div class="fhead">
        <div class="ftitle">${esc(m.title)}</div>
        ${m.subtitle ? `<div class="fsub">${esc(m.subtitle)}</div>` : ''}
      </div>` : '';

    const leer = !head && !m.rows.length && !m.chips.length
      ? `<div class="empty">${esc(t('st.quiet'))}</div>` : '';

    return `<ha-card class="${cls.trim()}"${style}>
      ${title}${head}<div class="rows">${rows}</div>${chips}${leer}
    </ha-card>`;
  }

  _bind() {
    this.shadowRoot.querySelectorAll('[data-e]').forEach((el) => {
      const id = el.dataset.e;
      if (!id) return;
      const go = () => fireMoreInfo(this, id);
      this._press(el, { onTap: go, onHold: go });
    });
  }

  getCardSize() {
    try {
      const m = this._model();
      return 1 + (m.head ? 2 : 0) + Math.ceil(m.rows.length * 0.8)
        + (m.chips.length ? 1 : 0);
    } catch (e) { return 3; }
  }
}


/* ================================================================== *
 * 13) KLIMA-KARTE
 * ================================================================== */

/** Der Bogen des Rings: von 7:30 Uhr im Uhrzeigersinn bis 4:30 — Lücke unten */
const CL_START = 225, CL_SPAN = 270;

/** Punkt auf dem Kreis. 0° ist oben, gezählt wird im Uhrzeigersinn. */
function clPolar(deg, r, cx, cy) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [(cx == null ? 50 : cx) + r * Math.cos(a), (cy == null ? 50 : cy) + r * Math.sin(a)];
}

/**
 * Wo im Ring hat der Finger aufgesetzt? Kommt der Punkt in der Lücke unten
 * an, wird auf das nähere Ende gerundet — sonst springt der Sollwert beim
 * Danebengreifen quer über die Skala.
 */
function clFraction(x, y) {
  const dx = x - 50, dy = y - 50;          // y wird von unten gezählt
  let deg = (Math.atan2(dx, dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const ENDE = (CL_START + CL_SPAN) % 360; // 135
  if (deg > ENDE && deg < CL_START) return deg < 180 ? 1 : 0;
  if (deg < CL_START) deg += 360;
  return clamp((deg - CL_START) / CL_SPAN, 0, 1);
}

/** Die Betriebsarten, die wir zeigen können — in dieser Reihenfolge */
const CL_MODES = {
  heat: { icon: 'mdi:fire' },
  cool: { icon: 'mdi:snowflake' },
  heat_cool: { icon: 'mdi:sun-snowflake-variant' },
  auto: { icon: 'mdi:autorenew' },
  dry: { icon: 'mdi:water-percent' },
  fan_only: { icon: 'mdi:fan' },
  off: { icon: 'mdi:power' }
};

/** Symbole für die gängigen Voreinstellungen; alles andere bekommt einen Punkt */
const CL_PRESETS = {
  none: 'mdi:circle-outline', home: 'mdi:home', comfort: 'mdi:sofa',
  eco: 'mdi:leaf', away: 'mdi:home-export-outline', sleep: 'mdi:weather-night',
  boost: 'mdi:rocket-launch', activity: 'mdi:run', frost: 'mdi:snowflake-alert'
};

const CL_FAN = {
  auto: 'mdi:fan-auto', low: 'mdi:fan-speed-1', medium: 'mdi:fan-speed-2',
  high: 'mdi:fan-speed-3', off: 'mdi:fan-off', on: 'mdi:fan'
};

class OnyxClimateCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    /* Wie die Raum-Karte: die Farbe gehört zum Gerät, nicht zum Zustand.
       Läuft nichts, bleibt sie — nur in den dunklen Grund gemischt. */
    ha-card{
      padding:14px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09); box-shadow:none; overflow:hidden;
      display:flex; flex-direction:column; gap:12px; container-type:inline-size;
      background:linear-gradient(to right bottom,
        color-mix(in srgb, var(--w1) 72%, var(--onyx-cold-1,#141419)) 0%,
        color-mix(in srgb, var(--w2) 72%, var(--onyx-cold-2,#17171d)) 100%);
    }
    ha-card.warm{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }
    ha-card.dead{ opacity:.55; }

    .head{ display:flex; align-items:center; justify-content:space-between; gap:11px; }
    .hleft{ display:flex; align-items:center; gap:11px; min-width:0; cursor:pointer; }
    .hico{ width:34px; height:34px; border-radius:50%; flex:none;
           background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10);
           display:grid; place-items:center; color:#8ea3b5; --mdc-icon-size:18px; }
    ha-card.warm .hico{ color:var(--acc); }
    .lab{ font-size:11px; line-height:14px; color:#6f8497; }
    ha-card.warm .lab{ color:var(--lab); }
    .nm{ font-size:13px; font-weight:600; line-height:18px; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .nm{ color:#e9f1f8; }
    .env{ text-align:right; line-height:1.35; font-variant-numeric:tabular-nums; }
    .env .t{ font-size:16px; font-weight:700; letter-spacing:-.02em; color:#9fb0be; }
    .env .h{ font-size:12px; color:#72879a; }
    ha-card.warm .env .t{ color:var(--acc); }
    ha-card.warm .env .h{ color:var(--sub); }

    /* Der Ring. Die Striche sind die Skala; jeder ganze Grad ist länger. */
    .dial{ position:relative; width:100%; aspect-ratio:1/.86; display:grid;
           place-items:center; touch-action:none; cursor:pointer; }
    .dial svg{ position:absolute; inset:0; width:100%; height:100%; }
    .cen{ position:relative; text-align:center; line-height:1;
          padding:6px 46px 30px; box-sizing:border-box; max-width:100%;
          pointer-events:none; }
    .soll{ font-size:52px; font-weight:300; letter-spacing:-.035em; color:#fff;
           font-variant-numeric:tabular-nums; }
    .soll sup{ font-size:20px; font-weight:400; vertical-align:top; top:.5em;
               position:relative; }
    .soll.zwei{ font-size:34px; letter-spacing:-.02em; }
    .soll.zwei sup{ font-size:15px; top:.35em; }
    .soll.aus{ color:#8ea3b5; }
    .act{ font-size:12.5px; color:#7b8fa0; margin-top:9px; }
    ha-card.warm .act{ color:var(--sub); }
    .act b{ color:var(--acc); font-weight:600; }
    .pre{ font-size:11px; color:#6f8497; margin-top:3px; text-transform:uppercase;
          letter-spacing:.08em; }
    ha-card.warm .pre{ color:var(--lab); }

    .pm{ position:absolute; bottom:2px; width:38px; height:38px; border-radius:50%;
         background:linear-gradient(rgba(255,255,255,.13), rgba(255,255,255,.045));
         -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
         border:1px solid rgba(255,255,255,.11); display:grid; place-items:center;
         color:#fff; --mdc-icon-size:19px; cursor:pointer;
         transition:transform .12s ease; }
    .pm.minus{ left:6px; } .pm.plus{ right:6px; }
    .pm.held{ transform:scale(.9); }
    .pm[disabled]{ opacity:.3; cursor:default; }

    /* Betriebsarten, Voreinstellungen, Lüfter */
    .modes{ display:flex; gap:7px; }
    .mode{ flex:1; min-width:0; height:42px; border-radius:12px;
           background:rgba(255,255,255,.055); border:1px solid transparent;
           display:flex; flex-direction:column; align-items:center;
           justify-content:center; gap:2px; font-size:10.5px; color:#a8c2d4;
           --mdc-icon-size:17px; cursor:pointer;
           transition:transform .12s ease, background .18s ease; }
    .mode span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
                max-width:100%; }
    .mode.on{ background:color-mix(in srgb, var(--btn) 55%, transparent);
              border-color:color-mix(in srgb, var(--btn) 72%, transparent); color:#fff; }
    .mode.held{ transform:scale(.95); }

    .pills{ display:flex; gap:6px; flex-wrap:wrap; }
    .pill{ height:28px; padding:0 11px 0 9px; border-radius:99px; font-size:11.5px;
           font-weight:600; background:rgba(255,255,255,.05);
           border:1px solid rgba(255,255,255,.08); color:#c3ccd6; cursor:pointer;
           display:flex; align-items:center; gap:6px; --mdc-icon-size:14px;
           min-width:0; max-width:100%; transition:transform .12s ease; }
    .pill span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .pill.on{ background:color-mix(in srgb, var(--btn) 55%, transparent);
              border-color:color-mix(in srgb, var(--btn) 72%, transparent); color:#fff; }
    .pill.held{ transform:scale(.95); }

    /* Auf einer halben Spalte fehlt den Beschriftungen der Platz */
    /* Auf einer halben Spalte wird der Ring quadratisch — sonst laufen die
       Zahl, die Zeile darunter und die beiden Knöpfe ineinander. */
    @container (max-width: 260px){
      .dial{ aspect-ratio:1/1.06; }
      .soll{ font-size:34px; }
      .soll.zwei{ font-size:21px; }
      .act{ font-size:11.5px; margin-top:7px; }
      .act .nowv{ display:none; }
      .env .t{ font-size:15px; white-space:nowrap; }
      .pre{ display:none; }
      .pm{ width:32px; height:32px; --mdc-icon-size:16px; bottom:0; }
      .pm.minus{ left:2px; } .pm.plus{ right:2px; }
      .mode{ height:38px; font-size:0; gap:0; }
      .mode ha-icon{ --mdc-icon-size:19px; }
      .pill{ padding:0 9px; }
      .env .h{ display:none; }
    }
    `;
  }

  static getStubConfig(hass) {
    return { type: 'custom:onyx-climate-card', entity: firstEntity(hass, 'climate') };
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'climate') {
      throw new Error(t('err.needClimate'));
    }
    super.setConfig(config);
  }

  /* ---------------- Modell ---------------- */

  _model() {
    const hass = this._hass, cfg = this._config;
    const st = hass.states[cfg.entity];
    if (!st) throw new Error(t('err.entity', { id: cfg.entity }));
    const a = st.attributes;
    const dead = isDead(st);

    const step = Number(a.target_temp_step) || 0.5;
    const min = a.min_temp == null ? 7 : Number(a.min_temp);
    const max = a.max_temp == null ? 35 : Number(a.max_temp);

    // Ein Gerät im Auto-Betrieb nennt zwei Sollwerte statt einem
    const low = a.target_temp_low == null ? null : Number(a.target_temp_low);
    const high = a.target_temp_high == null ? null : Number(a.target_temp_high);
    const zwei = low != null && high != null;
    const soll = a.temperature == null ? null : Number(a.temperature);

    const ist = cfg.temperature && hass.states[cfg.temperature]
      ? Number(hass.states[cfg.temperature].state)
      : (a.current_temperature == null ? null : Number(a.current_temperature));
    const feucht = cfg.humidity && hass.states[cfg.humidity]
      ? Number(hass.states[cfg.humidity].state)
      : (a.current_humidity == null ? null : Number(a.current_humidity));

    const modus = st.state;
    const aktion = a.hvac_action || null;
    // Was tut das Gerät gerade? `hvac_action` weiss es genau; fehlt sie,
    // schliessen wir vom Betriebsmodus auf das Wahrscheinliche.
    const laeuft = aktion
      ? ['heating', 'cooling', 'drying', 'fan'].includes(aktion)
      : modus !== 'off';

    const modi = (a.hvac_modes || []).filter((m) => CL_MODES[m]);
    const presets = cfg.show_presets === false ? []
      : (a.preset_modes || []).filter(Boolean);
    const fans = cfg.show_fan === false ? [] : (a.fan_modes || []).filter(Boolean);

    return {
      id: cfg.entity,
      name: cfg.name || nameOf(hass, cfg.entity),
      label: cfg.label || t('cl'),
      icon: cfg.icon || (aktion === 'cooling' ? 'mdi:snowflake' : 'mdi:radiator'),
      color: cfg.color || this._autoColor(aktion, modus),
      dead, min, max, step, zwei, soll, low, high, ist, feucht,
      modus, aktion, laeuft,
      modi: cfg.show_modes === false ? [] : modi,
      preset: a.preset_mode || null, presets,
      fan: a.fan_mode || null, fans
    };
  }

  /**
   * Ohne eigene Farbe färbt sich die Karte nach dem, was gerade passiert:
   * warm beim Heizen, kalt beim Kühlen, sonst neutral blau.
   */
  _autoColor(aktion, modus) {
    if (aktion === 'heating' || (!aktion && modus === 'heat')) return 'orange';
    if (aktion === 'cooling' || (!aktion && modus === 'cool')) return 'blau';
    if (aktion === 'drying' || (!aktion && modus === 'dry')) return 'gruen';
    return 'blau';
  }

  /* ---------------- Ring ---------------- */

  /** Temperatur → Winkel auf dem Bogen */
  _deg(m, v) {
    return CL_START + CL_SPAN * clamp((v - m.min) / (m.max - m.min), 0, 1);
  }

  _ring(m) {
    const farbe = m.laeuft ? 'var(--btn)' : 'rgba(255,255,255,.30)';
    // Ohne Sollwert — nicht erreichbar, oder ein Gerät das keinen nennt —
    // bleibt der ganze Ring grau. Ein einzelner heller Strich am Anfang
    // sähe nach Fehler aus.
    const ohne = m.dead || (m.zwei ? m.low == null : m.soll == null);
    const von = m.zwei ? m.low : m.min;
    const bis = m.zwei ? m.high : m.soll;

    let striche = '';
    // Halbe Grad als kurzer Strich, ganze als langer. Bei sehr weiten
    // Bereichen würden die halben zu einem Brei — dann nur ganze.
    const fein = (m.max - m.min) <= 32;
    const schritt = fein ? 0.5 : 1;
    for (let v = m.min; v <= m.max + 0.001; v += schritt) {
      const deg = this._deg(m, v);
      const ganz = Math.abs(v - Math.round(v)) < 0.01;
      const [x1, y1] = clPolar(deg, ganz ? 38 : 40);
      const [x2, y2] = clPolar(deg, 43);
      const hell = !ohne && v >= von - 0.001 && v <= bis + 0.001;
      striche += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}"
        x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"
        stroke="${hell ? farbe : 'rgba(255,255,255,.16)'}"
        stroke-width="${ganz ? 1.5 : 1}" stroke-linecap="round"/>`;
    }

    // Die Ist-Temperatur als weisser Punkt auf dem Bogen
    let punkt = '';
    if (!m.dead && m.ist != null && !isNaN(m.ist)) {
      const [ix, iy] = clPolar(this._deg(m, m.ist), 46);
      punkt = `<circle cx="${ix.toFixed(2)}" cy="${iy.toFixed(2)}" r="6"
                 fill="${farbe}" opacity=".28"/>
               <circle cx="${ix.toFixed(2)}" cy="${iy.toFixed(2)}" r="3.2" fill="#fff"/>`;
    }

    const [ax, ay] = clPolar(CL_START, 46);
    const [bx, by] = clPolar(CL_START + CL_SPAN, 46);
    return `<svg viewBox="0 0 100 100">
      <path d="M ${ax.toFixed(2)} ${ay.toFixed(2)} A 46 46 0 1 1 ${bx.toFixed(2)} ${by.toFixed(2)}"
        fill="none" stroke="rgba(255,255,255,.07)" stroke-width="5" stroke-linecap="round"/>
      ${striche}${punkt}
    </svg>`;
  }

  /* ---------------- Darstellung ---------------- */

  _zahl(v) {
    return nfmt(v, v % 1 ? 1 : 0);
  }

  _sollText(m) {
    if (m.zwei) {
      return `<div class="soll zwei${m.modus === 'off' ? ' aus' : ''}">${
        esc(this._zahl(m.low))}<sup>°</sup> – ${esc(this._zahl(m.high))}<sup>°</sup></div>`;
    }
    if (m.soll == null) {
      return `<div class="soll aus">–</div>`;
    }
    return `<div class="soll${m.modus === 'off' ? ' aus' : ''}">${
      this._grad(m.soll, m.step)}</div>`;
  }

  /**
   * Die grosse Zahl. Geht das Gerät in halben Grad, steht die Nachkommastelle
   * immer da — sonst wechselte die Zahl beim Verstellen ständig ihre Breite
   * und die ganze Karte zappelte.
   */
  _grad(v, step) {
    const ganz = Math.trunc(v);
    if (step >= 1) return `${esc(nfmt(ganz, 0))}<sup>°</sup>`;
    const rest = Math.abs(v - ganz);
    return `${esc(nfmt(ganz, 0))}<sup>${esc(nfmt(rest, 1).replace(/^0/, ''))}°</sup>`;
  }

  /** Die Zeile unter der Zahl: was das Gerät tut, und wie warm es wirklich ist */
  _actText(m) {
    const bits = [];
    if (m.dead) return esc(t('unavailable'));
    const tun = m.aktion ? t('cl.a.' + m.aktion, null, m.aktion)
      : m.modus === 'off' ? t('off') : t('cl.m.' + m.modus, null, m.modus);
    bits.push(`<b>${esc(tun)}</b>`);
    if (m.ist != null && !isNaN(m.ist)) {
      // Auf einer halben Spalte fällt der Teil weg: die Ist-Temperatur steht
      // dort schon oben rechts, zweimal wäre sie nur Gedränge.
      bits.push(`<span class="nowv">${esc(t('cl.now', { v: nfmt(m.ist, 1) }))}</span>`);
    }
    return bits.join('<span class="nowv"> · </span>');
  }

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const aus = m.modus === 'off' || m.dead;

    const modes = m.modi.length ? `<div class="modes">${m.modi.map((k) => `
      <div class="mode${k === m.modus ? ' on' : ''}" data-mode="${esc(k)}">
        <ha-icon icon="${CL_MODES[k].icon}"></ha-icon><span>${esc(t('cl.m.' + k, null, k))}</span>
      </div>`).join('')}</div>` : '';

    const presets = m.presets.length ? `<div class="pills">${m.presets.map((p) => `
      <span class="pill${p === m.preset ? ' on' : ''}" data-preset="${esc(p)}">
        <ha-icon icon="${CL_PRESETS[String(p).toLowerCase()] || 'mdi:circle-outline'}"></ha-icon
        ><span>${esc(t('cl.p.' + String(p).toLowerCase(), null, p))}</span>
      </span>`).join('')}</div>` : '';

    const fans = m.fans.length ? `<div class="pills">${m.fans.map((f) => `
      <span class="pill${f === m.fan ? ' on' : ''}" data-fan="${esc(f)}">
        <ha-icon icon="${CL_FAN[String(f).toLowerCase()] || 'mdi:fan'}"></ha-icon
        ><span>${esc(t('cl.f.' + String(f).toLowerCase(), null, f))}</span>
      </span>`).join('')}</div>` : '';

    return `
    <ha-card class="${m.laeuft ? 'warm' : ''}${cls}${m.dead ? ' dead' : ''}"${style}>
      <div class="head">
        <div class="hleft" id="head">
          <div class="hico"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
          <div style="min-width:0">
            <div class="lab">${esc(m.label)}</div>
            <div class="nm">${esc(m.name)}</div>
          </div>
        </div>
        <div class="env">
          ${m.ist != null && !isNaN(m.ist)
            ? `<div class="t">${esc(nfmt(m.ist, 1))} °C</div>` : ''}
          ${m.feucht != null && !isNaN(m.feucht)
            ? `<div class="h">${esc(nfmt(m.feucht, 0))} %</div>` : ''}
        </div>
      </div>

      <div class="dial" id="dial">
        ${this._ring(m)}
        <div class="cen">
          ${this._sollText(m)}
          <div class="act">${this._actText(m)}</div>
          ${m.preset && m.preset !== 'none'
            ? `<div class="pre">${esc(t('cl.p.' + String(m.preset).toLowerCase(), null, m.preset))}</div>`
            : ''}
        </div>
        <div class="pm minus" id="minus"${aus ? ' disabled' : ''}>
          <ha-icon icon="mdi:minus"></ha-icon></div>
        <div class="pm plus" id="plus"${aus ? ' disabled' : ''}>
          <ha-icon icon="mdi:plus"></ha-icon></div>
      </div>

      ${modes}${presets}${fans}
    </ha-card>`;
  }

  /* ---------------- Bedienung ---------------- */

  _bind(m) {
    const root = this.shadowRoot;

    const head = root.getElementById('head');
    if (head) this._press(head, { onTap: () => fireMoreInfo(this, m.id) });

    if (!m.dead) {
      const dial = root.getElementById('dial');
      const soll = root.querySelector('.soll');
      // Beim Ziehen wird nur die Zahl mitgeführt; gesendet wird erst beim
      // Loslassen. Sonst prasseln zwanzig Dienstaufrufe pro Wischer los.
      const zeigen = (v) => { if (soll) soll.innerHTML = this._grad(v, m.step); };
      if (dial && !m.zwei) {
        this._press(dial, {
          axis: 'xy',
          onTap: () => fireMoreInfo(this, m.id),
          onDrag: (p) => zeigen(this._wert(m, clFraction(p.x, p.y))),
          onDrop: (p) => this._setSoll(m, this._wert(m, clFraction(p.x, p.y)))
        });
      } else if (dial) {
        // Bei zwei Sollwerten wandert der nähere der beiden Griffe mit
        this._press(dial, {
          axis: 'xy',
          onTap: () => fireMoreInfo(this, m.id),
          onDrop: (p) => {
            const v = this._wert(m, clFraction(p.x, p.y));
            const nahLow = Math.abs(v - m.low) <= Math.abs(v - m.high);
            this._setBereich(m, nahLow ? v : m.low, nahLow ? m.high : v);
          }
        });
      }

      for (const [id, vz] of [['minus', -1], ['plus', 1]]) {
        const el = root.getElementById(id);
        if (!el || el.hasAttribute('disabled')) continue;
        this._press(el, { onTap: () => this._schritt(m, vz) });
      }
    }

    root.querySelectorAll('[data-mode]').forEach((el) => {
      this._press(el, { onTap: () => this.call('climate', 'set_hvac_mode',
        { entity_id: m.id, hvac_mode: el.dataset.mode }) });
    });
    root.querySelectorAll('[data-preset]').forEach((el) => {
      this._press(el, { onTap: () => this.call('climate', 'set_preset_mode',
        { entity_id: m.id, preset_mode: el.dataset.preset }) });
    });
    root.querySelectorAll('[data-fan]').forEach((el) => {
      this._press(el, { onTap: () => this.call('climate', 'set_fan_mode',
        { entity_id: m.id, fan_mode: el.dataset.fan }) });
    });
  }

  /** Anteil auf dem Bogen → Temperatur, auf die Schrittweite gerundet */
  _wert(m, frac) {
    const roh = m.min + frac * (m.max - m.min);
    const v = Math.round(roh / m.step) * m.step;
    // Fliesskommareste wie 21.900000000000002 abschneiden
    return clamp(Math.round(v * 100) / 100, m.min, m.max);
  }

  _schritt(m, vz) {
    if (m.zwei) {
      this._setBereich(m,
        clamp(m.low + vz * m.step, m.min, m.high),
        clamp(m.high + vz * m.step, m.low, m.max));
      return;
    }
    if (m.soll == null) return;
    this._setSoll(m, clamp(Math.round((m.soll + vz * m.step) * 100) / 100, m.min, m.max));
  }

  _setSoll(m, v) {
    this.call('climate', 'set_temperature', { entity_id: m.id, temperature: v });
  }

  _setBereich(m, low, high) {
    this.call('climate', 'set_temperature', {
      entity_id: m.id,
      target_temp_low: Math.round(low * 100) / 100,
      target_temp_high: Math.round(high * 100) / 100
    });
  }

  getCardSize() {
    const cfg = this._config || {};
    return 5 + (cfg.show_modes === false ? 0 : 1)
      + (cfg.show_presets === false ? 0 : 1);
  }
}


/* ================================================================== *
 * 14) ENERGIE-KARTE
 * ================================================================== */

/** Die Knoten des Flussbilds. Farben sind Rollen, nicht Kartenpalette. */
const EN_FARBE = {
  solar: '#f0c341', grid: '#ef5f68', battery: '#7fe0ab',
  house: '#8ad2f2', car: '#9b7bf5'
};
const EN_ICON = {
  solar: 'mdi:solar-power-variant', grid: 'mdi:transmission-tower',
  battery: 'mdi:home-battery', house: 'mdi:home-lightning-bolt',
  car: 'mdi:ev-station'
};

/**
 * Einen Leistungswert einlesen und auf Kilowatt bringen. Manche Sensoren
 * liefern Watt, manche Kilowatt — die Einheit entscheidet, nicht die Zahl.
 */
function enWatt(hass, id) {
  const st = id && hass.states[id];
  if (!st || isDead(st)) return null;
  const v = Number(st.state);
  if (isNaN(v)) return null;
  const u = String(st.attributes.unit_of_measurement || '').toLowerCase();
  if (u === 'w') return v / 1000;
  if (u === 'mw') return v * 1000;
  return v;
}

/** Eine Energiemenge einlesen und auf Kilowattstunden bringen */
function enKwh(hass, id) {
  const st = id && hass.states[id];
  if (!st || isDead(st)) return null;
  const v = Number(st.state);
  if (isNaN(v)) return null;
  const u = String(st.attributes.unit_of_measurement || '').toLowerCase();
  if (u === 'wh') return v / 1000;
  if (u === 'mwh') return v * 1000;
  return v;
}

class OnyxEnergyCard extends OnyxBase {
  static get CSS() {
    return PAL_CSS + `
    ha-card{
      padding:14px; border-radius:var(--onyx-r,24px);
      border:1px solid rgba(255,255,255,.09); box-shadow:none; overflow:hidden;
      display:flex; flex-direction:column; gap:12px; container-type:inline-size;
      background:linear-gradient(to right bottom,
        color-mix(in srgb, var(--w1) 72%, var(--onyx-cold-1,#141419)) 0%,
        color-mix(in srgb, var(--w2) 72%, var(--onyx-cold-2,#17171d)) 100%);
    }
    ha-card.warm{ background:linear-gradient(to right bottom, var(--w1) 0%, var(--w2) 100%); }

    .head{ display:flex; align-items:center; justify-content:space-between; gap:11px; }
    .hleft{ display:flex; align-items:center; gap:11px; min-width:0; cursor:pointer; }
    .hico{ width:34px; height:34px; border-radius:50%; flex:none;
           background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.10);
           display:grid; place-items:center; color:#8ea3b5; --mdc-icon-size:18px; }
    ha-card.warm .hico{ color:var(--acc); }
    .lab{ font-size:11px; line-height:14px; color:#6f8497; }
    ha-card.warm .lab{ color:var(--lab); }
    .nm{ font-size:13px; font-weight:600; line-height:18px; color:#c3ccd6;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    ha-card.warm .nm{ color:#e9f1f8; }
    .env{ text-align:right; line-height:1.35; font-variant-numeric:tabular-nums; }
    .env .t{ font-size:16px; font-weight:700; letter-spacing:-.02em; color:#9fb0be;
             white-space:nowrap; }
    .env .h{ font-size:12px; color:#72879a; white-space:nowrap; }
    ha-card.warm .env .t{ color:var(--acc); }
    ha-card.warm .env .h{ color:var(--sub); }

    /* Das Flussbild */
    .flow{ position:relative; width:100%; }
    .flow > svg{ position:absolute; inset:0; width:100%; height:100%; }
    .node{ position:absolute; width:96px; text-align:center;
           transform:translate(-50%,-50%); cursor:pointer;
           display:flex; flex-direction:column; }
    /* Bei Knoten, von denen die Linien nach unten weglaufen, steht die Zahl
       über dem Ring — sonst liegt sie mitten auf einer Linie. */
    .node.hoch{ flex-direction:column-reverse; }
    .node.hoch .v{ margin:0 0 5px; }
    .node .ring{ width:46px; height:46px; border-radius:50%; margin:0 auto;
                 display:grid; place-items:center; --mdc-icon-size:21px;
                 border:2px solid currentColor; background:#12151a;
                 transition:transform .12s ease; }
    .node.held .ring{ transform:scale(.9); }
    /* Ein Schatten hinter der Schrift, damit sie auch über einer Linie lesbar bleibt */
    .node .v{ font-size:12.5px; font-weight:700; margin-top:5px; color:#fff;
              font-variant-numeric:tabular-nums; align-self:center;
              padding:1px 7px; border-radius:7px;
              background:rgba(10,13,17,.72);
              -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px); }
    .node .s{ font-size:10px; color:#93a4b3; margin-top:2px; align-self:center;
              padding:0 6px; border-radius:6px; background:rgba(10,13,17,.6);
              max-width:100%; box-sizing:border-box;
              overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .node.aus{ opacity:.45; }

    /* Fliessender Strom: ein wanderndes Strichmuster. Punkte, die einzeln
       entlanglaufen, würden bei jedem neuen Messwert sichtbar zurück-
       springen — ein gleichmässiges Muster tut das nicht. */
    @keyframes onyxflow{ to{ stroke-dashoffset:-16; } }
    .line{ fill:none; stroke-linecap:round; }
    .line.aus{ stroke:rgba(255,255,255,.09); stroke-width:1; }
    .line.an{ stroke-dasharray:5 11; animation:onyxflow 1.1s linear infinite; }
    .line.rueck{ animation-direction:reverse; }
    .base{ fill:none; stroke:rgba(255,255,255,.07); stroke-linecap:round; }

    /* Kacheln für heute */
    .tiles{ display:flex; gap:7px; }
    .tile{ flex:1; min-width:0; border-radius:12px; background:rgba(255,255,255,.055);
           padding:9px 10px; line-height:1.3; cursor:pointer; }
    .tile .k{ font-size:10px; color:#8ea3b5; text-transform:uppercase;
              letter-spacing:.07em; white-space:nowrap; overflow:hidden;
              text-overflow:ellipsis; }
    .tile .v{ font-size:15px; font-weight:700; color:#fff; margin-top:2px;
              font-variant-numeric:tabular-nums; white-space:nowrap; }
    .tile .v small{ font-size:11px; font-weight:400; color:#93a4b3; margin-left:2px; }

    .foot{ display:flex; justify-content:space-between; align-items:baseline;
           gap:10px; font-size:11.5px; color:#7b8fa0; }
    ha-card.warm .foot{ color:var(--sub); }
    .foot b{ font-size:14px; color:#fff; font-weight:700;
             font-variant-numeric:tabular-nums; }
    .foot .gut b{ color:${EN_FARBE.battery}; }

    @container (max-width: 280px){
      .node{ width:72px; }
      .node .ring{ width:38px; height:38px; --mdc-icon-size:18px; }
      .node .v{ font-size:11px; margin-top:4px; }
      .node .s{ display:none; }
      /* Nebeneinander bleibt von den Beschriftungen nichts übrig —
         also untereinander, mit dem Wert rechts. */
      .tiles{ flex-direction:column; gap:5px; }
      .tile{ display:flex; align-items:baseline; justify-content:space-between;
             gap:8px; padding:7px 11px; }
      .tile .k{ font-size:10.5px; }
      .tile .v{ font-size:13.5px; margin-top:0; }
      .foot{ flex-direction:column; gap:2px; }
    }
    `;
  }

  static getStubConfig(hass) {
    return {
      type: 'custom:onyx-energy-card',
      grid: firstEntity(hass, 'sensor', (st) =>
        st.attributes.device_class === 'power')
    };
  }

  setConfig(config) {
    if (!config.grid && !config.grid_import && !config.solar) {
      throw new Error(t('err.needEnergy'));
    }
    super.setConfig(config);
  }

  /* ---------------- Modell ---------------- */

  _model() {
    const hass = this._hass, cfg = this._config;
    const W = (id) => enWatt(hass, id);
    const K = (id) => enKwh(hass, id);
    const r2 = (v) => (v == null ? null : Math.round(v * 100) / 100);

    // Netz: entweder ein Sensor mit Vorzeichen, oder zwei getrennte
    let bezug = 0, einspeisung = 0;
    if (cfg.grid_import || cfg.grid_export) {
      bezug = Math.max(0, W(cfg.grid_import) || 0);
      einspeisung = Math.max(0, W(cfg.grid_export) || 0);
    } else {
      const g = W(cfg.grid) || 0;
      // Vorgabe: positiv heisst Bezug. Wer es andersherum misst, dreht
      // das mit invert_grid um.
      const v = cfg.invert_grid ? -g : g;
      bezug = Math.max(0, v);
      einspeisung = Math.max(0, -v);
    }

    const solar = Math.max(0, W(cfg.solar) || 0);

    // Batterie: positiv heisst entladen. Auch hier umkehrbar.
    let battRoh = W(cfg.battery);
    if (battRoh != null && cfg.invert_battery) battRoh = -battRoh;
    const entladung = Math.max(0, battRoh || 0);
    const ladung = Math.max(0, -(battRoh || 0));
    const battStand = (() => {
      const st = cfg.battery_level && hass.states[cfg.battery_level];
      if (!st || isDead(st)) return null;
      const v = Number(st.state);
      return isNaN(v) ? null : Math.round(v);
    })();

    const auto = Math.max(0, W(cfg.car) || 0);

    // Der Hausverbrauch ist selten gemessen — meist ergibt er sich aus dem
    // Rest. Was hereinkommt, muss irgendwo hin.
    const gemessen = W(cfg.house);
    const haus = gemessen != null ? Math.max(0, gemessen)
      : Math.max(0, solar + bezug + entladung - einspeisung - ladung);

    /* Wer speist wen? Die Sonne wird zuerst dem Haus zugerechnet, dann der
       Batterie, der Rest geht ins Netz — dieselbe Reihenfolge, die auch
       Home Assistant im Energie-Dashboard annimmt. */
    const solarNachHaus = Math.min(solar, Math.max(0, haus - entladung - bezug));
    const solarNachBatt = Math.min(Math.max(0, solar - solarNachHaus), ladung);
    const solarNachNetz = Math.max(0, solar - solarNachHaus - solarNachBatt);
    const netzNachBatt = Math.max(0, ladung - solarNachBatt);

    // Wie viel des Verbrauchs kam aus eigener Erzeugung?
    const eigen = solarNachHaus + entladung;
    const quote = haus > 0.01 ? clamp(Math.round((eigen / haus) * 100), 0, 100) : null;

    const kanten = [
      { von: 'solar', nach: 'house', wert: r2(solarNachHaus), farbe: EN_FARBE.solar },
      { von: 'solar', nach: 'battery', wert: r2(solarNachBatt), farbe: EN_FARBE.solar },
      { von: 'solar', nach: 'grid', wert: r2(solarNachNetz), farbe: EN_FARBE.solar },
      { von: 'grid', nach: 'house', wert: r2(Math.max(0, bezug - netzNachBatt)),
        farbe: EN_FARBE.grid },
      { von: 'grid', nach: 'battery', wert: r2(netzNachBatt), farbe: EN_FARBE.grid },
      { von: 'battery', nach: 'house', wert: r2(entladung), farbe: EN_FARBE.battery },
      { von: 'house', nach: 'car', wert: r2(auto), farbe: EN_FARBE.car }
    ].filter((k) => k.wert != null && k.wert > 0.005);

    return {
      hatSolar: !!cfg.solar,
      hatBatterie: !!cfg.battery,
      hatAuto: !!cfg.car,
      name: cfg.name || t('en.home'),
      label: cfg.label || t('en'),
      color: cfg.color || 'gelb',
      solar: r2(solar), bezug: r2(bezug), einspeisung: r2(einspeisung),
      entladung: r2(entladung), ladung: r2(ladung), battStand,
      haus: r2(haus), auto: r2(auto), quote, kanten,
      heute: {
        solar: K(cfg.today_solar), bezug: K(cfg.today_import),
        einspeisung: K(cfg.today_export), haus: K(cfg.today_house)
      },
      geld: this._geld(),
      ids: {
        solar: cfg.solar || null,
        grid: cfg.grid || cfg.grid_import || null,
        battery: cfg.battery || cfg.battery_level || null,
        house: cfg.house || null,
        car: cfg.car || null
      }
    };
  }

  /**
   * Kosten und Ersparnis. Wer fertige Sensoren hat, gibt sie an; wer
   * stattdessen Preise einträgt, bekommt sie aus den Tagesmengen gerechnet.
   * Wer nichts angibt, sieht die Zeile nicht.
   */
  _geld() {
    const hass = this._hass, cfg = this._config;
    const zahl = (id) => {
      const st = id && hass.states[id];
      if (!st || isDead(st)) return null;
      const v = Number(st.state);
      return isNaN(v) ? null : v;
    };
    let kosten = zahl(cfg.cost_today);
    let gespart = zahl(cfg.saved_today);

    const bezug = enKwh(hass, cfg.today_import);
    const eingespeist = enKwh(hass, cfg.today_export);
    const erzeugt = enKwh(hass, cfg.today_solar);
    const pE = Number(cfg.price_import);
    const pA = Number(cfg.price_export);

    if (kosten == null && bezug != null && !isNaN(pE)) kosten = bezug * pE;
    if (gespart == null && !isNaN(pE)) {
      // Gespart ist, was nicht bezogen werden musste, plus die Vergütung
      const selbst = erzeugt != null && eingespeist != null
        ? Math.max(0, erzeugt - eingespeist) : null;
      if (selbst != null) {
        gespart = selbst * pE + (eingespeist != null && !isNaN(pA) ? eingespeist * pA : 0);
      }
    }
    const w = (v) => (v == null ? null : Math.round(v * 100) / 100);
    return { kosten: w(kosten), gespart: w(gespart),
      einheit: cfg.currency || t('en.currency') };
  }

  /* ---------------- Flussbild ---------------- */

  _plaetze(m) {
    // Ohne Auto reicht eine Raute; mit Auto rückt alles hoch und das
    // Auto hängt unter dem Haus.
    if (m.hatAuto) {
      return { hoehe: '1/1.18', solar: [50, 12], grid: [13, 38],
        battery: [87, 38], house: [50, 64], car: [50, 91] };
    }
    return { hoehe: '1/0.98', solar: [50, 15], grid: [13, 46],
      battery: [87, 46], house: [50, 82] };
  }

  _flow(m) {
    const P = this._plaetze(m);
    const sichtbar = ['grid', 'house']
      .concat(m.hatSolar ? ['solar'] : [])
      .concat(m.hatBatterie ? ['battery'] : [])
      .concat(m.hatAuto ? ['car'] : []);

    const pfad = (a, b) => {
      const [x1, y1] = P[a], [x2, y2] = P[b];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
    };

    // Erst alle möglichen Verbindungen blass, dann die aktiven darüber
    const paare = [
      ['solar', 'house'], ['solar', 'battery'], ['solar', 'grid'],
      ['grid', 'house'], ['grid', 'battery'], ['battery', 'house'],
      ['house', 'car']
    ].filter(([a, b]) => sichtbar.includes(a) && sichtbar.includes(b));

    const grund = paare.map(([a, b]) =>
      `<path class="base" d="${pfad(a, b)}" stroke-width="1"/>`).join('');

    const groesste = Math.max(0.2, ...m.kanten.map((k) => k.wert));
    const aktiv = m.kanten.map((k) => {
      // Dicke nach Leistung, aber nie so dünn dass man sie übersieht
      const dick = (1.6 + 2.6 * Math.sqrt(k.wert / groesste)).toFixed(2);
      return `<path class="line an" d="${pfad(k.von, k.nach)}"
        stroke="${k.farbe}" stroke-width="${dick}" opacity=".95"/>`;
    }).join('');

    const knoten = sichtbar.map((k) => {
      const [x, y] = P[k];
      const info = this._knotenText(m, k);
      const hoch = k === 'solar';
      return `<div class="node${info.aus ? ' aus' : ''}${hoch ? ' hoch' : ''}"
           style="left:${x}%;top:${y}%;color:${EN_FARBE[k]}" data-node="${k}">
        <div class="ring"><ha-icon icon="${esc(info.icon)}"></ha-icon></div>
        <div class="v">${esc(info.wert)}</div>
        ${info.unter ? `<div class="s">${esc(info.unter)}</div>` : ''}
      </div>`;
    }).join('');

    return `<div class="flow" style="aspect-ratio:${P.hoehe}">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">${grund}${aktiv}</svg>
      ${knoten}
    </div>`;
  }

  /** Was steht unter einem Knoten? */
  _knotenText(m, k) {
    const kw = (v) => nfmt(v, 2) + ' kW';
    if (k === 'solar') {
      return { icon: EN_ICON.solar, wert: kw(m.solar), aus: m.solar < 0.005 };
    }
    if (k === 'grid') {
      const raus = m.einspeisung > m.bezug;
      return {
        icon: raus ? 'mdi:transmission-tower-import' : 'mdi:transmission-tower-export',
        wert: kw(raus ? m.einspeisung : m.bezug),
        unter: t(raus ? 'en.export' : 'en.import'),
        aus: m.bezug < 0.005 && m.einspeisung < 0.005
      };
    }
    if (k === 'battery') {
      const laedt = m.ladung > m.entladung;
      const still = m.ladung < 0.005 && m.entladung < 0.005;
      return {
        icon: laedt ? 'mdi:battery-charging-70'
          : still ? 'mdi:home-battery' : 'mdi:battery-arrow-down',
        wert: kw(laedt ? m.ladung : m.entladung),
        unter: m.battStand == null ? null : nfmt(m.battStand, 0) + ' %',
        aus: still
      };
    }
    if (k === 'car') {
      return { icon: EN_ICON.car, wert: kw(m.auto), aus: m.auto < 0.005 };
    }
    return { icon: EN_ICON.house, wert: kw(m.haus), aus: m.haus < 0.005 };
  }

  /* ---------------- Darstellung ---------------- */

  _html(m) {
    const { cls, style } = paletteAttrs(m.color);
    const kwh = (v) => (v == null ? null
      : `${esc(nfmt(v, v >= 100 ? 0 : 1))}<small>kWh</small>`);

    const felder = [
      ['en.produced', m.heute.solar, m.ids.solar],
      ['en.imported', m.heute.bezug, m.ids.grid],
      ['en.exported', m.heute.einspeisung, m.ids.grid]
    ].filter(([, v]) => v != null);
    const kacheln = felder.length ? `<div class="tiles">${felder.map(([k, v, id]) => `
      <div class="tile" data-e="${esc(id || '')}">
        <div class="k">${esc(t(k))}</div><div class="v">${kwh(v)}</div>
      </div>`).join('')}</div>` : '';

    const g = m.geld;
    const geldTeile = [];
    if (g.kosten != null) {
      geldTeile.push(`<span>${esc(t('en.paid'))} <b>${esc(nfmt(g.kosten, 2))}</b> ${
        esc(g.einheit)}</span>`);
    }
    if (g.gespart != null) {
      geldTeile.push(`<span class="gut">${esc(t('en.saved'))} <b>${
        esc(nfmt(g.gespart, 2))}</b> ${esc(g.einheit)}</span>`);
    }
    const geld = geldTeile.length ? `<div class="foot">${geldTeile.join('')}</div>` : '';

    // Oben rechts steht, was gerade am meisten zählt: läuft die Anlage,
    // ist es die Erzeugung; sonst der Bezug aus dem Netz.
    const laeuft = m.solar > 0.005;
    const rechts = laeuft
      ? `<div class="t">${esc(nfmt(m.solar, 2))} kW</div>${
          m.quote == null ? '' : `<div class="h">${esc(t('en.own', { n: m.quote }))}</div>`}`
      : `<div class="t">${esc(nfmt(m.bezug, 2))} kW</div>
         <div class="h">${esc(t('en.fromGrid'))}</div>`;

    return `
    <ha-card class="${laeuft ? 'warm' : ''}${cls}"${style}>
      <div class="head">
        <div class="hleft" id="head">
          <div class="hico"><ha-icon icon="mdi:transmission-tower"></ha-icon></div>
          <div style="min-width:0">
            <div class="lab">${esc(m.label)}</div>
            <div class="nm">${esc(m.name)}</div>
          </div>
        </div>
        <div class="env">${rechts}</div>
      </div>
      ${this._flow(m)}
      ${kacheln}${geld}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;
    const head = root.getElementById('head');
    if (head && m.ids.grid) {
      this._press(head, { onTap: () => fireMoreInfo(this, m.ids.grid) });
    }
    root.querySelectorAll('[data-node]').forEach((el) => {
      const id = m.ids[el.dataset.node];
      if (!id) return;
      const go = () => fireMoreInfo(this, id);
      this._press(el, { onTap: go, onHold: go });
    });
    root.querySelectorAll('.tile[data-e]').forEach((el) => {
      const id = el.dataset.e;
      if (!id) return;
      this._press(el, { onTap: () => fireMoreInfo(this, id) });
    });
  }

  getCardSize() {
    const cfg = this._config || {};
    return 6 + (cfg.today_solar || cfg.today_import ? 1 : 0);
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
  entities: 'ed.h.entities', columns: 'ed.h.columns', graphs: 'ed.h.graphs',
  fill: 'ed.h.fill', unit: 'ed.h.unit', y_axis: 'ed.h.y_axis',
  woche: 'ed.h.perEntity', monat: 'ed.h.perEntity', jahr: 'ed.h.perEntity',
  battery_entity: 'ed.h.battery_entity', room_command: 'ed.h.room_command',
  consumables: 'ed.h.consumables',
  lights: 'ed.h.lights', cover_auto: 'ed.h.cover_auto', cover_wind: 'ed.h.cover_wind',
  cover_favorite: 'ed.h.cover_favorite',
  position: 'ed.h.position', tilt: 'ed.h.tilt', stop: 'ed.h.stopOnly'
};

/** Hilfetexte, die nur in der Energie-Karte gelten */
const EN_HELP = {
  grid: 'ed.h.grid', invert_grid: 'ed.h.invert_grid', battery: 'ed.h.battery',
  house: 'ed.h.house', price_import: 'ed.h.price_import',
  price_export: 'ed.h.price_import'
};

/** Hilfetexte, die nur in der Status-Karte gelten */
const ST_HELP = {
  hide: 'ed.h.hide', detail: 'ed.h.detail', percent: 'ed.h.percent',
  value: 'ed.h.value', people: 'ed.h.people', done: 'ed.h.done',
  charging: 'ed.h.charging', room: 'ed.h.room', module: 'ed.h.module'
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

  /* Eingeklappte Einträge — ein Streifen je Zeile, Klick klappt auf */
  .items{ display:flex; flex-direction:column; gap:8px; }
  .item{ display:flex; flex-direction:column; }
  .strip{ display:flex; align-items:center; gap:10px; padding:8px 6px 8px 11px;
          border:1px solid var(--divider-color, rgba(127,127,127,.3));
          border-radius:11px; cursor:pointer; }
  .strip:hover{ background:var(--secondary-background-color, rgba(127,127,127,.08)); }
  .item.on .strip{ border-color:var(--primary-color, #38a3f1);
                   border-radius:11px 11px 0 0; }
  .strip .ic{ width:26px; height:26px; border-radius:8px; flex:none; display:grid;
              place-items:center; --mdc-icon-size:16px;
              color:var(--primary-color, #38a3f1);
              background:color-mix(in srgb, var(--primary-color, #38a3f1) 16%, transparent); }
  .strip .tx{ flex:1; min-width:0; }
  .strip .n{ display:block; font-size:13.5px; line-height:18px;
             color:var(--primary-text-color);
             overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .strip .d{ display:block; font-size:11.5px; line-height:15px;
             color:var(--secondary-text-color);
             overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .strip .d:empty{ display:none; }
  .strip .tools{ display:flex; align-items:center; flex:none; }
  .strip .tools .btn.x{ margin-top:0; }
  .strip .btn.x[disabled]{ opacity:.3; cursor:default; }
  .body{ border:1px solid var(--primary-color, #38a3f1); border-top:none;
         border-radius:0 0 11px 11px; padding:12px;
         display:flex; flex-direction:column; gap:10px; }
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
    // Alles, was mehr trägt als die blosse Entität — Name, Symbol,
    // Wunschposition —, bleibt erhalten. Sonst würfe ein Griff in die
    // Liste im visuellen Editor die Feinheiten stillschweigend weg.
    if (kept && Object.keys(kept).length > 1) return Object.assign({}, kept);
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

/**
 * Eine einzelne Aktion so knapp wie möglich schreiben. Was im YAML steht
 * und der Editor gar nicht anbietet — eine eigene Farbe, ein tap_action —
 * bleibt dabei erhalten; sonst wäre es nach dem ersten Öffnen des Editors
 * verschwunden.
 */
function packItem(it) {
  if (!it || !it.entity) return null;
  const o = {};
  for (const key of Object.keys(it)) {
    const v = it[key];
    if (v === '' || v === null || v === undefined) continue;
    o[key] = v;
  }
  return Object.keys(o).length === 1 ? it.entity : o;
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

  /** Ein kleiner Knopf im Stil des Editors */
  _btn(icon, text, onClick, cls, title) {
    const b = document.createElement('button');
    b.className = 'btn' + (cls ? ' ' + cls : '');
    b.type = 'button';
    b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>${text ? '<span></span>' : ''}`;
    if (text) b.querySelector('span').textContent = text;
    if (title) b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  /** Eine Zwischenüberschrift */
  _section(label) {
    const h = document.createElement('div');
    h.className = 'sec';
    h.textContent = label;
    return h;
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
  static get DEFAULTS() { return { tinted: false, fill: true, y_axis: true }; }

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
        fieldBool('tinted'),
        fieldBool('fill'),
        fieldBool('y_axis')
      ),
      {
        name: 'graphs',
        selector: {
          select: {
            mode: 'dropdown',
            options: [{ value: 'all', label: t('ed.graphsAll') }]
              .concat([1, 2, 3, 4].map((n) => ({ value: String(n),
                label: t(n === 1 ? 'ed.graphsOne' : 'ed.graphsN', { n }) })))
          }
        }
      }
    ];
  }

  _toForm(c) {
    return {
      graphs: c.graphs == null || c.graphs === '' ? 'all' : String(c.graphs),
      entities: (normList(c.entities) || []).map((e) => e.entity),
      title: c.title || '',
      label: c.label || '',
      icon: c.icon || '',
      color: c.color || '',
      period: PERIOD_ALIAS[String(c.period || 'tag').toLowerCase()] || 'tag',
      tinted: c.tinted === true,
      fill: c.fill !== false,
      y_axis: c.y_axis !== false
    };
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    // Die Karte verträgt höchstens vier — lieber hier abschneiden als
    // eine Konfiguration speichern, die beim Laden auf einen Fehler läuft.
    const ids = (data.entities || []).slice(0, 4);
    this._tooMany = (data.entities || []).length > 4;
    // "alle" ist der Normalfall und muss nicht in der YAML stehen
    if (!data.graphs || data.graphs === 'all') delete cfg.graphs;
    else cfg.graphs = Number(data.graphs);
    cfg.entities = mergeList(ids, this._config.entities);
    return cfg;
  }

  /** Die Felder einer einzelnen Reihe */
  _reiheSchema() {
    const SENS = ['sensor', 'counter', 'input_number', 'number'];
    return [
      grid(fieldText('name'), fieldText('unit')),
      fieldColor(),
      grid(fieldEntity('woche', SENS), fieldEntity('monat', SENS)),
      fieldEntity('jahr', SENS)
    ];
  }

  /** Was der Streifen zeigt, solange die Reihe zu ist */
  _reiheZeile(e) {
    const teile = [];
    if (e.unit) teile.push(e.unit);
    for (const k of ['woche', 'monat', 'jahr']) {
      if (e[k]) teile.push(t('period.' + k));
    }
    return teile.length ? teile.join(' \u00b7 ') : e.entity;
  }

  /** Eine Reihe schreiben — leere Felder fliegen wieder raus */
  _setReihe(i, daten) {
    const liste = normList(this._config.entities) || [];
    if (!liste[i]) return;
    const e = Object.assign({}, liste[i]);
    for (const k of ['name', 'unit', 'color', 'woche', 'monat', 'jahr']) {
      const v = daten[k];
      if (v == null || v === '') delete e[k];
      else e[k] = v;
    }
    const neu = liste.map((alt, k) => {
      const o = k === i ? e : alt;
      // Trägt der Eintrag nichts ausser der Entität, bleibt er die kurze Form
      return Object.keys(o).length > 1 ? o : o.entity;
    });
    const cfg = Object.assign({}, this._config, { entities: neu });
    this._reihenSig = null;
    this._emit(cfg);
  }

  _extra(root) {
    if (!this._note) {
      this._note = document.createElement('p');
      this._note.className = 'warn';
      root.appendChild(this._note);
      root.appendChild(this._section(t('ed.reihen')));
      this._reihenHint = document.createElement('p');
      this._reihenHint.className = 'hint';
      this._reihenHint.textContent = t('ed.h.reihen');
      root.appendChild(this._reihenHint);
      this._reihenBox = document.createElement('div');
      this._reihenBox.className = 'items';
      root.appendChild(this._reihenBox);
    }
    this._note.textContent = this._tooMany ? t('ed.tooMany') : '';

    const liste = normList(this._config.entities) || [];
    const sig = [this._reihenOffen, liste.map((e) => JSON.stringify(e)).join('|')].join('~');
    if (sig === this._reihenSig) {
      for (const f of this._reihenForms) this._fillForm(f.form, f.schema, f.data);
      return;
    }
    this._reihenSig = sig;
    this._reihenForms = [];
    this._reihenBox.textContent = '';

    liste.forEach((e, i) => {
      const offen = this._reihenOffen === e.entity;
      const box = document.createElement('div');
      box.className = 'item' + (offen ? ' on' : '');

      const strip = document.createElement('div');
      strip.className = 'strip';
      strip.innerHTML = `
        <span class="ic"><ha-icon icon="mdi:chart-line"></ha-icon></span>
        <span class="tx"><span class="n"></span><span class="d"></span></span>`;
      strip.querySelector('.n').textContent = e.name || nameOf(this._hass, e.entity);
      strip.querySelector('.d').textContent = this._reiheZeile(e);
      const auf = () => {
        this._reihenOffen = offen ? null : e.entity;
        this._reihenSig = null;
        this._render();
      };
      strip.addEventListener('click', (ev) => {
        if (ev.target.closest('.tools')) return;
        auf();
      });
      const tools = document.createElement('span');
      tools.className = 'tools';
      tools.appendChild(this._btn(offen ? 'mdi:chevron-up' : 'mdi:chevron-down', '',
        auf, 'x'));
      strip.appendChild(tools);
      box.appendChild(strip);

      if (offen) {
        const body = document.createElement('div');
        body.className = 'body';
        const form = this._makeForm((d) => this._setReihe(i, d));
        this._reihenForms.push({
          form,
          schema: this._reiheSchema(),
          data: {
            name: e.name || '', unit: e.unit || '', color: e.color || '',
            woche: e.woche || e.week || '', monat: e.monat || e.month || '',
            jahr: e.jahr || e.year || ''
          }
        });
        body.appendChild(form);
        box.appendChild(body);
      }
      this._reihenBox.appendChild(box);
    });

    for (const f of this._reihenForms) this._fillForm(f.form, f.schema, f.data);
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
      fieldEntity('lights', ['light', 'switch'], true),
      fieldEntity('covers', 'cover', true),
      grid(
        fieldEntity('cover_auto', ['input_boolean', 'switch', 'automation']),
        fieldEntity('cover_wind', ['input_boolean', 'switch', 'automation'])
      ),
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
      cover_auto: c.cover_auto || '',
      cover_wind: c.cover_wind || '',
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

  /* ---------------- Wunschpositionen der Storen ---------------- */

  /** In welchen Schlüssel die Storenliste geschrieben wird */
  _coverKey() {
    for (const k of GROUP_KEYS.cover) if (this._config[k]) return k;
    return 'covers';
  }

  /** Die Storen, die der Abschnitt zeigt — aus der Liste oder aus dem Bereich */
  _coverEntries() {
    const listed = normList(OnyxRoomCard._listFor(this._config, 'cover'));
    if (listed) return { liste: true, eintraege: listed };
    if (!this._config.area) return { liste: false, eintraege: [] };
    return {
      liste: false,
      eintraege: entitiesInArea(this._hass, this._config.area, 'cover')
        .map((entity) => ({ entity }))
    };
  }

  /** Eine Wunschposition setzen oder löschen und die Liste zurückschreiben */
  _setFav(id, fav) {
    const cfg = Object.assign({}, this._config);
    const key = this._coverKey();
    const liste = this._coverEntries().eintraege;
    const knapp = (e) => (Object.keys(e).length > 1 ? e : e.entity);
    const neu = liste.map((e) => {
      if (e.entity !== id) return knapp(Object.assign({}, e));
      const o = Object.assign({}, e);
      if (fav == null) delete o.favorite;
      else o.favorite = fav;
      return knapp(o);
    });
    for (const k of GROUP_KEYS.cover) delete cfg[k];
    cfg[key] = neu;
    this._favOpen = id;
    this._favSig = null;
    this._emit(cfg);
  }

  /** Die Storen des Bereichs als feste Liste übernehmen */
  _materialisieren() {
    const cfg = Object.assign({}, this._config);
    cfg[this._coverKey()] = this._coverEntries().eintraege.map((e) => e.entity);
    this._favSig = null;
    this._emit(cfg);
  }

  /** Was der Streifen zeigt, solange die Store zu ist */
  _favZeile(fav) {
    if (fav === 'stop') return t('favStop');
    if (!fav) return t('ed.favNone');
    return favTitel(fav);
  }

  _favSchema(id, fav) {
    const st = this._hass.states[id];
    const kannWinkel = !!(st && (st.attributes.current_tilt_position != null
      || ((st.attributes.supported_features || 0) & 16)));
    const halt = { name: 'stop', selector: { boolean: {} } };
    if (fav === 'stop') return [halt];
    const regler = (name) => ({
      name,
      selector: { number: { min: 0, max: 100, step: 1, mode: 'slider',
        unit_of_measurement: '%' } }
    });
    // Die Regler stehen oben: das ist der Normalfall. Der Somfy-Schalter
    // ist der Sonderfall und darf darunter warten.
    return [kannWinkel ? grid(regler('position'), regler('tilt')) : regler('position'),
      halt];
  }

  _extra(root) {
    if (!this._favBox) {
      this._note = document.createElement('p');
      this._note.className = 'hint';
      this._note.textContent = t('ed.roomHint');
      root.appendChild(this._note);
      root.appendChild(this._section(t('ed.favs')));
      this._favHint = document.createElement('p');
      this._favHint.className = 'hint';
      root.appendChild(this._favHint);
      this._favBox = document.createElement('div');
      this._favBox.className = 'items';
      root.appendChild(this._favBox);
    }

    const { liste, eintraege } = this._coverEntries();
    this._favHint.textContent = liste ? t('ed.h.favs') : t('ed.h.favsArea');

    const sig = [liste, this._favOpen, eintraege.map((e) =>
      e.entity + ':' + JSON.stringify(e.favorite == null ? '' : e.favorite)).join('|')
    ].join('~');
    if (sig === this._favSig) {
      for (const f of this._favForms) this._fillForm(f.form, f.schema, f.data);
      return;
    }
    this._favSig = sig;
    this._favForms = [];
    this._favBox.textContent = '';

    if (!liste && eintraege.length) {
      const adds = document.createElement('div');
      adds.className = 'adds';
      adds.appendChild(this._btn('mdi:format-list-bulleted', t('ed.listCovers'),
        () => this._materialisieren()));
      this._favBox.appendChild(adds);
      return;
    }

    for (const eintrag of eintraege) {
      const id = eintrag.entity;
      const fav = coverFav(eintrag, {});          // ohne Kartenvorgabe: nur das Eigene
      const offen = this._favOpen === id;

      const box = document.createElement('div');
      box.className = 'item' + (offen ? ' on' : '');

      const strip = document.createElement('div');
      strip.className = 'strip';
      strip.innerHTML = `
        <span class="ic"><ha-icon icon="mdi:window-shutter"></ha-icon></span>
        <span class="tx"><span class="n"></span><span class="d"></span></span>`;
      strip.querySelector('.n').textContent = nameOf(this._hass, id);
      strip.querySelector('.d').textContent = this._favZeile(fav);
      strip.addEventListener('click', (ev) => {
        if (ev.target.closest('.tools')) return;
        this._favOpen = offen ? null : id;
        this._favSig = null;
        this._render();
      });

      const tools = document.createElement('span');
      tools.className = 'tools';
      if (fav) {
        tools.appendChild(this._btn('mdi:close', '', () => this._setFav(id, null),
          'x', t('ed.clearFav')));
      }
      tools.appendChild(this._btn(offen ? 'mdi:chevron-up' : 'mdi:chevron-down', '',
        () => { this._favOpen = offen ? null : id; this._favSig = null; this._render(); },
        'x'));
      strip.appendChild(tools);
      box.appendChild(strip);

      if (offen) {
        const body = document.createElement('div');
        body.className = 'body';
        const daten = fav === 'stop'
          ? { stop: true, position: 0, tilt: 0 }
          : { stop: false,
              position: (fav && fav.position != null) ? fav.position : 0,
              tilt: (fav && fav.tilt != null) ? fav.tilt : 0 };

        const form = this._makeForm((d) => {
          if (d.stop) { this._setFav(id, 'stop'); return; }
          const neu = { position: clamp(Math.round(Number(d.position) || 0), 0, 100) };
          if (d.tilt != null && !isNaN(Number(d.tilt))) {
            neu.tilt = clamp(Math.round(Number(d.tilt)), 0, 100);
          }
          this._setFav(id, neu);
        });
        this._favForms.push({ form, schema: this._favSchema(id, fav ? (fav === 'stop'
          ? 'stop' : fav) : null), data: daten });
        body.appendChild(form);

        const adds = document.createElement('div');
        adds.className = 'adds';
        adds.appendChild(this._btn('mdi:crosshairs-gps', t('ed.takeNow'), () => {
          const st = this._hass.states[id];
          if (!st) return;
          const neu = {};
          const pos = st.attributes.current_position;
          const winkel = st.attributes.current_tilt_position;
          neu.position = pos != null ? Math.round(pos) : (isOn(st) ? 100 : 0);
          if (winkel != null) neu.tilt = Math.round(winkel);
          this._setFav(id, neu);
        }));
        body.appendChild(adds);

        const wie = document.createElement('p');
        wie.className = 'hint';
        wie.textContent = t('ed.h.takeNow', { s: this._istText(id) });
        body.appendChild(wie);

        box.appendChild(body);
      }

      this._favBox.appendChild(box);
    }

    for (const f of this._favForms) this._fillForm(f.form, f.schema, f.data);
  }

  /** Wie die Store gerade steht, in Worten */
  _istText(id) {
    const st = this._hass.states[id];
    if (!st) return '';
    const pos = st.attributes.current_position;
    const winkel = st.attributes.current_tilt_position;
    const teile = [];
    // Hier steht der Ist-Zustand, nicht ein Befehl — also "70 %", nicht
    // "auf 70 % fahren".
    teile.push(pos != null ? nfmt(Math.round(pos), 0) + ' %'
      : (isOn(st) ? t('open') : t('closed')));
    if (winkel != null) teile.push(t('favTilt', { n: Math.round(winkel) }));
    return teile.join(' \u00b7 ');
  }

  _btn(icon, text, onClick, cls, title) {
    const b = document.createElement('button');
    b.className = 'btn' + (cls ? ' ' + cls : '');
    b.type = 'button';
    b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>${text ? '<span></span>' : ''}`;
    if (text) b.querySelector('span').textContent = text;
    if (title) b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  _section(label) {
    const h = document.createElement('div');
    h.className = 'sec';
    h.textContent = label;
    return h;
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
  static get DEFAULTS() { return { chip_style: 'icon' }; }

  _helpKey(name) {
    return name === 'chip_style' ? 'ed.h.chip_style' : (ED_HELP_KEY[name] || '');
  }

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
      {
        name: 'chip_style',
        selector: {
          select: {
            mode: 'dropdown',
            options: ['icon', 'fill', 'ring', 'detail']
              .map((v) => ({ value: v, label: t('ed.cs.' + v) }))
          }
        }
      },
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
      chip_style: CHIP_STYLES.includes(this._config.chip_style)
        ? this._config.chip_style : 'icon',
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
      chip_style: data.chip_style,
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
const CAM_HELP = {
  cameras: 'ed.h.cameras', motion_entity: 'ed.h.motion_entity',
  door_entity: 'ed.h.door_entity', footer: 'ed.h.footer',
  aspect_ratio: 'ed.h.aspect_ratio'
};

const WX_HELP = {
  forecast: 'ed.h.forecast', temperature: 'ed.h.station', humidity: 'ed.h.station',
  wind: 'ed.h.station', illuminance: 'ed.h.illuminance', sun: 'ed.h.sun',
  color: 'ed.h.color'
};

class OnyxCameraEditor extends OnyxEditor {
  static get DEFAULTS() { return { footer: false, aspect_ratio: '16/9' }; }

  _helpKey(name) {
    return CAM_HELP[name] || ED_HELP_KEY[name] || '';
  }

  _schema() {
    return [
      fieldEntity('entity', 'camera'),
      fieldEntity('cameras', 'camera', true),
      grid(fieldText('name'), fieldIcon('icon')),
      grid(fieldColor(), fieldText('aspect_ratio')),
      grid(fieldEntity('motion_entity', 'binary_sensor'),
           fieldEntity('doorbell_entity', 'binary_sensor')),
      grid(fieldEntity('door_entity', ['lock', 'switch', 'button', 'input_boolean']),
           fieldEntity('light_entity', 'light')),
      fieldBool('footer')
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      // Im Formular ist die Liste eine Reihe von Kennungen; die
      // Feinheiten aus dem YAML bleiben beim Zurückschreiben erhalten.
      cameras: (normList(c.cameras) || []).map((e) => e.entity),
      name: c.name || '',
      icon: c.icon || '',
      color: c.color || '',
      aspect_ratio: c.aspect_ratio || '16/9',
      motion_entity: c.motion_entity || '',
      doorbell_entity: c.doorbell_entity || '',
      door_entity: c.door_entity || '',
      light_entity: c.light_entity || '',
      footer: c.footer === true
    };
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    const ids = data.cameras || [];
    if (ids.length) cfg.cameras = mergeList(ids, this._config.cameras);
    else delete cfg.cameras;
    return cfg;
  }
}

class OnyxLockEditor extends OnyxEditor {
  static get DEFAULTS() { return { show_open: true }; }

  _helpKey(name) {
    if (name === 'door_entity') return 'ed.h.door_entity_lock';
    if (name === 'show_open') return 'ed.h.show_open';
    return ED_HELP_KEY[name] || '';
  }

  _schema() {
    return [
      fieldEntity('entity', 'lock'),
      grid(fieldText('name'), fieldIcon('icon')),
      fieldColor(),
      grid(fieldEntity('door_entity', 'binary_sensor'),
           fieldEntity('battery_entity', 'sensor')),
      fieldBool('show_open')
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      icon: c.icon || '',
      color: c.color || '',
      door_entity: c.door_entity || '',
      battery_entity: c.battery_entity || '',
      show_open: c.show_open !== false
    };
  }

  _extra(root) {
    if (this._note) return;
    this._note = document.createElement('p');
    this._note.className = 'hint';
    this._note.textContent = t('ed.h.lockColor');
    root.appendChild(this._note);
  }
}

/**
 * Status-Karte
 *
 * Der Kopf, die Zeilen und die Chips sind alle vom selben Schlag: ein
 * Baustein plus seine Felder. Deshalb gibt es hier nur einen Bauplan für
 * einen Eintrag, dreimal verwendet. Eingeklappt steht je Eintrag ein
 * Streifen; erst ein Klick öffnet die Felder — sonst wird der Editor bei
 * sechs Zeilen unbedienbar lang.
 */
class OnyxStatusEditor extends OnyxEditor {
  _helpKey(name) { return ST_HELP[name] || ED_HELP_KEY[name] || ''; }

  _schema() {
    return [
      fieldText('title'),
      grid(fieldText('subtitle'), fieldColor())
    ];
  }

  _toForm(c) {
    return {
      title: c.title || '',
      subtitle: typeof c.subtitle === 'string' ? c.subtitle : '',
      color: c.color || ''
    };
  }

  _fromForm(data) {
    const cfg = Object.assign({}, this._config, data);
    return this._packInto(cfg);
  }

  /* ---------------- Arbeitsmodell ---------------- */

  _model() {
    if (this._state) return this._state;
    const c = this._config;
    const cp = (e) => Object.assign({}, e);
    this._state = {
      head: c.head ? cp(c.head) : null,
      rows: (c.rows || []).map(cp),
      chips: (c.chips || []).map(cp),
      open: null
    };
    return this._state;
  }

  /** Einen Eintrag auf die Felder seines Bausteins eindampfen */
  _pack(e) {
    const mod = stModuleOf(e);
    const out = {};
    if (mod !== 'entity' && mod !== 'template') out.module = mod;
    const take = (f) => {
      const v = e[f.n];
      if (v === '' || v === null || v === undefined) return;
      if (Array.isArray(v)) { if (v.length) out[f.n] = v.slice(); return; }
      out[f.n] = v;
    };
    ST_MODULES[mod].fields.forEach(take);
    (ST_MODULES[mod].extra || []).forEach(take);
    ST_COMMON.forEach(take);
    return out;
  }

  /** Kopf, Zeilen und Chips aus dem Arbeitsmodell in die Konfiguration */
  _packInto(cfg) {
    const st = this._model();
    delete cfg.head; delete cfg.rows; delete cfg.chips;
    if (st.head) cfg.head = this._pack(st.head);
    const rows = st.rows.map((e) => this._pack(e));
    const chips = st.chips.map((e) => this._pack(e));
    if (rows.length) cfg.rows = rows;
    if (chips.length) cfg.chips = chips;
    return cfg;
  }

  _commit() {
    this._emit(this._packInto(Object.assign({}, this._config)));
  }

  /* ---------------- Ein Eintrag als Formular ---------------- */

  _entrySchema(mod) {
    const m = ST_MODULES[mod];
    const one = (f) => {
      if (f.sel === 'entity') return fieldEntity(f.n, f.domain, f.multiple);
      if (f.sel === 'icon') return fieldIcon(f.n);
      if (f.sel === 'color') return fieldColor();
      return fieldText(f.n);
    };
    const schema = [{
      name: 'module',
      selector: { select: { mode: 'dropdown',
        options: ST_MOD_KEYS.map((v) => ({ value: v, label: t('ed.m.' + v) })) } }
    }];
    // Entitäten paarweise, damit die Liste beim Auto nicht ausufert
    const fs = m.fields.slice();
    if (fs.length === 1) schema.push(one(fs[0]));
    else for (let i = 0; i < fs.length; i += 2) {
      schema.push(fs[i + 1] ? grid(one(fs[i]), one(fs[i + 1])) : one(fs[i]));
    }
    schema.push(grid(fieldText('name'), fieldText('detail')));
    const ex = m.extra || [];
    if (ex.length === 2) schema.push(grid(one(ex[0]), one(ex[1])));
    schema.push(grid(fieldIcon('icon'), fieldColor()));
    schema.push(fieldText('hide'));
    return schema;
  }

  _entryData(e) {
    const mod = stModuleOf(e);
    const out = { module: mod };
    const take = (f) => {
      const v = e[f.n];
      out[f.n] = v == null ? (f.multiple ? [] : '') : v;
    };
    ST_MODULES[mod].fields.forEach(take);
    (ST_MODULES[mod].extra || []).forEach(take);
    ST_COMMON.forEach(take);
    return out;
  }

  /** Was der Streifen zeigt, solange der Eintrag zu ist */
  _entryLine(e) {
    const mod = stModuleOf(e);
    const hass = this._hass;
    const nm = e.name && !isTpl(e.name) ? e.name : t('ed.m.' + mod);
    let d = '';
    if (mod === 'presence') d = (e.people || []).map((id) => nameOf(hass, id)).join(', ');
    else if (e.entity) d = e.entity;
    else if (isTpl(e.name)) d = e.name;
    else if (isTpl(e.detail)) d = e.detail;
    return { icon: e.icon && !isTpl(e.icon) ? e.icon : ST_MODULES[mod].icon,
      name: nm, detail: d };
  }

  _btn(icon, text, onClick, cls, title) {
    const b = document.createElement('button');
    b.className = 'btn' + (cls ? ' ' + cls : '');
    b.type = 'button';
    b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>${text ? '<span></span>' : ''}`;
    if (text) b.querySelector('span').textContent = text;
    if (title) b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  _section(label) {
    const h = document.createElement('div');
    h.className = 'sec';
    h.textContent = label;
    return h;
  }

  /**
   * Ein Eintrag: Streifen oben, Felder darunter, wenn er offen ist.
   * `get` und `set` sagen, wo der Eintrag im Arbeitsmodell wohnt.
   */
  _buildEntry(key, get, set, tools) {
    const st = this._model();
    const box = document.createElement('div');
    const offen = st.open === key;
    box.className = 'item' + (offen ? ' on' : '');

    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.innerHTML = `
      <span class="ic"><ha-icon icon=""></ha-icon></span>
      <span class="tx"><span class="n"></span><span class="d"></span></span>`;
    // Die Beschriftung wird bei jedem Durchlauf aufgefrischt, nicht neu
    // gebaut — sonst springt beim Tippen der Cursor aus dem Namensfeld.
    this._strips.push({ el: strip, get });
    strip.addEventListener('click', (ev) => {
      if (ev.target.closest('.tools')) return;
      st.open = offen ? null : key;
      this._listSig = null;
      this._render();
    });

    const tb = document.createElement('span');
    tb.className = 'tools';
    for (const tool of tools) tb.appendChild(tool());
    tb.appendChild(this._btn(offen ? 'mdi:chevron-up' : 'mdi:chevron-down', '', () => {
      st.open = offen ? null : key;
      this._listSig = null;
      this._render();
    }, 'x'));
    strip.appendChild(tb);
    box.appendChild(strip);

    if (offen) {
      const body = document.createElement('div');
      body.className = 'body';
      const mod = stModuleOf(get());
      const form = this._makeForm((d) => {
        const vorher = stModuleOf(get());
        if (d.module !== vorher) {
          // Baustein gewechselt: nur behalten, was der neue auch kennt
          const alt = get();
          const neu = { module: d.module };
          for (const f of ST_COMMON) if (alt[f.n] != null) neu[f.n] = alt[f.n];
          if (ST_MODULES[d.module].fields.some((f) => f.n === 'entity') && alt.entity) {
            neu.entity = alt.entity;
          }
          set(neu);
          this._listSig = null;
          this._commit();
          return;
        }
        set(Object.assign({}, d));
        this._commit();
      });
      form.computeLabel = (x) => {
        if (!x.name) return '';
        const f = [].concat(ST_MODULES[mod].fields, ST_MODULES[mod].extra || [])
          .find((y) => y.n === x.name);
        return t(f && f.label ? f.label : 'ed.' + x.name);
      };
      // Der Hinweis zur Farbe steht schon oben an der Karte — in jeder
      // Zeile noch einmal wäre er nur Lärm.
      form.computeHelper = (x) => {
        const key = x.name === 'color' ? '' : this._helpKey(x.name);
        return key ? t(key) : '';
      };
      this._forms.push({
        form, schema: this._entrySchema(mod), data: () => this._entryData(get())
      });
      body.appendChild(form);
      box.appendChild(body);
    }
    return box;
  }

  /** Eine Liste von Einträgen mit Hoch, Runter, Weg und Hinzufügen */
  _buildList(root, feld, praefix, addLabel) {
    const st = this._model();
    root.appendChild(this._section(t(feld === 'rows' ? 'ed.rows' : 'ed.chips')));
    const list = document.createElement('div');
    list.className = 'items';
    st[feld].forEach((_, i) => {
      const verschieben = (d) => () => {
        const arr = st[feld];
        const j = i + d;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        st.open = null;
        this._listSig = null;
        this._commit();
      };
      list.appendChild(this._buildEntry(praefix + i,
        () => st[feld][i],
        (v) => { st[feld][i] = v; },
        [
          () => {
            const b = this._btn('mdi:chevron-up', '', verschieben(-1), 'x', t('ed.up'));
            if (i === 0) b.disabled = true;
            return b;
          },
          () => {
            const b = this._btn('mdi:chevron-down', '', verschieben(1), 'x', t('ed.down'));
            if (i === st[feld].length - 1) b.disabled = true;
            return b;
          },
          () => this._btn('mdi:close', '', () => {
            st[feld].splice(i, 1);
            st.open = null;
            this._listSig = null;
            this._commit();
          }, 'x', t('ed.remove'))
        ]));
    });
    root.appendChild(list);
    const adds = document.createElement('div');
    adds.className = 'adds';
    adds.appendChild(this._btn('mdi:plus', addLabel, () => {
      st[feld].push({ module: 'entity', entity: '' });
      st.open = praefix + (st[feld].length - 1);
      this._listSig = null;
      this._commit();
    }));
    root.appendChild(adds);
  }

  _extra(root) {
    const st = this._model();
    // Neu gebaut wird nur, wenn sich die Struktur ändert — sonst reisst
    // jeder Zustandswechsel im Haus das Feld unter dem Cursor weg.
    const sig = [
      st.open, st.head ? stModuleOf(st.head) : '-',
      st.rows.map(stModuleOf).join(','), st.chips.map(stModuleOf).join(',')
    ].join('#');

    if (!this._list) {
      this._list = document.createElement('div');
      this._list.className = 'ed';
      root.appendChild(this._list);
    }

    if (sig !== this._listSig) {
      this._listSig = sig;
      this._forms = [];
      this._strips = [];
      this._list.textContent = '';

      this._list.appendChild(this._section(t('ed.head')));
      if (st.head) {
        const items = document.createElement('div');
        items.className = 'items';
        items.appendChild(this._buildEntry('h',
          () => st.head, (v) => { st.head = v; },
          [() => this._btn('mdi:close', '', () => {
            st.head = null;
            st.open = null;
            this._listSig = null;
            this._commit();
          }, 'x', t('ed.remove'))]));
        this._list.appendChild(items);
      } else {
        const adds = document.createElement('div');
        adds.className = 'adds';
        adds.appendChild(this._btn('mdi:plus', t('ed.addHead'), () => {
          st.head = { module: 'presence', people: [] };
          st.open = 'h';
          this._listSig = null;
          this._commit();
        }));
        this._list.appendChild(adds);
      }

      this._buildList(this._list, 'rows', 'r', t('ed.addRow'));
      this._buildList(this._list, 'chips', 'c', t('ed.addChip'));

      const note = document.createElement('p');
      note.className = 'hint';
      note.textContent = t('ed.h.status');
      this._list.appendChild(note);
    }

    for (const s of this._strips) {
      const line = this._entryLine(s.get());
      s.el.querySelector('ha-icon').setAttribute('icon', line.icon);
      s.el.querySelector('.n').textContent = line.name;
      s.el.querySelector('.d').textContent = line.detail;
    }
    for (const f of this._forms) this._fillForm(f.form, f.schema, f.data());
  }
}

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
    if (name === 'always_open') return 'ed.h.always_open';
    return ED_HELP_KEY[name] || '';
  }

  _schema() {
    return [
      fieldEntity('entity', 'light'),
      grid(fieldText('name'), fieldIcon('icon')),
      fieldColor(),
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
      show_color_temp: c.show_color_temp !== false,
      show_colors: c.show_colors !== false,
      show_effects: c.show_effects !== false,
      always_open: c.always_open === true
    };
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
 * Klima
 * ------------------------------------------------------------------ */
class OnyxClimateEditor extends OnyxEditor {
  static get DEFAULTS() {
    return { show_modes: true, show_presets: true, show_fan: true };
  }

  _helpKey(name) {
    if (name === 'color') return 'ed.h.climateColor';
    if (name === 'show_presets' || name === 'show_fan') return 'ed.h.show_presets';
    if (name === 'temperature' || name === 'humidity') return 'ed.h.clSensor';
    return ED_HELP_KEY[name] || '';
  }

  _schema() {
    return [
      fieldEntity('entity', 'climate'),
      grid(fieldText('name'), fieldText('label')),
      grid(fieldIcon('icon'), fieldColor()),
      grid(fieldEntity('temperature', 'sensor'), fieldEntity('humidity', 'sensor')),
      grid(fieldBool('show_modes'), fieldBool('show_presets')),
      fieldBool('show_fan')
    ];
  }

  _toForm(c) {
    return {
      entity: c.entity || '',
      name: c.name || '',
      label: c.label || '',
      icon: c.icon || '',
      color: c.color || '',
      temperature: c.temperature || '',
      humidity: c.humidity || '',
      show_modes: c.show_modes !== false,
      show_presets: c.show_presets !== false,
      show_fan: c.show_fan !== false
    };
  }

  _extra(root) {
    if (this._note) return;
    this._note = document.createElement('p');
    this._note.className = 'hint';
    this._note.textContent = t('ed.h.climate');
    root.appendChild(this._note);
  }
}

/* ------------------------------------------------------------------ *
 * Energie
 * ------------------------------------------------------------------ */
class OnyxEnergyEditor extends OnyxEditor {
  // Ohne diese Vorgaben blieben die beiden Schalter als `false` in der
  // YAML stehen, obwohl sie nichts bewirken.
  static get DEFAULTS() { return { invert_grid: false, invert_battery: false }; }

  _helpKey(name) { return EN_HELP[name] || ED_HELP_KEY[name] || ''; }

  _schema() {
    const p = (n) => fieldEntity(n, 'sensor');
    return [
      p('grid'),
      grid(p('grid_import'), p('grid_export')),
      grid(p('solar'), p('house')),
      grid(fieldEntity('battery', 'sensor'), fieldEntity('battery_level', 'sensor')),
      p('car'),
      grid(fieldBool('invert_grid'), fieldBool('invert_battery')),
      grid(fieldText('name'), fieldColor()),
      grid(p('today_solar'), p('today_import')),
      grid(p('today_export'), p('today_house')),
      grid(p('cost_today'), p('saved_today')),
      grid(
        { name: 'price_import', selector: { number: { min: 0, max: 5, step: 0.001,
          mode: 'box' } } },
        { name: 'price_export', selector: { number: { min: 0, max: 5, step: 0.001,
          mode: 'box' } } }
      ),
      fieldText('currency')
    ];
  }

  _toForm(c) {
    const out = {
      name: c.name || '', color: c.color || '',
      invert_grid: c.invert_grid === true,
      invert_battery: c.invert_battery === true,
      currency: c.currency || ''
    };
    for (const k of ['grid', 'grid_import', 'grid_export', 'solar', 'house',
      'battery', 'battery_level', 'car', 'today_solar', 'today_import',
      'today_export', 'today_house', 'cost_today', 'saved_today']) {
      out[k] = c[k] || '';
    }
    out.price_import = c.price_import == null ? '' : c.price_import;
    out.price_export = c.price_export == null ? '' : c.price_export;
    return out;
  }

  _extra(root) {
    if (this._note) return;
    this._note = document.createElement('p');
    this._note.className = 'hint';
    this._note.textContent = t('ed.h.energy');
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
defineEditor('onyx-camera-card-editor', OnyxCameraEditor);
defineEditor('onyx-lock-card-editor', OnyxLockEditor);
defineEditor('onyx-status-card-editor', OnyxStatusEditor);
defineEditor('onyx-climate-card-editor', OnyxClimateEditor);
defineEditor('onyx-energy-card-editor', OnyxEnergyEditor);

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
  [OnyxLightCard, 'onyx-light-card-editor'],
  [OnyxCameraCard, 'onyx-camera-card-editor'],
  [OnyxLockCard, 'onyx-lock-card-editor'],
  [OnyxStatusCard, 'onyx-status-card-editor'],
  [OnyxClimateCard, 'onyx-climate-card-editor'],
  [OnyxEnergyCard, 'onyx-energy-card-editor']
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
defineCard('onyx-camera-card', OnyxCameraCard);
defineCard('onyx-lock-card', OnyxLockCard);
defineCard('onyx-status-card', OnyxStatusCard);
defineCard('onyx-climate-card', OnyxClimateCard);
defineCard('onyx-energy-card', OnyxEnergyCard);

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'onyx-room-card',
    name: t('card.room'),
    description: t('card.room.d'),
    preview: true
  },
  {
    type: 'onyx-slider-card',
    name: t('card.slider'),
    description: t('card.slider.d'),
    preview: true
  },
  {
    type: 'onyx-cover-card',
    name: t('card.cover'),
    description: t('card.cover.d'),
    preview: true
  },
  {
    type: 'onyx-media-card',
    name: t('card.media'),
    description: t('card.media.d'),
    preview: true
  },
  {
    type: 'onyx-actions-card',
    name: t('card.actions'),
    description: t('card.actions.d'),
    preview: true
  },
  {
    type: 'onyx-chart-card',
    name: t('card.chart'),
    description: t('card.chart.d'),
    preview: true
  },
  {
    type: 'onyx-vacuum-card',
    name: t('card.vacuum'),
    description: t('card.vacuum.d'),
    preview: true
  },
  {
    type: 'onyx-weather-card',
    name: t('card.weather'),
    description: t('card.weather.d'),
    preview: true
  },
  {
    type: 'onyx-light-card',
    name: t('card.light'),
    description: t('card.light.d'),
    preview: true
  },
  {
    type: 'onyx-camera-card',
    name: t('card.camera'),
    description: t('card.camera.d'),
    preview: true
  },
  {
    type: 'onyx-lock-card',
    name: t('card.lock'),
    description: t('card.lock.d'),
    preview: true
  },
  {
    type: 'onyx-status-card',
    name: t('card.status'),
    description: t('card.status.d'),
    preview: true
  },
  {
    type: 'onyx-climate-card',
    name: t('card.climate'),
    description: t('card.climate.d'),
    preview: true
  },
  {
    type: 'onyx-energy-card',
    name: t('card.energy'),
    description: t('card.energy.d'),
    preview: true
  }
);

export {
  OnyxRoomCard, OnyxSliderCard, OnyxCoverCard,
  OnyxMediaCard, OnyxActionsCard, OnyxChartCard, OnyxVacuumCard, OnyxWeatherCard,
  OnyxLightCard, OnyxCameraCard, OnyxLockCard, OnyxStatusCard, OnyxClimateCard,
  OnyxEnergyCard
};
