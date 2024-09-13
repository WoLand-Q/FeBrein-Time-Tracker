document.addEventListener('DOMContentLoaded', () => {
    // Переменные для таймеров и времени
    let workTimerInterval;
    let lunchTimerInterval;
    let workStartTime = null;
    let lunchStartTime = null;
    let totalWorkTime = 0;
    let totalLunchTime = 0;

    // Получаем элементы интерфейса
    const workTimerDisplay = document.getElementById('timer');
    const lunchTimerDisplay = document.getElementById('lunch-timer');
    const startWorkBtn = document.getElementById('start-work');
    const startLunchBtn = document.getElementById('start-lunch');
    const stopWorkBtn = document.getElementById('stop-work');
    const dateInput = document.getElementById('date-select');
    const loadDataBtn = document.getElementById('load-data');
    const tableBody = document.querySelector('#work-sessions tbody');

    const statusTranslation = {
        'working': 'Работает',
        'on_lunch': 'Обедает',
        'not_working': 'Не работает'
    };

    // Функция для получения локального времени в формате ISO
    function getLocalTime() {
        let currentDate = new Date();
        let localTime = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString();
        return localTime.split('.')[0];
    }

    // Функция для форматирования даты-времени в только время
    function formatTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    // Функция для форматирования общего времени работы в HH:MM:SS
    function formatTotalTime(totalMilliseconds) {
        const hours = Math.floor(totalMilliseconds / 1000 / 60 / 60);
        const minutes = Math.floor((totalMilliseconds / 1000 / 60) % 60);
        const seconds = Math.floor((totalMilliseconds / 1000) % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Функция для получения данных сессии из БД
    async function getSessionFromDB() {
        try {
            const response = await fetch('/api.php');
            if (!response.ok) {
                throw new Error('Ошибка при запросе сессии');
            }
            const sessionArray = await response.json();
            console.log('Данные сессии из БД:', sessionArray);

            if (Array.isArray(sessionArray) && sessionArray.length > 0) {
                return sessionArray[0]; // Возвращаем первую сессию из массива
            } else {
                return null;
            }
        } catch (error) {
            console.error('Ошибка при запросе сессии:', error);
            return null;
        }
    }

    // Функция для сохранения данных сессии в БД
    function saveSessionToDB(status, additionalData = {}) {
        const sessionData = {
            status: status,
            ...additionalData
        };

        fetch('/api.php', {
            method: 'POST',
            body: JSON.stringify(sessionData),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    console.error('Ошибка при сохранении:', result.error);
                } else {
                    console.log('Сессия успешно сохранена:', result);
                }
            })
            .catch(error => console.error('Ошибка при сохранении сессии:', error));
    }

    // Функция для загрузки данных за выбранную дату
    async function loadSessionData() {
        const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        try {
            const response = await fetch(`/api.php?date=${selectedDate}`);
            const data = await response.json();
            tableBody.innerHTML = '';  // Очистка таблицы

            // Приводим данные к массиву
            let sessionsArray = [];
            if (Array.isArray(data)) {
                sessionsArray = data;
            } else if (data) {
                sessionsArray = [data];
            }

            sessionsArray.forEach(session => {
                const startTime = session.start_time ? formatTime(session.start_time) : 'N/A';
                const endTime = session.end_time ? formatTime(session.end_time) : 'N/A';
                const lunchTime = session.lunch_start_time ? `${formatTime(session.lunch_start_time)} - ${session.lunch_end_time ? formatTime(session.lunch_end_time) : 'N/A'}` : 'N/A';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${session.username || 'N/A'}</td>
                    <td>${statusTranslation[session.status] || session.status || 'N/A'}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td>${lunchTime}</td>
                    <td>${session.total_work_time || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading session data:', error);
        }
    }

    // Функция для обновления таймеров
    function updateTimers() {
        const now = new Date();

        // Обновляем таймер работы
        if (workStartTime) {
            const elapsedWorkTime = now - workStartTime + totalWorkTime;
            if (isNaN(elapsedWorkTime)) {
                workTimerDisplay.textContent = 'Время работы: 00:00'; // Обработка NaN
            } else {
                const hours = String(Math.floor((elapsedWorkTime / 1000 / 60 / 60))).padStart(2, '0');
                const minutes = String(Math.floor((elapsedWorkTime / 1000 / 60) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((elapsedWorkTime / 1000) % 60)).padStart(2, '0');
                workTimerDisplay.textContent = `Время работы: ${hours}:${minutes}:${seconds}`;
            }
        }

        // Обновляем таймер обеда
        if (lunchStartTime) {
            const elapsedLunchTime = now - lunchStartTime + totalLunchTime;
            if (isNaN(elapsedLunchTime)) {
                lunchTimerDisplay.textContent = 'Время обеда: 00:00'; // Обработка NaN
            } else {
                const hours = String(Math.floor((elapsedLunchTime / 1000 / 60 / 60))).padStart(2, '0');
                const minutes = String(Math.floor((elapsedLunchTime / 1000 / 60) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((elapsedLunchTime / 1000) % 60)).padStart(2, '0');
                lunchTimerDisplay.textContent = `Время обеда: ${hours}:${minutes}:${seconds}`;
            }
        }
    }

    // Функция для запуска таймера работы
    function startWorkTimer() {
        // Проверяем, если таймер уже идет, сбрасываем его
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
        }

        // Если времени начала работы нет, инициализируем его
        if (!workStartTime) {
            workStartTime = new Date();
        }

        // Запускаем таймер с обновлением каждые 1 секунду
        workTimerInterval = setInterval(() => {
            updateTimers(); // Обновляем дисплей таймера
        }, 1000);

        // Обновляем интерфейс
        saveSessionToDB('working'); // Обновляем статус работы
        startWorkBtn.textContent = 'Продолжить работу';
        startWorkBtn.disabled = true;
        startLunchBtn.disabled = false;
        stopWorkBtn.disabled = false;
    }


    // Функция для запуска таймера обеда
    function startLunchTimer() {
        lunchStartTime = new Date(); // Инициализируем время начала обеда

        // Приостанавливаем таймер работы
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
        }
        if (workStartTime) {
            totalWorkTime += new Date() - workStartTime;
            workStartTime = null;
        }

        lunchTimerDisplay.style.display = 'block';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00'; // Сбрасываем таймер обеда

        lunchTimerInterval = setInterval(() => {
            updateTimers();
        }, 1000); // Запускаем обновление таймера обеда

        startLunchBtn.disabled = true;
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Продолжить работу'; // Обновляем текст кнопки
        stopWorkBtn.disabled = false;

        // Сохраняем время начала обеда
        saveSessionToDB('on_lunch', { lunch_start_time: getLocalTime() });
    }

    // Функция для остановки таймера обеда
    function stopLunchTimer() {
        if (lunchTimerInterval) {
            clearInterval(lunchTimerInterval);
            lunchTimerInterval = null;
        }

        if (lunchStartTime) {
            totalLunchTime += new Date() - lunchStartTime;
            lunchStartTime = null;
        }

        lunchTimerDisplay.style.display = 'none'; // Скрываем таймер обеда
        lunchTimerDisplay.textContent = 'Время обеда: 00:00';

        // Сохраняем время окончания обеда
        saveSessionToDB('working', {
            lunch_end_time: getLocalTime(),
            total_lunch_time: formatTotalTime(totalLunchTime)
        });

        // Продолжаем работу
        startWorkTimer(); // Запускаем таймер работы после обеда
    }

    // Функция для остановки всех таймеров и сохранения данных
    function stopAllTimers() {
        // Останавливаем обеденный таймер, если он запущен
        if (lunchStartTime) {
            stopLunchTimer();
        }

        // Останавливаем таймеры
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
        }

        // Вычисляем общее время работы перед сбросом переменных
        if (workStartTime) {
            totalWorkTime += new Date() - workStartTime;
            workStartTime = null;
        }
        const totalTime = totalWorkTime;

        // Сбрасываем переменные
        workStartTime = null;
        lunchStartTime = null;
        totalWorkTime = 0;
        totalLunchTime = 0;

        // Сбрасываем отображение таймеров
        workTimerDisplay.textContent = 'Время работы: 00:00';
        lunchTimerDisplay.style.display = 'none';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00';

        // Обновляем состояние кнопок
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Начать работу';
        startLunchBtn.disabled = true;
        stopWorkBtn.disabled = true;

        // Форматируем итоговое время работы
        const totalHoursFormatted = formatTotalTime(totalTime);

        const endTime = getLocalTime();

        // Сохраняем данные сессии
        saveSessionToDB('not_working', {
            end_time: endTime,
            total_work_time: totalHoursFormatted
        });
    }

    // Функция для восстановления таймеров из БД
    async function restoreTimers() {
        const sessionData = await getSessionFromDB();

        if (!sessionData || !sessionData.status) {
            // Нет данных для восстановления
            return;
        }

        if (sessionData.start_time && !sessionData.end_time) {
            workStartTime = new Date(sessionData.start_time);

            // Восстанавливаем общее время работы
            if (sessionData.total_work_time) {
                const [hours, minutes, seconds] = sessionData.total_work_time.split(':').map(Number);
                totalWorkTime = ((hours * 3600) + (minutes * 60) + seconds) * 1000;
            } else {
                totalWorkTime = 0;
            }

            if (sessionData.status === 'on_lunch') {
                if (sessionData.lunch_start_time && !sessionData.lunch_end_time) {
                    lunchStartTime = new Date(sessionData.lunch_start_time);

                    // Восстанавливаем общее время обеда
                    if (sessionData.total_lunch_time) {
                        const [hours, minutes, seconds] = sessionData.total_lunch_time.split(':').map(Number);
                        totalLunchTime = ((hours * 3600) + (minutes * 60) + seconds) * 1000;
                    } else {
                        totalLunchTime = 0;
                    }

                    startLunchTimer();
                }
            } else if (sessionData.status === 'working') {
                startWorkTimer();
            }
        } else {
            // Работа завершена
            startWorkBtn.disabled = false;
            startLunchBtn.disabled = true;
            stopWorkBtn.disabled = true;
            startWorkBtn.textContent = 'Начать работу';
        }
    }

    // Обработчики событий
    startWorkBtn.addEventListener('click', () => {
        if (lunchStartTime) {
            // Если мы на обеде, завершаем обед
            stopLunchTimer();
        } else {
            // Начинаем или продолжаем работу
            startOrContinueWork();
        }
    });

    startLunchBtn.addEventListener('click', () => {
        startLunchTimer();
    });

    stopWorkBtn.addEventListener('click', () => {
        stopAllTimers(); // Останавливаем все таймеры и сохраняем данные
    });

    // Функция для начала или продолжения работы
    async function startOrContinueWork() {
        console.log("Начало работы: проверка сессии...");
        const session = await getSessionFromDB();

        // Если уже работает
        if (session && session.status === 'working') {
            console.log("Работа уже ведется, восстановление таймера...");
            restoreTimers();
        } else {
            // Если это новая сессия или продолжаем старую
            console.log("Запуск новой сессии или продолжение старой...");
            if (!session || !session.start_time) {
                workStartTime = new Date();  // Устанавливаем новое время начала работы
                saveSessionToDB('working', { start_time: getLocalTime() });
            } else {
                // Возобновляем с предыдущего времени
                workStartTime = new Date(session.start_time);
            }

            // Запуск таймера работы
            console.log("Запуск таймера работы...");
            startWorkTimer();
        }
    }

    // Восстанавливаем таймеры при перезагрузке страницы
    restoreTimers();

    // Устанавливаем текущую дату и загружаем данные
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Загружаем данные за текущую дату
    loadSessionData();

    // Обработчик для кнопки загрузки данных
    loadDataBtn.addEventListener('click', loadSessionData);

    // Скрываем таймер обеда при загрузке страницы
    lunchTimerDisplay.style.display = 'none';
});
