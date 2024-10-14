<?php
require_once '../src/app.php';
/** @var Database $db */
use src\Database;

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo "Доступ запрещен.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = trim($_POST['first_name']);
    $lastName = trim($_POST['last_name']);
    $login = trim($_POST['login']);
    $password = $_POST['password'];
    $role = $_POST['role'];

    // Валидация данных
    if (empty($firstName) || empty($lastName) || empty($login) || empty($password)) {
        $_SESSION['add_user_error'] = 'Пожалуйста, заполните все поля.';
        header('Location: admin.php');
        exit();
    }

    // Проверка формата логина (например, только латиница, цифры, символ подчеркивания)
    if (!preg_match('/^[a-zA-Z0-9_]{4,}$/', $login)) {
        $_SESSION['add_user_error'] = 'Логин должен состоять из латинских букв, цифр или символа подчеркивания и быть не менее 4 символов.';
        header('Location: admin.php');
        exit();
    }

    // Проверка длины пароля
    if (strlen($password) < 6) {
        $_SESSION['add_user_error'] = 'Пароль должен быть не менее 6 символов.';
        header('Location: admin.php');
        exit();
    }

    // Проверяем, существует ли пользователь с таким логином
    $existingUser = $db->fetch('SELECT * FROM users WHERE login = ?', [$login]);
    if ($existingUser) {
        $_SESSION['add_user_error'] = 'Пользователь с таким логином уже существует.';
        header('Location: admin.php');
        exit();
    }

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

    header('Location: admin.php');
    exit();
}
?>
