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
const REQUIRED_CATS = [
    'vigilanz',
    'hirnnerven',
    'motorik',
    'kraft',
    'sensibilitaet',
    'koordination',
    'gang',
    'reflexe',
    'pyramiden'
];
// ============================================
// TARDOC POSITIONEN & MAPPING
// ============================================
const MP_GRUPPEN_MAPPING = {
    vigilanz:      { gruppe: 1,  label: 'Allg. Neurostatus' },
    motorik:       { gruppe: 2,  label: 'Motorik 1-2 Ext.' },
    kraft:         { gruppe: 4,  label: 'Paresegradierung 1-2 Ext.' },
    sensibilitaet: { gruppe: 7,  label: 'Sensorik 1-2 Ext.' },
    koordination:  { gruppe: 9,  label: 'Koordination' },
    meningeal:     { gruppe: 11, label: 'Meningismus/Vegetativum' },
    gang:          { gruppe: 14, label: 'Gangbild' },
    reflexe:       { gruppe: 2,  label: 'Motorik (Reflexe)' },
    pyramiden:     { gruppe: 2,  label: 'Motorik (Pyramiden)' }
};
const TARDOC_CODES = {
    vollstatus: {
        code: 'AA.05.0130',
        name: 'Neurol. Untersuchung Hirnstatus (Vollstatus)',
        color: '#27ae60'
    },
    teilBis3: {
        code: 'MP.00.0020',
        name: 'Neurol. Exploration ≤3 Gruppen',
        color: '#f39c12'
    },
    teil4Plus: {
        code: 'MP.00.0040',
        name: 'Neurol. Exploration ≥4 Gruppen',
        color: '#e67e22'
    },
    hirnnervenBis3: {
        code: 'MP.00.0050',
        name: 'Hirnnerven-Exploration ≤3 Gruppen',
        color: '#3498db'
    },
    hirnnerven4Plus: {
        code: 'MP.00.0060',
        name: 'Hirnnerven-Exploration ≥4 Gruppen',
        color: '#2980b9'
    }
};
// ============================================
// STATE
// ============================================
var counts = {};
Object.keys(CATEGORIES).forEach(function (k) {
    counts[k] = 0;
});
// Globale Variable für aktuelle TARDOC-Positionen (für PDF)
var currentTardocPositions = [];
// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    buildTardocRows();
    attachCheckboxListeners();
    updateAll();
    updatePrintDate();
var firstBody = document.querySelector('.section-body');
if (firstBody) {
    firstBody.classList.add('open');
}
});
// ============================================
// PRINT DATE
// ============================================
function updatePrintDate() {
    var el = document.getElementById('printDate');
    if (el) {
        var options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        el.textContent = new Date().toLocaleDateString('de-CH', options);
    }
}
// ============================================
// TARDOC SIDEBAR ROWS
// ============================================
function buildTardocRows() {
    var container = document.getElementById('tardocRows');
    container.innerHTML = '';
Object.keys(CATEGORIES).forEach(function (cat) {
    var cfg = CATEGORIES[cat];
    var row = document.createElement('div');
    row.className = 'tardoc-row';
    row.id = 'trow-' + cat;

    var minLabel = cfg.minRequired > 0 ? cfg.minRequired : '–';

    row.innerHTML =
        '<span class="tr-status" id="ts-' + cat + '">○</span>' +
        '<span class="tr-label">' + cfg.label + '</span>' +
        '<span class="tr-count" id="tr-' + cat + '">0/' + minLabel + '</span>';

    container.appendChild(row);
});
}
// ============================================
// CHECKBOX-LISTENER
// ============================================
function attachCheckboxListeners() {
    document.querySelectorAll('input[type="checkbox"][data-cat]').forEach(function (cb) {
        cb.addEventListener('change', function () {
            var item = cb.closest('.exam-item');
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
    Object.keys(counts).forEach(function (k) {
        counts[k] = 0;
    });
document.querySelectorAll('input[type="checkbox"][data-cat]:checked').forEach(function (cb) {
    var cat = cb.dataset.cat;
    if (counts.hasOwnProperty(cat)) {
        counts[cat]++;
    }
});
}
// ============================================
// UPDATE ALL
// ============================================
function updateAll() {
    var fulfilled = 0;
Object.keys(CATEGORIES).forEach(function (cat) {
    var cfg = CATEGORIES[cat];
    var cnt = counts[cat];
    var min = cfg.minRequired;

    var row = document.getElementById('trow-' + cat);
    var statusEl = document.getElementById('ts-' + cat);
    var countEl = document.getElementById('tr-' + cat);
    var badge = document.getElementById('badge-' + cat);

    // Count-Anzeige
    if (min > 0) {
        countEl.textContent = cnt + '/' + min;
    } else {
        countEl.textContent = cnt + '/–';
    }

    // Status-Klassen
    row.classList.remove('fulfilled', 'partial', 'missing');

    if (min === 0) {
        if (cnt > 0) {
            row.classList.add('fulfilled');
            statusEl.textContent = '✓';
        } else {
            row.classList.add('missing');
            statusEl.textContent = '○';
        }
    } else if (cnt >= min) {
        row.classList.add('fulfilled');
        statusEl.textContent = '✓';
        fulfilled++;
    } else if (cnt > 0) {
        row.classList.add('partial');
        statusEl.textContent = '◐';
    } else {
        row.classList.add('missing');
        statusEl.textContent = '○';
    }

    // Badge im Section-Header
    if (badge) {
        if (min > 0) {
            badge.textContent = cnt + '/' + min;
        } else {
            badge.textContent = cnt + '/–';
        }
    }
});

// Total-Anzeige
document.getElementById('tardocTotal').textContent =
    fulfilled + '/' + REQUIRED_CATS.length + ' Kat.';

// Ampel
updateAmpel(fulfilled);

// TARDOC-Abrechnung
updateTardocAbrechnung(fulfilled);

// PDF TARDOC-Box aktualisieren
updatePrintTardoc();
}
// ============================================
// TARDOC ABRECHNUNGS-LOGIK
// ============================================
function updateTardocAbrechnung(fulfilled) {
    var posEl = document.getElementById('tardocPosition');
    var totalReq = REQUIRED_CATS.length;
// 1) Erfüllte MP-Gruppen bestimmen (dedupliziert)
var erfuellteGruppen = new Set();

Object.keys(CATEGORIES).forEach(function (cat) {
    if (cat === 'hirnnerven') return;

    var cfg = CATEGORIES[cat];
    var minCheck = Math.max(cfg.minRequired, 1);

    if (counts[cat] >= minCheck) {
        var mapping = MP_GRUPPEN_MAPPING[cat];
        if (mapping) {
            erfuellteGruppen.add(mapping.gruppe);
        }
    }
});

// Bilaterale Untersuchungen
if (counts.motorik >= 2)       erfuellteGruppen.add(3);
if (counts.kraft >= 2)         erfuellteGruppen.add(5);
if (counts.sensibilitaet >= 2) erfuellteGruppen.add(8);

var anzahlMPGruppen = erfuellteGruppen.size;

// 2) Hirnnerven
var hnCount = counts.hirnnerven || 0;
var hnGruppen = Math.min(Math.floor(hnCount / 2), 7);

// 3) Positionen bestimmen
var positions = [];

if (fulfilled >= totalReq) {
    positions.push({
        code: TARDOC_CODES.vollstatus.code,
        name: TARDOC_CODES.vollstatus.name,
        color: TARDOC_CODES.vollstatus.color,
        detail: 'Alle 9 Kategorien erfüllt'
    });

} else if (anzahlMPGruppen > 0 || hnGruppen > 0) {

    if (anzahlMPGruppen > 0) {
        if (anzahlMPGruppen <= 3) {
            positions.push({
                code: TARDOC_CODES.teilBis3.code,
                name: TARDOC_CODES.teilBis3.name,
                color: TARDOC_CODES.teilBis3.color,
                detail: anzahlMPGruppen + ' Gruppe' +
                    (anzahlMPGruppen > 1 ? 'n' : '') + ': ' +
                    getGruppenNamen(erfuellteGruppen)
            });
        } else {
            positions.push({
                code: TARDOC_CODES.teil4Plus.code,
                name: TARDOC_CODES.teil4Plus.name,
                color: TARDOC_CODES.teil4Plus.color,
                detail: anzahlMPGruppen + ' Gruppen: ' +
                    getGruppenNamen(erfuellteGruppen)
            });
        }
    }

    if (hnGruppen > 0) {
        if (hnGruppen <= 3) {
            positions.push({
                code: TARDOC_CODES.hirnnervenBis3.code,
                name: TARDOC_CODES.hirnnervenBis3.name,
                color: TARDOC_CODES.hirnnervenBis3.color,
                detail: hnGruppen + ' Hirnnerven-Gruppe' +
                    (hnGruppen > 1 ? 'n' : '')
            });
        } else {
            positions.push({
                code: TARDOC_CODES.hirnnerven4Plus.code,
                name: TARDOC_CODES.hirnnerven4Plus.name,
                color: TARDOC_CODES.hirnnerven4Plus.color,
                detail: hnGruppen + ' Hirnnerven-Gruppen'
            });
        }
    }
}

// Global speichern für PDF
currentTardocPositions = positions;

// 4) Sidebar-Rendering
if (positions.length === 0) {
    posEl.className = 'tardoc-position';
    posEl.innerHTML = '<span style="color:#999">Noch keine Position abrechenbar</span>';
    return;
}

var isVoll = positions.some(function (p) {
    return p.code === 'AA.05.0130';
});

posEl.className = 'tardoc-position ' + (isVoll ? 'active' : 'partial-pos');

var html = '';
for (var i = 0; i < positions.length; i++) {
    var p = positions[i];

    if (i > 0) {
        html += '<hr style="border:none;border-top:1px solid #eee;margin:6px 0;">';
    }

    html +=
        '<div class="tardoc-pos-entry" style="margin-bottom:8px;">' +
            '<div style="font-weight:700;color:' + p.color + ';font-size:14px;">' +
                p.code +
            '</div>' +
            '<div style="font-size:12px;color:#555;">' +
                p.name +
            '</div>' +
            '<div style="font-size:11px;color:#888;margin-top:2px;">' +
                p.detail +
            '</div>' +
        '</div>';
}

posEl.innerHTML = html;
}
// ============================================
// PDF TARDOC-BOX AKTUALISIEREN
// ============================================
function updatePrintTardoc() {
    var printTardocEl = document.getElementById('printTardoc');
    if (!printTardocEl) return;
if (currentTardocPositions.length === 0) {
    printTardocEl.innerHTML =
        '<strong>TARDOC:</strong> Keine Position abrechenbar';
    return;
}

var lines = [];
for (var i = 0; i < currentTardocPositions.length; i++) {
    var p = currentTardocPositions[i];
    lines.push(
        '<div style="margin-bottom:4px;">' +
            '<strong>' + p.code + '</strong> – ' + p.name +
            '<br><span style="font-size:11px;color:#666;">' + p.detail + '</span>' +
        '</div>'
    );
}

printTardocEl.innerHTML =
    '<strong>TARDOC-Abrechnung:</strong>' +
    '<div style="margin-top:4px;">' + lines.join('') + '</div>';
}
// ============================================
// HELPER: Gruppennamen aus Set
// ============================================
function getGruppenNamen(gruppenSet) {
    var namen = {
        1:  'Allg. Neurostatus',
        2:  'Motorik 1-2 Ext.',
        3:  'Motorik 3-4 Ext.',
        4:  'Parese 1-2 Ext.',
        5:  'Parese 3-4 Ext.',
        7:  'Sensorik 1-2 Ext.',
        8:  'Sensorik 3-4 Ext.',
        9:  'Koordination',
        11: 'Meningismus',
        14: 'Gangbild'
    };
var sorted = Array.from(gruppenSet).sort(function (a, b) {
    return a - b;
});

var result = [];
for (var i = 0; i < sorted.length; i++) {
    var g = sorted[i];
    result.push(namen[g] || ('Gr.' + g));
}

return result.join(', ');
}
// ============================================
// AMPEL
// ============================================
function updateAmpel(fulfilled) {
    var total = REQUIRED_CATS.length;
var rot = document.getElementById('ampel-rot');
var gelb = document.getElementById('ampel-gelb');
var gruen = document.getElementById('ampel-gruen');
var text = document.getElementById('ampel-text');

rot.classList.remove('rot');
gelb.classList.remove('gelb');
gruen.classList.remove('gruen');

if (fulfilled === 0) {
    rot.classList.add('rot');
    text.textContent = 'Noch keine Items geprüft';
} else if (fulfilled < total) {
    gelb.classList.add('gelb');
    text.textContent = fulfilled + '/' + total + ' Kategorien – Teilstatus';
} else {
    gruen.classList.add('gruen');
    text.textContent = 'Vollstatus erfüllt ✓';
}
}
// ============================================
// SECTION TOGGLE
// ============================================
function toggleSection(header) {
    var body = header.nextElementSibling;
    body.classList.toggle('open');
var arrow = header.querySelector('span:first-child');
if (arrow) {
    if (body.classList.contains('open')) {
        arrow.textContent = arrow.textContent.replace('▸', '▾');
    } else {
        arrow.textContent = arrow.textContent.replace('▾', '▸');
    }
}
}
// ============================================
// NORMALBEFUND
// ============================================
function fillNormal() {
    document.querySelectorAll('input[type="checkbox"][data-cat]').forEach(function (cb) {
        cb.checked = true;
        cb.closest('.exam-item').classList.add('checked');
    });
document.querySelectorAll('.exam-item select').forEach(function (sel) {
    if (sel.options.length > 1) {
        sel.selectedIndex = 1;
    }
});

recount();
updateAll();
}
// ============================================
// ZURÜCKSETZEN
// ============================================
function clearAll() {
    document.querySelectorAll('input[type="checkbox"][data-cat]').forEach(function (cb) {
        cb.checked = false;
        cb.closest('.exam-item').classList.remove('checked');
    });
document.querySelectorAll('.exam-item select').forEach(function (sel) {
    sel.selectedIndex = 0;
});

document.querySelectorAll('textarea').forEach(function (ta) {
    ta.value = '';
});

document.querySelectorAll('input[type="text"], input[type="number"]').forEach(function (inp) {
    inp.value = '';
});

recount();
updateAll();
}
// ============================================
// MODAL
// ============================================
function openModal() {
    document.getElementById('modal').classList.add('show');
}
function closeModal() {
    document.getElementById('modal').classList.remove('show');
}