// ── UI RENDERING ──

function renderMealsList() {
  const container = document.getElementById('meals-list');
  const s = getState();
  container.innerHTML = MEALS_CONFIG.map(m => `
    <div class="meal-row" onclick="toggleMeal('${m.id}')" role="button" aria-pressed="${s.meals[m.id]}" tabindex="0">
      <div class="meal-time-col">${m.time}</div>
      <div class="meal-info">
        <div class="meal-name">${m.emoji} ${m.name}</div>
        <div class="meal-desc">${m.desc}</div>
      </div>
      <div class="meal-check ${s.meals[m.id] ? 'done' : ''}" id="check-${m.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    </div>
  `).join('');
}

function updateMealCheck(id) {
  const el = document.getElementById('check-' + id);
  if (!el) return;
  const done = getState().meals[id];
  el.classList.toggle('done', done);
  el.closest('.meal-row').setAttribute('aria-pressed', done);
}

function renderHydroTrack() {
  const track = document.getElementById('hydro-track');
  const count = getState().hydro;
  track.innerHTML = Array.from({length: 6}, (_, i) => `
    <button class="hydro-glass ${i < count ? 'filled' : ''}" onclick="clickHydro(${i})" aria-label="Verre ${i+1}">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21C8 21 5 17 5 13V5l1-1h12l1 1v8c0 4-3 8-7 8z"/>
      </svg>
    </button>
  `).join('');
  document.getElementById('hydro-count').textContent = count;
}

function renderPlan() {
  const container = document.getElementById('plan-content');
  const blocks = PLAN_DATA.map(block => `
    <div class="plan-block">
      <div class="plan-block-header">
        <span class="plan-block-icon">${block.icon}</span>
        <span class="plan-block-title">${block.title}</span>
        <span class="plan-block-time">${block.time}</span>
      </div>
      <div class="plan-items-list">
        ${block.items.map(item => `<div class="plan-item">${item}</div>`).join('')}
      </div>
    </div>
  `).join('');

  const rules = `
    <div class="section-label">Règles générales</div>
    <div class="plan-rules">
      ${PLAN_RULES.map(r => `<div class="plan-rule">${r}</div>`).join('')}
    </div>
  `;

  container.innerHTML = `<div class="section-label" style="margin-top:16px;">Repas</div>${blocks}${rules}`;
}

function renderJournalEntries() {
  const container = document.getElementById('journal-entries');
  const s = getState();
  container.innerHTML = MEALS_CONFIG.map(m => `
    <div class="journal-entry-card">
      <div class="journal-meal-label">${m.emoji} ${m.name} · ${m.time}</div>
      <textarea class="textarea" rows="2" placeholder="Ce que j\'ai mangé…"
        id="j-${m.id}" oninput="onJournalInput(\'${m.id}\', this.value)"
      >${s.journal[m.id] || ''}</textarea>
      <textarea class="textarea" rows="2" placeholder="Commentaire — nouvel aliment, sensation, envie…"
        id="note-${m.id}" oninput="onNoteInput(\'${m.id}\', this.value)"
        style="margin-top:6px;font-size:13px;color:var(--text-muted)"
      >${(s.notes && s.notes[m.id]) || ''}</textarea>
    </div>
  `).join('');

  const globalTa = document.getElementById('j-global');
  globalTa.value = s.journal.global || '';
}

function renderRecap() {
  const s = getState();
  const mealsDone = Object.values(s.meals).filter(Boolean).length;

  document.getElementById('recap-meals-count').textContent = `${mealsDone}/5`;
  document.getElementById('recap-hydro-count').textContent = `${s.hydro}/6`;

  // Meals detail
  const mealsDetail = document.getElementById('recap-meals-detail');
  mealsDetail.innerHTML = MEALS_CONFIG.map(m => `
    <div class="recap-meal-row">
      <span class="recap-meal-name">${m.emoji} ${m.name}</span>
      <span class="recap-badge ${s.meals[m.id] ? 'badge-done' : 'badge-miss'}">
        ${s.meals[m.id] ? 'Validé ✓' : 'Non validé'}
      </span>
    </div>
  `).join('');

  // Activity
  const actDetail = document.getElementById('recap-activity-detail');
  if (s.activity) {
    actDetail.innerHTML = `<p class="recap-text">💪 ${s.activityText || 'Activité physique effectuée'}</p>`;
  } else {
    actDetail.innerHTML = `<p class="recap-text" style="color:var(--text-light)">Aucune activité enregistrée</p>`;
  }

  // Journal
  const journalDetail = document.getElementById('recap-journal-detail');
  const mealNames = { pj:'Petit déjeuner', c1:'Collation matin', dej:'Déjeuner', c2:'Collation PM', din:'Dîner' };
  const hasJournal = Object.entries(s.journal).some(([,v]) => v && v.trim());
  if (hasJournal) {
    journalDetail.innerHTML = Object.entries(s.journal).filter(([,v]) => v && v.trim()).map(([k,v]) => {
      const name = k === 'global' ? '💬 Ressenti global' : `${MEALS_CONFIG.find(m=>m.id===k)?.emoji||''} ${mealNames[k]||k}`;
      const feeling = k !== 'global' && s.feelings[k] != null ? ` ${FEELINGS[s.feelings[k]].emoji}` : '';
      return `<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:3px">${name}${feeling}</div><p class="recap-text">${v}</p></div>`;
    }).join('');
  } else {
    journalDetail.innerHTML = `<p class="recap-text" style="color:var(--text-light)">Aucune note pour aujourd'hui</p>`;
  }
}

function updateHomeStats() {
  const s = getState();
  const done = Object.values(s.meals).filter(Boolean).length;
  document.getElementById('meals-done-count').textContent = done;
  document.getElementById('hydro-stat').textContent = s.hydro;
}

function updateActivityUI() {
  const s = getState();
  const tog = document.getElementById('activity-toggle');
  const input = document.getElementById('activity-input');
  tog.classList.toggle('on', s.activity);
  tog.setAttribute('aria-pressed', s.activity);
  input.className = `text-input ${s.activity ? 'activity-visible' : 'activity-hidden'}`;
  input.value = s.activityText || '';
}

function updateNotifUI() {
  const s = getState();
  const btn = document.getElementById('notif-btn');
  btn.classList.toggle('active', s.notif);
  btn.setAttribute('title', s.notif ? 'Rappels activés' : 'Activer les rappels collation');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
