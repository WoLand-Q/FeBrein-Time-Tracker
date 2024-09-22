<?php
require_once '../src/app.php';
/** @var Database $db */
use src\Database;

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo "Доступ запрещен.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'], $_POST['role'])) {
    $user_id = (int)$_POST['id'];
    $new_role = $_POST['role'];

    // Проверяем допустимые роли
    $allowed_roles = ['admin', 'user'];
    if (!in_array($new_role, $allowed_roles)) {
        $_SESSION['change_role_error'] = 'Недопустимая роль.';
        header('Location: admin.php');
        exit();
    }

    // Не позволяем изменить роль самого себя
    if ($user_id === (int)$_SESSION['user_id']) {
        $_SESSION['change_role_error'] = 'Вы не можете изменить свою роль.';
        header('Location: admin.php');
        exit();
    }

    // Проверяем, существует ли пользователь
    $existingUser = $db->fetch('SELECT * FROM users WHERE id = ?', [$user_id]);
    if (!$existingUser) {
        $_SESSION['change_role_error'] = 'Пользователь не найден.';
        header('Location: admin.php');
        exit();
    }

    // Обновляем роль пользователя
    $db->execute('UPDATE users SET role = ? WHERE id = ?', [$new_role, $user_id]);

    header('Location: admin.php');
    exit();
}

// Если GET-запрос, показываем форму изменения роли
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $user_id = (int)$_GET['id'];

    // Не позволяем изменить роль самого себя
    if ($user_id === (int)$_SESSION['user_id']) {
        $_SESSION['change_role_error'] = 'Вы не можете изменить свою роль.';
        header('Location: admin.php');
        exit();
    }

    // Получаем пользователя
    $user = $db->fetch('SELECT * FROM users WHERE id = ?', [$user_id]);
    if (!$user) {
        $_SESSION['change_role_error'] = 'Пользователь не найден.';
        header('Location: admin.php');
        exit();
    }

    // Показываем форму
    ?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Изменить Роль - FeBrein Time Tracker</title>
        <link rel="stylesheet" href="../style/styles.css">
        <link rel="icon" href="1.png" type="image/png">
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    </head>
    <body>
    <div class="container-main">
        <h1>Изменить Роль Пользователя</h1>
        <a href="admin.php" class="back-button">← Назад</a>

        <?php if (isset($_SESSION['change_role_error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_SESSION['change_role_error']); unset($_SESSION['change_role_error']); ?></div>
        <?php endif; ?>

        <form action="change_role.php" method="post" class="form">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($user['id']); ?>">
            <div class="form-group">
                <label for="new_role">Новая роль:</label>
                <select id="new_role" name="role" required>
                    <option value="user" <?php echo ($user['role'] === 'user') ? 'selected' : ''; ?>>Пользователь</option>
                    <option value="admin" <?php echo ($user['role'] === 'admin') ? 'selected' : ''; ?>>Администратор</option>
                </select>
            </div>
            <button type="submit">Сохранить</button>
        </form>
    </div>

    <!-- Скрипт для переключения видимости пароля (если нужно) -->
    </body>
    </html>
    <?php
    exit();
}
?>
