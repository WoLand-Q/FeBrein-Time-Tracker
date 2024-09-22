// script.js
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

    // Функция для преобразования времени в миллисекунды
    function parseTimeToMilliseconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return ((hours * 3600) + (minutes * 60) + (seconds)) * 1000;
    }

    // Функция для получения данных сессии из БД
    async function getSessionFromDB() {
        try {
            const response = await fetch('api/get_session.php');
            if (!response.ok) {
                throw new Error('Ошибка при запросе сессии');
            }
            const jsonResponse = await response.json();
            const sessionData = jsonResponse.data;
            console.log('Данные сессии из БД:', sessionData);

            return sessionData || null;
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

        console.log('Отправляем POST запрос с данными:', sessionData);

        fetch('api/update_session.php', {
            method: 'POST',
            body: JSON.stringify(sessionData),
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
            .then(response => response.json())
            .then(result => {
                console.log('Ответ сервера:', result);
                if (!result.success) {
                    console.error('Ошибка при сохранении:', result.message);
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
            const response = await fetch(`api/get_users.php?date=${selectedDate}`);
            let jsonResponse = await response.json();
            let data = jsonResponse.data;

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

                // Добавляем класс для цветового оформления статуса
                let statusClass = '';
                if (session.status === 'working') {
                    statusClass = 'status-working';
                } else if (session.status === 'on_lunch') {
                    statusClass = 'status-on-lunch';
                } else if (session.status === 'not_working') {
                    statusClass = 'status-not-working';
                }

                row.innerHTML = `
                    <td>${session.username || 'N/A'}</td>
                    <td class="${statusClass}">${statusTranslation[session.status] || session.status || 'N/A'}</td>
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
            const elapsedWorkTime = totalWorkTime + (now - workStartTime);
            if (!isNaN(elapsedWorkTime) && elapsedWorkTime >= 0) {
                const formattedTime = formatTotalTime(elapsedWorkTime);
                workTimerDisplay.textContent = `Время работы: ${formattedTime}`;
            } else {
                workTimerDisplay.textContent = 'Время работы: 00:00:00';
            }
        } else {
            // Отображаем накопленное время работы
            if (totalWorkTime > 0) {
                const formattedTime = formatTotalTime(totalWorkTime);
                workTimerDisplay.textContent = `Время работы: ${formattedTime}`;
            } else {
                workTimerDisplay.textContent = 'Время работы: 00:00:00';
            }
        }

        // Обновляем таймер обеда
        if (lunchStartTime) {
            const elapsedLunchTime = totalLunchTime + (now - lunchStartTime);
            if (!isNaN(elapsedLunchTime) && elapsedLunchTime >= 0) {
                const formattedTime = formatTotalTime(elapsedLunchTime);
                lunchTimerDisplay.textContent = `Время обеда: ${formattedTime}`;
            } else {
                lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
            }
        } else {
            // Отображаем накопленное время обеда
            if (totalLunchTime > 0) {
                const formattedTime = formatTotalTime(totalLunchTime);
                lunchTimerDisplay.textContent = `Время обеда: ${formattedTime}`;
            } else {
                lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
            }
        }
    }

    // Функция для запуска таймера работы
    function startWorkTimer(isRestoring = false) {
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
        }

        if (!isRestoring) {
            // Первый запуск работы в сессии
            workStartTime = new Date();
            console.log('Первый запуск работы, сохраняем start_time');
            saveSessionToDB('working', { start_time: getLocalTime() });
        } else {
            // Восстановление работы из сессии
            console.log('Восстановление работы, обновляем статус на "working"');
            // Сохраняем статус "working" без изменения start_time
            saveSessionToDB('working'); // Обновляем статус на "working"
            workStartTime = new Date(); // Устанавливаем startStartTime на текущее время
            console.log('workStartTime set to:', workStartTime);
        }

        workTimerInterval = setInterval(updateTimers, 1000);
        console.log('Work timer started');

        startWorkBtn.disabled = true;
        startLunchBtn.disabled = false;
        stopWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Работаем';
    }

    // Функция для запуска таймера обеда
    function startLunchTimer(isRestoring = false) {
        if (!lunchStartTime && !isRestoring) {
            lunchStartTime = new Date();
            console.log('Начало обеда:', lunchStartTime);
        }

        // Приостанавливаем таймер работы
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
            console.log('Work timer paused');
        }
        if (workStartTime) {
            totalWorkTime += new Date() - workStartTime;
            console.log('Accumulated work time:', totalWorkTime);
            workStartTime = null;
        }

        lunchTimerDisplay.style.display = 'block';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
        console.log('Lunch timer display shown');

        lunchTimerInterval = setInterval(updateTimers, 1000);
        console.log('Lunch timer started');

        startLunchBtn.disabled = true;
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Продолжить работу';
        stopWorkBtn.disabled = false;

        if (!isRestoring) {
            console.log('Сохраняем начало обеда');
            saveSessionToDB('on_lunch', { lunch_start_time: getLocalTime() });
        } else {
            console.log('Восстановление обеда, не сохраняем в БД');
        }
    }

    // Функция для остановки таймера обеда и продолжения работы
    function stopLunchTimerAndResumeWork() {
        if (lunchTimerInterval) {
            clearInterval(lunchTimerInterval);
            lunchTimerInterval = null;
            console.log('Lunch timer cleared');
        }

        let lunchEndTime = null;
        if (lunchStartTime) {
            totalLunchTime += new Date() - lunchStartTime;
            lunchEndTime = getLocalTime();
            console.log('Accumulated lunch time:', totalLunchTime, 'Lunch ended at:', lunchEndTime);
            lunchStartTime = null;
        }

        lunchTimerDisplay.style.display = 'none';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
        console.log('Lunch timer display hidden');

        // Обновляем статус на "working" в базе данных с lunch_end_time
        const updateData = { status: 'working' };
        if (lunchEndTime) {
            updateData.lunch_end_time = lunchEndTime;
            console.log('Saving working status with lunch_end_time:', lunchEndTime);
        }
        saveSessionToDB('working', updateData);

        // Возобновляем работу
        startWorkTimer(true);
    }

    // Функция для остановки таймеров и сохранения данных (закончить работу)
    function stopAllTimers() {
        // Останавливаем обеденный таймер, если он запущен
        if (lunchStartTime) {
            // Если пользователь в обеде и хочет закончить работу
            stopLunchTimerAndResumeWork();
        }

        // Останавливаем таймер работы
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
            console.log('Work timer cleared');
        }

        // Вычисляем общее время работы перед сбросом переменных
        if (workStartTime) {
            totalWorkTime += new Date() - workStartTime;
            console.log('Accumulated work time:', totalWorkTime);
            workStartTime = null;
        }
        const totalTime = totalWorkTime;
        console.log('Total work time:', totalTime);

        // Сбрасываем переменные
        workStartTime = null;
        lunchStartTime = null;
        totalWorkTime = 0;
        totalLunchTime = 0;

        // Сбрасываем отображение таймеров
        workTimerDisplay.textContent = 'Время работы: 00:00:00';
        lunchTimerDisplay.style.display = 'none';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
        console.log('Timer displays reset');

        // Обновляем состояние кнопок
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Начать работу';
        startLunchBtn.disabled = true;
        stopWorkBtn.disabled = true;

        // Форматируем итоговое время работы
        const totalHoursFormatted = formatTotalTime(totalTime);
        console.log('Total hours formatted:', totalHoursFormatted);

        const endTime = getLocalTime();
        console.log('Work ended at:', endTime);

        // Добавляем подтверждение окончания работы
        showEndWorkConfirmation(endTime, totalHoursFormatted);
    }

    // Функция для отображения модального окна подтверждения окончания работы
    function showEndWorkConfirmation(endTime, totalHoursFormatted) {
        // Создаём модальное окно
        const modal = document.createElement('div');
        modal.id = 'end-work-modal';
        modal.classList.add('modal');

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>Подтверждение окончания работы</h2>
                <p>Вы уверены, что хотите закончить работу?</p>
                <button id="confirm-end-work" class="confirm-button">Да, закончить</button>
                <button id="cancel-end-work" class="cancel-button">Отмена</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Получаем элементы модального окна
        const closeButton = modal.querySelector('.close-button');
        const confirmButton = modal.querySelector('#confirm-end-work');
        const cancelButton = modal.querySelector('#cancel-end-work');

        // Обработчики событий
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            // Работа уже окончена, ничего не делаем
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            // Работа уже окончена, ничего не делаем
        });

        confirmButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            // Сохраняем данные окончания работы
            saveSessionToDB('not_working', {
                end_time: endTime,
                total_work_time: totalHoursFormatted
            });

            // Обновляем таблицу
            loadSessionData();
        });

        // Стилизация модального окна
        const modalStyle = document.createElement('style');
        modalStyle.innerHTML = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .modal-content {
                background: #fff;
                padding: 20px 30px;
                border-radius: 8px;
                text-align: center;
                position: relative;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }

            .close-button {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 1.5em;
                cursor: pointer;
                color: #aaa;
                transition: color 0.3s;
            }

            .close-button:hover {
                color: #000;
            }

            .modal-content h2 {
                margin-bottom: 15px;
                color: #333;
            }

            .modal-content p {
                margin-bottom: 25px;
                color: #555;
            }

            .confirm-button {
                background-color: #28a745;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
                transition: background-color 0.3s, transform 0.2s;
            }

            .confirm-button:hover {
                background-color: #218838;
                transform: translateY(-2px);
            }

            .cancel-button {
                background-color: #dc3545;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s, transform 0.2s;
            }

            .cancel-button:hover {
                background-color: #c82333;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(modalStyle);
    }

    // Функция для сброса таймеров и состояний после окончания работы
    function resetTimers() {
        // Останавливаем все таймеры
        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
            console.log('Work timer cleared');
        }
        if (lunchTimerInterval) {
            clearInterval(lunchTimerInterval);
            lunchTimerInterval = null;
            console.log('Lunch timer cleared');
        }

        // Сбрасываем переменные
        workStartTime = null;
        lunchStartTime = null;
        totalWorkTime = 0;
        totalLunchTime = 0;

        // Сбрасываем отображение таймеров
        workTimerDisplay.textContent = 'Время работы: 00:00:00';
        lunchTimerDisplay.style.display = 'none';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
        console.log('Timer displays reset');

        // Обновляем состояние кнопок
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Начать работу';
        startLunchBtn.disabled = true;
        stopWorkBtn.disabled = true;

        // Обновляем таблицу
        loadSessionData();
    }

    // Функция для восстановления таймеров из БД
    async function restoreTimers() {
        const sessionData = await getSessionFromDB();

        console.log('Восстанавливаем сессию:', sessionData);

        if (!sessionData || !sessionData.status || sessionData.status === 'not_working') {
            // Сброс кнопок и таймеров
            startWorkBtn.disabled = false;
            startWorkBtn.textContent = 'Начать работу';
            startLunchBtn.disabled = true;
            stopWorkBtn.disabled = true;
            lunchTimerDisplay.style.display = 'none';
            console.log('Session not active. Timers reset.');
            return;
        }

        // Восстанавливаем общее время работы и обеда
        if (sessionData.total_work_time) {
            totalWorkTime = parseTimeToMilliseconds(sessionData.total_work_time);
            console.log('Total work time restored:', totalWorkTime);
        }

        if (sessionData.total_lunch_time) {
            totalLunchTime = parseTimeToMilliseconds(sessionData.total_lunch_time);
            console.log('Total lunch time restored:', totalLunchTime);
        }

        // Восстанавливаем состояние в зависимости от статуса
        if (sessionData.status === 'working') {
            // Работаем
            if (sessionData.start_time) {
                const startTime = new Date(sessionData.start_time);
                const elapsed = new Date() - startTime;
                totalWorkTime += elapsed;
                workStartTime = new Date(); // Устанавливаем текущий момент как начало продолжения работы
                console.log('Работа продолжается. workStartTime:', workStartTime);
            } else {
                // Временный старт, если данные отсутствуют
                workStartTime = new Date();
                console.log('Работа продолжается, данные start_time отсутствуют. workStartTime установлено на:', workStartTime);
            }
            startWorkTimer(true);
        } else if (sessionData.status === 'on_lunch') {
            // На обеде
            if (sessionData.lunch_start_time) {
                const lunchStart = new Date(sessionData.lunch_start_time);
                const elapsed = new Date() - lunchStart;
                totalLunchTime += elapsed;
                lunchStartTime = new Date(); // Устанавливаем текущий момент как начало продолжения обеда
                console.log('Обед продолжается. lunchStartTime:', lunchStartTime);
            } else {
                // Временное начало обеда, если данные отсутствуют
                lunchStartTime = new Date();
                console.log('Обед продолжается, данные lunch_start_time отсутствуют. lunchStartTime установлено на:', lunchStartTime);
            }
            startLunchTimer(true);
        }

        // Обновляем состояние кнопок
        startWorkBtn.disabled = sessionData.status === 'working';
        startLunchBtn.disabled = sessionData.status !== 'working';
        stopWorkBtn.disabled = false;

        // Обновляем отображение таймеров
        updateTimers();
    }

    // Обработчики событий
    startWorkBtn.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Клик по кнопке "Начать работу"');
        if (lunchStartTime) {
            // Если пользователь на обеде, остановить обед и возобновить работу
            stopLunchTimerAndResumeWork();
        } else {
            startWorkTimer();
        }
    });

    startLunchBtn.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Клик по кнопке "Обед"');
        startLunchTimer();
    });

    stopWorkBtn.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Клик по кнопке "Закончить работу"');
        stopAllTimers();
    });

    // Восстанавливаем таймеры при перезагрузке страницы
    restoreTimers();

    // Устанавливаем текущую дату и загружаем данные
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.value = today;
        console.log('Date input set to:', today);
    }

    // Загружаем данные за текущую дату
    loadSessionData();

    // Автообновление таблицы
    setInterval(loadSessionData, 1000);

    // Обработчик для кнопки загрузки данных
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', loadSessionData);
    }

    // Добавляем подтверждение при попытке закрыть страницу или браузер
    window.addEventListener('beforeunload', function (e) {
        // Если пользователь активно работает или на обеде, показываем подтверждение
        if (workStartTime || lunchStartTime) {
            e.preventDefault();
            e.returnValue = '';
            console.log('beforeunload triggered: User is active.');
        }
    });
});
