<?php
require_once '../src/app.php';
/** @var Database $db */
use src\Database;

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo "Доступ запрещен.";
    exit();
}

if (isset($_GET['id'])) {
    $user_id = (int)$_GET['id'];

    // Не позволяем удалять самого себя
    if ($user_id === (int)$_SESSION['user_id']) {
        $_SESSION['delete_user_error'] = 'Вы не можете удалить самого себя.';
        header('Location: admin.php');
        exit();
    }

    // Проверяем, существует ли пользователь
    $existingUser = $db->fetch('SELECT * FROM users WHERE id = ?', [$user_id]);
    if (!$existingUser) {
        $_SESSION['delete_user_error'] = 'Пользователь не найден.';
        header('Location: admin.php');
        exit();
    }

    // Удаляем пользователя
    $db->execute('DELETE FROM users WHERE id = ?', [$user_id]);

    header('Location: admin.php');
    exit();
} else {
    http_response_code(400);
    echo "Неверный запрос.";
    exit();
}
?>
