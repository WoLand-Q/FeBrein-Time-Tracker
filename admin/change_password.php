<?php
use src\Database;

require_once '../src/app.php';

/** @var Database $db */

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo "Доступ запрещен.";
    exit();
}

// Получение ID пользователя из GET или POST
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $user_id = (int)$_GET['id'];

    // Не позволяем изменять пароль самого себя (опционально)
    // if ($user_id === (int)$_SESSION['user_id']) {
    //     $_SESSION['change_password_error'] = 'Вы не можете изменить свой собственный пароль.';
    //     header('Location: admin.php');
    //     exit();
    // }

    // Получаем информацию о пользователе
    $user = $db->fetch('SELECT * FROM users WHERE id = ?', [$user_id]);

    if (!$user) {
        $_SESSION['change_password_error'] = 'Пользователь не найден.';
        header('Location: admin.php');
        exit();
    }

    // Показываем форму изменения пароля
    ?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Изменить Пароль Пользователя</title>
        <link rel="stylesheet" href="../style/styles.css">
        <link rel="icon" href="1.png" type="image/png">
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    </head>
    <body>
    <div class="container-main">
        <h1>Изменить Пароль Пользователя</h1>
        <a href="admin.php" class="back-button">← Назад</a>

        <?php if (isset($_SESSION['change_password_error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_SESSION['change_password_error']); unset($_SESSION['change_password_error']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['change_password_success'])): ?>
            <div class="success-message"><?php echo htmlspecialchars($_SESSION['change_password_success']); unset($_SESSION['change_password_success']); ?></div>
        <?php endif; ?>

        <form action="change_password.php" method="post" class="form">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($user['id']); ?>">
            <div class="form-group">
                <label for="user_first_name">Имя:</label>
                <input type="text" id="user_first_name" name="first_name" value="<?php echo htmlspecialchars($user['first_name']); ?>" readonly>
            </div>
            <div class="form-group">
                <label for="user_last_name">Фамилия:</label>
                <input type="text" id="user_last_name" name="last_name" value="<?php echo htmlspecialchars($user['last_name']); ?>" readonly>
            </div>
            <div class="form-group">
                <label for="user_login">Логин:</label>
                <input type="text" id="user_login" name="login" value="<?php echo htmlspecialchars($user['login']); ?>" readonly>
            </div>
            <div class="form-group">
                <label for="new_password">Новый пароль:</label>
                <input type="password" id="new_password" name="new_password" required>
                <span class="toggle-password" onclick="togglePassword('new_password', this)">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
            <div class="form-group">
                <label for="confirm_password">Подтвердите новый пароль:</label>
                <input type="password" id="confirm_password" name="confirm_password" required>
                <span class="toggle-password" onclick="togglePassword('confirm_password', this)">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
            <button type="submit">Изменить Пароль</button>
        </form>
    </div>

    <!-- Скрипт для переключения видимости пароля -->
    <script>
        function togglePassword(id, toggleIcon) {
            const passwordInput = document.getElementById(id);
            const icon = toggleIcon.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    </script>
    </body>
    </html>
    <?php
    exit();
}

// Обработка POST-запроса для изменения пароля
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'], $_POST['new_password'], $_POST['confirm_password'])) {
    $user_id = (int)$_POST['id'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // Проверка соответствия паролей
    if ($new_password !== $confirm_password) {
        $_SESSION['change_password_error'] = 'Новые пароли не совпадают.';
        header("Location: change_password.php?id={$user_id}");
        exit();
    }

    // Валидация нового пароля (например, минимум 6 символов)
    if (strlen($new_password) < 6) {
        $_SESSION['change_password_error'] = 'Пароль должен быть не менее 6 символов.';
        header("Location: change_password.php?id={$user_id}");
        exit();
    }

    // Получаем пользователя из базы данных
    $user = $db->fetch('SELECT * FROM users WHERE id = ?', [$user_id]);

    if (!$user) {
        $_SESSION['change_password_error'] = 'Пользователь не найден.';
        header('Location: admin.php');
        exit();
    }

    // Хешируем новый пароль
    $hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);

    // Обновляем пароль в базе данных
    $db->execute('UPDATE users SET password = ? WHERE id = ?', [$hashedPassword, $user_id]);

    $_SESSION['change_password_success'] = 'Пароль успешно изменен.';
    header('Location: admin.php');
    exit();
}

// Если запрос не соответствует ожиданиям
http_response_code(400);
echo "Неверный запрос.";
exit();
?>
