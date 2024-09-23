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
$username = $_SESSION['username'] ?? 'Гость';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta name="version" content="2.2">
    <meta charset="UTF-8">
    <title>FeBrein Time Tracker</title>
    <link rel="stylesheet" href="style/styles.css">
    <link rel="icon" href="1.png" type="image/png">
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
    <p class="welcome">Привет, <?php echo htmlspecialchars($username); ?>!</p>


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
