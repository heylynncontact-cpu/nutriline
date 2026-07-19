// ═══ NutriLine v2 — état & persistance ═══
// FIX v2 : les clés de date utilisent l'heure LOCALE (le v1 utilisait
// toISOString() qui est en UTC → après 22h/23h en France, les entrées
// pouvaient être enregistrées sur le mauvais jour).

function localKey(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const TODAY_KEY = localKey();
const PREFIX = 'nl2_';

function emptyDay() {
  return {
    entries: { pj: null, c1: null, dej: null, c2: null, din: null },
    extras: [],
    activity: false,
    activityText: '',
    globalNote: '',
    notif: false
  };
}

// ── Migration depuis le format v1 (nutriline_YYYY-MM-DD) ──
function migrateV1(key) {
  try {
    const raw = localStorage.getItem('nutriline_' + key);
    if (!raw) return null;
    const old = JSON.parse(raw);
    const day = emptyDay();
    ['pj', 'c1', 'dej', 'c2', 'din'].forEach(id => {
      const text = (old.journal && old.journal[id]) || '';
      const note = (old.notes && old.notes[id]) || '';
      if (text || note) {
        const slot = SLOTS.find(s => s.id === id);
        day.entries[id] = { time: slot ? slot.time : '', text, note };
      }
    });
    day.activity = !!old.activity;
    day.activityText = old.activityText || '';
    day.globalNote = (old.journal && old.journal.global) || old.quickNote || '';
    day.notif = !!old.notif;
    return day;
  } catch { return null; }
}

function readDay(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch {}
  // tentative de migration v1
  const migrated = migrateV1(key);
  if (migrated) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(migrated)); } catch {}
    return migrated;
  }
  return null;
}

function dayHasData(key) {
  const d = readDay(key);
  if (!d) return false;
  const hasEntry = Object.values(d.entries).some(e => e && e.text);
  return hasEntry || d.extras.length > 0 || d.activity || !!d.globalNote;
}

// ── état du jour courant ──
let state = readDay(TODAY_KEY) || emptyDay();

function saveState() {
  try { localStorage.setItem(PREFIX + TODAY_KEY, JSON.stringify(state)); } catch (e) {
    console.warn('save failed', e);
  }
}

function getState() { return state; }

function setEntry(slotId, data) {
  // data = { time, text, note } — null pour effacer
  state.entries[slotId] = data;
  saveState();
}

function addExtra(data) {
  state.extras.push({ id: 'x' + Date.now(), ...data });
  saveState();
}

function updateExtra(id, data) {
  const i = state.extras.findIndex(e => e.id === id);
  if (i >= 0) { state.extras[i] = { ...state.extras[i], ...data }; saveState(); }
}

function removeExtra(id) {
  state.extras = state.extras.filter(e => e.id !== id);
  saveState();
}

function setActivity(on) { state.activity = on; saveState(); }
function setActivityText(t) { state.activityText = t; saveState(); }
function setGlobalNote(t) { state.globalNote = t; saveState(); }
function setNotif(on) { state.notif = on; saveState(); }

// ── helpers stats/historique ──
function daysBack(n) {
  // renvoie les n derniers jours (clés), du plus ancien au plus récent
  const keys = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    keys.push(localKey(dd));
  }
  return keys;
}

function countFilledSlots(day) {
  if (!day) return 0;
  return Object.values(day.entries).filter(e => e && e.text).length;
}
