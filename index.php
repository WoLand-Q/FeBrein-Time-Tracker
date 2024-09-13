<?php
//error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$isAdmin = ($_SESSION['role'] === 'admin');
$username = $_SESSION['username'] ?? 'Гость';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta name="version" content="1.0 alpha">
    <meta charset="UTF-8">
    <title>FeBrein Time Tracker</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="1.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="script.js" defer></script>
</head>
<body>
    <div class="container-main">
        <img src="img/icon.png" alt="FebTime Logo" class="logo">
        <h1 class="animated-title">
            <span class="febrein">FeBrein</span>
            <span>Time Tracker</span>
        </h1>
        <p class="welcome">Привет, <?php echo htmlspecialchars($username); ?>!</p>

        <!-- Элементы управления датой и загрузкой данных -->
        <div class="date-control">
            <label for="date-select">Выберите дату: </label>
            <input type="date" id="date-select">
            <button id="load-data">Загрузить данные</button>
        </div>

        <!-- Таблица для отображения текущих данных -->
        <table id="work-sessions">
            <thead>
            <tr>
                <th>Имя</th>
                <th>Статус</th>
                <th>Начало работы</th>
                <th>Конец работы</th>
                <th>Обед (начало - конец)</th>
                <th>Общее время</th>
            </tr>
            </thead>
            <tbody>
            <!-- Здесь будет заполняться таблица -->
            </tbody>
        </table>

        <!-- Кнопки для управления статусом работы сотрудника -->
        <div id="status-control">
            <button id="start-work">Начать работу</button>
            <button id="start-lunch">Обед</button>
            <button id="stop-work">Закончить работу</button>
            <div id="timer">Время работы: 00:00</div>
            <div id="lunch-timer">Время обеда: 00:00</div>
        </div>

        <form action="logout.php" method="post" class="logout-form">
            <button type="submit">Выйти</button>
        </form>
        <footer>
            <p>Project: <a href="https://github.com/WoLand-Q/FeBrein-Time-Tracker" target="_blank">FebTime</a></p>
            <p>Me: <a href="https://t.me/yarmitt" target="_blank">Telegram</a></p>
        </footer>

    </div>

</body>
</html>

