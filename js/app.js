// ═══ NutriLine v2 — logique app ═══

let sheetCtx = null; // { kind: 'slot'|'extra', id }

// ── NAVIGATION ──
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  const btn = document.querySelector(`.nav-btn[data-screen="${name}"]`);
  if (btn) btn.classList.add('active');

  if (name === 'history') renderCalendar();
  if (name === 'stats') renderStats();
  if (name === 'export') initExportScreen();
}

// ── ENTRY SHEET ──
function openEntrySheet(kind, id) {
  const s = getState();
  sheetCtx = { kind, id };

  let title = 'Nouvelle entrée';
  let entry = null;

  if (kind === 'slot') {
    const slot = SLOTS.find(x => x.id === id);
    title = `${slot.emoji} ${slot.name}`;
    entry = s.entries[id];
    document.getElementById('sheet-time').value = (entry && entry.time) || slot.time;
  } else if (kind === 'extra' && id) {
    const x = s.extras.find(e => e.id === id);
    title = '✚ Autre';
    entry = x;
    document.getElementById('sheet-time').value = (x && x.time) || currentTime();
  } else {
    title = '✚ Autre';
    document.getElementById('sheet-time').value = currentTime();
  }

  document.getElementById('sheet-title').textContent = title;
  document.getElementById('sheet-text').value = (entry && entry.text) || '';
  document.getElementById('sheet-note').value = (entry && entry.note) || '';
  document.getElementById('sheet-delete').classList.toggle('hidden', !(entry && entry.text));

  document.getElementById('entry-sheet').classList.add('open');
  document.getElementById('overlay').classList.add('show');
  setTimeout(() => document.getElementById('sheet-text').focus(), 350);
}

function closeSheets() {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
  document.getElementById('overlay').classList.remove('show');
  sheetCtx = null;
}

function saveSheet() {
  if (!sheetCtx) return;
  const time = document.getElementById('sheet-time').value;
  const text = document.getElementById('sheet-text').value.trim();
  const note = document.getElementById('sheet-note').value.trim();

  if (sheetCtx.kind === 'slot') {
    setEntry(sheetCtx.id, text || note ? { time, text, note } : null);
  } else if (sheetCtx.kind === 'extra') {
    if (sheetCtx.id) {
      if (text || note) updateExtra(sheetCtx.id, { time, text, note });
      else removeExtra(sheetCtx.id);
    } else if (text || note) {
      addExtra({ time, text, note });
    }
  }
  closeSheets();
  renderTimeline();
  showToast('✓ Enregistré');
}

function deleteSheet() {
  if (!sheetCtx) return;
  if (sheetCtx.kind === 'slot') setEntry(sheetCtx.id, null);
  else if (sheetCtx.kind === 'extra' && sheetCtx.id) removeExtra(sheetCtx.id);
  closeSheets();
  renderTimeline();
  showToast('Effacé');
}

function currentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── DAY DETAIL SHEET (historique) ──
function openDaySheet(key) {
  const day = readDay(key);
  const dt = keyToDate(key);
  document.getElementById('day-sheet-title').textContent =
    `${FR_DAYS[dt.getDay()]} ${dt.getDate()} ${FR_MONTHS[dt.getMonth()]}`;

  const body = document.getElementById('day-sheet-body');
  if (!day || !dayHasData(key)) {
    body.innerHTML = '<p class="ds-empty" style="padding:8px 0 16px">Aucune donnée ce jour-là.</p>';
  } else {
    const rows = [];
    SLOTS.forEach(slot => {
      const e = day.entries[slot.id];
      if (e && e.text) {
        rows.push(`<div class="ds-entry">
          <div class="ds-name">${slot.emoji} ${slot.name}<span class="ds-time">${fmtTime(e.time)}</span></div>
          <div class="ds-text">${esc(e.text)}</div>
          ${e.note ? `<div class="ds-note">${esc(e.note)}</div>` : ''}
        </div>`);
      }
    });
    (day.extras || []).forEach(x => {
      if (x.text) rows.push(`<div class="ds-entry">
        <div class="ds-name">✚ Autre<span class="ds-time">${fmtTime(x.time)}</span></div>
        <div class="ds-text">${esc(x.text)}</div>
        ${x.note ? `<div class="ds-note">${esc(x.note)}</div>` : ''}
      </div>`);
    });
    if (day.activity) {
      rows.push(`<div class="ds-entry"><div class="ds-name">💪 Activité</div><div class="ds-text">${esc(day.activityText || 'Effectuée')}</div></div>`);
    }
    if (day.globalNote) {
      rows.push(`<div class="ds-entry"><div class="ds-name">💬 Note du jour</div><div class="ds-text">${esc(day.globalNote)}</div></div>`);
    }
    body.innerHTML = rows.join('') || '<p class="ds-empty">Aucune donnée.</p>';
  }

  document.getElementById('day-sheet').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}

// ── NOTIFICATIONS ──
async function toggleNotif() {
  const s = getState();
  if (!s.notif) {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        showToast('⚠️ Autorise les notifications dans Réglages');
        return;
      }
    } else {
      showToast('⚠️ Notifications non supportées ici');
      return;
    }
    setNotif(true);
    scheduleReminders();
    showToast('🔔 Rappels collation activés');
  } else {
    setNotif(false);
    showToast('🔕 Rappels désactivés');
  }
  updateNotifBtn();
}

function updateNotifBtn() {
  document.getElementById('notif-btn').classList.toggle('on', getState().notif);
}

function scheduleReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  [{ h: 10, m: 0, msg: '🍎 Collation du matin — 1 fruit ou compote sans sucre' },
   { h: 16, m: 0, msg: '🍎 Collation de l\'après-midi — 1 fruit ou compote sans sucre' }
  ].forEach(({ h, m, msg }) => {
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target - Date.now();
    if (diff > 0) setTimeout(() => {
      if (getState().notif) new Notification('NutriLine', { body: msg, icon: 'icons/icon-192.png' });
    }, diff);
  });
}

// ── INIT ──
function init() {
  renderTodayHead();
  renderTimeline();
  renderActivity();
  renderPlan();
  updateNotifBtn();

  const s = getState();
  document.getElementById('global-note').value = s.globalNote || '';
  document.getElementById('global-note').addEventListener('input', e => setGlobalNote(e.target.value));

  document.getElementById('activity-toggle').addEventListener('click', () => {
    setActivity(!getState().activity);
    renderActivity();
    if (getState().activity) showToast('💪 Activité notée');
  });
  document.getElementById('activity-input').addEventListener('input', e => {
    setActivityText(e.target.value);
    document.getElementById('activity-sub').textContent = e.target.value || 'Activité faite ✓';
  });

  document.querySelectorAll('.nav-btn').forEach(b =>
    b.addEventListener('click', () => showScreen(b.dataset.screen)));

  document.getElementById('notif-btn').addEventListener('click', toggleNotif);

  // sheets
  document.getElementById('overlay').addEventListener('click', closeSheets);
  document.getElementById('sheet-close').addEventListener('click', closeSheets);
  document.getElementById('day-sheet-close').addEventListener('click', closeSheets);
  document.getElementById('sheet-save').addEventListener('click', saveSheet);
  document.getElementById('sheet-delete').addEventListener('click', deleteSheet);

  // calendrier
  document.getElementById('cal-prev').addEventListener('click', () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  document.getElementById('open-export').addEventListener('click', () => showScreen('export'));

  if (s.notif) scheduleReminders();

  // passage de minuit : recharger si le jour change pendant que l'app est ouverte
  setInterval(() => {
    if (localKey() !== TODAY_KEY) location.reload();
  }, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);
