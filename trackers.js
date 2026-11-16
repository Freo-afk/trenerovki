// ==========================================
// 1. ХРАНИЛИЩЕ ДАННЫХ (LOCALSTORAGE)
// ==========================================
let savedData = JSON.parse(localStorage.getItem('fitPlanProData')) || {
    completedDays: {},
    steps: 0,
    water: 0,
    waterGoal: 2.5,
    weight: 85.0,
    weightHistory: [{ date: '16 ноя', weight: 85.0 }]
};

function saveData() {
    localStorage.setItem('fitPlanProData', JSON.stringify(savedData));
    updateStats();
}

// ==========================================
// 2. ВСТРОЕННЫЙ ТАЙМЕР (ПЛАНКА / ОТДЫХ)
// ==========================================
let timerSeconds = 45;
let defaultSeconds = 45;
let timerInterval = null;

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function setTimer(sec) {
    pauseTimer();
    timerSeconds = sec;
    defaultSeconds = sec;
    document.getElementById('timer-display').innerText = formatTime(timerSeconds);
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            document.getElementById('timer-display').innerText = formatTime(timerSeconds);
        } else {
            pauseTimer();
            playBeep();
            alert('Время вышло! Отличная работа!');
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    pauseTimer();
    timerSeconds = defaultSeconds;
    document.getElementById('timer-display').innerText = formatTime(timerSeconds);
}

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) { }
}

// ==========================================
// 3. КАЛЬКУЛЯТОР КАЛОРИЙ И ВОДЫ
// ==========================================
function calculateNorms() {
    const gender = document.getElementById('calc-gender').value;
    const age = parseFloat(document.getElementById('calc-age').value);
    const height = parseFloat(document.getElementById('calc-height').value);
    const weight = parseFloat(document.getElementById('calc-weight').value);

    if (!age || !height || !weight) return;

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;

    const maintenance = Math.round(bmr * 1.375);
    const deficitCalories = Math.max(Math.round(bmr), maintenance - 400);

    const waterLiters = +(weight * 0.03).toFixed(1);
    savedData.waterGoal = waterLiters;

    document.getElementById('calc-results').innerHTML = `
        Для похудения: <strong>${deficitCalories} ккал</strong> (поддержание: ${maintenance}) | Вода: <strong>${waterLiters} л/день</strong>
    `;
    saveData();
}

// ==========================================
// 4. ГРАФИК ПОХУДЕНИЯ (CHART.JS)
// ==========================================
let weightChartInstance = null;

function renderChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const labels = savedData.weightHistory.map(item => item.date);
    const dataPoints = savedData.weightHistory.map(item => item.weight);

    if (weightChartInstance) {
        weightChartInstance.destroy();
    }

    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Вес (кг)',
                data: dataPoints,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        }
    });
}

// ==========================================
// 5. ТРЕКЕРЫ ШАГОВ, ВОДЫ И ВЕСА
// ==========================================
function addSteps() {
    const input = document.getElementById('steps-input');
    const val = parseInt(input.value);
    if (!isNaN(val) && val > 0) {
        savedData.steps += val;
        input.value = '';
        saveData();
    }
}

function addWater(liters) {
    savedData.water = +(savedData.water + liters).toFixed(2);
    saveData();
}

function updateWeight() {
    const input = document.getElementById('weight-input');
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 30 && val < 250) {
        savedData.weight = val;
        const todayStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        savedData.weightHistory.push({ date: todayStr, weight: val });
        input.value = '';
        saveData();
        renderChart();
    }
}

function updateStats() {
    document.getElementById('steps-display').innerText = savedData.steps.toLocaleString('ru-RU');
    document.getElementById('steps-bar').style.width = Math.min((savedData.steps / 10000) * 100, 100) + '%';

    document.getElementById('water-display').innerText = savedData.water.toFixed(1);
    document.getElementById('water-goal').innerText = savedData.waterGoal;
    document.getElementById('water-bar').style.width = Math.min((savedData.water / savedData.waterGoal) * 100, 100) + '%';

    document.getElementById('weight-display').innerText = savedData.weight.toFixed(1) + ' кг';
    const startW = savedData.weightHistory ? savedData.weightHistory.weight : savedData.weight;
    const diff = (savedData.weight - startW).toFixed(1);
    const diffEl = document.getElementById('weight-diff');
    if (diff < 0) {
        diffEl.innerText = `Минус ${Math.abs(diff)} кг с начала программы!`;
        diffEl.style.color = '#10b981';
    } else if (diff > 0) {
        diffEl.innerText = `Изменение: +${diff} кг от старта`;
    }

    const completedCount = Object.keys(savedData.completedDays).length;
    document.getElementById('days-completed').innerText = completedCount;
    const total = document.querySelectorAll('.day-card').length;
    document.getElementById('days-bar').style.width = total ? (completedCount / total) * 100 + '%' : '0%';
}
