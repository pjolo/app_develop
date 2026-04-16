/* ================================================
   NEUROSTATUS – App Logic
   ================================================ */

// ─── TARDOC CONFIG ───────────────────────────────
const TARDOC = {
    code: 'AA.05.0130',
    description: 'Neurologischer Status, detailliert',
    tpAL: 46.59,
    tpIPL: 0,
    requiredGroups: 9,
    minGroups: 9,
    categories: {
        vigilanz:          { label: 'Vigilanz',             min: 1 },
        hirnnerven:        { label: 'Hirnnerven',           min: 6 },
        spontanmotorik:    { label: 'Spontanmotorik',       min: 1 },
        muskelkraft:       { label: 'Muskelkraft',          min: 1 },
        sensibilitaet:     { label: 'Sensibilität',         min: 1 },
        koordination:      { label: 'Koordination',         min: 1 },
        gangbild:          { label: 'Gangbild',             min: 1 },
        reflexe:           { label: 'Muskeleigenreflexe',   min: 1 },
        pyramidenzeichen:  { label: 'Pyramidenzeichen',     min: 1 }
    }
};

// ─── STATE ───────────────────────────────────────
const state = {
    checked: {},       // itemId → true
    categoryCount: {}, // category → number of checked items
    fulfilled: {}      // category → boolean
};

// Initialize state
Object.keys(TARDOC.categories).forEach(cat => {
    state.categoryCount[cat] = 0;
    state.fulfilled[cat] = false;
});

// ─── DOM READY ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCheckboxes();
    initSections();
    updateAll();
});

// ─── CHECKBOX HANDLING ───────────────────────────
function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.exam-item input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', handleCheckboxChange);
    });
}

function handleCheckboxChange(e) {
    const cb = e.target;
    const itemId = cb.dataset.item;
    const examItem = cb.closest('.exam-item');
    const category = examItem?.dataset?.tardoc;

    if (!itemId || !category) return;

    if (cb.checked) {
        state.checked[itemId] = true;
        examItem.classList.add('checked');
    } else {
        delete state.checked[itemId];
        examItem.classList.remove('checked');
    }

    recountCategory(category);
    updateAll();
}

function recountCategory(category) {
    const items = document.querySelectorAll(`.exam-item[data-tardoc="${category}"] input[type="checkbox"]`);
    let count = 0;
    items.forEach(cb => {
        if (cb.checked) count++;
    });
    state.categoryCount[category] = count;
}

// ─── RECALC ALL CATEGORIES ──────────────────────
function recountAllCategories() {
    Object.keys(TARDOC.categories).forEach(cat => {
        recountCategory(cat);
    });
}

// ─── FULFILLMENT CHECK ──────────────────────────
function checkFulfillment() {
    Object.keys(TARDOC.categories).forEach(cat => {
        const min = TARDOC.categories[cat].min;
        state.fulfilled[cat] = state.categoryCount[cat] >= min;
    });
}

function getFulfilledCount() {
    return Object.values(state.fulfilled).filter(Boolean).length;
}

function isFullyFulfilled() {
    return getFulfilledCount() >= TARDOC.minGroups;
}

// ─── UPDATE ALL UI ──────────────────────────────
function updateAll() {
    checkFulfillment();
    updateTrafficLight();
    updateRequirementsList();
    updateBadges();
    updateTaxpoints();
}

// ─── TRAFFIC LIGHT ──────────────────────────────
function updateTrafficLight() {
    const ampel = document.getElementById('ampel');
    const light = document.getElementById('ampel-light');
    const text = document.getElementById('ampel-text');

    if (!ampel) return;

    const count = getFulfilledCount();
    const total = TARDOC.requiredGroups;

    if (isFullyFulfilled()) {
        ampel.classList.add('green');
        light.textContent = '🟢';
        text.textContent = `Alle ${total} Gruppen erfüllt`;
    } else {
        ampel.classList.remove('green');
        light.textContent = '🔴';
        text.textContent = `${count}/${total} Gruppen erfüllt`;
    }
}

// ─── REQUIREMENTS LIST ──────────────────────────
function updateRequirementsList() {
    Object.keys(TARDOC.categories).forEach(cat => {
        const icon = document.getElementById(`req-${cat}`);
        if (!icon) return;

        if (state.fulfilled[cat]) {
            icon.textContent = '✓';
            icon.classList.add('fulfilled');
        } else {
            icon.textContent = '✗';
            icon.classList.remove('fulfilled');
        }

        // Update count display if exists
        const countEl = document.getElementById(`count-${cat}`);
        if (countEl) {
            const min = TARDOC.categories[cat].min;
            const current = state.categoryCount[cat];
            countEl.textContent = `${current}/${min}`;
        }
    });
}

// ─── SECTION BADGES ─────────────────────────────
function updateBadges() {
    // Map sections to categories
    const sectionMap = {
        'vigilanz': ['vigilanz'],
        'hirnnerven': ['hirnnerven'],
        'motorik': ['spontanmotorik', 'muskelkraft'],
        'sensibilitaet': ['sensibilitaet'],
        'koordination-gang': ['koordination', 'gangbild'],
        'reflexe': ['reflexe', 'pyramidenzeichen']
    };

    Object.keys(sectionMap).forEach(sectionId => {
        const badge = document.getElementById(`badge-${sectionId}`);
        if (!badge) return;

        const cats = sectionMap[sectionId];
        let totalChecked = 0;
        let allFulfilled = true;

        cats.forEach(cat => {
            totalChecked += state.categoryCount[cat] || 0;
            if (!state.fulfilled[cat]) allFulfilled = false;
        });

        if (totalChecked === 0) {
            badge.textContent = '';
            badge.style.background = '#e2e8f0';
            badge.style.color = '#64748b';
        } else if (allFulfilled) {
            badge.textContent = `✓ ${totalChecked}`;
            badge.style.background = '#dcfce7';
            badge.style.color = '#166534';
        } else {
            badge.textContent = `${totalChecked}`;
            badge.style.background = '#fef3c7';
            badge.style.color = '#92400e';
        }
    });
}

// ─── TAXPOINTS ──────────────────────────────────
function updateTaxpoints() {
    const tpEl = document.getElementById('tp-display');
    if (!tpEl) return;

    if (isFullyFulfilled()) {
        tpEl.textContent = `AL: ${TARDOC.tpAL} TP | IPL: ${TARDOC.tpIPL} TP`;
    } else {
        tpEl.textContent = 'Anforderungen nicht erfüllt';
    }
}

// ─── SECTION TOGGLE ─────────────────────────────
function initSections() {
    // Open first section by default
    const first = document.querySelector('.exam-section');
    if (first) first.classList.add('open');
}

function toggleSection(headerEl) {
    const section = headerEl.closest('.exam-section');
    if (!section) return;

    const isOpen = section.classList.contains('open');

    // Toggle clicked section
    if (isOpen) {
        section.classList.remove('open');
    } else {
        section.classList.add('open');
    }

    // Update arrow
    const h2 = headerEl.querySelector('h2');
    if (h2) {
        const text = h2.textContent.replace(/^[▸▾]\s*/, '');
        h2.textContent = (section.classList.contains('open') ? '▾ ' : '▸ ') + text;
    }
}

// ─── PRINT ──────────────────────────────────────
function printForm() {
    // Temporarily open all sections for printing
    const sections = document.querySelectorAll('.exam-section');
    const wasOpen = [];

    sections.forEach((s, i) => {
        wasOpen[i] = s.classList.contains('open');
        s.classList.add('open');
    });

    window.print();

    // Restore state after print dialog
    setTimeout(() => {
        sections.forEach((s, i) => {
            if (!wasOpen[i]) s.classList.remove('open');
        });
    }, 500);
}

// ─── RESET ──────────────────────────────────────
function resetForm() {
    if (!confirm('Alle Eingaben zurücksetzen?')) return;

    // Uncheck all checkboxes
    document.querySelectorAll('.exam-item input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    // Uncheck all radios
    document.querySelectorAll('.exam-item input[type="radio"]').forEach(r => {
        r.checked = false;
    });

    // Reset all selects
    document.querySelectorAll('.exam-item select').forEach(sel => {
        sel.selectedIndex = 0;
    });

    // Reset all text inputs
    document.querySelectorAll('.exam-item input[type="text"], .exam-item input[type="number"]').forEach(inp => {
        inp.value = '';
    });

    // Reset all textareas
    document.querySelectorAll('textarea').forEach(ta => {
        ta.value = '';
    });

    // Remove checked highlights
    document.querySelectorAll('.exam-item.checked').forEach(el => {
        el.classList.remove('checked');
    });

    // Reset state
    Object.keys(state.checked).forEach(k => delete state.checked[k]);
    Object.keys(TARDOC.categories).forEach(cat => {
        state.categoryCount[cat] = 0;
        state.fulfilled[cat] = false;
    });

    updateAll();
}
