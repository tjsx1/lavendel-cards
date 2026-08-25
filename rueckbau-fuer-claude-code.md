# Auftrag: Hand-Installation der Lavendel-Karten zurückbauen

Ziel: Die von Hand kopierte Fassung der Lavendel-Karten vollständig entfernen,
damit anschließend die HACS-Installation sauber übernehmen kann. **Theme und
Dashboard bleiben unverändert.**

Der Grund: Nach der HACS-Installation liegt dieselbe Datei zweimal im Frontend —
einmal unter `/local/`, einmal unter `/hacsfiles/`. Beide registrieren dieselben
Custom Elements. Nur die zuerst geladene gewinnt, die andere wird verworfen. Das
Ergebnis ist eine stille Fehlfunktion: HACS meldet Version 0.2.1, im Browser läuft
aber die alte Datei.

---

## Vorher

Lege ein Backup an, bevor du irgendetwas löschst:

```
Einstellungen → System → Sicherungen → Sicherung erstellen
```

Falls du direkt auf dem Dateisystem arbeitest, reicht auch eine Kopie von
`.storage/lovelace_resources`.

---

## Schritt 1 — Ressourcen-Eintrag entfernen

**Bevorzugt über die Oberfläche**, weil Home Assistant die Liste dann selbst
konsistent hält:

```
Einstellungen → Dashboards → ⋮ (oben rechts) → Ressourcen
```

Dort den Eintrag suchen, dessen URL mit `/local/lavendel-cards.js` beginnt
(er kann ein `?v=1` oder ähnliches angehängt haben) und **löschen**.

> Einen Eintrag mit `/hacsfiles/lavendel-cards/lavendel-cards.js` gibt es
> möglicherweise auch. **Der bleibt** — den hat HACS angelegt.

### Falls das Menü „Ressourcen" fehlt

Dann läuft das Dashboard im YAML-Modus. In diesem Fall steht die Ressource in der
`configuration.yaml` oder einer eingebundenen Datei unter `lovelace: resources:`.
Dort den Block mit `/local/lavendel-cards.js` entfernen.

### Prüfen auf Dateiebene

Die Liste liegt in `<config>/.storage/lovelace_resources` (JSON). Darin darf nach
dem Löschen **kein** Eintrag mehr vorkommen, dessen `url` den Text
`/local/lavendel-cards.js` enthält. Diese Datei nur lesen, nicht von Hand
bearbeiten, solange Home Assistant läuft — sie wird sonst überschrieben.

---

## Schritt 2 — Datei löschen

```
<config>/www/lavendel-cards.js        → löschen
```

Bei Home Assistant OS ist `<config>` der Ordner, der in der Samba-Freigabe
`homeassistant` heißt. Erkennungsmerkmal: darin liegt die `configuration.yaml`.

Den Ordner `www` selbst **nicht** löschen — dort können andere Dateien liegen.
Ist er nach dem Löschen leer, kann er bleiben.

---

## Schritt 3 — Neu starten und Cache leeren

1. `Entwicklerwerkzeuge → Neu starten → Home Assistant neu starten`
2. Im Browser hart neu laden: `Strg + Shift + R` (Mac: `Cmd + Shift + R`)
3. In der Handy-App zusätzlich:
   `Einstellungen → Companion-App → Frontend-Cache leeren`

Schritt 3 ist nicht optional. Ohne geleerten Cache liefert der Browser die alte
Datei weiter aus, und der ganze Rückbau wirkt, als hätte er nichts gebracht.

---

## Was nicht angefasst wird

| Datei | Warum sie bleibt |
|---|---|
| `<config>/themes/lavendel.yaml` | Das Theme liefert HACS **nicht** mit. Wird es gelöscht, verlieren die Karten Verlauf und Schatten. |
| Die Theme-Auswahl im Benutzerprofil | Bleibt auf „Lavendel" stehen |
| `frontend: themes:` in der `configuration.yaml` | Wird weiterhin gebraucht |
| Das Dashboard-YAML | Die Kartennamen sind identisch (`custom:lavendel-room-card` usw.). Es ändert sich nichts. |
| Der HACS-Ressourceneintrag `/hacsfiles/...` | Der ist der neue, richtige |

---

## Verifikation

Öffne das Dashboard und die Browser-Konsole (F12).

**Erfolgreich, wenn:**

- Genau **eine** Zeile `LAVENDEL-CARDS 0.2.1` erscheint — nicht zwei
- **Keine** Warnung `[lavendel-cards] "lavendel-room-card" ist bereits registriert`
- Die Karten werden normal dargestellt, nicht weiß und ohne roten Fehlertext
- Im Netzwerk-Tab taucht `lavendel-cards.js` nur unter `/hacsfiles/` auf,
  nicht unter `/local/`

**Wenn die Warnung „ist bereits registriert" erscheint:** Es ist noch ein zweiter
Ressourcen-Eintrag übrig. Zurück zu Schritt 1.

**Wenn „Custom element doesn't exist" erscheint:** Es ist jetzt *gar keine*
Ressource mehr eingetragen. Prüfen, ob HACS seinen Eintrag wirklich angelegt hat —
in HACS die Karten notfalls neu herunterladen.

---

## Reihenfolge, falls HACS noch nicht installiert ist

Dann zuerst Schritt 1 und 2 ausführen, danach in HACS herunterladen, dann
Schritt 3. So gibt es keinen Moment, in dem beide Fassungen gleichzeitig geladen
sind.
