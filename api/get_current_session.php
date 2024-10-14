<?php
require_once '../src/api.php';
/** @var \src\API $api */
/** @var \src\Database $db */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!$api->isGet()) {
    $api->errorResponse(405, 'Метод не поддерживается');
}

$date = date('Y-m-d');

// Получаем сессию текущего пользователя за сегодня
$session = $db->fetch('SELECT sessions.*, users.first_name, users.last_name FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.date = ? AND sessions.user_id = ?', [$date, $api->user_id]);

$api->successResponse($session);
?>
