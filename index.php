<?php
require_once 'src/app.php';
require_once 'src/role.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


if (!isset($_SESSION['user_id'])) {
    header('Location: login/login.php');
    exit();
}

$isAdmin = ($_SESSION['role'] === Role::ADMIN);
$firstName = $_SESSION['first_name'] ?? 'Гость';
$lastName = $_SESSION['last_name'] ?? '';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta name="version" content="2.5">
    <meta charset="UTF-8">
    <title>FeBrein Time Tracker</title>
    <link rel="stylesheet" href="style/styles.css">
    <link rel="icon" href="img/1.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="src/script.js" defer></script>
</head>
<body>
<div class="container-main">
    <img src="img/icon.png" alt="FebTime Logo" class="logo">
    <!-- <h1 class="animated-title">
        <span class="febrein">FeBrein</span>
        <span>Time Tracker</span>
    </h1>-->
    <p class="welcome">Привет, <?php echo htmlspecialchars($firstName . ' ' . $lastName); ?>!</p>
    <!-- Функционал для пользователей -->
    <div class="user-control-container">
        <a href="login/change_password.php" class="change-password-button">Изменить Пароль</a>
    </div>
    <script>
        var isAdmin = <?php echo json_encode($isAdmin); ?>;
    </script>

    <!-- Элементы управления датой и загрузкой данных -->
    <?php if ($isAdmin): ?>
        <div class="date-control">
            <label for="date-select">Выберите дату: </label>
            <input type="date" id="date-select">
            <button id="load-data" class="load-data-button">Загрузить данные</button>
            <div class="admin-control-container">
                <a href="admin/admin.php" class="admin-button">Админ Панель</a>
            </div>
        </div>
    <?php endif; ?>

    <!-- Информационный блок для сотрудников с возможностью сворачивания -->
    <div class="info-section">
        <h2 id="toggle-info" onclick="toggleInfo()">Информация для сотрудников <i class="fas fa-chevron-down"></i></h2>
        <ul id="info-content">
            <li>8:00 - обід з 13:00 до 14:00</li>
            <li>9:00 - обід з 14:00 до 15:00</li>
            <li>10:00 - обід з 15:00 до 16:00</li>
            <li>13:00 - обід з 16:00 до 17:00</li>
            <li>15:00 - обід з 17:00 до 18:00</li>
        </ul>
    </div>


    <!-- Таблица для отображения текущих данных -->
    <table id="work-sessions">
        <thead>
        <tr>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Статус</th>
            <th>Начало работы</th>
            <th>Конец работы</th>
            <th>Обед (начало - конец)</th>
            <th>Общее время</th>
            <?php if ($isAdmin): ?>
                <th>Действия</th>
            <?php endif; ?>
        </tr>
        </thead>
        <tbody>
        <!-- Здесь будет заполняться таблица -->
        </tbody>
    </table>

    <!-- Кнопки для управления статусом работы сотрудника -->
    <div id="status-control">
        <button id="start-work"><i class="fas fa-play"></i> Начать работу</button>
        <button id="start-lunch"><i class="fas fa-utensils"></i> Обед</button>
        <button id="stop-work"><i class="fas fa-stop"></i> Закончить работу</button>
        <div id="timer">Время работы: 00:00:00</div>
        <div id="lunch-timer" style="display: none;">Время обеда: 00:00:00</div>
    </div>

    <form action="login/logout.php" method="post" class="logout-form">
        <button type="submit">Выйти</button>
    </form>
    <footer>
        <p>Project: <a href="https://github.com/WoLand-Q/FeBrein-Time-Tracker" target="_blank">FebTime</a></p>
        <p>Me: <a href="https://t.me/yarmitt" target="_blank">Telegram</a></p>
    </footer>

</div>

</body>
</html>
