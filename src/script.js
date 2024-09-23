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

    // Функция для получения данных сессии текущего пользователя из БД
    async function getSessionFromDB() {
        try {
            const response = await fetch('api/get_current_session.php');
            if (!response.ok) {
                throw new Error('Ошибка при запросе сессии');
            }
            const jsonResponse = await response.json();
            const session = jsonResponse.data;
            console.log('Данные сессии из БД:', session);

            if (session && session.status && session.status !== 'not_working') {
                return session;
            }

            return null;
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
            const response = await fetch(`api/get_session.php?date=${selectedDate}`);
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

                // Проверка, является ли пользователь администратором
                let deleteButton = '';
                if (isAdmin) {
                    deleteButton = `<button class="delete-btn" data-session-id="${session.id}">Удалить</button>`;
                }

                row.innerHTML = `
                    <td>${session.username || 'N/A'}</td>
                    <td class="${statusClass}">${statusTranslation[session.status] || session.status || 'N/A'}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td>${lunchTime}</td>
                    <td>${session.total_work_time || 'N/A'}</td>
                    <td>${deleteButton}</td>
                `;
                tableBody.appendChild(row);
            });

            // Добавляем обработчики для кнопок удаления (если они существуют)
            if (isAdmin) {
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const sessionId = event.target.getAttribute('data-session-id');
                        await deleteSession(sessionId);
                        loadSessionData();  // Перезагружаем данные после удаления
                    });
                });
            }

        } catch (error) {
            console.error('Error loading session data:', error);
        }
    }

    // Функция для удаления сессии
    async function deleteSession(sessionId) {
        try {
            const response = await fetch(`api/delete_session.php`, {
                method: 'POST',
                body: JSON.stringify({ session_id: sessionId }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const result = await response.json();
            if (result.success) {
                console.log('Сессия успешно удалена');
            } else {
                console.error('Ошибка удаления сессии:', result.message);
            }
        } catch (error) {
            console.error('Ошибка при удалении сессии:', error);
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
            // Обнуляем время только если начинаем новую работу
            totalWorkTime = 0;
            totalLunchTime = 0;
            workStartTime = new Date();
            saveSessionToDB('working', { start_time: getLocalTime() });
        } else {
            // При восстановлении или продолжении работы после обеда устанавливаем workStartTime
            if (!workStartTime) {
                workStartTime = new Date();
            }
        }

        if (!workTimerInterval) {
            workTimerInterval = setInterval(updateTimers, 1000);
        }

        startWorkBtn.disabled = true;
        startLunchBtn.disabled = false;
        stopWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Работаем';
    }





    // Функция для запуска таймера обеда
    function startLunchTimer(isRestoring = false) {
        if (!isRestoring) {
            lunchStartTime = new Date();
            saveSessionToDB('on_lunch', {
                lunch_start_time: getLocalTime(),
                total_work_time: formatTotalTime(totalWorkTime)
            });
        }

        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
        }
        if (workStartTime) {
            totalWorkTime += new Date() - workStartTime;
            workStartTime = null;
        }

        lunchTimerDisplay.style.display = 'block';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';

        lunchTimerInterval = setInterval(updateTimers, 1000);

        startLunchBtn.disabled = true;
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Продолжить работу';
        stopWorkBtn.disabled = false;
    }

    // Функция для остановки таймера обеда и продолжения работы
    function stopLunchTimerAndResumeWork() {
        if (lunchTimerInterval) {
            clearInterval(lunchTimerInterval);
            lunchTimerInterval = null;
            console.log('Lunch timer cleared');
        }

        if (lunchStartTime) {
            totalLunchTime += new Date() - lunchStartTime;
            const lunchEndTime = getLocalTime();
            console.log('Accumulated lunch time:', totalLunchTime, 'Lunch ended at:', lunchEndTime);
            lunchStartTime = null;

            // Обновляем статус на "working" в базе данных с lunch_end_time
            const updateData = {
                status: 'working',
                lunch_end_time: lunchEndTime,
                total_lunch_time: formatTotalTime(totalLunchTime)
            };
            saveSessionToDB('working', updateData);
        }

        lunchTimerDisplay.style.display = 'none';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';
        console.log('Lunch timer display hidden');

        // Устанавливаем workStartTime на текущее время
        workStartTime = new Date();

        // Запускаем таймер работы
        if (!workTimerInterval) {
            workTimerInterval = setInterval(updateTimers, 1000);
        }

        startWorkBtn.disabled = true;
        startLunchBtn.disabled = false;
        stopWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Работаем';
    }


    // Функция для остановки таймеров и сохранения данных (закончить работу)
    function stopAllTimers() {
        // Останавливаем обеденный таймер, если он запущен
        if (lunchStartTime) {
            stopLunchTimerAndResumeWork();
        }

        if (workTimerInterval) {
            clearInterval(workTimerInterval);
            workTimerInterval = null;
        }

        if (workStartTime) {
            totalWorkTime += new Date() - workStartTime;
            workStartTime = null;
        }

        const totalTime = totalWorkTime;

        // Сбрасываем переменные
        workStartTime = null;
        lunchStartTime = null;

        // Сбрасываем отображение таймеров
        workTimerDisplay.textContent = 'Время работы: 00:00:00';
        lunchTimerDisplay.style.display = 'none';
        lunchTimerDisplay.textContent = 'Время обеда: 00:00:00';

        // Обновляем состояние кнопок
        startWorkBtn.disabled = false;
        startWorkBtn.textContent = 'Начать работу';
        startLunchBtn.disabled = true;
        stopWorkBtn.disabled = true;

        const totalHoursFormatted = formatTotalTime(totalTime);

        const endTime = getLocalTime();

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
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        confirmButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            // Сохраняем данные окончания работы
            saveSessionToDB('not_working', {
                end_time: endTime,
                total_work_time: totalHoursFormatted,
                total_lunch_time: formatTotalTime(totalLunchTime)
            });

            // Обнуляем общее время после сохранения
            totalWorkTime = 0;
            totalLunchTime = 0;

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

    // Функция для восстановления таймеров из БД
    async function restoreTimers() {
        sessionData = await getSessionFromDB();

        console.log('Восстанавливаем сессию:', sessionData);

        if (!sessionData || !sessionData.status || sessionData.status === 'not_working') {
            // Сброс кнопок и таймеров
            totalWorkTime = 0;
            totalLunchTime = 0;
            workStartTime = null;
            lunchStartTime = null;
            startWorkBtn.disabled = false;
            startWorkBtn.textContent = 'Начать работу';
            startLunchBtn.disabled = true;
            stopWorkBtn.disabled = true;
            lunchTimerDisplay.style.display = 'none';
            console.log('Session not active. Timers reset.');
            return;
        }

        // Восстанавливаем общее время работы и обеда
        totalWorkTime = parseTimeToMilliseconds(sessionData.total_work_time || '00:00:00');
        totalLunchTime = parseTimeToMilliseconds(sessionData.total_lunch_time || '00:00:00');

        const now = new Date();

        if (sessionData.status === 'working') {
            // Если есть время начала работы, восстанавливаем workStartTime
            if (sessionData.start_time) {
                const startTime = new Date(sessionData.start_time);
                // Вычисляем прошедшее время с момента последнего сохранения
                totalWorkTime += now - startTime;
                workStartTime = now;
            } else {
                workStartTime = now;
            }

            if (!workTimerInterval) {
                workTimerInterval = setInterval(updateTimers, 1000);
            }

            startWorkBtn.disabled = true;
            startLunchBtn.disabled = false;
            stopWorkBtn.disabled = false;
            startWorkBtn.textContent = 'Работаем';
        } else if (sessionData.status === 'on_lunch') {
            if (sessionData.lunch_start_time) {
                const lunchStart = new Date(sessionData.lunch_start_time);
                // Вычисляем прошедшее время с момента последнего сохранения
                totalLunchTime += now - lunchStart;
                lunchStartTime = now;
            } else {
                lunchStartTime = now;
            }

            if (!lunchTimerInterval) {
                lunchTimerInterval = setInterval(updateTimers, 1000);
            }
            lunchTimerDisplay.style.display = 'block';

            startWorkBtn.disabled = false;
            startWorkBtn.textContent = 'Продолжить работу';
            startLunchBtn.disabled = true;
            stopWorkBtn.disabled = false;
        }

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
            // Современные браузеры игнорируют кастомные сообщения и показывают стандартное
            e.returnValue = '';
            console.log('beforeunload triggered: User is active.');
        }
    });
});
