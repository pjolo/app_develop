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
    updatePrintDate();
    const firstBody = document.querySelector('.section-body');
    if (firstBody) firstBody.classList.add('open');
});

// ============================================
// PRINT DATE
// ============================================
function updatePrintDate() {
    const el = document.getElementById('printDate');
    if (el) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = new Date().toLocaleDateString('de-CH', options);
    }
}

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
// CHECKBOX LISTENERS
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
// RECOUNT
// ============================================
function recount() {
    Object.keys(counts).forEach(k => counts[k] = 0);
    document.querySelectorAll('input[type="checkbox"][data-cat]:checked').forEach(cb => {
        const cat = cb.dataset.cat;
        if (counts.hasOwnProperty(cat)) counts[cat]++;
    });
}

// ============================================
// SECTION TOGGLE
// ============================================
function toggleSection(headerEl) {
    const body = headerEl.nextElementSibling;
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open');
    const label = headerEl.querySelector('span');
    if (isOpen) {
        label.textContent = label.textContent.replace('▾', '▸');
    } else {
        label.textContent = label.textContent.replace('▸', '▾');
    }
}

// ============================================
// UPDATE ALL
// ============================================
function updateAll() {
    let fulfilledCount = 0;

    Object.keys(CATEGORIES).forEach(cat => {
        const cfg = CATEGORIES[cat];
        const count = counts[cat];
        const row = document.getElementById(`trow-${cat}`);
        const countEl = document.getElementById(`tr-${cat}`);
        const statusEl = document.getElementById(`ts-${cat}`);
        const badge = document.getElementById(`badge-${cat}`);

        const minLabel = cfg.minRequired > 0 ? cfg.minRequired : '–';
        countEl.textContent = `${count}/${minLabel}`;

        // Row class
        row.classList.remove('fulfilled', 'partial', 'missing');
        if (cfg.minRequired === 0) {
            if (count > 0) {
                row.classList.add('fulfilled');
                statusEl.textContent = '✅';
            } else {
                row.classList.add('missing');
                statusEl.textContent = '○';
            }
        } else if (count >= cfg.minRequired) {
            row.classList.add('fulfilled');
            statusEl.textContent = '✅';
            if (REQUIRED_CATS.includes(cat)) fulfilledCount++;
        } else if (count > 0) {
            row.classList.add('partial');
            statusEl.textContent = '⚠️';
        } else {
            row.classList.add('missing');
            statusEl.textContent = '○';
        }

        // Badge
        if (badge) {
            badge.textContent = `${count}/${minLabel}`;
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
    const total = REQUIRED_CATS.length;

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
    const total = REQUIRED_CATS.length;
    const rot = document.getElementById('ampel-rot');
    const gelb = document.getElementById('ampel-gelb');
    const gruen = document.getElementById('ampel-gruen');
    const text = document.getElementById('ampel-text');

    // Reset
    rot.classList.remove('rot');
    gelb.classList.remove('gelb');
    gruen.classList.remove('gruen');

    if (fulfilled === 0) {
        rot.classList.add('rot');
        text.textContent = 'Noch keine Items geprüft';
    } else if (fulfilled < total) {
        gelb.classList.add('gelb');
        text.textContent = `${fulfilled}/${total} Kategorien – noch nicht vollständig`;
    } else {
        gruen.classList.add('gruen');
        text.textContent = 'Vollstatus erfüllt ✓';
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
