// ============================================
// TARDOC KONFIGURATION
// ============================================
const CATEGORIES = {
    vigilanz:      { label: 'Vigilanz / Bewusstsein', total: 3 },
    hirnnerven:    { label: 'Hirnnerven', total: 13 },
    motorik:       { label: 'Motorik / Tonus', total: 4 },
    kraft:         { label: 'Muskelkraft', total: 6 },
    sensibilitaet: { label: 'Sensibilität', total: 4 },
    koordination:  { label: 'Koordination', total: 4 },
    gang:          { label: 'Gangbild / Stand', total: 4 },
    reflexe:       { label: 'Reflexe', total: 6 },
    pyramiden:     { label: 'Pyramidenbahnzeichen', total: 3 },
    meningeal:     { label: 'Meningeale Zeichen', total: 3 }
};

const TARDOC_THRESHOLDS = [
    { min: 1,  max: 10, code: 'AA.05.01', label: 'Kurzstatus (1–10 Items)' },
    { min: 11, max: 25, code: 'AA.05.02', label: 'Teilstatus (11–25 Items)' },
    { min: 26, max: 50, code: 'AA.05.03', label: 'Vollstatus (26–50 Items)' },
];

// ============================================
// STATE
// ============================================
let counts = {};
Object.keys(CATEGORIES).forEach(k => counts[k] = 0);

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    buildTardocRows();
    attachCheckboxListeners();
    updateAll();
    // Erste Sektion öffnen
    const firstBody = document.querySelector('.section-body');
    if (firstBody) firstBody.classList.add('open');
});

// ============================================
// TARDOC SIDEBAR AUFBAUEN
// ============================================
function buildTardocRows() {
    const container = document.getElementById('tardocRows');
    container.innerHTML = '';
    Object.keys(CATEGORIES).forEach(cat => {
        const row = document.createElement('div');
        row.className = 'tardoc-row';
        row.innerHTML = `<span>${CATEGORIES[cat].label}</span><span class="count" id="tr-${cat}">0</span>`;
        container.appendChild(row);
    });
}

// ============================================
// CHECKBOX LISTENER
// ============================================
function attachCheckboxListeners() {
    document.querySelectorAll('input[type="checkbox"][data-cat]').forEach(cb => {
        cb.addEventListener('change', () => {
            const item = cb.closest('.exam-item');
            if (cb.checked) {
                item.classList.add('checked');
            } else {
                item.classList.remove('checked');
            }
            recount();
            updateAll();
        });
    });
}

// ============================================
// ZÄHLUNG
// ============================================
function recount() {
    Object.keys(counts).forEach(k => counts[k] = 0);
    document.querySelectorAll('input[type="checkbox"][data-cat]:checked').forEach(cb => {
        const cat = cb.getAttribute('data-cat');
        if (counts.hasOwnProperty(cat)) counts[cat]++;
    });
}

// ============================================
// ALLE DISPLAYS AKTUALISIEREN
// ============================================
function updateAll() {
    let total = 0;

    Object.keys(CATEGORIES).forEach(cat => {
        const c = counts[cat];
        const t = CATEGORIES[cat].total;
        total += c;

        // Sidebar Zahl
        const el = document.getElementById(`tr-${cat}`);
        if (el) el.textContent = c;

        // Badge
        const badge = document.querySelector(`.badge[data-cat="${cat}"]`);
        if (badge) {
            badge.textContent = `${c}/${t}`;
            badge.classList.remove('partial', 'complete');
            if (c >= t) badge.classList.add('complete');
            else if (c > 0) badge.classList.add('partial');
        }
    });

    // Total
    document.getElementById('tardocTotal').textContent = total;

    // TARDOC Position
    updateTardocPosition(total);

    // Ampel
    updateAmpel(total);
}

// ============================================
// TARDOC POSITION
// ============================================
function updateTardocPosition(total) {
    const el = document.getElementById('tardocPosition');
    if (total === 0) {
        el.textContent = '–';
        el.classList.remove('active');
        return;
    }
    const match = TARDOC_THRESHOLDS.find(t => total >= t.min && total <= t.max);
    if (match) {
        el.textContent = `${match.code} – ${match.label}`;
        el.classList.add('active');
    } else {
        el.textContent = `${total} Items – über Maximum`;
        el.classList.add('active');
    }
}

// ============================================
// AMPEL
// ============================================
function updateAmpel(total) {
    const rot = document.getElementById('ampel-rot');
    const gelb = document.getElementById('ampel-gelb');
    const gruen = document.getElementById('ampel-gruen');
    const text = document.getElementById('ampel-text');

    rot.classList.remove('rot');
    gelb.classList.remove('gelb');
    gruen.classList.remove('gruen');

    if (total === 0) {
        text.textContent = 'Noch keine Items geprüft';
    } else if (total <= 10) {
        rot.classList.add('rot');
        text.textContent = `${total} Items → Kurzstatus`;
    } else if (total <= 25) {
        gelb.classList.add('gelb');
        text.textContent = `${total} Items → Teilstatus`;
    } else {
        gruen.classList.add('gruen');
        text.textContent = `${total} Items → Vollstatus`;
    }
}

// ============================================
// SECTION TOGGLE
// ============================================
function toggleSection(header) {
    const body = header.nextElementSibling;
    body.classList.toggle('open');
    const arrow = header.querySelector('span');
    if (arrow) {
        arrow.textContent = body.classList.contains('open')
            ? arrow.textContent.replace('▸', '▾')
            : arrow.textContent.replace('▾', '▸');
    }
}

// ============================================
// NORMALBEFUND
// ============================================
function fillNormal() {
    document.querySelectorAll('input[type="checkbox"][data-cat]').forEach(cb => {
        cb.checked = true;
        cb.closest('.exam-item').classList.add('checked');
    });
    // Selects auf erste "normale" Option setzen
    document.querySelectorAll('.exam-item select').forEach(sel => {
        if (sel.options.length > 1) sel.selectedIndex = 1;
    });
    recount();
    updateAll();
}

// ============================================
// ZURÜCKSETZEN
// ============================================
function clearAll() {
    document.querySelectorAll('input[type="checkbox"][data-cat]').forEach(cb => {
        cb.checked = false;
        cb.closest('.exam-item').classList.remove('checked');
    });
    document.querySelectorAll('.exam-item select').forEach(sel => sel.selectedIndex = 0);
    document.querySelectorAll('textarea').forEach(ta => ta.value = '');
    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(inp => inp.value = '');
    recount();
    updateAll();
}

// ============================================
// BERICHT
// ============================================
function generateReport() {
    let report = '══════════════════════════════════════\n';
    report += '  NEUROLOGISCHER UNTERSUCHUNGSBERICHT\n';
    report += '  ' + new Date().toLocaleString('de-CH') + '\n';
    report += '══════════════════════════════════════\n\n';

    document.querySelectorAll('.exam-section[data-category]').forEach(section => {
        const cat = section.getAttribute('data-category');
        const title = section.querySelector('.section-header span').textContent.replace('▸ ', '').replace('▾ ', '');
        const items = section.querySelectorAll('.exam-item');
        let sectionText = '';

        items.forEach(item => {
            const cb = item.querySelector('input[type="checkbox"][data-cat]');
            if (cb && cb.checked) {
                const label = cb.parentElement.textContent.trim();
                const selects = item.querySelectorAll('select');
                const inputs = item.querySelectorAll('input[type="text"], input[type="number"]');
                let vals = [];
                selects.forEach(s => { if (s.value) vals.push(s.value); });
                inputs.forEach(i => { if (i.value) vals.push(i.value); });
                sectionText += `  • ${label}`;
                if (vals.length) sectionText += `: ${vals.join(', ')}`;
                sectionText += '\n';
            }
        });

        // Freitext
        const ta = section.querySelector('textarea');
        if (ta && ta.value.trim()) {
            sectionText += `  📝 ${ta.value.trim()}\n`;
        }

        if (sectionText) {
            report += `${title}\n${'─'.repeat(40)}\n${sectionText}\n`;
        }
    });

    // TARDOC
    let total = Object.values(counts).reduce((a, b) => a + b, 0);
    report += '══════════════════════════════════════\n';
    report += `TARDOC: ${total} Items geprüft\n`;
    const match = TARDOC_THRESHOLDS.find(t => total >= t.min && total <= t.max);
    if (match) report += `Position: ${match.code} – ${match.label}\n`;
    report += '══════════════════════════════════════\n';

    document.getElementById('reportText').textContent = report;
    document.getElementById('modal').classList.add('show');
    window._lastReport = report;
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

function copyReport() {
    if (!window._lastReport) generateReport();
    navigator.clipboard.writeText(window._lastReport).then(() => {
        alert('✅ Bericht in Zwischenablage kopiert!');
    });
}
