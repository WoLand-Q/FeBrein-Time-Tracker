<?php

use src\Database;

require_once '../src/app.php';

/** @var Database $db */

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo "Доступ запрещен.";
    exit();
}

$users = $db->fetchAll('SELECT id, username, role FROM users');
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Админ Панель - FeBrein Time Tracker</title>
    <link rel="stylesheet" href="../style/styles.css">
    <link rel="icon" href="1.png" type="image/png">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
<div class="container-main">
    <h1>Админ Панель</h1>
    <a href="../index.php" class="back-button"><i class="fas fa-arrow-left"></i> Назад</a>

    <!-- Кнопка для раскрытия/сокрытия формы добавления пользователя -->
    <button class="toggle-add-user-button" onclick="toggleAddUserForm()">
        Добавить Пользователя <i class="fas fa-chevron-down"></i>
    </button>

    <!-- Форма для добавления нового пользователя -->
    <div class="add-user-form" id="add-user-form">
        <h2></h2>
        <?php if (isset($_SESSION['add_user_error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_SESSION['add_user_error']); unset($_SESSION['add_user_error']); ?></div>
        <?php endif; ?>
        <form action="add_user.php" method="post" class="form">
            <div class="form-group">
                <label for="new_username">Имя пользователя:</label>
                <input type="text" id="new_username" name="username" required>
            </div>
            <div class="form-group">
                <label for="new_password">Пароль:</label>
                <input type="password" id="new_password" name="password" required>
                <span class="toggle-password" onclick="togglePassword('new_password')">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
            <div class="form-group">
                <label for="new_role">Роль:</label>
                <select id="new_role" name="role">
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                </select>
            </div>
            <button type="submit">Добавить</button>
        </form>
    </div>

    <!-- Таблица пользователей с действиями -->
    <div class="user-list">
        <h2>Список Пользователей</h2>
        <?php if (isset($_SESSION['delete_user_error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_SESSION['delete_user_error']); unset($_SESSION['delete_user_error']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['change_role_error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_SESSION['change_role_error']); unset($_SESSION['change_role_error']); ?></div>
        <?php endif; ?>
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Имя пользователя</th>
                <th>Роль</th>
                <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($users as $user): ?>
                <tr>
                    <td><?php echo htmlspecialchars($user['id']); ?></td>
                    <td><?php echo htmlspecialchars($user['username']); ?></td>
                    <td><?php echo htmlspecialchars($user['role']); ?></td>
                    <td>
                        <?php if ($user['id'] != $_SESSION['user_id']): // Не позволяем удалять самого себя ?>
                            <a href="change_role.php?id=<?php echo $user['id']; ?>" class="action-button"><i class="fas fa-user-cog"></i> Изменить Роль</a>
                            <a href="delete_user.php?id=<?php echo $user['id']; ?>" class="action-button delete-button" onclick="return confirm('Вы уверены, что хотите удалить этого пользователя?');"><i class="fas fa-user-times"></i> Удалить</a>
                        <?php else: ?>
                            <span>—</span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (empty($users)): ?>
                <tr>
                    <td colspan="4">Пользователи не найдены.</td>
                </tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>

</div>

<!-- Скрипт для переключения видимости пароля и формы добавления пользователя -->
<script>
    function togglePassword(id) {
        const passwordInput = document.getElementById(id);
        const passwordIcon = passwordInput.nextElementSibling.querySelector('i');
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

    function toggleAddUserForm() {
        const form = document.getElementById('add-user-form');
        const toggleButton = document.querySelector('.toggle-add-user-button');
        form.classList.toggle('active');
        const icon = toggleButton.querySelector('i');
        if (form.classList.contains('active')) {
            toggleButton.innerHTML = 'Скрыть Пользователя <i class="fas fa-chevron-up"></i>';
        } else {
            toggleButton.innerHTML = 'Добавить Пользователя <i class="fas fa-chevron-down"></i>';
        }
    }
</script>
</body>
</html>
