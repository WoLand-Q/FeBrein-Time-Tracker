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

$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// Получаем все сессии всех пользователей за выбранную дату
$sessions = $db->fetchAll('SELECT sessions.*, users.first_name, users.last_name FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.date = ?', [$date]);
$api->successResponse($sessions);
?>
