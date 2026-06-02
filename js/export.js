// ── PDF EXPORT ──

const EXPORT_OPTIONS = [
  { id: 'repas',      label: 'Repas validés',          default: true },
  { id: 'hydro',      label: 'Hydratation',             default: true },
  { id: 'journal',    label: 'Journal alimentaire',     default: true },
  { id: 'feelings',   label: 'Commentaires par repas',    default: true },
  { id: 'activite',   label: 'Activité physique',       default: true },
  { id: 'note',       label: 'Notes générales',         default: false },
];

const MEAL_NAMES = {
  pj: 'Petit déjeuner', c1: 'Collation matin',
  dej: 'Déjeuner', c2: 'Collation après-midi', din: 'Dîner'
};
const FEELING_LABELS = ['Bien 😊', 'Neutre 😐', 'Moyen 😔', 'Mal 🤢'];
const FR_DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const FR_MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function formatDateFR(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${FR_DAYS[dt.getDay()]} ${d} ${FR_MONTHS[m - 1]} ${y}`;
}

function isoToKey(date) {
  return date.toISOString().slice(0, 10);
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDaysInRange(fromKey, toKey) {
  const days = [];
  const start = keyToDate(fromKey);
  const end = keyToDate(toKey);
  const cur = new Date(start);
  while (cur <= end) {
    days.push(isoToKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function loadDayData(key) {
  try {
    const raw = localStorage.getItem(`nutriline_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getSelectedOptions() {
  const opts = {};
  EXPORT_OPTIONS.forEach(o => {
    const el = document.getElementById(`opt-${o.id}`);
    opts[o.id] = el ? el.checked : o.default;
  });
  return opts;
}

function updateExportPreview() {
  const from = document.getElementById('export-date-from').value;
  const to = document.getElementById('export-date-to').value;
  const card = document.getElementById('export-preview-card');
  const content = document.getElementById('export-preview-content');
  if (!from || !to || from > to) { card.style.display = 'none'; return; }

  const days = getDaysInRange(from, to);
  const daysWithData = days.filter(k => loadDayData(k));
  card.style.display = 'block';

  const rangeLabel = from === to
    ? formatDateFR(from)
    : `${formatDateFR(from)} → ${formatDateFR(to)}`;

  content.innerHTML = `
    <div style="margin-bottom:6px"><strong>${rangeLabel}</strong></div>
    <div>${days.length} jour${days.length > 1 ? 's' : ''} sélectionné${days.length > 1 ? 's' : ''}</div>
    <div style="color:var(--green)">${daysWithData.length} jour${daysWithData.length > 1 ? 's' : ''} avec données enregistrées</div>
    ${daysWithData.length === 0 ? '<div style="color:var(--amber);margin-top:4px">⚠️ Aucune donnée sur cette période</div>' : ''}
  `;
}

function generatePDF() {
  const from = document.getElementById('export-date-from').value;
  const to = document.getElementById('export-date-to').value;

  if (!from || !to) { showToast('⚠️ Sélectionne une période'); return; }
  if (from > to) { showToast('⚠️ La date de début doit être avant la fin'); return; }

  const days = getDaysInRange(from, to);
  const opts = getSelectedOptions();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const GREEN = [45, 106, 79];
  const GREEN_LIGHT = [240, 250, 242];
  const BLUE = [21, 101, 192];
  const GRAY = [100, 100, 96];
  const BORDER = [220, 220, 215];
  const TEXT = [26, 26, 24];
  const MUTED = [107, 107, 101];

  const W = 210;
  const M = 14;
  const CW = W - M * 2;
  let y = 0;

  function newPage() {
    doc.addPage();
    y = 14;
    // subtle header line
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(M, 8, W - M, 8);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('NutriLine — Suivi alimentaire', M, 7);
    const rangeShort = from === to ? formatDateFR(from) : `${from} → ${to}`;
    doc.text(rangeShort, W - M, 7, { align: 'right' });
  }

  function checkY(needed = 10) {
    if (y + needed > 280) newPage();
  }

  // ── COVER PAGE ──
  // Green header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 52, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('NutriLine', M, 22);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Carnet de suivi alimentaire', M, 31);

  doc.setFontSize(10);
  doc.setTextColor(200, 235, 210);
  const rangeLabel = from === to
    ? formatDateFR(from)
    : `Du ${formatDateFR(from)} au ${formatDateFR(to)}`;
  doc.text(rangeLabel, M, 40);

  doc.setFontSize(9);
  doc.text('Julie Havez — diététicienne nutritionniste', M, 48);

  y = 62;

  // Summary box on cover
  const daysWithData = days.filter(k => loadDayData(k));
  let totalMealsDone = 0, totalHydro = 0, totalActivity = 0;
  daysWithData.forEach(k => {
    const d = loadDayData(k);
    if (!d) return;
    totalMealsDone += Object.values(d.meals || {}).filter(Boolean).length;
    totalHydro += d.hydro || 0;
    if (d.activity) totalActivity++;
  });
  const avgHydro = daysWithData.length ? (totalHydro / daysWithData.length).toFixed(1) : '—';

  doc.setFillColor(...GREEN_LIGHT);
  doc.roundedRect(M, y, CW, 38, 3, 3, 'F');
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 38, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DE LA PÉRIODE', M + 6, y + 8);

  const cols = [M + 6, M + 6 + CW / 3, M + 6 + (CW / 3) * 2];
  const statY = y + 20;

  [[String(daysWithData.length), 'jours avec données'],
   [String(totalMealsDone), 'repas validés'],
   [avgHydro + ' verres', 'hydratation moy.']
  ].forEach(([val, lbl], i) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN);
    doc.text(val, cols[i], statY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(lbl, cols[i], statY + 6);
  });

  y += 52;

  // ── DAILY PAGES ──
  days.forEach((dayKey, idx) => {
    const data = loadDayData(dayKey);

    if (idx > 0 || y > 100) newPage();
    else { y += 4; }

    checkY(20);

    // Day header
    doc.setFillColor(...GREEN);
    doc.roundedRect(M, y, CW, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDateFR(dayKey), M + 4, y + 7);
    y += 14;

    if (!data) {
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'italic');
      doc.text('Aucune donnée enregistrée pour cette journée.', M + 2, y);
      y += 10;
      return;
    }

    // ── REPAS ──
    if (opts.repas) {
      checkY(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GREEN);
      doc.text('REPAS', M, y);
      y += 5;

      const meals = data.meals || {};
      const feelings = data.feelings || {};
      const journal = data.journal || {};

      Object.entries(MEAL_NAMES).forEach(([id, name]) => {
        checkY(8);
        const done = meals[id];
        const feeling = feelings[id] != null ? FEELINGS_LABELS[feelings[id]] : null;
        const mealText = opts.journal && journal[id] ? journal[id] : null;
        const note = opts.feelings && data.notes && data.notes[id] ? data.notes[id] : null;
        const combinedNote = [mealText, note].filter(Boolean).join(' — ') || null;

        // Row bg
        doc.setFillColor(done ? 240 : 255, done ? 250 : 245, done ? 242 : 244);
        doc.roundedRect(M, y - 3.5, CW, note ? 13 : 7, 1.5, 1.5, 'F');

        // Status dot
        doc.setFillColor(...(done ? GREEN : [200, 200, 195]));
        doc.circle(M + 3.5, y + 0, 2, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', done ? 'bold' : 'normal');
        doc.setTextColor(...TEXT);
        doc.text(name, M + 8, y + 0.5);

        if (combinedNote) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...MUTED);
          const lines = doc.splitTextToSize(combinedNote, CW - 12);
          doc.text(lines[0], M + 8, y + 6);
          y += 5;
        }

        y += 8;
        checkY(8);
      });

      y += 2;
    }

    // ── HYDRATATION ──
    if (opts.hydro) {
      checkY(18);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BLUE);
      doc.text('HYDRATATION', M, y);
      y += 5;

      const hydro = data.hydro || 0;
      const hydroMl = hydro * 250;

      // Bar background
      doc.setFillColor(227, 242, 253);
      doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
      // Bar fill
      const fillW = Math.min(1, hydro / 6) * CW;
      if (fillW > 0) {
        doc.setFillColor(...BLUE);
        doc.roundedRect(M, y, fillW, 8, 2, 2, 'F');
      }
      // Glasses icons (dots)
      for (let i = 0; i < 6; i++) {
        const cx = M + (i + 0.5) * (CW / 6);
        doc.setFillColor(i < hydro ? 255 : 180, i < hydro ? 255 : 180, i < hydro ? 255 : 200);
        doc.circle(cx, y + 4, 1.5, 'F');
      }
      y += 11;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      doc.text(`${hydro}/6 verres — ${hydroMl} ml / 1500 ml objectif`, M, y);
      if (hydro >= 6) {
        doc.setTextColor(...GREEN);
        doc.text('✓ Objectif atteint', W - M - 2, y, { align: 'right' });
      }
      y += 8;
    }

    // ── ACTIVITÉ ──
    if (opts.activite) {
      checkY(10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRAY);
      doc.text('ACTIVITÉ PHYSIQUE', M, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      if (data.activity) {
        doc.setTextColor(...GREEN);
        doc.text(`✓ ${data.activityText || 'Activité effectuée'}`, M, y);
      } else {
        doc.setTextColor(...MUTED);
        doc.text('Aucune activité enregistrée', M, y);
      }
      y += 8;
    }

    // ── RESSENTI GLOBAL ──
    if (opts.note && data.journal && data.journal.global) {
      checkY(14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRAY);
      doc.text('RESSENTI GLOBAL', M, y);
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...MUTED);
      const lines = doc.splitTextToSize(data.journal.global, CW);
      doc.text(lines.slice(0, 3), M, y);
      y += lines.slice(0, 3).length * 5 + 4;
    }

    // separator
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 6;
  });

  // ── FOOTER last page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${i} / ${pageCount}`, W - M, 292, { align: 'right' });
    doc.text('Généré par NutriLine', M, 292);
  }

  // Save
  const filename = from === to
    ? `nutriline_${from}.pdf`
    : `nutriline_${from}_au_${to}.pdf`;
  doc.save(filename);
  showToast('📄 PDF généré !');
}

// Use correct label array name
const FEELINGS_LABELS = ['Bien', 'Neutre', 'Moyen', 'Mal'];

function initExportScreen() {
  // Default dates: this week Mon → today
  const today = new Date();
  const todayKey = isoToKey(today);
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const monKey = isoToKey(mon);

  const fromInput = document.getElementById('export-date-from');
  const toInput = document.getElementById('export-date-to');
  fromInput.value = monKey;
  toInput.value = todayKey;

  fromInput.addEventListener('change', updateExportPreview);
  toInput.addEventListener('change', updateExportPreview);

  // Quick range buttons
  const ranges = [
    { label: "Aujourd'hui", fn: () => [todayKey, todayKey] },
    { label: '7 derniers jours', fn: () => {
      const d = new Date(today); d.setDate(d.getDate() - 6);
      return [isoToKey(d), todayKey];
    }},
    { label: '14 jours', fn: () => {
      const d = new Date(today); d.setDate(d.getDate() - 13);
      return [isoToKey(d), todayKey];
    }},
    { label: 'Ce mois', fn: () => {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return [isoToKey(d), todayKey];
    }},
  ];

  const qr = document.getElementById('quick-ranges');
  ranges.forEach(r => {
    const btn = document.createElement('button');
    btn.textContent = r.label;
    btn.style.cssText = `
      padding: 5px 12px;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--bg);
      font-size: 12px;
      font-family: var(--font);
      color: var(--text-muted);
      cursor: pointer;
    `;
    btn.addEventListener('click', () => {
      const [f, t] = r.fn();
      fromInput.value = f;
      toInput.value = t;
      updateExportPreview();
      // active style
      qr.querySelectorAll('button').forEach(b => {
        b.style.background = 'var(--bg)';
        b.style.color = 'var(--text-muted)';
        b.style.borderColor = 'var(--border)';
      });
      btn.style.background = 'var(--green-pale)';
      btn.style.color = 'var(--green)';
      btn.style.borderColor = 'var(--green)';
    });
    qr.appendChild(btn);
  });

  // Options
  const optContainer = document.getElementById('export-options');
  EXPORT_OPTIONS.forEach(o => {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--text);cursor:pointer';
    row.innerHTML = `
      <span>${o.label}</span>
      <input type="checkbox" id="opt-${o.id}" ${o.default ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--green);cursor:pointer" />
    `;
    optContainer.appendChild(row);
  });

  document.getElementById('generate-pdf-btn').addEventListener('click', generatePDF);

  updateExportPreview();
}
