<?php
require_once '../src/app.php';
/** @var Database $db */
use src\Database;

// Проверяем, является ли пользователь администратором
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo 'Доступ запрещен';
    exit();
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = trim($_POST['first_name']);
    $lastName = trim($_POST['last_name']);
    $login = trim($_POST['login']);
    $password = $_POST['password'];
    $role = $_POST['role'];

    if (empty($firstName) || empty($lastName) || empty($login) || empty($password)) {
        $error = 'Пожалуйста, заполните все поля.';
    } else {
        // Проверяем, существует ли пользователь с таким логином
        $existingUser = $db->fetch('SELECT * FROM users WHERE login = ?', [$login]);
        if ($existingUser) {
            $error = 'Пользователь с таким логином уже существует.';
        } else {
            // Валидация логина (например, только латиница, минимум 4 символа)
            if (!preg_match('/^[a-zA-Z0-9_]{4,}$/', $login)) {
                $error = 'Логин должен состоять из латинских букв, цифр или символа подчеркивания и быть не менее 4 символов.';
            }
            // Валидация пароля (например, минимум 6 символов)
            elseif (strlen($password) < 6) {
                $error = 'Пароль должен быть не менее 6 символов.';
            } else {
                // Хешируем пароль
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

                // Добавляем нового пользователя
                $db->execute('INSERT INTO users (first_name, last_name, login, password, role) VALUES (?, ?, ?, ?, ?)', [
                    $firstName,
                    $lastName,
                    $login,
                    $hashedPassword,
                    $role
                ]);

                header('Location: admin.php'); // Перенаправляем на админ-панель
                exit();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Регистрация Пользователя</title>
    <link rel="stylesheet" href="../style/styles.css">
    <link rel="icon" href="1.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
<div class="container">
    <h1>Регистрация Пользователя</h1>
    <?php if (isset($error)): ?>
        <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    <form action="register.php" method="post" class="form">
        <div class="form-group">
            <label for="first_name">Имя:</label>
            <input type="text" id="first_name" name="first_name" required>
        </div>
        <div class="form-group">
            <label for="last_name">Фамилия:</label>
            <input type="text" id="last_name" name="last_name" required>
        </div>
        <div class="form-group">
            <label for="login">Логин:</label>
            <input type="text" id="login" name="login" required>
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
    <p class="redirect">Уже зарегистрированы? <a href="admin.php">Вернуться в Админ Панель</a></p>
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
