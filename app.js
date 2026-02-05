// TARDOC-Datenbank mit Beschreibungen
const tardocDatabase = {
    '00.0110': 'Riechprüfung (N. I - Olfactorius)',
    '00.0120': 'Visus und Gesichtsfeld (N. II - Opticus)',
    '00.0130': 'Pupillomotorik und Augenbewegungen (N. III, IV, VI)',
    '00.0140': 'Gesichtssensibilität und Masseterreflex (N. V - Trigeminus)',
    '00.0150': 'Faziale Motorik (N. VII - Facialis)',
    '00.0160': 'Hörprüfung und Gleichgewicht (N. VIII - Vestibulocochlearis)',
    '00.0170': 'Gaumen und Schluckakt (N. IX, X)',
    '00.0180': 'Kopfdrehung und Schulterhebung (N. XI - Accessorius)',
    '00.0190': 'Zungenmotorik (N. XII - Hypoglossus)',
    '00.0210': 'Kraftprüfung obere Extremitäten',
    '00.0220': 'Kraftprüfung untere Extremitäten',
    '00.0230': 'Tonusprüfung',
    '00.0240': 'Koordinationsprüfung',
    '00.0250': 'Diadochokinese',
    '00.0260': 'Romberg-Versuch und Gangprüfung',
    '00.0310': 'Oberflächensensibilität',
    '00.0320': 'Tiefensensibilität',
    '00.0330': 'Stereognosie und Graphästhesie',
    '00.0410': 'Bizepssehnenreflex (BSR)',
    '00.0420': 'Trizepssehnenreflex (TSR)',
    '00.0430': 'Patellarsehnenreflex (PSR)',
    '00.0440': 'Achillessehnenreflex (ASR)',
    '00.0450': 'Bauchhautreflexe',
    '00.0460': 'Babinski-Reflex',
    '00.0470': 'Weitere pathologische Reflexe',
    '00.0510': 'Meningismus-Prüfung',
    '00.0520': 'Extrapyramidale Zeichen'
};

// State Management
let selectedCodes = new Set();
let totalCheckboxes = 0;
let checkedCheckboxes = 0;

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    attachEventListeners();
    updateTrafficLight();
});

// App initialisieren
function initializeApp() {
    // Datum anzeigen
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    dateElement.textContent = `Datum: ${today.toLocaleDateString('de-CH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`;
    
    // Anzahl Checkboxen zählen
    totalCheckboxes = document.querySelectorAll('input[type="checkbox"][data-tardoc]').length;
}

// Event Listeners
function attachEventListeners() {
    // Checkbox-Änderungen
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-tardoc]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    // Buttons
    document.getElementById('printBtn').addEventListener('click', handlePrint);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
}

// Checkbox-Änderung behandeln
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const tardocCode = checkbox.dataset.tardoc;
    const points = parseFloat(checkbox.dataset.points);
    
    if (checkbox.checked) {
        selectedCodes.add(tardocCode);
        checkedCheckboxes++;
    } else {
        selectedCodes.delete(tardocCode);
        checkedCheckboxes--;
    }
    
    updateTardocDisplay();
    updateTrafficLight();
}

// TARDOC-Anzeige aktualisieren
function updateTardocDisplay() {
    const tardocList = document.getElementById('tardocList');
    const totalPointsElement = document.getElementById('totalPoints');
    
    // Liste leeren
    tardocList.innerHTML = '';
    
    if (selectedCodes.size === 0) {
        tardocList.innerHTML = '<p class="empty-state">Keine Untersuchungen ausgewählt</p>';
        totalPointsElement.textContent = '0.00';
        return;
    }
    
    let totalPoints = 0;
    
    // TARDOC-Items erstellen
    selectedCodes.forEach(code => {
        const checkbox = document.querySelector(`input[data-tardoc="${code}"]`);
        const points = parseFloat(checkbox.dataset.points);
        const description = tardocDatabase[code] || 'Keine Beschreibung';
        
        totalPoints += points;
        
        const item = document.createElement('div');
        item.className = 'tardoc-item';
        item.innerHTML = `
            <div class="tardoc-code">${code}</div>
            <div class="tardoc-description">${description}</div>
            <div class="tardoc-points">💰 ${points.toFixed(2)} TP</div>
        `;
        
        tardocList.appendChild(item);
    });
    
    // Gesamtsumme aktualisieren
    totalPointsElement.textContent = totalPoints.toFixed(2);
}

// Ampelsystem aktualisieren
function updateTrafficLight() {
    const percentage = totalCheckboxes > 0 ? (checkedCheckboxes / totalCheckboxes) * 100 : 0;
    
    const redLight = document.getElementById('lightRed');
    const yellowLight = document.getElementById('lightYellow');
    const greenLight = document.getElementById('lightGreen');
    const statusText = document.getElementById('statusText');
    const completionInfo = document.getElementById('completionInfo');
    
    // Alle Lichter ausschalten
    redLight.classList.remove('active');
    yellowLight.classList.remove('active');
    greenLight.classList.remove('active');
    
    // Status basierend auf Prozentsatz
    if (percentage < 50) {
        redLight.classList.add('active');
        statusText.textContent = '🔴 Unvollständig - Weitere Untersuchungen erforderlich';
        statusText.style.color = '#dc3545';
    } else if (percentage < 80) {
        yellowLight.classList.add('active');
        statusText.textContent = '🟡 Teilweise erfüllt - Weitere Untersuchungen empfohlen';
        statusText.style.color = '#ffc107';
    } else {
        greenLight.classList.add('active');
        statusText.textContent = '🟢 Vollständig - Alle Anforderungen erfüllt';
        statusText.style.color = '#28a745';
    }
    
    // Completion Info aktualisieren
    completionInfo.textContent = `${checkedCheckboxes} von ${totalCheckboxes} Untersuchungen durchgeführt (${Math.round(percentage)}%)`;
}

// Drucken
function handlePrint() {
    // Druckansicht vorbereiten
    const printContent = generatePrintContent();
    
    // Neues Fenster für Druck
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Kurze Verzögerung, dann Druckdialog
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Druckinhalt generieren
function generatePrintContent() {
    const today = new Date().toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Neurostatus Dokumentation</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #2c3e50; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
                h2 { color: #34495e; margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .info { background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                .section { margin-bottom: 30px; page-break-inside: avoid; }
                .checked-item { margin: 8px 0; padding: 8px; background: #e8f4f8; border-left: 3px solid #667eea; }
                .notes { background: #fff3cd; padding: 10px; margin-top: 10px; border-radius: 5px; }
                .notes-label { font-weight: bold; margin-bottom: 5px; }
                .tardoc-summary { margin-top: 30px; padding: 15px; background: #d4edda; border-radius: 5px; }
                .empty { color: #999; font-style: italic; }
            </style>
        </head>
        <body>
            <h1>🧠 Neurologische Untersuchung - Hirnstatus</h1>
            <div class="info">
                <strong>Datum:</strong> ${today}<br>
                <strong>Durchgeführte Untersuchungen:</strong> ${checkedCheckboxes} von ${totalCheckboxes}
            </div>
    `;
    
    // Alle Untersuchungsgruppen durchgehen
    const groups = document.querySelectorAll('.examination-group');
    groups.forEach(group => {
        const title = group.querySelector('h2').textContent;
        const checkboxes = group.querySelectorAll('input[type="checkbox"]:checked');
        const notesField = group.querySelector('textarea');
        
        html += `<div class="section"><h2>${title}</h2>`;
        
        if (checkboxes.length > 0) {
            checkboxes.forEach(checkbox => {
                const label = checkbox.nextElementSibling.textContent;
                const tardocCode = checkbox.dataset.tardoc;
                const points = checkbox.dataset.points;
                html += `<div class="checked-item">✓ ${label} <em>(${tardocCode} - ${points} TP)</em></div>`;
            });
        } else {
            html += `<p class="empty">Keine Untersuchungen durchgeführt</p>`;
        }
        
        // Bemerkungen hinzufügen
        if (notesField && notesField.value.trim()) {
            html += `<div class="notes"><div class="notes-label">Bemerkungen:</div>${notesField.value}</div>`;
        }
        
        html += `</div>`;
    });
    
    // TARDOC-Zusammenfassung
    if (selectedCodes.size > 0) {
        const totalPoints = Array.from(selectedCodes).reduce((sum, code) => {
            const checkbox = document.querySelector(`input[data-tardoc="${code}"]`);
            return sum + parseFloat(checkbox.dataset.points);
        }, 0);
        
        html += `
            <div class="tardoc-summary">
                <h2>TARDOC-Zusammenfassung</h2>
                <strong>Gesamt Taxpunkte: ${totalPoints.toFixed(2)} TP</strong><br><br>
                <strong>Verwendete Codes:</strong><br>
        `;
        
        selectedCodes.forEach(code => {
            html += `${code}, `;
        });
        
        html += `</div>`;
    }
    
    html += `
        </body>
        </html>
    `;
    
    return html;
}

// Zurücksetzen
function handleReset() {
    if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
        // Alle Checkboxen deaktivieren
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        // Alle Textfelder leeren
        document.querySelectorAll('textarea').forEach(ta => ta.value = '');
        
        // State zurücksetzen
        selectedCodes.clear();
        checkedCheckboxes = 0;
        
        // Display aktualisieren
        updateTardocDisplay();
        updateTrafficLight();
    }
}
