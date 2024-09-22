<?php
require_once 'src/app.php';
/** @var \src\API $api */
/** @var \src\Database $db */
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== Role::ADMIN) {
    http_response_code(403);
    echo "Доступ запрещен.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $role = $_POST['role'];

    if (empty($username) || empty($password)) {
        $_SESSION['add_user_error'] = 'Пожалуйста, заполните все поля.';
        header('Location: admin.php');
        exit();
    }

    // Проверяем, существует ли пользователь
    $existingUser = $db->fetch('SELECT * FROM users WHERE username = ?', [$username]);
    if ($existingUser) {
        $_SESSION['add_user_error'] = 'Пользователь с таким именем уже существует.';
        header('Location: admin.php');
        exit();
    }

    // Хешируем пароль
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Добавляем нового пользователя
    $db->execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [$username, $hashedPassword, $role]);

    header('Location: admin.php');
    exit();
}
?>
