// ── STATE MANAGEMENT ──

const TODAY_KEY = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
})();

const STORAGE_KEY = `nutriline_${TODAY_KEY}`;

const DEFAULT_STATE = () => ({
  meals: { pj: false, c1: false, dej: false, c2: false, din: false },
  hydro: 0,
  activity: false,
  activityText: '',
  notif: false,
  journal: { pj: '', c1: '', dej: '', c2: '', din: '', global: '' },
  feelings: { pj: null, c1: null, dej: null, c2: null, din: null },
  quickNote: ''
});

let state = DEFAULT_STATE();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...DEFAULT_STATE(), ...parsed };
    }
  } catch (e) {
    console.warn('Could not load state:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function getState() { return state; }

function setMeal(id, val) {
  state.meals[id] = val;
  saveState();
}

function setHydro(val) {
  state.hydro = Math.max(0, Math.min(6, val));
  saveState();
}

function setActivity(val) {
  state.activity = val;
  saveState();
}

function setActivityText(val) {
  state.activityText = val;
  saveState();
}

function setNotif(val) {
  state.notif = val;
  saveState();
}

function setJournal(id, val) {
  state.journal[id] = val;
  saveState();
}

function setFeeling(id, val) {
  state.feelings[id] = val;
  saveState();
}

function setQuickNote(val) {
  state.quickNote = val;
  saveState();
}

loadState();

function setNote(id, val) {
  if (!state.notes) state.notes = {};
  state.notes[id] = val;
  saveState();
}
