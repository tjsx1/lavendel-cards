/*!
 * Lavendel Cards für Home Assistant
 * Version 0.3.0
 *
 * Enthält:
 *   custom:lavendel-room-card    – Raum-Karte, aufklappbar pro Gerätegruppe
 *   custom:lavendel-slider-card  – vertikaler Zieh-Regler (Licht, Storen, Lautstärke)
 *   custom:lavendel-cover-card   – Storen mit Höhe, Lamellen und Fahrtasten
 *   custom:lavendel-media-card   – Medienspieler mit Cover, Fortschritt und Lautstärke
 *
 * Installation:
 *   1. Datei nach /config/www/lavendel-cards.js kopieren
 *   2. Einstellungen → Dashboards → ⋮ → Ressourcen → Hinzufügen
 *      URL /local/lavendel-cards.js   ·   Typ: JavaScript-Modul
 *   3. Browser hart neu laden (Strg/Cmd + Shift + R)
 */

const LAV_VERSION = '0.3.0';

console.info(
  `%c LAVENDEL-CARDS %c ${LAV_VERSION} `,
  'background:#7b6bf0;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px',
  'background:#e7599b;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px'
);

/* ------------------------------------------------------------------ *
 * Schrift einmalig ins Dokument hängen (Shadow DOM kann das nicht)
 * ------------------------------------------------------------------ */
let fontRequested = false;
function ensureFont() {
  if (fontRequested || typeof document === 'undefined') return;
  fontRequested = true;
  if (document.querySelector('link[data-lavendel-font]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.lavendelFont = '1';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
}

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
  --grad: var(--lav-grad, linear-gradient(135deg,#4ec5e8 0%,#7b6bf0 52%,#e7599b 100%));
  --glow: var(--lav-glow, 0 6px 16px rgba(123,107,240,.35));
  --soft: var(--lav-soft, 0 2px 10px rgba(80,66,160,.07));
  --surface: var(--card-background-color,#f7f7fa);
  --surface-on: var(--lav-card-on,#ffffff);
  --ink: var(--primary-text-color,#1c1c22);
  --ink2: var(--secondary-text-color,#6b6b78);
  --ink3: var(--lav-ink3,#a3a3b0);
  --line: var(--divider-color,#ebebf1);
  --flat: var(--lav-flat, rgba(120,120,140,.10));
  --r-card: var(--lav-radius, 20px);
  font-family: var(--lav-font, 'Poppins', var(--paper-font-body1_-_font-family, inherit));
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
class LavBase extends HTMLElement {
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
    this._tryRender();
  }
  get hass() { return this._hass; }

  _tryRender() {
    if (!this._hass || !this._config || this._busy) return;
    let model;
    try {
      model = this._model();
    } catch (err) {
      this.shadowRoot.innerHTML =
        `<style>${BASE_CSS}</style><ha-card><div style="color:#c0392b;font-size:13px">
         Lavendel: ${esc(err.message)}</div></ha-card>`;
      return;
    }
    const sig = JSON.stringify(model);
    if (sig === this._sig) return;
    this._sig = sig;
    this.shadowRoot.innerHTML = `<style>${BASE_CSS}${this.constructor.CSS || ''}</style>${this._html(model)}`;
    this._bind(model);
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
  light:        { icon: 'mdi:lightbulb',      label: 'Lichter',      short: 'Licht' },
  media_player: { icon: 'mdi:music-note',     label: 'Medien',       short: 'Media' },
  climate:      { icon: 'mdi:thermostat',     label: 'Klima',        short: 'Klima' },
  cover:        { icon: 'mdi:window-shutter', label: 'Storen',       short: 'Storen' }
};

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

class LavendelRoomCard extends LavBase {
  static get CSS() {
    return `
    .top{ display:flex; justify-content:space-between; align-items:flex-start; }
    .meta{ font-size:12px; color:var(--ink2); text-align:right; line-height:1.45;
           font-variant-numeric:tabular-nums; }
    .name{ font-size:15px; font-weight:600; margin-top:12px; }
    .sub{ font-size:12px; color:var(--ink3); }
    .chips{ display:flex; gap:5px; margin-top:11px; }
    .chip{ width:26px;height:26px;border-radius:9px;background:var(--flat);
           display:grid;place-items:center;color:var(--ink3);--mdc-icon-size:14px;
           cursor:pointer;transition:transform .12s ease; }
    .chip.on{ background:var(--grad); color:#fff; }
    .chip.armed{ box-shadow:0 0 0 2.5px var(--surface-on), 0 0 0 4.5px rgba(123,107,240,.55); }
    .divide{ height:1px; background:var(--line); margin:14px 0 12px; }
    .grp{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:9px; }
    .grp span{ font-size:11.5px; color:var(--ink3); }
    .grp b{ font-size:11.5px; font-weight:500; color:var(--primary-color,#5b4bc4); }
    .lrow{ position:relative; overflow:hidden; border-radius:13px; background:var(--flat);
           display:flex; align-items:center; gap:11px; padding:0 12px; height:46px;
           margin-bottom:7px; cursor:pointer; touch-action:pan-y; }
    .lfill{ position:absolute; left:0; top:0; bottom:0;
            background:linear-gradient(90deg,rgba(78,197,232,.30),rgba(123,107,240,.26));
            transition:width .12s linear; }
    .lrow > *:not(.lfill){ position:relative; z-index:1; }
    .handle{ position:absolute; top:50%; transform:translateY(-50%);
             width:3px; height:16px; border-radius:99px; background:rgba(255,255,255,.9); z-index:2; }
    .lico{ width:30px;height:30px;border-radius:10px;display:grid;place-items:center;flex:none;
           background:var(--surface-on);color:var(--ink3);box-shadow:var(--soft);--mdc-icon-size:16px; }
    .lico.grad{ background:var(--grad); color:#fff; box-shadow:var(--glow); }
    .lname{ font-size:13px; font-weight:500; flex:1; min-width:0; overflow:hidden;
            text-overflow:ellipsis; white-space:nowrap; }
    .lval{ font-size:12.5px; color:var(--ink2); font-variant-numeric:tabular-nums; white-space:nowrap; }
    .lrow.dead{ opacity:.5; }
    .allout{ display:flex; align-items:center; justify-content:center; gap:8px; margin-top:11px;
             background:var(--surface-on); border-radius:13px; height:42px; font-size:13px;
             font-weight:500; color:var(--ink2); box-shadow:var(--soft); cursor:pointer;
             --mdc-icon-size:16px; }
    .griph{ width:36px;height:4px;border-radius:99px;background:var(--line);
            margin:12px auto 0; cursor:pointer; }
    `;
  }

  static getStubConfig(hass) {
    const first = Object.keys(hass.areas || {})[0];
    return { type: 'custom:lavendel-room-card', area: first || '' };
  }

  setConfig(config) {
    const hasList = Object.keys(GROUPS).some((d) => this.constructor._listFor(config, d));
    if (!config.area && !hasList) {
      throw new Error(
        'Bitte "area" angeben (die Bereichs-ID) oder Listen wie "lights:", "covers:", "media:".'
      );
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
    if (cfg.area && !area) throw new Error(`Bereich "${cfg.area}" nicht gefunden.`);

    const wanted = cfg.groups || ['light', 'media_player', 'climate', 'cover'];
    const groups = [];
    for (const d of wanted) {
      if (!GROUPS[d]) continue;
      const listed = this._groupItems(d);
      if (!listed.length) continue;
      const items = listed.map((entry) => {
        const id = entry.entity;
        const st = hass.states[id];
        return {
          id,
          name: entry.name || nameOf(hass, id),
          icon: entry.icon || GROUPS[d].icon,
          on: isOn(st),
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
      // Prozente ohne Nachkomma, Temperaturen mit einer Stelle
      const txt = unit === '%' ? String(Math.round(num)) : num.toFixed(1).replace('.', ',');
      return `${txt} ${unit}`.trim();
    };

    return {
      name: cfg.name || (area ? area.name : 'Raum'),
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
        bits.push(`${g.onCount} ${g.onCount === 1 ? 'Licht' : 'Lichter'}`);
      } else if (g.domain === 'media_player') {
        bits.push('Musik');
      } else if (g.domain === 'climate') {
        // nur melden, wenn wirklich gerade geheizt oder gekühlt wird
        const act = g.items.find((i) => i.action === 'heating' || i.action === 'cooling');
        if (act) bits.push(act.action === 'cooling' ? 'kühlt' : 'heizt');
      } else if (g.domain === 'cover') {
        bits.push(`${g.onCount} ${g.onCount === 1 ? 'Store' : 'Storen'} offen`);
      }
    }
    return bits.length ? bits.join(' · ') : 'Alles aus';
  }

  _rowText(it, domain) {
    if (it.dead) return 'Nicht erreichbar';
    if (domain === 'light') return it.on ? `${it.pct} %` : 'Aus';
    if (domain === 'cover') return it.pct > 0 ? `${it.pct} % offen` : 'Zu';
    if (domain === 'media_player') return it.on ? (it.title || 'Läuft') : 'Aus';
    if (domain === 'climate') {
      if (it.state === 'off') return 'Aus';
      return `${it.temp != null ? String(it.temp).replace('.', ',') : '–'} → ${it.target != null ? String(it.target).replace('.', ',') : '–'} °C`;
    }
    return it.state;
  }

  _html(m) {
    const anyOn = m.groups.some((g) => g.onCount > 0);
    const chips = m.groups.map((g) => `
      <div class="chip ${g.onCount ? 'on' : ''} ${m.open === g.domain ? 'armed' : ''}" data-grp="${g.domain}">
        <ha-icon icon="${GROUPS[g.domain].icon}"></ha-icon>
      </div>`).join('');

    let panel = '';
    const og = m.groups.find((g) => g.domain === m.open);
    if (og) {
      const dragable = og.domain === 'light' || og.domain === 'cover';
      const rows = og.items.map((it) => {
        const pct = dragable && it.pct > 0 ? it.pct : 0;
        return `
        <div class="lrow ${it.dead ? 'dead' : ''}" data-ent="${esc(it.id)}" data-dom="${og.domain}">
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
        <span>${GROUPS[og.domain].label} im Raum</span>
        <b>${og.onCount} von ${og.items.length} an</b>
      </div>
      ${rows}
      ${allOff ? `<div class="allout" id="alloff">
          <ha-icon icon="${GROUPS[og.domain].icon}"></ha-icon>
          ${og.domain === 'cover' ? 'Alle Storen zu' : 'Alle aus'}
        </div>` : ''}
      <div class="griph" id="collapse"></div>`;
    }

    return `
    <ha-card class="${anyOn ? 'on' : ''}">
      <div class="top">
        <div class="ico ${anyOn ? 'grad' : 'flat'} pressable" id="head">
          <ha-icon icon="${esc(m.icon)}"></ha-icon>
        </div>
        <div class="meta">${m.temp ? esc(m.temp) : ''}${m.temp && m.hum ? '<br>' : ''}${m.hum ? esc(m.hum) : ''}</div>
      </div>
      <div class="name">${esc(m.name)}</div>
      <div class="sub">${esc(this._summary(m))}</div>
      <div class="chips">${chips}</div>
      ${panel}
    </ha-card>`;
  }

  _bind(m) {
    const root = this.shadowRoot;

    const head = root.getElementById('head');
    if (head) {
      this._press(head, {
        onTap: () => { if (m.path) navigate(this, m.path); },
        onHold: () => { this._open = null; this._repaint(); }
      });
    }

    root.querySelectorAll('.chip').forEach((chip) => {
      const domain = chip.dataset.grp;
      const grp = m.groups.find((g) => g.domain === domain);
      this._press(chip, {
        onTap: () => this._toggleGroup(grp),
        onHold: () => { this._open = this._open === domain ? null : domain; this._repaint(); }
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

    const collapse = root.getElementById('collapse');
    if (collapse) this._press(collapse, { onTap: () => { this._open = null; this._repaint(); } });
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
class LavendelSliderCard extends LavBase {
  static get CSS() {
    return `
    ha-card{ padding:0; background:none; box-shadow:none; }
    .sl{ width:100%; height:160px; border-radius:22px; background:var(--flat);
         position:relative; overflow:hidden; display:flex; flex-direction:column;
         justify-content:space-between; align-items:center; padding:12px 0;
         cursor:pointer; touch-action:pan-x; }
    .fill{ position:absolute; left:0; right:0; bottom:0; background:var(--grad);
           transition:height .12s linear; }
    .pct{ position:relative; font-size:13px; font-weight:500; color:var(--ink2); }
    .pct.light{ color:#fff; }
    .sico{ position:relative; color:var(--ink2); --mdc-icon-size:20px; }
    .sico.light{ color:#fff; }
    .grip{ position:absolute; left:50%; transform:translateX(-50%); width:22px; height:3px;
           border-radius:99px; background:rgba(255,255,255,.8); z-index:2; }
    .nm{ text-align:center; font-size:12px; color:var(--ink2); margin-top:7px;
         overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    `;
  }

  static getStubConfig() { return { type: 'custom:lavendel-slider-card', entity: '' }; }

  setConfig(config) {
    if (!config.entity) throw new Error('Bitte "entity" angeben.');
    super.setConfig(config);
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(`Entität ${this._config.entity} gibt es nicht.`);
    const pct = pctOf(st);
    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
      icon: this._config.icon || (this._config.entity.startsWith('cover.') ? 'mdi:window-shutter' : 'mdi:lightbulb'),
      pct: pct < 0 ? 0 : pct,
      dead: isDead(st),
      domain: this._config.entity.split('.')[0]
    };
  }

  _html(m) {
    const light = m.pct > 78;
    return `
    <ha-card>
      <div class="sl" id="sl" style="${m.dead ? 'opacity:.5' : ''}">
        <div class="fill" style="height:${m.pct}%"></div>
        <div class="pct ${light ? 'light' : ''}" id="pct">${m.dead ? '–' : m.pct + ' %'}</div>
        ${m.pct > 0 && m.pct < 100 ? `<div class="grip" id="grip" style="bottom:calc(${m.pct}% - 2px)"></div>` : ''}
        <div class="sico ${m.pct > 12 ? 'light' : ''}"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
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
        if (grip) grip.style.bottom = `calc(${v}% - 2px)`;
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
class LavendelCoverCard extends LavBase {
  static get CSS() {
    return `
    .top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:11px; }
    .pos{ text-align:right; font-size:12px; color:var(--ink3); line-height:1.35; }
    .pos b{ display:block; font-size:17px; font-weight:500; color:var(--ink);
            font-variant-numeric:tabular-nums; }
    .win{ position:relative; height:86px; border-radius:12px; overflow:hidden; cursor:pointer;
          background:linear-gradient(180deg,#dceefb 0%,#eef5fd 55%,#f4f0ea 100%);
          touch-action:pan-x; }
    .sun{ position:absolute; right:14px; top:12px; width:16px; height:16px; border-radius:50%;
          background:#ffd9a0; box-shadow:0 0 12px 4px rgba(255,208,140,.7); }
    .sill{ position:absolute; left:0; right:0; bottom:0; height:7px; background:#e2ded6; }
    .slats{ position:absolute; left:0; right:0; top:0; transition:height .12s linear; }
    .slats.zu{ background:repeating-linear-gradient(180deg,#bfc0d0 0 6px,#d5d6e1 6px 7px); }
    .slats.offen{ background:repeating-linear-gradient(180deg,#bfc0d0 0 3px,rgba(0,0,0,0) 3px 9px); }
    .kasten{ position:absolute; left:0; right:0; top:0; height:9px; background:#aeafc0;
             border-radius:0 0 3px 3px; }
    .btns{ display:flex; gap:7px; margin-top:11px; }
    .btn{ flex:1; height:38px; border-radius:12px; background:var(--surface-on);
          display:grid; place-items:center; color:var(--ink2); box-shadow:var(--soft);
          cursor:pointer; --mdc-icon-size:18px; transition:transform .12s ease; }
    .btn.act{ background:var(--grad); color:#fff; box-shadow:var(--glow); }
    .btn.dim{ opacity:.4; }
    .lam{ display:flex; align-items:center; gap:9px; margin-top:10px; }
    .lam-lbl{ font-size:11px; color:var(--ink3); white-space:nowrap; }
    .lam-track{ flex:1; height:16px; display:flex; align-items:center; cursor:pointer;
                position:relative; touch-action:pan-y; }
    .lam-track .bg{ position:absolute; left:0; right:0; height:6px; border-radius:99px;
                    background:var(--flat); }
    .lam-track .on{ position:absolute; left:0; height:6px; border-radius:99px; background:var(--grad); }
    .lam-track .knob{ position:absolute; width:14px; height:14px; border-radius:50%;
                      background:#fff; box-shadow:0 2px 6px rgba(70,55,140,.3);
                      transform:translateX(-50%); }
    .lock{ display:inline-flex; align-items:center; gap:6px; background:rgba(240,160,104,.16);
           color:#9a5f22; border-radius:99px; padding:4px 10px; font-size:11.5px;
           font-weight:500; margin-top:10px; --mdc-icon-size:13px; }
    `;
  }

  static getStubConfig() { return { type: 'custom:lavendel-cover-card', entity: '' }; }

  setConfig(config) {
    if (!config.entity) throw new Error('Bitte "entity" angeben.');
    super.setConfig(config);
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(`Entität ${this._config.entity} gibt es nicht.`);
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
      dir: st.state === 'opening' ? 'auf' : st.state === 'closing' ? 'zu' : null,
      dead: isDead(st),
      locked: !!(lockSt && lockSt.state === 'on'),
      lockLabel: this._config.lock_label || 'Windwächter aktiv'
    };
  }

  _html(m) {
    const closed = 100 - m.pos;              // Anteil, den die Store verdeckt
    const slatClass = m.tilt != null && m.tilt < 35 ? 'zu' : 'offen';
    const showTilt = m.canTilt && m.pos < 98;

    return `
    <ha-card class="${m.pos > 0 ? 'on' : ''}" style="${m.locked ? 'opacity:.72' : ''}">
      <div class="top">
        <div class="ico ${m.pos > 0 && !m.locked ? 'grad' : 'flat'}">
          <ha-icon icon="mdi:window-shutter"></ha-icon>
        </div>
        <div class="pos">
          <b>${m.dead ? '–' : m.pos >= 98 ? 'Offen' : m.pos <= 2 ? 'Zu' : m.pos + ' %'}</b>
          ${m.moving ? 'fährt ' + m.dir : m.tilt != null ? 'Lamellen ' + Math.round(m.tilt * 0.9) + '°' : esc(m.name)}
        </div>
      </div>

      <div class="win" id="win">
        ${m.pos > 30 ? `<div class="sun" style="top:calc(${closed}% + 10px)"></div>` : ''}
        <div class="slats ${slatClass}" style="height:${closed}%"></div>
        <div class="kasten"></div>
        <div class="sill"></div>
      </div>

      ${showTilt ? `
      <div class="lam">
        <span class="lam-lbl">Lamellen</span>
        <div class="lam-track" id="lam">
          <div class="bg"></div>
          <div class="on" style="width:${m.tilt || 0}%"></div>
          <div class="knob" style="left:${m.tilt || 0}%"></div>
        </div>
      </div>` : ''}

      ${m.locked ? `<div class="lock"><ha-icon icon="mdi:lock"></ha-icon>${esc(m.lockLabel)}</div>` : ''}

      <div class="btns" style="${m.locked ? 'opacity:.35' : ''}">
        <div class="btn ${m.moving ? 'dim' : ''}" id="up"><ha-icon icon="mdi:triangle"></ha-icon></div>
        <div class="btn ${m.moving ? 'act' : ''}" id="stop"><ha-icon icon="mdi:square"></ha-icon></div>
        <div class="btn ${m.moving ? 'dim' : ''}" id="down"><ha-icon icon="mdi:triangle-down"></ha-icon></div>
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
        posOut.textContent = v >= 98 ? 'Offen' : v <= 2 ? 'Zu' : v + ' %';
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
        onDrag: m.locked ? null : (v) => { on.style.width = v + '%'; knob.style.left = v + '%'; },
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
  const t = Math.floor(s);
  const m = Math.floor(t / 60), r = t % 60;
  if (m < 60) return `${m}:${String(r).padStart(2, '0')}`;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

class LavendelMediaCard extends LavBase {
  static get CSS() {
    return `
    ha-card{ padding:0; position:relative; overflow:hidden; }
    ha-card.play{ background:#111827; box-shadow:var(--soft); }

    .cover{ position:absolute; inset:0; background-size:cover; background-position:center;
            transform:scale(1.06); }
    .scrim{ position:absolute; inset:0;
            background:linear-gradient(180deg,rgba(12,14,32,.10) 0%,rgba(12,14,32,.45) 45%,rgba(12,14,32,.86) 100%); }
    .fallback{ position:absolute; inset:0;
               background:linear-gradient(160deg,#2c3e6b,#1b2440 55%,#111827); }
    .inner{ position:relative; padding:15px; min-height:172px; color:#fff;
            display:flex; flex-direction:column; justify-content:space-between; gap:10px; }

    .head{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
    .badge{ width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,.18);
            display:grid;place-items:center;--mdc-icon-size:16px;flex:none; }
    .src{ font-size:11px; color:rgba(255,255,255,.75); text-align:right; line-height:1.35;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:55%; }

    .ttl{ font-size:15px; font-weight:500; line-height:1.3;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .art{ font-size:12px; color:rgba(255,255,255,.72); overflow:hidden;
          text-overflow:ellipsis; white-space:nowrap; }

    .prog{ position:relative; height:16px; display:flex; align-items:center;
           cursor:pointer; touch-action:pan-y; margin-top:8px; }
    .prog .bg{ position:absolute; left:0; right:0; height:3px; border-radius:99px;
               background:rgba(255,255,255,.3); }
    .prog .on{ position:absolute; left:0; height:3px; border-radius:99px; background:#fff; }
    .prog .knob{ position:absolute; width:9px; height:9px; border-radius:50%; background:#fff;
                 transform:translateX(-50%); box-shadow:0 1px 4px rgba(0,0,0,.45); }
    .times{ display:flex; justify-content:space-between; font-size:10.5px;
            color:rgba(255,255,255,.65); font-variant-numeric:tabular-nums; margin-top:2px; }

    .ctr{ display:flex; justify-content:center; align-items:center; gap:20px; margin-top:2px; }
    .cbtn{ width:40px;height:40px;border-radius:50%;display:grid;place-items:center;
           color:#fff;--mdc-icon-size:22px;cursor:pointer;transition:transform .12s ease; }
    .cbtn.main{ border:1.5px solid rgba(255,255,255,.6); }
    .cbtn.off{ opacity:.32; }

    .vol{ display:flex; align-items:center; gap:9px; }
    .vol .vico{ --mdc-icon-size:16px; color:rgba(255,255,255,.8); cursor:pointer; }
    .vtrack{ flex:1; position:relative; height:16px; display:flex; align-items:center;
             cursor:pointer; touch-action:pan-y; }
    .vtrack .bg{ position:absolute; left:0; right:0; height:4px; border-radius:99px;
                 background:rgba(255,255,255,.25); }
    .vtrack .on{ position:absolute; left:0; height:4px; border-radius:99px; background:var(--grad); }
    .vtrack .knob{ position:absolute; width:12px;height:12px;border-radius:50%;background:#fff;
                   transform:translateX(-50%); box-shadow:0 2px 5px rgba(0,0,0,.35); }

    /* Ruhezustand: flache Kachel */
    .idle{ display:flex; align-items:center; gap:12px; }
    .idle .nm{ font-size:13px; font-weight:500; }
    .idle .st{ font-size:12px; color:var(--ink3); }
    `;
  }

  static getStubConfig() { return { type: 'custom:lavendel-media-card', entity: '' }; }

  setConfig(config) {
    if (!config.entity) throw new Error('Bitte "entity" angeben.');
    super.setConfig(config);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopTicker();
  }

  _model() {
    const st = this._hass.states[this._config.entity];
    if (!st) throw new Error(`Entität ${this._config.entity} gibt es nicht.`);
    const a = st.attributes;
    const f = a.supported_features || 0;
    const playing = st.state === 'playing';
    const active = ['playing', 'paused', 'buffering'].includes(st.state);

    return {
      id: this._config.entity,
      name: this._config.name || nameOf(this._hass, this._config.entity),
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
      src: a.source || a.app_name || null,
      can: {
        pause: !!(f & MF.PAUSE), play: !!(f & MF.PLAY), seek: !!(f & MF.SEEK),
        prev: !!(f & MF.PREV), next: !!(f & MF.NEXT),
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
    if (!m.active) {
      return `
      <ha-card>
        <div class="inner" style="min-height:0;padding:13px;color:var(--ink)">
          <div class="idle" id="idle">
            <div class="ico flat"><ha-icon icon="mdi:speaker"></ha-icon></div>
            <div>
              <div class="nm">${esc(m.name)}</div>
              <div class="st">${m.dead ? 'Nicht erreichbar' : 'Nichts läuft'}</div>
            </div>
          </div>
        </div>
      </ha-card>`;
    }

    const p = this._livePos(m);
    const pct = m.dur ? clamp((p / m.dur) * 100, 0, 100) : 0;

    return `
    <ha-card class="play">
      ${m.pic ? `<div class="cover" style="background-image:url('${esc(m.pic)}')"></div><div class="scrim"></div>`
              : `<div class="fallback"></div>`}
      <div class="inner">
        <div class="head">
          <div class="badge"><ha-icon icon="mdi:music-note"></ha-icon></div>
          <div class="src">${esc(m.src || m.name)}</div>
        </div>

        <div>
          <div class="ttl">${esc(m.title || m.name)}</div>
          ${m.sub ? `<div class="art">${esc(m.sub)}</div>` : ''}

          ${m.dur ? `
          <div class="prog" id="prog">
            <div class="bg"></div>
            <div class="on" style="width:${pct}%"></div>
            <div class="knob" style="left:${pct}%"></div>
          </div>
          <div class="times"><span id="tnow">${mmss(p)}</span><span>${mmss(m.dur)}</span></div>` : ''}

          <div class="ctr">
            <div class="cbtn ${m.can.prev ? '' : 'off'}" id="prev">
              <ha-icon icon="mdi:skip-previous"></ha-icon></div>
            <div class="cbtn main" id="play">
              <ha-icon icon="${m.playing ? 'mdi:pause' : 'mdi:play'}"></ha-icon></div>
            <div class="cbtn ${m.can.next ? '' : 'off'}" id="next">
              <ha-icon icon="mdi:skip-next"></ha-icon></div>
          </div>

          ${m.showVol && m.can.vol ? `
          <div class="vol">
            <div class="vico" id="mute">
              <ha-icon icon="${m.muted ? 'mdi:volume-off' : 'mdi:volume-medium'}"></ha-icon></div>
            <div class="vtrack" id="vol">
              <div class="bg"></div>
              <div class="on" style="width:${m.muted ? 0 : (m.vol || 0)}%"></div>
              <div class="knob" style="left:${m.muted ? 0 : (m.vol || 0)}%"></div>
            </div>
          </div>` : ''}
        </div>
      </div>
    </ha-card>`;
  }

  _bind(m) {
    this._stopTicker();
    const root = this.shadowRoot;

    const idle = root.getElementById('idle');
    if (idle) {
      this._press(idle, {
        onTap: () => fireMoreInfo(this, m.id),
        onHold: () => fireMoreInfo(this, m.id)
      });
      return;
    }

    // Steuertasten
    const tap = (id, fn, enabled) => {
      const el = root.getElementById(id);
      if (el) this._press(el, { onTap: () => { if (enabled !== false) fn(); } });
    };
    tap('prev', () => this.call('media_player', 'media_previous_track', { entity_id: m.id }), m.can.prev);
    tap('next', () => this.call('media_player', 'media_next_track', { entity_id: m.id }), m.can.next);
    tap('play', () => this.call('media_player', 'media_play_pause', { entity_id: m.id }));
    tap('mute', () => this.call('media_player', 'volume_mute',
      { entity_id: m.id, is_volume_muted: !m.muted }), m.can.mute);

    // Titelfortschritt: ziehen springt im Stück
    const prog = root.getElementById('prog');
    if (prog && m.dur) {
      const on = prog.querySelector('.on'), knob = prog.querySelector('.knob');
      const now = root.getElementById('tnow');
      this._press(prog, {
        axis: 'x',
        onTap: () => fireMoreInfo(this, m.id),
        onDrag: m.can.seek ? (v) => {
          on.style.width = v + '%'; knob.style.left = v + '%';
          if (now) now.textContent = mmss((v / 100) * m.dur);
        } : null,
        onDrop: m.can.seek ? (v) => this.call('media_player', 'media_seek',
          { entity_id: m.id, seek_position: Math.round((v / 100) * m.dur) }) : null
      });
    }

    // Lautstärke
    const vol = root.getElementById('vol');
    if (vol) {
      const on = vol.querySelector('.on'), knob = vol.querySelector('.knob');
      this._press(vol, {
        axis: 'x',
        onDrag: (v) => { on.style.width = v + '%'; knob.style.left = v + '%'; },
        onDrop: (v) => this.call('media_player', 'volume_set',
          { entity_id: m.id, volume_level: v / 100 })
      });
    }

    // Karte selbst: Halten öffnet das Detailfenster
    const head = root.querySelector('.head');
    if (head) this._press(head, { onTap: () => fireMoreInfo(this, m.id) });

    if (m.playing && m.dur) this._startTicker(m);
  }

  _startTicker(m) {
    const root = this.shadowRoot;
    const on = root.querySelector('.prog .on');
    const knob = root.querySelector('.prog .knob');
    const now = root.getElementById('tnow');
    if (!on) return;
    this._tick = setInterval(() => {
      if (this._busy) return;                 // nicht während des Ziehens
      const p = this._livePos(m);
      const pct = clamp((p / m.dur) * 100, 0, 100);
      on.style.width = pct + '%';
      if (knob) knob.style.left = pct + '%';
      if (now) now.textContent = mmss(p);
    }, 1000);
  }

  _stopTicker() { if (this._tick) { clearInterval(this._tick); this._tick = null; } }

  getCardSize() { return this._model && this._sig && this._sig.includes('"active":true') ? 4 : 1; }
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
    console.warn(
      `[lavendel-cards] "${tag}" ist bereits registriert — diese Datei (${LAV_VERSION}) wird ignoriert. ` +
      'Vermutlich sind zwei Ressourcen eingetragen: die alte unter /local/ und die von HACS unter /hacsfiles/. ' +
      'Den alten Eintrag unter Einstellungen → Dashboards → ⋮ → Ressourcen entfernen.'
    );
    return;
  }
  customElements.define(tag, cls);
}

defineCard('lavendel-room-card', LavendelRoomCard);
defineCard('lavendel-slider-card', LavendelSliderCard);
defineCard('lavendel-cover-card', LavendelCoverCard);
defineCard('lavendel-media-card', LavendelMediaCard);

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'lavendel-room-card',
    name: 'Lavendel Raum-Karte',
    description: 'Raumübersicht, die pro Gerätegruppe aufklappt',
    preview: false
  },
  {
    type: 'lavendel-slider-card',
    name: 'Lavendel Zieh-Regler',
    description: 'Vertikaler Regler für Licht, Storen oder Lautstärke',
    preview: false
  },
  {
    type: 'lavendel-cover-card',
    name: 'Lavendel Storen-Karte',
    description: 'Storen mit Höhe, Lamellen und Fahrtasten',
    preview: false
  },
  {
    type: 'lavendel-media-card',
    name: 'Lavendel Media-Karte',
    description: 'Cover als Hintergrund, schrumpft wenn nichts läuft',
    preview: false
  }
);

export { LavendelRoomCard, LavendelSliderCard, LavendelCoverCard, LavendelMediaCard };
