// ===== KONFIGURATION =====
const AA05_0130_POINTS = 25.69;

const REQUIREMENTS = {
    vigilanz: { min: 1, total: 3 },
    hirnnerven: { min: 6, total: 12 },
    motorik: { min: 5, total: 5 },
    sensibilitaet: { min: 1, total: 3 },
    reflexe: { min: 3, total: 7 }
};

// ===== STATE =====
let categoryProgress = {
    vigilanz: 0,
    hirnnerven: 0,
    motorik: 0,
    sensibilitaet: 0,
    reflexe: 0
};

let totalChecked = 0;
const totalCheckboxes = 30;

// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', function() {
    // Datum anzeigen
    displayCurrentDate();
    
    // Event Listeners
    setupEventListeners();
    
    // Initiale Anzeige aktualisieren
    updateAllDisplays();
});

// ===== DATUM ANZEIGEN =====
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = today.toLocaleDateString('de-DE', options);
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Alle Checkboxen
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    // Buttons
    document.getElementById('printBtn').addEventListener('click', handlePrint);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
}

// ===== CHECKBOX CHANGE HANDLER =====
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const category = checkbox.dataset.category;
    
    // Kategorie-Zähler aktualisieren
    if (checkbox.checked) {
        categoryProgress[category]++;
        totalChecked++;
    } else {
        categoryProgress[category]--;
        totalChecked--;
    }
    
    // Displays aktualisieren
    updateAllDisplays();
}

// ===== ALLE DISPLAYS AKTUALISIEREN =====
function updateAllDisplays() {
    updateProgressIndicators();
    updateAA05Status();
    updateCompletenessBar();
}

// ===== FORTSCHRITTS-INDIKATOREN AKTUALISIEREN =====
function updateProgressIndicators() {
    Object.keys(categoryProgress).forEach(category => {
        const indicator = document.querySelector(`.progress-indicator[data-category="${category}"]`);
        if (indicator) {
            const count = categoryProgress[category];
            const total = REQUIREMENTS[category].total;
            indicator.textContent = `${count}/${total}`;
            
            // Farbe ändern basierend auf Erfüllung
            if (count >= REQUIREMENTS[category].min) {
                indicator.style.background = '#2ecc71';
                indicator.style.color = 'white';
            } else {
                indicator.style.background = '#ecf0f1';
                indicator.style.color = '#7f8c8d';
            }
        }
    });
}

// ===== AA.05.0130 STATUS AKTUALISIEREN =====
function updateAA05Status() {
    const requirements = checkAA05Requirements();
    const trafficLight = document.getElementById('trafficLight');
    const aaStatus = document.getElementById('aaStatus');
    const requirementsList = document.getElementById('requirementsList');
    const totalPoints = document.getElementById('totalPoints');
    const multiplierInfo = document.getElementById('multiplierInfo');
    const multiplierText = document.getElementById('multiplierText');
    
    // Requirements Liste aktualisieren
    requirementsList.innerHTML = '';
    let allMet = true;
    
    Object.keys(requirements).forEach(key => {
        const req = requirements[key];
        const isMet = req.current >= req.required;
        if (!isMet) allMet = false;
        
        const item = document.createElement('div');
        item.className = `requirement-item ${isMet ? 'complete' : 'incomplete'}`;
        item.innerHTML = `
            <span class="requirement-label">${getCategoryLabel(key)}:</span>
            <span class="requirement-value">${req.current}/${req.required}</span>
            <span class="requirement-icon">${isMet ? '✅' : '❌'}</span>
        `;
        requirementsList.appendChild(item);
    });
    
    // Ampel und Status aktualisieren
    if (allMet) {
        trafficLight.className = 'traffic-light green';
        aaStatus.innerHTML = `
            <strong>✅ ABRECHENBAR</strong>
            <p>Mindestanforderungen erfüllt</p>
        `;
        
        // Taxpunkte anzeigen
        totalPoints.textContent = `${AA05_0130_POINTS.toFixed(2)} TP`;
        multiplierInfo.style.display = 'block';
        multiplierText.textContent = '1× AA.05.0130';
    } else {
        trafficLight.className = 'traffic-light red';
        aaStatus.innerHTML = `
            <strong>❌ NICHT abrechenbar</strong>
            <p>Mindestanforderungen nicht erfüllt</p>
        `;
        
        totalPoints.textContent = '0.00 TP';
        multiplierInfo.style.display = 'none';
    }
}

// ===== AA.05.0130 REQUIREMENTS PRÜFEN =====
function checkAA05Requirements() {
    return {
        vigilanz: {
            current: categoryProgress.vigilanz,
            required: REQUIREMENTS.vigilanz.min
        },
        hirnnerven: {
            current: categoryProgress.hirnnerven,
            required: REQUIREMENTS.hirnnerven.min
        },
        motorik: {
            current: categoryProgress.motorik,
            required: REQUIREMENTS.motorik.min
        },
        sensibilitaet: {
            current: categoryProgress.sensibilitaet,
            required: REQUIREMENTS.sensibilitaet.min
        },
        reflexe: {
            current: categoryProgress.reflexe,
            required: REQUIREMENTS.reflexe.min
        }
    };
}

// ===== KATEGORIE-LABEL HOLEN =====
function getCategoryLabel(key) {
    const labels = {
        vigilanz: 'Vigilanz',
        hirnnerven: 'Hirnnerven',
        motorik: 'Motorik',
        sensibilitaet: 'Sensibilität',
        reflexe: 'Reflexe'
    };
    return labels[key] || key;
}

// ===== VOLLSTÄNDIGKEITSBALKEN AKTUALISIEREN =====
function updateCompletenessBar() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    const percentage = Math.round((totalChecked / totalCheckboxes) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${totalChecked} von ${totalCheckboxes} Untersuchungen durchgeführt (${percentage}%)`;
}

// ===== DRUCKEN =====
function handlePrint() {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '', 'height=800,width=1000');
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// ===== PRINT CONTENT GENERIEREN =====
function generatePrintContent() {
    const today = new Date().toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Neurologische Untersuchung - ${today}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    line-height: 1.6;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #34495e;
                    margin-top: 25px;
                    margin-bottom: 15px;
                }
                .header-info {
                    background: #ecf0f1;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .examination-section {
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }
                .checkbox-item {
                    padding: 8px 0;
                    padding-left: 25px;
                }
                .checkbox-item:before {
                    content: "✓";
                    margin-left: -25px;
                    margin-right: 10px;
                    color: #2ecc71;
                    font-weight: bold;
                }
                .notes {
                    background: #f8f9fa;
                    padding: 15px;
                    border-left: 4px solid #3498db;
                    margin-top: 10px;
                    font-style: italic;
                }
                .notes-label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .aa-status {
                    background: #d5f4e6;
                    border: 2px solid #2ecc71;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .aa-status.incomplete {
                    background: #fadbd8;
                    border-color: #e74c3c;
                }
                .aa-status h3 {
                    margin-top: 0;
                    color: #2c3e50;
                }
                .requirement-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-top: 15px;
                }
                .requirement-item {
                    padding: 8px;
                    background: white;
                    border-radius: 5px;
                }
                @media print {
                    body { padding: 15px; }
                    .examination-section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <h1>🧠 Neurologische Untersuchung - Hirnstatus</h1>
            <div class="header-info">
                <strong>Datum:</strong> ${today}<br>
                <strong>TARDOC-Code:</strong> AA.05.0130 - Neurologische Untersuchung (Hirnstatus)
            </div>
    `;
    
    // AA.05.0130 Status
    const requirements = checkAA05Requirements();
    let allMet = true;
    Object.keys(requirements).forEach(key => {
        if (requirements[key].current < requirements[key].required) {
            allMet = false;
        }
    });
    
    html += `
        <div class="aa-status ${allMet ? '' : 'incomplete'}">
            <h3>${allMet ? '✅ ABRECHENBAR' : '❌ NICHT ABRECHENBAR'}</h3>
            <strong>Status:</strong> ${allMet ? 'Mindestanforderungen erfüllt' : 'Mindestanforderungen nicht erfüllt'}<br>
            ${allMet ? `<strong>Taxpunkte:</strong> ${AA05_0130_POINTS.toFixed(2)} TP (1× AA.05.0130)` : ''}
            
            <div class="requirement-grid">
    `;
    
    Object.keys(requirements).forEach(key => {
        const req = requirements[key];
        const isMet = req.current >= req.required;
        html += `
            <div class="requirement-item">
                ${isMet ? '✅' : '❌'} <strong>${getCategoryLabel(key)}:</strong> ${req.current}/${req.required}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    // Durchgeführte Untersuchungen
    const categories = ['vigilanz', 'hirnnerven', 'motorik', 'sensibilitaet', 'reflexe'];
    const categoryTitles = {
        vigilanz: '0. Vigilanz und Bewusstsein',
        hirnnerven: '1. Hirnnerven',
        motorik: '2. Motorik',
        sensibilitaet: '3. Sensibilität',
        reflexe: '4. Reflexe'
    };
    
    categories.forEach(category => {
        const checkboxes = document.querySelectorAll(`input[data-category="${category}"]:checked`);
        if (checkboxes.length > 0) {
            html += `<div class="examination-section">`;
            html += `<h2>${categoryTitles[category]}</h2>`;
            
            checkboxes.forEach(checkbox => {
                const label = checkbox.parentElement.querySelector('span:first-of-type');
                html += `<div class="checkbox-item">${label.textContent}</div>`;
            });
            
            // Bemerkungen hinzufügen
            const notesId = `notes-${category}`;
            const notesField = document.getElementById(notesId);
            if (notesField && notesField.value.trim()) {
                html += `<div class="notes"><div class="notes-label">Bemerkungen:</div>${notesField.value}</div>`;
            }
            
            html += `</div>`;
        }
    });
    
    html += `
        </body>
        </html>
    `;
    
    return html;
}

// ===== ZURÜCKSETZEN =====
function handleReset() {
    if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
        // Alle Checkboxen deaktivieren
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Alle Textfelder leeren
        document.querySelectorAll('textarea').forEach(ta => {
            ta.value = '';
        });
        
        // State zurücksetzen
        Object.keys(categoryProgress).forEach(key => {
            categoryProgress[key] = 0;
        });
        totalChecked = 0;
        
        // Displays aktualisieren
        updateAllDisplays();
    }
}
