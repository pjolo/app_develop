// ==========================================
// KONSTANTEN
// ==========================================

const AA05_0130_POINTS = 25.69;

const AA05_REQUIREMENTS = {
    vigilanz: 1,
    hirnnerven: 6,
    motorik: 5,
    sensibilitaet: 1,
    reflexe: 3
};

const CATEGORIES = [
    { key: 'vigilanz', title: '0. VIGILANZ UND BEWUSSTSEIN' },
    { key: 'hirnnerven', title: '1. HIRNNERVEN (I-XII)' },
    { key: 'motorik', title: '2. MOTORIK' },
    { key: 'sensibilitaet', title: '3. SENSIBILITÄT' },
    { key: 'reflexe', title: '4. REFLEXE' }
];

// ==========================================
// GLOBALE VARIABLEN
// ==========================================

let categoryProgress = {
    vigilanz: 0,
    hirnnerven: 0,
    motorik: 0,
    sensibilitaet: 0,
    reflexe: 0
};

// ==========================================
// INITIALISIERUNG
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateAllCounters();
});

function initializeEventListeners() {
    // Checkbox-Listener
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateAllCounters);
    });
    
    // Button-Listener
    document.getElementById('generatePDF').addEventListener('click', generatePDF);
    document.getElementById('resetForm').addEventListener('click', resetForm);
}

// ==========================================
// COUNTER-UPDATES
// ==========================================

function updateAllCounters() {
    updateCategoryProgress();
    updateTotalCount();
    updateRequirements();
    updateAAStatus(); // ✅ Ampel-Update
}

function updateCategoryProgress() {
    CATEGORIES.forEach(cat => {
        const checked = document.querySelectorAll(`input[data-category="${cat.key}"]:checked`).length;
        categoryProgress[cat.key] = checked;
    });
}

function updateTotalCount() {
    const total = Object.values(categoryProgress).reduce((sum, val) => sum + val, 0);
    document.getElementById('totalCount').textContent = total;
}

function updateRequirements() {
    Object.keys(AA05_REQUIREMENTS).forEach(category => {
        const required = AA05_REQUIREMENTS[category];
        const current = categoryProgress[category];
        const element = document.getElementById(`req-${category}`);
        const parentItem = element.closest('.requirement-item');
        
        element.textContent = `${current}/${required}`;
        
        // Styling
        parentItem.classList.remove('met', 'unmet');
        if (current >= required) {
            parentItem.classList.add('met');
        } else {
            parentItem.classList.add('unmet');
        }
    });
}

// ==========================================
// ✅ AMPEL-SYSTEM: NUR ROT/GRÜN LOGIK
// ==========================================

function updateAAStatus() {
    const requirements = [
        { key: 'vigilanz', required: 1, current: categoryProgress.vigilanz },
        { key: 'hirnnerven', required: 6, current: categoryProgress.hirnnerven },
        { key: 'motorik', required: 5, current: categoryProgress.motorik },
        { key: 'sensibilitaet', required: 1, current: categoryProgress.sensibilitaet },
        { key: 'reflexe', required: 3, current: categoryProgress.reflexe }
    ];
    
    // ✅ EINE PRÜFUNG: Sind ALLE Anforderungen erfüllt?
    const allMet = requirements.every(req => req.current >= req.required);
    
    // DOM-Elemente
    const redLight = document.getElementById('aaRed');
    const greenLight = document.getElementById('aaGreen');
    const statusText = document.getElementById('aaStatusText');
    const taxpunkteDiv = document.getElementById('aaTaxpunkte');
    const taxpunkteValue = document.getElementById('taxpunkteValue');
    
    // Alle Lichter zurücksetzen
    redLight.classList.remove('active');
    greenLight.classList.remove('active');
    
    if (allMet) {
        // ✅ GRÜN: ALLE Anforderungen erfüllt
        greenLight.classList.add('active');
        statusText.innerHTML = '<strong>Status:</strong> ✅ Abrechenbar<br><small>Alle Anforderungen erfüllt</small>';
        taxpunkteDiv.style.display = 'block';
        taxpunkteValue.textContent = AA05_0130_POINTS.toFixed(2);
    } else {
        // 🔴 ROT: Mindestens EINE Anforderung nicht erfüllt
        redLight.classList.add('active');
        statusText.innerHTML = '<strong>Status:</strong> ❌ Nicht abrechenbar<br><small>Mindestanforderungen nicht erfüllt</small>';
        taxpunkteDiv.style.display = 'none';
        
        // Zeige welche Anforderungen fehlen
        const missing = requirements.filter(req => req.current < req.required);
        if (missing.length > 0) {
            const labels = {
                'vigilanz': 'Vigilanz',
                'hirnnerven': 'Hirnnerven',
                'motorik': 'Motorik',
                'sensibilitaet': 'Sensibilität',
                'reflexe': 'Reflexe'
            };
            
            const missingText = missing.map(req => 
                `${labels[req.key]} (${req.current}/${req.required})`
            ).join(', ');
            
            statusText.innerHTML += `<div style="margin-top: 8px; font-size: 11px; opacity: 0.8;">Fehlend: ${missingText}</div>`;
        }
    }
}

// ==========================================
// PDF-GENERIERUNG
// ==========================================

function generatePDF() {
    const printWindow = window.open('', '_blank');
    const content = generatePrintContent();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Neurologische Untersuchung - ${new Date().toLocaleDateString('de-DE')}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 30px; 
                    line-height: 1.6;
                    color: #2c3e50;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                .header h1 { 
                    font-size: 24px; 
                    color: #2c3e50;
                    margin-bottom: 8px;
                }
                .header .date { 
                    color: #7f8c8d; 
                    font-size: 14px;
                }
                .tardoc-info {
                    background: #ecf0f1;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-weight: bold;
                    color: #34495e;
                }
                .aa-status {
                    border: 3px solid #27ae60;
                    background: #d4edda;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .aa-status.incomplete {
                    border-color: #e74c3c;
                    background: #f8d7da;
                }
                .aa-status h3 {
                    margin-bottom: 8px;
                    font-size: 18px;
                }
                .section {
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }
                .section h2 {
                    color: #2c3e50;
                    font-size: 16px;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 6px;
                    margin-bottom: 12px;
                }
                .item-list {
                    list-style-position: inside;
                    padding-left: 0;
                }
                .item-list li {
                    padding: 6px 0;
                    padding-left: 15px;
                    border-bottom: 1px dotted #ecf0f1;
                }
                .item-list li:last-child {
                    border-bottom: none;
                }
                .remarks-box {
                    margin-top: 10px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-left: 3px solid #3498db;
                    font-style: italic;
                    color: #555;
                }
                .remarks-section {
                    background: #fff9e6;
                    border: 2px solid #f39c12;
                    border-radius: 6px;
                    padding: 15px;
                    margin-top: 20px;
                }
                .remarks-section h3 {
                    color: #f39c12;
                    margin-bottom: 10px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #ecf0f1;
                    text-align: center;
                    color: #95a5a6;
                    font-size: 12px;
                }
                @media print {
                    body { padding: 20px; }
                    .section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function generatePrintContent() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Prüfe Abrechnungsstatus
    const requirements = [
        { key: 'vigilanz', required: 1, current: categoryProgress.vigilanz },
        { key: 'hirnnerven', required: 6, current: categoryProgress.hirnnerven },
        { key: 'motorik', required: 5, current: categoryProgress.motorik },
        { key: 'sensibilitaet', required: 1, current: categoryProgress.sensibilitaet },
        { key: 'reflexe', required: 3, current: categoryProgress.reflexe }
    ];
    
    const allMet = requirements.every(req => req.current >= req.required);
    
    let html = `
        <div class="header">
            <h1>🧠 NEUROLOGISCHE UNTERSUCHUNG - HIRNSTATUS</h1>
            <div class="date">Datum: ${dateStr}</div>
        </div>
        
        <div class="tardoc-info">
            TARDOC: AA.05.0130 - Neurologische Untersuchung
        </div>
        
        <div class="aa-status ${allMet ? '' : 'incomplete'}">
            <h3>${allMet ? '✅ ABRECHENBAR' : '❌ NICHT ABRECHENBAR'}</h3>
            <p><strong>Status:</strong> ${allMet ? 'Mindestanforderungen erfüllt' : 'Mindestanforderungen nicht erfüllt'}</p>
            ${allMet ? `<p><strong>Taxpunkte:</strong> ${AA05_0130_POINTS.toFixed(2)} TP</p>` : ''}
        </div>
    `;
    
    // Durchlaufe alle Kategorien
    CATEGORIES.forEach(cat => {
        const checkboxes = document.querySelectorAll(`input[data-category="${cat.key}"]:checked`);
        
        if (checkboxes.length > 0) {
            html += `<div class="section">`;
            html += `<h2>${cat.title}</h2>`;
            html += `<ul class="item-list">`;
            
            checkboxes.forEach(cb => {
                const label = cb.parentElement.querySelector('span').textContent;
                html += `<li>${label}</li>`;
            });
            
            html += `</ul>`;
            
            // ✅ Block-Kommentar hinzufügen
            const blockComment = document.querySelector(`.block-comment[data-category="${cat.key}"]`);
            if (blockComment && blockComment.value.trim()) {
                html += `<div class="remarks-box"><strong>Bemerkung:</strong> ${blockComment.value.trim()}</div>`;
            }
            
            html += `</div>`;
        }
    });
    
    // Allgemeine Bemerkungen
    const generalRemarks = document.getElementById('generalRemarks').value.trim();
    if (generalRemarks) {
        html += `
            <div class="remarks-section">
                <h3>📝 Allgemeine Bemerkungen</h3>
                <p>${generalRemarks}</p>
            </div>
        `;
    }
    
    html += `
        <div class="footer">
            Erstellt am ${now.toLocaleString('de-DE')} | Neurologische Untersuchung - Hirnstatus
        </div>
    `;
    
    return html;
}

// ==========================================
// FORMULAR ZURÜCKSETZEN
// ==========================================

function resetForm() {
    if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
        // Alle Checkboxen deaktivieren
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        // Alle Textareas leeren
        document.querySelectorAll('textarea').forEach(ta => ta.value = '');
        
        // Counter zurücksetzen
        categoryProgress = {
            vigilanz: 0,
            hirnnerven: 0,
            motorik: 0,
            sensibilitaet: 0,
            reflexe: 0
        };
        
        updateAllCounters();
    }
}
