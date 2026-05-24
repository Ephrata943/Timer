let timer = null;
let totalSeconds = 0; // Fixed: Changed default starting pool from 300 to 0
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const pickerContainer = document.getElementById('pickerContainer');
const hrsSelect = document.getElementById('hoursInput');
const minsSelect = document.getElementById('minutesInput');
const secsSelect = document.getElementById('secondsInput');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

// 1. POPULATE DROPDOWNS ON LOAD
function populateDropdown(selectElement, maxVal) {
    for (let i = 0; i <= maxVal; i++) {
        let opt = document.createElement('option');
        let valStr = String(i).padStart(2, '0');
        opt.value = i;
        opt.textContent = valStr;
        selectElement.appendChild(opt);
    }
}
populateDropdown(hrsSelect, 60);
populateDropdown(minsSelect, 59);
populateDropdown(secsSelect, 59);

// Fixed: Set initial dropdown selectors to 00:00:00 instead of 00:05:00
hrsSelect.value = 0;
minsSelect.value = 0;
secsSelect.value = 0;

// 2. AUDIO ALARM GENERATOR
function playAlarmSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const audioCtx = new AudioContext();
        const beepTimes = [0, 0.3, 0.6];

        beepTimes.forEach((delay) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + delay);

            gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.2);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + 0.2);
        });
    } catch (error) {
        console.log("Audio blocked or failed:", error);
    }
}

// 3. CORE MATH & RUN LOGIC
function updateDisplay() {
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    timerDisplay.textContent =
        String(hours).padStart(2, '0') + ":" +
        String(minutes).padStart(2, '0') + ":" +
        String(seconds).padStart(2, '0');
}

function setTimeFromDropdowns() {
    let h = parseInt(hrsSelect.value) || 0;
    let m = parseInt(minsSelect.value) || 0;
    let s = parseInt(secsSelect.value) || 0;
    totalSeconds = (h * 3600) + (m * 60) + s;
}

function startTimer() {
    if (isRunning) return;

    setTimeFromDropdowns();
    if (totalSeconds <= 0) return;

    isRunning = true;
    if (pickerContainer) pickerContainer.classList.add('disabled');

    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            clearInterval(timer);
            timer = null;
            isRunning = false;
            if (pickerContainer) pickerContainer.classList.remove('disabled');
            playAlarmSound();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    isRunning = false;
    if (pickerContainer) pickerContainer.classList.remove('disabled');
}

function resetTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    isRunning = false;
    if (pickerContainer) pickerContainer.classList.remove('disabled');

    // Fixed: Reset action returns to 00:00:00
    hrsSelect.value = 0;
    minsSelect.value = 0;
    secsSelect.value = 0;

    setTimeFromDropdowns();
    updateDisplay();
}

// 4. STEP ADJUSTMENT BUTTONS (+ / -)
document.getElementById('incHours').addEventListener('click', () => {
    if (hrsSelect.selectedIndex < 60) hrsSelect.selectedIndex++;
    setTimeFromDropdowns();
    updateDisplay();
});
document.getElementById('decHours').addEventListener('click', () => {
    if (hrsSelect.selectedIndex > 0) hrsSelect.selectedIndex--;
    setTimeFromDropdowns();
    updateDisplay();
});

document.getElementById('incMinutes').addEventListener('click', () => {
    if (minsSelect.selectedIndex < 59) minsSelect.selectedIndex++;
    setTimeFromDropdowns();
    updateDisplay();
});
document.getElementById('decMinutes').addEventListener('click', () => {
    if (minsSelect.selectedIndex > 0) minsSelect.selectedIndex--;
    setTimeFromDropdowns();
    updateDisplay();
});

document.getElementById('incSeconds').addEventListener('click', () => {
    if (secsSelect.selectedIndex < 59) secsSelect.selectedIndex++;
    setTimeFromDropdowns();
    updateDisplay();
});
document.getElementById('decSeconds').addEventListener('click', () => {
    if (secsSelect.selectedIndex > 0) secsSelect.selectedIndex--;
    setTimeFromDropdowns();
    updateDisplay();
});

// 5. EVENT LISTENERS FOR CONTROLS
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

[hrsSelect, minsSelect, secsSelect].forEach(select => {
    select.addEventListener('change', () => {
        setTimeFromDropdowns();
        updateDisplay();
    });
});

// Run instantly on page load
setTimeFromDropdowns();
updateDisplay();