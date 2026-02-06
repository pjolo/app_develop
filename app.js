// =====================================================
// KONSTANTEN & KONFIGURATION
// =====================================================

const AA05_0130_POINTS = 25.69;

const REQUIREMENTS = {
    vigilanz: { min: 1, total: 3, label: 'Vigilanz' },
    hirnnerven: { min: 6, total: 12, label: 'Hirnnerven' },
    motorik: { min: 5, total: 5, label: 'Motorik' },
    sensibilitaet: { min: 1, total: 3, label: 'Sensibilität' },
    reflexe: { min: 3, total: 7, label: 'Reflexe' }
};

// =====================================================
// STATE MANAGEMENT
// =====================================================

let categoryProgress = {
    vigilanz: 0,
    hirnnerven: 0,
    motorik: 0,
    sensibilitaet: 0,
    reflexe: 0
};

let totalChecked = 0;
const TOTAL_CHECKBOXES = 30;

// =====================================================
// INITIALISIERUNG
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDateDisplay();
    setupCheckboxListeners();
    updateAllDisplays();
});

function initializeDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('de-DE', options);
}

// =====================================================
// CHECKBOX-LISTENER
// =====================================================

function setupCheckboxListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const category = this.dataset.category;
            
            if (this.checked) {
                categoryProgress[category]++;
                totalChecked++;
            } else {
                categoryProgress[category]--;
                totalChecked--;
            }
            
            updateAllDisplays();
        });
    });
}

// =====================================================
// DISPLAY-UPDATES
// =====================================================

function updateAllDisplays() {
    updateCategoryIndicators();
    updateRequirementsList();
    updateStatusLight();
    updateCompletenessBar();
}

function updateCategoryIndicators() {
    document.querySelectorAll('.progress-indicator').forEach(indicator => {
        const category = indicator.dataset.category;
        const count = categoryProgress[category];
        const total = REQUIREMENTS[category].total;
        indicator.textContent = `${count}/${total}`;
        
        // Farbcodierung
        if (count >= REQUIREMENTS[category].min) {
            indicator.style.background = '#d4edda';
            indicator.style.color = '#155724';
            indicator.style.borderColor = '#c3e6cb';
        } else {
            indicator.style.background = 'white';
            indicator.style.color = '#7f8c8d';
            indicator.style.borderColor = '#bdc3c7';
        }
    });
}

function updateRequirementsList() {
    Object.keys(REQUIREMENTS).forEach(category => {
        const reqItem = document.querySelector(`.req-item[data-req="${category}"]`);
        const icon = reqItem.querySelector('.req-icon');
        const text = reqItem.querySelector('.req-text');
        const count = categoryProgress[category];
        const req = REQUIREMENTS[category];
        
        text.innerHTML = `${req.label}: <strong>${count}/${req.min}</strong>`;
        
        if (count >= req.min) {
            reqItem.classList.add('met');
            reqItem.classList.remove('not-met');
            icon.textContent = '✅';
        } else {
            reqItem.classList.add('not-met');
            reqItem.classList.remove('met');
            icon.textContent = '❌';
        }
    });
}

function updateStatusLight() {
    const allMet = checkAllRequirementsMet();
    const statusLight = document.getElementById('statusLight');
    const statusText = document.getElementById('statusText');
    const taxpunkteValue = document.getElementById('taxpunkteValue');
    
    if (allMet) {
        statusLight.className = 'status-light green';
        statusText.textContent = 'Abrechenbar';
        statusText.style.color = '#27ae60';
        taxpunkteValue.textContent = `${AA05_0130_POINTS.toFixed(2)} TP`;
        taxpunkteValue.classList.add('active');
    } else {
        statusLight.className = 'status-light red';
        statusText.textContent = 'Nicht abrechenbar';
        statusText.style.color = '#e74c3c';
        taxpunkteValue.textContent = '0.00 TP';
        taxpunkteValue.classList.remove('active');
    }
}

function updateCompletenessBar() {
    const percentage = (totalChecked / TOTAL_CHECKBOXES) * 100;
    const progressFill = document.getElementById('progressFill');
    const completenessPercent = document.getElementById('completenessPercent');
    const completenessCount = document.getElementById('completenessCount');
    
    progressFill.style.width = `${percentage}%`;
    completenessPercent.textContent = `${Math.round(percentage)}%`;
    completenessCount.textContent = `${totalChecked}/${TOTAL_CHECKBOXES} Punkte`;
}

// =====================================================
// ANFORDERUNGSPRÜFUNG
// =====================================================

function checkAllRequirementsMet() {
    return Object.keys(REQUIREMENTS).every(category => {
        return categoryProgress[category] >= REQUIREMENTS[category].min;
    });
}

// =====================================================
// DRUCK-FUNKTIONALITÄT
// =====================================================

function handlePrint() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintContent());
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function generatePrintContent() {
    const allMet = checkAllRequirementsMet();
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', { 
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
        <title>Neurostatus - ${dateStr}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                color: #2c3e50;
            }
            
            .print-header {
                text-align: center;
                border-bottom: 3px solid #2c3e50;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .print-header h1 {
                font-size: 24px;
                margin-bottom: 10px;
                color: #2c3e50;
            }
            
            .print-header .date {
                font-size: 14px;
                color: #7f8c8d;
            }
            
            .pdf-info {
                padding: 15px 0;
                border-bottom: 2px solid #34495e;
                margin-bottom: 25px;
            }
            
            .pdf-info p {
                margin: 5px 0;
                font-size: 14px;
            }
            
            .section {
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            
            .section h2 {
                font-size: 16px;
                color: #2c3e50;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 8px;
                margin-bottom: 12px;
            }
            
            .item-list {
                list-style: none;
                padding-left: 0;
            }
            
            .item-list li {
                padding: 6px 0;
                padding-left: 25px;
                position: relative;
            }
            
            .item-list li:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #27ae60;
                font-weight: bold;
            }
            
            .remarks-box {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 15px;
                margin-top: 10px;
                white-space: pre-wrap;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .empty-note {
                color: #95a5a6;
                font-style: italic;
            }
            
            @media print {
                body {
                    padding: 20px;
                }
                
                .section {
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h1>NEUROLOGISCHE UNTERSUCHUNG - HIRNSTATUS</h1>
            <div class="date">${dateStr}</div>
        </div>
        
        <div class="pdf-info">
            <p><strong>TARDOC:</strong> AA.05.0130 - Neurologische Untersuchung (Hirnstatus)</p>
            ${allMet ? `<p><strong>Taxpunkte:</strong> ${AA05_0130_POINTS.toFixed(2)} TP</p>` : ''}
        </div>
    `;
    
    // Durchgeführte Untersuchungen nach Kategorien
    const categories = [
        { key: 'vigilanz', title: '0. Vigilanz und Bewusstsein' },
        { key: 'hirnnerven', title: '1. Hirnnerven' },
        { key: 'motorik', title: '2. Motorik' },
        { key: 'sensibilitaet', title: '3. Sensibilität' },
        { key: 'reflexe', title: '4. Reflexe' }
    ];
    
    categories.forEach(cat => {
        const checkboxes = document.querySelectorAll(`input[data-category="${cat.key}"]:checked`);
        
        if (checkboxes.length > 0) {
            html += `<div class="section">`;
            html += `<h2>${cat.title}</h2>`;
            html += `<ul class="item-list">`;
            
            checkboxes.forEach(cb => {
                const label = cb.parentElement.querySelector('span').textContent;
                html += `<li>${label}</li>`;
            });
            
            html += `</ul></div>`;
        }
    });
    
    // Bemerkungen
    const remarks = document.getElementById('remarks').value.trim();
    html += `<div class="section">`;
    html += `<h2>5. Bemerkungen</h2>`;
    
    if (remarks) {
        html += `<div class="remarks-box">${remarks}</div>`;
    } else {
        html += `<div class="remarks-box empty-note">Keine Bemerkungen erfasst</div>`;
    }
    
    html += `</div>`;
    html += `</body></html>`;
    
    return html;
}

// =====================================================
// RESET-FUNKTIONALITÄT
// =====================================================

function handleReset() {
    if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        document.querySelectorAll('textarea').forEach(ta => {
            ta.value = '';
        });
        
        Object.keys(categoryProgress).forEach(key => {
            categoryProgress[key] = 0;
        });
        totalChecked = 0;
        
        updateAllDisplays();
    }
}
