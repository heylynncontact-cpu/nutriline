// ═══ NutriLine v2 — export PDF ═══

const EXPORT_OPTIONS = [
  { id: 'meals',    label: 'Repas & commentaires', def: true },
  { id: 'extras',   label: 'Extras / grignotages', def: true },
  { id: 'activity', label: 'Activité physique',    def: true },
  { id: 'notes',    label: 'Notes du jour',        def: true }
];

function rangeDays(fromKey, toKey) {
  const out = [];
  const cur = keyToDate(fromKey);
  const end = keyToDate(toKey);
  while (cur <= end) {
    out.push(localKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function fmtLong(key) {
  const d = keyToDate(key);
  return `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function exportOpts() {
  const o = {};
  EXPORT_OPTIONS.forEach(x => {
    const el = document.getElementById('xopt-' + x.id);
    o[x.id] = el ? el.checked : x.def;
  });
  return o;
}

function updatePreview() {
  const from = document.getElementById('export-from').value;
  const to = document.getElementById('export-to').value;
  const box = document.getElementById('export-preview');
  if (!from || !to || from > to) { box.style.display = 'none'; return; }
  const keys = rangeDays(from, to);
  const withData = keys.filter(dayHasData);
  box.style.display = 'block';
  box.innerHTML = `
    <div class="card-t" style="margin-bottom:6px">Aperçu</div>
    <div style="font-size:13px;color:var(--muted);line-height:1.7">
      <strong style="color:var(--ink)">${fmtLong(from)}${from !== to ? ' → ' + fmtLong(to) : ''}</strong><br>
      ${keys.length} jour${keys.length > 1 ? 's' : ''} · <span style="color:var(--accent-deep);font-weight:600">${withData.length} avec données</span>
      ${withData.length === 0 ? '<br><span style="color:var(--warn)">⚠️ Aucune donnée sur cette période</span>' : ''}
    </div>`;
}

let exportInited = false;
function initExportScreen() {
  updatePreview();
  if (exportInited) return;
  exportInited = true;

  const today = new Date();
  const todayK = localKey(today);
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const fromI = document.getElementById('export-from');
  const toI = document.getElementById('export-to');
  fromI.value = localKey(mon);
  toI.value = todayK;
  fromI.addEventListener('change', updatePreview);
  toI.addEventListener('change', updatePreview);

  const ranges = [
    { l: "Aujourd'hui", f: () => [todayK, todayK] },
    { l: '7 jours', f: () => { const d = new Date(today); d.setDate(d.getDate() - 6); return [localKey(d), todayK]; } },
    { l: '14 jours', f: () => { const d = new Date(today); d.setDate(d.getDate() - 13); return [localKey(d), todayK]; } },
    { l: 'Ce mois', f: () => [localKey(new Date(today.getFullYear(), today.getMonth(), 1)), todayK] }
  ];
  const qr = document.getElementById('quick-ranges');
  ranges.forEach(r => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = r.l;
    b.addEventListener('click', () => {
      const [f, t] = r.f();
      fromI.value = f; toI.value = t;
      qr.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
      b.classList.add('sel');
      updatePreview();
    });
    qr.appendChild(b);
  });

  const oc = document.getElementById('export-options');
  EXPORT_OPTIONS.forEach(o => {
    const row = document.createElement('label');
    row.className = 'opt-row';
    row.innerHTML = `<span>${o.label}</span><input type="checkbox" id="xopt-${o.id}" ${o.def ? 'checked' : ''}/>`;
    oc.appendChild(row);
  });

  document.getElementById('generate-pdf').addEventListener('click', generatePDF);
  updatePreview();
}

function generatePDF() {
  const from = document.getElementById('export-from').value;
  const to = document.getElementById('export-to').value;
  if (!from || !to) { showToast('⚠️ Choisis une période'); return; }
  if (from > to) { showToast('⚠️ Dates inversées'); return; }

  const keys = rangeDays(from, to);
  const opts = exportOpts();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const INK = [22, 24, 22];
  const MUTED = [133, 135, 131];
  const ACCENT = [5, 150, 105];
  const SOFT = [236, 253, 245];
  const LINE = [225, 226, 223];

  const W = 210, M = 16, CW = W - M * 2;
  let y = 0;

  function header() {
    doc.setDrawColor(...LINE); doc.setLineWidth(0.3);
    doc.line(M, 9, W - M, 9);
    doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text('NutriLine — Journal alimentaire', M, 7);
    doc.text(`${from} → ${to}`, W - M, 7, { align: 'right' });
  }
  function newPage() { doc.addPage(); y = 16; header(); }
  function need(h) { if (y + h > 282) newPage(); }

  // ── COUVERTURE ──
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, W, 46, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
  doc.text('NutriLine', M, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.text('Journal alimentaire', M, 28);
  doc.setFontSize(9); doc.setTextColor(220, 250, 235);
  doc.text(from === to ? fmtLong(from) : `Du ${fmtLong(from)} au ${fmtLong(to)}`, M, 36);
  doc.text('Pour Julie Havez — diététicienne nutritionniste', M, 42);

  y = 56;

  // résumé
  const withData = keys.filter(dayHasData);
  let totalEntries = 0, actDays = 0;
  withData.forEach(k => {
    const d = readDay(k);
    totalEntries += countFilledSlots(d) + (d.extras || []).filter(x => x.text).length;
    if (d.activity) actDays++;
  });

  doc.setFillColor(...SOFT);
  doc.roundedRect(M, y, CW, 30, 3, 3, 'F');
  const cols = [M + 8, M + 8 + CW / 3, M + 8 + CW / 3 * 2];
  [[String(withData.length), 'jours renseignés'],
   [String(totalEntries), 'repas notés'],
   [String(actDays), 'jours avec activité']].forEach(([v, l], i) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...ACCENT);
    doc.text(v, cols[i], y + 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(l, cols[i], y + 20);
  });
  y += 40;

  // ── JOURS ──
  keys.forEach(key => {
    const day = readDay(key);
    need(24);

    doc.setFillColor(...INK);
    doc.roundedRect(M, y, CW, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text(fmtLong(key), M + 4, y + 6.2);
    y += 14;

    if (!day || !dayHasData(key)) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...MUTED);
      doc.text('Aucune donnée.', M + 2, y);
      y += 10;
      return;
    }

    if (opts.meals) {
      SLOTS.forEach(slot => {
        const e = day.entries[slot.id];
        need(14);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        if (e && e.text) {
          doc.setTextColor(...INK);
          doc.text(`${slot.name}`, M + 2, y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(8);
          doc.text(e.time ? e.time.replace(':', 'h') : '', W - M - 2, y, { align: 'right' });
          y += 4.5;
          doc.setFontSize(9); doc.setTextColor(60, 62, 59);
          const lines = doc.splitTextToSize(e.text, CW - 8);
          need(lines.length * 4.5 + 4);
          doc.text(lines, M + 4, y);
          y += lines.length * 4.5;
          if (e.note) {
            doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
            const nl = doc.splitTextToSize('» ' + e.note, CW - 10);
            need(nl.length * 4 + 3);
            doc.text(nl, M + 4, y + 1);
            y += nl.length * 4 + 1;
          }
          y += 3;
        } else {
          doc.setTextColor(...MUTED);
          doc.setFont('helvetica', 'normal');
          doc.text(`${slot.name} — non renseigné`, M + 2, y);
          y += 6;
        }
      });
    }

    if (opts.extras && day.extras && day.extras.filter(x => x.text).length) {
      need(10);
      day.extras.filter(x => x.text).forEach(x => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...ACCENT);
        doc.text('Extra', M + 2, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(8);
        doc.text(x.time ? x.time.replace(':', 'h') : '', W - M - 2, y, { align: 'right' });
        y += 4.5;
        doc.setFontSize(9); doc.setTextColor(60, 62, 59);
        const lines = doc.splitTextToSize(x.text + (x.note ? ` — ${x.note}` : ''), CW - 8);
        need(lines.length * 4.5 + 4);
        doc.text(lines, M + 4, y);
        y += lines.length * 4.5 + 3;
      });
    }

    if (opts.activity) {
      need(8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      if (day.activity) {
        doc.setTextColor(...ACCENT);
        doc.text(`Activité : ${day.activityText || 'effectuée'}`, M + 2, y);
      } else {
        doc.setTextColor(...MUTED);
        doc.setFont('helvetica', 'normal');
        doc.text('Activité : aucune', M + 2, y);
      }
      y += 6;
    }

    if (opts.notes && day.globalNote) {
      need(12);
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
      const nl = doc.splitTextToSize('Note du jour : ' + day.globalNote, CW - 6);
      doc.text(nl, M + 2, y);
      y += nl.length * 4 + 3;
    }

    doc.setDrawColor(...LINE); doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 7;
  });

  // pagination
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(`${i} / ${n}`, W - M, 292, { align: 'right' });
  }

  doc.save(from === to ? `nutriline_${from}.pdf` : `nutriline_${from}_${to}.pdf`);
  showToast('📄 PDF généré');
}
