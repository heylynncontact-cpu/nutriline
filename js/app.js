// ── APP LOGIC ──

// ── DATE ──
const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function formatDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour, Line 🌱';
  if (h < 18) return 'Bonne journée, Line ☀️';
  return 'Bonsoir, Line 🌙';
}

// ── NAVIGATION ──
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('screen-' + name).classList.add('active');
  document.querySelector(`[data-screen="${name}"]`).classList.add('active');

  if (name === 'recap') renderRecap();
  if (name === 'journal') renderJournalEntries();
  if (name === 'export') initExportScreen();
}

// ── MEAL TOGGLE ──
function toggleMeal(id) {
  const newVal = !getState().meals[id];
  setMeal(id, newVal);
  updateMealCheck(id);
  updateHomeStats();
  if (newVal) showToast(`✓ ${MEALS_CONFIG.find(m=>m.id===id)?.name} validé !`);
}

// ── HYDRATION ──
function clickHydro(i) {
  const current = getState().hydro;
  const newVal = (i < current) ? i : i + 1;
  setHydro(newVal);
  renderHydroTrack();
  updateHomeStats();
  if (newVal >= 6) showToast('🎉 Objectif hydratation atteint !');
}

// ── ACTIVITY ──
function toggleActivity() {
  const newVal = !getState().activity;
  setActivity(newVal);
  updateActivityUI();
  if (newVal) showToast('💪 Activité enregistrée !');
}

// ── JOURNAL ──
function onJournalInput(id, val) {
  setJournal(id, val);
}

function onNoteInput(id, val) {
  setNote(id, val);
}

// ── NOTIFICATIONS ──
async function toggleNotif() {
  const current = getState().notif;
  if (!current) {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        showToast('⚠️ Autorise les notifications dans les réglages');
        return;
      }
    }
    setNotif(true);
    scheduleCollationReminders();
    showToast('🔔 Rappels collation activés !');
  } else {
    setNotif(false);
    showToast('🔕 Rappels désactivés');
  }
  updateNotifUI();
}

function scheduleCollationReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const reminders = [
    { h: 10, m: 0, msg: '🍎 Collation du matin ! 1 fruit ou compote sans sucre ajouté' },
    { h: 16, m: 0, msg: '🍎 Collation de l\'après-midi ! 1 fruit ou compote sans sucre ajouté' }
  ];
  reminders.forEach(({ h, m, msg }) => {
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target - now;
    if (diff > 0) {
      setTimeout(() => {
        if (getState().notif) {
          new Notification('NutriLine — Rappel collation', {
            body: msg,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png'
          });
        }
      }, diff);
    }
  });
}

// ── INIT ──
function init() {
  // Splash
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
  }, 1200);

  // Header
  document.getElementById('header-date').textContent = formatDate();
  document.getElementById('greeting').textContent = getGreeting();
  document.getElementById('journal-date-label').textContent = formatDate();

  // Render all
  renderMealsList();
  renderHydroTrack();
  renderPlan();
  updateHomeStats();
  updateActivityUI();
  updateNotifUI();

  // Quick note
  const qn = document.getElementById('quick-note');
  qn.value = getState().quickNote || '';
  qn.addEventListener('input', e => setQuickNote(e.target.value));

  // Activity input
  document.getElementById('activity-input').addEventListener('input', e => {
    setActivityText(e.target.value);
  });

  // Global journal textarea
  document.getElementById('j-global').addEventListener('input', e => {
    setJournal('global', e.target.value);
  });

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  // Notif button
  document.getElementById('notif-btn').addEventListener('click', toggleNotif);

  // Activity toggle
  document.getElementById('activity-toggle').addEventListener('click', toggleActivity);

  // Save journal button
  document.getElementById('save-journal-btn').addEventListener('click', () => {
    saveState();
    showToast('✅ Journal sauvegardé !');
  });

  // Keyboard accessibility for meal rows
  document.getElementById('meals-list').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('.meal-row');
      if (row) { e.preventDefault(); row.click(); }
    }
  });

  // Re-schedule notifs if they were on
  if (getState().notif) scheduleCollationReminders();

  // ── WATER FAB ──
  initWaterFab();
}

function renderWaterPanel() {
  const count = getState().hydro;
  document.getElementById('water-big-num').textContent = count;
  document.getElementById('water-fab-count').textContent = `${count}/6`;

  const row = document.getElementById('water-glasses-row');
  row.innerHTML = Array.from({length: 6}, (_, i) => `
    <div class="water-glass-big ${i < count ? 'filled' : ''}" 
         onclick="quickSetHydro(${i})" 
         aria-label="Verre ${i+1}"></div>
  `).join('');
}

function quickSetHydro(i) {
  const current = getState().hydro;
  const newVal = (i < current) ? i : i + 1;
  setHydro(newVal);
  renderWaterPanel();
  // Sync home screen if visible
  renderHydroTrack();
  updateHomeStats();
  if (newVal >= 6) showToast('🎉 Objectif hydratation atteint !');
}

function openWaterPanel() {
  renderWaterPanel();
  document.getElementById('water-panel').classList.add('open');
  document.getElementById('water-overlay').classList.add('show');
  document.getElementById('water-panel').setAttribute('aria-hidden', 'false');
}

function closeWaterPanel() {
  document.getElementById('water-panel').classList.remove('open');
  document.getElementById('water-overlay').classList.remove('show');
  document.getElementById('water-panel').setAttribute('aria-hidden', 'true');
}

function initWaterFab() {
  renderWaterPanel();

  document.getElementById('water-fab').addEventListener('click', openWaterPanel);
  document.getElementById('water-panel-close').addEventListener('click', closeWaterPanel);
  document.getElementById('water-overlay').addEventListener('click', closeWaterPanel);

  document.getElementById('water-plus').addEventListener('click', () => {
    const current = getState().hydro;
    if (current < 6) {
      setHydro(current + 1);
      renderWaterPanel();
      renderHydroTrack();
      updateHomeStats();
      if (getState().hydro >= 6) showToast('🎉 Objectif hydratation atteint !');
    } else {
      showToast('✅ Objectif déjà atteint !');
    }
  });

  document.getElementById('water-minus').addEventListener('click', () => {
    const current = getState().hydro;
    if (current > 0) {
      setHydro(current - 1);
      renderWaterPanel();
      renderHydroTrack();
      updateHomeStats();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
