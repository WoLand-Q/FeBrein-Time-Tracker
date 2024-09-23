<?php
require_once '../src/app.php';
/** @var Database $db */
use src\Database;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $role = $_POST['role'];

    if (empty($username) || empty($password)) {
        $error = 'Пожалуйста, заполните все поля.';
    } else {
        // Проверяем, существует ли пользователь
        $existingUser = $db->fetch('SELECT * FROM users WHERE username = ?', [$username]);
        if ($existingUser) {
            $error = 'Пользователь с таким именем уже существует.';
        } else {
            // Хешируем пароль
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Добавляем нового пользователя
            $db->execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [$username, $hashedPassword, $role]);

            header('Location: login.php'); // Перенаправляем на страницу входа
            exit();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Регистрация</title>
    <link rel="stylesheet" href="../style/styles.css">
    <link rel="icon" href="1.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
<div class="container">
    <h1>Регистрация</h1>
    <?php if (isset($error)): ?>
        <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    <form action="register.php" method="post" class="form">
        <div class="form-group">
            <label for="username">Имя пользователя:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required>
            <span class="toggle-password" onclick="togglePassword()">
                    <i class="fas fa-eye"></i>
                </span>
        </div>
        <div class="form-group">
            <label for="role">Роль:</label>
            <select id="role" name="role">
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
            </select>
        </div>
        <button type="submit">Зарегистрироваться</button>
    </form>
    <p class="redirect">Уже зарегистрированы? <a href="login.php">Войти</a></p>
</div>

<!-- Скрипт для переключения видимости пароля -->
<script>
    function togglePassword() {
        const passwordInput = document.getElementById('password');
        const passwordIcon = document.querySelector('.toggle-password i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.classList.remove('fa-eye');
            passwordIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }
    }
</script>
</body>
</html>
