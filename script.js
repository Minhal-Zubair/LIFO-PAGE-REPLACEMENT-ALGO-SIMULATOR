/**
 * LIFO Page Replacement Simulator
 * A complete interactive visualization of the LIFO page replacement algorithm
 */

// ==================== STATE MANAGEMENT ====================
const state = {
    frames: 3,
    referenceString: [],
    stateHistory: [],
    currentStep: -1,
    isLoaded: false,
    isPlaying: false,
    playInterval: null,
    speed: 400,
    totalHits: 0,
    totalFaults: 0
};

// ==================== DOM ELEMENTS ====================
const elements = {
    framesInput: document.getElementById('framesInput'),
    refStringInput: document.getElementById('refStringInput'),
    randomBtn: document.getElementById('randomBtn'),
    exampleBtn: document.getElementById('exampleBtn'),
    loadBtn: document.getElementById('loadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    startBtn: document.getElementById('startBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    speedBtns: document.querySelectorAll('.speed-btn'),
    tableWrapper: document.getElementById('tableWrapper'),
    stackContainer: document.getElementById('stackContainer'),
    logContainer: document.getElementById('logContainer'),
    totalHits: document.getElementById('totalHits'),
    totalFaults: document.getElementById('totalFaults'),
    currentStep: document.getElementById('currentStep'),
    totalSteps: document.getElementById('totalSteps'),
    hitRatio: document.getElementById('hitRatio'),
    alertContainer: document.getElementById('alertContainer'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
};

// ==================== INITIALIZATION ====================
function init() {
    setupEventListeners();
    setupKeyboardShortcuts();
}

function setupEventListeners() {
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Input controls
    elements.randomBtn.addEventListener('click', generateRandomString);
    elements.exampleBtn.addEventListener('click', loadExampleString);
    elements.loadBtn.addEventListener('click', loadAndValidate);
    elements.resetBtn.addEventListener('click', resetSimulator);

    // Playback controls
    elements.startBtn.addEventListener('click', startSimulation);
    elements.prevBtn.addEventListener('click', previousStep);
    elements.nextBtn.addEventListener('click', nextStep);
    elements.playBtn.addEventListener('click', startAutoPlay);
    elements.pauseBtn.addEventListener('click', pauseAutoPlay);

    // Speed selection
    elements.speedBtns.forEach(btn => {
        btn.addEventListener('click', () => setSpeed(btn));
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (!state.isLoaded) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                previousStep();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextStep();
                break;
            case ' ':
                e.preventDefault();
                if (state.isPlaying) {
                    pauseAutoPlay();
                } else {
                    startAutoPlay();
                }
                break;
        }
    });
}

// ==================== TAB MANAGEMENT ====================
function switchTab(tabId) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// ==================== INPUT HANDLING ====================
function generateRandomString() {
    const length = Math.floor(Math.random() * 6) + 8; // 8-13 numbers
    const maxPage = 9;
    const randomPages = [];
    
    for (let i = 0; i < length; i++) {
        randomPages.push(Math.floor(Math.random() * maxPage));
    }
    
    elements.refStringInput.value = randomPages.join(' ');
    showAlert('Random reference string generated!', 'info');
}

function loadExampleString() {
    elements.refStringInput.value = '7 0 1 2 0 3 0 4';
    elements.framesInput.value = '3';
    showAlert('Example loaded: 7 0 1 2 0 3 0 4 with 3 frames', 'info');
}

function loadAndValidate() {
    // Get and validate frames
    const framesValue = parseInt(elements.framesInput.value);
    if (isNaN(framesValue) || framesValue < 1 || framesValue > 10) {
        showAlert('Please enter a valid number of frames (1-10)', 'error');
        return;
    }

    // Get and validate reference string
    const refString = elements.refStringInput.value.trim();
    if (!refString) {
        showAlert('Please enter a reference string', 'error');
        return;
    }

    // Parse reference string
    const pages = refString.split(/[\s,]+/).map(s => s.trim()).filter(s => s !== '');
    
    // Check for non-numeric values
    for (let i = 0; i < pages.length; i++) {
        if (!/^\d+$/.test(pages[i])) {
            showAlert(`Invalid value "${pages[i]}" in reference string. Please use numbers only.`, 'error');
            return;
        }
    }

    const numericPages = pages.map(p => parseInt(p));

    // Store validated values
    state.frames = framesValue;
    state.referenceString = numericPages;
    state.isLoaded = true;

    // Build state history
    buildStateHistory();

    // Render initial state
    renderTable();
    renderStack([]);
    renderStats();
    clearLog();

    // Enable controls
    elements.startBtn.disabled = false;
    elements.prevBtn.disabled = true;
    elements.nextBtn.disabled = true;
    elements.playBtn.disabled = true;
    elements.pauseBtn.disabled = true;

    showAlert(`Loaded successfully! ${numericPages.length} pages with ${framesValue} frames. Click "Start" to begin.`, 'success');
}

function resetSimulator() {
    pauseAutoPlay();
    
    state.referenceString = [];
    state.stateHistory = [];
    state.currentStep = -1;
    state.isLoaded = false;
    state.totalHits = 0;
    state.totalFaults = 0;

    // Reset inputs
    elements.refStringInput.value = '';
    elements.framesInput.value = '3';

    // Reset displays
    elements.tableWrapper.innerHTML = `
        <div class="placeholder-message">
            <i class='bx bx-loader-alt'></i>
            <p>Load a reference string to begin simulation</p>
        </div>
    `;
    
    elements.stackContainer.innerHTML = `
        <div class="placeholder-message">
            <i class='bx bx-layer'></i>
            <p>Stack will appear here</p>
        </div>
    `;
    
    elements.logContainer.innerHTML = `
        <div class="placeholder-message">
            <i class='bx bx-message-square-detail'></i>
            <p>Actions will be logged here during simulation</p>
        </div>
    `;

    // Reset stats
    elements.totalHits.textContent = '0';
    elements.totalFaults.textContent = '0';
    elements.currentStep.textContent = '0';
    elements.totalSteps.textContent = '0';
    elements.hitRatio.textContent = '0%';

    // Disable controls
    elements.startBtn.disabled = true;
    elements.prevBtn.disabled = true;
    elements.nextBtn.disabled = true;
    elements.playBtn.disabled = true;
    elements.pauseBtn.disabled = true;

    showAlert('Simulator reset. Enter new values to begin.', 'info');
}

// ==================== LIFO ALGORITHM CORE ====================
function buildStateHistory() {
    state.stateHistory = [];
    state.totalHits = 0;
    state.totalFaults = 0;

    let frames = new Array(state.frames).fill(null);
    let stack = []; // Stack to track LIFO order (top = most recent)

    for (let i = 0; i < state.referenceString.length; i++) {
        const page = state.referenceString[i];
        let stepData = {
            step: i + 1,
            page: page,
            frames: [...frames],
            stack: [...stack],
            isHit: false,
            isFault: false,
            replacedPage: null,
            replacedIndex: -1,
            newPageIndex: -1
        };

        // Check if page is already in frames (HIT)
        const pageIndex = frames.indexOf(page);
        
        if (pageIndex !== -1) {
            // PAGE HIT
            stepData.isHit = true;
            state.totalHits++;
        } else {
            // PAGE FAULT
            stepData.isFault = true;
            state.totalFaults++;

            // Find empty frame or use LIFO replacement
            const emptyIndex = frames.indexOf(null);
            
            if (emptyIndex !== -1) {
                // Empty frame available
                frames[emptyIndex] = page;
                stack.push(page); // Push new page to top of stack
                stepData.newPageIndex = emptyIndex;
            } else {
                // No empty frame - use LIFO (replace top of stack)
                const pageToReplace = stack.pop(); // Get top of stack
                const replaceIndex = frames.indexOf(pageToReplace);
                
                stepData.replacedPage = pageToReplace;
                stepData.replacedIndex = replaceIndex;
                
                frames[replaceIndex] = page;
                stack.push(page); // Push new page to top of stack
                stepData.newPageIndex = replaceIndex;
            }

            // Update step data with new state
            stepData.frames = [...frames];
            stepData.stack = [...stack];
        }

        state.stateHistory.push(stepData);
    }
}

// ==================== SIMULATION CONTROL ====================
function startSimulation() {
    if (!state.isLoaded) {
        showAlert('Please load a reference string first', 'error');
        return;
    }

    state.currentStep = 0;
    
    // Enable navigation
    elements.startBtn.disabled = true;
    elements.prevBtn.disabled = true;
    elements.nextBtn.disabled = state.stateHistory.length <= 1;
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;

    // Render first step
    renderCurrentStep();
    clearLog();
    addLogEntry(state.stateHistory[0]);
}

function nextStep() {
    if (state.currentStep >= state.stateHistory.length - 1) return;
    
    state.currentStep++;
    renderCurrentStep();
    addLogEntry(state.stateHistory[state.currentStep]);
    updateNavigationButtons();
}

function previousStep() {
    if (state.currentStep <= 0) return;
    
    state.currentStep--;
    renderCurrentStep();
    updateLogHighlight();
    updateNavigationButtons();
}

function startAutoPlay() {
    if (state.currentStep >= state.stateHistory.length - 1) {
        // Reset to beginning if at end
        state.currentStep = -1;
        clearLog();
    }

    state.isPlaying = true;
    elements.playBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.prevBtn.disabled = true;
    elements.nextBtn.disabled = true;

    state.playInterval = setInterval(() => {
        if (state.currentStep >= state.stateHistory.length - 1) {
            pauseAutoPlay();
            return;
        }
        
        state.currentStep++;
        renderCurrentStep();
        addLogEntry(state.stateHistory[state.currentStep]);
    }, state.speed);
}

function pauseAutoPlay() {
    state.isPlaying = false;
    
    if (state.playInterval) {
        clearInterval(state.playInterval);
        state.playInterval = null;
    }

    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    updateNavigationButtons();
}

function setSpeed(btn) {
    elements.speedBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.speed = parseInt(btn.dataset.speed);

    // If playing, restart with new speed
    if (state.isPlaying) {
        clearInterval(state.playInterval);
        state.playInterval = setInterval(() => {
            if (state.currentStep >= state.stateHistory.length - 1) {
                pauseAutoPlay();
                return;
            }
            
            state.currentStep++;
            renderCurrentStep();
            addLogEntry(state.stateHistory[state.currentStep]);
        }, state.speed);
    }
}

function updateNavigationButtons() {
    elements.prevBtn.disabled = state.currentStep <= 0;
    elements.nextBtn.disabled = state.currentStep >= state.stateHistory.length - 1;
}

// ==================== RENDERING FUNCTIONS ====================
function renderTable() {
    const numSteps = state.referenceString.length;
    const numFrames = state.frames;

    let html = '<table class="frames-table">';
    
    // Header row with reference string
    html += '<thead><tr class="ref-row"><th>Page</th>';
    for (let i = 0; i < numSteps; i++) {
        html += `<th data-step="${i}">${state.referenceString[i]}</th>`;
    }
    html += '</tr></thead>';

    // Frame rows
    html += '<tbody>';
    for (let f = 0; f < numFrames; f++) {
        html += `<tr><th>Frame ${f + 1}</th>`;
        for (let s = 0; s < numSteps; s++) {
            html += `<td data-step="${s}" data-frame="${f}">-</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';

    elements.tableWrapper.innerHTML = html;
}

function renderCurrentStep() {
    if (state.currentStep < 0 || state.currentStep >= state.stateHistory.length) return;

    const currentData = state.stateHistory[state.currentStep];
    
    // Update table
    updateTableDisplay();
    
    // Update stack
    renderStack(currentData.stack);
    
    // Update stats
    renderStats();
}

function updateTableDisplay() {
    const table = elements.tableWrapper.querySelector('.frames-table');
    if (!table) return;

    const cells = table.querySelectorAll('td, th[data-step]');
    
    // Reset all cells
    cells.forEach(cell => {
        cell.classList.remove('current-step', 'cell-hit', 'cell-fault', 'cell-replaced', 'cell-new');
    });

    // Update cells up to current step
    for (let s = 0; s <= state.currentStep; s++) {
        const stepData = state.stateHistory[s];
        
        // Highlight current step column
        if (s === state.currentStep) {
            const currentStepCells = table.querySelectorAll(`[data-step="${s}"]`);
            currentStepCells.forEach(cell => cell.classList.add('current-step'));
        }

        // Update frame cells
        for (let f = 0; f < state.frames; f++) {
            const cell = table.querySelector(`td[data-step="${s}"][data-frame="${f}"]`);
            if (cell) {
                const frameValue = stepData.frames[f];
                cell.textContent = frameValue !== null ? frameValue : '-';

                if (s === state.currentStep) {
                    if (stepData.isHit && stepData.frames[f] === stepData.page) {
                        cell.classList.add('cell-hit');
                    }
                    if (stepData.isFault) {
                        if (f === stepData.newPageIndex) {
                            cell.classList.add('cell-fault', 'cell-new');
                        }
                        if (f === stepData.replacedIndex && stepData.replacedPage !== null) {
                            cell.classList.add('cell-replaced');
                        }
                    }
                }
            }
        }
    }
}

function renderStack(stack) {
    if (!stack || stack.length === 0) {
        elements.stackContainer.innerHTML = `
            <div class="placeholder-message">
                <i class='bx bx-layer'></i>
                <p>Stack is empty</p>
            </div>
        `;
        return;
    }

    // Display stack with top element first
    const reversedStack = [...stack].reverse();
    
    let html = '';
    reversedStack.forEach((item, index) => {
        const isTop = index === 0;
        html += `<div class="stack-item ${isTop ? 'top' : ''}">${item}</div>`;
    });

    elements.stackContainer.innerHTML = html;
}

function renderStats() {
    let hits = 0;
    let faults = 0;

    for (let i = 0; i <= state.currentStep && i < state.stateHistory.length; i++) {
        if (state.stateHistory[i].isHit) hits++;
        if (state.stateHistory[i].isFault) faults++;
    }

    elements.totalHits.textContent = hits;
    elements.totalFaults.textContent = faults;
    elements.currentStep.textContent = state.currentStep + 1;
    elements.totalSteps.textContent = state.stateHistory.length;

    const total = hits + faults;
    const ratio = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
    elements.hitRatio.textContent = `${ratio}%`;
}

function clearLog() {
    elements.logContainer.innerHTML = '';
}

function addLogEntry(stepData) {
    // Remove current highlight from all entries
    const allEntries = elements.logContainer.querySelectorAll('.log-entry');
    allEntries.forEach(entry => entry.classList.remove('current'));

    let message = `Page <strong>${stepData.page}</strong> requested. `;
    
    if (stepData.isHit) {
        message += `<span class="hit-text">HIT!</span> Page already in memory.`;
    } else {
        message += `<span class="fault-text">FAULT!</span> `;
        if (stepData.replacedPage !== null) {
            message += `Replaced page <strong>${stepData.replacedPage}</strong> (top of stack) in Frame ${stepData.newPageIndex + 1}.`;
        } else {
            message += `Loaded into empty Frame ${stepData.newPageIndex + 1}.`;
        }
    }

    const stackDisplay = stepData.stack.length > 0 
        ? `Stack: [${[...stepData.stack].reverse().join(' → ')}] (top → bottom)`
        : 'Stack: empty';

    const entry = document.createElement('div');
    entry.className = `log-entry ${stepData.isHit ? 'hit' : 'fault'} current`;
    entry.innerHTML = `
        <span class="log-step">${stepData.step}</span>
        <div class="log-content">
            <div class="log-message">${message}</div>
            <div class="log-stack">${stackDisplay}</div>
        </div>
    `;

    elements.logContainer.appendChild(entry);
    elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
}

function updateLogHighlight() {
    const allEntries = elements.logContainer.querySelectorAll('.log-entry');
    allEntries.forEach((entry, index) => {
        entry.classList.toggle('current', index === state.currentStep);
    });

    // Scroll to current entry
    const currentEntry = allEntries[state.currentStep];
    if (currentEntry) {
        currentEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ==================== ALERT SYSTEM ====================
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    let icon = 'bx-info-circle';
    if (type === 'error') icon = 'bx-error-circle';
    if (type === 'success') icon = 'bx-check-circle';

    alert.innerHTML = `
        <i class='bx ${icon}'></i>
        <div class="alert-content">${message}</div>
        <button class="alert-close"><i class='bx bx-x'></i></button>
    `;

    elements.alertContainer.appendChild(alert);

    // Close button handler
    alert.querySelector('.alert-close').addEventListener('click', () => {
        removeAlert(alert);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeAlert(alert);
    }, 5000);
}

function removeAlert(alert) {
    alert.style.animation = 'alertSlideOut 0.3s ease forwards';
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
}

// ==================== DEMO STACK (Explanation Tab) ====================
let demoStackValue = 3;

window.demoPush = function() {
    const demoStack = document.getElementById('demoStack');
    if (!demoStack) return;
    
    demoStackValue++;
    
    // Remove 'top' class from current top
    const currentTop = demoStack.querySelector('.top');
    if (currentTop) currentTop.classList.remove('top');
    
    // Create new item
    const newItem = document.createElement('div');
    newItem.className = 'demo-stack-item top';
    newItem.textContent = demoStackValue;
    
    // Insert at beginning (top)
    demoStack.insertBefore(newItem, demoStack.firstChild);
};

window.demoPop = function() {
    const demoStack = document.getElementById('demoStack');
    if (!demoStack) return;
    
    const items = demoStack.querySelectorAll('.demo-stack-item');
    if (items.length <= 1) {
        showAlert('Cannot pop - stack must have at least one item!', 'error');
        return;
    }
    
    // Animate and remove top item
    const topItem = items[0];
    topItem.style.animation = 'slideOut 0.3s ease forwards';
    
    setTimeout(() => {
        topItem.remove();
        // Mark new top
        const newItems = demoStack.querySelectorAll('.demo-stack-item');
        if (newItems.length > 0) {
            newItems[0].classList.add('top');
        }
    }, 300);
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', init);
