// ==========================================
// 1. НАСТРОЙКА ДАТ И ПРОГРАММЫ ТРЕНИРОВОК
// ==========================================
const startDate = new Date(2026, 10, 16); // 16 ноября 2026
const endDate = new Date(2027, 2, 1);     // 1 марта 2027

function getWorkoutForDay(dayIndex, dateObj) {
    const level = Math.floor(dayIndex / 14) + 1;
    const dayOfWeek = dateObj.getDay();

    const squats = 20 + (level * 10);
    const pushups = 10 + (level * 5);
    const runKm = (2 + (level * 0.5)).toFixed(1);
    const plankSec = 30 + (level * 15);
    const lunges = 12 + (level * 4);
    const stepsGoal = 8000 + (level * 500);

    switch (dayOfWeek) {
        case 1:
            return {
                title: "Силовая: Верх тела",
                tag: "Сила",
                tagClass: "tag-strength",
                tasks: [
                    `Отжимания от пола: 4 × ${pushups} повт. (отдых 60 сек)`,
                    `Обратные отжимания от стула: 3 × ${pushups} повт.`,
                    `Планка на локтях: 3 подхода по ${plankSec} сек. (используй таймер сверху)`,
                    `Цель по шагам: ${stepsGoal} шагов`
                ]
            };
        case 2:
            return {
                title: "Бег и Жиросжигание",
                tag: "Кардио",
                tagClass: "tag-cardio",
                tasks: [
                    `Разминка суставов: 5 минут`,
                    `Бег в спокойном темпе: ${runKm} км (пульс 130–145 уд/мин)`,
                    `Берпи: 3 × ${6 + level * 2} повт.`,
                    `Цель по шагам: ${stepsGoal + 1500} шагов`
                ]
            };
        case 3:
            return {
                title: "День ног и Приседаний",
                tag: "Ноги",
                tagClass: "tag-legs",
                tasks: [
                    `Классические приседания: 4 × ${squats} повт.`,
                    `Выпады вперед на каждую ногу: 3 × ${lunges} повт.`,
                    `Стульчик у стены: 3 подхода по ${plankSec} сек.`,
                    `Цель по шагам: ${stepsGoal} шагов`
                ]
            };
        case 4:
            return {
                title: "Пресс и Активный отдых",
                tag: "Восстановление",
                tagClass: "tag-rest",
                tasks: [
                    `Скручивания на пресс: 4 × ${15 + level * 5} повт.`,
                    `Подъем ног лежа: 3 × ${12 + level * 3} повт.`,
                    `Прогулка быстрым шагом: 45 минут`,
                    `Растяжка спины и ног: 10 минут`
                ]
            };
        case 5:
            return {
                title: "Фулбоди: Сила + Выносливость",
                tag: "Сила",
                tagClass: "tag-strength",
                tasks: [
                    `Приседания с выпрыгиванием: 3 × ${Math.round(squats * 0.6)} повт.`,
                    `Широкие отжимания: 3 × ${pushups} повт.`,
                    `Скалолаз (бег в упоре лежа): 4 × 30 сек.`,
                    `Цель по шагам: ${stepsGoal} шагов`
                ]
            };
        case 6:
            return {
                title: "Интервальный бег",
                tag: "Кардио",
                tagClass: "tag-cardio",
                tasks: [
                    `Интервалы: 1 мин быстрого бега / 2 мин шага (повторить ${4 + level} раз)`,
                    `Прыжки на скакалке (или без): 3 × 1 минута`,
                    `Цель по шагам: ${stepsGoal + 2000} шагов`
                ]
            };
        default:
            return {
                title: "День отдыха и Замеров",
                tag: "Отдых",
                tagClass: "tag-rest",
                tasks: [
                    `Утреннее взвешивание натощак (занеси вес в график сверху)`,
                    `Легкая прогулка: минимум 7 000 шагов`,
                    `Полноценный сон: 8 часов`
                ]
            };
    }
}

// ==========================================
// 2. ОТРИСОВКА КАРТОЧЕК И ФИЛЬТРЫ
// ==========================================
let allDays = [];

function initSchedule() {
    const container = document.getElementById('workouts-container');
    container.innerHTML = '';
    allDays = [];

    let current = new Date(startDate);
    let index = 0;
    const monthsNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const daysNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

    while (current <= endDate) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const workout = getWorkoutForDay(index, current);
        const isCompleted = !!savedData.completedDays[dateKey];
        const dateStr = `${current.getDate()} ${monthsNames[current.getMonth()]} (${daysNames[current.getDay()]})`;

        const card = document.createElement('div');
        card.className = `day-card ${isCompleted ? 'completed' : ''}`;
        card.dataset.month = current.getMonth();

        const tasksHtml = workout.tasks.map(t => `<li>${t}</li>`).join('');

        card.innerHTML = `
            <div class="day-header">
                <span class="day-date">${dateStr}</span>
                <span class="day-tag ${workout.tagClass}">${workout.tag}</span>
            </div>
            <h4 style="margin-bottom: 10px; color: #e2e8f0;">${workout.title}</h4>
            <ul class="task-list">${tasksHtml}</ul>
            <button class="check-btn" onclick="toggleDay('${dateKey}', this)">
                ${isCompleted ? '✅ Выполнено' : 'Отметить выполнение'}
            </button>
        `;

        container.appendChild(card);
        allDays.push(card);

        current.setDate(current.getDate() + 1);
        index++;
    }

    document.getElementById('days-total').innerText = allDays.length;
    updateStats();
    renderChart();
}

function toggleDay(dateKey, btn) {
    const card = btn.parentElement;
    if (savedData.completedDays[dateKey]) {
        delete savedData.completedDays[dateKey];
        card.classList.remove('completed');
        btn.innerText = 'Отметить выполнение';
    } else {
        savedData.completedDays[dateKey] = true;
        card.classList.add('completed');
        btn.innerText = '✅ Выполнено';
    }
    saveData();
}

function filterMonth(month, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    allDays.forEach(card => {
        if (month === 'all' || parseInt(card.dataset.month) === month) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function resetProgress() {
    if (confirm('Сбросить весь прогресс, историю веса и шаги?')) {
        localStorage.removeItem('fitPlanProData');
        location.reload();
    }
}

// Запуск всего приложения
initSchedule();
