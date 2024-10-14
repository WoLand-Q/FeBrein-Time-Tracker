<?php
require_once '../src/app.php';
/** @var Database $db */
use src\Database;


if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $currentPassword = $_POST['current_password'];
    $newPassword = $_POST['new_password'];
    $confirmPassword = $_POST['confirm_password'];

    // Проверка заполнения полей
    if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        $error = 'Пожалуйста, заполните все поля.';
    }
    // Проверка совпадения новых паролей
    elseif ($newPassword !== $confirmPassword) {
        $error = 'Новые пароли не совпадают.';
    }
    // Валидация нового пароля (например, минимум 6 символов)
    elseif (strlen($newPassword) < 6) {
        $error = 'Новый пароль должен быть не менее 6 символов.';
    }
    else {
        // Получение текущего пароля пользователя из базы данных
        $user = $db->fetch('SELECT password FROM users WHERE id = ?', [$_SESSION['user_id']]);

        if ($user && password_verify($currentPassword, $user['password'])) {
            // Хеширование нового пароля
            $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Обновление пароля в базе данных
            $db->execute('UPDATE users SET password = ? WHERE id = ?', [$hashedNewPassword, $_SESSION['user_id']]);

            $success = 'Пароль успешно изменен.';
        }
        else {
            $error = 'Неверный текущий пароль.';
        }
    }
}
?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Изменить Пароль</title>
        <link rel="stylesheet" href="../style/styles.css">
        <link rel="icon" href="1.png" type="image/png">
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    </head>
    <body>
    <div class="container">
        <h1>Изменить Пароль</h1>
        <?php if (isset($error)): ?>
            <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <?php if (isset($success)): ?>
            <div class="success-message"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>
        <form action="change_password.php" method="post" class="form">
            <div class="form-group">
                <label for="current_password">Текущий пароль:</label>
                <input type="password" id="current_password" name="current_password" required>
                <span class="toggle-password" onclick="togglePassword('current_password', this)">
                <i class="fas fa-eye"></i>
            </span>
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
        <p class="redirect"><a href="../index.php">Вернуться на главную</a></p>
    </div>

    <!-- Скрипт для переключения видимости пароля -->
    <script>
        function togglePassword(inputId, toggleIcon) {
            const passwordInput = document.getElementById(inputId);
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
