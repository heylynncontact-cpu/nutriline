// ═══ NutriLine v2 — rendu UI ═══

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtTime(t) { return t ? t.replace(':', 'h') : ''; }

// ── TIMELINE (Aujourd'hui) ──
function renderTimeline() {
  const s = getState();
  const el = document.getElementById('timeline');

  // fusionner slots + extras, triés par heure
  const items = SLOTS.map(slot => ({
    kind: 'slot', id: slot.id, name: slot.name, emoji: slot.emoji,
    time: (s.entries[slot.id] && s.entries[slot.id].time) || slot.time,
    entry: s.entries[slot.id]
  }));
  s.extras.forEach(x => items.push({
    kind: 'extra', id: x.id, name: 'Autre', emoji: '✚',
    time: x.time || '', entry: x
  }));
  items.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  el.innerHTML = items.map(it => {
    const filled = it.entry && it.entry.text;
    return `
    <div class="tl-item ${filled ? 'filled' : ''}" data-kind="${it.kind}" data-id="${it.id}">
      <div class="tl-rail">
        <span class="tl-time">${fmtTime(it.time)}</span>
        <span class="tl-dot"></span>
        <span class="tl-line"></span>
      </div>
      <div class="tl-card">
        <div class="tl-name">${it.emoji} ${esc(it.name)} ${filled ? '<span class="tl-badge">noté</span>' : ''}</div>
        ${filled
          ? `<div class="tl-text">${esc(it.entry.text)}</div>${it.entry.note ? `<div class="tl-note">${esc(it.entry.note)}</div>` : ''}`
          : `<div class="tl-empty"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter</div>`
        }
      </div>
    </div>`;
  }).join('') + `
    <button class="tl-add-extra" id="add-extra">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Ajouter autre chose (grignotage, extra…)
    </button>`;

  // listeners
  el.querySelectorAll('.tl-item').forEach(item => {
    item.addEventListener('click', () => openEntrySheet(item.dataset.kind, item.dataset.id));
  });
  document.getElementById('add-extra').addEventListener('click', () => openEntrySheet('extra', null));
}

function renderTodayHead() {
  const d = new Date();
  document.getElementById('today-title').textContent = 'Aujourd\'hui';
  document.getElementById('today-sub').textContent =
    `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]}`;
}

function renderActivity() {
  const s = getState();
  const tog = document.getElementById('activity-toggle');
  const input = document.getElementById('activity-input');
  const sub = document.getElementById('activity-sub');
  tog.classList.toggle('on', s.activity);
  tog.setAttribute('aria-pressed', s.activity);
  input.classList.toggle('hidden', !s.activity);
  input.value = s.activityText || '';
  sub.textContent = s.activity
    ? (s.activityText || 'Activité faite ✓')
    : 'Pas encore aujourd\'hui';
}

// ── PLAN ──
function renderPlan() {
  const el = document.getElementById('plan-content');
  el.innerHTML = PLAN_DATA.map(m => `
    <div class="plan-meal">
      <div class="plan-meal-head">
        <span>${m.emoji}</span>
        <span class="plan-meal-name">${m.name}</span>
        <span class="plan-meal-time">${m.time}</span>
      </div>
      ${m.items.map(i => `<div class="plan-line">${i}</div>`).join('')}
    </div>
  `).join('') + `
    <div class="plan-meal-head" style="margin-top:4px"><span class="plan-meal-name">Règles générales</span></div>
    <div class="plan-rules">
      ${PLAN_RULES.map(r => `<div class="plan-rule">${r}</div>`).join('')}
    </div>`;
}

// ── CALENDRIER ──
let calYear, calMonth; // mois affiché

function renderCalendar() {
  const now = new Date();
  if (calYear === undefined) { calYear = now.getFullYear(); calMonth = now.getMonth(); }

  document.getElementById('cal-month').textContent = `${FR_MONTHS[calMonth]} ${calYear}`;

  const first = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  // lundi = 0
  let startCol = (first.getDay() + 6) % 7;

  const todayK = localKey();
  let html = '';
  for (let i = 0; i < startCol; i++) html += '<span></span>';
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = key === todayK;
    const isFuture = keyToDate(key) > now;
    const has = !isFuture && dayHasData(key);
    html += `<button class="cal-day ${isToday ? 'today' : ''} ${has ? 'has-data' : ''}"
      data-key="${key}" ${isFuture ? 'disabled' : ''}>
      ${d}${has ? '<span class="cal-dot"></span>' : ''}
    </button>`;
  }
  document.getElementById('cal-days').innerHTML = html;

  document.querySelectorAll('.cal-day:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => openDaySheet(btn.dataset.key));
  });

  // streak sous le titre
  const streak = computeStreak();
  document.getElementById('cal-streak-sub').textContent =
    streak > 1 ? `🔥 ${streak} jours d'affilée` : 'Ton journal jour par jour';
}

// ── STATS ──
function computeStreak() {
  let streak = 0;
  const d = new Date();
  // aujourd'hui compte s'il a des données, sinon on regarde depuis hier
  if (!dayHasData(localKey(d))) d.setDate(d.getDate() - 1);
  while (dayHasData(localKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeBestStreak(windowDays = 90) {
  let best = 0, cur = 0;
  daysBack(windowDays).forEach(k => {
    if (dayHasData(k)) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  });
  return best;
}

function renderStats() {
  const keys30 = daysBack(30);
  const days30 = keys30.map(k => ({ key: k, day: readDay(k) }));
  const tracked = days30.filter(d => d.day && dayHasData(d.key)).length;
  const streak = computeStreak();
  const best = computeBestStreak();
  const activityCount = days30.filter(d => d.day && d.day.activity).length;

  // régularité par slot sur 30j
  const reg = SLOTS.map(slot => {
    const n = days30.filter(d => d.day && d.day.entries[slot.id] && d.day.entries[slot.id].text).length;
    return { name: slot.name, emoji: slot.emoji, pct: Math.round(n / 30 * 100) };
  });

  // 14 derniers jours — nb de repas notés / jour
  const keys14 = daysBack(14);
  const bars = keys14.map(k => {
    const day = readDay(k);
    const count = countFilledSlots(day);
    const dt = keyToDate(k);
    return { count, lbl: FR_DAYS_SHORT[dt.getDay()][0], full: count >= 5 };
  });
  const maxBar = 5;

  document.getElementById('stats-content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-tile hero">
        <div class="stat-num">${streak} <em style="color:inherit;opacity:0.6">j</em></div>
        <div class="stat-lbl">🔥 Série en cours</div>
      </div>
      <div class="stat-tile">
        <div class="stat-num">${best} <em>j</em></div>
        <div class="stat-lbl">Meilleure série</div>
      </div>
      <div class="stat-tile">
        <div class="stat-num">${tracked}<em>/30</em></div>
        <div class="stat-lbl">Jours suivis</div>
      </div>
      <div class="stat-tile">
        <div class="stat-num">${activityCount}<em>/30</em></div>
        <div class="stat-lbl">Jours avec activité 💪</div>
      </div>
    </div>

    <div class="soft-card">
      <div class="card-t">Repas notés — 14 derniers jours</div>
      <div class="bar-chart">
        ${bars.map(b => `
          <div class="bar-col">
            <div class="bar ${b.full ? 'full' : ''}" style="height:${Math.max(4, b.count / maxBar * 100)}%"></div>
            <span class="bar-lbl">${b.lbl}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="soft-card">
      <div class="card-t" style="margin-bottom:6px">Régularité par repas <span style="font-weight:400;color:var(--muted);font-size:12px">· 30 j</span></div>
      <div class="meal-reg">
        ${reg.map(r => `
          <div class="reg-row">
            <span class="reg-name">${r.emoji} ${r.name}</span>
            <div class="reg-track"><div class="reg-fill" style="width:${r.pct}%"></div></div>
            <span class="reg-pct">${r.pct}%</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}
