// ============================================
// TARDOC KONFIGURATION – KATEGORIE-BASIERT
// ============================================
const CATEGORIES = {
    vigilanz:      { label: 'Vigilanz',              total: 3,  minRequired: 1 },
    hirnnerven:    { label: 'Hirnnerven (6/12)',      total: 13, minRequired: 6 },
    motorik:       { label: 'Spontanmotorik / Tonus', total: 4,  minRequired: 1 },
    kraft:         { label: 'Muskelkraft',            total: 6,  minRequired: 1 },
    sensibilitaet: { label: 'Sensibilität',           total: 4,  minRequired: 1 },
    koordination:  { label: 'Koordination',           total: 4,  minRequired: 1 },
    gang:          { label: 'Gangbild / Stand',       total: 4,  minRequired: 1 },
    reflexe:       { label: 'Muskeleigenreflexe',     total: 6,  minRequired: 1 },
    pyramiden:     { label: 'Pyramidenzeichen',       total: 3,  minRequired: 1 },
    meningeal:     { label: 'Meningeale Zeichen',     total: 3,  minRequired: 0 }
};

// Pflicht-Kategorien für Vollstatus (alle ausser meningeal)
const REQUIRED_CATS = ['vigilanz','hirnnerven','motorik','kraft','sensibilitaet','koordination','gang','reflexe','pyramiden'];

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
    const firstBody = document.querySelector('.section-body');
    if (firstBody) firstBody.classList.add('open');
});

// ============================================
// TARDOC SIDEBAR
// ============================================
function buildTardocRows() {
    const container = document.getElementById('tardocRows');
    container.innerHTML = '';
    Object.keys(CATEGORIES).forEach(cat => {
        const cfg = CATEGORIES[cat];
        const row = document.createElement('div');
        row.className = 'tardoc-row';
        row.id = `trow-${cat}`;
        row.innerHTML = `
            <span class="tr-status" id="ts-${cat}">○</span>
            <span class="tr-label">${cfg.label}</span>
            <span class="tr-count" id="tr-${cat}">0/${cfg.minRequired > 0 ? cfg.minRequired : '–'}</span>
        `;
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
// ALLES AKTUALISIEREN
// ============================================
function updateAll() {
    let fulfilledCount = 0;
    let totalChecked = 0;

    Object.keys(CATEGORIES).forEach(cat => {
        const cfg = CATEGORIES[cat];
        const c = counts[cat];
        totalChecked += c;

        const isFulfilled = cfg.minRequired > 0 && c >= cfg.minRequired;
        const isPartial = cfg.minRequired > 0 && c > 0 && c < cfg.minRequired;
        const isOptional = cfg.minRequired === 0;

        if (isFulfilled) fulfilledCount++;

        // Sidebar row
        const row = document.getElementById(`trow-${cat}`);
        const status = document.getElementById(`ts-${cat}`);
        const count = document.getElementById(`tr-${cat}`);

        if (row) {
            row.classList.remove('fulfilled', 'partial', 'missing');
            if (isFulfilled) {
                row.classList.add('fulfilled');
                status.textContent = '✅';
            } else if (isPartial) {
                row.classList.add('partial');
                status.textContent = '🟡';
            } else if (isOptional) {
                status.textContent = c > 0 ? '✅' : '○';
            } else {
                row.classList.add('missing');
                status.textContent = '❌';
            }
        }

        if (count) {
            if (cfg.minRequired > 0) {
                count.textContent = `${c}/${cfg.minRequired}`;
            } else {
                count.textContent = c > 0 ? `${c} ✓` : '–';
            }
        }

        // Badge
        const badge = document.querySelector(`.badge[data-cat="${cat}"]`);
        if (badge) {
            badge.textContent = `${c}/${cfg.total}`;
            badge.classList.remove('partial', 'complete');
            if (isFulfilled) badge.classList.add('complete');
            else if (isPartial) badge.classList.add('partial');
        }
    });

    // Total
    document.getElementById('tardocTotal').textContent = `${fulfilledCount}/${REQUIRED_CATS.length} Kategorien`;

    // TARDOC Position
    updateTardocPosition(fulfilledCount);

    // Ampel
    updateAmpel(fulfilledCount);
}

// ============================================
// TARDOC POSITION
// ============================================
function updateTardocPosition(fulfilled) {
    const el = document.getElementById('tardocPosition');
    const total = REQUIRED_CATS.length; // 9

    if (fulfilled === 0) {
        el.textContent = 'Noch keine Kategorie erfüllt';
        el.className = 'tardoc-position';
    } else if (fulfilled < total) {
        const missing = REQUIRED_CATS.filter(cat => counts[cat] < CATEGORIES[cat].minRequired);
        const missingLabels = missing.map(cat => CATEGORIES[cat].label);
        el.innerHTML = `<strong>${fulfilled}/${total} Kategorien erfüllt</strong><br>
            <span style="color:#c0392b;font-size:12px;">Fehlend: ${missingLabels.join(', ')}</span>`;
        el.className = 'tardoc-position partial-pos';
    } else {
        el.innerHTML = `<strong>✅ VOLLSTATUS ERFÜLLT</strong><br>
            <span style="font-size:12px;">Alle ${total} Pflicht-Kategorien abgedeckt</span>`;
        el.className = 'tardoc-position active';
    }
}

// ============================================
// AMPEL
// ============================================
function updateAmpel(fulfilled) {
    const rot = document.getElementById('ampel-rot');
    const gelb = document.getElementById('ampel-gelb');
    const gruen = document.getElementById('ampel-gruen');
    const text = document.getElementById('ampel-text');
    const total = REQUIRED_CATS.length;

    rot.classList.remove('rot');
    gelb.classList.remove('gelb');
    gruen.classList.remove('gruen');

    if (fulfilled === 0) {
        text.textContent = 'Noch keine Kategorie erfüllt';
    } else if (fulfilled < total) {
        if (fulfilled <= 3) {
            rot.classList.add('rot');
        } else {
            gelb.classList.add('gelb');
        }
        text.textContent = `${fulfilled}/${total} Kategorien – noch ${total - fulfilled} fehlend`;
    } else {
        gruen.classList.add('gruen');
        text.textContent = `Vollstatus erfüllt! (${total}/${total} Kategorien)`;
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

        const ta = section.querySelector('textarea');
        if (ta && ta.value.trim()) {
            sectionText += `  📝 ${ta.value.trim()}\n`;
        }

        if (sectionText) {
            report += `${title}\n${'─'.repeat(40)}\n${sectionText}\n`;
        }
    });

    // TARDOC Summary
    let fulfilled = REQUIRED_CATS.filter(cat => counts[cat] >= CATEGORIES[cat].minRequired).length;
    report += '══════════════════════════════════════\n';
    report += `TARDOC: ${fulfilled}/${REQUIRED_CATS.length} Pflicht-Kategorien erfüllt\n`;
    if (fulfilled >= REQUIRED_CATS.length) {
        report += '→ VOLLSTATUS ERFÜLLT\n';
    } else {
        const missing = REQUIRED_CATS.filter(cat => counts[cat] < CATEGORIES[cat].minRequired);
        report += `→ Fehlend: ${missing.map(c => CATEGORIES[c].label).join(', ')}\n`;
    }
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
        alert('✅ Bericht kopiert!');
    });
}
